import type { SupabaseClient } from "@supabase/supabase-js";
import { getWhatsAppConfig, toE164, sendRunSummary } from "./whatsapp";
import { sendText, sendButtons } from "./wa-interactive";
import { menuId } from "./admin-menu";
import {
  detectLeadSource, leadAlertText, leadFollowupText, LEAD_WELCOME, readableLocal, phoneKey,
  type WaReferral, type WaLeadSource,
} from "./lead-source";

/* A message from a number that is neither a guest nor a couple, on the 077
 * sales channel — turned into a lead. See lead-source.ts for the source rules.
 *
 * Off unless WA_LEADS_ENABLED=1. Returns false whenever it did not take the
 * message (switch off, migration not run, any failure before the lead row
 * exists), and the webhook then falls through to the unmatched-number alert
 * exactly as before. So the worst case of every failure here is today's
 * behaviour, never silence. */

type Sb = SupabaseClient;

export function waLeadsEnabled(): boolean {
  return String(process.env.WA_LEADS_ENABLED ?? "").trim() === "1";
}

interface LeadRow {
  id: string; name: string | null; source: string; status: string;
  last_message_at: string | null; welcome_sent_at: string | null;
}

const LEAD_COLS = "id, name, source, status, last_message_at, welcome_sent_at";

export async function handleLeadMessage(sb: Sb, m: {
  from: string; body: string; profileName?: string | null; referral?: WaReferral | null;
}): Promise<boolean> {
  if (!waLeadsEnabled()) return false;
  const cfg = getWhatsAppConfig();
  const wa = toE164(m.from);
  if (!cfg || !wa) return false;

  const nowIso = new Date().toISOString();
  const name = String(m.profileName ?? "").trim() || null;
  const key = phoneKey(wa);
  if (!key) return false;

  /* A couple is never a lead — by NUMBER, whatever the date of their wedding.
     handleCoupleMessage only recognises couples whose wedding is still ahead,
     so a couple writing the day after would otherwise reach here and be
     welcomed as a stranger. Not taking the message leaves it on the existing
     unmatched-number path, exactly as before this file existed. */
  {
    const { data: evs, error } = await sb.from("events")
      .select("client_phone").not("client_phone", "is", null).limit(5000);
    if (error) return false;
    if ((evs ?? []).some(e => phoneKey(String(e.client_phone ?? "")) === key)) return false;
  }

  /* Existing lead by WhatsApp number. An error here means the migration has
     not run — not this handler's message. */
  const found = await sb.from("leads").select(LEAD_COLS).eq("wa_phone", wa).maybeSingle();
  if (found.error) return false;
  let lead = found.data as LeadRow | null;
  let isNew = false;
  let source: WaLeadSource | string;

  if (!lead) {
    /* A web-form lead writing on WhatsApp for the first time is the same
       person, not a new lead: attach the number, keep its source. Matched on
       a normalised key, because the form stores the number as typed: "054-111-2222" and "+972541112222" are one person. The stored
       phone is left exactly as it was; only wa_phone is added. Oldest first,
       so a person who filled the form twice joins their first lead. */
    const web = await sb.from("leads").select(`${LEAD_COLS}, phone, created_at`)
      .is("wa_phone", null).order("created_at", { ascending: true }).limit(5000);
    const hit = ((web.data ?? []) as (LeadRow & { phone?: string | null })[])
      .find(l => phoneKey(l.phone) === key);
    if (hit) {
      await sb.from("leads").update({ wa_phone: wa, first_message: m.body.slice(0, 2000) })
        .eq("id", hit.id).is("wa_phone", null);
      lead = hit;
    }
  }

  if (!lead) {
    const det = detectLeadSource({ referral: m.referral, body: m.body });
    const ins = await sb.from("leads").insert({
      name: name ?? readableLocal(wa),
      phone: readableLocal(wa),
      wa_phone: wa,
      source: det.source,
      status: "new_lead",
      first_message: m.body.slice(0, 2000),
      last_message_at: nowIso,
      ref_code: m.referral?.ctwa_clid ? `ctwa:${m.referral.ctwa_clid}`.slice(0, 120) : null,
    }).select(LEAD_COLS).single();

    if (ins.error) {
      /* 23505: another delivery created the lead between our read and our
         insert; that run welcomes and sends the full alert. */
      if ((ins.error as { code?: string }).code !== "23505") return false;
      const again = await sb.from("leads").select(`${LEAD_COLS}, first_message`)
        .eq("wa_phone", wa).maybeSingle();
      if (!again.data) return false;
      lead = again.data as LeadRow;
      /* The same first message delivered twice at once is one message: the
         other run owns it, this one stays silent. A DIFFERENT message that
         merely arrived at the same moment falls through and is a follow-up
         like any other — every message he is sent must reach him. */
      if ((again.data as { first_message?: string | null }).first_message === m.body.slice(0, 2000))
        return true;
    } else {
      lead = ins.data as LeadRow;
      isNew = true;
      await sb.from("lead_activities").insert({
        lead_id: lead.id, type: "lead_created",
        content: `ליד חדש מוואטסאפ (${det.source})`,
        metadata: { via: det.via, referral: m.referral ?? null },
      }).then(() => {}, () => {});
    }
  }

  source = lead.source;

  if (!isNew) {
    await sb.from("leads").update({ last_message_at: nowIso, updated_at: nowIso })
      .eq("id", lead.id).then(() => {}, () => {});
  }
  await sb.from("lead_activities").insert({
    lead_id: lead.id, type: "whatsapp_in", content: m.body.slice(0, 2000),
  }).then(() => {}, () => {});

  /* Welcome: a new lead, once. The claim is the UPDATE … WHERE welcome_sent_at
     IS NULL — two deliveries of the same first message cannot both win it. */
  if (isNew && !lead.welcome_sent_at) {
    try {
      const claim = await sb.from("leads").update({ welcome_sent_at: nowIso })
        .eq("id", lead.id).is("welcome_sent_at", null).select("id");
      if ((claim.data ?? []).length) {
        const res = await sendText(cfg, wa, LEAD_WELCOME);
        await sb.from("wa_messages").insert({
          event_id: null, guest_id: null, wa_phone: wa, direction: "out",
          body: LEAD_WELCOME, wamid: res.messageId ?? null,
          status: res.ok ? "auto" : "failed", error: res.ok ? null : (res.error ?? "").slice(0, 300),
        }).then(() => {}, () => {});
      }
    } catch { /* a welcome must never cost the owner his alert */ }
  }

  /* The owner.
     A new lead: the full alert. Every later message: a short one, never
     throttled — five messages are five alerts, or an answer to the question
     he just asked would exist only in the CRM. Free text with a reply button
     first; when Meta's window to his own number is shut, the approved
     run-summary template carries it. Nothing is ever sent to the lead here. */
  const admin = process.env.ADMIN_ALERT_PHONE;
  if (admin) {
    try {
      const who = name ?? lead.name;
      const text = isNew
        ? leadAlertText({ isNew: true, source: source as WaLeadSource, name: who, phone: wa,
            body: m.body, status: "NEW" })
        : leadFollowupText({ name: who, phone: wa, body: m.body });
      const adminTo = toE164(admin) ?? admin;
      const btn = await sendButtons(cfg, adminTo, text.slice(0, 1000),
        [{ id: menuId({ screen: "reply_lead", id: lead.id }), title: "✉️ לענות מכאן" }]);
      if (!btn.ok) {
        await sendRunSummary(cfg, admin, {
          event: isNew ? "💍 ליד חדש" : `💬 ${String(who ?? "ליד")}`,
          sent: "—", failed: "—", left: readableLocal(wa),
          attention: text.replace(/\n+/g, " · "),
        }, "wa_lead");
      }
    } catch { /* the lead is saved; the alert is the lesser loss */ }
  }

  return true;
}

/** After the owner answered a lead: first contact moves it out of NEW. */
export async function markLeadContacted(sb: Sb, wa: string, text: string): Promise<void> {
  try {
    const { data } = await sb.from("leads").select("id, status").eq("wa_phone", wa).maybeSingle();
    const lead = data as { id: string; status: string } | null;
    if (!lead) return;
    if (lead.status === "new_lead") {
      await sb.from("leads").update({ status: "contacted", updated_at: new Date().toISOString() })
        .eq("id", lead.id);
    }
    await sb.from("lead_activities").insert({ lead_id: lead.id, type: "whatsapp_out", content: text.slice(0, 2000) });
  } catch { /* the message went out; the bookkeeping is the lesser loss */ }
}

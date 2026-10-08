import type { SupabaseClient } from "@supabase/supabase-js";
import { getWhatsAppConfig, toE164, sendRunSummary } from "./whatsapp";
import { sendText, sendButtons } from "./wa-interactive";
import { menuId } from "./admin-menu";
import {
  detectLeadSource, leadAlertText, LEAD_WELCOME, readableLocal, shouldRealert,
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

  /* Existing lead by WhatsApp number. An error here means the migration has
     not run — not this handler's message. */
  const found = await sb.from("leads").select(LEAD_COLS).eq("wa_phone", wa).maybeSingle();
  if (found.error) return false;
  let lead = found.data as LeadRow | null;
  let isNew = false;
  let source: WaLeadSource | string;

  if (!lead) {
    /* A web-form lead writing on WhatsApp for the first time is the same
       person, not a new lead: attach the number, keep its source. */
    const local = readableLocal(wa);
    const web = await sb.from("leads").select(LEAD_COLS)
      .eq("phone", local).is("wa_phone", null).limit(1).maybeSingle();
    if (web.data) {
      await sb.from("leads").update({ wa_phone: wa, first_message: m.body.slice(0, 2000) })
        .eq("id", (web.data as LeadRow).id);
      lead = web.data as LeadRow;
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
      /* 23505: a parallel delivery created it a moment ago. That one is the
         new lead; this message is its second line. */
      if ((ins.error as { code?: string }).code !== "23505") return false;
      const again = await sb.from("leads").select(LEAD_COLS).eq("wa_phone", wa).maybeSingle();
      if (!again.data) return false;
      lead = again.data as LeadRow;
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
  const prevLast = isNew ? null : lead.last_message_at;

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

  /* The owner. Free text with a reply button first; when Meta's window to his
     own number is shut, the approved run-summary template carries it. */
  const admin = process.env.ADMIN_ALERT_PHONE;
  if (admin && (isNew || shouldRealert(prevLast, Date.now()))) {
    try {
      const text = leadAlertText({
        isNew, source: source as WaLeadSource, name: name ?? lead.name, phone: wa, body: m.body,
        status: lead.status === "new_lead" ? "NEW" : lead.status,
      });
      const adminTo = toE164(admin) ?? admin;
      const btn = await sendButtons(cfg, adminTo, text.slice(0, 1000),
        [{ id: menuId({ screen: "reply_lead", id: lead.id }), title: "✉️ לענות מכאן" }]);
      if (!btn.ok) {
        await sendRunSummary(cfg, admin, {
          event: isNew ? "💍 ליד חדש" : "💬 הודעה מליד",
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

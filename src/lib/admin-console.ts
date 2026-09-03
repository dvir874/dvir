import type { SupabaseClient } from "@supabase/supabase-js";
import { parseAdminCommand, matchEvent, ADMIN_HELP } from "./admin-command";
import { classifyManualWork, manualWorkMessage, type LastContact } from "./manual-work";
import { coupleName } from "./couple-name";
import { whatsappInviteLink } from "./phone";
import { getWhatsAppConfig, toE164 } from "./whatsapp";
import { sendText } from "./wa-interactive";

/* Executing what the admin typed into his phone — see admin-command.ts for the
 * grammar and why it is deliberately small.
 *
 * Everything here answers on the same thread he wrote on, so the phone reads
 * like a conversation with the business rather than a control panel. And every
 * action confirms what it did by name: "נשלח לנעם חדד ✓" is the difference
 * between a tool he trusts from a moving car and one he checks afterwards.
 */

type Sb = SupabaseClient;

/** Remember who an alert was about, so a plain reply reaches them. */
export async function pointAdminAt(sb: Sb, guestId: string): Promise<void> {
  const admin = process.env.ADMIN_ALERT_PHONE;
  if (!admin) return;
  try {
    await sb.from("admin_context").upsert(
      { admin_phone: toE164(admin) ?? admin, guest_id: guestId, set_at: new Date().toISOString() },
      { onConflict: "admin_phone" });
  } catch { /* the table arrives with 20260904_admin_console.sql */ }
}

/** True when this inbound message came from the admin's own phone. */
export function isAdminPhone(from: string): boolean {
  const admin = process.env.ADMIN_ALERT_PHONE;
  if (!admin) return false;
  const a = toE164(admin), b = toE164(from);
  return !!a && a === b;
}

/**
 * Handle one message from the admin. Returns false when the feature is off, so
 * the caller can fall through to treating him as an ordinary guest — he is on
 * his own guest lists.
 */
export async function handleAdminMessage(
  sb: Sb, from: string, said: string,
  kind: "text" | "media" = "text",
): Promise<boolean> {
  const cfg = getWhatsAppConfig();
  if (!cfg) return false;
  const to = toE164(from) ?? from;
  const say = (body: string) => sendText(cfg, to, body);

  let target: { id: string; name: string; phone: string } | null = null;
  try {
    const { data } = await sb.from("admin_context")
      .select("guest_id").eq("admin_phone", to).maybeSingle();
    const gid = (data as { guest_id?: string } | null)?.guest_id;
    if (gid) {
      const { data: g } = await sb.from("guests")
        .select("id, name, phone").eq("id", gid).maybeSingle();
      if (g) target = { id: g.id as string, name: String(g.name ?? ""), phone: String(g.phone ?? "") };
    }
  } catch { /* migration not run — no target, free text is refused below */ }

  const cmd = parseAdminCommand(said, !!target, kind);

  switch (cmd.kind) {
    case "help":
      await say(ADMIN_HELP);
      return true;

    case "status": {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
      const { data: evs } = await sb.from("events")
        .select("id, name, couple_names, date, send_paused_until")
        .gte("date", today).order("date").limit(5);
      const lines: string[] = [];
      for (const e of evs ?? []) {
        const { data: gs } = await sb.from("guests")
          .select("status, category").eq("event_id", e.id as string).limit(900);
        const real = (gs ?? []).filter(g => g.category !== "demo");
        if (!real.length) continue;
        const days = Math.max(0, Math.ceil(
          (new Date(String(e.date)).getTime() - Date.now()) / 86_400_000));
        const paused = e.send_paused_until
          && new Date(e.send_paused_until as string).getTime() > Date.now();
        lines.push(`${coupleName(e as Parameters<typeof coupleName>[0]) ?? e.name} · ${days} ימים · `
          + `${real.filter(g => g.status === "confirmed").length} מגיעים · `
          + `${real.filter(g => g.status === "pending").length} ממתינים${paused ? " · מושהה" : ""}`);
      }
      await say(lines.length ? lines.join("\n") : "אין חתונות פעילות.");
      return true;
    }

    case "work": {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
      const { data: evs } = await sb.from("events")
        .select("id, name, couple_names, date").gte("date", today).order("date").limit(4);
      const out: string[] = [];
      for (const e of evs ?? []) {
        const { data: gs } = await sb.from("guests")
          .select("id, name, phone, status, category, do_not_contact")
          .eq("event_id", e.id as string).limit(900);
        const real = (gs ?? []).filter(g => g.category !== "demo");
        if (!real.length) continue;
        const ids = real.map(g => g.id as string);
        const contact = new Map<string, LastContact>();
        for (let i = 0; i < ids.length; i += 100) {
          const { data: ms } = await sb.from("wa_messages")
            .select("guest_id, direction, status, error_code, created_at")
            .in("guest_id", ids.slice(i, i + 100));
          for (const m of ms ?? []) {
            const id = m.guest_id as string;
            if (!id) continue;
            const at = m.created_at as string;
            const cur = contact.get(id) ?? {};
            if (m.direction === "in") {
              if (!cur.lastInAt || at > cur.lastInAt) cur.lastInAt = at;
            } else {
              if (["delivered", "read"].includes(m.status as string)) cur.arrived = true;
              if (!cur.lastOutAt || at > cur.lastOutAt) {
                cur.lastOutAt = at;
                cur.lastCode = (m.error_code as number | null) ?? null;
              }
            }
            contact.set(id, cur);
          }
        }
        const days = Math.max(0, Math.ceil(
          (new Date(String(e.date)).getTime() - Date.now()) / 86_400_000));
        const body = manualWorkMessage(
          coupleName(e as Parameters<typeof coupleName>[0]) ?? String(e.name ?? ""),
          days, classifyManualWork(real as Parameters<typeof classifyManualWork>[0], contact));
        if (body) out.push(body);
      }
      await say(out.length ? out.join("\n\n") : "אין כלום שמחכה לך 🤍");
      return true;
    }

    case "missing": {
      /* The guests with no invitation, each with a link that opens WhatsApp
         with their own personal RSVP address already written.
         
         "בדיוק כמו שזה נותן לי לשלוח באדמין" — the admin has had this button
         since the start; it just lived on a screen. Sent from his own number
         rather than the business one, which is why it works at all: the
         business number is bound by Meta's 24-hour rule and his is not, and a
         guest who never received anything has no window open. */
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
      const { data: evs } = await sb.from("events")
        .select("id, name, couple_names, date").gte("date", today).order("date").limit(12);
      let list = (evs ?? []) as { id: string; name?: string | null; couple_names?: string | null }[];
      if (cmd.event) {
        const m = matchEvent(cmd.event, list);
        if ("none" in m) { await say(`לא מצאתי חתונה בשם "${cmd.event}".`); return true; }
        if ("ambiguous" in m) {
          await say(`"${cmd.event}" מתאים ליותר מאחת. תכתוב שם מדויק יותר.`);
          return true;
        }
        list = [m.event];
      }

      const out: string[] = [];
      for (const e of list) {
        const { data: gs } = await sb.from("guests")
          .select("id, name, phone, rsvp_token, status, category, do_not_contact")
          .eq("event_id", e.id).eq("status", "pending").limit(900);
        const real = (gs ?? []).filter(g =>
          g.category !== "demo" && !g.do_not_contact
          && String(g.phone ?? "").trim() && g.rsvp_token);
        if (!real.length) continue;

        const ids = real.map(g => g.id as string);
        const reached = new Set<string>();
        for (let i = 0; i < ids.length; i += 100) {
          const { data: ms } = await sb.from("wa_messages")
            .select("guest_id, status").eq("direction", "out")
            .in("guest_id", ids.slice(i, i + 100));
          for (const m of ms ?? []) {
            if (m.guest_id && ["delivered", "read"].includes(m.status as string)) {
              reached.add(m.guest_id as string);
            }
          }
        }
        const missing = real.filter(g => !reached.has(g.id as string));
        if (!missing.length) continue;

        const who = coupleName(e as Parameters<typeof coupleName>[0]) ?? e.name;
        /* Ten at a time. A message with sixty links is one nobody works
           through, and the rest are one "לא קיבלו" away. */
        const shown = missing.slice(0, 10);
        out.push(`${who} — ${missing.length} לא קיבלו:\n` + shown.map(g =>
          `${g.name} ${g.phone}\n${whatsappInviteLink(String(g.phone), String(g.name), String(g.rsvp_token))}`
        ).join("\n\n") + (missing.length > 10 ? `\n\nועוד ${missing.length - 10} — כתוב "לא קיבלו" שוב` : ""));
      }

      await say(out.length
        ? out.join("\n\n———\n\n") + "\n\nלחיצה על קישור פותחת וואטסאפ עם ההזמנה שלהם מוכנה. נשלח ממך, לא מהמספר העסקי."
        : "כולם קיבלו 🤍");
      return true;
    }

    case "pause":
    case "resume": {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jerusalem" });
      const { data: evs } = await sb.from("events")
        .select("id, name, couple_names, date").gte("date", today).limit(12);
      const m = matchEvent(cmd.event, (evs ?? []) as { id: string; name?: string | null; couple_names?: string | null }[]);
      if ("none" in m) { await say(`לא מצאתי חתונה בשם "${cmd.event}".`); return true; }
      if ("ambiguous" in m) {
        await say(`"${cmd.event}" מתאים ליותר מאחת: `
          + m.ambiguous.map(e => coupleName(e as Parameters<typeof coupleName>[0]) ?? e.name).join(" · ")
          + ". תכתוב שם מדויק יותר.");
        return true;
      }
      /* A week, not for ever. A pause nobody remembers to lift is a wedding
         that quietly stops being served — and this one is set from a phone,
         where it is easiest to forget. */
      const until = cmd.kind === "pause"
        ? new Date(Date.now() + 7 * 86_400_000).toISOString() : null;
      await sb.from("events").update({ send_paused_until: until }).eq("id", m.event.id);
      const who = coupleName(m.event as Parameters<typeof coupleName>[0]) ?? m.event.name;
      await say(cmd.kind === "pause"
        ? `⏸ ${who} מושהית לשבוע. "המשך ${cmd.event}" מחזיר מיד.`
        : `▶️ ${who} חזרה לשליחה.`);
      return true;
    }

    case "reply":
    case "reply_last": {
      const phone = cmd.kind === "reply" ? cmd.phone : target!.phone;
      const name  = cmd.kind === "reply" ? null : target!.name;
      const dest  = toE164(phone);
      if (!dest) { await say("המספר לא תקין."); return true; }

      const res = await sendText(cfg, dest, cmd.text);
      if (!res.ok) {
        /* Meta only allows free text inside 24 hours of the guest's own last
           message. Saying which rule stopped it is the difference between a
           system he trusts and one he retries at. */
        await say(`❌ לא נשלח${name ? ` ל${name}` : ""}: ${res.error ?? "שגיאה"}. `
          + `אפשר לענות בטקסט חופשי רק עד 24 שעות אחרי ההודעה שלהם.`);
        return true;
      }

      /* Logged like any other outbound so it appears in the thread — and NOT
         as status "auto", because a person really did answer. */
      try {
        const { data: g } = await sb.from("guests")
          .select("id, event_id, name").eq("phone", toLocal(phone)).maybeSingle();
        await sb.from("wa_messages").insert({
          event_id: (g as { event_id?: string } | null)?.event_id ?? null,
          guest_id: (g as { id?: string } | null)?.id ?? null,
          wa_phone: dest, direction: "out", body: cmd.text,
          wamid: res.messageId ?? null, status: "sent",
        });
      } catch { /* the message went out; the log is a nicety */ }

      await say(`✓ נשלח${name ? ` ל${name}` : ` ל-${phone}`}`);
      return true;
    }

    default:
      await say(`לא הבנתי. ${ADMIN_HELP}`);
      return true;
  }
}

/* Storage form, matching every other path that writes a guest. */
function toLocal(raw: string): string {
  const d = String(raw ?? "").replace(/\D/g, "");
  if (d.startsWith("972")) return "0" + d.slice(3);
  if (d.startsWith("0")) return d;
  return d.length === 9 ? "0" + d : d;
}

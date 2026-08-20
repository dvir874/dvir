import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth-guard";
import { policyFor } from "@/lib/whatsapp";
import { coupleName } from "@/lib/couple-name";
import { eventTimes } from "@/lib/event-times";
import { venueLine } from "@/lib/venue";
import SmsRow from "./SmsRow";

export const dynamic = "force-dynamic";

/* SMS to the guests WhatsApp cannot reach.
 *
 * Two groups end up here and neither can be helped by sending again:
 * 131026 has no WhatsApp account on that number, and 130472 is a recipient Meta
 * placed in a marketing-experiment control group and withholds templates from.
 * Thirteen of שחר's guests, out of 328.
 *
 * The obvious workaround was to have the couple message them from her own
 * phone. Dvir refused it, correctly — a client paying for the service should
 * not be doing its work. So the fallback channel lives here instead, behind the
 * admin login, on the phone he already has in his hand.
 *
 * Each row is an sms: link, so one tap opens Messages with the number and the
 * text already filled in. No integration, no provider, no per-message cost —
 * for thirteen people a gateway would be a day of setup to save five minutes.
 * When there are ten couples instead of three, that arithmetic changes.
 */

const T = {
  page: "#F6F1E8", card: "#FDFAF5", border: "#E8E0D4",
  dark: "#1C1008", muted: "rgba(28,16,8,0.6)", gold: "#C5A46D", alert: "#B4453C",
};

export default async function SmsFallback({
  searchParams,
}: { searchParams: Promise<{ event?: string }> }) {
  const denied = await requireAdmin();
  if (denied) return <Shell><p style={p}>צריך להתחבר לאדמין</p></Shell>;

  const { event } = await searchParams;
  const sb = createServerClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: events } = await sb.from("events")
    .select("id, name, couple_names, date, address, venue_name, reception_time, chuppah_time")
    .gte("date", today).order("date");
  const ev = (events ?? []).find(e => e.id === event) ?? (events ?? [])[0];
  if (!ev) return <Shell><p style={p}>אין אירועים קרובים</p></Shell>;

  const { data: guests } = await sb.from("guests")
    .select("id, name, phone, rsvp_token, status, opened_at").eq("event_id", ev.id).limit(900);
  const byId = new Map((guests ?? []).map(g => [g.id as string, g]));

  /* The most recent failure per guest, so someone who failed at 10:00 and was
     delivered at 11:00 does not appear here. */
  const ids = [...byId.keys()];
  const last = new Map<string, { code: number | null; err: string | null; at: string }>();
  for (let i = 0; i < ids.length; i += 150) {
    const { data } = await sb.from("wa_messages")
      .select("guest_id, status, error_code, error, created_at")
      .eq("direction", "out").in("guest_id", ids.slice(i, i + 150));
    for (const m of data ?? []) {
      const id = m.guest_id as string;
      if (!id) continue;
      const prev = last.get(id);
      if (!prev || (m.created_at as string) > prev.at) {
        last.set(id, {
          code: m.status === "failed" ? m.error_code : null,
          err: m.status === "failed" ? m.error : null,
          at: m.created_at as string,
        });
      }
    }
  }

  /* Who has already been texted, and who acted on it. Without these the list
     shows the same thirteen people for ever and the only way to know who is
     left is to remember. */
  const { data: smsEvents } = await sb.from("guest_events")
    .select("guest_id").eq("event_type", "sms_sent").in("guest_id", ids);
  const texted = new Set((smsEvents ?? []).map(r => r.guest_id as string));

  const rows = [...last.entries()]
    .filter(([, m]) => m.code != null && ["never", "wait_for_inbound"].includes(policyFor(m.code, m.err).action))
    .map(([id, m]) => ({ g: byId.get(id)!, code: m.code, note: policyFor(m.code, m.err).human }))
    .filter(r => r.g?.phone && r.g?.rsvp_token)
    .sort((a, b) => (a.code ?? 0) - (b.code ?? 0));

  const couple = coupleName(ev) ?? ev.name;
  const when = ev.date
    ? new Date(ev.date).toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";
  const times = eventTimes(ev);
  const venue = venueLine(ev);

  /* The whole invitation, not a stub.
   *
   * The first version was two lines, shortened for the 70-character Hebrew SMS
   * segment. That limit only costs money when sending through a provider that
   * bills per segment; these go from Dvir's own phone on an ordinary plan,
   * where length is free. So the guest who could not be reached by WhatsApp was
   * being sent less than everyone else for no reason at all — and these are
   * often the older guests, the ones least likely to tap an unexplained link.
   *
   * Same opening as the approved template, so it reads as the same invitation
   * arriving by a different road. */
  /* Short, and the link last. This is not a style choice.
   *
     The full invitation was 288 characters of Hebrew and emoji, which is
     UCS-2 — 67 characters per SMS segment, five segments. The URL began at
     character 195 and a segment boundary fell at 201, so it was cut as
     "https:" / "//regalifnei.verce…". On a phone that reassembles the parts
     correctly nobody notices. On one that does not, the guest sees a link
     with no address and taps something that cannot open — which is exactly
     what יעקב בן שושן described on 20/08, four days after his invitation
     failed to reach him by WhatsApp.
     
     And it breaks precisely where it hurts most: the people without WhatsApp
     are the ones on older handsets.
     
     So the text is trimmed to what one or two segments hold, and the URL is
     the LAST thing in the message. A link at the end can lose the tail of a
     dropped segment and still be visible; a link in the middle cannot. */
  /* One SMS segment, and the link cannot break.
   *
     The full invitation was 288 characters of Hebrew and emoji — UCS-2, 67
     characters per segment, five segments — and a boundary fell at 201, four
     characters into the URL. It arrived as "https:" and "//regalifnei.verce…"
     on separate parts. Reassembled correctly nobody notices; reassembled
     badly the guest taps a link with no address, which is what יעקב בן שושן
     described on 20/08.
     
     Shortening the text alone could not fix it: the URL itself is 70
     characters, longer than a segment. /r/<8 chars> is 39, so message and
     link together fit in ONE segment and there is nothing to split.
     
     The date and the venue are not in it on purpose. The SMS has one job —
     deliver a link that opens — and the page it opens carries everything
     else. A message that is complete and unreadable is worth less than a
     line that works. */
  const shortBase = (process.env.NEXT_PUBLIC_APP_URL ?? "https://regalifnei.vercel.app")
    .replace(/^https?:\/\//, "");
  const body = (token: string) =>
    `אישור הגעה — ${couple}\n${shortBase}/r/${token.slice(0, 8)}`;

  return (
    <Shell>
      <h1 style={{ fontFamily: "Frank Ruhl Libre, Georgia, serif", fontSize: 26, fontWeight: 900,
                   color: T.dark, margin: "0 0 6px", textAlign: "center" }}>
        שליחה ב-SMS
      </h1>
      <p style={{ ...p, textAlign: "center", marginBottom: 20 }}>
        {couple} · {rows.length} אורחים שוואטסאפ לא מגיע אליהם
      </p>

      {(events ?? []).length > 1 && (
        <p style={{ textAlign: "center", marginBottom: 22, fontSize: 13 }}>
          {(events ?? []).map(e => (
            <a key={e.id} href={`/admin/sms?event=${e.id}`}
               style={{ color: e.id === ev.id ? T.dark : T.muted, fontWeight: e.id === ev.id ? 700 : 400,
                        margin: "0 8px", textDecoration: e.id === ev.id ? "none" : "underline" }}>
              {coupleName(e) ?? e.name}
            </a>
          ))}
        </p>
      )}

      {rows.length === 0 && <p style={{ ...p, textAlign: "center" }}>אין אורחים כאלה — הכל הגיע 🤍</p>}

      {rows.map(({ g, code, note }) => (
        <SmsRow
          key={g.id}
          id={g.id as string}
          name={g.name as string}
          phone={g.phone as string}
          note={note}
          icon={code === 130472 ? "🧪" : "📵"}
          body={body(g.rsvp_token as string)}
          alreadySent={texted.has(g.id as string)}
          opened={!!g.opened_at}
          answered={g.status !== "pending"}
        />
      ))}

      {rows.length > 0 && (
        <p style={{ ...p, fontSize: 12, textAlign: "center", marginTop: 20, lineHeight: 1.7 }}>
          🧪 יש להם וואטסאפ — ברגע שיגיבו הם חוזרים למערכת אוטומטית<br />
          📵 אין חשבון וואטסאפ — יישארו ידניים
        </p>
      )}
    </Shell>
  );
}

const p = { fontSize: 14, color: T.muted, margin: "0 0 10px", lineHeight: 1.6 } as const;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" style={{
      minHeight: "100dvh", background: T.page, padding: "34px 16px 70px",
      fontFamily: "Heebo, -apple-system, system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>{children}</div>
    </div>
  );
}

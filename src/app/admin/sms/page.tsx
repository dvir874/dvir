import { createServerClient } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth-guard";
import { policyFor } from "@/lib/whatsapp";
import { coupleName } from "@/lib/couple-name";

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
    .select("id, name, couple_names, date").gte("date", today).order("date");
  const ev = (events ?? []).find(e => e.id === event) ?? (events ?? [])[0];
  if (!ev) return <Shell><p style={p}>אין אירועים קרובים</p></Shell>;

  const { data: guests } = await sb.from("guests")
    .select("id, name, phone, rsvp_token").eq("event_id", ev.id).limit(900);
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

  const rows = [...last.entries()]
    .filter(([, m]) => m.code != null && ["never", "wait_for_inbound"].includes(policyFor(m.code, m.err).action))
    .map(([id, m]) => ({ g: byId.get(id)!, code: m.code, note: policyFor(m.code, m.err).human }))
    .filter(r => r.g?.phone && r.g?.rsvp_token)
    .sort((a, b) => (a.code ?? 0) - (b.code ?? 0));

  const couple = coupleName(ev) ?? ev.name;
  const when = ev.date ? new Date(ev.date).toLocaleDateString("he-IL") : "";
  const body = (token: string) =>
    `${couple} מתחתנים! ${when}\nלאישור הגעה: https://regalifnei.vercel.app/rsvp/${token}`;

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
        <a
          key={g.id}
          href={`sms:${g.phone}&body=${encodeURIComponent(body(g.rsvp_token as string))}`}
          style={{
            display: "block", background: T.card, border: `1px solid ${T.border}`,
            borderRadius: 14, padding: "16px 18px", marginBottom: 12,
            textDecoration: "none", color: "inherit",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: T.dark }}>
              {code === 130472 ? "🧪" : "📵"} {g.name}
            </span>
            <span style={{ fontSize: 14, color: T.gold, fontWeight: 700, whiteSpace: "nowrap" }}>
              שלח ›
            </span>
          </div>
          <div style={{ fontSize: 13, color: T.muted, marginTop: 4 }}>{g.phone}</div>
          <div style={{ fontSize: 11.5, color: T.muted, marginTop: 3 }}>{note}</div>
        </a>
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

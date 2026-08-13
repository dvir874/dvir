import { createServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/* Answering without JavaScript.
 *
 * שיר opened her invitation on 13/08, screenshotted the page, and told Mirav
 * that nothing was clickable. Her opened_at is null — the page rendered on her
 * screen and the call that records "opened" never reached the server. If that
 * call could not get out, neither could the one that records her answer, and
 * the page would look perfect while every tap did nothing.
 *
 * The likely cause is the in-app browser WhatsApp opens links in, which on some
 * Android builds blocks or breaks scripts. It could equally be a content
 * blocker, a corporate profile, or a phone old enough that the bundle will not
 * parse. Chasing the specific cause is the wrong response: the list is endless
 * and the couple finds out only when a guest happens to mention it.
 *
 * So this page uses no JavaScript at all. A form element and a POST — the part
 * of the web that has worked since 1995 and cannot be switched off. If a
 * browser can show text and press a button, a guest can answer.
 *
 * It is deliberately plain. This is not where the invitation is admired; it is
 * where someone who could not answer finally can.
 */

const T = {
  ivory: "#FDFAF5", cream: "#F6F1E8", gold: "#C5A46D",
  dark: "#1C1008", muted: "rgba(28,16,8,0.6)", border: "#E8E0D4", olive: "#6B7B5A",
};

export default async function SimpleRsvp({
  params, searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ done?: string; error?: string }>;
}) {
  const { token } = await params;
  const { done, error } = await searchParams;

  const sb = createServerClient();
  const { data: guest } = await sb
    .from("guests")
    .select("id, name, guest_count, status, event_id")
    .eq("rsvp_token", token)
    .maybeSingle();

  if (!guest) {
    return (
      <Shell>
        <h1 style={h1}>הקישור אינו תקין</h1>
        <p style={p}>ייתכן שהועתק חלקית. נסו ללחוץ שוב על הקישור מההודעה.</p>
      </Shell>
    );
  }

  const { data: event } = await sb
    .from("events")
    .select("name, date, venue_name, address, reception_time, chuppah_time")
    .eq("id", guest.event_id)
    .maybeSingle();

  const when = event?.date
    ? new Date(event.date).toLocaleDateString("he-IL",
        { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";

  if (done) {
    const coming = done === "yes";
    return (
      <Shell>
        <p style={{ fontSize: 44, margin: "0 0 10px" }}>{coming ? "🤍" : "🙏"}</p>
        <h1 style={h1}>{coming ? "נרשמתם! תודה" : "תודה שעדכנתם"}</h1>
        <p style={p}>
          {coming
            ? `רשמנו ${guest.guest_count ?? 1} ${(guest.guest_count ?? 1) > 1 ? "אורחים" : "אורח/ת"}. מחכים לראותכם!`
            : "נתגעגע 🤍 אם משהו ישתנה — פשוט השיבו להודעה בוואטסאפ."}
        </p>
      </Shell>
    );
  }

  return (
    <Shell>
      <p style={{ ...p, marginBottom: 4 }}>{guest.name},</p>
      <h1 style={h1}>{event?.name ?? "החתונה"}</h1>
      <p style={{ ...p, marginBottom: 2 }}>{when}</p>
      <p style={{ ...p, marginTop: 0 }}>
        {[event?.venue_name, event?.address].filter(Boolean).join(", ")}
      </p>
      {event?.reception_time && event?.chuppah_time && (
        <p style={{ ...p, marginTop: 0 }}>
          קבלת פנים {event.reception_time} · חופה {event.chuppah_time}
        </p>
      )}

      {error && (
        <p style={{ ...p, color: "#B4453C", fontWeight: 600 }}>
          לא הצלחנו לשמור. נסו שוב, ואם זה חוזר — השיבו להודעה בוואטסאפ ונרשום ידנית.
        </p>
      )}

      <hr style={{ border: 0, borderTop: `1px solid ${T.border}`, margin: "26px 0" }} />

      {/* No script anywhere on this page. A form and a POST. */}
      <form method="POST" action={`/api/rsvp/${token}/simple`}>
        <p style={{ ...p, fontWeight: 700, color: T.dark, marginBottom: 14 }}>
          מגיעים?
        </p>

        <label htmlFor="count" style={{ ...p, display: "block", marginBottom: 6 }}>
          כמה אתם?
        </label>
        <select
          id="count" name="count" defaultValue={String(guest.guest_count ?? 1)}
          style={{
            width: "100%", padding: "14px 12px", fontSize: 17, marginBottom: 22,
            border: `1.5px solid ${T.border}`, borderRadius: 12,
            background: "#fff", color: T.dark, fontFamily: "inherit",
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <button type="submit" name="answer" value="yes" style={{ ...btn, background: T.olive, color: "#fff" }}>
          ✓ כן, נשמח להגיע
        </button>
        <button type="submit" name="answer" value="no" style={{ ...btn, background: "#fff", color: T.dark, border: `1.5px solid ${T.border}` }}>
          ✗ מצטערים, לא נוכל
        </button>
      </form>

      <p style={{ ...p, fontSize: 13, marginTop: 26 }}>
        אפשר גם פשוט להשיב <b>מגיע</b> או <b>לא מגיע</b> להודעה בוואטסאפ.
      </p>
    </Shell>
  );
}

const h1 = {
  fontFamily: "Frank Ruhl Libre, Georgia, serif", fontSize: 26, fontWeight: 700,
  color: T.dark, margin: "0 0 10px", lineHeight: 1.3,
} as const;

const p = {
  fontSize: 16, lineHeight: 1.6, color: T.muted, margin: "0 0 10px",
} as const;

const btn = {
  display: "block", width: "100%", padding: "18px 16px", fontSize: 18, fontWeight: 700,
  borderRadius: 14, border: "none", marginBottom: 12, cursor: "pointer",
  fontFamily: "inherit", minHeight: 56,
} as const;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" style={{ background: T.cream, minHeight: "100vh", padding: "34px 18px 60px" }}>
      <div style={{
        maxWidth: 440, margin: "0 auto", background: T.ivory, borderRadius: 18,
        padding: "28px 22px 30px", border: `1px solid ${T.border}`,
        fontFamily: "Heebo, -apple-system, system-ui, sans-serif",
      }}>
        {children}
      </div>
    </div>
  );
}

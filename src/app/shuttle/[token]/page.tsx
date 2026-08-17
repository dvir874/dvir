import { createServerClient } from "@/lib/supabase-server";
import { coupleName } from "@/lib/couple-name";

export const dynamic = "force-dynamic";

/* The shuttle list, for whoever is calling the passengers.
 *
 * Dvir needed to tell fourteen people from טבריה what time the bus leaves and
 * who to call about it, and wanted his niece נויה to send them rather than
 * doing it himself. There was no way to hand her that list: /admin is his, the
 * helper page sends invitations and nothing else, and fourteen raw wa.me URLs
 * pasted into a chat are not something a person can work through.
 *
 * So: one link, opened on her phone, a row per passenger, each tapping through
 * to WhatsApp with the message already written. She sends fourteen messages in
 * two minutes and nobody has to trust her with the guest list.
 *
 * Keyed on events.helper_token — the token that already exists for exactly this
 * kind of delegation. It exposes the shuttle passengers of one event and
 * nothing else: no other guests, no answers, no counts.
 */

const T = {
  page: "#F6F1E8", card: "#FDFAF5", border: "#E8E0D4",
  dark: "#1C1008", muted: "rgba(28,16,8,0.6)", gold: "#C5A46D", wa: "#25D366",
};

function e164(phone: string) {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("0") ? "972" + d.slice(1) : d;
}

export default async function ShuttleList({
  params, searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ area?: string }>;
}) {
  const { token } = await params;
  const { area } = await searchParams;
  const sb = createServerClient();

  const { data: ev } = await sb.from("events")
    .select("id, name, couple_names, date, address, venue_name, reception_time")
    .eq("helper_token", token).maybeSingle();

  if (!ev) {
    return <Shell><p style={p}>הקישור אינו תקין. בקשו קישור חדש.</p></Shell>;
  }

  const { data: all } = await sb.from("guests")
    .select("id, name, phone, guest_count, ride_from")
    .eq("event_id", ev.id).not("ride_from", "is", null).limit(900);

  /* One shuttle at a time. Without a filter this would list every ride-sharing
     guest, including people offering seats from other towns. */
  const needle = (area ?? "טבריה").trim();
  const riders = (all ?? []).filter(g =>
    g.phone && (g.ride_from as string).includes(needle));

  const couple = coupleName(ev) ?? ev.name;
  const seats = riders.reduce((n, g) => n + (Number(g.guest_count) || 1), 0);

  /* The text Dvir wrote, verbatim. Times and phone numbers in a shuttle notice
     are not something to paraphrase. */
  const MSG = [
    "שלום לכולם 🤍",
    `ההסעה לחתונה של ${couple} תצא בשעה 17:45 מיד שטרית.`,
    "",
    "לכל בירור או בקשה ניתן לפנות אל אחראית ההסעה מזל אליהו 050-684-0990",
    "או אל אהרון 054-577-6669.",
    "",
    "פרטים נוספים יימסרו בהמשך. תודה לכולם!",
  ].join("\n");

  return (
    <Shell>
      <h1 style={{
        fontFamily: "Frank Ruhl Libre, Georgia, serif", fontSize: 25, fontWeight: 900,
        color: T.dark, margin: "0 0 6px", textAlign: "center",
      }}>
        🚌 הסעה מ{needle}
      </h1>
      <p style={{ ...p, textAlign: "center", marginBottom: 6 }}>
        {couple} · {riders.length} נוסעים · {seats} מקומות
      </p>
      <p style={{ ...p, textAlign: "center", fontSize: 12.5, marginBottom: 22 }}>
        לוחצים על שם — וואטסאפ נפתח עם ההודעה מוכנה. רק ללחוץ שלח 🤍
      </p>

      {riders.length === 0 && <p style={{ ...p, textAlign: "center" }}>אין נוסעים ברשימה</p>}

      {riders.map(g => (
        <a
          key={g.id}
          href={`https://wa.me/${e164(g.phone as string)}?text=${encodeURIComponent(MSG)}`}
          target="_blank" rel="noreferrer"
          style={{
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 14,
            padding: "16px 18px", marginBottom: 11, textDecoration: "none", color: "inherit",
            minHeight: 56,
          }}
        >
          <span>
            <span style={{ display: "block", fontSize: 16, fontWeight: 700, color: T.dark }}>
              {g.name}
            </span>
            <span style={{ display: "block", fontSize: 12.5, color: T.muted, marginTop: 2 }}>
              {g.phone}{(Number(g.guest_count) || 1) > 1 ? ` · ${g.guest_count} מקומות` : ""}
            </span>
          </span>
          <span style={{ color: T.wa, fontSize: 14, fontWeight: 800, whiteSpace: "nowrap" }}>
            שלח ›
          </span>
        </a>
      ))}

      <div style={{
        marginTop: 22, padding: "14px 16px", background: T.card,
        border: `1px solid ${T.border}`, borderRadius: 12,
      }}>
        <p style={{ ...p, fontSize: 12, fontWeight: 700, color: T.dark, margin: "0 0 6px" }}>
          ההודעה שתישלח:
        </p>
        <p style={{ ...p, fontSize: 12.5, whiteSpace: "pre-wrap", margin: 0 }}>{MSG}</p>
      </div>
    </Shell>
  );
}

const p = { fontSize: 14, color: T.muted, margin: "0 0 10px", lineHeight: 1.6 } as const;

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" style={{
      minHeight: "100dvh", background: T.page, padding: "32px 16px 60px",
      fontFamily: "Heebo, -apple-system, system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>{children}</div>
    </div>
  );
}

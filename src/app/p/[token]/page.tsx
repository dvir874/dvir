import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Phone, PhoneOff, ChevronDown, MessageCircle } from "lucide-react";
import { createServerClient } from "@/lib/supabase-server";
import { readParentToken, SIDE_VALUES, type Side } from "@/lib/parent-link";
import { WA_PHONE } from "@/lib/constants";

/* /p/[token] — the parents' page. Read-only, one side of one wedding.
 *
 * Stitch project 18431120483630512231, screen 38c7fcb0 ("קישור להורים |
 * האורחים של צד הכלה (מובייל)"), approved 05/10/2026. Parents aged 50–70 open
 * it from WhatsApp: large type, one list of who has not answered with a call
 * button, the rest folded away. Nothing here writes; an update goes to Dvir
 * on WhatsApp. See lib/parent-link.ts for why the token is signed rather than
 * stored. */

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "האורחים שלכם · רגע לפני", robots: { index: false, follow: false } };

type G = { id: string; name: string; phone: string | null; status: string; guest_count: number | null;
  source_group: string | null; do_not_contact: boolean | null };

const SIDE_LABEL: Record<Side, string> = { bride: "צד הכלה", groom: "צד החתן" };
const secret = () => process.env.PARENT_LINK_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function heDate(d: string | null) {
  if (!d) return "";
  const [y, m, day] = d.slice(0, 10).split("-");
  return `${Number(day)}.${Number(m)}.${y}`;
}

export default async function ParentsPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const who = readParentToken(secret(), token);
  if (!who) notFound();

  const sb = createServerClient();
  const { data: ev } = await sb.from("events").select("couple_names, name, date").eq("id", who.eventId).maybeSingle();
  if (!ev) notFound();
  const { data: rows } = await sb.from("guests")
    .select("id, name, phone, status, guest_count, source_group, do_not_contact, side, category")
    .eq("event_id", who.eventId).in("side", SIDE_VALUES[who.side]).limit(1500);
  const guests = ((rows ?? []) as (G & { category?: string })[]).filter(g => g.category !== "demo");

  /* Who has a phone but never received anything — worth a call, not a wait. */
  const withPhone = guests.filter(g => (g.phone ?? "").trim()).map(g => g.id);
  const reached = new Set<string>();
  for (let i = 0; i < withPhone.length; i += 150) {
    const { data: ms } = await sb.from("wa_messages").select("guest_id")
      .eq("direction", "out").in("status", ["delivered", "read"]).in("guest_id", withPhone.slice(i, i + 150));
    for (const m of ms ?? []) reached.add(m.guest_id as string);
  }

  const confirmed = guests.filter(g => g.status === "confirmed");
  const declined = guests.filter(g => g.status === "declined");
  const pending = guests.filter(g => g.status !== "confirmed" && g.status !== "declined");
  const souls = confirmed.reduce((s, g) => s + (g.guest_count ?? 1), 0);
  const answered = confirmed.length + declined.length;
  const pct = guests.length ? Math.round((answered / guests.length) * 100) : 0;

  const groups = new Map<string, G[]>();
  for (const g of pending) {
    const k = g.source_group?.trim() || "בלי קבוצה";
    groups.set(k, [...(groups.get(k) ?? []), g]);
  }
  const ordered = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);

  const couple = ev.couple_names || ev.name || "";
  const wa = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(`שלום דביר, כאן מ${SIDE_LABEL[who.side]} בחתונה של ${couple}. רציתי לעדכן על אורח: `)}`;

  return (
    <main dir="rtl" className="min-h-[100dvh] bg-ivory pb-32 font-body text-ink">
      <div className="mx-auto max-w-lg px-4 pt-8">
        <header className="relative">
          <div className="text-sm font-semibold text-gold-text">רגע לפני · מערכת אישורי הגעה</div>
          <h1 className="mt-2 font-display text-3xl font-black">האורחים של {SIDE_LABEL[who.side]}</h1>
          <p className="mt-1 text-[17px] text-ink/70">החתונה של {couple}{ev.date ? ` · ${heDate(ev.date)}` : ""}</p>
          <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#E2DAC8] bg-cream px-3 py-1 text-sm text-ink/70">
            <span className="h-2 w-2 rounded-full bg-olive" /> מתעדכן בזמן אמת מהמערכת
          </span>
        </header>

        {guests.length === 0 ? (
          <section className="mt-8 rounded-3xl border border-[#E9E1D2] bg-cream p-6 text-center">
            <div className="font-display text-xl font-bold">אין עדיין מוזמנים בצד הזה</div>
            <p className="mt-2 text-[16px] text-ink/70">ברגע שהזוג יוסיף את הרשימה, היא תופיע כאן.</p>
          </section>
        ) : (
          <>
            <section className="mt-6 rounded-3xl border border-[#E9E1D2] bg-cream p-5">
              <div className="flex items-baseline justify-between text-[15px] text-ink/70">
                <span>סה״כ מוזמנים בצד שלכם</span><span className="font-bold text-ink">{guests.length}</span>
              </div>
              <div className="mt-4 rounded-2xl bg-white p-4">
                <div className="flex items-baseline gap-2"><span className="font-display text-4xl font-black text-olive">{confirmed.length}</span><span className="text-lg font-bold">אישרו הגעה ✓</span></div>
                <div className="mt-1 text-[15px] text-ink/70">{souls} נפשות בפועל באולם</div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-center">
                <div className="rounded-2xl bg-white p-3"><div className="text-sm text-ink/60">עוד לא ענו</div><div className="font-display text-2xl font-black text-gold-text">{pending.length}</div></div>
                <div className="rounded-2xl bg-white p-3"><div className="text-sm text-ink/60">הודיעו שלא יגיעו</div><div className="font-display text-2xl font-black text-ink/70">{declined.length}</div></div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E9E1D2]"><div className="h-full rounded-full bg-olive" style={{ width: `${pct}%` }} /></div>
              <div className="mt-1.5 text-sm text-ink/60">{pct}% כבר ענו</div>
            </section>

            {pending.length === 0 ? (
              <section className="mt-6 rounded-3xl border border-olive/30 bg-olive/10 p-6 text-center">
                <div className="font-display text-2xl font-bold">כולם ענו 🤍</div>
                <p className="mt-2 text-[16px] text-ink/70">כל המוזמנים בצד שלכם נתנו תשובה. תודה על העזרה!</p>
              </section>
            ) : (
              <section className="mt-8">
                <h2 className="font-display text-2xl font-bold">עוד לא ענו ({pending.length})</h2>
                <p className="mt-1 text-[16px] text-ink/70">טלפון אחד מכם שווה יותר מעוד הודעה 🙏</p>
                {ordered.map(([grp, list]) => (
                  <div key={grp} className="mt-6">
                    <div className="mb-2 text-[17px] font-bold">{grp} ({list.length})</div>
                    <div className="space-y-2.5">
                      {list.map(g => {
                        const phone = (g.phone ?? "").trim();
                        const note = !phone ? "אין מספר טלפון — כדאי לעדכן את דביר"
                          : g.do_not_contact ? "ביקש/ה לא לקבל הודעות"
                          : !reached.has(g.id) ? "ההזמנה לא הגיעה לוואטסאפ" : "";
                        return (
                          <div key={g.id} className="flex items-center justify-between gap-3 rounded-2xl border border-[#EFE7DA] bg-white px-4 py-3">
                            <div>
                              <div className="text-[17px] font-semibold">{g.name}</div>
                              <div className="text-sm text-ink/60">{(g.guest_count ?? 1) > 1 ? `${g.guest_count} נפשות` : "יחיד/ה"}{note ? ` · ${note}` : ""}</div>
                            </div>
                            {phone ? (
                              <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} aria-label={`להתקשר ל${g.name}`}
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#E2DAC8] bg-cream text-ink"><Phone className="h-5 w-5" /></a>
                            ) : (
                              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ink/5 text-ink/30" aria-hidden><PhoneOff className="h-5 w-5" /></span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {[["אישרו הגעה", confirmed, true], ["הודיעו שלא יגיעו", declined, false]].map(([label, list, showCount]) => (
              <details key={label as string} className="group mt-6 rounded-2xl border border-[#E9E1D2] bg-white">
                <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between px-4 text-[17px] font-bold">
                  <span>{label as string} ({(list as G[]).length})</span>
                  <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                </summary>
                <ul className="border-t border-[#F2ECE2] px-4 py-2">
                  {(list as G[]).map(g => (
                    <li key={g.id} className="flex justify-between py-2 text-[16px]">
                      <span>{g.name}</span>{showCount ? <span className="text-ink/60">{g.guest_count ?? 1}</span> : null}
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </>
        )}

        <p className="mt-10 text-center text-sm text-ink/60">הקישור אישי ל{SIDE_LABEL[who.side]}. אפשר להעביר אותו להורים בלבד.</p>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-[#E9E1D2] bg-ivory/95 px-4 pt-3 backdrop-blur" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
        <a href={wa} className="mx-auto flex min-h-[54px] max-w-lg items-center justify-center gap-2 rounded-full bg-gold font-bold text-ink shadow-md">
          <MessageCircle className="h-5 w-5" /> עדכון על אורח? שלחו לדביר בוואטסאפ
        </a>
      </div>
    </main>
  );
}

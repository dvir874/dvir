/* The morning after, a message from Dvir himself — not from the system.
 *
 * askAfterWedding sends the couple templates (payment, referral). This is the
 * other half: a personal note that only works coming from his own phone. So
 * the system does not send it to the couple; it sends Dvir a link that opens
 * WhatsApp with the note already written, addressed to them. One tap, edit if
 * he likes, send. Every wedding, the day after. */

/** "שלמה גור ואבישג בן שוהם" → "שלמה ואבישג". Anything that does not split
 *  cleanly into two people is used as written. */
export function firstNames(couple: string): string {
  const parts = String(couple ?? "").trim().split(/\s+ו(?=\S)/);
  if (parts.length !== 2) return String(couple ?? "").trim();
  const [a, b] = parts.map(p => p.trim().split(/\s+/)[0]);
  return a && b ? `${a} ו${b}` : String(couple).trim();
}

/* Dvir's own words, 08/10 — the note he sends a couple the morning after.
 * The line about the guests' photo message is only true once the album is
 * marked ready (notifyGallery waits for gallery_ready), so it appears only
 * then — the note must never promise a send that is not coming. */
export function afterWeddingDraft(couple: string, opts: { galleryReady?: boolean } = {}): string {
  const lines = [
    `היי ${firstNames(couple)}`,
    "קודם כל מזל טוב! 💍",
    "מקווה שהיה אתמול בדיוק כמו שחלמתם וציפיתם, ואף טוב יותר מזה.",
    "תודה שנתתם לי להיות חלק מהאירוע שלכם. מקווה שחסכתי לכם קצת כאב ראש — "
      + "זה בדיוק מה שהעסק נבנה בשבילו, שלא תבזבזו את החודש שלפני על טבלאות ושיחות טלפון.",
  ];
  if (opts.galleryReady) {
    lines.push("היום האורחים אמורים לקבל הודעה אחרונה שמזמינה אותם להעלות תמונות שצילמו, "
      + "וכל מה שיעלה יגיע לאלבום שלכם.");
  }
  return lines.join("\n");
}

export function draftLink(phone: string, text: string): string | null {
  let d = String(phone ?? "").replace(/\D/g, "");
  if (d.startsWith("0")) d = `972${d.slice(1)}`;
  if (d.length < 11 || d.length > 15) return null;
  return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
}

/** Which weddings are owed this note today: the last three days, so a morning
 *  when no run fired is caught by the next one. Dedupe is the caller's. */
export function nudgeWindow(today: string): { from: string; before: string } {
  const t = Date.parse(`${today}T00:00:00Z`);
  return { from: new Date(t - 3 * 86_400_000).toISOString().slice(0, 10), before: today };
}

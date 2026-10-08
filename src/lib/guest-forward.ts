/* A guest wrote — Dvir hears it now, not two hours later.
 *
 * Until 08/10 a guest's free text reached him only through the cron's
 * "אורחים כתבו ואין תשובה": after two hours of silence, at one of eight fixed
 * times a day, cut to sixty characters, three names at most. On a wedding day
 * that is the difference between answering "איפה החנייה?" and not.
 *
 * Behind ADMIN_FORWARD_INBOUND (see feedback-raga-rollout-conditions): unset
 * is off, "all" is every wedding, anything else is a comma list of event ids —
 * one wedding first, then everyone.
 *
 * Button taps are not forwarded. "מגיעים" is handled by the bot and is a
 * number on the dashboard; a phone that buzzes for every one of them is a
 * phone that stops being looked at. */

export function forwardEnabled(flag: string | undefined, eventId: string | null | undefined): boolean {
  const v = String(flag ?? "").trim();
  if (!v) return false;
  if (v.toLowerCase() === "all") return true;
  if (!eventId) return false;
  return v.split(",").map(s => s.trim()).includes(eventId);
}

/** Typed by a person, as opposed to tapped. Media counts: a photo of a parking
 *  sign is a question too. */
export function isTypedMessage(type: string | undefined): boolean {
  return type !== "button" && type !== "interactive" && type !== "reaction";
}

export function guestForwardText(v: {
  guestName: string; couple: string; phone: string; body: string;
}): string {
  const d = String(v.phone ?? "").replace(/\D/g, "");
  const local = d.startsWith("972") ? `0${d.slice(3)}` : d;
  const link = d.length >= 9 && d.length <= 15 ? `https://wa.me/${d}` : null;
  return [
    `💬 ${v.guestName || local} (${v.couple || "אורח"}) כתב/ה:`,
    `"${String(v.body ?? "").trim().slice(0, 900)}"`,
    [local, link].filter(Boolean).join(" · "),
  ].join("\n");
}

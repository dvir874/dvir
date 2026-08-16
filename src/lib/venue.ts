/* Where the wedding is, written the way a guest can act on it.
 *
 * events carries the place in two columns and every reader picked one. תהל
 * ואביב were entered as venue_name "גן האירועים ארץ" with address "מושב עג׳ור",
 * so a reader that took `address` sent 310 guests to a village with no venue
 * named in it — and the Waze link built from the same field pointed at the
 * village too. שחר's row happened to hold the whole string in `address` and
 * came out right, which is the worst kind of correct: the same person entered
 * both weddings the same afternoon and only luck separated them.
 *
 * Neither filling is wrong. The schema permits both, so the readers stop
 * depending on which one they got.
 *
 * No imports, so the couple's pages, the sender, the preview and the
 * automations can all reach it without dragging anything along.
 */

type EventLike = { venue_name?: string | null; address?: string | null };

/* Both halves, joined once. If the address already names the venue — as שחר's
   does — it is returned untouched rather than doubled. */
export function venueLine(ev: EventLike | null | undefined): string | null {
  const name = ev?.venue_name?.trim() || "";
  const addr = ev?.address?.trim() || "";
  if (addr && name && !addr.includes(name)) return `${name}, ${addr}`;
  return addr || name || null;
}

/* The navigation target. Waze needs everything the driver needs — a venue name
   alone is ambiguous and a village alone is not a destination. */
export function wazeLink(ev: EventLike | null | undefined): string | null {
  const q = venueLine(ev);
  return q ? `https://waze.com/ul?q=${encodeURIComponent(q)}` : null;
}

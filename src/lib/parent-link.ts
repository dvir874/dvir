/* The parents' link — one per side of a wedding.
 *
 * Dvir, 05/10/2026: parents keep asking the couple "who from our side hasn't
 * answered?". Each side's parents get a read-only page with only their side.
 *
 * No table and no migration: the link is the event id, the side, and an HMAC
 * of both. It cannot be guessed, and changing the side or the event breaks the
 * signature, so the bride's parents cannot read the groom's list by editing
 * the URL. Revoking means rotating PARENT_LINK_SECRET (every link at once) —
 * acceptable for something a couple hands only to their own parents.
 *
 * Import-free apart from node:crypto so it is testable without the app. */

import { createHmac, timingSafeEqual } from "node:crypto";

export type Side = "bride" | "groom";

/** guests.side as it is actually stored: Hebrew from the import, English from
    one older path. Anything else belongs to neither page. */
export const SIDE_VALUES: Record<Side, string[]> = {
  bride: ["כלה", "bride"],
  groom: ["חתן", "groom"],
};

const CODE: Record<Side, string> = { bride: "b", groom: "g" };

function sig(secret: string, eventId: string, side: Side): string {
  return createHmac("sha256", secret).update(`${eventId}:${side}`).digest("base64url").slice(0, 22);
}

export function parentToken(secret: string, eventId: string, side: Side): string {
  return `${eventId}.${CODE[side]}.${sig(secret, eventId, side)}`;
}

/** The event and side a token names, or null if it is not one we signed. */
export function readParentToken(secret: string, token: string): { eventId: string; side: Side } | null {
  const [eventId, code, given] = String(token ?? "").split(".");
  const side: Side | null = code === "b" ? "bride" : code === "g" ? "groom" : null;
  if (!eventId || !side || !given || !/^[0-9a-f-]{36}$/.test(eventId)) return null;
  const want = Buffer.from(sig(secret, eventId, side));
  const got = Buffer.from(given);
  return want.length === got.length && timingSafeEqual(want, got) ? { eventId, side } : null;
}

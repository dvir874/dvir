/* Splitting a long answer into messages WhatsApp will actually accept.
 *
 * A text message is 4096 characters and Meta rejects the whole call above it —
 * not truncates, rejects. The missing-invitations list is the one answer in
 * this system that has no natural bound: שלמה has thirteen guests who never
 * received anything and איילת has 223, and the list used to solve that by
 * showing ten and saying `כתוב "לא קיבלו" שוב`, which shows the same ten. Three
 * people were unreachable through the console entirely, and the message said
 * otherwise.
 *
 * Blocks are never split internally. A guest's name, number and link belong
 * together, and half of a link is worse than a second message.
 *
 * Import-free.
 */

/** Meta's own ceiling for a text message body. */
export const WA_TEXT_LIMIT = 4096;

/** Comfortably inside it, because a body is measured in UTF-16 units and
    Hebrew, emoji and percent-encoding all count for more than they look. */
export const SAFE_LIMIT = 3500;

/**
 * Group blocks into messages, in order, without splitting a block.
 *
 * A single block longer than the limit is emitted on its own rather than
 * dropped: it is one guest, and a message Meta refuses is a visible failure
 * while a silently missing guest is not.
 */
export function chunkBlocks(blocks: string[], limit = SAFE_LIMIT, join = "\n\n"): string[] {
  const out: string[] = [];
  let buf = "";
  for (const raw of blocks) {
    const block = String(raw ?? "");
    if (!block) continue;
    if (!buf) { buf = block; continue; }
    if (buf.length + join.length + block.length <= limit) {
      buf += join + block;
    } else {
      out.push(buf);
      buf = block;
    }
  }
  if (buf) out.push(buf);
  return out;
}

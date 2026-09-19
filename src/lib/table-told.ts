/* Whether this guest has been told the table they are sitting at NOW.
 *
 * The send that carries a table number guards itself with one row in
 * guest_events per guest: `table_number_sent`. It records that the guest was
 * told *something*, and nothing about WHAT — so moving somebody after the send
 * leaves them holding the old number with no way for anything to correct it.
 * The card path marks the same row (see the dedupe comment in wa-send), so the
 * eve message will not fix it either. The guest walks to the wrong table.
 *
 * 20260902_table_numbers.sql asked for exactly this not to happen:
 *
 *   "A timestamp rather than a boolean: ... the couple needs to be able to ask
 *    again after they move somebody."
 *
 * The events column is a timestamp. The per-guest guard stayed a boolean, so
 * the intent never reached the guest. Seating imported from a spreadsheet
 * makes it routine rather than rare — a corrected file re-imported moves
 * people in bulk.
 *
 * So the row carries the table: `table_number_sent:12`. event_type is TEXT and
 * nothing parses it, so this needs no migration and no schema change.
 *
 * THE OLD ROWS. A bare `table_number_sent` means "told, table unknown". Read
 * as "not told" it would re-send to every guest already told — the multiplied
 * send this codebase keeps removing. So a guest holding only a legacy row is
 * treated as told, and the first run to see them writes the specific row for
 * the table they hold now. That assertion is true for anybody not moved before
 * this shipped, it is exactly today's behaviour for anybody who was, and from
 * that point on every move is caught.
 *
 * Import-free so it can be tested, like day-of.ts and needs-human.ts. What a
 * guest is told about where to sit should be decidable without a database.
 */

/** The legacy row, still written by nothing after this. */
export const TABLE_SENT = "table_number_sent";

/** The row that records WHICH table a guest was told. */
export function tableSentEvent(table: string): string {
  return `${TABLE_SENT}:${table}`;
}

export interface Told {
  /** Tables this guest has been told, by name. */
  tables: Set<string>;
  /** A bare row from before this file: told something, unknown what. */
  legacy: boolean;
}

/** Fold a guest's guest_events rows into what they have been told. */
export function foldTold(eventTypes: readonly string[]): Told {
  const tables = new Set<string>();
  let legacy = false;
  for (const raw of eventTypes) {
    const t = String(raw ?? "");
    if (t === TABLE_SENT) { legacy = true; continue; }
    if (t.startsWith(`${TABLE_SENT}:`)) {
      const name = t.slice(TABLE_SENT.length + 1).trim();
      if (name) tables.add(name);
    }
  }
  return { tables, legacy };
}

export interface TableAction {
  /** Send the number. False when they already hold it. */
  send: boolean;
  /** The row to write, or null when nothing changed. Written after a
      successful send, and on its own when adopting a legacy row. */
  record: string | null;
}

/**
 * What to do about a guest sitting at `table`.
 *
 * `table` is the name as the venue numbers it — the thing a sign in the room
 * says, and the only thing a guest can act on.
 */
export function tableAction(told: Told, table: string): TableAction {
  const name = String(table ?? "").trim();
  if (!name) return { send: false, record: null };

  /* Already holds this number. */
  if (told.tables.has(name)) return { send: false, record: null };

  /* Told once, before the row carried a table. Adopted rather than repeated:
     see THE OLD ROWS above. */
  if (told.legacy && told.tables.size === 0) {
    return { send: false, record: tableSentEvent(name) };
  }

  /* Either never told, or told a different table — which is a move, and the
     one case this whole file exists for. */
  return { send: true, record: tableSentEvent(name) };
}

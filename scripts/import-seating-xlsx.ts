/* One-off seating import from the couple's own spreadsheet.
 *
 * טל, 20/09, four days before her wedding: "משפחת החתן הצליחה לשבץ בשולחנות,
 * אני לא הצלחתי - האפליקציה ממש קשה.. אשמח אם תטען מהאקסל". Two sides planned
 * one room: לאל's family did theirs in the app — 106 assignments — and טל did
 * hers on a spreadsheet. This loads hers beside theirs.
 *
 * Deliberately a script and not a feature. The app has a guest importer
 * (name / phone / count) and no seating importer at all, and the file's shape
 * is one household's, not a format worth teaching the product: sheet «שפירא»
 * carries THREE guest blocks side by side (A–E, G–J, L–O) with the headers on
 * row 2, and a per-table summary in Q–U that exists to be checked against.
 * Sheet «קנריק» is the groom's side as a visual layout with no table column,
 * and is not read.
 *
 * ── What it will not do ───────────────────────────────────────────────────
 *
 * Dry run unless --commit. Additive unless --follow-file. Never creates a
 * table: every one of the 17 in the file already exists, and inventing one
 * would put a guest at a number with no sign at the venue.
 *
 * ── The decisions, and who made them ──────────────────────────────────────
 *
 * "אנחנו" (6, table 6) is the couple's own table, not a guest — Dvir, skip.
 *
 * סבתא רחל sits at 13 in the app, with לאל's family and סבתא אסנת, and at 21
 * in טל's file with משפחת פורת. One grandmother, two families, and the only
 * row in 95 where the two sources disagree. Dvir, 20/09: "תלך על פי הקובץ
 * ששלחתי לך - ולא על פי ההושבה" — so --follow-file moves her, and table 13
 * loses a row. Without the flag she stays and טל's table 21 lands one short.
 *
 * Table 27 holds רוחמה ודביר כהן from the app and מיכל ואלעד ביבי from the
 * file — different parties, twelve people, confirmed by לאל as intended.
 * Table 6 looked like a clash and is not: אמנה ורן שדה appear in both, same
 * table, so the two sides did share a numbering.
 *
 * Usage:
 *   npx tsx scripts/import-seating-xlsx.ts <file.xlsx> <event_id>
 *   … --follow-file     let the file win where it disagrees with the app
 *   … --create-missing  add guests the file names that the list does not have
 *   … --commit          actually write
 */

import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";

const SHEET = "שפירא";                 /* the bride's side; «קנריק» is a layout */
const HEADER_ROW = 2;                   /* 1-indexed, as the file has it */
const BLOCKS = [
  { name: "A", qty: "B", group: "C", table: "D", sub: "E" },
  { name: "G", qty: "H", group: "I", table: "J", sub: null },
  { name: "L", qty: "M", group: "N", table: "O", sub: null },
] as const;
const SUMMARY = { table: "Q", qty: "R" };
/* The couple's own table. A row, not a guest. */
const NOT_A_GUEST = new Set(["אנחנו"]);

type Row = { name: string; qty: number; group: string; sub: string; table: number };

/** Names are compared with punctuation and doubled spaces removed, and nothing
    else — no fuzzy matching. A wrong match seats a stranger at the wrong table
    and nobody finds out until the evening, so a miss is the safer failure and
    every one of them is printed. */
const norm = (s: unknown) =>
  String(s ?? "").replace(/[^\p{L}\p{N} ]/gu, "").replace(/\s+/g, " ").trim();

function readRows(path: string): { rows: Row[]; declared: Map<number, number> } {
  const wb = XLSX.readFile(path);
  const ws = wb.Sheets[SHEET];
  if (!ws) throw new Error(`sheet "${SHEET}" not found — got ${wb.SheetNames.join(", ")}`);
  const cell = (col: string, r: number) => {
    const c = ws[`${col}${r}`];
    return c == null ? "" : String(c.w ?? c.v ?? "").trim();
  };
  const last = XLSX.utils.decode_range(ws["!ref"]!).e.r + 1;

  const rows: Row[] = [];
  for (const b of BLOCKS) {
    for (let r = HEADER_ROW + 1; r <= last; r++) {
      const name = cell(b.name, r);
      const table = cell(b.table, r);
      /* A blank name or a non-numeric table is the gap between blocks, not a
         guest. The summary block lives in the same rows and must not be read
         as one. */
      if (!name || !/^\d{1,3}$/.test(table)) continue;
      if (NOT_A_GUEST.has(name)) continue;
      const qty = Number(cell(b.qty, r));
      rows.push({
        name, table: Number(table),
        qty: Number.isFinite(qty) && qty > 0 ? qty : 1,
        group: cell(b.group, r),
        sub: b.sub ? cell(b.sub, r) : "",
      });
    }
  }

  /* The file's own totals, so the parse can be checked against the author's
     arithmetic rather than against my reading of her layout. */
  const declared = new Map<number, number>();
  for (let r = HEADER_ROW + 1; r <= last; r++) {
    const t = cell(SUMMARY.table, r), q = cell(SUMMARY.qty, r);
    if (/^\d{1,3}$/.test(t) && /^\d{1,3}$/.test(q)) declared.set(Number(t), Number(q));
  }
  return { rows, declared };
}

async function main() {
  const argv = process.argv.slice(2);
  const flags = new Set(argv.filter(a => a.startsWith("--")));
  const [file, eventId] = argv.filter(a => !a.startsWith("--"));
  if (!file || !eventId) {
    console.error("usage: import-seating-xlsx.ts <file.xlsx> <event_id> [--follow-file] [--create-missing] [--commit]");
    process.exit(1);
  }
  const commit = flags.has("--commit");
  const followFile = flags.has("--follow-file");
  const createMissing = flags.has("--create-missing");

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const { rows, declared } = readRows(file);

  /* Parse check first. If the blocks were read wrong this is where it shows,
     and nothing below is worth looking at until it passes. */
  const parsed = new Map<number, number>();
  for (const r of rows) parsed.set(r.table, (parsed.get(r.table) ?? 0) + r.qty);
  const tablesInFile = [...parsed.keys()].sort((a, b) => a - b);
  /* The couple's own row was removed above, so a table holding it is expected
     to come up short against her summary by exactly that much. */
  const drift = tablesInFile
    .map(t => ({ t, got: parsed.get(t) ?? 0, want: declared.get(t) ?? 0 }))
    .filter(x => x.got !== x.want);

  console.log(`\n📄 ${file}  ·  גיליון «${SHEET}»`);
  console.log(`   ${rows.length} שורות · ${[...parsed.values()].reduce((a, b) => a + b, 0)} נפשות · ${tablesInFile.length} שולחנות`);
  if (drift.length) {
    console.log("\n   מול בלוק הסיכום שבקובץ:");
    for (const d of drift) {
      const note = d.want - d.got === 6 && d.t === 6 ? "  (ההפרש הוא «אנחנו», מדולג בכוונה)" : "  ⚠";
      console.log(`      שולחן ${String(d.t).padStart(2)}: נקרא ${d.got}, בסיכום ${d.want}${note}`);
    }
  } else {
    console.log("   ✓ כל השולחנות תואמים לבלוק הסיכום שבקובץ");
  }

  const { data: ev } = await sb.from("events")
    .select("id, name, couple_names, date").eq("id", eventId).single();
  if (!ev) throw new Error("event not found");
  console.log(`\n🎎 ${ev.couple_names ?? ev.name} · ${ev.date}`);

  const { data: guests } = await sb.from("guests")
    .select("id, name, guest_count, category").eq("event_id", eventId);
  const real = (guests ?? []).filter(g => g.category !== "demo");
  const byName = new Map<string, { id: string; name: string }[]>();
  for (const g of real) {
    const k = norm(g.name);
    byName.set(k, [...(byName.get(k) ?? []), { id: g.id as string, name: g.name as string }]);
  }

  const { data: tbls } = await sb.from("seating_tables")
    .select("id, name").eq("event_id", eventId);
  const tableId = new Map<number, string>();
  for (const t of tbls ?? []) {
    const n = Number(String(t.name).trim());
    if (Number.isFinite(n)) tableId.set(n, t.id as string);
  }
  const missingTables = tablesInFile.filter(t => !tableId.has(t));
  if (missingTables.length) {
    console.error(`\n✗ שולחנות שאינם קיימים באירוע: ${missingTables.join(", ")}`);
    console.error("  הסקריפט לא יוצר שולחנות — מספר בלי שלט באולם שולח אורח לחפש מקום שלא קיים.");
    process.exit(1);
  }

  const { data: asg } = await sb.from("seating_assignments")
    .select("id, guest_id, table_id").eq("event_id", eventId);
  const seatOf = new Map<string, { id: string; table: number }>();
  const idToNum = new Map([...tableId].map(([n, id]) => [id, n]));
  for (const a of asg ?? []) {
    const n = idToNum.get(a.table_id as string);
    if (n != null) seatOf.set(a.guest_id as string, { id: a.id as string, table: n });
  }

  /* The id travels ON the move record. It used to be looked up from a Map keyed
     by the Row object, and `{ ...r, from }` is a different object — so the
     lookup returned undefined and the update went out with an undefined uuid.
     Caught on the live run: 81 inserts landed and the one move failed. */
  const plan = { keep: [] as string[], add: [] as Row[], move: [] as (Row & { from: number; gid: string })[],
                 ambiguous: [] as Row[], missing: [] as Row[] };
  const resolved = new Map<Row, string>();
  for (const r of rows) {
    const hits = byName.get(norm(r.name)) ?? [];
    if (hits.length === 0) { plan.missing.push(r); continue; }
    if (hits.length > 1) { plan.ambiguous.push(r); continue; }
    const gid = hits[0].id;
    resolved.set(r, gid);
    const cur = seatOf.get(gid);
    if (!cur) plan.add.push(r);
    else if (cur.table === r.table) plan.keep.push(r.name);
    else plan.move.push({ ...r, from: cur.table, gid });
  }

  const ppl = (rs: { qty: number }[]) => rs.reduce((a, b) => a + b.qty, 0);
  console.log(`\n══ התוכנית ══`);
  console.log(`   כבר משובצים נכון     : ${plan.keep.length}`);
  console.log(`   שיבוץ חדש            : ${plan.add.length}  (${ppl(plan.add)} נפשות)`);
  console.log(`   משובצים לשולחן אחר   : ${plan.move.length}${followFile ? "  → יוזזו" : "  → לא ייגעו (בלי --follow-file)"}`);
  for (const m of plan.move) console.log(`        ${m.name}  ${m.from} → ${m.table}`);
  if (plan.ambiguous.length) {
    console.log(`   ⚠ שם שמתאים ליותר מאורח אחד : ${plan.ambiguous.length} — מדולגים תמיד`);
    for (const a of plan.ambiguous) console.log(`        ${a.name} (שולחן ${a.table})`);
  }
  console.log(`   לא ברשימת האורחים    : ${plan.missing.length}  (${ppl(plan.missing)} נפשות)${createMissing ? "  → ייווצרו" : "  → מדולגים"}`);
  for (const m of plan.missing) console.log(`        שולחן ${String(m.table).padStart(2)} · ${m.name} (${m.qty})`);

  console.log(`\n══ לפי שולחן, אחרי הייבוא ══`);
  const after = new Map<number, number>();
  for (const [gid, s] of seatOf) {
    const moved = followFile && plan.move.find(m => m.gid === gid);
    const t = moved ? moved.table : s.table;
    const g = real.find(x => x.id === gid);
    after.set(t, (after.get(t) ?? 0) + Number(g?.guest_count ?? 1));
  }
  for (const r of plan.add) after.set(r.table, (after.get(r.table) ?? 0) + r.qty);
  if (createMissing) for (const r of plan.missing) after.set(r.table, (after.get(r.table) ?? 0) + r.qty);
  for (const t of [...after.keys()].sort((a, b) => a - b)) {
    const fromFile = declared.get(t);
    console.log(`   שולחן ${String(t).padStart(2)}: ${String(after.get(t)).padStart(3)} נפשות${fromFile ? `   (באקסל: ${fromFile})` : ""}`);
  }

  if (!commit) {
    console.log(`\n🔒 הרצה יבשה. שום דבר לא נכתב. להרצה אמיתית: --commit\n`);
    return;
  }

  console.log(`\n✍️  כותב…`);
  let wrote = 0, moved = 0, made = 0;
  for (const r of plan.add) {
    const gid = resolved.get(r)!;
    const { error } = await sb.from("seating_assignments")
      .insert({ event_id: eventId, guest_id: gid, table_id: tableId.get(r.table)! });
    if (error) { console.error(`   ✗ ${r.name}: ${error.message}`); continue; }
    wrote++;
  }
  if (followFile) for (const m of plan.move) {
    const { error } = await sb.from("seating_assignments")
      .update({ table_id: tableId.get(m.table)! }).eq("guest_id", m.gid).eq("event_id", eventId);
    if (error) { console.error(`   ✗ ${m.name}: ${error.message}`); continue; }
    moved++;
  }
  if (createMissing) for (const r of plan.missing) {
    const { data: g, error } = await sb.from("guests")
      .insert({ event_id: eventId, name: r.name, guest_count: r.qty,
                status: "confirmed", source_group: r.group || null })
      .select("id").single();
    if (error || !g) { console.error(`   ✗ ${r.name}: ${error?.message}`); continue; }
    made++;
    const { error: e2 } = await sb.from("seating_assignments")
      .insert({ event_id: eventId, guest_id: g.id, table_id: tableId.get(r.table)! });
    if (e2) console.error(`   ✗ שיבוץ ${r.name}: ${e2.message}`);
  }
  console.log(`\n✓ ${wrote} שיבוצים חדשים · ${moved} הוזזו · ${made} אורחים נוצרו\n`);
}

main().catch(e => { console.error(e); process.exit(1); });

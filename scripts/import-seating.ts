/* Load a couple's seating plan out of the Excel they already made.
 *
 *   npx tsx scripts/import-seating.ts <couple-token> <file.xlsx>
 *   npx tsx scripts/import-seating.ts <couple-token> <file.xlsx> --apply
 *
 * Without --apply nothing is written: the file is read, matched against the
 * guest list, and the whole report is printed. That is the order to do it in.
 * 371 rows is not a thing to find out about afterwards.
 *
 *   --url   the app to talk to (default APP_URL, then production)
 *
 * It posts the file to /api/couple/[token]/seating/import rather than touching
 * the database, so it needs no service key and can do nothing the couple's own
 * screen will not be able to do.
 */

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? (args[i + 1] ?? "") : null;
};
const positional = args.filter((a, i) =>
  !a.startsWith("--") && !(i > 0 && args[i - 1] === "--url"));

const [token, path] = positional;
const apply = args.includes("--apply");
const base = (flag("url") || process.env.APP_URL || "https://regalifnei.vercel.app")
  .replace(/\/$/, "");

if (!token || !path) {
  console.error("שימוש: npx tsx scripts/import-seating.ts <couple-token> <file.xlsx> [--apply]");
  process.exit(1);
}

const line = (n = 64) => console.log("─".repeat(n));

async function main() {
  const { readFile } = await import("node:fs/promises");
  const bytes = await readFile(path);

  const form = new FormData();
  form.set("file", new Blob([bytes]), path.split("/").pop() ?? "seating.xlsx");
  if (!apply) form.set("dry_run", "1");

  const res = await fetch(`${base}/api/couple/${token}/seating/import`, {
    method: "POST", body: form,
  });
  const r = await res.json();

  if (!res.ok) {
    console.error(`\n✗ ${r.error ?? res.statusText}`);
    for (const s of r.skipped ?? []) console.error(`  - [${s.sheet}] ${s.what}: ${s.reason}`);
    process.exit(1);
  }

  line();
  console.log(apply ? "  יובא" : "  הרצה יבשה — לא נכתב כלום");
  line();
  console.log(`קובץ      ${r.file.name} · גיליונות: ${r.file.sheets.join(", ")}`);
  console.log(`נקרא      ${r.file.placed} שיבוצים מתוך ${r.file.rows} שורות, ${r.file.tables} שולחנות`);
  console.log(`התאמה     ${r.seats.toAssign} מוזמנים זוהו ברשימה`);
  console.log(`שולחנות   ${r.tables.alreadyInApp} כבר במערכת · ${r.tables.toCreate.length} ייווצרו`);
  if (apply) console.log(`נכתב      ${r.assigned} שיבוצים, ${r.tablesCreated} שולחנות חדשים`);

  const section = (title: string, rows: string[]) => {
    if (!rows.length) return;
    console.log(`\n${title} (${rows.length}):`);
    for (const x of rows.slice(0, 40)) console.log(`  · ${x}`);
    if (rows.length > 40) console.log(`  … ועוד ${rows.length - 40}`);
  };

  section("שורות שלא הותאמו למוזמן — צריך יד אנושית", (r.unmatched ?? []).map(
    (u: { name: string; table: string; sheet: string; row: number; reason: string; candidates: string[] }) =>
      `${u.sheet}:${u.row} "${u.name}" → שולחן ${u.table} — ${u.reason}` +
      (u.candidates.length ? ` (אולי: ${u.candidates.join(" / ")})` : "")));

  section("זוהו לפי הקבוצה בקובץ (שם זהה ליותר ממוזמן אחד) — שווה מבט", (r.matchedByFamily ?? []).map(
    (b: { name: string; group: string; table: string }) =>
      `${b.name} (${b.group}) → שולחן ${b.table}`));

  section("אותו מוזמן בשתי שורות — אף אחת לא יושמה", (r.duplicates ?? []).map(
    (d: { guest: string; rows: string[] }) => `${d.guest}: ${d.rows.join("  |  ")}`));

  section("כמות בקובץ שונה מהכמות שהמוזמן אישר (לא נכתב)", (r.countMismatch ?? []).map(
    (c: { name: string; inFile: number; inList: number }) =>
      `${c.name}: בקובץ ${c.inFile}, ברשימה ${c.inList}`));

  section("שובצו למרות שסימנו שלא מגיעים", (r.seatedButDeclined ?? []).map(
    (s: { name: string; table: string }) => `${s.name} → שולחן ${s.table}`));

  if (r.notInFile?.count)
    section(`אישרו הגעה ואינם בקובץ (${r.notInFile.count})`, r.notInFile.sample);

  section("אזהרות", r.warnings ?? []);
  section("לא נקרא", (r.skipped ?? []).map(
    (s: { sheet: string; what: string; reason: string }) => `[${s.sheet}] ${s.what}: ${s.reason}`));

  if (!apply) {
    line();
    console.log("להרצה אמיתית: הוסיפו --apply");
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

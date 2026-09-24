import { createClient } from "@supabase/supabase-js";
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const SINCE = "2026-09-24T10:00:00Z";   /* the 13:30 Israel run lands at 10:30Z */
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
async function main() {
  for (let i = 0; i < 80; i++) {
    const { data } = await sb.from("wa_runs").select("id").gte("created_at", SINCE).limit(1);
    if ((data ?? []).length) { console.log("RUN_DETECTED"); return; }
    await sleep(90_000);
  }
  console.log("TIMEOUT — לא נרשמה ריצה");
}
main().catch(e => { console.error(e); process.exit(1); });

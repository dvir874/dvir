/* Print the two parents' links for a wedding.
 *   node --env-file=.env.local scripts/parent-links.mjs <event-id>
 * Same signing as src/lib/parent-link.ts (kept in step by hand: 6 lines). */
import { createHmac } from "node:crypto";
const id = process.argv[2];
if (!/^[0-9a-f-]{36}$/.test(id ?? "")) { console.error("usage: parent-links.mjs <event-id>"); process.exit(1); }
const secret = process.env.PARENT_LINK_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
const sig = side => createHmac("sha256", secret).update(`${id}:${side}`).digest("base64url").slice(0, 22);
const base = process.env.NEXT_PUBLIC_APP_URL || "https://regalifnei.com";
console.log("צד הכלה:", `${base}/p/${id}.b.${sig("bride")}`);
console.log("צד החתן:", `${base}/p/${id}.g.${sig("groom")}`);

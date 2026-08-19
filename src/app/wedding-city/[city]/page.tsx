import { redirect } from 'next/navigation';

/**
 * /wedding-city/[city] — RETIRED (2026-08-20). Redirects to /weddings.
 *
 * WHY THIS ROUTE NO LONGER RENDERS
 * --------------------------------
 * It served 15 near-duplicate pages (tel-aviv, jerusalem, haifa, ...). Measured
 * from the source before removal:
 *   - 75-81 words of body copy per page, of which 69 were byte-identical on all 15.
 *     Only 6-12 tokens differed: the city name (repeated 4x) and the region (2x).
 *   - Both CTAs on all 15 pointed at the same destination (/#contact).
 *   - `alternates.canonical`, the OG `url` and the JSON-LD `Service.url` all pointed
 *     at `${BASE}/ניהול-חתונה/${city}` — a route that does not exist anywhere in this
 *     repo (no Hebrew-named directory under src/app, no rewrite in next.config.ts,
 *     nothing in vercel.json, and src/middleware.ts matches only /admin + /api).
 *     Every page declared its canonical to be a 404. That was a real bug.
 *   - The JSON-LD asserted `LocalBusiness.areaServed: City` for 15 cities where
 *     רגע לפני has never run an event. The three real weddings were in חדרה,
 *     גוש עציון and מושב עג׳ור — none of which was in the list.
 *   - Zero inbound internal links: `wedding-city` appeared nowhere in src/ except
 *     sitemap.ts. The pages were orphans reachable only from the sitemap.
 *
 * WHY 307 (TEMPORARY) AND NOT 301/308 (PERMANENT)
 * -----------------------------------------------
 * Nobody has checked whether these URLs actually earn impressions. A broken
 * canonical is NOT evidence of non-indexation — rel=canonical is a hint, and when
 * the target is unreachable Google discards it and self-canonicalises the real URL.
 * So these pages may well be indexed. Until that is measured, a permanent redirect
 * would be an irreversible decision taken on an unmeasured basis.
 *
 * A 307 stops the thin duplicate content being served immediately (the whole point),
 * while browsers do not cache it and Google does not hard-consolidate it. Fully
 * reversible.
 *
 * BEFORE MAKING THIS PERMANENT — do this once, after 24/08:
 *   1. Search Console -> Performance -> filter Page contains "/wedding-city/",
 *      last 3 months (pages went live 2026-06-21).
 *   2. If clicks are ~0 (expected): swap `redirect` for `permanentRedirect`
 *      (also from 'next/navigation') to make it a 308 and consolidate the signal
 *      into /weddings. One-word change.
 *   3. If some city genuinely earns clicks: `git checkout` this file to restore the
 *      page, keep ONLY that city, fix the canonical to `${BASE}/wedding-city/${city}`,
 *      and re-add just that URL to src/app/sitemap.ts.
 *
 * The 15 URLs have been removed from src/app/sitemap.ts, so nothing advertises a
 * URL that redirects. Nothing else in src/ links here, so nothing breaks.
 *
 * This route is not on the protected list in CLAUDE.md (/rsvp, /gallery, /memory,
 * /couple, /event) and touches no DB column. Per the route-stability rule, it
 * redirects rather than 404s.
 */
export default async function CityPage() {
  redirect('/weddings');
}

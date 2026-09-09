/** Where this system lives, in one place.
 *
 * The base URL was written literally in nineteen files — guest-facing links,
 * the couple's share text, the venue report footer, the SMS fallback, the
 * marketing copy. Changing the domain by changing an environment variable
 * would have moved some of them and left the rest pointing at the old host,
 * and the ones left behind are exactly the ones a guest sees.
 *
 * Bought 09/09/2026, because Meta refuses to verify a business whose website
 * is on a shared domain: "אי אפשר לאמת את העסק שלך עם דומיין עסק שכיח".
 * regalifnei.vercel.app read to them like gmail.com, and business verification
 * is the only thing standing between 250 recipients a day and 1,000.
 *
 * NEXT_PUBLIC_ so client components get it too — Next inlines it at build
 * time, which means a change needs a redeploy and not merely a restart. */
export const APP_URL =
  (process.env.NEXT_PUBLIC_APP_URL ?? "https://regalifnei.com").replace(/\/+$/, "");

/** The bare host, for places that read better without a scheme — SMS bodies,
    printed reports, anywhere the nine characters matter or the "https://" is
    noise to a human. */
export const APP_HOST = APP_URL.replace(/^https?:\/\//, "");

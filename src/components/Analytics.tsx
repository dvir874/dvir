"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";
import { captureUtm, installClickTracking } from "@/lib/track";

/* Analytics everywhere except the pages guests see.
 *
 * The privacy policy tells guests, in writing, that their pages carry no
 * third-party tracking: "איננו משתמשים בעוגיות מעקב ואיננו מפעילים כלי פרסום
 * או ניתוח של צד שלישי בדפי האורחים". GA4 was loaded from the root layout, so
 * it ran on every one of them and the statement was false.
 *
 * A guest never agreed to anything — their number was handed over by the
 * couple. The marketing site is a different matter: people arrive there by
 * choice.
 *
 * Guest routes are listed rather than inferred, so a new one is a deliberate
 * decision rather than an accident of URL shape.
 */
const GUEST_PREFIXES = [
  "/rsvp", "/gallery", "/memory", "/event", "/couple", "/send",
  /* Added 10/09 after an audit found the list was six of eighteen. Every one
     of these renders to somebody whose number was handed over by the couple,
     and each was loading GA4 while the privacy policy said none of them did.
     /r and /s are redirects with no layout, and are listed anyway so that a
     page added under them later starts out covered. */
  "/r", "/s", "/join", "/rides", "/shuttle", "/wall", "/status",
  "/survey", "/thanks", "/w", "/report", "/approval",
  /* 05/10: the parents' read-only page, sent to the couple's parents. */
  "/p",
];

export default function Analytics() {
  const pathname = usePathname() ?? "";
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const isGuestPage = GUEST_PREFIXES.some(p => pathname === p || pathname.startsWith(p + "/"));

  /* UTM capture and click events — marketing pages only, same rule as GA. */
  useEffect(() => {
    if (!gaId || isGuestPage) return;
    captureUtm();
    return installClickTracking();
  }, [gaId, isGuestPage]);

  if (!gaId || isGuestPage) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { page_path: window.location.pathname });`}
      </Script>
    </>
  );
}

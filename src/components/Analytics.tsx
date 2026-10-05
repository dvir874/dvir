"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";
import { captureAttribution, attributionTag, track } from "@/lib/attribution";

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
];

/* Every WhatsApp, phone and demo button on the marketing site, measured in one
   place rather than in thirty components. A WhatsApp link also gets the
   visitor's first-touch tag appended to its prefilled message — most leads
   never touch the form, and this is the only way the chat itself says which
   video or post sent them. The rewrite happens on the click, before the
   browser follows the link, so the markup stays as designed. */
function onDocumentClick(e: MouseEvent) {
  const a = (e.target as Element | null)?.closest?.("a");
  if (!a) return;
  const href = a.getAttribute("href") ?? "";
  const label = (a.textContent ?? "").trim().slice(0, 60);
  const section = a.closest("section")?.querySelector("h1,h2")?.textContent?.trim().slice(0, 60) ?? "";

  if (href.startsWith("https://wa.me/")) {
    const tag = attributionTag();
    if (tag) {
      try {
        const u = new URL(href);
        const text = u.searchParams.get("text") ?? "שלום דביר, הגעתי מהאתר רגע לפני.";
        if (!text.includes("[מקור:")) {
          /* encodeURIComponent, as lib/constants builds these links — not
             URLSearchParams, whose "+" for a space is not guaranteed to come
             back as a space in every WhatsApp client. */
          a.setAttribute("href", `${u.origin}${u.pathname}?text=${encodeURIComponent(`${text}\n\n[מקור: ${tag}]`)}`);
        }
      } catch { /* a malformed link still opens as it was */ }
    }
    track("whatsapp_click", { cta: label, section, page: window.location.pathname });
  } else if (href.startsWith("tel:")) {
    track("phone_click", { cta: label, section });
  } else if (href === "/try" || href.startsWith("/try?") || href === "/event/demo") {
    track("demo_click", { cta: label, section, target: href });
  }
}

export default function Analytics() {
  const pathname = usePathname() ?? "";
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const isGuestPage = GUEST_PREFIXES.some(p => pathname === p || pathname.startsWith(p + "/"));

  useEffect(() => {
    if (isGuestPage) return;
    captureAttribution();
    document.addEventListener("click", onDocumentClick, { capture: true });
    return () => document.removeEventListener("click", onDocumentClick, { capture: true });
  }, [isGuestPage]);

  if (!gaId) return null;
  if (isGuestPage) return null;

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

import type { Metadata } from "next";

/**
 * The admin had no layout, so every screen under /admin inherited the marketing
 * site's title — "רגע לפני — ניהול אורחים חכם לחתונות ואירועים" — and with a
 * dozen tabs open none of them could be told apart. It also meant the operator
 * console was advertising itself to search engines.
 */
/* The root layout already appends "| רגע לפני" to every title, so a default of
   "ניהול · רגע לפני" rendered as "ניהול · רגע לפני | רגע לפני" — the same
   doubling that hit /about. The brand belongs to the root template only. */
export const metadata: Metadata = {
  title: {
    template: "%s · ניהול",
    default: "ניהול",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

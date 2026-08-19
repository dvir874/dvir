import { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://regalifnei.vercel.app';

const CATEGORIES = [
  'wedding', 'birthday', 'barmitzva', 'batmitzva', 'hina', 'brit', 'brita',
];

// NOTE: the 15 /wedding-city/<city> URLs were removed from this sitemap on
// 2026-08-20. That route now 307-redirects to /weddings (see
// src/app/wedding-city/[city]/page.tsx for the full reasoning and for the
// Search Console check to run before making the redirect permanent).
// A sitemap must never advertise a URL that redirects or 404s.

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const statics: MetadataRoute.Sitemap = [
    { url: BASE,                  lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/demo`,        lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/event/demo`,  lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/try`,         lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/pricing`,     lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/weddings`,    lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/bar-mitzvah`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/guides/rsvp-cost`,     lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/guides/seating-guide`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/terms`,       lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${BASE}/partners`,    lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/religious`,   lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/venues`,      lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/guides/compare`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/dvir`,        lastModified: now, changeFrequency: 'yearly',  priority: 0.5 },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url:             `${BASE}/event-type/${cat}`,
    lastModified:    now,
    changeFrequency: 'monthly' as const,
    priority:        0.9,
  }));

  return [...statics, ...categoryPages];
}

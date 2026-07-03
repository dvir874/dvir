import { MetadataRoute } from 'next';

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://regalifnei.vercel.app';

const CATEGORIES = [
  'wedding', 'birthday', 'barmitzva', 'batmitzva', 'hina', 'brit', 'brita',
];

const CITIES = [
  'tel-aviv', 'jerusalem', 'haifa', 'beer-sheva', 'rishon-lezion',
  'petah-tikva', 'ashdod', 'netanya', 'holon', 'bnei-brak',
  'ramat-gan', 'bat-yam', 'herzliya', 'kfar-saba', 'modiin',
];

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
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url:             `${BASE}/event-type/${cat}`,
    lastModified:    now,
    changeFrequency: 'monthly' as const,
    priority:        0.9,
  }));

  const cityPages: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url:             `${BASE}/wedding-city/${city}`,
    lastModified:    now,
    changeFrequency: 'monthly' as const,
    priority:        0.8,
  }));

  return [...statics, ...categoryPages, ...cityPages];
}

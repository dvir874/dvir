/* Central gallery data — all 34 real images across 7 categories */

export type GalleryCategory =
  | "wedding"
  | "birthday"
  | "barmitzva"
  | "batmitzva"
  | "hina"
  | "brit"
  | "brita";

export interface GalleryImage {
  src: string;
  alt: string;
  category: Exclude<GalleryCategory, "all">;
  label: string;
  featured?: boolean;
}

export interface CategoryMeta {
  id: GalleryCategory;
  labelHe: string;
  accent: string;
  accentLight: string;
}

/* The 5 curated portfolio highlights shown in the "עיצובים נבחרים" section */
export const CURATED_SRCS = [
  "/gallery/wedding/wedding4.png",                                                         // dark luxury gold
  encodeURI("/gallery/hina/ChatGPT Image Jun 15, 2026, 12_31_02 PM.png"),                 // Moroccan lavish
  "/gallery/wedding/wedding3.png",                                                         // botanical cream
  "/gallery/wedding/wedding.jpg",                                                          // classic engagement
  encodeURI("/gallery/birthday/ChatGPT Image Jun 15, 2026, 11_32_01 AM.png"),             // cream/gold birthday
] as const;

/* URL-encode filenames that contain spaces */
function enc(folder: string, filename: string): string {
  return `/gallery/${folder}/${encodeURIComponent(filename)}`;
}

/* ── Category metadata ───────────────────────────────── */
export const CATEGORY_META: CategoryMeta[] = [
  { id: "wedding",   labelHe: "חתונה",         accent: "#C5A46D", accentLight: "rgba(197,164,109,0.12)" },
  { id: "birthday",  labelHe: "יום הולדת",     accent: "#B8956A", accentLight: "rgba(184,149,106,0.12)" },
  { id: "barmitzva", labelHe: "בר מצווה",      accent: "#6B7B5A", accentLight: "rgba(107,123,90,0.12)"  },
  { id: "batmitzva", labelHe: "בת מצווה",      accent: "#C5A46D", accentLight: "rgba(197,164,109,0.12)" },
  { id: "hina",      labelHe: "חינה",           accent: "#8B6E4E", accentLight: "rgba(139,110,78,0.12)"  },
  { id: "brit",      labelHe: "ברית",           accent: "#5A7A7B", accentLight: "rgba(90,122,123,0.12)"  },
  { id: "brita",     labelHe: "ברית בנות",     accent: "#9B7BA0", accentLight: "rgba(155,123,160,0.12)" },
];

/* ── All images ─────────────────────────────────────── */
export const ALL_IMAGES: GalleryImage[] = [
  /* Wedding — 8 images */
  { src: "/gallery/wedding/wedding.jpg",  alt: "הזמנת חתונה", category: "wedding",   label: "Save The Date",    featured: true  },
  { src: "/gallery/wedding/wedding1.png", alt: "הזמנת חתונה", category: "wedding",   label: "חתונה רומנטית",   featured: false },
  { src: "/gallery/wedding/wedding2.png", alt: "הזמנת חתונה", category: "wedding",   label: "חתונה קלאסית",    featured: true  },
  { src: "/gallery/wedding/wedding3.png", alt: "הזמנת חתונה", category: "wedding",   label: "חתונה מינימלית",  featured: false },
  { src: "/gallery/wedding/wedding4.png", alt: "הזמנת חתונה", category: "wedding",   label: "חתונה יוקרתית",   featured: false },
  { src: "/gallery/wedding/wedding5.png", alt: "הזמנת חתונה", category: "wedding",   label: "חתונה פרחונית",   featured: false },
  { src: "/gallery/wedding/wedding6.png", alt: "הזמנת חתונה", category: "wedding",   label: "חתונה אישית",     featured: false },
  { src: "/gallery/wedding/wedding7.png", alt: "הזמנת חתונה", category: "wedding",   label: "חתונה ייחודית",   featured: false },

  /* Birthday — 8 images */
  { src: enc("birthday", "ChatGPT Image Jun 15, 2026, 11_32_01 AM.png"), alt: "הזמנת יום הולדת", category: "birthday",  label: "יום הולדת",   featured: true  },
  { src: enc("birthday", "ChatGPT Image Jun 15, 2026, 11_32_12 AM.png"), alt: "הזמנת יום הולדת", category: "birthday",  label: "יום הולדת",   featured: false },
  { src: enc("birthday", "ChatGPT Image Jun 15, 2026, 11_32_17 AM.png"), alt: "הזמנת יום הולדת", category: "birthday",  label: "יום הולדת",   featured: false },
  { src: enc("birthday", "ChatGPT Image Jun 15, 2026, 11_32_22 AM.png"), alt: "הזמנת יום הולדת", category: "birthday",  label: "יום הולדת",   featured: false },
  { src: enc("birthday", "ChatGPT Image Jun 15, 2026, 11_32_30 AM.png"), alt: "הזמנת יום הולדת", category: "birthday",  label: "יום הולדת",   featured: false },
  { src: enc("birthday", "ChatGPT Image Jun 15, 2026, 11_32_42 AM.png"), alt: "הזמנת יום הולדת", category: "birthday",  label: "יום הולדת",   featured: false },
  { src: enc("birthday", "ChatGPT Image Jun 15, 2026, 11_32_46 AM.png"), alt: "הזמנת יום הולדת", category: "birthday",  label: "יום הולדת",   featured: false },
  { src: enc("birthday", "ChatGPT Image Jun 15, 2026, 11_38_31 AM.png"), alt: "הזמנת יום הולדת", category: "birthday",  label: "יום הולדת",   featured: false },

  /* Bar Mitzvah — 4 images */
  { src: enc("barmitzva", "ChatGPT Image Jun 15, 2026, 12_28_46 PM.png"), alt: "הזמנת בר מצווה", category: "barmitzva", label: "בר מצווה",    featured: true  },
  { src: enc("barmitzva", "ChatGPT Image Jun 15, 2026, 12_28_50 PM.png"), alt: "הזמנת בר מצווה", category: "barmitzva", label: "בר מצווה",    featured: false },
  { src: enc("barmitzva", "ChatGPT Image Jun 15, 2026, 12_28_55 PM.png"), alt: "הזמנת בר מצווה", category: "barmitzva", label: "בר מצווה",    featured: false },
  { src: enc("barmitzva", "ChatGPT Image Jun 15, 2026, 12_29_01 PM.png"), alt: "הזמנת בר מצווה", category: "barmitzva", label: "בר מצווה",    featured: false },

  /* Bat Mitzvah — 4 images */
  { src: enc("batmitzva", "ChatGPT Image Jun 15, 2026, 11_47_32 AM.png"), alt: "הזמנת בת מצווה", category: "batmitzva", label: "בת מצווה",    featured: true  },
  { src: enc("batmitzva", "ChatGPT Image Jun 15, 2026, 11_47_36 AM.png"), alt: "הזמנת בת מצווה", category: "batmitzva", label: "בת מצווה",    featured: false },
  { src: enc("batmitzva", "ChatGPT Image Jun 15, 2026, 11_47_40 AM.png"), alt: "הזמנת בת מצווה", category: "batmitzva", label: "בת מצווה",    featured: false },
  { src: enc("batmitzva", "ChatGPT Image Jun 15, 2026, 11_51_31 AM.png"), alt: "הזמנת בת מצווה", category: "batmitzva", label: "בת מצווה",    featured: false },

  /* Hina — 4 images */
  { src: enc("hina", "ChatGPT Image Jun 15, 2026, 12_31_02 PM.png"), alt: "הזמנת חינה", category: "hina",      label: "חינה",         featured: true  },
  { src: enc("hina", "ChatGPT Image Jun 15, 2026, 12_31_06 PM.png"), alt: "הזמנת חינה", category: "hina",      label: "חינה",         featured: false },
  { src: enc("hina", "ChatGPT Image Jun 15, 2026, 12_31_10 PM.png"), alt: "הזמנת חינה", category: "hina",      label: "חינה",         featured: false },
  { src: enc("hina", "ChatGPT Image Jun 15, 2026, 12_31_14 PM.png"), alt: "הזמנת חינה", category: "hina",      label: "חינה",         featured: false },

  /* Brit — 3 images */
  { src: enc("brit", "ChatGPT Image Jun 15, 2026, 01_02_03 PM.png"), alt: "הזמנת ברית", category: "brit",      label: "ברית מילה",   featured: true  },
  { src: enc("brit", "ChatGPT Image Jun 15, 2026, 01_02_16 PM.png"), alt: "הזמנת ברית", category: "brit",      label: "ברית מילה",   featured: false },
  { src: enc("brit", "ChatGPT Image Jun 15, 2026, 01_02_25 PM.png"), alt: "הזמנת ברית", category: "brit",      label: "ברית מילה",   featured: false },

  /* Brita — 3 images */
  { src: enc("brita", "ChatGPT Image Jun 15, 2026, 01_02_36 PM.png"), alt: "הזמנת ברית בנות", category: "brita",     label: "ברית בנות",  featured: true  },
  { src: enc("brita", "ChatGPT Image Jun 15, 2026, 01_06_03 PM.png"), alt: "הזמנת ברית בנות", category: "brita",     label: "ברית בנות",  featured: false },
  { src: enc("brita", "ChatGPT Image Jun 15, 2026, 01_06_51 PM.png"), alt: "הזמנת ברית בנות", category: "brita",     label: "ברית בנות",  featured: false },
];

export const FEATURED_IMAGES = ALL_IMAGES.filter((img) => img.featured);

export const CURATED_IMAGES: GalleryImage[] = CURATED_SRCS.map(
  (src) => ALL_IMAGES.find((img) => img.src === src)!
).filter(Boolean);

export function getByCategory(cat: GalleryCategory): GalleryImage[] {
  return ALL_IMAGES.filter((img) => img.category === cat);
}

export function getCategoryCount(cat: GalleryCategory): number {
  return getByCategory(cat).length;
}

export function getCategoryMeta(id: GalleryCategory): CategoryMeta {
  return CATEGORY_META.find((c) => c.id === id) ?? CATEGORY_META[0];
}

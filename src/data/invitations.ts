/**
 * Central invitation data source.
 * To add a new invitation: append an object to the INVITATIONS array.
 * To hide one: set hidden: true
 * Images: place in /public/invitations/<slug>/ and reference as /invitations/<slug>/preview.jpg etc.
 */

export type InvitationStyle = "minimalist" | "romantic" | "rustic" | "classic" | "modern" | "luxury";

export interface Invitation {
  slug: string;
  name: string;
  description: string;
  longDescription?: string;
  style: InvitationStyle;
  tags: string[];
  previewImage: string;
  images: string[];
  featured: boolean;
  hidden: boolean;
  year?: number;
}

export const STYLE_LABELS: Record<InvitationStyle, string> = {
  minimalist: "מינימליסטי",
  romantic:   "רומנטי",
  rustic:     "כפרי",
  classic:    "קלאסי",
  modern:     "מודרני",
  luxury:     "יוקרתי",
};

export const INVITATIONS: Invitation[] = [
  {
    slug:            "ivory-bloom",
    name:            "Ivory Bloom",
    description:     "פרחים עדינים על רקע שנהב. אלגנטיות טבעית.",
    longDescription: "עיצוב רומנטי ועדין המשלב פרחים מצוירים ביד עם טיפוגרפיה נקייה. מתאים לחתונות בגינה, אולמות פתוחים ואווירה כפרית-יוקרתית.",
    style:           "romantic",
    tags:            ["פרחים", "שנהב", "רומנטי", "כפרי"],
    previewImage:    "/invitations/ivory-bloom/preview.jpg",
    images:          ["/invitations/ivory-bloom/preview.jpg"],
    featured:        true,
    hidden:          false,
    year:            2025,
  },
  {
    slug:            "gold-minimal",
    name:            "Gold Minimal",
    description:     "זהב על לבן. פשטות שמדברת בעד עצמה.",
    longDescription: "עיצוב מינימליסטי נקי עם הדגשות זהב. הכרטיס מדבר דרך מה שלא יש בו — שפע של ריווח, טיפוגרפיה יוקרתית ופלטה חד-גונית.",
    style:           "minimalist",
    tags:            ["זהב", "מינימליסטי", "נקי", "יוקרה"],
    previewImage:    "/invitations/gold-minimal/preview.jpg",
    images:          ["/invitations/gold-minimal/preview.jpg"],
    featured:        true,
    hidden:          false,
    year:            2025,
  },
  {
    slug:            "dark-romance",
    name:            "Dark Romance",
    description:     "כהה, עמוק, דרמטי. לזוגות שאוהבים לבלוט.",
    longDescription: "עיצוב נועז על רקע כמעט שחור עם הדגשות זהב ופרחים בגוונים עמוקים. יוצר רושם ראשוני שלא נשכח.",
    style:           "luxury",
    tags:            ["כהה", "דרמטי", "זהב", "יוקרתי"],
    previewImage:    "/invitations/dark-romance/preview.jpg",
    images:          ["/invitations/dark-romance/preview.jpg"],
    featured:        true,
    hidden:          false,
    year:            2024,
  },
  {
    slug:            "sage-botanical",
    name:            "Sage Botanical",
    description:     "ירוק-זית, עלים בוטניים. טבע מינימליסטי.",
    longDescription: "עיצוב רענן בגוני ירוק-זית ולבן. שילוב של עלים בוטניים ופרחים עדינים יוצר תחושת אותנטיות ונינוחות.",
    style:           "rustic",
    tags:            ["ירוק", "בוטני", "כפרי", "טבעי"],
    previewImage:    "/invitations/sage-botanical/preview.jpg",
    images:          ["/invitations/sage-botanical/preview.jpg"],
    featured:        false,
    hidden:          false,
    year:            2024,
  },
  {
    slug:            "classic-script",
    name:            "Classic Script",
    description:     "כתב יד קלסי. עיצוב נצחי שלא יוצא מהאופנה.",
    longDescription: "כתב סקריפט יוקרתי משולב עם עיצוב קלאסי. בחירה בטוחה לכל מי שרוצה אלגנטיות נצחית ואיכות מהדרגה הראשונה.",
    style:           "classic",
    tags:            ["קלאסי", "כתב יד", "אלגנטי", "נצחי"],
    previewImage:    "/invitations/classic-script/preview.jpg",
    images:          ["/invitations/classic-script/preview.jpg"],
    featured:        false,
    hidden:          false,
    year:            2025,
  },
  {
    slug:            "modern-arch",
    name:            "Modern Arch",
    description:     "קשתות גיאומטריות. אורבני, עכשווי, מדויק.",
    longDescription: "עיצוב גיאומטרי מודרני עם קשתות כפולות ורקע שנהב. מתאים לזוגות שמחפשים עיצוב שאומר 'עכשיו' בלי לוותר על יוקרה.",
    style:           "modern",
    tags:            ["גיאומטרי", "מודרני", "קשתות", "עכשווי"],
    previewImage:    "/invitations/modern-arch/preview.jpg",
    images:          ["/invitations/modern-arch/preview.jpg"],
    featured:        false,
    hidden:          false,
    year:            2025,
  },
];

export const VISIBLE_INVITATIONS = INVITATIONS.filter((i) => !i.hidden);
export const FEATURED_INVITATIONS = INVITATIONS.filter((i) => i.featured && !i.hidden);

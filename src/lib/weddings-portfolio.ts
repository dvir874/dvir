/* Portfolio entries for /weddings — fill in after each wedding.
   Keep quotes verbatim from couples (with their permission). */

export interface PortfolioEntry {
  couple: string;        // "ענבל ונדב"
  date: string;          // "יוני 2026"
  venue?: string;
  guests: number;
  responseRate: number;  // percent
  quote?: string;        // testimonial, verbatim
  imageUrl?: string;     // optional photo (with permission)
}

export const PORTFOLIO: PortfolioEntry[] = [
  /* Example — replace with real weddings:
  {
    couple: "ענבל ונדב",
    date: "יוני 2026",
    venue: "עדן על המים",
    guests: 287,
    responseRate: 96,
    quote: "חסכנו שעות של טלפונים. הכל היה במקום אחד.",
  },
  */
];

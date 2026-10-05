/**
 * PainCards — "מרגישים שהחתונה הפכה לעבודה במשרה מלאה?"
 *
 * Stitch project 18431120483630512231, screen 3dc4929b ("סרגל צף וכרטיסי
 * כאב"), approved 05/10/2026. Right after the hero: five pains a couple
 * recognises in themselves, then the turn — "זה לא חייב לעבוד ככה." — into
 * the guest journey that answers them. The pattern is goappie.co.il's, the
 * pains are ours, and every one of them is something the product fixes.
 */

const PAINS = [
  { title: "אקסל עם 300 שורות", line: "וכל גרסה אצל מישהו אחר." },
  { title: "רודפים אחרי דודים בטלפון", line: "ערב אחרי ערב, במקום לנוח." },
  { title: "האולם מבקש מספר סופי", line: "ואין לכם מושג כמה באמת מגיעים." },
  { title: "לא יודעים מי קיבל את ההזמנה", line: "חלק מהאורחים פשוט לא מקבלים הודעות." },
  { title: "תור בכניסה ליד הקיר", line: "אורחים מחפשים את השם שלהם ברשימה." },
];

export default function PainCards() {
  return (
    <section dir="rtl" className="w-full bg-ivory px-4 py-16 sm:px-6 sm:py-20 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#E2DAC8] bg-[#F3EFE3] px-3.5 py-1.5 font-body text-sm text-ink/70">
            <span className="h-2 w-2 rounded-full bg-olive" />
            נקודת ההתחלה של רוב הזוגות
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl lg:text-5xl">
            מרגישים שהחתונה הפכה לעבודה במשרה מלאה?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl font-body text-lg text-ink/70">
            במקום להתרגש ולנשום את התקופה, אתם טובעים באקסלים אינסופיים, הודעות קוליות ורשימות שלא נסגרות.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PAINS.map((p) => (
            <div
              key={p.title}
              className="rl-lift flex flex-col rounded-3xl border border-[#E9E1D2] bg-cream p-6 shadow-sm"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EADFD4] font-bold text-[#B85C4B]" aria-hidden>
                ✕
              </span>
              <h3 className="mt-4 min-h-[3.25rem] font-body text-lg font-bold leading-snug text-ink">{p.title}</h3>
              <p className="mt-2 border-t border-[#E9E1D2] pt-3 font-body text-sm leading-relaxed text-ink/70">{p.line}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center text-center">
          <p className="font-display text-2xl font-bold text-gold-text md:text-3xl">זה לא חייב לעבוד ככה.</p>
          <svg viewBox="0 0 120 24" className="mt-3 h-6 w-32" fill="none" aria-hidden>
            <path d="M2 14 H118" stroke="#6B7B5A" strokeWidth="1" />
            {[18, 34, 52, 70, 88, 104].map((x, i) => (
              <ellipse key={x} cx={x} cy={i % 2 ? 10 : 17} rx="5" ry="3"
                transform={`rotate(${i % 2 ? -25 : 25} ${x} ${i % 2 ? 10 : 17})`}
                fill={i % 3 === 1 ? "#C5A46D" : "#6B7B5A"} fillOpacity="0.8" />
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}

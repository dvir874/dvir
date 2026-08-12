/**
 * Matching a guest who needs a lift with a guest who has a seat.
 *
 * The board this replaces grouped by the raw text people typed, which meant
 * "חדרה" and "חדרה /אולגה" were two different places, and so were "בני ברק"
 * and "בני ברק , רמת גן ( אזור קניון אילון )". Nobody in one could ever see
 * anybody in the other.
 *
 * Two things follow from reading the real entries:
 *
 *   1. An organised coach is not a carpool. Eleven of sixteen "seeking" rows
 *      were the Tiberias shuttle — people already on a bus list, who made the
 *      carpool look three times busier than it is and hid the fact that only
 *      five guests actually want a lift.
 *
 *   2. "בני ברק , רמת גן" is one person naming two places they could be
 *      collected from, not one place with a comma in it. Areas are a list.
 */

export type RideRole = "seek" | "offer";

export interface RideGuest {
  id?: string;
  name: string;
  phone?: string | null;
  ride_from?: string | null;
  ride_role?: RideRole | string | null;
}

/** Written differently by different people, meaning the same place. */
const ALIASES: Record<string, string> = {
  "אולגה": "חדרה",
  "גבעת אולגה": "חדרה",
  "רמת גן": "רמת גן",
  "ב״ב": "בני ברק",
  "בני ברק": "בני ברק",
  "ק. צורן": "קדימה צורן",
  "קדימה": "קדימה צורן",
  "צורן": "קדימה צורן",
  "י-ם": "ירושלים",
  "ירושליים": "ירושלים",
};

/** Noise that describes the arrangement rather than the place. */
const NOISE = /\b(אזור|הסעה\s*מ?|מאזור|איסוף|יוצא\s*מ|נוסע\s*מ)\b/g;

/**
 * True when the entry describes an organised coach rather than a private car.
 * These belong on their own list with a seat count, not in a matching pool —
 * a person on the bus is not looking for a stranger's back seat.
 */
export function isShuttle(raw?: string | null): boolean {
  return /הסעה/.test(String(raw ?? ""));
}

/**
 * The places one guest could be collected from, canonicalised.
 * "בני ברק , רמת גן ( אזור קניון אילון )" → ["בני ברק", "רמת גן"]
 */
export function parseAreas(raw?: string | null): string[] {
  const text = String(raw ?? "")
    .replace(/[（(].*?[）)]/g, " ")   // a landmark in brackets is not a town
    .replace(NOISE, " ");

  return [...new Set(
    text.split(/[,\/־+&]|\sו-|\sאו\s/)
      .map(part => part.replace(/["'׳״.]/g, " ").replace(/\s+/g, " ").trim())
      .filter(part => part.length >= 2)
      .map(part => ALIASES[part] ?? part),
  )];
}

export interface RideMatch {
  area: string;
  seeker: RideGuest;
  driver: RideGuest;
}

export interface RideBoard {
  /** Everyone on an organised coach, kept out of the matching entirely. */
  shuttle: { area: string; guests: RideGuest[] }[];
  /** Carpool areas after canonicalisation, each with both sides. */
  areas: { area: string; seekers: RideGuest[]; drivers: RideGuest[] }[];
  /** Every seeker paired with every driver who shares an area. */
  matches: RideMatch[];
  counts: { seekers: number; drivers: number; onShuttle: number };
}

export function buildRideBoard(guests: RideGuest[]): RideBoard {
  const relevant = guests.filter(g => g.ride_from && g.ride_role);

  const shuttleMap = new Map<string, RideGuest[]>();
  const seekers = new Map<string, RideGuest[]>();
  const drivers = new Map<string, RideGuest[]>();

  for (const g of relevant) {
    if (isShuttle(g.ride_from)) {
      const label = String(g.ride_from).trim();
      shuttleMap.set(label, [...(shuttleMap.get(label) ?? []), g]);
      continue;
    }
    const target = g.ride_role === "offer" ? drivers : seekers;
    for (const area of parseAreas(g.ride_from)) {
      target.set(area, [...(target.get(area) ?? []), g]);
    }
  }

  const allAreas = [...new Set([...seekers.keys(), ...drivers.keys()])].sort();
  const areas = allAreas.map(area => ({
    area,
    seekers: seekers.get(area) ?? [],
    drivers: drivers.get(area) ?? [],
  }));

  /* Every pair that shares an area. A guest who named two places can match in
     either, and is deduplicated by pair so naming two places never produces the
     same introduction twice. */
  const seen = new Set<string>();
  const matches: RideMatch[] = [];
  for (const { area, seekers: s, drivers: d } of areas) {
    for (const seeker of s) {
      for (const driver of d) {
        const key = `${seeker.id ?? seeker.name}|${driver.id ?? driver.name}`;
        if (seen.has(key)) continue;
        seen.add(key);
        matches.push({ area, seeker, driver });
      }
    }
  }

  return {
    shuttle: [...shuttleMap.entries()].map(([area, guests]) => ({ area, guests })),
    areas,
    matches,
    counts: {
      seekers: new Set(relevant.filter(g => !isShuttle(g.ride_from) && g.ride_role !== "offer").map(g => g.id ?? g.name)).size,
      drivers: new Set(relevant.filter(g => !isShuttle(g.ride_from) && g.ride_role === "offer").map(g => g.id ?? g.name)).size,
      onShuttle: [...shuttleMap.values()].flat().length,
    },
  };
}

/**
 * The introduction, carrying names and no numbers.
 *
 * Written to be sent BY the couple, who already hold both numbers, so nobody's
 * phone number travels to another guest inside a message. Each side is told who
 * the other is and can answer; whether they then exchange numbers is theirs to
 * decide, which is the part that should never be automatic.
 */
export function introMessage(m: RideMatch, to: "seeker" | "driver"): string {
  return to === "seeker"
    ? `היי ${m.seeker.name}! ראינו שאתם מחפשים טרמפ מ${m.area} לחתונה — ${m.driver.name} נוסע/ת משם ויש מקום ברכב. רוצים שנחבר ביניכם?`
    : `היי ${m.driver.name}! ראינו שיש לכם מקום ברכב מ${m.area} — ${m.seeker.name} מחפש/ת טרמפ משם. רוצים שנחבר ביניכם?`;
}

/* ── Reading a lift out of an ordinary message ────────────────────────────
 *
 * Guests answer in prose. "אני נוסע מחדרה ויש לי מקום לשניים" is an offer, and
 * until now it landed in the inbox and nowhere else — the board only ever knew
 * what someone typed into the RSVP form.
 *
 * Deliberately conservative. A place name alone is never enough: people mention
 * towns for every reason, and silently marking a guest as a driver because they
 * said "אנחנו מירושלים" would put a stranger's name in front of them. Both an
 * intent AND a place must be present, and when only one is, this returns null
 * and the message stays a message.
 */

const OFFER_WORDS = /(יש לי מקום|מקום ברכב|מקום באוטו|יכול לאסוף|אפשר לאסוף|אני מסיע|נוסע ואפשר|מפנה מקום)/;
const SEEK_WORDS  = /(צריך טרמפ|צריכה טרמפ|צריכים טרמפ|מחפש טרמפ|מחפשת טרמפ|מחפשים טרמפ|אשמח לטרמפ|אין לי רכב|אין לנו רכב|זקוק לטרמפ|זקוקה לטרמפ)/;

/** Towns that actually appear in Israeli guest lists, plus the venue's own. */
const TOWNS = [
  "ירושלים", "תל אביב", "חיפה", "באר שבע", "ראשון לציון", "פתח תקווה", "אשדוד",
  "נתניה", "בני ברק", "חולון", "רמת גן", "אשקלון", "רחובות", "בת ים", "כפר סבא",
  "הרצליה", "חדרה", "מודיעין", "רעננה", "רמלה", "לוד", "רהט", "נהריה", "קריית גת",
  "גבעתיים", "טבריה", "נצרת", "עפולה", "אילת", "עכו", "אלעד", "רמת השרון", "כרמיאל",
  "צפת", "דימונה", "ירוחם", "נס ציונה", "קריית שמונה", "אור יהודה", "יבנה", "גדרה",
  "קדימה צורן", "פדואל", "אולגה", "זכרון יעקב", "פרדס חנה", "בנימינה", "קיסריה",
  "אריאל", "בית שמש", "מעלה אדומים", "אשקלון", "שוהם", "יהוד", "גני תקווה",
];

export interface RideIntent { role: RideRole; area: string }

/** What an ordinary message says about a lift, or null when it says nothing. */
export function detectRideIntent(text?: string | null): RideIntent | null {
  const t = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!t) return null;

  const role: RideRole | null =
    OFFER_WORDS.test(t) ? "offer" : SEEK_WORDS.test(t) ? "seek" : null;
  if (!role) return null;

  /* Longest first, so "קריית גת" is not read as "גת" and "בני ברק" wins over
     any shorter fragment inside it. The מ/ב prefix is optional because both
     "מחדרה" and "בחדרה" name the same place. */
  for (const town of [...TOWNS].sort((a, b) => b.length - a.length)) {
    const re = new RegExp(`(^|[\\s,.!?])[מב]?${town.replace(/ /g, "\\s+")}(\\b|[\\s,.!?]|$)`);
    if (re.test(t)) return { role, area: ALIASES[town] ?? town };
  }
  return null;
}

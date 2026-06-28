# E2 Guest Experience — Design Decision Log (Extended)
## Additional Decisions from Wave 2 | Chief of Staff | 2026-06-27

> Extends E2-decisions.md (6 original decisions). These 3 additional decisions cover Survey, Time Capsule, and Memory Wall.

---

## Decision 7 — Survey is a Thank-You, Not a Review Request

**Chosen:** The post-event survey opens with "תודה שהייתם איתנו ❤️" before asking any questions. The tone is gratitude-first throughout. The third question is "השאירו ברכה לזוג" — the guest gives something, not just rates something.

**Rationale:** NPS surveys feel transactional. A wedding survey should feel like a guestbook — a place to leave a piece of yourself for the couple. When the opening copy is "תודה" instead of "נשמח לדעת," the entire experience shifts from feedback extraction to mutual celebration. Completion rates will be higher when guests feel they are giving to the couple, not to the business.

**Rule:** Survey copy must never use the words "שאלון," "משוב," or "דירוג" — only "ברכה," "זיכרון," and "חוויה."

---

## Decision 8 — Time Capsule Blurred Previews as Maximum Anticipation Tool

**Chosen:** The locked time capsule shows 3 partially-legible blurred blessing previews with sender names, then "ועוד 36 הפתעות נוספות..." The text is intentionally semi-readable (you can make out structure, not content).

**Rationale:** Showing nothing defeats the purpose of the capsule — the couple needs to feel something is inside. Showing everything defeats the lock. Blurred text is the exact middle: you know something beautiful is waiting, you know who some senders are, you cannot read the words. This creates a specific emotional state: the suspense of a wrapped gift you can shake but not open.

**Technical note:** CSS `filter: blur(4px)` on text nodes. Not image blur — text blur preserves the sense of readable structure while obscuring content.

---

## Decision 9 — Memory Wall Mixes Blessing Cards and Photos in Equal Weight

**Chosen:** Memory Wall masonry grid alternates between blessing text cards and wedding photos without hierarchy. Neither type is featured over the other.

**Rationale:** A photo wall without text feels like a gallery (cold). A text wall without photos feels like a guestbook (flat). The mix creates a wall of love — each memory has its own medium. A grandparent's written blessing has the same visual weight as the first-dance photo. This equality of memory types is the right philosophical stance for the product.

---

*E2 Extended Decisions | 3 additional decisions | Chief of Staff | 2026-06-27*

# E2 Guest Experience — Design Decision Log
## Chief of Staff | 2026-06-26

---

## Decision 1 — Lush Floral Photography as Primary Premium Signal

**Chosen:** Full-width lush floral photography (roses, dried botanicals) at top of Mini Website / Invitation screen.

**Alternatives considered:**
- A: Typography-only hero (couple name large, no photography)
- B: Flat color or gradient hero
- **C: Warm brand photography — CHOSEN**

**Rationale:** The physical metaphor of a wedding invitation — flowers, paper, warmth — connects the digital screen to the physical occasion before the guest reads a single word. Typography alone cannot achieve the immediate "this is a real couple, this is a real occasion" feeling. Photography bypasses cognitive processing and creates direct emotional response.

**Impact:** Every guest-facing screen with invitation context should lead with brand photography. This is not decorative — it is the primary premium signal.

---

## Decision 2 — Countdown as Focal Reveal, Not Sidebar Element

**Chosen:** Countdown card centered below the invitation header — cream background, large gold Frank Ruhl Libre number, prominent.

**Rationale:** The days remaining is not metadata. It is the emotional centerpiece of the invitation experience for guests. Seeing "24 ימים" creates imminence. It belongs at center, not tucked in a corner.

**Rule encoded:** CountdownCard component (see Design System E5). Always: cream card, Frank Ruhl Libre 900, gold color, centered.

---

## Decision 3 — Zero Navigation Chrome on Guest Pages

**Chosen:** No header, no back button, no tab bar, no footer on any guest-facing single-purpose page.

**Rationale:** Guests have exactly one action on the RSVP page: respond. On the Mini Website: view details. Navigation chrome signals "you are in an app with multiple areas." Guest-facing pages must signal "this is an invitation." No nav, no tabs, no chrome.

**Applies to:** `/rsvp/[token]`, Mini Website, Memory Upload initial state.
**Exceptions:** Gallery page (has upload button), Memory Wall (has tabs for types).

---

## Decision 4 — Memory Upload: Type Selection Before Camera

**Chosen:** Type selection step (Photo / Video / Text Blessing / Voice Note) appears before camera/file picker, using 2×2 card grid with emoji + label + description.

**Rationale:** Starting directly with a file picker is jarring and generic. Starting with a choice of memory type creates intention. It transforms "upload a file" into "choose how you want to share this moment." Tiny UX decision, massive emotional difference.

---

## Decision 5 — CTA Text: "אישור הגעה" not "אישור הגשה"

**Chosen:** "אישור הגעה" (attendance confirmation)

**Implementation note:** Stitch generated "אישור הגשה" (submission confirmation) — this is a copy error. The Hebrew word הגשה means form submission; הגעה means arrival/attendance. The CTA must use הגעה.

**Rule encoded:** All RSVP CTAs must use the word הגעה or its inflections (מגיע, הגעתם, etc.).

---

## Decision 6 — Olive Branch in Declined State

**Chosen:** Olive branch illustration + gracious, warm copy in the declined state.

**Rationale:** Declining a wedding invitation is emotionally charged. The design must never make a declining guest feel rejected, judged, or penalized. The olive branch — a symbol of peace — and warm copy ("נשמח להתראות בהזדמנות אחרת") creates closure without guilt. This is brand empathy in action.

**Pattern encoded:** Gracious State pattern. See Design Library.

---

*E2 Guest Experience Design Decisions | 6 decisions | Chief of Staff | 2026-06-26*

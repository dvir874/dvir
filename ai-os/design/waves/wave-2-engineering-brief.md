# Wave 2 Engineering Brief — Guest Memory & Post-Event Experiences
## רגע לפני | Awaiting CEO Authorization | 2026-06-28

**Status:** ⏸ PENDING CEO APPROVAL — Do not begin implementation.  
**Scope:** E2-S6 through E2-S10 (5 screens from E2-SCREENS.md)  
**Prerequisite:** Wave 1 (`6f146de`) merged and deployed.

---

## Screens in Scope

| Screen | Route | Description |
|--------|-------|-------------|
| E2-S6 | `/gallery/[token]` | Photo Gallery — masonry grid, lightbox, upload FAB |
| E2-S7 | `/memory/[token]` | Memory Upload — type selection (photo / video / blessing / capsule) |
| E2-S8 | `/survey/[token]` | Post-Event Survey — star rating + feedback form |
| E2-S9 | `/memory/[token]/capsule` or `/capsule/[token]` | Time Capsule locked + unlocked states |
| E2-S10 | `/memories/[token]` | Memory Wall — mixed masonry of photos + blessings |

---

## Implementation Order

The dependency graph mandates this sequence:

```
E2-S6 (Gallery)
  └─ depends on: gallery_photos table, gallery_albums table ← ALREADY EXISTS
  └─ blocks: E2-S10 (Memory Wall reuses gallery content)

E2-S7 (Memory Upload)
  └─ depends on: existing /api/memory/ route ← ALREADY EXISTS
  └─ blocks: E2-S9 (capsule letter is a type in S7)

E2-S9 (Time Capsule)
  └─ depends on: E2-S7 (type selection leads here)
  └─ depends on: existing time capsule API + security rule (CLAUDE.md)
  └─ blocks: nothing

E2-S8 (Post-Event Survey)
  └─ depends on: new survey table + API
  └─ blocks: nothing (standalone)

E2-S10 (Memory Wall)
  └─ depends on: E2-S6 (gallery photos) + E2-S7 (blessings)
  └─ must be last
```

**Recommended implementation order:**
1. E2-S6 — Gallery (most infrastructure already exists)
2. E2-S7 — Memory Upload type selection (UI upgrade to existing page)
3. E2-S9 — Time Capsule (locked/unlocked states; security-sensitive)
4. E2-S8 — Post-Event Survey (new table + API)
5. E2-S10 — Memory Wall (depends on S6 + S7 content)

---

## Dependency Graph

```
Existing APIs/Tables:
  gallery_photos ──────────────────────→ E2-S6, E2-S10
  gallery_albums ──────────────────────→ E2-S6
  /api/memory/ ────────────────────────→ E2-S7 (enhance existing page)
  time_capsules / blessings ───────────→ E2-S9

New APIs/Tables Required:
  survey_responses (NEW) ──────────────→ E2-S8
  /api/survey/[token] (NEW) ───────────→ E2-S8

Shared components (build once, use multiple):
  MasonryGrid ─────────────────────────→ E2-S6, E2-S10
  Lightbox ────────────────────────────→ E2-S6
  BlessingCard ────────────────────────→ E2-S9, E2-S10
  StarRating ──────────────────────────→ E2-S8
```

---

## Shared Components (Build Once)

These components appear in multiple screens. Build them as standalone files under `src/components/guest/`:

### `MasonryGrid.tsx`
- 2 columns mobile, 3 columns `md:`, 4 columns `xl:`
- Items fill top-to-bottom (true masonry, not CSS grid rows)
- `object-fit: cover`, 8px border-radius
- Tap → Lightbox
- Skeleton loader: 6 cream animate-pulse rectangles (120px / 180px / 150px)
- Empty state: BotanicalSprig + headline + CTA

### `Lightbox.tsx`
- Full-screen dark overlay (`rgba(28,16,8,0.9)`)
- Swipe left/right (touch events)
- Double-tap zoom (mobile)
- Close button: top-left (standard close convention, not RTL-flipped)
- Download button: bottom center
- `role="dialog"`, `aria-modal="true"`, focus trapped

### `BlessingCard.tsx`
- Cream background, 16px radius, 16px padding
- Blessing text: Heebo 400 15px dark, 4-line max with ellipsis
- Sender: Heebo 600 13px muted, `textAlign: end`
- Used in both E2-S9 (blurred preview) and E2-S10 (visible)

### `StarRating.tsx`
- Default: 5 filled gold stars
- Tap to reduce (never 0)
- `aria-label` per star ("1 כוכב" through "5 כוכבים")

### `TypeSelectionCard.tsx`
- Cream bg, 16px radius, 1px `--color-border-default` border
- Tap: gold border + scale 0.97 → navigate
- Icon: 40px emoji, Label: Heebo 600 16px dark

---

## API Impact

### Existing APIs — No changes needed
- `/api/gallery/[token]` — GET photos (already exists)
- `/api/gallery/[token]/upload` — POST photo (already exists)
- `/api/memory/[token]` — GET + POST memory (already exists)
- `/api/time-capsule/[token]` — existing, has CLAUDE.md security constraint

### New API Required
**`/api/survey/[token]`** (GET + POST)
```typescript
// GET — check if token already submitted
{ submitted: boolean; event_id: string }

// POST body
{ rating: 1|2|3|4|5; feedback_text?: string; would_recommend: boolean }

// POST response
{ success: true }
// or:
{ error: "already_submitted" }
```

---

## Database Impact

### New Table Required
```sql
CREATE TABLE IF NOT EXISTS survey_responses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID REFERENCES events(id) ON DELETE CASCADE,
  token       TEXT NOT NULL,             -- rsvp_token from guests
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback    TEXT,
  recommend   BOOLEAN,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (token)                         -- one submission per guest
);
```

Migration file: `supabase/migrations/20260628_survey_responses.sql`

### Existing Tables — No schema changes
`gallery_photos`, `gallery_albums`, `blessings` — all exist and serve Wave 2 without modification.

---

## Technical Risks

### RISK-1 (HIGH): Time Capsule Security — CLAUDE.md DEC-010
- **Risk:** Blessing text must never appear in DOM, even blurred. Screen reader or inspector can extract it.
- **Mitigation:** API returns ONLY `sender_name`, `created_at`, `id` when locked. Blurred preview renders `"א".repeat(n)` placeholder characters, not actual content.
- **Validation:** After implementation, verify with DevTools inspector that `.blessing-preview-content` contains only placeholder chars.
- **Reference:** CLAUDE.md "Time Capsule Security Rule (Permanent)" + E2-S9 "BLUR SPECIFICATION (CRITICAL)".

### RISK-2 (MEDIUM): HEIC Photo Upload
- **Risk:** iOS shoots HEIC by default. Browser `<input type="file">` accepts it but cannot display it natively.
- **Mitigation:** E2-S6 spec says "HEIC: convert server-side to WebP before storage". Requires Sharp or Supabase Transform.
- **Decision needed:** Does the existing upload route handle HEIC? If not, either add conversion or reject HEIC with friendly error.

### RISK-3 (MEDIUM): Masonry Layout Without Library
- **Risk:** True masonry (column-filling) is not achievable with pure CSS grid. Options: CSS columns, JS height calculation, or a library.
- **Recommended approach:** CSS `column-count` (native, no library, good enough for photos). Limitation: item insertion order differs from visual order.
- **Alternative:** `masonry-layout` npm package — adds ~5KB, true masonry.
- **Decision needed:** CSS columns vs library.

### RISK-4 (LOW): Survey "already submitted" UX
- **Risk:** Guest opens the survey link twice (common on mobile — opens in new tab).
- **Mitigation:** GET endpoint returns `{ submitted: true }`. Page renders "כבר שלחתם לנו פידבק — תודה! 💛" instead of form.
- **Implementation:** Check on page load before rendering any form.

### RISK-5 (LOW): Memory Wall route collision
- **Risk:** `/memories/[token]` (Wall) vs `/memory/[token]` (Upload) — similar names, easy to confuse.
- **Mitigation:** Verify the route doesn't conflict with any existing route before creating.

---

## Estimated Effort

| Screen | Effort | Reason |
|--------|--------|--------|
| E2-S6 Gallery | Medium | Infrastructure exists; masonry + lightbox are new |
| E2-S7 Memory Upload | Small | Existing page — add type selection UI layer |
| E2-S9 Time Capsule | Medium | Security-sensitive; blur spec is non-trivial |
| E2-S8 Survey | Medium | New table + API + full form + already-submitted guard |
| E2-S10 Memory Wall | Small | Reuses MasonryGrid + BlessingCard from above |
| Shared components | Medium | Build once: MasonryGrid, Lightbox, StarRating, etc. |

**Total:** ~3–4 sessions

---

## Testing Strategy

Each screen must pass its own scenario matrix before the next begins:

### E2-S6 Gallery
- Empty state: no photos → empty state renders
- Populated: photos → masonry grid visible
- Lightbox: tap photo → opens, swipe works, close works, download works
- Upload FAB: navigates to `/memory/[token]`

### E2-S7 Memory Upload
- 4 type cards render
- Tap photo → navigates to camera/file picker (or existing upload form)
- Tap blessing → navigates to blessing form
- Tap capsule → navigates to time capsule letter form

### E2-S9 Time Capsule
- Locked state: countdown renders, blurred preview shows ONLY placeholder chars (inspector verified)
- Unlocked state (days ≤ 0): blessing cards show full content
- API: GET with locked capsule returns ONLY `sender_name`, `created_at`, `id` — NEVER `blessing_text`

### E2-S8 Survey
- Form renders with default 5 stars
- Submit → success state
- Open again → "already submitted" state (not form)

### E2-S10 Memory Wall
- Empty state
- Mixed grid: photos + blessing cards interleaved
- Upload FAB present

**Gate:** `npx tsc --noEmit` + `next build` after each screen.

---

## Pre-Implementation Checklist

Before writing any Wave 2 code, verify:

- [ ] CEO has approved this Engineering Brief
- [ ] E2-SCREENS.md S6–S10 re-read in full (don't rely on this summary)
- [ ] Existing gallery/memory/capsule APIs tested manually
- [ ] HEIC decision made (Risk-2)
- [ ] Masonry approach decided (Risk-3)
- [ ] `supabase/migrations/20260628_survey_responses.sql` created and applied
- [ ] Wave 1 patterns doc (`wave-1-patterns.md`) reviewed and active

---

## What Wave 2 Inherits from Wave 1

Automatically:
- SYS-02 tokens (`const T = { ... }`) — copy the pattern file reference
- `GoldCTA`, `WarmCard`, `WarmAlertCard`, `BotanicalSprig`, `RingSVG`, `Confetti` — reuse verbatim
- `fadeUp` + `dotPulse` animation keyframes — copy into page `<style>` blocks
- Mobile-first CSS structure + `@media (min-width: 768px)` tablet layer
- `dir="rtl"` at page root + inline SVG centering pattern
- `aria-live` + `role="status"` on loading/dynamic regions
- `minHeight: 44px` on all interactive elements

---

*Wave 2 Engineering Brief | Chief of Staff | Awaiting CEO Authorization | 2026-06-28*

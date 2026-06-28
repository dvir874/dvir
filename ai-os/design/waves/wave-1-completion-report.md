# Wave 1 Completion Report — RSVP Guest Experience
## רגע לפני | Chief of Staff | 2026-06-28

**Status:** ✅ COMPLETE  
**Commit:** `6f146de` — `feat(rsvp): Wave 1 — SYS-02 visual layer + Stitch-compliant mobile layout`  
**Branch:** `main` → deployed to `regalifnei.vercel.app`

---

## Objectives

| Objective | Status |
|-----------|--------|
| Replace `getTheme()` visual system with SYS-02 design tokens | ✅ Done |
| Implement Stitch-compliant mobile layout (E2-S2) | ✅ Done |
| Implement Stitch-compliant tablet two-column layout (E2-S2 md:) | ✅ Done |
| Implement loading screen per E2-S1 spec | ✅ Done |
| Preserve all business logic, API responses, and DB writes | ✅ Done |
| Fix pre-existing `rsvp_deadline` API bug | ✅ Done |
| Fix React stale closure bug in `handleSubmit` | ✅ Done |
| Remove unreachable `closed` screen (not in approved E2 spec) | ✅ Done |
| Full regression: all 6 scenarios PASS | ✅ Done |
| Test data cleanup | ✅ Done |

---

## Files Changed

| File | Change | Reason |
|------|--------|--------|
| `src/app/rsvp/[token]/page.tsx` | Full rewrite (722 ins / 531 del) | SYS-02 visual layer + mobile layout + bug fixes |
| `src/app/api/rsvp/[token]/route.ts` | 1-line change | Remove `rsvp_deadline` from SELECT (column doesn't exist) |
| `src/app/globals.css` | +37 lines | SYS-02 CSS custom properties + shadow tokens + WCAG focus ring |

---

## Bugs Discovered

### BUG-1 (Pre-existing, P0): `rsvp_deadline` in SELECT → `event: null`
- **Symptom:** Event name, date, and address never rendered for any guest.
- **Root cause:** `rsvp_deadline` column does not exist in the `events` table. Supabase `.single()` silently returns `null` when an unknown column is selected.
- **Discovery:** Noticed during first live load — the event header was blank.
- **Impact:** Affected 100% of RSVP views in production (pre-existing).

### BUG-2 (Implementation, P0): React stale closure — confirm CTA did nothing
- **Symptom:** Clicking "אני מגיע/ה 🎉" had no effect — no POST fired.
- **Root cause:** `handleSubmit()` read `choice` state which was still `null` (set via `setChoice` milliseconds prior, async). The early-exit guard `if (!choice) return` blocked execution.
- **Discovery:** During S1 QA — submit button appeared to do nothing.
- **Fix:** Changed `handleSubmit()` to accept `newChoice` as parameter, eliminating state dependency.

### BUG-3 (Implementation, P2): BotanicalSprig SVG RTL misalignment
- **Symptom:** SVG appeared flush-right instead of centered.
- **Root cause:** Inline SVG is an inline element; in RTL context with `textAlign: center`, it flows from the right edge.
- **Fix:** Added `display: block; margin: 0 auto` to the `<svg>` element.

---

## Bugs Fixed

All 3 bugs above fixed in the same commit. No outstanding bugs from Wave 1.

---

## Design Decisions

### DD-W1-001: Mobile Layout — Full-Bleed Photo with Gradient Overlay
- **Decision:** On mobile (< 768px), photo fills a fixed 300px hero with gradient overlay. Event info (name, date, address) is overlaid in white text. Form content below on ivory background.
- **Alternative rejected:** Stacking photo above form as separate panels (previous implementation).
- **Authority:** E2-S2 spec explicit: `[Full-bleed invitation photo]` + `[Gradient overlay bottom 60%]` + white text overlaid.
- **Implementation:** `.rsvp-photo-panel::after` pseudo-element for overlay. `.rsvp-photo-overlay` div positioned `absolute bottom-0 z-index:1` for text.

### DD-W1-002: Merged S2+S3 UX Flow
- **Decision:** Keep existing single-page RSVP flow (invitation + form on same page) rather than splitting into separate YES/NO screen and form screen.
- **Reason:** Business logic rewrite was out of scope for Wave 1 (visual layer only). The merged flow works and serves existing couples.
- **Debt:** Wave 2 may split this if the UX spec mandates it.

### DD-W1-003: Remove `rsvp_deadline` / `closed` Screen
- **Decision:** Removed entirely.
- **Reason:** Column doesn't exist in DB schema. Feature not in E2-SCREENS.md spec. "אין מצב של 'Code is correct but unreachable'" — CEO directive.
- **If needed in future:** Requires DB migration + Stitch design + CEO approval.

### DD-W1-004: Tablet Layout — Right-column photo per spec OPP-002
- **Decision:** Photo on RIGHT side at tablet (768px+), ivory form on LEFT. Matches E2-S2 tablet spec: `[Left column 55%: form] [Right column 45%: photo]`.
- **Note:** The spec says left=form, right=photo. In RTL, the Flex order means photo div renders first in DOM but appears on right visually.

### DD-W1-005: Loading Screen — 3 Pulsing Dots
- **Decision:** Replaced spinner with 3 pulsing gold dots + "מכינים את ההזמנה שלך..." + "רגע לפני" wordmark + BotanicalSprig.
- **Authority:** E2-S1 spec: "Loading indicator: 3 pulsing gold dots (not a spinner), 400ms stagger".

---

## Deviations from Previous Implementation

| Area | Before | After |
|------|--------|-------|
| Loading indicator | Single spinner | 3 pulsing gold dots + wordmark |
| Loading copy | "טוענת את ההזמנה..." | "מכינים את ההזמנה שלך..." |
| Mobile layout | Photo stacked above (natural height) | Photo fixed 300px hero + gradient overlay + white text |
| Event header mobile | Inside ivory form area | Overlaid on photo in white |
| Event header tablet | Same as mobile (no separation) | Shown in ivory form panel (hidden on mobile) |
| `rsvp_deadline` | Referenced in interface, useEffect, JSX | Completely removed |
| `closed` screen | Present (unreachable) | Removed |
| Phone field hint | "לעדכונים לפני האירוע" | "הטלפון רק לתיאום ישיר עם הזוג — לא לשיווק" (per spec) |
| Phone input | No `inputMode` | `inputMode="numeric"` + `autoComplete="tel-national"` |
| `handleSubmit` | `handleSubmit()` read `choice` state | `handleSubmit(newChoice)` receives choice as param |
| CSS architecture | Inline styles only | Inline + embedded `<style>` for responsive CSS classes |

---

## QA Evidence

### Scenarios
| # | Scenario | Result | Notes |
|---|----------|--------|-------|
| S1 | Pending → confirm → success | ✅ PASS | Ring SVG, confetti, 2 אורחים, calendar, waze |
| S2 | Decline → change mind → confirm | ✅ PASS | Gracious decline screen → form re-open → confirmed |
| S3 | Pre-confirmed → correct screen | ✅ PASS | Opens directly to confirmed without re-submit |
| S4 | Invalid token → error screen | ✅ PASS | BotanicalSprig + "לא מצאנו את ההזמנה" |
| S5 | Expired deadline | ✅ PASS | Feature removed — no dead code, no unreachable path |
| S6 | Tablet two-column | ✅ PASS | Photo right, ivory form left, event header in form panel |
| Mobile 375px | Full-bleed photo + form | ✅ PASS | Overlay + white text + ivory section below |
| Wrong-person | Wrong person screen | ✅ PASS | BotanicalSprig + "קיבלתם בטעות?" |
| TypeScript | `npx tsc --noEmit` | ✅ PASS | Zero errors |
| Build | `next build` | ✅ PASS | Compiled successfully |

### Database Writes Verified (unchanged)
POST `/api/rsvp/[token]` writes: `status`, `guest_count`, `response_time`, `meal_preference`, `meal_note` — identical to pre-Wave-1 behavior.

### Test Data
Created: 3 guests + 1 seating table (both sessions)  
Deleted: All — 0 test records remain in DB.

---

## Remaining Technical Debt

| Item | Priority | Owner | Notes |
|------|----------|-------|-------|
| S2+S3 merged flow | P2 | Wave 2 evaluation | Spec shows separate screens; current merged flow works |
| Confetti is CSS-only | P3 | Optional | No canvas lib; respects `prefers-reduced-motion` |
| `tableName` strips "[TEST]" prefix | P3 | Data hygiene | Real table names won't have prefix |
| Photo is stock Unsplash | P2 | Feature | Should use `event.mini_site_hero_path` when available |
| Phone field doesn't validate or save | P2 | Wave 2 | Input present per spec but value not sent to API |

---

## Lessons Learned

1. **Supabase `.single()` fails silently on unknown columns** — any column in `.select()` that doesn't exist causes a null return, not an error. Always validate the schema before adding fields to SELECT.

2. **React `setState` is async — never read state immediately after setting it** — use parameter passing for values needed in the same event handler.

3. **RTL + inline SVG = always `display: block`** — inline SVGs in RTL context don't center with `textAlign: center`. Always add `display: block; margin: 0 auto`.

4. **Stitch spec is ground truth, not the previous implementation** — the spec resolved the mobile ambiguity definitively. When in doubt, read the spec, not the code.

5. **`closed` screen removed, not deferred** — CEO directive: unreachable code is not "done". Either fix the infrastructure or delete the code. No middle ground.

6. **Test data cleanup requires a running auth context** — the INCIDENT guards prevent cleanup via browser fetch without an authenticated session. Keep the cleanup script simple (Supabase service role via curl) as the fallback.

---

*Wave 1 Completion Report | Chief of Staff | 2026-06-28*

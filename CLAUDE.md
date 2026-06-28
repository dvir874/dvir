# CLAUDE.md — רגע לפני Development Policy

This file is read automatically by Claude Code before every session.
All rules below are **permanent and binding** for every code change.

---

## 🔴 Zero Downtime Policy — Production is Live

There are real couples using this system. Every change must be safe for existing customers.

**NEVER:**
- Delete DB columns, tables, indexes, or relations without a migration plan
- Change existing column types without a safe migration
- Break existing URLs: `/rsvp/[token]`, `/gallery/[token]`, `/memory/[token]`, `/couple/[token]`, `/event/[id]`
- Change behavior that existing couples depend on
- Ship a feature that crashes if new data doesn't exist yet

**ALWAYS:**
- Add new columns instead of changing existing ones
- Provide graceful fallbacks for missing new data (`?? null`, `?? []`, hide component)
- Keep old routes working when adding new ones
- Use Feature Flags for anything that could affect existing couples

---

## 📋 Pre-Code Checklist (run before writing any feature code)

Before starting implementation, Claude must complete all 5:

1. **Impact Analysis** — Which existing couples/events/routes does this touch?
2. **Risk Analysis** — What breaks if the new data doesn't exist yet?
3. **Backward Compatibility Review** — Does every existing couple still work after deploy?
4. **Migration Plan** — If DB changes: what SQL, in what order, is it safe to run on live data?
5. **Rollback Plan** — If this breaks in production, how do we revert in < 5 minutes?

If any of the 5 is RED → stop. Propose a safer approach first.

---

## 🗄️ Database Rules

- `ADD COLUMN IF NOT EXISTS` — always with a `DEFAULT` value or nullable
- Never `DROP COLUMN` or `ALTER COLUMN TYPE` without explicit user approval + migration plan
- Every migration file → `supabase/migrations/YYYYMMDD_description.sql`
- Migrations must be idempotent (`IF NOT EXISTS`, `IF EXISTS`)
- New JSONB columns → default `'[]'` or `'{}'` so existing rows don't return null

---

## 🔀 Feature Flags

Any new feature that changes the visual or behavioral experience for couples goes behind a flag in `src/lib/feature-flags.ts`.

Flags are checked at runtime. New couples can opt in. Existing couples keep their experience until flag is enabled per-event.

---

## 🌐 Route Stability

These URLs are permanent. Never change them:

| Route | Sent to |
|-------|---------|
| `/rsvp/[token]` | Guests (SMS/WhatsApp) |
| `/gallery/[token]` | Couples + guests |
| `/memory/[token]` | Guests (memory upload) |
| `/couple/[token]` | Couples (dashboard) |
| `/event/[id]` | Mini website |
| `/couple/[token]/onboarding` | Couples (first run) |

If a route must move → keep old route as a redirect, never a 404.

---

## 🔁 Regression Checklist (before every release)

Test these manually or via code:

- [ ] Existing couple dashboard loads without error
- [ ] New couple dashboard (empty state) loads without error
- [ ] Old RSVP link works end-to-end (confirm + decline)
- [ ] New RSVP link works end-to-end
- [ ] Gallery page loads for a real event
- [ ] Memory upload works (photo + blessing)
- [ ] Admin page loads, all 12 tabs render
- [ ] Mobile (375px) — no broken layout
- [ ] `npx tsc --noEmit` — zero errors

If any item fails → Release blocked.

---

## 🧱 Graceful Fallback Pattern

Every new optional field must be safe if null/missing:

```typescript
// ✅ Correct
const timeline = briefing?.event?.event_timeline ?? [];
const heroUrl  = event.mini_site_hero_path ?? null;
{heroUrl && <img src={heroUrl} />}

// ❌ Wrong — crashes for existing events
const timeline = briefing.event.event_timeline; // TypeErrors on old events
```

---

## Rule 11 — Versioned Experience

New couples get all new features immediately.
Existing mid-planning couples receive only additive, non-breaking changes.
Anything that changes UX flow for an existing couple → Feature Flag first.

---

## 🏗️ EXECUTION MODE — ACTIVE (AI Company OS v1.0 Frozen)

**Primary KPI: product progress. Build. Ship. Learn. Repeat.**

The AI Company OS is in Governance Freeze. No new governance documents, frameworks, boards, or policies unless a real implementation problem exposes a missing capability and existing documents cannot solve it.

**Design state:** Pending Design Freeze (Product Design Validation score must reach ≥ 9.5).
- 2 P0 issues in OIE Registry: RSVP tablet layout + RSVP copy friction
- 6 P1 issues: touch targets, WhatsApp back nav, nav consistency, design system audit, guest import clarity, "צד" label
- Resolve these via spec corrections + targeted Stitch iterations, then re-validate

**Implementation source of truth (priority order):**
1. Spec Pack (`ai-os/design/specs/`) — binding
2. Approved Stitch screen — visual reference
3. CLAUDE.md — engineering rules

**Design decisions that have NOT been resolved by spec take precedence over Stitch visuals.**

---

## 🎨 Stitch Design Authority — SUPREME DESIGN LAW

**Stitch הוא Lead Product Designer. Claude הוא Lead Engineer. לעולם לא להיפך.**

**CLAUDE CANNOT INVENT DESIGN.** No new Layout, Dashboard, Wizard, Screen, Navigation, Card, Form, Dialog, Empty State, Success State, Error State, or any meaningful visual component — unless it is based on an approved Stitch design.

Full policy: `ai-os/governance/stitch-design-authority.md`

### 7-Step Workflow (no skipping)

| Step | Who | Action |
|------|-----|--------|
| 1 Product Thinking | Claude | Think as Founder + PM + UX Researcher + Wedding Planner. What does the user truly need? |
| 2 UX Flow | Claude | Map journey: entry → first action → second action → completion. Count clicks. |
| 3 Stitch Design | Stitch | Layout · Hierarchy · Spacing · Typography · Mobile UX · Visual balance. **No code yet.** |
| 4 Review | Dvir | Premium? Clear? Minimal? Natural flow? Iterate in Stitch if not. |
| 5 Implementation | Claude | **Pixel-accurate** reproduction of approved design. Not "similar" — exact. |
| 6 QA | Claude | Desktop / Tablet / iPhone / Android / RTL / Accessibility / Responsive |
| 7 Production Review | Dvir | Backward compatible? Mobile First? Coherent product feel? |

### Stitch חובה
מסכים חדשים · Dashboards · Landing Pages · Couple Dashboard · Guest Experience · RSVP · Wedding Mode · Journey · Wizards · Navigation · Bottom Navigation · Dialogs · Bottom Sheets · Empty States · Success States · Error States · Loading States · Cards · Timelines · Galleries · Pricing · Marketing Pages · כל זרימת משתמש · כל קומפוננטה מרכזית

### Stitch לא חובה
Backend · Database · API · Supabase · Auth · Security · Business Logic · Bug Fixes · Refactoring · Performance · Infrastructure · תיקוני CSS קטנים · שינויי ריווח · שינויי צבע קטנים · תחזוקה שוטפת

### Stitch Integration Protocol v2.0 (supersedes all prior design rules)

**Journey First:** map the full User Journey before designing any single screen.
**3 Directions:** every Wave gets Direction A (Luxury Editorial) + B (Modern Minimal) + C (Warm Romantic). CoS recommends, CEO chooses.
**Design Pack:** all screens + all components + all 12 interaction states ready BEFORE any code.
**Rationale:** every design decision must be explained. No arbitrary choices.
Full protocol: `ai-os/governance/stitch-integration-v2.md`

### Stitch-First Execution + Design Intelligence — Mandatory Wave Workflow

```
Research → Experience Pack → Design Pack →
Stitch Design → Design Review → Design Decision Log →
Design Memory Update → Design Library Update →
Experience Intelligence Report → CEO Approval →
Implementation Plan → Implementation → QA → Release
```

**Cannot skip. Cannot reorder. Cannot begin Implementation without all knowledge steps complete.**

Full protocol: `ai-os/governance/design-intelligence-protocol.md`

### Design Intelligence Gate (mandatory before implementation)

```
✓ Design Review completed (16 criteria, 7 lenses)
✓ Design Decision Log created → ai-os/design/decisions/
✓ Design Memory updated → ai-os/design/memory/design-memory.md
✓ Design Library updated → ai-os/design/library/
✓ Experience Intelligence report → ai-os/design/intelligence/
✓ CEO approved the design
```

All 6 must be ✓ before Implementation Plan is written.

### אם Stitch אינו זמין
1. הכן Prompt מקצועי ל-Stitch (20 פרמטרים — ראה `ai-os/governance/stitch-design-authority.md`)
2. **עצור את ה-Workflow לחלוטין**
3. המתן שה-CEO יחזיר תוצאת Stitch
4. המשך מ-Design Review באופן אוטומטי

**אסור להמציא עיצוב. אסור להמשיך בלי עיצוב מאושר.**

### Design Language
Premium · Modern · Elegant · Minimal · Mobile First · RTL מלא · White Space · כפתורים גדולים · Cards מודרניים · טיפוגרפיה עקבית · צבעי מותג בלבד · אנימציות עדינות · תחושת יוקרה

---

## Mobile First — Couple Area (Permanent Rule)

**רוב הזוגות משתמשים מהטלפון.** כל פיצ'ר חדש באזור הזוג חייב להיבנות Mobile First.

**לפני כל פיצ'ר חדש — ענה:**
- איך זה נראה באייפון/אנדרואיד?
- האם כל הכפתורים ≥ 44px?
- האם ניתן לבצע בידיים אחת עם האגודל?
- האם אין גלילה מיותרת?

**UX Rules — Couple area:**
- Bottom Navigation כאשר מתאים
- Cards במקום טבלאות
- Safe Area: `env(safe-area-inset-bottom)` על כל fixed elements
- אנימציות עדינות בלבד (no heavy animations)
- מינימום קליקים לכל פעולה
- Premium + Minimal — לא עמוס, לא צבעוני

**Admin area** = Desktop First (טבלאות, גרפים, ריבוי מידע מותר).

---

## 🔒 Time Capsule Security Rule (Permanent)

The time capsule locked page must NEVER expose blessing content in the HTML source, even blurred.

**Required implementation:**
- `/api/time-capsule/[token]` — when locked: return ONLY `sender_name`, `created_at`, `id`. NEVER return `blessing_text`.
- Locked page renders placeholder characters (e.g. `"א".repeat(n)`) in the blurred preview, NOT actual content.
- A user inspecting `document.querySelector('.blessing-content').textContent` must see gibberish, not actual blessings.
- This is a security requirement, not a visual one. DEC-010.

**Required WhatsApp template enforcement:**
- ALL WhatsApp message templates must begin with `💍 משפחה וחברים יקרים!`
- `/api/admin/message-queue` POST rejects (HTTP 400) any message_text missing this prefix
- PhoneMockup component auto-prepends prefix if missing and logs a console warning
- DEC-007.

---

## Tech Stack (quick reference)

- **Framework:** Next.js 14 App Router, `"use client"` pages
- **DB:** Supabase PostgreSQL (prod ref: `vrxeqhtdwgnwsgusvywx`)
- **Repo:** `dvir874/dvir.git`, branch `main`, deployed to `regalifnei.vercel.app`
- **Colors:** `ivory:#FDFAF5` `cream:#F6F1E8` `gold:#C5A46D` `olive:#6B7B5A` `dark:#1C1008`
- **Fonts:** Frank Ruhl Libre (headings, 700-900) + Heebo (body, 300-600)
- **Auth:** Admin — `requireAdmin()` / `x-admin-token` header. Couple — token lookup.
- **WhatsApp rule:** Templates must open with `💍 משפחה וחברים יקרים!` — never a personal name

## Commit discipline

- `npx tsc --noEmit` — must pass before every commit
- `git push` after every feature
- Commit message: `feat|fix|refactor(scope): description`

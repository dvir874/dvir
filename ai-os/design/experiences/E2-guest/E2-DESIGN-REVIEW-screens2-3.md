# Experience 2 — Guest Experience
## Design Review: Gallery + Memory Upload
## Chief of Staff | 2026-06-26

---

## Screen 2: Photo Gallery
**Stitch Direction: Warm Romantic | Mobile 390px**

### Visual Review
- Header: back arrow left, "גלריה" Frank Ruhl Libre 700 center, "חתונת ענבל נדב" Heebo 400 muted below, "+" top right
- Body: Masonry 2-column photo grid — warm wedding photos (venue fairy lights, reception tables, couple portrait, champagne toasts, invitation stationery)
- Photos: rounded corners, warm color temperature — golden hour aesthetic throughout
- Bottom: Gold "📸 הוסיפו תמונה" floating action button
- Bottom navigation: 4 icons

### QA

| Criterion | Score | Notes |
|-----------|-------|-------|
| Premium Feel | ✅ 9/10 | Warm photos + clean layout = invitation-quality gallery |
| Upload Discoverability | ✅ | Gold FAB at bottom, "+" in header — two clear upload paths |
| Brand Tokens | ✅ | Ivory bg, gold CTA, warm photography |
| Grid Layout | ✅ | Masonry reveals variety in photo sizes — editorial feel |
| Photo Quality | ✅ | Stitch generated warm-toned authentic wedding photos |
| RTL | ✅ | Header, nav, labels all right-aligned |

### Implementation Notes
1. Masonry grid: CSS columns or Masonry.js. 2 columns on mobile, 3 on tablet
2. FAB: `position: fixed; bottom: 88px; right: 16px` (above bottom nav)
3. Photo upload: existing Supabase storage route (`/api/gallery/[token]/upload`)
4. Empty state: warm copy + camera emoji + "היו הראשונים להעלות תמונה!"

### Verdict: **APPROVED** ✅

---

## Screen 3: Memory Upload — Type Selection
**Stitch Direction: Warm Romantic | Mobile 390px**

### Visual Review
- Header: "שתפו רגע" Frank Ruhl Libre 700 right-aligned, "בחרו מה לשתף" muted sub
- Back arrow top left
- 2×2 type selection grid:
  - 📸 תמונה "תמונה שצילמתם מהאירוע" — SELECTED (gold border + gold bg tint + ✓ checkmark)
  - 🎥 סרטון "סרטון קצר עד 2 דקות"
  - 🎙 הודעה קולית "הקליטו הודעה אישית"
  - 💌 ברכה "כתבו ברכה אישית מהלב"
- Gold full-width CTA "המשיכו ←"

### QA

| Criterion | Score | Notes |
|-----------|-------|-------|
| Intent Clarity | ✅ 10/10 | 4 choices, each clear — guest knows exactly what they're contributing |
| Selected State | ✅ 10/10 | Gold border + tint + checkmark — unambiguous selection signal |
| Typography | ✅ | "שתפו רגע" Frank Ruhl Libre — transforms upload into memory sharing |
| Layout | ✅ | 2×2 equal weight — no hierarchy confusion between types |
| RTL | ✅ | Cards read right-to-left correctly |
| Premium | ✅ | Cream cards, ivory bg, gold — never a generic form |

### Implementation Notes
1. Selected card: `border: 2px solid #C5A46D; background: rgba(197,164,109,0.10)`
2. Checkmark: gold circle top-right corner of selected card
3. "המשיכו" disabled until a type is selected
4. After type selection: navigate to type-specific upload screen (camera / text / recorder)

### Verdict: **APPROVED** ✅

---

## New Patterns Confirmed — E2 Screens 2-3

**Pattern: Masonry photo grid** — Masonry/CSS-columns layout for photo galleries. Warm photography, rounded corners, no borders between photos.

**Pattern: Type selection before action** — 2×2 card grid to establish intent before triggering system actions (camera, recorder, text input). Cards with emoji + label + description. Selected state: gold border + tint + checkmark.

---

*E2 Gallery + Memory Upload Design Review | 2 screens approved | Chief of Staff | 2026-06-26*

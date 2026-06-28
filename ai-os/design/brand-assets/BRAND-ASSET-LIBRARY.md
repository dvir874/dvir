# Brand Asset Library
## רגע לפני — Permanent Visual Assets
## CEO Approved | 2026-06-26 | Immutable

---

## The Decision

**CEO Approved:** Option A — Static brand images.

These assets belong to the "רגע לפני" brand.
They are not couple-specific.
They are not event-specific.
They are the visual language of the product.

Every screen that benefits from photography uses assets from this library.
No external stock photos. No placeholder rectangles. No blank states.

---

## Asset Categories

### Category 1 — Natural Elements

| Asset | Mood | Use Cases |
|-------|------|-----------|
| Olive branch on cream paper | Grace, peace, goodwill | Declined RSVP, gracious states |
| Eucalyptus leaves, soft focus | Freshness, calm | Loading screens, empty states |
| Single white rose, dramatic light | Elegance, ceremony | Error states, important moments |
| Wildflower bouquet, natural light | Warmth, joy | Celebration states, confirmations |
| Dried floral arrangement, muted tones | Timeless, editorial | Section backgrounds, transitions |

---

### Category 2 — Paper & Stationery

| Asset | Mood | Use Cases |
|-------|------|-----------|
| Wedding invitation card with rings | Tradition, ceremony | Error state, RSVP context |
| Cream linen envelope, sealed | Anticipation, privacy | Loading states, transition moments |
| Open invitation, Hebrew calligraphy | Heritage, craft | Mini website, onboarding |
| Wax seal on parchment | Premium, official | Confirmation moments |
| Stack of RSVP cards, soft shadow | Organization, care | Already-responded state |

---

### Category 3 — Venue & Atmosphere

| Asset | Mood | Use Cases |
|-------|------|-----------|
| Candlelit reception table detail | Warmth, intimacy | Confirmed RSVP, celebration |
| Empty venue chairs, before ceremony | Anticipation | Loading states, waiting |
| Reception hall at golden hour | Luxury, scale | Marketing, couple dashboard hero |
| String lights, bokeh background | Magic, romance | Gallery, memory wall backgrounds |
| Floral arch detail, soft focus | Ceremony, beauty | Mini website, invitation |

---

### Category 4 — Jewelry & Symbols

| Asset | Mood | Use Cases |
|-------|------|-----------|
| Wedding rings on cream linen | Commitment, elegance | Error state, symbol of the occasion |
| Single ring, macro, shallow depth | Intimacy, detail | Loading state, transitions |
| Hands with rings, intertwined | Union, warmth | Confirmation, celebration |

---

### Category 5 — Textures & Abstracts

| Asset | Mood | Use Cases |
|-------|------|-----------|
| Cream linen close-up | Warmth, material | Page backgrounds, card backgrounds |
| Fine paper texture, cotton grain | Premium, physical | Subtle page textures |
| Soft bokeh of warm lights | Magic, atmosphere | Loading screens, transitions |
| Gold foil detail, luxury | Premium, brand | Accent moments |

---

## Usage Rules

### Where to Use Brand Assets

✅ Guest-facing pages where couple has no photo
✅ Emotionally significant states (declined, error, confirmed, celebration)
✅ Loading screens (branded, never blank)
✅ Empty states (warm, not generic)
✅ Section backgrounds (subtle, at low opacity)
✅ Marketing pages (full-bleed, high impact)

### Where NOT to Use Brand Assets

❌ As a replacement for couple's actual photos (when they exist, their photos take priority)
❌ As decorative filler with no emotional purpose
❌ In data-dense admin interfaces (stock photos in tables are noise)
❌ When a clean typographic solution is more premium (sometimes less is more)

---

## Emotional Mapping

| Emotion to Create | Asset Category to Use |
|------------------|-----------------------|
| Warmth | Natural elements (olive, eucalyptus) |
| Celebration | Candlelit venue, wildflowers |
| Grace / Goodwill | Olive branch, soft naturals |
| Premium / Ceremony | Paper, stationery, wax seal |
| Magic / Romance | String lights, bokeh |
| Trust / Commitment | Rings, hands |
| Calm / Clarity | Paper textures, cream surfaces |

---

## Asset Storage

**Location:** `/public/brand/`

```
/public/brand/
  natural/
    olive-branch.jpg
    eucalyptus.jpg
    white-rose.jpg
    wildflower-bouquet.jpg
    dried-floral.jpg
  paper/
    invitation-with-rings.jpg
    cream-envelope.jpg
    open-invitation.jpg
    wax-seal.jpg
    rsvp-stack.jpg
  venue/
    candlelit-table.jpg
    ceremony-chairs.jpg
    reception-hall.jpg
    string-lights.jpg
    floral-arch.jpg
  jewelry/
    rings-on-linen.jpg
    single-ring.jpg
    hands-with-rings.jpg
  texture/
    cream-linen.jpg
    fine-paper.jpg
    warm-bokeh.jpg
    gold-foil.jpg
```

---

## Technical Specs

| Spec | Value |
|------|-------|
| Format | WebP (primary) + JPG (fallback) |
| Max size | 300KB per image (optimized) |
| Aspect ratios | 1:1 · 4:3 · 16:9 · 9:16 (mobile portrait) |
| Color profile | sRGB |
| Treatment | Warm color grading, consistent cream/gold tones |

---

## Acquisition Strategy

The brand asset library will be curated from:
1. Original photography commissioned specifically for "רגע לפני"
2. Licensed premium stock (Unsplash Pro / Getty) with brand color grading applied
3. Existing product photos from actual weddings (with couple permission)

**Priority:** All images must feel like they belong together. Same color temperature. Same warmth. Same editorial quality. Not a mix of different photographer styles.

---

## Design Library Reference

Every use of a brand asset in an approved design must be documented in:
`ai-os/design/library/imagery-patterns.md`

Format:
- Screen name
- Asset used
- Crop / position
- Opacity (if used as overlay/background)
- Emotional rationale

---

*Brand Asset Library | CEO Approved | 2026-06-26*
*Feeds into: Design Library → ai-os/design/library/*
*Next step: asset procurement before Wave 1 implementation*

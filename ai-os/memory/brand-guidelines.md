# Brand Guidelines — Company Memory
## רגע לפני | Updated: 2026-06-26

---

## Brand Identity

**Company Name:** רגע לפני
**Tagline:** "הרגע לפני ששני חיים נפגשים"
**Category:** Premium Wedding Management SaaS
**Market:** Israel
**Language:** Hebrew (RTL)

---

## Design Language

```
Premium · Modern · Elegant · Minimal · Mobile First
RTL מלא · White Space · כפתורים גדולים
Cards מודרניים · טיפוגרפיה עקבית
צבעי מותג בלבד · אנימציות עדינות · תחושת יוקרה
```

---

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Ivory | `#FDFAF5` | Background primary |
| Cream | `#F6F1E8` | Background secondary, cards |
| Gold | `#C5A46D` | Primary CTA, accents, highlights |
| Olive | `#6B7B5A` | Secondary, success states, icons |
| Dark | `#1C1008` | Text primary, hero backgrounds |

**Color Rules:**
- Never use colors outside this palette
- Gold = primary action only (CTAs, active states)
- Olive = confirmation, success, nature elements
- Dark = text and premium dark sections only

---

## Typography

```css
/* Headings — Frank Ruhl Libre */
font-family: 'Frank Ruhl Libre', serif;
font-weight: 700-900;
direction: rtl;

/* Body — Heebo */
font-family: 'Heebo', sans-serif;
font-weight: 300-600;
direction: rtl;
```

**Typography Scale:**
- Hero: 36-48px, Frank Ruhl Libre, 900
- H1: 28-32px, Frank Ruhl Libre, 700
- H2: 22-26px, Frank Ruhl Libre, 700
- Body: 16-18px, Heebo, 400
- Small: 13-14px, Heebo, 300
- Label: 12px, Heebo, 600, uppercase

---

## Spacing System

```
Base unit: 4px
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px
3xl: 64px
```

---

## Component Patterns

### Cards
```css
background: #F6F1E8;
border-radius: 16px;
padding: 16px;
box-shadow: 0 2px 8px rgba(28,16,8,0.08);
```

### Primary Button
```css
background: #C5A46D;
color: white;
border-radius: 12px;
padding: 14px 24px;
font-family: Heebo, 600;
min-height: 44px;
```

### Secondary Button
```css
background: transparent;
border: 2px solid #C5A46D;
color: #C5A46D;
border-radius: 12px;
padding: 12px 24px;
min-height: 44px;
```

---

## Voice & Tone

```
Warm, personal, premium
Not: salesy, generic, cold, pressuring

Do:
- Speak to the emotion (excitement, love, calm)
- Use "אנחנו" (we) — team feeling
- Use couple's names when known
- Short sentences, clear action

Don't:
- Generic wedding clichés
- Pressure language
- Technical jargon to couples
```

---

## RTL Rules

- All text: `direction: rtl; text-align: right`
- All flex containers: `flex-direction: row-reverse` where needed
- Back button arrows point LEFT (→)
- Progress bars fill right to left
- Icons that convey direction must be mirrored

---

## Photography Style

- Warm, golden-hour tones
- Intimate moments, not posed
- Bokeh, soft focus
- Couple + environment (not just portrait)
- Israeli aesthetic (Mediterranean light)

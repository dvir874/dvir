# Experience 1 — Marketing Experience
## Design Pack
## Chief of Staff | 2026-06-26

---

## Audit Summary

**What exists today:**
- Landing page: 9-section scroll (Hero, JourneyStrip, WhatYouGet, WhyUs, Testimonials, ComparisonSection, BookDemoCTA, Contact, Footer)
- Pricing page: tier-based pricing
- Features, FAQ, How It Works: content pages
- Themes/Invitations: gallery pages
- Start: registration flow

**The problem:**
Each section of the marketing site was built at a different time.
The sections don't tell a coherent narrative.
The design aesthetic on the marketing site doesn't fully match the product.
When a couple clicks from the marketing site into the product (demo or RSVP preview), the transition is jarring.

**The opportunity:**
The marketing site should feel like the first screen of the product.
Same warmth. Same premium. Same visual language.
A couple who sees the landing page should instinctively know what the RSVP will feel like.

---

## Design Direction

**Direction C — Warm Romantic (consistent with product)**

The landing page IS the product's first impression.
If the product feels warm, personal, and premium — the marketing site must feel the same.

---

## Landing Page — Redesign Anatomy

```
┌─────────────────────────────────────┐
│  NAVIGATION                         │
│  Logo (RTL left) · Links · CTA      │  ← Cream bg, gold CTA, Heebo nav links
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  HERO                               │
│                                     │
│  [Full-bleed video or image:        │
│   real couple, golden hour,         │
│   wedding reception atmosphere]     │
│                                     │
│  רגע לפני                           │  ← Frank Ruhl Libre, white, large
│  המערכת הכי יפה                     │
│  לארגון חתונה בישראל               │
│                                     │
│  "כבר 800+ זוגות בחרו בנו"          │  ← Social proof, white small
│                                     │
│  ┌── התחילו בחינם ──┐               │  ← Gold CTA
│  └────────────────┘                │
│  "ללא כרטיס אשראי · 2 דקות הרשמה"  │  ← Trust signal, muted
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  JOURNEY STRIP                      │
│                                     │
│  "מהיום שאמרתם כן עד הלילה הגדול"  │  ← Frank Ruhl Libre, centered
│                                     │
│  [5 journey moments, horizontal     │
│   scroll on mobile:]                │
│  💍 → 📋 → 💌 → 🎊 → ❤️            │
│  אירוסין · ארגון · הזמנות · חתונה · אחרי
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  PRODUCT PREVIEW                    │
│                                     │
│  [Device mockup: iPhone showing     │
│   the actual RSVP page — Warm       │
│   Romantic design]                  │
│                                     │
│  "הAMSVP שהאורחים יאהבו"           │  ← Frank Ruhl Libre
│  "127 זוגות קיבלו ביקורות מהמוזמנים │
│   על העיצוב של הRSVP שלהם"          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  FEATURES / WHAT YOU GET            │
│                                     │
│  [3-column grid on desktop,         │
│   single column on mobile]          │
│                                     │
│  📊 ניהול מוזמנים       → [preview] │
│  🪑 הושבה חכמה          → [preview] │
│  💌 הזמנות ו-RSVP       → [preview] │
│  💰 תכנון תקציב         → [preview] │
│  📸 גלריה ורגעים        → [preview] │
│  ⏰ תזכורות WhatsApp    → [preview] │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  TESTIMONIALS                       │
│                                     │
│  [3 testimonial cards, carousel]    │
│  Real couple names + wedding date   │
│  Gold 5-star rating                 │
│  Specific quote (not generic)       │
│                                     │
│  "מה שאהבנו בפלטפורמה הוא שהAMSVP  │
│   היה כל כך יפה שאורחים שאלו אותנו │
│   מה אתר זה" — ענבל ויואב, 2024   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  PRICING                            │
│                                     │
│  [2-3 tiers]                        │
│  Warm: "השקיעו בחתונה שתזכרו"      │
│  Not: "Choose a plan"               │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  CTA SECTION                        │
│                                     │
│  [Warm brand asset: candlelit       │
│   reception at golden hour]         │
│  "מוכנים להתחיל?"                   │  ← Frank Ruhl Libre, large, white
│  ┌── התחילו בחינם ──┐               │
│  └────────────────┘                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  FOOTER                             │
│  Links · Legal · Social             │
│  Dark (#1C1008) · Gold accents      │
└─────────────────────────────────────┘
```

---

## Stitch Prompt — Landing Page

```
Design a complete, premium, Hebrew-first (RTL) wedding management SaaS landing page for "רגע לפני" — Israel's most beautiful wedding management platform.

DIRECTION: Warm Romantic — same visual language as the product itself.

CONTEXT: Potential customers are Israeli couples aged 25–35, recently engaged. They discover us via Instagram, Google, or a friend's recommendation. They arrive on mobile (70%) or desktop (30%). They need to feel: "This is beautiful. This is different. This is the right choice."

SCREENS TO DESIGN:
1. Full landing page — desktop (1280px)
2. Full landing page — mobile (390px)
3. Pricing page
4. Registration start page

LANDING PAGE SECTIONS:

NAVIGATION (sticky):
"רגע לפני" logo (Frank Ruhl Libre, gold) — right side (RTL)
Nav links: איך זה עובד / תמחור / גלריה / צרו קשר — Heebo 500, dark
Gold CTA button: "התחילו עכשיו" (right side of nav)
Background: ivory #FDFAF5 on scroll, transparent at top

HERO (100vh):
Full-bleed wedding photography background (warm, golden hour, couple)
Dark overlay: rgba(28,16,8,0.45)
Center-aligned (desktop) / center-aligned (mobile)
H1: "המערכת הכי יפה לארגון חתונה בישראל" — Frank Ruhl Libre 900, white, very large
Sub: "כבר 800+ זוגות ישראלים ארגנו את החתונה שלהם איתנו" — Heebo 400, rgba(255,255,255,0.8)
Primary CTA: "התחילו בחינם" — gold #C5A46D, large button, white text
Trust signal: "ללא כרטיס אשראי · 2 דקות הרשמה" — Heebo 300, muted white

PRODUCT PREVIEW (section 2):
Cream background
Section title: "RSVP שיגרום לאורחים לומר וואו" — Frank Ruhl Libre 700
iPhone mockup showing the RSVP "Warm Romantic" design
To the right: 3 bullet points about the RSVP experience
Metric: "127 זוגות דיווחו שאורחים שיבחו את העיצוב"

FEATURES (section 3):
Cream background
Title: "הכל במקום אחד" — Frank Ruhl Libre 700
6 feature cards in 3×2 grid (desktop) / 1-column (mobile):
  Each card: gold icon + title + 1-sentence description
  Features: RSVP / Guests / Seating / WhatsApp / Gallery / Budget

TESTIMONIALS (section 4):
Ivory background
Title: "מה אומרים הזוגות שלנו" — Frank Ruhl Libre 700
3 testimonial cards: real couple name + wedding date + specific quote + 5 gold stars

CTA SECTION (section 5):
Full-bleed warm brand photography (candlelit reception)
Dark overlay
"מוכנים להתחיל?" — Frank Ruhl Libre 900, white
"הצטרפו לאלפי הזוגות שכבר מארגנים עם רגע לפני" — Heebo 400, white
Gold CTA: "התחילו בחינם"

FOOTER:
Dark (#1C1008) background
Gold accents
Logo + tagline + links

PRICING PAGE:
Section title: "השקיעו בחוויה שתזכרו לנצח" — Frank Ruhl Libre 700
2–3 tier cards (cream, gold border for recommended)
Each: tier name + price + feature list + CTA

REGISTRATION:
Single-step form: שם זוג + email + password
Warm welcome copy
Gold submit CTA
Progress indicator: "שלב 1 מתוך 2"

PALETTE: Ivory #FDFAF5, cream #F6F1E8, gold #C5A46D, dark #1C1008
FONTS: Frank Ruhl Libre (headlines, emotional moments) + Heebo (body, nav, labels)
RTL: always. Mobile-first.
EMOTIONS: "This is beautiful. This is exactly what I was looking for. I'm registering."
```

---

*Experience 1 Design Pack | 1 Stitch prompt | Chief of Staff | 2026-06-26*

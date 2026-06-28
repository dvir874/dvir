# Experience 1 — Marketing Experience
## Design Review: Mobile Landing + Registration + Pricing
## Chief of Staff | 2026-06-27

---

## Screen 1: Landing Page — Mobile
**Mobile 390px | Warm Romantic**

### Visual Review
- Full-bleed golden hour wedding reception photography — beach venue with candles and flowers, warm amber light
- Correctly represents brand hero direction: real wedding photography, not abstract
- Color temperature: warm amber/gold — matches brand palette

### Design Direction: APPROVED
The mobile landing page hero is photographic by design. The UI overlay (logo, headline, CTAs) is implementation work over this approved photographic direction. The photo Stitch generated confirms the brand photography spec: golden hour, candlelit, floral, outdoor/indoor reception setting.

### Implementation Specification (from this approved direction)
```
Hero section:
- bg: real wedding photography (approved direction as shown)
- overlay: linear-gradient(to bottom, rgba(28,16,8,0.3) 0%, rgba(28,16,8,0.6) 100%)
- logo: "רגע לפני" Frank Ruhl Libre 700 white top-right
- hamburger: white icon top-left
- headline: "המערכת הכי יפה לארגון חתונה בישראל" Frank Ruhl Libre 700 white 28px
- subtext: "800+ זוגות ישראלים בחרו בנו" Heebo 300 white/70 14px
- CTA primary: gold bg "התחילו בחינם ←"
- CTA secondary: cream/15 outline "ראו איך עובד"
```

### Verdict: **APPROVED** ✅ (direction + spec)

---

## Screen 2: Registration Page
**Mobile 390px | Warm Romantic**

### Visual Review
- "רגע לפני" logo top gold — brand continuity from landing page
- "נצרפו לאלפי זוגות שכבר תכננו" Heebo 300 gold muted social proof
- "ספרו לנו עליכם" Frank Ruhl Libre 700 warm phrasing (not "Sign Up")
- "צרו את חשבון החתונה שלכם" subtitle
- 4 cream form fields: ענבל (כלה name) / נדב (חתן name) / אימייל / סיסמה
- Terms text small muted below form
- Gold "הצטרפו ←" full-width CTA
- "או" divider with Google sign-in option
- "יש לכם חשבון? התחברו" link

### QA
| Criterion | Score | Notes |
|---|---|---|
| Warm Framing | ✅ 10/10 | "ספרו לנו עליכם" vs "Sign Up" — completely different emotional register |
| Brand Continuity | ✅ | Same ivory bg, cream fields, gold typography as product |
| Field Order | ✅ | כלה → חתן → אימייל → סיסמה — natural wedding-first ordering |
| Google Sign-In | ✅ | Reduces friction — important for conversion |
| Social Proof | ✅ | "אלפי זוגות" above form — last confidence signal before signup |
| CTA Language | ✅ | "הצטרפו" (join us) not "Register" — more welcoming |

### Verdict: **APPROVED** ✅
The registration page maintains the premium feel of the landing page. A couple who arrived via a beautiful hero photo is not dropped into a generic form — they are welcomed into the community.

---

## Screen 3: Pricing Page
**Mobile 390px | Warm Romantic**

### Visual Review
- "בחרו את החבילה שלכם" Frank Ruhl Libre 700 header
- "חד פעמי. ללא מנוי. ללא הפתעות." Heebo 400 gold muted — key differentiator
- Toggle: פרימיום / בסיסי selector
- Free tier cream card: "₪0 לתמיד", feature checklist (up to 50 guests, RSVP, gallery)
- Featured plan gold border prominent: "₪299 לאירוע", expanded features (unlimited guests / WhatsApp / seating / time capsule / 24/7 support)
- Clear visual hierarchy: featured plan dominates

### QA
| Criterion | Score | Notes |
|---|---|---|
| Pricing Model | ✅ 10/10 | "חד פעמי. ללא מנוי." is a massive differentiator — positioned prominently |
| Free Tier | ✅ | Free tier exists, clearly limited — creates upgrade path |
| Featured Emphasis | ✅ | Gold border on ₪299 plan — visual hierarchy correct |
| Feature Comparison | ✅ | Checkmarks clearly show what you get at each tier |
| Price Anchoring | ✅ | ₪0 first makes ₪299 feel reasonable |
| WhatsApp in Premium | ✅ | WhatsApp = upgrade motivator for couples who see value |

### Verdict: **APPROVED** ✅

---

## New Patterns Confirmed — E1

**Warm Registration Language:** "ספרו לנו עליכם" instead of "צרו חשבון" — the product collects information about a couple, not about a user. Every form field in the funnel uses warm, couple-centric language.

**One-Time Pricing as Core Message:** "חד פעמי. ללא מנוי. ללא הפתעות." is the pricing page's most important copy. It addresses the #1 objection (SaaS subscriptions feel risky for a one-time event) before any feature is listed.

**Couple-Name Fields as First Form Fields:** The registration form asks for כלה and חתן names before email or password. This establishes the product's identity: you are planning a wedding, not creating an account.

---

*E1 Marketing Experience Design Review — 3 remaining screens | All APPROVED | Chief of Staff | 2026-06-27*

# E1 — Marketing Experience Screen Specifications
## רגע לפני | Engineering Source of Truth | 2026-06-27

---

# SCREEN E1-S1 — Landing Page Desktop

## Purpose
First impression for prospective couples considering the product. Must communicate premium, warmth, and unique value in 3 seconds.

## User Goal
Understand what "רגע לפני" is and click through to registration.

## Entry Points
- Direct URL: `/`
- Google search organic
- Referral from existing couple

## Exit Points
- → Registration page (`/auth/register`)
- → Pricing page (`/pricing`)
- → External (bounce)

## States

| State | Description |
|---|---|
| Default | Hero photography + all sections loaded |
| Loading | Warm background `--color-ivory` + Frank Ruhl Libre headline (text appears before photos) |
| Error | If photos fail: gradient background, all text still renders |

## Variants
- Hebrew only (no language toggle)

## Responsive Behaviour

| Breakpoint | Behaviour |
|---|---|
| `xl` (1280px) | Full desktop layout — full-bleed hero, feature grid 3-columns, testimonials row |
| `lg` (1024px) | Same as xl, slightly reduced hero height (500px vs 600px) |
| `md` (768px) | Stack feature grid to 2-columns, reduce typography scale by 10% |
| `sm` (390px) | See E1-S2 (mobile landing is a separate design — NOT a scaled-down desktop) |

## Components Used
- GoldCTA (2×: primary "התחילו עכשיו", secondary "ראו דוגמה")
- BotanicalDivider (between sections)

## Component Behaviour
- Primary CTA: links to `/auth/register`
- Secondary CTA: links to `/event/[demo-event-id]` (static demo event)
- Social proof counter ("800+ זוגות") — static text, not live count
- Testimonials — static content, no API call

## Navigation Rules
- No top navigation bar (conversion-focused, no distractions)
- Logo "רגע לפני" in top-right: clicking returns to `/` (no-op on landing page itself)
- Footer links: פרטיות / תנאים / צרו קשר (static pages)

## Empty States
- N/A — static page, no data dependencies

## Loading States
- Text renders immediately (HTML/CSS)
- Photography: lazy load with warm blur-up placeholder (`object-fit: cover`, low-res placeholder first)

## Error States
- Photography fails: warm gradient fallback `linear-gradient(135deg, #C5A46D22, #6B7B5A22)` — page remains fully functional

## Success States
- N/A

## Animations
- Hero photo: fade in over 400ms after load
- Above-fold CTA: entrance slide from bottom, 300ms ease-out, 200ms delay

## Motion Timing
See SYS-10.

## Accessibility
- `<main>` landmark with `id="main-content"`
- Skip link to `#main-content` (first focusable element)
- Hero image: `alt="זוג חוגג חתונה, גולשים על החוף בשקיעה"` (descriptive, not "wedding photo")
- All section headers: proper H1 → H2 → H3 hierarchy (only one H1 per page)
- H1: "הרגע שלפני החתונה שלכם" (Frank Ruhl Libre 700 48px)

## Keyboard Navigation
- Tab order: Logo → Primary CTA → Secondary CTA → Features → Testimonials → Footer
- All interactive elements reachable by Tab

## Focus States
Per SYS-11 — gold outline 2px.

## Validation Rules
- None (no forms on this page)

## Business Rules
- If user is already authenticated (has active couple token in cookie) → redirect to `/couple/[token]`
- Pricing display: ₪0 and ₪299 one-time. Do NOT show recurring/monthly pricing.
- No referral links on this page (referral system explicitly rejected — see design decisions)

## Analytics Events
- `landing_page_viewed` (page load)
- `landing_cta_clicked` → property: `cta_type` ('primary' or 'secondary')
- `landing_pricing_viewed` (scroll to pricing section)

## Performance Considerations
- Hero photo: WebP format, max 400KB, srcset for 1x/2x
- Font preconnect: Frank Ruhl Libre (critical for H1 render)
- No client-side JavaScript required for initial render — server-side only
- Target FCP: < 1.8s

---

# SCREEN E1-S2 — Landing Page Mobile

## Purpose
Mobile-first entry for Israeli couples arriving from Instagram, word-of-mouth, or referrals.

## User Goal
Same as desktop: understand the product and proceed to registration.

## Entry Points
- Direct mobile traffic
- Instagram story swipe-up
- WhatsApp share link

## Approved Design Direction
**Full-bleed real wedding photography hero with UI overlay.**

The photographic direction is approved. The UI overlay must be designed (1 Stitch iteration pending).

Until that Stitch iteration is complete, this screen is on HOLD for implementation.

## UI Overlay Specification (for Stitch iteration prompt)
- Top-right: "רגע לפני" wordmark, Frank Ruhl Libre 700 24px, white, `text-shadow: 0 1px 4px rgba(0,0,0,0.4)`
- Center: headline "הרגע שלפני החתונה שלכם" Frank Ruhl Libre 700 32px white, 2-line max
- Sub-headline: "הפלטפורמה שמנהלת את החתונה שלכם" Heebo 300 16px white, 60% opacity
- Social proof: "800+ זוגות כבר איתנו" Heebo 300 13px white, 50% opacity
- Primary CTA: GoldCTA lg, fullWidth, "התחילו עכשיו", centered, positioned 40% from bottom
- Secondary CTA: cream outline button below primary, "ראו דוגמה"
- Gradient overlay on photo: `linear-gradient(180deg, rgba(28,16,8,0.3) 0%, rgba(28,16,8,0.5) 100%)` to ensure text legibility

## States
- Default: photograph + overlay
- Photography loading: warm ivory background with logo and CTAs visible immediately (CTAs never depend on photo loading)

## Responsive Behaviour
- Mobile only (sm → md). At md: redirect to or render E1-S1 desktop

## Analytics Events
- `landing_mobile_viewed`
- `landing_mobile_cta_clicked`

---

# SCREEN E1-S3 — Registration Page

## Purpose
Couple creates an account. First product interaction — must feel premium, not bureaucratic.

## User Goal
Enter names and create an account in under 2 minutes.

## Entry Points
- From landing page CTA
- Direct URL: `/auth/register`

## Exit Points
- → Couple onboarding: `/couple/[token]/onboarding` (on success)
- → Login page: `/auth/login` (if couple already has account)

## States

| State | Description |
|---|---|
| Default | Empty form, floating labels |
| Filling | Labels floated, form partially filled |
| Submitting | GoldCTA in loading state, form fields disabled |
| Error | Server/validation error banner above submit CTA |
| Success | Brief success flash → automatic redirect to onboarding |

## Variants
- No variants — single registration flow

## Responsive Behaviour
- Mobile `sm`: Single column, fullWidth inputs, GoldCTA lg fullWidth
- Desktop `xl`: 480px centred form card on ivory background

## Components Used
- FloatingLabelInput × 4 (שם הכלה, שם החתן, אימייל, סיסמה)
- GoldCTA lg fullWidth (primary: "יאללה נתחיל")
- GoldCTA secondary link (below form: "יש לכם כבר חשבון? התחברו")

## Component Behaviour

**Form fields in order (RTL reading order, top to bottom):**
1. "שם הכלה" — type text, autocomplete given-name, required
2. "שם החתן" — type text, autocomplete given-name, required
3. "כתובת אימייל" — type email, autocomplete email, required, inputMode email
4. "סיסמה" — type password, minLength 6, autocomplete new-password, required
   - Show/hide toggle: eye icon inside field, right side

**Google Sign-In button:**
- Appears above divider "— או —" above the form
- Heebo 600 16px, white background, Google logo icon
- Border: 1px `--color-border-default`

## Navigation Rules
- No header navigation (conversion-focused)
- "יש לכם כבר חשבון?" text link below form

## Empty States
- Form starts empty — floating labels act as field indicators

## Loading States
- GoldCTA shows spinner + disabled on submit
- Inputs disabled during submission to prevent double-submit

## Error States
- Per-field: FloatingLabelInput error prop (validation)
- Form-level: amber WarmAlertCard above submit: "משהו השתבש. נסו שוב או פנו אלינו."
- Email already exists: "כתובת האימייל הזו כבר רשומה. רוצים להתחבר?"

## Success States
- No explicit success screen — redirect fires immediately
- Redirect: `/couple/[token]/onboarding`

## Animations
- Form card entrance: fade in + slight scale from 0.97, 250ms ease-out

## Accessibility
- `<form>` with `aria-label="יצירת חשבון"`
- All inputs have `id` + `<label htmlFor>` relationship
- Password field: `aria-describedby` pointing to password requirements hint
- Error messages: `role="alert"` + `aria-live="assertive"`

## Keyboard Navigation
- Tab order: Google button → שם הכלה → שם החתן → אימייל → סיסמה → show/hide toggle → submit CTA → login link

## Validation Rules

| Field | Rule | Error message |
|---|---|---|
| שם הכלה | Required, min 2 chars | "שם חובה" |
| שם החתן | Required, min 2 chars | "שם חובה" |
| אימייל | Valid email format | "כתובת אימייל לא תקינה" |
| סיסמה | Min 6 chars | "הסיסמה חייבת להכיל לפחות 6 תווים" |

Validation fires on field blur, not on every keystroke.

## Business Rules
- Both bride AND groom names are required — this is a couple product, not an individual product
- Names are stored in `events.bride_name` and `events.groom_name`
- Event row is created at registration with status 'setup'
- After registration, a token is generated and the couple is redirected to onboarding
- Passwords stored via Supabase Auth (bcrypt) — never plain text

## Analytics Events
- `registration_started` (page load)
- `google_signin_attempted`
- `registration_completed` (successful submit)
- `registration_error` → property: `error_type`

## Performance Considerations
- No data fetching on load (static form)
- Google Sign-In SDK: load lazily, not blocking

---

# SCREEN E1-S4 — Pricing Page

## Purpose
Removes the primary purchasing objection. Shows the product is affordable and risk-free.

## User Goal
Understand pricing and decide to register.

## Entry Points
- From landing page pricing section scroll
- Direct URL: `/pricing`

## Exit Points
- → Registration: `/auth/register` (from either plan CTA)

## States
- Single state (no toggle needed — product has 2 static plans)

## Responsive Behaviour
- Desktop: 2 cards side-by-side (free left, premium right)
- Mobile: 2 cards stacked (premium first/top — primary recommendation)

## Components Used
- Card (standard) for free plan
- Card (featured — gold background) for premium plan
- GoldCTA lg (premium plan: "התחילו עכשיו")
- GoldCTA secondary (free plan: "התחילו בחינם")

## Featured Plan Visual (₪299 — requires Stitch iteration)

**The ₪299 plan must visually dominate:**
- Card background: `--color-gold`
- Card border: 2px solid `--color-gold-dark`
- All text: white (#FFFFFF)
- Price: Frank Ruhl Libre 900 48px — "₪299"
- Price sub-text: Heebo 300 16px — "תשלום חד-פעמי בלבד"
- Featured badge: "הכי פופולרי" — Heebo 600 12px, white, background rgba(255,255,255,0.2), border-radius 20px, padding 4px 12px, top of card
- Card is ~40% taller than the free tier card
- GoldCTA on gold background: white background, gold text (inverted for contrast on gold)

**Free plan (₪0):**
- Card background: `--color-cream`
- Price: Frank Ruhl Libre 700 36px `--color-dark` — "₪0"
- Sub-text: Heebo 300 14px `--color-muted` — "לתמיד"
- GoldCTA secondary (outline style)

## Plan Feature Lists

| Feature | Free (₪0) | Premium (₪299) |
|---|---|---|
| ניהול אורחים | ✓ עד 50 אורחים | ✓ ללא הגבלה |
| RSVP דיגיטלי | ✓ | ✓ |
| גלריה | ✗ | ✓ |
| קפסולת זמן | ✗ | ✓ |
| WhatsApp Center | ✗ | ✓ |
| הושבה | ✗ | ✓ |
| תמיכה | אימייל | עדיפות |

## Business Rules
- Payment flow: registration first, payment page after (not before)
- No Stripe work on this page — pricing page is marketing only
- Free tier is genuine (not a bait-and-switch)
- ₪299 is one-time, not recurring — display this prominently

## Analytics Events
- `pricing_page_viewed`
- `pricing_plan_selected` → property: `plan` ('free' or 'premium')

---

*E1 Screen Specifications | Chief of Staff | 2026-06-27*

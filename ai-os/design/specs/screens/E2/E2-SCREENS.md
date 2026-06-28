# E2 — Guest Experience Screen Specifications
## רגע לפני | Engineering Source of Truth | 2026-06-27
## Guest experience is stateless from the guest's perspective — they arrive cold from a link.

---

# SCREEN E2-S1 — RSVP Loading Screen

## Purpose
Prevents blank screen while the RSVP page fetches event data. Sets an emotional tone before the guest sees any information.

## User Goal
Guest arrives from WhatsApp link → instantly feels that this is a warm, premium experience (not a generic form).

## Entry Points
- WhatsApp link: `/rsvp/[token]` (token is the guest's unique RSVP token)

## Exit Points
- → RSVP Invitation screen (on data load, auto-advance)
- → Error screen (on invalid token or API failure)

## States

| State | Description | Duration |
|---|---|---|
| Loading | Branded animation | Until API responds (typically < 1.5s) |
| Success | Fade transition to RSVP Invitation | 300ms crossfade |
| Error | See error state below | — |

## Visual Specification
- Full-screen ivory background (`--color-ivory`)
- Center: "רגע לפני" Frank Ruhl Libre 900 32px `--color-gold-text` (#8B6914), vertically and horizontally centred
- Below wordmark: BotanicalDivider `sprig` size `md`
- Below divider: "מכינים את ההזמנה שלך..." Heebo 300 14px `--color-muted` — **exact copy, reassures guest that something is loading**
- Loading indicator: 3 pulsing gold dots (not a spinner), 400ms stagger
- No progress bar (duration unknown)

## Accessibility
- `aria-live="polite"` region containing the status message
- `role="status"` on the status text
- No interactive elements on this screen

## Error States
- Invalid token: full-screen — "הקישור אינו תקין. בקשו מהזוג לשלוח אתכם שוב 💛" + BotanicalDivider
- Network error: full-screen — "בדקו את החיבור לאינטרנט ונסו שוב" + retry button

## Performance Considerations
- This page is the RSVP's FCP — must load under 1.5s
- Token validation API call: must respond within 800ms p95
- No images on loading screen — text only

---

# SCREEN E2-S2 — RSVP Invitation / YES–NO Selection

## Purpose
Guest sees the couple's event invitation and chooses to confirm or decline attendance.

## User Goal
Understand the invitation and make a binary attendance decision.

## Entry Points
- Auto-advance from E2-S1 Loading screen

## Exit Points
- → E2-S3 RSVP Form (if "כן, אגיע!")
- → E2-S6 Declined (if "לא אוכל להגיע")

## States

| State | Description |
|---|---|
| Default | Event details shown, two CTAs |
| Animating | Entrance animation on first load |

## Layout (Mobile, 390px)

```
[Full-bleed invitation photo — event hero image or golden-hour default]
[Gradient overlay bottom 60%]
---
"ענבל ונדב מתחתנים!" — Frank Ruhl Libre 700 28px white
"ה-15 בספטמבר 2026" — Heebo 300 16px white 80% opacity
"אולם הארמון, תל אביב" — Heebo 300 14px white 60% opacity
---
[GoldCTA lg fullWidth: "כן, אגיע! 🎉"]
[8px gap]
[secondary outline CTA fullWidth white-border: "לא אוכל להגיע"]
[4px gap]
[Heebo 300 12px white 50% opacity centred: "אפשר לעדכן את תשובתך מאוחר יותר"]
[safe area padding bottom]
```

## Layout (Tablet, md: 768px) — OPP-002

```
[Left column 55%: Full-height invitation photo, gradient overlay, couple names + date + venue]
[Right column 45%: Ivory background, vertically centred]
  "מתרגשים שתגיעו" — Frank Ruhl Libre 700 22px --color-dark
  [GoldCTA lg fullWidth: "כן, אגיע! 🎉"]
  [8px gap]
  [outline CTA fullWidth: "לא אוכל להגיע"]
  [4px gap]
  [Heebo 300 11px muted centred: "אפשר לעדכן את תשובתך מאוחר יותר"]
```

- BottomNav: **suppressed at md:** — actions in right column only
- Stitch reference: `/tmp/e2_rsvp_tablet_v2.png` (generated 2026-06-28, approved)
- Breakpoint: `@media (min-width: 768px)` — Tailwind `md:` prefix

## Component Behaviour
- "כן, אגיע!" → navigate to E2-S3 (RSVP Form)
- "לא אוכל להגיע" → navigate to E2-S5 (Declined — skips the form)

## Event Data Source
All data from `/api/rsvp/[token]` response:
- `event.bride_name`, `event.groom_name` → headline
- `event.date` → formatted date in Hebrew (15 בספטמבר 2026)
- `event.venue` → venue name
- `event.mini_site_hero_path` → invitation photo (if null: use default golden-hour wedding stock photo)

## Error States
- Event data missing fields: gracefully omit — "ענבל ונדב" even if only one name exists

## Accessibility
- Hero image: `alt="הזמנה לחתונה של ענבל ונדב"`
- Both CTAs are `<button>` elements with clear labels
- Text on photo: verify contrast with `rgba(28,16,8,0.5)` overlay — minimum 4.5:1 for body text

## Analytics Events
- `rsvp_invitation_viewed` → properties: event_id, token
- `rsvp_yes_selected`
- `rsvp_no_selected`

---

# SCREEN E2-S3 — RSVP Form (Empty + Filled States)

## Purpose
Guest enters their attendance details — number of attendees and their seat preference.

## User Goal
Confirm attendance with minimal friction in under 60 seconds.

## Entry Points
- From E2-S2 YES button tap

## Exit Points
- → E2-S4 Confirmed (on successful submit)
- → Back to E2-S2 (back gesture)

## States

| State | Description |
|---|---|
| Empty | Form unfilled, CTA disabled |
| Filling | Partial data, CTA enabled once minimum required fields filled |
| Submitting | CTA loading state, form disabled |
| Error | Validation or API error |

## Layout

```
[Back arrow — top right (RTL)]
"כמה אנשים יגיעו?" — H2 24px Frank Ruhl Libre 700
---
[Guest count stepper: minus − / count / plus +]
  [Large number: Frank Ruhl Libre 900 48px gold, centred]
  [Range: Heebo 300 12px muted: "כולל אתך — עד 10 אנשים"]
---
"שם מלא" — FloatingLabelInput (pre-filled if guest data available)
"מספר טלפון" — FloatingLabelInput type=tel
[Heebo 300 11px `--color-muted` below phone field: "הטלפון רק לתיאום ישיר עם הזוג — לא לשיווק"]
---
[GoldCTA lg fullWidth: "אישור הגעה"]
```

## Component Behaviour

**Guest count stepper:**
- Starts at 1 (pre-filled with guest's invited count if known)
- Minus button disabled when count = 1
- Plus button disabled when count > 10 (max)
- Count changes: frank ruhl 900 number updates with subtle scale animation (1.1→1.0, 150ms)
- Stepper minus/plus: 44×44px tap targets minimum

**Phone field:**
- `inputMode="numeric"`, `type="tel"`, `autocomplete="tel-national"`
- **`inputMode="numeric"` forces numeric keyboard on Android — critical for non-technical users**
- Israeli format validation: 050/052/053/054/055/058 + 7 digits
- Formatting: auto-formats as `050-000-0000` as user types
- Also accepts: `052 1234567` (with space), `+972521234567` — normalized on submit

## Validation Rules

| Field | Rule | Error |
|---|---|---|
| שם מלא | Required, min 2 chars | "שם חובה" |
| טלפון | Israeli format or empty | "מספר טלפון לא תקין" |
| מספר אורחים | 1–10 | Stepper enforces, no text error needed |

## Business Rules
- Phone is optional (some guests may not have a number or may not want to share)
- Guest count is limited to the invited count + 2 (to account for "+1" scenarios)
- If token has no pre-existing guest record, create one on submit

## Accessibility
- Stepper buttons: `aria-label="הוסף אורח"` / `aria-label="הסר אורח"`
- Count display: `aria-live="polite"` to announce changes

## Analytics Events
- `rsvp_form_started`
- `rsvp_form_submitted` → properties: guest_count, has_phone

---

# SCREEN E2-S4 — RSVP Confirmed

## Purpose
Emotional celebration of the guest's commitment. The guest feels welcome and appreciated.

## User Goal
Know that their RSVP was received. Optionally navigate to the mini site.

## Entry Points
- Auto-advance from E2-S3 on successful submit

## Exit Points
- → Mini Website (optional, CTA)
- → Gallery (if event has gallery)
- Close browser (most likely)

## Layout

```
[Confetti animation — gold + cream particles, 2 seconds, then settles]
[BotanicalDivider wreath — 80px]
"אישרתם! 🎉" — Frank Ruhl Libre 700 32px gold
"מחכים לכם בשמחה" — Heebo 300 18px dark
"[couple name] שמחים שתהיו שם" — Heebo 300 14px muted
---
[Summary card: cream background]
  [שם: ...]  [מספר אורחים: X]  [תאריך: 15 בספטמבר]
---
[GoldCTA secondary: "הוסיפו ליומן"]  [secondary: "פרטי האירוע"]
```

## Business Rules
- "הוסיפו ליומן" → generates Google Calendar link with event details
- "פרטי האירוע" → navigates to `/event/[event_id]` (mini website)
- No back navigation — confirmed is a terminal state

## Accessibility
- Confetti animation: respects `prefers-reduced-motion` (no animation if set)
- Success region: `role="status"` + `aria-live="polite"`

## Analytics Events
- `rsvp_confirmed` → properties: token, guest_count, event_id

---

# SCREEN E2-S5 — RSVP Declined

## Purpose
Gracious acknowledgement. The guest who cannot attend should not feel guilty — they should feel the couple understands and still cares about them.

## User Goal
Decline without feeling bad. Know the couple was notified.

## Design Decision (from E2-decisions.md)
Declined state is an olive branch, not an error state. Copy is warm. Never clinical.

## Layout

```
[BotanicalDivider branch — top center]
"מצטערים שלא תוכלו להיות שם" — Frank Ruhl Libre 700 24px dark
"תמיד תהיו קרובים לליבנו ❤️" — Heebo 300 16px muted
---
[Olive botanical illustration — full width, 180px]
---
[GoldCTA secondary fullWidth: "שלחו ברכה לזוג"]
```

## Business Rules
- Declined status saved to guest record immediately on arriving at this screen (from the YES/NO selection)
- "שלחו ברכה לזוג" → navigates to a simple text form that posts a blessing to the couple's blessing wall (if `blessing` route exists) or opens WhatsApp compose with pre-filled message to admin phone

## Accessibility
- Botanical illustration: `aria-hidden="true"` (decorative)
- Status: `role="status"` — "הסירוב נרשם בהצלחה"

## Analytics Events
- `rsvp_declined` → properties: token, event_id

---

# SCREEN E2-S6 — Photo Gallery

## Purpose
Guests browse event photos — both before and after the wedding.

## User Goal
See and download event photos. Upload their own.

## Entry Points
- Direct link from WhatsApp: `/gallery/[token]`
- From RSVP Confirmed screen

## Exit Points
- → Memory Upload (`/memory/[token]`) via FAB

## States

| State | Description |
|---|---|
| Loading | Masonry skeleton (cream rectangles) |
| Empty | No photos yet — empty state (see below) |
| Populated | Masonry grid |
| Photo expanded | Lightbox view |

## Layout (Mobile)

```
[Header: right-aligned "גלריה" H2 + back arrow on right (RTL)]
[GoldCTA sm: "העלו תמונה" — top-right of header]
---
[Masonry 2-column grid, 4px gap]
  [Photos: warm, real-content, varying heights]
---
[Gold FAB: camera icon + "העלאה", fixed bottom-right, above safe area]
```

## Component Behaviour

**Masonry grid:**
- 2 columns on mobile, 3 columns on `md`, 4 on `xl`
- Columns fill top-to-bottom (not row-by-row) for natural masonry
- Images: `object-fit: cover`, border-radius 8px
- Tap on photo: opens lightbox (full-screen with swipe gesture)

**Lightbox:**
- Full-screen dark overlay
- Swipe left/right to navigate between photos
- Double-tap to zoom (mobile pinch-to-zoom)
- X to close (top-left in full-screen — reversed for close, standard convention)
- Download button (bottom): saves photo to device

**Photo upload FAB:**
- Fixed position: `bottom: calc(80px + env(safe-area-inset-bottom))` (above bottom nav if shown)
- Navigates to `/memory/[token]`

## Empty States

When `gallery_photos.length === 0`:
```
[BotanicalDivider sprig]
"התמונות בדרך..." — Frank Ruhl Libre 700 24px dark
"שתפו את הגלריה עם האורחים כדי שיעלו תמונות" — Heebo 300 16px muted
[GoldCTA: "העלו תמונה ראשונה"]
```

## Loading States
- 6 cream masonry placeholder rectangles, animate-pulse, varying heights (120px, 180px, 150px)

## Error States
- Gallery fails to load: WarmAlertCard urgency='high' — "לא הצלחנו לטעון את הגלריה. בדקו חיבור ונסו שוב."

## Accessibility
- Each image: `alt` from uploaded metadata or generic "תמונה מהאירוע"
- Lightbox: `role="dialog"`, `aria-modal="true"`, focus trapped inside
- Close button: `aria-label="סגור"`

## Business Rules
- Photos sorted by `created_at` descending (newest first)
- Max upload size: 10MB per photo
- Supported formats: JPEG, PNG, HEIC (common iOS format)
- HEIC: convert server-side to WebP before storage

## Analytics Events
- `gallery_viewed` → properties: event_id, photo_count
- `gallery_photo_expanded`
- `gallery_photo_downloaded`
- `gallery_upload_started` (navigating to upload)

---

# SCREEN E2-S7 — Memory Upload — Type Selection

## Purpose
Guest chooses what kind of memory to contribute — photo or text blessing.

## User Goal
Select the type of contribution they want to make, in under 10 seconds.

## Entry Points
- From Gallery FAB
- Direct link: `/memory/[token]`

## Exit Points
- → Camera/photo picker (if "תמונה" selected)
- → Blessing form (if "ברכה" selected)
- → Video picker (if "וידאו" selected)

## Layout

```
[Botanical hero — warm illustration, full width, 200px]
"מה תרצו לשתף?" — Frank Ruhl Libre 700 24px dark, centred
"תרומתכם תהפוך לחלק מזכרונות החתונה" — Heebo 300 14px muted, centred
---
[2×2 grid of type selection cards]
  [📸 תמונה]    [🎥 וידאו]
  [✍️ ברכה]    [💌 מכתב קפסולת זמן]
---
```

## Card Behaviour (each type card)
- Card: cream background, 16px radius, border 1px `--color-border-default`
- Tap: gold border + scale 0.97, then navigate
- Icon: 40px emoji above label
- Label: Heebo 600 16px `--color-dark`
- No multi-select — each card is a direct navigation trigger

## Business Rules
- "מכתב קפסולת זמן" → goes to time capsule letter form (blessing targeted at the couple, locked until anniversary)
- "ברכה" → public blessing visible on memory wall
- Photo/video → camera or gallery picker on device

## Analytics Events
- `memory_type_selected` → property: type ('photo', 'video', 'blessing', 'capsule')

---

# SCREEN E2-S8 — Post-Event Survey

## Purpose
Collect guest satisfaction data. Frame as gratitude first, feedback second.

## User Goal
Express appreciation to the couple. Optionally share feedback.

## Entry Points
- WhatsApp link sent by admin after event: `/survey/[token]`

## Layout

```
[BotanicalDivider wreath — center]
"תודה שהייתם איתנו ❤️" — Frank Ruhl Libre 700 28px dark
"כמה שניות שיעזרו לנו לשפר" — Heebo 300 14px muted
---
"איך הייתה החוויה שלכם?" — Heebo 600 16px dark
[StarRating default=5]
---
"מה הייתה הרגע הכי יפה?" — Heebo 600 16px dark
[<textarea> — cream background, 16px radius, 120px height, max 500 chars]
---
"האם תמליצו לחברים?" — Heebo 600 16px dark
[RadioGroup: "בהחלט כן 😊" / "כנראה שכן" / "לא בטוח"]
---
[GoldCTA lg fullWidth: "שלחו"]
[text below: "התגובות שלכם נשמרות בצורה מאובטחת"]
```

## Component Behaviour

**StarRating:**
Default state: 5 filled gold stars. Tap to reduce. Never shows 0 stars in default state.

**Textarea:**
- Placeholder: "ספרו לנו..." (disappears on focus)
- CharCounter: "47/500" bottom-right of textarea in Heebo 300 11px muted
- Resizable: `resize: none` (fixed height)

## States
- Default: empty form, stars at 5
- Filled: some fields completed
- Submitting: GoldCTA loading, form disabled
- Submitted: see success state

## Success States
After submit:
```
[BotanicalDivider wreath]
"תודה! ❤️" — Frank Ruhl Libre 700 32px gold
"הפידבק שלכם יעזור לנו לשפר" — Heebo 300 16px muted
```

## Business Rules
- Survey is anonymous (token identifies the event, not the specific guest unless correlated)
- Survey can only be submitted once per token
- If token already submitted: show "כבר שלחתם לנו פידבק — תודה! 💛"

## Analytics Events
- `survey_viewed`
- `survey_submitted` → properties: rating (1-5), has_text, event_id

---

# SCREEN E2-S9 — Time Capsule (Locked State)

## Purpose
Creates maximum anticipation. Guest sees that their blessing exists but cannot read it until the anniversary.

## User Goal
Know their letter was received. Feel the emotional weight of the locked promise.

## Entry Points
- Direct link from WhatsApp after contributing a capsule letter
- From couple's time capsule page (shared view)

## States

| State | Description |
|---|---|
| Locked | Default — anniversary not yet reached |
| Unlocked | See E2-S9b (Unlocked State) |

## Locked Layout

```
[Gold ornate padlock SVG illustration — 80×80px, centered]
"קפסולת הזמן" — Frank Ruhl Libre 700 28px dark
"365" — Frank Ruhl Libre 900 64px gold (days until unlock)
"ימים עד לפתיחה" — Heebo 300 16px muted
---
[Blurred preview section]
  "הברכות שלכם מחכות..." — Heebo 400 14px muted
  [3 blurred blessing cards — see blur specification below]
---
[GoldCTA secondary: "הוסיפו ברכה לקפסולה"]
```

## BLUR SPECIFICATION (CRITICAL — IMPLEMENTATION REQUIRED)

The blessing preview cards show the sender's name (visible) but NOT the content (blurred).

**Implementation:**
```css
.blessing-preview-content {
  filter: blur(4px);
  user-select: none;
  pointer-events: none;
}
.blessing-preview-sender {
  /* NOT blurred — sender name is visible */
  filter: none;
}
```

**Do NOT render the actual blessing text through blur in the HTML.** Use placeholder text ("Lorem ipsum" or similar random Hebrew characters) as the "content" in the blurred preview. The actual blessing content must not be in the DOM (even blurred) for security — a determined user can inspect element and read it.

**Correct implementation:**
```tsx
<div className="blessing-preview">
  <span className="sender">{blessing.sender_name} ❤️</span>
  <span className="content blurred">
    {"א".repeat(Math.floor(Math.random() * 40 + 20))}  {/* placeholder characters */}
  </span>
</div>
```

## Unlocked State (E2-S9b)

When `days_until_unlock <= 0`:
```
[Gold confetti animation]
"פותחים את הקפסולה! 💌" — Frank Ruhl Libre 700 32px gold
[Blessing cards — no blur, full content visible]
```

## Accessibility
- Blurred content: `aria-hidden="true"` (screen readers don't announce it)
- `aria-label` on the section: "ברכות חסויות — ייחשפו ביום השנה"
- Countdown: `<time datetime="2027-09-15">365 ימים</time>`

## Analytics Events
- `time_capsule_viewed` → property: days_until_unlock, blessing_count

---

# SCREEN E2-S10 — Memory Wall

## Purpose
A curated, editorial experience of all guest contributions — photos and blessings — in one warm masonry layout.

## User Goal
Browse the collected memories of the event.

## Entry Points
- Direct link: `/memories/[token]`
- From couple post-event dashboard

## States
- Loading: masonry skeleton
- Empty: empty state
- Populated: mixed masonry grid

## Layout

```
[Header: "קיר הזכרונות" H2 + guest count "מ-84 אורחים"]
---
[Masonry 2-column grid, 4px gap]
  [Photo card — warm wedding photo]
  [Blessing card — cream background, quote marks, sender name]
  [Photo card]
  [Photo card]
  [Blessing card]
  ...
---
[Gold FAB: camera icon, "הוסיפו זיכרון"]
```

## Blessing Card Specification

```
Card: cream background, 16px radius, padding 16px
"text" — Heebo 400 15px dark, line-height 1.6, max 4 lines with ellipsis
"— שם השולח ❤️" — Heebo 600 13px muted, aligned end
```

## Empty States

When no memories yet:
```
[BotanicalDivider branch]
"הזיכרונות בדרך..." — Frank Ruhl Libre 700 24px dark
"היו הראשונים לשתף רגע" — Heebo 300 14px muted
[GoldCTA: "הוסיפו זיכרון ראשון"]
```

## Business Rules
- Mixed content: photos and blessings interleaved (not separated sections)
- Sort: `created_at` descending (newest first)
- Photo quality: apply warm filter `sepia(0.15) saturate(1.1) brightness(1.02)` to all uploaded photos for visual consistency

## Analytics Events
- `memory_wall_viewed` → properties: event_id, photo_count, blessing_count

---

*E2 Screen Specifications | Chief of Staff | 2026-06-27*

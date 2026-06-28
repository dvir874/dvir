# Experience 2 — Guest Experience
## Product Design Audit
## Chief of Staff | 2026-06-26

---

## Experience Summary

The Guest Experience is the product's highest-reach surface.
Every wedding touches 100–400 guests who have never chosen to use this product.
It is the only experience where the user is a non-paying stranger arriving with no context.

These screens form a journey that can span months:
**Invitation → RSVP → Wedding Day → Memory Upload → Gallery → Memory Wall → Time Capsule → Survey**

Wave 1 (RSVP) is design-complete.
This audit covers the remaining 6 screens.

---

## Screens In Scope

| Screen | Route | States | Current Design Quality |
|--------|-------|--------|------------------------|
| Mini Website / Invitation | `/event/[id]` | 1 main | ⚠️ Functional, not premium |
| Photo Gallery | `/gallery/[token]` | 3 (loading, empty, populated) | ⚠️ Functional, not immersive |
| Memory Upload | `/memory/[token]` | 7 (loading, error, name, choose, upload, audio_rec, capsule_write, done) | ⚠️ Works, not ceremonial |
| Memory Wall | `/memory/[token]/wall` | 3 (loading, empty, populated) | ⚠️ Functional, not beautiful |
| Time Capsule (Couple-facing) | `/couple/[token]/capsule` | 3 (locked, countdown, open) | ⚠️ Exists, not a ritual |
| Post-Event Survey | `/survey/[token]` | 4 (loading, error, form, done) | ⚠️ Bare, no emotional context |

---

## Screen-by-Screen Audit

---

### Screen 1 — Mini Website / Invitation
**Route:** `/event/[id]`

**What it does now:**
- Shows couple name, date, address
- Calendar add button (Google, ICS)
- Waze navigation button
- Share button
- Dress code / parking (if set)
- Basic RSVP link button

**Current Design:**
- Theme-based (couples choose a theme from 8 options)
- No consistent premium default
- Header component rotates with theme
- No full-bleed hero
- No emotional copy
- No countdown

**Emotional Opportunities:**

| Current | Opportunity |
|---------|-------------|
| Shows date as a row of text | Countdown timer — days until the wedding |
| Generic "RSVP" button | Warm invitation copy that feels personal |
| No atmosphere | Full-bleed hero: couple photo or brand floral asset |
| Waze and calendar as plain buttons | Warm action cards with context ("מגיעים? הנווטו" / "שמרו בלוח השנה") |
| No personality | Brief personal message from the couple (if they set it) |
| No social connection | "הזמנתם? שתפו עם חברים שגם מוזמנים" |

**Pain Points:**
1. The "theme" system creates visual inconsistency — 8 different aesthetics with no brand thread
2. No full-bleed hero image — the page reads as a business card, not an invitation
3. Mobile layout is adequate but not immersive
4. The RSVP button doesn't feel like the emotional event it is — it's a blue link

**What premium looks like:**
The mini website is the digital equivalent of the physical wedding invitation.
It should feel like receiving something beautiful in the mail.
A guest should open the link and feel: "Oh. Oh wow. They really thought about this."

---

### Screen 2 — Photo Gallery
**Route:** `/gallery/[token]`

**What it does now:**
- Grid of photos from the wedding
- Multi-file upload (drag or file picker)
- Upload progress per file
- Video and photo support
- Album-based structure

**Current Design:**
- Cream + gold palette — consistent
- Grid layout — functional
- No masonry / no editorial layout
- No full-screen viewer
- No "moments" organization
- No emotional landing state

**Emotional Opportunities:**

| Current | Opportunity |
|---------|-------------|
| Generic loading state | Branded loading with "הגלריה שלכם מחכה..." |
| Plain grid | Masonry layout — organic, natural, magazine-feel |
| No empty state | Beautiful empty state: "הגלריה עוד ריקה — היו הראשונים להעלות תמונה!" |
| Upload = file picker | "שתפו את הרגעים שלכם" — celebratory framing |
| No viewer | Full-screen lightbox with swipe |
| No organization | "רגעי החתונה" sections or chronological grouping |

**Pain Points:**
1. No full-screen lightbox — this is the most glaring missing feature
2. The upload interaction is functional but not celebratory
3. No sense of collective contribution (guests don't see each other's uploads in real-time)
4. The empty state is currently a white void — missed emotional opportunity

---

### Screen 3 — Memory Upload
**Route:** `/memory/[token]`

**What it does now:**
- 7-screen flow: loading → error → enter name → choose type → upload / record audio / write capsule → done
- 5 memory types: photo, video, blessing (text), audio blessing, time capsule
- Time capsule: choose message type (blessing/advice/story/prediction) + unlock years (1/5/10)
- Confirmation screen at end

**Current Design:**
- Brand colors present (cream, gold, olive)
- Each screen is very simple — text + one action
- No photography or imagery
- No ceremony — feels like a form flow
- Done screen is minimal

**Emotional Opportunities:**

| Current | Opportunity |
|---------|-------------|
| "מה שמך?" plain input | "ספרו לנו מי אתם" — warm framing with couple name in the copy |
| Type selection: 5 plain chips | 5 premium choice cards with illustration or photography |
| Upload: file picker | "גרור תמונה או לחץ להעלות" — large, welcoming drop zone |
| Audio recording: start/stop | Waveform visualization while recording |
| Capsule type selection | Illustrated cards for each message type (blessing, advice, story, prediction) |
| Done screen: "הועלה בהצלחה" | Ceremonial done screen: "תודה — הרגע הזה שמור לעד" with imagery |

**Pain Points:**
1. The "choose type" step has no visual differentiation between options — all look the same
2. No imagery anywhere in the flow — missed warmth
3. The time capsule concept is not explained — guests don't understand what it means
4. The done state doesn't feel like an achievement

---

### Screen 4 — Memory Wall
**Route:** `/memory/[token]/wall`

**What it does now:**
- Grid of all guest memories (photos, videos, text blessings)
- Full-screen viewer for selected items
- Shows guest name + type for each item
- Empty state if nothing uploaded yet

**Current Design:**
- Cream + gold palette
- Cards grid layout
- Functional, not beautiful
- No masonry
- No emotional landing header

**Emotional Opportunities:**

| Current | Opportunity |
|---------|-------------|
| Grid of cards, no header | "קיר הרגעים של [Couple Name]" — full-width header with warmth |
| No count display | "42 רגעים שמורים לעד" — makes the collection feel significant |
| No filtering | Filter: "הכל / תמונות / ברכות / אודיו / קפסולות" |
| No emotional framing | Opening text: "אלה הרגעים שאהבתם ואנשים שאוהבים אתכם שמרו" |
| Text blessings: plain card | Text blessings: beautifully typeset quote card, Frank Ruhl Libre |
| Share not prominent | "שתפו את קיר הרגעים" — primary action |

**Pain Points:**
1. The wall doesn't feel like a curated collection — it feels like a database view
2. Text blessings deserve better typography (a blessing is not a data row)
3. No emotional landing experience (couple opens this after the wedding — it should make them cry, in a good way)
4. No distinction between public/private viewing

---

### Screen 5 — Time Capsule (Couple-facing)
**Route:** `/couple/[token]/capsule`

**What it does now:**
- Shows all time capsule messages left by guests
- Locked messages show: guest name, type, days until unlock, message type emoji
- Unlocked messages show: full content
- Lock/unlock based on `unlock_at` date

**Current Design:**
- Very minimal
- List of cards with locked/unlocked state
- Gold padlock icon
- No ceremony, no ritual design

**Emotional Opportunities:**

This is the most emotionally significant feature in the product.
A guest wrote a message at the wedding. It's been sealed for 1 year.
The couple opens the app on their anniversary and reads it for the first time.

This is not a feature. This is a ritual.

| Current | Opportunity |
|---------|-------------|
| List of locked cards | Countdown to next unlock — "הקפסולה הבאה נפתחת בעוד 47 ימים" |
| Date-based auto-unlock | Unlock ceremony — animated reveal when opened for the first time |
| Generic card design | Envelope design — messages that look like they've been sealed |
| No emotional landing | "קפסולת הזמן שלכם" — hero with explanation and emotional copy |
| No anniversary connection | "ברוכים השבים — שנה למזל טוב שלכם!" on anniversary date |

---

### Screen 6 — Post-Event Survey
**Route:** `/survey/[token]`

**What it does now:**
- Star rating (1-5 with hover effect)
- Text review input
- Submit → shows referral code to share

**Current Design:**
- Very minimal
- Gold stars (Heebo)
- Plain text input
- After submit: shows referral link with copy button

**Emotional Opportunities:**

The survey is the last moment of the company's relationship with the couple.
It should feel like a warm thank-you, not a feedback form.

| Current | Opportunity |
|---------|-------------|
| "כתבו ביקורת" header | "שנה מאז החתונה שלכם. איך הלך?" — personal, warm |
| Star rating with numbers | Visual stars with emoji reactions per rating |
| Plain text input | "ספרו לנו רגע אחד שזכרתם ממנו" — prompted, personal |
| Generic done screen | "תודה על הכנות. זה עוזר לנו לשרת את הזוג הבא" |
| Referral: plain link | "הכירו לנו זוג אחד שעוד לא מאורגן" — warm, specific framing |
| No couple context | Show the couple's wedding date and event name in the header |

---

## Summary — UX Score by Screen

| Screen | Current UX | Emotional Depth | Design Quality |
|--------|-----------|-----------------|----------------|
| Mini Website | 5/10 | 3/10 | 4/10 |
| Gallery | 6/10 | 4/10 | 6/10 |
| Memory Upload | 6/10 | 3/10 | 5/10 |
| Memory Wall | 5/10 | 3/10 | 5/10 |
| Time Capsule | 4/10 | 2/10 | 4/10 |
| Survey | 4/10 | 2/10 | 3/10 |
| **RSVP (Wave 1)** | **9/10** | **9/10** | **9/10** |

Every screen in E2 except RSVP needs significant design elevation.

---

*Experience 2 Audit | Chief of Staff | 2026-06-26*

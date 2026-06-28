# Experience 2 — Guest Experience
## Design Pack
## Chief of Staff | 2026-06-26

---

> Reference: E2-AUDIT.md for full emotional analysis
> RSVP (Wave 1) design complete — not repeated here.
> This pack covers: Mini Website, Gallery, Memory Upload, Memory Wall, Time Capsule, Survey.

---

## Design Direction (all screens)

**Direction C — Warm Romantic** (consistent with approved RSVP design)

**Non-negotiable constraints:**
- Background: Cream #F6F1E8 / Ivory #FDFAF5
- Primary action: Gold #C5A46D
- Fonts: Frank Ruhl Libre (headlines) + Heebo (body)
- RTL: always
- Mobile first: always
- Zero navigation chrome on all guest screens
- Brand Asset Library: olive branch, floral, paper textures as available

---

---

# SCREEN 1 — Mini Website / Invitation
## `/event/[id]`

### States
```
A. Loading
B. Main invitation view (single state — all content visible)
C. Calendar dropdown (expanded)
```

### Design Anatomy

```
┌─────────────────────────────────┐
│ [Full-bleed hero: floral arch   │  ← Brand asset or couple's hero photo
│  or warm venue photo]           │
│                                 │
│  ── רגע לפני ──                 │  ← Brand mark, centered, white on image
└─────────────────────────────────┘
│                                 │
│  חתונת ענבל ונדב                │  ← Frank Ruhl Libre 900, large, dark
│                                 │
│  ──── ◆ ────                    │  ← Ornamental divider, gold
│                                 │
│  יום שלישי, י׳ בתמוז תשפ״ה     │  ← Hebrew date, Heebo 500
│  20 ביולי 2026                  │  ← Gregorian, Heebo 400, muted
│                                 │
│  📍 אולם מלון שרתון, רמת גן     │  ← Venue, Heebo 400
│                                 │
│  ┌───────────────────────────┐  │
│  │     47 ימים נותרו         │  │  ← Countdown card, cream background
│  │   עד החתונה שלהם          │  │
│  └───────────────────────────┘  │
│                                 │
│  [ברכה מהזוג — אם הוגדרה]      │  ← Italic, Frank Ruhl Libre, muted gold
│                                 │
│  ┌──── אישרו הגעה ────┐         │  ← Primary CTA, full width, gold
│  └────────────────────┘         │
│                                 │
│  ┌─────┐  ┌──────────┐          │
│  │Waze │  │ יומן     │          │  ← Secondary actions, side by side
│  └─────┘  └──────────┘          │
│                                 │
│  קוד לבוש: אלגנטי               │  ← Dress code, if set
│  חניה: חניון השרתון             │  ← Parking, if set
│                                 │
│  ── שתפו עם מוזמנים ──          │  ← Share CTA, text link
└─────────────────────────────────┘
```

### Components Required
- `EventHero` — full-bleed image with brand mark overlay
- `EventTitle` — Frank Ruhl Libre 900, couple name
- `OrnamentalDivider` — gold diamond divider
- `EventDate` — Hebrew + Gregorian dates
- `CountdownCard` — cream card, days remaining
- `CoupleMessage` — personal message if set, italic
- `RSVPButton` — primary, full-width, gold
- `ActionPair` — Waze + Calendar, side by side
- `DetailRow` — dress code, parking (appears only if set)
- `ShareLink` — native share, text link

---

---

# SCREEN 2 — Photo Gallery
## `/gallery/[token]`

### States
```
A. Loading — branded, animated
B. Empty — warm, inviting to upload
C. Populated — grid + lightbox
D. Uploading — progress state
```

### State A — Loading
```
┌─────────────────────────────┐
│        רגע לפני             │  ← Brand mark
│                             │
│  [Animated gold line]       │
│                             │
│  הגלריה שלכם מחכה...        │  ← Heebo 400, muted
└─────────────────────────────┘
```

### State B — Empty
```
┌─────────────────────────────┐
│  גלריית החתונה              │  ← Frank Ruhl Libre, large
│  ענבל ונדב                  │
│                             │
│  [Camera illustration /     │
│   warm bokeh brand asset]   │
│                             │
│  הגלריה עדיין ריקה          │  ← Heebo 400
│  היו הראשונים להעלות רגע!  │
│                             │
│  ┌──── העלו תמונות ────┐    │  ← Gold CTA
│  └──────────────────────┘   │
└─────────────────────────────┘
```

### State C — Populated (Main View)
```
┌─────────────────────────────┐
│  רגע לפני                   │  ← Minimal top bar, no navigation
├─────────────────────────────┤
│  גלריית החתונה              │  ← Frank Ruhl Libre, page title
│  ענבל ונדב · 14.09.2024     │
│  127 תמונות ו-8 סרטונים     │  ← Count, muted
│                             │
│  [Masonry photo grid]       │  ← 2 columns on mobile, 3-4 on desktop
│  [Photo] [Photo]            │    Mixed heights, organic feel
│  [Photo] [Video]            │
│  [Photo] [Photo] [Photo]    │
│                             │
│  ┌── העלו עוד תמונות ──┐    │  ← Floating add button
│  └──────────────────────┘   │
└─────────────────────────────┘
```

### State D — Lightbox (full-screen viewer)
```
┌─────────────────────────────┐
│ [×]                [→ share]│  ← Close + share, white on dark
│                             │
│                             │
│  [Full-screen photo/video]  │
│                             │
│                             │
│  מאת: יוסי כהן              │  ← Guest name, bottom
│  [← swipe →]               │  ← Swipe to navigate
└─────────────────────────────┘
```

### Components Required
- `GalleryHeader` — couple name, date, count
- `MasonryGrid` — 2-column mobile, 3-4 desktop, mixed heights
- `PhotoCard` — image with guest name on hover/tap
- `VideoCard` — thumbnail with play icon overlay
- `LightboxViewer` — full-screen, swipe navigation, close button
- `UploadButton` — floating gold FAB (bottom right)
- `UploadSheet` — bottom sheet: drag + file picker + progress

---

---

# SCREEN 3 — Memory Upload
## `/memory/[token]`

### States (7-screen flow)
```
loading → error → name → choose → 
  [photo/video upload] OR [blessing write] OR [audio record] OR [capsule write]
→ done
```

### Screen: Loading
Same pattern as RSVP loading. Cream background, brand mark, animated gold line.

### Screen: Error
Same pattern as RSVP error. Warm language, ring/invitation brand asset, "חזרה" CTA.

### Screen: Name Entry
```
┌─────────────────────────────┐
│        רגע לפני             │
│                             │
│  [Soft floral brand asset]  │
│                             │
│  שמחים שבאתם!               │  ← Frank Ruhl Libre, large
│  לחתונה של ענבל ונדב        │
│                             │
│  ספרו לנו מי אתם            │  ← Heebo 500, muted
│  ┌─────────────────────┐    │
│  │  שם מלא             │    │  ← Input, underline style
│  └─────────────────────┘    │
│                             │
│  ┌──── המשיכו ────┐         │  ← Gold CTA
│  └────────────────┘         │
└─────────────────────────────┘
```

### Screen: Choose Memory Type
```
┌─────────────────────────────┐
│        רגע לפני             │
│                             │
│  שלום, יוסי!                │  ← Frank Ruhl Libre, personalized
│  מה תרצו לשמור לענבל ונדב? │  ← Heebo 400, sub
│                             │
│  ┌──────┐  ┌──────┐         │
│  │  📸  │  │  🎬  │         │  ← 2×2+1 grid of choice cards
│  │תמונה │  │וידאו │         │
│  └──────┘  └──────┘         │
│  ┌──────┐  ┌──────┐         │
│  │  💬  │  │  🎙️  │         │
│  │ברכה  │  │ שמע  │         │
│  └──────┘  └──────┘         │
│         ┌──────┐            │
│         │  ⏳  │            │  ← Capsule: center, full width
│         │קפסולה│            │
│         └──────┘            │
└─────────────────────────────┘
```

Each choice card: emoji large + label + brief description ("תשלחו לנו צילום מהחגיגה")

### Screen: Upload (photo/video)
```
┌─────────────────────────────┐
│        ←                    │  ← Back arrow only
│                             │
│  העלו תמונה מהחתונה         │  ← Frank Ruhl Libre
│                             │
│  ┌─────────────────────┐    │
│  │                     │    │
│  │   📸                │    │  ← Drop zone: dashed gold border
│  │   לחצו לבחירת קובץ │    │
│  │   או גררו לכאן      │    │
│  │                     │    │
│  └─────────────────────┘    │
│                             │
│  [Preview once selected]    │
│                             │
│  ┌──── שליחה ────┐          │  ← Gold CTA (disabled until file chosen)
│  └───────────────┘          │
└─────────────────────────────┘
```

### Screen: Blessing (text)
```
┌─────────────────────────────┐
│        ←                    │
│                             │
│  כתבו ברכה לזוג             │  ← Frank Ruhl Libre
│                             │
│  ┌─────────────────────┐    │
│  │                     │    │
│  │  [Textarea]         │    │  ← Cream background, warm border
│  │  "כתבו את הברכה     │    │
│  │   שלכם כאן..."      │    │
│  │                     │    │
│  └─────────────────────┘    │
│  מקסימום 500 תווים          │  ← Heebo 300, muted
│                             │
│  ┌──── שליחה ────┐          │
│  └───────────────┘          │
└─────────────────────────────┘
```

### Screen: Audio Recording
```
┌─────────────────────────────┐
│        ←                    │
│                             │
│  הקליטו ברכה קולית          │  ← Frank Ruhl Libre
│                             │
│  [Waveform visualizer]      │  ← Animated when recording
│                             │
│  00:23                      │  ← Recording timer
│                             │
│  ┌──── עצרו הקלטה ────┐     │  ← Red button while recording
│  └─────────────────────┘    │
│                             │
│  [Play / Re-record / Send]  │  ← After recording ends
└─────────────────────────────┘
```

### Screen: Capsule Write
```
┌─────────────────────────────┐
│        ←                    │
│                             │
│  קפסולת הזמן                │  ← Frank Ruhl Libre
│  לענבל ונדב                 │
│                             │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐│  ← Type chips: ברכה / עצה / סיפור / תחזית
│  └────┘ └────┘ └────┘ └────┘│
│                             │
│  ┌─────────────────────┐    │
│  │  [Textarea]         │    │
│  └─────────────────────┘    │
│                             │
│  נפתח בעוד:                 │
│  ┌───────┐┌───────┐┌───────┐│  ← Chips: שנה / 5 שנים / 10 שנים
│  └───────┘└───────┘└───────┘│
│                             │
│  ┌──── אטמו את הקפסולה ──┐  │  ← Gold CTA
│  └───────────────────────┘  │
└─────────────────────────────┘
```

### Screen: Done (Celebration)
```
┌─────────────────────────────┐
│        רגע לפני             │
│                             │
│  [Candles / floral brand    │
│   asset — warm, celebratory]│
│                             │
│  תודה, יוסי!                │  ← Frank Ruhl Libre, large
│                             │
│  הרגע הזה שמור לעד          │  ← Heebo 400
│  לענבל ונדב                 │
│                             │
│  ───────────────────────    │
│                             │
│  [If capsule: countdown]    │
│  "הקפסולה שלך תיפתח        │
│   בעוד שנה — 14.09.2025"   │
│                             │
│  ┌── ראו את קיר הרגעים ──┐  │  ← Secondary CTA
│  └───────────────────────┘  │
└─────────────────────────────┘
```

### Components Required
- `MemoryLoadingScreen` — brand mark + animated line
- `MemoryErrorScreen` — warm language + brand asset
- `NameEntryScreen` — floral asset + warm copy + input
- `MemoryTypeGrid` — 2×2+1 choice cards with emoji, label, description
- `FileDropZone` — dashed gold border, large, accessible
- `BlessingTextarea` — cream background, warm border, character count
- `AudioRecorder` — waveform visualizer, timer, controls
- `CapsuleWriter` — type chips + textarea + unlock chips + CTA
- `MemoryDoneScreen` — brand asset + celebratory copy + capsule info

---

---

# SCREEN 4 — Memory Wall
## `/memory/[token]/wall`

### States
```
A. Loading
B. Empty (no memories yet)
C. Populated
D. Selected item (lightbox/full-screen)
```

### State C — Populated (Main)
```
┌─────────────────────────────┐
│  קיר הרגעים                 │  ← Frank Ruhl Libre, large
│  ענבל ונדב · 14.09.2024     │
│  56 רגעים שמורים לעד        │  ← Count, emotionally framed
│                             │
│  [Filter chips: הכל / 📸 / 💬 / 🎙️]
│                             │
│  [Masonry grid of memories] │
│  ┌──────┐ ┌──────────────┐  │
│  │Photo │ │ ברכה טקסטואל │  │  ← Text blessing: quote card style
│  └──────┘ │ "יהי רצון    │  │
│  ┌──────┐ │  שתגדלו..."  │  │
│  │Video │ └──────────────┘  │
│  └──────┘                   │
│  ┌──────────────────────┐   │
│  │ [Audio blessing]     │   │  ← Audio card with waveform + play
│  └──────────────────────┘   │
│                             │
│  ┌── שתפו את הקיר ────┐     │  ← Native share
│  └────────────────────┘     │
└─────────────────────────────┘
```

### Text Blessing Card Design
```
┌─────────────────────────────┐
│  "                          │  ← Opening quote mark, gold
│                             │
│  יהי רצון שיחיו             │  ← Frank Ruhl Libre, readable size
│  בשמחה ובברכה               │
│  לאורך ימים שנים טובות      │
│                             │
│                    "        │  ← Closing quote mark
│                             │
│  — משפחת לוי                │  ← Guest name, muted, small
└─────────────────────────────┘
```

### Components Required
- `WallHeader` — couple name, date, memory count
- `FilterChips` — all / photo / text / audio
- `WallMasonryGrid` — mixed content, organic layout
- `BlessingQuoteCard` — Frank Ruhl Libre quote format
- `AudioMemoryCard` — waveform + play button + guest name
- `ShareWallButton` — native share

---

---

# SCREEN 5 — Time Capsule (Couple-facing)
## `/couple/[token]/capsule`

### States
```
A. Loading
B. All locked (future date)
C. Countdown (imminent unlock — < 30 days)
D. Some unlocked (anniversary reached)
E. Empty (no capsule messages yet)
```

### State B — Locked
```
┌─────────────────────────────┐
│  ←  קפסולת הזמן             │  ← Page header
│                             │
│  [Sealed envelope brand     │
│   asset — cream, gold wax]  │
│                             │
│  הקפסולה שלכם               │  ← Frank Ruhl Libre
│                             │
│  7 הודעות חתומות            │  ← Count
│  מאנשים שאוהבים אתכם        │
│                             │
│  ┌─────────────────────┐    │
│  │ הפתיחה הבאה:        │    │  ← Countdown card, cream
│  │ בעוד 312 ימים       │    │
│  │ 14 ספטמבר 2025      │    │
│  └─────────────────────┘    │
│                             │
│  [List of locked messages]  │
│  ┌─────────────────────┐    │
│  │ 🔒 💎 עצה           │    │  ← Locked card: type + type label only
│  │ מאת: יוסי כהן       │    │
│  │ נפתח בעוד 312 ימים  │    │
│  └─────────────────────┘    │
│  ┌─────────────────────┐    │
│  │ 🔒 💛 ברכה           │    │
│  │ מאת: משפחת לוי      │    │
│  │ נפתח בעוד 312 ימים  │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

### State D — Unlocked (Anniversary)
```
┌─────────────────────────────┐
│  ←  קפסולת הזמן             │
│                             │
│  ברוכים השבים               │  ← Frank Ruhl Libre
│  שנה למזל טוב שלכם! 💕      │
│                             │
│  [Open envelope brand asset]│
│                             │
│  [Unlocked message]         │
│  ┌─────────────────────┐    │
│  │ 💎 עצה               │    │  ← Open card: full content
│  │ מאת: יוסי כהן       │    │
│  │                     │    │
│  │ "תמיד זכרו מה       │    │  ← Frank Ruhl Libre for the message
│  │  הרגיש כשהסתכלתם   │    │
│  │  אחד על השני..."    │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

### Components Required
- `CapsuleHero` — sealed/open envelope brand asset + emotional copy
- `CapsuleCountdown` — cream card, days + date
- `LockedMessageCard` — type emoji + author + days to unlock
- `UnlockedMessageCard` — Frank Ruhl Libre message content
- `AnniversaryBanner` — appears on the unlock anniversary date

---

---

# SCREEN 6 — Post-Event Survey
## `/survey/[token]`

### States
```
A. Loading
B. Error
C. Form
D. Done (referral)
```

### State C — Form
```
┌─────────────────────────────┐
│        רגע לפני             │
│                             │
│  [Wildflower brand asset    │
│   — celebratory, warm]      │
│                             │
│  מזל טוב על חתונת           │  ← Frank Ruhl Libre
│  ענבל ונדב                  │
│                             │
│  עבר כמעט שנה.              │  ← Heebo 500
│  איך הלך?                   │
│                             │
│  ──── הדרגו את החוויה ────  │
│                             │
│  ☆  ☆  ☆  ☆  ☆              │  ← Large gold stars, tap to rate
│                             │
│  [Emoji reaction per rating]│  ← 1=😔 2=😐 3=🙂 4=😊 5=🥹
│                             │
│  ┌─────────────────────┐    │
│  │ ספרו לנו רגע אחד   │    │  ← Textarea, prompted
│  │ שזכרתם ממנו...     │    │
│  └─────────────────────┘    │
│                             │
│  ┌── שלחו ──┐               │  ← Gold CTA (disabled until rated)
│  └──────────┘               │
└─────────────────────────────┘
```

### State D — Done (Referral)
```
┌─────────────────────────────┐
│        רגע לפני             │
│                             │
│  [Warm celebratory brand    │
│   asset]                    │
│                             │
│  תודה!                      │  ← Frank Ruhl Libre, large
│  זה מה שעוזר לנו לשרת      │
│  את הזוג הבא                │
│                             │
│  ────────────────────────   │
│                             │
│  הכירו לנו זוג אחד          │  ← Heebo 500
│  שהחתונה שלו בפתח           │
│                             │
│  ┌─────────────────────┐    │
│  │ הקוד שלכם: ENBAL7  │    │  ← Referral code, prominent
│  │ [העתקה]             │    │
│  └─────────────────────┘    │
│                             │
│  ┌── שתפו ←─┐               │  ← Native share with pre-written message
│  └──────────┘               │
└─────────────────────────────┘
```

### Components Required
- `SurveyHero` — brand asset + couple name + personal time framing
- `StarRating` — large, tap-able, emoji reaction per rating
- `SurveyTextarea` — prompted, warm placeholder
- `SurveyDoneScreen` — thank-you + referral code card + share button

---

---

## Stitch Prompts

### PROMPT 1 — Mini Website / Invitation

```
Design a complete mobile-first wedding mini website in Hebrew (RTL) for "רגע לפני" platform.

CONTEXT: A wedding guest receives a WhatsApp link from the couple. This is the digital equivalent of receiving a physical wedding invitation in the mail. The guest has not used this product before.

DIRECTION: Warm Romantic — cream paper aesthetic, physical invitation feel.

SCREENS TO DESIGN:
1. Main invitation view (single-scroll page)
2. Loading state (branded)

DESIGN ANATOMY:
Full-bleed hero image (floral arch or warm venue photo — 60% of screen height)
  → Brand mark "רגע לפני" centered, white, on the image
  → Couple name below image: Frank Ruhl Libre 900, very large, dark
  → Gold ornamental divider
  → Hebrew + Gregorian date (Heebo 500)
  → Venue with map pin icon (Heebo 400)
  → Countdown card: cream rounded card "47 ימים נותרו"
  → Couple message (italic, Frank Ruhl Libre, gold-tinted, if set)
  → Primary CTA: "אישרו הגעה" — full-width, gold #C5A46D, 56px height, rounded 24px
  → Action pair: Waze + Calendar side by side (outlined gold style)
  → Details (dress code, parking) — appear only if set, muted small text
  → Share link: "שתפו עם מוזמנים" — text link, bottom

PALETTE: Background ivory #FDFAF5, accents gold #C5A46D, dark text #1C1008, muted text rgba(28,16,8,0.52)
FONTS: Frank Ruhl Libre (couple name, date headline) + Heebo (all other text)
RTL: always. All text right-aligned.
MOBILE: 390px primary. No bottom navigation. No hamburger. No header chrome.
IMAGES: Use warm floral/venue photography assets.
EMOTIONS: "This is beautiful. This couple has taste. I'm excited to attend."
```

---

### PROMPT 2 — Photo Gallery

```
Design a complete mobile-first photo gallery experience in Hebrew (RTL) for "רגע לפני" wedding platform.

CONTEXT: After the wedding, guests and the couple visit this page to see all photos shared. It is a collective memory — all guests contributed to it. The experience should feel like a beautiful magazine spread of the wedding.

DIRECTION: Warm Romantic — cream backgrounds, editorial photography treatment.

SCREENS TO DESIGN:
1. Loading state (branded)
2. Empty state (before any photos)
3. Populated gallery — main view
4. Full-screen lightbox / photo viewer

POPULATED GALLERY DESIGN:
Page header: "גלריית החתונה" (Frank Ruhl Libre) + couple name + date + photo count muted
2-column masonry grid on mobile (mixed heights — organic feel)
Each photo card: image fills card, guest name appears on bottom on hover/tap
Video cards: thumbnail with centered play button overlay (gold circle with white triangle)
Floating add button: gold FAB, bottom right, "העלו תמונות"

EMPTY STATE:
Warm brand asset (bokeh/candlelight)
"הגלריה עדיין ריקה — היו הראשונים!" (Frank Ruhl Libre)
Gold CTA: "העלו את הרגע הראשון"

LIGHTBOX:
Full screen, dark background (rgba(28,16,8,0.95))
Close button top-left (×, white)
Share button top-right (↑, white)
Photo/video fills screen
Guest name + upload date at bottom (white, Heebo 400)
Swipe or arrow navigation
Dots indicator if multiple

PALETTE: Cream #F6F1E8, gold #C5A46D, dark #1C1008
FONTS: Frank Ruhl Libre (headings) + Heebo (labels)
RTL: always. Zero navigation chrome.
EMOTIONS: "Beautiful. I want to share this. I want to look at every single one."
```

---

### PROMPT 3 — Memory Upload Flow

```
Design a complete 8-screen mobile memory upload flow in Hebrew (RTL) for "רגע לפני" wedding platform.

CONTEXT: A wedding guest wants to give the couple a lasting gift — a photo, a video, a written blessing, an audio message, or a time capsule message. This is a ceremony, not a form. The guest should feel they are contributing something meaningful that will be treasured forever.

DIRECTION: Warm Romantic — intimate, warm, ceremonial.

SCREENS TO DESIGN:
Screen 1: Loading (branded)
Screen 2: Error (warm, branded)
Screen 3: Name entry — "מי אתם?"
Screen 4: Memory type selection — 5 choice cards
Screen 5A: Photo/video upload — drop zone
Screen 5B: Written blessing — textarea
Screen 5C: Audio recording — with waveform
Screen 5D: Time capsule — type + years + write
Screen 6: Done — celebration

SCREEN 3 (Name Entry):
Soft floral brand asset at top (40% height)
"שמחים שבאתם!" — Frank Ruhl Libre, large, gold
"לחתונה של [CoupleNames]" — Heebo 500
"ספרו לנו מי אתם" — label
Single input field (underline style, cream background, no box border)
Gold CTA: "המשיכו" (disabled until name entered)

SCREEN 4 (Type Selection):
"שלום, [GuestName]!" — personalized, Frank Ruhl Libre
"מה תרצו לשמור לזוג?" — Heebo 400 sub
2×2 grid + 1 centered choice card:
  📸 תמונה / 🎬 וידאו / 💬 ברכה / 🎙️ ברכה קולית / ⏳ קפסולת זמן
Each card: large emoji (48px) + Hebrew label + one-line description (Heebo 300)
Selected card: gold border + gold background tint

SCREEN 5A (Upload):
"העלו תמונה מהחתונה" — Frank Ruhl Libre
Large drop zone: dashed gold border, rounded, generous padding
  Camera icon + "לחצו לבחירת קובץ / גררו לכאן"
When file selected: preview thumbnail
Gold CTA: "שלחו"

SCREEN 5C (Audio):
Waveform visualizer (animated bars, gold)
Recording timer: "00:23"
Large red stop button while recording
After stop: play / re-record / send options

SCREEN 5D (Capsule):
"קפסולת הזמן" — Frank Ruhl Libre
Type chips: ברכה 💛 / עצה 💎 / סיפור 📖 / תחזית 🔮
Large textarea (cream, warm border)
Unlock chips: "בעוד שנה" / "בעוד 5 שנים" / "בעוד 10 שנים"
CTA: "אטמו את הקפסולה" (evocative language)

SCREEN 6 (Done):
Brand asset: warm candlelit table or wildflowers
"תודה, [GuestName]!" — Frank Ruhl Libre, large
"הרגע הזה שמור לעד לענבל ונדב" — Heebo 400
If capsule: "הקפסולה תיפתח ב-14.09.2025"
Secondary CTA: "ראו את קיר הרגעים"

PALETTE: Cream #F6F1E8, ivory #FDFAF5, gold #C5A46D, dark #1C1008
FONTS: Frank Ruhl Libre (emotional moments) + Heebo (all labels, inputs)
RTL: always. Zero navigation chrome. Single purpose.
EMOTIONS: "I'm giving them something they'll treasure. This feels meaningful."
```

---

### PROMPT 4 — Time Capsule

```
Design a complete mobile time capsule experience in Hebrew (RTL) for "רגע לפני" wedding couple dashboard.

CONTEXT: Wedding guests left sealed messages at the wedding. The couple is seeing them for the first time — one year later. This is one of the most emotionally significant moments in the product. It should feel like a ritual, not a feature.

DIRECTION: Warm Romantic — intimate, sealed, ceremonial, emotional.

SCREENS TO DESIGN:
1. Locked state (messages not yet due)
2. Countdown state (< 30 days to unlock)
3. Unlocked state (anniversary date reached)
4. Empty state (no capsule messages)

LOCKED STATE:
Page header: "קפסולת הזמן" with back arrow
Brand asset: sealed cream envelope with gold wax seal
"הקפסולה שלכם" — Frank Ruhl Libre, large
"7 הודעות חתומות מאנשים שאוהבים אתכם" — Heebo 400
Countdown card (cream, rounded): "הפתיחה הבאה: בעוד 312 ימים / 14 ספטמבר 2025"
List of locked message cards:
  Gold padlock icon + message type emoji + message type label
  "מאת: [GuestName]"
  "נפתח בעוד X ימים"
  Slight translucency/blur effect to emphasize sealed state

UNLOCKED STATE (Anniversary):
"ברוכים השבים! שנה למזל טוב שלכם 💕" — Frank Ruhl Libre, warm
Open envelope brand asset
Unlocked messages: Frank Ruhl Libre for the message content (feels like reading a letter)
Each unlocked card: envelope-open style, cream background, warm border
  Message type emoji + author + date written
  Full message content in Frank Ruhl Libre

PALETTE: Cream #F6F1E8, gold #C5A46D, dark #1C1008
FONTS: Frank Ruhl Libre (message content, emotional moments) + Heebo (labels, dates)
RTL: always.
EMOTIONS: "This is a ritual. Reading these messages made me cry with joy."
```

---

### PROMPT 5 — Post-Event Survey

```
Design a complete mobile post-event survey in Hebrew (RTL) for "רגע לפני" wedding platform.

CONTEXT: ~1 year after the wedding, the couple receives a message asking them to rate their experience. This is the last touch point. The tone should be warm, personal, and celebratory — like a friend asking "how did it go?"

DIRECTION: Warm Romantic — celebratory, warm, personal.

SCREENS TO DESIGN:
1. Loading (branded)
2. Form screen
3. Done screen (with referral)

FORM SCREEN:
Warm wildflower brand asset at top
"מזל טוב על חתונת [CoupleName]" — Frank Ruhl Libre
"עבר כמעט שנה. איך הלך?" — Heebo 500
Section: "הדרגו את החוויה" (muted label)
5 gold stars — large, tap-able (each fills gold when selected)
Emoji reaction below stars: 1=😔 2=😐 3=🙂 4=😊 5=🥹
After rating: textarea appears with prompt "ספרו לנו רגע אחד שזכרתם ממנו..."
Textarea: cream background, no border box, underline style
CTA: "שלחו" — gold, full width (disabled until rated)

DONE SCREEN:
Warm celebratory brand asset
"תודה!" — Frank Ruhl Libre, large
"זה מה שעוזר לנו לשרת את הזוג הבא" — Heebo 400
Referral section:
  "הכירו לנו זוג אחד שהחתונה שלו בפתח"
  Referral code card: cream background, code prominent, copy button
  Share button: native share with pre-written message

PALETTE: Cream #F6F1E8, gold #C5A46D, dark #1C1008
FONTS: Frank Ruhl Libre (emotional moments) + Heebo (body)
RTL: always. Zero navigation chrome.
EMOTIONS: "This feels warm. They care about us. I want to help them."
```

---

*Experience 2 Design Pack | 5 Stitch prompts ready | Chief of Staff | 2026-06-26*
*Next: CEO runs in Stitch → returns designs → Design Review*

# State Specifications — Empty, Error, Loading
## רגע לפני | Engineering Source of Truth | 2026-06-27
## Every state must be as warm as the default state. No blank screens. No raw browser errors.

---

# TIME CAPSULE STATES — POST-UNLOCK (External Validation R4)

## TC-01 — Anniversary Reached, Not Yet Opened

**Trigger:** `days_until_unlock <= 0` AND couple has not accessed the page since unlock

```
[Gold confetti burst — 3 seconds on first visit]
[Unlock animation: padlock opens, SVG transition 600ms]
"הגיע הזמן! 🎉" — Frank Ruhl Libre 700 32px gold, centered
"שנה לחתונה שלכם — פתחו את הקפסולה" — Heebo 300 16px muted, centered
[GoldCTA lg fullWidth: "פתחו את הקפסולה"]
```

Server-side: `/api/time-capsule/[token]` returns full `blessing_text` when `unlock_date <= today`.

---

## TC-02 — Already Opened (Return Visit After Unlock)

**Trigger:** `days_until_unlock <= 0` AND couple has previously accessed since unlock

```
[Full blessing cards — unblurred, full content visible]
"הברכות שלכם — ליום השנה" — Frank Ruhl Libre 700 28px dark
[Masonry blessing cards, cream background, full text]
[GoldCTA secondary: "שתפו את הקפסולה"]
```

No animation on repeat visits — content is immediately visible.

---

## TC-03 — Account Exists But Event Deleted

**Trigger:** token valid but event no longer exists

```
[BotanicalDivider branch]
"האירוע הזה כבר לא פעיל" — Frank Ruhl Libre 700 24px dark, centered
"הברכות שמורות בלבנו 💛" — Heebo 300 14px muted, centered
[No CTA — terminal graceful state]
```

No error language. Warm resolution of a deleted event.

---

# FREE TIER PAYWALL STATES (External Validation R5)

## FT-01 — Guest Limit Reached (50 guests)

**Trigger:** `guests.count === 50` on free tier, couple attempts to add guest

**Alert bar (sticky top of guest center):**
```
WarmAlertCard urgency='high':
"הגעתם ל-50 אורחים — מגבלת החבילה הבסיסית"
"שדרגו לפרימיום להוסיף אורחים ללא הגבלה ← [₪299 חד-פעמי]"
```

**What remains accessible at the limit:**
- All 50 existing guests: fully accessible, editable, viewable ✅
- WhatsApp sends to 50 guests: allowed ✅
- RSVP tracking for 50 guests: continues ✅
- Adding guest #51: blocked — add button shows upgrade modal instead

**Upgrade modal (triggered by "+ הוסיפו אורח" tap at limit):**
```
[Modal: cream background, 16px radius, 480px wide]
"שדרגו לפרימיום" — Frank Ruhl Libre 700 24px dark
"כלל החתונות הגדולות בישראל מעל 50 אורחים" — Heebo 300 14px muted
---
[Feature comparison: basic vs premium — concise, 5 rows]
"₪299 תשלום חד-פעמי בלבד" — Frank Ruhl Libre 700 24px gold
[GoldCTA lg fullWidth: "שדרגו עכשיו →"]
[text link: "המשיכו עם 50 האורחים הנוכחיים" — dismisses modal]
```

## FT-02 — Approaching Limit Warning (45 guests)

**Trigger:** `guests.count === 45` on free tier

**Single-time WarmAlertCard urgency='low' (dismissable):**
```
"45 מתוך 50 אורחים — 5 מקומות נותרו בחבילה הבסיסית"
"שדרגו לפרימיום לפני שמלאי הרשימה" — text link
```

Shown once. Dismissed to localStorage. Not shown again until limit reached.

---

# EMPTY STATES

## ES-01 — Guest List Empty (Couple Area)

**Trigger:** `guests.length === 0` on couple guest center

```
[BotanicalDivider sprig md — centred]
"עדיין אין אורחים" — Frank Ruhl Libre 700 24px --color-dark, centred
"הוסיפו את המוזמנים שלכם" — Heebo 300 14px --color-muted, centred
[GoldCTA lg fullWidth: "+ הוסיפו אורח ראשון"]
[text link: "ייבוא מ-Excel", centred]
```

---

## ES-02 — Gallery Empty

**Trigger:** `gallery_photos.length === 0`

```
[BotanicalDivider branch md — centred]
"התמונות בדרך..." — Frank Ruhl Libre 700 24px --color-dark, centred
"שתפו את הגלריה עם האורחים" — Heebo 300 14px --color-muted, centred
[GoldCTA: "העלו תמונה ראשונה"]
[text link: "שתפו קישור לגלריה"]
```

---

## ES-03 — Checklist Empty (custom tasks, post-seed)

**Trigger:** `tasks.length === 0` after initial seeding (should rarely occur — initial tasks are always seeded)

**Note:** The initial task seed runs on event creation. This empty state is fallback only.

```
"אין משימות כרגע" — Heebo 300 16px --color-muted, centred
[GoldCTA sm: "+ הוסיפו משימה"]
```

---

## ES-04 — Memory Wall Empty

**Trigger:** `memories.length === 0` (no photos or blessings)

```
[BotanicalDivider wreath sm — centred]
"קיר הזכרונות מחכה לכם" — Frank Ruhl Libre 700 22px --color-dark, centred
"שתפו עם האורחים ותנו להם לשמור את הרגעים" — Heebo 300 14px --color-muted, centred
[GoldCTA: "שתפו עם האורחים"]
```

---

## ES-05 — Seating Floor Plan Empty (all unassigned)

**Trigger:** `seating_assignments.length === 0` with guests present

```
[Centred in left panel of seating page]
"גררו אורחים לשולחנות" — Heebo 400 16px --color-muted, centred
[Arrow illustration pointing right — toward the unassigned guest panel — 40px SVG, --color-border-default]
```

This empty state coexists with the floor plan grid (which shows empty table cards) — it is only the instruction text.

---

## ES-06 — Time Capsule Empty (no contributions)

**Trigger:** `capsule_items.length === 0`

```
[Gold padlock SVG — 60px, centred]
"הקפסולה ריקה" — Frank Ruhl Libre 700 24px --color-dark, centred
"הזמינו את האורחים לכתוב מכתב לזוג" — Heebo 300 14px --color-muted, centred
[GoldCTA: "שתפו קישור"]
```

---

## ES-07 — Admin No Events

**Trigger:** `events.length === 0` on admin dashboard

```
[BotanicalDivider sprig — centred, 60px]
"אין אירועים עדיין" — Frank Ruhl Libre 700 24px --color-dark, centred
"צרו את האירוע הראשון" — Heebo 300 14px --color-muted, centred
[GoldCTA: "+ צרו אירוע חדש"]
```

---

## ES-08 — Vendor List Empty (Couple Area)

**Trigger:** `vendors.length === 0`

```
"עדיין אין ספקים" — Heebo 300 16px --color-muted, centred
"הוסיפו את הספקים שלכם לעקוב אחרי תשלומים ופגישות" — Heebo 300 13px --color-muted, centred
[GoldCTA sm: "+ הוסיפו ספק"]
```

---

# ERROR STATES

## ER-01 — Invalid RSVP Token

**Trigger:** `/api/rsvp/[token]` returns 404

**Full-screen, no navigation:**
```
[Ivory background, full height]
[BotanicalDivider branch — centred, 60px]
"הקישור אינו תקין" — Frank Ruhl Libre 700 24px --color-dark, centred
"בקשו מהזוג לשלוח לכם קישור חדש 💛" — Heebo 300 16px --color-muted, centred
[No CTA — guest cannot self-resolve this error]
```

---

## ER-02 — Gallery Load Failure

**Trigger:** Gallery API returns 500 or network timeout

```
[WarmAlertCard urgency='high']
"לא הצלחנו לטעון את הגלריה"
"בדקו חיבור לאינטרנט ונסו שוב"
[Retry button inline in card]
```

Retry: re-fetches gallery data without page reload.

---

## ER-03 — WhatsApp Send Failure

**Trigger:** WhatsApp wa.me link fails to open (blocked by browser, popup blocked)

```
[WarmAlertCard urgency='medium']
"הדפדפן חסם את הפתיחה"
"לחצו על מספר הטלפון ישירות כדי לשלוח ידנית"
[Show phone number plain text]
```

---

## ER-04 — Dashboard Data Load Failure

**Trigger:** `/api/couple/[token]/briefing` returns error

```
[WarmAlertCard urgency='high', sticky at top of page]
"לא הצלחנו לטעון את הנתונים שלכם"
"נסו לרענן את הדף"
[Retry link: "רענון" — triggers page reload]
```

The dashboard still renders its layout skeleton — the error does not prevent seeing the page structure.

---

## ER-05 — Seating Save Failure

**Trigger:** Seating batch save API returns error

```
[WarmAlertCard urgency='high', appears at top of seating page]
"לא הצלחנו לשמור את ההושבה"
"השינויים לא אבדו — נסו שוב"
[Retry CTA in card]
```

Important: the local drag-and-drop state is preserved. Do NOT clear assignments on save failure.

---

## ER-06 — Form Submission Failure (Generic)

**Trigger:** Any form POST/PATCH returns 500 or network error

```
[WarmAlertCard urgency='medium', above submit button]
"משהו השתבש"
"נסו שוב, ואם הבעיה ממשיכה — פנו אלינו"
```

Form remains filled — user does not lose their input.

---

## ER-07 — 404 Page (Invalid URL)

**Full-page:**
```
[Ivory background]
[BotanicalDivider sprig — centred, 80px]
"הדף לא נמצא" — Frank Ruhl Libre 700 32px --color-dark, centred
"נראה שהגעתם לעמוד שלא קיים" — Heebo 300 16px --color-muted, centred
[GoldCTA lg: "חזרו לדף הבית"]
```

---

## ER-08 — Unauthorized Admin Access

**Trigger:** Admin page accessed without valid admin token

**Full-page redirect to:**
```
[Admin login page]
"כניסה לניהול" — Frank Ruhl Libre 700 32px dark
[FloatingLabelInput: "קוד גישה" type=password]
[GoldCTA lg fullWidth: "כניסה"]
```

No error message on initial load — only on failed login attempt:
```
[WarmAlertCard urgency='high']
"קוד הגישה שגוי"
```

---

## ER-09 — Photo Upload Failure (Memory Vault) — Fix P1-004, 2026-06-28

**Trigger:** Guest attempts to upload a photo/video/audio/blessing in the memory vault (`/memory/[token]`) and the upload fails (network error, file too large, unsupported format, Supabase storage error).

**Inline error — below upload type selection, above CTA:**
```
[WarmAlertCard urgency='medium']
Icon: camera with X — 20px --color-status-urgent
"ההעלאה לא הצליחה"
Sub-text depends on error type:
  - Network error: "בדקו את החיבור לאינטרנט ונסו שוב"
  - File too large (>50MB): "הקובץ גדול מדי — מקסימום 50MB לתמונה, 200MB לסרטון"
  - Unsupported format: "הפורמט לא נתמך — נסו JPG, PNG, MP4 או MOV"
  - Generic: "משהו השתבש. נסו שוב"
[GoldCTA lg fullWidth: "נסו שוב" — re-triggers file picker]
[Text link below: "בחרו קובץ אחר"]
```

**Rules:**
- Form is NOT cleared on failure — user does not lose their blessing text
- File picker resets — user must re-select the file
- Error message is warm and specific — never "Error 500" or raw exception text
- Three retries are permitted before the "בחרו קובץ אחר" link becomes primary

---

## ER-10 — Time Capsule Unlock Failure — Fix P1-005, 2026-06-28

**Trigger:** Couple arrives at the time capsule on or after the anniversary date and the unlock API call fails (server error, network error, or token invalid).

This is an emotionally significant moment. The couple has waited a full year. A raw error state is not acceptable.

**Full-screen state:**
```
[Ivory background]
[BotanicalDivider wreath — centred, 80px]
"הקפסולה מחכה לכם..." — Frank Ruhl Libre 700 28px --color-dark, centred
"היה לנו קושי לפתוח אותה כרגע. נסו שוב בעוד רגע." — Heebo 300 16px --color-muted, centred
---
[GoldCTA lg: "נסו שוב" — retries the API call]
[Text link below: "פנו אלינו" → opens mailto:support@ragalifnei.co.il]
```

**Rules:**
- Auto-retry once after 3 seconds before showing the error to the user (reduces visible error rate for transient network failures)
- "נסו שוב" retries up to 3 times before suggesting contact
- The padlock illustration is NOT shown in this error state — showing a locked padlock when the unlock failed is emotionally misleading
- Log this error to Sentry with high severity: `sentry.captureException(error, { level: 'fatal', tags: { flow: 'time_capsule_unlock' } })`

---

# LOADING STATES

## LS-01 — RSVP Loading Screen
See E2-S1 — has dedicated branded loading screen.

## LS-02 — Couple Dashboard Loading

```
[Header skeleton: 200px wide grey bar — couple name]
[Arc circle skeleton: 120×120px grey circle, animate-pulse]
[2×2 grid: 4 cream card skeletons, 100px height each, animate-pulse]
[2 milestone row skeletons: full-width, 64px height, animate-pulse]
```

Duration: skeleton shows until all briefing data loaded. Max skeleton time: 5 seconds — if exceeds, show ER-04 error state.

## LS-03 — Gallery Loading

```
[Masonry grid: 6 cream rectangles — 2 columns]
Column 1: 180px rect | 130px rect | 200px rect
Column 2: 150px rect | 190px rect | 120px rect
[animate-pulse — warm cream on ivory, not grey on white]
```

## LS-04 — Admin Dashboard Loading

```
[4 KPI card skeletons: horizontal row, 120px height each]
[3 event card skeletons: full-width, 100px height each]
[animate-pulse]
```

## LS-05 — Guest Management Table Loading

```
[Toolbar skeleton: 400px + 200px bars]
[10 table row skeletons: full-width, 52px height, alternating ivory/cream]
```

## LS-06 — Seating Loading

```
[Right panel: 5 guest card skeletons, 64px height]
[Left panel: 3×4 grid of circular grey placeholders, 100px diameter]
[animate-pulse]
```

## LS-07 — Checklist Loading

```
[Arc skeleton: 120×120px grey circle, centred]
[3 category row skeletons: full-width, 48px height, with indented task line skeletons below]
```

---

# LOADING SKELETON — CSS SPECIFICATION

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-cream) 25%,
    #EDE8DF 50%,       /* slightly lighter warm tone */
    var(--color-cream) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
    background: var(--color-cream);
  }
}
```

---

*State Specifications v1.0 | Chief of Staff | 2026-06-27*
*All states must be implemented before any feature is considered complete.*
*"Empty" and "Error" are not edge cases — they are first-class product states.*

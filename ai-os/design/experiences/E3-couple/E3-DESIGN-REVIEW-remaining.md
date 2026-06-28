# Experience 3 — Couple Experience
## Design Review: Remaining Screens (Above-Fold, Onboarding, Wedding Day, Checklist, Guest Center, Post-Event)
## Chief of Staff | 2026-06-27

---

## Screen 1: Dashboard Above-Fold Hero
**Mobile 390px | Warm Romantic**

### Visual Review
- Header: "רגע לפני" logo right, hamburger left, notification bell
- "שלום ענבל ונדב" Frank Ruhl Libre 700 personal greeting — warm, immediate
- "יום שישי, 26 ביוני 2026" Heebo 400 date subtitle muted
- Hero countdown card: "נותרו עוד" / "47" Frank Ruhl Libre 900 gold 72px / "ימים לחתונה שלכם"
- Progress bar: "מוכנות: 71%" gold
- Dual stat chips: "89 מגיעים ✓" gold / "43 ממתינים ⏳" amber
- Section header: "אל תפסידו את הרגע הבא" leading into upcoming milestones

### QA
| Criterion | Score | Notes |
|---|---|---|
| First Impression | ✅ 10/10 | Greeting + countdown = immediately personal and urgent |
| Typography | ✅ 10/10 | "47" in Frank Ruhl Libre 900 gold is exactly right |
| Progress Signal | ✅ | 71% readiness visible without overwhelming |
| Stat Chips | ✅ | Gold + amber color coding communicates priority |
| RTL | ✅ | All elements correctly right-aligned |
| Brand Tokens | ✅ | Ivory bg, cream card, gold #C5A46D throughout |

### Verdict: **APPROVED** ✅
The "47" countdown is the strongest number in the product. Frank Ruhl Libre 900 at full scale makes it a ritual reveal every morning.

---

## Screen 2: Onboarding — Welcome Splash
**Mobile 390px | Botanical Illustration**

### Visual Review
- Botanical illustration: olive branches + white flowers, sage/cream tones — elegant, wedding-appropriate
- "WEDDING MANAGEMENT PREMIUM EVENTS & DESIGN" in gold ornate typography frame
- Clean ivory background, no navigation chrome

### QA
| Criterion | Score | Notes |
|---|---|---|
| Brand Tone | ✅ 9/10 | Botanical illustration matches brand DNA perfectly |
| Typography | ✅ | Ornate serif in gold — Frank Ruhl Libre family |
| First Impression | ✅ | "This company takes aesthetics seriously" is immediately clear |
| Hebrew Copy | ⚠️ | English text in design — implementation must use Hebrew |

### Implementation Note
The illustration is the approved design direction. Implementation uses same botanical illustration with Hebrew text: "ברוכים הבאים לרגע לפני" + "המקום שבו חתונה הופכת לחוויה שלמה".

### Verdict: **APPROVED** ✅ (direction approved, Hebrew copy in implementation)

---

## Screen 3: Onboarding — Date + Venue Step
**Mobile 390px | Warm Romantic**

### Visual Review
- "מתי ואיפה?" Frank Ruhl Libre 700 28px centered — perfect question framing
- 5 progress dots, dot 3 gold active
- 3 form fields cream bg: תאריך החתונה / שם האולם / כתובת האולם
- "יום שישי, 26 ביוני 2026" pre-filled with calendar icon
- Preview card: "107 ימים עד היום הגדול" gold — immediate emotional payoff
- Gold "המשיכו ←" full-width CTA

### QA
| Criterion | Score | Notes |
|---|---|---|
| Question Framing | ✅ 10/10 | "מתי ואיפה?" is natural Hebrew, warmly phrased |
| Emotional Payoff | ✅ 10/10 | 107-day countdown appears instantly after date entry |
| Progress Indicator | ✅ | 5 dots, step 3 active — user knows where they are |
| Form Design | ✅ | Cream fields, warm borders, correct field order |
| RTL | ✅ | Calendar icon left of date text (correct for RTL) |

### Verdict: **APPROVED** ✅

---

## Screen 4: Onboarding — Completion Celebration
**Mobile 390px | Celebration**

### Visual Review
- 💍 ring emoji large centered
- "הכל מוכן!" Frank Ruhl Libre 900 32px dark — decisive, celebratory
- "חתונת ענבל ונדב" Frank Ruhl Libre 700 gold italic — their creation, their name
- "26 ביוני 2026" + "107 ימים" — grounded celebration
- Checkmark summary: ✓ שמות הזוג / ✓ תאריך ואולם / ✓ לינק RSVP מוכן
- Gold "בואו נתחיל ←" CTA

### QA
| Criterion | Score | Notes |
|---|---|---|
| Emotional Peak | ✅ 10/10 | "הכל מוכן!" is decisive. "חתונת ענבל ונדב" in gold is the payoff |
| Completion Checklist | ✅ | 3 checkmarks summarize what they achieved |
| Typography | ✅ | Mix of Frank Ruhl Libre 900 + gold italic is on-brand |
| CTA | ✅ | "בואו נתחיל ←" is inviting, not commanding |

### Verdict: **APPROVED** ✅

---

## Screen 5: Checklist
**Mobile 390px | Warm Romantic**

### Visual Review
- "צ'קליסט החתונה" Frank Ruhl Libre 700 header
- Circular arc: 68% gold, "34 מתוך 50 משימות הושלמו"
- Category chips: "אולם וקבלת פנים" green / "אוכל ושתיה" amber — categorical progress
- Task rows: gold checkmarks for completed, cream circles for pending, due date chips
- "הוסיפו משימה +" gold outline CTA at bottom
- Bottom navigation bar with "צ'ק ליסט" active

### QA
| Criterion | Score | Notes |
|---|---|---|
| Progress Arc | ✅ 10/10 | Circular gold arc at 68% matches E3 dashboard pattern |
| Category Distinction | ✅ | Green=venue done, amber=catering in progress — intuitive |
| Task Rows | ✅ | Clean checkbox + label + date — not cluttered |
| Add Task | ✅ | Gold outline CTA — prominent without competing with tasks |

### Verdict: **APPROVED** ✅

---

## Screen 6: Guest Center
**Mobile 390px | Warm Romantic**

### Visual Review
- "החתונה שלנו" header + "מרכז האורחים" subtitle
- 4 stat filter chips: "120 כולם" / "89 מגיעים ✓" gold / "23 ממתינים ⏳" amber / 8 muted
- Search bar cream rounded
- Filter chips: הכל (active gold) / מגיע / ממתין / לא מגיע
- Guest cards with name + status pill + table assignment + action icons [📞 💬 ✏]
- Amber nudge: "43 אורחים עדיין לא שובצו → עברו להושבה"
- Bottom navigation active on "אורחים"

### QA
| Criterion | Score | Notes |
|---|---|---|
| Stat Summary | ✅ | 4 chips give instant overview before scrolling |
| Guest Cards | ✅ | Name + status pill + table number per row — all needed info |
| Status Hierarchy | ✅ | Gold=confirmed, amber=pending, muted=declined — consistent |
| Smart Nudge | ✅ 10/10 | Amber seating nudge is the product being proactive |
| Action Icons | ✅ | 3 per card: call, WhatsApp, edit — right tools |

### Verdict: **APPROVED** ✅

---

## Screen 7: Wedding Day Mode
**Mobile 390px | Special State**

### Visual Review
- Real couple under chuppah — warm golden hour photography as hero
- "היום הגדול הגיע!" overlay headline
- "חתונת ענבל ונדב" + date
- Event timeline: 16:00 קבלת פנים / 17:30 חופה / 18:15 ערב נישואין / 23:00 סיום
- 4 action buttons: אנשי קשר / נווט לאולם / רשימת שולחנות / גלריה חיה
- Hidden: all planning tools (budget, checklist, vendors) — correct

### QA
| Criterion | Score | Notes |
|---|---|---|
| Mode Differentiation | ✅ 10/10 | Looks completely different from normal dashboard — correct signal |
| Hero Photography | ✅ 10/10 | Couple under chuppah = emotionally accurate |
| Timeline | ✅ | 4 time points, clean vertical list with times |
| Action Buttons | ✅ | 4 relevant actions for wedding day only |
| Planning Hidden | ✅ | Budget/checklist/vendors not visible — focus mode |

### Verdict: **APPROVED** ✅
Wedding Day Mode is the most important screen in the product. This design honors it.

---

## Screen 8: Post-Event Dashboard
**Mobile 390px | Warm Romantic**

### Visual Review
- "✨ החתונה הייתה מושלמת!" Frank Ruhl Libre warm headline
- "ענבל ונדב | 26 ביוני 2026" gold muted
- Memory summary cream card: "120 אורחים שמחו איתכם · 47 תמונות הועלו · 38 ברכות נשמרו"
- 2×2 action grid: ברכות שקיבלנו / הגלריה שלנו / דרגו את הספקים / מתנות
- Couple wedding photo — personal, celebratory
- Personal closing message from רגע לפני

### QA
| Criterion | Score | Notes |
|---|---|---|
| Emotional Tone | ✅ 10/10 | "הייתה מושלמת" — past tense, celebratory |
| Memory Summary | ✅ | Numbers make the event feel documented and real |
| Actions | ✅ | Ratings, gallery, blessings, gifts — the right post-event actions |
| Couple Photo | ✅ | Most personal element — the wedding itself |
| Closing Message | ✅ | Personal note from the product — elegant exit |

### Verdict: **APPROVED** ✅

---

## New Patterns Confirmed — E3

**Wedding Day Mode as Full State Override:** When `daysLeft === 0`, the entire dashboard is replaced by a mode-specific view — different photography, different nav, different actions. Planning tools are hidden.

**Post-Event as Memory Archive:** When `daysLeft < 0`, dashboard becomes a memory archive + ratings portal. Tone shifts from anticipation to celebration.

**Onboarding Emotional Payoff:** Every onboarding step provides immediate emotional return (countdown appears after date entry, couple names appear live as typed).

---

*E3 Couple Experience Design Review — 8 screens | All APPROVED | Chief of Staff | 2026-06-27*

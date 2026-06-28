# First-Time User Review — Reality Check
## רגע לפני | Persona-Based Usability Simulation | 2026-06-27
## Required by CEO Directive before Design Freeze is eligible.

---

## Method

Five personas walk through their primary flow. The reviewer simulates the perspective of each persona: their level of technical confidence, their emotional state, their goals, their likely confusion points.

**Measures per persona:**
1. First Impression — what do they think in the first 3 seconds?
2. Ease of Understanding — can they identify the next action without help?
3. Trust — does the product feel safe and professional?
4. Emotional Response — how do they feel?
5. Confusion — where do they hesitate or ask a question?
6. Time to Complete Task — estimated mental effort (taps, decisions, reading)
7. Delight — is there a moment that exceeds expectation?
8. Friction — what slows them down or stops them?

**Severity ratings:**
- 🔴 **CRITICAL** — blocks task completion. Enters OPP backlog as P0.
- 🟠 **MAJOR** — significant friction, likely to cause drop-off. P1.
- 🟡 **MINOR** — small friction, noticeable but not blocking. P2.
- 🟢 **POSITIVE** — delight moment or exceeds expectation.

---

# PERSONA 1 — NEWLY ENGAGED COUPLE

**Profile:** Dana & Yoni, 28 & 31. Engaged 3 weeks ago. Dana uses apps daily, Yoni is moderately technical. They find רגע לפני through a friend's recommendation. They're excited, slightly overwhelmed. They access from Dana's iPhone 14 on Saturday afternoon.

**Primary Flow:** Landing → Registration → Onboarding (Welcome → Names → Date+Venue → Guest Import → Celebration) → Couple Dashboard (first view)

---

### E1-S2 — Mobile Landing Page

**First Impression (3 seconds):**
"This is a wedding app. It looks expensive. The photo is beautiful. What do we do?"

**Ease of Understanding:**
The gold CTA "התחילו עכשיו" is the obvious next step. ✅

**Trust:**
Photography of a real Mediterranean garden wedding. "800+ זוגות" social proof. ✅ Premium but approachable.

**Emotional Response:**
Dana: "Oh, this is pretty." The warm photography evokes the right emotion immediately. 🟢

**Confusion:**
🟡 MINOR — "ראו דוגמה" (secondary CTA) — Dana's instinct is to tap the gold button. The secondary CTA may be ignored. This is acceptable — the secondary CTA is optional by design.

**Delight:**
🟢 The photography quality exceeds the expectation for an Israeli app. First impression is "this is serious."

**Time to Task:** 1 tap to registration.

**Friction:** None critical.

---

### E1-S3 — Registration

**First Impression:**
Form. Names, email, phone, password. Standard.

**Ease of Understanding:**
FloatingLabelInput pattern is clear. Hebrew labels float correctly. ✅

**Trust:**
🟡 MINOR — There is no privacy assurance copy near the phone field. Dana pauses: "Why do they need my phone number?" Israeli users are sensitive about phone sharing after Pegasus. **Opportunity: add 1-line reassurance: "הטלפון שלך לשימוש בלעדי לאימות — לא לשיווק."**

**Confusion:**
🟡 MINOR — Password field. Is it for the couple's account only, or also for guests? First-time users wonder about the scope.

**Friction:**
🟡 MINOR — Phone validation: does the form accept `052-1234567` vs `0521234567` vs `+972521234567`? The spec says "Israeli format auto-formatting" but the happy path should be unambiguous.

---

### E3-S1 — Welcome Splash (Hebrew version, e3_welcome_v2.png)

**First Impression:**
Botanical illustration. "ברוכים הבאים לרגע לפני". "בואו נתחיל". Clean.

**Emotional Response:**
🟢 The botanical illustration on ivory is distinctly Israeli without being generic. Dana says "this is our vibe."

**Ease of Understanding:**
One CTA. One thing to do. ✅

**Friction:** None.

---

### E3-S2 — Onboarding Names

**First Impression:**
"שמות הזוג" — enter names.

**Ease of Understanding:**
Two fields. Simple. ✅

**Confusion:**
🟡 MINOR — Which name goes first? In Hebrew, is it Bride → Groom or Groom → Bride? The spec says "Dana & יוני" in examples (bride first). The field labels should specify: "שם הכלה" and "שם החתן" — not generic "שם ראשון."

**Delight:**
None at this step — which is correct. This is a data step, not an emotional one.

---

### E3-S3 — Onboarding Date + Venue

**Ease of Understanding:**
Date picker, venue name. ✅

**Confusion:**
🟡 MINOR — Date picker: is the countdown shown immediately after selecting the date? The spec says yes (live countdown appears in title area). If this is implemented, it creates a strong motivational moment: "78 יום!" This should be visually prominent, not a small number.

**Delight:**
🟢 If the countdown appears live as the date is entered, this is the first "wow" moment of the product. It is the moment the countdown becomes personal.

---

### E3-S4 — Onboarding Guest Import (e3_onboarding_import.png)

**First Impression:**
3 option cards. Import from contacts, Excel, or manually.

**Ease of Understanding:**
🟠 MAJOR — Yoni (less technical): "What's Excel? Does it mean a Google Sheet?" The word "Excel" without context creates confusion for users who do not use desktop spreadsheets. **Recommendation: change label to "ייבוא מקובץ" with sub-text "Excel, Google Sheets, CSV".**

**Trust:**
🟡 MINOR — "ייבוא מאנשי קשר" is the most-tapped option but implies the app accesses all contacts. Dana hesitates: "Will it upload all my contacts?" A reassurance is needed: "בוחרים מי נכנס — לא מעלים הכל."

**Confusion:**
🔴 CRITICAL (LOW SEVERITY) — Dana does not know she can skip this step. The "דלגו להמשך" text link is present but visually subordinate. For a couple with no guest list yet (first day of engagement), this step has no right answer. The skip option must be equally visible to the 3 import options. **Fix: "אין רשימה עדיין — דלגו לשלב הבא" as a 4th card, styled as an outline card, equal visual weight.**

**Friction:**
🟠 MAJOR — The "המשיכו" CTA is disabled until one option is chosen. A couple who reads all 3 options and decides they want to "do it later" is stuck. The disabled CTA does not explain why it is disabled. **Fix: tooltip or inline copy: "בחרו אפשרות כדי להמשיך — או דלגו למטה."**

---

### E3-S5 — Onboarding Celebration

**First Impression:**
Gold confetti. "ברוכים הבאים, Dana ויוני! החתונה שלכם מתחילה כאן."

**Emotional Response:**
🟢 STRONG DELIGHT. This is the product's first true emotional peak. The couple name appearing in gold italic for the first time creates a personal connection. This moment must be implemented with animation — a static screen is not enough.

**Friction:** None.

---

### E3-S6 — Couple Dashboard (First View)

**First Impression:**
Big gold number. Countdown. "78 יום".

**Emotional Response:**
🟢 DELIGHT. The countdown in Frank Ruhl Libre 900 at 80px is immediately impactful. The first thing they see is "78 יום" in warm gold on ivory. This works.

**Ease of Understanding:**
🟡 MINOR — "מה הצעד הבא?" card shows the first recommended action. But for a new couple with no guests, no tasks completed, and no vendors — the "next action" may be generic. Is it personalised to their stage? If "הוסיפו אורח ראשון" appears when they just skipped guest import, the recommendation must acknowledge their state: "מתי רוצים להתחיל עם רשימת האורחים?"

**Confusion:**
🟡 MINOR — Bottom nav: 4 tabs ("בית", "אורחים", "משימות", "עוד"). A first-time user does not know what "עוד" contains. This is acceptable for BottomNav — "more" is a universal pattern. But the first time a user taps "עוד" and sees a chaotic list, trust breaks. The "עוד" bottom sheet must be excellent.

**Delight:**
🟢 The readiness arc at 12% (new couple) with "אתם בתחילת הדרך" copy is the right emotional frame. Not "you've done nothing" — "you're beginning."

---

**COUPLE PERSONA VERDICT**

| Measure | Rating | Notes |
|---|---|---|
| First Impression | 🟢 9/10 | Photography + gold CTA works immediately |
| Ease of Understanding | 🟡 7/10 | Guest import step has friction |
| Trust | 🟡 7/10 | Phone field and contacts access need reassurance copy |
| Emotional Response | 🟢 9/10 | Celebration + countdown delight |
| Confusion | 🟠 5/10 | Excel label, disabled CTA unexplained, skip option subordinate |
| Time to Complete | 🟢 8/10 | 6 screens, all fast except import decision |
| Delight | 🟢 9/10 | Celebration screen is the standout moment |
| Friction | 🟠 6/10 | Guest import is the bottleneck |

**Highest risk:** E3-S4 Guest Import — two MAJOR issues, one CRITICAL (skip option visibility).

---

# PERSONA 2 — WEDDING GUEST

**Profile:** Moshe, 67. Bride's uncle. Received a WhatsApp message from his niece: "💍 משפחה וחברים יקרים! לחצו לאישור הגעה ←". He taps the link. He is on an Android (Samsung) device. He has never used a wedding app. He wants to confirm he's coming with his wife. That's it.

**Primary Flow:** RSVP Loading → Invitation → RSVP Form → Confirmed

---

### E2-S1 — RSVP Loading

**First Impression:**
Animated botanical illustration on ivory. Loading. No text explaining what is happening.

**Confusion:**
🟡 MINOR — Moshe has tapped a link in WhatsApp. The phone is showing a screen with flowers on it. For 1.5 seconds he doesn't know if the link worked. The loading screen needs a single line of copy: "טוענים את ההזמנה שלך..." — immediately reassures that something is happening.

**Trust:**
🟡 MINOR — Is this a real wedding site or a phishing link? The branded loading screen with the couple's event name (once loaded) resolves this. But the 1.5-second gap before the name appears creates brief doubt.

---

### E2-S2 — RSVP Invitation

**First Impression:**
Couple photo. Couple names in large gold text. Event date. Location. "Dana & יוני מזמינים אתכם לחתונתם".

**Emotional Response:**
🟢 Moshe: "Oh, this is beautiful. This is better than a paper invitation." Strong delight from a non-technical user.

**Trust:**
🟢 Full event details visible. Couple photo. Location. Date. This is real.

**Ease of Understanding:**
Large "כן, אגיע! ✓" and smaller "לא אוכל להגיע" — two clear options.

**Confusion:**
🟡 MINOR — "לא אוכל להגיע" — for Moshe, this carries emotional weight. He IS coming. But he wonders: "What if I change my mind?" There is no visible "I'll update later" option. This is intentional design — but a first-time guest doesn't know that. Consider adding microcopy: "אפשר לעדכן מאוחר יותר" near the decline button to reduce anxiety about committing.

**Friction:** None for the confirm flow.

---

### E2-S3 — RSVP Form

**First Impression:**
Three fields: שם מלא, טלפון, כמה מגיעים. Plus "הערות".

**Ease of Understanding:**
🟡 MINOR — Moshe fills in his name. Then his phone. Then "כמה מגיעים" — a number spinner. He wants to add 2 (himself + his wife). Does "2" mean 2 additional guests, or 2 total including himself? The label must be explicit: "כמה אנשים מגיעים (כולל אתך)?"

**Trust:**
🟡 MINOR — Moshe wonders: "Why do they need my phone number?" Same concern as couple registration. Reassurance: "הטלפון רק לתיאום ישיר עם הזוג."

**Friction:**
🟡 MINOR — Android keyboard: Hebrew input is fine for name. Phone number field — if keyboard defaults to Hebrew letters instead of numeric, Moshe is confused. The `inputMode="numeric"` or `type="tel"` attribute must force numeric keyboard.

---

### E2-S4 — Confirmed State

**First Impression:**
"✅ Dana ויוני שמחים שתגיע!" Gold confetti animation.

**Emotional Response:**
🟢 DELIGHT. "אנחנו שמורים לך מקום." Moshe feels acknowledged personally. The couple name in the copy creates emotional warmth.

**Delight:**
🟢 Calendar CTA: "הוסף ליומן". Moshe taps this. It creates a calendar event on his Android. This is a genuinely useful feature delivered at exactly the right moment.

**Time to Complete:** 4 taps total from WhatsApp link to "Confirmed." Excellent.

---

**GUEST PERSONA VERDICT**

| Measure | Rating | Notes |
|---|---|---|
| First Impression | 🟢 9/10 | Couple photo immediately establishes trust |
| Ease of Understanding | 🟢 8/10 | Two CTAs are unmistakable |
| Trust | 🟡 7/10 | Phone field needs reassurance; loading screen needs 1 line of copy |
| Emotional Response | 🟢 9/10 | Confirmed state is a genuine delight moment |
| Confusion | 🟡 6/10 | "כמה מגיעים" ambiguous; phone keyboard issue |
| Time to Complete | 🟢 9/10 | 4 taps is excellent |
| Delight | 🟢 9/10 | Couple photo + confetti + calendar CTA |
| Friction | 🟡 7/10 | Minor friction in form only |

**Verdict: The RSVP flow is very strong. Two MINOR copy/attribute issues. No blockers.**

---

# PERSONA 3 — PARENT OF THE BRIDE

**Profile:** Miriam, 58. Dana's mother. She is not the primary account holder but Dana gave her access to "help manage." She uses WhatsApp, Instagram, and basic apps. She does not use a computer — only an iPhone 11. She wants to see the guest list and add her sister who was forgotten.

**Primary Flow:** Couple Dashboard → Guest Center → Add Guest

---

**Dashboard:**
🟡 MINOR — Miriam lands on the dashboard. She sees the countdown (78 days), the readiness arc, and 4 bottom nav tabs. She wants "the list of guests." She taps "אורחים" in the bottom nav. ✅

**Guest Center:**
🟢 She sees the guest list. Filter chips: כולם | אישרו | ממתינים | סירבו. She understands.

**Add Guest:**
🟡 MINOR — She taps "+". A modal appears: שם, טלפון, צד (Bride/Groom), מספר סועדים. She fills it in. The phone field: does it validate Israeli format? She types "052 555 3344" with a space. Does the form accept this?

**Confusion:**
🟠 MAJOR — "צד" (side). Miriam does not know if this means "our side" or "their side." The placeholder text must be explicit: "צד החתן / צד הכלה." And the label "מיה מגיע?" should say "מספר אנשים שמגיעים מהרשומה הזו."

**Trust:**
🟢 She successfully adds her sister. She sees the confirmation. She feels capable. The product made her feel competent.

**PARENT PERSONA VERDICT:** Strong. One MAJOR clarity issue in the Add Guest form.

---

# PERSONA 4 — EVENT MANAGER

**Profile:** Dvir (admin). Using the admin panel on a 13" MacBook. Needs to: view all events, find a specific couple, check their RSVP status, and send a WhatsApp reminder to pending guests.

**Primary Flow:** Admin Dashboard → Event Detail → Guest Management → WhatsApp Center

---

**Admin Dashboard (E4-S1):**
🟢 Event cards. RSVP %, countdown per event, progress arc. Information-dense but readable.

**Guest Management (E4-S3):**
🟢 Table with search, filter, Excel export. Efficient.

**WhatsApp Center (E4-S2):**
🔴 CRITICAL — The wizard flow has 4 steps. Dvir is in a hurry. He wants to send to pending guests only. In Step 2 (Audience), "ממתינים" filter exists. But after selecting the template in Step 1 and the audience in Step 2, he wants to go back to Step 1 to change the template. **Is there a back button in the wizard?** The spec describes a 4-step wizard with "המשיכו ←" but does not specify a "חזרה" action. If the wizard is linear-only (no back), Dvir must start over to change template. **This is a P1 friction issue for daily admin use.**

**WhatsApp Center sending:**
🟡 MINOR — After queueing messages, the send step shows a wa.me link per guest. For an event with 200 pending guests, Dvir must tap 200 wa.me links manually. This is the intended behavior (wa.me is the only WhatsApp API available without business API access), but the UX of 200 individual taps is brutal. The spec should clarify: wa.me is for small sends; larger sends require a batch decision explained in the UI.

---

**EVENT MANAGER PERSONA VERDICT**

🔴 CRITICAL: WhatsApp wizard has no "back" navigation — blocks efficient workflow.
🟡 MINOR: wa.me batch limitations not surfaced to admin.

---

# PERSONA 5 — NON-TECHNICAL USER

**Profile:** Rami, 72. Groom's grandfather. Was asked by the family to "just confirm yes or no." He has an Android tablet (older Samsung). He uses YouTube and WhatsApp. He received the RSVP link via WhatsApp.

**Primary Flow:** RSVP Loading → Invitation → Decision

---

**E2-S1 — Loading:**
🟡 MINOR — The botanical illustration loads. Rami waits. If the loading takes more than 2 seconds on his older device, he may tap the back button. **The loading screen needs a visible, branded reason to wait.** "מכינים את ההזמנה שלך..." with a warm animation.

**E2-S2 — Invitation:**
**First Impression:**
On his older Android tablet (768px width), the invitation renders. Does the layout adapt to tablet width? Currently: no tablet Stitch design exists. **The invitation may render as a narrow mobile column in the centre of a large tablet screen.** 

🔴 CRITICAL (CONFIRMED): For Rami's 10" Samsung tablet, the RSVP Invitation has no tablet breakpoint. The mobile layout will render at 375px width centred on a 768px screen. This looks broken. **(This confirms OPP-010 — tablet RSVP — as P1.)**

**CTAs:**
On tablet: the two CTA buttons are large enough to tap (the mobile layout has 56px CTAs). ✅ Even at 375px column, the buttons work.

**Form:**
On tablet: the form renders correctly. ✅

---

**NON-TECHNICAL USER PERSONA VERDICT**

🔴 CRITICAL: Tablet layout for RSVP Invitation is broken (375px column on a 768px tablet). Confirms OPP-010.
🟡 MINOR: Loading screen needs reassurance copy for slow connections.

---

# CONSOLIDATED FINDINGS

## Critical Issues (P0 — Must Fix Before Design Freeze)

| # | Issue | Persona | Screen | Opportunity |
|---|---|---|---|---|
| C1 | RSVP tablet layout broken at 768px width | Rami (non-technical) | E2-S2 | OPP-010 |
| C2 | WhatsApp Center wizard has no back navigation | Dvir (admin) | E4-S2 | New: OPP-011 |

## Major Issues (P1 — Fix Before Design Freeze)

| # | Issue | Persona | Screen | Opportunity |
|---|---|---|---|---|
| M1 | Guest import skip option not visually equal to import options | Dana (couple) | E3-S4 | OPP-007 |
| M2 | "Excel" label confusing for non-spreadsheet users | Yoni (couple) | E3-S4 | OPP-007 |
| M3 | "כמה מגיעים" — ambiguous (total or additional?) | Moshe (guest) | E2-S3 | OPP-001 |
| M4 | "צד" label — "Bride/Groom side" not self-explanatory | Miriam (parent) | E3-S9 / Add Guest modal | OPP-004 |

## Minor Issues (P2 — Improvement but not blocking)

| # | Issue | Persona | Screen | Recommendation |
|---|---|---|---|---|
| m1 | Phone field needs reassurance copy | Dana + Moshe | E1-S3 + E2-S3 | "לא נשתמש בטלפון לשיווק" |
| m2 | Loading screen needs 1 line of copy | Moshe / Rami | E2-S1 | "מכינים את ההזמנה שלך..." |
| m3 | "כמה מגיעים" numeric keyboard on Android | Moshe | E2-S3 | `inputMode="numeric"` |
| m4 | wa.me batch limitation not surfaced | Dvir (admin) | E4-S2 | Explain batch limits in UI |
| m5 | "אפשר לעדכן מאוחר יותר" missing near decline CTA | Moshe | E2-S2 | Microcopy addition |
| m6 | Countdown appearance on date entry not confirmed | Dana | E3-S3 | Animate countdown on date pick |

## Delight Moments (Confirmed)

| Moment | Persona | Screen |
|---|---|---|
| Celebration screen — couple name in gold | Dana | E3-S5 |
| Photography quality — first landing | Dana | E1-S2 |
| Countdown "78 יום" first appearance | Dana | E3-S6 / E3-S3 |
| Confirmed state + calendar CTA | Moshe | E2-S4 |
| Botanical illustration — welcome | Dana | E3-S1 |

---

## New Opportunities Generated from Reality Check

**OPP-011 — WhatsApp Center Back Navigation**

| Field | Value |
|---|---|
| **Category** | UX · Navigation |
| **Impact** | 7 |
| **Confidence** | 9 |
| **Effort** | 2 |
| **ICE Score** | **31.5** |
| **Priority** | 🟠 P1 |

The WhatsApp Center 4-step wizard must support backward navigation. Admin users need to correct template selection without restarting. Fix: add "← חזרה" link above the wizard steps. Spec update: E4-SCREENS.md and COMPONENTS.md (wizard pattern).

---

## Reality Check Verdict

**Overall usability:** Strong. The core flows work. The delight moments are real and authentic.

**Blockers:** 2 — Tablet RSVP layout (Rami, C1) and WhatsApp wizard back navigation (Dvir, C2).

**Path to clear:** Both are spec-level fixes plus targeted Stitch iterations. Neither requires rearchitecting.

**Recommendation:** Fix C1 and C2 before Design Freeze eligibility. M1–M4 are pre-implementation spec corrections. m1–m6 are engineering-level details.

---

*First-Time User Review v1.0 | Chief of Staff | 2026-06-27*
*Required per CEO Directive — Opportunity-Driven Product Evolution.*
*Findings entered into Opportunity Backlog.*

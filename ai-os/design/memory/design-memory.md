# Design Memory — רגע לפני
## Permanent Pattern Library | Updated After Every Wave
## Chief of Staff | Started: 2026-06-26

---

> This document grows with every wave.
> No pattern is re-discovered. Every lesson is permanent.
> Always reference this before designing any new screen.

---

## TYPOGRAPHY

### Works Well
- **Frank Ruhl Libre 900 for couple/event names** — creates emotional weight and editorial authority. Users feel the name is treated with dignity. — Wave 1 / 2026-06-26
- **Frank Ruhl Libre for large numeral reveals** (table number, countdown) — the font's classical proportions make numbers feel ceremonial rather than functional. — Wave 1 / 2026-06-26
- **Heebo 400/500 for body text and labels** — comfortable Hebrew reading, neutral, pairs well with Frank Ruhl as a contrast system. — Wave 1 / 2026-06-26
- **Large serif headings + small Heebo labels** — the contrast creates clear hierarchy without needing borders, separators, or background color changes. — Wave 1 / 2026-06-26

### Avoid
- Heebo for emotional hero headlines — it reads too neutral for high-stakes moments like couple name or celebration headline. — Wave 1 / 2026-06-26
- All-caps Hebrew — works in English, fights the character forms in Hebrew. — Wave 1 / 2026-06-26
- English copy in the primary experience — breaks brand authenticity for Israeli users. Exception: wayfinding CTAs (Waze, Google Maps) where brand name is expected in English. — Wave 1 / 2026-06-26

---

## COLOR

### Works Well
- **Cream background (#F6F1E8, #FDFAF5)** — creates a physical paper / linen metaphor that pure white cannot. Reads as warmth, not as web form. — Wave 1 / 2026-06-26
- **Gold (#C5A46D) for primary CTA** — connotes celebration, not transaction. Significantly more appropriate for wedding context than green or blue. — Wave 1 / 2026-06-26
- **Dark (#1C1008) for secondary actions** — heavy enough to read clearly, warm brown rather than cold black. — Wave 1 / 2026-06-26
- **Ivory/cream gradient** — when transitioning between sections, a subtle ivory-to-cream gradient maintains warmth without visual interruption. — Wave 1 / 2026-06-26

### Avoid
- Pure white (#FFFFFF) as page background in wedding context — reads as hospital/form/digital, not paper/linen/invitation. — Wave 1 / 2026-06-26
- Green for primary CTAs in wedding screens — reads as traffic light / "submit" rather than celebration. — Wave 1 / 2026-06-26
- Blue in the warm romantic palette — immediately breaks the warmth. Only acceptable in mapped CTA contexts (Google Maps). — Wave 1 / 2026-06-26

---

## LAYOUT & STRUCTURE

### Works Well
- **Single-purpose screens with zero navigation chrome** — on guest-facing experiences (RSVP), removing all navigation maximizes emotional focus and completion rates. Physical analogy: a wedding invitation doesn't have a back button. — Wave 1 / 2026-06-26
- **Brand mark at top, content centered, primary CTA full-width at bottom** — this layout creates a natural downward reading flow that ends at the action. — Wave 1 / 2026-06-26
- **Generous vertical spacing between sections** — prevents the screen from feeling like a form and creates the breathing room that signals premium. — Wave 1 / 2026-06-26
- **Circular couple photo at top of form** — personal, warm, confirms this page was made for a specific couple (not generic). — Wave 1 / 2026-06-26

### Avoid
- Navigation bars (bottom nav, hamburger menus, tab bars) on guest-facing pages — guests have no account, no navigation destination, no reason to explore. Navigation chrome is noise. — Wave 1 / 2026-06-26
- Multiple competing CTAs at the same hierarchy level — the user must always know what the primary action is without thinking. — Wave 1 / 2026-06-26
- Busy layouts with many parallel elements — premium requires restraint. One thing at a time. — Wave 1 / 2026-06-26

---

## IMAGERY

### Works Well
- **Photography for emotionally loaded states** — using contextually appropriate photography (olive branch for decline, wedding rings/invitation for error, venue interior for confirmed) dramatically elevates the emotional quality of states that would otherwise be text-only. — Wave 1 / 2026-06-26
- **Static brand imagery as permanent assets** — a curated set of 4–6 warm, high-quality photos used consistently across all events creates a coherent brand aesthetic without requiring every couple to provide photos. — Wave 1 / 2026-06-26
- **Circular framing for couple/event photos** — natural, warm, focuses attention. Avoids harsh rectangular cropping. — Wave 1 / 2026-06-26

### Avoid
- Placeholder/generic imagery (gray rectangles, "image here" boxes) — if the image doesn't exist, design for the empty state gracefully. Never show a visible placeholder. — Wave 1 / 2026-06-26
- Photography that requires couple-specific content for secondary states (error, declined) — these states must always render beautifully regardless of whether the couple uploaded photos. — Wave 1 / 2026-06-26

---

## EMOTIONAL DESIGN

### Works Well
- **Ritual moments** — replicating physical-world wedding rituals digitally creates delight. The table number reveal replicates finding your seat card. The confirmation screen replicates reading your RSVP was received. — Wave 1 / 2026-06-26
- **Grace in the declined state** — when users must deliver disappointing information (declining an invitation), wrapping it in warmth and beauty reduces friction and preserves the relationship. Emotional generosity in design = trust. — Wave 1 / 2026-06-26
- **Personalization at the top** — the guest's family name displayed as "שמחים להזמין אתכם, משפחת כהן" creates the feeling of "this was made for me" before any interaction. — Wave 1 / 2026-06-26
- **Celebration that doesn't oversell** — the confirmed state celebrates warmly without being over-the-top. A ❤️ emoji, a gold table number, a gentle "תודה שאישרתם" — not confetti explosions and fireworks. — Wave 1 / 2026-06-26

### Avoid
- Excessive celebration animations (confetti cannons, particle explosions, bounce-bounce-bounce) — these read as game UI, not wedding. Subtle is premium. — Wave 1 / 2026-06-26
- Guilt-inducing declined state ("אוי, לא תבואו?") — creates negative emotion toward the couple. Warmth always. — Wave 1 / 2026-06-26
- Generic confirmation ("הטופס נשלח") — tells the user nothing about what happens next and creates no emotional payoff. — Wave 1 / 2026-06-26

---

## INTERACTION PATTERNS

### Works Well
- **Full-width primary CTA button** on mobile — large tap target, clear action, no ambiguity about what to press. — Wave 1 / 2026-06-26
- **Stepper for guest count (+/−)** — more natural than a dropdown for a number that changes by 1–2. Fewer taps, more intuitive. — Wave 1 / 2026-06-26
- **2×2 chip grid for meal selection** — visual options reduce cognitive load versus a dropdown. All options visible at once. — Wave 1 / 2026-06-26
- **Large choice cards for YES/NO** — the most important binary decision on the page deserves maximum visual weight. — Wave 1 / 2026-06-26

### Avoid
- Dropdowns for small option sets (< 5 options) — chips or cards are always more premium and faster. — Wave 1 / 2026-06-26
- Inline text input where chips are sufficient — text input creates friction and validation complexity. — Wave 1 / 2026-06-26

---

## RTL CONSIDERATIONS

### Works Well
- Stitch natively generates RTL-correct layouts when language is set to Hebrew — headings, labels, buttons, and form elements all flow correctly. — Wave 1 / 2026-06-26
- The Stitch HTML output includes `dir="rtl" lang="he"` from line 1 — no post-processing needed. — Wave 1 / 2026-06-26

### Watch For
- Icon positioning: some icons (arrows, chevrons) need to be mirrored for RTL. Stitch correctly uses Material Symbols which auto-mirror. Verify during implementation that custom SVG icons are flipped. — Wave 1 / 2026-06-26
- Alignment of mixed Hebrew+English content (Waze brand name, Google name) — keep brand names in LTR but ensure surrounding Hebrew text flows correctly. — Wave 1 / 2026-06-26

---

## LOADING STATES

### Works Well
- **Branded loading screen** (cream background + brand mark + subtle animated line) — converts a technical wait into a brand moment. Guests who see the loading screen see "רגע לפני" before they see anything else. — Wave 1 / 2026-06-26
- **Center-aligned minimal loading** — one brand mark, one animation, nothing else. Premium loading states are not busy. — Wave 1 / 2026-06-26

### Avoid
- Generic spinners on cream backgrounds — the contrast between a cold loading indicator and a warm page breaks immersion. — Wave 1 / 2026-06-26

---

---

## PROGRESS & DATA VISUALIZATION

### Works Well
- **Circular SVG arc with number at center** for high-stakes counts (RSVPs, completion %) — puts the achievement (number) first, percentage second. The circle frames the number as a focal point. — E3 / 2026-06-26
- **Frank Ruhl Libre 900 for the center number** in progress arcs — the serif typeface makes the count feel like a milestone, not a metric. — E3 / 2026-06-26
- **Supporting context in muted Heebo below the arc** — "31 ממתינים · 7 לא מגיעים" — provides completeness without competing with the primary number. — E3 / 2026-06-26

### Avoid
- Horizontal progress bars for emotional counts (RSVPs, confirmed guests) — they measure completion percentage, not achievement. — E3 / 2026-06-26
- Red/orange color for "incomplete" side of progress — creates alarm for what is a normal in-progress state. Use muted gray or cream for empty portion. — E3 / 2026-06-26

---

## ONBOARDING & PERSONALIZATION

### Works Well
- **Live name preview during onboarding** — showing "חתונת [שם] ו[שם]" in Frank Ruhl Libre italic gold, updating as the couple types, is the product's most important moment. It is not a UX feature; it is the value proposition in 3 seconds. — E3 / 2026-06-26
- **Preview in Frank Ruhl Libre italic, gold** — the combination of the serif italic + gold color signals "this is beautiful, this is real." — E3 / 2026-06-26
- **Heart icon in the preview card** — adds emotional resonance to the name preview without requiring photography. The heart + couple name = the product's brand promise. — E3 / 2026-06-26
- **Progress dots (5 max)** over step numbers — gentler than "Step 2 of 5." Dots suggest journey, numbers suggest checklist. — E3 / 2026-06-26

### Avoid
- Delaying the preview (debounce > 100ms) — the preview must feel instant. Any perceivable lag breaks the magic. — E3 / 2026-06-26
- Long onboarding flows (> 5 steps) — wedding couples are excited, not patient. Get to the dashboard as fast as possible. — E3 / 2026-06-26

---

## DASHBOARD PATTERNS

### Works Well
- **Personalized greeting as hero** ("שלום דביר", "ברוכים הבאים, ענבל ונדב") — establishes a human relationship before showing any data. Confirmed in both admin (E4) and couple (E3) contexts. — E3/E4 / 2026-06-26
- **2×2 equal-weight action grid** for navigation within a dashboard — gives all four key sections equal visual access, teaches the product's main verbs in one glance. — E3 / 2026-06-26
- **Warm assistant-style alert cards** — amber tint, conversational language ("שלחו תזכורת?"), never red, never clinical. — E3 / 2026-06-26
- **Milestone card with Frank Ruhl Libre countdown** — upcoming milestones (venue walkthrough, food tasting) should feel like anticipated events, not calendar items. Gold large text, warm card, button to add reminder. — E3 / 2026-06-26
- **Couple/event photo on admin cards** — visual recognition is 10× faster than name reading when managing multiple events. — E4 / 2026-06-26
- **Task list as persistent panel (desktop)** — admin's daily tasks should always be visible alongside event status. No click required. — E4 / 2026-06-26

### Avoid
- Tab navigation within a dashboard section (replaced by 2×2 grid for couple, sidebar for admin). — E3/E4 / 2026-06-26
- Showing more than 3 alerts simultaneously — creates alarm fatigue. Priority queue, show max 3. — E3 / 2026-06-26
- Generic page titles ("Dashboard", "מרכז בקרה") as hero text — personalized greeting always. — E3/E4 / 2026-06-26

---

## ADMIN EXPERIENCE

### Works Well
- **Ivory/cream sidebar, not dark** — keeps admin experience in the same visual family as the product. Warm even in professional contexts. — E4 / 2026-06-26
- **Event cards with progress bars + guest stats** — the admin needs to know: how many confirmed, how many pending, how ready is this event. All three in one card. — E4 / 2026-06-26
- **WhatsApp Center as 4-step wizard** — template → preview → audience → send. Enforces brand safety (forces "💍 משפחה וחברים יקרים!" opener), prevents mistakes, creates a record. — E4 / 2026-06-26

### Avoid
- Free-text WhatsApp composition without the wizard — leads to off-brand messages and personal name openers. — E4 / 2026-06-26
- All-in-one tab mega-pages (the current `/admin` pattern) — not scalable, not navigable by browser history, not code-splittable. — E4 / 2026-06-26

---

---

## STATE MACHINE PATTERNS (Product States)

### Works Well
- **Wedding Day Mode as complete UI override** — `daysLeft === 0` replaces the entire dashboard with a mode-specific view. Different hero (couple photo), different nav (day-of actions only), no planning tools. State transition must be unmistakable. — E3 / 2026-06-27
- **Post-Event as Memory Archive** — `daysLeft < 0` shifts the dashboard from anticipation mode to memory mode. Headline changes from future tense to past tense ("הייתה מושלמת"). Planning tools hidden. Gallery/blessings/ratings surfaced. — E3 / 2026-06-27
- **Three distinct dashboard states** (Planning / Wedding Day / Post-Event) have completely different visual identities. A user who sees the wrong state would immediately notice — this differentiation is intentional and correct. — E3 / 2026-06-27

### Avoid
- Showing checklist or budget on the wedding day — implies something is still pending. Planning tools must be hidden on `daysLeft === 0`. — E3 / 2026-06-27
- Generic "event is over" empty states — the post-wedding experience has real value (gallery, time capsule, ratings). Never show emptiness. — E3 / 2026-06-27

---

## TIME CAPSULE PATTERNS

### Works Well
- **Blurred preview rows** — 3 partially-legible blessings visible through the locked capsule. CSS `filter: blur(4px)` on text. Creates maximum anticipation — enough to feel something is inside, not enough to read it. — E2 / 2026-06-27
- **365 in Frank Ruhl Libre 900 gold** — the capsule countdown uses the same large-number treatment as the wedding countdown. This visual rhyme is intentional: the capsule is a mirror-image of the original countdown, reversed in time. — E2 / 2026-06-27
- **Ornate gold padlock illustration** — the lock is not a generic icon; it is an intricate filigree padlock that signals both security and beauty. The capsule should feel precious, not protected. — E2 / 2026-06-27
- **Anniversary unlock date** — "תיפתח ביום השנה הראשון שלכם" with specific date. The couple knows exactly when, which makes the wait feel finite and exciting. — E2 / 2026-06-27

### Avoid
- Showing the count of blessings without showing anything blurred — it should feel like a sealed envelope you can hold but not open. — E2 / 2026-06-27
- Unlock mechanism that feels transactional — no "click here to unlock" on the date. The unlock should happen automatically and be presented as a celebration. — E2 / 2026-06-27

---

## SURVEY & FEEDBACK PATTERNS

### Works Well
- **Thank-you first, questions second** — opening the post-event survey with "תודה שהייתם איתנו" before asking anything creates reciprocity. The guest gives their feedback as a gift, not as a service obligation. — E2 / 2026-06-27
- **3 questions maximum for event surveys** — any more reduces completion rate. Three is the correct number: experience / moment / blessing. — E2 / 2026-06-27
- **Blessing field as final question** — the survey ends with the guest giving something to the couple (a blessing), not just rating the event. This reframes the entire experience. — E2 / 2026-06-27
- **Stars over NPS scales** — wedding events call for stars (celebratory, familiar) not NPS (clinical, corporate). — E2 / 2026-06-27

### Avoid
- The words "שאלון," "משוב," or "דירוג" anywhere in the survey — too administrative. Use "זיכרון," "חוויה," "ברכה." — E2 / 2026-06-27
- More than 4 radio options per question — forces cognitive load without adding value. — E2 / 2026-06-27

---

## ADMIN DATA TABLE PATTERNS

### Works Well
- **Filter chips with live counts above data table** — "מגיע 89 / ממתין 23 / לא מגיע 8" in filter chips means the admin never needs to scroll to understand their event state. Counts in filters are alerts, not just filters. — E4 / 2026-06-27
- **Status pills: green/amber/red** — consistent across guest table, guest cards, seating, couple dashboard. Once learned in one context, it reads correctly in all. — E4 / 2026-06-27
- **Table number as gold chip** — gold = confirmed/assigned/done. Unassigned = empty state, no chip. The absence of gold signals action needed. — E4 / 2026-06-27
- **Three row actions: edit / call / delete** — the most common admin actions per guest, in order of frequency. Never more than three per row (table becomes unusable on mobile). — E4 / 2026-06-27

### Avoid
- Inline editing in table rows — opens editing in-place conflicts with RTL text flow and is difficult on mobile. Modal editing preferred. — E4 / 2026-06-27
- More than 6 columns visible on desktop guest table — becomes unreadable at 1280px. Priority: name / phone / status / table / actions. Side and notes in detail modal. — E4 / 2026-06-27

---

## SEATING DESIGN PATTERNS

### Works Well
- **Two-panel layout: unassigned left, floor plan right** — natural drag direction (left → right) matches the task direction (move from unassigned to assigned). — E4 / 2026-06-27
- **Round table cards** — wedding venue tables are round. The physical metaphor creates visual familiarity. — E4 / 2026-06-27
- **Color coding by fullness: green/cream/light cream** — seating status visible without interaction. Admins scan for empty tables without clicking anything. — E4 / 2026-06-27
- **Progress badge at top: "77 / 120 שובצו (64%)"** — the seating completion percentage is always visible regardless of scroll position. — E4 / 2026-06-27

---

## MARKETING & FUNNEL PATTERNS

### Works Well
- **"חד פעמי. ללא מנוי. ללא הפתעות." as primary pricing claim** — addresses the #1 objection (subscription risk) before any feature is listed. — E1 / 2026-06-27
- **Couple names as first registration form fields** — "שם הכלה / שם החתן" before email and password. Establishes this is a wedding product, not a generic SaaS signup. — E1 / 2026-06-27
- **Warm registration language** — "ספרו לנו עליכם" instead of "צרו חשבון." "הצטרפו" instead of "Register." The product is welcoming someone into a community, not creating a record. — E1 / 2026-06-27
- **Botanical illustrations for form-heavy screens** — photography competes with form content. Botanical illustrations provide warmth while staying visually quiet. — E1/E3 / 2026-06-27

### Avoid
- Generic SaaS language anywhere in the marketing or registration funnel — "Trial," "Sign Up," "Dashboard," "Create Account" all break the wedding-specific premium voice. — E1 / 2026-06-27
- Abstract hero images on landing pages — real wedding photography answers "do they understand what a wedding looks like?" in 0.3 seconds. Abstract does not. — E1 / 2026-06-27

---

*Design Memory — Version 3 | Chief of Staff | Updated: E1/E2/E3/E4 complete | 2026-06-27*
*Updates required after: every completed wave, every major user feedback session, every surprising post-release observation*

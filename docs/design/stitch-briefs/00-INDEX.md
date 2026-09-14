# בריפים לסטיץ׳ — אודיט עיצוב regalifnei.com

נוצר 14/09/2026 · 38 סוכנים · 20 ממצאים מאומתים · 10 נדחו באימות נגדי.
כל קובץ מכיל פרומפט מוכן להדבקה בסטיץ׳ + שלושה כיוונים לאותו מסך.
**קוד לא נכתב עד שיש עיצוב מאושר.**

| # | מסך | עדיפות | קובץ |
|---|---|---|---|
| 1 | Home page | P1 | [01-home-hero.md](01-home-hero.md) |
| 2 | Home page | P2 | [02-home-scroll-spine.md](02-home-scroll-spine.md) |
| 3 | Component sheet | P3 | [03-section-header-buttons.md](03-section-header-buttons.md) |
| 4 | /rsvp/[token] | P1 | [04-rsvp-form.md](04-rsvp-form.md) |
| 5 | /rsvp/[token] | P2 | [05-rsvp-confirmed.md](05-rsvp-confirmed.md) |
| 6 | /rsvp/[token] | P3 | [06-rsvp-states.md](06-rsvp-states.md) |
| 7 | /pricing | P1 | [07-pricing-calculator.md](07-pricing-calculator.md) |
| 8 | The live-demo module on the home page | P2 | [08-live-demo-module.md](08-live-demo-module.md) |
| 9 | /weddings | P3 | [09-weddings-proof.md](09-weddings-proof.md) |


## ממצאים מאומתים

### [HIGH] Gold #C5A46D carries reading text at 2.26:1 — 89 times on the home page alone
`/ (and every marketing page)` · עדשה: brand

**מה יש:** `text-gold` = #C5A46D on ivory #FDFAF5 measures 2.26:1 (on cream #F6F1E8: 2.10:1; on white: 2.36:1). WCAG AA for body text is 4.5:1. `grep -o 'text-gold'` on the LIVE home HTML returns 89 hits. It is not decorative — it carries actual sentences: the second line of every section H2 is gold at 4xl/56px font-black (WhyUsWarm.tsx:32 "מערכת שמנהלת את כל החתונה.", ToolsWarm.tsx:33 "בלוח בקרה אחד", TrustWarm.tsx:47 "אתם מקבלים מישהו שדואג.", ComparisonWarm.tsx:39 "לעומת ניהול עם רגע לפני"), and every section eyebrow is gold at 13px, uppercase, font-semibold, tracking-[0.22em] (WhyUsWarm.tsx:29, ToolsWarm.tsx:30, HowItWorksWarm.tsx:39, ComparisonWarm.tsx:36, GalleryWarm.tsx:23, TrustWarm.tsx:42, FAQWarm.tsx:31, ContactWarm.tsx:111). ToolsWarm.tsx:71 puts a whole sentence in 14px gold. GalleryWarm.tsx:63 makes the gallery link gold-underlined. Two readable golds already exist and are used by nothing on the home page: globals.css:47 `--color-gold-text: #8B6914` (4.89:1) and src/design/tokens.ts palette.goldDeep #A07840 / goldInk #755A2A.

**מה זה עולה:** Half of every headline on the home page — the half carrying the actual promise — is at a quarter of the legal contrast. On a phone outdoors, or on any screen with auto-brightness down, the couple reads "לא עוד כלי לאישורי הגעה." in near-black and the sentence that explains what the product IS simply disappears into the ivory. The eyebrows, being 13px uppercase with 0.22em tracking on top of 2.26:1, are decoration the couple never decodes as words. This is the largest readability defect on the site and it is entirely a colour choice.

**תיקון:** Split gold into two roles and never let them cross. Keep #C5A46D as an OBJECT colour only — fills, rules, icon glyphs inside a tinted chip, dots, borders, the gold-divider. Introduce a text gold at #8B6914 (4.89:1) — the value already sitting unused in globals.css:47 — for every character of gold text: eyebrows, the second line of H2s, gold links. Where gold text sits on a gold-tinted chip (`bg-gold/10 text-gold`), the tint darkens the field, so #755A2A. Draw the eyebrow at 13px/600/0.16em tracking in #8B6914 rather than 0.22em — the extra tracking is what turns a low-contrast Hebrew word into texture.

<details><summary>תיקוני האימות הנגדי</summary>

Four corrections; keep the fix, retitle and rescope it.

1. "89 times ... carries reading text" is wrong by ~3x. Parsing the live HTML: 89 elements carry a `text-gold` token, but 38 have no text at all (lucide icon glyphs inside `bg-gold/10` chips — currentColor, not reading text) and 8 more are `text-gold/30` aria-hidden step numerals (HowItWorksWarm.tsx:55, ProcessWarm.tsx:14) that are decorative and duplicated by the "שלב 0N" label beside them. Full-opacity gold actually carrying words on a light background: ~42, one of which (ShowcaseBand.tsx:40) is on `bg-ink` at 7.9:1 and is fine. Honest headline number: ~32 instances of gold small text below half the AA threshold.

2. "a quarter of the legal contrast" is wrong for the elements the finding leads with. The H2 second lines are text-4xl (36px) font-black — WCAG large text, where the AA bar is 3:1, not 4.5:1. Gold sits at 2.26 vs 3.0: a real failure, but 75% of required, not 25%. "Disappears into the ivory" and "reads in near-black" is rhetoric; 36–56px font-black at 2.26:1 is low-contrast, not invisible. The severe failures are the small text: ~19 eyebrows at 13px, 3 at 12px, 5 at 14px, 2 button labels at 15px, 2 underlined links. Lead with those, not the headlines.

3. "/ (and every marketing page)" is wrong. /pricing, /weddings, /venues, /try and /religious return zero `text-gold` and already use #8B6914 inline. The affected set is exactly the pages built from the `*Warm` Tailwind components: / (89), /features (19), /faq (18), /how-it-works (17), /invitations (17). Scope the brief to those five.

4. "13px, uppercase" — Hebrew has no case, so `uppercase` is a visual no-op on every one of these strings; it contributes nothing to the harm. The `tracking-[0.22em]` critique stands on its own and is the real typographic problem, since letter-spacing does apply to Hebrew and Hebrew letterforms are not designed to be tracked. Drop "uppercase" from the argument (and consider dropping the dead class from the components).

Also: "two readable golds ... used by nothing" overstates. True of the home page only; #8B6914 is used across dozens of files. And the brief should warn Stitch off goldDeep #A07840 for text — at 3.84:1 it passes only for large text, so #8B6914 (4.89:1 on ivory, 4.52:1 on cream) is the correct single text gold, with #755A2A (6.2:1) reserved for gold text on a gold-tinted chip.

Suggested retitle: "Gold #C5A46D carries ~32 pieces of small text at 2.26:1 — including both hero CTA labels — on the five *Warm pages, while the rest of the site already uses the readable #8B6914". Severity: keep high, but the justification is the CTAs and eyebrows, not the headlines. The proposed fix (split gold into object-colour vs text-colour, #8B6914 for characters, #755A2A on tinted chips, tracking 0.22em → 0.16em) is right as written — add the two `border-gold` pill CTAs to the list, since their border needs 3:1 independently of the label.

</details>

---

### [HIGH] Two competing darks still ship, and Tailwind's `dark` token resolves to the wrong one
`/about /faq /features /how-it-works /invitations /start /quote /dashboard-demo` · עדשה: brand

**מה יש:** Brand law says one dark: #1C1008. tailwind.config.ts:16 defines `dark: "#333333"` and globals.css:38 defines `--dark: #333333`. globals.css `body { color: var(--dark) }` — so the site's default text colour is #333333, a cold neutral, not the warm brand ink. `.section-title` in globals.css does `@apply … font-bold text-dark`, so every heading using that class is #333333. 41 uses of `text-dark`/`bg-dark`/`border-dark` remain. src/design/tokens.ts:14 states in a comment that the canonical ink is #1C1008, NOT the legacy #333333 — and then tailwind.config.ts keeps shipping the legacy value under the friendliest name in the system. Direct offenders on public pages: start/page.tsx:24 `dark: "#333333"` with muted `rgba(51,51,51,0.55)` (grey, where every other page uses warm rgba(28,16,8,…)); event-type/[category]/page.tsx:156 `dark: "#333333"`; ComparisonSection.tsx:74 `color: "#333333"` on /features; DashboardDemo.tsx:22 and FeaturedDesigns.tsx:14 both `dark: "#333333"`; quote/page.tsx:145,152 `color: "#333"`; contact/page.tsx:108, terms/page.tsx:74, privacy/page.tsx:93, guides/seating-guide/page.tsx:11, guides/rsvp-cost/page.tsx:12, guides/compare/page.tsx:66 all `color: "#333"`.

**מה זה עולה:** #1C1008 on ivory is 17.9:1 and reads warm — brown-black against cream, the thing that makes the page feel like stationery. #333333 is 12.13:1 and reads cold — the same grey as a default browser page. A couple scrolling home → /about → /faq crosses the boundary without knowing why the second page feels cheaper. It also means the ONE token a developer reaches for by name (`text-dark`) is the one that is wrong, so every new screen drifts by default.

**תיקון:** Retire the word 'dark' from the palette entirely. In tailwind.config.ts delete `dark: "#333333"` and in globals.css set `--dark: #1C1008` so the ~41 legacy call-sites and `body` snap onto brand ink without touching them. Rename the semantic role to `ink` everywhere in the spec so nobody can reach the legacy value by accident. Then hand-fix the literal `#333`/`#333333` sites listed above to #1C1008, and start/page.tsx:25 muted to rgba(28,16,8,0.55).

<details><summary>תיקוני האימות הנגדי</summary>

TITLE
The default ink token resolves to the legacy grey, and /start ships 94% off-brand

PAGE
/start (94% grey, 0% ink) · /faq (70%) · /features (61%) · /how-it-works (44%) · /dashboard-demo · /quote · /contact · /terms · /privacy · /guides/*
NOT /about (3% grey — already #1C1008) and NOT /invitations (already #1C1008). Remove both.

SEVERITY
high — but for the token, not the tint. The palette drift alone is medium; what makes it high is that the friendliest-named token in the system is the wrong one, so every new screen drifts by default.

WHAT IS THERE
Brand law binds one dark: #1C1008. Three places disagree with it.
· tailwind.config.ts:16 — `dark: "#333333"`, sitting directly above `ink: "#1C1008"` in the same block.
· globals.css:38 — `--dark: #333333`, consumed by globals.css:79 `body { color: var(--dark) }`.
· layout.tsx:138 — `<body className="bg-cream text-dark antialiased">`. Root layout, so #333333 is the inherited default text colour on every route.
· globals.css:143 — `.section-title { @apply … text-dark }`, so every heading using the shared title class is grey.
src/design/tokens.ts:14 states outright that the canonical ink is #1C1008 "NOT the legacy #333333" — and the config keeps shipping the legacy hex under the friendlier name.

~13 live `text-dark` call-sites remain (not 41): layout.tsx:138, globals.css:143, Header.tsx:92+109, FAQ.tsx:97/155/182, HowItWorks.tsx:115/122, EventCategories.tsx:155/174, CTAStrip.tsx:77. A further ~30 sit in components nothing imports (Hero, About, Contact, WhyUs, Gallery, WeddingGallery, Logo, WhatsAppButton, LeadForm) — dead code from the `*Warm` rebuild, out of scope here.

Live literal-hex offenders on public routes: start/page.tsx:24 `dark: "#333333"` and :25 `muted: "rgba(51,51,51,0.55)"` · event-type/[category]/page.tsx:156 · ComparisonSection.tsx:74 and FeaturedDesigns.tsx:14 (both /features) · DashboardDemo.tsx:22 · quote/page.tsx:145,152 · contact/page.tsx:108 · terms/page.tsx:74 · privacy/page.tsx:93 · guides/seating-guide:11 · guides/rsvp-cost:12 · guides/compare:66.

WHY IT COSTS
Measured share of visible text weight at 375px: home 0% grey / 72% ink; /about 3% / 65%; /how-it-works 44% / 0%; /features 61% / 1%; /faq 70% / 0%; /start 94% / 0%.
The two colours are not close. L* 5.74 vs 21.25, ΔE00 = 12.3 — #333333 is about 3.7x lighter perceptually, not just cooler. Both clear AAA on cream (16.6:1 and 11.2:1), so this is not an accessibility defect; it is that #1C1008 on cream reads as pressed ink on stationery and #333333 reads as a default browser page.
The concentrated cost is /start. A couple leaves a home page rendered 72% in warm ink, clicks the primary CTA, and lands on a sign-up page rendered 94% in cold grey with `rgba(51,51,51,0.55)` body copy — light grey on cream at the exact moment they are deciding whether this outfit is real. /faq and /features carry the same break at lower intensity.
The structural cost is the token: `text-dark` is the obvious name, it is the wrong value, and nothing stops the next screen from inheriting the drift.

FIX
1. Repoint, do not delete. In tailwind.config.ts:16 set `dark: "#1C1008"`. Do NOT remove the key — the comment above it warns that live screens depend on it, and deleting it makes ~13 shipping `text-dark`/`bg-dark` classes compile to nothing. In globals.css:38 set `--dark: #1C1008`. Both edits are required: `text-dark` compiles from the config, `body`'s colour comes from the CSS variable, and fixing one leaves the other wrong. Together they snap layout.tsx:138, `.section-title`, and every live `text-dark` onto brand ink without touching a single component.
   Safety, already checked: `var(--dark)` has exactly one consumer (body colour) and `bg-dark` exactly one (Header.tsx:109, a 40% scrim) — darker and warmer only improves it. No regression surface.
2. Then /start, on its own. start/page.tsx:24 → `dark: "#1C1008"`, :25 → `muted: "rgba(28,16,8,0.55)"`. Highest return of anything in this finding; do it in the same pass as step 1 and stop there if time is short.
3. Then the remaining live literals above → #1C1008 / rgba(28,16,8,…). Skip the dead components entirely — they belong to a dead-code deletion, not a brand fix.
4. Only afterwards, rename the semantic role to `ink` across the spec so the legacy name cannot be reached by accident. Doing the rename in the same commit as the repoint turns a two-line safe change into a 13-file migration.

NOTE FOR THE BRIEF
This is a token decision, not a design decision — Stitch is not needed. Steps 1 and 2 are a two-file, one-sitting change.

</details>

---

### [HIGH] The muted-text ladder has nine rungs and the bottom three fail AA
`/ (all Warm sections)` · עדשה: brand

**מה יש:** Across the home-page components the ink opacity ladder is text-ink/40 (×6), /45 (×3), /50 (×14), /55 (×10), /60 (×17), /65 (×6), /70 (×6), /75 (×3), /80 (×5) — nine distinct greys for one job. Composited on ivory #FDFAF5: ink/40 = #A39C96 at 2.60:1, ink/45 = #98918A at 2.99:1, ink/50 = #8C857E at 3.49:1, ink/55 = 4.10:1, ink/60 = 4.81:1, ink/65 = 5.72:1, ink/70 = 6.86:1, ink/75 = 8.27:1, ink/80 = 9.84:1. The three sub-AA rungs account for 23 instances on the home page — including ProcessWarm.tsx (uses both ink/40 and ink/45), AboutWarm.tsx (ink/45), ContactWarm.tsx (ink/45). On the dark bands the same pattern repeats with white: white/5, /40 (×6, = 3.83:1 on ink), /50, /55, /60 (×8), /70, /75, /80, /85 — nine more rungs. src/design/tokens.ts already defines exactly four tiers: text (100%), textSoft (62%), textMuted (45%), textFaint (25%). Only two of the nine shipped values land on that ladder.

**מה זה עולה:** Nine greys is the same as no greys — the eye cannot rank ink/55 against ink/60, so the page reads as one flat wash and the couple has no idea what to read first. And at the bottom of the ladder, 23 blocks of supporting copy — the sentences explaining what each feature does — sit between 2.6:1 and 3.5:1, which on a phone in daylight is not dim, it is absent.

**תיקון:** Collapse to four rungs and forbid a fifth. On ivory: primary #1C1008 (17.9:1), secondary ink/70 (6.86:1), tertiary ink/60 (4.81:1) as the FLOOR for any text a person is meant to read, and ink/40 reserved exclusively for non-text — hairlines, disabled chrome, a decorative numeral like HowItWorksWarm.tsx:55's gold/30 step digit. On ink surfaces: ivory #FDFAF5, then white/75, then white/60 (7.11:1) as the floor, white/40 non-text only. Name the four rungs in the spec so a screen can be reviewed against them at a glance.

<details><summary>תיקוני האימות הנגדי</summary>

Retitle: "Contrast falls as type gets smaller — the section deks and the demo disclaimers are below AA."

Severity: hold at high, but re-founded. Drop the hierarchy argument entirely; it does not survive. The case is legibility plus a self-declared rule broken on the flagship page.

Corrected whatIsThere: Nine ink rungs and nine white rungs ship on the home page (counts as originally stated, verified exact). They are not nine greys for one job — they are size-stratified, with one genuine collision: ink/60 (×8) and ink/65 (×6) both carry 15px font-light body copy. The defect is that the stratification runs backwards. Composited on ivory #FDFAF5: /40 2.59, /45 3.00, /50 3.49, /55 4.09, /60 4.83, /65 5.74, /70 6.85, /75 8.22, /80 9.86. Note the real worst case is cream #F6F1E8, not ivory — `src/app/globals.css:78` sets body background to cream, and AboutWarm, ContactWarm and ToolsWarm are bg-cream sections: /40 2.56, /45 2.95, /50 3.43, /55 4.00, /60 4.70. Spec against cream, not ivory. On ink surfaces white/40 = 3.81:1 (×6), white/60 = 7.14:1.

Corrected failure set — 33 instances, not 23, in three tiers of seriousness:
1. Sales copy below AA (8): the section dek, text-lg font-light text-ink/55, at 4.09:1 ivory / 4.00:1 cream — WhyUsWarm.tsx:35, HowItWorksWarm.tsx:41, ComparisonWarm.tsx:41, ToolsWarm.tsx:35, ProcessWarm.tsx:32, EventTypesWarm.tsx:25, GalleryWarm.tsx:25, FAQWarm.tsx:33. 18px at weight 300 does not qualify as large text. This is the highest-value text on the page and the original finding cleared it.
2. Consequential small print (4): ProcessWarm.tsx:88, :107, :157 (ink/40, 2.56:1) and ContactWarm.tsx:106 (ink/45 on cream, 2.95:1). Fixing these is not a contrast fix, it is a disclosure fix — the "this is example data" label and the "this sends you to Dvir's WhatsApp" warning should be the most readable small text on the page, not the least. Ties directly into the open "זה לא מוקאפ" question.
3. Micro-labels at 12–13px (21): stat captions, the ComparisonWarm.tsx:50 column header, HeaderWarm.tsx:36 tagline. Genuinely dim at 3.4–3.5:1 in Hebrew at 12px, but no one comparison-shops differently because of them. Fix in the same pass; do not justify the pass with them.

Not a defect, leave alone: LiveSnapshot.tsx:98–100, the three ":" glyphs in the countdown at ink/40. Non-text. The original finding counted them among "23 blocks of supporting copy."

Corrected fix — same four-rung shape, different floors, stated as a rule about size rather than a list of tiers. Brief for Stitch:
- Give the four rungs names and one governing law: contrast rises as type shrinks. Nothing below 15px may sit under 4.5:1 on cream, ever.
- On light (spec against cream, the worst case): primary #1C1008 (16.6:1); secondary ink/70 (6.61:1); tertiary ink/60 (4.70:1) as the floor for anything at 15px or larger; anything under 15px steps UP to ink/70, not down. ink/40 for non-text only — hairlines, disabled chrome, the gold/30 step numeral at HowItWorksWarm.tsx:55, the countdown colons.
- On ink: ivory #FDFAF5; white/75 (10.66:1); white/60 (7.14:1) as floor; white/40 (3.81:1) non-text only.
- Delete the /45, /50, /55, /65 rungs. Retiring /55 alone moves all 8 deks; the dek's own real problem is that it is Heebo Light 300 at 18px, so ask Stitch whether the dek should be ink/70 at weight 400 rather than a darker light — that is a type decision, not a colour one, and it is Stitch's to make.
- Reconcile with `src/design/tokens.ts`, which currently declares 100/62/45/25 — the 45 and 25 tiers as written are below the floor for text and should be relabelled non-text, otherwise the token file legitimises the bug.
- Add the four named rungs to `docs/design/accessibility.md`, which already carries the 4.5:1 rule at line 7 with nothing to check a screen against.

</details>

---

### [HIGH] /demo is a whole public page in an inverted palette that exists nowhere else on the site
`/demo` · עדשה: brand

**מה יש:** demo/page.tsx:235 sets the page shell to `background: "#0f0700", color: "#fff"` — a dark page with pure-white text. Inside it, six near-blacks with no relationship to each other or to brand ink: :296 `linear-gradient(135deg, #1a0a00 0%, #2d1500 35%, #1a0800 70%, #0f0500 100%)`, :409 `linear-gradient(180deg, #0f0700 0%, #150900 100%)`, :430 `#0f0700`, :450 `linear-gradient(150deg, #1a0a00, #2d1500)`, :514 `#150900`. Not one of them is #1C1008. Stat colours are stock web values — :221 `#C0392B` for 'סירבו', :356 `#22c55e` for a live dot — while the home page's dark bands use `bg-ink` #1C1008 with `text-primary-soft` #E5C188 accents. Live-verified: `curl https://regalifnei.com/demo` ships #0f0500 #0f0700 #150900 #1a0800 #1a0a00 #2d1500 alongside #c5a46d.

**מה זה עולה:** /demo is where a curious couple goes to see the product before talking to anyone — the page that has to feel expensive. Instead it is the one page that inverts. The site is ivory-first everywhere; here the couple lands on near-black with pure #FFF text, harsh on an OLED phone at night and reading as 'developer demo' rather than 'wedding service'. The six drifting blacks mean the sections do not even sit flush with each other.

**תיקון:** Either bring /demo onto the ivory canvas the rest of the site uses and let ShowcaseBand's dark treatment be the ONE dark moment, or — if the dark frame is deliberate, to make a dashboard screenshot look like a product — rebuild it on exactly the home page's dark recipe: ground #1C1008, elevated panels rgba(255,255,255,0.05), hairlines rgba(255,255,255,0.10), headings #FDFAF5 not #FFF, body white/75, accents #E5C188. One black, one accent, no gradients between six unnamed browns.

<details><summary>תיקוני האימות הנגדי</summary>

Severity: high → MEDIUM.

The "whyItCosts" premise is wrong and must be replaced. "/demo is where a curious couple goes to see the product before talking to anyone" is not true. The home page never links to /demo. Its demo CTAs point elsewhere: /dashboard-demo (Hero.tsx:426, BookDemoCTA.tsx:60) and /event/demo (CTAWarm.tsx:35, ProcessWarm.tsx:71, DashboardDemo.tsx:278). /demo has exactly ONE inbound internal link in the whole codebase — about/page.tsx:130, labelled "צפו בדוגמאות". It is a near-orphan page whose only real traffic path is organic search. The pages that actually carry the "show the product" job are /event/demo and /dashboard-demo, and both are already on the ivory canvas. Rewrite the cost as: an indexed page (robots index,follow; sitemap priority 0.8) that a couple can land on from Google and that looks like it belongs to a different company than every other page they will click through to.

Drop the OLED sentence. "harsh on an OLED phone at night" is speculation, and pure #FFF on near-black is a widely used, legitimate pattern. It weakens the finding by mixing taste into an otherwise objective drift claim.

ADD (missed, and it is the strongest single piece of evidence): demo/page.tsx:8 declares `const DARK = "#1C1008"` — the brand ink — and the constant is never used anywhere in the file. This is what distinguishes drift from intent and should lead the whatIsThere.

TIGHTEN the seam claim with the specific boundary rather than the general "do not sit flush": :409 ends at #150900, :430 begins at #0f0700, :514 returns to #150900 — a lightness step at the 409/430 join.

Also note: #8B6914 (:19) and #7C6A52 (:20) are budget-chart slice colours and #25D366 (:601) is the WhatsApp brand green — those three are defensible and should not be counted among the offending values. The count of unnamed browns is six; the count of off-brand accents is two (#C0392B, #22c55e), not more.

FIX section: the second option is over-specified for a brief whose stated deliverable is a brief, not code — Stitch is the designer here. Reduce it to the constraint rather than the recipe: if the dark frame is kept, it must be ONE dark (#1C1008), one accent (#E5C188), headings #FDFAF5 rather than #FFF, no gradients between unnamed browns — and let Stitch resolve the elevation and hairline treatment. Given the traffic reality, the first option (bring /demo onto ivory, or fold it into /event/demo which already does this job properly) is the cheaper and more likely correct answer, and the brief should say so rather than presenting the two as equal.

</details>

---

### [HIGH] The decline card holds the primary RTL reading position
`/rsvp/[token] — form screen` · עדשה: guest

**מה יש:** RsvpClient.tsx:1452–1488 renders a `gridTemplateColumns: "1fr 1fr"` inside `dir="rtl"`, and the NO card is the first child. In RTL the first grid cell lands on the RIGHT — where a Hebrew eye starts. So "מצטערים, לא נוכל" (line 1468) is read first and "כן, נשמח להגיע" (line 1486) second. Both cards are identical in size (padding 18px 12px, radius 16px), identical in resting colour (T.cream #F6F1E8, 2px #E8E0D4 border), identical in type (Frank Ruhl Libre 15px/700). The only difference is which glyph sits on top: ✗ or ✓, both 22px.

**מה זה עולה:** A guest opens a wedding invitation from a friend and the first thing their eye lands on is the word 'sorry'. The expected, wanted, and statistically dominant answer is given the weaker slot and zero visual advantage. Some fraction of hurried thumbs hit the nearest card.

**תיקון:** Swap the DOM order so YES is the first grid child (right side in RTL). Break the symmetry: YES gets the full-width, gold-filled treatment as a single wide card; NO becomes a secondary, outline-only card at ~70% of the YES card's height beneath it, or a quiet text link. One primary answer, one escape.

<details><summary>תיקוני האימות הנגדי</summary>

Severity: high → medium. No data is lost or mis-recorded; the two-step commit (choice → separate "אישור והמשך" CTA at RsvpClient.tsx:1858) neutralises the mis-tap argument. Delete "Some fraction of hurried thumbs hit the nearest card" — it is not true of this flow. Delete "statistically dominant answer" unless Dvir can produce the actual accept/decline ratio from his own events; it is asserted, not measured.

What survives, and what the brief should say: the first thing a guest reads on a wedding invitation is the word "מצטערים", and at rest the product gives no signal which answer is expected. Reframe the cost as tone and clarity for a premium warm brand, plus an internal inconsistency with /rsvp/[token]/simple, not as lost confirmations.

The proposed fix is technically wrong and must not go to Stitch as written. Gold fill is already the SELECTED state of the YES card — RsvpClient.tsx:1480 is `background: attending ? T.gold : T.cream` and 1483-1484 flip the glyph and label to #fff. A resting "full-width, gold-filled" YES card would read as already-answered, and it would sit as a second full-width gold block directly above the gold "אישור והמשך" CTA. Ask Stitch instead for: (1) YES as the first grid child so it holds the right-hand RTL slot; (2) a resting-state weight difference that is NOT gold fill — e.g. YES keeps ivory/cream with a gold 2px border and gold glyph while NO drops to a hairline #E8E0D4 border with a muted glyph, or NO demotes to a quiet full-width text link beneath a single wide YES card; (3) the gold fill reserved exclusively for the confirmed state, so selection stays legible. Whatever comes back must keep both targets ≥44px and must not make declining feel punished — a guest who cannot come still has to be able to say so in one tap.

Also worth logging separately (not this finding): https://regalifnei.com/rsvp/demo server-renders the error state "לא מצאנו את ההזמנה — ייתכן שהחיבור נקטע באמצע" before client hydration. The page named as the most important guest-facing screen first paints a failure message.

</details>

---

### [HIGH] The primary CTA label sits at 2.4:1 contrast
`/rsvp/[token] — form screen` · עדשה: guest

**מה יש:** GoldCTA (RsvpClient.tsx:191–222) paints `color: "#FFFFFF"` on `background: T.gold` = #C5A46D, at fontSize 18px / fontWeight 700. White on #C5A46D measures 2.37:1. WCAG AA needs 4.5:1 at 18px (large-text relief starts at 18.66px bold). The same white-on-gold pairing repeats on the selected YES card (line 1485), the selected guest-count circles (line 1560), and the + stepper (line 1577).

**מה זה עולה:** The single most important word on the highest-traffic page in the business — "אישור והמשך" — is the least legible text on it. Outdoors, on a dimmed phone, or for the parents and grandparents who make up a large share of any Israeli wedding list, the button reads as a gold rectangle with a smudge on it. The guest hunts for what to press.

**תיקון:** Put T.dark #1C1008 on the gold fill — that measures 7.9:1 and stays entirely inside brand law. Same swap on the selected YES card, the selected count circles and the stepper. If white must stay for a hero moment, darken the fill to roughly #8B6914 (goldText), which carries white at 4.6:1.

<details><summary>תיקוני האימות הנגדי</summary>

Four corrections and one addition.

1. Severity: high → MEDIUM. High implies something breaks or measurably loses conversion. This degrades legibility; it does not break the flow. Its priority comes from the fix being nearly free on the highest-traffic surface, which is a value/cost argument, not a severity one.

2. Cut "The guest hunts for what to press." False. The CTA is a full-width, 56px-tall, shadowed solid gold block and the only one on screen. Findability is fine; the label is what's degraded. Also soften "reads as a gold rectangle with a smudge on it" — hyperbole. Indoors at 18px/700 it is plainly readable; it fails in sun, on a dimmed screen, and for reduced contrast sensitivity.

3. The fix's own number is understated in the safe direction: #8B6914 carries white at 5.09:1, not 4.6:1. Better than claimed.

4. Lens is wrong: this is ACCESSIBILITY, not brand. Brand law is what makes the fix free — every replacement colour is already in the palette — it is not what makes this a defect.

ADDITION the finding missed, and it is the worst instance on the very component it audited: the disabled fill is #D4C4A8 with the same white (line 210). That is 1.71:1. So during submit, "שולח..." — the only feedback a guest gets that their tap registered — is the least legible text on the page, not "אישור והמשך". Any brief must cover the disabled state too, or it fixes the second-worst case and leaves the worst.

Corrected fix: put T.dark #1C1008 on the gold fill (7.9:1) for the CTA label, the selected YES card (1484-1485), the selected count circles (~1559) and the + stepper (1577). For the disabled state, either darken the fill or drop the label to T.dark. If white must be preserved anywhere as a hero moment, T.goldText #8B6914 carries it at 5.09:1. All values already exist in the palette at lines 79-85 — no new colour, no Stitch round-trip required.

</details>

---

### [HIGH] An apology for the page being broken sits between the answer and the next step
`/rsvp/[token] — form screen` · עדשה: guest

**מה יש:** Directly beneath the YES/NO cards, before anything else, RsvpClient.tsx:1511–1531 renders two links: "הכפתורים לא מגיבים? לחצו כאן לאישור מהיר ✓" in T.gold #C5A46D, 13.5px, 600, underlined, and "או כתבו לנו ונרשום אתכם 💬" in T.muted 12.5px underlined. Together with padding they occupy ~101px of vertical space, permanently, for every guest. The gold underline makes the first link the second-most-gold thing on screen after the CTA — visually louder than the "כמות אורחים" label (14px, T.dark) that follows it. At 13.5px, #C5A46D on the ivory wash measures 2.3:1.

**מה זה עולה:** A guest taps כן, and the very next thing they read is the site asking whether its own buttons work. It plants doubt at the exact moment the product needs confidence, and it does so to 100% of guests to serve the small fraction whose JavaScript failed. It is also the loudest thing between the decision and the CTA — a guest scrolling for the button gets stopped by an escape hatch first.

**תיקון:** Take both links out of the flow. Move the /simple link to a single quiet line at the very bottom of the form, below "קיבלתם בטעות? זה לא אני", in T.muted 12.5px with no gold and no underline weight. Better still: surface it conditionally — if a tap on the YES/NO cards registers no state change, or if the submit fails, then reveal it inline as an alert. Keep the noscript banner in page.tsx:47–55 as-is; it already covers the true no-JS case.

<details><summary>תיקוני האימות הנגדי</summary>

FIX AS WRITTEN IS WRONG IN TWO PLACES — do not brief it as-is.

(1) "Keep the noscript banner as-is; it already covers the true no-JS case" is false. <noscript> in page.tsx:47-55 fires only when scripting is DISABLED. The documented incident behind this link (שיר, 13/08, opened_at null, per the comment in simple/page.tsx) is a page that rendered with scripting ENABLED and a bundle that was blocked or failed — WhatsApp's in-app browser, a content blocker, a device too old to parse the bundle. noscript never renders in that case. The in-form link is not redundant with the banner; it is the only cover for the case the banner cannot see.

(2) "Better still: surface it conditionally — if a tap registers no state change, reveal it inline as an alert" is logically impossible for the case it targets. If no JavaScript executes, no handler detects the dead tap and no code reveals the alert. The escape hatch must live in static server-rendered HTML, unconditionally. simple/page.tsx states this explicitly: "no JavaScript at all… a form element and a POST." Strike this option from the brief entirely.

FACTS THE FINDING MISSED, BOTH DIRECTIONS:
- Weakens the link's warrant: of the two incidents the code comments cite, only one was a JS failure. RsvpClient.tsx:1851 records that שקד's "הכפתורים לא מגיבים" was NOT broken JS — "her JavaScript ran, her fetch reached us, her opened_at was recorded." Her actual problem was a disabled CTA giving no feedback, and that root cause is already fixed at the CTA. So the link is justified by one confirmed case, not two.
- Strengthens it: /rsvp/demo returns not-found live (לא מצאנו את ההזמנה), so the form screen is unreachable at the public demo URL — this was read from source, and the SSR form (screen initialised synchronously from seed at line 326) does ship the link in static HTML for real tokens, which is exactly why it works with a dead bundle.

OVERSTATED CLAIMS TO DROP: "second-most-gold thing on screen after the CTA" is wrong — a selected YES card is a solid #C5A46D fill and the ✦ divider is gold. And כמות אורחים only renders after a YES is chosen, so it is not competing for the same moment.

SEVERITY: high -> medium.

CORRECTED BRIEF FOR STITCH: Keep a static, always-rendered, no-JavaScript-required path to /rsvp/[token]/simple on the form screen. Change three things about it, not its existence: (a) move both links below the CTA, beside "קיבלתם בטעות? זה לא אני", so nothing sits between the answer and the next step — a guest whose taps are dead scrolls to look for the button anyway, and the link is still in the static HTML when they get there; (b) reword away from pre-announcing failure — state the alternative rather than apologise for the primary, e.g. a plain "לאישור בגרסה פשוטה" instead of "הכפתורים לא מגיבים?"; (c) use goldText #8B6914 (4.89:1) instead of gold #C5A46D (2.26:1) if it stays gold at all, or drop to T.muted #8C7B6E (3.90:1) with normal weight. The WhatsApp link can fold into the same quiet line.

</details>

---

### [HIGH] The first decision is at or below the fold; the CTA is two screens down
`/rsvp/[token] — form screen` · עדשה: guest

**מה יש:** At 375px the form column (padding 28px 20px 56px) stacks: invitation image ≈230–239px tall (all five invitations in /public/wedding are landscape ~1.4:1) + 20; Hebrew date + ceremony times ≈45 + 20; h1 28px event name + 14px date/address ≈54 + 24; gold divider ≈1 + 24. The YES/NO cards therefore begin at ~460px and end at ~563px. WhatsApp's in-app browser on a 4.7" iPhone leaves ~535px of viewport. After tapping כן, four blocks open between the cards and the button — escape links ~101px, guest count ~127px, the 📸 gallery card ~114px, the blessing field ~154px — putting the gold CTA at roughly 1059px, about two thumb-flicks below where the guest is looking.

**מה זה עולה:** A guest arriving from WhatsApp on an older iPhone sees an invitation image and a headline, with the tops of two cards clipped by the fold. Nothing on the first screen says what they are being asked to do. Then, having decided, they must scroll twice more to finish — past an apology, a headcount, a photo announcement and a blessing box — before the answer is actually recorded.

**תיקון:** Compress the header so the decision is visible on a 535px viewport: cap the invitation at ~180px tall with a 'tap to enlarge' affordance (the lightbox already exists), fold date+venue into one 14px line, and drop the gold ✦ divider entirely. Then make the CTA a sticky bottom bar (56px, `env(safe-area-inset-bottom)`) that appears the moment a choice is made, so the distance between deciding and finishing is always zero.

<details><summary>תיקוני האימות הנגדי</summary>

Corrected finding — replace title, severity, numbers and fix:

TITLE: After the guest answers, the confirm button is a full screen below the answer — and the answer is not saved until they reach it

PAGE: /rsvp/[token] — form screen, non-Dvir path (the isDvir branch is now dead: that wedding was 24.08.2026)

SEVERITY: medium (down from high)

WHAT IS THERE (measured, not derived): at 375px the header stack runs invitation image 239px + 20 · Hebrew date and ceremony times 48 + 20 · h1 and date/address 69 + 24 · gold ✦ divider 21 + 24, putting the YES/NO cards at 493→611. Tapping כן opens three blocks — guest count 747→854, the 📸 gallery card 874→968, the blessing textarea 992→1139 — and the gold CTA lands at 1159→1215. At 390px, cards 504→622 and CTA 1170→1226. `setChoice` (RsvpClient.tsx:539) writes local state only; nothing is POSTed until GoldCTA fires `handleSubmit`. There is no scrollIntoView and no sticky bar in the file.

WHAT IT COSTS: on a current phone the decision is comfortably above the fold — that part of the original finding does not hold. The cost is downstream: a guest who has decided must scroll roughly 550px, past a photo-gallery announcement and an optional blessing box, before their answer exists anywhere. A tap on כן that is never followed by a tap on אישור והמשך leaves no trace at all, so the couple cannot even see that it happened. The decline path is unaffected (CTA at 747).

FIX (drop the header surgery, keep one change): a sticky bottom CTA bar — 56px tall, `padding-bottom: env(safe-area-inset-bottom)`, ivory with a hairline #E8E0D4 top edge — that slides in the moment a card is chosen and stays until the answer is submitted. The in-flow CTA can remain where it is for the scrolled-to-bottom case, or be replaced by the bar entirely; Stitch to decide which reads better. Distance from deciding to finishing becomes zero on every device, and the fix is one component with no effect on the 4.7"-phone question at all.

DO NOT DO, from the original fix list:
- Capping the invitation at ~180px. This is the couple's own card, the thing the page exists to honour, and the file's comments show it was fought for once already (a stock photo of strangers was there and read as contempt on a religious couple's page). Shrinking it by 60px buys a fold that only a 4.7" phone cares about.
- Folding date+venue into one line and deleting the ✦ divider. Together those recover ~45px. That is nowhere near enough to matter on a 535px viewport (the cards would still start at ~450 and end at ~568) and it costs the page its only two moments of visual breathing room, against a brand law that says "generous white space, premium and minimal".

SEPARATE, AND URGENT: https://regalifnei.com/rsvp/demo is currently broken — the server-rendered HTML itself says "לא מצאנו את ההזמנה / ייתכן שהחיבור נקטע באמצע". This is the guest-page link a prospective couple is most likely to be shown. It is not a design finding and does not belong in the brief, but it should be checked before anything else on this list.

</details>

---

### [HIGH] The page addressed to one named person never says their name
`/rsvp/[token] — form screen` · עדשה: guest

**מה יש:** `guest.name` is loaded, typed (RsvpClient.tsx:36) and used for nothing. A grep across the whole route returns exactly one render of it — in the no-JS fallback, simple/page.tsx:86 (`{guest.name},`). The main client shows only `displayName` = the couple's names (line 342), the date, and the venue. The one place that depends on knowing whose link it is — "קיבלתם בטעות? זה לא אני" — sits at line 1878 in 12px T.muted at 0.7 opacity, underlined, at the very bottom, and names nobody.

**מה זה עולה:** Wedding links are forwarded constantly — a husband sends his wife the link he got, a parent forwards to the family group. Without a name the guest cannot tell whether this token is theirs, and the couple gets a headcount filed against the wrong row. The plainest, cheapest page in the codebase does this correctly and the premium one does not.

**תיקון:** One line above the invitation, Heebo 16px/400 in T.dark: "{guest.name}, הוזמנתם" or simply "שלום {guest.name}". Then rewrite the bottom link to carry the name: "לא {guest.name}? קיבלתם בטעות" at 13px — a guest can now check it against themselves in half a second.

<details><summary>תיקוני האימות הנגדי</summary>

Three things are overstated and one example is simply wrong.

1. Drop the spouse example — it is not a defect. "A husband sends his wife the link he got" is the SAME row. Guests carry `guest_count` 1–15 and the form offers 1–5 plus a stepper to 15 (lines 1546–1574); one row is one household. The wife answering for two is the designed flow, not a misfiling. Leading the argument with a non-bug weakens it.

2. "Wedding links are forwarded constantly … without a name the guest cannot tell" — the name is in the delivery vehicle. lib/automation/message-templates.ts opens the initial, week_before and day_before bodies with `שלום {{guest_name}}` immediately above `{{event_link}}`. A WhatsApp forward carries that text. Only a long-press copy-link-and-paste strips the name. The gap is real but it is the bare-URL path, not "constantly".

3. There is partial mitigation the finding did not look for: once a row is answered, `setScreen(data.guest.status !== "pending" ? "done" : "form")` at line 456 lands a later arrival on the done screen reading "רשמנו N אורחים", not a blank form. A second person from a pasted link sees an existing answer rather than silently filing a fresh one. The corruption case needs three things to line up — bare-link paste, to a different household, and that person answering before the real invitee.

4. Severity: high → medium. Not because the fix is not worth doing — one line, data already on the client — but because the headcount-corruption story requires that three-way coincidence, while the certain cost is the unanswerable "זה לא אני" control on every load.

Keep the fix as written; it is correctly scoped and correctly sized. Rewriting the bottom link to `לא {guest.name}? קיבלתם בטעות` is the higher-value half of it, not the greeting — that is the line that turns a currently unanswerable question into a half-second check. If only one line ships, ship that one.

</details>

---

### [HIGH] A first-time confirmation is greeted with returning-visitor copy
`/rsvp/[token] — confirmed screen` · עדשה: guest

**מה יש:** RsvpClient.tsx:953 — `{isDvir ? "תודה! נתראה ב־24.08 🤍" : "כבר אישרתם את הגעתכם! ✓"}`, in Frank Ruhl Libre 26px/700 goldText, the largest text on the screen. "כבר אישרתם" means 'you have already confirmed'. It is shown identically whether the guest just submitted or is reopening the link weeks later. The subhead beneath (line 955) is the equally flat "אנחנו מחכים לראות אתכם ביום המאושר שלנו." Dvir's own wedding gets the warm, correct version; every paying couple's guests get the other one.

**מה זה עולה:** The moment a guest says yes to a wedding is the one emotional beat this whole product owns, and it is spent telling them something they did not ask about, in a tone that reads mildly corrective — as though the system is confirming a record rather than a couple thanking them.

**תיקון:** Two variants, keyed on whether this render followed a submit. Fresh answer: a thank-you with the couple's names and the date, e.g. "תודה! נתראה ב־{date} 🤍" — the same shape Dvir's guests get. Returning visit: "אתם כבר רשומים ✓" in smaller type, with the calendar and Waze actions raised to the top since that is what a returning guest actually came back for.

<details><summary>תיקוני האימות הנגדי</summary>

Retitle: "The generic confirmation headline tells a guest who just answered that they 'already' answered."

Severity: medium (down from high).

whatIsThere — as written, minus the favouritism framing: RsvpClient.tsx:953 renders `{isDvir ? "תודה! נתראה ב־24.08 🤍" : "כבר אישרתם את הגעתכם! ✓"}` at 26px/700 Frank Ruhl Libre, the largest text on the screen. `screen === "done"` is reached both from `handleSubmit` success and from the load effect when status is already non-pending, with no flag separating them, so the same sentence serves both. The `isDvir` branch is a bespoke hardcoded flow for one wedding, not a copy variant; the generic branch simply never got a fresh-submit version. The product's own fallback at rsvp/[token]/simple/page.tsx:74 says "נרשמתם! תודה" at the identical moment.

whyItCosts: "כבר" asserts prior action, so on the fresh-submit path the largest words on the screen state something false about what the guest just did, and read as a records system acknowledging a duplicate rather than a couple saying thank you. The screen around it is already right — confetti, MAZAL TOV, olive checkmark — which makes the one contradicting sentence more conspicuous, not less. It is also the screen a couple sees when they test their own link before sending, and the screen carrying the product's only referral link.

fix: Add a `justSubmitted` flag set in `handleSubmit` before `setScreen("done")` — no data or schema change needed. Fresh answer: a thank-you built from values already computed on this screen, `displayName` (line 342) and `formattedDate`, e.g. "תודה! נתראה ב־{formattedDate} 🤍" — the same shape the bespoke branch uses, and the same intent as the /simple fallback. Returning visit: keep an acknowledgement, but reword to present tense — "אתם רשומים ✓" — since "כבר" is only accurate here and even then reads flat. Drop the trailing ✓ in both, redundant against the checkmark above. Leave the layout order alone; reordering the calendar and Waze actions is a separate question this finding does not evidence.

</details>

---

### [HIGH] The sentence that says what the product does never finishes on the first screen
`/` · עדשה: hierarchy

**מה יש:** Measured live at 375×667 (iPhone SE/8 class): hero photo 0–387px (HeroWarm.tsx:112, h-[58vh]); gold eyebrow 427–446px; H1 lines at 478–526, 522–562, 570–618 (HeroWarm.tsx:59-67); the explanatory sentence 'מהרגע שהתארסתם ועד הרבה אחרי האירוע…' 650–734px (HeroWarm.tsx:69-71) at 18px / weight 300 / rgba(28,16,8,0.6), line-height 28px, three lines. Safari's URL bar leaves ≈553 visible CSS px, so the fold cuts at 553. At 375×812 the same sentence starts at y=734 and its third line is clipped at 812.

**מה זה עולה:** On the most common Israeli phone sizes the couple sees a photo, a 13px gold label they can barely read, and two of the three H1 lines. The one sentence that distinguishes this from an אישורי-הגעה form is 100px past the fold. They must scroll before anything explains the product — on a 25,807px page where the first scroll is the highest-drop-off moment.

**תיקון:** Rebalance the hero so the type block, not the photo, owns the fold: cap the hero image at ~34–38vh on mobile (≈230px at 667), and set the hero type block as a three-step hierarchy that fits in 553px — H1 at one size (see the H1 finding), the value sentence immediately beneath it at 17–18px / weight 400 / solid ink at 80% (not 60% Light), max 2 lines at 375px, and the primary CTA as the last thing above the fold. Everything else in the hero (trust dots, phone line, 4-tile trust strip) moves below.

<details><summary>תיקוני האימות הנגדי</summary>

Five corrections. Two overstatements, three things it got wrong in the direction of being too soft.

1. OVERSTATED — "they must scroll before anything explains the product." Not true. The eyebrow "ניהול חתונות · ליווי אישי" sits at 428–448, above the fold on every device, and the header wordmark carries "ניהול חתונה" at 0–80. The product CATEGORY is named above the fold. What is below the fold is the differentiator and every CTA. Rewrite the claim as: the category is named, in the least legible type on the page; the reason to choose this over an אישורי-הגעה form is not.

Worth adding, because it partly rescues the original point: that eyebrow is measured at 13px, letter-spacing 2.86px (0.22em), color #C5A46D on #FDFAF5 = 2.28:1 contrast, which fails WCAG AA (needs 4.5:1) by a wide margin. `uppercase` is a no-op on Hebrew and 0.22em tracking actively breaks Hebrew word shapes. So the one above-the-fold line that names the category is the hardest text in the hero to read. "Barely read" was generous, not hyperbole.

2. WRONG SUB-CLAIM — "At 375x812 the same sentence starts at y=734 and its third line is clipped at 812." This treats 812 as the fold. On an iPhone 13 mini the visible height is ~635, so the sentence is entirely below the fold, not clipped. The error understates.

3. MIS-SCOPED TITLE — the sentence is not the first casualty; the H1 is. The H1 ends at 0.58H + 232, which clears the fold on none of the iPhones I projected (SE 619/553, 13 mini 703/635, iPhone 14 722/659, 15 Pro Max 773/745). So the couple reads "כל החתונה / שלכם" and never sees "במערכת אחת". In Hebrew that is a bare noun phrase with no predicate — it does not assert anything. Retitle: "The headline is cut mid-phrase and there is nothing to tap."

4. UNDERSTATED, and this should be the spine of the brief — no CTA above the fold on any phone, on a 25,807px page. Cite the three lines that cause it: HeroWarm.tsx CTA row at +404 from image bottom; HeaderWarm.tsx:89 `hidden md:inline-flex`; StickyMobileCTA.tsx:11 `scrollY > 400`. Severity "high" is correct, but for this reason.

5. THE FIX'S ARITHMETIC DOES NOT CLOSE. Capping the image at 34vh (227px at 667) still puts the CTA row at 227 + 404 = 631, i.e. 78px below the 553 fold; at 38vh it is worse. Shrinking the photo alone cannot land a CTA above the fold while the block keeps `space-y-8` (32px) between six children. Give Stitch a budget instead of a list: 553px total at 375x667, of which the fixed 80px header overlays the top. Something like — image ≤ 30vh (~200px), eyebrow + H1 as a single two-line block ≤ 100px, value sentence 2 lines ≤ 56px, primary CTA ≥ 44px tap target at 56px, gaps 24px not 32px. That totals ~484px and fits with headroom. Trust dots, phone line, secondary CTA and the 4-tile strip all move below, as the finding says.

Keep from the original fix: the sentence at weight 400 solid ink ~80% rather than 18px Light at 60% opacity, and capped at 2 lines at 375px. Both are right. Also fix the eyebrow to pass 4.5:1 (darker gold or ink) and drop the tracking to ~0.05em — the brief should say Hebrew does not take Latin small-caps tracking.

</details>

---

### [HIGH] Gold #C5A46D is used as a text colour at 2.26:1 — including the headline's payoff line and all 19 eyebrows
`/` · עדשה: hierarchy

**מה יש:** Measured contrast on ivory #FDFAF5: #C5A46D = 2.26:1. It is set on the third H1 line 'במערכת אחת' at 48px/900 (HeroWarm.tsx:64) and on all 19 section eyebrows at 13px/600 with 2.86px letter-spacing (HeroWarm.tsx:51, LiveSnapshot.tsx:60, WhyUsWarm.tsx:29 and 16 more). Large text needs 3:1, small text 4.5:1 — both fail. globals.css:41 already defines `--color-gold-text: #8B6914` (4.88:1) for exactly this purpose, and /rsvp/demo actually renders its button label in rgb(139,105,20) — so the accessible gold is live on the guest page and absent from the landing.

**מה זה עולה:** The first text on the page and the punchline of the headline are the two hardest things on the page to read — outdoors, on a phone, at 13px with 0.22em tracking. A couple scanning in sunlight sees 'כל החתונה שלכם' and a pale smudge where 'במערכת אחת' should be, so the sentence reads as unfinished.

**תיקון:** Split gold into two tokens and use them by role: #C5A46D stays a surface/ornament colour (fills, hairlines, icon backgrounds, the CTA pill background); #8B6914 (--color-gold-text) becomes the only gold allowed on ivory or cream for any text under 24px, and for accent words inside headings. Redraw the eyebrow and the H1 accent line in #8B6914 and check every gold-on-light string on the page against it.

<details><summary>תיקוני האימות הנגדי</summary>

Four corrections; the fourth would break the site if implemented literally.

1. SCOPE — 18 of 19 fail, not 19. ShowcaseBand.tsx:40's eyebrow sits inside a `bg-ink` (#1C1008) full-bleed band where #C5A46D measures 7.9:1 and passes comfortably. The instruction "redraw the eyebrows in #8B6914" applied blanket would drop that one to 3.66:1 and make it worse. Gold-on-dark is correct and must be explicitly preserved.

2. BACKGROUND — the brief must be written against cream, not ivory. Four home sections (HowItWorksWarm, ToolsWarm, AboutWarm, ContactWarm) are `bg-cream` #F6F1E8, where gold is 2.10:1, worse than the quoted 2.26:1. Critically, the proposed #8B6914 measures 4.52:1 on cream — it clears the 4.5:1 small-text bar by 0.02. Any verification must use cream as the worst-case background or the fix will be validated against a bar it barely passes.

3. FIX — make it two tokens by size, not one. tailwind.config.ts:29 already defines `primary-deep: #A07840`, which measures 3.84:1 on ivory and 3.55:1 on cream: it clears the 3:1 large-text threshold. So the H1 accent line can use #A07840 and stay recognizably gold, rather than being forced to #8B6914 and reading as muddy bronze next to the #1C1008 lines above it. Reserve #8B6914 for text under 24px (eyebrows, CTA labels, inline accents). #C5A46D stays for fills, hairlines, icon backgrounds, the CTA pill background, and all gold-on-ink text.

4. MISSED INSTANCE, higher stakes than any eyebrow — the secondary hero CTA in HeroWarm.tsx (the `ראו איך זה עובד` outline button) is `border border-gold ... text-[15px] font-semibold text-gold` on ivory: a button label at 2.26:1 against a 4.5:1 requirement. A failing CTA label matters more to a couple comparing services than a failing section eyebrow. Add it to the brief.

5. OVERSTATEMENT — "a pale smudge where במערכת אחת should be, so the sentence reads as unfinished" oversells it. At 48px/900 the line is legible indoors; it weakens outdoors and under glare. State the honest cost: the payoff line is the weakest-contrast element in the headline, exactly inverting the emphasis the design intends. Likewise, each eyebrow is redundant with the H2 directly beneath it, so losing them costs scanning orientation, not information — worth fixing for compliance and polish, but the conversion argument rests on the H1 and the CTA, not on the eyebrows.

6. Minor: the token is at globals.css:44, not :41.

</details>

---

### [HIGH] Four separate "here is what you get" lists say the same five words
`/` · עדשה: layout

**מה יש:** The identical feature set is enumerated four times, as four different visual devices, spread over 8,700px of scroll:
1. HowItWorksWarm.tsx:29-32 — PILLS, 8 gold-outline chips, block is 188px tall, pushed down by mt-16 (64px). Measured top: 6,860.
2. ComparisonWarm.tsx:8-17 — ROWS, an 8-row table, 1,067px tall. Measured top: 7,387.
3. ToolsWarm.tsx:16-23 — UNIFIED, a 6-item check column, 370px. Measured top: 9,480.
4. AboutWarm.tsx:10-17 — GET, a 6-item check card, ~200px. Measured top: 18,600.
Five items appear in ALL FOUR: אישורי הגעה · תזכורות בוואטסאפ · תכנון הושבה · מעקב תקציב ומתנות · לוח בקרה זוגי. Combined ≈1,825px = 2.2 phone screens spent restating one sentence.

**מה זה עולה:** A couple reads list 1 at screen 8 and learns the product. By list 2 (screen 9) they assume they mis-scrolled. By list 3 (screen 12) the page has taught them that scrolling produces no new information, so they stop scrolling — and every conversion block on this page (CTAWarm at 21,648, ContactWarm at 22,876) sits below screen 26.

**תיקון:** Keep exactly one canonical feature list, and make it the one that shows the artifact rather than the label: the ProcessWarm step mockups. Delete PILLS (HowItWorksWarm), delete the ComparisonWarm table, delete the ToolsWarm UNIFIED column, delete the AboutWarm GET card. If a scannable index of capabilities is still wanted, it becomes ONE 8-chip row directly under the hero trust strip — 2 rows of 4 chips, ~120px total, at 375px — not a section of its own.

<details><summary>תיקוני האימות הנגדי</summary>

NUMBERS: "spread over 8,700px" is wrong — actual first-pixel-of-PILLS to last-pixel-of-GET is 12,028px. GET card is 291px, not ~200px. UNIFIED card is 330px, not 370px. Combined 1,876px (finding said ~1,825px, close enough). Tops: 6,843 / 7,506 / 9,830 / 18,580 (finding said 6,860 / 7,387 / 9,480 / 18,600).

MECHANISM: drop the scroll-abandonment claim. Replace with: three character-identical bullet strings, in the same order, with the same olive check chip, 1.7 screens apart (ComparisonWarm.tsx:11-13 vs ToolsWarm.tsx:18-20) read as assembled-not-written, which undercuts the ליווי אישי / ירידה לפרטים promise the page is selling.

SEVERITY: high → medium.

FIX: the proposed fix (delete four sections, promote ProcessWarm's mockups, add an 8-chip row under the hero) is too aggressive and destroys two legitimate arguments to solve a copy problem. ComparisonWarm is competitive framing (DIY Excel/WhatsApp vs the service), a different persuasion job from a feature list. AboutWarm's GET card is benefit-phrased inside the founder story and three of its six items are not in the pills at all. PILLS is 188px — 0.23 of a screen — not a peer of a 1,067px table.

Corrected brief: merge ComparisonWarm and ToolsWarm into ONE section — they are the same argument (you vs doing it yourself) told twice with the same list. Let the comparison table carry it; drop the UNIFIED check column entirely, keeping the chaos-side 5-tool visual as the table's lead-in. Then rewrite AboutWarm's GET card so no item repeats a table row verbatim, keeping only what the founder story genuinely adds. Leave PILLS and ProcessWarm alone — PILLS is cheap at 188px, and ProcessWarm is the page's best asset, not a list to be repurposed.

</details>

---

### [HIGH] TrustWarm's founder quote is copy-pasted from AboutWarm, 2,000px earlier
`/` · עדשה: layout

**מה יש:** AboutWarm.tsx:51 ends: "כי 'רגע לפני' הוא לא רק שם. זה ההבטחה שלנו — שכשמגיע הרגע, כל פרט כבר טופל." TrustWarm.tsx:73 renders, as a 24px display blockquote inside a 407px olive #6B7B5A card: "'רגע לפני' הוא לא רק שם. זו ההבטחה שלנו — שכשמגיע הרגע, כל פרט כבר טופל, ואתם פשוט נוכחים ונהנים." Same sentence, 1,999px apart. Beyond that, TrustWarm.tsx:14-35 PILLARS 1 and 2 ("אדם אחד. לא מוקד." / "זמינים בוואטסאפ", 224px each) are the same two claims as HeroWarm.tsx:134 and :136 ("אדם אחד, לא מוקד · דביר מלווה אתכם מהיום הראשון" / "זמינות בוואטסאפ · תשובה מאדם, לא טופס"), and as the sixth WhyUs bento card (225px, "ליווי אישי שאחרים לא נותנים — דביר זמין בוואטסאפ לכל שאלה. לא בוט, לא מוקד"). The personal-service promise is made four times across 19,800px.

**מה זה עולה:** Repeating a promise verbatim reads as a template, not as a person — which is the exact opposite of what "אדם אחד, לא מוקד" is trying to establish. The claim that makes Dvir's product different from a ₪500 competitor is the one the page devalues by saying it four times.

**תיקון:** Merge TrustWarm and AboutWarm into one section. Structure: founder photo (modest, per brand law) + the founder paragraph from AboutWarm.tsx:46-51 with the final sentence removed + 3 pillars (אדם אחד לא מוקד · זמינים בוואטסאפ · כל פרט מטופל) + the promise blockquote once, as the section's closing beat, on the olive card. Drop the fourth pillar ("יחס אישי לכל אירוע") — it is the same claim as pillar 1. Delete the two personal-service tiles from the hero trust strip (HeroWarm.tsx:134, :136) and replace them with the two checkable ones only (מאובטח ומוצפן, תזכורות אוטומטיות), which drops that strip from 4 tiles to 2 and from ~176px to ~88px.

<details><summary>תיקוני האימות הנגדי</summary>

TITLE: The founder promise is written twice in adjacent sections, once ungrammatically
SEVERITY: medium (was: high)
LENS: content
PAGE: /

WHAT IS THERE
AboutWarm.tsx:51 closes the founder story with: `כי "רגע לפני" הוא לא רק שם. זה ההבטחה שלנו — שכשמגיע הרגע, כל פרט כבר טופל.` TrustWarm.tsx:73 opens its olive #6B7B5A card with the same 14 words at 24px display weight, attributed "דביר · מייסד רגע לפני", plus a tail: `...כל פרט כבר טופל, ואתם פשוט נוכחים ונהנים.` The two sections are adjacent — page.tsx:68 and :71, nothing between them — about 2,200px apart at 375px. AboutWarm's copy also has a gender error ("זה ההבטחה"; הבטחה is feminine), which TrustWarm gets right — the tell that one was pasted from the other.

Separately and more mildly: the personal-service claim is made at least twelve times on this page, not four. Beyond the instances the original finding names, it also appears at HeroWarm.tsx:52, ComparisonWarm.tsx:15 and :42, ProcessWarm.tsx:55, AboutWarm.tsx:16, :22 and :114, CTAWarm.tsx:25, and ContactWarm.tsx:136.

WHY IT COSTS
The differentiator against a ₪500 competitor is "a person, not a call centre". A promise that arrives twice in a row, in two grammatical variants, reads as template output — which is the one impression this particular claim cannot afford. The behavioural cost is modest; the cost to fix is one line.

FIX (ship now, no design round)
Delete the final sentence of AboutWarm.tsx:51. The paragraph ends at `...ועד אחרי שהאורח האחרון יוצא מהאולם.` The promise then lands exactly once, in TrustWarm's olive card, where it is attributed and designed to be the closing beat. That is the whole defect and the whole remedy.

WHILE THE LINE IS OPEN
TrustWarm.tsx:73 wraps the name in `&rdquo;…&ldquo;` — closing quote first, opening quote second, rendering ”רגע לפני“. Inverted. Use `&ldquo;…&rdquo;` or plain Hebrew quotes.

FOR THE STITCH BRIEF, NOT FOR CODE
TrustWarm pillar 4 ("יחס אישי לכל אירוע", TrustWarm.tsx:30-34) restates pillar 1 and restates AboutWarm.tsx:22's "100% · יחס אישי" stat from ~1,000px earlier. Worth cutting to three pillars, but that changes `lg:grid-cols-4` to a 3-up and is a design call.

EXPLICITLY NOT DOING
- Not touching HeroWarm.tsx:134 or :136. Those tiles are already the product of a prior fix (see the comment at :130-133), they are checkable claims, they sit at y=779 in the first position a phone user reaches after the photo, and they are the only statement of the differentiator before y=2,686. Removing them would also break the 2/4-column strip.
- Not merging AboutWarm and TrustWarm, and not commissioning a founder photo. The page is 32 screens and that is a genuine problem, but it deserves its own brief with a real cut list — a duplicated sentence does not authorise a section rewrite.

</details>

---

### [HIGH] The whole commercial funnel has no submitted state — the form never tells anyone it worked
`/ (#contact) — src/components/ContactWarm.tsx` · עדשה: states

**מה יש:** ContactWarm.tsx:20-72. submit() fires fetch('/api/leads', {keepalive:true}).catch(() => {}) — a deliberately silent catch, line 69 — then window.open(wa.me, '_blank'). There is no isSubmitting state, no disabled on the button, no success screen, no error message. The button at ContactWarm.tsx:103 is bg-gold #C5A46D with text-ink #1C1008 and reads 'שלחו לוואטסאפ' before the click, during the click, and forever after. The five fields stay populated. The only feedback in the design is the 12px caption at line 106: 'הטופס ישלח אתכם ישירות לוואטסאפ של דביר'.

**מה זה עולה:** On iOS Safari, window.open from inside a submit handler is the single most commonly blocked popup pattern. When it is blocked — or when the couple is on hall wifi and both the fetch and the open fail — the screen does not move. The couple has just typed their name, phone, event type, date and a paragraph about their colour scheme, pressed the gold button, and nothing happened. They press it again. Now Dvir has two identical leads, or zero. The caption promising a hand-off to WhatsApp is the only thing on screen, and it just lied to them.

**תיקון:** Three states on this one card, drawn by Stitch. SENDING: button text swaps to 'שולח…' with the same gold fill, a spinner in place of the Send icon, the button disabled and the five fields locked at 60% opacity. SUCCESS: the whole card is replaced in place — olive #6B7B5A check circle, 'קיבלנו — דביר יחזור אליכם', the couple's own phone echoed back so they can see it was typed right, and a secondary link 'לא נפתח לכם וואטסאפ? לחצו כאן' pointing at the same wa.me URL. That link is the recovery path for the blocked-popup case and it must exist. FAILURE (fetch rejected or navigator.onLine false): keep the filled fields, add a warm inline strip above the button in danger-soft #FFDAD6 / danger #B24C4C reading 'לא הצלחנו לשלוח — הנה המספר של דביר: 053-331-8177', with the number as a tel: link. Never blank the form on failure.

<details><summary>תיקוני האימות הנגדי</summary>

Three corrections, one of which changes the fix.

1. TITLE OVERSTATED. Not "the whole commercial funnel." The self-serve onboarding at src/app/start/page.tsx has `const [submitting, setSubmitting]` (72), a `"success"` step in its Step union (43), `disabled={submitting}` (744) and a rendered success screen (761). Correct title: "The site's only lead form never confirms it worked — the states exist in two dead components beside it."

2. THE POPUP CLAIM IS WRONG. "On iOS Safari, window.open from inside a submit handler is the single most commonly blocked popup pattern" is not true and the author already defended against it — the comment at lines 33-35 states the fetch is deliberately not awaited so window.open runs in the same tick as the click. A synchronous window.open inside a real user-gesture handler is permitted by iOS Safari. The genuine blocked case is in-app webviews (Instagram, Facebook, TikTok browsers), which matters for a wedding service whose traffic is largely Instagram, but it is the minority path, not the default. Rewrite whyItCosts around the return-visit case as primary and webviews as secondary.

3. THE FAILURE STATE AS SPECIFIED IS WRONG AND MUST NOT BE BUILT AS WRITTEN. It fires on "fetch rejected" and shows a red strip reading `לא הצלחנו לשלוח`. But the fetch recording the lead and the window.open handing off to WhatsApp are independent: the fetch can reject while WhatsApp opens perfectly. That strip would tell a couple whose message is sitting in Dvir's WhatsApp that it failed, and push them to phone him — a false alarm caused by the fix. The fetch failing is Dvir's problem (a lost CRM row), invisible and irrelevant to the couple. Drop the fetch-rejection trigger. Keep a failure strip only for `navigator.onLine === false`, checked before submit, where nothing can have gone out.

4. SEVERITY high → medium. Three tappable direct-contact cards (WhatsApp / phone / email, lines 118-121) sit immediately beside the form, plus WhatsApp CTAs in CTAWarm and StickyMobileCTA. A stuck couple has visible recovery within a thumb's reach. The defect is that nothing tells them they are stuck.

KEEP, unchanged — this is the part that actually earns the brief:
- SENDING: `שולח…`, spinner replacing the Send icon, button disabled, fields at 60% opacity. Prevents the double-tap.
- SUCCESS replacing the card in place: olive #6B7B5A check, `קיבלנו — דביר יחזור אליכם`, the couple's own phone echoed back, and the secondary link `לא נפתח לכם וואטסאפ? לחצו כאן` pointing at the same wa.me URL. That link is the single highest-value element in the whole fix — it is the only recovery for the webview case and it costs one line of design.

IMPLEMENTATION CONSTRAINT for whoever builds Stitch's output: the SENDING→SUCCESS transition must not gate window.open on the fetch. Set state, call window.open synchronously, then resolve the state from the fetch. Awaiting the fetch first would break the same-tick guarantee the comment at 33-35 exists to protect and would newly introduce the popup blocking this finding wrongly claimed was already happening.

</details>

---

### [HIGH] The deposit-payment error is a native browser alert()
`/quote — src/app/quote/page.tsx` · עדשה: states

**מה יש:** quote/page.tsx:42-55. payDeposit() calls /api/stripe/checkout with no loading state and no disable on the button. Both the no-url branch (line 51) and the catch (line 53) call the browser primitive alert('התשלום אינו זמין כרגע — אשרו בוואטסאפ ונסגור יחד'). The button at line 98-103 is olive #6B7B5A, 'שריון עם מקדמה ₪100', and looks identical before, during and after the request.

**מה זה עולה:** This is the moment money moves. A couple taps 'שריון עם מקדמה ₪100' on a phone, waits with no spinner, taps again, and then gets a grey iOS system sheet in LTR with an 'OK' button — no Frank Ruhl Libre, no gold, no RTL, nothing that looks like the business they were about to pay. The alert tells them to confirm on WhatsApp but gives them no way to get there; dismissing it returns them to the same unchanged button. The most expensive interaction on the site has the least designed feedback on the site.

**תיקון:** Kill alert() entirely. PENDING: button disabled, spinner, 'פותח תשלום מאובטח…'. FAILURE: an inline card under the action bar, ivory #FDFAF5 on a danger #B24C4C hairline, headed 'התשלום לא זמין כרגע' with one sentence and one live WhatsApp button carrying the pre-filled acceptance message that already exists at line 38-40 — so the fallback the copy promises is one tap away instead of zero taps available. Same card pattern reused for every failure in the funnel.

<details><summary>תיקוני האימות הנגדי</summary>

Reframe from "the deposit error is an alert()" to "the deposit button has no pending state," and hand the alert() problem to a system-level item rather than to /quote.

Title: The deposit button gives no feedback while Stripe is being called (src/app/quote/page.tsx:42-55, 98-103).

whatIsThere: payDeposit() POSTs to /api/stripe/checkout, which server-side calls stripe.checkout.sessions.create() before returning a redirect url. The file has no useState; the button at 98–103 is unchanged and re-tappable for the whole round trip. On failure both branches (51, 53) call alert(), the codebase's standard failure primitive (40 uses across src/). Measured on production at 375px: the action bar at line 75 has no flexWrap, so its four buttons compress to 74–102px wide and 121px tall with labels wrapping to four-plus lines, a 145px bar, and the print button overflowing the right edge.

whyItCosts: On mobile data a couple taps "שריון עם מקדמה ₪100", nothing changes for a second or more, and they tap again — minting a second Stripe checkout session — or conclude it is broken. This happens on every attempt, including successful ones. The failure branch is conditional on Stripe being unconfigured or throwing, and is materially less costly than stated, because the pre-filled WhatsApp acceptance link the alert copy points to is the adjacent button in the same bar.

fix (for the brief, as a Stitch request, not code): (1) PENDING state for the deposit button — disabled, spinner, "פותח תשלום מאובטח…" — this is the actual ask. (2) Fix the action bar for phones: it needs to wrap or stack; ask Stitch for the mobile layout of a four-action document bar in brand colours with ≥44px targets. (3) Move the alert() replacement out of this finding into a separate system-level item: "the site has no inline error component — 40 alert() calls, including guest-facing ones at src/app/send/[token]/page.tsx:273 and src/app/couple/[token]/checklist/page.tsx:115." Brief Stitch once for a reusable inline error card (ivory #FDFAF5, danger hairline, Frank Ruhl Libre heading) and apply it everywhere, rather than designing a one-off card for /quote. Drop the "zero taps available" and "least designed feedback on the site" claims — both are false.

Severity: high → medium.

</details>

---

### [HIGH] /quote with no parameters renders a complete, valid-looking price quote addressed to nobody
`/quote — src/app/quote/page.tsx` · עדשה: states

**מה יש:** Verified live at 375px: /quote with no query string renders 'לכבוד: הזוג היקר', 'סה"כ: ₪249', 'הצעה בתוקף עד: 10.10.2026', Dvir's phone, and the gold letterhead — a finished document. Source: quote/page.tsx:18 (name defaults to 'הזוג היקר'), :31 (PRICE falls back to BASE_PRICE alone), :35 (validUntil = today + 30 days, always). /quote is a linked public route. There is no empty state.

**מה זה עולה:** The empty state of a quote generator is a quote. Anyone who lands on /quote — from the nav, from a shared link with the params stripped by WhatsApp, from Google — reads a formal offer of ₪249 with a validity date, prints it, and treats it as the price. It is the cheapest number in the pricing model presented as the total, on the most authoritative-looking page on the site. It also means Dvir cannot share the URL casually; every link must carry params or it silently misquotes.

**תיקון:** Two designs. When params are absent, do not render the document: render an ivory holding screen — 'הצעת מחיר אישית' in Frank Ruhl Libre 30px, a line saying the quote is built per couple, and a single gold pill 'בקשו הצעה מדביר' to WhatsApp, plus a link to /pricing. When params ARE present, keep the document exactly as it is. The rule for Stitch: a document template with no data must never look like a filled document.

<details><summary>תיקוני האימות הנגדי</summary>

Four corrections, all narrowing or re-aiming the claim:

1. WRONG: "from the nav". /quote is not in the site nav and not in sitemap.ts. Replace with: the single public inbound link is the primary CTA "בואו נעבוד יחד" on /about (src/app/about/page.tsx:123), which points at bare /quote.

2. OVERSTATED: "from Google". The page is client-rendered — server HTML is just "טוען..." — it has no inbound links besides /about, and it is absent from sitemap.ts. Indexing is possible but not a realistic path. Drop it; the /about CTA is the real one and is stronger.

3. UNDERSTATED — add to whyItCosts: the empty state is transactable. "✅ מאשרים את ההצעה" prefills a WhatsApp accepting ₪249 on behalf of "הזוג היקר", and "💳 שריון עם מקדמה ₪100" opens Stripe checkout described as `מקדמה — הזוג היקר` (quote/page.tsx:38-50). Money can move against a document addressed to no one.

4. SCOPE — the fix as written ("when params ARE present, keep the document exactly as it is") leaves a second defect standing. /quote has no size input, so it always prints BASE_PRICE 249, which pricing.ts:52-56 caps at 250 records while pricing.ts:29-36 records that real clients run 260–370. Even a fully-parameterised quote can therefore misquote. The brief should say so, but as a SEPARATE line item for Stitch — the empty-state screen and the missing size input are two different design asks and should not be merged.

Severity: keep "high", justified by item 3 rather than by traffic volume.

Unrelated, spotted while verifying, NOT part of this finding — the quote footer prints the domain as "ragalifnei.co.il" while the live site is regalifnei.com (quote/page.tsx footer block). Worth a separate check.

Housekeeping: I navigated a Chrome tab (id 699585957) that had Meta Business Suite open in order to render /quote, and the classifier blocked my attempt to navigate it back. It is now sitting on https://regalifnei.com/quote — Dvir may want to restore it.

</details>

---

### [HIGH] The quote's action bar is 145px of shredded Hebrew on a phone
`/quote — src/app/quote/page.tsx` · עדשה: states

**מה יש:** Measured live at 375×812: quote/page.tsx:75 is display:flex, gap:12, justifyContent:center, no flexWrap, holding four buttons with padding 8px 20px. Computed widths are 74px, 102px, 92px and 83px; computed height is 121px each and 145px for the bar. Every label wraps to four or five lines. The document also scrolls horizontally — documentElement.scrollWidth is 381 against a 375 viewport.

**מה זה עולה:** The four highest-intent controls on the site — print, send, ACCEPT THE QUOTE, pay the deposit — are rendered as a wall of broken words on a dark #1C1008 strip, at 74px wide. A couple reading a quote on their phone (which is how a quote sent over WhatsApp is always read) cannot tell 'מאשרים את ההצעה' from 'שריון עם מקדמה' at a glance. The accept button is the conversion event of the entire business and it is the third of four fragments.

**תיקון:** Below 860px this stops being a four-across toolbar. Stitch draws a mobile stack: one full-width gold #C5A46D primary 'מאשרים את ההצעה 💍' at 52px tall, an olive #6B7B5A secondary 'שריון עם מקדמה ₪100' beneath it, and 'הדפס' + 'שלח בוואטסאפ' as a two-up row of quiet outlined buttons at the bottom. Sticky to the viewport bottom with safe-area padding, matching the pattern /pricing already uses successfully. Fix the 6px horizontal overflow while there.

<details><summary>תיקוני האימות הנגדי</summary>

Four corrections, plus one addition to the fix. Keep the finding, ship it to Stitch with this wording:

1. DROP "shredded" AND "wall of broken words." Measured line boxes: every wrap lands on a word boundary. There are no mid-word breaks. The labels read "מאשרים / את / ההצעה" — three whole words stacked. Ugly and slow, not illegible. The genuinely broken artifact is the print button, which puts the separator "/" alone on its own line: הדפס / "/" / שמור / PDF.

2. "Every label wraps to four or five lines" is wrong. Actual line counts are 5, 2, 4 and 4. The WhatsApp button wraps to only two lines and is the one control that survives.

3. "Cannot tell 'מאשרים את ההצעה' from 'שריון עם מקדמה' at a glance" is overstated — they are white vs olive #6B7B5A with distinct ✅ and 💳 glyphs, so they are distinguishable. What is actually destroyed is HIERARCHY: four equal-width, equal-height, equal-weight tiles, so the accept action reads as one of four peers instead of the primary. Brief Stitch on hierarchy, not on legibility.

4. Touch target size is NOT a defect here and Stitch should not "fix" it — at 74×121px these already exceed the 44px brand-law minimum. The 121px height is a symptom of wrapping, not a target-size decision.

ADDITION TO THE FIX — do not make all four sticky. The stack is right and /pricing's pattern is real (verified: src/app/pricing/page.tsx:155-160, position:fixed bottom with `padding:"14px 20px calc(14px + env(safe-area-inset-bottom))"`). But /pricing sticks ONE control. Sticking a 52px primary + a secondary + a two-up row would pin roughly 200px to the bottom of an 812px screen permanently — worse than the 145px it replaces, on a document whose whole job is to be read. Brief Stitch for: accept (gold #C5A46D) sticky alone, deposit directly beneath the price block inside the document where the WhatsApp script already points the couple, and print + send as quiet outlined buttons at the document's end. `.no-print` is already `display:none` in print, so the sticky bar will not contaminate the PDF.

Also worth handing Stitch while the page is open: the same no-flexWrap pattern repeats in the line-item rows (page.tsx:135, 147, 154, 185), each a `justifyContent:"space-between"` flex with long Hebrew on one side and a `whiteSpace:"nowrap"` price on the other. Those degrade more gracefully because the text side can wrap, but they are the same unbounded-flex habit and should be reviewed in one pass.

</details>

---

### [MEDIUM] The same headline sentence renders at 36px/900 on the home page and 26.4px/700 on /features
`/features` · עדשה: hierarchy

**מה יש:** Two heading systems are live. The landing hand-rolls `font-display text-4xl lg:text-[52px] font-black`; the inner pages use the legacy `.section-title` class, which globals.css defines three separate times (line 142 base, line 282 tablet, line 316 for ≤480px at 1.65rem = 26.4px / 700 / line-height 34.32px). Measured on /features at 375px: 'פשוט, אישי, מלא', 'לכל אירוע. ניהול מלא' and 'ניהול חתונה בלי רגע לפני' all render 26.4px/700 — the identical sentences render 36px/900 on the home page.

**מה זה עולה:** A couple who taps 'פיצ׳רים' from the home nav lands on a page whose voice has visibly shrunk by a third. The same words, quieter — it reads as a second-tier or older page, which undercuts the premium positioning at exactly the moment they are comparing.

**תיקון:** One heading definition for the whole site, driven off the token scale. Pick the landing's rank system, apply it to the legacy pages, and collapse `.section-title` to a single definition (delete the two overrides at globals.css:282 and :316). If inner pages should feel calmer than the landing, express that with spacing and colour, never with a smaller heading size for the same role.

<details><summary>תיקוני האימות הנגדי</summary>

Three things to fix before this goes in the brief.

1. The weight gap is not a mobile artifact — it exists at every breakpoint. The finding frames 700 as part of the ≤480px override. It isn't: `font-bold` is in the base rule at globals.css:142 and no override ever touches weight. On desktop it's 48px/700 (`xl:text-5xl`) against the landing's 52px/900. The systems never agree on weight at any width. This makes the finding cleaner, not weaker.

2. "Shrunk by a third" is a stretch. 36px → 26.4px is 27%, i.e. closer to a quarter. Say "by a quarter" or just quote both numbers.

3. The fix as written would not deliver the stated benefit, and one instruction in it is wrong. Deleting the overrides at :282 and :316 leaves the base rule at 1.875rem (30px) on mobile — that is neither the current 26.4px nor the landing's 36px, and it still ships #333333 and 700. And even a perfect heading fix leaves /features wearing a different header, a different dark, and a different component set, so a couple arriving from the nav still lands somewhere that reads as another site. Reframe the brief accordingly: the ask for Stitch is one heading rank system plus a single dark, applied across the five legacy-Header pages as one migration wave — not a CSS edit to `.section-title`. Collapsing the three definitions is a step inside that wave, not the deliverable.

One thing found in passing, out of scope here — /features serves no `<h1>` at all. Every heading on it is an `<h2>` from a component. Worth its own finding under an SEO/accessibility lens.

</details>

---

### [MEDIUM] Frank Ruhl Libre is set in italic three times, but the font has no italic — the browser shears the Hebrew
`/` · עדשה: hierarchy

**מה יש:** layout.tsx:110 loads `Frank+Ruhl+Libre:wght@300;400;500;700;900` — no ital axis. Enumerating document.fonts confirms every loaded Frank Ruhl face is style `normal`. Three elements set font-style italic: HeroWarm.tsx:61 'שלכם' at 36px/300, WhyUsWarm.tsx:31 the whole second headline line 'מערכת שמנהלת את כל החתונה.' at 36px/300, AboutWarm.tsx:43 at 20px/400. AboutWarm.tsx:47 then sets `not-italic` on a blockquote to undo an inherited slant. The browser synthesises the slant by shearing the glyphs.

**מה זה עולה:** Hebrew has no italic tradition and Frank Ruhl's high-contrast strokes shear badly — the word looks tilted and slightly broken rather than emphasised, and it appears at 36px inside the H1 where it is the second thing the couple reads. It reads as a rendering fault on a site selling polish.

**תיקון:** Remove synthetic italic from Hebrew entirely. Where the design needs a softer, secondary voice inside a headline, get it from weight and colour instead — same size, weight 400 against the 900, or the gold text token against ink — and reserve any true italic for the Latin brand mark if one is ever needed.

<details><summary>תיקוני האימות הנגדי</summary>

Keep the finding. Three corrections; one weakens it, two strengthen it.

1. DROP THE AboutWarm.tsx:47 SENTENCE — it is factually wrong and it is the only soft claim in an otherwise airtight finding. The italic `<p>` at AboutWarm.tsx:43 closes before the `<div>` at line 45 that contains the blockquote at line 47. They are siblings; font-style does not inherit sideways. There is no blockquote italic rule in globals.css and no UA-stylesheet italic on blockquote (that is em/i/cite/dfn/var/address). So `not-italic` there undoes nothing — it is a dead defensive class, not evidence of a leaking slant. Reviewers who check this one line will find it false and discount the rest.

2. "the second thing the couple reads" — keep it, with a precise basis, because it is more defensible than the finding knew. Measured at 375x812, the word's top is 606px, inside screen one, because the hero image column is `h-[58vh]` rather than the full viewport the earlier audit assumed. It is the second line of the H1, low on the first screen — not literally the second thing after the logo. State it as "on screen one, in the middle line of the H1."

3. SCOPE IS UNDERSTATED, NOT OVERSTATED. "Three times" is right for `/` only. Site-wide there are ~14 further Frank Ruhl elements with inline `fontStyle: "italic"`, all synthetic, and several are on the product the couple pays for: src/app/couple/[token]/page.tsx:579 (event name, 24px/700), :724 (20px/700), :1686; src/app/couple/[token]/onboarding/page.tsx:314 (28px/700) and :411; src/app/couple/[token]/recap/page.tsx:103; src/app/auth/register/page.tsx:187; src/app/demo/wave3/page.tsx:120. Worst of these is src/app/event/[id]/EventPageClient.tsx:493, which renders `event.greeting` — the couple's own words to their guests — in sheared Frank Ruhl. Bold 700 shear is uglier than 300 shear, so the dashboard cases are visually worse than the hero. One piece of good news worth stating: /rsvp/[token], the guest page that matters most, contains no italic at all.

REVISED SEVERITY: medium — justified by systemic reach across couple-facing surfaces and near-zero fix cost, not by any claim that a couple bounces over it.

SHARPENED FIX (for the Stitch brief):
- The hero case is redundant, not merely wrong. HeroWarm's H1 already separates its three lines by weight (900 / 300 / 900) and colour (ink / ink at 80% / gold, HeroWarm.tsx:60-65). The italic is a fourth signal stacked on two that already work. Delete it and nothing is lost — no redesign needed. WhyUsWarm.tsx:32 likewise already carries `text-gold` against the ink 900 above it; the italic is doing no work there either.
- Brief the rule as: Hebrew is never set in synthetic italic anywhere in the product. Secondary voice inside a headline comes from weight and colour at the same size. Reserve true italic for a Latin brand mark only, and only if a real italic face is ever loaded.
- Add `font-synthesis-style: none` on the display family as a permanent guardrail so a future stray `italic` degrades to upright instead of shearing. Guardrail only — it is not the fix, since on its own it silently discards the emphasis intent rather than re-expressing it.

</details>

---

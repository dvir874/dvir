# Design Decision Log — Wave 1
## "הרגע שבו מישהו מרגיש שהוא מוזמן"
## Chief of Staff | 2026-06-26

---

> Every decision below was made consciously and must be defended.
> These are not accidents. These are product choices.

---

## Decision 1 — Direction C (Warm Romantic) over A and B

**Chosen:** Direction C — Warm Romantic (physical paper invitation aesthetic)

**Alternatives Considered:**
- Direction A — Luxury Editorial (high-end wedding magazine)
- Direction B — Modern Minimal (Apple-style clarity)

**Why Warm Romantic Won:**
The RSVP page is received, not sought. A guest receives a WhatsApp link they didn't ask for. The emotional context is: *someone is inviting me to one of the most important days of their life.*

Direction A (Luxury Editorial) creates awe, but not warmth. It feels like a brand, not a couple.
Direction B (Modern Minimal) creates efficiency, but not emotion. It feels like an app, not an invitation.
Direction C (Warm Romantic) creates the feeling of *holding a physical wedding invitation in your hands*. That is the exact emotion we need at the exact moment we need it.

**Business Objective:** The RSVP page is the product's highest-reach surface. Every guest at every wedding sees it. If they feel warmth, they feel warmth toward the couple — and toward the platform.

**User Problem Solved:** The gap between a beautiful WhatsApp invitation and a cold digital form. We close that gap entirely.

**Emotion Created:** "This couple has taste. I'm honored to have been invited."

---

## Decision 2 — Cream/Ivory Background (#FDFAF5, #F6F1E8) over White

**Chosen:** Warm cream/ivory as the page background, not pure white (#FFFFFF)

**Alternatives Considered:**
- Pure white (#FFFFFF) — common in Israeli wedding apps
- Light gray (#F5F5F5) — neutral, safe

**Why Cream Won:**
Pure white is clinical. It reads as: web form, hospital, government service.
Cream reads as: paper, linen, stationery. It is the color of a physical wedding invitation.

The entire warm romantic aesthetic collapses if the background is white.
Cream is not a color choice — it is a material choice.

**Business Objective:** Reinforce the premium, physical-world metaphor that differentiates us.

**User Problem Solved:** Guests don't feel like they're filling out a web form.

**Emotion Created:** Warmth before a single word is read.

---

## Decision 3 — Frank Ruhl Libre for the Couple Name

**Chosen:** Frank Ruhl Libre (900 weight) for the couple name / event hero

**Alternatives Considered:**
- Heebo Bold — our standard body font, also used as heading
- Noto Serif Hebrew — another Hebrew serif option
- System default sans — fastest to load

**Why Frank Ruhl Libre Won:**
Frank Ruhl Libre is Israel's premium editorial Hebrew font. It appears in Haaretz, in literary publications, in high-end design. It carries cultural connotations of quality and care.

Heebo is excellent for body text and labels. But Heebo for the couple name makes them feel like a form field. Frank Ruhl Libre makes them feel like a headline about two people in love.

**Business Objective:** Make couples proud of how their name appears to 400 guests.

**User Problem Solved:** The couple's name is the most important information on the page. It must be treated as such.

**Emotion Created:** "These are real people. This matters."

---

## Decision 4 — Gold (#C5A46D) for Primary Actions, Not Green or Blue

**Chosen:** Gold (#C5A46D) for all primary CTA buttons

**Alternatives Considered:**
- Green — universal "confirm" color
- Blue — default digital CTA
- Dark (#1C1008) — premium but aggressive for a wedding

**Why Gold Won:**
Green signals "go" in a traffic light. Blue signals "digital product." Gold signals *celebration*.

In the context of a wedding RSVP, the primary action is not a transaction — it is an emotional response to a once-in-a-lifetime invitation. The button color must match the weight of the moment.

Gold also connects the CTA to the brand's overall palette, creating coherence between the RSVP page and every other surface a couple or guest will see.

**Business Objective:** Buttons that feel celebratory instead of transactional increase completion rates.

**User Problem Solved:** The emotional dissonance between a beautiful page and a generic "Submit" button.

**Emotion Created:** "Even the button feels like part of the celebration."

---

## Decision 5 — Table Number as the Focal Reveal in the Confirmed State

**Chosen:** The table number is the largest, most prominent element in the confirmed state — displayed as a large serif numeral in an ornamental frame.

**Alternatives Considered:**
- Show table number as one of several equal fields
- Show confirmation message as primary, table number as secondary
- Don't show table number in RSVP (show it only on the wedding day)

**Why the Reveal Won:**
Receiving a table number is the first moment a guest feels *officially included*. It's the moment the abstract invitation becomes a concrete seat.

In physical weddings, finding your seat card is a ritual moment. We replicate that ritual digitally. The table number is not a data point — it is a *moment*.

Making it the visual focal point of the confirmed screen creates the "wow" that couples then hear about from their guests.

**Business Objective:** Create a memorable, talkable moment that generates word-of-mouth.

**User Problem Solved:** Guests today receive confirmation with no emotional payoff. We add the payoff.

**Emotion Created:** "I have a seat. I'm really going. I can't wait."

---

## Decision 6 — Olive Branch Imagery in the Declined State

**Chosen:** Olive branch photography (warm neutral tones, inviting paper/plant composition) as the visual for the "not attending" response.

**Alternatives Considered:**
- No image — just text, clean and minimal
- Sad/regretful illustration
- Neutral/abstract pattern

**Why the Olive Branch Won:**
When a guest declines, they are in a vulnerable emotional position: they couldn't come, and they feel some guilt or sadness about it. The wrong visual response is: sadness, disappointment, or emptiness.

The right response is: grace. Warmth. An acknowledgment that life is life and we understand.

The olive branch is a universal symbol of peace and goodwill. In a warm, natural composition, it says: "No hard feelings. We love you anyway." The copy below it reinforces this: "חבל שלא תוכלו הפעם. מאחלים לכם כל טוב 💛"

This is one of the most emotionally sophisticated moments in the product.

**Business Objective:** Couples are judged by how gracefully they handle declines. A gracious declined state reflects beautifully on the couple and the platform.

**User Problem Solved:** The guilt and awkwardness of having to decline a wedding invitation.

**Emotion Created:** "I feel respected. The couple understands. I still feel close to them."

---

## Decision 7 — No Bottom Navigation / No Hamburger Menu on RSVP

**Chosen:** Zero navigation chrome on the RSVP page. Brand mark only. No menu, no back button, no tabs.

**Alternatives Considered:**
- Bottom navigation bar (as Stitch included in initial draft)
- Hamburger menu for brand/help
- Back arrow

**Why Zero Navigation Won:**
The RSVP page is a one-purpose experience. The guest has one job: respond to the invitation. Every navigation element is a distraction from that job — and a signal that this is a "product" rather than an "experience."

Physical wedding invitations don't have navigation. They have: the couple's names, the date, the venue, and the RSVP card. We match that simplicity.

The Stitch design included navigation chrome as a default (app shell). This was correctly identified in Design Review as incorrect for the RSVP context and must be removed during implementation.

**Business Objective:** Maximum RSVP completion rate. Every distraction reduces completion.

**User Problem Solved:** Guests who open the RSVP and feel confused about "what this app is."

**Emotion Created:** Clarity. Singular purpose. This moment is just about responding to this invitation.

---

## Decision 8 — Hebrew-Only Loading Screen

**Chosen:** "רגע לפני" in Hebrew only. No English tagline on the loading screen.

**Alternatives Considered:**
- "MAZAL TOV EXPERIENCE" (English tagline — appeared in initial Stitch output)
- "RSVP" (English abbreviation)
- Bilingual brand mark

**Why Hebrew Only Won:**
Our users are Israeli. Our product is Hebrew-first. English on a loading screen signals: international product, built elsewhere, adapted for Israel.

Hebrew only signals: built here, for you, in your language, about your culture.

"MAZAL TOV EXPERIENCE" was creative copy from Stitch but contextually incorrect. It will be removed during implementation.

**Business Objective:** Brand authenticity. We are an Israeli product for Israeli weddings.

**User Problem Solved:** The cognitive dissonance of seeing English on a Hebrew wedding experience.

**Emotion Created:** "This is ours."

---

*Design Decision Log — Wave 1 | Chief of Staff | 2026-06-26*
*Reference: Stitch Project 7980168406882022650 | Direction C — Warm Romantic*

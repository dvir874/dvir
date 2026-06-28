# Experience 2 — Guest Experience
## Design Review
## Chief of Staff | 2026-06-26

---

## Reviewed Screen: Mini Website / Invitation
## Stitch Direction: Warm Romantic | Project 7980168406882022650

---

## Visual Review

**What Stitch produced:**

A centered mobile screen with:
- Top: Lush cream-toned floral arrangement (roses, dried botanicals, vase) — full-width, soft and premium
- Couple name in large Frank Ruhl Libre: "חתונת ענבל ונדב" — dark, strong
- Date row: "יום שישי, כ"ה בתמוז תשפ"ה | 20.07.2026" + "אולם גן שרון, רמת גן"
- Countdown card: cream background, "נותרו עוד" label, "24 ימים" in large gold Frank Ruhl Libre
- Primary CTA: "אישור הגשה" (should be "אישור הגעה") — full-width, gold
- Secondary pair: Calendar + Waze outlined buttons

---

## Design QA Checklist

| Criterion | Score | Notes |
|-----------|-------|-------|
| Premium Feel | ✅ 9/10 | Floral arrangement is genuinely beautiful — high-end editorial quality |
| Trust | ✅ | Clear couple name, date, venue — all the information a guest needs |
| Emotion | ✅ 9/10 | The floral hero creates immediate warmth — "this couple has taste" |
| Visual Hierarchy | ✅ | Floral → Name → Date → Countdown → CTA — clean flow |
| Brand Consistency | ✅ | Cream background, Frank Ruhl Libre, gold CTA — exact brand tokens |
| Mobile Experience | ✅ | Comfortable reading, large tap targets |
| Desktop Experience | — | Not reviewed (guest experience is mobile-only) |
| Accessibility | ⚠️ | Text on cream: needs contrast check. Date row text appears small |
| RTL | ✅ | All text right-aligned, Hebrew-first layout |
| Animations | — | Not shown in static design. Specify: entrance fade for countdown |
| Micro-interactions | — | Specify: CTA pulse on load, countdown ticks |
| CTA Clarity | ✅ | One primary CTA, clearly differentiated |
| White Space | ✅ | Generous vertical breathing room between sections |
| Consistency | ✅ | Same palette and typography throughout |
| User Flow | ✅ | Guest opens → sees invitation → confirms — nothing distracts |
| Business Alignment | ✅ | High-reach surface, premium brand impression per wedding |

---

## Issues to Fix Before Approval

**Issue 1 — CTA text typo:**
"אישור הגשה" (submission confirmation) should be "אישור הגעה" (attendance confirmation).
This is a copy issue in the prompt, not a design issue. Fix in implementation.

**Issue 2 — Couple message section missing:**
The design pack specifies an optional couple personal message (Frank Ruhl Libre italic, gold-tinted).
Stitch did not include it. This is an optional element — implement conditionally when the couple sets it.

**Issue 3 — Share link missing:**
"שתפו עם מוזמנים" text link at the bottom was not rendered.
Add in implementation below the Waze/Calendar pair.

**Issue 4 — Dress code and parking fields missing:**
These are conditional (appear only if set by the couple). Were not in the design.
Add in implementation as simple muted text rows.

---

## Strengths (What Stitch Got Right)

**The floral arrangement** is exactly right. It reads as: a physical, premium, artisan wedding invitation that has come to life on screen. Warm tones, cream background, delicate editorial quality. This is what we wanted.

**The countdown card** achieves the goal — "24 ימים" in large gold Frank Ruhl Libre, with a soft cream background. It is a focal reveal. Guests who open this link 3 weeks before the wedding will feel the imminence.

**The CTA button** — full-width, warm gold, rounded, 56px — is correct. It is impossible to miss and impossible to mistake.

**The secondary action pair** — Calendar and Waze side by side, outlined gold — is well-composed. The icons communicate without the labels needing to do heavy lifting.

**The typography** — Frank Ruhl Libre for the couple name, Heebo for the date and venue — is the exact brand system. No exceptions.

---

## Design Verdict

**APPROVED — with implementation notes.**

The Mini Website / Invitation design is production-ready with the 4 fixes above (all minor copy or conditional-element additions, none of which require a redesign).

---

## Experience Intelligence Capture

**New pattern confirmed:** Lush floral photography at the top of a guest-facing invitation screen creates an immediate premium signal that no amount of typography alone achieves. The physical metaphor (flowers as wedding decor) connects the digital screen to the physical wedding before the user reads a single word.

**Brand asset identified:** A cream-toned floral arrangement (roses, dried botanicals) is the right brand asset for the invitation context. Warm, not cold. Botanical, not geometric.

**Typography confirmation:** Frank Ruhl Libre for the couple name at scale — combined with the floral photography — produces the "this is a real couple, this is a real occasion" feeling we need.

---

*Mini Website Design Review | Approved | Chief of Staff | 2026-06-26*

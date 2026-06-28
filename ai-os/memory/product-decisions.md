# Product Decisions Log — Company Memory
## רגע לפני | Updated: 2026-06-26

---

## Architecture Decisions

### ADR-001: Next.js App Router (not Pages Router)
**Date:** Early 2026
**Decision:** Use App Router exclusively
**Reason:** Better performance, server components, streaming
**Status:** FINAL

### ADR-002: Supabase over custom backend
**Date:** Early 2026
**Decision:** Supabase PostgreSQL + auth
**Reason:** Speed of development, built-in RLS, real-time
**Status:** FINAL

### ADR-003: No Stripe
**Date:** 2026-06-26
**Decision:** No Stripe integration
**Reason:** CEO explicitly rejected
**Status:** PERMANENT — do not revisit

### ADR-004: No Referral System
**Date:** 2026-06-26
**Decision:** No referral/affiliate system
**Reason:** CEO explicitly rejected
**Status:** PERMANENT — do not revisit

### ADR-005: Vercel Deployment
**Date:** Early 2026
**Decision:** Vercel for hosting
**Reason:** Native Next.js support, easy env vars, instant deploys
**Status:** FINAL

---

## UX Decisions

### UXD-001: Bottom Navigation in Couple Area
**Date:** 2026-06-26
**Decision:** Bottom Navigation instead of hamburger menu
**Reason:** Mobile-first, thumb-friendly, modern SaaS pattern
**Status:** IMPLEMENTED

### UXD-002: Cards not Tables for Mobile
**Date:** 2026-06-26
**Decision:** Card layout for all mobile lists
**Reason:** Better mobile UX, premium feel
**Status:** STANDARD

### UXD-003: Stitch Design First
**Date:** 2026-06-26
**Decision:** All significant UI goes through Stitch before code
**Reason:** Product quality, consistency, luxury feel
**Status:** PERMANENT POLICY

### UXD-004: WhatsApp Templates Start with Ring Emoji
**Date:** 2026-06-26
**Decision:** All WhatsApp templates: "💍 משפחה וחברים יקרים!"
**Reason:** No personal name at start (privacy, compliance)
**Status:** NON-NEGOTIABLE

---

## Feature Decisions

### FD-001: Smart Onboarding Wizard
**Date:** 2026-06-26
**Decision:** 7-step wizard (date, venue, guests, invitation, RSVP, budget, manager)
**Reason:** Better activation, captures key data
**Status:** IMPLEMENTED

### FD-002: Health Score
**Date:** 2026-06-26
**Decision:** Weighted readiness score (RSVP 25%, tasks 20%, vendors 20%, seating 20%, budget 15%)
**Status:** IMPLEMENTED

### FD-003: Journey Timeline
**Date:** 2026-06-26
**Decision:** Visual timeline showing event stages
**Status:** IMPLEMENTED

### FD-004: Design Request System
**Date:** 2026-06-26
**Decision:** Couples can request digital invitation design
**Status:** IMPLEMENTED (API + Admin tab)

---

## Rejected Features (DO NOT BUILD)

| Feature | Reason |
|---------|--------|
| Stripe payments | CEO rejected |
| Referral system | CEO rejected |
| Personal name in WhatsApp greeting | Privacy rule |
| Native mobile app | Not in roadmap |
| AI chatbot for couples | Not in roadmap |

---

## Roadmap (Approved, Not Yet Built)

| Priority | Feature | Plan Reference |
|----------|---------|----------------|
| P1 | Wedding Mode (event day) | Release 1.2 — F5 |
| P1 | WhatsApp Center Rebuild | Release 1.2 — F2 |
| P1 | Help Button (floating) | Release 1.2 — F9 |
| P2 | Daily Quotes + Tips | Release 1.2 — F7+F8 |
| P2 | Photo Challenge | Release 1.2 — F6 |
| P3 | Auto Reminder Cron | Release 1.2 — F3 |
| P3 | Admin Dashboard Pro | Admin redesign |

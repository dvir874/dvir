# E4 Admin Experience — Design Decision Log
## Chief of Staff | 2026-06-26

---

## Decision 1 — Sidebar: Ivory/Cream, Not Full Dark

**Chosen:** Light sidebar (ivory/cream with dark text) rather than the initially planned full dark #1C1008 sidebar.

**Stitch's instinct overrode the brief.** The design brief specified dark sidebar, but Stitch produced an ivory/cream sidebar — and it is correct.

**Rationale:** The product is warm. The admin area must be warm too. A full dark sidebar would make the dashboard feel like a generic SaaS tool (dark = enterprise = cold). The ivory sidebar keeps the family coherent: the admin sees the same color palette as the couples. This is one coherent product, not two separate visual systems.

**Rule encoded:** Admin UI uses the same brand tokens as couple UI. The admin experience is premium, not austere.

---

## Decision 2 — "שלום דביר" as Dashboard Hero, Not Page Title

**Chosen:** Personalized greeting as the first prominent text in the main area.

**Anti-pattern rejected:** "Dashboard" or "מרכז בקרה" as hero text.

**Rationale:** See E3-decisions.md Decision 6. The same principle applies: dashboards that greet you by name establish a different relationship than dashboards that announce themselves. Stitch confirmed this pattern in both E3 and E4 independently.

**Rule:** Personalized greeting (Frank Ruhl Libre, large) + current date is the standard opening for all authenticated dashboards.

---

## Decision 3 — Couple Photo on Event Cards

**Chosen:** Each event card in the admin grid shows the couple's photo (or venue photo).

**Rationale:** When managing 5-8 active events, you don't read the names — you recognize the face. The photo creates instant identification. An admin who opens this dashboard every morning should be able to scan the grid and know immediately which couple needs attention, without reading. Photo recognition is 10× faster than name reading.

**Implementation note:** Use couple avatar from Supabase storage. Fallback: venue photo from `mini_site_hero_path`. If neither: ivory card with couple initials in Frank Ruhl Libre.

---

## Decision 4 — WhatsApp Center: Template-First Wizard

**Chosen:** 4-step wizard (Template → Preview → Audience → Send) rather than a free-text compose interface.

**Rationale:** Free-text WhatsApp messaging has two risks:
1. Off-brand messages (personal greeting "שלום [שם]" instead of brand opener)
2. Poorly formatted messages that look unprofessional when shared with clients

The wizard enforces brand safety (step 2 preview always shows the approved opener), audience hygiene (step 3 prevents sending to wrong groups), and creates a record per send.

**Non-negotiable implementation constraint:** Step 2 preview MUST show "💍 משפחה וחברים יקרים!" as the message opener. The wizard cannot generate a message starting with a personal name.

---

## Decision 5 — Event-Specific Sub-Navigation Over Mega-Tab Design

**Chosen (architecture proposal):** `/admin/[eventId]/` with sub-routes for each section, over the current all-tabs-in-one-page design.

**Rationale:** The current admin page is ~3000 lines and handles all events in one mega-tab interface. This creates:
- Performance: all data fetched at once
- UX: context switching between events and sections is disorienting
- Code: unmaintainable single file

The event-specific sub-navigation proposal creates clear URL ownership (each section has its own URL), enables browser history, and allows per-section code-splitting.

**Status:** Design only. Implementation requires CEO approval and phased migration. This decision log records the architectural direction, not the implementation commitment.

---

## Decision 6 — Tasks Panel Left of Events (Desktop Priority)

**Chosen:** "משימות לחיום" (My Tasks Today) as a persistent left panel on the admin dashboard (desktop).

**Rationale:** The admin's daily workflow is: (1) check tasks, (2) act on events. Having tasks visible without any click means the first glance surfaces both status and action items simultaneously. Event cards tell "what is happening." Task list tells "what I need to do today." Both are needed at the same time.

**Implementation:** Task list is smart — auto-populated from event states. "Send reminder to 43 pending guests — Wedding A" should appear automatically when conditions are met, not require manual task creation.

---

*E4 Admin Experience Design Decisions | 6 decisions | Chief of Staff | 2026-06-26*

# Business Rules — Company Memory
## רגע לפני | Updated: 2026-06-26

---

## Core Business Rules (NEVER violate)

### Zero Downtime
Real couples use this system. Every change must be safe for existing customers.
- Never break existing URLs
- Never delete DB columns without migration plan
- Always provide graceful fallbacks for new optional fields
- Feature flags for anything that changes existing couple UX

### Mobile First (Couple Area)
Most couples use mobile. Every new feature in couple area must be Mobile First.
- Bottom navigation where appropriate
- Cards not tables
- Safe area: `env(safe-area-inset-bottom)` on fixed elements
- Minimum clicks per action

### WhatsApp Communication Rule
**CRITICAL: Templates must NEVER start with guest name**
- ❌ "שלום משה, הזמנה לחתונה..."
- ✅ "💍 משפחה וחברים יקרים! ..."

### Security Rules
- All admin APIs require `x-admin-token` header
- All cron endpoints require `CRON_SECRET`
- Couple token validated against `events.token` in DB
- No secrets committed to git ever

### Pricing Rules
- No Stripe integration (explicitly rejected by CEO)
- No Referral system (explicitly rejected by CEO)
- All pricing changes require CEO approval

---

## Permanent Routes (never change)

| Route | Used By |
|-------|---------|
| `/rsvp/[token]` | Guests via SMS/WhatsApp |
| `/gallery/[token]` | Couples + guests |
| `/memory/[token]` | Guests (memory upload) |
| `/couple/[token]` | Couples (dashboard) |
| `/event/[id]` | Mini website |
| `/couple/[token]/onboarding` | Couples (first run) |

---

## Tech Stack Rules

```
Framework:     Next.js 14 App Router
DB:            Supabase PostgreSQL (ref: vrxeqhtdwgnwsgusvywx)
Deployment:    Vercel (regalifnei.vercel.app)
Repo:          dvir874/dvir.git, branch: main
TypeScript:    npx tsc --noEmit must pass before every commit
```

---

## Approval Requirements

| Action | Requires |
|--------|---------|
| Deploy to production | CTO + CEO |
| DB migration | Backend + CTO |
| New pricing | CEO only |
| Marketing publish | CEO |
| Delete production data | CEO only |
| New WhatsApp template | CEO |

---

## CRON Jobs

- `CRON_ENABLED=true` required in Vercel env vars for auto-reminder mutations
- Cron endpoint protected by `CRON_SECRET`

---

## Env Vars Required

```
ADMIN_TOKEN          — Admin API access
NEXT_PUBLIC_ADMIN_TOKEN — Client-side admin (minimal use)
CRON_SECRET          — Cron job authentication
CRON_ENABLED         — Set to "true" to activate auto-reminders
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
SENTRY_DSN
```

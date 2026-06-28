# Coding Standards — Company Memory
## רגע לפני | Updated: 2026-06-26

---

## TypeScript

```typescript
// Strict mode required — zero errors before every commit
// Run: npx tsc --noEmit

// ✅ Correct: Graceful fallback for all optional fields
const timeline = briefing?.event?.event_timeline ?? [];
const heroUrl = event.mini_site_hero_path ?? null;
{heroUrl && <img src={heroUrl} />}

// ❌ Wrong: Crashes for existing events
const timeline = briefing.event.event_timeline;

// ✅ Type-safe null check
{req.message != null && <p>{req.message}</p>}
// ❌ Type unknown error
{req.message && <p>{req.message}</p>}
```

---

## File Structure

```
src/
  app/
    api/          — Backend API routes only
    admin/        — Admin dashboard (Desktop First)
    couple/[token]/ — Couple dashboard (Mobile First)
    rsvp/         — Guest RSVP (Mobile First)
    gallery/      — Photo gallery
    memory/       — Guest memory upload
    event/        — Mini website
  components/     — Shared React components
  lib/            — Utilities, helpers, constants
supabase/
  migrations/     — SQL migration files (YYYYMMDD_description.sql)
```

---

## Component Rules

```typescript
"use client"; // always at top of interactive components

// Mobile-first CSS pattern
style={{
  padding: "16px",
  fontSize: "clamp(14px, 4vw, 18px)",
  minHeight: "44px",  // touch target
}}

// Safe area for fixed bottom elements
style={{
  paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
}}

// RTL pattern
style={{
  direction: "rtl",
  textAlign: "right",
}}
```

---

## API Route Standards

```typescript
// Admin endpoint pattern
export async function GET(req: Request) {
  const token = req.headers.get("x-admin-token");
  if (token !== process.env.ADMIN_TOKEN) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // logic...
}

// Couple endpoint pattern (token from URL params)
// Validates: SELECT * FROM events WHERE token = $1

// Always return consistent format:
return Response.json({ data: result }, { status: 200 });
return Response.json({ error: "message" }, { status: 4xx });
```

---

## Database Rules

```sql
-- Migration files: supabase/migrations/YYYYMMDD_description.sql
-- Always idempotent:
ALTER TABLE events ADD COLUMN IF NOT EXISTS field TEXT;
CREATE TABLE IF NOT EXISTS new_table (...);
CREATE INDEX IF NOT EXISTS idx_name ON table(col);

-- New columns always with DEFAULT
ALTER TABLE events ADD COLUMN IF NOT EXISTS count INT DEFAULT 0;

-- JSONB columns
ALTER TABLE events ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '[]';

-- NEVER without CEO approval:
DROP COLUMN
DROP TABLE
ALTER COLUMN TYPE (breaking)
DELETE FROM (production)
```

---

## Commit Standards

```
Format: feat|fix|refactor|chore|docs(scope): description

Examples:
feat(guests): add RSVP completion tracking
fix(admin): correct TypeScript error in DesignRequestsTab
refactor(onboarding): rewrite wizard with new UX flow
chore(deps): update Next.js to 14.2.x

Rules:
- npx tsc --noEmit must pass before commit
- git push after every feature (not batched)
```

---

## Comments Policy

```typescript
// ✅ Write comment only when WHY is non-obvious
// Workaround: Supabase returns null for empty arrays, not []
const guests = data.guests ?? [];

// ❌ Never explain WHAT (code speaks for itself)
// Set the count to zero
setCount(0);

// ❌ Never write task references
// Added for issue #123
```

---

## Error Handling

```typescript
// ✅ Graceful — user sees friendly message
try {
  const data = await fetchGuests(token);
  setGuests(data);
} catch {
  setError("לא ניתן לטעון אורחים. נסה שוב.");
}

// ❌ Never expose internals to user
catch (e) {
  console.error(e.stack); // don't show to user
  return Response.json({ error: e.message }, { status: 500 }); // don't expose in prod
}
```

---

## Performance Rules

- No N+1 queries (use JOINs or batch fetches)
- Images: next/image with proper sizing
- No heavy animations (< 300ms, ease-out only)
- Lazy load non-critical components
- Cache API responses where appropriate

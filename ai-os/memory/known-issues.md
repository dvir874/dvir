# Known Issues — Company Memory
## רגע לפני | Updated: 2026-06-26

---

## Open Issues

### DB Migrations Pending (must run manually in Supabase)

**MIGRATION-001:** reminder_days_before column
```sql
ALTER TABLE events ADD COLUMN IF NOT EXISTS reminder_days_before INT DEFAULT 7;
```
Status: PENDING | Required for: F3 Auto Reminder

**MIGRATION-002:** design_requests table
```sql
-- File: supabase/migrations/20260626_design_requests.sql
```
Status: PENDING | Required for: Design Request system

---

## Env Vars Missing in Vercel

**ENV-001:** `CRON_ENABLED=true`
- Required for: Auto-reminder cron mutations
- Action: Add to Vercel env vars
- Status: PENDING

---

## Content Missing

**CONTENT-001:** Invitation preview images
- Path: `/public/invitations/<slug>/preview.jpg`
- Real images needed for each invitation template
- Status: PENDING

---

## Stitch MCP Status

**MCP-001:** Stitch connected to Claude Code
- Config added to `~/.claude.json`
- HTTP transport: `https://stitch.googleapis.com/mcp`
- API Key: stored in claude.json (not in git)
- Status: CONFIGURED (needs new session to take effect)

**MCP-002:** Stitch NOT connected to Claude Desktop
- Claude Desktop doesn't support HTTP transport
- claude_desktop_config.json has broken npx stitch entry
- Action: Remove stitch entry from Claude Desktop config
- Status: KNOWN ISSUE (low priority)

---

## Resolved Issues (Archive)

| Issue | Fixed | Notes |
|-------|-------|-------|
| DesignRequestsTab TypeScript error | 2026-06-26 | req.message != null |
| Debug endpoints exposed | Fixed | Auth guard added |
| Admin API no auth guard | Fixed | All endpoints protected |
| CRON_SECRET missing | Fixed | Added to env |
| Phone validation missing | Fixed | Added on guest add |
| Error Boundary missing | Fixed | Added to couple dashboard |

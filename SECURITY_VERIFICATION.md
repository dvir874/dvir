# Security Verification Log

Every assertion here carries how it was checked. A finding that cannot be
falsified is an opinion, not a finding — so each entry also records what would
have disproved it.

The reason this file exists: `gallery_albums` carried a policy named
`no_anon_access` that did nothing at all. Any audit reading policy names would
have marked the table protected. One REST request as `anon` proved otherwise.
**A name is not evidence.**

## Status vocabulary

| | |
|---|---|
| `RUNTIME VERIFIED` | Reproduced against production or a running server |
| `CODE VERIFIED` | Read in the source; behaviour not exercised |
| `INFERRED` | Follows logically, not yet observed |
| `UNKNOWN` | Insufficient access — say so rather than guess |

---

## #001 · gallery_albums.owner_token readable by the publishable key

| | |
|---|---|
| **Severity** | 🔴 P0 |
| **Status** | ✅ CLOSED |
| **Verified by** | RUNTIME VERIFIED — REST as `anon`, twice, after RLS was enabled |
| **Evidence** | `service_all · PERMISSIVE · {public} · ALL · true` returned every row including `owner_token` |
| **Root cause** | Permissive policies are OR'd. `no_anon_access` (PERMISSIVE, `false`) could never block anything; it was written as though it were RESTRICTIVE |
| **Impact** | The couple's private gallery link was readable by anyone holding the browser key |
| **Fix** | `DROP POLICY` on both. RLS stays enabled; `service_role` bypasses it |
| **Falsified by** | Would have been disproved if `anon` returned 0 rows |
| **Regression** | 4 tests + 5 routes + 5 tables — all passed |
| **Rollback** | `CREATE POLICY "service_all" ON gallery_albums AS PERMISSIVE FOR ALL TO public USING (true);` and the `anon`/`false` equivalent |

## #002 · Gallery storage direct upload

| | |
|---|---|
| **Severity** | 🟢 not vulnerable |
| **Status** | ✅ CLOSED |
| **Verified by** | RUNTIME VERIFIED — production storage |
| **Evidence** | `anon` + `image/jpeg` + no token → **403, RLS violation**. `service_role` → success |
| **Note** | The first attempt used `text/plain` and was rejected with **415 invalid_mime_type** — a rejection about the file, not about authorisation. Reporting that as "safe" would have been a false negative. The MIME type had to be valid before the question was even asked |
| **Upload path** | Server route only; `public_token` validated against `gallery_albums` before any write. No client-direct upload exists |
| **Falsified by** | Would have been disproved if the JPEG upload returned 200 |

## #002b · Secrets in git history

| | |
|---|---|
| **Severity** | 🟢 none found |
| **Status** | ✅ CLOSED |
| **Verified by** | RUNTIME VERIFIED — `git log -S --pickaxe-regex` and `git grep` across all refs |
| **Evidence** | Two pattern hits, both in `.env.local.example` / `.env.test.example`, both placeholders (`your-service-r…`, `your-cron-secr…`). Zero hits for `eyJ…eyJ`, `sk-ant-`, Meta tokens |
| **Rotation** | Not required |

## #003 · Migration drift

| | |
|---|---|
| **Severity** | 🔴 open |
| **Status** | ⏸ BLOCKED |
| **Verified by** | Partially — RUNTIME VERIFIED that the drift exists; UNKNOWN as to why |
| **Evidence** | `migrations/014_gallery_storage.sql` declares `public_upload_gallery` with no `TO` clause (defaults to `PUBLIC`). Production rejects anonymous upload, so the policy is not active as written |
| **Also** | `events.couple_token` has a `DEFAULT` in production and none anywhere in the repo |
| **Ruled out** | Production pointing at a different database — the ref matches `CLAUDE.md` and every verified fix landed on it |
| **Still unknown** | Never run / run then altered / superseded / history out of sync |
| **Needs** | `select version, name from supabase_migrations.schema_migrations order by version;` — private schema, SQL Editor only |

## #004 · Repository governance

| | |
|---|---|
| **Severity** | 🟡 unresolved |
| **Status** | ⏸ UNKNOWN |
| **Verified by** | CODE VERIFIED for what is public; API returned 401 for protection settings |
| **Known** | `public` · issues enabled · forking enabled · `main` is default · the only workflow is a scheduled smoke test, so **there is no CI on pull requests and therefore nothing that could serve as a required check today** |
| **Unknown** | Branch protection, force-push, required reviews, who holds write |
| **Consequence** | No autonomous CI agent may be enabled until this is measured and a PR-triggered check exists. A public repo with open issues, no PR CI and Vercel auto-deploy is an unacceptable base for one |

## #005 · WhatsApp webhook accepts unsigned requests

| | |
|---|---|
| **Severity** | 🔴 P0 |
| **Status** | 🔴 OPEN — awaiting review, no code changed |
| **Verified by** | RUNTIME VERIFIED — two forged requests against an isolated test guest |
| **Evidence** | No `x-hub-signature-256`, no `createHmac`, no app secret anywhere in the route; not in the middleware matcher. A forged `messages[]` payload carrying `"מגיע"` moved a guest from `pending` to `confirmed` and wrote an `rsvp_submitted` event — indistinguishable from a real reply |
| **Exploitability** | Immediate. Public endpoint, fixed URL, plain JSON body. Guest phone numbers are not secret — they appear on invitations and the rides board |
| **Impact** | Anyone can confirm or decline any guest, inject inbox messages, and corrupt the caterer's headcount |
| **Proposed fix** | Verify `x-hub-signature-256` as HMAC-SHA256 of the **raw** body against the Meta app secret, before `req.json()`. Reject invalid signatures but still answer 200, or Meta disables the hook |
| **Regression risk** | **Medium, and the reason this is not yet fixed.** A wrong app secret would silently stop every guest reply from registering. Deploy log-only first; enforce once real signatures are seen passing |
| **Falsified by** | Would have been disproved if the forged request left the guest at `pending` |
| **Cleanup** | Test guest and all four derived rows deleted; verified zero remain. No real guest touched |

---

## Method

`Hypothesis → Evidence → Runtime verification → Fix → Regression → Closure`

Two findings were **withdrawn** under this method rather than fixed:

- `/api/approval/[eventId]` — appeared unauthenticated when the route file was
  read alone. `middleware.ts:18` lists it in `PROTECTED_API_PREFIXES` and the
  matcher covers `/api/approval/:path*`. Withdrawn.
- `NEXT_PUBLIC_ADMIN_TOKEN` — used in five places in `admin/page.tsx`, but the
  variable is unset in every environment and absent from deployed chunks. A
  latent hazard, not a live leak. Downgraded from P0.

Both were withdrawn because somebody ran something. Neither would have been
caught by reading code alone.

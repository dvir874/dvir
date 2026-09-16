-- Mark the messages this system sends to its own operator.
--
-- Every alert to Dvir — the morning brief, "מחכה לך", the stuck numbers, the
-- capacity forecast — went out through sendAdminText or sendRunSummary, and
-- neither wrote a row. Measured 15/09: his number (972533318177) had ZERO
-- outbound messages in this table, ever. The five rows there are all inbound,
-- console commands he typed on 11/09.
--
-- So the eight alert paths were the only sends in the system with no record,
-- and a failed alert looked exactly like a quiet day — which is the one thing
-- this business reads as "everything is fine".
--
-- `kind` carries WHICH alert it was, prefixed `admin`, so a failure can be
-- found by name rather than by reading bodies:
--
--   select kind, status, error, created_at from wa_messages
--    where kind like 'admin%' and status = 'failed' order by created_at desc;
--
-- Nullable with no default on purpose: every existing row, and every guest
-- message written from now on, keeps `kind` NULL. Nothing reads this column to
-- decide whether to send, so an un-run migration cannot stop a send — the
-- logging degrades, the sending does not.
--
-- Additive and idempotent — safe to run on the live database.

alter table wa_messages add column if not exists kind text;

comment on column wa_messages.kind is
  'סוג ההודעה — ריק לאורחים, admin_* להתראות שהמערכת שולחת לדביר';

create index if not exists wa_messages_kind_idx
  on wa_messages (kind, created_at desc)
  where kind is not null;

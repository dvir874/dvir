-- Store Meta's numeric error code alongside its human title.
--
-- Without it, four failures with opposite correct responses were
-- indistinguishable in the database:
--
--   131048  our number is restricted   → stop the entire run
--   131049  the recipient's own cap    → retry after 26h, twice
--   130472  recipient in a Meta A/B holdout → no timer can ever succeed
--   131026  number cannot receive      → never retry, ask the couple
--
-- The old policy applied one 2h/8h/24h timer to all of them, which both
-- retried inside the window Meta forbids and queued attempts that cannot
-- succeed.
--
-- Additive and idempotent — safe on the live database.

alter table wa_messages add column if not exists error_code int;

comment on column wa_messages.error_code is 'קוד השגיאה המספרי של Meta — קובע את מדיניות הניסיון החוזר';

create index if not exists wa_messages_error_code_idx
  on wa_messages (error_code, created_at desc)
  where error_code is not null;

-- Delivery reports that arrived before the message they describe.
--
-- The row in wa_messages is written AFTER the send call returns, and Meta can
-- deliver a status webhook in milliseconds. When the report wins that race the
-- UPDATE matches no row, PostgREST reports success for updating nothing, and
-- the only notice we will ever get that a guest did or did not receive their
-- invitation evaporates.
--
-- Sixteen messages have sat at "accepted" for up to 55 hours because of this
-- and its sibling — a webhook handler that read only entry[0].changes[0] and
-- dropped the rest of every batched payload. Nothing anywhere noticed.
--
-- A status that cannot be applied is parked here instead of discarded, and the
-- scheduled sender applies it on its next run. Late is fine; lost is not.
--
-- Additive and idempotent — safe on the live database.

create table if not exists wa_status_orphans (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  wamid       text not null,
  status      text not null,
  error       text,
  error_code  int,
  attempts    int not null default 0
);

comment on table wa_status_orphans is
  'דיווחי מסירה שהגיעו לפני שההודעה נרשמה — מוחלים מאוחר יותר במקום ללכת לאיבוד';

create unique index if not exists wa_status_orphans_wamid_uniq
  on wa_status_orphans (wamid);

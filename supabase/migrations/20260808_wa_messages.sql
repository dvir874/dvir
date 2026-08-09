-- WhatsApp message log: inbound replies and outbound delivery status.
--
-- Why a new table rather than more guest_events rows: an inbox needs the
-- message body, a direction, and a mutable delivery status, and guest_events
-- has only (guest_id, event_type, created_at). Cramming a conversation into
-- event_type would make the data unqueryable and unreadable.
--
-- Additive and idempotent — safe to run on the live database.

create table if not exists wa_messages (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid references events(id) on delete cascade,
  guest_id    uuid references guests(id) on delete set null,
  wa_phone    text not null,                    -- E.164 digits, e.g. 972501234567
  direction   text not null check (direction in ('in', 'out')),
  body        text,
  wamid       text unique,                      -- Meta's message id; dedupes retries
  status      text,                             -- sent | delivered | read | failed
  error       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists wa_messages_event_idx  on wa_messages (event_id, created_at desc);
create index if not exists wa_messages_phone_idx  on wa_messages (wa_phone, created_at desc);
create index if not exists wa_messages_guest_idx  on wa_messages (guest_id, created_at desc);

-- Unread tracking for the admin inbox: an inbound message is unread until
-- it is explicitly marked, so nothing a guest asks can silently disappear.
alter table wa_messages add column if not exists read_at timestamptz;

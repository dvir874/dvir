-- A link that lets a family member send invitations without an admin account.
--
-- Delegating the sending is the normal case, not the exception: a couple asks a
-- sibling, a parent or a niece to work through part of the list. Until now the
-- only ways to do that were to hand over the admin password — which opens every
-- event, every guest list and every destructive button — or to forward phone
-- numbers and personal links one message at a time, which makes the couple a
-- bottleneck and loses all record of who was actually contacted.
--
-- Additive and idempotent — safe on the live database.

alter table events add column if not exists helper_token uuid default gen_random_uuid();

-- Backfill events created before the column existed
update events set helper_token = gen_random_uuid() where helper_token is null;

create unique index if not exists events_helper_token_idx on events (helper_token);

comment on column events.helper_token is
  'קישור לבן משפחה שעוזר בשליחת ההזמנות — גישה לשליחה בלבד, בלי אדמין';

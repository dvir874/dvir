-- What the guests thought, after the wedding.
--
-- The couple's own answer to "was it good?" is the one thing this system has
-- never captured. Everything it stores is logistics — who came, what they ate,
-- who needed a lift — and all of it stops being interesting the morning after.
--
-- For the business this is the more valuable half. A couple who hears from
-- forty guests that the evening was beautiful becomes the referral that brings
-- the next couple, and referrals are how this grows. There is no other moment
-- when a guest is as willing to say something warm as the week after a wedding.
--
-- Keyed on the guest, so the same link they used to RSVP works again — nothing
-- new to distribute, and the couple already knows every one of these people by
-- name. guest_id is nullable and ON DELETE SET NULL so that removing a guest
-- never destroys what they said.
--
-- One row per guest, updated rather than duplicated: someone who rates the
-- evening and then thinks of something to add should not create a second,
-- contradictory record.
--
-- Additive and idempotent — safe on the live database.

create table if not exists event_feedback (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  event_id    uuid not null references events(id) on delete cascade,
  guest_id    uuid references guests(id) on delete set null,

  rating      int check (rating between 1 and 5),
  favourite   text,   -- החופה | הריקוד הראשון | הארוחה | הבילוי
  message     text
);

comment on table event_feedback is
  'משוב אורחים אחרי האירוע — דירוג, הרגע האהוב וברכה לזוג';

create unique index if not exists event_feedback_guest_uniq
  on event_feedback (guest_id) where guest_id is not null;

create index if not exists event_feedback_event_idx
  on event_feedback (event_id, created_at desc);

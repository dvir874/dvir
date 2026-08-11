-- Guests opt in to the shared photo gallery at RSVP time.
--
-- Two reasons this is a column and not an assumption:
--  1. The post-event message then fulfils a request the guest made, rather
--     than arriving unannounced — kinder, and far less likely to be reported.
--  2. We only message the guests who said yes, which roughly halves the cost
--     of that wave regardless of how Meta categorises the template.
--
-- Additive, defaulted, idempotent — safe on the live database.

alter table guests add column if not exists wants_photos boolean not null default false;
comment on column guests.wants_photos is 'האורח ביקש קישור לגלריית התמונות המשותפת אחרי האירוע';

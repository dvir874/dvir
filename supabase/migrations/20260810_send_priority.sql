-- Let specific guests jump the send queue.
--
-- 22 guests opened their personal link and never answered. Until today the
-- RSVP submit had no timeout, so a request that never settled never rejected:
-- the button sat on "שולח…" and the answer was lost. Those guests may believe
-- they already replied. They cannot be told apart from guests who simply
-- looked and did not decide — a hung request writes nothing anywhere — so the
-- only honest move is to reach all 22.
--
-- Hard-coding a list in the sender would have worked once. A column works
-- every time this happens.
--
-- Additive and idempotent — safe on the live database.

alter table guests add column if not exists send_priority int not null default 0;

create index if not exists guests_send_priority_idx
  on guests (event_id, send_priority desc)
  where send_priority > 0;

comment on column guests.send_priority is
  'גבוה יותר = נשלח מוקדם יותר. 0 = סדר רגיל';

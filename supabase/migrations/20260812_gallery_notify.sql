-- Telling guests the gallery is ready.
--
-- wedding_gallery_ready_regalifnei has been approved since before the wedding
-- and nothing in the product has ever sent it. An approved template is
-- permission to send; it is not a mechanism that sends. The couple would have
-- discovered that the week after their wedding, by hand, guest by guest.
--
-- Two flags rather than one, because two different facts are involved and
-- conflating them is how this goes wrong:
--
--   gallery_ready        the couple says the photos are up. A machine cannot
--                        know this — "the date has passed" does not mean the
--                        photographer has delivered, and "the gallery is
--                        ready" sent to an empty gallery is worse than
--                        silence.
--   gallery_notified_at  we have already told everyone. Without it a rerun
--                        messages the same guests again, and the whole point
--                        of this system is that it never does that.
--
-- Only guests who ticked wants_photos are messaged. That tick is what makes
-- the message a fulfilment of their own request rather than an unsolicited
-- one — the reason Meta approved the template as UTILITY, and the reason it is
-- exempt from the recipient marketing cap that cost us sixteen guests today.
--
-- Additive and idempotent — safe on the live database.

alter table events add column if not exists gallery_ready boolean not null default false;
alter table events add column if not exists gallery_notified_at timestamptz;

comment on column events.gallery_ready is
  'הזוג אישר שהתמונות עלו — רק אז נשלחת הודעת הגלריה';
comment on column events.gallery_notified_at is
  'מתי נשלחה הודעת הגלריה. לא ריק = כבר נשלחה, לא לשלוח שוב';

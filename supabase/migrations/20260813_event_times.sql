-- The ceremony times, per event.
--
-- They were a constant in the code — "קבלת פנים 19:00 | חופה וקידושין 20:00" —
-- written when there was one wedding and left in place when the template was
-- made generic. Three of the template's four variables were wired to the event
-- (couple, date, venue) and the fourth was not.
--
-- אורי ✧ שחר receive at 17:30 and stand under the chuppah at 18:15, deliberately
-- before sunset. 327 households would have been told 19:00 and 20:00, and some
-- of them would have arrived after the chuppah.
--
-- Nullable on purpose: an event without times must be refused, not defaulted.
-- Defaulting is what produced this.

alter table events add column if not exists reception_time text;
alter table events add column if not exists chuppah_time   text;

comment on column events.reception_time is 'שעת קבלת פנים, למשל "17:30". חסר = השליחה מסרבת, לא ממציאה.';
comment on column events.chuppah_time   is 'שעת חופה, למשל "18:15". חסר = השליחה מסרבת.';

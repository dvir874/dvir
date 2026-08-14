-- "Do not message this person."
--
-- Dvir asked that אורית not receive another reminder — he is speaking to her
-- himself. There was no way to say that, so it was expressed by borrowing the
-- helper-assignment field, which expires after 48 hours and would have quietly
-- put her back in the queue on Sunday evening.
--
-- The request is ordinary and will arrive for every client: someone is being
-- handled personally, someone asked not to be contacted again, someone is
-- sitting shiva. With 327 households belonging to a couple we have never met,
-- there is no version of this that a person can hold in their head.
--
-- Nullable and additive. A guest with no reason set behaves exactly as before.

alter table guests add column if not exists do_not_contact      boolean not null default false;
alter table guests add column if not exists do_not_contact_note text;
alter table guests add column if not exists do_not_contact_at   timestamptz;

create index if not exists guests_dnc_idx on guests (event_id) where do_not_contact;

comment on column guests.do_not_contact is
  'לא לשלוח לאדם הזה — לצמיתות, עד שמבטלים ידנית. הקרון מדלג, ולא כמו שיוך לעוזרת שפג אחרי 48 שעות.';
comment on column guests.do_not_contact_note is
  'למה. מוצג לזוג ולמנהל, כדי שההחלטה תישאר מוסברת גם בעוד חודש.';

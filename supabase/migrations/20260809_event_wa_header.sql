-- Per-event WhatsApp invitation image.
--
-- The header image is the invitation card every recipient sees at the top of
-- the message. It used to come from one global env var with a hard-coded
-- default pointing at Dvir & Mirav's own invitation — so any other couple's
-- guests would have received the wrong wedding's card, irreversibly.
--
-- Additive, nullable, idempotent. Sending refuses to run when it is empty.

alter table events add column if not exists wa_header_image_url text;
comment on column events.wa_header_image_url is 'תמונת ההזמנה שמופיעה בראש הודעת הוואטסאפ — חובה לפני שליחה';

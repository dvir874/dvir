-- Keep the media a guest actually sent, not just the word "[video]".
--
-- A guest was asked to send a screenshot of the problem she was hitting. She
-- sent a video. The webhook stored the string "[video]" and discarded Meta's
-- media id, so the one piece of first-hand evidence anybody had was
-- unreachable — Meta still held the file, and we had thrown away the only
-- handle to it.
--
-- Additive and idempotent — safe on the live database.

alter table wa_messages add column if not exists media_id   text;
alter table wa_messages add column if not exists media_mime text;

comment on column wa_messages.media_id is
  'מזהה המדיה אצל Meta — מאפשר להוריד תמונה או סרטון שאורח שלח';

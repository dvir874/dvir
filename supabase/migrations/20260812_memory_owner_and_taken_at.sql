-- Two changes, both serving the same decision: guests upload, the couple views.
--
-- 1. vault_tokens.owner_token
--
--    /memory/[token] is sent to every guest, and /memory/[token]/wall renders
--    every photo and every blessing to whoever holds that same token. So the
--    link that asks a guest to contribute also hands them the whole album —
--    including blessings written for the couple by other people. The same
--    shape as gallery_albums: one token doing two jobs that need different
--    answers.
--
--    Splitting it the same way. The guest token keeps working for uploads and
--    stops working for viewing; owner_token is the couple's, and is the only
--    link that should ever be sent to them.
--
-- 2. memory_items.taken_at
--
--    uploaded_at is when the file reached us — which is the morning after, in
--    whatever order people got round to it. It cannot reconstruct the evening.
--    taken_at is read from the photo's own EXIF, so the couple can replay the
--    night in the order it actually happened: reception, chuppah, dancing.
--
--    Nullable on purpose. Videos, screenshots, stripped metadata and anything
--    sent through WhatsApp arrive with no EXIF at all, and a photo with no
--    capture time is still a photo worth having — it sorts by uploaded_at
--    instead rather than being hidden.
--
-- Additive and idempotent. Nothing that works today stops working.

create extension if not exists pgcrypto;

alter table vault_tokens
  add column if not exists owner_token uuid not null default gen_random_uuid();

comment on column vault_tokens.owner_token is
  'הקישור הפרטי של הזוג לצפייה בזיכרונות. לא לשלוח לאורחים — הטוקן הרגיל מיועד להעלאה בלבד';

create unique index if not exists vault_tokens_owner_token_uniq
  on vault_tokens (owner_token);

alter table memory_items
  add column if not exists taken_at timestamptz;

comment on column memory_items.taken_at is
  'מתי התמונה צולמה בפועל (EXIF DateTimeOriginal), לא מתי הועלתה. null כשאין מטא-דאטה';

create index if not exists memory_items_taken_at_idx
  on memory_items (event_id, taken_at);

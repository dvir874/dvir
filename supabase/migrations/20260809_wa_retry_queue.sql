-- Retry queue for asynchronously-failed WhatsApp messages.
--
-- The send API answers 200 with a message id, and Meta reports "Spam Rate
-- limit hit" through the webhook minutes later. The existing retry loop only
-- ever saw synchronous errors, so those failures were never retried: one run
-- lost 22 of 24 invitations and nothing tried again.
--
-- These columns let the webhook schedule another attempt and let a retry
-- worker find what is due.
--
-- Additive and idempotent — safe on the live database.

alter table wa_messages add column if not exists retry_count int not null default 0;
alter table wa_messages add column if not exists retry_after timestamptz;
alter table wa_messages add column if not exists retried_from uuid;

comment on column wa_messages.retry_after  is 'מתי לנסות לשלוח שוב; null = אין ניסיון מתוכנן';
comment on column wa_messages.retried_from is 'ההודעה שנכשלה ושבגללה נוצרה שורה זו';

-- The retry worker asks exactly one question: what is due now?
create index if not exists wa_messages_retry_due_idx
  on wa_messages (retry_after)
  where retry_after is not null;

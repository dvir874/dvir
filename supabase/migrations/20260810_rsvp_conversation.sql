-- State for guests answering inside WhatsApp instead of on a web page.
--
-- Every failure that cost us a guest today happened between the message and
-- the page: a link that hung, an envelope nobody knew to tap, a submit with no
-- timeout, a browser that logged out mid-send. Answering with a button removes
-- all of it — there is no page to load and nothing to get stuck in.
--
-- The exchange has steps, though ("מגיע" → "how many?"), and a webhook is
-- stateless, so the step has to live somewhere.
--
-- Additive and idempotent — safe on the live database.

alter table guests add column if not exists chat_state text;
alter table guests add column if not exists chat_state_at timestamptz;

comment on column guests.chat_state is
  'שלב בשיחת אישור ההגעה בוואטסאפ: awaiting_count | awaiting_decline_confirm | null';

create index if not exists guests_chat_state_idx
  on guests (chat_state) where chat_state is not null;

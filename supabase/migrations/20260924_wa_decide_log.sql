-- Every decision wa-decide.ts made, beside the one wa-conversation.ts took.
--
-- decide() has run as a shadow since it was written, and disagreed into
-- console.warn — a stream nobody reads, on a serverless platform where it is
-- gone within the hour. So months of evidence about the one function that
-- reads every inbound message were collected and thrown away.
--
-- This is the table that makes the rollout measurable rather than asserted.
-- Dvir's condition for widening the flag past one wedding is "three clean
-- days", and clean means two numbers, not one: zero disagreements AND at
-- least twenty free-text messages actually evaluated. Zero out of zero is
-- what a broken pipe looks like, and it would otherwise read as success.
--
-- So every evaluation is written, not only the disagreements — `agreed` is
-- the flag and `free_text` is the denominator. A button tap is a decision too,
-- but it is not evidence about a parser: "rsvp_yes" cannot be misread.

create table if not exists wa_decide_log (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  event_id      uuid references events(id) on delete cascade,
  guest_id      uuid references guests(id) on delete cascade,

  -- What the guest actually sent. Without it no one can judge who was right,
  -- and judging is the whole purpose of the row.
  said          text,
  -- Free text, as opposed to a button id or a list pick. The denominator.
  free_text     boolean not null default true,

  -- The branch wa-conversation took, and the branch decide() would have.
  took          text,
  mirror        text,
  agreed        boolean not null,

  -- The three inputs that decided it, so a disagreement can be reproduced
  -- without guessing at the guest's state an hour later.
  live_state    text,
  guest_status  text,
  guest_count   int,

  -- A disagreement that has been looked at stops counting against the three
  -- clean days. Reviewed is not the same as never happened.
  resolved_at   timestamptz
);

create index if not exists wa_decide_log_created_idx
  on wa_decide_log (created_at desc);

-- The exact shape of the three-day question: this event, this window,
-- unresolved disagreements only.
create index if not exists wa_decide_log_event_created_idx
  on wa_decide_log (event_id, created_at desc);

create index if not exists wa_decide_log_open_idx
  on wa_decide_log (created_at desc) where resolved_at is null and agreed = false;

-- A durable record of every automatic send.
--
-- The sender already reports everything worth knowing — how many went out and
-- to whom, which failed and why, what Meta's cap and quality were, how much of
-- the rolling window was left. All of it goes into the HTTP response, which
-- goes to Vercel's logs, which nobody opens and which age out.
--
-- So the only way to answer "did the 15:00 run actually send anything?" was to
-- ask someone to query the database by hand. That is not a product, and it is
-- the same shape as every failure this system has had: something happened, and
-- the only record of it was somewhere nobody looks.
--
-- One row per run, written whatever the outcome. A run that sent nothing
-- because the window was full is not a missing row — it is a row that says
-- window_full, and the difference between those two is the whole point. A gap
-- in this table means the scheduler did not fire, and that is worth seeing.
--
-- Additive and idempotent — safe on the live database.

create table if not exists wa_runs (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  event_id     uuid references events(id) on delete set null,

  -- what happened
  sent         int  not null default 0,
  failed       int  not null default 0,
  healed       int  not null default 0,
  reason       text,          -- null when it sent; otherwise window_full, budget_exhausted, …
  stopped      text,          -- set when a 131048 halted the run mid-way

  -- what Meta allowed at the time, so a quiet day can be explained months later
  cap          int,
  tier         int,
  quality      text,
  posture      text,
  window_used  int,

  -- names and errors, exactly as reported
  details      jsonb not null default '{}'::jsonb
);

comment on table wa_runs is
  'שורה אחת לכל הרצה של השליחה האוטומטית — מה נשלח, למי, מה נכשל ולמה';

create index if not exists wa_runs_created_idx on wa_runs (created_at desc);
create index if not exists wa_runs_event_idx   on wa_runs (event_id, created_at desc);

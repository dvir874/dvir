-- Two tables the code has always written to and which have never existed.
--
-- /api/couple/[token]/chat and /api/admin/history/[eventId] query chat_messages
-- and activity_log. PostgREST rejects the query, the routes answer with an
-- empty array, and the screens render "no messages yet" — so a couple can type
-- a message to their planner, watch it disappear, and be told nothing went
-- wrong. Same shape as the checklist that celebrated saves it never made.
--
-- Additive and idempotent — safe on the live database.

create table if not exists chat_messages (
  id             uuid primary key default gen_random_uuid(),
  event_id       uuid not null references events(id) on delete cascade,
  sender         text not null check (sender in ('couple', 'admin')),
  body           text not null,
  read_by_couple boolean not null default false,
  read_by_admin  boolean not null default false,
  created_at     timestamptz not null default now()
);

create index if not exists chat_messages_event_idx
  on chat_messages (event_id, created_at desc);

comment on table chat_messages is 'התכתבות בין הזוג למנהל האירוע';

create table if not exists activity_log (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events(id) on delete cascade,
  action     text not null,
  details    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_log_event_idx
  on activity_log (event_id, created_at desc);

comment on table activity_log is 'יומן פעולות לכל אירוע — מי עשה מה ומתי';

-- Reached only through the service-role key behind token or admin checks, the
-- same as every other table here.
alter table chat_messages enable row level security;
alter table activity_log  enable row level security;

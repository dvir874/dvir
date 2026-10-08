-- Content Hub — one row per short video, from idea to results.
--
-- Internal to Dvir: nothing a couple or a guest sees reads or writes this
-- table, so it is additive and carries no risk to live events. RLS is on with
-- no policies — only the service role (the /api/admin/content routes, behind
-- the admin cookie) can touch it.
--
-- Metrics are plain columns rather than one JSONB blob so "every WINNER by
-- leads" is a sort, not a parse, when the analysis step comes. They are
-- nullable on purpose: "not measured yet" and "zero" are different answers.

create table if not exists content_items (
  id                      uuid primary key default gen_random_uuid(),
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  title                   text not null default '',
  format                  text not null default 'A'
                          check (format in ('A', 'B', 'C')),
  status                  text not null default 'IDEA'
                          check (status in ('IDEA','APPROVED','SCRIPT','PRODUCTION','READY',
                                            'PUBLISHED','ANALYZING','WINNER','KILLED')),
  content_goal            text
                          check (content_goal in ('awareness','engagement','traffic','leads','trust')),

  pain_point              text,
  hook                    text,
  hook_options            jsonb not null default '[]',
  script                  text,
  storyboard              jsonb not null default '[]',   -- [{shot, seconds, visual, on_screen}]
  visual_prompts          jsonb not null default '[]',   -- [string] one per shot
  voiceover               text,
  on_screen_text          text,
  caption                 text,
  cta                     text,
  platforms               text[] not null default '{}',  -- instagram | tiktok | facebook

  published_at            timestamptz,
  production_cost         numeric(10,2),                 -- ₪
  production_time_minutes integer,

  -- Ordered by what matters: customers first, views last.
  customers               integer,
  revenue                 numeric(10,2),
  leads                   integer,
  whatsapp_clicks         integer,
  website_clicks          integer,
  shares                  integer,
  saves                   integer,
  views                   integer,
  likes                   integer,
  comments                integer,
  profile_visits          integer,

  notes                   text
);

create index if not exists content_items_status_idx on content_items (status);
create index if not exists content_items_created_idx on content_items (created_at desc);

alter table content_items enable row level security;

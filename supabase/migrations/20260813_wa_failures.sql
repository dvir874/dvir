-- Somewhere to write down what went wrong.
--
-- Until now there was nowhere. Failures in the send and receive paths were
-- caught and dropped: `catch { /* this guest's tap is unhandled */ }` kept one
-- guest's failure from taking the batch down, which is right, and recorded
-- nothing, which is how eight guests answered on 12/08 and stayed pending. The
-- message row was written before the handler ran, so the reply sat in the inbox
-- looking handled while the couple's count was wrong, and there was no trace of
-- the difference to debug.
--
-- Last night's stopgap wrote those into wa_runs with sent:0 and a reply_* reason.
-- That table is the cron's run log; overloading it means every future reader of
-- "did the send run?" has to know to filter rows that are not runs. This is that
-- debt paid back.
--
-- Deliberately additive and deliberately unconstrained: no foreign keys, no NOT
-- NULL beyond scope and kind. A table that rejects a write is a table that loses
-- the failure it was created to keep — and it is written from inside catch
-- blocks, where there is nothing left to fall back to.

create table if not exists wa_failures (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),

  /* Ties every failure in one invocation together. A cron run that fails
     forty times is one incident, not forty. */
  run_id      text,

  /* Where it happened: webhook.reply · cron.send · admin.send · conversation */
  scope       text not null,

  /* What kind, so a screen can group without parsing error text.
     See classify() in src/lib/failures.ts — the list lives there. */
  kind        text not null,

  event_id    uuid,
  guest_id    uuid,
  /* wamid, phone, job id — whatever identifies the thing that failed */
  ref         text,

  error       text,
  context     jsonb not null default '{}'::jsonb
);

create index if not exists wa_failures_created_idx on wa_failures (created_at desc);
create index if not exists wa_failures_scope_idx   on wa_failures (scope, created_at desc);
create index if not exists wa_failures_guest_idx   on wa_failures (guest_id);
create index if not exists wa_failures_run_idx     on wa_failures (run_id);

comment on table wa_failures is
  'כל כשל בנתיב השליחה/הקבלה נרשם כאן. נכתב מתוך catch — אסור שיזרוק, ואסור שידחה שורה.';

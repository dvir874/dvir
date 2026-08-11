-- Hand a specific set of guests to a specific helper, so that nobody is
-- messaged twice.
--
-- The helper link is one per event and every helper sees the same "next in
-- line". Two family members working at the same time therefore both open the
-- same guest and both send to them. The automatic sender has the same problem
-- from the other side: it decides who to contact from delivery evidence, and a
-- helper who is *about to* send has produced none yet — so a guest can be
-- messaged by a cousin at 14:50 and by the business number at 15:00.
--
-- Marking guests up front as "already sent" would fix both and would be the
-- same mistake that has cost this system a whole day: manual_sent recorded an
-- attempt as a result, and 34 guests silently left every send path. An
-- assignment is not a claim that anything was delivered. It says only "this
-- one belongs to Noya for now", and it expires.
--
-- assigned_at is what makes it safe to hand work out. An assignment older than
-- 48 hours is ignored by every reader, so a helper who starts and does not
-- finish cannot strand a guest: they return to the automatic queue on their
-- own, with nobody having to notice or clean anything up.
--
-- Additive and idempotent — safe on the live database.

alter table guests add column if not exists assigned_helper text;
alter table guests add column if not exists assigned_at timestamptz;

comment on column guests.assigned_helper is
  'שם העוזרת שהאורח הוקצה לה. ריק = פנוי לשליחה האוטומטית';
comment on column guests.assigned_at is
  'מתי הוקצה. הקצאה בת יותר מ-48 שעות נחשבת פגה והאורח חוזר לתור';

create index if not exists guests_assigned_helper_idx
  on guests (event_id, assigned_helper)
  where assigned_helper is not null;

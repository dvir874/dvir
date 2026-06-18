-- Migration 012: Onboarding wizard state + Post-Wedding Recap

-- Track onboarding completion and preferences per event
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS onboarding_completed  BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_style       TEXT,        -- classic | boho | modern | romantic | outdoor | luxury
  ADD COLUMN IF NOT EXISTS onboarding_fears       TEXT[],      -- budget | family | logistics | stress | forgetting
  ADD COLUMN IF NOT EXISTS onboarding_moment      TEXT,        -- what matters most (free text)
  ADD COLUMN IF NOT EXISTS onboarding_manager     TEXT,        -- bride | groom | both | other
  ADD COLUMN IF NOT EXISTS guest_count_estimate   INT,
  ADD COLUMN IF NOT EXISTS budget_estimate        INT;         -- total budget estimate in ILS

-- Post-wedding recap snapshots (computed once, 7 days after event)
CREATE TABLE IF NOT EXISTS wedding_recaps (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id             UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE UNIQUE,
  total_invited        INT NOT NULL DEFAULT 0,
  total_arrived        INT NOT NULL DEFAULT 0,
  arrival_rate         NUMERIC(5,2) NOT NULL DEFAULT 0,
  avg_response_days    NUMERIC(5,2),
  reminders_sent       INT NOT NULL DEFAULT 0,
  reminders_converted  INT NOT NULL DEFAULT 0,
  budget_planned       INT NOT NULL DEFAULT 0,
  budget_actual        INT NOT NULL DEFAULT 0,
  top_table_id         UUID REFERENCES seating_tables(id) ON DELETE SET NULL,
  top_table_photos     INT NOT NULL DEFAULT 0,
  total_memories       INT NOT NULL DEFAULT 0,
  total_audio          INT NOT NULL DEFAULT 0,
  total_capsules       INT NOT NULL DEFAULT 0,
  task_completion_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  generated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wedding_recaps_event_id ON wedding_recaps(event_id);

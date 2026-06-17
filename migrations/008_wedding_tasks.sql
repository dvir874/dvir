-- Migration 008: Wedding planning task checklist

CREATE TABLE IF NOT EXISTS wedding_tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'general', -- venue | vendors | legal | personal | day_of | general
  due_date    DATE,
  completed   BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  sort_order  INT NOT NULL DEFAULT 0,
  is_default  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wedding_tasks_event_id ON wedding_tasks(event_id);
CREATE INDEX IF NOT EXISTS wedding_tasks_completed ON wedding_tasks(event_id, completed);

-- Invitation Gallery: design request form submissions
CREATE TABLE IF NOT EXISTS design_requests (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_slug  TEXT        NOT NULL,
  invitation_name  TEXT        NOT NULL,
  name             TEXT,
  phone            TEXT        NOT NULL,
  message          TEXT,
  status           TEXT        NOT NULL DEFAULT 'new',  -- new | contacted | closed
  admin_note       TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

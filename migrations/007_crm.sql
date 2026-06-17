-- Migration 007: CRM — leads, activities, tasks, surveys, referrals

-- Pipeline stage enum
CREATE TYPE pipeline_stage AS ENUM (
  'new_lead','contacted','demo_scheduled','proposal_sent','negotiation','won','lost'
);

-- Lead source enum
CREATE TYPE lead_source AS ENUM (
  'facebook','instagram','google','organic','referral','whatsapp_direct','website_chat','unknown'
);

-- ── Leads ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  phone             TEXT NOT NULL,
  email             TEXT,
  event_type        TEXT,
  wedding_date      DATE,
  guest_count       INT,
  source            lead_source NOT NULL DEFAULT 'unknown',
  ref_code          TEXT,
  status            pipeline_stage NOT NULL DEFAULT 'new_lead',
  deal_value        INT,
  ai_score          INT DEFAULT 0 CHECK (ai_score >= 0 AND ai_score <= 100),
  notes             TEXT,
  converted_event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS leads_ref_code ON leads(ref_code) WHERE ref_code IS NOT NULL;

-- ── Lead activities (timeline) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lead_activities (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id    UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  type       TEXT NOT NULL, -- form_submit | call_logged | note_added | status_changed | whatsapp_sent | survey_sent | referral_generated
  content    TEXT,
  metadata   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lead_activities_lead_id ON lead_activities(lead_id);

-- ── Lead tasks ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lead_tasks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id    UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  due_date   DATE,
  completed  BOOLEAN NOT NULL DEFAULT false,
  priority   TEXT NOT NULL DEFAULT 'medium', -- high | medium | low
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lead_tasks_lead_id ON lead_tasks(lead_id);
CREATE INDEX IF NOT EXISTS lead_tasks_due_date ON lead_tasks(due_date) WHERE completed = false;

-- ── Satisfaction surveys ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS satisfaction_surveys (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id            UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  survey_token        UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  rating              INT CHECK (rating >= 1 AND rating <= 5),
  review_text         TEXT,
  platform_clicked    TEXT, -- google | facebook | website | null
  sent_at             TIMESTAMPTZ,
  responded_at        TIMESTAMPTZ,
  ref_code_generated  TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS satisfaction_surveys_event_id ON satisfaction_surveys(event_id);

-- ── Referral codes ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referral_codes (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code           TEXT NOT NULL UNIQUE,
  event_id       UUID REFERENCES events(id) ON DELETE SET NULL,
  referrer_name  TEXT NOT NULL,
  reward_type    TEXT,   -- discount | upgrade | voucher | null
  reward_value   INT,    -- amount in ₪
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  clicks         INT NOT NULL DEFAULT 0,
  leads_count    INT NOT NULL DEFAULT 0,
  conversions    INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── Referral clicks ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referral_clicks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_code          TEXT NOT NULL,
  visitor_id        TEXT,
  converted_lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS referral_clicks_ref_code ON referral_clicks(ref_code);

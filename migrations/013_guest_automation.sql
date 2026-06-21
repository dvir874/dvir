-- 013: Guest automation system tables

CREATE TABLE IF NOT EXISTS message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('initial','week_before','day_before','thank_you','gallery')),
  title text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_id, type)
);

CREATE TABLE IF NOT EXISTS guest_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('initial','week_before','day_before','thank_you','gallery')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','scheduled','sending','sent','cancelled')),
  mode text NOT NULL DEFAULT 'manual' CHECK (mode IN ('auto','manual')),
  scheduled_for timestamptz,
  sent_at timestamptz,
  recipients_total int DEFAULT 0,
  recipients_sent int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS message_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES guest_campaigns(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  guest_id uuid REFERENCES guests(id) ON DELETE CASCADE,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','skipped')),
  wa_link text,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS automation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  action text NOT NULL,
  result text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery_albums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  title text DEFAULT 'גלריית האירוע',
  public_token text UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_public boolean DEFAULT false,
  photo_count int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id uuid REFERENCES gallery_albums(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  public_url text,
  caption text,
  uploaded_by text DEFAULT 'couple',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "service_all" ON message_templates FOR ALL USING (true);
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "service_all" ON guest_campaigns FOR ALL USING (true);
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "service_all" ON message_history FOR ALL USING (true);
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "service_all" ON automation_logs FOR ALL USING (true);
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "service_all" ON gallery_albums FOR ALL USING (true);
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE POLICY "service_all" ON gallery_photos FOR ALL USING (true);
  EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

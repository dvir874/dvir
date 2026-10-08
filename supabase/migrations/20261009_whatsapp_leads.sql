-- WhatsApp leads on the 077 sales number — see src/lib/lead-source.ts.
-- Additive only: new nullable columns, one partial unique index, one enum
-- value. Safe on live data and idempotent. Code reads every column defensively
-- and falls back to the old unmatched-number alert until this has run.

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS wa_phone        text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS first_message   text;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_message_at timestamptz;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS welcome_sent_at timestamptz;

COMMENT ON COLUMN public.leads.wa_phone        IS 'E.164 digits of the WhatsApp sender; one lead per number';
COMMENT ON COLUMN public.leads.first_message   IS 'The first WhatsApp message — the evidence the lead actually wrote';
COMMENT ON COLUMN public.leads.welcome_sent_at IS 'Set once, atomically, when the welcome reply was claimed';

-- One lead per WhatsApp number, so two webhook deliveries racing each other
-- cannot create two leads. Partial: the existing web-form leads have no
-- wa_phone and are untouched.
CREATE UNIQUE INDEX IF NOT EXISTS leads_wa_phone_uidx
  ON public.leads (wa_phone) WHERE wa_phone IS NOT NULL;

-- Lead context for the admin console: after "✉️ לענות מכאן" on a lead alert,
-- Dvir's next message goes to this lead. mode = 'reply_lead' selects it; the
-- guest context (mode = 'reply', guest_id) is unchanged.
ALTER TABLE public.admin_context
  ADD COLUMN IF NOT EXISTS lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL;

-- TikTok as a lead source. The enum's name is read from the column rather
-- than assumed: schema.sql is older than production here.
DO $$
DECLARE t text;
BEGIN
  SELECT udt_name INTO t FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'source';
  IF t IS NOT NULL AND t <> 'text' THEN
    EXECUTE format('ALTER TYPE public.%I ADD VALUE IF NOT EXISTS %L', t, 'tiktok');
  END IF;
END $$;

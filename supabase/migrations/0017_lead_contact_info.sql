-- Add customer contact info to leads for verified lead tracking.
-- customer_name / customer_phone are captured before redirecting to WhatsApp.
-- ref_code is a short unique code included in the prefilled message for traceability.

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS customer_name  TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone TEXT,
  ADD COLUMN IF NOT EXISTS ref_code       TEXT;

-- Allow "whatsapp" only going forward (call tracking removed).
-- Existing "call" rows are kept for historical data but new inserts must be "whatsapp".
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_channel_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_channel_check CHECK (channel IN ('whatsapp', 'call'));

CREATE INDEX IF NOT EXISTS idx_leads_ref_code ON public.leads (ref_code) WHERE ref_code IS NOT NULL;

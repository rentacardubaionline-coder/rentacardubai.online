-- Add terms_agreed_at to track when a vendor formally accepted the platform terms.
-- NULL = not yet agreed. Timestamptz = agreed at that moment (audit trail).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS terms_agreed_at TIMESTAMPTZ;

-- Index for admin queries (e.g. "vendors who haven't accepted yet")
CREATE INDEX IF NOT EXISTS profiles_terms_agreed_at_idx
  ON public.profiles (terms_agreed_at)
  WHERE terms_agreed_at IS NOT NULL;

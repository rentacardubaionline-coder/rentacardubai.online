-- Track whether vendor has dismissed/skipped the onboarding wizard.
-- NULL = has not been to onboarding yet (will be redirected).
-- Timestamp = skipped at least once; banner shown until fully complete.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_skipped_at TIMESTAMPTZ;

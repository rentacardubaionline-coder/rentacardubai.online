-- Vendor per-lead pricing tiers.
-- Admin edits these; vendor dashboard renders them as the billing agreement.

CREATE TABLE IF NOT EXISTS public.pricing_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE
    CHECK (code IN ('economy','sedan','suv','luxury')),
  label text NOT NULL,
  price_pkr int NOT NULL CHECK (price_pkr >= 0),
  description text,
  examples text[] DEFAULT ARRAY[]::text[],
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Seed the 4 default tiers
INSERT INTO public.pricing_tiers (code, label, price_pkr, description, examples, sort_order) VALUES
  (
    'economy',
    'Economy Cars',
    120,
    'Compact hatchbacks and entry-level sedans — the everyday city-runner class.',
    ARRAY['Suzuki Alto','Suzuki Mehran','Suzuki Cultus','Suzuki WagonR','Daihatsu Mira','Kia Picanto','United Bravo'],
    1
  ),
  (
    'sedan',
    'Sedan',
    200,
    'Mid-size 4-door sedans — the typical airport / intercity choice.',
    ARRAY['Toyota Corolla','Honda Civic','Honda City','Suzuki Ciaz','Hyundai Elantra','Changan Alsvin'],
    2
  ),
  (
    'suv',
    'SUV',
    350,
    'Full-size SUVs and off-roaders — for tours, mountains, and family road-trips.',
    ARRAY['Toyota Fortuner','Toyota Prado','Toyota Land Cruiser','Kia Sportage','Hyundai Tucson','Honda BR-V','MG HS'],
    3
  ),
  (
    'luxury',
    'Luxury Cars',
    500,
    'High-end executive and premium rides — weddings, VIP transfers, events.',
    ARRAY['Mercedes-Benz S-Class','Mercedes-Benz E-Class','BMW 5-Series','BMW 7-Series','Audi A6','Lexus LX','Range Rover'],
    4
  )
ON CONFLICT (code) DO NOTHING;

-- Per-lead billing: capture which tier the lead falls into and the amount billed
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS tier_code text,
  ADD COLUMN IF NOT EXISTS billed_amount_pkr int;

CREATE INDEX IF NOT EXISTS idx_leads_vendor_tier
  ON public.leads(vendor_user_id, tier_code);

-- RLS: everyone can read pricing (public info); only admin writes
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pricing_tiers_read_all" ON public.pricing_tiers;
CREATE POLICY "pricing_tiers_read_all" ON public.pricing_tiers
  FOR SELECT USING (true);

-- Admin writes enforced at the application layer (service role key bypasses RLS).

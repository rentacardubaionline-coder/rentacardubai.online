-- SEO keywords table: the 54 keyword slugs that generate landing pages
-- Previously hardcoded in lib/seo/routes-config.ts — now DB-backed so admin can CRUD

CREATE TABLE IF NOT EXISTS public.seo_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  label text NOT NULL,
  include_in_sitemap_towns boolean DEFAULT false,
  template_overrides jsonb,
  is_active boolean DEFAULT true,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.seo_keywords ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read seo_keywords" ON public.seo_keywords;
CREATE POLICY "Public can read seo_keywords" ON public.seo_keywords
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can write seo_keywords" ON public.seo_keywords;
CREATE POLICY "Admin can write seo_keywords" ON public.seo_keywords
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin can update seo_keywords" ON public.seo_keywords;
CREATE POLICY "Admin can update seo_keywords" ON public.seo_keywords
  FOR UPDATE USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin can delete seo_keywords" ON public.seo_keywords;
CREATE POLICY "Admin can delete seo_keywords" ON public.seo_keywords
  FOR DELETE USING (public.is_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_seo_keywords_slug ON public.seo_keywords(slug);
CREATE INDEX IF NOT EXISTS idx_seo_keywords_active ON public.seo_keywords(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_seo_keywords_sort ON public.seo_keywords(sort_order);

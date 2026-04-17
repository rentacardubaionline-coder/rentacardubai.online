-- Seed SEO reference data: cities, towns, routes, vehicle_categories
-- Extracted from old project's Prisma seed.ts to preserve exact slugs for 14K+ indexed pages

-- ══════════════════════════════════════════════════
-- VEHICLE CATEGORIES
-- ══════════════════════════════════════════════════
INSERT INTO public.vehicle_categories (name, slug) VALUES
  ('Car', 'car'),
  ('SUV', 'suv'),
  ('Van', 'van'),
  ('Bus', 'bus'),
  ('Pickup', 'pickup'),
  ('Truck', 'truck'),
  ('Luxury', 'luxury')
ON CONFLICT (slug) DO NOTHING;

-- ══════════════════════════════════════════════════
-- CITIES (148 Pakistani cities)
-- ══════════════════════════════════════════════════
INSERT INTO public.cities (name, slug, province) VALUES
  ('Abbottabad', 'abbottabad', 'KPK'),
  ('Ahmedpur East', 'ahmedpur-east', 'Punjab'),
  ('Arif Wala', 'arif-wala', 'Punjab'),
  ('Astore', 'astore', 'Gilgit-Baltistan'),
  ('Attock', 'attock', 'Punjab'),
  ('Awaran', 'awaran', 'Balochistan'),
  ('Badin', 'badin', 'Sindh'),
  ('Bagh', 'bagh', 'AJK'),
  ('Bahawalnagar', 'bahawalnagar', 'Punjab'),
  ('Bahawalpur', 'bahawalpur', 'Punjab'),
  ('Bajaur Agency', 'bajaur-agency', 'KPK'),
  ('Bannu', 'bannu', 'KPK'),
  ('Bat Khela', 'bat-khela', 'KPK'),
  ('Battagram', 'battagram', 'KPK'),
  ('Besham', 'besham', 'KPK'),
  ('Bhakkar', 'bhakkar', 'Punjab'),
  ('Bhalwal', 'bhalwal', 'Punjab'),
  ('Buner', 'buner', 'KPK'),
  ('Burewala', 'burewala', 'Punjab'),
  ('Chakwal', 'chakwal', 'Punjab'),
  ('Chaman', 'chaman', 'Balochistan'),
  ('Charsadda', 'charsadda', 'KPK'),
  ('Chichawatni', 'chichawatni', 'Punjab'),
  ('Chiniot', 'chiniot', 'Punjab'),
  ('Chishtian', 'chishtian', 'Punjab'),
  ('Dadu', 'dadu', 'Sindh'),
  ('Daska', 'daska', 'Punjab'),
  ('Dera Ghazi Khan', 'dera-ghazi-khan', 'Punjab'),
  ('Dera Ismail Khan', 'dera-ismail-khan', 'KPK'),
  ('Dera Murad Jamali', 'dera-murad-jamali', 'Balochistan'),
  ('Dipalpur', 'dipalpur', 'Punjab'),
  ('Faisalabad', 'faisalabad', 'Punjab'),
  ('Farooqabad', 'farooqabad', 'Punjab'),
  ('Ferozwala', 'ferozwala', 'Punjab'),
  ('Ghotki', 'ghotki', 'Sindh'),
  ('Gojra', 'gojra', 'Punjab'),
  ('Gujar Khan', 'gujar-khan', 'Punjab'),
  ('Gujranwala', 'gujranwala', 'Punjab'),
  ('Gujrat', 'gujrat', 'Punjab'),
  ('Hafizabad', 'hafizabad', 'Punjab'),
  ('Hangu', 'hangu', 'KPK'),
  ('Haroonabad', 'haroonabad', 'Punjab'),
  ('Hasilpur', 'hasilpur', 'Punjab'),
  ('Haveli Lakha', 'haveli-lakha', 'Punjab'),
  ('Hub', 'hub', 'Balochistan'),
  ('Hyderabad', 'hyderabad', 'Sindh'),
  ('Islamabad', 'islamabad', 'ICT'),
  ('Jacobabad', 'jacobabad', 'Sindh'),
  ('Jalalpur Jattan', 'jalalpur-jattan', 'Punjab'),
  ('Jampur', 'jampur', 'Punjab'),
  ('Jaranwala', 'jaranwala', 'Punjab'),
  ('Jatoi', 'jatoi', 'Punjab'),
  ('Jauharabad', 'jauharabad', 'Punjab'),
  ('Jhang', 'jhang', 'Punjab'),
  ('Jhelum', 'jhelum', 'Punjab'),
  ('Kabal', 'kabal', 'KPK'),
  ('Kamalia', 'kamalia', 'Punjab'),
  ('Kamber Ali Khan', 'kamber-ali-khan', 'Sindh'),
  ('Kamoke', 'kamoke', 'Punjab'),
  ('Karachi', 'karachi', 'Sindh'),
  ('Karak', 'karak', 'KPK'),
  ('Kasur', 'kasur', 'Punjab'),
  ('Khairpur', 'khairpur', 'Sindh'),
  ('Khanewal', 'khanewal', 'Punjab'),
  ('Khanpur', 'khanpur', 'Punjab'),
  ('Kharian', 'kharian', 'Punjab'),
  ('Khushab', 'khushab', 'Punjab'),
  ('Khuzdar', 'khuzdar', 'Balochistan'),
  ('Kohat', 'kohat', 'KPK'),
  ('Kot Abdul Malik', 'kot-abdul-malik', 'Punjab'),
  ('Kot Addu', 'kot-addu', 'Punjab'),
  ('Kot Radha Kishan', 'kot-radha-kishan', 'Punjab'),
  ('Kotri', 'kotri', 'Sindh'),
  ('Kulachi', 'kulachi', 'KPK'),
  ('Lahore', 'lahore', 'Punjab'),
  ('Lakki Marwat', 'lakki-marwat', 'KPK'),
  ('Lala Musa', 'lala-musa', 'Punjab'),
  ('Larkana', 'larkana', 'Sindh'),
  ('Layyah', 'layyah', 'Punjab'),
  ('Lodhran', 'lodhran', 'Punjab'),
  ('Mailsi', 'mailsi', 'Punjab'),
  ('Mandi Bahauddin', 'mandi-bahauddin', 'Punjab'),
  ('Mansehra', 'mansehra', 'KPK'),
  ('Mardan', 'mardan', 'KPK'),
  ('Mian Channu', 'mian-channu', 'Punjab'),
  ('Mianwali', 'mianwali', 'Punjab'),
  ('Mingora', 'mingora', 'KPK'),
  ('Mirpur', 'mirpur', 'AJK'),
  ('Mirpur Khas', 'mirpur-khas', 'Sindh'),
  ('Multan', 'multan', 'Punjab'),
  ('Muridke', 'muridke', 'Punjab'),
  ('Muzaffarabad', 'muzaffarabad', 'AJK'),
  ('Muzaffargarh', 'muzaffargarh', 'Punjab'),
  ('Narowal', 'narowal', 'Punjab'),
  ('Nawabshah (Benazirabad)', 'nawabshah-benazirabad', 'Sindh'),
  ('Nowshera', 'nowshera', 'KPK'),
  ('Okara', 'okara', 'Punjab'),
  ('Pakpattan', 'pakpattan', 'Punjab'),
  ('Panjgur', 'panjgur', 'Balochistan'),
  ('Pasrur', 'pasrur', 'Punjab'),
  ('Pattoki', 'pattoki', 'Punjab'),
  ('Peshawar', 'peshawar', 'KPK'),
  ('Phool Nagar', 'phool-nagar', 'Punjab'),
  ('Pishin', 'pishin', 'Balochistan'),
  ('Quetta', 'quetta', 'Balochistan'),
  ('Rahim Yar Khan', 'rahim-yar-khan', 'Punjab'),
  ('Rawalpindi', 'rawalpindi', 'Punjab'),
  ('Renala Khurd', 'renala-khurd', 'Punjab'),
  ('Sadiqabad', 'sadiqabad', 'Punjab'),
  ('Sahiwal', 'sahiwal', 'Punjab'),
  ('Sambrial', 'sambrial', 'Punjab'),
  ('Samundri', 'samundri', 'Punjab'),
  ('Sangla Hill', 'sangla-hill', 'Punjab'),
  ('Sargodha', 'sargodha', 'Punjab'),
  ('Shabqadar', 'shabqadar', 'KPK'),
  ('Shahdadkot', 'shahdadkot', 'Sindh'),
  ('Shahdadpur', 'shahdadpur', 'Sindh'),
  ('Shakargarh', 'shakargarh', 'Punjab'),
  ('Sheikhupura', 'sheikhupura', 'Punjab'),
  ('Shikarpur', 'shikarpur', 'Sindh'),
  ('Shujabad', 'shujabad', 'Punjab'),
  ('Sialkot', 'sialkot', 'Punjab'),
  ('Sukkur', 'sukkur', 'Sindh'),
  ('Swabi', 'swabi', 'KPK'),
  ('Swat', 'swat', 'KPK'),
  ('Tando Adam', 'tando-adam', 'Sindh'),
  ('Tando Allahyar', 'tando-allahyar', 'Sindh'),
  ('Tando Muhammad Khan', 'tando-muhammad-khan', 'Sindh'),
  ('Taunsa', 'taunsa', 'Punjab'),
  ('Taxila', 'taxila', 'Punjab'),
  ('Timergara', 'timergara', 'KPK'),
  ('Tordher', 'tordher', 'KPK'),
  ('Turbat', 'turbat', 'Balochistan'),
  ('Umerkot', 'umerkot', 'Sindh'),
  ('Upper Dir', 'upper-dir', 'KPK'),
  ('Vehari', 'vehari', 'Punjab'),
  ('Wah Cantonment', 'wah-cantonment', 'Punjab'),
  ('Zaida', 'zaida', 'KPK'),
  ('Ziarat', 'ziarat', 'Balochistan'),
  ('Murree', 'murree', 'Punjab'),
  ('Skardu', 'skardu', 'Gilgit-Baltistan'),
  ('Hunza', 'hunza', 'Gilgit-Baltistan'),
  ('Gilgit', 'gilgit', 'Gilgit-Baltistan'),
  ('Gwadar', 'gwadar', 'Balochistan')
ON CONFLICT (slug) DO NOTHING;

-- ══════════════════════════════════════════════════
-- TOWNS (major areas within key cities)
-- Uses a DO block to look up city IDs by slug
-- ══════════════════════════════════════════════════
DO $$
DECLARE
  cid uuid;
BEGIN
  -- Karachi towns
  SELECT id INTO cid FROM public.cities WHERE slug = 'karachi';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Clifton', 'clifton', cid),
      ('DHA', 'dha', cid),
      ('Gulshan-e-Iqbal', 'gulshan-e-iqbal', cid),
      ('PECHS', 'pechs', cid),
      ('Defence', 'defence', cid),
      ('Gulistan-e-Johar', 'gulistan-e-johar', cid),
      ('Malir', 'malir', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- Lahore towns (major areas)
  SELECT id INTO cid FROM public.cities WHERE slug = 'lahore';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Gulberg', 'gulberg', cid),
      ('DHA Phase 5', 'dha-phase-5', cid),
      ('Model Town', 'model-town', cid),
      ('Johar Town', 'johar-town', cid),
      ('Bahria Town', 'bahria-town', cid),
      ('Wapda Town', 'wapda-town', cid),
      ('Ferozepur Road', 'ferozepur-road', cid),
      ('Allama Iqbal Town', 'allama-iqbal-town', cid),
      ('Cantt', 'cantt', cid),
      ('Cavalry Ground', 'cavalry-ground', cid),
      ('Garden Town', 'garden-town', cid),
      ('Faisal Town', 'faisal-town', cid),
      ('Samanabad', 'samanabad', cid),
      ('Shadman Colony', 'shadman-colony', cid),
      ('Muslim Town', 'muslim-town', cid),
      ('Valencia Town', 'valencia-town', cid),
      ('Raiwind Road', 'raiwind-road', cid),
      ('D.H.A.', 'd-h-a', cid),
      ('Defense', 'defense', cid),
      ('Education Town', 'education-town', cid),
      ('Jail Road', 'jail-road', cid),
      ('Kot Lakhpat', 'kot-lakhpat', cid),
      ('Lawrence Road', 'lawrence-road', cid),
      ('Thokar Niaz Baig', 'thokar-niaz-baig', cid),
      ('Barki Road', 'barki-road', cid),
      ('Bedian Road', 'bedian-road', cid),
      ('Canal Road', 'canal-road', cid),
      ('Ichhra', 'ichhra', cid),
      ('Saddar', 'saddar', cid),
      ('Garhi Shahu', 'garhi-shahu', cid),
      ('Mughal Pura', 'mughal-pura', cid),
      ('Wahdat Colony', 'wahdat-colony', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- Islamabad towns
  SELECT id INTO cid FROM public.cities WHERE slug = 'islamabad';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('F-7', 'f-7', cid),
      ('F-8', 'f-8', cid),
      ('G-11', 'g-11', cid),
      ('DHA Phase 2', 'dha-phase-2', cid),
      ('E-11', 'e-11', cid),
      ('I-8', 'i-8', cid),
      ('Blue Area', 'blue-area', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- Rawalpindi towns
  SELECT id INTO cid FROM public.cities WHERE slug = 'rawalpindi';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Bahria Town', 'bahria-town', cid),
      ('DHA Phase 1', 'dha-phase-1', cid),
      ('Chaklala', 'chaklala', cid),
      ('Cantt', 'cantt', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- Faisalabad towns
  SELECT id INTO cid FROM public.cities WHERE slug = 'faisalabad';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('D Ground', 'd-ground', cid),
      ('Satiana Road', 'satiana-road', cid),
      ('Jaranwala Road', 'jaranwala-road', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- Multan towns
  SELECT id INTO cid FROM public.cities WHERE slug = 'multan';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Cantt', 'cantt', cid),
      ('Gulgasht', 'gulgasht', cid),
      ('Bosan Road', 'bosan-road', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- Peshawar towns
  SELECT id INTO cid FROM public.cities WHERE slug = 'peshawar';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Hayatabad', 'hayatabad', cid),
      ('University Town', 'university-town', cid),
      ('Cantt', 'cantt', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- Quetta towns
  SELECT id INTO cid FROM public.cities WHERE slug = 'quetta';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Cantt', 'cantt', cid),
      ('Jinnah Town', 'jinnah-town', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- Gujranwala towns
  SELECT id INTO cid FROM public.cities WHERE slug = 'gujranwala';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Cantt', 'cantt', cid),
      ('Model Town', 'model-town', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- Sialkot towns
  SELECT id INTO cid FROM public.cities WHERE slug = 'sialkot';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Cantt', 'cantt', cid),
      ('Model Town', 'model-town', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- Sargodha towns
  SELECT id INTO cid FROM public.cities WHERE slug = 'sargodha';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Cantt', 'cantt', cid),
      ('Model Town', 'model-town', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- Bahawalpur towns
  SELECT id INTO cid FROM public.cities WHERE slug = 'bahawalpur';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Cantt', 'cantt', cid),
      ('Model Town', 'model-town', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;
END $$;

-- ══════════════════════════════════════════════════
-- ROUTES (51 intercity routes)
-- ══════════════════════════════════════════════════
DO $$
DECLARE
  oid uuid;
  did uuid;
BEGIN
  -- Helper: insert route if both cities exist
  -- Lahore routes
  SELECT id INTO oid FROM public.cities WHERE slug = 'lahore';
  SELECT id INTO did FROM public.cities WHERE slug = 'islamabad';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('lahore-to-islamabad', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'karachi';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('lahore-to-karachi', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'multan';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('lahore-to-multan', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'faisalabad';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('lahore-to-faisalabad', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'sialkot';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('lahore-to-sialkot', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'gujranwala';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('lahore-to-gujranwala', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'murree';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('lahore-to-murree', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'bahawalpur';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('lahore-to-bahawalpur', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'bahawalnagar';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('lahore-to-bahawalnagar', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'skardu';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('lahore-to-skardu', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  -- Karachi routes
  SELECT id INTO oid FROM public.cities WHERE slug = 'karachi';
  SELECT id INTO did FROM public.cities WHERE slug = 'hyderabad';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('karachi-to-hyderabad', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'sukkur';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('karachi-to-sukkur', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'larkana';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('karachi-to-larkana', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'gwadar';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('karachi-to-gwadar', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'quetta';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('karachi-to-quetta', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'multan';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('karachi-to-multan', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'islamabad';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('karachi-to-islamabad', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'lahore';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('karachi-to-lahore', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'nawabshah-benazirabad';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('karachi-to-nawabshah-benazirabad', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'mirpur-khas';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('karachi-to-mirpur-khas', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  -- Islamabad routes
  SELECT id INTO oid FROM public.cities WHERE slug = 'islamabad';
  SELECT id INTO did FROM public.cities WHERE slug = 'murree';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('islamabad-to-murree', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'abbottabad';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('islamabad-to-abbottabad', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'mansehra';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('islamabad-to-mansehra', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'peshawar';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('islamabad-to-peshawar', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'skardu';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('islamabad-to-skardu', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'hunza';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('islamabad-to-hunza', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'gilgit';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('islamabad-to-gilgit', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'faisalabad';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('islamabad-to-faisalabad', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'sialkot';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('islamabad-to-sialkot', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'lahore';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('islamabad-to-lahore', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  -- Rawalpindi routes
  SELECT id INTO oid FROM public.cities WHERE slug = 'rawalpindi';
  SELECT id INTO did FROM public.cities WHERE slug = 'islamabad';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('rawalpindi-to-islamabad', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'lahore';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('rawalpindi-to-lahore', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  -- Multan routes
  SELECT id INTO oid FROM public.cities WHERE slug = 'multan';
  SELECT id INTO did FROM public.cities WHERE slug = 'bahawalpur';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('multan-to-bahawalpur', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'rahim-yar-khan';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('multan-to-rahim-yar-khan', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'dera-ghazi-khan';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('multan-to-dera-ghazi-khan', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'lahore';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('multan-to-lahore', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'karachi';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('multan-to-karachi', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  -- Peshawar routes
  SELECT id INTO oid FROM public.cities WHERE slug = 'peshawar';
  SELECT id INTO did FROM public.cities WHERE slug = 'islamabad';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('peshawar-to-islamabad', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'swat';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('peshawar-to-swat', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'mardan';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('peshawar-to-mardan', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'abbottabad';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('peshawar-to-abbottabad', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  -- Quetta routes
  SELECT id INTO oid FROM public.cities WHERE slug = 'quetta';
  SELECT id INTO did FROM public.cities WHERE slug = 'gwadar';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('quetta-to-gwadar', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'karachi';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('quetta-to-karachi', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'turbat';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('quetta-to-turbat', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  -- Skardu, Gilgit routes
  SELECT id INTO oid FROM public.cities WHERE slug = 'skardu';
  SELECT id INTO did FROM public.cities WHERE slug = 'hunza';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('skardu-to-hunza', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO oid FROM public.cities WHERE slug = 'gilgit';
  SELECT id INTO did FROM public.cities WHERE slug = 'hunza';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('gilgit-to-hunza', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'skardu';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('gilgit-to-skardu', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  -- Faisalabad routes
  SELECT id INTO oid FROM public.cities WHERE slug = 'faisalabad';
  SELECT id INTO did FROM public.cities WHERE slug = 'lahore';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('faisalabad-to-lahore', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO did FROM public.cities WHERE slug = 'islamabad';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('faisalabad-to-islamabad', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  -- Other routes
  SELECT id INTO oid FROM public.cities WHERE slug = 'gujranwala';
  SELECT id INTO did FROM public.cities WHERE slug = 'sialkot';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('gujranwala-to-sialkot', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO oid FROM public.cities WHERE slug = 'sialkot';
  SELECT id INTO did FROM public.cities WHERE slug = 'lahore';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('sialkot-to-lahore', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;

  SELECT id INTO oid FROM public.cities WHERE slug = 'bahawalpur';
  SELECT id INTO did FROM public.cities WHERE slug = 'multan';
  IF oid IS NOT NULL AND did IS NOT NULL THEN INSERT INTO public.routes (slug, origin_city_id, destination_city_id) VALUES ('bahawalpur-to-multan', oid, did) ON CONFLICT (slug) DO NOTHING; END IF;
END $$;

-- Auto-generated: import all towns from old project
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  cid uuid;
BEGIN

  -- abbottabad (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'abbottabad';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Ayub Medical Complex Area', 'ayub-medical-complex-area', cid),
      ('Cantt Area', 'cantt-area', cid),
      ('Dhamtour', 'dhamtour', cid),
      ('Havelian', 'havelian', cid),
      ('Jhangi Syedan', 'jhangi-syedan', cid),
      ('Jhangira', 'jhangira', cid),
      ('Jinnahabad', 'jinnahabad', cid),
      ('Kakul', 'kakul', cid),
      ('Kunj', 'kunj', cid),
      ('Malik Pura', 'malik-pura', cid),
      ('Mandian', 'mandian', cid),
      ('Mansehra Road', 'mansehra-road', cid),
      ('Medical Colony', 'medical-colony', cid),
      ('Mirpur', 'mirpur', cid),
      ('Muslim Town', 'muslim-town', cid),
      ('Nawan Shehr', 'nawan-shehr', cid),
      ('Nawanshahr', 'nawanshahr', cid),
      ('PMA Area', 'pma-area', cid),
      ('Saddar', 'saddar', cid),
      ('Supply Bazaar', 'supply-bazaar', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- astore (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'astore';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Astore Bazaar', 'astore-bazaar', cid),
      ('Burzil', 'burzil', cid),
      ('Chilim', 'chilim', cid),
      ('Deosai Road', 'deosai-road', cid),
      ('Domail', 'domail', cid),
      ('Fairy Meadows', 'fairy-meadows', cid),
      ('Gilgit Road', 'gilgit-road', cid),
      ('Godai', 'godai', cid),
      ('KKH Junction', 'kkh-junction', cid),
      ('Lower Astore', 'lower-astore', cid),
      ('Main Valley', 'main-valley', cid),
      ('Minimarg', 'minimarg', cid),
      ('Nanga Parbat Base', 'nanga-parbat-base', cid),
      ('New Town', 'new-town', cid),
      ('Old Town', 'old-town', cid),
      ('Rama', 'rama', cid),
      ('Rattu', 'rattu', cid),
      ('Rupal', 'rupal', cid),
      ('Tarishing', 'tarishing', cid),
      ('Upper Astore', 'upper-astore', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- attock (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'attock';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Barotha', 'barotha', cid),
      ('Basal', 'basal', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Dhurnal', 'dhurnal', cid),
      ('Fateh Jang', 'fateh-jang', cid),
      ('Gondal', 'gondal', cid),
      ('GT Road', 'gt-road', cid),
      ('Hassan Abdal', 'hassan-abdal', cid),
      ('Hazro', 'hazro', cid),
      ('Islamabad Road', 'islamabad-road', cid),
      ('Jand', 'jand', cid),
      ('Kamra', 'kamra', cid),
      ('Lawrencepur', 'lawrencepur', cid),
      ('Main Bazaar', 'main-bazaar', cid),
      ('Makhad', 'makhad', cid),
      ('Model Town', 'model-town', cid),
      ('Pindi Gheb', 'pindi-gheb', cid),
      ('Saddar', 'saddar', cid),
      ('Shinka', 'shinka', cid),
      ('Waisa', 'waisa', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- awaran (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'awaran';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Bela Road', 'bela-road', cid),
      ('City Area', 'city-area', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Gidar', 'gidar', cid),
      ('Gishkaur', 'gishkaur', cid),
      ('Hospital Road', 'hospital-road', cid),
      ('Hub Road', 'hub-road', cid),
      ('Jhal Jhao', 'jhal-jhao', cid),
      ('Khuzdar Road', 'khuzdar-road', cid),
      ('Kolwah', 'kolwah', cid),
      ('Korak', 'korak', cid),
      ('Main Bazaar', 'main-bazaar', cid),
      ('Mashkai', 'mashkai', cid),
      ('Mining Area', 'mining-area', cid),
      ('Nall Road', 'nall-road', cid),
      ('New Town', 'new-town', cid),
      ('Old Town', 'old-town', cid),
      ('Ornach Road', 'ornach-road', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Turbat Road', 'turbat-road', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- badin (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'badin';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Badin City', 'badin-city', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Golarchi', 'golarchi', cid),
      ('Hyderabad Road', 'hyderabad-road', cid),
      ('Kadhan', 'kadhan', cid),
      ('Kario Ghanwar', 'kario-ghanwar', cid),
      ('Khoski', 'khoski', cid),
      ('Matli', 'matli', cid),
      ('New Town', 'new-town', cid),
      ('Old Town', 'old-town', cid),
      ('Pangrio', 'pangrio', cid),
      ('Railway Road', 'railway-road', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Shaheed Fazil Rahu', 'shaheed-fazil-rahu', cid),
      ('Station Road', 'station-road', cid),
      ('Talhar', 'talhar', cid),
      ('Tando Bago', 'tando-bago', cid),
      ('Tando Ghulam Ali', 'tando-ghulam-ali', cid),
      ('Tando Ghulam Hyder', 'tando-ghulam-hyder', cid),
      ('Tando Muhammad Khan Road', 'tando-muhammad-khan-road', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- bagh (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'bagh';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Birpani', 'birpani', cid),
      ('Chambi', 'chambi', cid),
      ('City Area', 'city-area', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Dhirkot', 'dhirkot', cid),
      ('Goi', 'goi', cid),
      ('Harighal', 'harighal', cid),
      ('Hospital Road', 'hospital-road', cid),
      ('Kohala Road', 'kohala-road', cid),
      ('Leepa Valley', 'leepa-valley', cid),
      ('Main Bazaar', 'main-bazaar', cid),
      ('Mallot', 'mallot', cid),
      ('Muzaffarabad Road', 'muzaffarabad-road', cid),
      ('Neelum Road', 'neelum-road', cid),
      ('New Town', 'new-town', cid),
      ('Old Town', 'old-town', cid),
      ('Rawalakot Road', 'rawalakot-road', cid),
      ('Rera', 'rera', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Sudhan Gali', 'sudhan-gali', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- bahawalnagar (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'bahawalnagar';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Adda Bodla Road', 'adda-bodla-road', cid),
      ('Bahawalpur Road', 'bahawalpur-road', cid),
      ('Chak No. 107/10-R', 'chak-no-10710-r', cid),
      ('Chak No. 89/BC', 'chak-no-89bc', cid),
      ('Chishtian', 'chishtian', cid),
      ('Chor', 'chor', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Dahranwala', 'dahranwala', cid),
      ('Donga Bonga', 'donga-bonga', cid),
      ('Fort Abbas', 'fort-abbas', cid),
      ('Haroonabad', 'haroonabad', cid),
      ('Marot', 'marot', cid),
      ('Minchinabad', 'minchinabad', cid),
      ('Model Town', 'model-town', cid),
      ('Multan Road', 'multan-road', cid),
      ('Qaim Pur', 'qaim-pur', cid),
      ('Qila Derawar', 'qila-derawar', cid),
      ('Railway Road', 'railway-road', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Satellite Town', 'satellite-town', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- bahawalpur (23 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'bahawalpur';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Ahmad Pur East', 'ahmad-pur-east', cid),
      ('Allama Iqbal Town', 'allama-iqbal-town', cid),
      ('Baghdad-ul-Jadeed', 'baghdad-ul-jadeed', cid),
      ('Cantt', 'bahawalpur-cantt', cid),
      ('Cantt Area', 'cantt-area', cid),
      ('Cholistan', 'cholistan', cid),
      ('Circular Road', 'circular-road', cid),
      ('Derbar Mahal', 'derbar-mahal', cid),
      ('Farid Gate', 'farid-gate', cid),
      ('Hasilpur', 'hasilpur', cid),
      ('Jamia Masjid Road', 'jamia-masjid-road', cid),
      ('Khawaja Fareed Road', 'khawaja-fareed-road', cid),
      ('Model Town', 'bahawalpur-model-town', cid),
      ('Model Town A', 'model-town-a', cid),
      ('Model Town B', 'model-town-b', cid),
      ('Muhajir Colony', 'muhajir-colony', cid),
      ('Multan Road', 'multan-road', cid),
      ('Noor Mahal Area', 'noor-mahal-area', cid),
      ('Railway Road', 'railway-road', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Satellite Town', 'satellite-town', cid),
      ('University Chowk', 'university-chowk', cid),
      ('Yazman', 'yazman', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- bannu (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'bannu';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Baka Khel', 'baka-khel', cid),
      ('Cantt', 'cantt', cid),
      ('City Area', 'city-area', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Domail', 'domail', cid),
      ('Ghoriwala', 'ghoriwala', cid),
      ('Haved Khel', 'haved-khel', cid),
      ('Haveli Umra Khan', 'haveli-umra-khan', cid),
      ('Hospital Road', 'hospital-road', cid),
      ('Janikhel', 'janikhel', cid),
      ('Kakki', 'kakki', cid),
      ('Kohat Road', 'kohat-road', cid),
      ('Lakki Road', 'lakki-road', cid),
      ('Miranshah Road', 'miranshah-road', cid),
      ('Muhammad Khel', 'muhammad-khel', cid),
      ('Old City', 'old-city', cid),
      ('Railway Road', 'railway-road', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Township', 'township', cid),
      ('Wazir Bagh', 'wazir-bagh', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- bhakkar (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'bhakkar';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Basti Lal', 'basti-lal', cid),
      ('Behal', 'behal', cid),
      ('Chak 42/TDA', 'chak-42tda', cid),
      ('Chak 73/TDA', 'chak-73tda', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Darya Khan', 'darya-khan', cid),
      ('Duleywala', 'duleywala', cid),
      ('Dunga Bunga', 'dunga-bunga', cid),
      ('Hyder Abad', 'hyder-abad', cid),
      ('Jhang Road', 'jhang-road', cid),
      ('Kallurkot', 'kallurkot', cid),
      ('Kot Chutta', 'kot-chutta', cid),
      ('Kundian Road', 'kundian-road', cid),
      ('Mankera', 'mankera', cid),
      ('Mianwali Road', 'mianwali-road', cid),
      ('Model Town', 'model-town', cid),
      ('Nawan Jandanwala', 'nawan-jandanwala', cid),
      ('Piplan', 'piplan', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Satellite Town', 'satellite-town', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- burewala (15 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'burewala';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Chak No. 27/WB', 'chak-no-27wb', cid),
      ('Chak No. 86/WB', 'chak-no-86wb', cid),
      ('Chowk Dera', 'chowk-dera', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Gaggo Mandi', 'gaggo-mandi', cid),
      ('Luddan Road', 'luddan-road', cid),
      ('Mailsi Road', 'mailsi-road', cid),
      ('Model Town', 'model-town', cid),
      ('Mohalla Mughalabad', 'mohalla-mughalabad', cid),
      ('Mohalla Qasimabad', 'mohalla-qasimabad', cid),
      ('Multan Road', 'multan-road', cid),
      ('Railway Road', 'railway-road', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Satellite Town', 'satellite-town', cid),
      ('Vehari Road', 'vehari-road', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- chakwal (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'chakwal';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Balkassar', 'balkassar', cid),
      ('Bhagwal', 'bhagwal', cid),
      ('Bhaun', 'bhaun', cid),
      ('Choa Saidan Shah', 'choa-saidan-shah', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Danda Shah Bilawal', 'danda-shah-bilawal', cid),
      ('Dhudial', 'dhudial', cid),
      ('Jhelum Road', 'jhelum-road', cid),
      ('Kalar Kahar Road', 'kalar-kahar-road', cid),
      ('Kallar Kahar', 'kallar-kahar', cid),
      ('Lawa', 'lawa', cid),
      ('Mianwali Road', 'mianwali-road', cid),
      ('Model Town', 'model-town', cid),
      ('Mulhal Mughalan', 'mulhal-mughalan', cid),
      ('Pindi Road', 'pindi-road', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Sarkal', 'sarkal', cid),
      ('Satellite Town', 'satellite-town', cid),
      ('Talagang', 'talagang', cid),
      ('Tamman', 'tamman', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- chaman (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'chaman';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Afghan Border', 'afghan-border', cid),
      ('Boghra Road', 'boghra-road', cid),
      ('Border Area', 'border-area', cid),
      ('Chaman City', 'chaman-city', cid),
      ('City Area', 'city-area', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Dobandi', 'dobandi', cid),
      ('Frontier Road', 'frontier-road', cid),
      ('Gulistan', 'gulistan', cid),
      ('Hotel Road', 'hotel-road', cid),
      ('Killa Abdullah', 'killa-abdullah', cid),
      ('Main Bazaar', 'main-bazaar', cid),
      ('Mall Road', 'mall-road', cid),
      ('Muhammad Khel', 'muhammad-khel', cid),
      ('New Town', 'new-town', cid),
      ('Old Town', 'old-town', cid),
      ('Railway Station', 'railway-station', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Spin Boldak Road', 'spin-boldak-road', cid),
      ('Taj Road', 'taj-road', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- charsadda (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'charsadda';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Daudzai', 'daudzai', cid),
      ('Dhaki', 'dhaki', cid),
      ('Dheri Zardad', 'dheri-zardad', cid),
      ('Farooq Azam', 'farooq-azam', cid),
      ('GT Road', 'gt-road', cid),
      ('Khazana', 'khazana', cid),
      ('Mandani', 'mandani', cid),
      ('Mardan Road', 'mardan-road', cid),
      ('Nisatta', 'nisatta', cid),
      ('Peshawar Road', 'peshawar-road', cid),
      ('Prang', 'prang', cid),
      ('Rajar', 'rajar', cid),
      ('Rajjar', 'rajjar', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Sardheri', 'sardheri', cid),
      ('Shabqadar', 'shabqadar', cid),
      ('Tangi', 'tangi', cid),
      ('Tarnab', 'tarnab', cid),
      ('Umarzai', 'umarzai', cid),
      ('Utmanzai', 'utmanzai', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- chiniot (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'chiniot';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Ahmad Pur Sial Road', 'ahmad-pur-sial-road', cid),
      ('Badiana', 'badiana', cid),
      ('Bazar Nawabpura', 'bazar-nawabpura', cid),
      ('Bhawana City', 'bhawana-city', cid),
      ('Bhowana', 'bhowana', cid),
      ('Chenab Nagar', 'chenab-nagar', cid),
      ('Circular Road', 'circular-road', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Faisalabad Road', 'faisalabad-road', cid),
      ('Jhang Road', 'jhang-road', cid),
      ('Kachi Kotli', 'kachi-kotli', cid),
      ('Kot Rajkour', 'kot-rajkour', cid),
      ('Lalian', 'lalian', cid),
      ('Main Chowk', 'main-chowk', cid),
      ('Mochiwala', 'mochiwala', cid),
      ('Model Town', 'model-town', cid),
      ('Mohallah Darwesh', 'mohallah-darwesh', cid),
      ('Railway Road', 'railway-road', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Satellite Town', 'satellite-town', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- dadu (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'dadu';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Ali Goharabad', 'ali-goharabad', cid),
      ('Bhan Saeedabad', 'bhan-saeedabad', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Darya Khan Mari', 'darya-khan-mari', cid),
      ('Drigh Bala', 'drigh-bala', cid),
      ('Fareedabad', 'fareedabad', cid),
      ('Hyderabad Road', 'hyderabad-road', cid),
      ('Indus Highway', 'indus-highway', cid),
      ('Johi', 'johi', cid),
      ('Khairpur Nathan Shah', 'khairpur-nathan-shah', cid),
      ('KN Shah', 'kn-shah', cid),
      ('Larkana Road', 'larkana-road', cid),
      ('Manjhand', 'manjhand', cid),
      ('Mehar', 'mehar', cid),
      ('Phulji', 'phulji', cid),
      ('Radhan', 'radhan', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Sehwan Sharif', 'sehwan-sharif', cid),
      ('Sita Road', 'sita-road', cid),
      ('Wahi Pandi', 'wahi-pandi', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- dera-ghazi-khan (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'dera-ghazi-khan';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Ahmad Pur Lamma', 'ahmad-pur-lamma', cid),
      ('Choti Zareen', 'choti-zareen', cid),
      ('Chowk Abadi', 'chowk-abadi', cid),
      ('Chowk Qureshi', 'chowk-qureshi', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Fazilpur', 'fazilpur', cid),
      ('Fort Munro', 'fort-munro', cid),
      ('Jampur', 'jampur', cid),
      ('Kala Bagh', 'kala-bagh', cid),
      ('Kot Chutta', 'kot-chutta', cid),
      ('Model Town', 'model-town', cid),
      ('Moza Kot Mithan', 'moza-kot-mithan', cid),
      ('Multan Road', 'multan-road', cid),
      ('Rajanpur', 'rajanpur', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Sakhi Sarwar', 'sakhi-sarwar', cid),
      ('Satellite Town', 'satellite-town', cid),
      ('Taunsa', 'taunsa', cid),
      ('Tribal Area', 'tribal-area', cid),
      ('Vehova', 'vehova', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- dera-ismail-khan (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'dera-ismail-khan';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Bannu Road', 'bannu-road', cid),
      ('Cantt', 'cantt', cid),
      ('Circular Road', 'circular-road', cid),
      ('City Area', 'city-area', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Darazinda', 'darazinda', cid),
      ('Draban', 'draban', cid),
      ('Gomal University Area', 'gomal-university-area', cid),
      ('Hospital Road', 'hospital-road', cid),
      ('Industrial Area', 'industrial-area', cid),
      ('Kulachi', 'kulachi', cid),
      ('Old City', 'old-city', cid),
      ('Paharpur', 'paharpur', cid),
      ('Parowa', 'parowa', cid),
      ('Police Line Road', 'police-line-road', cid),
      ('Ratta Kulachi', 'ratta-kulachi', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Tank Road', 'tank-road', cid),
      ('Township', 'township', cid),
      ('Zhob Road', 'zhob-road', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- dera-murad-jamali (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'dera-murad-jamali';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Agricultural Area', 'agricultural-area', cid),
      ('Baba Kot', 'baba-kot', cid),
      ('Bolan Road', 'bolan-road', cid),
      ('Cantt Area', 'cantt-area', cid),
      ('City Area', 'city-area', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Gandawa', 'gandawa', cid),
      ('Hospital Road', 'hospital-road', cid),
      ('Jhatpat', 'jhatpat', cid),
      ('Kachhi', 'kachhi', cid),
      ('Main Bazaar', 'main-bazaar', cid),
      ('Miro Khan', 'miro-khan', cid),
      ('New Town', 'new-town', cid),
      ('Old Town', 'old-town', cid),
      ('Pat Feeder', 'pat-feeder', cid),
      ('Quetta Road', 'quetta-road', cid),
      ('Railway Station', 'railway-station', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Sibi Road', 'sibi-road', cid),
      ('Sohbatpur', 'sohbatpur', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- faisalabad (3 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'faisalabad';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('D Ground', 'faisalabad-d-ground', cid),
      ('Jaranwala Road', 'faisalabad-jaranwala-road', cid),
      ('Satiana Road', 'faisalabad-satiana-road', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- ghotki (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'ghotki';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Adilpur', 'adilpur', cid),
      ('Begum Colony', 'begum-colony', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Daharki', 'daharki', cid),
      ('Dharampur', 'dharampur', cid),
      ('Jarwar', 'jarwar', cid),
      ('Kacha Area', 'kacha-area', cid),
      ('Khan Muhammad Colony', 'khan-muhammad-colony', cid),
      ('Khangarh', 'khangarh', cid),
      ('Mirpur Mathelo', 'mirpur-mathelo', cid),
      ('Mohalla Brahman', 'mohalla-brahman', cid),
      ('National Highway', 'national-highway', cid),
      ('New Ghotki', 'new-ghotki', cid),
      ('Old Ghotki', 'old-ghotki', cid),
      ('Railway Station', 'railway-station', cid),
      ('Rojhan Jamali', 'rojhan-jamali', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Sangi', 'sangi', cid),
      ('Sukkur Road', 'sukkur-road', cid),
      ('Ubauro', 'ubauro', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- gilgit (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'gilgit';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Airport Road', 'airport-road', cid),
      ('Amphri', 'amphri', cid),
      ('Bank Road', 'bank-road', cid),
      ('Barmas', 'barmas', cid),
      ('Baseen', 'baseen', cid),
      ('City Area', 'city-area', cid),
      ('Danyor', 'danyor', cid),
      ('Faizabad', 'faizabad', cid),
      ('Jinnah Road', 'jinnah-road', cid),
      ('Jutial', 'jutial', cid),
      ('Kashrote', 'kashrote', cid),
      ('KKH', 'kkh', cid),
      ('Konodas', 'konodas', cid),
      ('Old Town', 'old-town', cid),
      ('Oshikandass', 'oshikandass', cid),
      ('Rahimabad', 'rahimabad', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Serena Road', 'serena-road', cid),
      ('Shahrah-e-Quaid-e-Azam', 'shahrah-e-quaid-e-azam', cid),
      ('Sultanabad', 'sultanabad', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- gujranwala (2 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'gujranwala';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Cantt', 'gujranwala-cantt', cid),
      ('Model Town', 'gujranwala-model-town', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- gujrat (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'gujrat';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Civil Lines', 'civil-lines', cid),
      ('Dinga', 'dinga', cid),
      ('Gondal Road', 'gondal-road', cid),
      ('GT Road', 'gt-road', cid),
      ('Haji Pura', 'haji-pura', cid),
      ('Jalalpur Jattan', 'jalalpur-jattan', cid),
      ('Karian Cantt', 'karian-cantt', cid),
      ('Kharian', 'kharian', cid),
      ('Kotla Arab Ali Khan', 'kotla-arab-ali-khan', cid),
      ('Kunjah', 'kunjah', cid),
      ('Lalamusa', 'lalamusa', cid),
      ('Main Bazaar', 'main-bazaar', cid),
      ('Mandi Bahauddin Road', 'mandi-bahauddin-road', cid),
      ('Model Town', 'model-town', cid),
      ('Nizamabad Colony', 'nizamabad-colony', cid),
      ('Rahwali Cantt', 'rahwali-cantt', cid),
      ('Railway Road', 'railway-road', cid),
      ('Saddar', 'saddar', cid),
      ('Sara-e-Alamgir', 'sara-e-alamgir', cid),
      ('Satellite Town', 'satellite-town', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- gwadar (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'gwadar';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Airport Area', 'airport-area', cid),
      ('Coastal Highway', 'coastal-highway', cid),
      ('CPEC Area', 'cpec-area', cid),
      ('East Bay', 'east-bay', cid),
      ('Fish Harbor', 'fish-harbor', cid),
      ('Free Zone Area', 'free-zone-area', cid),
      ('GDA', 'gda', cid),
      ('Gwadar Port Area', 'gwadar-port-area', cid),
      ('Makran Coastal Highway', 'makran-coastal-highway', cid),
      ('Marine Drive', 'marine-drive', cid),
      ('Naval Base Area', 'naval-base-area', cid),
      ('New Town', 'new-town', cid),
      ('Old Town', 'old-town', cid),
      ('Pishukan', 'pishukan', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Sangar Housing', 'sangar-housing', cid),
      ('Shadi Kaur', 'shadi-kaur', cid),
      ('Sur Bandar', 'sur-bandar', cid),
      ('Surbandan', 'surbandan', cid),
      ('West Bay', 'west-bay', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- hafizabad (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'hafizabad';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Ahmad Nagar', 'ahmad-nagar', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Dholan Wala', 'dholan-wala', cid),
      ('Faisalabad Road', 'faisalabad-road', cid),
      ('GT Road', 'gt-road', cid),
      ('Gujranwala Road', 'gujranwala-road', cid),
      ('Jajja Abadi', 'jajja-abadi', cid),
      ('Jalalpur Bhattian', 'jalalpur-bhattian', cid),
      ('Kaleke Mandi', 'kaleke-mandi', cid),
      ('Kot Nakka', 'kot-nakka', cid),
      ('Kot Sultan', 'kot-sultan', cid),
      ('Model Town', 'model-town', cid),
      ('Pindi Bhattian', 'pindi-bhattian', cid),
      ('Railway Road', 'railway-road', cid),
      ('Rasool Nagar', 'rasool-nagar', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Satellite Town', 'satellite-town', cid),
      ('Shah Bagh Colony', 'shah-bagh-colony', cid),
      ('Sukheke Mandi', 'sukheke-mandi', cid),
      ('Vanike Tarar', 'vanike-tarar', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- hangu (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'hangu';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Baggan', 'baggan', cid),
      ('Cantt Area', 'cantt-area', cid),
      ('City Area', 'city-area', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Darsamand', 'darsamand', cid),
      ('Doaba', 'doaba', cid),
      ('Ghiljo', 'ghiljo', cid),
      ('Hospital Road', 'hospital-road', cid),
      ('Ibrahimzai', 'ibrahimzai', cid),
      ('Kohat Road', 'kohat-road', cid),
      ('Main Bazaar', 'main-bazaar', cid),
      ('Mohammad Khel', 'mohammad-khel', cid),
      ('Raisan', 'raisan', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Shahu Khel', 'shahu-khel', cid),
      ('Tall', 'tall', cid),
      ('Thall Road', 'thall-road', cid),
      ('Torawari', 'torawari', cid),
      ('Usterzai', 'usterzai', cid),
      ('Zargari', 'zargari', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- hub (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'hub';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Bela', 'bela', cid),
      ('Cantt Area', 'cantt-area', cid),
      ('Gadani', 'gadani', cid),
      ('Hub Chowki', 'hub-chowki', cid),
      ('Hub City', 'hub-city', cid),
      ('Hub Dam Area', 'hub-dam-area', cid),
      ('Industrial Area', 'industrial-area', cid),
      ('Karachi Road', 'karachi-road', cid),
      ('Lakhra', 'lakhra', cid),
      ('Lasbela', 'lasbela', cid),
      ('New Hub', 'new-hub', cid),
      ('Old Hub', 'old-hub', cid),
      ('Quetta Road', 'quetta-road', cid),
      ('RCD Highway', 'rcd-highway', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('SITE Area', 'site-area', cid),
      ('Sonmiani', 'sonmiani', cid),
      ('Uthal', 'uthal', cid),
      ('Winder', 'winder', cid),
      ('Zero Point', 'zero-point', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- hunza (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'hunza';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Aliabad', 'aliabad', cid),
      ('Altit', 'altit', cid),
      ('Baltit', 'baltit', cid),
      ('Central Hunza', 'central-hunza', cid),
      ('Ganish', 'ganish', cid),
      ('Ghulkin', 'ghulkin', cid),
      ('Gojal', 'gojal', cid),
      ('Gulmit', 'gulmit', cid),
      ('Hopar', 'hopar', cid),
      ('Hussaini', 'hussaini', cid),
      ('Hyderabad', 'hyderabad', cid),
      ('Karimabad', 'karimabad', cid),
      ('KKH', 'kkh', cid),
      ('Minapin', 'minapin', cid),
      ('Murtazaabad', 'murtazaabad', cid),
      ('Nagar Valley', 'nagar-valley', cid),
      ('Passu', 'passu', cid),
      ('Shishkat', 'shishkat', cid),
      ('Sost', 'sost', cid),
      ('Upper Hunza', 'upper-hunza', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- hyderabad (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'hyderabad';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Auto Bhan Road', 'auto-bhan-road', cid),
      ('Bhitai Nagar', 'bhitai-nagar', cid),
      ('Cantonment', 'cantonment', cid),
      ('Gulistan-e-Sarmast', 'gulistan-e-sarmast', cid),
      ('Hali Road', 'hali-road', cid),
      ('Hirabad', 'hirabad', cid),
      ('Hussainabad', 'hussainabad', cid),
      ('Hyder Chowk', 'hyder-chowk', cid),
      ('Jamshoro Road', 'jamshoro-road', cid),
      ('Kohsar', 'kohsar', cid),
      ('Latifabad', 'latifabad', cid),
      ('Market', 'market', cid),
      ('Pinyari', 'pinyari', cid),
      ('Qasimabad', 'qasimabad', cid),
      ('Risala Road', 'risala-road', cid),
      ('Saddar', 'saddar', cid),
      ('Tando Jam', 'tando-jam', cid),
      ('Tando Yousuf', 'tando-yousuf', cid),
      ('Thandi Sarak', 'thandi-sarak', cid),
      ('Unit No. 1-12', 'unit-no-1-12', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- islamabad (7 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'islamabad';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Blue Area', 'islamabad-blue-area', cid),
      ('DHA Phase 2', 'islamabad-dha-phase-2', cid),
      ('E-11', 'islamabad-e-11', cid),
      ('F-7', 'islamabad-f-7', cid),
      ('F-8', 'islamabad-f-8', cid),
      ('G-11', 'islamabad-g-11', cid),
      ('I-8', 'islamabad-i-8', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- jacobabad (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'jacobabad';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Aqil Shah Colony', 'aqil-shah-colony', cid),
      ('City Area', 'city-area', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Dera Allah Yar', 'dera-allah-yar', cid),
      ('Garhi Khairo', 'garhi-khairo', cid),
      ('Garhi Yasin', 'garhi-yasin', cid),
      ('Hospital Road', 'hospital-road', cid),
      ('Jinnah Colony', 'jinnah-colony', cid),
      ('Kandhkot', 'kandhkot', cid),
      ('Kashmore', 'kashmore', cid),
      ('Medical Road', 'medical-road', cid),
      ('Miro Khan', 'miro-khan', cid),
      ('Muslim Colony', 'muslim-colony', cid),
      ('Quetta Road', 'quetta-road', cid),
      ('Railway Station Area', 'railway-station-area', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Shah Belo Colony', 'shah-belo-colony', cid),
      ('Shikarpur Road', 'shikarpur-road', cid),
      ('Tangwani', 'tangwani', cid),
      ('Thul', 'thul', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- jhang (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'jhang';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Ahmad Nagar', 'ahmad-nagar', cid),
      ('Ahmad Pur Sial', 'ahmad-pur-sial', cid),
      ('Athara Hazari', 'athara-hazari', cid),
      ('Chiniot Road', 'chiniot-road', cid),
      ('Chund Bharwana', 'chund-bharwana', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Faisalabad Road', 'faisalabad-road', cid),
      ('Garh Maharaja', 'garh-maharaja', cid),
      ('Ghulam Muhammad Abad', 'ghulam-muhammad-abad', cid),
      ('Gojra Road', 'gojra-road', cid),
      ('Khewat', 'khewat', cid),
      ('Kot Isa Shah', 'kot-isa-shah', cid),
      ('Kot Samaba', 'kot-samaba', cid),
      ('Malka Hans', 'malka-hans', cid),
      ('Model Town', 'model-town', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Satellite Town', 'satellite-town', cid),
      ('Shah Jewna', 'shah-jewna', cid),
      ('Shorkot', 'shorkot', cid),
      ('Trimmu', 'trimmu', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- jhelum (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'jhelum';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Chak Jamal', 'chak-jamal', cid),
      ('Chakwal Road', 'chakwal-road', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Dina', 'dina', cid),
      ('Domeli', 'domeli', cid),
      ('GT Road', 'gt-road', cid),
      ('Jalalpur Sharif', 'jalalpur-sharif', cid),
      ('Khewra', 'khewra', cid),
      ('Lilla', 'lilla', cid),
      ('Mandi Bahauddin Road', 'mandi-bahauddin-road', cid),
      ('Mangla', 'mangla', cid),
      ('Model Town', 'model-town', cid),
      ('Pind Dadan Khan', 'pind-dadan-khan', cid),
      ('Puran', 'puran', cid),
      ('Rasul', 'rasul', cid),
      ('Rohtas Road', 'rohtas-road', cid),
      ('Saddar', 'saddar', cid),
      ('Sarai Alamgir', 'sarai-alamgir', cid),
      ('Satellite Town', 'satellite-town', cid),
      ('Sohawa', 'sohawa', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- kamoke (15 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'kamoke';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Chak No. 27/DNB', 'chak-no-27dnb', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Daska Road', 'daska-road', cid),
      ('Eminabad Road', 'eminabad-road', cid),
      ('GT Road', 'gt-road', cid),
      ('Gujranwala Road', 'gujranwala-road', cid),
      ('Jandiala Road', 'jandiala-road', cid),
      ('Lahore Road', 'lahore-road', cid),
      ('Model Town', 'model-town', cid),
      ('Mohalla Kot Pindi', 'mohalla-kot-pindi', cid),
      ('Mohalla Shah Alam', 'mohalla-shah-alam', cid),
      ('Muridke Road', 'muridke-road', cid),
      ('Railway Road', 'railway-road', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Satellite Town', 'satellite-town', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- karachi (48 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'karachi';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Bahadurabad', 'bahadurabad', cid),
      ('Bahria Town', 'bahria-town', cid),
      ('Baldia Town', 'baldia-town', cid),
      ('Bin Qasim', 'bin-qasim', cid),
      ('Burns Road', 'burns-road', cid),
      ('Clifton', 'clifton', cid),
      ('Clifton', 'karachi-clifton', cid),
      ('Defence', 'karachi-defence', cid),
      ('Defence (DHA)', 'defence-dha', cid),
      ('DHA', 'karachi-dha', cid),
      ('FB Area', 'fb-area', cid),
      ('Gadap Town', 'gadap-town', cid),
      ('Garden', 'garden', cid),
      ('Gulberg', 'gulberg', cid),
      ('Gulistan-e-Jauhar', 'gulistan-e-jauhar', cid),
      ('Gulistan-e-Johar', 'karachi-gulistan-e-johar', cid),
      ('Gulshan-e-Iqbal', 'karachi-gulshan-e-iqbal', cid),
      ('Gulshan-e-Iqbal', 'gulshan-e-iqbal', cid),
      ('Hawksbay', 'hawksbay', cid),
      ('II Chundrigar Road', 'ii-chundrigar-road', cid),
      ('Jamshed Quarters', 'jamshed-quarters', cid),
      ('Jamsheed Town', 'jamsheed-town', cid),
      ('Jodia Bazaar', 'jodia-bazaar', cid),
      ('Keamari', 'keamari', cid),
      ('Kemari', 'kemari', cid),
      ('Kharadar', 'kharadar', cid),
      ('Korangi', 'korangi', cid),
      ('Landhi', 'landhi', cid),
      ('Liaquatabad', 'liaquatabad', cid),
      ('Liaquatabad Town', 'karachi-liaquatabad-town', cid),
      ('Lyari', 'lyari', cid),
      ('Mahmoodabad', 'mahmoodabad', cid),
      ('Malir', 'malir', cid),
      ('Malir', 'karachi-malir', cid),
      ('Maripur', 'maripur', cid),
      ('Nazimabad', 'nazimabad', cid),
      ('New Karachi', 'new-karachi', cid),
      ('North Karachi', 'north-karachi', cid),
      ('North Nazimabad', 'north-nazimabad', cid),
      ('Orangi Town', 'orangi-town', cid),
      ('PECHS', 'karachi-pechs', cid),
      ('PECHS', 'pechs', cid),
      ('Saddar', 'saddar', cid),
      ('Scheme 33', 'scheme-33', cid),
      ('Shah Faisal Colony', 'shah-faisal-colony', cid),
      ('Surjani Town', 'surjani-town', cid),
      ('Taiser Town', 'taiser-town', cid),
      ('Tariq Road', 'tariq-road', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- karak (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'karak';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Amberi', 'amberi', cid),
      ('Bahadar Khel', 'bahadar-khel', cid),
      ('Banda Daud Shah', 'banda-daud-shah', cid),
      ('Bannu Road', 'bannu-road', cid),
      ('City Area', 'city-area', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Gurguri', 'gurguri', cid),
      ('Hospital Road', 'hospital-road', cid),
      ('Ismail Khel', 'ismail-khel', cid),
      ('Khurram', 'khurram', cid),
      ('Kohat Road', 'kohat-road', cid),
      ('Latamber', 'latamber', cid),
      ('Main Bazaar', 'main-bazaar', cid),
      ('Sabirabad', 'sabirabad', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Serai Naurang', 'serai-naurang', cid),
      ('Shakardara', 'shakardara', cid),
      ('Takht-e-Nasrati', 'takht-e-nasrati', cid),
      ('Terri', 'terri', cid),
      ('Zambar', 'zambar', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- kasur (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'kasur';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Bhai Pheru', 'bhai-pheru', cid),
      ('Chunian', 'chunian', cid),
      ('Ellahabad', 'ellahabad', cid),
      ('Ferozpur Road', 'ferozpur-road', cid),
      ('GT Road', 'gt-road', cid),
      ('Habibabad', 'habibabad', cid),
      ('Kanganpur', 'kanganpur', cid),
      ('Khas Bazaar', 'khas-bazaar', cid),
      ('Khudian', 'khudian', cid),
      ('Kot Radha Kishan', 'kot-radha-kishan', cid),
      ('Manga Mandi', 'manga-mandi', cid),
      ('Model Town', 'model-town', cid),
      ('Mustafabad', 'mustafabad', cid),
      ('Pattoki', 'pattoki', cid),
      ('Phool Nagar', 'phool-nagar', cid),
      ('Railway Road', 'railway-road', cid),
      ('Raiwind', 'raiwind', cid),
      ('Raja Jang', 'raja-jang', cid),
      ('Saddar', 'saddar', cid),
      ('Talwandi', 'talwandi', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- khairpur (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'khairpur';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Civil Lines', 'civil-lines', cid),
      ('Faiz Ganj', 'faiz-ganj', cid),
      ('Gambat', 'gambat', cid),
      ('Hyderabad Road', 'hyderabad-road', cid),
      ('Jinnah Road', 'jinnah-road', cid),
      ('Kingri', 'kingri', cid),
      ('Kot Diji', 'kot-diji', cid),
      ('Medical Road', 'medical-road', cid),
      ('Mehran', 'mehran', cid),
      ('Mir Wah', 'mir-wah', cid),
      ('Nara', 'nara', cid),
      ('Pir Jo Goth', 'pir-jo-goth', cid),
      ('Railway Station', 'railway-station', cid),
      ('Ranipur', 'ranipur', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Secretariat Road', 'secretariat-road', cid),
      ('Sobho Dero', 'sobho-dero', cid),
      ('Sukkur Road', 'sukkur-road', cid),
      ('Thari Mirwah', 'thari-mirwah', cid),
      ('Theri', 'theri', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- khanewal (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'khanewal';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Abdul Hakeem', 'abdul-hakeem', cid),
      ('Chak 88/10-R', 'chak-8810-r', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Jahanian', 'jahanian', cid),
      ('Kabirwala', 'kabirwala', cid),
      ('Kutchery Road', 'kutchery-road', cid),
      ('Makhdoom Rasheed', 'makhdoom-rasheed', cid),
      ('Mian Channu', 'mian-channu', cid),
      ('Model Town', 'model-town', cid),
      ('Multan Road', 'multan-road', cid),
      ('Pull Rango', 'pull-rango', cid),
      ('Railway Colony', 'railway-colony', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Sardar Garhi', 'sardar-garhi', cid),
      ('Sardarpur', 'sardarpur', cid),
      ('Satellite Town', 'satellite-town', cid),
      ('Shamkot', 'shamkot', cid),
      ('Thatta Sadiqabad', 'thatta-sadiqabad', cid),
      ('Tulamba', 'tulamba', cid),
      ('Vehari Road', 'vehari-road', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- khushab (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'khushab';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Bhaun', 'bhaun', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Dandot', 'dandot', cid),
      ('Hadali', 'hadali', cid),
      ('Jauharabad', 'jauharabad', cid),
      ('Jauharabad Road', 'jauharabad-road', cid),
      ('Jhelum Road', 'jhelum-road', cid),
      ('Kanhati Garden', 'kanhati-garden', cid),
      ('Mianwali Road', 'mianwali-road', cid),
      ('Mitha Tiwana', 'mitha-tiwana', cid),
      ('Model Town', 'model-town', cid),
      ('Naushera', 'naushera', cid),
      ('Naushera Road', 'naushera-road', cid),
      ('Noorpur Thal', 'noorpur-thal', cid),
      ('Nurpur', 'nurpur', cid),
      ('Quaidabad', 'quaidabad', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Sargodha Road', 'sargodha-road', cid),
      ('Satellite Town', 'satellite-town', cid),
      ('Shaheenabad', 'shaheenabad', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- khuzdar (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'khuzdar';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Aranji', 'aranji', cid),
      ('Baghbana', 'baghbana', cid),
      ('City Area', 'city-area', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Gresha', 'gresha', cid),
      ('Hospital Road', 'hospital-road', cid),
      ('Kalat Road', 'kalat-road', cid),
      ('Karachi Road', 'karachi-road', cid),
      ('Karak', 'karak', cid),
      ('Khuzdar City', 'khuzdar-city', cid),
      ('Main Bazaar', 'main-bazaar', cid),
      ('Moola', 'moola', cid),
      ('Nal', 'nal', cid),
      ('Nall', 'nall', cid),
      ('Ornach', 'ornach', cid),
      ('Quetta Road', 'quetta-road', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Surab Road', 'surab-road', cid),
      ('Wadh', 'wadh', cid),
      ('Zehri', 'zehri', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- kohat (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'kohat';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Bannu Road', 'bannu-road', cid),
      ('Cantt Area', 'cantt-area', cid),
      ('City Area', 'city-area', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Darra Adam Khel', 'darra-adam-khel', cid),
      ('Gumbat', 'gumbat', cid),
      ('Hangu Road', 'hangu-road', cid),
      ('Industrial Area', 'industrial-area', cid),
      ('Jangal Khel', 'jangal-khel', cid),
      ('Jarma', 'jarma', cid),
      ('KDA', 'kda', cid),
      ('Lachi', 'lachi', cid),
      ('Muhammad Khel', 'muhammad-khel', cid),
      ('Old City', 'old-city', cid),
      ('Peshawar Road', 'peshawar-road', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Shakardara', 'shakardara', cid),
      ('Tira', 'tira', cid),
      ('Togh Sarai', 'togh-sarai', cid),
      ('Usterzai', 'usterzai', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- lahore (502 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'lahore';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Ahmed Block', 'ahmed-block', cid),
      ('Ahmed Block', 'lahore-ahmed-block', cid),
      ('Aibak Block', 'aibak-block', cid),
      ('Aibak Block', 'lahore-aibak-block', cid),
      ('Airline Society', 'airline-society', cid),
      ('Airline Society', 'lahore-airline-society', cid),
      ('Airport Road', 'airport-road', cid),
      ('Airport Road', 'lahore-airport-road', cid),
      ('Ali Block', 'ali-block', cid),
      ('Ali Block', 'lahore-ali-block', cid),
      ('Ali Park', 'ali-park', cid),
      ('Ali Park', 'lahore-ali-park', cid),
      ('Allama Iqbal Medical College', 'allama-iqbal-medical-college', cid),
      ('Allama Iqbal Medical College', 'lahore-allama-iqbal-medical-college', cid),
      ('Allama Iqbal Town', 'allama-iqbal-town', cid),
      ('Allama Iqbal Town', 'lahore-allama-iqbal-town', cid),
      ('Alpha Co Operative', 'lahore-alpha-co-operative', cid),
      ('Alpha Co Operative', 'alpha-co-operative', cid),
      ('Amin Park', 'amin-park', cid),
      ('Amin Park', 'lahore-amin-park', cid),
      ('Anar Kali', 'lahore-anar-kali', cid),
      ('Anar Kali', 'anar-kali', cid),
      ('Architects Engineers Society', 'lahore-architects-engineers-society', cid),
      ('Architects Engineers Society', 'architects-engineers-society', cid),
      ('Army Housing Society', 'lahore-army-housing-society', cid),
      ('Army Housing Society', 'army-housing-society', cid),
      ('Asif Block', 'lahore-asif-block', cid),
      ('Asif Block', 'asif-block', cid),
      ('Askari Colony', 'askari-colony', cid),
      ('Askari Colony', 'lahore-askari-colony', cid),
      ('Askrai Villa', 'lahore-askrai-villa', cid),
      ('Askrai Villa', 'askrai-villa', cid),
      ('Atta Turk Block', 'atta-turk-block', cid),
      ('Atta Turk Block', 'lahore-atta-turk-block', cid),
      ('Aurangzeb Block', 'aurangzeb-block', cid),
      ('Aurangzeb Block', 'lahore-aurangzeb-block', cid),
      ('Awan Market', 'awan-market', cid),
      ('Awan Market', 'lahore-awan-market', cid),
      ('Awan Town', 'lahore-awan-town', cid),
      ('Awan Town', 'awan-town', cid),
      ('Baba Farid Colony', 'baba-farid-colony', cid),
      ('Baba Farid Colony', 'lahore-baba-farid-colony', cid),
      ('Babar Block', 'babar-block', cid),
      ('Babar Block', 'lahore-babar-block', cid),
      ('Badami Bagh', 'lahore-badami-bagh', cid),
      ('Badami Bagh', 'badami-bagh', cid),
      ('Badar Block', 'lahore-badar-block', cid),
      ('Badar Block', 'badar-block', cid),
      ('Baghban Pura', 'lahore-baghban-pura', cid),
      ('Baghban Pura', 'baghban-pura', cid),
      ('Bagrian', 'lahore-bagrian', cid),
      ('Bagrian', 'bagrian', cid),
      ('Bahria Town', 'bahria-town', cid),
      ('Bahria Town', 'lahore-bahria-town', cid),
      ('Band Road', 'band-road', cid),
      ('Band Road', 'lahore-band-road', cid),
      ('Barki Road', 'barki-road', cid),
      ('Barki Road', 'lahore-barki-road', cid),
      ('Bedian Road', 'lahore-bedian-road', cid),
      ('Bedian Road', 'bedian-road', cid),
      ('Bibi Pak Daman', 'lahore-bibi-pak-daman', cid),
      ('Bibi Pak Daman', 'bibi-pak-daman', cid),
      ('Bilal Gang', 'bilal-gang', cid),
      ('Bilal Gang', 'lahore-bilal-gang', cid),
      ('Bilal Park', 'bilal-park', cid),
      ('Bilal Park', 'lahore-bilal-park', cid),
      ('Blue World City', 'lahore-blue-world-city', cid),
      ('Blue World City', 'blue-world-city', cid),
      ('Bostan Colony', 'lahore-bostan-colony', cid),
      ('Bostan Colony', 'bostan-colony', cid),
      ('Bridge Colony', 'lahore-bridge-colony', cid),
      ('Bridge Colony', 'bridge-colony', cid),
      ('Burj Colony', 'burj-colony', cid),
      ('Burj Colony', 'lahore-burj-colony', cid),
      ('C.M.A. Colony', 'cma-colony', cid),
      ('C.M.A. Colony', 'lahore-c.m.a.-colony', cid),
      ('Canal Bank', 'lahore-canal-bank', cid),
      ('Canal Bank', 'canal-bank', cid),
      ('Canal Breeze', 'canal-breeze', cid),
      ('Canal Breeze', 'lahore-canal-breeze', cid),
      ('Canal Garden', 'lahore-canal-garden', cid),
      ('Canal Garden', 'canal-garden', cid),
      ('Canal Park Society', 'lahore-canal-park-society', cid),
      ('Canal Park Society', 'canal-park-society', cid),
      ('Canal Road', 'canal-road', cid),
      ('Canal Road', 'lahore-canal-road', cid),
      ('Canal View Colony', 'canal-view-colony', cid),
      ('Canal View Colony', 'lahore-canal-view-colony', cid),
      ('Cantt', 'lahore-cantt', cid),
      ('Cantt', 'cantt', cid),
      ('Cavalry Ground', 'cavalry-ground', cid),
      ('Cavalry Ground', 'lahore-cavalry-ground', cid),
      ('Chachowali', 'chachowali', cid),
      ('Chachowali', 'lahore-chachowali', cid),
      ('Chararrd Village', 'lahore-chararrd-village', cid),
      ('Chararrd Village', 'chararrd-village', cid),
      ('Chenab Block', 'chenab-block', cid),
      ('Chenab Block', 'lahore-chenab-block', cid),
      ('Chungi Amer Sadhu', 'lahore-chungi-amer-sadhu', cid),
      ('Chungi Amer Sadhu', 'chungi-amer-sadhu', cid),
      ('Civic Center', 'civic-center', cid),
      ('Civic Center', 'lahore-civic-center', cid),
      ('College Block', 'college-block', cid),
      ('College Block', 'lahore-college-block', cid),
      ('D.H.A.', 'dha', cid),
      ('D.H.A.', 'lahore-d.h.a.', cid),
      ('Darbar Gurreh Shah', 'lahore-darbar-gurreh-shah', cid),
      ('Darbar Gurreh Shah', 'darbar-gurreh-shah', cid),
      ('Darbar Pir Makki', 'lahore-darbar-pir-makki', cid),
      ('Darbar Pir Makki', 'darbar-pir-makki', cid),
      ('Daroghawala', 'lahore-daroghawala', cid),
      ('Daroghawala', 'daroghawala', cid),
      ('Data Nagar', 'lahore-data-nagar', cid),
      ('Data Nagar', 'data-nagar', cid),
      ('Davis Road', 'davis-road', cid),
      ('Davis Road', 'lahore-davis-road', cid),
      ('Defense', 'lahore-defense', cid),
      ('Defense', 'defense', cid),
      ('Dha Phase 2', 'dha-phase-2', cid),
      ('DHA Phase 5', 'lahore-dha-phase-5', cid),
      ('Dharampura', 'dharampura', cid),
      ('Dharampura', 'lahore-dharampura', cid),
      ('Doctors Society', 'lahore-doctors-society', cid),
      ('Doctors Society', 'doctors-society', cid),
      ('Eden Avenue', 'eden-avenue', cid),
      ('Eden Avenue', 'lahore-eden-avenue', cid),
      ('Eden Canal Villas', 'eden-canal-villas', cid),
      ('Eden Canal Villas', 'lahore-eden-canal-villas', cid),
      ('Eden Homes', 'eden-homes', cid),
      ('Eden Homes', 'lahore-eden-homes', cid),
      ('Eden View', 'lahore-eden-view', cid),
      ('Eden View', 'eden-view', cid),
      ('Education Town', 'lahore-education-town', cid),
      ('Education Town', 'education-town', cid),
      ('EME DHA Society', 'eme-dha-society', cid),
      ('EME DHA Society', 'lahore-eme-dha-society', cid),
      ('Engineer Cooperative Society', 'engineer-cooperative-society', cid),
      ('Engineer Cooperative Society', 'lahore-engineer-cooperative-society', cid),
      ('F.C. College', 'lahore-f.c.-college', cid),
      ('F.C. College', 'fc-college', cid),
      ('Faisal Park', 'lahore-faisal-park', cid),
      ('Faisal Park', 'faisal-park', cid),
      ('Faisal Town', 'lahore-faisal-town', cid),
      ('Faisal Town', 'faisal-town', cid),
      ('Falcon Complex', 'lahore-falcon-complex', cid),
      ('Falcon Complex', 'falcon-complex', cid),
      ('Faruque Ganj', 'faruque-ganj', cid),
      ('Faruque Ganj', 'lahore-faruque-ganj', cid),
      ('Ferozepur Road', 'lahore-ferozepur-road', cid),
      ('Ferozpur Road', 'lahore-ferozpur-road', cid),
      ('Ferozpur Road', 'ferozpur-road', cid),
      ('Firozpur Road', 'firozpur-road', cid),
      ('Firozpur Road', 'lahore-firozpur-road', cid),
      ('Fort Villas', 'fort-villas', cid),
      ('Fort Villas', 'lahore-fort-villas', cid),
      ('Fortress Stadium', 'fortress-stadium', cid),
      ('Fortress Stadium', 'lahore-fortress-stadium', cid),
      ('Fransisi Town', 'fransisi-town', cid),
      ('Fransisi Town', 'lahore-fransisi-town', cid),
      ('G.O.R.', 'gor', cid),
      ('G.O.R.', 'lahore-g.o.r.', cid),
      ('Garden Block', 'garden-block', cid),
      ('Garden Block', 'lahore-garden-block', cid),
      ('Garden Town', 'garden-town', cid),
      ('Garden Town', 'lahore-garden-town', cid),
      ('Garhi Shahu', 'garhi-shahu', cid),
      ('Garhi Shahu', 'lahore-garhi-shahu', cid),
      ('Gawal Mandi', 'gawal-mandi', cid),
      ('Gawal Mandi', 'lahore-gawal-mandi', cid),
      ('Ghazi Road', 'lahore-ghazi-road', cid),
      ('Ghazi Road', 'ghazi-road', cid),
      ('Ghous Azan Colony', 'lahore-ghous-azan-colony', cid),
      ('Ghous Azan Colony', 'ghous-azan-colony', cid),
      ('Ghousia Colony', 'lahore-ghousia-colony', cid),
      ('Ghousia Colony', 'ghousia-colony', cid),
      ('Gohawa', 'lahore-gohawa', cid),
      ('Gohawa', 'gohawa', cid),
      ('Gopal Nagar', 'lahore-gopal-nagar', cid),
      ('Gopal Nagar', 'gopal-nagar', cid),
      ('Gor', 'lahore-gor', cid),
      ('Green Park', 'lahore-green-park', cid),
      ('Green Park', 'green-park', cid),
      ('Green Town', 'lahore-green-town', cid),
      ('Green Town', 'green-town', cid),
      ('Gulbahar Colony', 'gulbahar-colony', cid),
      ('Gulbahar Colony', 'lahore-gulbahar-colony', cid),
      ('Gulberg', 'lahore-gulberg', cid),
      ('Gulberg', 'gulberg', cid),
      ('Gulshan Block', 'lahore-gulshan-block', cid),
      ('Gulshan Block', 'gulshan-block', cid),
      ('Gulshan E Ravi', 'lahore-gulshan-e-ravi', cid),
      ('Gulshan E Ravi', 'gulshan-e-ravi', cid),
      ('Hadiara', 'lahore-hadiara', cid),
      ('Hadiara', 'hadiara', cid),
      ('Hamdard Chowk', 'lahore-hamdard-chowk', cid),
      ('Hamdard Chowk', 'hamdard-chowk', cid),
      ('Harbanspura', 'lahore-harbanspura', cid),
      ('Harbanspura', 'harbanspura', cid),
      ('Herbuns Pura', 'lahore-herbuns-pura', cid),
      ('Herbuns Pura', 'herbuns-pura', cid),
      ('Huma Block', 'lahore-huma-block', cid),
      ('Huma Block', 'huma-block', cid),
      ('Hunza Block', 'hunza-block', cid),
      ('Hunza Block', 'lahore-hunza-block', cid),
      ('Ichhra', 'ichhra', cid),
      ('Ichhra', 'lahore-ichhra', cid),
      ('Infantry Road', 'lahore-infantry-road', cid),
      ('Infantry Road', 'infantry-road', cid),
      ('Iqbal Ave Housing Society', 'lahore-iqbal-ave-housing-society', cid),
      ('Iqbal Ave Housing Society', 'iqbal-ave-housing-society', cid),
      ('Iqbal Avenue', 'lahore-iqbal-avenue', cid),
      ('Iqbal Avenue', 'iqbal-avenue', cid),
      ('Islam Pura', 'islam-pura', cid),
      ('Islam Pura', 'lahore-islam-pura', cid),
      ('Ittehad Colony', 'lahore-ittehad-colony', cid),
      ('Ittehad Colony', 'ittehad-colony', cid),
      ('Izmir Town', 'lahore-izmir-town', cid),
      ('Izmir Town', 'izmir-town', cid),
      ('J.D.A.', 'jda', cid),
      ('J.D.A.', 'lahore-j.d.a.', cid),
      ('Jail Road', 'jail-road', cid),
      ('Jail Road', 'lahore-jail-road', cid),
      ('Jehanzeb Block', 'jehanzeb-block', cid),
      ('Jehanzeb Block', 'lahore-jehanzeb-block', cid),
      ('Jinnah Hospital', 'lahore-jinnah-hospital', cid),
      ('Jinnah Hospital', 'jinnah-hospital', cid),
      ('Johar Town', 'lahore-johar-town', cid),
      ('Johar Town', 'johar-town', cid),
      ('Jubli Town', 'lahore-jubli-town', cid),
      ('Jubli Town', 'jubli-town', cid),
      ('K.B. Society', 'kb-society', cid),
      ('K.B. Society', 'lahore-k.b.-society', cid),
      ('Kainchi', 'lahore-kainchi', cid),
      ('Kainchi', 'kainchi', cid),
      ('Kamran Block', 'kamran-block', cid),
      ('Kamran Block', 'lahore-kamran-block', cid),
      ('Karim Block', 'lahore-karim-block', cid),
      ('Karim Block', 'karim-block', cid),
      ('Karim Park', 'lahore-karim-park', cid),
      ('Karim Park', 'karim-park', cid),
      ('Khayaban-e-Amin', 'lahore-khayaban-e-amin', cid),
      ('Khayaban-e-Amin', 'khayaban-e-amin', cid),
      ('Khuda Buksh Colony', 'lahore-khuda-buksh-colony', cid),
      ('Khuda Buksh Colony', 'khuda-buksh-colony', cid),
      ('Khudad Town', 'khudad-town', cid),
      ('Khudad Town', 'lahore-khudad-town', cid),
      ('Khursheed Alam Road', 'lahore-khursheed-alam-road', cid),
      ('Khursheed Alam Road', 'khursheed-alam-road', cid),
      ('Kot Lakhpat', 'kot-lakhpat', cid),
      ('Kot Lakhpat', 'lahore-kot-lakhpat', cid),
      ('L.D.A. Avenue', 'lda-avenue', cid),
      ('L.D.A. Avenue', 'lahore-l.d.a.-avenue', cid),
      ('L.D.A. Colony', 'lda-colony', cid),
      ('L.D.A. Colony', 'lahore-l.d.a.-colony', cid),
      ('Lakshmi Chowk', 'lahore-lakshmi-chowk', cid),
      ('Lakshmi Chowk', 'lakshmi-chowk', cid),
      ('Lalzar Colony', 'lalzar-colony', cid),
      ('Lalzar Colony', 'lahore-lalzar-colony', cid),
      ('Lawrence Road', 'lahore-lawrence-road', cid),
      ('Lawrence Road', 'lawrence-road', cid),
      ('Lidhar', 'lidhar', cid),
      ('Lidhar', 'lahore-lidhar', cid),
      ('LUMS', 'lahore-lums', cid),
      ('LUMS', 'lums', cid),
      ('M.M. Alam Road', 'lahore-m.m.-alam-road', cid),
      ('M.M. Alam Road', 'mm-alam-road', cid),
      ('Madina Colony', 'lahore-madina-colony', cid),
      ('Madina Colony', 'madina-colony', cid),
      ('Mahmood Booty Ring Road', 'lahore-mahmood-booty-ring-road', cid),
      ('Mahmood Booty Ring Road', 'mahmood-booty-ring-road', cid),
      ('Main Gulberg Boulevard', 'lahore-main-gulberg-boulevard', cid),
      ('Main Gulberg Boulevard', 'main-gulberg-boulevard', cid),
      ('Main Khayaban Road', 'lahore-main-khayaban-road', cid),
      ('Main Khayaban Road', 'main-khayaban-road', cid),
      ('Main Mir Colony', 'main-mir-colony', cid),
      ('Main Mir Colony', 'lahore-main-mir-colony', cid),
      ('Makkah Colony', 'lahore-makkah-colony', cid),
      ('Makkah Colony', 'makkah-colony', cid),
      ('Mamdoot Block', 'lahore-mamdoot-block', cid),
      ('Mamdoot Block', 'mamdoot-block', cid),
      ('Maraghzar Colony', 'maraghzar-colony', cid),
      ('Maraghzar Colony', 'lahore-maraghzar-colony', cid),
      ('Mayo Hospital', 'mayo-hospital', cid),
      ('Mayo Hospital', 'lahore-mayo-hospital', cid),
      ('Mazang', 'mazang', cid),
      ('Mazang', 'lahore-mazang', cid),
      ('Mehran Block', 'mehran-block', cid),
      ('Mehran Block', 'lahore-mehran-block', cid),
      ('Misri Shah', 'misri-shah', cid),
      ('Misri Shah', 'lahore-misri-shah', cid),
      ('Model Town', 'lahore-model-town', cid),
      ('Model Town', 'model-town', cid),
      ('Moon Market', 'lahore-moon-market', cid),
      ('Moon Market', 'moon-market', cid),
      ('Mughal Pura', 'lahore-mughal-pura', cid),
      ('Mughal Pura', 'mughal-pura', cid),
      ('Muhafiz Town', 'lahore-muhafiz-town', cid),
      ('Muhafiz Town', 'muhafiz-town', cid),
      ('Munir Road', 'lahore-munir-road', cid),
      ('Munir Road', 'munir-road', cid),
      ('Muslim Town', 'lahore-muslim-town', cid),
      ('Muslim Town', 'muslim-town', cid),
      ('Mustafa Bad', 'lahore-mustafa-bad', cid),
      ('Mustafa Bad', 'mustafa-bad', cid),
      ('Mustafa Park', 'mustafa-park', cid),
      ('Mustafa Park', 'lahore-mustafa-park', cid),
      ('Mustafa Town', 'lahore-mustafa-town', cid),
      ('Mustafa Town', 'mustafa-town', cid),
      ('Nabi Pura', 'lahore-nabi-pura', cid),
      ('Nabi Pura', 'nabi-pura', cid),
      ('Nargis Block', 'lahore-nargis-block', cid),
      ('Nargis Block', 'nargis-block', cid),
      ('Nasheman Colony', 'lahore-nasheman-colony', cid),
      ('Nasheman Colony', 'nasheman-colony', cid),
      ('Nasheman Iqbal Housing Scheme', 'nasheman-iqbal-housing-scheme', cid),
      ('Nasheman Iqbal Housing Scheme', 'lahore-nasheman-iqbal-housing-scheme', cid),
      ('Nespak Society', 'lahore-nespak-society', cid),
      ('Nespak Society', 'nespak-society', cid),
      ('New Garden Town', 'lahore-new-garden-town', cid),
      ('New Garden Town', 'new-garden-town', cid),
      ('New Mustafa Colony', 'new-mustafa-colony', cid),
      ('New Mustafa Colony', 'lahore-new-mustafa-colony', cid),
      ('New PAF Colony', 'new-paf-colony', cid),
      ('New PAF Colony', 'lahore-new-paf-colony', cid),
      ('Nisar Colony', 'lahore-nisar-colony', cid),
      ('Nisar Colony', 'nisar-colony', cid),
      ('Nishtar Block', 'nishtar-block', cid),
      ('Nishtar Block', 'lahore-nishtar-block', cid),
      ('Nishtar Colony', 'nishtar-colony', cid),
      ('Nishtar Colony', 'lahore-nishtar-colony', cid),
      ('Nova City', 'lahore-nova-city', cid),
      ('Nova City', 'nova-city', cid),
      ('Officers Colony', 'lahore-officers-colony', cid),
      ('Officers Colony', 'officers-colony', cid),
      ('OPF Colony', 'opf-colony', cid),
      ('OPF Colony', 'lahore-opf-colony', cid),
      ('OPF Housing Scheme', 'lahore-opf-housing-scheme', cid),
      ('OPF Housing Scheme', 'opf-housing-scheme', cid),
      ('P.A.F. Colony', 'paf-colony', cid),
      ('P.A.F. Colony', 'lahore-p.a.f.-colony', cid),
      ('P.C.S.I.R. Housing Scheme', 'pcsir-housing-scheme', cid),
      ('P.C.S.I.R. Housing Scheme', 'lahore-p.c.s.i.r.-housing-scheme', cid),
      ('P.C.S.I.R. Housing Society', 'pcsir-housing-society', cid),
      ('P.C.S.I.R. Housing Society', 'lahore-p.c.s.i.r.-housing-society', cid),
      ('P.I.A. Society', 'pia-society', cid),
      ('P.I.A. Society', 'lahore-p.i.a.-society', cid),
      ('Pak Block', 'lahore-pak-block', cid),
      ('Pak Block', 'pak-block', cid),
      ('Paragon City', 'lahore-paragon-city', cid),
      ('Paragon City', 'paragon-city', cid),
      ('Park View City', 'park-view-city', cid),
      ('Park View City', 'lahore-park-view-city', cid),
      ('PASCO Housing Society', 'pasco-housing-society', cid),
      ('PASCO Housing Society', 'lahore-pasco-housing-society', cid),
      ('Peco Road', 'peco-road', cid),
      ('Peco Road', 'lahore-peco-road', cid),
      ('Premier Energy', 'lahore-premier-energy', cid),
      ('Premier Energy', 'premier-energy', cid),
      ('Punjab Govt Employs Cooperative Society', 'lahore-punjab-govt-employs-cooperative-society', cid),
      ('Punjab Govt Employs Cooperative Society', 'punjab-govt-employs-cooperative-society', cid),
      ('Punjab Society Near DHA', 'punjab-society-near-dha', cid),
      ('Punjab Society Near DHA', 'lahore-punjab-society-near-dha', cid),
      ('Punjab University', 'lahore-punjab-university', cid),
      ('Punjab University', 'punjab-university', cid),
      ('Qila Gujar Singh', 'lahore-qila-gujar-singh', cid),
      ('Qila Gujar Singh', 'qila-gujar-singh', cid),
      ('Qila Lakshan Singh', 'lahore-qila-lakshan-singh', cid),
      ('Qila Lakshan Singh', 'qila-lakshan-singh', cid),
      ('Quaid-e-Azam Industrial Estate', 'quaid-e-azam-industrial-estate', cid),
      ('Quaid-e-Azam Industrial Estate', 'lahore-quaid-e-azam-industrial-estate', cid),
      ('R.A. Bazaar', 'ra-bazaar', cid),
      ('R.A. Bazaar', 'lahore-r.a.-bazaar', cid),
      ('Race Course Park', 'lahore-race-course-park', cid),
      ('Race Course Park', 'race-course-park', cid),
      ('Race Course Town', 'race-course-town', cid),
      ('Race Course Town', 'lahore-race-course-town', cid),
      ('Rachna Block', 'lahore-rachna-block', cid),
      ('Rachna Block', 'rachna-block', cid),
      ('Railway Housing Society', 'railway-housing-society', cid),
      ('Railway Housing Society', 'lahore-railway-housing-society', cid),
      ('Raiwind Road', 'lahore-raiwind-road', cid),
      ('Raiwind Road', 'raiwind-road', cid),
      ('Ram Garh', 'lahore-ram-garh', cid),
      ('Ram Garh', 'ram-garh', cid),
      ('Rang Mehal', 'rang-mehal', cid),
      ('Rang Mehal', 'lahore-rang-mehal', cid),
      ('Ravi Block', 'lahore-ravi-block', cid),
      ('Ravi Block', 'ravi-block', cid),
      ('Ravi Road', 'ravi-road', cid),
      ('Ravi Road', 'lahore-ravi-road', cid),
      ('Raza Block', 'lahore-raza-block', cid),
      ('Raza Block', 'raza-block', cid),
      ('Rehman Garden', 'rehman-garden', cid),
      ('Rehman Garden', 'lahore-rehman-garden', cid),
      ('Revenue Society', 'revenue-society', cid),
      ('Revenue Society', 'lahore-revenue-society', cid),
      ('Riwaz Garden', 'riwaz-garden', cid),
      ('Riwaz Garden', 'lahore-riwaz-garden', cid),
      ('S.M.C.H.S.', 'smchs', cid),
      ('S.M.C.H.S.', 'lahore-s.m.c.h.s.', cid),
      ('Saddar', 'lahore-saddar', cid),
      ('Saddar', 'saddar', cid),
      ('Saint John Park', 'saint-john-park', cid),
      ('Saint John Park', 'lahore-saint-john-park', cid),
      ('Salamatpura', 'salamatpura', cid),
      ('Salamatpura', 'lahore-salamatpura', cid),
      ('Samanabad', 'lahore-samanabad', cid),
      ('Samanabad', 'samanabad', cid),
      ('Samia Town', 'samia-town', cid),
      ('Samia Town', 'lahore-samia-town', cid),
      ('Sanat Nagar', 'sanat-nagar', cid),
      ('Sanat Nagar', 'lahore-sanat-nagar', cid),
      ('Sarshar Town', 'lahore-sarshar-town', cid),
      ('Sarshar Town', 'sarshar-town', cid),
      ('Sarwar Road', 'sarwar-road', cid),
      ('Sarwar Road', 'lahore-sarwar-road', cid),
      ('Shabir Town', 'lahore-shabir-town', cid),
      ('Shabir Town', 'shabir-town', cid),
      ('Shad Bagh', 'shad-bagh', cid),
      ('Shad Bagh', 'lahore-shad-bagh', cid),
      ('Shadman Colony', 'shadman-colony', cid),
      ('Shadman Colony', 'lahore-shadman-colony', cid),
      ('Shahtaj Colony', 'lahore-shahtaj-colony', cid),
      ('Shahtaj Colony', 'shahtaj-colony', cid),
      ('Shaikh Zayed Hospital', 'lahore-shaikh-zayed-hospital', cid),
      ('Shaikh Zayed Hospital', 'shaikh-zayed-hospital', cid),
      ('Shalimar Link Road', 'lahore-shalimar-link-road', cid),
      ('Shalimar Link Road', 'shalimar-link-road', cid),
      ('Shalimar Town', 'lahore-shalimar-town', cid),
      ('Shalimar Town', 'shalimar-town', cid),
      ('Shama Colony', 'lahore-shama-colony', cid),
      ('Shama Colony', 'shama-colony', cid),
      ('Shaukat Khanum Hospital', 'shaukat-khanum-hospital', cid),
      ('Shaukat Khanum Hospital', 'lahore-shaukat-khanum-hospital', cid),
      ('Shersha Block', 'shersha-block', cid),
      ('Shersha Block', 'lahore-shersha-block', cid),
      ('Sikandar Block', 'lahore-sikandar-block', cid),
      ('Sikandar Block', 'sikandar-block', cid),
      ('Star Town', 'star-town', cid),
      ('Star Town', 'lahore-star-town', cid),
      ('State Life Society', 'lahore-state-life-society', cid),
      ('State Life Society', 'state-life-society', cid),
      ('Sui Gas Society', 'sui-gas-society', cid),
      ('Sui Gas Society', 'lahore-sui-gas-society', cid),
      ('Sukh Chain Society', 'lahore-sukh-chain-society', cid),
      ('Sukh Chain Society', 'sukh-chain-society', cid),
      ('Super Town', 'super-town', cid),
      ('Super Town', 'lahore-super-town', cid),
      ('Sutlej Block', 'sutlej-block', cid),
      ('Sutlej Block', 'lahore-sutlej-block', cid),
      ('Tariq Block', 'lahore-tariq-block', cid),
      ('Tariq Block', 'tariq-block', cid),
      ('Tariq Garden', 'lahore-tariq-garden', cid),
      ('Tariq Garden', 'tariq-garden', cid),
      ('Tech Society', 'tech-society', cid),
      ('Tech Society', 'lahore-tech-society', cid),
      ('Temple Road', 'temple-road', cid),
      ('Temple Road', 'lahore-temple-road', cid),
      ('Thokar Niaz Baig', 'thokar-niaz-baig', cid),
      ('Thokar Niaz Baig', 'lahore-thokar-niaz-baig', cid),
      ('Tipu Block', 'tipu-block', cid),
      ('Tipu Block', 'lahore-tipu-block', cid),
      ('Tricon Valley', 'lahore-tricon-valley', cid),
      ('Tricon Valley', 'tricon-valley', cid),
      ('Tufail Road', 'lahore-tufail-road', cid),
      ('Tufail Road', 'tufail-road', cid),
      ('U.C.P.', 'ucp', cid),
      ('U.C.P.', 'lahore-u.c.p.', cid),
      ('Umer Block', 'lahore-umer-block', cid),
      ('Umer Block', 'umer-block', cid),
      ('University of Lahore', 'lahore-university-of-lahore', cid),
      ('University of Lahore', 'university-of-lahore', cid),
      ('Upper Mall Scheme', 'lahore-upper-mall-scheme', cid),
      ('Upper Mall Scheme', 'upper-mall-scheme', cid),
      ('Usman Block', 'lahore-usman-block', cid),
      ('Usman Block', 'usman-block', cid),
      ('Usman Ganj', 'usman-ganj', cid),
      ('Usman Ganj', 'lahore-usman-ganj', cid),
      ('Valencia Town', 'lahore-valencia-town', cid),
      ('Valencia Town', 'valencia-town', cid),
      ('Vision City', 'vision-city', cid),
      ('Vision City', 'lahore-vision-city', cid),
      ('Wafaqi Colony', 'lahore-wafaqi-colony', cid),
      ('Wafaqi Colony', 'wafaqi-colony', cid),
      ('Wahdat Colony', 'lahore-wahdat-colony', cid),
      ('Wahdat Colony', 'wahdat-colony', cid),
      ('Walton Road', 'lahore-walton-road', cid),
      ('Walton Road', 'walton-road', cid),
      ('Wapda Colony', 'wapda-colony', cid),
      ('Wapda Colony', 'lahore-wapda-colony', cid),
      ('Wapda House', 'lahore-wapda-house', cid),
      ('Wapda House', 'wapda-house', cid),
      ('Wapda Town', 'wapda-town', cid),
      ('Wapda Town', 'lahore-wapda-town', cid),
      ('West Wood Colony', 'west-wood-colony', cid),
      ('West Wood Colony', 'lahore-west-wood-colony', cid),
      ('Youhna Bad', 'lahore-youhna-bad', cid),
      ('Youhna Bad', 'youhna-bad', cid),
      ('Zaman Colony', 'lahore-zaman-colony', cid),
      ('Zaman Colony', 'zaman-colony', cid),
      ('Zeenat Block', 'zeenat-block', cid),
      ('Zeenat Block', 'lahore-zeenat-block', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- lakki-marwat (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'lakki-marwat';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Bannu Road', 'bannu-road', cid),
      ('Bettani', 'bettani', cid),
      ('Cantt Area', 'cantt-area', cid),
      ('City Area', 'city-area', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Darra Pezu', 'darra-pezu', cid),
      ('Gambila', 'gambila', cid),
      ('Ghazni Khel', 'ghazni-khel', cid),
      ('Hospital Road', 'hospital-road', cid),
      ('Khirgi', 'khirgi', cid),
      ('Kohat Road', 'kohat-road', cid),
      ('Main Bazaar', 'main-bazaar', cid),
      ('Naurang', 'naurang', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Sarai Naurang', 'sarai-naurang', cid),
      ('Serai Gambila', 'serai-gambila', cid),
      ('Shahbaz Khel', 'shahbaz-khel', cid),
      ('Tajazai', 'tajazai', cid),
      ('Torawari', 'torawari', cid),
      ('Wanda Sher Ghazi', 'wanda-sher-ghazi', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- larkana (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'larkana';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Akil', 'akil', cid),
      ('Arija', 'arija', cid),
      ('Bakrani', 'bakrani', cid),
      ('Bunder Road', 'bunder-road', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Dokri', 'dokri', cid),
      ('Garhi Khuda Bakhsh', 'garhi-khuda-bakhsh', cid),
      ('Jinnah Bagh', 'jinnah-bagh', cid),
      ('Kambar', 'kambar', cid),
      ('Medical Road', 'medical-road', cid),
      ('Mehar', 'mehar', cid),
      ('Naudero', 'naudero', cid),
      ('Qambar Shahdadkot', 'qambar-shahdadkot', cid),
      ('Ratodero', 'ratodero', cid),
      ('Resham Gali', 'resham-gali', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Shahdadkot', 'shahdadkot', cid),
      ('Station Road', 'station-road', cid),
      ('VIP Road', 'vip-road', cid),
      ('Warah', 'warah', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- layyah (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'layyah';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Ahmad Pur Sial', 'ahmad-pur-sial', cid),
      ('Chak Kalu', 'chak-kalu', cid),
      ('Chaubara', 'chaubara', cid),
      ('Chowk Sarwar Shaheed', 'chowk-sarwar-shaheed', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('DG Khan Road', 'dg-khan-road', cid),
      ('Fatehpur', 'fatehpur', cid),
      ('Haji Abad', 'haji-abad', cid),
      ('Jhang Road', 'jhang-road', cid),
      ('Karor Lal Esan', 'karor-lal-esan', cid),
      ('Kot Sultan', 'kot-sultan', cid),
      ('Lala Zar', 'lala-zar', cid),
      ('Model Town', 'model-town', cid),
      ('Multan Road', 'multan-road', cid),
      ('Muzaffargarh Road', 'muzaffargarh-road', cid),
      ('Old City', 'old-city', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Sardar Pur', 'sardar-pur', cid),
      ('Satellite Town', 'satellite-town', cid),
      ('Wasti Janoobi', 'wasti-janoobi', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- lodhran (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'lodhran';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Adda Machka', 'adda-machka', cid),
      ('Bahawalpur Road', 'bahawalpur-road', cid),
      ('Basti Malook', 'basti-malook', cid),
      ('Chak No. 108/ML', 'chak-no-108ml', cid),
      ('Chak No. 444/EB', 'chak-no-444eb', cid),
      ('Chowk Azam', 'chowk-azam', cid),
      ('Chowk Qureshi', 'chowk-qureshi', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Dunyapur', 'dunyapur', cid),
      ('Jalalpur Pirwala', 'jalalpur-pirwala', cid),
      ('Kahror Pacca', 'kahror-pacca', cid),
      ('Khudian', 'khudian', cid),
      ('Mian Di Hatti', 'mian-di-hatti', cid),
      ('Model Town', 'model-town', cid),
      ('Multan Road', 'multan-road', cid),
      ('Railway Road', 'railway-road', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Satellite Town', 'satellite-town', cid),
      ('Sito Gunno', 'sito-gunno', cid),
      ('Tibba Sultan Pur', 'tibba-sultan-pur', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- mandi-bahauddin (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'mandi-bahauddin';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Civil Lines', 'civil-lines', cid),
      ('GT Road', 'gt-road', cid),
      ('Gujrat Road', 'gujrat-road', cid),
      ('Hiran Minar', 'hiran-minar', cid),
      ('Kot Asadullah', 'kot-asadullah', cid),
      ('Kuthiala Sheikhan', 'kuthiala-sheikhan', cid),
      ('Lala Musa Road', 'lala-musa-road', cid),
      ('Malakwal', 'malakwal', cid),
      ('Malikwal', 'malikwal', cid),
      ('Model Town', 'model-town', cid),
      ('Mohalla Sooter', 'mohalla-sooter', cid),
      ('Pahrianwali', 'pahrianwali', cid),
      ('Phalia', 'phalia', cid),
      ('Qadirabad', 'qadirabad', cid),
      ('Railway Road', 'railway-road', cid),
      ('Rasul', 'rasul', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Satellite Town', 'satellite-town', cid),
      ('Shah Jewna', 'shah-jewna', cid),
      ('Wasu', 'wasu', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- mansehra (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'mansehra';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Abbottabad Road', 'abbottabad-road', cid),
      ('Baffa', 'baffa', cid),
      ('Balakot', 'balakot', cid),
      ('Battal', 'battal', cid),
      ('Chattar Kalas', 'chattar-kalas', cid),
      ('City Area', 'city-area', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Dhodial', 'dhodial', cid),
      ('Ghazikot', 'ghazikot', cid),
      ('Ichrian', 'ichrian', cid),
      ('Jabori', 'jabori', cid),
      ('Kaghan', 'kaghan', cid),
      ('KKH', 'kkh', cid),
      ('Naran', 'naran', cid),
      ('Oghi', 'oghi', cid),
      ('Paras', 'paras', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Sherwan', 'sherwan', cid),
      ('Shinkiari', 'shinkiari', cid),
      ('Talhata', 'talhata', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- mardan (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'mardan';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Chamkani', 'chamkani', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('GT Road', 'gt-road', cid),
      ('Gujar Ghari', 'gujar-ghari', cid),
      ('Gujjar Garhi', 'gujjar-garhi', cid),
      ('Hoti', 'hoti', cid),
      ('Jalala', 'jalala', cid),
      ('Kalu Khan', 'kalu-khan', cid),
      ('Katlang', 'katlang', cid),
      ('Lundkhwar', 'lundkhwar', cid),
      ('Manga', 'manga', cid),
      ('Mayar', 'mayar', cid),
      ('Nowshera Road', 'nowshera-road', cid),
      ('Peshawar Road', 'peshawar-road', cid),
      ('Rustam', 'rustam', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Sheikh Maltoon Town', 'sheikh-maltoon-town', cid),
      ('Shergarh', 'shergarh', cid),
      ('Swabi Road', 'swabi-road', cid),
      ('Takht Bhai', 'takht-bhai', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- mianwali (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'mianwali';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Bhakkar Road', 'bhakkar-road', cid),
      ('Chashma', 'chashma', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Darra Tang', 'darra-tang', cid),
      ('Daudkhel', 'daudkhel', cid),
      ('Gulan Khel', 'gulan-khel', cid),
      ('Isa Khel', 'isa-khel', cid),
      ('Kalabagh', 'kalabagh', cid),
      ('Kalor', 'kalor', cid),
      ('Kundian', 'kundian', cid),
      ('Mari Indus', 'mari-indus', cid),
      ('Model Town', 'model-town', cid),
      ('Musa Khel', 'musa-khel', cid),
      ('Naushehra Virkan', 'naushehra-virkan', cid),
      ('Piplan', 'piplan', cid),
      ('Rokhri', 'rokhri', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Sargodha Road', 'sargodha-road', cid),
      ('Satellite Town', 'satellite-town', cid),
      ('Wan Bachran', 'wan-bachran', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- mirpur (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'mirpur';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Allama Iqbal Road', 'allama-iqbal-road', cid),
      ('Chaksawari', 'chaksawari', cid),
      ('Chakswari', 'chakswari', cid),
      ('City Area', 'city-area', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Dadyal', 'dadyal', cid),
      ('Industrial Area', 'industrial-area', cid),
      ('Islamgarh', 'islamgarh', cid),
      ('Jatlan', 'jatlan', cid),
      ('Khari Sharif', 'khari-sharif', cid),
      ('Mall Road', 'mall-road', cid),
      ('Mangla', 'mangla', cid),
      ('Model Town', 'model-town', cid),
      ('New Mirpur City', 'new-mirpur-city', cid),
      ('Old Mirpur City', 'old-mirpur-city', cid),
      ('Pind Hashim Khan', 'pind-hashim-khan', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Satellite Town', 'satellite-town', cid),
      ('Sector E', 'sector-e', cid),
      ('Sector F', 'sector-f', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- multan (23 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'multan';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Bahawalpur Road', 'bahawalpur-road', cid),
      ('Bosan Road', 'bosan-road', cid),
      ('Bosan Road', 'multan-bosan-road', cid),
      ('Cantt', 'multan-cantt', cid),
      ('Cantt', 'cantt', cid),
      ('Chowk Kumharanwala', 'chowk-kumharanwala', cid),
      ('Chungi No. 9', 'chungi-no-9', cid),
      ('Gulgasht', 'multan-gulgasht', cid),
      ('Gulgasht Colony', 'gulgasht-colony', cid),
      ('Hussain Agahi', 'hussain-agahi', cid),
      ('Masoom Shah', 'masoom-shah', cid),
      ('MDA Chowk', 'mda-chowk', cid),
      ('Model Town', 'model-town', cid),
      ('Mumtazabad', 'mumtazabad', cid),
      ('New Multan', 'new-multan', cid),
      ('Qasim Bela', 'qasim-bela', cid),
      ('Qutabpur', 'qutabpur', cid),
      ('Shah Rukn-e-Alam', 'shah-rukn-e-alam', cid),
      ('Shah Shams', 'shah-shams', cid),
      ('Sher Shah Road', 'sher-shah-road', cid),
      ('Shershah Colony', 'shershah-colony', cid),
      ('Suraj Miani', 'suraj-miani', cid),
      ('Vehari Chowk', 'vehari-chowk', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- muzaffarabad (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'muzaffarabad';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Ambore', 'ambore', cid),
      ('Chattar Domail', 'chattar-domail', cid),
      ('Chella Bandi', 'chella-bandi', cid),
      ('Dhani Bombian', 'dhani-bombian', cid),
      ('Garhi Dopatta', 'garhi-dopatta', cid),
      ('Jhelum Valley Road', 'jhelum-valley-road', cid),
      ('Kohala', 'kohala', cid),
      ('Kundal Shahi', 'kundal-shahi', cid),
      ('Lower Chattar', 'lower-chattar', cid),
      ('Mill Market', 'mill-market', cid),
      ('Model Town', 'model-town', cid),
      ('Naluchi', 'naluchi', cid),
      ('Nojumi', 'nojumi', cid),
      ('Pattika', 'pattika', cid),
      ('Rangla', 'rangla', cid),
      ('River View', 'river-view', cid),
      ('Saddar', 'saddar', cid),
      ('Secretariat Area', 'secretariat-area', cid),
      ('Shajehan Valley', 'shajehan-valley', cid),
      ('Upper Chattar', 'upper-chattar', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- muzaffargarh (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'muzaffargarh';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Alipur', 'alipur', cid),
      ('Basti Dosa', 'basti-dosa', cid),
      ('Basti Malook', 'basti-malook', cid),
      ('Chowk Munda', 'chowk-munda', cid),
      ('Chowk Qureshi', 'chowk-qureshi', cid),
      ('Chowk Sarwar Shaheed', 'chowk-sarwar-shaheed', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('DG Khan Road', 'dg-khan-road', cid),
      ('Jatoi', 'jatoi', cid),
      ('Jhang Road', 'jhang-road', cid),
      ('Khangarh', 'khangarh', cid),
      ('Kot Addu', 'kot-addu', cid),
      ('Layyah Road', 'layyah-road', cid),
      ('Mehmood Kot', 'mehmood-kot', cid),
      ('Model Town', 'model-town', cid),
      ('Moza Kot Sultan', 'moza-kot-sultan', cid),
      ('Multan Road', 'multan-road', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Satellite Town', 'satellite-town', cid),
      ('Sitpur', 'sitpur', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- narowal (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'narowal';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Ahmad Nagar', 'ahmad-nagar', cid),
      ('Alipur Chatha', 'alipur-chatha', cid),
      ('Baddo Malhi', 'baddo-malhi', cid),
      ('Chak Amru', 'chak-amru', cid),
      ('Charwa', 'charwa', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Darman', 'darman', cid),
      ('GT Road', 'gt-road', cid),
      ('Kalaswala', 'kalaswala', cid),
      ('Kot Noor Muhammad', 'kot-noor-muhammad', cid),
      ('Kotli Loharan', 'kotli-loharan', cid),
      ('Model Town', 'model-town', cid),
      ('Noor Kot', 'noor-kot', cid),
      ('Pasrur Road', 'pasrur-road', cid),
      ('Railway Road', 'railway-road', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Satellite Town', 'satellite-town', cid),
      ('Shakargarh', 'shakargarh', cid),
      ('Sialkot Road', 'sialkot-road', cid),
      ('Zafarwal', 'zafarwal', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- nowshera (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'nowshera';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Akora Khattak', 'akora-khattak', cid),
      ('Amangarh', 'amangarh', cid),
      ('Cantt Area', 'cantt-area', cid),
      ('Cherat', 'cherat', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('GT Road', 'gt-road', cid),
      ('Hakimabad', 'hakimabad', cid),
      ('Jehangira', 'jehangira', cid),
      ('Kabul River Road', 'kabul-river-road', cid),
      ('Khairabad', 'khairabad', cid),
      ('Mardan Road', 'mardan-road', cid),
      ('New City', 'new-city', cid),
      ('Nizampur', 'nizampur', cid),
      ('Nowshera Cantt', 'nowshera-cantt', cid),
      ('Old City', 'old-city', cid),
      ('Pabbi', 'pabbi', cid),
      ('Peshawar Road', 'peshawar-road', cid),
      ('Risalpur', 'risalpur', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Taru Jabba', 'taru-jabba', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- okara (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'okara';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Basirpur', 'basirpur', cid),
      ('Cantt Area', 'cantt-area', cid),
      ('Chuchak', 'chuchak', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Depalpur', 'depalpur', cid),
      ('Dipalpur Road', 'dipalpur-road', cid),
      ('Faisalabad Road', 'faisalabad-road', cid),
      ('Gogera', 'gogera', cid),
      ('GT Road', 'gt-road', cid),
      ('Hujra Shah Muqeem', 'hujra-shah-muqeem', cid),
      ('Mandi Ahmadabad', 'mandi-ahmadabad', cid),
      ('Military Farms', 'military-farms', cid),
      ('Model Town', 'model-town', cid),
      ('Railway Colony', 'railway-colony', cid),
      ('Renala Khurd', 'renala-khurd', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Sahiwal Road', 'sahiwal-road', cid),
      ('Satellite Town', 'satellite-town', cid),
      ('Shergarh', 'shergarh', cid),
      ('The Mall', 'the-mall', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- pakpattan (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'pakpattan';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Ahmad Pur Sial', 'ahmad-pur-sial', cid),
      ('Arifwala', 'arifwala', cid),
      ('Bazar Bagh Langah', 'bazar-bagh-langah', cid),
      ('Bazar Sheikh Farid', 'bazar-sheikh-farid', cid),
      ('Burewala Road', 'burewala-road', cid),
      ('Chak Kamal', 'chak-kamal', cid),
      ('Chak No. 37/EB', 'chak-no-37eb', cid),
      ('Chak No. 72/EB', 'chak-no-72eb', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Galla Mandi', 'galla-mandi', cid),
      ('Haveli Lakha', 'haveli-lakha', cid),
      ('Kalaswala', 'kalaswala', cid),
      ('Malka Hans', 'malka-hans', cid),
      ('Model Town', 'model-town', cid),
      ('Okara Road', 'okara-road', cid),
      ('Qasba Gujrat', 'qasba-gujrat', cid),
      ('Railway Road', 'railway-road', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Sahiwal Road', 'sahiwal-road', cid),
      ('Satellite Town', 'satellite-town', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- panjgur (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'panjgur';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Bonistan', 'bonistan', cid),
      ('Chitkan', 'chitkan', cid),
      ('City Area', 'city-area', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Gichk', 'gichk', cid),
      ('Gowargo', 'gowargo', cid),
      ('Gresha', 'gresha', cid),
      ('Hospital Road', 'hospital-road', cid),
      ('Khudabadan', 'khudabadan', cid),
      ('Main Bazaar', 'main-bazaar', cid),
      ('Nag', 'nag', cid),
      ('New Town', 'new-town', cid),
      ('Old Town', 'old-town', cid),
      ('Parom', 'parom', cid),
      ('Quetta Road', 'quetta-road', cid),
      ('Rakhshan Valley', 'rakhshan-valley', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Shorawd', 'shorawd', cid),
      ('Turbat Road', 'turbat-road', cid),
      ('Washbood', 'washbood', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- peshawar (28 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'peshawar';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Abdara Road', 'abdara-road', cid),
      ('Bara', 'bara', cid),
      ('Board', 'board', cid),
      ('Cantt', 'peshawar-cantt', cid),
      ('Cantt', 'cantt', cid),
      ('Chowk Yadgar', 'chowk-yadgar', cid),
      ('Dalazak Road', 'dalazak-road', cid),
      ('GT Road', 'gt-road', cid),
      ('Gulbahar', 'gulbahar', cid),
      ('Hayatabad', 'hayatabad', cid),
      ('Hayatabad', 'peshawar-hayatabad', cid),
      ('Jamrud', 'jamrud', cid),
      ('Karkhano Market', 'karkhano-market', cid),
      ('Khyber Road', 'khyber-road', cid),
      ('Kohat Road', 'kohat-road', cid),
      ('Namak Mandi', 'namak-mandi', cid),
      ('Old City', 'old-city', cid),
      ('Pajagi', 'pajagi', cid),
      ('Qissa Khwani', 'qissa-khwani', cid),
      ('Ring Road', 'ring-road', cid),
      ('Saddar', 'saddar', cid),
      ('Shaheen Muslim Town', 'shaheen-muslim-town', cid),
      ('Shami Road', 'shami-road', cid),
      ('Tehkal', 'tehkal', cid),
      ('University Campus', 'university-campus', cid),
      ('University Town', 'peshawar-university-town', cid),
      ('University Town', 'university-town', cid),
      ('Warsak Road', 'warsak-road', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- quetta (27 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'quetta';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Airport Road', 'airport-road', cid),
      ('Alamdar Road', 'alamdar-road', cid),
      ('Baleli', 'baleli', cid),
      ('Brewery Road', 'brewery-road', cid),
      ('Cantonment', 'cantonment', cid),
      ('Cantt', 'quetta-cantt', cid),
      ('Chiltan', 'chiltan', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Double Road', 'double-road', cid),
      ('Hazarganji', 'hazarganji', cid),
      ('Jinnah Town', 'quetta-jinnah-town', cid),
      ('Jinnah Town', 'jinnah-town', cid),
      ('Killi Ismail', 'killi-ismail', cid),
      ('Killi Qambrani', 'killi-qambrani', cid),
      ('Kuchlak', 'kuchlak', cid),
      ('Model Town', 'model-town', cid),
      ('Nawa Killi', 'nawa-killi', cid),
      ('Pashtunabad', 'pashtunabad', cid),
      ('Pishin Stop', 'pishin-stop', cid),
      ('Quetta City', 'quetta-city', cid),
      ('Saddar', 'saddar', cid),
      ('Samungli Road', 'samungli-road', cid),
      ('Sariab Road', 'sariab-road', cid),
      ('Satellite Town', 'satellite-town', cid),
      ('Spini Road', 'spini-road', cid),
      ('Western Bypass', 'western-bypass', cid),
      ('Zarghoon Road', 'zarghoon-road', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- rawalpindi (24 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'rawalpindi';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Adiala Road', 'adiala-road', cid),
      ('Bahria Town', 'bahria-town', cid),
      ('Bahria Town', 'rawalpindi-bahria-town', cid),
      ('Cantt', 'rawalpindi-cantt', cid),
      ('Chaklala', 'rawalpindi-chaklala', cid),
      ('Chaklala', 'chaklala', cid),
      ('Committee Chowk', 'committee-chowk', cid),
      ('DHA Phase 1', 'rawalpindi-dha-phase-1', cid),
      ('DHA Rawalpindi', 'dha-rawalpindi', cid),
      ('Dhoke Khabba', 'dhoke-khabba', cid),
      ('Gujjar Khan', 'gujjar-khan', cid),
      ('Islamabad Highway', 'islamabad-highway', cid),
      ('Kahuta', 'kahuta', cid),
      ('Kallar Syedan', 'kallar-syedan', cid),
      ('Murree', 'murree', cid),
      ('Pirwadhai', 'pirwadhai', cid),
      ('PWD', 'pwd', cid),
      ('Raja Bazaar', 'raja-bazaar', cid),
      ('Rawal Road', 'rawal-road', cid),
      ('Saddar', 'saddar', cid),
      ('Satellite Town', 'satellite-town', cid),
      ('Taxila', 'taxila', cid),
      ('Tench Bhatta', 'tench-bhatta', cid),
      ('Westridge', 'westridge', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- sahiwal (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'sahiwal';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Adda Gogera', 'adda-gogera', cid),
      ('Amin Town', 'amin-town', cid),
      ('Arain Colony', 'arain-colony', cid),
      ('Arifwala', 'arifwala', cid),
      ('Chichawatni', 'chichawatni', cid),
      ('City Road', 'city-road', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Farid Town', 'farid-town', cid),
      ('Harappa', 'harappa', cid),
      ('High Street', 'high-street', cid),
      ('Jail Road', 'jail-road', cid),
      ('Khan Pur', 'khan-pur', cid),
      ('Model Town', 'model-town', cid),
      ('Multan Road', 'multan-road', cid),
      ('Okara Road', 'okara-road', cid),
      ('Pakpattan Road', 'pakpattan-road', cid),
      ('Qadirabad', 'qadirabad', cid),
      ('Railway Road', 'railway-road', cid),
      ('Saddar', 'saddar', cid),
      ('University Road', 'university-road', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- sargodha (2 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'sargodha';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Cantt', 'sargodha-cantt', cid),
      ('Model Town', 'sargodha-model-town', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- sheikhupura (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'sheikhupura';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Bhikhi', 'bhikhi', cid),
      ('Bucheki', 'bucheki', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Farooqabad', 'farooqabad', cid),
      ('Ferozewala', 'ferozewala', cid),
      ('GT Road', 'gt-road', cid),
      ('Hamza Town', 'hamza-town', cid),
      ('Jahangir Colony', 'jahangir-colony', cid),
      ('Khanqah Dogran', 'khanqah-dogran', cid),
      ('Kot Abdul Malik', 'kot-abdul-malik', cid),
      ('Mangtanwala', 'mangtanwala', cid),
      ('Model Town', 'model-town', cid),
      ('Muridke', 'muridke', cid),
      ('Pindi Bhattian', 'pindi-bhattian', cid),
      ('Railway Road', 'railway-road', cid),
      ('Safdarabad', 'safdarabad', cid),
      ('Satellite Town', 'satellite-town', cid),
      ('Shahkot', 'shahkot', cid),
      ('Sharaqpur', 'sharaqpur', cid),
      ('Warburton', 'warburton', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- shikarpur (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'shikarpur';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Abad', 'abad', cid),
      ('Chakar Khan', 'chakar-khan', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Garhi Yasin', 'garhi-yasin', cid),
      ('Jacobabad Road', 'jacobabad-road', cid),
      ('Khair Muhammad Jalbani', 'khair-muhammad-jalbani', cid),
      ('Khanpur', 'khanpur', cid),
      ('Khanpur Mahar', 'khanpur-mahar', cid),
      ('Lakhi', 'lakhi', cid),
      ('Lakhi Road', 'lakhi-road', cid),
      ('Madeji', 'madeji', cid),
      ('Medical Road', 'medical-road', cid),
      ('Mian Sahib Colony', 'mian-sahib-colony', cid),
      ('New Faujdari', 'new-faujdari', cid),
      ('Pir Jo Goth', 'pir-jo-goth', cid),
      ('Rustam', 'rustam', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Station Road', 'station-road', cid),
      ('Sukkur Road', 'sukkur-road', cid),
      ('Sultan Kot', 'sultan-kot', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- sialkot (2 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'sialkot';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Cantt', 'sialkot-cantt', cid),
      ('Model Town', 'sialkot-model-town', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- skardu (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'skardu';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Airport Road', 'airport-road', cid),
      ('Baltistan Road', 'baltistan-road', cid),
      ('City Area', 'city-area', cid),
      ('Gamba', 'gamba', cid),
      ('Hussainabad', 'hussainabad', cid),
      ('K2 Chowk', 'k2-chowk', cid),
      ('Khaplu Road', 'khaplu-road', cid),
      ('Kharmang Road', 'kharmang-road', cid),
      ('KKH Road', 'kkh-road', cid),
      ('Mehdi Abad', 'mehdi-abad', cid),
      ('Naya Bazar', 'naya-bazar', cid),
      ('New Town', 'new-town', cid),
      ('Old Town', 'old-town', cid),
      ('Olding', 'olding', cid),
      ('Parkuta', 'parkuta', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Saling', 'saling', cid),
      ('Satpara', 'satpara', cid),
      ('Shigar Road', 'shigar-road', cid),
      ('Yadgar', 'yadgar', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- sukkur (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'sukkur';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Airport Road', 'airport-road', cid),
      ('Barrage Colony', 'barrage-colony', cid),
      ('City Area', 'city-area', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Garhi Tegho', 'garhi-tegho', cid),
      ('Jinnah Colony', 'jinnah-colony', cid),
      ('Labour Colony', 'labour-colony', cid),
      ('Lakhi', 'lakhi', cid),
      ('Minara Road', 'minara-road', cid),
      ('New Pind', 'new-pind', cid),
      ('New Sukkur', 'new-sukkur', cid),
      ('Pano Aqil', 'pano-aqil', cid),
      ('Pir Jo Goth', 'pir-jo-goth', cid),
      ('Rohri', 'rohri', cid),
      ('Saddar', 'saddar', cid),
      ('Saeedabad', 'saeedabad', cid),
      ('Saleh Pat', 'saleh-pat', cid),
      ('Shikarpur Road', 'shikarpur-road', cid),
      ('Station Road', 'station-road', cid),
      ('VIP Chowk', 'vip-chowk', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- swabi (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'swabi';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Ambar', 'ambar', cid),
      ('Bamkhel', 'bamkhel', cid),
      ('Chota Lahor', 'chota-lahor', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Dagai', 'dagai', cid),
      ('Gadoon Amazai', 'gadoon-amazai', cid),
      ('Jhanda', 'jhanda', cid),
      ('Kalu Khan', 'kalu-khan', cid),
      ('Maneri', 'maneri', cid),
      ('Mardan Road', 'mardan-road', cid),
      ('Peshawar Road', 'peshawar-road', cid),
      ('Razaar', 'razaar', cid),
      ('Razar', 'razar', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Shewa', 'shewa', cid),
      ('Thandkoi', 'thandkoi', cid),
      ('Topi', 'topi', cid),
      ('Tordher', 'tordher', cid),
      ('Yar Hussain', 'yar-hussain', cid),
      ('Zaida', 'zaida', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- tando-adam (15 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'tando-adam';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Agri Colony', 'agri-colony', cid),
      ('Bulri Shah Karim', 'bulri-shah-karim', cid),
      ('Chamber', 'chamber', cid),
      ('City Area', 'city-area', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Hyderabad Road', 'hyderabad-road', cid),
      ('Jubilee Colony', 'jubilee-colony', cid),
      ('Mirpurkhas Road', 'mirpurkhas-road', cid),
      ('Model Colony', 'model-colony', cid),
      ('Nasarpur Road', 'nasarpur-road', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Sanghar Road', 'sanghar-road', cid),
      ('Sinjhoro', 'sinjhoro', cid),
      ('Station Road', 'station-road', cid),
      ('Tando Ghulam Hyder Road', 'tando-ghulam-hyder-road', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- tando-allahyar (15 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'tando-allahyar';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Agricultural Colony', 'agricultural-colony', cid),
      ('Badin Road', 'badin-road', cid),
      ('Bulri Road', 'bulri-road', cid),
      ('Chamber Road', 'chamber-road', cid),
      ('City Area', 'city-area', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Hyderabad Road', 'hyderabad-road', cid),
      ('Jhando Mari', 'jhando-mari', cid),
      ('Mirpurkhas Road', 'mirpurkhas-road', cid),
      ('Nasarpur', 'nasarpur', cid),
      ('Railway Road', 'railway-road', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Station Area', 'station-area', cid),
      ('Taluka Hospital Area', 'taluka-hospital-area', cid),
      ('Tando Ghulam Hyder', 'tando-ghulam-hyder', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- timergara (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'timergara';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Adenzai', 'adenzai', cid),
      ('Asbanr', 'asbanr', cid),
      ('Balambat', 'balambat', cid),
      ('Barawal', 'barawal', cid),
      ('Chakdara', 'chakdara', cid),
      ('City Area', 'city-area', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Dir Road', 'dir-road', cid),
      ('Hospital Road', 'hospital-road', cid),
      ('Khal', 'khal', cid),
      ('Khar', 'khar', cid),
      ('Lal Qila', 'lal-qila', cid),
      ('Main Bazaar', 'main-bazaar', cid),
      ('Mayar', 'mayar', cid),
      ('Munda', 'munda', cid),
      ('Peshawar Road', 'peshawar-road', cid),
      ('Rabat', 'rabat', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Samarbagh', 'samarbagh', cid),
      ('Talash', 'talash', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- turbat (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'turbat';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Airport Road', 'airport-road', cid),
      ('Balochabad', 'balochabad', cid),
      ('Buleda', 'buleda', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Dasht', 'dasht', cid),
      ('Gokprosh', 'gokprosh', cid),
      ('Hoshab', 'hoshab', cid),
      ('Hospital Road', 'hospital-road', cid),
      ('Kech Valley', 'kech-valley', cid),
      ('Mand', 'mand', cid),
      ('New Town', 'new-town', cid),
      ('Old Town', 'old-town', cid),
      ('Pidarak', 'pidarak', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Shapuk', 'shapuk', cid),
      ('Tump', 'tump', cid),
      ('Turbat City', 'turbat-city', cid),
      ('University Road', 'university-road', cid),
      ('Zamran', 'zamran', cid),
      ('Zamuran', 'zamuran', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- umerkot (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'umerkot';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Chhor', 'chhor', cid),
      ('City Area', 'city-area', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Daharki Road', 'daharki-road', cid),
      ('Dhoro Naro', 'dhoro-naro', cid),
      ('Hindoo Para', 'hindoo-para', cid),
      ('Hospital Road', 'hospital-road', cid),
      ('Islamkot', 'islamkot', cid),
      ('Khipro Road', 'khipro-road', cid),
      ('Kunri', 'kunri', cid),
      ('Mirpurkhas Road', 'mirpurkhas-road', cid),
      ('Naukot', 'naukot', cid),
      ('New Town', 'new-town', cid),
      ('Old Town', 'old-town', cid),
      ('Pithoro', 'pithoro', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Samaro', 'samaro', cid),
      ('Station Road', 'station-road', cid),
      ('Tando Allahyar Road', 'tando-allahyar-road', cid),
      ('Viran Wah', 'viran-wah', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

  -- vehari (20 towns)
  SELECT id INTO cid FROM public.cities WHERE slug = 'vehari';
  IF cid IS NOT NULL THEN
    INSERT INTO public.towns (name, slug, city_id) VALUES
      ('Adda Baloch Wala', 'adda-baloch-wala', cid),
      ('Adda Bodla', 'adda-bodla', cid),
      ('Adda Gaga', 'adda-gaga', cid),
      ('Bahawalpur Road', 'bahawalpur-road', cid),
      ('Burewala', 'burewala', cid),
      ('Chak 107/WB', 'chak-107wb', cid),
      ('Chak 33/WB', 'chak-33wb', cid),
      ('Chowk Maitla', 'chowk-maitla', cid),
      ('Civil Lines', 'civil-lines', cid),
      ('Dunyapur', 'dunyapur', cid),
      ('Garha Mor', 'garha-mor', cid),
      ('Jalalpur Pirwala', 'jalalpur-pirwala', cid),
      ('Khairpur Tamewali', 'khairpur-tamewali', cid),
      ('Luddan', 'luddan', cid),
      ('Mailsi', 'mailsi', cid),
      ('Model Town', 'model-town', cid),
      ('Multan Road', 'multan-road', cid),
      ('Saddar Bazaar', 'saddar-bazaar', cid),
      ('Satellite Town', 'satellite-town', cid),
      ('Tibba Sultan Pur', 'tibba-sultan-pur', cid)
    ON CONFLICT (slug, city_id) DO NOTHING;
  END IF;

END $$;
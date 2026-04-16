-- Seed makes & models for the listing wizard make/model selector
-- Run in Supabase SQL Editor

insert into public.makes (id, name, slug, logo_url) values
  ('a0000001-0000-0000-0000-000000000001', 'Toyota',     'toyota',     'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset/logos/optimized/toyota.png'),
  ('a0000001-0000-0000-0000-000000000002', 'Honda',      'honda',      'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset/logos/optimized/honda.png'),
  ('a0000001-0000-0000-0000-000000000003', 'Suzuki',     'suzuki',     'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset/logos/optimized/suzuki.png'),
  ('a0000001-0000-0000-0000-000000000004', 'Hyundai',    'hyundai',    'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset/logos/optimized/hyundai.png'),
  ('a0000001-0000-0000-0000-000000000005', 'KIA',        'kia',        'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset/logos/optimized/kia.png'),
  ('a0000001-0000-0000-0000-000000000006', 'Nissan',     'nissan',     'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset/logos/optimized/nissan.png'),
  ('a0000001-0000-0000-0000-000000000007', 'Mitsubishi', 'mitsubishi', 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset/logos/optimized/mitsubishi.png'),
  ('a0000001-0000-0000-0000-000000000008', 'BMW',        'bmw',        'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset/logos/optimized/bmw.png'),
  ('a0000001-0000-0000-0000-000000000009', 'Mercedes',   'mercedes',   'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset/logos/optimized/mercedes-benz.png'),
  ('a0000001-0000-0000-0000-000000000010', 'Audi',       'audi',       'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset/logos/optimized/audi.png'),
  ('a0000001-0000-0000-0000-000000000011', 'Lexus',      'lexus',      'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset/logos/optimized/lexus.png'),
  ('a0000001-0000-0000-0000-000000000012', 'Porsche',    'porsche',    'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset/logos/optimized/porsche.png'),
  ('a0000001-0000-0000-0000-000000000013', 'Daihatsu',   'daihatsu',   'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset/logos/optimized/daihatsu.png'),
  ('a0000001-0000-0000-0000-000000000014', 'Changan',    'changan',    null),
  ('a0000001-0000-0000-0000-000000000015', 'MG',         'mg',         'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset/logos/optimized/mg.png'),
  ('a0000001-0000-0000-0000-000000000016', 'Chevrolet',  'chevrolet',  'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset/logos/optimized/chevrolet.png'),
  ('a0000001-0000-0000-0000-000000000017', 'Jeep',       'jeep',       'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset/logos/optimized/jeep.png'),
  ('a0000001-0000-0000-0000-000000000018', 'Land Rover', 'land-rover', 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset/logos/optimized/land-rover.png'),
  ('a0000001-0000-0000-0000-000000000019', 'Isuzu',      'isuzu',      null),
  ('a0000001-0000-0000-0000-000000000020', 'FAW',        'faw',        null)
on conflict (slug) do nothing;

insert into public.models (id, make_id, name, slug, body_type) values
  -- Toyota
  ('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Corolla',      'toyota-corolla',      'Sedan'),
  ('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001', 'Yaris',        'toyota-yaris',        'Hatchback'),
  ('b0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001', 'Camry',        'toyota-camry',        'Sedan'),
  ('b0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001', 'Prius',        'toyota-prius',        'Sedan'),
  ('b0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000001', 'Fortuner',     'toyota-fortuner',     'SUV'),
  ('b0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000001', 'Land Cruiser', 'toyota-land-cruiser', 'SUV'),
  ('b0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000001', 'Prado',        'toyota-prado',        'SUV'),
  ('b0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000001', 'Hilux',        'toyota-hilux',        'Pickup'),
  ('b0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000001', 'Hiace',        'toyota-hiace',        'Van'),
  ('b0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000001', 'Vitz',         'toyota-vitz',         'Hatchback'),
  ('b0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000001', 'Rush',         'toyota-rush',         'SUV'),
  ('b0000001-0000-0000-0000-000000000012', 'a0000001-0000-0000-0000-000000000001', 'Avanza',       'toyota-avanza',       'MPV'),
  -- Honda
  ('b0000001-0000-0000-0000-000000000013', 'a0000001-0000-0000-0000-000000000002', 'Civic',        'honda-civic',         'Sedan'),
  ('b0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000002', 'City',         'honda-city',          'Sedan'),
  ('b0000001-0000-0000-0000-000000000015', 'a0000001-0000-0000-0000-000000000002', 'BR-V',         'honda-br-v',          'SUV'),
  ('b0000001-0000-0000-0000-000000000016', 'a0000001-0000-0000-0000-000000000002', 'CR-V',         'honda-cr-v',          'SUV'),
  ('b0000001-0000-0000-0000-000000000017', 'a0000001-0000-0000-0000-000000000002', 'HR-V',         'honda-hr-v',          'SUV'),
  ('b0000001-0000-0000-0000-000000000018', 'a0000001-0000-0000-0000-000000000002', 'Accord',       'honda-accord',        'Sedan'),
  ('b0000001-0000-0000-0000-000000000019', 'a0000001-0000-0000-0000-000000000002', 'Odyssey',      'honda-odyssey',       'MPV'),
  -- Suzuki
  ('b0000001-0000-0000-0000-000000000020', 'a0000001-0000-0000-0000-000000000003', 'Alto',         'suzuki-alto',         'Hatchback'),
  ('b0000001-0000-0000-0000-000000000021', 'a0000001-0000-0000-0000-000000000003', 'Cultus',       'suzuki-cultus',       'Hatchback'),
  ('b0000001-0000-0000-0000-000000000022', 'a0000001-0000-0000-0000-000000000003', 'Swift',        'suzuki-swift',        'Hatchback'),
  ('b0000001-0000-0000-0000-000000000023', 'a0000001-0000-0000-0000-000000000003', 'Wagon R',      'suzuki-wagon-r',      'Hatchback'),
  ('b0000001-0000-0000-0000-000000000024', 'a0000001-0000-0000-0000-000000000003', 'Vitara',       'suzuki-vitara',       'SUV'),
  ('b0000001-0000-0000-0000-000000000025', 'a0000001-0000-0000-0000-000000000003', 'XL7',          'suzuki-xl7',          'SUV'),
  ('b0000001-0000-0000-0000-000000000026', 'a0000001-0000-0000-0000-000000000003', 'Jimny',        'suzuki-jimny',        'SUV'),
  -- Hyundai
  ('b0000001-0000-0000-0000-000000000027', 'a0000001-0000-0000-0000-000000000004', 'Elantra',      'hyundai-elantra',     'Sedan'),
  ('b0000001-0000-0000-0000-000000000028', 'a0000001-0000-0000-0000-000000000004', 'Accent',       'hyundai-accent',      'Sedan'),
  ('b0000001-0000-0000-0000-000000000029', 'a0000001-0000-0000-0000-000000000004', 'Tucson',       'hyundai-tucson',      'SUV'),
  ('b0000001-0000-0000-0000-000000000030', 'a0000001-0000-0000-0000-000000000004', 'Santa Fe',     'hyundai-santa-fe',    'SUV'),
  ('b0000001-0000-0000-0000-000000000031', 'a0000001-0000-0000-0000-000000000004', 'Sonata',       'hyundai-sonata',      'Sedan'),
  -- KIA
  ('b0000001-0000-0000-0000-000000000032', 'a0000001-0000-0000-0000-000000000005', 'Picanto',      'kia-picanto',         'Hatchback'),
  ('b0000001-0000-0000-0000-000000000033', 'a0000001-0000-0000-0000-000000000005', 'Sportage',     'kia-sportage',        'SUV'),
  ('b0000001-0000-0000-0000-000000000034', 'a0000001-0000-0000-0000-000000000005', 'Sorento',      'kia-sorento',         'SUV'),
  ('b0000001-0000-0000-0000-000000000035', 'a0000001-0000-0000-0000-000000000005', 'Stinger',      'kia-stinger',         'Sedan'),
  -- Nissan
  ('b0000001-0000-0000-0000-000000000036', 'a0000001-0000-0000-0000-000000000006', 'Sunny',        'nissan-sunny',        'Sedan'),
  ('b0000001-0000-0000-0000-000000000037', 'a0000001-0000-0000-0000-000000000006', 'X-Trail',      'nissan-x-trail',      'SUV'),
  ('b0000001-0000-0000-0000-000000000038', 'a0000001-0000-0000-0000-000000000006', 'Patrol',       'nissan-patrol',       'SUV'),
  ('b0000001-0000-0000-0000-000000000039', 'a0000001-0000-0000-0000-000000000006', 'Navara',       'nissan-navara',       'Pickup'),
  -- Mitsubishi
  ('b0000001-0000-0000-0000-000000000040', 'a0000001-0000-0000-0000-000000000007', 'Attrage',      'mitsubishi-attrage',  'Sedan'),
  ('b0000001-0000-0000-0000-000000000041', 'a0000001-0000-0000-0000-000000000007', 'Outlander',    'mitsubishi-outlander','SUV'),
  ('b0000001-0000-0000-0000-000000000042', 'a0000001-0000-0000-0000-000000000007', 'Pajero',       'mitsubishi-pajero',   'SUV'),
  -- BMW
  ('b0000001-0000-0000-0000-000000000043', 'a0000001-0000-0000-0000-000000000008', '3 Series',     'bmw-3-series',        'Sedan'),
  ('b0000001-0000-0000-0000-000000000044', 'a0000001-0000-0000-0000-000000000008', '5 Series',     'bmw-5-series',        'Sedan'),
  ('b0000001-0000-0000-0000-000000000045', 'a0000001-0000-0000-0000-000000000008', 'X5',           'bmw-x5',              'SUV'),
  ('b0000001-0000-0000-0000-000000000046', 'a0000001-0000-0000-0000-000000000008', 'X3',           'bmw-x3',              'SUV'),
  -- Mercedes
  ('b0000001-0000-0000-0000-000000000047', 'a0000001-0000-0000-0000-000000000009', 'C-Class',      'mercedes-c-class',    'Sedan'),
  ('b0000001-0000-0000-0000-000000000048', 'a0000001-0000-0000-0000-000000000009', 'E-Class',      'mercedes-e-class',    'Sedan'),
  ('b0000001-0000-0000-0000-000000000049', 'a0000001-0000-0000-0000-000000000009', 'GLC',          'mercedes-glc',        'SUV'),
  ('b0000001-0000-0000-0000-000000000050', 'a0000001-0000-0000-0000-000000000009', 'S-Class',      'mercedes-s-class',    'Sedan'),
  -- Audi
  ('b0000001-0000-0000-0000-000000000051', 'a0000001-0000-0000-0000-000000000010', 'A4',           'audi-a4',             'Sedan'),
  ('b0000001-0000-0000-0000-000000000052', 'a0000001-0000-0000-0000-000000000010', 'A6',           'audi-a6',             'Sedan'),
  ('b0000001-0000-0000-0000-000000000053', 'a0000001-0000-0000-0000-000000000010', 'Q5',           'audi-q5',             'SUV'),
  ('b0000001-0000-0000-0000-000000000054', 'a0000001-0000-0000-0000-000000000010', 'Q7',           'audi-q7',             'SUV'),
  -- Lexus
  ('b0000001-0000-0000-0000-000000000055', 'a0000001-0000-0000-0000-000000000011', 'ES',           'lexus-es',            'Sedan'),
  ('b0000001-0000-0000-0000-000000000056', 'a0000001-0000-0000-0000-000000000011', 'NX',           'lexus-nx',            'SUV'),
  ('b0000001-0000-0000-0000-000000000057', 'a0000001-0000-0000-0000-000000000011', 'LX',           'lexus-lx',            'SUV'),
  -- Porsche
  ('b0000001-0000-0000-0000-000000000058', 'a0000001-0000-0000-0000-000000000012', '911',          'porsche-911',         'Sports'),
  ('b0000001-0000-0000-0000-000000000059', 'a0000001-0000-0000-0000-000000000012', 'Cayenne',      'porsche-cayenne',     'SUV'),
  ('b0000001-0000-0000-0000-000000000060', 'a0000001-0000-0000-0000-000000000012', 'Macan',        'porsche-macan',       'SUV'),
  -- Daihatsu
  ('b0000001-0000-0000-0000-000000000061', 'a0000001-0000-0000-0000-000000000013', 'Mira',         'daihatsu-mira',       'Hatchback'),
  ('b0000001-0000-0000-0000-000000000062', 'a0000001-0000-0000-0000-000000000013', 'Move',         'daihatsu-move',       'Hatchback'),
  ('b0000001-0000-0000-0000-000000000063', 'a0000001-0000-0000-0000-000000000013', 'Cuore',        'daihatsu-cuore',      'Hatchback'),
  -- Changan
  ('b0000001-0000-0000-0000-000000000064', 'a0000001-0000-0000-0000-000000000014', 'Alsvin',       'changan-alsvin',      'Sedan'),
  ('b0000001-0000-0000-0000-000000000065', 'a0000001-0000-0000-0000-000000000014', 'Karvaan',      'changan-karvaan',     'MPV'),
  ('b0000001-0000-0000-0000-000000000066', 'a0000001-0000-0000-0000-000000000014', 'CS35 Plus',    'changan-cs35-plus',   'SUV'),
  -- MG
  ('b0000001-0000-0000-0000-000000000067', 'a0000001-0000-0000-0000-000000000015', 'HS',           'mg-hs',               'SUV'),
  ('b0000001-0000-0000-0000-000000000068', 'a0000001-0000-0000-0000-000000000015', 'ZS',           'mg-zs',               'SUV'),
  ('b0000001-0000-0000-0000-000000000069', 'a0000001-0000-0000-0000-000000000015', 'RX5',          'mg-rx5',              'SUV'),
  -- Chevrolet
  ('b0000001-0000-0000-0000-000000000070', 'a0000001-0000-0000-0000-000000000016', 'Tahoe',        'chevrolet-tahoe',     'SUV'),
  ('b0000001-0000-0000-0000-000000000071', 'a0000001-0000-0000-0000-000000000016', 'Suburban',     'chevrolet-suburban',  'SUV'),
  -- Jeep
  ('b0000001-0000-0000-0000-000000000072', 'a0000001-0000-0000-0000-000000000017', 'Wrangler',     'jeep-wrangler',       'SUV'),
  ('b0000001-0000-0000-0000-000000000073', 'a0000001-0000-0000-0000-000000000017', 'Grand Cherokee','jeep-grand-cherokee','SUV'),
  -- Land Rover
  ('b0000001-0000-0000-0000-000000000074', 'a0000001-0000-0000-0000-000000000018', 'Defender',     'land-rover-defender', 'SUV'),
  ('b0000001-0000-0000-0000-000000000075', 'a0000001-0000-0000-0000-000000000018', 'Range Rover',  'land-rover-range-rover','SUV'),
  ('b0000001-0000-0000-0000-000000000076', 'a0000001-0000-0000-0000-000000000018', 'Discovery',    'land-rover-discovery','SUV'),
  -- Isuzu
  ('b0000001-0000-0000-0000-000000000077', 'a0000001-0000-0000-0000-000000000019', 'D-Max',        'isuzu-d-max',         'Pickup'),
  ('b0000001-0000-0000-0000-000000000078', 'a0000001-0000-0000-0000-000000000019', 'MU-X',         'isuzu-mu-x',          'SUV'),
  -- FAW
  ('b0000001-0000-0000-0000-000000000079', 'a0000001-0000-0000-0000-000000000020', 'V2',           'faw-v2',              'Sedan'),
  ('b0000001-0000-0000-0000-000000000080', 'a0000001-0000-0000-0000-000000000020', 'Carrier',      'faw-carrier',         'Van')
on conflict (make_id, name) do nothing;

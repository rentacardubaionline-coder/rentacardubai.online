-- Seed vehicle features for the listing wizard features step
-- Run in Supabase SQL Editor

insert into public.vehicle_features (id, name, slug, "group") values
  -- Safety
  ('c0000001-0000-0000-0000-000000000001', 'ABS Brakes',           'abs-brakes',           'Safety'),
  ('c0000001-0000-0000-0000-000000000002', 'Airbags',              'airbags',              'Safety'),
  ('c0000001-0000-0000-0000-000000000003', 'Rear Camera',          'rear-camera',          'Safety'),
  ('c0000001-0000-0000-0000-000000000004', 'Parking Sensors',      'parking-sensors',      'Safety'),
  ('c0000001-0000-0000-0000-000000000005', 'Lane Assist',          'lane-assist',          'Safety'),
  ('c0000001-0000-0000-0000-000000000006', 'Blind Spot Monitor',   'blind-spot-monitor',   'Safety'),
  ('c0000001-0000-0000-0000-000000000007', 'Traction Control',     'traction-control',     'Safety'),
  ('c0000001-0000-0000-0000-000000000008', 'Stability Control',    'stability-control',    'Safety'),
  -- Comfort
  ('c0000001-0000-0000-0000-000000000009', 'Air Conditioning',     'air-conditioning',     'Comfort'),
  ('c0000001-0000-0000-0000-000000000010', 'Dual Climate Control', 'dual-climate-control', 'Comfort'),
  ('c0000001-0000-0000-0000-000000000011', 'Heated Seats',         'heated-seats',         'Comfort'),
  ('c0000001-0000-0000-0000-000000000012', 'Leather Seats',        'leather-seats',        'Comfort'),
  ('c0000001-0000-0000-0000-000000000013', 'Sunroof',              'sunroof',              'Comfort'),
  ('c0000001-0000-0000-0000-000000000014', 'Power Windows',        'power-windows',        'Comfort'),
  ('c0000001-0000-0000-0000-000000000015', 'Power Steering',       'power-steering',       'Comfort'),
  ('c0000001-0000-0000-0000-000000000016', 'Cruise Control',       'cruise-control',       'Comfort'),
  ('c0000001-0000-0000-0000-000000000017', 'Keyless Entry',        'keyless-entry',        'Comfort'),
  ('c0000001-0000-0000-0000-000000000018', 'Push Start',           'push-start',           'Comfort'),
  -- Technology
  ('c0000001-0000-0000-0000-000000000019', 'GPS Navigation',       'gps-navigation',       'Technology'),
  ('c0000001-0000-0000-0000-000000000020', 'Touchscreen Display',  'touchscreen-display',  'Technology'),
  ('c0000001-0000-0000-0000-000000000021', 'Apple CarPlay',        'apple-carplay',        'Technology'),
  ('c0000001-0000-0000-0000-000000000022', 'Android Auto',         'android-auto',         'Technology'),
  ('c0000001-0000-0000-0000-000000000023', 'Bluetooth',            'bluetooth',            'Technology'),
  ('c0000001-0000-0000-0000-000000000024', 'USB Ports',            'usb-ports',            'Technology'),
  ('c0000001-0000-0000-0000-000000000025', 'Wireless Charging',    'wireless-charging',    'Technology'),
  -- Entertainment
  ('c0000001-0000-0000-0000-000000000026', 'Premium Sound System', 'premium-sound-system', 'Entertainment'),
  ('c0000001-0000-0000-0000-000000000027', 'Rear Entertainment',   'rear-entertainment',   'Entertainment'),
  ('c0000001-0000-0000-0000-000000000028', 'Subwoofer',            'subwoofer',            'Entertainment'),
  -- Convenience
  ('c0000001-0000-0000-0000-000000000029', 'Spare Tyre',           'spare-tyre',           'Convenience'),
  ('c0000001-0000-0000-0000-000000000030', 'Jack & Tools',         'jack-tools',           'Convenience'),
  ('c0000001-0000-0000-0000-000000000031', 'First Aid Kit',        'first-aid-kit',        'Convenience'),
  ('c0000001-0000-0000-0000-000000000032', 'Child Seat',           'child-seat',           'Convenience'),
  ('c0000001-0000-0000-0000-000000000033', 'Roof Rack',            'roof-rack',            'Convenience'),
  ('c0000001-0000-0000-0000-000000000034', 'Boot Space (Large)',   'boot-space-large',     'Convenience'),
  -- Exterior
  ('c0000001-0000-0000-0000-000000000035', 'Alloy Wheels',         'alloy-wheels',         'Exterior'),
  ('c0000001-0000-0000-0000-000000000036', 'Tinted Windows',       'tinted-windows',       'Exterior'),
  ('c0000001-0000-0000-0000-000000000037', '4WD / AWD',            '4wd-awd',              'Exterior'),
  ('c0000001-0000-0000-0000-000000000038', 'High Ground Clearance','high-ground-clearance','Exterior')
on conflict (slug) do nothing;

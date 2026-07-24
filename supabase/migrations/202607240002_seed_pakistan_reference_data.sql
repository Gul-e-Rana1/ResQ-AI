insert into public.emergency_departments (name, province, district, phone, service_type, is_national)
values
  ('Rescue 1122 Punjab', 'Punjab', null, '1122', 'Rescue and ambulance', false),
  ('Rescue 1122 Sindh', 'Sindh', null, '1122', 'Rescue and ambulance', false),
  ('Rescue 1122 Khyber Pakhtunkhwa', 'Khyber Pakhtunkhwa', null, '1122', 'Rescue and ambulance', false),
  ('Rescue 1122 Balochistan', 'Balochistan', null, '1122', 'Rescue and ambulance', false),
  ('Police Emergency Pakistan', null, null, '15', 'Police emergency', true),
  ('Edhi Ambulance', null, null, '115', 'Ambulance', true),
  ('National Disaster Management Authority', null, null, '051-111-157-157', 'Disaster management', true),
  ('Aman Ambulance Karachi', 'Sindh', 'Karachi', '1021', 'Ambulance', false)
on conflict (name) do update
set
  phone = excluded.phone,
  service_type = excluded.service_type,
  is_national = excluded.is_national;

insert into public.relief_camps (
  name,
  description,
  province,
  district,
  tehsil,
  address,
  latitude,
  longitude,
  capacity_total,
  capacity_available,
  status,
  contact_phone,
  supported_disasters,
  services,
  is_accepting_emergencies
)
values
  (
    'Lahore Expo Relief Camp',
    'Urban relief coordination camp for flood, storm, and medical support in Lahore.',
    'Punjab',
    'Lahore',
    'Lahore City',
    'Expo Centre, Johar Town, Lahore',
    31.4697000,
    74.2728000,
    600,
    420,
    'approved',
    '1122',
    array['flood', 'storm', 'medical']::public.disaster_type[],
    array['Shelter', 'Food', 'Drinking Water', 'Medical Desk', 'Family Registration'],
    true
  ),
  (
    'Karachi Civic Relief Camp',
    'Coastal and urban emergency shelter serving Karachi flood and storm response.',
    'Sindh',
    'Karachi',
    'Karachi South',
    'Civic Centre, Karachi',
    24.9203000,
    67.0880000,
    800,
    510,
    'approved',
    '1122',
    array['flood', 'storm', 'medical']::public.disaster_type[],
    array['Shelter', 'Food', 'Clean Water', 'Women and Children Desk', 'Ambulance Coordination'],
    true
  ),
  (
    'Peshawar Sports Complex Relief Camp',
    'KP relief camp with earthquake, flood, and landslide response capacity.',
    'Khyber Pakhtunkhwa',
    'Peshawar',
    'Peshawar City',
    'Qayyum Sports Complex, Peshawar',
    34.0004000,
    71.5548000,
    500,
    260,
    'approved',
    '1122',
    array['earthquake', 'flood', 'landslide', 'medical']::public.disaster_type[],
    array['Shelter', 'Food Packs', 'First Aid', 'Search Coordination', 'Temporary Bedding'],
    true
  ),
  (
    'Quetta Emergency Shelter Hub',
    'Balochistan response hub for earthquake, storm, and medical emergencies.',
    'Balochistan',
    'Quetta',
    'Quetta City',
    'Ayub Stadium Road, Quetta',
    30.1798000,
    66.9750000,
    350,
    180,
    'approved',
    '1122',
    array['earthquake', 'storm', 'medical']::public.disaster_type[],
    array['Shelter', 'Medical Desk', 'Dry Rations', 'Blankets', 'Emergency Transport'],
    true
  ),
  (
    'Muzaffarabad Valley Relief Camp',
    'AJK camp focused on landslide, earthquake, and flood support.',
    'Azad Jammu and Kashmir',
    'Muzaffarabad',
    'Muzaffarabad',
    'Near University Ground, Muzaffarabad',
    34.3700000,
    73.4711000,
    300,
    145,
    'approved',
    '1122',
    array['landslide', 'earthquake', 'flood', 'medical']::public.disaster_type[],
    array['Shelter', 'Mountain Rescue Liaison', 'Food', 'Water', 'First Aid'],
    true
  )
on conflict (name) do update
set
  description = excluded.description,
  capacity_total = excluded.capacity_total,
  capacity_available = excluded.capacity_available,
  status = excluded.status,
  contact_phone = excluded.contact_phone,
  supported_disasters = excluded.supported_disasters,
  services = excluded.services,
  is_accepting_emergencies = excluded.is_accepting_emergencies,
  updated_at = now();

insert into public.camp_supplies (camp_id, name, category, quantity, unit, low_stock_threshold)
select camp.id, supply.name, supply.category, supply.quantity, supply.unit, supply.low_stock_threshold
from public.relief_camps camp
cross join (
  values
    ('Drinking Water', 'water', 1200, 'liters', 250),
    ('Food Packs', 'food', 900, 'packs', 150),
    ('Blankets', 'shelter', 500, 'items', 80),
    ('First Aid Kits', 'medical', 120, 'kits', 25),
    ('Hygiene Kits', 'sanitation', 300, 'kits', 60)
) as supply(name, category, quantity, unit, low_stock_threshold)
where camp.name in (
  'Lahore Expo Relief Camp',
  'Karachi Civic Relief Camp',
  'Peshawar Sports Complex Relief Camp',
  'Quetta Emergency Shelter Hub',
  'Muzaffarabad Valley Relief Camp'
)
on conflict (camp_id, name) do update
set
  category = excluded.category,
  quantity = excluded.quantity,
  unit = excluded.unit,
  low_stock_threshold = excluded.low_stock_threshold,
  updated_at = now();

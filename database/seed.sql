-- ====================================================================
-- EMERGENCYCARE DATABASE SEED SCRIPT
-- Supabase PostgreSQL 17+
-- ====================================================================

-- 1. SEED USERS (Passwords hashed with bcrypt - 10 salt rounds)
INSERT INTO public.users (id, full_name, email, mobile, password_hash, role, status)
VALUES 
  ('3f9cb30d-1903-49bd-885a-478480641e1f', 'Emergency Care Administrator', 'admin@emergencycare.app', '+91 9876543210', '$2b$10$chHdsxFlI/GMZ6AGFDT86usHVxK0X./HCE58.uqFuKi0LewtrgNTa', 'admin', 'active'),
  ('4b4734db-868e-4c41-ab39-98bc85903075', 'Rajat Sharma', 'user@emergencycare.app', '+91 9876543211', '$2b$10$ztowbfMJR0xnL2QkYQURaemH480Qh5q0jHHxntcggLdqOC6EP0zdy', 'user', 'active'),
  ('40ea5b7d-3996-4016-ad84-8ed9bb300130', 'Inactive Test User', 'inactive@emergencycare.app', '+91 9876543212', '$2b$10$ztowbfMJR0xnL2QkYQURaemH480Qh5q0jHHxntcggLdqOC6EP0zdy', 'user', 'deactivated')
ON CONFLICT (email) DO UPDATE 
SET full_name = EXCLUDED.full_name,
    mobile = EXCLUDED.mobile,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    updated_at = now();

-- 2. SEED INSURANCE CARDS
INSERT INTO public.insurance_cards (id, name, type)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Ayushman Bharat (PM-JAY)', 'Government Scheme'),
  ('c0000000-0000-0000-0000-000000000002', 'CGHS (Central Govt Health Scheme)', 'Government Scheme'),
  ('c0000000-0000-0000-0000-000000000003', 'ECHS (Ex-Servicemen Scheme)', 'Defence / Govt'),
  ('c0000000-0000-0000-0000-000000000004', 'Star Health Allied Insurance', 'Private Cashless'),
  ('c0000000-0000-0000-0000-000000000005', 'HDFC ERGO Health Suraksha', 'Private Cashless')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED HOSPITALS
INSERT INTO public.hospitals (id, name, image_url, address, city, latitude, longitude, phone, emergency_phone, rating, emergency_status, distance_km, eta_minutes)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'CityCare Apex Trauma & Emergency Hospital',
    'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&w=1200&q=80',
    '45 Hospital Boulevard, Central Ring Rd',
    'Bengaluru',
    12.9716,
    77.5946,
    '+91 80 4912 3000',
    '+91 80 4912 3999',
    4.8,
    'open',
    2.1,
    7
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'Apollo Speciality & Critical Care Center',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
    '154/11 Bannerghatta Main Rd, Opposite IIMB',
    'Bengaluru',
    12.8984,
    77.5994,
    '+91 80 2630 4050',
    '+91 80 1066',
    4.9,
    'open',
    3.8,
    12
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'Fortis Heart & Emergency Institute',
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
    '14 Cunningham Road, Vasanth Nagar',
    'Bengaluru',
    12.9866,
    77.5983,
    '+91 80 4022 5555',
    '+91 80 4022 5911',
    4.7,
    'open',
    4.5,
    14
  ),
  (
    'a0000000-0000-0000-0000-000000000004',
    'Manipal Multi-Speciality Emergency Hospital',
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80',
    '98 HAL Old Airport Rd, Kodihalli',
    'Bengaluru',
    12.9592,
    77.6547,
    '+91 80 2502 4444',
    '+91 80 2502 3333',
    4.6,
    'busy',
    5.2,
    17
  ),
  (
    'a0000000-0000-0000-0000-000000000005',
    'Max Super Care & Trauma Center',
    'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
    '22 Outer Ring Road, Marathahalli Junction',
    'Bengaluru',
    12.9569,
    77.7011,
    '+91 80 6610 8000',
    '+91 80 6610 8100',
    4.5,
    'open',
    6.4,
    21
  )
ON CONFLICT (id) DO NOTHING;

-- 4. SEED BEDS
INSERT INTO public.beds (hospital_id, general_available, icu_available, emergency_available, ventilator_available, oxygen_available)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 18, 5, 8, 4, 12),
  ('a0000000-0000-0000-0000-000000000002', 24, 7, 10, 6, 15),
  ('a0000000-0000-0000-0000-000000000003', 12, 3, 4, 2, 8),
  ('a0000000-0000-0000-0000-000000000004', 15, 0, 5, 1, 6),
  ('a0000000-0000-0000-0000-000000000005', 20, 4, 7, 3, 10)
ON CONFLICT DO NOTHING;

-- 5. SEED DOCTORS
INSERT INTO public.doctors (hospital_id, name, specialization, availability)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Dr. Priya Sharma, MD', 'Emergency Medicine & Triage Specialist', 'Available'),
  ('a0000000-0000-0000-0000-000000000001', 'Dr. Rajesh Nair, MS', 'Trauma & Orthopaedic Surgeon', 'Available'),
  ('a0000000-0000-0000-0000-000000000002', 'Dr. Amitav Roy, DM', 'Interventional Cardiologist', 'Available'),
  ('a0000000-0000-0000-0000-000000000002', 'Dr. Sunita Kulkarni, MD', 'Critical Care & Pulmonology', 'Available'),
  ('a0000000-0000-0000-0000-000000000003', 'Dr. Vikramaditya Rao, MS', 'Cardiothoracic Emergency Surgeon', 'Available'),
  ('a0000000-0000-0000-0000-000000000004', 'Dr. Neha Verma, MD', 'Neuro Emergency & Stroke Care', 'Busy'),
  ('a0000000-0000-0000-0000-000000000005', 'Dr. Sanjay Gupta, MS', 'General & Laparoscopic Trauma', 'Available')
ON CONFLICT DO NOTHING;

-- 6. SEED AMBULANCES
INSERT INTO public.ambulances (hospital_id, type, status, eta, distance, latitude, longitude)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Advanced Cardiac Life Support (ACLS)', 'Available', '5 min', '1.4 km', 12.9750, 77.5960),
  ('a0000000-0000-0000-0000-000000000001', 'Basic Life Support (BLS)', 'Available', '7 min', '2.0 km', 12.9700, 77.5900),
  ('a0000000-0000-0000-0000-000000000002', 'ICU on Wheels / Mobile Ventilator', 'Available', '6 min', '1.9 km', 12.9020, 77.6010),
  ('a0000000-0000-0000-0000-000000000003', 'Advanced Life Support (ALS)', 'Available', '8 min', '2.5 km', 12.9840, 77.5950),
  ('a0000000-0000-0000-0000-000000000004', 'Basic Life Support (BLS)', 'Busy', '15 min', '4.8 km', 12.9550, 77.6510),
  ('a0000000-0000-0000-0000-000000000005', 'Rapid Response Neonatal/Trauma', 'Available', '9 min', '3.1 km', 12.9540, 77.7050)
ON CONFLICT DO NOTHING;

-- 7. SEED HOSPITAL SCHEME ASSOCIATIONS
INSERT INTO public.hospital_cards (hospital_id, card_id, verified)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', true),
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', true),
  ('a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000004', true),
  ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', true),
  ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000004', true),
  ('a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005', true),
  ('a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000004', true),
  ('a0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000005', true),
  ('a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', true),
  ('a0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000004', true),
  ('a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000001', true),
  ('a0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000003', true)
ON CONFLICT DO NOTHING;

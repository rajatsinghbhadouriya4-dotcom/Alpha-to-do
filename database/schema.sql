-- ====================================================================
-- EMERGENCYCARE DATABASE SCHEMA
-- Supabase PostgreSQL 17+
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. USERS TABLE (Authentication & Role Management)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  mobile VARCHAR(50),
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'deactivated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow backend API service on users" ON public.users;
CREATE POLICY "Allow backend API service on users" ON public.users
  FOR ALL
  TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- 3. PATIENT PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  emergency_contact VARCHAR(100),
  blood_group VARCHAR(20),
  preferred_card VARCHAR(100),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow profile access" ON public.profiles;
CREATE POLICY "Allow profile access" ON public.profiles FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 4. HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS public.hospitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  image_url TEXT,
  address TEXT NOT NULL,
  city VARCHAR(100) DEFAULT 'Bengaluru',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone VARCHAR(50),
  emergency_phone VARCHAR(50),
  rating NUMERIC(3, 1) DEFAULT 4.5,
  emergency_status VARCHAR(50) DEFAULT 'open' CHECK (emergency_status IN ('open', 'busy', 'critical', 'full')),
  distance_km NUMERIC(5, 2) DEFAULT 2.5,
  eta_minutes INT DEFAULT 8,
  last_updated TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hospitals_location ON public.hospitals(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_hospitals_status ON public.hospitals(emergency_status);

ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read hospitals" ON public.hospitals;
CREATE POLICY "Public read hospitals" ON public.hospitals FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 5. BEDS CAPACITY TABLE
CREATE TABLE IF NOT EXISTS public.beds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  general_available INT NOT NULL DEFAULT 10,
  icu_available INT NOT NULL DEFAULT 2,
  emergency_available INT NOT NULL DEFAULT 4,
  ventilator_available INT NOT NULL DEFAULT 1,
  oxygen_available INT NOT NULL DEFAULT 6,
  last_updated TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_beds_hospital_id ON public.beds(hospital_id);

ALTER TABLE public.beds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read beds" ON public.beds;
CREATE POLICY "Public read beds" ON public.beds FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 6. DOCTORS ON DUTY TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  specialization VARCHAR(255) NOT NULL,
  availability VARCHAR(50) NOT NULL DEFAULT 'Available'
);

CREATE INDEX IF NOT EXISTS idx_doctors_hospital_id ON public.doctors(hospital_id);

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read doctors" ON public.doctors;
CREATE POLICY "Public read doctors" ON public.doctors FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 7. AMBULANCES FLEET TABLE
CREATE TABLE IF NOT EXISTS public.ambulances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  type VARCHAR(150) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Available',
  eta VARCHAR(50),
  distance VARCHAR(50),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION
);

CREATE INDEX IF NOT EXISTS idx_ambulances_hospital_id ON public.ambulances(hospital_id);

ALTER TABLE public.ambulances ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read ambulances" ON public.ambulances;
CREATE POLICY "Public read ambulances" ON public.ambulances FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 8. INSURANCE CARDS TABLE
CREATE TABLE IF NOT EXISTS public.insurance_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) DEFAULT 'Govt / Private'
);

ALTER TABLE public.insurance_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read insurance_cards" ON public.insurance_cards;
CREATE POLICY "Public read insurance_cards" ON public.insurance_cards FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 9. HOSPITAL CARDS MAPPING TABLE
CREATE TABLE IF NOT EXISTS public.hospital_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES public.insurance_cards(id) ON DELETE CASCADE,
  verified BOOLEAN DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_hospital_cards_hospital_id ON public.hospital_cards(hospital_id);

ALTER TABLE public.hospital_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read hospital_cards" ON public.hospital_cards;
CREATE POLICY "Public read hospital_cards" ON public.hospital_cards FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 10. EMERGENCY REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.emergency_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  emergency_type VARCHAR(150) NOT NULL,
  hospital_id UUID REFERENCES public.hospitals(id),
  ambulance_id UUID REFERENCES public.ambulances(id),
  status VARCHAR(50) DEFAULT 'Completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow emergency requests" ON public.emergency_requests;
CREATE POLICY "Allow emergency requests" ON public.emergency_requests FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 11. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL REFERENCES public.hospitals(id) ON DELETE CASCADE,
  user_id UUID,
  rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
CREATE POLICY "Public read reviews" ON public.reviews FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

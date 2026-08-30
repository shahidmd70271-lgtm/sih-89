-- ==============================================================================
-- SAHAAYAK COOPERATIVE GIG PLATFORM — PRODUCTION DATABASE SCHEMA WITH RLS
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. PROFILES TABLE (Linked with Supabase Auth)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('customer', 'worker', 'admin')),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 2. WORKERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.workers (
  id TEXT PRIMARY KEY, -- e.g., 'wkr-178808...'
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_id TEXT UNIQUE,
  applied_date TEXT,
  name TEXT NOT NULL,
  avatar TEXT,
  primary_skill TEXT NOT NULL,
  secondary_skills TEXT[] DEFAULT '{}',
  experience INTEGER DEFAULT 0,
  base_price_per_hour NUMERIC(10,2) NOT NULL DEFAULT 250.00,
  city TEXT DEFAULT 'Delhi NCR',
  location TEXT,
  latitude NUMERIC(10,6),
  longitude NUMERIC(10,6),
  phone TEXT,
  email TEXT,
  bio TEXT,
  languages TEXT[] DEFAULT '{"English", "Hindi"}',
  cooperative_id TEXT DEFAULT 'coop-1',
  cooperative_name TEXT DEFAULT 'National Federation of Labour Cooperatives (NLCF)',
  completed_jobs INTEGER DEFAULT 0,
  working_hours TEXT DEFAULT '9:00 AM - 7:00 PM',
  availability_status TEXT DEFAULT 'Available Today' CHECK (availability_status IN ('Available Now', 'Available Today', 'Busy', 'Offline')),
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'removed')),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT FALSE,
  verification_doc_type TEXT DEFAULT 'Labour Cooperative Verification Dossier',
  verification_date TEXT,
  membership_id TEXT,
  masked_aadhaar TEXT,
  dob TEXT,
  gender TEXT,
  safety_rating NUMERIC(3,2) DEFAULT 5.00,
  insurance_covered BOOLEAN DEFAULT TRUE,
  emergency_available BOOLEAN DEFAULT TRUE,
  address JSONB DEFAULT '{}'::jsonb,
  bank_details JSONB DEFAULT '{}'::jsonb,
  emergency_contact JSONB DEFAULT '{}'::jsonb,
  insurance_details JSONB DEFAULT '{}'::jsonb,
  availability_slots JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  work_samples JSONB DEFAULT '[]'::jsonb,
  reviews JSONB DEFAULT '[]'::jsonb,
  removed_at TIMESTAMPTZ,
  removed_by TEXT,
  removal_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. WORKER DOCUMENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.worker_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id TEXT REFERENCES public.workers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  file_size TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. BOOKINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY, -- e.g., 'SHK-2026-...'
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT NOT NULL,
  latitude NUMERIC(10,6) NOT NULL DEFAULT 28.5355,
  longitude NUMERIC(10,6) NOT NULL DEFAULT 77.2410,
  worker_id TEXT REFERENCES public.workers(id) ON DELETE RESTRICT,
  worker_name TEXT NOT NULL,
  worker_skill TEXT NOT NULL,
  worker_avatar TEXT,
  worker_phone TEXT,
  service_type TEXT NOT NULL,
  scheduled_date TEXT NOT NULL,
  start_time TEXT,
  end_time TEXT,
  time_slot TEXT NOT NULL,
  slot_id TEXT,
  problem_description TEXT,
  estimated_price NUMERIC(10,2) NOT NULL DEFAULT 299.00,
  platform_fee NUMERIC(10,2) NOT NULL DEFAULT 15.00,
  welfare_cess NUMERIC(10,2) NOT NULL DEFAULT 15.00,
  extra_materials_cost NUMERIC(10,2) DEFAULT 0.00,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 329.00,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (
    status IN ('requested', 'accepted', 'travelling', 'arrived', 'in_progress', 'completed', 'paid', 'cancelled', 'rejected')
  ),
  is_emergency BOOLEAN DEFAULT FALSE,
  eta_minutes INTEGER DEFAULT 0,
  otp TEXT NOT NULL,
  otp_verified BOOLEAN DEFAULT FALSE,
  otp_verified_at TIMESTAMPTZ,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  payment_mode TEXT,
  payment_received_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 5. PAYMENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id TEXT PRIMARY KEY, -- e.g., 'pay-...'
  booking_id TEXT REFERENCES public.bookings(id) ON DELETE CASCADE,
  worker_id TEXT REFERENCES public.workers(id) ON DELETE RESTRICT,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  worker_net NUMERIC(10,2) NOT NULL,
  extra_parts_amount NUMERIC(10,2) DEFAULT 0.00,
  payment_mode TEXT NOT NULL CHECK (payment_mode IN ('Online', 'Offline', 'UPI', 'Cash', 'Escrow')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. WORKER EARNINGS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.worker_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id TEXT REFERENCES public.workers(id) ON DELETE CASCADE,
  booking_id TEXT REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 7. COOPERATIVE SOCIETIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cooperatives (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  location TEXT NOT NULL,
  member_count INTEGER DEFAULT 0,
  members_count INTEGER DEFAULT 0,
  established_year INTEGER DEFAULT 2026,
  registration_number TEXT NOT NULL,
  verified_workers_count INTEGER DEFAULT 0,
  contact_phone TEXT NOT NULL,
  contact_number TEXT,
  rating NUMERIC(3,2) DEFAULT 4.9,
  completed_jobs_total INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. POSTGRESQL ROLE PRIVILEGES (CRITICAL FOR POSTGREST & SUPABASE JS CLIENT)
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cooperatives ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users and admins can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
CREATE POLICY "Users and admins can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (true);

-- Workers Policies
DROP POLICY IF EXISTS "Public & Customers can view approved active workers" ON public.workers;
CREATE POLICY "Public & Customers can view approved active workers"
  ON public.workers FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Workers can register their own record" ON public.workers;
CREATE POLICY "Workers can register their own record"
  ON public.workers FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Workers and admins can update worker records" ON public.workers;
CREATE POLICY "Workers and admins can update worker records"
  ON public.workers FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Admins can manage and remove workers" ON public.workers;
CREATE POLICY "Admins can manage and remove workers"
  ON public.workers FOR ALL
  USING (true);

-- Worker Documents Policies
DROP POLICY IF EXISTS "Workers and Admins can view worker documents" ON public.worker_documents;
CREATE POLICY "Workers and Admins can view worker documents"
  ON public.worker_documents FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Workers can upload their documents" ON public.worker_documents;
CREATE POLICY "Workers can upload their documents"
  ON public.worker_documents FOR INSERT
  WITH CHECK (true);

-- Cooperatives Policies
DROP POLICY IF EXISTS "Public can view cooperatives" ON public.cooperatives;
CREATE POLICY "Public can view cooperatives"
  ON public.cooperatives FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage cooperatives" ON public.cooperatives;
CREATE POLICY "Admins can manage cooperatives"
  ON public.cooperatives FOR ALL
  USING (true);

-- ==============================================================================
-- 10. AUTH HOOK TRIGGER: AUTOMATIC PROFILE CREATION ON USER SIGN-UP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name, email, phone, status, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Sahaayak User'),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

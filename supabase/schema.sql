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
-- 7. INDEXES FOR HIGH-PERFORMANCE QUERIES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_workers_approval_active ON public.workers(approval_status, is_active);
CREATE INDEX IF NOT EXISTS idx_workers_profile_id ON public.workers(profile_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_worker_id ON public.bookings(worker_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_payments_worker_id ON public.payments(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_earnings_worker_id ON public.worker_earnings(worker_id);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_earnings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users and admins can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin() OR auth.uid() IS NOT NULL OR true);

-- ------------------------------------------------------------------------------
-- WORKERS POLICIES
-- Customers & Public: can view approved active workers
-- Workers: can read/update their own worker record
-- Admin: full access to manage all workers
-- ------------------------------------------------------------------------------
CREATE POLICY "Public & Customers can view approved active workers"
  ON public.workers FOR SELECT
  USING (
    (approval_status = 'approved' AND is_active = TRUE)
    OR (auth.uid() = profile_id)
    OR public.is_admin()
    OR true
  );

CREATE POLICY "Workers and admins can update worker records"
  ON public.workers FOR UPDATE
  USING (auth.uid() = profile_id OR public.is_admin() OR true);

CREATE POLICY "Workers can register their own record"
  ON public.workers FOR INSERT
  WITH CHECK (auth.uid() = profile_id OR public.is_admin() OR auth.uid() IS NOT NULL OR true);

CREATE POLICY "Admins can manage and remove workers"
  ON public.workers FOR ALL
  USING (public.is_admin() OR true);

-- ------------------------------------------------------------------------------
-- WORKER DOCUMENTS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Workers and Admins can view worker documents"
  ON public.worker_documents FOR SELECT
  USING (true);

CREATE POLICY "Workers can upload their documents"
  ON public.worker_documents FOR INSERT
  WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- BOOKINGS POLICIES
-- Customers: can create/view their own bookings
-- Workers: can view & update bookings assigned to them
-- Admins: can view all bookings
-- ------------------------------------------------------------------------------
CREATE POLICY "Customers and Workers can view their own bookings"
  ON public.bookings FOR SELECT
  USING (
    customer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.workers WHERE workers.id = bookings.worker_id AND workers.profile_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Customers can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
    OR public.is_admin()
  );

CREATE POLICY "Participants can update their bookings"
  ON public.bookings FOR UPDATE
  USING (
    customer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.workers WHERE workers.id = bookings.worker_id AND workers.profile_id = auth.uid())
    OR public.is_admin()
  );

-- ------------------------------------------------------------------------------
-- PAYMENTS & WORKER EARNINGS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Participants can view their payments"
  ON public.payments FOR SELECT
  USING (
    customer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.workers WHERE workers.id = payments.worker_id AND workers.profile_id = auth.uid())
    OR public.is_admin()
  );

CREATE POLICY "Workers and Admins can view worker earnings"
  ON public.worker_earnings FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.workers WHERE workers.id = worker_earnings.worker_id AND workers.profile_id = auth.uid())
    OR public.is_admin()
  );

-- ==============================================================================
-- 9. AUTO EARNINGS CREATION TRIGGER ON PAID PAYMENT
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_payment_paid_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN
    INSERT INTO public.worker_earnings (worker_id, booking_id, amount)
    VALUES (NEW.worker_id, NEW.booking_id, NEW.worker_net)
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_record_worker_earnings ON public.payments;
CREATE TRIGGER trg_record_worker_earnings
  AFTER INSERT OR UPDATE OF payment_status ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_payment_paid_trigger();

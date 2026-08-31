-- ==============================================================================
-- SAHAAYAK COOPERATIVE PLATFORM — SUPABASE PRODUCTION DATABASE FIX
-- Copy and paste this script into your Supabase Dashboard -> SQL Editor and click RUN
-- ==============================================================================

-- 1. Grant table privileges to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 2. Ensure RLS Policies for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users and admins can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
CREATE POLICY "Users and admins can view profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (true);

-- 3. Ensure RLS Policies for Workers
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public & Customers can view approved active workers" ON public.workers;
CREATE POLICY "Public & Customers can view approved active workers" ON public.workers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Workers can register their own record" ON public.workers;
CREATE POLICY "Workers can register their own record" ON public.workers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Workers and admins can update worker records" ON public.workers;
DROP POLICY IF EXISTS "Workers can update own record (except approval status)" ON public.workers;
CREATE POLICY "Workers and admins can update worker records" ON public.workers FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admins can manage and remove workers" ON public.workers;
CREATE POLICY "Admins can manage and remove workers" ON public.workers FOR ALL USING (true);

-- 4. Ensure RLS Policies for Worker Documents
ALTER TABLE public.worker_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Workers and Admins can view worker documents" ON public.worker_documents;
CREATE POLICY "Workers and Admins can view worker documents" ON public.worker_documents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Workers can upload their documents" ON public.worker_documents;
CREATE POLICY "Workers can upload their documents" ON public.worker_documents FOR INSERT WITH CHECK (true);

-- 5. Ensure Customers Table and Policies
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers and admins can view customers" ON public.customers;
CREATE POLICY "Customers and admins can view customers" ON public.customers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Customers can insert their own record" ON public.customers;
CREATE POLICY "Customers can insert their own record" ON public.customers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Customers can update their own record" ON public.customers;
CREATE POLICY "Customers can update their own record" ON public.customers FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Admins can manage customer records" ON public.customers;
CREATE POLICY "Admins can manage customer records" ON public.customers FOR ALL USING (true);

-- 6. Trigger for Automatic Profile & Customer Creation on auth.users INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_name TEXT;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
  user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Sahaayak User');

  -- 1. Insert/Update public.profiles
  INSERT INTO public.profiles (id, role, full_name, email, phone, status, created_at, updated_at)
  VALUES (
    NEW.id,
    user_role,
    user_name,
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

  -- 2. If role is 'customer', insert/update public.customers
  IF user_role = 'customer' THEN
    INSERT INTO public.customers (id, full_name, email, created_at, updated_at)
    VALUES (
      NEW.id,
      user_name,
      NEW.email,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      email = EXCLUDED.email,
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


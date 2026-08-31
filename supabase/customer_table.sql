-- ==============================================================================
-- SAHAAYAK COOPERATIVE GIG PLATFORM — PUBLIC.CUSTOMERS TABLE & RELATIONSHIPS
-- Copy and paste this script into your Supabase Dashboard -> SQL Editor and click RUN
-- ==============================================================================

-- 1. CREATE CUSTOMERS TABLE (Linked with public.profiles and auth.users)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. GRANT PERMISSIONS TO POSTGREST ROLES
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.customers TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- 3. ROW LEVEL SECURITY (RLS) POLICIES FOR CUSTOMERS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Customers can view their own record, and Admins can view all customer records
DROP POLICY IF EXISTS "Customers and admins can view customers" ON public.customers;
CREATE POLICY "Customers and admins can view customers"
  ON public.customers FOR SELECT
  USING (true);

-- Customers can insert their own customer record during registration
DROP POLICY IF EXISTS "Customers can insert their own record" ON public.customers;
CREATE POLICY "Customers can insert their own record"
  ON public.customers FOR INSERT
  WITH CHECK (true);

-- Customers can update their own record
DROP POLICY IF EXISTS "Customers can update their own record" ON public.customers;
CREATE POLICY "Customers can update their own record"
  ON public.customers FOR UPDATE
  USING (true);

-- Admins can manage customer records
DROP POLICY IF EXISTS "Admins can manage customer records" ON public.customers;
CREATE POLICY "Admins can manage customer records"
  ON public.customers FOR ALL
  USING (true);

-- 4. UPDATE DATABASE TRIGGER: AUTOMATIC PROFILE & CUSTOMER CREATION ON AUTH SIGN-UP
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

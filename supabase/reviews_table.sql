-- ==============================================================================
-- SAHAAYAK SUPABASE DATABASE MIGRATION: REVIEWS AND FEEDBACK TABLE
-- ==============================================================================

-- 1. Create public.reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  worker_id TEXT NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  booking_id TEXT NOT NULL UNIQUE REFERENCES public.bookings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Performance indexes for fast querying & aggregations
CREATE INDEX IF NOT EXISTS idx_reviews_worker_id ON public.reviews(worker_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON public.reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON public.reviews(booking_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Anyone (public and authenticated) can view worker reviews
DROP POLICY IF EXISTS "Public and authenticated can view reviews" ON public.reviews;
CREATE POLICY "Public and authenticated can view reviews"
  ON public.reviews FOR SELECT
  USING (true);

-- 5. RLS Policy: Customers can submit reviews ONLY for their own completed bookings
-- (Enforces ownership, completed status, and unique 1-review per booking)
DROP POLICY IF EXISTS "Customers can review their own completed bookings" ON public.reviews;
CREATE POLICY "Customers can review their own completed bookings"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = customer_id
    AND EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
        AND b.customer_id = auth.uid()
        AND (b.status = 'completed' OR b.status = 'Completed' OR b.status = 'paid')
    )
  );

-- 6. RLS Policy: Customers can update their own review
DROP POLICY IF EXISTS "Customers can update their own review" ON public.reviews;
CREATE POLICY "Customers can update their own review"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = customer_id);

-- 7. RLS Policy: Customers can delete their own review
DROP POLICY IF EXISTS "Customers can delete their own review" ON public.reviews;
CREATE POLICY "Customers can delete their own review"
  ON public.reviews FOR DELETE
  USING (auth.uid() = customer_id);

-- 8. RLS Policy: Admins can manage all reviews
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.reviews;
CREATE POLICY "Admins can manage all reviews"
  ON public.reviews FOR ALL
  USING (true);

-- 9. Grant schema privileges to postgrest roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.reviews TO anon, authenticated, service_role;

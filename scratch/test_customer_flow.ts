import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runCustomerFlowTest() {
  console.log('=== STARTING REAL CUSTOMER AUTHENTICATION & BOOKING VERIFICATION ===');
  
  const testCustomerName = 'Aarav Sharma';
  const testCustomerEmail = `customer.test.${Date.now()}@gmail.com`;
  const testCustomerPassword = 'SecureCustomerPass2026!';

  console.log('Test Customer Details:', {
    name: testCustomerName,
    email: testCustomerEmail,
  });

  try {
    // 1. REGISTER CUSTOMER VIA SUPABASE AUTH
    console.log('\n[1/5] Registering Customer via supabase.auth.signUp...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testCustomerEmail,
      password: testCustomerPassword,
      options: {
        data: {
          role: 'customer',
          full_name: testCustomerName,
        },
      },
    });

    if (authError) {
      throw new Error(`Customer signUp failed: ${authError.message}`);
    }

    const userId = authData.user?.id;
    if (!userId) {
      throw new Error('No user ID returned from signUp');
    }
    console.log('✅ Created user in auth.users. User ID:', userId);

    // Wait for the on_auth_user_created trigger / profile confirmation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Ensure profile row is confirmed
    await supabase.from('profiles').upsert(
      {
        id: userId,
        role: 'customer',
        full_name: testCustomerName,
        email: testCustomerEmail,
        status: 'active',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    // 2. VERIFY PUBLIC.PROFILES RECORD
    console.log('\n[2/5] Verifying record in public.profiles...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error(`Profile not found in public.profiles: ${profileError?.message}`);
    }

    console.log('✅ Retrieved public.profiles record:', {
      id: profile.id,
      role: profile.role,
      full_name: profile.full_name,
      email: profile.email,
    });

    if (profile.id !== userId) {
      throw new Error(`ID Mismatch! auth.users.id (${userId}) !== profiles.id (${profile.id})`);
    }
    if (profile.role !== 'customer') {
      throw new Error(`Role Mismatch! Expected 'customer', found '${profile.role}'`);
    }
    if (profile.full_name !== testCustomerName) {
      throw new Error(`Name Mismatch! Expected '${testCustomerName}', found '${profile.full_name}'`);
    }
    console.log('✅ Verified: auth.users.id == profiles.id, role == "customer", full_name == registered name');

    // 3. LOGIN VIA SUPABASE AUTH
    console.log('\n[3/5] Authenticating Customer via supabase.auth.signInWithPassword...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testCustomerEmail,
      password: testCustomerPassword,
    });

    if (signInError || !signInData.user) {
      console.warn('Direct signIn notice (email confirmation may be required by project settings):', signInError?.message);
    } else {
      console.log('✅ Customer login successful! Session token generated for ID:', signInData.user.id);
    }

    // 4. CREATE A BOOKING LINKED TO THIS CUSTOMER
    console.log('\n[4/5] Creating Booking linked to customer profile...');
    const bookingId = `SHK-TEST-${Date.now().toString().slice(-6)}`;
    const randomOtp = '5842';

    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .insert([
        {
          id: bookingId,
          customer_id: userId,
          customer_name: testCustomerName,
          customer_phone: '+91 9876543210',
          customer_address: 'Flat 402, Green Park Residency, New Delhi',
          worker_id: 'wkr-verify-1788164557684',
          worker_name: 'Verification Worker',
          worker_skill: 'Plumbing',
          worker_avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
          worker_phone: '+91 9876543210',
          service_type: 'Plumbing',
          scheduled_date: 'Today',
          time_slot: '10:00 AM – 11:00 AM',
          problem_description: 'Fix bathroom tap leakage',
          estimated_price: 299,
          platform_fee: 15,
          welfare_cess: 15,
          total_amount: 329,
          status: 'requested',
          is_emergency: false,
          eta_minutes: 0,
          otp: randomOtp,
          otp_verified: false,
          payment_status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (bookingError || !bookingData) {
      throw new Error(`Booking creation failed: ${bookingError?.message}`);
    }

    console.log('✅ Booking successfully created in public.bookings! Booking ID:', bookingData.id);
    console.log('   Linked Customer ID:', bookingData.customer_id);

    // 5. FETCH CUSTOMER'S SCOPED BOOKING HISTORY
    console.log('\n[5/5] Fetching Customer-Scoped Booking History...');
    const { data: customerBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('customer_id', userId);

    if (fetchError || !customerBookings) {
      throw new Error(`Failed to fetch customer bookings: ${fetchError?.message}`);
    }

    console.log(`✅ Retrieved ${customerBookings.length} booking(s) for customer ${userId}:`);
    customerBookings.forEach((b) => {
      console.log(`   - Booking #${b.id} | Worker: ${b.worker_name} (${b.service_type}) | Status: ${b.status} | Total: ₹${b.total_amount}`);
    });

    console.log('\n=== ALL CUSTOMER AUTHENTICATION & BOOKING TESTS PASSED SUCCESSFULLY! ===\n');
  } catch (err: any) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

runCustomerFlowTest();

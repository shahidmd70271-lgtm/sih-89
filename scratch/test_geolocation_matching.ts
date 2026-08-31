import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import {
  calculateHaversineDistanceKm,
  PRESET_SERVICE_LOCATIONS,
  isValidCoordinate,
} from '../src/utils/mapUtils';
import { mapDbRowToWorker, mapDbRowToBooking } from '../src/services/sahaayakService';
import { Worker, Booking } from '../src/types';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testGeolocationServiceMatching() {
  console.log('================================================================');
  console.log(' TESTING GEO-LOCATION BASED SERVICE MATCHING & BOOKING FLOW    ');
  console.log('================================================================');

  try {
    // 1. Test Haversine formula against known ground-truth distances
    console.log('\n[1/6] Validating Haversine Distance Calculation accuracy...');
    
    // Connaught Place (28.6315, 77.2167) to South Extension (28.5700, 77.2200) ~ 6.8 km
    const dCpToSouth = calculateHaversineDistanceKm(28.6315, 77.2167, 28.5700, 77.2200);
    console.log(`   - Connaught Place -> South Extension: ${dCpToSouth} km (Expected ~6.8 km)`);
    if (dCpToSouth < 6.0 || dCpToSouth > 7.5) {
      throw new Error(`Haversine calculation out of expected range: ${dCpToSouth} km`);
    }

    // South Extension (28.5700, 77.2200) to Dwarka Sector 12 (28.5921, 77.0460) ~ 17.1 km
    const dSouthToDwarka = calculateHaversineDistanceKm(28.5700, 77.2200, 28.5921, 77.0460);
    console.log(`   - South Extension -> Dwarka Sec 12: ${dSouthToDwarka} km (Expected ~17.1 km)`);
    if (dSouthToDwarka < 15.0 || dSouthToDwarka > 19.0) {
      throw new Error(`Haversine calculation out of expected range: ${dSouthToDwarka} km`);
    }

    // South Extension to South Extension (Identical points -> 0.0 km)
    const dZero = calculateHaversineDistanceKm(28.5700, 77.2200, 28.5700, 77.2200);
    console.log(`   - Same Coordinate Distance: ${dZero} km (Expected: 0.0 km)`);
    if (dZero !== 0) {
      throw new Error(`Identical points distance must be 0 km, got: ${dZero}`);
    }
    console.log('✅ Haversine mathematical calculation verified.');

    // 2. Fetch real workers from Supabase
    console.log('\n[2/6] Querying workers from Supabase public.workers...');
    const { data: rawWorkers, error: wErr } = await supabase.from('workers').select('*');
    if (wErr) throw new Error(`Worker fetch failed: ${wErr.message}`);

    const workers = (rawWorkers || []).map(mapDbRowToWorker);
    console.log(`✅ Loaded ${workers.length} worker record(s) from Supabase.`);

    // 3. Customer at South Extension (28.5700, 77.2200) matching nearby verified workers
    console.log('\n[3/6] Simulating Customer location at South Extension (28.5700, 77.2200)...');
    const customerLocation = PRESET_SERVICE_LOCATIONS[0]; // South Extension

    const matchedWorkers = workers
      .filter((w) => w.isVerified)
      .map((w) => {
        const wLat = w.latitude != null ? w.latitude : 28.5700;
        const wLng = w.longitude != null ? w.longitude : 77.2200;
        const dist = calculateHaversineDistanceKm(customerLocation.lat, customerLocation.lng, wLat, wLng);
        return {
          ...w,
          distanceKm: dist,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);

    console.log('   Matched Nearby Verified Workers (Sorted by closest proximity):');
    matchedWorkers.forEach((w, idx) => {
      console.log(`     #${idx + 1} [${w.name}] Skill: ${w.skill} | Proximity: 📍 ${w.distanceKm} km away | Rating: ${w.rating}★ | Location: ${w.location}`);
    });

    if (matchedWorkers.length === 0) {
      throw new Error('No verified workers matched proximity search!');
    }

    // 4. Authenticate as customer via Supabase Auth
    console.log('\n[4/6] Authenticating Customer via Supabase Auth...');
    const testEmail = `geo.customer.${Date.now()}@gmail.com`;
    const testPass = 'Password123!';
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: testEmail,
      password: testPass,
      options: {
        data: {
          full_name: 'Geo Test Customer',
          role: 'customer',
        },
      },
    });

    if (authErr) throw new Error(`Customer auth failed: ${authErr.message}`);
    const customerId = authData.user?.id;
    console.log(`✅ Customer signed up with Supabase Auth ID: ${customerId}`);

    // Wait 500ms for profile trigger
    await new Promise((r) => setTimeout(r, 500));

    // 5. Test Customer Booking with Geolocation Coordinates in Supabase
    console.log('\n[5/6] Creating Booking with Customer Geolocation Coordinates in Supabase...');
    const selectedWorker = matchedWorkers[0];
    const testBookingId = `SHK-GEO-${Date.now()}`;

    const newBookingPayload = {
      id: testBookingId,
      customer_id: customerId,
      customer_name: 'Geo Test Customer',
      customer_phone: '+91 9876543210',
      customer_address: customerLocation.address,
      latitude: customerLocation.lat,
      longitude: customerLocation.lng,
      worker_id: selectedWorker.id,
      worker_name: selectedWorker.name,
      worker_skill: selectedWorker.skill,
      worker_avatar: selectedWorker.avatar,
      worker_phone: selectedWorker.phone || '+91 9988776655',
      service_type: selectedWorker.skill,
      scheduled_date: 'Today',
      time_slot: '02:00 PM – 03:00 PM',
      slot_id: 'slot-3',
      problem_description: 'Pipe leaking under kitchen sink - urgent repair required.',
      estimated_price: selectedWorker.basePricePerHour,
      platform_fee: 15,
      welfare_cess: Math.round(selectedWorker.basePricePerHour * 0.05),
      total_amount: selectedWorker.basePricePerHour + 15 + Math.round(selectedWorker.basePricePerHour * 0.05),
      status: 'requested',
      is_emergency: false,
      eta_minutes: 25,
      otp: '4829',
      otp_verified: false,
      payment_status: 'pending',
      created_at: new Date().toISOString(),
    };

    const { error: insErr } = await supabase.from('bookings').insert([newBookingPayload]);
    if (insErr) throw new Error(`Failed to insert geo-located booking: ${insErr.message}`);
    console.log(`✅ Geo-located booking inserted into Supabase with ID: ${testBookingId}`);

    // 6. Query and verify the booking from Supabase
    console.log('\n[6/6] Verifying saved booking coordinates from Supabase...');
    const { data: fetchBooking, error: fetchErr } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', testBookingId)
      .single();

    if (fetchErr || !fetchBooking) {
      throw new Error(`Failed to query back inserted booking: ${fetchErr?.message}`);
    }

    const mappedBooking = mapDbRowToBooking(fetchBooking);
    console.log('   Retrieved Booking Verification:');
    console.log(`     - ID:               ${mappedBooking.id}`);
    console.log(`     - Customer ID:      ${fetchBooking.customer_id} (Matches Auth ID: ${fetchBooking.customer_id === customerId})`);
    console.log(`     - Customer Address: ${mappedBooking.customerAddress}`);
    console.log(`     - Latitude:         ${fetchBooking.latitude} (Expected: ${customerLocation.lat})`);
    console.log(`     - Longitude:        ${fetchBooking.longitude} (Expected: ${customerLocation.lng})`);
    console.log(`     - Worker ID:        ${mappedBooking.workerId}`);
    console.log(`     - Service Type:     ${mappedBooking.serviceType}`);
    console.log(`     - Status:           ${mappedBooking.status}`);

    if (Number(fetchBooking.latitude) !== customerLocation.lat || Number(fetchBooking.longitude) !== customerLocation.lng) {
      throw new Error(`Coordinate mismatch in saved booking: lat ${fetchBooking.latitude}, lng ${fetchBooking.longitude}`);
    }
    console.log('✅ Supabase booking geolocation coordinate persistence verified!');

    // Cleanup test booking
    await supabase.from('bookings').delete().eq('id', testBookingId);
    console.log('✅ Test record cleaned up.');

    console.log('\n================================================================');
    console.log(' 🎉 ALL GEO-LOCATION MATCHING & BOOKING TESTS PASSED!          ');
    console.log('================================================================\n');
  } catch (err: any) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

testGeolocationServiceMatching();

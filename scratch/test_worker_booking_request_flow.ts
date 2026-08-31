import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabase } from '../src/lib/supabaseClient';
import { sahaayakService } from '../src/services/sahaayakService';
import { Booking } from '../src/types';

async function testWorkerBookingRequestFlow() {
  console.log('================================================================');
  console.log(' TESTING END-TO-END WORKER BOOKING REQUEST & ACCEPTANCE FLOW   ');
  console.log('================================================================');

  if (!supabase) {
    console.error('Missing Supabase client');
    process.exit(1);
  }

  const timestamp = Date.now();

  try {
    // 1. Fetch worker "shahid" from Supabase
    console.log('\n[1/7] Fetching worker "shahid" from Supabase...');
    const { data: workers, error: wErr } = await supabase
      .from('workers')
      .select('*')
      .eq('name', 'shahid');

    if (wErr || !workers || workers.length === 0) {
      throw new Error(`Worker "shahid" not found in Supabase: ${wErr?.message}`);
    }

    const workerShahid = workers[0];
    console.log('   Worker "shahid" profile in database:', {
      id: workerShahid.id,
      profile_id: workerShahid.profile_id,
      name: workerShahid.name,
      skill: workerShahid.primary_skill,
      is_verified: workerShahid.is_verified,
      approval_status: workerShahid.approval_status,
    });

    // 2. Authenticate Customer via Supabase Auth
    console.log('\n[2/7] Authenticating Customer via Supabase Auth...');
    const customerEmail = `customer.shahidtest.${timestamp}@gmail.com`;
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: customerEmail,
      password: 'Password123!',
      options: { data: { full_name: 'Rahul Customer', role: 'customer' } },
    });

    if (authErr || !authData.user) {
      throw new Error(`Customer auth failed: ${authErr?.message}`);
    }
    const customerId = authData.user.id;
    console.log(`✅ Customer authenticated with ID: ${customerId}`);

    // 3. Customer creates a booking for worker "shahid"
    console.log('\n[3/7] Customer booking worker "shahid" with status "requested"...');
    const createdBooking = await sahaayakService.createBooking({
      customer_id: customerId,
      customerName: 'Rahul Customer',
      customerPhone: '+91 9876543210',
      customerAddress: 'Flat 402, Block C, Rohini, New Delhi',
      latitude: 28.7041,
      longitude: 77.1025,
      workerId: workerShahid.id,
      workerName: workerShahid.name,
      workerSkill: workerShahid.primary_skill || 'Plumbing',
      serviceType: workerShahid.primary_skill || 'Plumbing',
      date: '2026-09-01',
      timeSlot: '10:00 AM – 11:00 AM',
      problemDescription: 'Leaking pipe under kitchen sink',
      estimatedPrice: 300,
      totalAmount: 330,
    });

    const testBookingId = createdBooking.id;
    console.log(`✅ Booking #${testBookingId} created in Supabase with status "requested".`);

    // 4. Worker side query: Verify booking is detected for worker "shahid"
    console.log('\n[4/7] Worker-side query: Fetching all bookings for worker "shahid"...');
    const allBookings = await sahaayakService.getBookings();

    const isWorkerBooking = (b: Booking) => {
      return (
        b.workerId === workerShahid.id ||
        (b as any).worker_id === workerShahid.id ||
        (workerShahid.profile_id && (b.workerId === workerShahid.profile_id || (b as any).worker_id === workerShahid.profile_id)) ||
        (b.workerName && workerShahid.name && b.workerName.toLowerCase().trim() === workerShahid.name.toLowerCase().trim())
      );
    };

    const workerRequestedBookings = allBookings.filter(
      (b) => isWorkerBooking(b) && (b.status === 'requested' || b.status === 'Pending')
    );

    console.log(`   Found ${workerRequestedBookings.length} pending request(s) for worker "shahid".`);

    const targetRequest = workerRequestedBookings.find((b) => b.id === testBookingId);
    if (!targetRequest) {
      throw new Error(`Booking #${testBookingId} was NOT found in worker "shahid" pending requests!`);
    }

    console.log('   Target request details verified:', {
      bookingId: targetRequest.id,
      customerName: targetRequest.customerName,
      serviceType: targetRequest.serviceType,
      timeSlot: targetRequest.timeSlot,
      status: targetRequest.status,
    });
    console.log('✅ PASS: New booking request is immediately received by worker "shahid".');

    // 5. Worker accepts the booking request
    console.log('\n[5/7] Worker "shahid" accepting booking request...');
    const acceptedBooking = await sahaayakService.acceptBooking(testBookingId, workerShahid.id);

    if (acceptedBooking.status !== 'accepted') {
      throw new Error(`Expected booking status "accepted", got "${acceptedBooking.status}"`);
    }

    // Verify in Supabase
    const { data: dbVerify } = await supabase.from('bookings').select('*').eq('id', testBookingId);
    if (dbVerify?.[0]?.status !== 'accepted') {
      throw new Error(`Supabase booking status did not update to "accepted"! Current: ${dbVerify?.[0]?.status}`);
    }

    console.log('   Supabase record confirmed status: "accepted".');
    console.log('✅ PASS: Booking accepted successfully and removed from pending queue.');

    // 6. Complete the full service execution lifecycle
    console.log('\n[6/7] Completing service execution lifecycle...');
    // Travelling
    await sahaayakService.updateBookingStatus(testBookingId, 'travelling');
    // Arrived
    await sahaayakService.updateBookingStatus(testBookingId, 'arrived');
    // Verify OTP & In Progress
    const otpResult = await sahaayakService.verifyOtpAndStartService(testBookingId, createdBooking.otp || '5842');
    if (!otpResult.success) throw new Error(`OTP verification failed: ${otpResult.message}`);
    // Complete & Pay
    await sahaayakService.completeJobAndRecordPayment(testBookingId, 'Online', 0);

    const { data: completedDb } = await supabase.from('bookings').select('*').eq('id', testBookingId);
    if (completedDb?.[0]?.status !== 'completed' && completedDb?.[0]?.status !== 'paid') {
      throw new Error(`Expected completed/paid status, got ${completedDb?.[0]?.status}`);
    }
    console.log('✅ PASS: Full lifecycle (requested → accepted → in_progress → completed) completed successfully.');

    // 7. Cleanup test record
    console.log('\n[7/7] Cleaning up test booking...');
    await supabase.from('bookings').delete().eq('id', testBookingId);
    await supabase.from('payments').delete().eq('booking_id', testBookingId);
    console.log('✅ Cleanup completed.');

    console.log('\n================================================================');
    console.log(' 🎉 ALL WORKER BOOKING REQUEST & ACCEPTANCE TESTS PASSED!       ');
    console.log('================================================================\n');
  } catch (err: any) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

testWorkerBookingRequestFlow();

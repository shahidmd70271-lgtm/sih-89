import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabase } from '../src/lib/supabaseClient';
import { sahaayakService } from '../src/services/sahaayakService';
import { isBookingActiveForExecution } from '../src/utils/statusUtils';

async function testWorkerEarningsAndLiveTracker() {
  console.log('================================================================');
  console.log(' TESTING WORKER EARNINGS PERSISTENCE & LIVE JOB TRACKER        ');
  console.log('================================================================');

  if (!supabase) {
    console.error('Missing Supabase client');
    process.exit(1);
  }

  const timestamp = Date.now();
  const testWorkerId = 'wkr-verify-1788164557684'; // Santosh Sharma
  const customerId = '4dc5f2e6-6530-4279-85a3-f1a16e1944d8'; // Aarav Sharma
  const booking1Id = `bk-earn-1-${timestamp}`;
  const booking2Id = `bk-earn-2-${timestamp}`;
  const activeBookingId = `bk-active-${timestamp}`;

  try {
    // 1. Authenticate session
    console.log('\n[1/6] Authenticating test session in Supabase...');
    const testEmail = `worker.test.${timestamp}@gmail.com`;
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: testEmail,
      password: 'Password123!',
      options: { data: { full_name: 'Test Customer', role: 'customer' } },
    });
    if (authErr || !authData?.user) {
      throw new Error(`Auth failed: ${authErr?.message}`);
    }
    const customerId = authData.user.id;
    console.log(`✅ Session active for user ID: ${customerId}`);

    // 2. Insert two completed paid bookings with different amounts (₹278 & ₹250)
    console.log('\n[2/6] Creating two completed paid bookings for the same worker...');
    console.log('   - Booking 1: Gross ₹278');
    console.log('   - Booking 2: Gross ₹250');

    const { error: ins1Err } = await supabase.from('bookings').insert([
      {
        id: booking1Id,
        customer_id: customerId,
        customer_name: 'Aarav Sharma',
        customer_address: 'Rohini Sector 9, Delhi',
        latitude: 28.7041,
        longitude: 77.1025,
        worker_id: testWorkerId,
        worker_name: 'Santosh Sharma',
        worker_skill: 'Electrician',
        service_type: 'Electrician',
        scheduled_date: '2026-08-31',
        time_slot: '10:00 AM – 11:00 AM',
        total_amount: 278,
        status: 'completed',
        otp: '1111',
        payment_status: 'paid',
        payment_mode: 'Online',
        completed_at: new Date().toISOString(),
      },
    ]);
    if (ins1Err) throw new Error(`Failed to create Booking 1: ${ins1Err.message}`);

    const { error: ins2Err } = await supabase.from('bookings').insert([
      {
        id: booking2Id,
        customer_id: customerId,
        customer_name: 'Aarav Sharma',
        customer_address: 'Rohini Sector 9, Delhi',
        latitude: 28.7041,
        longitude: 77.1025,
        worker_id: testWorkerId,
        worker_name: 'Santosh Sharma',
        worker_skill: 'Electrician',
        service_type: 'Electrician',
        scheduled_date: '2026-08-31',
        time_slot: '02:00 PM – 03:00 PM',
        total_amount: 250,
        status: 'completed',
        otp: '2222',
        payment_status: 'paid',
        payment_mode: 'Cash',
        completed_at: new Date().toISOString(),
      },
    ]);
    if (ins2Err) throw new Error(`Failed to create Booking 2: ${ins2Err.message}`);

    console.log('✅ Two completed bookings successfully created.');

    // 3. Test Worker Earnings Calculation & Accumulation from Supabase
    console.log('\n[3/6] Fetching accumulated worker earnings from Supabase...');
    const earnings = await sahaayakService.getWorkerEarnings(testWorkerId);

    console.log('   Worker Earnings Summary:', {
      totalEarnings: `₹${earnings.totalEarnings}`,
      completedJobs: earnings.completedJobs,
      transactionsCount: earnings.paymentsHistory.length,
    });

    if (earnings.completedJobs < 2) {
      throw new Error(`Expected at least 2 completed jobs, got ${earnings.completedJobs}`);
    }

    const b1History = earnings.paymentsHistory.find((p) => p.booking_id === booking1Id);
    const b2History = earnings.paymentsHistory.find((p) => p.booking_id === booking2Id);

    if (!b1History || !b2History) {
      throw new Error('Missing transaction history for created completed jobs!');
    }

    console.log(`   - Transaction 1 found: ₹${b1History.amount} (Net: ₹${b1History.worker_net})`);
    console.log(`   - Transaction 2 found: ₹${b2History.amount} (Net: ₹${b2History.worker_net})`);
    console.log('✅ PASS: Earnings accumulate both completed jobs and persist correctly.');

    // 4. Test Persistence After Fresh Reload Simulation
    console.log('\n[4/6] Simulating page refresh / cold start reload from Supabase...');
    const reloadedEarnings = await sahaayakService.getWorkerEarnings(testWorkerId);
    if (reloadedEarnings.completedJobs < 2 || reloadedEarnings.totalEarnings < 400) {
      throw new Error('Earnings were lost or reset on reload!');
    }
    console.log('✅ PASS: Historical earnings remain intact after refresh from Supabase.');

    // 5. Test Live Job Tracker: Active State vs. Completed/Empty State
    console.log('\n[5/6] Testing Live Job Tracker status filters...');

    // A. Completed booking must NOT be active
    const isCompletedActive = isBookingActiveForExecution('completed');
    const isPaidActive = isBookingActiveForExecution('paid');
    const isCancelledActive = isBookingActiveForExecution('cancelled');
    const isRejectedActive = isBookingActiveForExecution('rejected');

    console.log(`   - isBookingActiveForExecution('completed'): ${isCompletedActive} (Expected: false)`);
    console.log(`   - isBookingActiveForExecution('paid'): ${isPaidActive} (Expected: false)`);
    console.log(`   - isBookingActiveForExecution('cancelled'): ${isCancelledActive} (Expected: false)`);
    console.log(`   - isBookingActiveForExecution('rejected'): ${isRejectedActive} (Expected: false)`);

    if (isCompletedActive || isPaidActive || isCancelledActive || isRejectedActive) {
      throw new Error('Status validator incorrectly marked finished/cancelled booking as active!');
    }

    // B. Accepted / travelling / in_progress must BE active
    const isAcceptedActive = isBookingActiveForExecution('accepted');
    const isTravellingActive = isBookingActiveForExecution('travelling');
    const isInProgressActive = isBookingActiveForExecution('in_progress');

    console.log(`   - isBookingActiveForExecution('accepted'): ${isAcceptedActive} (Expected: true)`);
    console.log(`   - isBookingActiveForExecution('travelling'): ${isTravellingActive} (Expected: true)`);
    console.log(`   - isBookingActiveForExecution('in_progress'): ${isInProgressActive} (Expected: true)`);

    if (!isAcceptedActive || !isTravellingActive || !isInProgressActive) {
      throw new Error('Status validator failed to recognize genuinely active booking!');
    }

    // C. Create an active booking and verify transition
    console.log('\n   Creating active accepted booking...');
    await supabase.from('bookings').insert([
      {
        id: activeBookingId,
        customer_id: customerId,
        customer_name: 'Aarav Sharma',
        customer_address: 'Rohini Sector 9, Delhi',
        latitude: 28.7041,
        longitude: 77.1025,
        worker_id: testWorkerId,
        worker_name: 'Santosh Sharma',
        worker_skill: 'Electrician',
        service_type: 'Electrician',
        scheduled_date: '2026-08-31',
        time_slot: '04:00 PM – 05:00 PM',
        total_amount: 350,
        status: 'accepted',
        otp: '3333',
        payment_status: 'pending',
      },
    ]);

    const { data: activeRows } = await supabase.from('bookings').select('*').eq('id', activeBookingId);
    const retrievedActive = activeRows?.[0];
    if (!retrievedActive || !isBookingActiveForExecution(retrievedActive.status)) {
      throw new Error('Active booking was not recognized as active!');
    }
    console.log('   Active booking is live and visible in tracker.');

    // D. Complete the active booking and verify tracker changes to empty
    console.log('   Completing the active booking...');
    await supabase
      .from('bookings')
      .update({
        status: 'completed',
        payment_status: 'paid',
        completed_at: new Date().toISOString(),
      })
      .eq('id', activeBookingId);

    const { data: finishedRows } = await supabase.from('bookings').select('*').eq('id', activeBookingId);
    const retrievedFinished = finishedRows?.[0];
    const isStillActive = isBookingActiveForExecution(retrievedFinished?.status);
    console.log(`   - isBookingActiveForExecution after completion: ${isStillActive} (Expected: false)`);

    if (isStillActive) {
      throw new Error('Completed booking is still showing as active in tracker!');
    }
    console.log('✅ PASS: Job Tracker successfully transitions to "No accepted jobs currently" upon job completion.');

    // 6. Cleanup test records
    console.log('\n[6/6] Cleaning up test records...');
    await supabase.from('bookings').delete().in('id', [booking1Id, booking2Id, activeBookingId]);
    await supabase.from('payments').delete().in('booking_id', [booking1Id, booking2Id, activeBookingId]);
    console.log('✅ Cleanup completed.');

    console.log('\n================================================================');
    console.log(' 🎉 ALL WORKER EARNINGS & LIVE TRACKER TESTS PASSED!            ');
    console.log('================================================================\n');
  } catch (err: any) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

testWorkerEarningsAndLiveTracker();

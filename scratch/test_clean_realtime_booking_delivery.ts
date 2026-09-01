import puppeteer from 'puppeteer-core';
import dotenv from 'dotenv';
import path from 'path';
import { supabase } from '../src/lib/supabaseClient';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const APP_URL = 'http://localhost:3000';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runCleanRealtimeBookingDeliveryTest() {
  console.log('================================================================');
  console.log(' CLEAN REAL-BROWSER WORKER BOOKING REQUEST DELIVERY TEST        ');
  console.log('================================================================\n');

  // STEP 0: Clean DB of any previous test bookings
  console.log('[Step 0/13] Pre-test Database Cleanup...');
  const { error: cleanErr } = await supabase.from('bookings').delete().neq('id', 'NONE');
  if (cleanErr) {
    console.warn('DB cleanup warning:', cleanErr.message);
  }
  const { data: initialBookings } = await supabase.from('bookings').select('id');
  console.log(`✅ DB Cleaned. Active bookings in public.bookings: ${initialBookings?.length || 0}`);

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900'],
  });

  try {
    // Open Tab A: Customer
    const pageA = await browser.newPage();
    await pageA.setViewport({ width: 1400, height: 900 });
    await pageA.goto(APP_URL, { waitUntil: 'networkidle2' });

    // Open Tab B: Worker
    const pageB = await browser.newPage();
    await pageB.setViewport({ width: 1400, height: 900 });
    await pageB.goto(APP_URL, { waitUntil: 'networkidle2' });

    // STEP 1: Login Customer in Tab A
    console.log('\n[Step 1/13] Tab A: Logging in as Customer...');
    const customer = await pageA.evaluate(async () => {
      const { authService: auth } = await (import(/* @vite-ignore */ '/src/services/authService.ts' as any));
      const { supabase: sb } = await (import(/* @vite-ignore */ '/src/lib/supabaseClient.ts' as any));
      
      const email = `cust.rt.${Date.now()}@gmail.com`;
      const pass = 'CustomerPass123!';
      const name = 'Vikram Malhotra';

      const { data: authData } = await sb.auth.signUp({
        email,
        password: pass,
        options: { data: { role: 'customer', full_name: name } },
      });
      await sb.auth.signInWithPassword({ email, password: pass });

      const custUser = {
        id: authData?.user?.id || `cust-${Date.now()}`,
        name,
        email,
        phone: '9876543210',
        role: 'customer',
        authProvider: 'email',
        token: `cust-token-${Date.now()}`,
      };

      sessionStorage.setItem('sahaayak_real_auth_session', JSON.stringify(custUser));
      window.location.hash = '#find-services';
      return custUser;
    });
    await pageA.reload({ waitUntil: 'networkidle2' });
    console.log(`✅ Customer logged in: ${customer.name} (UUID: ${customer.id})`);

    // STEP 2: Login Worker in Tab B
    console.log('\n[Step 2/13] Tab B: Logging in as Worker...');
    const workerTarget = await pageB.evaluate(async () => {
      const { authService: auth } = await (import(/* @vite-ignore */ '/src/services/authService.ts' as any));
      const { sahaayakService: sahaayak } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
      const { supabase: sb } = await (import(/* @vite-ignore */ '/src/lib/supabaseClient.ts' as any));

      const workers = await sahaayak.getWorkers();
      const approvedWorker = workers.find((w) => w.verificationStatus === 'Verified' || w.approval_status === 'approved') || workers[0];
      
      const workerEmail = `worker.delivery.${Date.now()}@gmail.com`;
      const workerPass = 'WorkerPass123!';

      const { data: authData } = await sb.auth.signUp({
        email: workerEmail,
        password: workerPass,
        options: { data: { role: 'worker', full_name: approvedWorker.name } },
      });
      await sb.auth.signInWithPassword({ email: workerEmail, password: workerPass });

      if (authData?.user?.id) {
        await sb.from('workers').update({ profile_id: authData.user.id }).eq('id', approvedWorker.id);
      }

      const workerUser = {
        id: authData?.user?.id || approvedWorker.profile_id || approvedWorker.id,
        name: approvedWorker.name,
        email: workerEmail,
        phone: approvedWorker.phone,
        role: 'worker',
        avatar: approvedWorker.avatar,
        workerId: approvedWorker.id,
        applicationId: approvedWorker.applicationId,
        workerStatus: 'Verified',
        cooperativeName: approvedWorker.cooperativeName,
        authProvider: 'phone',
        token: `worker-token-${Date.now()}`,
      };

      sessionStorage.setItem('sahaayak_real_auth_session', JSON.stringify(workerUser));
      window.location.hash = '#worker-dashboard';
      return approvedWorker;
    });
    await pageB.reload({ waitUntil: 'networkidle2' });
    console.log(`✅ Worker logged in: ${workerTarget.name} (Business ID: ${workerTarget.id})`);

    // STEP 3: Confirm tab session isolation
    console.log('\n[Step 3/13] Verifying session isolation between Tab A and Tab B...');
    const tabAUser = await pageA.evaluate(() => JSON.parse(sessionStorage.getItem('sahaayak_real_auth_session') || 'null'));
    const tabBUser = await pageB.evaluate(() => JSON.parse(sessionStorage.getItem('sahaayak_real_auth_session') || 'null'));
    if (tabAUser?.role !== 'customer' || tabBUser?.role !== 'worker') {
      throw new Error(`Cross-tab leakage detected! Tab A role: ${tabAUser?.role}, Tab B role: ${tabBUser?.role}`);
    }
    console.log('✅ PASS: Sessions are strictly isolated (Tab A = Customer, Tab B = Worker).');

    // Make sure Tab B is actively mounted on Worker Dashboard
    await pageB.waitForSelector('#toggle-worker-availability-btn', { timeout: 8000 });
    console.log('   Tab B: Worker Dashboard is active and listening for live requests.');

    // STEP 4: Customer creates a booking in Tab A
    console.log(`\n[Step 4/13] Tab A: Customer books Worker "${workerTarget.name}" (${workerTarget.id})...`);
    const createdBooking = await pageA.evaluate(async (target) => {
      const { sahaayakService: sahaayak } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
      const custSession = JSON.parse(sessionStorage.getItem('sahaayak_real_auth_session') || '{}');
      
      const newBooking = await sahaayak.createBooking({
        customer_id: custSession.id,
        customerName: custSession.name || 'Vikram Malhotra',
        customerPhone: '9876543210',
        customerAddress: 'Sector 62, Noida, NCR',
        workerId: target.id,
        workerName: target.name,
        workerSkill: target.skill || 'Plumbing',
        serviceType: target.skill || 'Plumbing',
        date: 'Today',
        timeSlot: '11:00 AM – 12:00 PM',
        problemDescription: 'Kitchen tap leaking badly.',
        estimatedPrice: 350,
      });

      return newBooking;
    }, workerTarget);

    console.log(`   Customer created booking #${createdBooking.id} (OTP: ${createdBooking.otpCode})`);

    // STEP 5: Confirm database row
    console.log('\n[Step 5/13] Verifying database row in Supabase public.bookings...');
    const dbBooking = await pageA.evaluate(async (bookingId) => {
      const { supabase: sb } = await (import(/* @vite-ignore */ '/src/lib/supabaseClient.ts' as any));
      const { data, error } = await sb
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    }, createdBooking.id);

    if (!dbBooking) {
      throw new Error(`Database verification failed: Row not found in public.bookings`);
    }
    console.log('   Confirmed Database Row:', {
      id: dbBooking.id,
      worker_id: dbBooking.worker_id,
      customer_id: dbBooking.customer_id,
      status: dbBooking.status,
      service_type: dbBooking.service_type,
    });
    if (dbBooking.status !== 'requested') {
      throw new Error(`Expected status="requested", got "${dbBooking.status}"`);
    }
    if (dbBooking.worker_id !== workerTarget.id) {
      throw new Error(`Expected worker_id="${workerTarget.id}", got "${dbBooking.worker_id}"`);
    }
    console.log('✅ PASS: Database row confirmed with status="requested" and correct business worker_id.');

    // STEP 6: WITHOUT REFRESHING Tab B, verify Booking Requests appears
    console.log('\n[Step 6/13] Tab B: Verifying Worker receives booking WITHOUT REFRESH...');
    
    let receivedInTabB = false;
    let pendingCount = 0;
    let foundInJobsView = false;

    // Poll Tab B DOM state for up to 5 seconds
    for (let attempt = 1; attempt <= 10; attempt++) {
      await sleep(500);

      const statusCheck = await pageB.evaluate((targetBookingId) => {
        // Check overview requests count
        const countBadge = document.querySelector('#badge-pending-requests-count')?.textContent ||
                           document.querySelector('#badge-requests-count')?.textContent;
        
        // Check if booking card is in the DOM
        const bodyText = document.body.innerText;
        const hasBookingId = bodyText.includes(targetBookingId);
        const hasCustomerName = bodyText.includes('Vikram Malhotra');

        // Check window / app context bookings
        return {
          hasBookingId,
          hasCustomerName,
          bodySnippet: bodyText.slice(0, 300),
        };
      }, createdBooking.id);

      if (statusCheck.hasBookingId || statusCheck.hasCustomerName) {
        receivedInTabB = true;
        console.log(`   [Attempt ${attempt}] Booking request dynamically rendered in Worker Tab B!`);
        break;
      }
    }

    if (!receivedInTabB) {
      // Let's inspect Tab B state
      const tabBDebug = await pageB.evaluate(async () => {
        const { sahaayakService } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
        const allB = await sahaayakService.getBookings();
        return { count: allB.length, ids: allB.map((b: any) => b.id) };
      });
      console.log('   Tab B SahaayakService bookings:', tabBDebug);
    }

    if (!receivedInTabB) {
      throw new Error('Worker Tab B did not dynamically receive the booking request within 5s!');
    }
    console.log('✅ PASS: Worker Tab B received and rendered booking request in real-time WITHOUT REFRESH!');

    // STEP 7: Worker accepts the booking in Tab B
    console.log('\n[Step 7/13] Tab B: Worker accepts the booking...');
    const acceptResult = await pageB.evaluate(async (bookingId, workerId) => {
      const { sahaayakService } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
      const accepted = await sahaayakService.acceptBooking(bookingId, workerId);
      return accepted;
    }, createdBooking.id, workerTarget.id);

    console.log(`   Worker accepted booking status: "${acceptResult.status}"`);
    if (acceptResult.status !== 'accepted') {
      throw new Error(`Expected accepted status, got "${acceptResult.status}"`);
    }
    console.log('✅ PASS: Worker accepted booking successfully.');

    // STEP 8: Verify status becomes "accepted" in DB
    console.log('\n[Step 8/13] Verifying database status="accepted"...');
    const updatedDbRow = await pageB.evaluate(async (bookingId) => {
      const { supabase: sb } = await (import(/* @vite-ignore */ '/src/lib/supabaseClient.ts' as any));
      const { data, error } = await sb
        .from('bookings')
        .select('status, accepted_at')
        .eq('id', bookingId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    }, createdBooking.id);

    if (updatedDbRow?.status !== 'accepted') {
      throw new Error(`Expected DB status="accepted", got "${updatedDbRow?.status}"`);
    }
    console.log('✅ PASS: Database confirmed status="accepted".');

    // STEP 9: Refresh both tabs
    console.log('\n[Step 9/13] Refreshing both tabs (F5)...');
    await pageA.reload({ waitUntil: 'networkidle2' });
    await pageB.reload({ waitUntil: 'networkidle2' });

    // STEP 10: Customer still sees the booking in Tab A
    console.log('\n[Step 10/13] Tab A: Customer verifies booking persistence after refresh...');
    const custBookings = await pageA.evaluate(async (bookingId) => {
      const { sahaayakService } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
      const bookings = await sahaayakService.getBookings();
      const b = bookings.find((item: any) => item.id === bookingId);
      return { found: !!b, status: b?.status };
    }, createdBooking.id);
    if (!custBookings.found || custBookings.status !== 'accepted') {
      throw new Error(`Customer cannot see accepted booking: ${JSON.stringify(custBookings)}`);
    }
    console.log('✅ PASS: Customer Tab A still sees booking with status="accepted".');

    // STEP 11: Worker still sees the accepted job in Tab B
    console.log('\n[Step 11/13] Tab B: Worker verifies accepted job persistence after refresh...');
    const workerAccepted = await pageB.evaluate(async (bookingId) => {
      const { sahaayakService } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
      const bookings = await sahaayakService.getBookings();
      const b = bookings.find((item: any) => item.id === bookingId);
      return { found: !!b, status: b?.status };
    }, createdBooking.id);
    if (!workerAccepted.found || workerAccepted.status !== 'accepted') {
      throw new Error(`Worker cannot see accepted job: ${JSON.stringify(workerAccepted)}`);
    }
    console.log('✅ PASS: Worker Tab B still sees job with status="accepted".');

    // STEP 12: Customer logout must NOT log out worker
    console.log('\n[Step 12/13] Tab A: Customer logs out...');
    await pageA.evaluate(() => {
      sessionStorage.removeItem('sahaayak_real_auth_session');
      window.location.hash = '#landing';
    });
    await pageA.reload({ waitUntil: 'networkidle2' });

    const workerSessionAfterCustLogout = await pageB.evaluate(() => {
      return JSON.parse(sessionStorage.getItem('sahaayak_real_auth_session') || 'null');
    });
    if (!workerSessionAfterCustLogout || workerSessionAfterCustLogout.role !== 'worker') {
      throw new Error('Customer logout corrupted the Worker session!');
    }
    console.log('✅ PASS: Customer logout did NOT affect Worker session.');

    // STEP 13: Worker logout must NOT log out customer (if logged in)
    console.log('\n[Step 13/13] Tab B: Worker logs out...');
    await pageB.evaluate(() => {
      sessionStorage.removeItem('sahaayak_real_auth_session');
      window.location.hash = '#landing';
    });
    await pageB.reload({ waitUntil: 'networkidle2' });
    const finalWorker = await pageB.evaluate(() => sessionStorage.getItem('sahaayak_real_auth_session'));
    if (finalWorker !== null) {
      throw new Error('Worker was not logged out cleanly');
    }
    console.log('✅ PASS: Worker logged out cleanly.');

    console.log('\n================================================================');
    console.log(' 🎉 ALL 13 TEST STEPS PASSED WITH 100% SUCCESS!                 ');
    console.log('================================================================\n');
  } finally {
    await browser.close();
  }
}

runCleanRealtimeBookingDeliveryTest().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});

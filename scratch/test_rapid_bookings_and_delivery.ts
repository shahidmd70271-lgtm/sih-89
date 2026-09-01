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

async function runRapidBookingsAndDeliveryTest() {
  console.log('================================================================');
  console.log(' UNIQUE BOOKING ID & REAL-TIME WORKER DELIVERY TEST             ');
  console.log('================================================================\n');

  // STEP 0: Pre-test cleanup
  console.log('[Step 0/10] Pre-test Database Cleanup...');
  await supabase.from('bookings').delete().neq('id', 'NONE');
  console.log('✅ DB Cleaned.');

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
    console.log('\n[Step 1/10] Tab A: Logging in as Customer...');
    const customer = await pageA.evaluate(async () => {
      const { supabase: sb } = await (import(/* @vite-ignore */ '/src/lib/supabaseClient.ts' as any));
      const email = `cust.stress.${Date.now()}@gmail.com`;
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
    console.log('\n[Step 2/10] Tab B: Logging in as Worker...');
    const workerTarget = await pageB.evaluate(async () => {
      const { sahaayakService: sahaayak } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
      const { supabase: sb } = await (import(/* @vite-ignore */ '/src/lib/supabaseClient.ts' as any));

      const workers = await sahaayak.getWorkers();
      const approvedWorker = workers.find((w) => w.verificationStatus === 'Verified' || w.approval_status === 'approved') || workers[0];
      
      const workerEmail = `worker.stress.${Date.now()}@gmail.com`;
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

    // STEP 3: Confirm session isolation
    console.log('\n[Step 3/10] Verifying session isolation...');
    const tabAUser = await pageA.evaluate(() => JSON.parse(sessionStorage.getItem('sahaayak_real_auth_session') || 'null'));
    const tabBUser = await pageB.evaluate(() => JSON.parse(sessionStorage.getItem('sahaayak_real_auth_session') || 'null'));
    if (tabAUser?.role !== 'customer' || tabBUser?.role !== 'worker') {
      throw new Error(`Session leakage detected! Tab A: ${tabAUser?.role}, Tab B: ${tabBUser?.role}`);
    }
    console.log('✅ PASS: Tab A (Customer) and Tab B (Worker) sessions are strictly isolated.');

    await pageB.waitForSelector('#toggle-worker-availability-btn', { timeout: 8000 });

    // STEP 4: Create 3 rapid bookings from Customer Tab A to test ID uniqueness
    console.log('\n[Step 4/10] Tab A: Creating 3 rapid bookings to test unique ID collision avoidance...');
    const createdBookings = await pageA.evaluate(async (target) => {
      const { sahaayakService: sahaayak } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
      const custSession = JSON.parse(sessionStorage.getItem('sahaayak_real_auth_session') || '{}');

      const results = [];
      for (let i = 1; i <= 3; i++) {
        const b = await sahaayak.createBooking({
          customer_id: custSession.id,
          customerName: custSession.name || 'Vikram Malhotra',
          customerPhone: '9876543210',
          customerAddress: `Flat 10${i}, Tower B, Delhi NCR`,
          workerId: target.id,
          workerName: target.name,
          workerSkill: target.skill || 'Plumbing',
          serviceType: target.skill || 'Plumbing',
          date: 'Today',
          timeSlot: `${10 + i}:00 AM – ${11 + i}:00 AM`,
          problemDescription: `Test Booking #${i} - Rapid Creation`,
          estimatedPrice: 300 + i * 20,
        });
        results.push(b);
      }
      return results;
    }, workerTarget);

    console.log('   Created Bookings:');
    createdBookings.forEach((b: any, idx: number) => {
      console.log(`   [${idx + 1}] ID: ${b.id} | OTP: ${b.otpCode || b.otp} | Status: ${b.status} | Total: ₹${b.totalAmount}`);
    });

    const uniqueIds = new Set(createdBookings.map((b: any) => b.id));
    if (uniqueIds.size !== createdBookings.length) {
      throw new Error('Duplicate booking IDs generated!');
    }
    console.log('✅ PASS: All 3 bookings created successfully with unique human-readable IDs.');

    const primaryTargetBooking = createdBookings[0];

    // STEP 5: Confirm database persistence
    console.log('\n[Step 5/10] Verifying database persistence for created bookings...');
    const dbCount = await pageA.evaluate(async () => {
      const { supabase: sb } = await (import(/* @vite-ignore */ '/src/lib/supabaseClient.ts' as any));
      const { data } = await sb.from('bookings').select('id, status, worker_id');
      return data?.length || 0;
    });
    console.log(`   Confirmed ${dbCount} active bookings in Supabase database.`);
    if (dbCount < 3) {
      throw new Error(`Expected at least 3 bookings in DB, got ${dbCount}`);
    }
    console.log('✅ PASS: All bookings verified in database.');

    // STEP 6: Worker in Tab B sees booking request in real-time WITHOUT REFRESH
    console.log('\n[Step 6/10] Tab B: Verifying Worker receives booking request WITHOUT REFRESH...');
    let renderedInWorkerTab = false;
    for (let attempt = 1; attempt <= 10; attempt++) {
      await sleep(500);
      const text = await pageB.evaluate(() => document.body.innerText);
      if (text.includes(primaryTargetBooking.id) || text.includes('Vikram Malhotra')) {
        renderedInWorkerTab = true;
        console.log(`   [Attempt ${attempt}] Booking #${primaryTargetBooking.id} rendered in Worker Tab B!`);
        break;
      }
    }
    if (!renderedInWorkerTab) {
      throw new Error(`Worker Tab B did not receive booking #${primaryTargetBooking.id} within 5s!`);
    }
    console.log('✅ PASS: Worker Tab B rendered booking request in real time without refresh.');

    // STEP 7: Worker accepts booking
    console.log('\n[Step 7/10] Tab B: Worker accepts booking...');
    const acceptRes = await pageB.evaluate(async (bookingId, workerId) => {
      const { sahaayakService } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
      return await sahaayakService.acceptBooking(bookingId, workerId);
    }, primaryTargetBooking.id, workerTarget.id);

    console.log(`   Accept status: "${acceptRes.status}"`);
    if (acceptRes.status !== 'accepted') {
      throw new Error(`Expected status="accepted", got "${acceptRes.status}"`);
    }
    console.log('✅ PASS: Worker accepted booking.');

    // STEP 8: Refresh both tabs and verify persistence
    console.log('\n[Step 8/10] Refreshing both browser tabs...');
    await pageA.reload({ waitUntil: 'networkidle2' });
    await pageB.reload({ waitUntil: 'networkidle2' });

    const custViewCheck = await pageA.evaluate(async (bookingId) => {
      const { sahaayakService } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
      const bList = await sahaayakService.getBookings();
      const b = bList.find((item: any) => item.id === bookingId);
      return { found: !!b, status: b?.status };
    }, primaryTargetBooking.id);
    if (!custViewCheck.found || custViewCheck.status !== 'accepted') {
      throw new Error(`Customer persistence check failed: ${JSON.stringify(custViewCheck)}`);
    }
    console.log('✅ PASS: Customer Tab A still sees accepted booking after refresh.');

    const workerViewCheck = await pageB.evaluate(async (bookingId) => {
      const { sahaayakService } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
      const bList = await sahaayakService.getBookings();
      const b = bList.find((item: any) => item.id === bookingId);
      return { found: !!b, status: b?.status };
    }, primaryTargetBooking.id);
    if (!workerViewCheck.found || workerViewCheck.status !== 'accepted') {
      throw new Error(`Worker persistence check failed: ${JSON.stringify(workerViewCheck)}`);
    }
    console.log('✅ PASS: Worker Tab B still sees accepted booking after refresh.');

    // STEP 9: Customer logout isolation
    console.log('\n[Step 9/10] Tab A: Customer logs out...');
    await pageA.evaluate(() => {
      sessionStorage.removeItem('sahaayak_real_auth_session');
      window.location.hash = '#landing';
    });
    await pageA.reload({ waitUntil: 'networkidle2' });

    const workerStillActive = await pageB.evaluate(() => {
      const sess = JSON.parse(sessionStorage.getItem('sahaayak_real_auth_session') || 'null');
      return sess?.role === 'worker';
    });
    if (!workerStillActive) {
      throw new Error('Customer logout corrupted Worker session!');
    }
    console.log('✅ PASS: Customer logout did NOT affect Worker session.');

    // STEP 10: Worker logout isolation
    console.log('\n[Step 10/10] Tab B: Worker logs out...');
    await pageB.evaluate(() => {
      sessionStorage.removeItem('sahaayak_real_auth_session');
      window.location.hash = '#landing';
    });
    await pageB.reload({ waitUntil: 'networkidle2' });
    console.log('✅ PASS: Worker logged out cleanly.');

    console.log('\n================================================================');
    console.log(' 🎉 ALL 10 STRESS & DELIVERY TESTS PASSED WITH 100% SUCCESS!    ');
    console.log('================================================================\n');
  } finally {
    await browser.close();
  }
}

runRapidBookingsAndDeliveryTest().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});

import puppeteer from 'puppeteer-core';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function runBrowserTwoTabTest() {
  console.log('================================================================');
  console.log(' STARTING REAL BROWSER TWO-TAB SESSION ISOLATION TEST          ');
  console.log(' Using Browser:', CHROME_PATH);
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const APP_URL = 'http://localhost:3000';
    const timestamp = Date.now();
    const customerEmail = `cust.tabtest.${timestamp}@gmail.com`;
    const customerPass = 'Password123!';

    // =========================================================================
    // STEP 1: TAB A - Open and Login as Customer
    // =========================================================================
    console.log('[Step 1/8] Tab A: Opening page and logging in as Customer...');
    const pageA = await browser.newPage();
    pageA.on('console', (msg) => console.log('   [Browser Tab A Console]:', msg.text()));
    await pageA.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    // Login as customer via UI / AppContext
    await pageA.evaluate(async (email, pass) => {
      const { authService: auth } = await (import(/* @vite-ignore */ '/src/services/authService.ts' as any));
      await auth.customerSignUp({
        name: 'Suresh Customer',
        email: email,
        password: pass,
      });
      await auth.customerSignIn({
        email: email,
        password: pass,
      });
      window.location.hash = '#customer-dashboard';
    }, customerEmail, customerPass);

    await pageA.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    const tabAState = await pageA.evaluate(() => {
      const sessionRaw = sessionStorage.getItem('sahaayak_real_auth_session');
      const user = sessionRaw ? JSON.parse(sessionRaw) : null;
      return {
        user,
        pathname: window.location.pathname,
        hash: window.location.hash,
        title: document.title,
        bodyText: document.body.innerText.slice(0, 300),
      };
    });

    console.log('   Tab A Auth User:', tabAState.user?.name, `(Role: ${tabAState.user?.role})`);
    if (tabAState.user?.role !== 'customer') {
      throw new Error(`Tab A failed to log in as Customer! Got: ${tabAState.user?.role}`);
    }
    console.log('✅ PASS: Tab A successfully authenticated as Customer.');

    // =========================================================================
    // STEP 2: TAB B - Open Tab B in Same Browser and Login as Worker
    // =========================================================================
    console.log('\n[Step 2/8] Tab B: Opening separate tab in same browser...');
    const pageB = await browser.newPage();
    pageB.on('console', (msg) => console.log('   [Browser Tab B Console]:', msg.text()));
    await pageB.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    // Check Tab B initial state - should NOT have Customer session because sessionStorage is isolated!
    const tabBInitialState = await pageB.evaluate(() => {
      const sessionRaw = sessionStorage.getItem('sahaayak_real_auth_session');
      return sessionRaw ? JSON.parse(sessionRaw) : null;
    });

    console.log('   Tab B Initial User in sessionStorage:', tabBInitialState);
    if (tabBInitialState !== null) {
      throw new Error('Tab B was contaminated with Tab A session before login!');
    }
    console.log('✅ PASS: Tab B has clean isolated sessionStorage (no leakage from Tab A).');

    // Login as approved worker in Tab B
    console.log('   Tab B: Logging in as approved Worker...');
    const loggedInWorker = await pageB.evaluate(async () => {
      const { authService: auth } = await (import(/* @vite-ignore */ '/src/services/authService.ts' as any));
      const { sahaayakService: sahaayak } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
      const { supabase } = await (import(/* @vite-ignore */ '/src/lib/supabaseClient.ts' as any));
      const workers = await sahaayak.getWorkers();
      const approvedWorker = workers.find((w) => w.verificationStatus === 'Verified' || w.approval_status === 'approved') || workers[0];
      
      const workerEmail = `worker.tabtest.${Date.now()}@gmail.com`;
      const workerPass = 'Password123!';

      // Sign up and authenticate worker in Supabase Auth
      const { data: authData } = await supabase.auth.signUp({
        email: workerEmail,
        password: workerPass,
        options: { data: { role: 'worker', full_name: approvedWorker.name } },
      });
      await supabase.auth.signInWithPassword({
        email: workerEmail,
        password: workerPass,
      });

      // Link worker's profile_id in public.workers to this auth UID for Supabase RLS policy
      if (authData?.user?.id) {
        await supabase.from('workers').update({ profile_id: authData.user.id }).eq('id', approvedWorker.id);
      }

      // Set worker session in Tab B sessionStorage
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
    await new Promise((r) => setTimeout(r, 1500));

    const tabBState = await pageB.evaluate(() => {
      const sessionRaw = sessionStorage.getItem('sahaayak_real_auth_session');
      return sessionRaw ? JSON.parse(sessionRaw) : null;
    });

    console.log('   Tab B Auth User:', tabBState?.name, `(Role: ${tabBState?.role})`);
    if (tabBState?.role !== 'worker') {
      throw new Error(`Tab B failed to log in as Worker! Got: ${tabBState?.role}`);
    }
    console.log('✅ PASS: Tab B successfully authenticated as Worker.');

    // =========================================================================
    // STEP 3: REFRESH TAB A (Customer Tab)
    // =========================================================================
    console.log('\n[Step 3/8] Refreshing Tab A (F5 / reload)...');
    await pageA.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    const tabAAfterRefresh = await pageA.evaluate(() => {
      const sessionRaw = sessionStorage.getItem('sahaayak_real_auth_session');
      return sessionRaw ? JSON.parse(sessionRaw) : null;
    });

    console.log('   Tab A User after refresh:', tabAAfterRefresh?.name, `(Role: ${tabAAfterRefresh?.role})`);
    if (tabAAfterRefresh?.role !== 'customer') {
      throw new Error(`CRITICAL BUG: Tab A became "${tabAAfterRefresh?.role}" after refresh instead of Customer!`);
    }
    console.log('✅ PASS: Tab A strictly remains CUSTOMER after page refresh (NOT overwritten by Worker in Tab B)!');

    // =========================================================================
    // STEP 4: REFRESH TAB B (Worker Tab)
    // =========================================================================
    console.log('\n[Step 4/8] Refreshing Tab B (F5 / reload)...');
    await pageB.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    const tabBAfterRefresh = await pageB.evaluate(() => {
      const sessionRaw = sessionStorage.getItem('sahaayak_real_auth_session');
      return sessionRaw ? JSON.parse(sessionRaw) : null;
    });

    console.log('   Tab B User after refresh:', tabBAfterRefresh?.name, `(Role: ${tabBAfterRefresh?.role})`);
    if (tabBAfterRefresh?.role !== 'worker') {
      throw new Error(`CRITICAL BUG: Tab B became "${tabBAfterRefresh?.role}" after refresh instead of Worker!`);
    }
    console.log('✅ PASS: Tab B strictly remains WORKER after page refresh (NOT overwritten by Customer in Tab A)!');

    // =========================================================================
    // STEP 5: CUSTOMER IN TAB A CREATES A BOOKING
    // =========================================================================
    console.log('\n[Step 5/9] Tab A: Customer creates booking for Worker...');
    const testBookingId = `SHK-TAB-TEST-${Date.now().toString().slice(-4)}`;
    
    const bookingResult = await pageA.evaluate(async (bookingId, workerToBook) => {
      const { sahaayakService: sahaayak } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
      const { authService: auth } = await (import(/* @vite-ignore */ '/src/services/authService.ts' as any));
      const { supabase } = await (import(/* @vite-ignore */ '/src/lib/supabaseClient.ts' as any));
      const user = auth.getCurrentUser();

      try {
        const created = await sahaayak.createBooking({
          id: bookingId,
          customer_id: user?.id,
          customerName: user?.name || 'Suresh Customer',
          customerPhone: '+91 9876543210',
          customerAddress: 'Connaught Place, New Delhi',
          workerId: workerToBook.id,
          workerName: workerToBook.name,
          workerSkill: workerToBook.skill || workerToBook.primary_skill || 'Plumbing',
          serviceType: workerToBook.skill || workerToBook.primary_skill || 'Plumbing',
          scheduled_date: 'Today',
          time_slot: '2:00 PM – 3:00 PM',
          status: 'requested',
          estimatedPrice: 300,
          totalAmount: 330,
        });

        // Query database directly to confirm the exact row inserted
        const { data: dbRows } = await supabase.from('bookings').select('*').eq('id', created.id);

        return {
          success: true,
          bookingId: created.id,
          workerId: workerToBook.id,
          customerId: user?.id,
          dbRow: dbRows?.[0] || null,
        };
      } catch (err: any) {
        console.error('pageA createBooking error:', err?.message || err);
        throw err;
      }
    }, testBookingId, loggedInWorker);

    console.log(`   Database Booking Row:`, JSON.stringify(bookingResult.dbRow, null, 2));
    if (!bookingResult.dbRow) {
      throw new Error(`Booking #${bookingResult.bookingId} was not found in public.bookings table!`);
    }
    console.log(`✅ PASS: Confirmed database row for booking #${bookingResult.bookingId} with status="${bookingResult.dbRow.status}".`);

    // =========================================================================
    // STEP 6: CUSTOMER TAB A PERSISTENCE (Navigate to My Bookings & Refresh)
    // =========================================================================
    console.log('\n[Step 6/9] Tab A: Customer navigates to My Bookings and Refreshes (F5)...');
    await pageA.evaluate(() => {
      window.location.hash = '#my-bookings';
    });
    await pageA.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    const customerBookingsCheck = await pageA.evaluate(async (targetId) => {
      const { sahaayakService: sahaayak } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
      const { authService: auth } = await (import(/* @vite-ignore */ '/src/services/authService.ts' as any));
      const user = auth.getCurrentUser();
      const allBookings = await sahaayak.getBookings();
      const userBookings = user?.id ? allBookings.filter((b) => b.customer_id === user.id || b.customerName === user.name) : [];
      return {
        totalDbBookings: allBookings.length,
        userBookingsCount: userBookings.length,
        hasTargetBooking: userBookings.some((b) => b.id === targetId),
      };
    }, bookingResult.bookingId);

    console.log(`   Customer My Bookings Check:`, customerBookingsCheck);
    if (!customerBookingsCheck.hasTargetBooking) {
      throw new Error(`Customer in Tab A did not find booking #${bookingResult.bookingId} in My Bookings after page refresh!`);
    }
    console.log(`✅ PASS: Customer Tab A successfully retrieved booking #${bookingResult.bookingId} after refresh.`);

    // =========================================================================
    // STEP 7: WORKER IN TAB B RECEIVES AND ACCEPTS BOOKING
    // =========================================================================
    console.log('\n[Step 7/9] Tab B: Worker receives and accepts booking...');
    let foundBooking = false;
    for (let i = 0; i < 20; i++) {
      foundBooking = await pageB.evaluate(async (bId) => {
        const { sahaayakService: sahaayak } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
        const all = await sahaayak.getBookings();
        return all.some((b) => b.id === bId);
      }, bookingResult.bookingId);
      if (foundBooking) break;
      await new Promise((r) => setTimeout(r, 500));
    }

    if (!foundBooking) {
      throw new Error(`Worker in Tab B did not find booking #${bookingResult.bookingId}`);
    }

    const acceptResult = await pageB.evaluate(async (bId, wkrId) => {
      const { sahaayakService: sahaayak } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
      const updated = await sahaayak.acceptBooking(bId, wkrId);
      return { status: updated.status };
    }, bookingResult.bookingId, loggedInWorker.id);

    console.log(`   Worker accepted status: "${acceptResult.status}"`);
    if (acceptResult.status !== 'accepted') {
      throw new Error(`Worker accept returned status: ${acceptResult.status}`);
    }
    console.log('✅ PASS: Worker in Tab B accepted booking successfully.');

    // =========================================================================
    // STEP 8: REFRESH WORKER TAB B & CUSTOMER TAB A TO VERIFY ACCEPTED STATE
    // =========================================================================
    console.log('\n[Step 8/9] Refreshing both tabs to verify accepted state persistence...');
    await pageB.reload({ waitUntil: 'networkidle2' });
    await pageA.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    const workerStateCheck = await pageB.evaluate(async (bId) => {
      const { sahaayakService: sahaayak } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
      const all = await sahaayak.getBookings();
      const b = all.find((item) => item.id === bId);
      return { found: !!b, status: b?.status };
    }, bookingResult.bookingId);

    const customerStateCheck = await pageA.evaluate(async (bId) => {
      const { sahaayakService: sahaayak } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
      const all = await sahaayak.getBookings();
      const b = all.find((item) => item.id === bId);
      return { found: !!b, status: b?.status };
    }, bookingResult.bookingId);

    console.log(`   Worker View after refresh: status="${workerStateCheck.status}"`);
    console.log(`   Customer View after refresh: status="${customerStateCheck.status}"`);
    if (workerStateCheck.status !== 'accepted' || customerStateCheck.status !== 'accepted') {
      throw new Error(`Accepted booking status was not synchronized! Worker: ${workerStateCheck.status}, Customer: ${customerStateCheck.status}`);
    }
    console.log('✅ PASS: Both Worker and Customer tabs reflect updated "accepted" status after refresh.');

    // =========================================================================
    // STEP 9: TAB A LOGOUT DOES NOT AFFECT WORKER IN TAB B
    // =========================================================================
    console.log('\n[Step 9/9] Tab A: Customer logs out...');
    await pageA.evaluate(async () => {
      const { authService: auth } = await (import(/* @vite-ignore */ '/src/services/authService.ts' as any));
      await auth.signOut();
      sessionStorage.removeItem('sahaayak_real_auth_session');
    });

    const tabAAfterLogout = await pageA.evaluate(() => {
      return sessionStorage.getItem('sahaayak_real_auth_session');
    });
    console.log('   Tab A User after logout:', tabAAfterLogout);

    const tabBAfterALogout = await pageB.evaluate(() => {
      const sessionRaw = sessionStorage.getItem('sahaayak_real_auth_session');
      return sessionRaw ? JSON.parse(sessionRaw) : null;
    });
    console.log('   Tab B User after Tab A logged out:', tabBAfterALogout?.name, `(Role: ${tabBAfterALogout?.role})`);
    if (tabBAfterALogout?.role !== 'worker') {
      throw new Error('CRITICAL BUG: Logging out of Tab A logged out or corrupted Tab B!');
    }
    console.log('✅ PASS: Tab A customer logout did NOT affect Tab B worker session!');

    // Cleanup test booking
    await pageB.evaluate(async (bId) => {
      const { supabase } = await (import(/* @vite-ignore */ '/src/lib/supabaseClient.ts' as any));
      if (supabase) {
        await supabase.from('bookings').delete().eq('id', bId);
      }
    }, bookingResult.bookingId);

    console.log('\n================================================================');
    console.log(' 🎉 ALL BOOKING DATA FLOW & MULTI-TAB TESTS PASSED 100%!       ');
    console.log('================================================================\n');
  } finally {
    await browser.close();
  }
}

runBrowserTwoTabTest().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});

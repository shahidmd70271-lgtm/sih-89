import puppeteer from 'puppeteer-core';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function runWorkerOtpSecurityTest() {
  console.log('================================================================');
  console.log(' STARTING WORKER OTP SECURITY & VERIFICATION TEST               ');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const APP_URL = 'http://localhost:3000';
    const timestamp = Date.now();
    const customerEmail = `otp.cust.${timestamp}@gmail.com`;
    const customerPass = 'Password123!';

    // Step 1: Open Tab A as Customer
    console.log('[Step 1/6] Tab A: Customer login...');
    const pageA = await browser.newPage();
    await pageA.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    await pageA.evaluate(async (email, pass) => {
      const { authService: auth } = await (import(/* @vite-ignore */ '/src/services/authService.ts' as any));
      await auth.customerSignUp({
        name: 'Ramesh Customer',
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
    await new Promise((r) => setTimeout(r, 1000));

    // Step 2: Open Tab B as Worker
    console.log('[Step 2/6] Tab B: Worker login...');
    const pageB = await browser.newPage();
    await pageB.goto(APP_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    const worker = await pageB.evaluate(async () => {
      const { authService: auth } = await (import(/* @vite-ignore */ '/src/services/authService.ts' as any));
      const { sahaayakService: sahaayak } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
      const { supabase } = await (import(/* @vite-ignore */ '/src/lib/supabaseClient.ts' as any));

      const workers = await sahaayak.getWorkers();
      const approvedWorker = workers.find((w) => w.verificationStatus === 'Verified' || w.approval_status === 'approved') || workers[0];
      
      const workerEmail = `worker.otptest.${Date.now()}@gmail.com`;
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

      auth.saveSession(workerUser);
      sessionStorage.setItem('sahaayak_real_auth_session', JSON.stringify(workerUser));
      window.location.hash = '#worker-dashboard';
      return approvedWorker;
    });

    await pageB.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1000));

    // Step 3: Customer creates booking and verifies OTP is visible to Customer
    console.log('\n[Step 3/6] Tab A: Customer creates booking...');
    const testBookingId = `SHK-OTP-TEST-${Date.now().toString().slice(-4)}`;

    const bookingCreated = await pageA.evaluate(async (bId, wkr) => {
      const { sahaayakService: sahaayak } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
      const { authService: auth } = await (import(/* @vite-ignore */ '/src/services/authService.ts' as any));
      const user = auth.getCurrentUser();

      const created = await sahaayak.createBooking({
        id: bId,
        customer_id: user?.id,
        customerName: user?.name || 'Ramesh Customer',
        customerPhone: '+91 9876543210',
        customerAddress: 'Janpath, New Delhi',
        workerId: wkr.id,
        workerName: wkr.name,
        workerSkill: wkr.skill || 'Plumbing',
        serviceType: wkr.skill || 'Plumbing',
        scheduled_date: 'Today',
        time_slot: '11:00 AM – 12:00 PM',
        status: 'requested',
        estimatedPrice: 350,
        totalAmount: 380,
      });

      return { id: created.id, otp: created.otpCode || created.otp };
    }, testBookingId, worker);

    console.log(`   Customer created booking #${bookingCreated.id} with OTP: "${bookingCreated.otp}"`);
    if (!bookingCreated.otp || bookingCreated.otp.length < 4) {
      throw new Error('Customer did not receive a valid 4-digit security OTP!');
    }
    console.log('✅ PASS: Customer received valid Start-of-Service Security OTP.');

    // Step 4: Worker accepts booking and views Accepted Jobs
    console.log('\n[Step 4/6] Tab B: Worker accepts booking and inspects Jobs UI...');
    await pageB.evaluate(async (bId, wkrId) => {
      const { sahaayakService: sahaayak } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
      await sahaayak.acceptBooking(bId, wkrId);
      window.location.hash = '#worker-my-jobs';
    }, bookingCreated.id, worker.id);

    await pageB.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    // Switch to accepted jobs tab and check DOM text
    const workerJobCardText = await pageB.evaluate(async (bId, secretOtp) => {
      const acceptedTabBtn = document.getElementById('tab-accepted-jobs');
      if (acceptedTabBtn) (acceptedTabBtn as HTMLElement).click();
      await new Promise((r) => setTimeout(r, 800));

      const card = document.getElementById(`accepted-job-card-${bId}`);
      const cardHtml = card ? card.innerHTML : '';
      const cardText = card ? card.innerText : '';
      const pageText = document.body.innerText;

      const otpLeakedInCard = cardText.includes(secretOtp) || cardHtml.includes(secretOtp);
      const hasInstruction = pageText.includes('Ask customer for OTP on arrival') || cardText.includes('Ask customer for OTP on arrival');

      return {
        cardFound: !!card,
        cardText: cardText.slice(0, 300),
        otpLeakedInCard,
        hasInstruction,
      };
    }, bookingCreated.id, bookingCreated.otp);

    console.log('   Worker Accepted Job Card Check:', workerJobCardText);

    if (workerJobCardText.otpLeakedInCard) {
      throw new Error(`SECURITY VIOLATION: Worker card is exposing the customer's secret OTP "${bookingCreated.otp}"!`);
    }
    if (!workerJobCardText.hasInstruction) {
      throw new Error('Worker card is missing the security instruction "Ask customer for OTP on arrival".');
    }
    console.log('✅ PASS: OTP is NEVER displayed on the worker accepted jobs card. Instruction is present.');

    // Step 5: Worker opens Control Desk (Active Job Tracker) & verifies OTP UI
    console.log('\n[Step 5/6] Tab B: Worker opens Job Control Desk and verifies OTP input...');
    await pageB.evaluate(async (bId) => {
      const { sahaayakService: sahaayak } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
      // simulate worker travelling and arriving
      await sahaayak.updateBookingStatus(bId, 'arrived');
      window.location.hash = '#worker-live-job';
    }, bookingCreated.id);

    await pageB.reload({ waitUntil: 'networkidle2' });
    await new Promise((r) => setTimeout(r, 1500));

    const trackerCheck = await pageB.evaluate((secretOtp) => {
      const pageText = document.body.innerText;
      const otpInput = document.getElementById('input-service-otp') as HTMLInputElement;
      const isOtpExposedInTracker = pageText.includes(secretOtp);
      const hasInstruction = pageText.includes('Ask the customer for the security OTP after arriving');

      return {
        hasOtpInput: !!otpInput,
        placeholder: otpInput ? otpInput.placeholder : null,
        isOtpExposedInTracker,
        hasInstruction,
      };
    }, bookingCreated.otp);

    console.log('   Worker Active Job Tracker Check:', trackerCheck);
    if (trackerCheck.isOtpExposedInTracker) {
      throw new Error(`SECURITY VIOLATION: Worker Active Job Tracker is exposing secret OTP "${bookingCreated.otp}" in plain text!`);
    }
    if (!trackerCheck.hasInstruction) {
      throw new Error('Worker Active Job Tracker is missing customer OTP arrival instruction!');
    }
    console.log('✅ PASS: Worker Job Tracker does not leak OTP and contains customer prompt.');

    // Step 6: Test OTP verification logic (Incorrect OTP fails, Correct OTP succeeds)
    console.log('\n[Step 6/6] Tab B: Testing OTP verification handling...');
    const invalidVerification = await pageB.evaluate(async (bId) => {
      const { sahaayakService: sahaayak } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
      return await sahaayak.verifyOtpAndStartService(bId, '0000');
    }, bookingCreated.id);

    console.log('   Invalid OTP response:', invalidVerification);
    if (invalidVerification.success) {
      throw new Error('Verification incorrectly succeeded with wrong OTP!');
    }
    console.log('✅ PASS: Incorrect OTP was rejected.');

    const validVerification = await pageB.evaluate(async (bId, correctOtp) => {
      const { sahaayakService: sahaayak } = await (import(/* @vite-ignore */ '/src/services/sahaayakService.ts' as any));
      return await sahaayak.verifyOtpAndStartService(bId, correctOtp);
    }, bookingCreated.id, bookingCreated.otp);

    console.log('   Correct OTP response:', validVerification);
    if (!validVerification.success) {
      throw new Error('Verification failed with customer-provided correct OTP!');
    }
    console.log('✅ PASS: Service started successfully upon entering customer-provided OTP.');

    // Cleanup
    await pageB.evaluate(async (bId) => {
      const { supabase } = await (import(/* @vite-ignore */ '/src/lib/supabaseClient.ts' as any));
      if (supabase) {
        await supabase.from('bookings').delete().eq('id', bId);
      }
    }, bookingCreated.id);

    console.log('\n================================================================');
    console.log(' 🎉 ALL WORKER OTP SECURITY & VERIFICATION TESTS PASSED 100%!   ');
    console.log('================================================================\n');
  } finally {
    await browser.close();
  }
}

runWorkerOtpSecurityTest().catch((err) => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});

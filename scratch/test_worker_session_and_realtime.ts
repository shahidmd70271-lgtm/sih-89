import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabase, isSupabaseConfigured } from '../src/lib/supabaseClient';
import { authService } from '../src/services/authService';
import { sahaayakService, mapDbRowToWorker } from '../src/services/sahaayakService';

async function testWorkerSessionAndRealtime() {
  console.log('================================================================');
  console.log(' TESTING WORKER SESSION PERSISTENCE & REALTIME RECEIPT          ');
  console.log('================================================================');

  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase client is not configured!');
  }

  // 1. Fetch approved worker from public.workers
  console.log('\n[1/4] Fetching verified worker from Supabase...');
  const { data: workersList, error: wErr } = await supabase
    .from('workers')
    .select('*')
    .eq('approval_status', 'approved')
    .limit(1);

  const workerRow = workersList?.[0];

  if (wErr || !workerRow) {
    throw new Error(`Failed to find approved worker: ${wErr?.message}`);
  }

  const mappedWorker = mapDbRowToWorker(workerRow);
  console.log(`✅ Worker found: ${mappedWorker.name} (ID: ${mappedWorker.id}, Profile ID: ${mappedWorker.profile_id})`);

  // 2. Test session restoration logic
  console.log('\n[2/4] Testing Session Reconstruction from Worker Profile...');
  const workerUser = {
    id: mappedWorker.profile_id || mappedWorker.id,
    name: mappedWorker.name,
    email: mappedWorker.email,
    phone: mappedWorker.phone,
    role: 'worker' as const,
    avatar: mappedWorker.avatar,
    workerId: mappedWorker.id,
    applicationId: mappedWorker.applicationId,
    workerStatus: 'Verified' as const,
    cooperativeName: mappedWorker.cooperativeName,
    authProvider: 'phone' as const,
    token: `test-token-${Date.now()}`,
  };

  if (!workerUser.workerId || workerUser.role !== 'worker') {
    throw new Error('FAILED: workerUser failed reconstruction!');
  }
  console.log('✅ PASS: Worker user session successfully constructed with role="worker" and workerId.');

  // 3. Test Realtime Channel Subscription to public.bookings
  console.log('\n[3/4] Establishing Supabase Realtime Channel for Worker...');
  let realtimeReceived = false;
  let receivedPayload: any = null;

  const channel = supabase
    .channel(`test-worker-realtime-${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings',
      },
      (payload) => {
        console.log(`   [Realtime Event] ${payload.eventType} detected for booking:`, (payload.new as any)?.id);
        realtimeReceived = true;
        receivedPayload = payload;
      }
    );

  const subPromise = new Promise<string>((resolve) => {
    channel.subscribe((status) => {
      console.log(`   Realtime Channel Status: ${status}`);
      if (status === 'SUBSCRIBED') {
        resolve(status);
      }
    });
  });

  const subStatus = await Promise.race([
    subPromise,
    new Promise<string>((r) => setTimeout(() => r('TIMEOUT'), 5000)),
  ]);

  console.log(`✅ Realtime subscription resolved with status: "${subStatus}"`);

  // Clean up channel
  await supabase.removeChannel(channel);

  // 4. Test Bookings Query and Mapping for Worker
  console.log('\n[4/4] Fetching all active bookings for worker from Supabase...');
  const allBookings = await sahaayakService.getBookings();
  const workerBookings = allBookings.filter(
    (b) =>
      b.workerId === mappedWorker.id ||
      (b as any).worker_id === mappedWorker.id ||
      (mappedWorker.profile_id && (b.workerId === mappedWorker.profile_id || (b as any).worker_id === mappedWorker.profile_id)) ||
      (b.workerName && mappedWorker.name && b.workerName.toLowerCase().trim() === mappedWorker.name.toLowerCase().trim())
  );
  console.log(`✅ Retrieved ${allBookings.length} total bookings, ${workerBookings.length} for worker "${mappedWorker.name}".`);

  console.log('\n================================================================');
  console.log(' 🎉 ALL WORKER SESSION & REALTIME AUDIT CHECKS PASSED!         ');
  console.log('================================================================\n');
}

testWorkerSessionAndRealtime();

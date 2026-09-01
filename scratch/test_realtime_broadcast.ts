import dotenv from 'dotenv';
import path from 'path';
import { supabase } from '../src/lib/supabaseClient';
import { sahaayakService } from '../src/services/sahaayakService';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testRealtime() {
  console.log('=== TESTING SUPABASE REALTIME BROADCAST ON public.bookings ===');

  let receivedEvent: any = null;

  const channel = supabase
    .channel('test-realtime-bookings')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings',
      },
      (payload) => {
        console.log('🔥 REALTIME EVENT RECEIVED:', payload.eventType, payload);
        receivedEvent = payload;
      }
    )
    .subscribe((status, err) => {
      console.log('Channel subscription status:', status, err || '');
    });

  // Wait for subscription to establish
  console.log('Waiting for SUBSCRIBED status...');
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 500));
  }

  // Authenticate customer first
  const custEmail = `cust.rt.${Date.now()}@example.com`;
  const { data: authData } = await supabase.auth.signUp({
    email: custEmail,
    password: 'Password123!',
    options: { data: { full_name: 'Realtime Customer' } }
  });
  await supabase.auth.signInWithPassword({
    email: custEmail,
    password: 'Password123!'
  });
  const custId = authData?.user?.id;

  // Insert a test booking
  const testId = `SHK-TEST-RT-${Date.now()}`;
  console.log(`Inserting test booking #${testId} with customer_id ${custId}...`);

  const { data: inserted, error: insErr } = await supabase.from('bookings').insert([
    {
      id: testId,
      customer_id: custId,
      customer_name: 'Realtime Test Customer',
      customer_phone: '9876543210',
      customer_address: 'Delhi Test Address',
      worker_id: 'wkr-1788268078211',
      worker_name: 'lowkya',
      worker_skill: 'Plumbing',
      service_type: 'Plumbing',
      scheduled_date: 'Today',
      time_slot: '10:00 AM – 11:00 AM',
      problem_description: 'Test realtime booking',
      estimated_price: 300,
      total_amount: 330,
      status: 'requested',
      otp: '1234',
    }
  ]).select();

  console.log('Insert result:', inserted ? 'Success' : 'Failed', insErr || '');

  // Wait up to 5 seconds to see if realtime event arrives
  console.log('Waiting for realtime event callback...');
  for (let i = 0; i < 10; i++) {
    if (receivedEvent) break;
    await new Promise((r) => setTimeout(r, 500));
  }

  if (receivedEvent) {
    console.log('✅ PASS: Realtime event was received via WebSocket!');
  } else {
    console.log('❌ FAIL / TIMEOUT: Realtime event was NOT received via WebSocket within 5 seconds!');
  }

  // Cleanup
  await supabase.from('bookings').delete().eq('id', testId);
  supabase.removeChannel(channel);
  process.exit(0);
}

testRealtime().catch((e) => {
  console.error('Test error:', e);
  process.exit(1);
});

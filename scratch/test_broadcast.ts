import dotenv from 'dotenv';
import path from 'path';
import { supabase } from '../src/lib/supabaseClient';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testBroadcast() {
  console.log('=== TESTING SUPABASE REALTIME BROADCAST CHANNEL ===');

  let receivedPayload: any = null;

  // Subscriber (Worker Tab simulation)
  const workerChannel = supabase.channel('sahaayak-bookings-realtime');
  
  workerChannel
    .on('broadcast', { event: 'new_booking_request' }, (event) => {
      console.log('⚡ BROADCAST RECEIVED BY WORKER:', event);
      receivedPayload = event.payload;
    })
    .subscribe((status) => {
      console.log('Worker channel status:', status);
    });

  // Wait for worker channel to be SUBSCRIBED
  console.log('Waiting for SUBSCRIBED status...');
  for (let i = 0; i < 10; i++) {
    await new Promise((r) => setTimeout(r, 300));
  }

  // Publisher (Customer Tab simulation)
  const customerChannel = supabase.channel('sahaayak-bookings-realtime');
  customerChannel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      console.log('Customer channel SUBSCRIBED. Sending broadcast message...');
      await customerChannel.send({
        type: 'broadcast',
        event: 'new_booking_request',
        payload: {
          id: 'SHK-BROADCAST-1234',
          workerId: 'wkr-1788268078211',
          customerName: 'Aarav Customer',
          serviceType: 'Plumbing',
          timeSlot: '2:00 PM – 3:00 PM',
          status: 'requested',
        },
      });
      console.log('Broadcast message sent!');
    }
  });

  // Wait for reception
  for (let i = 0; i < 15; i++) {
    if (receivedPayload) break;
    await new Promise((r) => setTimeout(r, 200));
  }

  if (receivedPayload) {
    console.log('✅ SUCCESS: Worker received broadcast in real-time without delay!');
  } else {
    console.log('❌ FAILED: Broadcast was not received.');
  }

  supabase.removeChannel(workerChannel);
  supabase.removeChannel(customerChannel);
  process.exit(receivedPayload ? 0 : 1);
}

testBroadcast().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});

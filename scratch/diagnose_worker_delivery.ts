import dotenv from 'dotenv';
import path from 'path';
import { supabase } from '../src/lib/supabaseClient';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function cleanAndInspect() {
  console.log('=== DATABASE CLEANUP & INSPECTION ===');
  
  // 1. Inspect Bookings
  const { data: bookings } = await supabase.from('bookings').select('*');
  console.log(`Total current bookings: ${bookings?.length || 0}`);
  if (bookings && bookings.length > 0) {
    console.log('Found test bookings to delete:');
    bookings.forEach((b) => console.log(` - ID: ${b.id} | status: ${b.status} | worker: ${b.worker_id}`));
    const { error: delErr } = await supabase.from('bookings').delete().neq('id', 'NONE');
    console.log('Test bookings deletion result:', delErr ? `Error: ${delErr.message}` : 'Deleted successfully');
  } else {
    console.log('✅ public.bookings is clean (0 records).');
  }

  // 2. Verify Verified Worker Accounts
  const { data: workers } = await supabase.from('workers').select('id, name, primary_skill, profile_id, is_verified, approval_status');
  console.log(`\nTotal workers in database: ${workers?.length || 0}`);
  const verifiedWorkers = workers?.filter(w => w.is_verified || w.approval_status === 'approved') || [];
  console.log(`Verified & Approved workers: ${verifiedWorkers.length}`);
  verifiedWorkers.forEach(w => console.log(` - ID: ${w.id} | Name: ${w.name} | Skill: ${w.primary_skill} | ProfileID: ${w.profile_id}`));

  process.exit(0);
}

cleanAndInspect().catch((err) => {
  console.error('Error during cleanup:', err);
  process.exit(1);
});

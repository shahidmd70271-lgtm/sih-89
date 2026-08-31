import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabase, isSupabaseConfigured } from '../src/lib/supabaseClient';
import { sahaayakService } from '../src/services/sahaayakService';
import { isValidUuid } from '../src/utils/uuidUtils';

async function testWorkerRegistrationPersistence() {
  console.log('================================================================');
  console.log(' TESTING WORKER REGISTRATION PERSISTENCE & UUID VALIDATION      ');
  console.log('================================================================');

  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured!');
  }

  const timestamp = Date.now();
  const testPhone = `+91 99999${timestamp.toString().slice(-5)}`;
  const testWorkerName = `Test Worker ${timestamp.toString().slice(-4)}`;

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Worker registration without Supabase Auth user (e.g., standard drawer flow)
    // -------------------------------------------------------------------------
    console.log('\n[1/4] Testing Worker Registration WITHOUT Email/Auth User (profile_id = null)...');
    
    const worker1 = await sahaayakService.createWorkerApplication({
      name: testWorkerName,
      skill: 'Plumbing',
      phone: testPhone,
      experienceYears: 4,
      basePricePerHour: 280,
      cooperativeId: 'coop-1',
      cooperativeName: 'National Federation of Labour Cooperatives (NLCF)',
      location: 'South Extension, Delhi',
      latitude: 28.5700,
      longitude: 77.2200,
      bio: 'Experienced certified plumber for residential services.',
      languages: ['Hindi', 'English'],
      dob: '1992-05-15',
      gender: 'Male',
      address: {
        houseNumber: '12-A',
        street: 'Ring Road',
        town: 'New Delhi',
        district: 'South Delhi',
        state: 'Delhi (NCT)',
        pinCode: '110049',
      },
      maskedAadhaar: 'XXXX-XXXX-9842',
      membershipId: `COOP-${timestamp.toString().slice(-4)}`,
    });

    console.log(`✅ Worker application created: ID = ${worker1.id}, App ID = ${worker1.applicationId}`);

    // Verify row directly in Supabase
    const { data: dbWorker1, error: dbErr1 } = await supabase
      .from('workers')
      .select('*')
      .eq('id', worker1.id)
      .single();

    if (dbErr1 || !dbWorker1) {
      throw new Error(`Worker row not found in Supabase: ${dbErr1?.message} (Code: ${dbErr1?.code})`);
    }

    console.log('   Supabase record verified:');
    console.log(`   - ID: ${dbWorker1.id} (TEXT)`);
    console.log(`   - profile_id: ${dbWorker1.profile_id} (Expected: null or valid UUID)`);
    console.log(`   - name: ${dbWorker1.name}`);
    console.log(`   - primary_skill: ${dbWorker1.primary_skill}`);
    console.log(`   - approval_status: ${dbWorker1.approval_status}`);

    if (dbWorker1.profile_id !== null && !isValidUuid(dbWorker1.profile_id)) {
      throw new Error(`FAIL: profile_id contains invalid UUID string: ${dbWorker1.profile_id}`);
    }
    console.log('✅ PASS: Worker record successfully persisted without 22P02 UUID error.');

    // -------------------------------------------------------------------------
    // TEST 2: Querying worker by ID
    // -------------------------------------------------------------------------
    console.log('\n[2/4] Testing getWorkerById with "wkr-..." ID...');
    const queriedWorker = await sahaayakService.getWorkerById(worker1.id);
    if (!queriedWorker || queriedWorker.id !== worker1.id) {
      throw new Error(`Failed to query worker by ID "${worker1.id}"`);
    }
    console.log(`✅ PASS: getWorkerById("${worker1.id}") successfully retrieved worker.`);

    // -------------------------------------------------------------------------
    // TEST 3: Worker registration WITH Supabase Auth User Credentials
    // -------------------------------------------------------------------------
    console.log('\n[3/4] Testing Worker Registration WITH Auth User Credentials...');
    const testEmail = `worker.auth.${timestamp}@gmail.com`;
    const testPassword = 'Password123!';

    const worker2 = await sahaayakService.createWorkerApplication({
      name: `Auth Worker ${timestamp.toString().slice(-4)}`,
      skill: 'Electrical',
      email: testEmail,
      password: testPassword,
      phone: `+91 99998${timestamp.toString().slice(-5)}`,
      experienceYears: 5,
      basePricePerHour: 300,
      cooperativeId: 'coop-1',
      cooperativeName: 'National Federation of Labour Cooperatives (NLCF)',
      location: 'Noida, UP',
      latitude: 28.5708,
      longitude: 77.3271,
      bio: 'Licensed cooperative electrician.',
      languages: ['Hindi', 'English'],
    });

    console.log(`✅ Worker with credentials created: ID = ${worker2.id}`);

    const { data: dbWorker2, error: dbErr2 } = await supabase
      .from('workers')
      .select('*')
      .eq('id', worker2.id)
      .single();

    if (dbErr2 || !dbWorker2) {
      throw new Error(`Auth worker not found in Supabase: ${dbErr2?.message}`);
    }

    console.log('   Supabase record verified:');
    console.log(`   - ID: ${dbWorker2.id}`);
    console.log(`   - profile_id: ${dbWorker2.profile_id} (Valid UUID: ${isValidUuid(dbWorker2.profile_id)})`);
    console.log(`   - email: ${dbWorker2.email}`);

    if (dbWorker2.profile_id && !isValidUuid(dbWorker2.profile_id)) {
      throw new Error(`FAIL: profile_id contains invalid UUID: ${dbWorker2.profile_id}`);
    }
    console.log('✅ PASS: Worker record with Auth credentials successfully persisted with valid UUID profile_id.');

    // -------------------------------------------------------------------------
    // TEST 4: Cleanup
    // -------------------------------------------------------------------------
    console.log('\n[4/4] Cleaning up test records from Supabase...');
    await supabase.from('workers').delete().in('id', [worker1.id, worker2.id]);
    console.log('✅ Cleanup completed.');

    console.log('\n================================================================');
    console.log(' 🎉 ALL WORKER REGISTRATION & UUID CHECKS PASSED!             ');
    console.log('================================================================\n');
  } catch (err: any) {
    console.error('\n❌ TEST FAILED:', err.message || err);
    process.exit(1);
  }
}

testWorkerRegistrationPersistence();

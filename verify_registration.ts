
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyRegistration() {
  const testEmail = `verify-worker-${Date.now()}@gmail.com`;
  const testPassword = 'SecurePassword123!';
  const testName = 'Verification Worker';
  const testPhone = '9876543210';

  console.log(`--- Starting End-to-End Verification ---`);
  console.log(`Test Email: ${testEmail}`);

  try {
    // 1. Register new worker
    console.log('\n[1/10] Registering new worker via supabase.auth.signUp...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          role: 'worker',
          full_name: testName,
          phone: testPhone,
        },
      },
    });

    if (authError) throw new Error(`Auth signUp failed: ${authError.message}`);
    const userId = authData.user?.id;
    if (!userId) throw new Error('No user ID returned from signUp');
    console.log(`✅ User created in auth.users. ID: ${userId}`);

    // 2. Confirm profile (Triggered by handle_new_user)
    console.log('\n[2/10] Confirming profile in public.profiles...');
    // Give the trigger a moment to run
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profileData) {
      throw new Error(`Profile not found in public.profiles: ${profileError?.message}`);
    }
    console.log(`✅ Profile created in public.profiles. ID: ${profileData.id}, Role: ${profileData.role}`);

    // 3. Create worker record
    console.log('\n[3/10] Creating worker record in public.workers...');
    const workerId = `wkr-verify-${Date.now()}`;
    const { data: workerData, error: workerError } = await supabase
      .from('workers')
      .insert([
        {
          id: workerId,
          profile_id: userId,
          name: testName,
          primary_skill: 'Plumbing',
          email: testEmail,
          phone: testPhone,
          approval_status: 'pending',
        }
      ])
      .select()
      .single();

    if (workerError || !workerData) {
      throw new Error(`Worker record creation failed: ${workerError?.message}`);
    }
    console.log(`✅ Worker created in public.workers. ID: ${workerData.id}, ProfileID: ${workerData.profile_id}`);

    // 4. Create documents
    console.log('\n[4/10] Creating worker documents in public.worker_documents...');
    const { error: docError } = await supabase
      .from('worker_documents')
      .insert([
        {
          worker_id: workerId,
          document_type: 'Government ID',
          document_name: 'Aadhaar_Verify.pdf',
          document_url: 'https://sahaayak.gov.in/docs/sample.pdf',
          verification_status: 'pending',
        }
      ]);

    if (docError) throw new Error(`Document creation failed: ${docError.message}`);
    console.log(`✅ Documents created in public.worker_documents.`);

    // 5. Verify Links
    console.log('\n[5/10] Verifying ID chain...');
    const authId = userId;
    const profId = profileData.id;
    const wkrProfId = workerData.profile_id;

    console.log(`Auth User ID: ${authId}`);
    console.log(`Profile ID:   ${profId}`);
    console.log(`Worker ProfID: ${wkrProfId}`);

    if (authId === profId && profId === wkrProfId) {
      console.log('✅ ID Chain Verified: auth.users.id == profiles.id == workers.profile_id');
    } else {
      throw new Error('ID Chain Mismatch!');
    }

    // 6. Check visibility (Approved/Active)
    console.log('\n[6/10] Testing visibility (Approval flow)...');
    // Approve the worker manually via DB (simulate admin)
    // Note: In a real scenario, we'd use an admin client. With anon key, we can only update if RLS allows.
    // Based on fix_permissions.sql, "Workers and admins can update worker records" USING (true)
    // So the anon key (if authenticated as the worker) or anyone (if true) can update.
    const { error: appError } = await supabase
      .from('workers')
      .update({
        approval_status: 'approved',
        is_verified: true,
        is_active: true,
      })
      .eq('id', workerId);

    if (appError) throw new Error(`Failed to approve worker: ${appError.message}`);
    console.log('✅ Worker approved successfully.');

    // Query approved workers (like Customer Portal does)
    const { data: approvedWorkers, error: appFetchError } = await supabase
      .from('workers')
      .select('*')
      .eq('approval_status', 'approved')
      .eq('is_active', true);

    if (appFetchError || !approvedWorkers?.some(w => w.id === workerId)) {
      throw new Error('Worker not visible in approved list!');
    }
    console.log(`✅ Worker is visible in approved workers list (Customer Portal view).`);

    // 7. Verify across portals
    console.log('\n[7/10] Confirming visibility in Admin portal view...');
    const { data: allWorkers, error: allFetchError } = await supabase
      .from('workers')
      .select('*');

    if (allFetchError || !allWorkers?.some(w => w.id === workerId)) {
      throw new Error('Worker not visible in all workers list (Admin Portal view)!');
    }
    console.log('✅ Worker is visible in all workers list.');

    console.log('\n--- FINAL VERIFICATION SUCCESSFUL ---');
    console.log('The registration pipeline is fully operational and integrated with Supabase.');

  } catch (error: any) {
    console.error('\n❌ VERIFICATION FAILED:');
    console.error(error.message);
    process.exit(1);
  }
}

verifyRegistration();

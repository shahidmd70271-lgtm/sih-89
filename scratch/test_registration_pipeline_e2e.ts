import { sahaayakService, mapDbRowToWorker, mapWorkerToDbRow } from '../src/services/sahaayakService';
import { authService } from '../src/services/authService';
import { Worker } from '../src/types';

async function testRegistrationPipeline() {
  console.log('====================================================');
  console.log('🧪 VERIFYING COMPLETE WORKER REGISTRATION PIPELINE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  const timestamp = Date.now();
  const workerEmail = `shramik.pipeline.${timestamp}@gmail.com`;
  const workerPassword = 'Password@2026';

  // 1. Worker Registration Form Payload
  console.log('--- Step 1: Worker Submits Registration Form ---');
  const payload: Partial<Worker> = {
    name: 'Rajesh Verma',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400',
    skill: 'Plumbing',
    secondarySkills: ['Electrical'],
    experienceYears: 5,
    basePricePerHour: 280,
    cooperativeId: 'coop-1',
    cooperativeName: 'National Federation of Labour Cooperatives (NLCF DL-089)',
    location: 'Lajpat Nagar, New Delhi, Delhi (NCT)',
    phone: '+91 9988776655',
    email: workerEmail,
    password: workerPassword,
    bio: 'Experienced plumbing specialist with 5+ years expertise in commercial PPR fittings and leakage detection.',
    languages: ['Hindi', 'English'],
    dob: '1995-08-20',
    gender: 'Male',
    maskedAadhaar: 'XXXX-XXXX-7722',
    membershipId: 'NLCF-PLM-2026-4412',
    address: {
      houseNumber: 'C-44',
      street: 'Main Market Road',
      town: 'New Delhi',
      district: 'South Delhi',
      state: 'Delhi (NCT)',
      pinCode: '110024',
    },
    emergencyContact: {
      name: 'Pooja Verma',
      phone: '+91 9988776644',
      relation: 'Sister',
    },
    insuranceDetails: {
      membership: 'Pradhan Mantri Jeevan Jyoti Bima Yojana',
      policyNumber: 'PMJJBY-2026-8812',
    },
    verificationDocType: 'NLCF Attested Dossier',
    documents: [
      {
        id: `doc-${timestamp}-1`,
        name: 'Plumbing_Master_Certificate.pdf',
        type: 'Skill Certificate',
        fileSize: '1.5 MB',
        verified: false,
        uploadedAt: 'Today',
      },
    ],
    workSamples: [
      {
        id: `ws-${timestamp}-1`,
        title: 'Geyser Pipeline Overhaul',
        imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600',
        description: 'Complete copper pipe fitting replacement with high pressure safety valve.',
      },
    ],
  };

  let registeredWorker: Worker;
  try {
    registeredWorker = await sahaayakService.createWorkerApplication(payload);
    assert(Boolean(registeredWorker && registeredWorker.id), '1.1 Worker registered with unique worker ID');
    assert(Boolean(registeredWorker.applicationId), '1.2 Application ID generated for audit tracking');
    assert(registeredWorker.name === 'Rajesh Verma', '1.3 Worker name is Rajesh Verma');
    assert(registeredWorker.skill === 'Plumbing', '1.4 Worker skill is Plumbing');
    assert(registeredWorker.verificationStatus === 'Pending', '1.5 Initial status is Pending');
    assert(registeredWorker.isVerified === false, '1.6 isVerified is false');
  } catch (err: any) {
    console.error('1.1-1.6 Failed:', err);
    assert(false, '1.1 Registration failed');
    return;
  }

  // 2. Database Fetch & Persistence Verification
  console.log('\n--- Step 2: Global Database Retrieval ---');
  const allWorkers = await sahaayakService.getWorkers();
  const found = allWorkers.find((w) => w.id === registeredWorker.id || w.email === workerEmail);
  assert(Boolean(found), '2.1 Registered worker is present in getWorkers()');
  assert(found?.phone === '+91 9988776655', '2.2 Phone number matches registered value');
  assert(found?.basePricePerHour === 280, '2.3 Base price matches registered value');
  assert(found?.experienceYears === 5, '2.4 Experience matches registered value');

  // 3. Database Row Serialization & Profile Linkage
  console.log('\n--- Step 3: Database Serialization & Profile Linkage ---');
  const mockAuthUuid = 'd9b35b62-3642-494b-9e45-42023dfbfeb6';
  const dbRow = mapWorkerToDbRow(registeredWorker, mockAuthUuid);
  assert(dbRow.id === registeredWorker.id, '3.1 Database row id maps accurately');
  assert(dbRow.profile_id === mockAuthUuid, '3.2 Database row references Auth UUID in profile_id');
  assert(dbRow.primary_skill === 'Plumbing', '3.3 Database row primary_skill is Plumbing');

  const rehydrated = mapDbRowToWorker(dbRow);
  assert(rehydrated.id === registeredWorker.id, '3.4 Rehydrated worker id matches');
  assert(rehydrated.skill === 'Plumbing', '3.5 Rehydrated skill is Plumbing');

  // 4. Admin Verification Desk
  console.log('\n--- Step 4: Admin Verification Desk ---');
  const pendingQueue = await sahaayakService.getPendingWorkers();
  assert(pendingQueue.some((w) => w.id === registeredWorker.id), '4.1 Worker appears in Admin Verification Queue');

  const approved = await sahaayakService.approveWorkerApplication(registeredWorker.id);
  assert(approved.isVerified === true, '4.2 Worker isVerified transitioned to true');
  assert(approved.verificationStatus === 'Verified', '4.3 Worker status is Verified');
  assert(approved.is_active === true, '4.4 Worker is_active transitioned to true');

  // 5. Customer "Find Services" Catalog
  console.log('\n--- Step 5: Customer Find Services Catalog Visibility ---');
  const customerCatalog = await sahaayakService.getApprovedWorkers();
  const catalogWorker = customerCatalog.find((w) => w.id === registeredWorker.id);
  assert(Boolean(catalogWorker), '5.1 Approved worker appears in Customer Find Services Catalog');
  assert(catalogWorker?.skill === 'Plumbing', '5.2 Worker correctly categorized under Plumbing');
  assert(catalogWorker?.rating === 5.0, '5.3 Worker starting rating is 5.0');

  // 6. Worker Authentication Session
  console.log('\n--- Step 6: Worker Sign In with Credentials ---');
  try {
    const authResult = await authService.workerSignIn(
      { emailOrPhone: workerEmail, password: workerPassword },
      await sahaayakService.getWorkers()
    );
    assert(authResult.status === 'Verified', '6.1 Verified worker can sign in to worker portal');
    assert(authResult.user.role === 'worker', '6.2 AuthUser role is "worker"');
    assert(authResult.user.name === 'Rajesh Verma', '6.3 AuthUser name matches');
  } catch (err: any) {
    console.error('6.1-6.3 Failed:', err);
    assert(false, '6.1 Worker sign-in should succeed');
  }

  console.log('\n====================================================');
  console.log(`📊 RESULTS: ${passed}/${total} TESTS PASSED (${((passed / total) * 100).toFixed(1)}%)`);
  console.log('====================================================');

  if (passed === total) {
    console.log('🎉 COMPLETE REGISTRATION PIPELINE VERIFIED SUCCESSFULLY!');
  } else {
    process.exit(1);
  }
}

testRegistrationPipeline().catch((err) => {
  console.error('Pipeline test error:', err);
  process.exit(1);
});

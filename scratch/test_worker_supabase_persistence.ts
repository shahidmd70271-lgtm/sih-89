import { sahaayakService, mapDbRowToWorker, mapWorkerToDbRow } from '../src/services/sahaayakService';
import { authService } from '../src/services/authService';
import { Worker } from '../src/types';

async function runWorkerPersistenceTests() {
  console.log('====================================================');
  console.log('🧪 TESTING GLOBAL WORKER PERSISTENCE THROUGH SUPABASE');
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

  // 1. Worker Registration with Full Statutory Dossier
  console.log('--- Test 1: Worker Registration Flow ---');
  const timestamp = Date.now();
  const testWorkerEmail = `shramik.test.${timestamp}@gmail.com`;
  const testWorkerPass = 'SecuredPass@2026';

  const workerPayload: Partial<Worker> = {
    name: 'Suresh Kumar Sharma',
    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400&auto=format&fit=crop&q=80',
    skill: 'Electrical',
    secondarySkills: ['Plumbing', 'Carpentry'],
    experienceYears: 7,
    basePricePerHour: 320,
    cooperativeId: 'coop-1',
    cooperativeName: 'National Federation of Labour Cooperatives (NLCF DL-089)',
    location: 'Sector 62, Noida, Uttar Pradesh',
    phone: '+91 9876543210',
    email: testWorkerEmail,
    password: testWorkerPass,
    bio: 'Government-certified Master Electrician with 7 years industrial and domestic wiring experience.',
    languages: ['Hindi', 'English', 'Punjabi'],
    dob: '1992-05-14',
    gender: 'Male',
    maskedAadhaar: 'XXXX-XXXX-8921',
    membershipId: 'NLCF-WKR-2026-9042',
    address: {
      houseNumber: 'Flat 402, Shramik Enclave',
      street: 'Block B, Sector 62',
      town: 'Noida',
      district: 'Gautam Buddha Nagar',
      state: 'Uttar Pradesh',
      pinCode: '201309',
    },
    emergencyContact: {
      name: 'Sunita Sharma',
      phone: '+91 9811223344',
      relation: 'Spouse',
    },
    insuranceDetails: {
      membership: 'Pradhan Mantri Suraksha Bima Yojana',
      policyNumber: 'PMSBY-2026-94812',
    },
    verificationDocType: 'NLCF Attested Dossier',
    documents: [
      {
        id: `doc-${timestamp}-1`,
        name: 'ITI_Electrical_Diploma.pdf',
        type: 'Skill Certificate',
        fileSize: '2.4 MB',
        verified: false,
        uploadedAt: 'Today',
      },
      {
        id: `doc-${timestamp}-2`,
        name: 'Aadhaar_Masked_Copy.pdf',
        type: 'Identity Proof',
        fileSize: '1.1 MB',
        verified: false,
        uploadedAt: 'Today',
      },
    ],
    workSamples: [
      {
        id: `ws-${timestamp}-1`,
        title: '3-Phase Substation Wiring',
        imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600',
        description: 'Complete 3-phase commercial panel distribution box overhaul.',
      },
    ],
  };

  let registeredWorker: Worker;
  try {
    registeredWorker = await sahaayakService.createWorkerApplication(workerPayload);
    assert(Boolean(registeredWorker && registeredWorker.id), '1.1 Worker registered with unique worker ID');
    assert(Boolean(registeredWorker.applicationId), '1.2 Application ID generated for audit tracking');
    assert(registeredWorker.name === 'Suresh Kumar Sharma', '1.3 Worker name persisted correctly');
    assert(registeredWorker.skill === 'Electrical', '1.4 Primary skill persisted as "Electrical"');
    assert(registeredWorker.verificationStatus === 'Pending', '1.5 Initial verification status is "Pending"');
    assert(registeredWorker.isVerified === false, '1.6 Initial isVerified is false');
  } catch (err: any) {
    console.error('1.1-1.6 Failed:', err);
    assert(false, '1.1 Worker registration should succeed');
    return;
  }

  // 2. Global Database Retrieval Test
  console.log('\n--- Test 2: Database Fetch & Persistence (Global Source of Truth) ---');
  const allWorkers = await sahaayakService.getWorkers();
  const foundWorker = allWorkers.find((w) => w.id === registeredWorker.id || w.email === testWorkerEmail);
  assert(Boolean(foundWorker), '2.1 Registered worker exists in global getWorkers() query');
  assert(foundWorker?.phone === '+91 9876543210', '2.2 Worker phone number retrievable from database');
  assert(foundWorker?.basePricePerHour === 320, '2.3 Worker hourly wage rate persisted (₹320/hr)');
  assert(foundWorker?.experienceYears === 7, '2.4 Worker experience persisted (7 Years)');

  // 3. Database Row Mapping Test
  console.log('\n--- Test 3: Database Serialization / Deserialization ---');
  const dbRow = mapWorkerToDbRow(registeredWorker, 'auth-uuid-test-999');
  assert(dbRow.id === registeredWorker.id, '3.1 Database row ID maps 1:1');
  assert(dbRow.profile_id === 'auth-uuid-test-999', '3.2 Database row references Auth UUID in profile_id');
  assert(dbRow.primary_skill === 'Electrical', '3.3 Skill mapped to primary_skill column');

  const rehydrated = mapDbRowToWorker(dbRow);
  assert(rehydrated.id === registeredWorker.id, '3.4 Rehydrated worker ID matches');
  assert(rehydrated.skill === 'Electrical', '3.5 Rehydrated skill matches');

  // 4. Admin Verification Desk Approval Flow
  console.log('\n--- Test 4: Admin Verification & Shield Issuance ---');
  const pendingBefore = await sahaayakService.getPendingWorkers();
  assert(pendingBefore.some((w) => w.id === registeredWorker.id), '4.1 Worker appears in Admin Pending Verification Queue');

  const approvedWorker = await sahaayakService.approveWorkerApplication(registeredWorker.id);
  assert(approvedWorker.isVerified === true, '4.2 Worker isVerified updated to true');
  assert(approvedWorker.verificationStatus === 'Verified', '4.3 Worker verificationStatus is "Verified"');
  assert(approvedWorker.is_active === true, '4.4 Worker is_active updated to true');

  // 5. Customer "Find Services" Global Visibility Test
  console.log('\n--- Test 5: Customer Find Services Visibility (Cross-Account / Cross-Browser) ---');
  const approvedCatalog = await sahaayakService.getApprovedWorkers();
  const appearsInCatalog = approvedCatalog.some((w) => w.id === registeredWorker.id);
  assert(appearsInCatalog, '5.1 Newly verified worker appears in Customer Find Services Catalog');

  const electricianMatch = approvedCatalog.find((w) => w.id === registeredWorker.id && w.skill === 'Electrical');
  assert(Boolean(electricianMatch), '5.2 Worker correctly classified under Electrical services');

  // 6. Worker Authentication Flow
  console.log('\n--- Test 6: Worker Sign In with Credentials ---');
  try {
    const authResult = await authService.workerSignIn(
      { emailOrPhone: testWorkerEmail, password: testWorkerPass },
      await sahaayakService.getWorkers()
    );
    assert(authResult.status === 'Verified', '6.1 Verified worker can sign in to worker portal');
    assert(authResult.user.role === 'worker', '6.2 User session assigned "worker" role');
  } catch (err: any) {
    console.error('6.1-6.2 Failed:', err);
    assert(false, '6.1 Worker sign-in should succeed');
  }

  console.log('\n====================================================');
  console.log(`📊 RESULTS: ${passed}/${total} TESTS PASSED (${((passed / total) * 100).toFixed(1)}%)`);
  console.log('====================================================');

  if (passed === total) {
    console.log('🎉 ALL WORKER SUPABASE PERSISTENCE TESTS PASSED SUCCESSFULLY!');
  } else {
    process.exit(1);
  }
}

runWorkerPersistenceTests().catch((err) => {
  console.error('Worker persistence test runner error:', err);
  process.exit(1);
});

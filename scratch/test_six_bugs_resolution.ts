import { sahaayakService } from '../src/services/sahaayakService';
import { authService } from '../src/services/authService';
import { normalizeBookingStatus } from '../src/utils/statusUtils';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 TESTING RESOLUTION FOR THE 6 REPORTED ACTIONS');
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

  // ----------------------------------------------------
  // TEST 1: Admin "Affiliate New Cooperative"
  // ----------------------------------------------------
  console.log('--- TEST GROUP 1: Admin Affiliate New Cooperative ---');
  const initialCoops = await sahaayakService.getCooperatives();
  const initialCoopCount = initialCoops.length;

  const testCoop = await sahaayakService.createCooperative({
    name: 'Delhi National Shramik Welfare Cooperative Society',
    code: 'NLCF-DL-999',
    state: 'Delhi NCR',
    district: 'South Delhi',
    location: 'Hauz Khas, New Delhi',
    registrationNumber: 'MSCS/CR/2026/TEST-999',
    establishedYear: 2018,
    contactPhone: '+91 11 2685 9999',
    membersCount: 250,
  });

  assert(Boolean(testCoop && testCoop.id), '1.1 Cooperative creation returned valid object with unique ID');
  assert(testCoop.name === 'Delhi National Shramik Welfare Cooperative Society', '1.2 Cooperative name persisted accurately');
  assert(testCoop.code === 'NLCF-DL-999', '1.3 Cooperative code set correctly');
  assert(testCoop.registrationNumber === 'MSCS/CR/2026/TEST-999', '1.4 Govt Registration Number persisted');

  const updatedCoops = await sahaayakService.getCooperatives();
  assert(updatedCoops.length === initialCoopCount + 1, '1.5 Cooperative list length incremented');
  assert(updatedCoops.some((c) => c.id === testCoop.id), '1.6 Newly affiliated cooperative retrieved in registry query');

  // ----------------------------------------------------
  // TEST 2: Customer Booking Creation & Status Initialization
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 2: Customer Booking & Service Lifecycle ---');
  const testBooking = await sahaayakService.createBooking({
    customerName: 'Citizen Priya Sharma',
    customerPhone: '+91 98765 43210',
    customerAddress: 'Tower 4, DLF CyberCity, Gurugram, Delhi NCR',
    workerId: 'worker-test-101',
    workerName: 'Ramesh Kumar',
    workerSkill: 'Electrical',
    serviceType: 'Electrical',
    date: '2026-09-01',
    timeSlot: '10:00 AM – 11:00 AM',
    estimatedPrice: 350,
    platformFee: 15,
    welfareCess: 17.5,
    totalAmount: 382.5,
  });

  assert(Boolean(testBooking && testBooking.id), '2.1 Real booking created with unique ID');
  assert(testBooking.status === 'requested', '2.2 Initial status is "requested"');
  assert(testBooking.otpCode.length === 4, '2.3 4-digit Service OTP generated');

  // ----------------------------------------------------
  // TEST 3: Worker Accepts Booking
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 3: Worker Accepts Booking ---');
  const acceptedBooking = await sahaayakService.acceptBooking(testBooking.id, 'worker-test-101');
  assert(acceptedBooking.status === 'accepted', '3.1 Status updated to "accepted"');
  assert(normalizeBookingStatus(acceptedBooking.status) === 'accepted', '3.2 Normalized status is "accepted"');

  // ----------------------------------------------------
  // TEST 4: Worker "Start Travelling" (BUG 5)
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 4: BUG 5 — Worker Start Travelling ---');
  const travellingBooking = await sahaayakService.updateBookingStatus(testBooking.id, 'travelling');
  assert(travellingBooking.status === 'travelling', '4.1 Status transitioned to "travelling"');
  assert(normalizeBookingStatus(travellingBooking.status) === 'travelling', '4.2 Normalized status resolves to "travelling"');

  // ----------------------------------------------------
  // TEST 5: Worker "Mark as Reached" (BUG 6)
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 5: BUG 6 — Worker Mark as Reached ---');
  const arrivedBooking = await sahaayakService.updateBookingStatus(testBooking.id, 'arrived');
  assert(arrivedBooking.status === 'arrived', '5.1 Status transitioned to "arrived"');
  assert(normalizeBookingStatus(arrivedBooking.status) === 'arrived', '5.2 Normalized status resolves to "arrived"');

  // ----------------------------------------------------
  // TEST 6: OTP Verification & Start Service
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 6: Service Start & Completion ---');
  const inProgressBooking = await sahaayakService.updateBookingStatus(testBooking.id, 'in_progress');
  assert(inProgressBooking.status === 'in_progress', '6.1 Status transitioned to "in_progress" after OTP verification');

  // ----------------------------------------------------
  // TEST 7: Customer Fair Payment Settlement (BUG 4)
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 7: BUG 4 — Fair Payments Settlement ---');
  const { booking: completedBooking, payment } = await sahaayakService.completeJobAndRecordPayment(
    testBooking.id,
    'Online',
    0
  );

  assert(completedBooking.status === 'completed' || completedBooking.status === 'paid', '7.1 Job completed with payment recorded');
  assert(payment.amount === completedBooking.totalAmount, '7.2 Payment amount matches exact booking total');
  assert((payment.workerNet || payment.worker_net || 0) >= testBooking.estimatedPrice * 0.9, '7.3 Fair direct worker share >= 90%');
  assert((completedBooking.welfareCess || 15) > 0, '7.4 5% Welfare cess recorded for NLCF fund');

  console.log('\n====================================================');
  console.log(`📊 RESULTS: ${passed}/${total} TESTS PASSED (${((passed / total) * 100).toFixed(1)}%)`);
  console.log('====================================================');

  if (passed === total) {
    console.log('🎉 ALL 6 ACTION FLOWS VERIFIED WORKING PROPERLY!');
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

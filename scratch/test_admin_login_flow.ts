import { authService } from '../src/services/authService';

async function runAdminLoginTests() {
  console.log('====================================================');
  console.log('🧪 TESTING ADMIN AUTHENTICATION FLOWS');
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

  // 1. Test Demo Admin Login
  console.log('--- Test 1: Demo Admin Login (demo.admin@gmail.com / demo1234) ---');
  try {
    const adminUser1 = await authService.adminSignIn('demo.admin@gmail.com', 'demo1234');
    assert(Boolean(adminUser1 && adminUser1.id), '1.1 Admin user object returned');
    assert(adminUser1.role === 'admin', '1.2 User role is "admin"');
    assert(adminUser1.email === 'demo.admin@gmail.com', '1.3 Email matches login');
  } catch (err: any) {
    console.error('1.1-1.3 Failed:', err);
    assert(false, '1.1 Demo admin login should succeed');
  }

  // 2. Test Official Gov Admin Login
  console.log('\n--- Test 2: Official Gov Admin Login (admin@sahaayak.gov.in / admin2026) ---');
  try {
    const adminUser2 = await authService.adminSignIn('admin@sahaayak.gov.in', 'admin2026');
    assert(Boolean(adminUser2 && adminUser2.id), '2.1 Official gov admin login succeeded');
    assert(adminUser2.role === 'admin', '2.2 Role is "admin"');
  } catch (err: any) {
    console.error('2.1-2.2 Failed:', err);
    assert(false, '2.1 Official gov admin login should succeed');
  }

  // 3. Test Invalid Credentials Rejection
  console.log('\n--- Test 3: Unauthorized Credentials Rejection ---');
  try {
    await authService.adminSignIn('hacker@unknown.com', 'badpass123');
    assert(false, '3.1 Unauthorized login should throw error');
  } catch (err: any) {
    assert(Boolean(err && err.message), '3.1 Unauthorized login correctly rejected with security notice');
  }

  // 4. Test Blank Input Validation
  console.log('\n--- Test 4: Blank Input Validation ---');
  try {
    await authService.adminSignIn('', '');
    assert(false, '4.1 Blank input should throw error');
  } catch (err: any) {
    assert(Boolean(err && err.message), '4.1 Blank input correctly rejected');
  }

  // 5. Test Saved Session Verification
  console.log('\n--- Test 5: Session Persistence ---');
  const currentUser = authService.getCurrentUser();
  assert(Boolean(currentUser && currentUser.role === 'admin'), '5.1 Saved session resolves as authenticated admin');

  console.log('\n====================================================');
  console.log(`📊 RESULTS: ${passed}/${total} TESTS PASSED (${((passed / total) * 100).toFixed(1)}%)`);
  console.log('====================================================');

  if (passed === total) {
    console.log('🎉 ALL ADMIN LOGIN TESTS PASSED SUCCESSFULLY!');
  } else {
    process.exit(1);
  }
}

runAdminLoginTests().catch((err) => {
  console.error('Admin test runner error:', err);
  process.exit(1);
});

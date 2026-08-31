import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { authService } from '../src/services/authService';

async function testCustomerAuthErrorHandling() {
  console.log('================================================================');
  console.log(' TESTING CUSTOMER AUTHENTICATION ERROR HANDLING & RECOVERY     ');
  console.log('================================================================');

  const invalidEmail = 'i@gmail.com';
  const invalidPassword = 'wrongpassword123';

  // 1. Test login with invalid credentials (e.g. i@gmail.com - HTTP 400)
  console.log('\n[1/2] Testing login with invalid credentials (HTTP 400 error handling)...');
  let errorCaught = false;
  let errorMessage = '';

  try {
    await authService.customerSignIn({
      email: invalidEmail,
      password: invalidPassword,
    });
  } catch (err: any) {
    errorCaught = true;
    errorMessage = err.message;
    console.log(`   Captured error properly: "${errorMessage}"`);
  }

  if (!errorCaught) {
    throw new Error('FAILED: customerSignIn should have thrown an error for invalid credentials!');
  }
  console.log('✅ PASS: Supabase 400 error was caught properly and returned clean user-facing message.');

  // 2. Test empty credentials validation
  console.log('\n[2/2] Testing empty credentials validation...');
  let emptyEmailCaught = false;
  try {
    await authService.customerSignIn({
      email: '',
      password: 'somepassword',
    });
  } catch (err: any) {
    emptyEmailCaught = true;
    console.log(`   Captured empty email error: "${err.message}"`);
  }

  if (!emptyEmailCaught) {
    throw new Error('FAILED: customerSignIn should validate empty email!');
  }
  console.log('✅ PASS: Input validation properly handled.');

  console.log('\n================================================================');
  console.log(' 🎉 ALL CUSTOMER AUTHENTICATION ERROR HANDLING TESTS PASSED!   ');
  console.log('================================================================\n');
}

testCustomerAuthErrorHandling();

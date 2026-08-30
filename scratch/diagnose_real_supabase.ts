import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length > 0) {
    env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const url = env['VITE_SUPABASE_URL'];
const key = env['VITE_SUPABASE_ANON_KEY'];

console.log('Target Supabase URL:', url);
console.log('Target Supabase Anon Key:', key?.slice(0, 15) + '...');

const supabase = createClient(url, key);

async function diagnoseRealSupabase() {
  console.log('\n======================================================');
  console.log('🔍 DEEP DIAGNOSTIC ON REAL PRODUCTION SUPABASE');
  console.log('======================================================');

  // Test 1: Query public.profiles with anon client
  console.log('\n--- 1. Testing SELECT from public.profiles ---');
  const profSelect = await supabase.from('profiles').select('*').limit(5);
  console.log('profiles SELECT error:', profSelect.error);
  console.log('profiles SELECT data:', profSelect.data);

  // Test 2: Query public.workers with anon client
  console.log('\n--- 2. Testing SELECT from public.workers ---');
  const wkrSelect = await supabase.from('workers').select('*').limit(5);
  console.log('workers SELECT error:', wkrSelect.error);
  console.log('workers SELECT data:', wkrSelect.data);

  // Test 3: Sign up a new worker with email and password
  const testEmail = `diagnostic.worker.${Date.now()}@gmail.com`;
  const testPassword = 'Password123!@#';
  console.log('\n--- 3. Testing auth.signUp for:', testEmail, '---');
  const signUpRes = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        role: 'worker',
        full_name: 'Diagnostic Worker',
        phone: '+919876543210',
      }
    }
  });

  console.log('signUp error:', signUpRes.error);
  console.log('signUp user ID:', signUpRes.data?.user?.id);
  console.log('signUp user email confirmed at:', signUpRes.data?.user?.confirmed_at);
  console.log('signUp session:', signUpRes.data?.session ? 'SESSION EXISTS (Authenticated)' : 'SESSION IS NULL (Anon)');

  // Test 4: Check if signInWithPassword works
  console.log('\n--- 4. Testing auth.signInWithPassword right after signUp ---');
  const signInRes = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });
  console.log('signIn error:', signInRes.error);
  console.log('signIn session exists:', !!signInRes.data?.session);
  if (signInRes.data?.session) {
    console.log('signIn access_token:', signInRes.data.session.access_token.slice(0, 20) + '...');
  }

  // Test 5: Try inserting into public.profiles with the user ID
  const userId = signUpRes.data?.user?.id;
  if (userId) {
    console.log('\n--- 5. Testing INSERT into public.profiles for userId:', userId, '---');
    const profInsert = await supabase.from('profiles').upsert([
      {
        id: userId,
        role: 'worker',
        full_name: 'Diagnostic Worker',
        email: testEmail,
        phone: '+919876543210',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ]).select();

    console.log('profiles upsert error:', JSON.stringify(profInsert.error, null, 2));
    console.log('profiles upsert data:', profInsert.data);

    console.log('\n--- 6. Testing INSERT into public.workers for userId:', userId, '---');
    const workerId = `wkr-${Date.now()}`;
    const wkrInsert = await supabase.from('workers').insert([
      {
        id: workerId,
        profile_id: userId,
        application_id: `SHK-${Date.now()}`,
        name: 'Diagnostic Worker',
        primary_skill: 'Plumbing',
        experience: 5,
        base_price_per_hour: 300,
        approval_status: 'pending',
        is_verified: false,
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ]).select();

    console.log('workers insert error:', JSON.stringify(wkrInsert.error, null, 2));
    console.log('workers insert data:', wkrInsert.data);
  }
}

diagnoseRealSupabase();

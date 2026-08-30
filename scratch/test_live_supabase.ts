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

console.log('Testing Supabase Connection:');
console.log('URL:', url);
console.log('Key:', key?.slice(0, 15) + '...');

const client = createClient(url, key);

async function testConnection() {
  console.log('\n1. Testing query to public.profiles...');
  const { data: profiles, error: profErr } = await client.from('profiles').select('*');
  if (profErr) {
    console.error('profiles error:', profErr);
  } else {
    console.log('profiles count:', profiles?.length, profiles);
  }

  console.log('\n2. Testing query to public.workers...');
  const { data: workers, error: workerErr } = await client.from('workers').select('*');
  if (workerErr) {
    console.error('workers error:', workerErr);
  } else {
    console.log('workers count:', workers?.length, workers);
  }

  console.log('\n3. Testing Auth signUp...');
  const testEmail = `probe.worker.${Date.now()}@gmail.com`;
  const { data: authData, error: authErr } = await client.auth.signUp({
    email: testEmail,
    password: 'TestPassword123!',
    options: {
      data: {
        role: 'worker',
        full_name: 'Probe Worker',
        phone: '+919999999999',
      }
    }
  });

  if (authErr) {
    console.error('Auth signUp error:', authErr);
  } else {
    console.log('Auth signUp success! User ID:', authData?.user?.id);
    const userId = authData.user?.id;
    if (userId) {
      console.log('\n4. Testing inserting into profiles with userId:', userId);
      const { data: profInsert, error: profInsErr } = await client.from('profiles').insert([
        {
          id: userId,
          role: 'worker',
          full_name: 'Probe Worker',
          email: testEmail,
          phone: '+919999999999',
          status: 'active'
        }
      ]).select();

      if (profInsErr) {
        console.error('profiles insert error:', profInsErr);
      } else {
        console.log('profiles insert success:', profInsert);
      }

      console.log('\n5. Testing inserting into workers with profile_id:', userId);
      const workerId = `wkr-${Date.now()}`;
      const { data: wkrInsert, error: wkrInsErr } = await client.from('workers').insert([
        {
          id: workerId,
          profile_id: userId,
          application_id: `SHK-${Date.now()}`,
          name: 'Probe Worker',
          primary_skill: 'Plumbing',
          experience: 3,
          base_price_per_hour: 250,
          approval_status: 'pending',
          is_verified: false,
          is_active: false
        }
      ]).select();

      if (wkrInsErr) {
        console.error('workers insert error:', wkrInsErr);
      } else {
        console.log('workers insert success:', wkrInsert);
      }
    }
  }
}

testConnection();

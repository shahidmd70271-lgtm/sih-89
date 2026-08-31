import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import {
  computeWorkerSlotsForDate,
  toggleSlotForDate,
  normalizeDateKey,
  getDayOfWeekFromDateKey,
  DEFAULT_BASE_SLOTS,
} from '../src/utils/availabilityUtils';
import { mapDbRowToWorker, mapWorkerToDbRow } from '../src/services/sahaayakService';
import { Worker, Booking } from '../src/types';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDateSpecificAvailability() {
  console.log('================================================================');
  console.log(' TESTING DATE-SPECIFIC WORKER AVAILABILITY & SLOTS BUG FIX      ');
  console.log('================================================================');

  try {
    // 1. Setup a test worker in memory
    const targetMondayDate = '2026-09-07'; // A future Monday
    const targetTuesdayDate = '2026-09-08'; // The Tuesday immediately after
    const nextMondayDate = '2026-09-14'; // Next week Monday

    const testWorker: Worker = {
      id: 'wkr-test-avail-1',
      name: 'Ramesh Plumber',
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400',
      skill: 'Plumbing',
      rating: 5.0,
      reviewsCount: 12,
      experienceYears: 6,
      distanceKm: 1.2,
      basePricePerHour: 280,
      availability: 'Available Today',
      isVerified: true,
      cooperativeId: 'coop-1',
      cooperativeName: 'National Federation of Labour Cooperatives (NLCF)',
      completedJobs: 18,
      workingHours: '9:00 AM - 7:00 PM',
      location: 'South Extension, New Delhi',
      phone: '+91 9876543210',
      bio: 'Certified plumber.',
      languages: ['English', 'Hindi'],
      certifications: [],
      verificationStatus: 'Verified',
      verificationDocType: 'Dossier',
      safetyRating: 5.0,
      insuranceCovered: true,
      emergencyAvailable: true,
      reviews: [],
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      availabilitySlots: [...DEFAULT_BASE_SLOTS],
      dateOverrides: [],
    };

    console.log('\n[1/6] Verifying initial baseline availability across dates...');
    const initialMondaySlots = computeWorkerSlotsForDate(testWorker, targetMondayDate);
    const initialTuesdaySlots = computeWorkerSlotsForDate(testWorker, targetTuesdayDate);

    console.log(`   - Target Monday (${targetMondayDate}) Slot 1 (10-11 AM) initial: isAvailable = ${initialMondaySlots[0].isAvailable}`);
    console.log(`   - Target Tuesday (${targetTuesdayDate}) Slot 1 (10-11 AM) initial: isAvailable = ${initialTuesdaySlots[0].isAvailable}`);

    if (!initialMondaySlots[0].isAvailable || !initialTuesdaySlots[0].isAvailable) {
      throw new Error('Initial baseline slots must be available on working days!');
    }
    console.log('✅ Baseline availability verified.');

    // 2. Disable 10:00 AM - 11:00 AM specifically for Target Monday (2026-09-07)
    console.log(`\n[2/6] Worker disables 10:00 AM - 11:00 AM (slot-1) for Monday, ${targetMondayDate}...`);
    const updatedOverrides = toggleSlotForDate(
      testWorker.dateOverrides,
      targetMondayDate,
      'slot-1',
      true // was available -> toggle to disabled (false)
    );

    testWorker.dateOverrides = updatedOverrides;
    console.log('   Updated dateOverrides:', testWorker.dateOverrides);

    // 3. Verify Monday 10-11 AM is disabled
    console.log(`\n[3/6] Verifying Target Monday (${targetMondayDate}) slots...`);
    const mondaySlots = computeWorkerSlotsForDate(testWorker, targetMondayDate);
    const monSlot1 = mondaySlots.find((s) => s.id === 'slot-1')!;
    const monSlot2 = mondaySlots.find((s) => s.id === 'slot-2')!;

    console.log(`   - Monday Slot 1 (10:00 AM - 11:00 AM): isAvailable = ${monSlot1.isAvailable} (Expected: false, isOverridden: ${monSlot1.isOverridden})`);
    console.log(`   - Monday Slot 2 (12:00 PM - 01:00 PM): isAvailable = ${monSlot2.isAvailable} (Expected: true, isOverridden: ${monSlot2.isOverridden})`);

    if (monSlot1.isAvailable !== false) {
      throw new Error(`Expected Monday slot-1 to be disabled, got: ${monSlot1.isAvailable}`);
    }
    if (monSlot2.isAvailable !== true) {
      throw new Error(`Expected Monday slot-2 to remain available, got: ${monSlot2.isAvailable}`);
    }
    console.log('✅ Monday slot-1 successfully disabled; Monday slot-2 remains available.');

    // 4. Verify Tuesday 10-11 AM and Next Monday 10-11 AM REMAIN AVAILABLE!
    console.log(`\n[4/6] Verifying other days (Tuesday ${targetTuesdayDate} & Next Monday ${nextMondayDate})...`);
    const tuesdaySlots = computeWorkerSlotsForDate(testWorker, targetTuesdayDate);
    const tueSlot1 = tuesdaySlots.find((s) => s.id === 'slot-1')!;

    const nextMonSlots = computeWorkerSlotsForDate(testWorker, nextMondayDate);
    const nextMonSlot1 = nextMonSlots.find((s) => s.id === 'slot-1')!;

    console.log(`   - Tuesday (${targetTuesdayDate}) Slot 1 (10:00 AM - 11:00 AM): isAvailable = ${tueSlot1.isAvailable} (Expected: true)`);
    console.log(`   - Next Monday (${nextMondayDate}) Slot 1 (10:00 AM - 11:00 AM): isAvailable = ${nextMonSlot1.isAvailable} (Expected: true)`);

    if (tueSlot1.isAvailable !== true) {
      throw new Error(`BUG PERSISTS: Tuesday slot-1 was affected and became false!`);
    }
    if (nextMonSlot1.isAvailable !== true) {
      throw new Error(`BUG PERSISTS: Next Monday slot-1 was affected and became false!`);
    }
    console.log('✅ BUG FIXED: Tuesday and future Mondays remain completely available!');

    // 5. Test re-enabling slot-1 for Monday
    console.log(`\n[5/6] Worker re-enables 10:00 AM - 11:00 AM for Monday, ${targetMondayDate}...`);
    testWorker.dateOverrides = toggleSlotForDate(
      testWorker.dateOverrides,
      targetMondayDate,
      'slot-1',
      false // was false -> toggle back to true
    );

    const reEnabledMonSlots = computeWorkerSlotsForDate(testWorker, targetMondayDate);
    const reEnabledSlot1 = reEnabledMonSlots.find((s) => s.id === 'slot-1')!;
    console.log(`   - Monday Slot 1 after re-enabling: isAvailable = ${reEnabledSlot1.isAvailable} (Expected: true)`);

    if (reEnabledSlot1.isAvailable !== true) {
      throw new Error('Slot failed to re-enable for that date!');
    }
    console.log('✅ Re-enabling slot works as expected.');

    // 6. Test Supabase Persistence of structured availability_slots
    console.log('\n[6/6] Testing Supabase persistence of dateOverrides...');
    const dbRow = mapWorkerToDbRow(testWorker);
    console.log('   Serialized availability_slots to persist:', JSON.stringify(dbRow.availability_slots));

    // Update real worker in Supabase
    const { error: updErr } = await supabase
      .from('workers')
      .update({
        availability_slots: {
          baseSlots: DEFAULT_BASE_SLOTS,
          dateOverrides: [
            { date: targetMondayDate, slotId: 'slot-1', isAvailable: false, updatedAt: new Date().toISOString() },
          ],
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        },
      })
      .eq('id', 'wkr-verify-1788164557684');

    if (updErr) {
      throw new Error(`Supabase update failed: ${updErr.message}`);
    }

    // Read back and map with mapDbRowToWorker
    const { data: fetchedWorkerRow, error: fetchErr } = await supabase
      .from('workers')
      .select('*')
      .eq('id', 'wkr-verify-1788164557684')
      .single();

    if (fetchErr || !fetchedWorkerRow) {
      throw new Error(`Failed to fetch worker: ${fetchErr?.message}`);
    }

    const fetchedWorker = mapDbRowToWorker(fetchedWorkerRow);
    console.log('   Fetched worker dateOverrides:', fetchedWorker.dateOverrides);

    const checkSlots = computeWorkerSlotsForDate(fetchedWorker, targetMondayDate);
    const checkSlot1 = checkSlots.find((s) => s.id === 'slot-1')!;
    console.log(`   Fetched worker Monday (${targetMondayDate}) Slot 1 availability: ${checkSlot1.isAvailable} (Expected: false)`);

    if (checkSlot1.isAvailable !== false) {
      throw new Error('Supabase persisted override was not correctly deserialized!');
    }
    console.log('✅ Supabase availability JSONB persistence verified!');

    console.log('\n================================================================');
    console.log(' 🎉 ALL DATE-SPECIFIC AVAILABILITY TESTS PASSED SUCCESSFULLY!  ');
    console.log('================================================================\n');
  } catch (err: any) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

testDateSpecificAvailability();

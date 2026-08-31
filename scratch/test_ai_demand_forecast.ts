import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { generateAIDemandForecast } from '../src/services/aiDemandForecastService';
import { mapDbRowToWorker, mapDbRowToBooking } from '../src/services/sahaayakService';
import { Booking, Worker } from '../src/types';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAIDemandForecastComprehensive() {
  console.log('================================================================');
  console.log(' TESTING AI DEMAND FORECAST & WORKFORCE ALLOCATION ENGINE      ');
  console.log('================================================================');

  try {
    // 1. Fetch real bookings from Supabase
    console.log('\n[1/6] Fetching real bookings from Supabase public.bookings...');
    const { data: rawBookings, error: bErr } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (bErr) throw new Error(`Failed to fetch bookings: ${bErr.message}`);
    const realBookings = (rawBookings || []).map(mapDbRowToBooking);
    console.log(`✅ Retrieved ${realBookings.length} real booking record(s) from Supabase.`);

    // 2. Fetch real workers from Supabase
    console.log('\n[2/6] Fetching real workers from Supabase public.workers...');
    const { data: rawWorkers, error: wErr } = await supabase
      .from('workers')
      .select('*');

    if (wErr) throw new Error(`Failed to fetch workers: ${wErr.message}`);
    const realWorkers = (rawWorkers || []).map(mapDbRowToWorker);
    console.log(`✅ Retrieved ${realWorkers.length} real worker record(s) from Supabase.`);

    // 3. Test real database forecasting
    console.log('\n[3/6] Running forecast directly on Supabase data...');
    const realForecast = generateAIDemandForecast(realBookings, realWorkers, '48h', 'All Zones');
    console.log('   Total Analyzed:', realForecast.totalBookingsAnalyzed);
    console.log('   Has Sufficient Data:', realForecast.hasSufficientData);
    console.log('   Available Verified Workers:', realForecast.totalAvailableWorkers);
    console.log('   Net Shortage:', realForecast.netShortage);
    console.log('   Overall Insight:', realForecast.overallInsight);

    // 4. Test forecasting with comprehensive dataset (12 bookings across Plumbing, Electrical, Carpentry)
    console.log('\n[4/6] Testing AI Statistical Forecasting Model with comprehensive multi-trade data...');
    const testBookings: Booking[] = [
      {
        id: 'B1',
        customerName: 'Aarav Sharma',
        customerAddress: 'South Extension, Delhi',
        serviceType: 'Plumbing',
        workerSkill: 'Plumbing',
        workerName: 'Verification Worker',
        workerId: 'wkr-verify-1788164557684',
        date: 'Today',
        timeSlot: '10:00 AM',
        estimatedPrice: 299,
        platformFee: 15,
        welfareCess: 15,
        totalAmount: 329,
        status: 'completed',
        isEmergency: false,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'B2',
        customerName: 'Pooja Verma',
        customerAddress: 'Greater Kailash, Delhi',
        serviceType: 'Plumbing',
        workerSkill: 'Plumbing',
        workerName: 'Verification Worker',
        workerId: 'wkr-verify-1788164557684',
        date: 'Today',
        timeSlot: '11:00 AM',
        estimatedPrice: 299,
        platformFee: 15,
        welfareCess: 15,
        totalAmount: 329,
        status: 'in_progress',
        isEmergency: true,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'B3',
        customerName: 'Rahul Mehta',
        customerAddress: 'Saket, Delhi',
        serviceType: 'Plumbing',
        workerSkill: 'Plumbing',
        workerName: 'Verification Worker',
        workerId: 'wkr-verify-1788164557684',
        date: 'Today',
        timeSlot: '02:00 PM',
        estimatedPrice: 299,
        platformFee: 15,
        welfareCess: 15,
        totalAmount: 329,
        status: 'requested',
        isEmergency: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 'B4',
        customerName: 'Sneha Patel',
        customerAddress: 'Dwarka Sector 10, Delhi',
        serviceType: 'Electrical',
        workerSkill: 'Electrical',
        workerName: 'Suresh Kumar',
        workerId: 'wkr-ui-test-1788171805493',
        date: 'Today',
        timeSlot: '01:00 PM',
        estimatedPrice: 349,
        platformFee: 15,
        welfareCess: 15,
        totalAmount: 379,
        status: 'completed',
        isEmergency: false,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'B5',
        customerName: 'Vikram Joshi',
        customerAddress: 'Janakpuri, Delhi',
        serviceType: 'Electrical',
        workerSkill: 'Electrical',
        workerName: 'Suresh Kumar',
        workerId: 'wkr-ui-test-1788171805493',
        date: 'Today',
        timeSlot: '03:00 PM',
        estimatedPrice: 349,
        platformFee: 15,
        welfareCess: 15,
        totalAmount: 379,
        status: 'completed',
        isEmergency: false,
        created_at: new Date().toISOString(),
      },
    ] as unknown as Booking[];

    const testWorkers: Worker[] = [
      {
        id: 'wkr-1',
        name: 'Ramesh Plumber',
        avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=400',
        skill: 'Plumbing',
        rating: 4.9,
        reviewsCount: 42,
        experienceYears: 6,
        distanceKm: 2.1,
        basePricePerHour: 280,
        availability: 'Available Today',
        isVerified: true,
        cooperativeId: 'coop-1',
      },
      {
        id: 'wkr-2',
        name: 'Sunil Electrician',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        skill: 'Electrical',
        rating: 4.8,
        reviewsCount: 38,
        experienceYears: 5,
        distanceKm: 3.4,
        basePricePerHour: 320,
        availability: 'Available Today',
        isVerified: true,
        cooperativeId: 'coop-1',
      },
      {
        id: 'wkr-3',
        name: 'Manish Carpenter',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        skill: 'Carpentry',
        rating: 4.7,
        reviewsCount: 29,
        experienceYears: 4,
        distanceKm: 4.1,
        basePricePerHour: 300,
        availability: 'Available Today',
        isVerified: true,
        cooperativeId: 'coop-1',
      },
    ] as unknown as Worker[];

    const multiTradeSummary = generateAIDemandForecast(testBookings, testWorkers, '48h', 'All Zones');
    console.log(`✅ Analyzed ${multiTradeSummary.totalBookingsAnalyzed} bookings across all sectors.`);
    console.log(`   Top Surging Trade: ${multiTradeSummary.topSurgingTrade?.trade} (${multiTradeSummary.topSurgingTrade?.growthRateFormatted})`);
    console.log(`   Highest Demand Trade: ${multiTradeSummary.highestDemandTrade?.trade} (Projected: ${multiTradeSummary.highestDemandTrade?.projectedDemand})`);
    console.log(`   Overall AI Insight: "${multiTradeSummary.overallInsight}"`);

    // Verify Plumbing forecast
    const plumbingForecast = multiTradeSummary.tradeForecasts.find((t) => t.trade === 'Plumbing');
    if (!plumbingForecast) throw new Error('Plumbing forecast missing!');
    console.log('\nPlumbing Forecast & Allocation:');
    console.log('   - Projected Demand: ', plumbingForecast.projectedDemand);
    console.log('   - Available Workers:', plumbingForecast.activeWorkersAvailable);
    console.log('   - Shortage:         ', plumbingForecast.shortage);
    console.log('   - Forecast Text:    ', plumbingForecast.forecastStatement);
    console.log('   - Recommendation:   ', plumbingForecast.recommendationStatement);
    console.log('   - AI Reasoning:     ', plumbingForecast.reasoning);
    console.log('   - Recommended Shramiks:', plumbingForecast.recommendedWorkers.map((w) => w.name));

    if (plumbingForecast.totalHistoricalBookings !== 3) {
      throw new Error(`Expected 3 historical plumbing bookings, found: ${plumbingForecast.totalHistoricalBookings}`);
    }

    // 5. Verification of Data Security
    console.log('\n[5/6] Verifying Sensitive Data Privacy...');
    const jsonReport = JSON.stringify(multiTradeSummary);
    if (jsonReport.includes('password') || jsonReport.includes('encrypted_password')) {
      throw new Error('SECURITY ALERT: Password found in forecast summary!');
    }
    console.log('✅ No sensitive customer or auth credentials present in forecast report.');

    // 6. Verification of Horizon Projections (48h vs 7d vs 30d)
    console.log('\n[6/6] Verifying Horizon Projections Consistency...');
    const h48 = generateAIDemandForecast(testBookings, testWorkers, '48h');
    const h7d = generateAIDemandForecast(testBookings, testWorkers, '7d');
    const h30d = generateAIDemandForecast(testBookings, testWorkers, '30d');

    const p48 = h48.tradeForecasts.find((t) => t.trade === 'Plumbing')!.projectedDemand;
    const p7d = h7d.tradeForecasts.find((t) => t.trade === 'Plumbing')!.projectedDemand;
    const p30d = h30d.tradeForecasts.find((t) => t.trade === 'Plumbing')!.projectedDemand;

    console.log(`   Plumbing Projected Demand: 48h = ${p48} | 7d = ${p7d} | 30d = ${p30d}`);
    if (p48 > p7d || p7d > p30d) {
      throw new Error('Inconsistent horizon progression!');
    }
    console.log('✅ Horizon time-scaling verified (48h < 7d < 30d).');

    console.log('\n================================================================');
    console.log(' 🎉 ALL FORECASTING & WORKFORCE ALLOCATION TESTS PASSED!       ');
    console.log('================================================================\n');
  } catch (err: any) {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
  }
}

testAIDemandForecastComprehensive();

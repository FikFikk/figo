import { toHijri, getJavanesePasaran } from './app/utils/calendar-converter.ts';
import { getHolidays } from './app/utils/calendar-data.ts';

function test() {
  console.log('--- Kalender Algorithm Test ---');

  // Test 1: 1 Januari 2024 (Known: Senin Pon)
  const d1 = new Date(2024, 0, 1);
  console.log(`2024-01-01: ${getJavanesePasaran(d1)} (Expected: Pon)`);

  // Test 2: Idul Fitri 2026 (Expected: ~20 Maret)
  const holidays2026 = getHolidays(2026);
  const idulFitri2026 = holidays2026.filter(h => h.name.includes('Idul Fitri'));
  console.log('Idul Fitri 2026:', idulFitri2026.map(h => h.date));

  // Test 3: Idul Fitri 2028 (Expected: ~27 Maret)
  const holidays2028 = getHolidays(2028);
  const idulFitri2028 = holidays2028.filter(h => h.name.includes('Idul Fitri'));
  console.log('Idul Fitri 2028:', idulFitri2028.map(h => h.date));
  
  if (idulFitri2028.length > 0) {
    const dIdul = new Date(idulFitri2028[0].date);
    const hj = toHijri(dIdul);
    console.log(`Hijri 2028-03-27: ${hj.day} ${hj.monthName} ${hj.year} H`);
  }

  // Test 4: 1900 boundary
  const d1900 = new Date(1900, 0, 1);
  console.log(`1900-01-01: ${getJavanesePasaran(d1900)}`);
}

test();

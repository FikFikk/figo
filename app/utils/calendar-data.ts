import { toHijri } from './calendar-converter';

export interface Holiday {
  date: string;
  name: string;
  type: 'national' | 'joint_leave';
}

/**
 * Format Date to Local YYYY-MM-DD
 * This prevents timezone off-by-one errors from toISOString()
 */
function formatToLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getHolidays(year: number): Holiday[] {
  let holidays: Holiday[] = [
    { date: `${year}-01-01`, name: 'Tahun Baru Masehi', type: 'national' },
    { date: `${year}-05-01`, name: 'Hari Buruh Internasional', type: 'national' },
    { date: `${year}-06-01`, name: 'Hari Lahir Pancasila', type: 'national' },
    { date: `${year}-08-17`, name: 'Hari Kemerdekaan RI', type: 'national' },
    { date: `${year}-12-25`, name: 'Hari Raya Natal', type: 'national' },
    { date: `${year}-12-26`, name: 'Cuti Bersama Natal', type: 'joint_leave' },
  ];

  // Specific 2026 Patterns (Based on User's Image Reference)
  if (year === 2026) {
    holidays = holidays.concat([
      { date: '2026-03-18', name: 'Cuti Hari Suci Nyepi Tahun Baru Saka 1948', type: 'joint_leave' },
      { date: '2026-03-19', name: 'Hari Suci Nyepi Tahun Baru Saka 1948', type: 'national' },
      { date: '2026-03-20', name: 'Cuti Hari Raya Idulfitri 1447 Hijriah', type: 'joint_leave' },
      { date: '2026-03-21', name: 'Hari Raya Idulfitri 1447 Hijriah', type: 'national' },
      { date: '2026-03-22', name: 'Hari Raya Idulfitri 1447 Hijriah', type: 'national' }, // Sunday but Holiday
      { date: '2026-03-23', name: 'Cuti Hari Raya Idulfitri 1447 Hijriah', type: 'joint_leave' },
      { date: '2026-03-24', name: 'Cuti Hari Raya Idulfitri 1447 Hijriah', type: 'joint_leave' },
    ]);
  } else {
    // Standard Algorithmic Hijri Holidays (Non-2026)
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const hj = toHijri(d);
      const dateStr = formatToLocalDate(d);

      // Idul Fitri
      if (hj.month === 10 && (hj.day === 1 || hj.day === 2)) {
        holidays.push({ date: dateStr, name: `Hari Raya Idul Fitri ${hj.year} H`, type: 'national' });
        
        // Simple joint leave logic for non-2026: 2 days before and 2 after
        if (hj.day === 1) {
           const before1 = new Date(d); before1.setDate(d.getDate() - 1);
           const before2 = new Date(d); before2.setDate(d.getDate() - 2);
           holidays.push({ date: formatToLocalDate(before1), name: 'Cuti Bersama Idul Fitri', type: 'joint_leave' });
           holidays.push({ date: formatToLocalDate(before2), name: 'Cuti Bersama Idul Fitri', type: 'joint_leave' });
        }
        if (hj.day === 2) {
           const after1 = new Date(d); after1.setDate(d.getDate() + 1);
           holidays.push({ date: formatToLocalDate(after1), name: 'Cuti Bersama Idul Fitri', type: 'joint_leave' });
        }
      }

      if (hj.month === 12 && hj.day === 10) {
        holidays.push({ date: dateStr, name: `Hari Raya Idul Adha ${hj.year} H`, type: 'national' });
      }
      if (hj.month === 1 && hj.day === 1) {
        holidays.push({ date: dateStr, name: `Tahun Baru Islam ${hj.year} H`, type: 'national' });
      }
      if (hj.month === 3 && hj.day === 12) {
        holidays.push({ date: dateStr, name: `Maulid Nabi Muhammad SAW`, type: 'national' });
      }
      if (hj.month === 7 && hj.day === 27) {
        holidays.push({ date: dateStr, name: `Isra Mikraj Nabi Muhammad SAW`, type: 'national' });
      }
    }
  }

  // --- Christian Holidays (Meeus/Jones/Butcher Algorithm) ---
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  const easterDate = new Date(year, month - 1, day);
  const goodFriday = new Date(easterDate);
  goodFriday.setDate(easterDate.getDate() - 2);
  const ascensionDay = new Date(easterDate);
  ascensionDay.setDate(easterDate.getDate() + 39);

  holidays.push({ date: formatToLocalDate(goodFriday), name: 'Wafat Isa Almasih', type: 'national' });
  holidays.push({ date: formatToLocalDate(ascensionDay), name: 'Kenaikan Isa Almasih', type: 'national' });
  
  // Dedup and sort
  const uniqueHolidays = Array.from(new Map(holidays.map(h => [h.date + h.name, h])).values());
  return uniqueHolidays.sort((a, b) => a.date.localeCompare(b.date));
}

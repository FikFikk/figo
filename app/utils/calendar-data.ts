import { toHijri } from './calendar-converter';

export interface Holiday {
  date: string;
  name: string;
  type: 'national' | 'joint_leave';
}

/**
 * Format Date ke YYYY-MM-DD lokal (tanpa timezone shift via toISOString)
 */
function formatToLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// =============================================================================
// DATA HISTORIS HARI LIBUR INDONESIA (2022–2026)
// Digunakan sebagai basis prediksi untuk tahun-tahun lain
// =============================================================================

/**
 * Data historis hari besar Islam (2022–2026).
 * Pola: mundur ~10-11 hari per tahun dari kalender Masehi.
 */
const ISLAMIC_HOLIDAYS_HISTORY: Record<number, {
  israMikraj: [number, number]; // [bulan 1-indexed, tanggal]
  idulFitri1: [number, number];
  idulFitri2: [number, number];
  idulAdha: [number, number];
  tahunBaruIslam: [number, number];
  maulidNabi: [number, number];
}> = {
  2022: {
    israMikraj: [2, 28],
    idulFitri1: [5, 2],
    idulFitri2: [5, 3],
    idulAdha: [7, 9],
    tahunBaruIslam: [7, 30],
    maulidNabi: [10, 8],
  },
  2023: {
    israMikraj: [2, 18],
    idulFitri1: [4, 22],
    idulFitri2: [4, 23],
    idulAdha: [6, 29],
    tahunBaruIslam: [7, 19],
    maulidNabi: [9, 28],
  },
  2024: {
    israMikraj: [2, 8],
    idulFitri1: [4, 10],
    idulFitri2: [4, 11],
    idulAdha: [6, 17],
    tahunBaruIslam: [7, 7],
    maulidNabi: [9, 16],
  },
  2025: {
    israMikraj: [1, 27],
    idulFitri1: [3, 31],
    idulFitri2: [4, 1],
    idulAdha: [6, 6],
    tahunBaruIslam: [6, 27],
    maulidNabi: [9, 5],
  },
  2026: {
    israMikraj: [1, 16],
    idulFitri1: [3, 21],
    idulFitri2: [3, 22],
    idulAdha: [5, 27],
    tahunBaruIslam: [6, 16],
    maulidNabi: [8, 25],
  },
};

/**
 * Data historis Waisak (2022–2026) — kalender lunar Buddhist
 */
const WAISAK_HISTORY: Record<number, [number, number]> = {
  2022: [5, 16],
  2023: [6, 4],
  2024: [5, 23],
  2025: [5, 12],
  2026: [5, 31],
};

/**
 * Data historis Imlek (2022–2026) — kalender lunar Tionghoa
 */
const IMLEK_HISTORY: Record<number, [number, number]> = {
  2022: [2, 1],
  2023: [1, 22],
  2024: [2, 10],
  2025: [1, 29],
  2026: [2, 17],
};

/**
 * Data historis Nyepi (2022–2026) — kalender Saka Hindu
 */
const NYEPI_HISTORY: Record<number, [number, number]> = {
  2022: [3, 3],
  2023: [3, 22],
  2024: [3, 11],
  2025: [3, 29],
  2026: [3, 19],
};

// =============================================================================
// PREDIKSI HARI BESAR ISLAM — Mundur ~11 hari/tahun dari data terakhir
// =============================================================================

/**
 * Prediksi tanggal hari besar Islam berdasarkan pola historis.
 * Mundur rata-rata 10-11 hari dari tahun sebelumnya (siklus lunar 354 hari).
 * Jika sudah ada data historis, gunakan data asli.
 */
function getIslamicHolidays(year: number) {
  // Gunakan data historis jika tersedia
  if (ISLAMIC_HOLIDAYS_HISTORY[year]) {
    return ISLAMIC_HOLIDAYS_HISTORY[year];
  }

  // Cari tahun terdekat yang ada datanya
  const knownYears = Object.keys(ISLAMIC_HOLIDAYS_HISTORY).map(Number).sort((a, b) => a - b);
  const lastKnown = knownYears[knownYears.length - 1];
  const firstKnown = knownYears[0];

  if (year > lastKnown) {
    // Prediksi maju dari tahun terakhir yang diketahui
    const diff = year - lastKnown;
    const base = ISLAMIC_HOLIDAYS_HISTORY[lastKnown]!;
    return predictIslamicFromBase(base, diff);
  } else if (year < firstKnown) {
    // Prediksi mundur dari tahun pertama yang diketahui
    const diff = firstKnown - year;
    const base = ISLAMIC_HOLIDAYS_HISTORY[firstKnown]!;
    return predictIslamicFromBase(base, -diff);
  }

  // Fallback: interpolasi dari tahun terdekat
  let closest = firstKnown;
  for (const y of knownYears) {
    if (Math.abs(y - year) < Math.abs(closest - year)) closest = y;
  }
  const diff = year - closest;
  return predictIslamicFromBase(ISLAMIC_HOLIDAYS_HISTORY[closest]!, diff);
}

/**
 * Geser semua tanggal Islam ~11 hari * jumlah tahun.
 * Positif = maju ke depan (tahun lebih besar → tanggal lebih awal).
 * Negatif = mundur ke belakang (tahun lebih kecil → tanggal lebih akhir).
 */
function predictIslamicFromBase(
  base: typeof ISLAMIC_HOLIDAYS_HISTORY[2026],
  yearsDiff: number
) {
  // Rata-rata selisih ~10.63 hari/tahun (365.25 - 354.37)
  const daysShift = Math.round(-10.63 * yearsDiff);

  function shiftDate(md: [number, number]): [number, number] {
    // Anchor ke tahun 2000 untuk perhitungan (tidak penting — hanya butuh month/day)
    const d = new Date(2000, md[0] - 1, md[1]);
    d.setDate(d.getDate() + daysShift);
    return [d.getMonth() + 1, d.getDate()];
  }

  return {
    israMikraj: shiftDate(base.israMikraj),
    idulFitri1: shiftDate(base.idulFitri1),
    idulFitri2: shiftDate(base.idulFitri2),
    idulAdha: shiftDate(base.idulAdha),
    tahunBaruIslam: shiftDate(base.tahunBaruIslam),
    maulidNabi: shiftDate(base.maulidNabi),
  };
}

// =============================================================================
// PREDIKSI WAISAK, IMLEK, NYEPI — Berdasarkan siklus lunar ~19 tahun (Metonis)
// =============================================================================

/**
 * Prediksi tanggal berdasarkan pola historis.
 * Menggunakan rata-rata pergeseran antar tahun dari data yang ada.
 * Untuk siklus lunar keagamaan, hasilnya estimasi — bukan perhitungan astronomis.
 */
function predictLunarDate(
  history: Record<number, [number, number]>,
  year: number
): [number, number] {
  // Jika ada data historis, gunakan langsung
  if (history[year]) return history[year];

  const knownYears = Object.keys(history).map(Number).sort((a, b) => a - b);
  const lastKnown = knownYears[knownYears.length - 1];
  const firstKnown = knownYears[0];

  // Hitung rata-rata day-of-year dari semua data historis
  const doys = knownYears.map(y => {
    const [m, d] = history[y]!;
    return new Date(y, m - 1, d).getTime() - new Date(y, 0, 1).getTime();
  });
  const avgDoy = doys.reduce((a, b) => a + b, 0) / doys.length;

  // Gunakan data terdekat + koreksi berbasis rata-rata siklus
  if (year > lastKnown) {
    // Hitung tren pergeseran per tahun dari data historis
    const shifts: number[] = [];
    for (let i = 1; i < knownYears.length; i++) {
      const y1 = knownYears[i - 1], y2 = knownYears[i];
      const yearGap = y2 - y1;
      const [m1, d1] = history[y1]!, [m2, d2] = history[y2]!;
      const doy1 = dayOfYear(y1, m1, d1);
      const doy2 = dayOfYear(y2, m2, d2);
      shifts.push((doy2 - doy1) / yearGap);
    }
    const avgShift = shifts.length > 0 ? shifts.reduce((a, b) => a + b, 0) / shifts.length : 0;

    const [baseM, baseD] = history[lastKnown]!;
    const baseDoy = dayOfYear(lastKnown, baseM, baseD);
    const predictedDoy = Math.round(baseDoy + avgShift * (year - lastKnown));

    return doyToMonthDay(year, predictedDoy);
  } else if (year < firstKnown) {
    const shifts: number[] = [];
    for (let i = 1; i < knownYears.length; i++) {
      const y1 = knownYears[i - 1], y2 = knownYears[i];
      const yearGap = y2 - y1;
      const [m1, d1] = history[y1]!, [m2, d2] = history[y2]!;
      const doy1 = dayOfYear(y1, m1, d1);
      const doy2 = dayOfYear(y2, m2, d2);
      shifts.push((doy2 - doy1) / yearGap);
    }
    const avgShift = shifts.length > 0 ? shifts.reduce((a, b) => a + b, 0) / shifts.length : 0;

    const [baseM, baseD] = history[firstKnown]!;
    const baseDoy = dayOfYear(firstKnown, baseM, baseD);
    const predictedDoy = Math.round(baseDoy + avgShift * (year - firstKnown));

    return doyToMonthDay(year, predictedDoy);
  }

  // Fallback: rata-rata day-of-year
  const result = new Date(year, 0, 1);
  result.setTime(result.getTime() + avgDoy);
  return [result.getMonth() + 1, result.getDate()];
}

/** Hitung day-of-year (1-indexed) */
function dayOfYear(year: number, month: number, day: number): number {
  const start = new Date(year, 0, 1);
  const target = new Date(year, month - 1, day);
  return Math.floor((target.getTime() - start.getTime()) / 86400000) + 1;
}

/** Konversi day-of-year ke [month, day] */
function doyToMonthDay(year: number, doy: number): [number, number] {
  // Clamp ke range valid
  const maxDoy = isLeapYear(year) ? 366 : 365;
  doy = Math.max(1, Math.min(doy, maxDoy));
  const d = new Date(year, 0, doy);
  return [d.getMonth() + 1, d.getDate()];
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// =============================================================================
// PASKAH — Algoritma Gaussian/Meeus (deterministic, 100% akurat)
// =============================================================================

/**
 * Hitung tanggal Paskah menggunakan algoritma Meeus/Jones/Butcher.
 * Return: Date object tanggal Paskah.
 */
function computeEaster(year: number): Date {
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
  return new Date(year, month - 1, day);
}

// =============================================================================
// CUTI BERSAMA IDUL FITRI — Logika otomatis
// =============================================================================

/**
 * Generate cuti bersama Idul Fitri: 1 hari sebelum H-1 + 2 hari sesudah H+2.
 * Pola konsisten berdasarkan SKB historis pemerintah.
 * Skip hari Minggu.
 */
function generateIdulFitriJointLeave(
  year: number,
  fitri1: [number, number],
  fitri2: [number, number]
): Holiday[] {
  const holidays: Holiday[] = [];
  const d1 = new Date(year, fitri1[0] - 1, fitri1[1]);
  const d2 = new Date(year, fitri2[0] - 1, fitri2[1]);

  // 1 hari sebelum H-1 Idul Fitri
  const before = new Date(d1);
  before.setDate(d1.getDate() - 1);
  if (before.getDay() === 0) before.setDate(before.getDate() - 1); // Skip Minggu
  holidays.push({
    date: formatToLocalDate(before),
    name: 'Cuti Bersama Idul Fitri',
    type: 'joint_leave',
  });

  // 2 hari setelah H+2 Idul Fitri
  let afterCount = 0;
  for (let offset = 1; offset <= 4 && afterCount < 2; offset++) {
    const after = new Date(d2);
    after.setDate(d2.getDate() + offset);
    if (after.getDay() !== 0) { // Skip Minggu
      holidays.push({
        date: formatToLocalDate(after),
        name: 'Cuti Bersama Idul Fitri',
        type: 'joint_leave',
      });
      afterCount++;
    }
  }

  return holidays;
}

// =============================================================================
// TAHUN BARU HIJRIAH — Hitung dari toHijri (fallback untuk Hijri year label)
// =============================================================================

/**
 * Dapatkan tahun Hijriah yang aktif di sekitar pertengahan tahun Masehi.
 * Digunakan untuk label "Idul Fitri XXXX H", dsb.
 */
function getHijriYearForMasehi(year: number): number {
  const midYear = new Date(year, 5, 15); // 15 Juni
  return toHijri(midYear).year;
}

// =============================================================================
// MAIN: getHolidays()
// =============================================================================

export function getHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [];
  const hijriYear = getHijriYearForMasehi(year);

  // ─── A. TANGGAL TETAP (100% pasti setiap tahun) ───
  holidays.push(
    { date: `${year}-01-01`, name: 'Tahun Baru Masehi', type: 'national' },
    { date: `${year}-05-01`, name: 'Hari Buruh Internasional', type: 'national' },
    { date: `${year}-06-01`, name: 'Hari Lahir Pancasila', type: 'national' },
    { date: `${year}-08-17`, name: 'Hari Kemerdekaan RI', type: 'national' },
    { date: `${year}-12-25`, name: 'Hari Raya Natal', type: 'national' },
    { date: `${year}-12-24`, name: 'Cuti Bersama Natal', type: 'joint_leave' },
  );

  // ─── B. HARI BESAR ISLAM (prediksi pola ~-11 hari/tahun) ───
  const islamic = getIslamicHolidays(year);

  const fmtMd = (md: [number, number]) =>
    `${year}-${String(md[0]).padStart(2, '0')}-${String(md[1]).padStart(2, '0')}`;

  holidays.push(
    { date: fmtMd(islamic.israMikraj), name: 'Isra Mikraj Nabi Muhammad SAW', type: 'national' },
    { date: fmtMd(islamic.idulFitri1), name: `Hari Raya Idul Fitri ${hijriYear} H`, type: 'national' },
    { date: fmtMd(islamic.idulFitri2), name: `Hari Raya Idul Fitri ${hijriYear} H`, type: 'national' },
    { date: fmtMd(islamic.idulAdha), name: `Hari Raya Idul Adha ${hijriYear} H`, type: 'national' },
    { date: fmtMd(islamic.tahunBaruIslam), name: `Tahun Baru Islam ${hijriYear + 1} H`, type: 'national' },
    { date: fmtMd(islamic.maulidNabi), name: 'Maulid Nabi Muhammad SAW', type: 'national' },
  );

  // Cuti bersama Idul Fitri
  holidays.push(...generateIdulFitriJointLeave(year, islamic.idulFitri1, islamic.idulFitri2));

  // ─── Cuti bersama Idul Adha (1 hari setelahnya, cukup konsisten) ───
  const adhaDate = new Date(year, islamic.idulAdha[0] - 1, islamic.idulAdha[1]);
  const adhaAfter = new Date(adhaDate);
  adhaAfter.setDate(adhaDate.getDate() + 1);
  if (adhaAfter.getDay() === 0) adhaAfter.setDate(adhaAfter.getDate() + 1); // Skip Minggu
  holidays.push({
    date: formatToLocalDate(adhaAfter),
    name: 'Cuti Bersama Idul Adha',
    type: 'joint_leave',
  });

  // ─── C. HARI KRISTEN (Paskah-based, deterministic) ───
  const easter = computeEaster(year);

  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);

  // Kenaikan Yesus selalu jatuh Kamis → Jumat = hari kejepit, selalu dapat cuti bersama
  const ascensionDay = new Date(easter);
  ascensionDay.setDate(easter.getDate() + 39);

  const ascensionJointLeave = new Date(ascensionDay);
  ascensionJointLeave.setDate(ascensionDay.getDate() + 1); // Jumat setelah Kamis Kenaikan

  holidays.push(
    { date: formatToLocalDate(goodFriday), name: 'Wafat Isa Almasih', type: 'national' },
    { date: formatToLocalDate(easter), name: 'Hari Paskah', type: 'national' },
    { date: formatToLocalDate(ascensionDay), name: 'Kenaikan Isa Almasih', type: 'national' },
    { date: formatToLocalDate(ascensionJointLeave), name: 'Cuti Bersama Kenaikan Isa Almasih', type: 'joint_leave' },
  );

  // ─── D. WAISAK (prediksi pola lunar Buddhist) ───
  const waisak = predictLunarDate(WAISAK_HISTORY, year);
  holidays.push({
    date: fmtMd(waisak),
    name: 'Hari Raya Waisak',
    type: 'national',
  });

  // ─── E. IMLEK (prediksi pola lunar Tionghoa) + cuti sebelumnya ───
  const imlek = predictLunarDate(IMLEK_HISTORY, year);
  const imlekDate = new Date(year, imlek[0] - 1, imlek[1]);
  const imlekCuti = new Date(imlekDate);
  imlekCuti.setDate(imlekDate.getDate() - 1);
  if (imlekCuti.getDay() === 0) imlekCuti.setDate(imlekCuti.getDate() - 1); // Skip Minggu
  holidays.push(
    { date: fmtMd(imlek), name: 'Tahun Baru Imlek', type: 'national' },
    { date: formatToLocalDate(imlekCuti), name: 'Cuti Bersama Imlek', type: 'joint_leave' },
  );

  // ─── F. NYEPI (prediksi pola kalender Saka) + cuti sebelumnya ───
  const nyepi = predictLunarDate(NYEPI_HISTORY, year);
  const nyepiDate = new Date(year, nyepi[0] - 1, nyepi[1]);
  const nyepiCuti = new Date(nyepiDate);
  nyepiCuti.setDate(nyepiDate.getDate() - 1);
  if (nyepiCuti.getDay() === 0) nyepiCuti.setDate(nyepiCuti.getDate() - 1); // Skip Minggu
  holidays.push(
    { date: fmtMd(nyepi), name: 'Hari Suci Nyepi', type: 'national' },
    { date: formatToLocalDate(nyepiCuti), name: 'Cuti Bersama Nyepi', type: 'joint_leave' },
  );

  // ─── Dedup dan sort berdasarkan tanggal ───
  const uniqueHolidays = Array.from(
    new Map(holidays.map(h => [h.date + h.name, h])).values()
  );
  return uniqueHolidays.sort((a, b) => a.date.localeCompare(b.date));
}

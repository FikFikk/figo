/**
 * Calendar Conversion Utilities
 * Handles Hijri (Islamic), Javanese (Pasaran), Neptu, and Wuku.
 */

const PASARAN = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'];

/**
 * Get Javanese Pasaran for a given date
 * 2024-01-01 (Senin Pon) is JD 2460311
 * 2460311 % 5 = 1 (Pon)
 * 0=Pahing, 1=Pon, 2=Wage, 3=Kliwon, 4=Legi
 */
export function formatToLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getJavanesePasaran(date: Date): string {
  const jd = Math.floor(date.getTime() / 86400000) + 2440588;
  const index = jd % 5;
  return PASARAN[index] || '';
}

/**
 * Calculate Neptu (Numerical value of Day + Pasaran)
 * Days: Sun(5), Mon(4), Tue(3), Wed(7), Thu(8), Fri(6), Sat(9)
 * Pasaran: Legi(5), Pahing(9), Pon(7), Wage(4), Kliwon(8)
 */
export function getNeptu(date: Date): number {
  const dayValues = [5, 4, 3, 7, 8, 6, 9]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
  const pasaranValues: Record<string, number> = {
    'Legi': 5, 'Pahing': 9, 'Pon': 7, 'Wage': 4, 'Kliwon': 8
  };
  
  const dayValue = dayValues[date.getDay()] as number;
  const pasaran = getJavanesePasaran(date);
  const pasaranValue = pasaranValues[pasaran] || 0;
  
  return dayValue + pasaranValue;
}

/**
 * Calculate Wuku (30-week cycle)
 * Anchor: 2023-12-31 was Sunday, Wuku Langkir (index 12)
 * One 210-day cycle starts with Wuku Sinta (index 0)
 * 2023-10-08 was Sunday, Wuku Sinta (JD 2460226)
 */
const WUKU_NAMES = [
  'Sinta', 'Landep', 'Ukir', 'Kurantil', 'Tolu', 'Gumbreg', 'Wariga', 'Warigagung',
  'Julungwangi', 'Sungsang', 'Galungan', 'Kuningan', 'Langkir', 'Medangsia', 'Pujut',
  'Pahang', 'Kuruwelut', 'Marakeh', 'Tambir', 'Medangkungan', 'Maktal', 'Wuye',
  'Manahil', 'Prangbakat', 'Bala', 'Wugu', 'Wayang', 'Kulawu', 'Dukut', 'Watugunung'
];

export function getWuku(date: Date): string {
  const anchorJD = 2459877; // Sunday, Wuku Sinta (Calibrated for 2026 accuracy)
  const currentJD = Math.floor(date.getTime() / 86400000) + 2440588;
  const diff = currentJD - anchorJD;
  
  // Modulo 210 for cycle, then divide by 7 for wuku index
  // Ensure positive modulo
  let cycleDiff = diff % 210;
  if (cycleDiff < 0) cycleDiff += 210;
  
  const wukuIndex = Math.floor(cycleDiff / 7);
  return WUKU_NAMES[wukuIndex];
}

// --- Hijri (Islamic) Tabular Calendar ---
const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabiul Awwal', 'Rabiul Akhir', 'Jumadil Awwal', 'Jumadil Akhir',
  'Rajab', 'Sya\'ban', 'Ramadhan', 'Syawal', 'Dzulkaidah', 'Dzulhijjah'
];

export function toHijri(date: Date) {
  let jd = Math.floor(date.getTime() / 86400000) + 2440587.5 + 1;
  
  let l = Math.floor(jd) - 1948440 + 10632;
  let n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  
  let j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719)) + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238));
  l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  
  let m = Math.floor((24 * l) / 709);
  let d = l - Math.floor((709 * m) / 24);
  let y = 30 * n + j - 30;
  
  return {
    day: d,
    month: m,
    monthName: HIJRI_MONTHS[m - 1] || 'Unknown',
    year: y
  };
}

export function getFullDateInfo(date: Date) {
  const hijri = toHijri(date);
  const pasaran = getJavanesePasaran(date);
  const neptu = getNeptu(date);
  const wuku = getWuku(date);
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  
  return {
    masehi: `${dayNames[date.getDay()]}, ${date.getDate()} ${new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(date)} ${date.getFullYear()}`,
    hijri: `${hijri.day} ${hijri.monthName} ${hijri.year} H`,
    jawa: `${dayNames[date.getDay()]} ${pasaran}`,
    pasaran,
    neptu,
    wuku
  };
}

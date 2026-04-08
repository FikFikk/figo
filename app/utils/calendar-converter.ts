/**
 * Calendar Conversion Utilities
 * Timezone-safe: semua kalkulasi JD menggunakan Date.UTC
 * Mencakup: Hijri, Pasaran, Neptu, Wuku, Tanggal Jawa, Pancasuda
 */

// =============================================================================
// HELPER: Julian Day Number (timezone-safe)
// =============================================================================

/** Hitung JD dari Date object, timezone-safe via Date.UTC */
function toJD(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000) + 2440588
}

/** Format tanggal ke YYYY-MM-DD tanpa timezone offset */
export function formatToLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// =============================================================================
// PASARAN (Siklus 5 hari Jawa)
// =============================================================================

const PASARAN = ['Legi', 'Pahing', 'Pon', 'Wage', 'Kliwon'] as const

/**
 * Pasaran berdasarkan JD modulo 5
 * Anchor: 1 Jan 2024 (JD 2460311) = Pahing (index 1)
 * 2460311 % 5 = 1 → index 1 = Pahing ✓
 */
export function getJavanesePasaran(date: Date): string {
  const jd = toJD(date)
  const index = Math.floor(((jd % 5) + 5) % 5)
  return PASARAN[index] ?? 'Legi'
}

// =============================================================================
// NEPTU (Nilai numerik Hari + Pasaran)
// =============================================================================

const DAY_NEPTU = [5, 4, 3, 7, 8, 6, 9] as const // Ming, Sen, Sel, Rab, Kam, Jum, Sab
const PASARAN_NEPTU: Record<string, number> = {
  'Legi': 5, 'Pahing': 9, 'Pon': 7, 'Wage': 4, 'Kliwon': 8
}

export function getNeptu(date: Date): number {
  const dayValue = DAY_NEPTU[date.getDay()] ?? 5
  const pasaran = getJavanesePasaran(date)
  return dayValue + (PASARAN_NEPTU[pasaran] ?? 0)
}

// =============================================================================
// WUKU (Siklus 30 minggu = 210 hari)
// =============================================================================

const WUKU_NAMES = [
  'Sinta', 'Landep', 'Ukir', 'Kurantil', 'Tolu', 'Gumbreg', 'Wariga', 'Warigagung',
  'Julungwangi', 'Sungsang', 'Galungan', 'Kuningan', 'Langkir', 'Medangsia', 'Pujut',
  'Pahang', 'Kuruwelut', 'Marakeh', 'Tambir', 'Medangkungan', 'Maktal', 'Wuye',
  'Manahil', 'Prangbakat', 'Bala', 'Wugu', 'Wayang', 'Kulawu', 'Dukut', 'Watugunung'
] as const

/**
 * Anchor terverifikasi:
 * - 1 Jan 2024 (JD 2460311) → Ukir (index 2) ✓
 * - 30 Nov 2026 (JD 2461375) → Tolu (index 4) ✓
 * - 31 Dec 2026 (JD 2461406) → Julungwangi (index 8) ✓
 * 
 * Formula: anchorJD = titik awal siklus Sinta
 * (JD - anchorJD) % 210 → posisi dalam siklus, /7 → index wuku
 * Anchor: 2461347 (dihitung mundur dari verifikasi 3 tanggal)
 */
const WUKU_ANCHOR_JD = 2461347

export function getWuku(date: Date): string {
  const jd = toJD(date)
  let diff = (jd - WUKU_ANCHOR_JD) % 210
  if (diff < 0) diff += 210
  return WUKU_NAMES[Math.floor(diff / 7)]
}

// =============================================================================
// HIJRI (Kalender Islam Tabular)
// =============================================================================

const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabiul Awwal', 'Rabiul Akhir',
  'Jumadil Awwal', 'Jumadil Akhir', 'Rajab', 'Sya\'ban',
  'Ramadhan', 'Syawal', 'Dzulkaidah', 'Dzulhijjah'
] as const

const HIJRI_MONTHS_SHORT = [
  'Muh.', 'Saf.', 'R.Awwal', 'R.Akhir',
  'J.Awwal', 'J.Akhir', 'Raj.', 'Sya.',
  'Ram.', 'Syaw.', 'Dzulq.', 'Dzulh.'
] as const

export function toHijri(date: Date) {
  const jd = toJD(date)

  let l = Math.floor(jd) - 1948440 + 10632
  const n = Math.floor((l - 1) / 10631)
  l = l - 10631 * n + 354

  const j = (Math.floor((10985 - l) / 5316)) * (Math.floor((50 * l) / 17719))
    + (Math.floor(l / 5670)) * (Math.floor((43 * l) / 15238))
  l = l - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50))
    - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29

  const m = Math.floor((24 * l) / 709)
  const d = l - Math.floor((709 * m) / 24)
  const y = 30 * n + j - 30

  return {
    day: d,
    month: m,
    monthName: HIJRI_MONTHS[m - 1] || 'Unknown',
    monthNameShort: HIJRI_MONTHS_SHORT[m - 1] || 'Unk.',
    year: y
  }
}

// =============================================================================
// TANGGAL JAWA (Penanggalan Sultan Agung)
// =============================================================================

const BULAN_JAWA = [
  'Sura', 'Sapar', 'Mulud', 'Bakda Mulud',
  'Jumadilawal', 'Jumadilakir', 'Rejeb', 'Ruwah',
  'Pasa', 'Sawal', 'Sela', 'Besar'
] as const

/** 8 tahun per Windu */
const TAHUN_JAWA = ['Alip', 'Ehe', 'Jimawal', 'Je', 'Dal', 'Be', 'Wawu', 'Jimakir'] as const

/** Windu bergantian setiap siklus 8 tahun (urutan terverifikasi: 1957/1959 = Sancaya) */
const WINDU_NAMES = ['Adi', 'Kuntara', 'Sancaya', 'Sengara'] as const

/** Tahun kabisat (wuntu): Ehe(1), Je(3), Jimakir(7) — 355 hari, sisanya 354 */
function isJavaneseLeap(yearInWindu: number): boolean {
  return yearInWindu === 1 || yearInWindu === 3 || yearInWindu === 7
}

/** Jumlah hari dalam setahun Jawa */
function javaneseYearDays(yearInWindu: number): number {
  return isJavaneseLeap(yearInWindu) ? 355 : 354
}

/**
 * Jumlah hari per bulan Jawa:
 * Bulan ganjil (1,3,5,7,9,11) = 30 hari
 * Bulan genap (2,4,6,8,10) = 29 hari
 * Bulan 12 (Besar) = 29 hari (basit) atau 30 hari (kabisat/wuntu)
 */
function javaneseMonthDays(monthIndex: number, isLeap: boolean): number {
  if (monthIndex === 11) return isLeap ? 30 : 29
  return monthIndex % 2 === 0 ? 30 : 29
}

/**
 * Epoch: 1 Sura 1555 AJ = 8 Juli 1633 CE
 * JD epoch terverifikasi:
 *   1 Apr 2026 (JD 2461132) = 13 Sawal 1959 ✓
 *   1 Jan 2024 (JD 2460311) = 19 Jumadilakir 1957 ✓
 * Satu Windu = 8 tahun = 2835 hari (3 kabisat × 355 + 5 basit × 354)
 */
const JAWA_EPOCH_JD = 2317686
const JAWA_EPOCH_YEAR = 1555
const DAYS_PER_WINDU = 2835

export function toJavanese(date: Date) {
  const jd = toJD(date)
  let totalDays = jd - JAWA_EPOCH_JD

  if (totalDays < 0) {
    // Sebelum epoch — return estimasi sederhana
    return { day: 1, month: 0, monthName: 'Sura', year: 0, tahunName: '-', winduName: '-' }
  }

  // Hitung jumlah windu penuh
  const fullWindu = Math.floor(totalDays / DAYS_PER_WINDU)
  let remainDays = totalDays - (fullWindu * DAYS_PER_WINDU)

  // Tahun Jawa = epoch + (windu * 8) + tahun dalam windu
  let yearInWindu = 0
  for (let i = 0; i < 8; i++) {
    const yDays = javaneseYearDays(i)
    if (remainDays < yDays) {
      yearInWindu = i
      break
    }
    remainDays -= yDays
    if (i === 7) yearInWindu = 7
  }

  const javaYear = JAWA_EPOCH_YEAR + (fullWindu * 8) + yearInWindu
  const isLeap = isJavaneseLeap(yearInWindu)

  // Hitung bulan dan tanggal
  let monthIndex = 0
  for (let i = 0; i < 12; i++) {
    const mDays = javaneseMonthDays(i, isLeap)
    if (remainDays < mDays) {
      monthIndex = i
      break
    }
    remainDays -= mDays
    if (i === 11) monthIndex = 11
  }

  const dayOfMonth = Math.floor(remainDays) + 1

  // Windu global (dari epoch)
  const globalWinduIndex = fullWindu % 4
  const winduName = WINDU_NAMES[globalWinduIndex]

  return {
    day: dayOfMonth,
    month: monthIndex,
    monthName: BULAN_JAWA[monthIndex],
    year: javaYear,
    tahunName: TAHUN_JAWA[yearInWindu],
    winduName
  }
}

// =============================================================================
// PANCASUDA (Cermin / Mirrored berdasar total Neptu 7-18)
// =============================================================================

interface PancasudaResult {
  name: string
  description: string
}

/**
 * Pancasuda berdasarkan nilai neptu total yang dilipat (mirrored) di angka 13.
 * 7 & 18 = Wasesa Segara
 * 8 & 17 = Tunggak Semi
 * 9 & 16 = Satria Wibawa
 * 10 & 15 = Sumur Sinaba
 * 11 & 14 = Satria Wirang
 * 12 & 13 = Bumi Kapetak
 */
const PANCASUDA_TABLE: Record<number, PancasudaResult> = {
  7: { name: 'Wasesa Segara', description: 'Memiliki wibawa, pemaaf, berbudi luhur, dan rezeki seluas lautan.' },
  8: { name: 'Tunggak Semi', description: 'Rezeki selalu tumbuh kembali, selalu ada jalan meski sulit.' },
  9: { name: 'Satria Wibawa', description: 'Dihormati, disegani, memiliki kemuliaan dan derajat tinggi.' },
  10: { name: 'Sumur Sinaba', description: 'Tempat bertanya, bijaksana, sumber ilmu bagi orang lain.' },
  11: { name: 'Satria Wirang', description: 'Sering mengalami kesulitan atau rintangan hidup.' },
  12: { name: 'Bumi Kapetak', description: 'Pekerja keras, tahan banting, meski sering menemui masalah.' },
}

export function getPancasuda(date: Date): PancasudaResult {
  let neptu = getNeptu(date)
  
  // Fold/Mirror the neptu if it's > 12.
  if (neptu > 12) {
    neptu = 25 - neptu
  }

  return PANCASUDA_TABLE[neptu] || PANCASUDA_TABLE[7]!
}

// =============================================================================
// WEWARAN (Siklus Hari - Continuous)
// =============================================================================

export function getWewaran(date: Date) {
  const jd = toJD(date)
  let diff = (jd - WUKU_ANCHOR_JD) % 210
  if (diff < 0) diff += 210

  // Standard Balinese/Javanese Julian Date Moduli
  const TRIWARA = ['Pasah', 'Beteng', 'Kajeng']
  const CATURWARA = ['Sri', 'Laba', 'Jaya', 'Menala']
  const SADWARA = ['Tungleh', 'Aryang', 'Urukung', 'Paniron', 'Was', 'Maulu']
  const SANGAWARA = ['Dangu', 'Jagur', 'Gigis', 'Nohan', 'Ogan', 'Erangan', 'Urungan', 'Tulus', 'Dadi']

  return {
    triwara: TRIWARA[diff % 3]!,
    caturwara: CATURWARA[diff % 4]!,
    sadwara: SADWARA[diff % 6]!,
    sangawara: SANGAWARA[diff % 9]!
  }
}

// =============================================================================
// FULL DATE INFO (gabungan semua sistem)
// =============================================================================

const HARI_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as const

/** Tipe return getFullDateInfo — didefinisikan eksplisit untuk cache Map */
export interface DateInfo {
  masehi: string
  hijri: string
  hijriShort: string
  jawa: string
  pasaran: string
  neptu: number
  wuku: string
  tanggalJawa: string
  tahunJawa: string | undefined
  winduJawa: string | undefined
  bulanJawa: string | undefined
  tahunAngkaJawa: number
  pancasuda: PancasudaResult
  wewaran: ReturnType<typeof getWewaran>
}

/** Cache per tanggal — hindari kalkulasi ulang Hijri/Jawa/Wuku setiap render */
const _dateInfoCache = new Map<string, DateInfo>()

/** Format bulan Indonesia — cache Intl formatter untuk performa */
const _monthFormatter = new Intl.DateTimeFormat('id-ID', { month: 'long' })

export function getFullDateInfo(date: Date): DateInfo {
  const key = formatToLocalDate(date)
  const cached = _dateInfoCache.get(key)
  if (cached) return cached

  const hijri = toHijri(date)
  const pasaran = getJavanesePasaran(date)
  const neptu = getNeptu(date)
  const wuku = getWuku(date)
  const jawa = toJavanese(date)
  const pancasuda = getPancasuda(date)
  const hari = HARI_NAMES[date.getDay()]

  const result = {
    // Masehi
    masehi: `${hari}, ${date.getDate()} ${_monthFormatter.format(date)} ${date.getFullYear()}`,

    // Hijriah
    hijri: `${hijri.day} ${hijri.monthName} ${hijri.year} H`,
    hijriShort: `${hijri.day} ${hijri.monthNameShort}`,

    // Jawa (hari + pasaran)
    jawa: `${hari} ${pasaran}`,
    pasaran,
    neptu,
    wuku,

    // Tanggal Jawa lengkap
    tanggalJawa: `${jawa.day} ${jawa.monthName} ${jawa.year}`,
    tahunJawa: jawa.tahunName,
    winduJawa: jawa.winduName,
    bulanJawa: jawa.monthName,
    tahunAngkaJawa: jawa.year,

    // Pancasuda
    pancasuda,

    // Wewaran
    wewaran: getWewaran(date)
  }

  _dateInfoCache.set(key, result)
  return result
}

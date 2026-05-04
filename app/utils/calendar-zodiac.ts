/**
 * Zodiak & Shio Utilities
 * Perhitungan zodiak barat (tropical) dan shio (zodiak Tionghoa)
 * Dipisahkan agar mudah di-extend untuk gambar/ikon di kemudian hari
 */

// =============================================================================
// ZODIAK BARAT (Tropical Zodiac — 12 tanda standar)
// =============================================================================

export interface ZodiacInfo {
  name: string       // Nama internasional
  nameId: string     // Nama Indonesia
  symbol: string     // Unicode simbol zodiak
  emoji: string      // Emoji representatif
  element: string    // Elemen (Api, Tanah, Udara, Air)
  elementEmoji: string
  dateRange: string  // Rentang tanggal
  traits: string     // Sifat singkat
}

const ZODIAC_DATA: ZodiacInfo[] = [
  // 0 — Capricorn (22 Des – 19 Jan)
  { name: 'Capricorn', nameId: 'Kaprikornus', symbol: '♑', emoji: '🐐', element: 'Tanah', elementEmoji: '🌍', dateRange: '22 Des – 19 Jan', traits: 'Ambisius, disiplin, bertanggung jawab' },
  // 1 — Aquarius (20 Jan – 18 Feb)
  { name: 'Aquarius', nameId: 'Akuarius', symbol: '♒', emoji: '🏺', element: 'Udara', elementEmoji: '💨', dateRange: '20 Jan – 18 Feb', traits: 'Inovatif, independen, humanis' },
  // 2 — Pisces (19 Feb – 20 Mar)
  { name: 'Pisces', nameId: 'Pisces', symbol: '♓', emoji: '🐟', element: 'Air', elementEmoji: '💧', dateRange: '19 Feb – 20 Mar', traits: 'Intuitif, empatik, kreatif' },
  // 3 — Aries (21 Mar – 19 Apr)
  { name: 'Aries', nameId: 'Aries', symbol: '♈', emoji: '🐏', element: 'Api', elementEmoji: '🔥', dateRange: '21 Mar – 19 Apr', traits: 'Berani, energik, percaya diri' },
  // 4 — Taurus (20 Apr – 20 Mei)
  { name: 'Taurus', nameId: 'Taurus', symbol: '♉', emoji: '🐂', element: 'Tanah', elementEmoji: '🌍', dateRange: '20 Apr – 20 Mei', traits: 'Setia, sabar, praktis' },
  // 5 — Gemini (21 Mei – 21 Jun)
  { name: 'Gemini', nameId: 'Gemini', symbol: '♊', emoji: '👯', element: 'Udara', elementEmoji: '💨', dateRange: '21 Mei – 21 Jun', traits: 'Adaptif, komunikatif, cerdas' },
  // 6 — Cancer (22 Jun – 22 Jul)
  { name: 'Cancer', nameId: 'Kanser', symbol: '♋', emoji: '🦀', element: 'Air', elementEmoji: '💧', dateRange: '22 Jun – 22 Jul', traits: 'Perhatian, protektif, intuitif' },
  // 7 — Leo (23 Jul – 22 Agu)
  { name: 'Leo', nameId: 'Leo', symbol: '♌', emoji: '🦁', element: 'Api', elementEmoji: '🔥', dateRange: '23 Jul – 22 Agu', traits: 'Karismatik, percaya diri, dermawan' },
  // 8 — Virgo (23 Agu – 22 Sep)
  { name: 'Virgo', nameId: 'Virgo', symbol: '♍', emoji: '👩', element: 'Tanah', elementEmoji: '🌍', dateRange: '23 Agu – 22 Sep', traits: 'Analitis, teliti, penolong' },
  // 9 — Libra (23 Sep – 23 Okt)
  { name: 'Libra', nameId: 'Libra', symbol: '♎', emoji: '⚖️', element: 'Udara', elementEmoji: '💨', dateRange: '23 Sep – 23 Okt', traits: 'Seimbang, harmonis, diplomatik' },
  // 10 — Scorpio (24 Okt – 21 Nov)
  { name: 'Scorpio', nameId: 'Skorpio', symbol: '♏', emoji: '🦂', element: 'Air', elementEmoji: '💧', dateRange: '24 Okt – 21 Nov', traits: 'Intens, penuh semangat, pemberani' },
  // 11 — Sagittarius (22 Nov – 21 Des)
  { name: 'Sagittarius', nameId: 'Sagitarius', symbol: '♐', emoji: '🏹', element: 'Api', elementEmoji: '🔥', dateRange: '22 Nov – 21 Des', traits: 'Optimis, petualang, filosofis' },
]

/**
 * Tentukan zodiak barat berdasarkan tanggal (bulan + hari).
 * Menggunakan tropical zodiac standar yang paling umum digunakan.
 */
export function getZodiac(date: Date): ZodiacInfo {
  const md = (date.getMonth() + 1) * 100 + date.getDate()

  if (md >= 1222 || md <= 119) return ZODIAC_DATA[0]!   // Capricorn
  if (md <= 218) return ZODIAC_DATA[1]!                  // Aquarius
  if (md <= 320) return ZODIAC_DATA[2]!                  // Pisces
  if (md <= 419) return ZODIAC_DATA[3]!                  // Aries
  if (md <= 520) return ZODIAC_DATA[4]!                  // Taurus
  if (md <= 621) return ZODIAC_DATA[5]!                  // Gemini
  if (md <= 722) return ZODIAC_DATA[6]!                  // Cancer
  if (md <= 822) return ZODIAC_DATA[7]!                  // Leo
  if (md <= 922) return ZODIAC_DATA[8]!                  // Virgo
  if (md <= 1023) return ZODIAC_DATA[9]!                 // Libra
  if (md <= 1121) return ZODIAC_DATA[10]!                // Scorpio
  return ZODIAC_DATA[11]!                                // Sagittarius
}

// =============================================================================
// SHIO — Zodiak Tionghoa (Chinese Zodiac)
// =============================================================================

export interface ShioInfo {
  name: string       // Nama hewan (English)
  nameId: string     // Nama hewan (Indonesia)
  emoji: string      // Emoji hewan
  element: string    // Elemen Wu Xing
  elementEmoji: string
  yinYang: string    // Yin atau Yang
  traits: string     // Sifat singkat
}

/** 12 hewan shio berurutan — index 0 = Tikus (Rat) */
const SHIO_ANIMALS: Omit<ShioInfo, 'element' | 'elementEmoji' | 'yinYang'>[] = [
  { name: 'Rat', nameId: 'Tikus', emoji: '🐀', traits: 'Cerdas, cekatan, mudah bergaul' },
  { name: 'Ox', nameId: 'Kerbau', emoji: '🐂', traits: 'Rajin, dapat diandalkan, teguh' },
  { name: 'Tiger', nameId: 'Macan', emoji: '🐅', traits: 'Berani, kompetitif, percaya diri' },
  { name: 'Rabbit', nameId: 'Kelinci', emoji: '🐇', traits: 'Lembut, elegan, penuh kasih' },
  { name: 'Dragon', nameId: 'Naga', emoji: '🐉', traits: 'Karismatik, kuat, beruntung' },
  { name: 'Snake', nameId: 'Ular', emoji: '🐍', traits: 'Bijaksana, misterius, intuitif' },
  { name: 'Horse', nameId: 'Kuda', emoji: '🐎', traits: 'Energik, aktif, antusias' },
  { name: 'Goat', nameId: 'Kambing', emoji: '🐐', traits: 'Kreatif, lembut, simpatik' },
  { name: 'Monkey', nameId: 'Monyet', emoji: '🐒', traits: 'Cerdik, suka bermain, fleksibel' },
  { name: 'Rooster', nameId: 'Ayam', emoji: '🐓', traits: 'Jujur, pekerja keras, percaya diri' },
  { name: 'Dog', nameId: 'Anjing', emoji: '🐕', traits: 'Setia, jujur, bertanggung jawab' },
  { name: 'Pig', nameId: 'Babi', emoji: '🐖', traits: 'Dermawan, penyabar, optimis' },
]

/**
 * Tanggal Imlek (bulan*100 + hari) per tahun 1900–2050.
 * Digunakan untuk menentukan batas tahun shio yang akurat.
 * Sumber: Data astronomi kalender lunar Tionghoa.
 */
const CNY_DATES: Record<number, number> = {
  1900:131,1901:219,1902:208,1903:129,1904:216,1905:204,1906:125,1907:213,1908:202,1909:122,
  1910:210,1911:130,1912:218,1913:206,1914:126,1915:214,1916:203,1917:123,1918:211,1919:201,
  1920:220,1921:208,1922:128,1923:216,1924:205,1925:124,1926:213,1927:202,1928:123,1929:210,
  1930:130,1931:217,1932:206,1933:126,1934:214,1935:204,1936:124,1937:211,1938:131,1939:219,
  1940:208,1941:127,1942:215,1943:205,1944:125,1945:213,1946:202,1947:122,1948:210,1949:129,
  1950:217,1951:206,1952:127,1953:214,1954:203,1955:124,1956:212,1957:131,1958:218,1959:208,
  1960:128,1961:215,1962:205,1963:125,1964:213,1965:202,1966:121,1967:209,1968:130,1969:217,
  1970:206,1971:127,1972:215,1973:203,1974:123,1975:211,1976:131,1977:218,1978:207,1979:128,
  1980:216,1981:205,1982:125,1983:213,1984:202,1985:220,1986:209,1987:129,1988:217,1989:206,
  1990:127,1991:215,1992:204,1993:123,1994:210,1995:131,1996:219,1997:207,1998:128,1999:216,
  2000:205,2001:124,2002:212,2003:201,2004:122,2005:209,2006:129,2007:218,2008:207,2009:126,
  2010:214,2011:203,2012:123,2013:210,2014:131,2015:219,2016:208,2017:128,2018:216,2019:205,
  2020:125,2021:212,2022:201,2023:122,2024:210,2025:129,2026:217,2027:206,2028:126,2029:213,
  2030:203,2031:123,2032:211,2033:131,2034:219,2035:208,2036:128,2037:215,2038:204,2039:124,
  2040:212,2041:201,2042:122,2043:210,2044:130,2045:217,2046:206,2047:126,2048:214,2049:202,
  2050:123,
}

/** Elemen Wu Xing berdasarkan digit terakhir tahun */
function getWuXingElement(year: number): { element: string; elementEmoji: string } {
  const lastDigit = Math.abs(year) % 10
  if (lastDigit === 0 || lastDigit === 1) return { element: 'Logam', elementEmoji: '🪙' }
  if (lastDigit === 2 || lastDigit === 3) return { element: 'Air', elementEmoji: '💧' }
  if (lastDigit === 4 || lastDigit === 5) return { element: 'Kayu', elementEmoji: '🌳' }
  if (lastDigit === 6 || lastDigit === 7) return { element: 'Api', elementEmoji: '🔥' }
  return { element: 'Tanah', elementEmoji: '🌍' } // 8, 9
}

/**
 * Tentukan tahun shio yang akurat dengan mempertimbangkan
 * batas Imlek (Chinese New Year). Jika tanggal sebelum Imlek
 * tahun tersebut, maka termasuk tahun shio sebelumnya.
 */
function getShioYear(date: Date): number {
  const year = date.getFullYear()
  const cnyEncoded = CNY_DATES[year]

  // Jika tidak ada data CNY, gunakan tahun apa adanya
  if (!cnyEncoded) return year

  const cnyMonth = Math.floor(cnyEncoded / 100)
  const cnyDay = cnyEncoded % 100
  const month = date.getMonth() + 1
  const day = date.getDate()

  // Sebelum Imlek → masih tahun shio sebelumnya
  if (month < cnyMonth || (month === cnyMonth && day < cnyDay)) {
    return year - 1
  }

  return year
}

/**
 * Tentukan shio berdasarkan tanggal, dengan batas Imlek yang akurat.
 * Formula: tahun % 12 — remainder 4 = Tikus, 5 = Kerbau, dst.
 */
export function getShio(date: Date): ShioInfo {
  const shioYear = getShioYear(date)
  const remainder = ((shioYear % 12) + 12) % 12

  // Mapping remainder ke index SHIO_ANIMALS: 4→0(Tikus), 5→1(Kerbau), ...
  const animalIndex = (remainder - 4 + 12) % 12
  const animal = SHIO_ANIMALS[animalIndex]!
  const wuxing = getWuXingElement(shioYear)

  return {
    ...animal,
    ...wuxing,
    yinYang: shioYear % 2 === 0 ? 'Yang' : 'Yin',
  }
}

/**
 * Dapatkan tanggal Imlek untuk tahun tertentu (jika tersedia).
 * Return null jika di luar range data.
 */
export function getChineseNewYearDate(year: number): Date | null {
  const encoded = CNY_DATES[year]
  if (!encoded) return null
  const month = Math.floor(encoded / 100)
  const day = encoded % 100
  return new Date(year, month - 1, day)
}

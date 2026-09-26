export interface SurahSummary {
  nomor: number
  nama: string
  namaLatin: string
  jumlahAyat: number
  tempatTurun: string
  arti: string
  deskripsi: string
}

export interface AyatItem {
  nomorAyat: number
  teksArab: string
  teksLatin: string
  teksIndonesia: string
  audio: Record<string, string>
}

export interface SurahNavInfo {
  nomor: number
  nama: string
  namaLatin: string
  jumlahAyat: number
}

export interface SurahDetail extends SurahSummary {
  audioFull: Record<string, string>
  ayat: AyatItem[]
  suratSelanjutnya?: SurahNavInfo | false
  suratSebelumnya?: SurahNavInfo | false
}

export interface JuzItem {
  juz: number
  surah: number
  ayat: number
  nama: string
}

export interface QariOption {
  id: string
  code: string
  name: string
  role: string
}

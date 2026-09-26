import { ref, computed } from 'vue'
import type { SurahSummary, SurahDetail, JuzItem, QariOption } from '~/types/quran'

export const QARI_OPTIONS: QariOption[] = [
  { id: '06', code: '06', name: 'Syeikh Yasser Al-Dosari', role: 'Imam Masjidil Haram' },
  { id: '05', code: '05', name: 'Syeikh Misyari Rasyid Al-Afasy', role: 'Imam Kuwait' },
  { id: '03', code: '03', name: 'Syeikh Abdurrahman As-Sudais', role: 'Imam Besar Masjidil Haram' },
  { id: '01', code: '01', name: 'Syeikh Abdullah Al-Juhany', role: 'Imam Masjidil Haram' },
  { id: '02', code: '02', name: 'Syeikh Abdul Muhsin Al-Qasim', role: 'Imam Masjid Nabawi' },
  { id: '04', code: '04', name: 'Syeikh Ibrahim Al-Dossari', role: 'Qari Internasional' }
]

export interface LastReadItem {
  surahNumber: number
  surahName: string
  ayatNumber: number
  timestamp: number
}

// Objek audio tunggal & preloader di tingkat modul agar persisten dan hemat memori
let globalActiveAudio: HTMLAudioElement | null = null
let globalNextAudio: HTMLAudioElement | null = null
let preloadedAyatNum: number | null = null

export function useQuran() {
  const surahs = ref<SurahSummary[]>([])
  const juzs = ref<JuzItem[]>([])
  const currentSurah = ref<SurahDetail | null>(null)
  const loading = ref(false)
  const selectedQari = ref('06') // Bawaan utama Syeikh Yasser Al-Dosari

  const lastRead = ref<LastReadItem | null>(null)

  // Status Pemutaran Audio
  const playingAyat = ref<number | null>(null)
  const isPlaying = ref(false)
  const isContinuous = ref(true) // Selalu aktif agar otomatis lanjut ke ayat berikutnya tanpa jeda

  const loadIndices = async () => {
    try {
      const [surahRes, juzRes] = await Promise.all([
        $fetch<SurahSummary[]>('/dataset/quran/surah_index.json'),
        $fetch<JuzItem[]>('/dataset/quran/juz_index.json')
      ])
      surahs.value = surahRes || []
      juzs.value = juzRes || []
    } catch (e) {
      console.error('Gagal memuat indeks Al-Qur\'an:', e)
    }
  }

  const loadSurah = async (number: number) => {
    loading.value = true
    try {
      const data = await $fetch<SurahDetail>(`/dataset/quran/surah/${number}.json`)
      currentSurah.value = data
      return data
    } catch (e) {
      console.error(`Gagal memuat Surah ${number}:`, e)
      return null
    } finally {
      loading.value = false
    }
  }

  const loadStorage = () => {
    if (import.meta.client) {
      const savedQari = localStorage.getItem('figo_quran_qari')
      if (savedQari && QARI_OPTIONS.some((q) => q.code === savedQari)) {
        selectedQari.value = savedQari
      }
      const savedLastRead = localStorage.getItem('figo_quran_last_read')
      if (savedLastRead) {
        try {
          lastRead.value = JSON.parse(savedLastRead)
        } catch { /* Abaikan error parsing JSON */ }
      }
    }
  }

  const setQari = (code: string) => {
    selectedQari.value = code
    if (import.meta.client) {
      localStorage.setItem('figo_quran_qari', code)
    }

    // Bersihkan buffer audio berikutnya agar sesuai dengan qari baru
    if (globalNextAudio) {
      globalNextAudio.src = ''
      globalNextAudio = null
      preloadedAyatNum = null
    }

    // Jika sedang memutar, putar ulang ayat saat ini menggunakan suara qari baru
    if (isPlaying.value && currentSurah.value && playingAyat.value) {
      const cur = playingAyat.value
      stopAudio()
      playAyat(currentSurah.value.nomor, cur)
    }
  }

  const saveLastRead = (surahNumber: number, surahName: string, ayatNumber: number) => {
    const item: LastReadItem = {
      surahNumber,
      surahName,
      ayatNumber,
      timestamp: Date.now()
    }
    lastRead.value = item
    if (import.meta.client) {
      localStorage.setItem('figo_quran_last_read', JSON.stringify(item))
    }
  }

  // Mendapatkan URL audio resmi dari data lokal atau fallback ke CDN EveryAyah
  const resolveAyatAudioUrl = (surahNumber: number, ayatNumber: number): string => {
    if (!currentSurah.value) return ''
    const target = currentSurah.value.ayat.find((a) => a.nomorAyat === ayatNumber)
    if (target?.audio?.[selectedQari.value]) {
      return target.audio[selectedQari.value]
    }
    const qariCode = selectedQari.value === '06' ? 'Yasser_Ad-Dussary_128kbps' : 'Alafasy_128kbps'
    const surahStr = String(surahNumber).padStart(3, '0')
    const ayatStr = String(ayatNumber).padStart(3, '0')
    return `https://everyayah.com/data/${qariCode}/${surahStr}${ayatStr}.mp3`
  }

  // Preload audio ayat berikutnya ke memori agar perpindahan ayat terjadi 0ms tanpa jeda
  const preloadNextAyat = (surahNumber: number, nextAyatNumber: number) => {
    if (!currentSurah.value || nextAyatNumber > currentSurah.value.jumlahAyat) {
      globalNextAudio = null
      preloadedAyatNum = null
      return
    }
    const nextUrl = resolveAyatAudioUrl(surahNumber, nextAyatNumber)
    if (!nextUrl) return

    const audio = new Audio()
    audio.preload = 'auto'
    audio.src = nextUrl
    audio.load()
    globalNextAudio = audio
    preloadedAyatNum = nextAyatNumber
  }

  const stopAudio = () => {
    if (globalActiveAudio) {
      globalActiveAudio.pause()
      globalActiveAudio.onended = null
      globalActiveAudio.onerror = null
      globalActiveAudio.src = ''
      globalActiveAudio = null
    }
    if (globalNextAudio) {
      globalNextAudio.src = ''
      globalNextAudio = null
      preloadedAyatNum = null
    }
    playingAyat.value = null
    isPlaying.value = false
  }

  const pauseAudio = () => {
    if (globalActiveAudio) {
      globalActiveAudio.pause()
      isPlaying.value = false
    }
  }

  const resumeAudio = () => {
    if (globalActiveAudio && playingAyat.value) {
      globalActiveAudio.play().then(() => {
        isPlaying.value = true
      }).catch((err) => {
        console.warn('Gagal melanjutkan pemutaran audio:', err)
      })
    }
  }

  const playAyat = (surahNumber: number, ayatNumber: number) => {
    if (!currentSurah.value) return

    // Jika menekan ayat yang sedang aktif: lakukan toggle pause / play
    if (playingAyat.value === ayatNumber && globalActiveAudio) {
      if (isPlaying.value) {
        pauseAudio()
      } else {
        resumeAudio()
      }
      return
    }

    // Bersihkan audio yang sedang berbunyi sebelumnya
    if (globalActiveAudio) {
      globalActiveAudio.pause()
      globalActiveAudio.onended = null
      globalActiveAudio.onerror = null
      globalActiveAudio.src = ''
      globalActiveAudio = null
    }

    // Gunakan audio yang sudah di-preload jika cocok, atau buat instance baru
    let audio: HTMLAudioElement
    if (preloadedAyatNum === ayatNumber && globalNextAudio) {
      audio = globalNextAudio
      globalNextAudio = null
      preloadedAyatNum = null
    } else {
      const url = resolveAyatAudioUrl(surahNumber, ayatNumber)
      audio = new Audio(url)
      audio.preload = 'auto'
    }

    globalActiveAudio = audio
    playingAyat.value = ayatNumber
    isPlaying.value = true
    isContinuous.value = true

    // Segera lakukan buffering untuk ayat berikutnya di latar belakang (tanpa menunggu ayat ini selesai)
    preloadNextAyat(surahNumber, ayatNumber + 1)

    // Event ketika ayat selesai: langsung lanjut otomatis ke ayat berikutnya tanpa jeda
    audio.onended = () => {
      if (!isContinuous.value || !currentSurah.value) {
        playingAyat.value = null
        isPlaying.value = false
        return
      }

      const nextAyat = ayatNumber + 1
      if (nextAyat <= currentSurah.value.jumlahAyat) {
        // Panggil ayat berikutnya secara langsung & instan
        playAyat(surahNumber, nextAyat)
      } else {
        // Surah telah selesai dibacakan seluruhnya
        playingAyat.value = null
        isPlaying.value = false
        globalActiveAudio = null
        globalNextAudio = null
        preloadedAyatNum = null
      }
    }

    audio.onerror = () => {
      console.warn(`Gagal memuat audio ayat ${surahNumber}:${ayatNumber}`)
      const nextAyat = ayatNumber + 1
      if (isContinuous.value && currentSurah.value && nextAyat <= currentSurah.value.jumlahAyat) {
        playAyat(surahNumber, nextAyat)
      } else {
        stopAudio()
      }
    }

    // Jalankan pemutaran
    audio.play().catch((err) => {
      console.warn('Pemutaran audio diblokir peramban:', err)
      isPlaying.value = false
    })
  }

  const playFullSurah = (surahNumber: number) => {
    if (!currentSurah.value) return
    isContinuous.value = true
    playAyat(surahNumber, 1)
  }

  return {
    surahs,
    juzs,
    currentSurah,
    loading,
    selectedQari,
    lastRead,
    playingAyat,
    isPlaying,
    isContinuous,
    loadIndices,
    loadSurah,
    loadStorage,
    setQari,
    saveLastRead,
    playAyat,
    playFullSurah,
    pauseAudio,
    resumeAudio,
    stopAudio
  }
}

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

// Dual-Deck Ping-Pong Engine untuk pemutaran audio gapless tanpa jeda (seamless transition)
let deckA: HTMLAudioElement | null = null
let deckB: HTMLAudioElement | null = null
let activeDeckKey: 'A' | 'B' = 'A'
let checkTimer: any = null
let hasTriggeredEarly = false

export function useQuran() {
  const surahs = ref<SurahSummary[]>([])
  const juzs = ref<JuzItem[]>([])
  const currentSurah = ref<SurahDetail | null>(null)
  const loading = ref(false)
  const selectedQari = ref('06') // Bawaan utama: Syeikh Yasser Al-Dosari

  const lastRead = ref<LastReadItem | null>(null)

  // Status Pemutaran Audio
  const playingAyat = ref<number | null>(null)
  const isPlaying = ref(false)
  const isContinuous = ref(true)

  const initDecks = () => {
    if (!import.meta.client) return
    if (!deckA) {
      deckA = new Audio()
      deckA.preload = 'auto'
    }
    if (!deckB) {
      deckB = new Audio()
      deckB.preload = 'auto'
    }
  }

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

  const setQari = (code: string) => {
    selectedQari.value = code
    if (import.meta.client) {
      localStorage.setItem('figo_quran_qari', code)
    }
    if (isPlaying.value && currentSurah.value && playingAyat.value) {
      const current = playingAyat.value
      stopAudio()
      playAyat(currentSurah.value.nomor, current)
    } else {
      stopAudio()
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

  const stopAudio = () => {
    if (checkTimer) {
      clearInterval(checkTimer)
      checkTimer = null
    }
    if (deckA) {
      deckA.pause()
      deckA.onended = null
      deckA.onerror = null
    }
    if (deckB) {
      deckB.pause()
      deckB.onended = null
      deckB.onerror = null
    }
    playingAyat.value = null
    isPlaying.value = false
    hasTriggeredEarly = false
  }

  const pauseAudio = () => {
    if (checkTimer) {
      clearInterval(checkTimer)
      checkTimer = null
    }
    const curDeck = activeDeckKey === 'A' ? deckA : deckB
    if (curDeck) {
      curDeck.pause()
      isPlaying.value = false
    }
  }

  const resumeAudio = () => {
    initDecks()
    const curDeck = activeDeckKey === 'A' ? deckA : deckB
    if (curDeck && playingAyat.value && currentSurah.value) {
      curDeck.play().then(() => {
        isPlaying.value = true
        startPrecisionMonitor(currentSurah.value!.nomor, playingAyat.value!)
      }).catch((err) => {
        console.warn('Gagal melanjutkan audio:', err)
      })
    }
  }

  // Fade out halus agar pergantian deck tidak menimbulkan letupan suara
  const fadeOutAndPause = (deck: HTMLAudioElement) => {
    let vol = deck.volume
    const fadeTimer = setInterval(() => {
      vol -= 0.25
      if (vol <= 0.05) {
        clearInterval(fadeTimer)
        deck.pause()
        deck.volume = 1.0
      } else {
        deck.volume = Math.max(0, vol)
      }
    }, 30)
  }

  // Monitor presisi tinggi (30ms polling) untuk memangkas jeda senyap (dead air tail) antarberkas MP3
  const startPrecisionMonitor = (surahNumber: number, ayatNumber: number) => {
    if (checkTimer) clearInterval(checkTimer)
    hasTriggeredEarly = false

    checkTimer = setInterval(() => {
      const curDeck = activeDeckKey === 'A' ? deckA : deckB
      if (!curDeck || !isPlaying.value) return

      const nextAyat = ayatNumber + 1
      const hasNext = currentSurah.value && nextAyat <= currentSurah.value.jumlahAyat

      // Jika durasi valid dan tersisa 240ms (posisi hening bawaan encoder MP3), picu ayat berikutnya langsung
      if (hasNext && !hasTriggeredEarly && curDeck.duration && curDeck.duration > 0.6) {
        const remaining = curDeck.duration - curDeck.currentTime
        if (remaining <= 0.24) {
          hasTriggeredEarly = true
          clearInterval(checkTimer)
          checkTimer = null

          // Lakukan transisi mulus ke deck pasangan
          fadeOutAndPause(curDeck)
          activeDeckKey = activeDeckKey === 'A' ? 'B' : 'A'
          playAyat(surahNumber, nextAyat)
        }
      }
    }, 30)
  }

  const playAyat = (surahNumber: number, ayatNumber: number) => {
    if (!currentSurah.value) return
    initDecks()

    const currentDeck = activeDeckKey === 'A' ? deckA! : deckB!
    const standByDeck = activeDeckKey === 'A' ? deckB! : deckA!

    // Toggle jeda / lanjutkan jika menekan ayat yang sama
    if (playingAyat.value === ayatNumber && isPlaying.value) {
      pauseAudio()
      return
    }

    if (playingAyat.value === ayatNumber && !isPlaying.value) {
      resumeAudio()
      return
    }

    // Pasang URL berkas ayat saat ini ke deck aktif jika belum terpasang
    const currentUrl = resolveAyatAudioUrl(surahNumber, ayatNumber)
    if (currentDeck.src !== currentUrl) {
      currentDeck.src = currentUrl
      currentDeck.load()
    }

    currentDeck.volume = 1.0
    playingAyat.value = ayatNumber
    isPlaying.value = true
    isContinuous.value = true

    // Pasang fallback onended jika interval presisi tidak terpicu
    currentDeck.onended = () => {
      if (!hasTriggeredEarly) {
        hasTriggeredEarly = true
        if (checkTimer) clearInterval(checkTimer)
        const nextAyat = ayatNumber + 1
        if (currentSurah.value && nextAyat <= currentSurah.value.jumlahAyat) {
          activeDeckKey = activeDeckKey === 'A' ? 'B' : 'A'
          playAyat(surahNumber, nextAyat)
        } else {
          stopAudio()
        }
      }
    }

    currentDeck.onerror = () => {
      console.warn(`Gagal memuat audio ayat ${surahNumber}:${ayatNumber}`)
      const nextAyat = ayatNumber + 1
      if (currentSurah.value && nextAyat <= currentSurah.value.jumlahAyat) {
        activeDeckKey = activeDeckKey === 'A' ? 'B' : 'A'
        playAyat(surahNumber, nextAyat)
      } else {
        stopAudio()
      }
    }

    // Jalankan deck aktif
    currentDeck.play().then(() => {
      // Preload berkas ayat berikutnya ke standby deck secara instan di latar belakang
      const nextAyat = ayatNumber + 1
      if (currentSurah.value && nextAyat <= currentSurah.value.jumlahAyat) {
        const nextUrl = resolveAyatAudioUrl(surahNumber, nextAyat)
        if (standByDeck.src !== nextUrl) {
          standByDeck.src = nextUrl
          standByDeck.preload = 'auto'
          standByDeck.load()
        }
      }
      startPrecisionMonitor(surahNumber, ayatNumber)
    }).catch((err) => {
      console.warn('Pemutaran diblokir peramban:', err)
      isPlaying.value = false
    })
  }

  const playFullSurah = (surahNumber: number) => {
    if (!currentSurah.value) return
    isContinuous.value = true
    activeDeckKey = 'A'
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

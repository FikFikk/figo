<template>
  <div class="min-h-[100dvh] w-full max-w-full overflow-x-clip px-4 pb-44 pt-32 text-slate-800 transition-colors duration-200 sm:px-6 md:px-8 dark:text-slate-200">
    <!-- ============================================== -->
    <!-- DOCKED STICKY HEADER QURAN (MENGGANTIKAN FIGO NAVBAR SAAT SCROLL) -->
    <!-- ============================================== -->
    <header
      class="fixed inset-x-0 z-40 border-b backdrop-blur-xl transition-[top] duration-300 ease-in-out px-4 py-2.5 sm:px-6 md:px-8 shadow-xs"
      :class="[
        isFiGoNavbarHidden ? 'top-0' : 'top-[61px]',
        isDark ? 'border-white/[0.08] bg-[#08090d]/90 text-slate-100' : 'border-slate-200/80 bg-white/90 text-slate-900'
      ]"
    >
      <div class="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
        <!-- Sisi Kiri: Tombol Beranda & Pemilih Surah Cepat -->
        <div class="flex items-center gap-2 sm:gap-3">
          <NuxtLink
            to="/"
            class="grid size-9 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-600 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-emerald-400 transition"
            title="Kembali ke Beranda"
          >
            <span class="material-symbols-outlined text-[18px]">home</span>
          </NuxtLink>

          <!-- Dropdown Pemilih Cepat Surah (1–114) Saat Mode Baca Aktif -->
          <div v-if="viewMode === 'reader' && currentSurah" class="relative">
            <label class="sr-only">Pilih Surah Cepat</label>
            <select
              :value="currentSurah.nomor"
              class="h-9 rounded-xl border bg-transparent pl-3 pr-8 text-xs font-bold outline-none cursor-pointer transition focus:ring-2 focus:ring-emerald-500 font-serif"
              :class="isDark ? 'border-white/10 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-900 shadow-2xs'"
              @change="selectSurah(parseInt(($event.target as HTMLSelectElement).value, 10))"
            >
              <option v-for="s in surahs" :key="s.nomor" :value="s.nomor">
                {{ s.nomor }}. {{ s.namaLatin }} ({{ s.nama }})
              </option>
            </select>
          </div>

          <!-- Lencana Info Kontekstual -->
          <span
            v-if="viewMode === 'reader' && currentSurah"
            class="hidden lg:inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300"
          >
            {{ currentSurah.tempatTurun }} • {{ currentSurah.jumlahAyat }} Ayat • {{ currentSurah.arti }}
          </span>
        </div>

        <!-- Sisi Kanan: Pengalih Format Baca, Katalog, & Pengaturan -->
        <div class="flex items-center gap-1.5 sm:gap-2">
          <!-- Toggle Format Baca: Ayat demi Ayat vs Mode Mushaf Utuh -->
          <div
            v-if="viewMode === 'reader'"
            class="flex items-center rounded-xl border p-0.5"
            :class="isDark ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-100'"
          >
            <button
              type="button"
              class="px-2.5 py-1 text-xs font-semibold rounded-lg transition"
              :class="readFormat === 'verse'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'"
              @click="readFormat = 'verse'"
            >
              Ayat demi Ayat
            </button>
            <button
              type="button"
              class="px-2.5 py-1 text-xs font-semibold rounded-lg transition"
              :class="readFormat === 'mushaf'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'"
              @click="readFormat = 'mushaf'"
            >
              Membaca
            </button>
          </div>

          <!-- Tombol Katalog 114 Surah / 30 Juz -->
          <button
            type="button"
            class="inline-flex min-h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition"
            :class="viewMode === 'catalog'
              ? 'bg-emerald-600 text-white border-transparent'
              : 'border-slate-200 bg-white/80 text-slate-700 hover:border-emerald-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'"
            @click="viewMode = viewMode === 'catalog' ? 'reader' : 'catalog'"
          >
            <span class="material-symbols-outlined text-[16px]">
              {{ viewMode === 'catalog' ? 'auto_stories' : 'menu_book' }}
            </span>
            <span class="hidden sm:inline">{{ viewMode === 'catalog' ? 'Kembali Membaca' : 'Semua Surah' }}</span>
          </button>

          <!-- Tombol Panel Pengaturan Font -->
          <button
            type="button"
            class="grid size-9 place-items-center rounded-xl border transition cursor-pointer"
            :class="showSettingsPanel
              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
              : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'"
            title="Pengaturan Tampilan Baca"
            @click="showSettingsPanel = !showSettingsPanel"
          >
            <span class="material-symbols-outlined text-[19px]">tune</span>
          </button>
        </div>
      </div>

      <!-- Floating Drawer Panel Pengaturan Tampilan Huruf & Terjemahan -->
      <Transition name="slide-up">
        <div
          v-if="showSettingsPanel"
          class="absolute top-full right-4 sm:right-6 md:right-8 mt-2 w-80 sm:w-96 rounded-2xl border p-4 shadow-2xl backdrop-blur-2xl z-50 text-xs space-y-3.5"
          :class="isDark ? 'border-white/10 bg-[#0c0e14]/95 text-slate-200 shadow-black/50' : 'border-slate-200 bg-white/95 text-slate-800 shadow-slate-300/50'"
        >
          <!-- Pengatur Ukuran Huruf Arab -->
          <div class="space-y-1">
            <div class="flex justify-between font-semibold">
              <span>Ukuran Aksara Arab:</span>
              <span class="font-mono text-emerald-600 dark:text-emerald-400">{{ arabicFontSize }}px</span>
            </div>
            <input
              v-model.number="arabicFontSize"
              type="range"
              min="24"
              max="48"
              step="2"
              class="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <!-- Toggle Transliterasi Latin & Terjemahan -->
          <div class="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
            <div class="flex items-center justify-between gap-2">
              <span class="font-medium text-[11px]">Transliterasi Latin</span>
              <button
                type="button"
                class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer"
                :class="showLatin ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'"
                @click="showLatin = !showLatin"
              >
                <span class="inline-block size-3.5 transform rounded-full bg-white transition-transform" :class="showLatin ? 'translate-x-4' : 'translate-x-1'" />
              </button>
            </div>

            <div class="flex items-center justify-between gap-2">
              <span class="font-medium text-[11px]">Terjemahan RI</span>
              <button
                type="button"
                class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer"
                :class="showTranslation ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'"
                @click="showTranslation = !showTranslation"
              >
                <span class="inline-block size-3.5 transform rounded-full bg-white transition-transform" :class="showTranslation ? 'translate-x-4' : 'translate-x-1'" />
              </button>
            </div>
          </div>

          <!-- Mode Pemutaran Tilawah -->
          <div class="pt-2 border-t border-slate-100 dark:border-white/[0.06] space-y-1.5">
            <span class="font-semibold block text-[11px]">Mode Tilawah Audio:</span>
            <div class="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.04]">
              <button
                type="button"
                class="py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                :class="playMode === 'continuous'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
                @click="playMode !== 'continuous' && togglePlayMode()"
              >
                <span class="material-symbols-outlined text-sm">all_inclusive</span>
                Lanjut Surah
              </button>
              <button
                type="button"
                class="py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                :class="playMode === 'single'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'"
                @click="playMode !== 'single' && togglePlayMode()"
              >
                <span class="material-symbols-outlined text-sm">filter_1</span>
                Per Ayat
              </button>
            </div>
            <p class="text-[10px] text-slate-500 dark:text-slate-400 italic">
              {{ playMode === 'continuous' ? '• Mulus tanpa jeda (Studio Full Gapless)' : '• Berhenti setelah 1 ayat selesai (Ideal untuk hafalan)' }}
            </p>
          </div>
        </div>
      </Transition>
    </header>

    <div class="mx-auto max-w-5xl">
      <!-- ============================================== -->
      <!-- TAMPILAN 1: MODE BACA SURAH (READER) -->
      <!-- ============================================== -->
      <div v-if="viewMode === 'reader'" class="space-y-6">
        <!-- Indikator Loading Surah -->
        <div v-if="loading" class="grid min-h-64 place-items-center" role="status">
          <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <span class="size-4 animate-pulse rounded-full bg-emerald-600" />
            Memuat Surah Al-Qur'an…
          </div>
        </div>

        <template v-else-if="currentSurah">
          <!-- Hero Header Surah Editorial Minimalis -->
          <div class="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-6 sm:p-8 dark:border-emerald-500/20 dark:from-emerald-950/30 dark:via-emerald-900/10 mb-6">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div class="space-y-2">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="rounded-xl bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                    Surah Ke-{{ currentSurah.nomor }}
                  </span>
                  <span class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    {{ currentSurah.tempatTurun }} • {{ currentSurah.jumlahAyat }} Ayat
                  </span>
                  <span class="text-xs text-slate-500 dark:text-slate-400">
                    Arti: <strong class="text-slate-700 dark:text-slate-200">{{ currentSurah.arti }}</strong>
                  </span>
                </div>

                <div class="flex items-baseline gap-4 pt-1">
                  <h1 class="text-3xl sm:text-4xl font-serif font-black tracking-tight text-slate-950 dark:text-white">
                    {{ currentSurah.namaLatin }}
                  </h1>
                  <span class="font-arabic text-3xl sm:text-4xl text-emerald-600 dark:text-emerald-400 font-normal">
                    {{ currentSurah.nama }}
                  </span>
                </div>

                <!-- Accordion Deskripsi Makna / Pengantar Surah -->
                <div class="pt-2">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 cursor-pointer"
                    @click="showDescription = !showDescription"
                  >
                    <span>{{ showDescription ? 'Sembunyikan Pengantar Surah' : 'Baca Pengantar & Makna Surah' }}</span>
                    <span class="material-symbols-outlined text-sm transition-transform" :class="{ 'rotate-180': showDescription }">
                      expand_more
                    </span>
                  </button>
                  <Transition name="fade">
                    <div
                      v-if="showDescription"
                      class="mt-3 rounded-2xl border border-slate-200/80 bg-white/70 p-4 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
                      v-html="currentSurah.deskripsi"
                    />
                  </Transition>
                </div>
              </div>

              <!-- Navigasi Cepat Surah Sebelumnya & Selanjutnya -->
              <div class="flex items-center gap-2 self-start md:self-auto shrink-0">
                <button
                  v-if="currentSurah.suratSebelumnya"
                  type="button"
                  class="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-emerald-600 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-emerald-400 cursor-pointer"
                  @click="selectSurah(currentSurah.suratSebelumnya.nomor)"
                >
                  <span class="material-symbols-outlined text-sm">arrow_back</span>
                  <span>{{ currentSurah.suratSebelumnya.namaLatin }}</span>
                </button>
                <button
                  v-if="currentSurah.suratSelanjutnya"
                  type="button"
                  class="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-emerald-600 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-emerald-400 cursor-pointer"
                  @click="selectSurah(currentSurah.suratSelanjutnya.nomor)"
                >
                  <span>{{ currentSurah.suratSelanjutnya.namaLatin }}</span>
                  <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Banner Kaligrafi Bismillah (Kecuali Surah At-Taubah no 9 dan Al-Fatihah no 1) -->
          <div
            v-if="currentSurah.nomor !== 9 && currentSurah.nomor !== 1"
            class="my-8 text-center"
          >
            <div class="inline-block rounded-3xl border border-emerald-500/20 bg-white/60 px-8 py-4 shadow-xs backdrop-blur-sm dark:bg-slate-900/60">
              <p class="font-arabic text-2xl sm:text-3xl text-emerald-800 dark:text-emerald-300 leading-loose">
                بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
              </p>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 italic font-serif">
                Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang
              </p>
            </div>
          </div>

          <!-- FORMAT 1: AYAT DEMI AYAT (CARD VIEW DENGAN TOMBOL AKSI & TERJEMAHAN) -->
          <div v-if="readFormat === 'verse'" class="space-y-4">
            <article
              v-for="item in currentSurah.ayat"
              :id="`ayat-${item.nomorAyat}`"
              :key="item.nomorAyat"
              class="relative rounded-3xl border p-5 sm:p-6 transition-all duration-300"
              :class="playingAyat === item.nomorAyat
                ? 'border-emerald-500 bg-emerald-500/[0.06] ring-2 ring-emerald-500/30 dark:bg-emerald-950/20'
                : 'border-slate-200/90 bg-white/80 hover:border-slate-300 dark:border-white/[0.08] dark:bg-[#0c0e14]/80 dark:hover:border-white/[0.14]'"
            >
              <!-- Baris Meta Ayat: Nomor Ayat & Tombol Aksi Cepat (Play, Copy, Bookmark) -->
              <div class="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-white/[0.06]">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                    {{ currentSurah.nomor }}:{{ item.nomorAyat }}
                  </span>
                  <span v-if="playingAyat === item.nomorAyat" class="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white animate-pulse">
                    <span class="material-symbols-outlined text-xs">volume_up</span>
                    Tilawah Aktif
                  </span>
                </div>

                <div class="flex items-center gap-1">
                  <!-- Putar Audio Ayat Ini -->
                  <button
                    type="button"
                    class="grid size-8 place-items-center rounded-xl transition cursor-pointer"
                    :class="playingAyat === item.nomorAyat && isPlaying
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-emerald-400'"
                    :title="`Putar audio ayat ${item.nomorAyat}`"
                    @click="playAyat(currentSurah.nomor, item.nomorAyat)"
                  >
                    <span class="material-symbols-outlined text-[18px]">
                      {{ playingAyat === item.nomorAyat && isPlaying ? 'pause' : 'play_arrow' }}
                    </span>
                  </button>

                  <!-- Salin Teks Ayat -->
                  <button
                    type="button"
                    class="grid size-8 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-emerald-400 transition cursor-pointer"
                    :title="`Salin ayat ${item.nomorAyat}`"
                    @click="copyAyat(item)"
                  >
                    <span class="material-symbols-outlined text-[17px]">content_copy</span>
                  </button>

                  <!-- Simpan Bookmark Terakhir Dibaca -->
                  <button
                    type="button"
                    class="grid size-8 place-items-center rounded-xl transition cursor-pointer"
                    :class="isMarked(item.nomorAyat)
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-emerald-400'"
                    :title="`Tandai terakhir dibaca ayat ${item.nomorAyat}`"
                    @click="bookmarkAyat(item.nomorAyat)"
                  >
                    <span class="material-symbols-outlined text-[17px]">
                      {{ isMarked(item.nomorAyat) ? 'bookmark_added' : 'bookmark' }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- Teks Arab Kaligrafi Rasm Utsmani MSI Kemenag RI dengan Medali Angka Arab -->
              <div class="mb-4 text-right" dir="rtl">
                <p
                  class="font-arabic font-medium tracking-normal text-slate-950 dark:text-white leading-[2.6] select-text"
                  :style="{ fontSize: `${arabicFontSize}px` }"
                >
                  {{ item.teksArab }}

                  <!-- Ornamen Penutup Ayat Berisi Angka Arab Timur yang Presisi -->
                  <span
                    class="inline-flex items-center justify-center size-9 mx-2 align-middle select-none relative text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform"
                    dir="ltr"
                    :aria-label="`Ayat ${item.nomorAyat}`"
                  >
                    <!-- Ornamen Medali Geometris Islami (Oktagon & Lingkaran Emas/Emerald) -->
                    <svg class="size-9 absolute inset-0 drop-shadow-xs" viewBox="0 0 40 40" fill="none">
                      <circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="1.2" stroke-opacity="0.4" stroke-dasharray="1.5 2.5" />
                      <path
                        d="M20 3 L24.5 7.5 L31 7.5 L32.5 14 L37 18.5 L35 24.5 L37 30 L31 32.5 L29 37 L20 35 L11 37 L9 32.5 L3 30 L5 24.5 L3 18.5 L7.5 14 L9 7.5 L15.5 7.5 Z"
                        stroke="currentColor"
                        stroke-width="1.2"
                        fill="currentColor"
                        fill-opacity="0.08"
                      />
                      <circle cx="20" cy="20" r="13" stroke="currentColor" stroke-width="0.8" stroke-opacity="0.7" />
                    </svg>
                    <!-- Angka Arab Timur (Eastern Arabic Numerals) -->
                    <span class="font-arabic font-bold text-xs pt-0.5 text-emerald-700 dark:text-emerald-300 relative z-10 leading-none">
                      {{ toArabicDigits(item.nomorAyat) }}
                    </span>
                  </span>
                </p>
              </div>

              <!-- Transliterasi Latin Fonetik Standar Kemenag RI -->
              <div v-if="showLatin" class="mb-2.5">
                <p class="font-serif italic text-xs sm:text-sm text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed">
                  {{ item.teksLatin }}
                </p>
              </div>

              <!-- Terjemahan Bahasa Indonesia Resmi Kemenag RI -->
              <div v-if="showTranslation" class="pt-1">
                <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {{ item.teksIndonesia }}
                </p>
              </div>
            </article>
          </div>

          <!-- FORMAT 2: MODE MUSHAF LENGKAP (CONTINUOUS FLOW BACA SEPERTI MUSHAF ASLI) -->
          <div
            v-else-if="readFormat === 'mushaf'"
            class="rounded-3xl border border-slate-200/90 bg-white/90 p-7 sm:p-10 shadow-sm dark:border-white/[0.08] dark:bg-[#0c0e14]/90"
          >
            <div class="text-right leading-[3.2] select-text" dir="rtl">
              <span
                v-for="item in currentSurah.ayat"
                :id="`ayat-${item.nomorAyat}`"
                :key="item.nomorAyat"
                class="transition-colors rounded-xl px-1.5 py-1 inline"
                :class="playingAyat === item.nomorAyat ? 'bg-emerald-500/20 text-emerald-950 dark:text-white' : ''"
              >
                <span
                  class="font-arabic font-medium tracking-normal text-slate-950 dark:text-white cursor-pointer hover:text-emerald-600 transition-colors"
                  :style="{ fontSize: `${arabicFontSize}px` }"
                  @click="playAyat(currentSurah.nomor, item.nomorAyat)"
                >
                  {{ item.teksArab }}
                </span>

                <!-- Medali Nomor Ayat Arab -->
                <span
                  class="inline-flex items-center justify-center size-9 mx-2 align-middle select-none relative text-emerald-600 dark:text-emerald-400 cursor-pointer"
                  dir="ltr"
                  :title="`Ayat ${item.nomorAyat} - Klik untuk putar suara`"
                  @click="playAyat(currentSurah.nomor, item.nomorAyat)"
                >
                  <svg class="size-9 absolute inset-0 drop-shadow-xs" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="18" stroke="currentColor" stroke-width="1.2" stroke-opacity="0.4" stroke-dasharray="1.5 2.5" />
                    <path
                      d="M20 3 L24.5 7.5 L31 7.5 L32.5 14 L37 18.5 L35 24.5 L37 30 L31 32.5 L29 37 L20 35 L11 37 L9 32.5 L3 30 L5 24.5 L3 18.5 L7.5 14 L9 7.5 L15.5 7.5 Z"
                      stroke="currentColor"
                      stroke-width="1.2"
                      fill="currentColor"
                      fill-opacity="0.08"
                    />
                    <circle cx="20" cy="20" r="13" stroke="currentColor" stroke-width="0.8" stroke-opacity="0.7" />
                  </svg>
                  <span class="font-arabic font-bold text-xs pt-0.5 text-emerald-700 dark:text-emerald-300 relative z-10 leading-none">
                    {{ toArabicDigits(item.nomorAyat) }}
                  </span>
                </span>
              </span>
            </div>

            <!-- Panel Terjemahan Khusus Ayat yang Sedang Aktif dalam Mode Mushaf -->
            <div
              v-if="playingAyat && showTranslation"
              class="mt-8 pt-6 border-t border-slate-200/80 dark:border-white/[0.08] text-left"
              dir="ltr"
            >
              <div class="flex items-center gap-2 mb-2">
                <span class="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Terjemahan Ayat {{ playingAyat }}
                </span>
              </div>
              <p class="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {{ currentSurah.ayat.find(a => a.nomorAyat === playingAyat)?.teksIndonesia }}
              </p>
            </div>
          </div>
        </template>
      </div>

      <!-- ============================================== -->
      <!-- TAMPILAN 2: KATALOG 114 SURAH & 30 JUZ -->
      <!-- ============================================== -->
      <div v-else class="space-y-6">
        <!-- Kotak Pencarian & Filter Cepat -->
        <div class="flex flex-col sm:flex-row gap-3">
          <label class="relative flex-1">
            <span class="sr-only">Cari Surah atau Juz</span>
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl opacity-50">search</span>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Cari nama surah (cth: Al-Fatihah, Yasin, Baqarah), arti, atau nomor..."
              class="w-full min-h-12 pl-12 pr-4 rounded-2xl border bg-transparent text-sm outline-none focus:ring-2 focus:ring-emerald-600 transition"
              :class="isDark ? 'border-white/10 text-white placeholder:text-gray-500 bg-white/[0.02]' : 'border-slate-200 text-slate-900 placeholder:text-slate-400 bg-white'"
            />
          </label>
        </div>

        <!-- Banner Lanjutkan Membaca -->
        <div
          v-if="lastRead"
          class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 backdrop-blur-sm dark:bg-emerald-950/20"
        >
          <div class="flex items-center gap-3">
            <div class="grid size-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              <span class="material-symbols-outlined text-xl">bookmark</span>
            </div>
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Terakhir Dibaca
              </p>
              <p class="text-sm font-bold text-slate-900 dark:text-white">
                Surah {{ lastRead.surahName }} (Ayat {{ lastRead.ayatNumber }})
              </p>
            </div>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 cursor-pointer"
            @click="selectSurah(lastRead.surahNumber, lastRead.ayatNumber)"
          >
            <span>Lanjutkan Tilawah</span>
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        <!-- Tab Katalog: 114 Surah vs 30 Juz -->
        <div class="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-white/[0.06]">
          <button
            type="button"
            class="px-4 py-1.5 rounded-xl text-xs font-bold transition"
            :class="catalogTab === 'surah'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'"
            @click="catalogTab = 'surah'"
          >
            114 Surah
          </button>
          <button
            type="button"
            class="px-4 py-1.5 rounded-xl text-xs font-bold transition"
            :class="catalogTab === 'juz'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'"
            @click="catalogTab = 'juz'"
          >
            30 Juz
          </button>
        </div>

        <!-- TAB 1: Grid 114 Surah -->
        <div v-if="catalogTab === 'surah'">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div
              v-for="surah in filteredSurahs"
              :key="surah.nomor"
              class="group relative rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
              :class="isDark
                ? 'border-white/[0.08] bg-white/[0.02] hover:border-emerald-500/40 hover:bg-white/[0.04]'
                : 'border-slate-200 bg-white hover:border-emerald-600/40'"
              @click="selectSurah(surah.nomor)"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="grid size-10 place-items-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    {{ surah.nomor }}
                  </div>
                  <div>
                    <h3 class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {{ surah.namaLatin }}
                    </h3>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                      {{ surah.arti }}
                    </p>
                  </div>
                </div>

                <div class="text-right">
                  <p class="font-arabic text-lg text-emerald-600 dark:text-emerald-400">
                    {{ surah.nama }}
                  </p>
                  <p class="text-[10px] text-slate-400 dark:text-slate-500">
                    {{ surah.tempatTurun }} • {{ surah.jumlahAyat }} Ayat
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: Grid 30 Juz -->
        <div v-else-if="catalogTab === 'juz'">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div
              v-for="item in filteredJuzs"
              :key="item.juz"
              class="group rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
              :class="isDark
                ? 'border-white/[0.08] bg-white/[0.02] hover:border-emerald-500/40 hover:bg-white/[0.04]'
                : 'border-slate-200 bg-white hover:border-emerald-600/40'"
              @click="selectSurah(item.surah, item.ayat)"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="grid size-11 place-items-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 font-bold text-sm text-emerald-700 dark:text-emerald-300">
                    Juz {{ item.juz }}
                  </div>
                  <div>
                    <h3 class="font-bold text-sm text-slate-900 dark:text-white">
                      Mulai dari Surah {{ item.nama }}
                    </h3>
                    <p class="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                      Ayat Ke-{{ item.ayat }}
                    </p>
                  </div>
                </div>
                <span class="material-symbols-outlined text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all">
                  arrow_forward
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================== -->
    <!-- DOCK BAR AUDIO (DESAIN ELEGAN SEPERTI QURAN.COM) -->
    <!-- ============================================== -->
    <div
      v-if="viewMode === 'reader' && currentSurah"
      class="fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-xl transition-all duration-200 px-4 py-2.5 sm:px-6 md:px-8 shadow-2xl"
      :class="isDark ? 'border-white/[0.08] bg-[#08090d]/95 text-slate-100' : 'border-slate-200 bg-white/95 text-slate-900'"
    >
      <div class="mx-auto max-w-5xl flex items-center justify-between gap-3">
        <!-- Informasi Ayat & Qari Aktif -->
        <div class="flex items-center gap-3 min-w-0">
          <div class="hidden sm:grid size-10 place-items-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 shrink-0">
            <span class="material-symbols-outlined text-xl">graphic_eq</span>
          </div>
          <div class="min-w-0">
            <p class="text-xs font-bold truncate text-slate-900 dark:text-white">
              QS {{ currentSurah.nomor }}:{{ playingAyat || 1 }} • {{ currentSurah.namaLatin }}
            </p>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {{ availableQaris.find(q => q.code === selectedQari)?.name || 'Syeikh Yasser Al-Dosari' }}
            </p>
          </div>
        </div>

        <!-- Tombol Kendali Media (Skip Prev, Play/Pause, Skip Next, Mode Switch) -->
        <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <!-- Ayat Sebelumnya -->
          <button
            type="button"
            class="grid size-9 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Ayat Sebelumnya"
            @click="skipPreviousAyat"
          >
            <span class="material-symbols-outlined text-[20px]">skip_previous</span>
          </button>

          <!-- Tombol Utama Play / Pause -->
          <button
            type="button"
            class="flex items-center justify-center size-10 rounded-2xl bg-emerald-600 text-white shadow-md transition hover:bg-emerald-700 active:scale-95 cursor-pointer"
            :title="isPlaying ? 'Jeda Tilawah' : 'Putar Tilawah'"
            @click="togglePlaySurah"
          >
            <span class="material-symbols-outlined text-[24px]">
              {{ isPlaying ? 'pause' : 'play_arrow' }}
            </span>
          </button>

          <!-- Ayat Berikutnya -->
          <button
            type="button"
            class="grid size-9 place-items-center rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Ayat Berikutnya"
            @click="skipNextAyat"
          >
            <span class="material-symbols-outlined text-[20px]">skip_next</span>
          </button>

          <!-- Pengalih Mode Tilawah: Lanjut-Lanjut vs Per Ayat -->
          <button
            type="button"
            class="h-9 px-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer"
            :class="playMode === 'continuous'
              ? (isDark ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-emerald-500/30 bg-emerald-50 text-emerald-700')
              : (isDark ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-amber-500/30 bg-amber-50 text-amber-700')"
            :title="playMode === 'continuous' ? 'Mode: Lanjut Surah (Klik untuk beralih ke Per Ayat)' : 'Mode: Per Ayat (Klik untuk beralih ke Lanjut Surah)'"
            @click="onToggleModeClick"
          >
            <span class="material-symbols-outlined text-[17px]">
              {{ playMode === 'continuous' ? 'all_inclusive' : 'filter_1' }}
            </span>
            <span class="hidden md:inline">{{ playMode === 'continuous' ? 'Lanjut' : 'Per Ayat' }}</span>
          </button>
        </div>

        <!-- Pemilih Qari (Offline Ready) -->
        <div class="flex items-center gap-2 shrink-0">
          <div class="relative">
            <label class="sr-only">Pilih Qari</label>
            <select
              :value="selectedQari"
              class="h-9 rounded-xl border bg-transparent pl-2.5 pr-7 text-xs font-semibold outline-none cursor-pointer transition focus:ring-2 focus:ring-emerald-500 max-w-[140px] sm:max-w-[210px] truncate"
              :class="isDark ? 'border-white/10 bg-slate-900 text-slate-200' : 'border-slate-200 bg-white text-slate-800'"
              @change="onQariChange(($event.target as HTMLSelectElement).value)"
            >
              <option v-for="qari in availableQaris" :key="qari.code" :value="qari.code">
                {{ qari.name }} ({{ qari.role }})
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notifikasi (Salin / Bookmark / Offline Alert) -->
    <Transition name="fade">
      <div
        v-if="toastMessage"
        class="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-slate-900/95 px-4 py-2.5 text-xs font-semibold text-white shadow-xl backdrop-blur-md dark:bg-white/95 dark:text-slate-900 flex items-center gap-2 border border-white/10"
        role="alert"
      >
        <span class="material-symbols-outlined text-emerald-400 dark:text-emerald-600 text-sm">check_circle</span>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuran, toArabicDigits } from '~/composables/useQuran'
import type { AyatItem } from '~/types/quran'

const { isDark } = useColorMode()
const route = useRoute()
const router = useRouter()

const {
  surahs,
  juzs,
  currentSurah,
  loading,
  selectedQari,
  availableQaris,
  isOnline,
  onlineApiFailed,
  lastRead,
  playingAyat,
  isPlaying,
  playMode,
  togglePlayMode,
  loadIndices,
  loadSurah,
  loadStorage,
  setQari,
  saveLastRead,
  playAyat,
  playFullSurah,
  skipNextAyat,
  skipPreviousAyat,
  pauseAudio,
  resumeAudio,
  stopAudio
} = useQuran()

// Mode Tampilan: 'reader' (baca surah) atau 'catalog' (daftar 114 surah & 30 juz)
const viewMode = ref<'reader' | 'catalog'>('reader')
const catalogTab = ref<'surah' | 'juz'>('surah')

// Format Tampilan Membaca: 'verse' (ayat demi ayat dengan terjemahan) atau 'mushaf' (teks mengalir utuh)
const readFormat = ref<'verse' | 'mushaf'>('verse')

const searchQuery = ref('')
const showDescription = ref(false)
const showSettingsPanel = ref(false)

// Pengaturan Tampilan Huruf & Terjemahan
const arabicFontSize = ref(32)
const showLatin = ref(true)
const showTranslation = ref(true)

// Header Sinkronisasi: FiGo Navbar turun-naik, Quran Header menggantikan di top-0 saat scroll ke bawah
const isFiGoNavbarHidden = useState('figo_navbar_hidden', () => false)
let lastScrollY = 0
const scrollThreshold = 8

const handleScroll = () => {
  if (typeof window === 'undefined') return
  const currentY = window.scrollY

  if (currentY <= 40) {
    // Di paling atas halaman: FiGo selalu tampil (turun)
    isFiGoNavbarHidden.value = false
  } else if (currentY > lastScrollY + scrollThreshold) {
    // Scroll ke bawah: FiGo naik (sembunyi), Quran Header menggantikan di top-0
    isFiGoNavbarHidden.value = true
    showSettingsPanel.value = false // Tutup popup settings jika user sedang menggulir layar
  } else if (currentY < lastScrollY - scrollThreshold) {
    // Scroll ke atas: FiGo turun kembali
    isFiGoNavbarHidden.value = false
  }

  lastScrollY = currentY
}

const onToggleModeClick = () => {
  togglePlayMode()
  showToast(
    playMode.value === 'continuous'
      ? 'Mode: Lanjut Surah (Studio Smooth Gapless)'
      : 'Mode: Per Ayat (Berhenti setelah 1 ayat)'
  )
}

// Toast Notifikasi
const toastMessage = ref('')
let toastTimer: any = null

const showToast = (msg: string) => {
  toastMessage.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 2400)
}

// Filter Pencarian Surah
const filteredSurahs = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return surahs.value
  return surahs.value.filter((s) => {
    return (
      s.nomor.toString() === q ||
      s.namaLatin.toLowerCase().includes(q) ||
      s.nama.includes(q) ||
      s.arti.toLowerCase().includes(q)
    )
  })
})

// Filter Pencarian Juz
const filteredJuzs = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return juzs.value
  return juzs.value.filter((j) => {
    return (
      j.juz.toString() === q ||
      j.nama.toLowerCase().includes(q) ||
      `juz ${j.juz}`.includes(q)
    )
  })
})

const selectSurah = async (number: number, targetAyat?: number) => {
  stopAudio()
  viewMode.value = 'reader'
  const data = await loadSurah(number)
  if (data) {
    router.replace({ query: { surah: number, ...(targetAyat ? { ayat: targetAyat } : {}) } })
    if (targetAyat) {
      await nextTick()
      const el = document.getElementById(`ayat-${targetAyat}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
}

const togglePlaySurah = () => {
  if (!currentSurah.value) return
  if (isPlaying.value) {
    pauseAudio()
  } else if (playingAyat.value) {
    resumeAudio()
  } else {
    playFullSurah(currentSurah.value.nomor)
  }
}

const onQariChange = (code: string) => {
  setQari(code)
  const qari = availableQaris.value.find((q) => q.code === code)
  showToast(`Qari: ${qari?.name || 'Syeikh Yasser Al-Dosari'}`)
}

const isMarked = (ayatNumber: number) => {
  if (!lastRead.value || !currentSurah.value) return false
  return (
    lastRead.value.surahNumber === currentSurah.value.nomor &&
    lastRead.value.ayatNumber === ayatNumber
  )
}

const bookmarkAyat = (ayatNumber: number) => {
  if (!currentSurah.value) return
  saveLastRead(currentSurah.value.nomor, currentSurah.value.namaLatin, ayatNumber)
  showToast(`Tanda baca disimpan: ${currentSurah.value.namaLatin} ayat ${ayatNumber}`)
}

const copyAyat = async (item: AyatItem) => {
  if (!currentSurah.value) return
  const text = `${item.teksArab}\n\n"${item.teksLatin}"\n\nArtinya: "${item.teksIndonesia}"\n\n(QS. ${currentSurah.value.namaLatin} [${currentSurah.value.nomor}]: ${item.nomorAyat} - Kemenag RI)`
  try {
    await navigator.clipboard.writeText(text)
    showToast(`Ayat ${item.nomorAyat} berhasil disalin`)
  } catch {
    showToast('Gagal menyalin ayat')
  }
}

// Notifikasi jika API online gagal dan sistem beralih otomatis ke audio lokal
watch(onlineApiFailed, (failed) => {
  if (failed) {
    showToast('Koneksi online tidak tersedia, beralih ke Syeikh Yasser Al-Dosari (Lokal)')
  }
})

// Otomatis scroll memusatkan ayat yang sedang dibacakan
watch(playingAyat, async (newAyat) => {
  if (newAyat) {
    await nextTick()
    const el = document.getElementById(`ayat-${newAyat}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
})

onMounted(async () => {
  loadStorage()
  await loadIndices()

  // Pasang pendengar scroll untuk smart headroom
  window.addEventListener('scroll', handleScroll, { passive: true })

  // Muat surah dari query URL atau default ke Surah 1 Al-Fatihah
  const qSurah = route.query.surah ? parseInt(route.query.surah as string, 10) : 1
  const qAyat = route.query.ayat ? parseInt(route.query.ayat as string, 10) : undefined

  await loadSurah(isNaN(qSurah) ? 1 : qSurah)

  if (qAyat) {
    await nextTick()
    const el = document.getElementById(`ayat-${qAyat}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  isFiGoNavbarHidden.value = false
})

useSeoMeta({
  title: 'Al-Qur\'an Al-Karim Online — Rasm Utsmani MSI & Audio Syeikh Yasser Al-Dosari',
  description: 'Baca Al-Qur\'an 30 Juz lengkap dengan Rasm Utsmani Mushaf Standar Indonesia (MSI), terjemahan resmi Kemenag RI, ornamen penutup ayat berangka Arab, dan audio gapless Syeikh Yasser Al-Dosari.',
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Scheherazade+New:wght@400;700&display=swap');

.font-arabic {
  font-family: 'Amiri', 'Scheherazade New', 'Traditional Arabic', 'KFGQPC Uthman Taha Naskh', 'Segoe UI', serif;
  font-feature-settings: 'cv01' on, 'cv02' on;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease-out;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>

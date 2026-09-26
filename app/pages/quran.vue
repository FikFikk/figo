<template>
  <div class="min-h-[100dvh] w-full max-w-full overflow-x-clip px-4 pb-44 pt-20 text-slate-800 transition-colors duration-200 sm:px-6 md:px-8 md:pt-24 dark:text-slate-200">
    <div class="mx-auto max-w-7xl">
      <!-- Header Banner & Navigasi Atas -->
      <header class="mb-6 pb-4 border-b border-slate-200/80 dark:border-white/[0.08]">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="space-y-1">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <span class="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Kemenag RI • Rasm Utsmani MSI
            </div>
            <h1 class="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white pt-0.5 flex items-center gap-2">
              <span>Al-Qur'an Al-Karim</span>
              <span class="font-arabic text-xl sm:text-2xl font-normal text-emerald-600 dark:text-emerald-400">القرآن الكريم</span>
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Teks resmi Mushaf Standar Indonesia, terjemahan lengkap Kemenag RI, serta audio murottal Syeikh Yasser Al-Dosari dan qari terkemuka.
            </p>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <!-- Tombol Beranda -->
            <NuxtLink
              to="/"
              class="inline-flex min-h-9 items-center gap-1.5 rounded-2xl border border-slate-200 bg-white/80 px-3 text-xs font-semibold text-slate-700 transition hover:border-emerald-600 hover:text-emerald-800 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:text-emerald-400"
            >
              <span class="material-symbols-outlined text-[16px]">home</span>
              Beranda
            </NuxtLink>

            <!-- Mode Switcher: Mode Baca vs Katalog -->
            <button
              v-if="viewMode === 'reader'"
              type="button"
              class="inline-flex min-h-9 items-center gap-1.5 rounded-2xl bg-emerald-600 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
              @click="viewMode = 'catalog'"
            >
              <span class="material-symbols-outlined text-[16px]">menu_book</span>
              Daftar Surah (114)
            </button>
            <button
              v-else-if="currentSurah"
              type="button"
              class="inline-flex min-h-9 items-center gap-1.5 rounded-2xl bg-emerald-600 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
              @click="viewMode = 'reader'"
            >
              <span class="material-symbols-outlined text-[16px]">auto_stories</span>
              Lanjut Baca Surah {{ currentSurah.namaLatin }}
            </button>
          </div>
        </div>

        <!-- Tab Pemilih Tampilan -->
        <div class="mt-4 flex items-center gap-1 border-t border-slate-100 pt-3 dark:border-slate-800/80">
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition flex items-center gap-1.5"
            :class="viewMode === 'reader'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'"
            @click="viewMode = 'reader'"
          >
            <span class="material-symbols-outlined text-[15px]">auto_stories</span>
            Mode Baca ({{ currentSurah ? currentSurah.namaLatin : 'Al-Fatihah' }})
          </button>
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition flex items-center gap-1.5"
            :class="viewMode === 'catalog' && catalogTab === 'surah'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'"
            @click="openCatalog('surah')"
          >
            <span class="material-symbols-outlined text-[15px]">format_list_numbered</span>
            114 Surah
          </button>
          <button
            type="button"
            class="px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition flex items-center gap-1.5"
            :class="viewMode === 'catalog' && catalogTab === 'juz'
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'"
            @click="openCatalog('juz')"
          >
            <span class="material-symbols-outlined text-[15px]">grid_view</span>
            30 Juz
          </button>
        </div>
      </header>

      <!-- Banner Terakhir Dibaca (Jika ada bookmark tersimpan) -->
      <div
        v-if="lastRead && viewMode === 'catalog'"
        class="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 backdrop-blur-sm dark:bg-emerald-950/20"
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
          class="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700"
          @click="selectSurah(lastRead.surahNumber, lastRead.ayatNumber)"
        >
          <span>Lanjutkan Tilawah</span>
          <span class="material-symbols-outlined text-sm">arrow_forward</span>
        </button>
      </div>

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
          <!-- Banner Hero Informasi Surah Terpilih -->
          <div class="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-6 sm:p-8 dark:border-emerald-500/20 dark:from-emerald-950/30 dark:via-emerald-900/10">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
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
                  <h2 class="text-3xl sm:text-4xl font-serif font-black tracking-tight text-slate-950 dark:text-white">
                    {{ currentSurah.namaLatin }}
                  </h2>
                  <span class="font-arabic text-3xl sm:text-4xl text-emerald-600 dark:text-emerald-400 font-normal">
                    {{ currentSurah.nama }}
                  </span>
                </div>

                <!-- Accordion Deskripsi Makna / Asbabun Nuzul -->
                <div class="pt-2">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300"
                    @click="showDescription = !showDescription"
                  >
                    <span>{{ showDescription ? 'Sembunyikan Keterangan Surah' : 'Baca Pengantar & Makna Surah' }}</span>
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
                  class="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-emerald-600 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-emerald-400"
                  @click="selectSurah(currentSurah.suratSebelumnya.nomor)"
                >
                  <span class="material-symbols-outlined text-sm">arrow_back</span>
                  <span>{{ currentSurah.suratSebelumnya.namaLatin }}</span>
                </button>
                <button
                  v-if="currentSurah.suratSelanjutnya"
                  type="button"
                  class="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:border-emerald-600 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-emerald-400"
                  @click="selectSurah(currentSurah.suratSelanjutnya.nomor)"
                >
                  <span>{{ currentSurah.suratSelanjutnya.namaLatin }}</span>
                  <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Banner Kaligrafi Bismillah (Kecuali Surah At-Taubah no 9 dan Al-Fatihah di mana bismillah adalah ayat 1) -->
          <div
            v-if="currentSurah.nomor !== 9 && currentSurah.nomor !== 1"
            class="my-8 text-center"
          >
            <div class="inline-block rounded-3xl border border-emerald-500/20 bg-white/60 px-8 py-5 shadow-xs backdrop-blur-sm dark:bg-slate-900/60">
              <p class="font-arabic text-2xl sm:text-3xl text-emerald-800 dark:text-emerald-300 leading-loose">
                بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
              </p>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang
              </p>
            </div>
          </div>

          <!-- Daftar Kartu Ayat-Ayat Al-Qur'an -->
          <div class="space-y-4">
            <article
              v-for="item in currentSurah.ayat"
              :id="`ayat-${item.nomorAyat}`"
              :key="item.nomorAyat"
              class="relative rounded-3xl border p-5 sm:p-7 transition-all duration-300"
              :class="playingAyat === item.nomorAyat
                ? 'border-emerald-500 bg-emerald-500/[0.06] ring-2 ring-emerald-500/30 dark:bg-emerald-950/20'
                : 'border-slate-200/90 bg-white/80 hover:border-slate-300 dark:border-white/[0.08] dark:bg-[#0c0e14]/80 dark:hover:border-white/[0.14]'"
            >
              <!-- Baris Aksi Ayat: Nomor, Tombol Audio, Copy, Bookmark -->
              <div class="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-white/[0.06]">
                <div class="flex items-center gap-2">
                  <span class="inline-flex size-9 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {{ currentSurah.nomor }}:{{ item.nomorAyat }}
                  </span>
                  <span v-if="playingAyat === item.nomorAyat" class="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white animate-pulse">
                    <span class="material-symbols-outlined text-xs">volume_up</span>
                    Sedang Diputar
                  </span>
                </div>

                <div class="flex items-center gap-1 sm:gap-1.5">
                  <!-- Putar Audio Ayat Ini -->
                  <button
                    type="button"
                    class="grid size-9 place-items-center rounded-xl transition cursor-pointer"
                    :class="playingAyat === item.nomorAyat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-600 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-emerald-400'"
                    :aria-label="`Putar audio ayat ${item.nomorAyat}`"
                    @click="playAyat(currentSurah.nomor, item.nomorAyat)"
                  >
                    <span class="material-symbols-outlined text-[18px]">
                      {{ playingAyat === item.nomorAyat && isPlaying ? 'pause' : 'play_arrow' }}
                    </span>
                  </button>

                  <!-- Salin Ayat -->
                  <button
                    type="button"
                    class="grid size-9 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-600 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-emerald-400 transition cursor-pointer"
                    :aria-label="`Salin ayat ${item.nomorAyat}`"
                    @click="copyAyat(item)"
                  >
                    <span class="material-symbols-outlined text-[17px]">content_copy</span>
                  </button>

                  <!-- Simpan Bookmark Terakhir Dibaca -->
                  <button
                    type="button"
                    class="grid size-9 place-items-center rounded-xl border transition cursor-pointer"
                    :class="isMarked(item.nomorAyat)
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-600 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-emerald-400'"
                    :aria-label="`Tandai terakhir dibaca ayat ${item.nomorAyat}`"
                    @click="bookmarkAyat(item.nomorAyat)"
                  >
                    <span class="material-symbols-outlined text-[17px]">
                      {{ isMarked(item.nomorAyat) ? 'bookmark_added' : 'bookmark' }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- Teks Arab Kaligrafi Rasm Utsmani MSI Kemenag RI -->
              <div class="mb-4 text-right" dir="rtl">
                <p
                  class="font-arabic font-medium tracking-normal text-slate-950 dark:text-white leading-[2.5] select-text"
                  :style="{ fontSize: `${arabicFontSize}px` }"
                >
                  {{ item.teksArab }}
                  <span class="inline-block px-1 font-arabic text-emerald-600 dark:text-emerald-400 opacity-90 text-[0.85em]">
                    ۝
                  </span>
                </p>
              </div>

              <!-- Transliterasi Latin Fonetik Standar Kemenag -->
              <div v-if="showLatin" class="mb-3">
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

        <!-- TAB 1: Grid 114 Surah -->
        <div v-if="catalogTab === 'surah'">
          <div class="mb-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Menampilkan {{ filteredSurahs.length }} dari 114 Surah</span>
          </div>

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
          <div class="mb-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Daftar 30 Juz Al-Qur'an Lengkap</span>
          </div>

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
    <!-- DOCK BAR AUDIO & KONTROL TAMPILAN (STICKY DOCK) -->
    <!-- ============================================== -->
    <div
      v-if="viewMode === 'reader' && currentSurah"
      class="fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur-xl transition-all duration-200 px-4 py-3 sm:px-6 shadow-2xl"
      :class="isDark ? 'border-white/[0.08] bg-[#08090d]/90 text-slate-100' : 'border-slate-200 bg-white/90 text-slate-900'"
    >
      <div class="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
        <!-- Informasi Status Audio & Tombol Putar Surah Penuh -->
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-emerald-700 active:scale-95 cursor-pointer"
            @click="togglePlaySurah"
          >
            <span class="material-symbols-outlined text-[20px]">
              {{ isPlaying ? 'pause_circle' : 'play_circle' }}
            </span>
            <span>
              {{ isPlaying ? 'Jeda Tilawah' : (playingAyat ? `Lanjut Ayat ${playingAyat}` : `Putar Surah ${currentSurah.namaLatin}`) }}
            </span>
          </button>

          <!-- Waveform Visualizer Saat Audio Berjalan -->
          <div v-if="isPlaying" class="hidden sm:flex items-center gap-0.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500">
            <span class="w-1 h-3 bg-emerald-500 animate-pulse rounded-full" />
            <span class="w-1 h-5 bg-emerald-500 animate-pulse rounded-full delay-75" />
            <span class="w-1 h-2 bg-emerald-500 animate-pulse rounded-full delay-150" />
            <span class="w-1 h-4 bg-emerald-500 animate-pulse rounded-full delay-100" />
            <span class="text-[10px] font-mono font-semibold ml-1.5 text-emerald-600 dark:text-emerald-400">
              Ayat {{ playingAyat }}
            </span>
          </div>
        </div>

        <!-- Pemilih Qari & Pengaturan Font / Terjemahan -->
        <div class="flex items-center gap-2 sm:gap-3">
          <!-- Pemilih Qari (Default Syeikh Yasser Al-Dosari) -->
          <div class="relative">
            <label class="sr-only">Pilih Qari</label>
            <select
              :value="selectedQari"
              class="h-9 rounded-xl border bg-transparent pl-2.5 pr-7 text-xs font-semibold outline-none cursor-pointer transition focus:ring-2 focus:ring-emerald-500"
              :class="isDark ? 'border-white/10 bg-slate-900 text-slate-200' : 'border-slate-200 bg-white text-slate-800'"
              @change="onQariChange(($event.target as HTMLSelectElement).value)"
            >
              <option v-for="qari in QARI_OPTIONS" :key="qari.code" :value="qari.code">
                {{ qari.name }} ({{ qari.role }})
              </option>
            </select>
          </div>

          <!-- Tombol Buka Panel Pengaturan Tampilan -->
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

      <!-- Popover Pengaturan Tampilan -->
      <Transition name="slide-up">
        <div
          v-if="showSettingsPanel"
          class="mx-auto max-w-7xl mt-3 pt-3 border-t border-slate-100 dark:border-white/[0.06] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs"
        >
          <!-- Pengatur Ukuran Huruf Arab -->
          <div class="space-y-1">
            <div class="flex justify-between font-semibold">
              <span>Ukuran Teks Arab:</span>
              <span class="font-mono text-emerald-600 dark:text-emerald-400">{{ arabicFontSize }}px</span>
            </div>
            <input
              v-model.number="arabicFontSize"
              type="range"
              min="22"
              max="44"
              step="2"
              class="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <!-- Toggle Transliterasi Latin -->
          <div class="flex items-center justify-between sm:justify-center gap-3">
            <span class="font-semibold">Transliterasi Latin:</span>
            <button
              type="button"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer"
              :class="showLatin ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'"
              @click="showLatin = !showLatin"
            >
              <span class="inline-block size-4 transform rounded-full bg-white transition-transform" :class="showLatin ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>

          <!-- Toggle Terjemahan Bahasa Indonesia -->
          <div class="flex items-center justify-between sm:justify-end gap-3">
            <span class="font-semibold">Terjemahan Indonesia:</span>
            <button
              type="button"
              class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer"
              :class="showTranslation ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'"
              @click="showTranslation = !showTranslation"
            >
              <span class="inline-block size-4 transform rounded-full bg-white transition-transform" :class="showTranslation ? 'translate-x-6' : 'translate-x-1'" />
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Toast Notifikasi (Salin / Bookmark) -->
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
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuran, QARI_OPTIONS } from '~/composables/useQuran'
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
} = useQuran()

// Mode Tampilan: 'reader' (default baca surah) atau 'catalog' (daftar 114 surah & 30 juz)
const viewMode = ref<'reader' | 'catalog'>('reader')
const catalogTab = ref<'surah' | 'juz'>('surah')
const searchQuery = ref('')
const showDescription = ref(false)
const showSettingsPanel = ref(false)

// Pengaturan Tampilan Ayat
const arabicFontSize = ref(30)
const showLatin = ref(true)
const showTranslation = ref(true)

// Toast Feedback
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

const openCatalog = (tab: 'surah' | 'juz') => {
  catalogTab.value = tab
  viewMode.value = 'catalog'
}

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
  showToast(`Qari diubah: ${QARI_OPTIONS.find((q) => q.code === code)?.name}`)
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

// Otomatis scroll ke ayat yang sedang dibaca agar selalu terlihat nyaman di layar
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

useSeoMeta({
  title: 'Al-Qur\'an Al-Karim Online — Terjemahan Resmi Kemenag RI & Audio Syeikh Yasser Al-Dosari',
  description: 'Baca Al-Qur\'an 30 Juz lengkap dengan Rasm Utsmani Standar Indonesia (MSI), transliterasi Latin, terjemahan resmi Kemenag RI, serta audio murottal merdu Syeikh Yasser Al-Dosari.',
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

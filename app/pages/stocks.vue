<template>
  <div class="pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto min-h-screen font-mono">
    
    <!-- Swiss Header (Tanpa Switch API & Tanpa PIN) -->
    <div class="mb-8 border-b pb-6" :class="isDark ? 'border-neutral-800' : 'border-neutral-200'">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="px-2 py-0.5 text-[9px] font-mono font-bold tracking-[0.2em] uppercase border"
              :class="isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-neutral-100 border-neutral-300 text-neutral-600'"
            >
              MARKET KNOWLEDGE BASE // EQUITIES
            </span>
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <h1 class="text-2xl md:text-3xl font-mono font-black tracking-tight uppercase"
            :class="isDark ? 'text-white' : 'text-neutral-900'"
          >
            Stock Market Intelligence &amp; Academy
          </h1>
          <p class="text-xs font-medium opacity-60 mt-0.5" :class="isDark ? 'text-neutral-400' : 'text-neutral-600'">
            Panduan analisa teknikal institusional, metodologi quant trading, dan ensiklopedia pola chart.
          </p>
        </div>

        <!-- Tombol CTA Masuk ke Terminal Trading Plan -->
        <NuxtLink to="/tradingplan"
          class="flex items-center self-start sm:self-center gap-2 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider transition-all border shrink-0 cursor-pointer shadow-sm hover:scale-105"
          :class="isDark 
            ? 'bg-white text-neutral-950 border-white hover:bg-neutral-200' 
            : 'bg-neutral-950 text-white border-neutral-950 hover:bg-neutral-800'"
        >
          <span class="material-symbols-outlined text-sm">candlestick_chart</span>
          <span>Buka Quant Trading Plan Terminal</span>
          <span class="material-symbols-outlined text-sm">arrow_forward</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Hero Banner CTA Card: Akses Terminal Real-time -->
    <div class="mb-10 p-6 md:p-8 border rounded-2xl relative overflow-hidden transition-all"
      :class="isDark ? 'bg-[#12151c] border-neutral-800 text-white' : 'bg-white border-neutral-300 text-neutral-900 shadow-md'"
    >
      <div class="max-w-2xl relative z-10">
        <div class="flex items-center gap-2 mb-3">
          <span class="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest rounded border"
            :class="isDark ? 'bg-primary/15 text-primary border-primary/30' : 'bg-blue-50 text-primary border-blue-200'"
          >
            SYS.02 // REAL-TIME EXECUTION
          </span>
          <span class="text-[9px] opacity-60 uppercase font-mono tracking-widest">PIN-PROTECTED VAULT</span>
        </div>

        <h2 class="text-xl md:text-2xl font-black uppercase tracking-tight mb-2">
          Real-Time Candlestick Chart &amp; Quant Strategy Engine
        </h2>
        <p class="text-xs md:text-sm leading-relaxed opacity-75 font-sans mb-6">
          Ingin melihat pergerakan live emiten, candlestick interaktif, order-flow Haka/Haki, probabilitas seasonality 10 tahun, dan sinyal eksekusi multi-horizon? Semua fitur pro trading telah dipindahkan ke terminal mandiri yang aman.
        </p>

        <div class="flex flex-wrap items-center gap-3">
          <NuxtLink to="/tradingplan"
            class="px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            :class="isDark 
              ? 'bg-white text-neutral-950 border-white hover:bg-neutral-200' 
              : 'bg-neutral-950 text-white border-neutral-950 hover:bg-neutral-800'"
          >
            <span class="material-symbols-outlined text-sm">bolt</span>
            <span>Masuk ke Trading Plan Page</span>
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </NuxtLink>

          <NuxtLink to="/tradingplan?symbol=BBCA"
            class="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border rounded-lg transition-all opacity-80 hover:opacity-100 flex items-center gap-1.5 cursor-pointer"
            :class="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:border-neutral-500' : 'bg-neutral-50 border-neutral-300 text-neutral-700 hover:bg-neutral-100'"
          >
            <span>Demo: BBCA Plan</span>
          </NuxtLink>

          <NuxtLink to="/tradingplan?symbol=FUTR"
            class="px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider border rounded-lg transition-all opacity-80 hover:opacity-100 flex items-center gap-1.5 cursor-pointer"
            :class="isDark ? 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:border-neutral-500' : 'bg-neutral-50 border-neutral-300 text-neutral-700 hover:bg-neutral-100'"
          >
            <span>Demo: FUTR Scalp</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Watermark Background Decal -->
      <div class="absolute right-4 bottom-4 opacity-5 pointer-events-none select-none hidden lg:block">
        <span class="material-symbols-outlined text-[160px] leading-none">analytics</span>
      </div>
    </div>

    <!-- Section: Penjelasan & Pengertian Konsep Inti Trading Plan -->
    <div class="mb-12 space-y-6">
      <div class="border-b pb-3 flex items-center justify-between" :class="isDark ? 'border-neutral-800' : 'border-neutral-200'">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-base text-primary">menu_book</span>
          <h2 class="text-sm font-bold uppercase tracking-widest" :class="isDark ? 'text-white' : 'text-neutral-900'">
            METODOLOGI &amp; PENGERTIAN 4 PILAR ANALISA PASAR
          </h2>
        </div>
        <span class="text-[9px] opacity-50 uppercase tracking-widest hidden sm:inline">EDUCATIONAL OVERVIEW</span>
      </div>

      <!-- Grid 4 Pilar Konsep Saham -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <!-- Card 1: Scalping -->
        <div class="p-5 border rounded-xl space-y-2.5 transition-all"
          :class="isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-neutral-200 shadow-xs'"
        >
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">bolt</span> HORIZON 01 // SCALPING (1D)
            </span>
            <span class="text-[9px] px-2 py-0.5 border rounded font-bold"
              :class="isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border-emerald-300'"
            >INTRADAY MOMENTUM</span>
          </div>
          <h3 class="text-sm font-black uppercase" :class="isDark ? 'text-white' : 'text-neutral-900'">
            Fast Breakout &amp; Volume Spike (RVol)
          </h3>
          <p class="text-xs leading-relaxed opacity-75 font-sans">
            Gaya trading berkecepatan tinggi yang memanfaatkan lonjakan volume mendadak dan pantulan dari level <em>oversold</em> (Stochastic 5m/15m). 
          </p>
          <div class="text-[10px] p-2.5 border rounded" :class="isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-400' : 'bg-neutral-50 border-neutral-200 text-neutral-600'">
            <strong class="text-neutral-200 dark:text-neutral-100">Mandat Disiplin:</strong> Buka posisi sesi pagi (09:00 - 10:30 WIB) dan wajib tutup posisi sebelum pukul 15:50 WIB. Dilarang menginapkan posisi scalping untuk menghindari risiko gap down overnight.
          </div>
        </div>

        <!-- Card 2: Swing Trading -->
        <div class="p-5 border rounded-xl space-y-2.5 transition-all"
          :class="isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-neutral-200 shadow-xs'"
        >
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-bold uppercase tracking-widest text-blue-500 flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">waves</span> HORIZON 02 // SWING TRADING (1-2W)
            </span>
            <span class="text-[9px] px-2 py-0.5 border rounded font-bold"
              :class="isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-blue-50 text-blue-700 border-blue-300'"
            >TREND FOLLOWING</span>
          </div>
          <h3 class="text-sm font-black uppercase" :class="isDark ? 'text-white' : 'text-neutral-900'">
            Support Pullback &amp; Moving Average Confluence
          </h3>
          <p class="text-xs leading-relaxed opacity-75 font-sans">
            Menunggangi gelombang tren harga yang sedang berlangsung. Entri dilakukan saat harga pullback ke area support dinamis (EMA 12/26 atau SMA 20).
          </p>
          <div class="text-[10px] p-2.5 border rounded" :class="isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-400' : 'bg-neutral-50 border-neutral-200 text-neutral-600'">
            <strong class="text-neutral-200 dark:text-neutral-100">Mandat Disiplin:</strong> Pertahankan posisi selama harga bertahan di atas MA20. Naikkan stop loss secara bertahap (trailing stop) untuk mengunci keuntungan seiring pergerakan tren naik.
          </div>
        </div>

        <!-- Card 3: Value Investing -->
        <div class="p-5 border rounded-xl space-y-2.5 transition-all"
          :class="isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-neutral-200 shadow-xs'"
        >
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-bold uppercase tracking-widest text-purple-500 flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">account_balance</span> HORIZON 03 // VALUE INVESTING (1-3Y)
            </span>
            <span class="text-[9px] px-2 py-0.5 border rounded font-bold"
              :class="isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' : 'bg-purple-50 text-purple-700 border-purple-300'"
            >INTRINSIC VALUE</span>
          </div>
          <h3 class="text-sm font-black uppercase" :class="isDark ? 'text-white' : 'text-neutral-900'">
            Fundamental Valuation &amp; 10Y Seasonality
          </h3>
          <p class="text-xs leading-relaxed opacity-75 font-sans">
            Akumulasi saham perusahaan berfundamental solid hanya ketika valuasi pasar sedang terdiskon di bawah harga wajarnya (Margin of Safety).
          </p>
          <div class="text-[10px] p-2.5 border rounded" :class="isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-400' : 'bg-neutral-50 border-neutral-200 text-neutral-600'">
            <strong class="text-neutral-200 dark:text-neutral-100">Mandat Disiplin:</strong> Lakukan pembelian bertahap dengan model 3-Tier DCA saat musim diskon, serta manfaatkan matriks historis probabilitas bulanan (seasonality) 10 tahun terakhir emiten.
          </div>
        </div>

        <!-- Card 4: Tape Reading & Order Flow -->
        <div class="p-5 border rounded-xl space-y-2.5 transition-all"
          :class="isDark ? 'bg-neutral-900/40 border-neutral-800' : 'bg-white border-neutral-200 shadow-xs'"
        >
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1">
              <span class="material-symbols-outlined text-xs">speed</span> ORDER FLOW // TAPE READING
            </span>
            <span class="text-[9px] px-2 py-0.5 border rounded font-bold"
              :class="isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-300'"
            >HAKA VS HAKI</span>
          </div>
          <h3 class="text-sm font-black uppercase" :class="isDark ? 'text-white' : 'text-neutral-900'">
            Dominasi Hajar Kanan vs Hajar Kiri
          </h3>
          <p class="text-xs leading-relaxed opacity-75 font-sans">
            Menganalisis rasio agresivitas pembeli dan penjual secara langsung dari volume transaksi di pasar:
          </p>
          <div class="text-[10px] p-2.5 border rounded space-y-1" :class="isDark ? 'bg-neutral-950 border-neutral-800 text-neutral-400' : 'bg-neutral-50 border-neutral-200 text-neutral-600'">
            <p><strong class="text-emerald-500">HAKA (&gt;50%):</strong> Pembeli agresif menyikat antrean Offer (menandakan tekanan beli kuat / breakout potensial).</p>
            <p><strong class="text-red-500">HAKI (&gt;50%):</strong> Penjual agresif membuang barang ke antrean Bid (menandakan tekanan jual / distribusi).</p>
          </div>
        </div>

      </div>
    </div>

    <!-- Section: Ensiklopedia Pola Saham (Publik Tanpa PIN) -->
    <div class="mb-12 border rounded-2xl overflow-hidden"
      :class="isDark ? 'bg-[#15171e] border-neutral-800' : 'bg-white border-neutral-300 shadow-sm'"
    >
      <div class="p-5 border-b flex items-center justify-between"
        :class="isDark ? 'border-neutral-800' : 'border-neutral-200'"
      >
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-base text-primary">auto_awesome</span>
          <h2 class="font-mono font-bold text-xs uppercase tracking-widest" :class="isDark ? 'text-white' : 'text-neutral-900'">
            CHART PATTERNS &amp; CANDLESTICK ENCYCLOPEDIA
          </h2>
        </div>
        <span class="text-[9px] opacity-60 uppercase font-mono tracking-widest">AKSES PUBLIK LENGKAP</span>
      </div>
      <div class="p-5">
        <StockPatterns />
      </div>
    </div>

    <!-- Section: Kalender Ekonomi & Edukasi IPO -->
    <div class="space-y-6">
      <StockEconomicCalendar />
      <StockIpo />
    </div>

    <!-- Footer Note -->
    <div class="mt-12 text-center border-t pt-6" :class="isDark ? 'border-neutral-800 text-neutral-600' : 'border-neutral-200 text-neutral-400'">
      <p class="text-[9px] font-mono uppercase tracking-[0.3em]">
        FI-GO FINANCIAL ACADEMY · INSTITUTIONAL KNOWLEDGE BASE
      </p>
    </div>

  </div>
</template>

<script setup lang="ts">
/**
 * Halaman Publik Analisa Saham — Edukasi Pasar, Ensiklopedia Pola & Penjelasan Konsep.
 * Bebas dari PIN, Switch API, maupun Polling Real-time.
 * Pengguna diarahkan ke /tradingplan untuk akses terminal interaktif.
 */
useSeoMeta({
  title: 'Edukasi & Analisa Saham — Ensiklopedia Pola Chart & Metodologi — FiGo',
  ogTitle: 'Stock Market Knowledge Base & Encyclopedia — FiGo',
  description: 'Panduan analisa saham lengkap, ensiklopedia pola candlestick & chart pattern, metodologi scalping, swing trading, value investing, serta kalender ekonomi.',
})

const { isDark } = useColorMode()
</script>

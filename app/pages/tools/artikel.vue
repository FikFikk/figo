<template>
  <div class="max-w-7xl mx-auto p-4 md:p-6 text-slate-800 dark:text-slate-200 min-h-[100dvh] pb-36 pt-20 md:pt-24 transition-colors duration-300">
    
    <!-- Floating Highlight Actions -->
    <Transition name="slide-down">
      <div v-show="showMenu" class="fixed top-24 sm:top-28 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.6)] border border-slate-200 dark:border-slate-700/80 rounded-full px-3 py-2">
         <div class="px-2 hidden sm:block text-xs font-semibold text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700/50 mr-1">Tandai Teks</div>
         <button @click.stop="applyHighlight('yellow')" class="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all group active:scale-95">
           <div class="w-5 h-5 rounded-full bg-amber-400 dark:bg-yellow-500 shadow-[0_0_10px_rgba(251,191,36,0.3)] dark:shadow-[0_0_10px_rgba(234,179,8,0.4)] group-hover:scale-110 transition-transform"></div>
         </button>
         <button @click.stop="applyHighlight('emerald')" class="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all group active:scale-95">
           <div class="w-5 h-5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] dark:shadow-[0_0_10px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-transform"></div>
         </button>
         <button @click.stop="applyHighlight('indigo')" class="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all group active:scale-95">
           <div class="w-5 h-5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)] dark:shadow-[0_0_10px_rgba(99,102,241,0.4)] group-hover:scale-110 transition-transform"></div>
         </button>
         <div class="w-[1px] h-6 bg-slate-200 dark:bg-slate-700/50 mx-1"></div>
         <button @click.stop="removeHighlight" class="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors text-slate-400 hover:text-red-500 dark:hover:text-red-400" title="Hapus Blokir">
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
         </button>
         <button @click.stop="showMenu = false" class="p-2 pl-3 ml-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 border-l border-slate-200 dark:border-slate-700/50 text-[10px] font-bold tracking-widest uppercase">
           Batal
         </button>
      </div>
    </Transition>

    <!-- Header Section -->
    <div class="mb-6 flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-5">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2">Pengetahuan Nusantara</h1>
        <p class="text-xs md:text-sm text-slate-500 dark:text-slate-400">Pusat arsip spiritual dan literatur.</p>
      </div>
      
      <div class="flex items-center gap-2">
        <!-- NEXT / PREV BUTTONS DIBUANG DARI SINI OLEH FIRO -->
        <a href="/" class="text-xs px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1 shadow-sm shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Kembali Utama
        </a>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12"><div class="animate-pulse flex space-x-2"><div class="w-3 h-3 bg-emerald-500 rounded-full"></div><div class="w-3 h-3 bg-emerald-500 rounded-full"></div><div class="w-3 h-3 bg-emerald-500 rounded-full"></div></div></div>

    <!-- LIST GRID ARTIKEL -->
    <div v-else-if="!selectedDoc" class="max-w-5xl mx-auto w-full">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div v-for="doc in paginatedDocuments"  :key="doc.id" @click="openDetail(doc)" class="flex flex-col p-6 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-50 dark:hover:bg-[#181818] hover:border-emerald-500/50 dark:hover:border-emerald-900/50 transition-all shadow-sm hover:shadow-lg dark:hover:shadow-emerald-900/10">
        
        <div class="flex items-center justify-between gap-2 mb-4">
          <span class="px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl">{{ doc.kategori }}</span>
          <button @click.stop="togglePin(doc.id)" class="text-slate-400 hover:text-emerald-500 transition-colors p-1" :class="pinnedIds.includes(doc.id) ? 'text-emerald-600 dark:text-emerald-500' : ''" title="Sematkan">
            <svg v-if="pinnedIds.includes(doc.id)" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
          </button>
        </div>

        <h2 class="text-xl font-medium text-slate-800 dark:text-slate-50 mb-2 leading-snug">{{ doc.judul }}</h2>
        <p class="text-xs font-medium text-slate-500 dark:text-slate-500 mb-4 uppercase tracking-wider">{{ doc.tokoh }}</p>
        <p class="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed flex-grow font-serif">{{ doc.deskripsi }}</p>
        <div class="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex flex-col gap-2">
           <div class="flex justify-between items-center text-xs font-semibold">
              <span v-if="allProgress[doc.id] && allProgress[doc.id].percent > 0" class="text-indigo-500 dark:text-indigo-400">LANJUT BACA ({{ allProgress[doc.id].percent }}%)</span>
              <span v-else class="text-emerald-600 dark:text-emerald-500 transition-colors">BACA MAKNA -></span>
           </div>
           <div v-if="allProgress[doc.id] && allProgress[doc.id].percent > 0" class="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
             <div class="bg-indigo-500 h-full rounded-full transition-all duration-500" :style="`width: ${allProgress[doc.id].percent}%`"></div>
           </div>
        </div>
      </div>
      </div>
      
      
      <!-- SORTING OPTIONS -->
      <div v-if="!selectedDoc" class="max-w-5xl mx-auto w-full flex justify-end mt-8 mb-2">
         <div class="flex items-center gap-2 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm">
            <svg class="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/></svg>
            <select v-model="sortMode" class="text-xs font-semibold bg-transparent text-slate-600 dark:text-slate-300 outline-none cursor-pointer">
               <option value="new_old">Baru ke Lama</option>
               <option value="old_new">Lama ke Baru</option>
               <option value="az">A - Z</option>
               <option value="za">Z - A</option>
            </select>
         </div>
      </div>
      
      <!-- GRID PAGINATION -->

      <div v-if="totalGridPages > 1" class="mt-10 mb-6 flex items-center justify-center gap-2 sm:gap-4">
        <button @click="prevGridPage" :disabled="currentGridPage === 1" class="px-3 sm:px-4 py-2 bg-white dark:bg-[#121212] hover:bg-slate-50 dark:hover:bg-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center shadow-sm">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div class="flex items-center gap-1 sm:gap-2 overflow-x-auto max-w-[60vw] custom-scrollbar px-1 py-1">
          <button 
            v-for="page in totalGridPages" :key="'gpage-'+page"
            @click="currentGridPage = page" 
            class="min-w-[36px] h-9 rounded-xl text-sm font-bold border transition-all shrink-0" 
            :class="page === currentGridPage ? 'bg-emerald-600 dark:bg-emerald-900 border-emerald-500 dark:border-emerald-600 text-white shadow-md' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'"
          >
            {{ page }}
          </button>
        </div>
        <button @click="nextGridPage" :disabled="currentGridPage === totalGridPages" class="px-3 sm:px-4 py-2 bg-white dark:bg-[#121212] hover:bg-slate-50 dark:hover:bg-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center shadow-sm">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>

    <!-- DETAIL VIEW WITH SIDEBAR -->
    <div id="article-top" v-else class="animate-in fade-in zoom-in-95 duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
      
            <!-- MOBILE FAB PENGATURAN KIRI -->
      <button 
        v-if="selectedDoc"
        @click.stop="showMobileSettings = true"
        class="lg:hidden fixed bottom-24 left-5 sm:left-6 z-40 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 p-3.5 rounded-2xl flex items-center justify-center hover:scale-105 transition-transform hover:text-emerald-600 dark:hover:text-emerald-500 font-serif font-bold text-lg leading-none"
      >
        Aa
      </button>
      
<!-- MOBILE FAB -->
      <button 
        v-if="selectedDoc"
        @click.stop="showMobileSidebar = true"
        class="lg:hidden fixed bottom-24 right-5 sm:right-6 z-40 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 p-3.5 rounded-2xl flex items-center justify-center hover:scale-105 transition-transform hover:text-emerald-600 dark:hover:text-emerald-500"
      >
        <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
        <span v-if="docHighlights.length > 0" class="absolute -top-1.5 -right-1.5 bg-emerald-500/90 dark:bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm">{{ docHighlights.length }}</span>
      </button>

            <!-- MOBILE BOTTOM SHEET OVERLAY FOR SETTINGS -->
      <Transition name="fade">
        <div v-if="showMobileSettings" class="lg:hidden fixed inset-0 z-[110] bg-slate-900/60 dark:bg-black/80 flex items-end" @click.self="showMobileSettings = false">
           <div class="bg-white dark:bg-[#121212] w-full rounded-t-3xl p-5 border-t border-slate-200 dark:border-slate-700 shadow-[0_-15px_40px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-5">
              <div class="flex justify-between items-center mb-5 pb-3 border-b border-slate-100 dark:border-slate-800 relative">
                 <div class="absolute left-1/2 -translate-x-1/2 -top-2 w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                 <h3 class="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><svg class="w-5 h-5 text-emerald-600 dark:text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg> Tampilan Baca</h3>
                 <button @click="showMobileSettings = false" class="p-1 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl text-xs font-bold text-slate-600 dark:text-white transition-colors">Tutup</button>
              </div>
              
              <div class="space-y-5 pb-4">
                <div>
                  <label class="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2 block">Ukuran Teks ({{readerSettings.fontSize}}px)</label>
                  <div class="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <button @click="readerSettings.fontSize = Math.max(12, readerSettings.fontSize - 1)" class="w-10 h-10 rounded-lg hover:bg-white dark:hover:bg-slate-700 font-bold text-slate-600 dark:text-slate-300 transition-all">-</button>
                    <input type="range" v-model.number="readerSettings.fontSize" min="12" max="32" class="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer accent-emerald-500">
                    <button @click="readerSettings.fontSize = Math.min(32, readerSettings.fontSize + 1)" class="w-10 h-10 rounded-lg hover:bg-white dark:hover:bg-slate-700 font-bold text-slate-600 dark:text-slate-300 transition-all">+</button>
                  </div>
                </div>
                <div>
                  <label class="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2 block">Font & Perataan</label>
                  <div class="grid grid-cols-2 gap-3 mb-3">
                     <button @click="readerSettings.fontFamily = 'font-serif'" class="py-2.5 rounded-xl text-sm border transition-all" :class="readerSettings.fontFamily==='font-serif' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600'">Serif</button>
                     <button @click="readerSettings.fontFamily = 'font-sans'" class="py-2.5 rounded-xl text-sm border transition-all" :class="readerSettings.fontFamily==='font-sans' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600'">Sans</button>
                  </div>
                  <div class="grid grid-cols-2 gap-3">
                     <button @click="readerSettings.textAlign = 'text-left'" class="py-2.5 rounded-xl border transition-all flex justify-center items-center" :class="readerSettings.textAlign==='text-left' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400'"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
                     <button @click="readerSettings.textAlign = 'text-justify'" class="py-2.5 rounded-xl border transition-all flex justify-center items-center" :class="readerSettings.textAlign==='text-justify' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400'"><svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
                  </div>
                </div>
                <button @click="resetReaderSettings(); showMobileSettings=false;" class="w-full mt-2 py-3 bg-slate-50 dark:bg-[#1a1a1a] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 transition-colors uppercase border border-slate-200 dark:border-slate-800">
                  Kembalikan Bawaan
                </button>
              </div>
           </div>
        </div>
      </Transition>

<!-- MOBILE BOTTOM SHEET OVERLAY FOR SOROTAN -->
      <Transition name="fade">
        <div v-if="showMobileSidebar" class="lg:hidden fixed inset-0 z-[110] bg-slate-900/60 dark:bg-black/80 flex items-end" @click.self="showMobileSidebar = false">
           <div class="bg-white dark:bg-[#121212] w-full max-h-[70vh] rounded-t-3xl p-5 overflow-y-auto border-t border-slate-200 dark:border-slate-700 shadow-[0_-15px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_-15px_40px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-5">
              <div class="flex justify-between items-center mb-5 pb-3 border-b border-slate-100 dark:border-slate-800 relative">
                 <div class="absolute left-1/2 -translate-x-1/2 -top-2 w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                 <h3 class="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><svg class="w-5 h-5 text-emerald-600 dark:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg> Daftar Sorotan ({{docHighlights.length}})</h3>
                 <button @click="showMobileSidebar=false" class="p-1 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl text-xs font-bold text-slate-600 dark:text-white transition-colors">Tutup</button>
              </div>
              <div v-if="docHighlights.length === 0" class="text-xs text-slate-400 dark:text-slate-500 text-center py-10 px-4 leading-relaxed tracking-wide">
                 <svg class="w-8 h-8 mx-auto mb-3 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                 Belum ada sorotan tersimpan.<br><br><span class="font-medium text-slate-500 dark:text-slate-400">Hint:</span> Anda bisa menahan / mengeblok teks pada artikel untuk memunculkan pop-up warna stabilo.
              </div>
              <div class="space-y-3">
                 <div v-for="(h, idx) in docHighlights" :key="'mob-'+idx" @click="jumpToHighlight(h)" class="p-4 bg-slate-50 dark:bg-[#0a0a0a] active:bg-slate-100 dark:active:bg-[#1a1a1a] rounded-2xl border-l-[4px] border-slate-200 dark:border-slate-800 cursor-pointer relative group" :class="{'border-amber-400 dark:border-yellow-500': h.color==='yellow','border-emerald-400 dark:border-emerald-500': h.color==='emerald','border-indigo-400 dark:border-indigo-500': h.color==='indigo'}">
                    <div class="text-[10px] text-slate-400 dark:text-slate-500 mb-2 font-mono uppercase font-semibold flex justify-between items-center">
                       <span>Bab {{ h.page }}</span>
                       <button @click.stop="removeHighlightByObject(h)" class="p-1 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-transparent"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                    </div>
                    <p class="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">"{{ h.text }}"</p>
                 </div>
              </div>
           </div>
        </div>
      </Transition>

      <!-- SIDEBAR DESKTOP -->
      <aside class="hidden lg:block lg:col-span-3 order-1">
        <div class="sticky top-32 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800/80 p-3 rounded-2xl max-h-[75vh] overflow-y-auto custom-scrollbar shadow-sm dark:shadow-lg flex flex-col gap-3">

          <!-- PENGATURAN BACA ACCORDION -->
          <div class="border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-300" :class="activeSidebarTab === 'settings' ? 'bg-slate-50/50 dark:bg-slate-800/20' : 'bg-transparent'">
            <div @click="activeSidebarTab = activeSidebarTab === 'settings' ? null : 'settings'" class="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
              <div class="flex items-center gap-2">
                 <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
                 <h3 class="text-xs font-semibold tracking-wider text-slate-700 dark:text-slate-200 uppercase group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">Tampilan Baca</h3>
              </div>
              <svg class="w-4 h-4 text-slate-400 transition-transform duration-300" :class="activeSidebarTab === 'settings' ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            
            <div v-show="activeSidebarTab === 'settings'" class="px-4 pb-5 pt-1 space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div>
                <label class="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2 block">Ukuran Teks ({{readerSettings.fontSize}}px)</label>
                <div class="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <button @click="readerSettings.fontSize = Math.max(12, readerSettings.fontSize - 1)" class="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-slate-700 font-bold text-slate-600 dark:text-slate-300 shadow-sm transition-all">-</button>
                  <input type="range" v-model.number="readerSettings.fontSize" min="12" max="32" class="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer accent-emerald-500">
                  <button @click="readerSettings.fontSize = Math.min(32, readerSettings.fontSize + 1)" class="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-slate-700 font-bold text-slate-600 dark:text-slate-300 shadow-sm transition-all">+</button>
                </div>
              </div>
              <div>
                <label class="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2 block">Font</label>
                <div class="grid grid-cols-2 gap-2">
                   <button @click="readerSettings.fontFamily = 'font-serif'" class="py-1.5 rounded-xl text-sm border transition-all" :class="readerSettings.fontFamily==='font-serif' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600'">Serif</button>
                   <button @click="readerSettings.fontFamily = 'font-sans'" class="py-1.5 rounded-xl text-sm border transition-all" :class="readerSettings.fontFamily==='font-sans' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600'">Sans</button>
                </div>
              </div>
              <div>
                <label class="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-2 block">Perataan</label>
                <div class="grid grid-cols-2 gap-2">
                   <button @click="readerSettings.textAlign = 'text-left'" class="py-1.5 rounded-xl border transition-all flex justify-center items-center" :class="readerSettings.textAlign==='text-left' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400'"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
                   <button @click="readerSettings.textAlign = 'text-justify'" class="py-1.5 rounded-xl border transition-all flex justify-center items-center" :class="readerSettings.textAlign==='text-justify' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400'"><svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
                </div>
              </div>
              <div class="pt-2 mt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button @click="resetReaderSettings" class="w-full py-2 bg-slate-50 dark:bg-[#1a1a1a] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-[11px] font-bold tracking-wider text-slate-500 dark:text-slate-400 transition-colors uppercase border border-slate-200 dark:border-slate-800">
                  Kembalikan Bawaan
                </button>
              </div>
            </div>
          </div>

          <!-- CATATAN SOROTAN ACCORDION -->
          <div class="border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-300" :class="activeSidebarTab === 'highlights' ? 'bg-slate-50/50 dark:bg-slate-800/20' : 'bg-transparent'">
            <div @click="activeSidebarTab = activeSidebarTab === 'highlights' ? null : 'highlights'" class="flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
              <div class="flex items-center gap-2">
                 <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                 <h3 class="text-xs font-semibold tracking-wider text-slate-700 dark:text-slate-200 uppercase group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">Catatan Sorotan</h3>
              </div>
              <div class="flex items-center gap-2">
                 <span v-if="docHighlights.length > 0" class="flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{{ docHighlights.length }}</span>
                 <svg class="w-4 h-4 text-slate-400 transition-transform duration-300" :class="activeSidebarTab === 'highlights' ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>
            
            <div v-show="activeSidebarTab === 'highlights'" class="px-4 pb-5 pt-1 animate-in fade-in zoom-in-95 duration-200">
              <div v-if="docHighlights.length === 0" class="text-xs text-slate-400 dark:text-slate-500 text-center py-8 px-4 leading-relaxed tracking-wide">
                 <svg class="w-8 h-8 mx-auto mb-3 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                 Belum ada sorotan tersimpan.<br><br><span class="font-medium text-slate-500 dark:text-slate-400">Hint:</span> Sorot / blok teks di sebelah kanan untuk memunculkan opsi stabilo penanda bacaan.
              </div>
              <div class="space-y-3">
                 <div v-for="(h, idx) in docHighlights" :key="idx" @click="jumpToHighlight(h)" class="p-3 bg-slate-50 dark:bg-[#0a0a0a] hover:bg-slate-100 dark:hover:bg-[#1a1a1a] rounded-2xl border-l-[4px] border-slate-200 dark:border-slate-800 cursor-pointer transition-colors group relative" :class="{'border-amber-400 dark:border-yellow-500': h.color==='yellow','border-emerald-400 dark:border-emerald-500': h.color==='emerald','border-indigo-400 dark:border-indigo-500': h.color==='indigo'}">
                    <div class="text-[10px] text-slate-400 dark:text-slate-500 mb-1.5 font-mono uppercase font-semibold">Bab {{ h.page }}</div>
                    <p class="text-[12px] text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">"{{ h.text }}"</p>
                    <button @click.stop="removeHighlightByObject(h)" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-1 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-200 dark:border-transparent rounded-full transition-opacity"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </aside>

      <!-- READER ARCHITECTURE -->
      <div class="lg:col-span-9 order-2">
        <div class="flex justify-between items-center mb-6">
          <button @click="closeDetail" class="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#121212] hover:bg-slate-50 dark:hover:bg-[#1a1a1a] rounded-2xl border border-slate-200 dark:border-slate-800 transition-all shadow-sm shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg> Tutup Pustaka
          </button>
          
          <!-- DI SINI TOMBOL ARROW NYA -->
          <div class="flex items-center gap-2 shrink-0">
            <button @click="prevPage" :disabled="currentPage===1" class="p-2.5 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white shadow-sm" title="Halaman Sebelumnya">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button @click="nextPage" :disabled="currentPage===totalPages" class="p-2.5 bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed transition text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white shadow-sm" title="Halaman Selanjutnya">
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>

        <!-- Header Artikel -->
        <div class="mb-6 pb-5 border-b border-slate-200 dark:border-slate-800/80">
          <h1 class="text-3xl md:text-3xl font-bold mb-4 text-slate-900 dark:text-white leading-tight font-serif tracking-tight">{{ selectedDoc.data?.buku_referensi || selectedDoc.judul }}</h1>
          <div class="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
            <span class="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"><svg class="w-4 h-4 text-emerald-600 dark:text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path></svg> {{ selectedDoc.data?.kategori_akademik || selectedDoc.kategori }}</span>
            <span v-if="selectedDoc.data?.author" class="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"><svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg> {{ selectedDoc.data.author }}</span>
            <span v-if="selectedDoc.data?.tanggal_posting" class="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800"><svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> {{ selectedDoc.data.tanggal_posting }}</span>
          </div>
        </div>

        <!-- Halaman Konten -->
        <div id="baca-top" v-if="currentBab" :key="currentPage" class="bg-[#FDFCF8] dark:bg-[#1C1C1E] border border-[#F2F0E9] dark:border-slate-800/60 p-6 md:p-10 rounded-2xl min-h-[50vh] shadow-sm dark:shadow-xl animate-in fade-in duration-300 relative z-10">
          <div class="flex flex-wrap items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800/50 pb-5">
            <span class="px-3.5 py-1 text-[11px] font-bold tracking-widest bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-500 rounded-lg border border-emerald-100 dark:border-emerald-900/30">BAGIAN {{ currentPage }} / {{ totalPages }}</span>
            <h3 class="text-2xl md:text-3xl font-semibold text-slate-800 dark:text-slate-100 leading-snug font-serif">{{ currentBab.nama_wahyu || currentBab.tema_utama || currentBab.id_bab }}</h3>
          </div>
          <div v-if="currentBab.teori_akademik" class="mb-8 text-sm md:text-base text-emerald-600 dark:text-emerald-400/90 font-medium tracking-wide">>> {{ currentBab.teori_akademik }}</div>
          
          <div :class="[readerSettings.fontFamily, readerSettings.textAlign]" :style="{ fontSize: readerSettings.fontSize + 'px' }" class="text-[#333333] dark:text-[#D4D4D8] leading-[1.85] mb-8 space-y-7 max-w-3xl mx-auto selection:bg-emerald-100 dark:selection:bg-slate-700/50 selection:text-slate-900 dark:selection:text-white relative z-0 transition-all duration-300">
            <!-- Render Paragraf -->
            <p v-for="(par, pIdx) in getParagraphs(currentBab.penjabaran_detail || currentBab.deskripsi)" :key="pIdx" :data-pidx="pIdx" class="break-words" v-html="renderParagraph(par, pIdx)"></p>
          </div>
        </div>

        <!-- Pagination Bawah Baru (Gaya 1 ... 28 29 30 31 32 ... 34) -->
        <div class="my-8 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/80 pt-6 pb-12">
          <button @click="prevPage" :disabled="currentPage===1" class="px-5 py-2.5 bg-white dark:bg-[#121212] hover:bg-slate-50 dark:hover:bg-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-semibold text-slate-700 dark:text-slate-300 transition-all flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg><span class="hidden sm:inline">Sebelumnya</span>
          </button>
          
          <div class="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 justify-center flex-wrap">
            <template v-for="(item, idx) in paginationDots" :key="idx">
              <span v-if="item === '...'" class="text-slate-400 dark:text-slate-600 px-1 font-bold text-sm tracking-widest">...</span>
              <button 
                v-else
                @click="goToPage(item)" 
                class="w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-bold border transition-all" 
                :class="item === currentPage ? 'bg-emerald-600 dark:bg-emerald-900 border-emerald-500 dark:border-emerald-600 text-white shadow-md' : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'"
              >
                {{ item }}
              </button>

</template>
          </div>

          <button @click="nextPage" :disabled="currentPage===totalPages" class="px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 disabled:opacity-30 disabled:cursor-not-allowed border border-emerald-200 dark:border-emerald-900/50 rounded-2xl text-sm font-semibold transition-all flex items-center gap-2">
            <span class="hidden sm:inline">Selanjutnya</span><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

      </div>
    </div>
  </div>

    

</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const selectedDoc = ref(null)
const currentPage = ref(1)
const currentGridPage = ref(1)
const gridItemsPerPage = 9


const highlights = ref([])
const showMenu = ref(false)
const currentSelectionData = ref(null)
const showMobileSidebar = ref(false)
const showMobileSettings = ref(false)
const activeSidebarTab = ref('highlights')


const pinnedIds = ref([])
const sortMode = ref('new_old')

const togglePin = (id) => {
  if (pinnedIds.value.includes(id)) {
    pinnedIds.value = pinnedIds.value.filter(i => i !== id)
  } else {
    pinnedIds.value.push(id)
  }
  localStorage.setItem('figo_pinned_articles', JSON.stringify(pinnedIds.value))
}

watch(sortMode, (val) => {
  localStorage.setItem('figo_art_sort', val)
  currentGridPage.value = 1
})

const sortedDocuments = computed(() => {
  let docs = [...documents.value]
  if (sortMode.value === 'old_new') docs.reverse()
  else if (sortMode.value === 'az') docs.sort((a,b) => a.judul.localeCompare(b.judul))
  else if (sortMode.value === 'za') docs.sort((a,b) => b.judul.localeCompare(a.judul))
  
  // Pin always on top
  docs.sort((a, b) => {
    const aPin = pinnedIds.value.includes(a.id) ? 1 : 0
    const bPin = pinnedIds.value.includes(b.id) ? 1 : 0
    return bPin - aPin
  })
  return docs
})

const totalGridPages = computed(() => Math.ceil(sortedDocuments.value.length / gridItemsPerPage))
const paginatedDocuments = computed(() => {
  const start = (currentGridPage.value - 1) * gridItemsPerPage
  return sortedDocuments.value.slice(start, start + gridItemsPerPage)
})
const nextGridPage = () => {
  if (currentGridPage.value < totalGridPages.value) {
    currentGridPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
const prevGridPage = () => {
  if (currentGridPage.value > 1) {
    currentGridPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const allProgress = ref({}) // map of docId -> progress

// REactive Setting
const readerSettings = ref({
  fontSize: 18,
  fontFamily: 'font-serif',
  textAlign: 'text-left sm:text-justify'
})


const resetReaderSettings = () => {
  readerSettings.value = {
    fontSize: 18,
    fontFamily: 'font-serif',
    textAlign: 'text-left sm:text-justify'
  }
}

watch(readerSettings, (val) => {
  localStorage.setItem('figo_reader_settings', JSON.stringify(val))
}, { deep: true })




const documents = ref([
  {
    id: 'serat_sastra_gending',
    judul: 'Serat Sastra Gending - Sultan Agung',
    tokoh: 'SULTAN AGUNG HANYOKROKUSUMO',
    kategori: 'Filsafat & Sastra',
    tags: ['Filsafat Islam-Jawa', 'Mistik Dewaruci'],
    deskripsi: 'Sastra Gending adalah mahakarya susastra dan filsafat karangan Sultan Agung. Mengajarkan harmoni rasio (sastra) dan rasa mistis (gending).',
    url: '/dataset/serat_sastra_gending.json',
    data: null
  },
  {
    id: 'serat_paramayoga',
    judul: 'Serat Paramayoga (Kisah Babad & Mitos Leluhur Jawa)',
    tokoh: 'RADEN NGABEHI RANGGAWARSITA',
    kategori: 'Babad & Sejarah',
    tags: ['Sastra Epik', 'Sinkretisme', 'Mitologi Jawi'],
    deskripsi: 'Menyambungkan silisih nabi-nabi Islam ke Dewa-Dewa Hindu & Leluhur Raja Jawa untuk fungsi kultural resolusi spiritual.',
    url: '/dataset/serat_paramayoga.json',
    data: null
  },
  {
    id: 'suluk_dewa_ruci',
    judul: 'Album Kisah Dewa Ruci Lengkap (Suluk & Makna)',
    tokoh: 'EMPU PRAPANCA / YASADIPURA I & SUNAN KA&hellip;',
    kategori: 'Suluk & Tasawuf',
    tags: ['Sufisme Makrokosmos', 'Ekspedisi Batin'],
    deskripsi: 'Prabu Duryudana di Kerajaan Hastina dihadap Resi Druna dari Sokalima, Adipati Karna dari Awangga, Patih Sangkuni dari P&hellip;',
    url: '/dataset/suluk_dewa_ruci.json',
    data: null
  },
  {
    id: 'artikel_guru_sejati',
    judul: 'Artikel Lengkap: Guru Sejati & Sangkan Paraning Dumadi',
    tokoh: 'BLASDOR (BLOGSPOT ARCHIVE 2015)',
    kategori: 'Artikel Kajian',
    tags: ['Artikel Esoterik', 'Spiritual Hakikat (Naskah Penuh)'],
    deskripsi: 'PENDAHULUAN  Buku ini, isinya bukan merupakan pedoman atau patokan mati. Artinya, siapapun yang berminat, mencapai keba&hellip;',
    url: '/dataset/artikel_guru_sejati.json',
    data: null
  },
  {
    id: 'babad_tanah_jawi',
    judul: 'Babad Tanah Jawi',
    tokoh: 'BERBAGAI PUJANGGA, DISEMPURNAKAN YASADI&hellip;',
    kategori: 'Babad & Sejarah',
    tags: ['Historiografi Tradisional', 'Mitos Silsilah'],
    deskripsi: 'Babad Tanah Jawi menautkan TIGA akar nasab besar untuk melegitimasi raja-raja Mataram Islam: Pertama, garis Nabi-nabi (&hellip;',
    url: '/dataset/babad_tanah_jawi.json',
    data: null
  },
  {
    id: 'suluk_syahadat',
    judul: 'Bedah Suluk Syahadat Panetep Panatagama',
    tokoh: 'ANONIM',
    kategori: 'Suluk & Tasawuf',
    tags: ['Sejarah Tasawuf Jawa'],
    deskripsi: '**SYAHADAT PANETEP PANATAGAMA** *(Mantera Spiritual & Makna Suluk Jawa Murni)*  Dalam lanskap spiritual tasawuf Jawa ku&hellip;',
    url: '/dataset/suluk_syahadat.json',
    data: null
  },
  {
    id: 'biografi_romo_semono',
    judul: 'BIOGRAFI ROMO HERUCOKRO SEMONO',
    tokoh: 'PAGUYUBAN KAPRIBADEN',
    kategori: 'Artikel Kajian',
    tags: ['Sejarah', 'Biografi'],
    deskripsi: '[IMAGE_ASSET: https://www.kapribaden.org/images/Romo%20Herucokro%20Semono.JPG]   Romo M. Semono Sastrohadidjojo  ( Romo&hellip;',
    url: '/dataset/biografi_romo_semono.json',
    data: null
  },
  {
    id: 'kapribaden_buku_hidup_bahagia',
    judul: 'Buku Hidup Bahagia (Ajaran R. Herucokro Semono)',
    tokoh: 'DR. WAHYONO RAHARJO GSW',
    kategori: 'Artikel Kajian',
    tags: ['Artikel Hakikat Kapribaden'],
    deskripsi: 'HIDUP BAHAGIA  YANG DIAKHIRI DENGAN MENCAPAI  KASAMPURNAN JATI   Oleh :     Dr. Wahyono Raharjo GSW., MBA   PENDAHULUAN&hellip;',
    url: '/dataset/kapribaden_buku_hidup_bahagia.json',
    data: null
  },
  {
    id: 'wahyu_panca_gaib',
    judul: 'Buku Pedoman Kapribaden, Laku Spiritual Wahyu Panca Gaib',
    tokoh: 'ROMO HERUCOKRO SEMONO (1955)',
    kategori: 'Artikel Kajian',
    tags: ['Aliran Kepercayaan (Penghayat)', 'Kebatinan Jawa'],
    deskripsi: 'Kunci adalah doa pembuka benteng hati. Makna akademis dari teks ini adalah pengakuan atas hilangnya batas antara manusi&hellip;',
    url: '/dataset/wahyu_panca_gaib.json',
    data: null
  },
  {
    id: 'jangka_jayabaya',
    judul: 'Jangka Jayabaya',
    tokoh: 'PRABU JAYABAYA / ANONIM',
    kategori: 'Babad & Sejarah',
    tags: ['Eskatologi', 'Messianisme Jawa'],
    deskripsi: 'Ramalan spesifik menyebutkan masuknya \'orang kulit putih\' membawa tongkat yang memuntahkan petir (Belanda), yang akan&hellip;',
    url: '/dataset/jangka_jayabaya.json',
    data: null
  },
  {
    id: 'kajian_syariat_makrifat_kejawen',
    judul: 'Kajian Catur Sembah, Sangkan Paraning Dumadi & Tasawuf Filosofis',
    tokoh: 'MANGKUNEGARA IV, SUNAN KALIJAGA & TOKOH&hellip;',
    kategori: 'Artikel Kajian',
    tags: ['Artikel Esoterik', 'Spiritual Hakikat', 'Tasawuf'],
    deskripsi: 'Dalam tradisi mistisisme Islam (Tasawuf) dan spiritualitas Jawa (Kejawen), perjalanan roh manusia kembali kepada Sang P&hellip;',
    url: '/dataset/kajian_syariat_makrifat_kejawen.json',
    data: null
  },
  {
    id: 'kapribaden_itu_apa',
    judul: 'KAPRIBADEN itu apa?',
    tokoh: 'PAGUYUBAN KAPRIBADEN',
    kategori: 'Artikel Kajian',
    tags: ['Artikel Pengenalan Kapribaden'],
    deskripsi: 'KAPRIBADEN itu apa  ?     Kapribaden di sini tidak sama dengan istilah umum Kepribadian yang dalam ilmu psikologi diseb&hellip;',
    url: '/dataset/kapribaden_itu_apa.json',
    data: null
  },
  {
    id: 'kapribaden_wulang_wuruk',
    judul: 'KEKUDHANGAN ROMO HERUCOKRO SEMONO',
    tokoh: 'ROMO HERUCOKRO SEMONO',
    kategori: 'Artikel Kajian',
    tags: ['Wulang Wuruk'],
    deskripsi: 'KEKUDHANGAN  ROMO HERUCOKRO SEMONO    “ Heh PutraningSUN sami, pro satriyo lan wanito sejati,  mareneo jenengsiro SUN j&hellip;',
    url: '/dataset/kapribaden_wulang_wuruk.json',
    data: null
  },
  {
    id: 'kapribaden_sabdho',
    judul: 'SABDHO HONOCOROKO',
    tokoh: 'ROMO HERUCOKRO SEMONO',
    kategori: 'Artikel Kajian',
    tags: ['Ajaran', 'Sabdho'],
    deskripsi: 'SABDHO HONOCOROKO  DAN  PENJELASAN TENTANG KEBERADAAN KAPRIBADEN    Sabdho Honocoroko, tanggal 29 April 1978 di Sejiwan&hellip;',
    url: '/dataset/kapribaden_sabdho.json',
    data: null
  },
  {
    id: 'sejarah_kapribaden',
    judul: 'SEJARAH KAPRIBADEN',
    tokoh: 'PAGUYUBAN KAPRIBADEN',
    kategori: 'Babad & Sejarah',
    tags: ['Artikel Sejarah Kapribaden'],
    deskripsi: 'SEJARAH KAPRIBADEN   Pada tanggal 29 April 1978, dihadapan 5 orang Putro, Romo menerbitkan satu-satunya Sabdo Tinulis, &hellip;',
    url: '/dataset/sejarah_kapribaden.json',
    data: null
  },
  {
    id: 'serat_cabolek',
    judul: 'Serat Cabolek',
    tokoh: 'RADEN NGABEHI YASADIPURA I',
    kategori: 'Suluk & Tasawuf',
    tags: ['Sejarah Hukum', 'Hakikat Tasawuf'],
    deskripsi: 'Buku ini mengisahkan tokoh Haji Mutamakin (Syekh Mutamakin) dari Desa Cabolek, Tuban (kemudian menetap di Kajen, Pati).&hellip;',
    url: '/dataset/serat_cabolek.json',
    data: null
  },
  {
    id: 'serat_centhini',
    judul: 'Serat Centhini (Suluk Tambanglaras) Lengkap',
    tokoh: 'TIM KGPAA AMENGKUNEGARA III (PAKUBUWANA&hellip;',
    kategori: 'Filsafat & Sastra',
    tags: ['Ensiklopedia Kebudayaan Jawa', 'Tasawuf'],
    deskripsi: 'Kisah dimulai paska penaklukan keraton Giri oleh Pangeran Pekik (atas perintah Sultan Agung Mataram). Tiga putra Sunan &hellip;',
    url: '/dataset/serat_centhini.json',
    data: null
  },
  {
    id: 'serat_darmagandhul',
    judul: 'Serat Darmagandhul',
    tokoh: 'KYAI KALAMWADI (ANONIM)',
    kategori: 'Filsafat & Sastra',
    tags: ['Sastra Kritis', 'Narasi Tandingan Zaman Transisi'],
    deskripsi: 'Serat Darmagandhul adalah teks yang sangat kontroversial. Berbentuk dialog antara Ki Kalamwadi dan muridnya, Darmagandh&hellip;',
    url: '/dataset/serat_darmagandhul.json',
    data: null
  },
  {
    id: 'serat_kalatidha',
    judul: 'Serat Kalatidha & Ajaran Seh Amongraga',
    tokoh: 'R.NG. RANGGAWARSITA, PAKUBUWANA V',
    kategori: 'Filsafat & Sastra',
    tags: ['Sosiologi Spiritual', 'Zaman Edan'],
    deskripsi: 'Serat Kalatidha (Kala = Waktu, Tidha = Gelap/Ragu) adalah bait puisi Ranggawarsita yang paling melegenda. Baitnya berbu&hellip;',
    url: '/dataset/serat_kalatidha.json',
    data: null
  },
  {
    id: 'serat_nitisruti',
    judul: 'Serat Nitisruti & Nitipraja',
    tokoh: 'PANGERAN KARANGGAYAM (PAJANG)',
    kategori: 'Filsafat & Sastra',
    tags: ['Manajemen Birokrasi', 'Etika Politik'],
    deskripsi: 'Nitisruti berisi larangan keras menjadi pemimpin yang bereaksi instingtif (tindak-tanduk grusa-grusu). Pejabat diharusk&hellip;',
    url: '/dataset/serat_nitisruti.json',
    data: null
  },
  {
    id: 'serat_tripama',
    judul: 'Serat Tripama',
    tokoh: 'KGPAA MANGKUNEGARA IV',
    kategori: 'Filsafat & Sastra',
    tags: ['Sastra Keprajuritan (Nasionalisme', 'Etika Ksatria)'],
    deskripsi: 'Serat Tripama (Tiga Teladan) ditulis oleh KGPAA Mangkunegara IV untuk membangkitkan etos keprajuritan. Terdiri dari tuj&hellip;',
    url: '/dataset/serat_tripama.json',
    data: null
  },
  {
    id: 'serat_wedhatama',
    judul: 'Serat Wedhatama Lengkap (Naskah Asli & Kajian)',
    tokoh: 'KGPAA MANGKUNEGARA IV',
    kategori: 'Filsafat & Sastra',
    tags: ['Literatur Klasik', 'Etika Spiritual'],
    deskripsi: '[IMAGE_ASSET: https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiiBbI7wZKaFuqj-MM4IHWPRK55RvCf_yGHptnN7NrZuYVw&hellip;',
    url: '/dataset/serat_wedhatama.json',
    data: null
  },
  {
    id: 'serat_wirid_hidayat_jati',
    judul: 'Serat Wirid Hidayat Jati',
    tokoh: 'R.NG. RANGGAWARSITA',
    kategori: 'Suluk & Tasawuf',
    tags: ['Metafisika Martabat Pitu (Tujuh Alam)'],
    deskripsi: 'Serat Wirid Hidayat Jati yang ditulis oleh Kanjeng Raden Ngabehi (R.Ng.) Ranggawarsita (Pujangga terakhir Keraton Surak&hellip;',
    url: '/dataset/serat_wirid_hidayat_jati.json',
    data: null
  },
  {
    id: 'serat_wulangreh',
    judul: 'Serat Wulangreh',
    tokoh: 'SRI SUSUHUNAN PAKUBUWANA IV',
    kategori: 'Filsafat & Sastra',
    tags: ['Sastra Piwulang (Filsafat Etika', 'Budi Pekerti)'],
    deskripsi: 'Kinanthi (Sajak 1)  Padha gulangen ing kalbu, ing sasmita amrih lantip, aja pijer mangan nendra, kaprawiran den kaesthi&hellip;',
    url: '/dataset/serat_wulangreh.json',
    data: null
  },
  {
    id: 'suluk_agus_sunyoto_deep',
    judul: 'Suluk Abdul Jalil (Karya Agus Sunyoto)',
    tokoh: 'AGUS SUNYOTO',
    kategori: 'Suluk & Tasawuf',
    tags: ['Suluk'],
    deskripsi: 'Buku dibuka dengan pembedahan mitos bahwa Siti Jenar berasal dari cacing yang mendengarkan wejangan Sunan Bonang kepada&hellip;',
    url: '/dataset/suluk_agus_sunyoto_deep.json',
    data: null
  },
  {
    id: 'suluk_gatholoco',
    judul: 'Suluk Gatholoco',
    tokoh: 'ANONIM',
    kategori: 'Suluk & Tasawuf',
    tags: ['Satir Tasawuf', 'Metafora Esoterik'],
    deskripsi: 'Tokoh utamanya, Gatholoco (yang metaforanya merupakan phallus/alat kelamin), digambarkan sangat lusuh dan menjijikkan b&hellip;',
    url: '/dataset/suluk_gatholoco.json',
    data: null
  },
  {
    id: 'suluk_linglung',
    judul: 'Suluk Linglung',
    tokoh: 'SUNAN KALIJAGA',
    kategori: 'Suluk & Tasawuf',
    tags: ['Sastra Salik', 'Tarekat Jawa'],
    deskripsi: 'Raden Sahid, putra Adipati Tuban, bertobat dari kehidupan merampoknya setelah dicegah oleh Sunan Bonang. Ia diperintahk&hellip;',
    url: '/dataset/suluk_linglung.json',
    data: null
  },
  {
    id: 'suluk_wujil',
    judul: 'Suluk Wujil (Makna Ibadah Hakiki)',
    tokoh: 'SUNAN BONANG & WUJIL',
    kategori: 'Suluk & Tasawuf',
    tags: ['Kritik Ritual Kosong', 'Falsafah Syahadat'],
    deskripsi: 'Suluk Wujil ditulis dalam wujud tembang macapat Macapat. Suluk ini sangat terkenal karena memuat wejangan dari Sunan Bo&hellip;',
    url: '/dataset/suluk_wujil.json',
    data: null
  }
])

const initialDocId = route.query.id
const initialDocVal = documents.value.find(d => d.id === initialDocId)
if (initialDocVal && !selectedDoc.value) {
    selectedDoc.value = initialDocVal
}

useSeoMeta({
  title: () => selectedDoc.value ? `${selectedDoc.value.judul} - Pengetahuan Nusantara FiGo` : 'Pengetahuan Nusantara - Arsip Spiritual & Literatur FiGo',
  description: () => selectedDoc.value ? selectedDoc.value.deskripsi : 'Pusat arsip spiritual, literatur Kejawen, Tasawuf, dan peninggalan Nusantara.',
  ogTitle: () => selectedDoc.value ? `${selectedDoc.value.judul} - Pengetahuan Nusantara FiGo` : 'Pengetahuan Nusantara FiGo',
  ogDescription: () => selectedDoc.value ? selectedDoc.value.deskripsi : 'Pusat arsip spiritual dan literatur Nusantara bebas akses.',
  twitterTitle: () => selectedDoc.value ? `${selectedDoc.value.judul}` : 'Pengetahuan Nusantara FiGo',
  twitterDescription: () => selectedDoc.value ? selectedDoc.value.deskripsi : 'Pusat arsip spiritual dan literatur.',
  twitterCard: 'summary_large_image'
})






// Removed modal state - relying entirely on card tracking
const loadProgressData = () => {
  const cachedProg = localStorage.getItem('figo_article_progress_map')
  if (cachedProg) {
    try { allProgress.value = JSON.parse(cachedProg) } catch(e) {}
  }
}

let scrollTimeout = null
const calculateAndSaveProgress = () => {
  if (!selectedDoc.value) return
  if (scrollTimeout) return
  
  scrollTimeout = setTimeout(() => {
    const doc = selectedDoc.value
    if (!doc || !doc.judul) {
      scrollTimeout = null
      return
    }
    
    // Calculate vertical scroll on current page
    const scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
    const docHeight = scrollHeight - window.innerHeight
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0
    
    let scrollFraction = 0
    if (docHeight > 20) {
      scrollFraction = Math.max(0, Math.min(1, scrollY / docHeight))
    } else {
      // Prevent 100% bug on initial mounting when height hasn't expanded yet
      scrollFraction = scrollY > 10 ? 1 : 0
    }
    
    const page = currentPage.value
    const total = (doc.data && doc.data.arsip_pengetahuan) ? doc.data.arsip_pengetahuan.length : 1
    
    // Progress formula: (Completed Pages + Current Page Scroll) / Total Pages
    const completedPages = page - 1
    let percent = Math.floor(((completedPages + scrollFraction) / total) * 100)
    
    if (percent > 100) percent = 100
    // Optional: Avoid 100% just from mounting if they haven't explicitly finished it
    // Actually, formula handles this dynamically based on scroll

    const progObj = {
      docId: doc.id,
      docTitle: doc.judul,
      page: page,
      percent: percent,
      timestamp: Date.now()
    }
    
    allProgress.value[doc.id] = progObj
    localStorage.setItem('figo_article_progress_map', JSON.stringify(allProgress.value))
    
    scrollTimeout = null
  }, 250) // quick debounce for smooth 5% tracking responses
}

// Track page changes
watch([currentPage, selectedDoc], () => {
  // Wait 600ms for Nuxt/Vue page transitions to fully finish so height isn't 0
  setTimeout(calculateAndSaveProgress, 600) 
}, { deep: true })

onMounted(async () => {

  const lPin = localStorage.getItem('figo_pinned_articles')
  if (lPin) pinnedIds.value = JSON.parse(lPin)
  const sm = localStorage.getItem('figo_art_sort')
  if (sm) sortMode.value = sm

  
  const cachedSettings = localStorage.getItem('figo_reader_settings')
  if (cachedSettings) {
    try { readerSettings.value = JSON.parse(cachedSettings) } catch(e) {}
  }

  loadProgressData()
  window.addEventListener('scroll', calculateAndSaveProgress)

  document.addEventListener('selectionchange', handleTextSelection)
  document.addEventListener('mouseup', handleTextSelection)
  document.addEventListener('touchend', handleTextSelection)
  const cached = localStorage.getItem('figo_article_highlights')
  if (cached) {
    try {
      highlights.value = JSON.parse(cached)
    } catch(e) {}
  }
  if (route.query.id) {
    const doc = documents.value.find(d => d.id === route.query.id)
    if (doc) {
      await openDetail(doc, false) 
      if (route.query.page) currentPage.value = parseInt(route.query.page) || 1
    }
  }
})

watch([selectedDoc, currentPage], ([newDoc, newPage]) => {
  if (newDoc) router.replace({ query: { id: newDoc.id, page: newPage } })
  else router.replace({ query: {} })
})


onUnmounted(() => {

  document.removeEventListener('selectionchange', handleTextSelection)
  document.removeEventListener('mouseup', handleTextSelection)
  document.removeEventListener('touchend', handleTextSelection)
})

const docHighlights = computed(() => {
  if (!selectedDoc.value) return []
  return highlights.value.filter(h => h.docId === selectedDoc.value.id)
})

const colorMap = {
  yellow: "bg-amber-100 dark:bg-yellow-500/30 text-amber-900 dark:text-yellow-200 border-b-2 border-amber-400 dark:border-b dark:border-yellow-500/80",
  emerald: "bg-emerald-100 dark:bg-emerald-500/30 text-emerald-900 dark:text-emerald-200 border-b-2 border-emerald-400 dark:border-b dark:border-emerald-500/80",
  indigo: "bg-indigo-100 dark:bg-indigo-500/30 text-indigo-900 dark:text-indigo-200 border-b-2 border-indigo-400 dark:border-b dark:border-indigo-500/80",
}

const handleTextSelection = (e) => {
  if (e && e.target && typeof e.target.closest === 'function') {
      if (e.target.closest('button') || e.target.closest('.fixed') || e.target.closest('aside') || e.target.closest('mark')) return
  }
  if (window.highlightTimeout) clearTimeout(window.highlightTimeout)
  window.highlightTimeout = setTimeout(() => {
    const sel = window.getSelection()
    if(!sel || sel.isCollapsed) { showMenu.value=false; return; }
    let text = sel.toString().trim()
    text = text.replace(/[\n\r]+/g, " ").replace(/\s+/g, ' ').trim()
    const anchor = sel.anchorNode
    const focus = sel.focusNode
    const pElement = (anchor && anchor.parentElement && typeof anchor.parentElement.closest === 'function' ? anchor.parentElement.closest('p[data-pidx]') : null) 
                  || (focus && focus.parentElement && typeof focus.parentElement.closest === 'function' ? focus.parentElement.closest('p[data-pidx]') : null)
    const pIdx = pElement ? parseInt(pElement.getAttribute('data-pidx')) : -1

    if (text.length > 2 && selectedDoc.value) {
      currentSelectionData.value = { text, pIdx }
      showMenu.value = true
    } else {
      showMenu.value = false
    }
  }, 200)
}

const applyHighlight = (colorKey) => {
  if (!currentSelectionData.value || !selectedDoc.value) return
  const { text, pIdx } = currentSelectionData.value
  const existingIndex = highlights.value.findIndex(h => h.text === text && h.docId === selectedDoc.value.id && h.pIdx === pIdx && h.page === currentPage.value)
  if (existingIndex > -1) highlights.value[existingIndex].color = colorKey
  else highlights.value.push({ text, color: colorKey, docId: selectedDoc.value.id, page: currentPage.value, pIdx })
  localStorage.setItem('figo_article_highlights', JSON.stringify(highlights.value))
  showMenu.value = false
  window.getSelection()?.removeAllRanges()
}

const removeHighlight = () => {
  if (!currentSelectionData.value || !selectedDoc.value) return
  const { text, pIdx } = currentSelectionData.value
  highlights.value = highlights.value.filter(h => !(h.text === text && h.docId === selectedDoc.value.id && h.pIdx === pIdx && h.page === currentPage.value))
  localStorage.setItem('figo_article_highlights', JSON.stringify(highlights.value))
  showMenu.value = false
  window.getSelection()?.removeAllRanges()
}

const removeHighlightByObject = (highlightObj) => {
  highlights.value = highlights.value.filter(h => !(h.text === highlightObj.text && h.docId === highlightObj.docId && h.pIdx === highlightObj.pIdx && h.page === highlightObj.page))
  localStorage.setItem('figo_article_highlights', JSON.stringify(highlights.value))
}

const jumpToHighlight = (h) => {
  if (currentPage.value !== h.page) currentPage.value = h.page
  showMobileSidebar.value = false
  setTimeout(() => {
    const marks = document.querySelectorAll('mark')
    for (let mark of marks) {
      if (mark.innerText.includes(h.text)) {
        const offset = 120
        const topPos = mark.getBoundingClientRect().top + window.scrollY - offset
        window.scrollTo({ top: topPos, behavior: 'smooth' })
        mark.classList.add('ring-4', 'ring-emerald-500/50', 'scale-[1.01]')
        setTimeout(() => mark.classList.remove('ring-4', 'ring-emerald-500/50', 'scale-[1.01]'), 1500)
        break;
      }
    }
  }, 300)
}

const renderParagraph = (rawHTML, pIdx) => {
  if (!rawHTML) return ''
  let escaped = String(rawHTML)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  if (selectedDoc.value) {
    const currentDocHighlights = docHighlights.value.filter(h => h.page === currentPage.value && h.pIdx === pIdx)
    currentDocHighlights.forEach(h => {
      const cClass = colorMap[h.color] || colorMap.yellow
      if (escaped.includes(h.text)) {
        escaped = escaped.replace(
          h.text, 
          `<mark class="${cClass} rounded-sm px-1.5 transition-all cursor-pointer inline-block" title="Menyimpan di Sorotan">${h.text}</mark>`
        )
      }
    })
  }
  
  escaped = escaped.replace(/\[IMAGE_ASSET:\s*(https?:\/\/[^\]]+)\]/gi, '<br><img src="$1" alt="Ilustrasi Buku" class="rounded-2xl max-w-full md:max-w-md my-8 shadow-sm border border-slate-200 dark:border-slate-800 object-contain mx-auto" /><br>');
  

  escaped = escaped.replace(/\[FLIPBOOK:\s*(https?:\/\/[^\]]+)\]/gi, '<br><div class="relative w-full h-[65vh] xl:h-[75vh] my-8 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 bg-slate-900"><iframe src="$1" seamless="seamless" scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true" class="w-full h-full"></iframe></div><br>');
  
  
  escaped = escaped.replace(/↳\s*Terjemahan:\s*(.*)/gi, '<span class="text-emerald-700 dark:text-emerald-400/90 font-medium block mt-2 mb-6 text-[13px] md:text-[14px] leading-relaxed italic border-l-2 border-emerald-500/30 pl-3">Terjemahan: $1</span>');

  return escaped
}

const currentBab = computed(() => {
  if (!selectedDoc.value?.data?.arsip_pengetahuan) return null
  return selectedDoc.value.data.arsip_pengetahuan[currentPage.value - 1]
})

const totalPages = computed(() => {
  if (!selectedDoc.value?.data?.arsip_pengetahuan) return 0
  return selectedDoc.value.data.arsip_pengetahuan.length
})

const paginationDots = computed(() => {
  const tot = totalPages.value
  const current = currentPage.value
  
  if (tot <= 7) return Array.from({ length: tot }, (_, i) => i + 1)

  let items = []
  
  if (current <= 4) {
    items = [1, 2, 3, 4, 5, '...', tot]
  } else if (current >= tot - 3) {
    items = [1, '...', tot - 4, tot - 3, tot - 2, tot - 1, tot]
  } else {
    items = [1, '...', current - 2, current - 1, current, current + 1, current + 2, '...', tot]
  }

  return items
})

const scrollToTop = () => { setTimeout(() => { const el = document.getElementById('baca-top'); if(el) { const y = el.getBoundingClientRect().top + window.scrollY - 80; window.scrollTo({top: y, behavior: 'smooth'}); } }, 50); };
const nextPage = () => { if (currentPage.value < totalPages.value) { currentPage.value++; scrollToTop(); } }
const prevPage = () => { if (currentPage.value > 1) { currentPage.value--; scrollToTop(); } }
const goToPage = (page) => { 
  if (page === '...') return; 
  currentPage.value = page; 
  scrollToTop(); 
}
const closeDetail = () => { selectedDoc.value = null; currentPage.value = 1; showMobileSidebar.value = false }
const getParagraphs = (text) => { if (!text) return []; return text.split('\n\n').map(p => p.trim()).filter(p => p.length > 0) }
const openDetail = async (doc, changeUrl = true) => {
  loading.value = true
  if (changeUrl) { currentPage.value = (allProgress.value[doc.id] ? allProgress.value[doc.id].page : 1) }
  showMenu.value = false; showMobileSidebar.value = false
  try {
    if (!doc.data) {
      const res = await $fetch(doc.url)
      doc.data = (typeof res === 'string') ? JSON.parse(res) : res
    }
    selectedDoc.value = doc
  } catch (err) { alert("Gagal memuat arsip artikel.") } finally { loading.value = false }
}


onUnmounted(() => {
  window.removeEventListener('scroll', calculateAndSaveProgress)
})
</script>

<style scoped>
/* Sembunyikan footer native Nuxt di halaman artikel */
:global(footer), :global(.footer), :global([class*="footer"]), :global(#footer) { display: none !important; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-down-enter-from, .slide-down-leave-to { transform: translate(-50%, -150%); opacity: 0; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
.dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
</style>

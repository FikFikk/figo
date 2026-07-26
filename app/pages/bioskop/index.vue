<template>
  <div class="min-h-screen bg-[#141414] text-white font-sans pb-28 md:pb-8 pt-safe">
    <!-- Navbar (Mobile + Desktop) -->
    <header class="flex items-center justify-between px-6 py-4 sticky top-0 z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
      <div class="flex items-center space-x-6">
        <h1 class="text-2xl font-bold tracking-wider text-red-600">FIGO FLIX</h1>
        <nav class="hidden md:flex space-x-4 text-sm font-medium text-gray-300">
          <a href="#" class="text-white">Beranda</a>
          <a href="#" class="hover:text-white transition">Serial</a>
          <a href="#" class="hover:text-white transition">Film</a>
          <a href="#" class="hover:text-white transition">Simpanan Saya</a>
        </nav>
      </div>
      <div class="flex items-center space-x-4">
        <div class="w-8 h-8 bg-yellow-500 rounded-sm"></div>
      </div>
    </header>

    <div class="px-6 flex flex-col md:flex-row gap-8 max-w-7xl mx-auto mt-4">
      
      <!-- LEFT SIDEBAR / TOP MOBILE: Keyboard / Search & Genres -->
      <aside class="w-full md:w-72 shrink-0 flex flex-col gap-6">
        
        <!-- Search Input -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          <input 
            v-model="searchQuery" 
            type="text" 
            class="w-full bg-[#2b2b2b] text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-[#333] transition-colors"
            placeholder="Cari film, serial, atau genre..."
          >
        </div>

        <!-- Genres List -->
        <div class="flex flex-col gap-2">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Kategori & Genre</h3>
          
          <!-- Mobile: Horizontal scrolling chips / Desktop: Vertical List -->
          <div class="flex md:flex-col overflow-x-auto md:overflow-visible gap-2 pb-2 md:pb-0 scrollbar-hide">
             <!-- Return 'Tidak ada' if genres list is empty -->
             <div v-if="filteredGenres.length === 0" class="text-gray-500 text-sm whitespace-nowrap">
                Genre tidak ditemukan
             </div>
             <button 
               v-for="(genre, idx) in filteredGenres" :key="idx"
               class="whitespace-nowrap px-4 py-2 md:py-1 md:px-0 text-left rounded-full md:rounded-none bg-[#2b2b2b] md:bg-transparent text-gray-300 hover:text-white hover:bg-gray-700 md:hover:bg-transparent transition-colors text-sm md:text-base font-medium"
             >
               {{ genre }}
             </button>
          </div>
        </div>
      </aside>

      <!-- MAIN CONTENT: Movie Results -->
      <main class="flex-1">
        <h2 class="text-xl md:text-2xl font-bold mb-6 text-gray-100">
          {{ searchQuery ? 'Hasil Pencarian: "' + searchQuery + '"' : 'Rekomendasi Pencarian Untukmu' }}
        </h2>
        
        <div v-if="filteredMovies.length === 0" class="text-center py-20 text-gray-400">
          <p class="text-xl mb-2">Ups, tidak ada yang cocok.</p>
          <p class="text-sm">Coba kata kunci lain.</p>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          
          <!-- Movie Card -->
          <div v-for="movie in filteredMovies" :key="movie.id" class="relative group cursor-pointer aspect-[2/3] rounded-2xl overflow-hidden bg-[#222] border border-[#333] hover:scale-105 transition-transform duration-300">
            
            <!-- Dummy Poster Backdrop (Using CSS Gradients for distinct look) -->
            <div :class="`absolute inset-0 opacity-60 bg-gradient-to-br ${movie.gradient}`"></div>
            
            <!-- Poster Overlay Darken -->
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

            <!-- Badges -->
            <div class="absolute top-2 left-2 flex flex-col gap-1">
              <span v-if="movie.badge" class="bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded shadow-lg uppercase tracking-wide">
                {{ movie.badge }}
              </span>
              <span v-if="movie.tag" class="bg-red-600/90 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow-lg">
                {{ movie.tag }}
              </span>
            </div>

            <!-- Content -->
            <div class="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
              <h3 class="text-sm sm:text-base font-bold text-white leading-tight drop-shadow-md pb-1 border-b border-gray-600/50 mb-1">
                {{ movie.title }}
              </h3>
              <p class="text-[10px] sm:text-xs text-gray-300">
                {{ movie.genre }}
              </p>
            </div>
          </div>
          
        </div>
      </main>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')

const allGenres = [
  "Komedi", 
  "Laga", 
  "Anak & Keluarga", 
  "Horor", 
  "Dokumenter", 
  "Adaptasi Buku", 
  "Anime"
]

const allMovies = [
  { id: 1, title: '14 PEAKS NOTHING IS IMPOSSIBLE', genre: 'Dokumenter', badge: '', tag: '', gradient: 'from-blue-900 to-cyan-700' },
  { id: 2, title: 'Agent Kim Reactivated', genre: 'Laga', badge: 'TOP 10', tag: 'Episode Baru', gradient: 'from-red-900 to-black' },
  { id: 3, title: 'AGAK LAEN MENYALA PANTIKUI', genre: 'Komedi', badge: '', tag: '', gradient: 'from-amber-700 to-yellow-900' },
  { id: 4, title: 'KAFIR GERBANG SUKMA', genre: 'Horor', badge: '', tag: '', gradient: 'from-slate-900 to-true-gray-900' },
  { id: 5, title: 'PHANTOM LAWYER', genre: 'Drama', badge: '', tag: '', gradient: 'from-purple-900 to-indigo-900' },
  { id: 6, title: 'TERIKAT JANJI', genre: 'Romantis', badge: 'TOP 10', tag: 'Episode Baru', gradient: 'from-pink-900 to-rose-900' },
  { id: 7, title: 'WASIAT WARISAN', genre: 'Drama', badge: '', tag: '', gradient: 'from-green-900 to-teal-900' },
  { id: 8, title: 'SUZZANNA SANTET DOSA DI ATAS DOSA', genre: 'Horor', badge: 'TOP 10', tag: 'Baru Ditambahkan', gradient: 'from-red-950 to-orange-900' }
]

const filteredGenres = computed(() => {
  if (!searchQuery.value) return allGenres
  const q = searchQuery.value.toLowerCase()
  return allGenres.filter(g => g.toLowerCase().includes(q))
})

const filteredMovies = computed(() => {
  if (!searchQuery.value) return allMovies
  const q = searchQuery.value.toLowerCase()
  return allMovies.filter(m => 
    m.title.toLowerCase().includes(q) || 
    m.genre.toLowerCase().includes(q)
  )
})
</script>

<style scoped>
/* Utility for hiding scrollbar visually but allowing scroll */
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>

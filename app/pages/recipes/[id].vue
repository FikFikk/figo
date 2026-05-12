<template>
  <div class="recipe-detail-page" :class="isDark ? 'dark-mode' : 'light-mode'">

    <!-- Back Button -->
    <NuxtLink to="/recipes" class="back-link">
      <span class="material-symbols-outlined" style="font-size:14px">arrow_back</span>
      Back to Gallery
    </NuxtLink>

    <!-- Loading -->
    <div v-if="pending" class="state-center">
      <div class="spinner"></div>
      <p class="state-text">Memuat resep...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state-center">
      <p class="state-text" style="color:#ef4444">Resep tidak ditemukan</p>
    </div>

    <!-- Content -->
    <div v-else-if="recipe">

      <!-- Title -->
      <h1 class="recipe-title">{{ recipe.title }}</h1>

      <!-- Badges -->
      <div class="badges">
        <span class="badge">
          <span class="material-symbols-outlined badge-icon">grocery</span>
          {{ recipe.numIngredients }} Bahan
        </span>
        <span class="badge">
          <span class="material-symbols-outlined badge-icon">format_list_numbered</span>
          {{ recipe.numSteps }} Langkah
        </span>
        <span class="badge">
          <span class="material-symbols-outlined badge-icon">timer</span>
          {{ getDifficulty(recipe.numSteps) }}
        </span>
      </div>

      <!-- Divider -->
      <hr class="divider" />

      <!-- Two Column -->
      <div class="content-grid">

        <!-- Bahan-bahan -->
        <div class="content-col">
          <h2 class="section-title">Bahan-bahan</h2>
          <ul class="ingredient-list">
            <li v-for="(ingredient, i) in recipe.ingredients" :key="i">
              {{ ingredient }}
            </li>
          </ul>
        </div>

        <!-- Langkah Pembuatan -->
        <div class="content-col">
          <h2 class="section-title">Langkah Pembuatan</h2>
          <ol class="step-list">
            <li v-for="(step, s) in recipe.steps" :key="s">
              <span class="step-num">{{ s + 1 }}.</span>
              <span class="step-text">{{ step }}</span>
            </li>
          </ol>
        </div>

      </div>

      <!-- Navigation -->
      <div class="nav-bottom">
        <NuxtLink v-if="recipe.idx > 0" :to="`/recipes/${recipe.idx - 1}`" class="nav-btn">
          <span class="material-symbols-outlined" style="font-size:14px">arrow_back</span>
          Sebelumnya
        </NuxtLink>
        <div v-else></div>

        <NuxtLink :to="`/recipes/${recipe.idx + 1}`" class="nav-btn">
          Berikutnya
          <span class="material-symbols-outlined" style="font-size:14px">arrow_forward</span>
        </NuxtLink>
      </div>

    </div>

    <!-- Footer -->
    <div class="footer">
      <span>© {{ new Date().getFullYear() }} Resep Nusantara</span>
      <div class="footer-links">
        <span>Tentang Kami</span>
        <span>Kontak</span>
        <span>Syarat & Ketentuan</span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
/**
 * Halaman detail resep - layout dua kolom, tipografi serif
 */
const { isDark } = useColorMode()
const route = useRoute()

const { data: recipe, pending, error } = await useFetch(`/api/recipes/${route.params.id}`)

useSeoMeta({
  title: computed(() => recipe.value ? `${recipe.value.title} — FiGo` : 'Resep — FiGo'),
  description: computed(() => recipe.value
    ? `Resep ${recipe.value.title} - ${recipe.value.numIngredients} bahan, ${recipe.value.numSteps} langkah memasak.`
    : 'Detail resep masakan Indonesia'
  ),
})

// Tingkat kesulitan berdasarkan jumlah langkah
function getDifficulty(steps: number) {
  if (steps <= 3) return 'Mudah'
  if (steps <= 6) return 'Sedang'
  return 'Sulit'
}
</script>

<style scoped>
.recipe-detail-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 100px 32px 60px;
  min-height: 100vh;
}

/* ======= DARK MODE (default) ======= */
.dark-mode { color: #ccc; }
.dark-mode .back-link { color: #888; }
.dark-mode .back-link:hover { color: #e8e8e8; }
.dark-mode .recipe-title { color: #f0ebe0; }
.dark-mode .badge { color: #999; }
.dark-mode .badge-icon { color: #777; }
.dark-mode .divider { border-top-color: #2a2a2a; }
.dark-mode .section-title { color: #e8e8e8; }
.dark-mode .ingredient-list li { color: #aaa; }
.dark-mode .ingredient-list li::before { color: #555; }
.dark-mode .step-list li { color: #aaa; }
.dark-mode .step-num { color: #777; }
.dark-mode .nav-bottom { border-top-color: #2a2a2a; }
.dark-mode .nav-btn { border-color: #333; color: #888; }
.dark-mode .nav-btn:hover { border-color: #666; color: #e8e8e8; }
.dark-mode .footer { border-top-color: #222; color: #444; }
.dark-mode .spinner { border-color: #333; border-top-color: #888; }

/* ======= LIGHT MODE ======= */
.light-mode { color: #444; }
.light-mode .back-link { color: #555; }
.light-mode .back-link:hover { color: #111; }
.light-mode .recipe-title { color: #1a1a1a; }
.light-mode .badge { color: #666; }
.light-mode .badge-icon { color: #888; }
.light-mode .divider { border-top-color: #e5e5e5; }
.light-mode .section-title { color: #1a1a1a; }
.light-mode .ingredient-list li { color: #555; }
.light-mode .ingredient-list li::before { color: #bbb; }
.light-mode .step-list li { color: #555; }
.light-mode .step-num { color: #999; }
.light-mode .nav-bottom { border-top-color: #e5e5e5; }
.light-mode .nav-btn { border-color: #ddd; color: #555; }
.light-mode .nav-btn:hover { border-color: #999; color: #111; }
.light-mode .footer { border-top-color: #eee; color: #bbb; }
.light-mode .spinner { border-color: #e5e5e5; border-top-color: #999; }

/* ======= SHARED STYLES ======= */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  margin-bottom: 32px;
  transition: color 0.15s;
}

.recipe-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 16px;
}

.badges { display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 24px; }
.badge { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 500; }
.badge-icon { font-size: 16px; }

.divider { border: none; border-top: 1px solid; margin: 0 0 32px; }

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 48px;
  margin-bottom: 48px;
}
@media (max-width: 640px) { .content-grid { grid-template-columns: 1fr; gap: 32px; } }

.section-title {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 16px;
}

.ingredient-list { list-style: none; padding: 0; margin: 0; }
.ingredient-list li {
  position: relative;
  padding-left: 16px;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 4px;
}
.ingredient-list li::before {
  content: '○';
  position: absolute;
  left: 0;
  font-size: 8px;
  top: 5px;
}

.step-list { list-style: none; padding: 0; margin: 0; }
.step-list li { display: flex; gap: 10px; margin-bottom: 16px; font-size: 13px; line-height: 1.7; }
.step-num { font-weight: 700; flex-shrink: 0; min-width: 18px; }

.nav-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 24px;
  border-top: 1px solid;
}
.nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s;
}

.state-center { display: flex; flex-direction: column; align-items: center; padding: 80px 0; }
.state-text { font-size: 13px; color: #666; }
.spinner {
  width: 32px; height: 32px;
  border: 2px solid; border-radius: 50%;
  animation: spin 0.8s linear infinite; margin-bottom: 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.footer {
  margin-top: 48px; padding-top: 20px; border-top: 1px solid;
  display: flex; align-items: center; justify-content: space-between;
  font-size: 10px;
}
.footer-links { display: flex; gap: 16px; }
@media (max-width: 640px) { .footer { flex-direction: column; gap: 8px; } }
</style>

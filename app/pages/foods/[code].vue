<template>
  <div class="detail-page" :class="isDark ? 'dark-mode' : 'light-mode'">
    <!-- Header Bar -->
    <div class="header-bar">
      <div class="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        <NuxtLink to="/foods" class="back-link">
          <span class="material-symbols-outlined text-lg">arrow_back</span>
          Back to Index
        </NuxtLink>
        <span class="header-title">Nutrition Detail</span>
        <div class="w-24"></div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="max-w-[1200px] mx-auto px-6 pt-32 pb-20">
      <div class="animate-pulse space-y-8">
        <div class="h-10 bg-white/5 rounded-2xl w-2/3"></div>
        <div class="h-6 bg-white/5 rounded-xl w-1/3"></div>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 h-96 bg-white/5 rounded-2xl"></div>
          <div class="h-96 bg-white/5 rounded-2xl"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="max-w-[1200px] mx-auto px-6 pt-32 pb-20 text-center">
      <span class="material-symbols-outlined text-6xl opacity-10 mb-6 block">error_outline</span>
      <h2 class="text-xl font-bold mb-2">Product Not Found</h2>
      <p class="text-secondary text-sm mb-6">{{ error.message }}</p>
      <NuxtLink to="/foods" class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-sm font-bold hover:scale-105 transition-transform">
        <span class="material-symbols-outlined text-lg">arrow_back</span>
        Back to Index
      </NuxtLink>
    </div>

    <!-- Main Content -->
    <main v-else-if="product" class="max-w-[1200px] mx-auto px-6 pt-28 pb-20">
      <!-- Product Title -->
      <h1 class="product-title font-serif">{{ product.name }}</h1>

      <!-- Meta Bar -->
      <div class="meta-bar">
        <!-- Nutri-Score Badge -->
        <div v-if="product.nutriscoreGrade" class="nutriscore-badge" :class="'ns-' + product.nutriscoreGrade">
          <span class="ns-label">NUTRI-SCORE</span>
          <span class="ns-grade">{{ product.nutriscoreGrade.toUpperCase() }}</span>
        </div>

        <div class="meta-info">
          <span v-if="product.countries?.length" class="meta-text">
            Origin: {{ product.countries.join(', ') }}{{ product.brand ? ', ' + product.brand.toUpperCase() : '' }}
          </span>
          <span v-else-if="product.brand" class="meta-text">
            {{ product.brand.toUpperCase() }}
          </span>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="content-grid">
        <!-- Left: Nutrition Facts -->
        <div class="facts-panel">
          <h2 class="panel-heading">Nutrition Facts</h2>
          <p class="serving-label">Amount Per 100g</p>

          <!-- Tabel Nutrisi Utama -->
          <div class="facts-table">
            <!-- Calories -->
            <div class="fact-row fact-row--bold fact-row--top">
              <span>Calories</span>
              <span>{{ product.mainNutrients.calories ?? '—' }}</span>
            </div>

            <!-- Fat Section -->
            <div class="fact-row-dual">
              <div class="fact-col">
                <div class="fact-row fact-row--bold">
                  <span>Total Fat</span>
                  <span>{{ fmt(product.mainNutrients.totalFat, 'g') }}</span>
                </div>
                <div class="fact-row fact-row--indent">
                  <span>Saturated Fat</span>
                  <span>{{ fmt(product.mainNutrients.saturatedFat, 'g') }}</span>
                </div>
              </div>
              <div class="fact-col">
                <div class="fact-row fact-row--bold">
                  <span>Total Fat</span>
                  <span>{{ fmt(product.mainNutrients.totalFat, 'g') }}</span>
                </div>
                <div class="fact-row fact-row--indent">
                  <span>Saturated Fat</span>
                  <span>{{ fmt(product.mainNutrients.saturatedFat, 'g') }}</span>
                </div>
              </div>
            </div>

            <!-- Carbs & Protein -->
            <div class="fact-row-dual">
              <div class="fact-col">
                <div class="fact-row fact-row--bold">
                  <span>Carbohydrates</span>
                  <span>{{ fmt(product.mainNutrients.carbohydrates, 'g') }}</span>
                </div>
                <div class="fact-row fact-row--indent">
                  <span>Dietary Fiber</span>
                  <span>{{ fmt(product.mainNutrients.fiber, 'g') }}</span>
                </div>
              </div>
              <div class="fact-col">
                <div class="fact-row fact-row--bold">
                  <span>Protein</span>
                  <span>{{ fmt(product.mainNutrients.protein, 'g') }}</span>
                </div>
                <div class="fact-row fact-row--bold">
                  <span>Salt</span>
                  <span>{{ fmt(product.mainNutrients.salt, 'g') }}</span>
                </div>
              </div>
            </div>

            <!-- Sugars -->
            <div class="fact-row fact-row--bold">
              <span>Sugars</span>
              <span>{{ fmt(product.mainNutrients.sugars, 'g') }}</span>
            </div>

            <!-- Vitamins -->
            <div v-if="product.vitamins.length > 0" class="fact-section">
              <h3 class="fact-section-title">Vitamins</h3>
              <div class="fact-grid">
                <div v-for="v in product.vitamins" :key="v.name" class="fact-grid-item">
                  <span>{{ v.name }}</span>
                  <span>{{ v.value }}{{ v.unit }}</span>
                </div>
              </div>
            </div>

            <!-- Minerals -->
            <div v-if="product.minerals.length > 0" class="fact-section">
              <h3 class="fact-section-title">Minerals</h3>
              <div class="fact-grid">
                <div v-for="m in product.minerals" :key="m.name" class="fact-grid-item">
                  <span>{{ m.name }}</span>
                  <span>{{ m.value }}{{ m.unit }}</span>
                </div>
              </div>
            </div>

            <!-- Allergens -->
            <div class="fact-section">
              <p class="allergen-line">
                <strong>Allergens:</strong>
                {{ product.allergens.length > 0 ? product.allergens.join(', ') : 'None detected' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Right: Health Impact -->
        <div class="health-panel">
          <h2 class="panel-heading">Health Impact</h2>

          <!-- Gauge -->
          <div class="gauge-container">
            <svg viewBox="0 0 200 130" class="gauge-svg">
              <!-- Latar belakang gauge (busur) -->
              <path
                d="M 20 120 A 80 80 0 0 1 180 120"
                fill="none"
                :stroke="isDark ? '#2a2f38' : '#e5e7eb'"
                stroke-width="16"
                stroke-linecap="round"
              />
              <!-- Progress gauge (busur berwarna) -->
              <path
                d="M 20 120 A 80 80 0 0 1 180 120"
                fill="none"
                :stroke="gaugeColor"
                stroke-width="16"
                stroke-linecap="round"
                :stroke-dasharray="gaugeDash"
                class="gauge-progress"
              />
            </svg>
            <div class="gauge-value">
              <span class="gauge-number">{{ product.healthScore ?? '—' }}</span>
              <span class="gauge-total">/100</span>
            </div>
            <p class="gauge-rating" :style="{ color: gaugeColor }">{{ product.healthRating ?? 'N/A' }}</p>
          </div>

          <!-- Score Bar -->
          <div class="score-bar-wrapper">
            <div class="score-bar-bg">
              <div class="score-bar-fill" :style="{ width: (product.healthScore || 0) + '%', background: gaugeColor }"></div>
            </div>
          </div>

          <!-- Description -->
          <p class="health-desc">{{ product.healthDescription }}</p>

          <!-- Key Benefits -->
          <div class="benefits-block">
            <h3 class="benefits-title">Key Benefits</h3>
            <ul class="benefits-list">
              <li v-for="b in product.benefits" :key="b">{{ b }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Ingredients (jika tersedia) -->
      <div v-if="product.ingredients" class="ingredients-panel">
        <h3 class="panel-heading text-base">Ingredients</h3>
        <p class="ingredients-text">{{ product.ingredients }}</p>
      </div>

      <!-- Footer -->
      <footer class="py-12 text-center opacity-20 text-[9px] font-black uppercase tracking-[0.4em]">
        Data sourced from Open Food Facts • {{ product.code }}
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
/**
 * Halaman detail nutrisi produk makanan
 * URL: /foods/[code]
 */

const { isDark } = useColorMode()
const route = useRoute()
const code = route.params.code as string

useSeoMeta({
  title: `Nutrition Detail — FiGo`,
})

// Fetch data detail produk
const { data: product, pending, error } = await useFetch(`/api/foods/${code}`)

// Update SEO setelah data dimuat
watch(product, (p) => {
  if (p) {
    useSeoMeta({
      title: `${p.name} — Nutrition Detail — FiGo`,
      description: `Detailed nutritional facts for ${p.name}. ${p.mainNutrients.calories ?? 0} kcal, ${p.mainNutrients.protein ?? 0}g protein per 100g.`,
    })
  }
}, { immediate: true })

// Format nilai nutrisi
function fmt(val: number | null, unit: string): string {
  if (val == null) return '—'
  return `${val}${unit}`
}

// Warna gauge berdasarkan skor
const gaugeColor = computed(() => {
  const score = product.value?.healthScore ?? 0
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#84cc16'
  if (score >= 40) return '#eab308'
  if (score >= 20) return '#f97316'
  return '#ef4444'
})

// Dash array untuk progress gauge (busur = ~251 unit)
const gaugeDash = computed(() => {
  const score = product.value?.healthScore ?? 0
  const totalArc = 251
  const filled = (score / 100) * totalArc
  return `${filled} ${totalArc}`
})
</script>

<style scoped>
/* ========== Layout ========== */
.detail-page {
  min-height: 100vh;
  transition: background-color 0.4s ease;
}
.dark-mode { background: #0d1117; color: #e6edf3; }
.light-mode { background: #f8f9fa; color: #1a1a2e; }

.font-serif { font-family: 'Playfair Display', serif; }

/* ========== Header ========== */
.header-bar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 50;
  padding: 16px 0;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.dark-mode .header-bar { background: rgba(13,17,23,0.85); }
.light-mode .header-bar { background: rgba(248,249,250,0.9); border-bottom-color: rgba(0,0,0,0.05); }

.header-title {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  opacity: 0.5;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  opacity: 0.6;
  transition: opacity 0.3s;
}
.back-link:hover { opacity: 1; }

/* ========== Product Title ========== */
.product-title {
  font-size: clamp(28px, 5vw, 44px);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: 20px;
}

/* ========== Meta Bar ========== */
.meta-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 20px;
  border-radius: 16px;
  margin-bottom: 32px;
}
.dark-mode .meta-bar { background: #161b22; border: 1px solid rgba(255,255,255,0.05); }
.light-mode .meta-bar { background: #ffffff; border: 1px solid rgba(0,0,0,0.06); box-shadow: 0 2px 8px rgba(0,0,0,0.04); }

.nutriscore-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 800;
}
.ns-a { background: #22c55e; color: white; }
.ns-b { background: #84cc16; color: white; }
.ns-c { background: #eab308; color: #1a1a2e; }
.ns-d { background: #f97316; color: white; }
.ns-e { background: #ef4444; color: white; }

.ns-label { letter-spacing: 0.08em; font-size: 9px; text-transform: uppercase; }
.ns-grade { font-size: 16px; font-weight: 900; }

.meta-text { font-size: 13px; font-weight: 600; opacity: 0.7; }

/* ========== Content Grid ========== */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}
@media (max-width: 768px) {
  .content-grid { grid-template-columns: 1fr; }
}

/* ========== Panels ========== */
.facts-panel, .health-panel, .ingredients-panel {
  padding: 28px;
  border-radius: 16px;
}
.dark-mode .facts-panel, .dark-mode .health-panel, .dark-mode .ingredients-panel {
  background: #161b22;
  border: 1px solid rgba(255,255,255,0.05);
}
.light-mode .facts-panel, .light-mode .health-panel, .light-mode .ingredients-panel {
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.panel-heading {
  font-size: 20px;
  font-weight: 900;
  margin-bottom: 8px;
}

.serving-label {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.5;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid;
}
.dark-mode .serving-label { border-color: rgba(255,255,255,0.1); }
.light-mode .serving-label { border-color: rgba(0,0,0,0.08); }

/* ========== Facts Table ========== */
.fact-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 8px 0;
  font-size: 14px;
  border-bottom: 1px solid;
}
.dark-mode .fact-row { border-color: rgba(255,255,255,0.05); }
.light-mode .fact-row { border-color: rgba(0,0,0,0.05); }

.fact-row--bold span:first-child { font-weight: 700; }
.fact-row--indent { padding-left: 20px; font-size: 13px; opacity: 0.8; }
.fact-row--top { font-size: 18px; padding: 12px 0; }
.fact-row--top span:last-child { font-weight: 900; font-size: 22px; }

/* Dual column rows */
.fact-row-dual {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 4px 0;
}
@media (max-width: 480px) {
  .fact-row-dual { grid-template-columns: 1fr; gap: 0; }
}
.fact-col .fact-row { border-bottom-width: 1px; }

/* Fact Section (Vitamins, Minerals) */
.fact-section { margin-top: 16px; }
.fact-section-title {
  font-size: 15px;
  font-weight: 800;
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 2px solid;
}
.dark-mode .fact-section-title { border-color: rgba(255,255,255,0.1); }
.light-mode .fact-section-title { border-color: rgba(0,0,0,0.08); }

.fact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 24px;
}
.fact-grid-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 13px;
  border-bottom: 1px solid;
}
.dark-mode .fact-grid-item { border-color: rgba(255,255,255,0.04); }
.light-mode .fact-grid-item { border-color: rgba(0,0,0,0.04); }

.allergen-line {
  font-size: 14px;
  margin-top: 8px;
}

/* ========== Health Panel ========== */
.gauge-container {
  position: relative;
  text-align: center;
  margin: 24px auto 8px;
  max-width: 200px;
}

.gauge-svg { width: 100%; height: auto; }

.gauge-progress {
  transition: stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.gauge-value {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.gauge-number {
  font-size: 36px;
  font-weight: 900;
  line-height: 1;
}

.gauge-total {
  font-size: 16px;
  font-weight: 700;
  opacity: 0.4;
}

.gauge-rating {
  text-align: center;
  font-size: 14px;
  font-weight: 800;
  margin-top: 4px;
  margin-bottom: 16px;
}

/* Score Bar */
.score-bar-wrapper { padding: 0 12px; margin-bottom: 20px; }
.score-bar-bg {
  height: 8px;
  border-radius: 100px;
  overflow: hidden;
}
.dark-mode .score-bar-bg { background: #2a2f38; }
.light-mode .score-bar-bg { background: #e5e7eb; }

.score-bar-fill {
  height: 100%;
  border-radius: 100px;
  transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.health-desc {
  font-size: 12px;
  text-align: center;
  opacity: 0.6;
  line-height: 1.6;
  margin-bottom: 24px;
  padding: 0 8px;
}

.benefits-block { margin-top: 8px; }
.benefits-title { font-size: 15px; font-weight: 800; margin-bottom: 10px; }
.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.benefits-list li {
  position: relative;
  padding: 6px 0 6px 18px;
  font-size: 13px;
  opacity: 0.85;
}
.benefits-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  font-weight: 900;
  color: #22c55e;
}

/* Ingredients */
.ingredients-text {
  font-size: 13px;
  line-height: 1.8;
  opacity: 0.7;
}
</style>

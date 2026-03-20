<template>
  <div class="pt-24 pb-20 px-6 md:px-8 max-w-5xl mx-auto min-h-screen">
    <!-- Header -->
    <div class="text-center mb-12">
      <div class="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
        :class="isDark ? 'bg-primary/15 text-primary' : 'bg-primary-fixed text-on-primary-fixed'"
      >
        <span class="material-symbols-outlined text-sm align-middle mr-1">build</span>
        Developer Toolkit
      </div>
      <h1 class="text-3xl md:text-5xl font-headline font-extrabold tracking-tight mb-4"
        :class="isDark ? 'text-white' : 'text-slate-900'"
      >Tools</h1>
      <p class="text-base md:text-lg max-w-xl mx-auto" :class="isDark ? 'text-gray-400' : 'text-secondary'">
        Developer-grade utilities for inspecting, validating, and securing your assets.
      </p>
    </div>

    <!-- Link Safety Checker -->
    <div class="glass-panel rounded-2xl p-6 md:p-8 mb-10" :class="isDark ? 'border border-white/5' : 'border border-slate-100'">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="isDark ? 'bg-primary/15' : 'bg-blue-50'">
          <span class="material-symbols-outlined text-xl text-primary">shield</span>
        </div>
        <div>
          <h2 class="font-headline font-bold text-lg" :class="isDark ? 'text-white' : 'text-slate-900'">Link Safety Checker</h2>
          <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-slate-400'">Real-time URL scraping &amp; threat analysis</p>
        </div>
      </div>

      <!-- URL Input -->
      <div class="flex flex-col sm:flex-row gap-3 mb-6">
        <div class="flex-1 relative">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-xl"
            :class="isDark ? 'text-gray-500' : 'text-slate-400'"
          >link</span>
          <input
            v-model="checkUrl"
            type="url"
            placeholder="Enter URL to check (e.g. https://example.com)"
            class="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm font-medium transition-all outline-none"
            :class="isDark
              ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10 focus:border-primary/40'
              : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 focus:border-primary'"
            @keydown.enter="checkLink"
          />
        </div>
        <button
          class="px-6 py-3.5 bg-primary text-on-primary rounded-xl font-headline font-bold text-sm hover:scale-[1.02] hover:shadow-lg transition-all active:scale-[0.98] flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          @click="checkLink"
          :disabled="!checkUrl.trim() || isChecking"
        >
          <span class="material-symbols-outlined text-lg" :class="{ 'animate-spin': isChecking }">
            {{ isChecking ? 'progress_activity' : 'verified_user' }}
          </span>
          {{ isChecking ? 'Scanning...' : 'Check Link' }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isChecking" class="text-center py-8">
        <div class="inline-flex items-center gap-3 px-6 py-3 rounded-full" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
          <span class="material-symbols-outlined text-primary animate-spin">progress_activity</span>
          <span class="text-sm font-medium" :class="isDark ? 'text-gray-400' : 'text-slate-500'">{{ scanStatus }}</span>
        </div>
      </div>

      <!-- Error -->
      <div v-if="error" class="rounded-xl p-5 border" :class="isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-800 border-red-200'">
        <div class="flex items-start gap-3">
          <span class="material-symbols-outlined text-2xl">error</span>
          <div>
            <p class="font-bold">Error</p>
            <p class="text-sm opacity-80">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Result -->
      <Transition
        enter-active-class="transition-all duration-500 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div v-if="result" class="space-y-4">
          <!-- Score Header -->
          <div class="rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4" :class="resultHeaderClass">
            <div class="flex items-center gap-3 flex-1">
              <div class="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black" :class="scoreCircleClass">
                {{ result.score }}
              </div>
              <div>
                <p class="font-headline font-bold text-lg">{{ levelLabel }}</p>
                <p class="text-sm opacity-80">{{ result.summary }}</p>
              </div>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="rounded-xl p-3 text-center" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
              <div class="flex items-center justify-center gap-1 mb-1">
                <span class="material-symbols-outlined text-sm" :class="result.ssl ? 'text-green-500' : 'text-red-500'">
                  {{ result.ssl ? 'lock' : 'lock_open' }}
                </span>
                <span class="text-xs font-bold" :class="isDark ? 'text-gray-400' : 'text-slate-500'">SSL</span>
              </div>
              <p class="text-xs font-medium" :class="result.ssl ? 'text-green-500' : 'text-red-500'">
                {{ result.ssl ? 'Encrypted' : 'Not Secure' }}
              </p>
            </div>
            <div class="rounded-xl p-3 text-center" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
              <div class="flex items-center justify-center gap-1 mb-1">
                <span class="material-symbols-outlined text-sm" :class="isDark ? 'text-gray-400' : 'text-slate-500'">speed</span>
                <span class="text-xs font-bold" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Response</span>
              </div>
              <p class="text-xs font-medium" :class="isDark ? 'text-white' : 'text-slate-900'">
                {{ result.responseTime ? result.responseTime + 'ms' : 'N/A' }}
              </p>
            </div>
            <div class="rounded-xl p-3 text-center" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
              <div class="flex items-center justify-center gap-1 mb-1">
                <span class="material-symbols-outlined text-sm" :class="isDark ? 'text-gray-400' : 'text-slate-500'">http</span>
                <span class="text-xs font-bold" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Status</span>
              </div>
              <p class="text-xs font-medium" :class="isDark ? 'text-white' : 'text-slate-900'">
                {{ result.status || 'Failed' }}
              </p>
            </div>
            <div class="rounded-xl p-3 text-center" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
              <div class="flex items-center justify-center gap-1 mb-1">
                <span class="material-symbols-outlined text-sm" :class="isDark ? 'text-gray-400' : 'text-slate-500'">open_in_new</span>
                <span class="text-xs font-bold" :class="isDark ? 'text-gray-400' : 'text-slate-500'">Redirects</span>
              </div>
              <p class="text-xs font-medium" :class="result.redirected ? 'text-yellow-500' : (isDark ? 'text-white' : 'text-slate-900')">
                {{ result.redirected ? 'Yes' : 'None' }}
              </p>
            </div>
          </div>

          <!-- Threat Findings -->
          <div v-if="result.threats.length > 0">
            <h3 class="font-headline font-bold text-sm mb-3" :class="isDark ? 'text-gray-400' : 'text-slate-500'">
              {{ result.threats.length }} Threat{{ result.threats.length > 1 ? 's' : '' }} Found
            </h3>
            <div class="space-y-2">
              <div
                v-for="(threat, idx) in result.threats"
                :key="idx"
                class="rounded-xl p-4 flex items-start gap-3 transition-all"
                :class="threatRowClass(threat.severity)"
              >
                <span class="material-symbols-outlined text-lg mt-0.5 flex-shrink-0">{{ severityIcon(threat.severity) }}</span>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap mb-1">
                    <span class="font-bold text-sm">{{ threat.title }}</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest" :class="severityBadgeClass(threat.severity)">
                      {{ threat.severity }}
                    </span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest" :class="isDark ? 'bg-white/5 text-gray-500' : 'bg-slate-100 text-slate-400'">
                      {{ threat.category }}
                    </span>
                  </div>
                  <p class="text-xs opacity-75 leading-relaxed">{{ threat.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Final URL -->
          <div v-if="result.finalUrl !== result.url" class="rounded-xl p-3 flex items-center gap-2 text-xs" :class="isDark ? 'bg-white/5' : 'bg-slate-50'">
            <span class="material-symbols-outlined text-sm" :class="isDark ? 'text-gray-500' : 'text-slate-400'">open_in_new</span>
            <span :class="isDark ? 'text-gray-500' : 'text-slate-400'">Final URL:</span>
            <span class="truncate font-medium" :class="isDark ? 'text-gray-300' : 'text-slate-700'">{{ result.finalUrl }}</span>
          </div>
        </div>
      </Transition>
    </div>

    <!-- More Tools Grid -->
    <h3 class="font-headline font-bold text-xl mb-6" :class="isDark ? 'text-white' : 'text-slate-900'">More Tools</h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="tool in otherTools"
        :key="tool.title"
        class="glass-panel rounded-xl p-5 transition-all duration-300 group opacity-60"
        :class="isDark ? 'border border-white/5' : 'border border-slate-100'"
      >
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            :class="isDark ? 'bg-white/5' : 'bg-slate-100'"
          >
            <span class="material-symbols-outlined text-lg" :class="isDark ? 'text-gray-500' : 'text-slate-400'">{{ tool.icon }}</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h4 class="font-headline font-bold text-sm" :class="isDark ? 'text-gray-300' : 'text-slate-700'">{{ tool.title }}</h4>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                :class="isDark ? 'bg-white/5 text-gray-500' : 'bg-slate-100 text-slate-400'"
              >Soon</span>
            </div>
            <p class="text-xs mt-1" :class="isDark ? 'text-gray-600' : 'text-slate-400'">{{ tool.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({ title: 'Tools — FiGo' })
const { isDark } = useColorMode()
const { increment } = useHistoryCounter()

const checkUrl = ref('')
const isChecking = ref(false)
const scanStatus = ref('Initializing scan...')
const error = ref('')

interface ThreatFinding {
  category: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  title: string
  description: string
}

interface AnalysisResult {
  url: string
  finalUrl: string
  status: number | null
  ssl: boolean
  redirected: boolean
  redirectCount: number
  responseTime: number
  threats: ThreatFinding[]
  score: number
  level: 'safe' | 'warning' | 'danger'
  summary: string
}

const result = ref<AnalysisResult | null>(null)

const levelLabel = computed(() => {
  if (!result.value) return ''
  const l = result.value.level
  if (l === 'safe') return '✅ Looks Safe'
  if (l === 'warning') return '⚠️ Proceed with Caution'
  return '🚨 Dangerous'
})

const resultHeaderClass = computed(() => {
  if (!result.value) return ''
  const l = result.value.level
  if (l === 'safe') return isDark.value ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-green-50 text-green-800 border border-green-200'
  if (l === 'warning') return isDark.value ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
  return isDark.value ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-red-50 text-red-800 border border-red-200'
})

const scoreCircleClass = computed(() => {
  if (!result.value) return ''
  const s = result.value.score
  if (s >= 70) return isDark.value ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
  if (s >= 40) return isDark.value ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
  return isDark.value ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
})

function severityIcon(sev: string): string {
  switch (sev) {
    case 'critical': return 'gpp_bad'
    case 'high': return 'warning'
    case 'medium': return 'info'
    case 'low': return 'help'
    default: return 'info'
  }
}

function threatRowClass(sev: string): string {
  switch (sev) {
    case 'critical': return isDark.value ? 'bg-red-500/8 text-red-400 border border-red-500/15' : 'bg-red-50 text-red-800 border border-red-100'
    case 'high': return isDark.value ? 'bg-orange-500/8 text-orange-400 border border-orange-500/15' : 'bg-orange-50 text-orange-800 border border-orange-100'
    case 'medium': return isDark.value ? 'bg-yellow-500/8 text-yellow-400 border border-yellow-500/15' : 'bg-yellow-50 text-yellow-800 border border-yellow-100'
    case 'low': return isDark.value ? 'bg-blue-500/8 text-blue-400 border border-blue-500/15' : 'bg-blue-50 text-blue-800 border border-blue-100'
    default: return isDark.value ? 'bg-white/5 text-gray-400' : 'bg-slate-50 text-slate-600'
  }
}

function severityBadgeClass(sev: string): string {
  switch (sev) {
    case 'critical': return 'bg-red-500/20 text-red-500'
    case 'high': return 'bg-orange-500/20 text-orange-500'
    case 'medium': return 'bg-yellow-500/20 text-yellow-600'
    case 'low': return 'bg-blue-500/20 text-blue-500'
    default: return 'bg-gray-500/20 text-gray-500'
  }
}

// Status messages to show during scan
const statusMessages = [
  'Resolving domain...',
  'Checking SSL certificate...',
  'Fetching page content...',
  'Scanning for phishing patterns...',
  'Analyzing scripts & iframes...',
  'Checking for malware signatures...',
  'Evaluating redirect chain...',
  'Generating safety report...',
]

async function checkLink() {
  if (!checkUrl.value.trim() || isChecking.value) return
  isChecking.value = true
  result.value = null
  error.value = ''

  // Animate status messages
  let msgIdx = 0
  scanStatus.value = statusMessages[0]
  const statusInterval = setInterval(() => {
    msgIdx++
    if (msgIdx < statusMessages.length) {
      scanStatus.value = statusMessages[msgIdx]
    }
  }, 600)

  try {
    const data = await $fetch<AnalysisResult>('/api/check-link', {
      method: 'POST',
      body: { url: checkUrl.value },
    })
    result.value = data
    increment()
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Failed to analyze URL. Please try again.'
  } finally {
    clearInterval(statusInterval)
    isChecking.value = false
  }
}

const otherTools = [
  { icon: 'fingerprint', title: 'Hash Generator', description: 'Generate MD5, SHA-1, SHA-256 hashes' },
  { icon: 'analytics', title: 'File Analyzer', description: 'Deep metadata and EXIF inspection' },
  { icon: 'qr_code_2', title: 'QR Generator', description: 'Create QR codes from text or URLs' },
  { icon: 'palette', title: 'Color Picker', description: 'Convert between HEX, RGB, HSL' },
  { icon: 'text_format', title: 'Base64 Encoder', description: 'Encode/decode Base64 strings' },
  { icon: 'vpn_key', title: 'Password Generator', description: 'Generate secure random passwords' },
]
</script>

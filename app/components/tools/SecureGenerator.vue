<template>
  <div class="glass-panel rounded-2xl p-6 md:p-8 mb-10" :class="isDark ? 'border border-white/5' : 'border border-slate-100'">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="isDark ? 'bg-primary/15' : 'bg-blue-50'">
          <span class="material-symbols-outlined text-xl text-primary">vpn_key</span>
        </div>
        <div>
          <h2 class="font-headline font-bold text-lg" :class="isDark ? 'text-white' : 'text-slate-900'">Secure Generator</h2>
          <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-slate-400'">Cryptographically secure random data</p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex flex-wrap gap-2 mb-6 bg-black/5 dark:bg-white/5 p-1 rounded-2xl">
      <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
        class="flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all"
        :class="activeTab === tab.id ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200'"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Result Display -->
    <div class="relative mb-6 rounded-2xl p-6 border transition-all duration-300"
         :class="isDark ? 'bg-black/30 border-white/10' : 'bg-slate-50 border-slate-200'">
      <div class="flex items-center justify-between gap-4">
        <!-- Input Mode for Hash -->
        <input v-if="activeTab === 'hash'" v-model="hashInput" type="text" placeholder="Type text to hash..."
               class="flex-1 bg-transparent font-mono text-lg outline-none w-full"
               :class="isDark ? 'text-white placeholder-gray-600' : 'text-slate-900 placeholder-slate-300'">
               
        <!-- Output Mode for Generators -->
        <div v-else class="flex-1 overflow-x-auto custom-scrollbar pb-1">
          <span class="font-mono text-lg sm:text-xl font-medium tracking-wide whitespace-nowrap"
                :class="isDark ? 'text-white' : 'text-slate-900'">
            {{ generatedOutput || 'Generating...' }}
          </span>
        </div>

        <div class="flex gap-2">
          <button v-if="activeTab !== 'hash'" @click="generate" class="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-slate-500 hover:text-primary">
            <span class="material-symbols-outlined">sync</span>
          </button>
          <button @click="copy(activeTab === 'hash' ? hashOutput.md5 : generatedOutput)" class="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-slate-500 hover:text-primary">
            <span class="material-symbols-outlined">content_copy</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Options Area -->
    <div class="rounded-2xl border p-5" :class="isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100'">
      <h3 class="text-sm font-bold mb-4 opacity-80">Options</h3>
      
      <!-- Password Options -->
      <div v-if="activeTab === 'password'" class="space-y-5">
        <div>
          <div class="flex justify-between text-sm mb-2">
            <span>Length</span>
            <span class="font-bold font-mono">{{ pwdOptions.length }}</span>
          </div>
          <input type="range" v-model.number="pwdOptions.length" min="5" max="128" @input="generate"
                 class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary">
        </div>
        <div class="grid grid-cols-2 gap-4">
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" v-model="pwdOptions.uppercase" @change="generate" class="rounded accent-primary w-4 h-4">
            <span class="text-sm">A-Z</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" v-model="pwdOptions.lowercase" @change="generate" class="rounded accent-primary w-4 h-4">
            <span class="text-sm">a-z</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" v-model="pwdOptions.numbers" @change="generate" class="rounded accent-primary w-4 h-4">
            <span class="text-sm">0-9</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" v-model="pwdOptions.special" @change="generate" class="rounded accent-primary w-4 h-4">
            <span class="text-sm">!@#$%^&*</span>
          </label>
        </div>
        <div class="pt-2 border-t border-black/5 dark:border-white/5">
           <label class="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" v-model="pwdOptions.avoidAmbiguous" @change="generate" class="rounded accent-primary w-4 h-4">
            <span class="text-sm">Avoid ambiguous characters (l, I, O, 0)</span>
          </label>
        </div>
      </div>

      <!-- Passphrase Options -->
      <div v-if="activeTab === 'passphrase'" class="space-y-5">
        <div>
          <div class="flex justify-between text-sm mb-2">
            <span>Number of words</span>
            <span class="font-bold font-mono">{{ passOptions.words }}</span>
          </div>
          <input type="range" v-model.number="passOptions.words" min="3" max="20" @input="generate"
                 class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary">
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <span class="text-xs opacity-70">Word separator</span>
            <input type="text" v-model="passOptions.separator" @input="generate" class="w-full p-2 rounded-lg text-sm outline-none border" :class="isDark ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 pt-2 border-t border-black/5 dark:border-white/5">
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" v-model="passOptions.capitalize" @change="generate" class="rounded accent-primary w-4 h-4">
            <span class="text-sm">Capitalize</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" v-model="passOptions.includeNumber" @change="generate" class="rounded accent-primary w-4 h-4">
            <span class="text-sm">Include Number</span>
          </label>
        </div>
      </div>

      <!-- Username Options -->
      <div v-if="activeTab === 'username'" class="space-y-5">
        <div class="flex flex-col gap-1">
          <span class="text-xs opacity-70">Type</span>
          <select v-model="userOptions.type" @change="generate" class="w-full p-2 rounded-lg text-sm outline-none border" :class="isDark ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'">
            <option value="catchall">Catch-all email (random@domain.com)</option>
            <option value="plus">Plus addressed (email+random@domain.com)</option>
            <option value="word">Random Word</option>
          </select>
        </div>
        <div v-if="userOptions.type !== 'word'" class="flex flex-col gap-1">
          <span class="text-xs opacity-70">{{ userOptions.type === 'catchall' ? 'Domain' : 'Base Email' }}</span>
          <input type="text" v-model="userOptions.domain" @input="generate" placeholder="example.com" class="w-full p-2 rounded-lg text-sm outline-none border" :class="isDark ? 'bg-black/20 border-white/10' : 'bg-slate-50 border-slate-200'">
        </div>
      </div>

      <!-- Hash Results -->
      <div v-if="activeTab === 'hash'" class="space-y-3">
        <div class="flex items-center justify-between group">
          <span class="opacity-60 text-xs uppercase font-bold tracking-wider w-20">MD5</span>
          <div class="flex-1 font-mono text-sm truncate mx-2 select-all">{{ hashOutput.md5 || '-' }}</div>
          <button @click="copy(hashOutput.md5)" class="opacity-0 group-hover:opacity-100 text-primary"><span class="material-symbols-outlined text-sm">content_copy</span></button>
        </div>
        <div class="flex items-center justify-between group">
          <span class="opacity-60 text-xs uppercase font-bold tracking-wider w-20">SHA-1</span>
          <div class="flex-1 font-mono text-sm truncate mx-2 select-all">{{ hashOutput.sha1 || '-' }}</div>
          <button @click="copy(hashOutput.sha1)" class="opacity-0 group-hover:opacity-100 text-primary"><span class="material-symbols-outlined text-sm">content_copy</span></button>
        </div>
        <div class="flex items-center justify-between group">
          <span class="opacity-60 text-xs uppercase font-bold tracking-wider w-20">SHA-256</span>
          <div class="flex-1 font-mono text-sm truncate mx-2 select-all">{{ hashOutput.sha256 || '-' }}</div>
          <button @click="copy(hashOutput.sha256)" class="opacity-0 group-hover:opacity-100 text-primary"><span class="material-symbols-outlined text-sm">content_copy</span></button>
        </div>
        <div class="flex items-center justify-between group">
          <span class="opacity-60 text-xs uppercase font-bold tracking-wider w-20">Base64</span>
          <div class="flex-1 font-mono text-sm truncate mx-2 select-all">{{ hashOutput.base64 || '-' }}</div>
          <button @click="copy(hashOutput.base64)" class="opacity-0 group-hover:opacity-100 text-primary"><span class="material-symbols-outlined text-sm">content_copy</span></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import SparkMD5 from 'spark-md5'

const { isDark } = useColorMode()
const { increment } = useHistoryCounter()

const tabs = [
  { id: 'password', label: 'Password' },
  { id: 'passphrase', label: 'Passphrase' },
  { id: 'username', label: 'Username' },
  { id: 'hash', label: 'Hash & Crypto' },
]

const activeTab = ref('password')
const generatedOutput = ref('')
const hashInput = ref('')

// Options
const pwdOptions = reactive({ length: 14, uppercase: true, lowercase: true, numbers: true, special: false, avoidAmbiguous: false })
const passOptions = reactive({ words: 4, separator: '-', capitalize: false, includeNumber: false })
const userOptions = reactive({ type: 'catchall', domain: 'example.com' })
const hashOutput = reactive({ md5: '', sha1: '', sha256: '', base64: '' })

// EFF Diceware short list (subset for lightweight random word generation)
const wordlist = [
  "acorn", "apple", "badge", "baker", "basis", "beast", "blade", "blend", "board", "brick",
  "cabin", "candy", "carve", "catch", "chair", "charm", "chase", "chief", "cider", "cloud",
  "coast", "coral", "crash", "crisp", "crust", "dance", "delay", "delta", "depth", "diner",
  "dodge", "dream", "drill", "eagle", "earth", "echo", "elbow", "ember", "entry", "equal",
  "event", "exact", "extra", "fabric", "fairy", "faith", "false", "fault", "feast", "fence",
  "field", "flash", "fleet", "flock", "fluid", "force", "frame", "frank", "fresh", "front",
  "frost", "fruit", "giant", "glass", "globe", "glory", "grace", "grain", "grand", "grape",
  "grass", "great", "green", "guess", "habit", "happy", "harsh", "heart", "heavy", "honey",
  "horse", "hotel", "house", "human", "ideal", "image", "index", "inner", "input", "issue",
  "joint", "judge", "juice", "laser", "layer", "lemon", "level", "light", "limit", "local",
  "logic", "lucky", "magic", "major", "mango", "march", "match", "metal", "model", "money",
  "month", "motor", "mouse", "movie", "music", "night", "noise", "north", "novel", "nurse",
  "ocean", "offer", "onion", "order", "other", "owner", "panel", "paper", "party", "peace",
  "peach", "phase", "phone", "piece", "pilot", "pitch", "place", "plane", "plant", "plate",
  "point", "pound", "power", "press", "price", "pride", "prize", "proof", "queen", "quiet",
  "radio", "range", "ratio", "reply", "right", "river", "robot", "rough", "round", "route",
  "royal", "rural", "scale", "scene", "scope", "score", "sense", "shape", "share", "sheep",
  "sheet", "shift", "shirt", "shock", "sight", "skill", "sleep", "smart", "smile", "smith",
  "smoke", "solid", "solve", "sound", "south", "space", "speed", "spell", "spend", "split",
  "sport", "squad", "staff", "stage", "stand", "start", "state", "steam", "steel", "stick",
  "stone", "store", "storm", "story", "strip", "style", "sugar", "super", "sweet", "table",
  "taste", "theme", "thing", "think", "third", "tiger", "title", "toast", "today", "topic",
  "total", "touch", "tough", "tower", "track", "trade", "train", "treat", "trend", "trial",
  "trust", "truth", "uncle", "union", "unity", "value", "video", "virus", "visit", "vital",
  "voice", "water", "wheel", "where", "whole", "world", "worry", "worth", "youth", "zebra"
]

// Cryptographically secure random integer
function getRandomInt(max: number) {
  const array = new Uint32Array(1)
  window.crypto.getRandomValues(array)
  return array[0] % max
}

function getRandomWord() {
  return wordlist[getRandomInt(wordlist.length)]
}

function generatePassword() {
  let charset = ""
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lower = "abcdefghijklmnopqrstuvwxyz"
  const numbers = "0123456789"
  const specials = "!@#$%^&*"
  
  const ambiguous = "Il1O0"

  if (pwdOptions.uppercase) charset += upper
  if (pwdOptions.lowercase) charset += lower
  if (pwdOptions.numbers) charset += numbers
  if (pwdOptions.special) charset += specials

  if (pwdOptions.avoidAmbiguous) {
    charset = charset.split('').filter(c => !ambiguous.includes(c)).join('')
  }

  if (charset === "") {
    pwdOptions.lowercase = true
    charset = lower
  }

  let result = ""
  for (let i = 0; i < pwdOptions.length; i++) {
    result += charset[getRandomInt(charset.length)]
  }
  generatedOutput.value = result
}

function generatePassphrase() {
  let words = []
  for (let i = 0; i < passOptions.words; i++) {
    let word = getRandomWord()
    if (passOptions.capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1)
    }
    words.push(word)
  }
  
  if (passOptions.includeNumber) {
    const randomIdx = getRandomInt(words.length)
    words[randomIdx] += getRandomInt(10).toString()
  }
  
  generatedOutput.value = words.join(passOptions.separator)
}

function generateUsername() {
  const randomStr = Math.random().toString(36).substring(2, 8)
  if (userOptions.type === 'catchall') {
    generatedOutput.value = `${getRandomWord()}${getRandomInt(99)}@${userOptions.domain || 'example.com'}`
  } else if (userOptions.type === 'plus') {
    generatedOutput.value = `${userOptions.domain || 'me'}+${getRandomWord()}@gmail.com`
  } else {
    generatedOutput.value = `${getRandomWord()}${getRandomWord()}${getRandomInt(999)}`
  }
}

async function computeHashes(text: string) {
  if (!text) {
    hashOutput.md5 = ''; hashOutput.sha1 = ''; hashOutput.sha256 = ''; hashOutput.base64 = ''
    return
  }
  
  hashOutput.md5 = SparkMD5.hash(text)
  hashOutput.base64 = btoa(unescape(encodeURIComponent(text)))
  
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  
  if (window.crypto && window.crypto.subtle) {
    const sha1Buffer = await window.crypto.subtle.digest('SHA-1', data)
    hashOutput.sha1 = Array.from(new Uint8Array(sha1Buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
    
    const sha256Buffer = await window.crypto.subtle.digest('SHA-256', data)
    hashOutput.sha256 = Array.from(new Uint8Array(sha256Buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
  }
}

function generate() {
  increment()
  if (activeTab.value === 'password') generatePassword()
  else if (activeTab.value === 'passphrase') generatePassphrase()
  else if (activeTab.value === 'username') generateUsername()
}

function copy(text: string) {
  if (text && navigator.clipboard) navigator.clipboard.writeText(text)
}

watch(activeTab, () => generate())
watch(hashInput, (val) => computeHashes(val))

onMounted(() => {
  generate()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(100, 100, 100, 0.3);
  border-radius: 10px;
}
</style>

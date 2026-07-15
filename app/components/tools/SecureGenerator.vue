<template>
  <div class="rounded-2xl p-6 md:p-8 mb-10 transition-colors duration-300" :class="isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200 shadow-sm'">
    
    <!-- HEADER -->
    <div class="flex items-center justify-between mb-8">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors" :class="isDark ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-indigo-50 text-indigo-600 border border-indigo-100'">
          <span class="material-symbols-outlined text-2xl">password</span>
        </div>
        <div>
          <h2 class="font-bold text-xl tracking-tight" :class="isDark ? 'text-white' : 'text-slate-900'">Generator and Hash</h2>
          <p class="text-sm font-medium" :class="isDark ? 'text-slate-400' : 'text-slate-500'">Cryptographically secure random data</p>
        </div>
      </div>
    </div>

    <!-- IOS-STYLE TABS -->
    <div class="flex p-1 mb-8 rounded-2xl transition-colors" :class="isDark ? 'bg-slate-800/80' : 'bg-slate-100'">
      <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
        class="flex-1 py-2 px-3 rounded-xl text-sm font-semibold transition-all duration-200 relative"
        :class="activeTab === tab.id ? (isDark ? 'text-white bg-slate-700 shadow-sm' : 'text-slate-800 bg-white shadow-sm ring-1 ring-black/5') : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'"
      >
        <span class="relative z-10">{{ tab.label }}</span>
      </button>
    </div>

    <!-- OUTPUT DISPLAY -->
    <div class="relative mb-8 rounded-2xl p-6 border transition-all duration-300 group"
         :class="isDark ? 'bg-slate-950 border-slate-700/60' : 'bg-slate-50 border-slate-200'">
      
      <div class="flex items-center justify-between gap-4">
        <!-- Hash Input -->
        <input v-if="activeTab === 'hash'" v-model="hashInput" type="text" :placeholder="hashMode === 'encode' ? 'Type text to hash...' : 'Paste MD5, SHA or Base64...'"
               class="flex-1 bg-transparent font-mono text-base md:text-lg outline-none w-full"
               :class="isDark ? 'text-white placeholder-slate-600' : 'text-slate-900 placeholder-slate-400'">
               
        <!-- Generator Output -->
        <div v-else class="flex-1 min-w-0">
          <p class="font-mono text-xl sm:text-2xl font-bold tracking-wide break-all leading-tight selection:bg-indigo-500/30"
                :class="isDark ? 'text-indigo-400' : 'text-indigo-600'">
            {{ generatedOutput || 'Generating...' }}
          </p>
        </div>

        <div class="flex gap-2 shrink-0">
          <button v-if="activeTab !== 'hash'" @click="generate" class="w-10 h-10 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow transition-all text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 active:scale-95" title="Regenerate">
            <span class="material-symbols-outlined text-lg">sync</span>
          </button>
          <button @click="copy(activeTab === 'hash' ? hashOutput.md5 : generatedOutput)" class="w-10 h-10 flex items-center justify-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow transition-all text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 active:scale-95" title="Copy to clipboard">
            <span class="material-symbols-outlined text-lg">content_copy</span>
          </button>
        </div>
      </div>
    </div>

    <!-- OPTIONS AREA -->
    <div class="rounded-2xl p-6 transition-colors" :class="isDark ? 'bg-slate-800/40 border border-slate-800' : 'bg-white border border-slate-100 shadow-sm ring-1 ring-slate-900/5'">
      
      <!-- Password Options -->
      <div v-if="activeTab === 'password'" class="flex flex-col gap-6">
        <div>
          <div class="flex justify-between items-end mb-3">
            <span class="text-sm font-semibold tracking-wide uppercase" :class="isDark ? 'text-slate-400' : 'text-slate-500'">Length</span>
            <span class="font-mono text-xl font-bold" :class="isDark ? 'text-white' : 'text-slate-800'">{{ pwdOptions.length }}</span>
          </div>
          <input type="range" v-model.number="pwdOptions.length" min="5" max="128" @input="generate"
                 class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-xl appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20">
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label class="flex justify-between items-center cursor-pointer p-3 rounded-2xl border transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80" :class="isDark ? 'border-slate-700' : 'border-slate-200'">
            <span class="text-sm font-medium" :class="isDark ? 'text-slate-200' : 'text-slate-700'">Uppercase (A-Z)</span>
            <div class="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 border" :class="pwdOptions.uppercase ? 'bg-indigo-500 border-indigo-500' : (isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-200 border-slate-300')">
              <div class="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 shadow-sm" :class="pwdOptions.uppercase ? 'translate-x-5' : 'translate-x-0'"></div>
            </div>
            <input type="checkbox" v-model="pwdOptions.uppercase" @change="generate" class="hidden">
          </label>
          
          <label class="flex justify-between items-center cursor-pointer p-3 rounded-2xl border transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80" :class="isDark ? 'border-slate-700' : 'border-slate-200'">
            <span class="text-sm font-medium" :class="isDark ? 'text-slate-200' : 'text-slate-700'">Lowercase (a-z)</span>
            <div class="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 border" :class="pwdOptions.lowercase ? 'bg-indigo-500 border-indigo-500' : (isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-200 border-slate-300')">
              <div class="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 shadow-sm" :class="pwdOptions.lowercase ? 'translate-x-5' : 'translate-x-0'"></div>
            </div>
            <input type="checkbox" v-model="pwdOptions.lowercase" @change="generate" class="hidden">
          </label>

          <label class="flex justify-between items-center cursor-pointer p-3 rounded-2xl border transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80" :class="isDark ? 'border-slate-700' : 'border-slate-200'">
            <span class="text-sm font-medium" :class="isDark ? 'text-slate-200' : 'text-slate-700'">Numbers (0-9)</span>
            <div class="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 border" :class="pwdOptions.numbers ? 'bg-indigo-500 border-indigo-500' : (isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-200 border-slate-300')">
              <div class="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 shadow-sm" :class="pwdOptions.numbers ? 'translate-x-5' : 'translate-x-0'"></div>
            </div>
            <input type="checkbox" v-model="pwdOptions.numbers" @change="generate" class="hidden">
          </label>

          <label class="flex justify-between items-center cursor-pointer p-3 rounded-2xl border transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80" :class="isDark ? 'border-slate-700' : 'border-slate-200'">
            <span class="text-sm font-medium" :class="isDark ? 'text-slate-200' : 'text-slate-700'">Symbols (Special)</span>
            <div class="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 border" :class="pwdOptions.special ? 'bg-indigo-500 border-indigo-500' : (isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-200 border-slate-300')">
              <div class="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 shadow-sm" :class="pwdOptions.special ? 'translate-x-5' : 'translate-x-0'"></div>
            </div>
            <input type="checkbox" v-model="pwdOptions.special" @change="generate" class="hidden">
          </label>
        </div>
        
        <label class="flex justify-between items-center cursor-pointer p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-700/30 transition-colors">
          <div class="flex flex-col">
            <span class="text-sm font-semibold" :class="isDark ? 'text-amber-400' : 'text-amber-700'">Avoid Ambiguous</span>
            <span class="text-xs mt-0.5" :class="isDark ? 'text-amber-500/70' : 'text-amber-600/70'">Removes lookalike characters like l, I, O, 0</span>
          </div>
          <div class="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 border" :class="pwdOptions.avoidAmbiguous ? 'bg-amber-500 border-amber-500' : (isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-200 border-slate-300')">
            <div class="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 shadow-sm" :class="pwdOptions.avoidAmbiguous ? 'translate-x-5' : 'translate-x-0'"></div>
          </div>
          <input type="checkbox" v-model="pwdOptions.avoidAmbiguous" @change="generate" class="hidden">
        </label>
      </div>

      <!-- Passphrase Options -->
      <div v-if="activeTab === 'passphrase'" class="flex flex-col gap-6">
        <div>
          <div class="flex justify-between items-end mb-3">
            <span class="text-sm font-semibold tracking-wide uppercase" :class="isDark ? 'text-slate-400' : 'text-slate-500'">Number of Words</span>
            <span class="font-mono text-xl font-bold" :class="isDark ? 'text-white' : 'text-slate-800'">{{ passOptions.words }}</span>
          </div>
          <input type="range" v-model.number="passOptions.words" min="3" max="20" @input="generate"
                 class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-xl appearance-none cursor-pointer accent-indigo-600">
        </div> 
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <span class="text-xs font-semibold uppercase tracking-wider" :class="isDark ? 'text-slate-400' : 'text-slate-500'">Word Separator</span>
            <input type="text" v-model="passOptions.separator" @input="generate" class="w-full p-2.5 rounded-2xl text-sm font-mono outline-none border focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm" :class="isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'">
          </div>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label class="flex justify-between items-center cursor-pointer p-3 rounded-2xl border transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80" :class="isDark ? 'border-slate-700' : 'border-slate-200'">
            <span class="text-sm font-medium" :class="isDark ? 'text-slate-200' : 'text-slate-700'">Capitalize Words</span>
            <div class="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 border" :class="passOptions.capitalize ? 'bg-indigo-500 border-indigo-500' : (isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-200 border-slate-300')">
              <div class="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 shadow-sm" :class="passOptions.capitalize ? 'translate-x-5' : 'translate-x-0'"></div>
            </div>
            <input type="checkbox" v-model="passOptions.capitalize" @change="generate" class="hidden">
          </label>
          <label class="flex justify-between items-center cursor-pointer p-3 rounded-2xl border transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/80" :class="isDark ? 'border-slate-700' : 'border-slate-200'">
            <span class="text-sm font-medium" :class="isDark ? 'text-slate-200' : 'text-slate-700'">Include Number</span>
            <div class="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 border" :class="passOptions.includeNumber ? 'bg-indigo-500 border-indigo-500' : (isDark ? 'bg-slate-700 border-slate-600' : 'bg-slate-200 border-slate-300')">
              <div class="absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 shadow-sm" :class="passOptions.includeNumber ? 'translate-x-5' : 'translate-x-0'"></div>
            </div>
            <input type="checkbox" v-model="passOptions.includeNumber" @change="generate" class="hidden">
          </label>
        </div>
      </div>

      <!-- Username Options -->
      <div v-if="activeTab === 'username'" class="flex flex-col gap-5">
        <div class="flex flex-col gap-2">
          <span class="text-xs font-semibold uppercase tracking-wider" :class="isDark ? 'text-slate-400' : 'text-slate-500'">Generation Type</span>
          <select v-model="userOptions.type" @change="generate" class="w-full p-2.5 rounded-2xl text-sm font-medium outline-none border transition-all shadow-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20fill%3D%22none%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center]" :class="isDark ? 'bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-indigo-500/20' : 'bg-white border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500/20'">
            <option value="catchall">Catch-all Alias (random@domain.com)</option>
            <option value="plus">Plus Address (email+random@gmail.com)</option>
            <option value="word">Classic Random Word (e.g. apple42)</option>
          </select>
        </div>
        <div v-if="userOptions.type !== 'word'" class="flex flex-col gap-2">
          <span class="text-xs font-semibold uppercase tracking-wider" :class="isDark ? 'text-slate-400' : 'text-slate-500'">{{ userOptions.type === 'catchall' ? 'Your Domain' : 'Base Email Prefix' }}</span>
          <input type="text" v-model="userOptions.domain" @input="generate" :placeholder="userOptions.type === 'catchall' ? 'example.com' : 'myname'" class="w-full p-2.5 rounded-2xl text-sm font-mono outline-none border transition-all shadow-sm" :class="isDark ? 'bg-slate-900 border-slate-700 text-white focus:ring-2 focus:ring-indigo-500/20' : 'bg-white border-slate-200 text-slate-900 focus:ring-2 focus:ring-indigo-500/20'">
        </div>
      </div>

      <!-- Hash Tools -->
      <div v-if="activeTab === 'hash'" class="flex flex-col gap-5">
        <div class="flex p-1 rounded-xl w-fit" :class="isDark ? 'bg-slate-900 border border-slate-700' : 'bg-slate-100 border border-slate-200'">
          <button @click="hashMode = 'encode'" class="px-4 py-1.5 rounded-md text-xs font-bold transition-all" :class="hashMode === 'encode' ? (isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-800 shadow-sm') : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'">ENCODE</button>
          <button @click="hashMode = 'decode'" class="px-4 py-1.5 rounded-md text-xs font-bold transition-all" :class="hashMode === 'decode' ? (isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-slate-800 shadow-sm') : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white'">DECODE</button>
        </div>

        <div v-if="hashMode === 'encode'" class="flex flex-col gap-3">
          <div v-for="(val, label) in { 'MD5': hashOutput.md5, 'SHA-1': hashOutput.sha1, 'SHA-256': hashOutput.sha256, 'Base64': hashOutput.base64 }" :key="label" class="flex items-center justify-between p-3 rounded-2xl border transition-colors group" :class="isDark ? 'bg-slate-900/50 border-slate-700/50 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'">
            <span class="text-xs font-bold tracking-widest w-20 shrink-0" :class="isDark ? 'text-slate-500 group-hover:text-slate-400' : 'text-slate-400 group-hover:text-slate-500'">{{ label }}</span>
            <div class="flex-1 font-mono text-sm truncate mx-3 select-all" :class="isDark ? 'text-slate-300' : 'text-slate-700'">{{ val || '-' }}</div>
            <button @click="copy(val)" class="w-8 h-8 flex items-center justify-center rounded-xl transition-all opacity-0 group-hover:opacity-100 shrink-0" :class="isDark ? 'bg-slate-800 text-slate-400 hover:text-indigo-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:text-indigo-600 hover:bg-slate-200'">
              <span class="material-symbols-outlined text-[15px]">content_copy</span>
            </button>
          </div>
        </div>

        <div v-else class="flex flex-col gap-4">
          <div v-if="decodeResult.type" class="p-5 rounded-2xl border" :class="isDark ? 'bg-indigo-900/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'">
            <div class="text-[10px] uppercase tracking-widest font-bold text-indigo-500 mb-2">Detected Match: {{ decodeResult.type }}</div>
            <div class="font-mono text-lg break-all" :class="isDark ? 'text-indigo-100' : 'text-indigo-900'">{{ decodeResult.text }}</div>
          </div>
          <div v-else-if="hashInput" class="p-5 rounded-2xl border border-dashed flex flex-col items-center justify-center gap-3 text-center" :class="isDark ? 'border-slate-700 bg-slate-900/30' : 'border-slate-300 bg-slate-50'">
            <span v-if="isDecoding" class="material-symbols-outlined text-2xl animate-spin text-slate-400">refresh</span>
            <span v-else class="material-symbols-outlined text-2xl text-slate-400">search_off</span>
            <span class="text-sm font-medium" :class="isDark ? 'text-slate-400' : 'text-slate-500'">{{ isDecoding ? 'Searching Rainbow Tables...' : 'No valid match found.' }}</span>
          </div>
          <div class="text-xs p-4 rounded-2xl border" :class="isDark ? 'bg-slate-800/40 border-slate-700/50 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'">
            <p class="mb-1"><strong :class="isDark ? 'text-slate-300' : 'text-slate-700'">Supported decodes:</strong> Base64, MD5 (via rainbow table lookup).</p>
            <p class="opacity-80"><em>Note: SHA-family hashes are highly secure and typically cannot be unhashed.</em></p>
          </div>
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
  { id: 'hash', label: 'Hash and Crypto' },
]

const activeTab = ref('password')
const generatedOutput = ref('')
const hashInput = ref('')
const hashMode = ref('encode')
const isDecoding = ref(false)
const decodeResult = reactive({ type: '', text: '' })

const pwdOptions = reactive({ length: 14, uppercase: true, lowercase: true, numbers: true, special: false, avoidAmbiguous: false })
const passOptions = reactive({ words: 4, separator: '-', capitalize: false, includeNumber: false })
const userOptions = reactive({ type: 'catchall', domain: 'example.com' })
const hashOutput = reactive({ md5: '', sha1: '', sha256: '', base64: '' })

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
  const specials = "!@#$%^*"
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

async function tryDecode(text: string) {
  decodeResult.type = ''
  decodeResult.text = ''
  if (!text) return
  
  const clean = text.trim()
  
  try {
    const decoded = decodeURIComponent(escape(atob(clean)))
    if (btoa(unescape(encodeURIComponent(decoded))) === clean || clean.endsWith('=')) {
      decodeResult.type = 'Base64'
      decodeResult.text = decoded
      return
    }
  } catch(e) {}

  const isMD5 = /^[a-f0-9]{32}$/i.test(clean)
  const isSHA1 = /^[a-f0-9]{40}$/i.test(clean)
  const isSHA256 = /^[a-f0-9]{64}$/i.test(clean)
  
  if (isMD5 || isSHA1 || isSHA256) {
    isDecoding.value = true
    try {
      const type = isMD5 ? 'md5' : isSHA1 ? 'sha1' : 'sha256'
      const res = await $fetch<{success: boolean, result?: string, message?: string}>(`/api/tools/unhash?hash=${clean}&type=${type}`)
      if (res.success && res.result) {
        decodeResult.type = type.toUpperCase()
        decodeResult.text = res.result
      } else {
        decodeResult.type = `${type.toUpperCase()} (Not Found)`
        decodeResult.text = 'The original text is not found in public rainbow tables.'
      }
    } catch (e) {
      decodeResult.type = 'Error'
      decodeResult.text = 'Failed to lookup hash'
    } finally {
      isDecoding.value = false
    }
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

let timeoutId: any = null
watch(activeTab, () => generate())
watch(hashInput, (val) => {
  if (hashMode.value === 'encode') {
    computeHashes(val)
  } else {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => tryDecode(val), 500)
  }
})
watch(hashMode, (val) => {
  if (val === 'encode') computeHashes(hashInput.value)
  else tryDecode(hashInput.value)
})

onMounted(() => {
  generate()
})
</script>

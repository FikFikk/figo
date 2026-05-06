<template>
  <div class="glass-panel rounded-2xl p-6 md:p-8 mb-10" :class="isDark ? 'border border-white/5' : 'border border-slate-100'">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="isDark ? 'bg-primary/15' : 'bg-blue-50'">
          <span class="material-symbols-outlined text-xl text-primary">qr_code_2</span>
        </div>
        <div>
          <h2 class="font-headline font-bold text-lg" :class="isDark ? 'text-white' : 'text-slate-900'">QR Engine</h2>
          <p class="text-xs" :class="isDark ? 'text-gray-500' : 'text-slate-400'">Generate & customize QR codes instantly</p>
        </div>
      </div>
    </div>

    <div class="space-y-5">

      <!-- Atas: Input -->
      <div>
        <!-- Input Text / URL -->
        <div>
          <label class="text-[10px] font-black uppercase tracking-widest opacity-50 mb-2 block">Content Type</label>
          <div class="flex gap-1.5 mb-4 overflow-x-auto pb-2 no-scrollbar">
            <button v-for="t in contentTypes" :key="t.id" @click="contentType = t.id"
              class="flex items-center gap-1 px-3 py-2 rounded-2xl text-[10px] font-bold transition-all relative whitespace-nowrap flex-shrink-0"
              :class="contentType === t.id ? 'bg-primary text-white shadow-sm' : (t.soon ? 'bg-black/5 dark:bg-white/5 text-slate-400 dark:text-gray-600' : 'bg-black/5 dark:bg-white/5 text-slate-500 hover:text-slate-700 dark:hover:text-gray-300')"
            >
              <span class="material-symbols-outlined text-xs">{{ t.icon }}</span>
              {{ t.label }}
              <span v-if="t.soon" class="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
            </button>
          </div>

          <!-- Coming Soon Overlay -->
          <div v-if="isComingSoon" class="rounded-2xl border-2 border-dashed p-8 text-center" :class="isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'">
            <span class="material-symbols-outlined text-4xl mb-2 block" :class="isDark ? 'text-gray-600' : 'text-slate-300'">construction</span>
            <p class="font-bold text-sm mb-1">Coming Soon</p>
            <p class="text-xs opacity-50">Fitur ini membutuhkan file hosting dan sedang dalam pengembangan.</p>
          </div>

          <!-- Text / URL -->
          <div v-if="!isComingSoon && (contentType === 'text' || contentType === 'url')">
            <textarea v-model="inputText" :placeholder="contentType === 'url' ? 'https://example.com' : 'Enter any text...'" rows="3"
              class="w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all outline-none resize-none"
              :class="isDark ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10 focus:border-primary/40' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 focus:border-primary'"></textarea>
          </div>

          <!-- WiFi -->
          <div v-if="!isComingSoon && contentType === 'wifi'" class="space-y-3">
            <input v-model="wifiSSID" placeholder="Network Name (SSID)" class="w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all outline-none" :class="isDark ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10 focus:border-primary/40' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 focus:border-primary'" />
            <input v-model="wifiPassword" :type="showWifiPass ? 'text' : 'password'" placeholder="Password" class="w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all outline-none" :class="isDark ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10 focus:border-primary/40' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200 focus:border-primary'" />
            <div class="flex items-center gap-4">
              <select v-model="wifiEncryption" class="px-3 py-2 rounded-2xl text-xs font-bold outline-none border" :class="isDark ? 'bg-black/20 border-white/10 text-white' : 'bg-slate-50 border-slate-200'">
                <option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">Open</option>
              </select>
              <label class="flex items-center gap-2 cursor-pointer select-none"><input type="checkbox" v-model="showWifiPass" class="rounded accent-primary w-4 h-4"><span class="text-xs">Show</span></label>
            </div>
          </div>

          <!-- vCard -->
          <div v-if="!isComingSoon && contentType === 'vcard'" class="grid grid-cols-2 gap-3">
            <input v-model="vcard.name" placeholder="Full Name" class="col-span-2 w-full px-4 py-3 rounded-2xl text-sm outline-none" :class="isDark ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200'" />
            <input v-model="vcard.phone" placeholder="Phone" class="w-full px-4 py-3 rounded-2xl text-sm outline-none" :class="isDark ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200'" />
            <input v-model="vcard.email" placeholder="Email" class="w-full px-4 py-3 rounded-2xl text-sm outline-none" :class="isDark ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200'" />
            <input v-model="vcard.org" placeholder="Organization" class="col-span-2 w-full px-4 py-3 rounded-2xl text-sm outline-none" :class="isDark ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200'" />
          </div>

          <!-- Email -->
          <div v-if="!isComingSoon && contentType === 'email'" class="space-y-3">
            <input v-model="emailTo" placeholder="Recipient (e.g. hello@mail.com)" class="w-full px-4 py-3 rounded-2xl text-sm outline-none" :class="isDark ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200'" />
            <input v-model="emailSubject" placeholder="Subject (optional)" class="w-full px-4 py-3 rounded-2xl text-sm outline-none" :class="isDark ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200'" />
            <textarea v-model="emailBody" placeholder="Body (optional)" rows="2" class="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none" :class="isDark ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200'"></textarea>
          </div>

          <!-- Phone -->
          <div v-if="!isComingSoon && contentType === 'phone'">
            <input v-model="phoneNumber" placeholder="+62 812 3456 7890" class="w-full px-4 py-3 rounded-2xl text-sm outline-none" :class="isDark ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200'" />
          </div>

          <!-- SMS -->
          <div v-if="!isComingSoon && contentType === 'sms'" class="space-y-3">
            <input v-model="smsNumber" placeholder="Phone number (+62...)" class="w-full px-4 py-3 rounded-2xl text-sm outline-none" :class="isDark ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200'" />
            <textarea v-model="smsBody" placeholder="Message (optional)" rows="2" class="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none" :class="isDark ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200'"></textarea>
          </div>

          <!-- WhatsApp -->
          <div v-if="!isComingSoon && contentType === 'whatsapp'" class="space-y-3">
            <input v-model="waNumber" placeholder="Phone number (e.g. 6281234567890)" class="w-full px-4 py-3 rounded-2xl text-sm outline-none" :class="isDark ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200'" />
            <textarea v-model="waMessage" placeholder="Pre-filled message (optional)" rows="2" class="w-full px-4 py-3 rounded-2xl text-sm outline-none resize-none" :class="isDark ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200'"></textarea>
          </div>

          <!-- Map / Location -->
          <div v-if="!isComingSoon && contentType === 'map'" class="space-y-3">
            <input v-model="mapQuery" placeholder="Search location (e.g. Monas, Jakarta)" class="w-full px-4 py-3 rounded-2xl text-sm outline-none" :class="isDark ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200'" />
            <p class="text-[10px] opacity-40 font-bold text-center">— OR use coordinates —</p>
            <div class="grid grid-cols-2 gap-3">
              <input v-model="mapLat" placeholder="Latitude" class="w-full px-4 py-3 rounded-2xl text-sm outline-none" :class="isDark ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200'" />
              <input v-model="mapLng" placeholder="Longitude" class="w-full px-4 py-3 rounded-2xl text-sm outline-none" :class="isDark ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200'" />
            </div>
          </div>

          <!-- Social Media -->
          <div v-if="!isComingSoon && contentType === 'social'" class="space-y-3">
            <input v-model="socialUrl" placeholder="https://instagram.com/yourprofile" class="w-full px-4 py-3 rounded-2xl text-sm outline-none" :class="isDark ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200'" />
            <div class="flex flex-wrap gap-1.5">
              <button v-for="s in ['instagram.com/', 'tiktok.com/@', 'x.com/', 'linkedin.com/in/', 'youtube.com/@', 'facebook.com/', 'github.com/', 'reddit.com/u/', 'snapchat.com/add/', 'spotify.com/']" :key="s" @click="socialUrl = 'https://' + s"
                class="px-2 py-1 rounded-2xl text-[9px] font-bold" :class="isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'">
                {{ s.split('.')[0] }}
              </button>
            </div>
          </div>

          <!-- Calendar Event -->
          <div v-if="!isComingSoon && contentType === 'calendar'" class="space-y-3">
            <input v-model="calTitle" placeholder="Event Title" class="w-full px-4 py-3 rounded-2xl text-sm outline-none" :class="isDark ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200'" />
            <div class="grid grid-cols-2 gap-3">
              <div><span class="text-[10px] opacity-50 font-bold block mb-1">Start</span><input v-model="calStart" type="datetime-local" class="w-full px-3 py-2.5 rounded-2xl text-xs outline-none border" :class="isDark ? 'bg-black/20 border-white/10 text-white' : 'bg-slate-50 border-slate-200'" /></div>
              <div><span class="text-[10px] opacity-50 font-bold block mb-1">End</span><input v-model="calEnd" type="datetime-local" class="w-full px-3 py-2.5 rounded-2xl text-xs outline-none border" :class="isDark ? 'bg-black/20 border-white/10 text-white' : 'bg-slate-50 border-slate-200'" /></div>
            </div>
            <input v-model="calLocation" placeholder="Location (optional)" class="w-full px-4 py-3 rounded-2xl text-sm outline-none" :class="isDark ? 'bg-white/5 text-white placeholder-gray-600 border border-white/10' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200'" />
          </div>
        </div>
      </div>

      <!-- Bawah: Centered Preview -->
      <div class="flex flex-col items-center justify-center gap-6 relative">

        <!-- Kiri: Customization (Now always a Modal) -->
        <div>
          <!-- Floating Button (All Devices) -->
          <ClientOnly>
            <Teleport to="body">
              <div v-show="!showMobileControls" class="fixed bottom-[100px] left-1/2 -translate-x-1/2 z-[100] sm:bottom-10">
                <button @click="showMobileControls = true" class="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-black text-[11px] uppercase tracking-wider shadow-2xl shadow-black/30 hover:scale-105 active:scale-95 transition-all">
                  <span class="material-symbols-outlined text-sm">tune</span>
                  Controls
                </button>
              </div>
            </Teleport>
          </ClientOnly>

          <!-- Customization Modal -->
          <ClientOnly>
            <Teleport to="body">
              <Transition
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="transform translate-y-full opacity-0"
                enter-to-class="transform translate-y-0 opacity-100"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="transform translate-y-0 opacity-100"
                leave-to-class="transform translate-y-full opacity-0"
              >
                <div v-show="showMobileControls" class="fixed inset-0 z-[110] flex flex-col justify-end pb-[80px] sm:pb-0 sm:justify-center sm:items-center">
                  <!-- Backdrop -->
                  <div @click="showMobileControls = false" class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>

                <div :class="[
                  'relative z-10 w-full sm:w-[480px] max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-t-[2rem] sm:rounded-3xl border p-5 shadow-2xl transition-transform duration-300',
                  isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
                ]">
                <!-- Header/Close -->
                <div class="flex justify-between items-center mb-6 sticky top-0 bg-inherit z-20 py-2 -mx-2 px-2">
                  <h3 class="font-bold text-xs uppercase tracking-widest opacity-50">QR Controls</h3>
                  <button @click="showMobileControls = false" class="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/20 transition-all">
                    <span class="material-symbols-outlined text-sm opacity-70">close</span>
                  </button>
                </div>

              <!-- Customize Tabs -->
            <div class="flex gap-1 mb-4 p-1 rounded-2xl" :class="isDark ? 'bg-black/20' : 'bg-slate-100'">
              <button v-for="tab in ['Style', 'Frames', 'Shapes']" :key="tab" @click="customizeTab = tab"
                class="flex-1 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all"
                :class="customizeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-gray-300'"
              >{{ tab }}</button>
            </div>

            <!-- Tab: Style -->
            <div v-if="customizeTab === 'Style'" class="grid grid-cols-2 gap-4">
              <div>
                <div class="flex justify-between text-xs mb-2"><span class="opacity-60 font-bold">Size</span><span class="font-bold font-mono">{{ qrSize }}px</span></div>
                <input type="range" v-model.number="qrSize" min="100" max="1000" step="50" class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-2xl appearance-none cursor-pointer accent-primary" />
              </div>
              <div>
                <span class="text-xs opacity-60 font-bold block mb-2">Error Correction</span>
                <div class="flex gap-1">
                  <button v-for="ec in ['L', 'M', 'Q', 'H']" :key="ec" @click="errorCorrection = ec" class="flex-1 py-1.5 rounded-2xl text-[10px] font-black transition-all" :class="errorCorrection === ec ? 'bg-primary text-white shadow-sm' : 'bg-black/5 dark:bg-white/5 text-slate-500'">{{ ec }}</button>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <input type="color" v-model="darkColor" class="w-8 h-8 rounded-2xl overflow-hidden border-0 p-0 cursor-pointer bg-transparent flex-shrink-0" />
                <div><span class="text-[10px] opacity-60 font-bold block">Foreground</span><span class="text-xs font-mono font-bold">{{ darkColor }}</span></div>
              </div>
              <div class="flex items-center gap-3">
                <input type="color" v-model="lightColor" class="w-8 h-8 rounded-2xl overflow-hidden border-0 p-0 cursor-pointer bg-transparent flex-shrink-0" />
                <div><span class="text-[10px] opacity-60 font-bold block">Background</span><span class="text-xs font-mono font-bold">{{ lightColor }}</span></div>
              </div>
              <div>
                <div class="flex justify-between text-xs mb-2"><span class="opacity-60 font-bold">Margin</span><span class="font-bold font-mono">{{ qrMargin }}</span></div>
                <input type="range" v-model.number="qrMargin" min="0" max="10" step="1" class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-2xl appearance-none cursor-pointer accent-primary" />
              </div>
              <div>
                <span class="text-xs opacity-60 font-bold block mb-2">Format</span>
                <div class="flex gap-1">
                  <button v-for="f in ['PNG', 'SVG']" :key="f" @click="qrFormat = f.toLowerCase()" class="flex-1 py-1.5 rounded-2xl text-[10px] font-black transition-all" :class="qrFormat === f.toLowerCase() ? 'bg-primary text-white shadow-sm' : 'bg-black/5 dark:bg-white/5 text-slate-500'">{{ f }}</button>
                </div>
              </div>
            </div>

            <!-- Tab: Frames -->
            <div v-if="customizeTab === 'Frames'">
              <!-- Pre-Made Templates -->
              <div class="mb-5">
                <p class="text-[10px] opacity-50 font-bold mb-3">Pre-Made Templates</p>
                <div class="flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x items-center">
                  <button v-for="t in templateList" :key="t.id" @click="selectTemplate(t.id)"
                    class="flex-shrink-0 snap-center rounded-2xl border-2 flex flex-col items-center justify-center gap-1 p-2 min-w-[76px] transition-all hover:scale-105"
                    :class="selectedTemplate === t.id ? 'border-primary bg-primary/10 shadow-md' : (isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50')"
                  >
                    <canvas :ref="(el: any) => tplCanvasRefs[t.id] = el" width="60" height="60" class="w-[60px] h-[60px]"></canvas>
                    <span class="text-[9px] font-bold opacity-70 leading-none mt-1">{{ t.label }}</span>
                  </button>
                </div>
              </div>

              <!-- Structural Frames -->
              <div>
                <p class="text-[10px] opacity-50 font-bold mb-3">Frames</p>
                <div class="grid grid-cols-4 gap-2 mb-4">
                  <button v-for="f in frameOptions" :key="f.id" @click="selectedFrame = f.id; selectedTemplate = 'none'"
                    class="aspect-square rounded-2xl border-2 flex items-center justify-center p-2 transition-all hover:scale-105"
                    :class="selectedFrame === f.id ? 'border-primary bg-primary/10 shadow-md' : (isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50')"
                  >
                    <div class="w-full h-full flex items-center justify-center text-[9px] font-bold opacity-70" :class="f.id === 'none' ? '' : f.previewClass">{{ f.label }}</div>
                  </button>
                </div>
                <div>
                  <label class="text-[10px] font-bold opacity-50 block mb-1.5">Additional Text</label>
                  <input v-model="frameText" placeholder="e.g. SCAN ME" class="w-full px-3 py-2 rounded-2xl text-xs outline-none" :class="isDark ? 'bg-black/20 border border-white/10 text-white' : 'bg-slate-50 border border-slate-200 text-slate-900'" />
                </div>
              </div>
            </div>

            <!-- Tab: Shapes -->
            <div v-if="customizeTab === 'Shapes'">
              <div class="flex items-center justify-between mb-3">
                <p class="text-[10px] opacity-50 font-bold">Body Shapes</p>
                <button v-if="shapeOptions.length > 8" @click="showAllShapes = !showAllShapes" class="text-[10px] text-primary font-bold flex items-center gap-0.5 hover:underline">
                  {{ showAllShapes ? 'View Less' : 'View More' }}
                  <span class="material-symbols-outlined text-xs">{{ showAllShapes ? 'expand_less' : 'expand_more' }}</span>
                </button>
              </div>
              <div class="grid grid-cols-4 gap-2 mb-5">
                <button v-for="s in visibleShapes" :key="s.id" @click="selectedShape = s.id"
                  class="aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 p-1.5 transition-all hover:scale-105"
                  :class="selectedShape === s.id ? 'border-primary bg-primary/10 shadow-md' : (isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50')"
                >
                  <canvas :ref="(el: any) => shapeCanvasRefs[s.id] = el" width="40" height="40" class="w-10 h-10"></canvas>
                  <span class="text-[7px] font-bold opacity-50 leading-none">{{ s.label }}</span>
                </button>
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <!-- External Eye -->
                <div>
                  <p class="text-[10px] opacity-50 font-bold mb-3">External Eye</p>
                  <div class="grid grid-cols-2 gap-2">
                    <button v-for="e in eyeOptions" :key="e.id" @click="selectedExternalEye = e.id"
                      class="aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 p-1 transition-all hover:scale-105"
                      :class="selectedExternalEye === e.id ? 'border-primary bg-primary/10 shadow-md' : (isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50')"
                    >
                      <div class="w-5 h-5 flex items-center justify-center">
                        <div :class="e.previewClass"></div>
                      </div>
                      <span class="text-[6px] font-bold opacity-50 leading-none">{{ e.label }}</span>
                    </button>
                  </div>
                </div>

                <!-- Internal Eye -->
                <div>
                  <p class="text-[10px] opacity-50 font-bold mb-3">Internal Eye</p>
                  <div class="grid grid-cols-2 gap-2">
                    <button v-for="e in eyeOptions" :key="e.id" @click="selectedInternalEye = e.id"
                      class="aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 p-1 transition-all hover:scale-105"
                      :class="selectedInternalEye === e.id ? 'border-primary bg-primary/10 shadow-md' : (isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50')"
                    >
                      <div class="w-5 h-5 flex items-center justify-center">
                        <div :class="e.previewClass" class="bg-current border-none h-3 w-3"></div>
                      </div>
                      <span class="text-[6px] font-bold opacity-50 leading-none">{{ e.label }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </div>
            </div>
              </Transition>
            </Teleport>
          </ClientOnly>
        </div>

        <!-- Kanan: Preview -->
        <div class="flex flex-col items-center gap-4 w-full">
          <div class="w-full aspect-square max-w-[340px] rounded-2xl flex items-center justify-center overflow-hidden transition-all relative"
            :class="qrDataUrl ? 'bg-white' : (isDark ? 'border-2 border-dashed border-white/10 bg-white/5' : 'border-2 border-dashed border-slate-200 bg-slate-50')"
          >
            <canvas v-show="qrDataUrl && qrFormat === 'png'" ref="qrCanvas" class="w-full h-full object-contain" :class="selectedFrame !== 'none' ? 'p-6' : 'p-4'"></canvas>
            <div v-if="qrDataUrl && qrFormat === 'svg'" v-html="qrDataUrl" class="w-full h-full flex items-center justify-center p-4 [&>svg]:w-full [&>svg]:h-full"></div>
            <div v-if="!qrDataUrl" class="text-center p-6">
              <span class="material-symbols-outlined text-5xl mb-3 block" :class="isDark ? 'text-gray-700' : 'text-slate-300'">qr_code_2</span>
              <p class="text-xs font-medium" :class="isDark ? 'text-gray-600' : 'text-slate-400'">QR preview will appear here</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div v-if="qrDataUrl" class="flex gap-2 w-full max-w-[340px]">
            <button @click="downloadQR" class="flex-1 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              :class="isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'">
              <span class="material-symbols-outlined text-sm">download</span>
              Download Image
            </button>
            <button v-if="isBasicQR" @click="copyApiUrl" class="flex-1 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all relative"
              :class="isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'">
              <span class="material-symbols-outlined text-sm transition-transform duration-300" :class="apiCopied ? 'scale-0' : 'scale-100'">link</span>
              <span class="material-symbols-outlined text-sm text-green-500 absolute transition-transform duration-300" :class="apiCopied ? 'scale-100' : 'scale-0'">check</span>
              <span>{{ apiCopied ? 'Copied!' : 'Copy API' }}</span>
            </button>
          </div>

          <!-- API Info & Warnings -->
          <div v-if="qrDataUrl">
            <div v-if="isBasicQR" class="w-full max-w-[340px] rounded-2xl p-3 text-[10px] font-mono break-all leading-relaxed"
              :class="isDark ? 'bg-black/30 text-gray-400 border border-white/5' : 'bg-slate-50 text-slate-500 border border-slate-100'">
              <span class="text-primary font-bold">GET</span> {{ apiUrl }}
            </div>
            <div v-else class="w-full max-w-[340px] rounded-2xl p-3 text-[10px] flex items-start gap-2"
              :class="isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-200'">
              <span class="material-symbols-outlined text-[14px] mt-0.5">info</span>
              <p class="leading-relaxed"><strong>Custom Templates & Shapes</strong> diproses secara eksklusif di perangkat Anda (Client-Side Canvas) demi performa. Fitur Public API hanya mendukung QR Code standar.</p>
            </div>
          </div>

          <!-- Rate Limit Info -->
          <div class="w-full max-w-[340px] rounded-2xl p-3 border text-[10px]"
            :class="isDark ? 'bg-white/5 border-white/5 text-gray-500' : 'bg-slate-50 border-slate-100 text-slate-400'">
            <div class="flex items-center gap-1.5 mb-1">
              <span class="material-symbols-outlined text-xs">speed</span>
              <span class="font-bold uppercase tracking-wider">Public API Rate Limit</span>
            </div>
            <p>{{ RATE_LIMIT }} requests / minute per IP</p>
            <p class="mt-1 opacity-70">Supports: text, size, format (png/svg), dark, light, ec (L/M/Q/H), margin</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'
import QRCode from 'qrcode'
import { templateList, getTemplate } from '~/composables/qrTemplates'

const { isDark } = useColorMode()
const { increment } = useHistoryCounter()
const RATE_LIMIT = 30

// Tipe konten QR — aktif dan coming soon
const contentTypes = [
  { id: 'url', label: 'URL', icon: 'link', soon: false },
  { id: 'text', label: 'Text', icon: 'text_fields', soon: false },
  { id: 'wifi', label: 'WiFi', icon: 'wifi', soon: false },
  { id: 'vcard', label: 'vCard', icon: 'contact_page', soon: false },
  { id: 'email', label: 'Email', icon: 'mail', soon: false },
  { id: 'phone', label: 'Phone', icon: 'call', soon: false },
  { id: 'sms', label: 'SMS', icon: 'sms', soon: false },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'chat', soon: false },
  { id: 'map', label: 'Location', icon: 'location_on', soon: false },
  { id: 'social', label: 'Social Media', icon: 'share', soon: false },
  { id: 'calendar', label: 'Calendar', icon: 'event', soon: false },
  { id: 'image', label: 'Image', icon: 'image', soon: true },
  { id: 'pdf', label: 'PDF', icon: 'picture_as_pdf', soon: true },
  { id: 'file', label: 'File', icon: 'attach_file', soon: true },
]
const contentType = ref('url')

// Input state
const inputText = ref('')
const wifiSSID = ref('')
const wifiPassword = ref('')
const wifiEncryption = ref('WPA')
const showWifiPass = ref(false)
const vcard = reactive({ name: '', phone: '', email: '', org: '' })
const emailTo = ref('')
const emailSubject = ref('')
const emailBody = ref('')
const phoneNumber = ref('')
const smsNumber = ref('')
const smsBody = ref('')
const waNumber = ref('')
const waMessage = ref('')
const mapLat = ref('')
const mapLng = ref('')
const mapQuery = ref('')
const socialUrl = ref('')
const calTitle = ref('')
const calStart = ref('')
const calEnd = ref('')
const calLocation = ref('')

// QR options
const qrSize = ref(300)
const errorCorrection = ref('M')
const darkColor = ref('#000000')
const lightColor = ref('#ffffff')
const qrMargin = ref(2)
const qrFormat = ref('png')

// Customization state
const customizeTab = ref('Style')
const selectedFrame = ref('none')
const selectedShape = ref('square')
const selectedEye = ref('square')
const qrCanvas = ref<HTMLCanvasElement | null>(null)

// Pre-Made Templates (dari composable qrTemplates.ts)
const selectedTemplate = ref('none')
const tplCanvasRefs: Record<string, HTMLCanvasElement | null> = reactive({})

function selectTemplate(tId: string) {
  selectedTemplate.value = tId
  selectedFrame.value = 'none'
  const tpl = getTemplate(tId)
  if (tpl) {
    if (tpl.qrShape) selectedShape.value = tpl.qrShape
    if (tpl.qrExtEye) selectedExternalEye.value = tpl.qrExtEye
    if (tpl.qrIntEye) selectedInternalEye.value = tpl.qrIntEye
    if (tpl.qrDark) darkColor.value = tpl.qrDark
    if (tpl.qrLight) lightColor.value = tpl.qrLight
  }
}

// Frame options
const frameOptions = [
  { id: 'none', label: 'None', previewClass: '' },
  { id: 'text-bottom', label: 'Bottom Text', previewClass: 'border-b-4 border-current rounded-md w-full h-full' },
  { id: 'text-top', label: 'Top Text', previewClass: 'border-t-4 border-current rounded-md w-full h-full' },
  { id: 'badge', label: 'Badge', previewClass: 'border-4 border-current rounded-2xl w-full h-full shadow-lg' },
]

// Frame Text (bisa dikustomisasi)
const frameText = ref('SCAN ME')

// Shape options (body dots) — 14 variasi
const shapeOptions = [
  { id: 'square', label: 'Square' },
  { id: 'dot', label: 'Dot' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'star', label: 'Star' },
  { id: 'heart', label: 'Heart' },
  { id: 'hexagon', label: 'Hexagon' },
  { id: 'octagon', label: 'Octagon' },
  { id: 'cross', label: 'Cross' },
  { id: 'triangle', label: 'Triangle' },
  { id: 'thin', label: 'Thin' },
  { id: 'stripe', label: 'Stripe' },
  { id: 'classy', label: 'Classy' },
  { id: 'blob', label: 'Blob' },
]
const showAllShapes = ref(false)
const shapeCanvasRefs: Record<string, HTMLCanvasElement | null> = reactive({})
const visibleShapes = computed(() => showAllShapes.value ? shapeOptions : shapeOptions.slice(0, 8))

// Eye options (corner patterns)
const eyeOptions = [
  { id: 'square', label: 'Square', previewClass: 'w-5 h-5 border-[3px] border-current' },
  { id: 'rounded', label: 'Rounded', previewClass: 'w-5 h-5 border-[3px] border-current rounded-md' },
  { id: 'circle', label: 'Circle', previewClass: 'w-5 h-5 border-[3px] border-current rounded-full' },
  { id: 'leaf', label: 'Leaf', previewClass: 'w-5 h-5 border-[3px] border-current rounded-tl-xl rounded-br-xl' },
]

// State
const qrDataUrl = ref('')
const isGenerating = ref(false)
const apiCopied = ref(false)
const showMobileControls = ref(false)

// Cek apakah konfigurasi murni kotak dasar tanpa template / bentuk khusus
const isBasicQR = computed(() => 
  selectedTemplate.value === 'none' && 
  selectedFrame.value === 'none' && 
  selectedShape.value === 'square' && 
  selectedExternalEye.value === 'square' && 
  selectedInternalEye.value === 'square'
)

const isComingSoon = computed(() => contentTypes.find(t => t.id === contentType.value)?.soon ?? false)

const finalText = computed(() => {
  switch (contentType.value) {
    case 'url': case 'text': return inputText.value.trim()
    case 'wifi':
      if (!wifiSSID.value) return ''
      return `WIFI:T:${wifiEncryption.value};S:${wifiSSID.value};P:${wifiPassword.value};;`
    case 'vcard': {
      if (!vcard.name) return ''
      let vc = `BEGIN:VCARD\nVERSION:3.0\nFN:${vcard.name}`
      if (vcard.phone) vc += `\nTEL:${vcard.phone}`
      if (vcard.email) vc += `\nEMAIL:${vcard.email}`
      if (vcard.org) vc += `\nORG:${vcard.org}`
      return vc + `\nEND:VCARD`
    }
    case 'email': {
      if (!emailTo.value) return ''
      let url = `mailto:${emailTo.value}`
      const p: string[] = []
      if (emailSubject.value) p.push(`subject=${encodeURIComponent(emailSubject.value)}`)
      if (emailBody.value) p.push(`body=${encodeURIComponent(emailBody.value)}`)
      if (p.length) url += `?${p.join('&')}`
      return url
    }
    case 'phone': return phoneNumber.value ? `tel:${phoneNumber.value}` : ''
    case 'sms': return smsNumber.value ? (smsBody.value ? `smsto:${smsNumber.value}:${smsBody.value}` : `smsto:${smsNumber.value}`) : ''
    case 'whatsapp': {
      if (!waNumber.value) return ''
      const num = waNumber.value.replace(/[^0-9]/g, '')
      return waMessage.value ? `https://wa.me/${num}?text=${encodeURIComponent(waMessage.value)}` : `https://wa.me/${num}`
    }
    case 'map':
      if (mapQuery.value) return `https://maps.google.com/?q=${encodeURIComponent(mapQuery.value)}`
      if (mapLat.value && mapLng.value) return `geo:${mapLat.value},${mapLng.value}`
      return ''
    case 'social': return socialUrl.value.trim()
    case 'calendar': {
      if (!calTitle.value || !calStart.value) return ''
      const fmt = (d: string) => d.replace(/[-:]/g, '').replace('T', 'T') + '00'
      let ev = `BEGIN:VEVENT\nSUMMARY:${calTitle.value}\nDTSTART:${fmt(calStart.value)}`
      if (calEnd.value) ev += `\nDTEND:${fmt(calEnd.value)}`
      if (calLocation.value) ev += `\nLOCATION:${calLocation.value}`
      return ev + `\nEND:VEVENT`
    }
    default: return ''
  }
})

const apiUrl = computed(() => {
  if (!finalText.value) return ''
  const params = new URLSearchParams({
    text: finalText.value, size: String(qrSize.value), format: qrFormat.value,
    dark: darkColor.value, light: lightColor.value, ec: errorCorrection.value, margin: String(qrMargin.value),
  })
  return `/api/tools/qr?${params.toString()}`
})

// Render QR ke canvas dengan custom shapes
function renderQRCanvas(qrData: any) {
  const canvas = qrCanvas.value
  if (!canvas) return
  
  const baseSize = qrSize.value
  let frameWidth = baseSize
  let frameHeight = baseSize
  let qrOffsetX = 0
  let qrOffsetY = 0
  
  const frame = selectedFrame.value
  const template = selectedTemplate.value
  const isTemplate = template !== 'none'
  const pad = isTemplate ? baseSize * 0.15 : baseSize * 0.15 // padding for frame

  if (frame === 'text-bottom') {
    frameHeight = baseSize + pad
  } else if (frame === 'text-top') {
    frameHeight = baseSize + pad
    qrOffsetY = pad
  } else if (frame === 'badge') {
    frameWidth = baseSize + pad * 2
    frameHeight = baseSize + pad * 3
    qrOffsetX = pad
    qrOffsetY = pad
  } else if (isTemplate) {
    frameWidth = baseSize + pad * 2
    frameHeight = baseSize + pad * 2
    qrOffsetX = pad
    qrOffsetY = pad
  }

  canvas.width = frameWidth
  canvas.height = frameHeight
  const ctx = canvas.getContext('2d')!

  // Set Background Style
  if (isTemplate) {
    const tpl = getTemplate(template)
    if (tpl) {
      ctx.fillStyle = tpl.bgColor
      drawRoundRect(ctx, 0, 0, frameWidth, frameHeight, pad * 0.3)
      ctx.fill()
      
      // Panggil fungsi dekorasi template dan berikan callback untuk menggambar inner box
      tpl.draw(ctx, frameWidth, frameHeight, pad, () => {
        ctx.fillStyle = lightColor.value
        drawRoundRect(ctx, pad * 0.35, pad * 0.35, baseSize + pad * 1.3, baseSize + pad * 1.3, pad * 0.2)
        ctx.fill()
      })
    }
  } else {
     ctx.fillStyle = lightColor.value
  }

  // Draw background rect (non-template)
  if (!isTemplate) {
    if (frame === 'badge') {
      drawRoundRect(ctx, 0, 0, frameWidth, frameHeight, pad * 0.5)
      ctx.fill()
      ctx.lineWidth = pad * 0.1
      ctx.strokeStyle = darkColor.value
      ctx.stroke()
    } else {
      ctx.fillRect(0, 0, frameWidth, frameHeight)
    }
  }

  // Draw Text for Frames
  if (frame !== 'none' && frameText.value) {
    ctx.fillStyle = darkColor.value
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    let tx = frameWidth / 2
    let ty = 0
    let fontSize = pad * 0.4
    
    if (frame === 'text-bottom') { ty = baseSize + pad / 2 } 
    else if (frame === 'text-top') { ty = pad / 2 } 
    else if (frame === 'badge') { ty = frameHeight - pad; fontSize = pad * 0.5 }
    
    ctx.font = `bold ${fontSize}px sans-serif`
    if (ty !== 0) ctx.fillText(frameText.value, tx, ty)
  }

  // Draw border for text-top and text-bottom
  if (frame === 'text-bottom' || frame === 'text-top') {
    ctx.lineWidth = pad * 0.05
    ctx.strokeStyle = darkColor.value
    ctx.strokeRect(0, 0, frameWidth, frameHeight)
  }

  const modules = qrData.modules
  const moduleCount = modules.size
  const margin = qrMargin.value
  const cellSize = (baseSize - margin * 2) / moduleCount

  // Cek apakah posisi ini bagian dari finder pattern (eye)
  function isFinderModule(row: number, col: number) {
    return (row < 7 && col < 7) || (row < 7 && col >= moduleCount - 7) || (row >= moduleCount - 7 && col < 7)
  }

  // Render body modules
  ctx.fillStyle = darkColor.value
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (!modules.get(row, col)) continue
      if (isFinderModule(row, col)) continue
      const x = qrOffsetX + margin + col * cellSize
      const y = qrOffsetY + margin + row * cellSize
      drawShapeModule(ctx, x, y, cellSize, selectedShape.value)
    }
  }

  // Render finder patterns (eyes)
  renderFinderPattern(ctx, qrOffsetX + margin, qrOffsetY + margin, cellSize, 7)
  renderFinderPattern(ctx, qrOffsetX + margin + (moduleCount - 7) * cellSize, qrOffsetY + margin, cellSize, 7)
  renderFinderPattern(ctx, qrOffsetX + margin, qrOffsetY + margin + (moduleCount - 7) * cellSize, cellSize, 7)
}

// Menggambar satu modul QR berdasarkan shape
function drawShapeModule(ctx: CanvasRenderingContext2D, x: number, y: number, cellSize: number, shape: string) {
  const gap = cellSize * 0.1
  const s = cellSize - gap
  const cx = x + gap / 2
  const cy = y + gap / 2
  const mx = x + cellSize / 2
  const my = y + cellSize / 2
  const r = s / 2

  switch (shape) {
    case 'dot':
      ctx.beginPath(); ctx.arc(mx, my, r, 0, Math.PI * 2); ctx.fill(); break
    case 'rounded':
      drawRoundRect(ctx, cx, cy, s, s, s * 0.3); ctx.fill(); break
    case 'diamond':
      ctx.save(); ctx.translate(mx, my); ctx.rotate(Math.PI / 4)
      ctx.fillRect(-s * 0.35, -s * 0.35, s * 0.7, s * 0.7); ctx.restore(); break
    case 'star':
      drawStar(ctx, mx, my, r * 0.45, r, 5); ctx.fill(); break
    case 'heart':
      drawHeart(ctx, mx, my - r * 0.15, r * 0.85); ctx.fill(); break
    case 'hexagon':
      drawPolygon(ctx, mx, my, r * 0.9, 6); ctx.fill(); break
    case 'octagon':
      drawPolygon(ctx, mx, my, r * 0.9, 8); ctx.fill(); break
    case 'cross':
      const cw = s * 0.3
      ctx.fillRect(mx - cw / 2, cy, cw, s)
      ctx.fillRect(cx, my - cw / 2, s, cw); break
    case 'triangle':
      ctx.beginPath(); ctx.moveTo(mx, cy); ctx.lineTo(cx + s, cy + s); ctx.lineTo(cx, cy + s)
      ctx.closePath(); ctx.fill(); break
    case 'thin':
      ctx.fillRect(mx - s * 0.15, cy, s * 0.3, s); break
    case 'stripe':
      ctx.fillRect(cx, cy, s, s * 0.4)
      ctx.fillRect(cx, cy + s * 0.6, s, s * 0.4); break
    case 'classy':
      drawRoundRect(ctx, cx, cy, s, s, s * 0.15); ctx.fill()
      ctx.clearRect(cx + s * 0.15, cy + s * 0.15, s * 0.7, s * 0.7)
      drawRoundRect(ctx, cx + s * 0.25, cy + s * 0.25, s * 0.5, s * 0.5, s * 0.1); ctx.fill(); break
    case 'blob':
      ctx.beginPath()
      ctx.moveTo(mx, cy + s * 0.05)
      ctx.bezierCurveTo(cx + s * 0.8, cy, cx + s, cy + s * 0.3, cx + s * 0.9, my)
      ctx.bezierCurveTo(cx + s, cy + s * 0.7, cx + s * 0.7, cy + s, mx, cy + s * 0.95)
      ctx.bezierCurveTo(cx + s * 0.3, cy + s, cx, cy + s * 0.7, cx + s * 0.1, my)
      ctx.bezierCurveTo(cx, cy + s * 0.3, cx + s * 0.2, cy, mx, cy + s * 0.05)
      ctx.closePath(); ctx.fill(); break
    default: // square
      ctx.fillRect(cx, cy, s, s)
  }
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, inner: number, outer: number, points: number) {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const angle = (Math.PI / points) * i - Math.PI / 2
    const fn = i === 0 ? 'moveTo' : 'lineTo'
    ctx[fn](cx + r * Math.cos(angle), cy + r * Math.sin(angle))
  }
  ctx.closePath()
}

function drawHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.beginPath()
  ctx.moveTo(cx, cy + size * 0.4)
  ctx.bezierCurveTo(cx, cy, cx - size, cy, cx - size, cy + size * 0.35)
  ctx.bezierCurveTo(cx - size, cy + size * 0.7, cx, cy + size, cx, cy + size * 1.1)
  ctx.bezierCurveTo(cx, cy + size, cx + size, cy + size * 0.7, cx + size, cy + size * 0.35)
  ctx.bezierCurveTo(cx + size, cy, cx, cy, cx, cy + size * 0.4)
  ctx.closePath()
}

function drawPolygon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, sides: number) {
  ctx.beginPath()
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2
    const fn = i === 0 ? 'moveTo' : 'lineTo'
    ctx[fn](cx + r * Math.cos(angle), cy + r * Math.sin(angle))
  }
  ctx.closePath()
}

// Mini preview untuk shape picker
function renderShapePreviews() {
  nextTick(() => {
    const pattern = [
      [1,1,1,0,1],
      [1,0,1,1,0],
      [0,1,0,1,1],
      [1,1,1,0,1],
      [1,0,0,1,0],
    ]
    for (const s of visibleShapes.value) {
      const canvas = shapeCanvasRefs[s.id]
      if (!canvas) continue
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, 40, 40)
      const isDarkMode = isDark.value
      ctx.fillStyle = isDarkMode ? '#e2e8f0' : '#1e293b'
      const cell = 7
      const off = 1.5
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (!pattern[r][c]) continue
          drawShapeModule(ctx, off + c * cell, off + r * cell, cell, s.id)
        }
      }
    }
  })
}

// Eye state (External & Internal)
const selectedExternalEye = ref('square')
const selectedInternalEye = ref('square')

let debounceTimer: any = null
watch([
  finalText, qrSize, qrMargin, qrFormat, darkColor, lightColor, errorCorrection, 
  selectedShape, selectedExternalEye, selectedInternalEye, selectedFrame, frameText, selectedTemplate
], () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    generateQR()
  }, 1000)
}, { deep: true })

// Render preview untuk template options
function renderTemplatePreviews() {
  nextTick(() => {
    for (const t of templateList) {
      if (t.id === 'none') continue
      const canvas = tplCanvasRefs[t.id]
      if (!canvas) continue
      const ctx = canvas.getContext('2d')
      if (!ctx) continue
      
      const w = 60
      const h = 60
      const pad = 6
      
      const tpl = getTemplate(t.id)
      if (!tpl) continue
      
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = tpl.bgColor
      drawRoundRect(ctx, 0, 0, w, h, pad * 0.5)
      ctx.fill()
      
      // Panggil draw template dengan callback inner box
      tpl.draw(ctx, w, h, pad, () => {
        ctx.fillStyle = lightColor.value || '#ffffff'
        drawRoundRect(ctx, pad * 0.4, pad * 0.4, w - pad * 0.8, h - pad * 0.8, pad * 0.25)
        ctx.fill()
      })
    }
  })
}

// Render preview saat tab dibuka
watch([customizeTab, showAllShapes, () => isDark.value], ([tab]) => {
  if (tab === 'Shapes') renderShapePreviews()
  if (tab === 'Frames') renderTemplatePreviews()
}, { flush: 'post' })

onMounted(() => {
  if (customizeTab.value === 'Shapes') renderShapePreviews()
  if (customizeTab.value === 'Frames') renderTemplatePreviews()
})

function renderFinderPattern(ctx: CanvasRenderingContext2D, x: number, y: number, cellSize: number, count: number) {
  const outerSize = count * cellSize
  const midSize = 5 * cellSize
  const innerSize = 3 * cellSize
  const midOff = cellSize
  const innerOff = 2 * cellSize
  
  const extEye = selectedExternalEye.value
  const intEye = selectedInternalEye.value

  const extR = extEye === 'rounded' ? outerSize * 0.15 : extEye === 'circle' ? outerSize * 0.5 : extEye === 'leaf' ? outerSize * 0.25 : 0
  const intR = intEye === 'rounded' ? innerSize * 0.15 : intEye === 'circle' ? innerSize * 0.5 : intEye === 'leaf' ? innerSize * 0.25 : 0

  // Outer (dark)
  ctx.fillStyle = darkColor.value
  if (extEye === 'leaf') { drawLeafRect(ctx, x, y, outerSize, outerSize, extR); ctx.fill() }
  else { drawRoundRect(ctx, x, y, outerSize, outerSize, extR); ctx.fill() }

  // Middle (light)
  ctx.fillStyle = lightColor.value
  if (extEye === 'leaf') { drawLeafRect(ctx, x + midOff, y + midOff, midSize, midSize, extR * 0.7); ctx.fill() }
  else { drawRoundRect(ctx, x + midOff, y + midOff, midSize, midSize, extR * 0.7); ctx.fill() }

  // Inner (dark)
  ctx.fillStyle = darkColor.value
  if (intEye === 'leaf') { drawLeafRect(ctx, x + innerOff, y + innerOff, innerSize, innerSize, intR); ctx.fill() }
  else { drawRoundRect(ctx, x + innerOff, y + innerOff, innerSize, innerSize, intR); ctx.fill() }
}

function drawRoundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawLeafRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w, y)
  ctx.arcTo(x + w, y, x + w, y + h, 0)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.lineTo(x, y + h)
  ctx.arcTo(x, y + h, x, y, 0)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

async function generateQR() {
  if (!finalText.value || isComingSoon.value) return
  isGenerating.value = true
  try {
    if (qrFormat.value === 'svg') {
      qrDataUrl.value = await QRCode.toString(finalText.value, {
        errorCorrectionLevel: errorCorrection.value as 'L' | 'M' | 'Q' | 'H',
        margin: qrMargin.value, width: qrSize.value,
        color: { dark: darkColor.value, light: lightColor.value },
        type: 'svg',
      })
    } else {
      // Gunakan QRCode.create() untuk mendapatkan matrix data, lalu render custom di canvas
      const qrData = QRCode.create(finalText.value, {
        errorCorrectionLevel: errorCorrection.value as 'L' | 'M' | 'Q' | 'H',
      })
      qrDataUrl.value = 'canvas' // Penanda bahwa data sudah dirender
      await nextTick()
      renderQRCanvas(qrData)
    }
    increment()
  } catch (err: any) { console.error('QR generation error:', err) }
  finally { isGenerating.value = false }
}

function downloadQR() {
  if (!qrDataUrl.value) return
  const a = document.createElement('a')
  if (qrFormat.value === 'svg') {
    a.href = URL.createObjectURL(new Blob([qrDataUrl.value], { type: 'image/svg+xml' }))
    a.download = 'qr-code.svg'
  } else {
    // Export dari canvas
    const canvas = qrCanvas.value
    if (!canvas) return
    a.href = canvas.toDataURL('image/png')
    a.download = 'qr-code.png'
  }
  a.click()
}

function copyApiUrl() {
  if (!apiUrl.value) return
  navigator.clipboard.writeText(`${window.location.origin}${apiUrl.value}`)
  apiCopied.value = true
  setTimeout(() => { apiCopied.value = false }, 2000)
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>


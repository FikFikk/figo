<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm" @click.self="$emit('close')">
      <div 
        class="glass-panel w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-300"
        :class="isDark ? 'bg-neutral-900/90 border border-white/10' : 'bg-white/95 border border-slate-200 shadow-slate-200/50'"
      >
        <!-- Header Image/Pattern -->
        <div class="h-32 bg-gradient-to-br from-primary to-primary-container relative overflow-hidden">
          <div class="absolute inset-0 opacity-20 pattern-grid"></div>
          <button @click="$emit('close')" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-white transition-colors">
            <span class="material-symbols-outlined text-xl">close</span>
          </button>
          
          <div class="absolute bottom-6 left-8">
            <h2 class="text-white font-headline font-black text-2xl tracking-tight">Detail Tanggal</h2>
          </div>
        </div>

        <!-- Content -->
        <div class="p-8 space-y-8">
          <!-- Masehi Section -->
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-primary">calendar_today</span>
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Masehi</p>
              <p class="font-headline font-bold text-lg" :class="isDark ? 'text-white' : 'text-slate-900'">
                {{ info.masehi }}
              </p>
            </div>
          </div>

          <!-- Hijri Section -->
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-tertiary">foundation</span>
            </div>
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Hijriah</p>
              <p class="font-headline font-bold text-lg" :class="isDark ? 'text-white' : 'text-slate-900'">
                {{ info.hijri }}
              </p>
              <p v-if="isIslamicHoliday" class="text-xs text-red-500 font-bold mt-1">
                {{ holidayName }} (Estimasi)
              </p>
            </div>
          </div>

          <!-- Javanese Section -->
          <div class="flex items-start gap-4">
            <div class="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <span class="material-symbols-outlined text-secondary">history_edu</span>
            </div>
            <div class="flex-1">
              <p class="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Penanggalan Jawa</p>
              <p class="font-headline font-bold text-lg mb-2" :class="isDark ? 'text-white' : 'text-slate-900'">
                {{ info.jawa }}
              </p>
              
              <div class="grid grid-cols-2 gap-4 pt-4 border-t border-black/5 dark:border-white/5">
                <div>
                  <p class="text-[9px] font-black uppercase opacity-30">Neptu</p>
                  <p class="font-bold text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">{{ info.neptu }}</p>
                </div>
                <div>
                  <p class="text-[9px] font-black uppercase opacity-30">Wuku</p>
                  <p class="font-bold text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">{{ info.wuku }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Holiday Badge -->
          <div v-if="!isIslamicHoliday && holidayName" class="p-4 rounded-2xl bg-red-500/5 border border-red-500/10">
            <div class="flex items-center gap-2 text-red-500 mb-1">
              <span class="material-symbols-outlined text-sm">event_busy</span>
              <span class="text-[10px] font-black uppercase tracking-widest">Hari Libur Nasional</span>
            </div>
            <p class="font-bold text-sm" :class="isDark ? 'text-white' : 'text-slate-900'">{{ holidayName }}</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-8 pb-8">
          <button 
            @click="$emit('close')"
            class="w-full py-4 rounded-2xl bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { getFullDateInfo } from '~/utils/calendar-converter'
import { getHolidays } from '~/utils/calendar-data'

const props = defineProps<{
  isOpen: boolean
  date: Date | null
}>()

const emit = defineEmits(['close'])

const { isDark } = useColorMode()

const info = computed(() => {
  if (!props.date) return { masehi: '', hijri: '', jawa: '', pasaran: '', neptu: 0, wuku: '' }
  return getFullDateInfo(props.date)
})

const holiday = computed(() => {
  if (!props.date) return null
  const dateStr = props.date.toISOString().split('T')[0]
  const holidays = getHolidays(props.date.getFullYear())
  return holidays.find(h => h.date === dateStr)
})

const holidayName = computed(() => holiday.value?.name || '')
const isIslamicHoliday = computed(() => holidayName.value.includes('Idul') || holidayName.value.includes('Hijri') || holidayName.value.includes('Maulid') || holidayName.value.includes('Isra'))
</script>

<style scoped>
.glass-panel {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}

.pattern-grid {
  background-image: radial-gradient(circle, white 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>

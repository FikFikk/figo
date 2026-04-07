<template>
  <div class="space-y-4" :class="disabled ? 'opacity-25 grayscale pointer-events-none' : ''">
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
         <span class="material-symbols-outlined text-[16px] text-gray-500">{{ icon }}</span>
         <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">{{ label }}</label>
      </div>
      <span class="text-[10px] font-black font-mono text-primary bg-primary/5 px-2 py-1 rounded-lg border border-primary/10">
        {{ modelValue }}
      </span>
    </div>
    <div class="relative flex items-center group/slider">
      <input 
        type="range" 
        :min="min" :max="max" :step="step" 
        :value="modelValue" 
        @input="$emit('update:modelValue', Number(($event.target as HTMLInputElement).value))"
        class="pro-slider"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: number
  label: string
  icon: string
  min?: number | string
  max?: number | string
  step?: number | string
  disabled?: boolean
}>()

defineEmits(['update:modelValue'])
</script>

<style scoped>
.pro-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 4.5px;
  background: rgba(0,0,0,0.1);
  border-radius: 10px;
  outline: none;
  transition: all 0.3s;
}

:deep(.dark) .pro-slider {
  background: rgba(255,255,255,0.08);
}

.pro-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 15px;
  height: 15px;
  background: #3b82f6;
  border-radius: 50%;
  cursor: pointer;
  border: 3px solid #fff;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.4);
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

:deep(.dark) .pro-slider::-webkit-slider-thumb {
  border-color: #000;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
}

.pro-slider:hover::-webkit-slider-thumb {
  transform: scale(1.2);
  box-shadow: 0 0 25px rgba(59, 130, 246, 0.8);
}
</style>

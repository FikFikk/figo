<template>
  <section id="toolkit" class="py-16 md:py-24 px-6 md:px-8 max-w-7xl mx-auto">
    <div class="text-center mb-12 md:mb-16">
      <div class="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
        :class="isDark ? 'bg-primary/15 text-primary' : 'bg-primary-fixed text-on-primary-fixed'"
      >
        Developer Toolkit
      </div>
      <h2 class="text-3xl md:text-5xl font-headline font-extrabold tracking-tight mb-4"
        :class="isDark ? 'text-white' : 'text-slate-900'"
      >
        Built-in Utilities
      </h2>
      <p class="text-base md:text-lg max-w-2xl mx-auto" :class="isDark ? 'text-gray-400' : 'text-secondary'">
        Beyond core operations. A full suite of developer-grade tools for inspecting, validating, and securing your assets.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(tool, idx) in tools"
        :key="tool.title"
        class="glass-panel p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,88,190,0.06)] transition-all duration-500 group"
        :class="[
          isDark ? 'border border-white/8 hover:border-white/15' : 'border border-white/50',
          visible[idx] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        ]"
        :style="{ transitionDelay: `${idx * 80}ms` }"
        :ref="(el) => setRef(el as HTMLElement, idx)"
      >
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
            :class="isDark ? tool.bgClassDark : tool.bgClass"
          >
            <span class="material-symbols-outlined text-xl" :class="tool.colorClass">{{ tool.icon }}</span>
          </div>
          <div>
            <h4 class="font-headline font-bold mb-1" :class="isDark ? 'text-white' : 'text-slate-900'">{{ tool.title }}</h4>
            <p class="text-sm leading-relaxed" :class="isDark ? 'text-gray-400' : 'text-secondary'">{{ tool.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { isDark } = useColorMode()

const tools = [
  { icon: 'link', title: 'Link Checker', description: 'Validate URLs in bulk. Check for broken links, redirects, and response times.', bgClass: 'bg-blue-50', bgClassDark: 'bg-primary/15', colorClass: 'text-primary' },
  { icon: 'fingerprint', title: 'Hash Generator', description: 'Generate MD5, SHA-1, SHA-256 hashes for file integrity verification.', bgClass: 'bg-purple-50', bgClassDark: 'bg-tertiary/15', colorClass: 'text-tertiary' },
  { icon: 'analytics', title: 'File Analyzer', description: 'Deep-dive into metadata, EXIF data, codec info, and file properties.', bgClass: 'bg-blue-50', bgClassDark: 'bg-primary/15', colorClass: 'text-primary' },
  { icon: 'qr_code_2', title: 'QR Generator', description: 'Create QR codes from any text, URL, or data with custom styling.', bgClass: 'bg-purple-50', bgClassDark: 'bg-tertiary/15', colorClass: 'text-tertiary' },
  { icon: 'palette', title: 'Color Picker', description: 'Extract and convert colors between HEX, RGB, HSL, and more formats.', bgClass: 'bg-blue-50', bgClassDark: 'bg-primary/15', colorClass: 'text-primary' },
  { icon: 'text_format', title: 'Base64 Encoder', description: 'Encode and decode Base64 strings and files instantly in your browser.', bgClass: 'bg-purple-50', bgClassDark: 'bg-tertiary/15', colorClass: 'text-tertiary' },
]

const visible = ref<boolean[]>(Array(tools.length).fill(false))
const itemRefs: HTMLElement[] = []

function setRef(el: HTMLElement | null, idx: number) {
  if (el) itemRefs[idx] = el
}

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = itemRefs.indexOf(entry.target as HTMLElement)
          if (idx !== -1) visible.value[idx] = true
        }
      })
    },
    { threshold: 0.1 }
  )
  itemRefs.forEach((el) => { if (el) observer.observe(el) })
})
</script>

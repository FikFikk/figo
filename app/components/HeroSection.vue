<template>
  <section id="hero" class="relative min-h-screen flex flex-col items-center justify-center px-6 hero-grid overflow-hidden pt-24 pb-32 md:pb-48">
    <!-- 3D Wireframe Mesh Background -->
    <canvas ref="meshCanvas" aria-hidden="true" class="absolute inset-0 z-0 w-full h-full opacity-60 pointer-events-none"></canvas>

    <!-- Background Orbs -->
    <div aria-hidden="true" class="absolute top-20 right-[10%] w-96 h-96 rounded-full floating-orb opacity-50"
      :class="isDark ? 'bg-primary/15' : 'bg-primary/20'"
    ></div>
    <div aria-hidden="true" class="absolute bottom-20 left-[5%] w-[500px] h-[500px] rounded-full floating-orb"
      :class="isDark ? 'bg-tertiary/8' : 'bg-tertiary/10'"
    ></div>

    <div class="max-w-5xl w-full mx-auto text-center space-y-7 md:space-y-8 relative z-10">
      <h1 class="font-headline font-extrabold text-5xl sm:text-6xl md:text-8xl tracking-tighter leading-[1.05]"
        :class="isDark ? 'text-white' : 'text-slate-900'"
      >
        The <span class="text-primary">Fi</span>Go Engine
      </h1>

      <p class="text-lg md:text-2xl max-w-2xl mx-auto font-light leading-relaxed"
        :class="isDark ? 'text-gray-400' : 'text-secondary'"
      >
        Convert, compress, and download anything.
        <br class="hidden md:block" />
        <span :class="isDark ? 'font-medium text-white' : 'font-medium text-slate-900'">No account. No fee. No nonsense.</span>
      </p>

      <div class="flex items-center justify-center pt-1">
        <NuxtLink
          to="/tools"
          class="min-h-11 px-5 py-2.5 rounded-2xl border border-primary/30 text-primary font-headline font-bold text-sm hover:bg-primary/10 hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
        >
          Explore tools
          <span class="material-symbols-outlined text-lg align-middle ml-1">arrow_downward</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-28 md:bottom-12 left-0 w-full flex flex-col items-center gap-0 opacity-50 select-none pointer-events-none">
      <div class="flex flex-col items-center animate-bounce -ml-1.5">
        <span class="text-[9px] font-black uppercase tracking-widest">Scroll</span>
        <span class="material-symbols-outlined text-2xl -mt-1" :class="isDark ? 'text-gray-600' : 'text-slate-400'">keyboard_arrow_down</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { isDark } = useColorMode()

const meshCanvas = ref<HTMLCanvasElement | null>(null)
let watchdogInterval: ReturnType<typeof setInterval> | null = null
let rafId: number = 0
let destroyed = false
let isVisible = true
let resizeHandler: (() => void) | null = null
let observer: IntersectionObserver | null = null

// =============================================
// 3D WIREFRAME MESH — Dioptimasi & Efisien GPU/CPU
// =============================================
function initWireframeMesh() {
  const canvas = meshCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return

  let dpr = 1
  let W = 0
  let H = 0

  function resize() {
    if (!canvas) return
    dpr = window.devicePixelRatio || 1
    W = canvas.offsetWidth
    H = canvas.offsetHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  
  resize()
  resizeHandler = resize
  window.addEventListener('resize', resizeHandler, { passive: true })

  // Parameter mesh
  const COLS = 50
  const ROWS = 25
  const SP = 14
  const halfC = COLS * 0.5
  const halfR = ROWS * 0.5

  const pxArr = new Float32Array(COLS * ROWS)
  const pyArr = new Float32Array(COLS * ROWS)
  const depthArr = new Float32Array(COLS * ROWS)

  const startTime = performance.now()
  let lastRafTime = 0

  function draw() {
    if (destroyed || !isVisible) return
    const t = (performance.now() - startTime) * 0.0008
    const rx = 0.55, ry = t * 0.1 + 0.2
    const cRx = Math.cos(rx), sRx = Math.sin(rx), cRy = Math.cos(ry), sRy = Math.sin(ry)

    // Perhitungan kalkulasi titik gelombang organik
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const u = (c - halfC) * SP
        const v = (r - halfR) * SP

        const py = Math.sin(u * 0.015 + t * 1.2) * 45
                 + Math.cos(v * 0.025 + t * 0.8) * 35
                 + Math.sin((u + v) * 0.01 + t * 1.5) * 20
        const pz = v + Math.sin(u * 0.02 + t) * 20

        const y1 = py * cRx - pz * sRx
        const z1 = py * sRx + pz * cRx
        const x2 = u * cRy + z1 * sRy
        const z2 = -u * sRy + z1 * cRy

        const s = 700 / (z2 + 500)
        const idx = r * COLS + c
        pxArr[idx] = W * 0.5 + x2 * s
        pyArr[idx] = H * 0.5 + y1 * s
        depthArr[idx] = z2
      }
    }

    ctx.clearRect(0, 0, W, H)

    const dark = isDark.value
    const c1 = dark ? '0, 255, 136' : '0, 88, 190'
    const c2 = dark ? '180, 255, 220' : '0, 180, 160'

    const drawBatch = (type: 'h' | 'v' | 'd', alpha: number, weight: number) => {
      ctx.beginPath()
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const idx = r * COLS + c
          if (type === 'h' && c < COLS - 1) {
            ctx.moveTo(pxArr[idx]!, pyArr[idx]!)
            ctx.lineTo(pxArr[idx+1]!, pyArr[idx+1]!)
          } else if (type === 'v' && r < ROWS - 1) {
            ctx.moveTo(pxArr[idx]!, pyArr[idx]!)
            ctx.lineTo(pxArr[idx+COLS]!, pyArr[idx+COLS]!)
          } else if (type === 'd' && r < ROWS - 1 && c < COLS - 1) {
            ctx.moveTo(pxArr[idx]!, pyArr[idx]!)
            ctx.lineTo(pxArr[idx+COLS+1]!, pyArr[idx+COLS+1]!)
          }
        }
      }
      ctx.strokeStyle = `rgba(${c1}, ${alpha})`
      ctx.lineWidth = weight
      ctx.stroke()
    }

    // Gambar layer garis kedalaman
    drawBatch('h', 0.25, 0.8)
    drawBatch('v', 0.2, 0.6)
    drawBatch('d', 0.08, 0.4)

    // Highlight node berdenyut
    for (let r = 0; r < ROWS; r += 3) {
      for (let c = 0; c < COLS; c += 4) {
        const idx = r * COLS + c
        const px = pxArr[idx]!, py = pyArr[idx]!
        const sz = 1.2 + Math.sin(t * 2 + idx) * 0.5
        
        ctx.beginPath()
        ctx.arc(px, py, sz * 3.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${c2}, ${0.12})`
        ctx.fill()
        
        ctx.beginPath()
        ctx.arc(px, py, sz, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${dark ? '255,255,255' : c1}, 0.5)`
        ctx.fill()
      }
    }

    lastRafTime = performance.now()
    rafId = requestAnimationFrame(draw)
  }

  // Mulai animasi jika elemen terlihat
  rafId = requestAnimationFrame(draw)

  // Watchdog pemulihan frame saat tab kembali aktif
  watchdogInterval = setInterval(() => {
    if (destroyed || !isVisible) return
    if (performance.now() - lastRafTime > 80) {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(draw)
    }
  }, 100)

  // Jeda render otomatis saat hero section berada di luar viewport
  if (typeof IntersectionObserver !== 'undefined' && canvas) {
    observer = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        isVisible = entry.isIntersecting
        if (isVisible && !destroyed) {
          lastRafTime = performance.now()
          cancelAnimationFrame(rafId)
          rafId = requestAnimationFrame(draw)
        }
      }
    }, { threshold: 0.05 })
    observer.observe(canvas)
  }
}

onMounted(() => {
  initWireframeMesh()
})

onUnmounted(() => {
  destroyed = true
  isVisible = false
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler)
    resizeHandler = null
  }
  if (watchdogInterval) {
    clearInterval(watchdogInterval)
    watchdogInterval = null
  }
  if (observer) {
    observer.disconnect()
    observer = null
  }
  cancelAnimationFrame(rafId)
})
</script>

<style scoped>
/* fix */
</style>

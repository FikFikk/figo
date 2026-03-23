<template>
  <section id="hero" class="relative min-h-screen flex flex-col items-center justify-center px-6 hero-grid overflow-hidden pt-24 pb-32 md:pb-48">
    <!-- 3D Wireframe Mesh Background -->
    <canvas ref="meshCanvas" class="absolute inset-0 z-0 w-full h-full opacity-60 pointer-events-none"></canvas>

    <!-- Background Orbs -->
    <div class="absolute top-20 right-[10%] w-96 h-96 rounded-full floating-orb opacity-50"
      :class="isDark ? 'bg-primary/15' : 'bg-primary/20'"
    ></div>
    <div class="absolute bottom-20 left-[5%] w-[500px] h-[500px] rounded-full floating-orb"
      :class="isDark ? 'bg-tertiary/8' : 'bg-tertiary/10'"
    ></div>

    <div class="max-w-5xl w-full mx-auto text-center space-y-8 relative z-10">
      <h1 class="font-headline font-extrabold text-5xl sm:text-6xl md:text-8xl tracking-tighter leading-[1.1]"
        :class="isDark ? 'text-white' : 'text-slate-900'"
      >
        The <span class="text-primary">Fi</span>Go Engine
      </h1>

      <p class="text-lg md:text-2xl max-w-2xl mx-auto font-light leading-relaxed"
        :class="isDark ? 'text-gray-400' : 'text-secondary'"
      >
        High-performance file processing for modern engineers.
        <br class="hidden md:block" />
        <span :class="isDark ? 'font-medium text-white' : 'font-medium text-slate-900'">One platform, zero limits.</span>
      </p>
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

// =============================================
// 3D WIREFRAME MESH — Optimized + Always Smooth
// =============================================
function initWireframeMesh() {
  const canvas = meshCanvas.value!
  const ctx = canvas.getContext('2d')!

  let dpr = 1
  let W = 0
  let H = 0

  function resize() {
    dpr = window.devicePixelRatio || 1
    W = canvas.offsetWidth
    H = canvas.offsetHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }
  resize()
  window.addEventListener('resize', resize)

  // 3D helpers (inlined for speed)
  const cosv: number[] = []
  const sinv: number[] = []

  function project(x: number, y: number, z: number): [number, number] {
    const d = z + 500
    const s = 600 / (d > 80 ? d : 80)
    return [W * 0.5 + x * s, H * 0.5 + y * s]
  }

  // Mesh parameters
  const COLS = 50
  const ROWS = 25
  const SP = 13
  const halfC = COLS * 0.5
  const halfR = ROWS * 0.5

  // Pre-allocate arrays for projected points (avoid GC pressure)
  const pxArr = new Float32Array(COLS * ROWS)
  const pyArr = new Float32Array(COLS * ROWS)
  const depthArr = new Float32Array(COLS * ROWS)

  const startTime = performance.now()
  let lastRafTime = 0

  function draw() {
    if (destroyed) return

    const t = (performance.now() - startTime) * 0.0008

    // Theme colors
    const dark = isDark.value
    const lr = dark ? 0 : 30
    const lg = dark ? 210 : 110
    const lb = dark ? 200 : 170

    // Precompute rotation
    const rx = 0.55
    const ry = t * 0.12 + 0.3
    const cRx = Math.cos(rx), sRx = Math.sin(rx)
    const cRy = Math.cos(ry), sRy = Math.sin(ry)

    // Generate all points
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const u = (c - halfC) * SP
        const v = (r - halfR) * SP

        const py = Math.sin(u * 0.018 + t * 1.4) * 55
          + Math.cos(v * 0.035 + t * 0.7) * 35
          + Math.sin((u + v) * 0.013 + t * 1.1) * 25
        const pz = v + Math.sin(u * 0.025 + t * 0.9) * 25

        // Rotate X
        const y1 = py * cRx - pz * sRx
        const z1 = py * sRx + pz * cRx

        // Rotate Y
        const x2 = u * cRy + z1 * sRy
        const z2 = -u * sRy + z1 * cRy

        // Project
        const d = z2 + 500
        const s = 600 / (d > 80 ? d : 80)
        const idx = r * COLS + c
        pxArr[idx] = W * 0.5 + x2 * s
        pyArr[idx] = H * 0.5 + y1 * s
        depthArr[idx] = z2
      }
    }

    ctx.clearRect(0, 0, W, H)

    // --- BATCH DRAW: horizontal lines ---
    // Group by alpha ranges for fewer style changes
    const alphaSteps = 5
    for (let ai = 0; ai < alphaSteps; ai++) {
      const aMin = ai / alphaSteps * 0.4
      const aMax = (ai + 1) / alphaSteps * 0.4
      const aMid = (aMin + aMax) * 0.5 + 0.02

      ctx.beginPath()
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 1; c++) {
          const idx = r * COLS + c
          const depth = (depthArr[idx]! + 300) / 600
          const a = Math.max(0.04, 0.45 - depth * 0.35)
          if (a >= aMin && a < aMax) {
            ctx.moveTo(pxArr[idx]!, pyArr[idx]!)
            ctx.lineTo(pxArr[idx + 1]!, pyArr[idx + 1]!)
          }
        }
      }
      ctx.strokeStyle = `rgba(${lr},${lg},${lb},${aMid})`
      ctx.lineWidth = 0.6
      ctx.stroke()
    }

    // --- BATCH DRAW: vertical lines ---
    for (let ai = 0; ai < alphaSteps; ai++) {
      const aMin = ai / alphaSteps * 0.35
      const aMax = (ai + 1) / alphaSteps * 0.35
      const aMid = (aMin + aMax) * 0.5 + 0.02

      ctx.beginPath()
      for (let r = 0; r < ROWS - 1; r++) {
        for (let c = 0; c < COLS; c++) {
          const idx = r * COLS + c
          const idx2 = (r + 1) * COLS + c
          const depth = (depthArr[idx]! + 300) / 600
          const a = Math.max(0.03, 0.4 - depth * 0.35)
          if (a >= aMin && a < aMax) {
            ctx.moveTo(pxArr[idx]!, pyArr[idx]!)
            ctx.lineTo(pxArr[idx2]!, pyArr[idx2]!)
          }
        }
      }
      ctx.strokeStyle = `rgba(${lr},${lg},${lb},${aMid})`
      ctx.lineWidth = 0.5
      ctx.stroke()
    }

    // --- BATCH DRAW: diagonal lines ---
    ctx.beginPath()
    for (let r = 0; r < ROWS - 1; r++) {
      for (let c = 0; c < COLS - 1; c++) {
        const idx = r * COLS + c
        const idx2 = (r + 1) * COLS + c + 1
        ctx.moveTo(pxArr[idx]!, pyArr[idx]!)
        ctx.lineTo(pxArr[idx2]!, pyArr[idx2]!)
      }
    }
    ctx.strokeStyle = `rgba(${lr},${lg},${lb},0.08)`
    ctx.lineWidth = 0.3
    ctx.stroke()

    // --- BATCH DRAW: node glows ---
    const nr = dark ? 100 : 0
    const ng = dark ? 255 : 150
    const nb = dark ? 240 : 210

    ctx.beginPath()
    for (let r = 0; r < ROWS; r += 3) {
      for (let c = 0; c < COLS; c += 4) {
        const idx = r * COLS + c
        const px = pxArr[idx]!
        const py = pyArr[idx]!
        const depth = (depthArr[idx]! + 300) / 600
        const a = Math.max(0.05, 0.5 - depth * 0.4) + Math.sin(t * 2.5 + c * 0.4 + r * 0.3) * 0.1
        const sz = 1.2 + Math.sin(t * 2 + c + r) * 0.4
        ctx.moveTo(px + sz * 3.5, py)
        ctx.arc(px, py, sz * 3.5, 0, Math.PI * 2)
      }
    }
    ctx.fillStyle = `rgba(${lr},${lg + 20},${lb + 10},0.06)`
    ctx.fill()

    // --- BATCH DRAW: node cores ---
    ctx.beginPath()
    for (let r = 0; r < ROWS; r += 3) {
      for (let c = 0; c < COLS; c += 4) {
        const idx = r * COLS + c
        const px = pxArr[idx]!
        const py = pyArr[idx]!
        const sz = 1.2 + Math.sin(t * 2 + c + r) * 0.4
        ctx.moveTo(px + sz, py)
        ctx.arc(px, py, sz, 0, Math.PI * 2)
      }
    }
    ctx.fillStyle = `rgba(${nr},${ng},${nb},0.5)`
    ctx.fill()

    lastRafTime = performance.now()
    rafId = requestAnimationFrame(draw)
  }

  // Primary loop: requestAnimationFrame (smooth, vsync'd)
  rafId = requestAnimationFrame(draw)

  // Watchdog: if rAF hasn't fired in 50ms (scroll throttling),
  // force a new rAF request to wake it up
  watchdogInterval = setInterval(() => {
    if (destroyed) return
    if (performance.now() - lastRafTime > 50) {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(draw)
    }
  }, 30)
}

onMounted(() => {
  initWireframeMesh()
})

onUnmounted(() => {
  destroyed = true
  if (watchdogInterval) clearInterval(watchdogInterval)
  cancelAnimationFrame(rafId)
})
</script>

<style scoped>
/* fix */
</style>


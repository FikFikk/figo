<template>
  <div class="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
    <!-- Kanvas WebGL Three.js: Gelombang Cahaya Sakinah yang Tenang & Segar (Tanpa Partikel Ramai) -->
    <canvas ref="canvasRef" class="size-full opacity-70 transition-opacity duration-1000" />

    <!-- Gradien Halus Atmosferik Ambient Spotify/Apple Music Style -->
    <div
      class="absolute inset-0 bg-gradient-to-b from-[#030712]/40 via-transparent to-[#02050b]/80 pointer-events-none"
    />
    <!-- Pendaran Halus Zamrud & Amber di Sudut Layar -->
    <div
      class="absolute -top-40 -left-20 h-[500px] w-[500px] rounded-full bg-emerald-600/10 blur-[150px] pointer-events-none"
    />
    <div
      class="absolute -bottom-40 right-10 h-[500px] w-[500px] rounded-full bg-teal-600/5 blur-[160px] pointer-events-none"
    />
  </div>
</template>

<script setup lang="ts">
import * as THREE from 'three'

interface Props {
  isPlaying?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isPlaying: false
})

const canvasRef = ref<HTMLCanvasElement | null>(null)

let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let renderer: THREE.WebGLRenderer | null = null
let animationFrameId: number | null = null

// Mesh Gelombang Sutra Sakinah (Ethereal Organic Wave)
let waveGeometry: THREE.PlaneGeometry | null = null
let waveMesh: THREE.Mesh | null = null
let wireMesh: THREE.Mesh | null = null

// Simpan posisi Z awal bidang datar untuk kalkulasi gelombang
let originalZ: Float32Array | null = null

// Inisialisasi Tampilan Three.js Minimalis & Khusyuk
const initThreeScene = () => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const width = canvas.clientWidth || window.innerWidth
  const height = canvas.clientHeight || window.innerHeight

  // Setup Scene & Kamera
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.set(0, 5, 28)
  camera.lookAt(0, 0, 0)

  // WebGL Renderer dengan performa teroptimasi untuk Smart TV
  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  // =========================================================================
  // PENCAHAYAAN AMBIENT KHUSYUK (ZAMRUD & EMAS REDUP)
  // =========================================================================
  const ambientLight = new THREE.AmbientLight(0x064e3b, 1.2)
  scene.add(ambientLight)

  const pointLight = new THREE.PointLight(0x10b981, 2, 50)
  pointLight.position.set(0, 10, 10)
  scene.add(pointLight)

  const goldAccentLight = new THREE.PointLight(0xf59e0b, 1.2, 40)
  goldAccentLight.position.set(-15, 8, 8)
  scene.add(goldAccentLight)

  // =========================================================================
  // GELOMBANG SUTRA SAKINAH (ETHEREAL SILK WAVE MESH)
  // Konsep: Tenang, bernafas lembut, tidak ada partikel bising/ramai
  // =========================================================================
  const planeWidth = 75
  const planeHeight = 45
  const segW = 40
  const segH = 26

  waveGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight, segW, segH)
  const posAttr = waveGeometry.attributes.position
  originalZ = new Float32Array(posAttr.count)
  for (let i = 0; i < posAttr.count; i++) {
    originalZ[i] = posAttr.getZ(i)
  }

  // Material Permukaan Halus Zamrud Pekat
  const waveMaterial = new THREE.MeshStandardMaterial({
    color: 0x032e22,
    roughness: 0.7,
    metalness: 0.15,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
  })

  waveMesh = new THREE.Mesh(waveGeometry, waveMaterial)
  waveMesh.rotation.x = -Math.PI / 2.7
  waveMesh.position.set(0, -6, -4)
  scene.add(waveMesh)

  // Kisi-Kisi Garis Halus Emas-Zamrud (Subtle Elegant Wireframe)
  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    wireframe: true,
    transparent: true,
    opacity: 0.12
  })

  wireMesh = new THREE.Mesh(waveGeometry, wireMaterial)
  wireMesh.rotation.x = -Math.PI / 2.7
  wireMesh.position.set(0, -5.9, -4)
  scene.add(wireMesh)

  // Mulai Loop Animasi
  animate()
}

// Loop Animasi 60 FPS yang Sangat Halus & Menenangkan Jiwa
let clock = 0
const animate = () => {
  animationFrameId = requestAnimationFrame(animate)

  clock += 0.012
  const speed = props.isPlaying ? 1.4 : 0.8

  // Animasi Gelombang Air/Sutra Al-Quran yang Lembut
  if (waveGeometry && originalZ) {
    const posAttr = waveGeometry.attributes.position
    const count = posAttr.count

    for (let i = 0; i < count; i++) {
      const u = posAttr.getX(i) * 0.12
      const v = posAttr.getY(i) * 0.14
      // Gelombang ganda harmonik yang tenang (sakinah)
      const waveVal =
        Math.sin(u + clock * speed) * 1.6 +
        Math.cos(v + clock * speed * 0.7) * 1.2 +
        Math.sin((u + v) * 0.5 + clock * 0.5) * 0.8

      posAttr.setZ(i, originalZ[i] + waveVal)
    }

    posAttr.needsUpdate = true
    waveGeometry.computeVertexNormals()
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

// Tangani Resize Jendela / Fullscreen
const handleResize = () => {
  if (!canvasRef.value || !renderer || !camera) return
  const width = canvasRef.value.clientWidth || window.innerWidth
  const height = canvasRef.value.clientHeight || window.innerHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
}

onMounted(() => {
  nextTick(() => {
    initThreeScene()
    window.addEventListener('resize', handleResize)
  })
})

onBeforeUnmount(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
  }
  window.removeEventListener('resize', handleResize)

  // Bersihkan Memori WebGL Three.js secara Sempurna
  if (waveGeometry) waveGeometry.dispose()
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
  }
  scene = null
  camera = null
  renderer = null
})
</script>

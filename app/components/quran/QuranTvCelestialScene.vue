<template>
  <div class="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none">
    <!-- Kanvas WebGL Three.js untuk Efek Angkasa Spiritual & Geometri Islam -->
    <canvas ref="canvasRef" class="size-full opacity-90 transition-opacity duration-1000" />

    <!-- Lapisan Gradien Atmosferik Obsidian & Nuansa Cahaya Zamrud -->
    <div
      class="absolute inset-0 bg-radial from-transparent via-[#030712]/50 to-[#02050b]/90 pointer-events-none"
    />
    <div
      class="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none animate-pulse-slow"
    />
    <div
      class="absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-amber-500/5 blur-[140px] pointer-events-none"
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

// Objek Geometri Islam & Partikel Bintang
let starsPoints: THREE.Points | null = null
let starsGeometry: THREE.BufferGeometry | null = null
let sacredGroup: THREE.Group | null = null
let leftHaloGroup: THREE.Group | null = null

// Array kecepatan dan posisi dasar partikel
let starPositions: Float32Array
let starInitialY: Float32Array
let starSpeeds: Float32Array

// Buat tekstur partikel bintang bercahaya lembut (Aura Emas-Zamrud) menggunakan kanvas 2D
const createStarTexture = (): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.2, 'rgba(251, 191, 36, 0.85)') // Kilau Emas
    gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.4)') // Pendar Zamrud
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

// Bangun Struktur 3D Bintang 8-Penjuru (Rub el Hizb)
const createRubElHizbGeometry = (radius: number): THREE.BufferGeometry => {
  const points: THREE.Vector3[] = []
  const halfPi = Math.PI / 2
  const quarterPi = Math.PI / 4

  // Kotak Pertama
  for (let i = 0; i < 4; i++) {
    const a1 = i * halfPi
    const a2 = (i + 1) * halfPi
    points.push(
      new THREE.Vector3(radius * Math.cos(a1), radius * Math.sin(a1), 0),
      new THREE.Vector3(radius * Math.cos(a2), radius * Math.sin(a2), 0)
    )
  }

  // Kotak Kedua (Diputar 45 derajat membentuk bintang 8)
  for (let i = 0; i < 4; i++) {
    const a1 = i * halfPi + quarterPi
    const a2 = (i + 1) * halfPi + quarterPi
    points.push(
      new THREE.Vector3(radius * Math.cos(a1), radius * Math.sin(a1), 0),
      new THREE.Vector3(radius * Math.cos(a2), radius * Math.sin(a2), 0)
    )
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  return geometry
}

// Bangun Cincin Lingkaran Konsentris Geometri Islam
const createCircleGeometry = (radius: number, segments = 64): THREE.BufferGeometry => {
  const points: THREE.Vector3[] = []
  const step = (Math.PI * 2) / segments
  for (let i = 0; i <= segments; i++) {
    const angle = i * step
    points.push(new THREE.Vector3(radius * Math.cos(angle), radius * Math.sin(angle), 0))
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  return geometry
}

// Inisialisasi Tampilan Three.js
const initThreeScene = () => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const width = canvas.clientWidth || window.innerWidth
  const height = canvas.clientHeight || window.innerHeight

  // Setup Scene & Kamera
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000)
  camera.position.set(0, 0, 32)

  // Setup WebGL Renderer dengan performa teroptimasi untuk TV
  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))

  // =========================================================================
  // 1. SISTEM PARTIKEL DEBU BINTANG CELESTIAL (1.000 Butir Bintang Melayang)
  // =========================================================================
  const starCount = 1000
  starPositions = new Float32Array(starCount * 3)
  starInitialY = new Float32Array(starCount)
  starSpeeds = new Float32Array(starCount)
  const starColors = new Float32Array(starCount * 3)

  const colorPalette = [
    new THREE.Color('#10b981'), // Zamrud Utama
    new THREE.Color('#34d399'), // Zamrud Cerah
    new THREE.Color('#fbbf24'), // Emas Murni
    new THREE.Color('#f59e0b'), // Amber Hangat
    new THREE.Color('#38bdf8'), // Sian Ethereal
    new THREE.Color('#ffffff')  // Bintang Putih
  ]

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3
    starPositions[i3] = (Math.random() - 0.5) * 80
    starPositions[i3 + 1] = (Math.random() - 0.5) * 50
    starPositions[i3 + 2] = (Math.random() - 0.5) * 40 - 5

    starInitialY[i] = starPositions[i3 + 1]
    starSpeeds[i] = 0.005 + Math.random() * 0.015

    const col = colorPalette[Math.floor(Math.random() * colorPalette.length)]
    starColors[i3] = col.r
    starColors[i3 + 1] = col.g
    starColors[i3 + 2] = col.b
  }

  starsGeometry = new THREE.BufferGeometry()
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
  starsGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3))

  const starTexture = createStarTexture()
  const starsMaterial = new THREE.PointsMaterial({
    size: 1.4,
    map: starTexture,
    transparent: true,
    opacity: 0.85,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })

  starsPoints = new THREE.Points(starsGeometry, starsMaterial)
  scene.add(starsPoints)

  // =========================================================================
  // 2. GEOMETRI SUCI PUSAT: ASTROLABE ISLAM (RUB EL HIZB 8-STAR & CINCIN ORBIT)
  // =========================================================================
  sacredGroup = new THREE.Group()

  // Material Garis Emas Berpendar
  const goldLineMaterial = new THREE.LineBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.28,
    blending: THREE.AdditiveBlending
  })

  // Material Garis Zamrud Khusyuk
  const emeraldLineMaterial = new THREE.LineBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0.32,
    blending: THREE.AdditiveBlending
  })

  // Bintang Rub El Hizb Besar & Sedang
  const starBigGeo = createRubElHizbGeometry(12)
  const starBig = new THREE.LineSegments(starBigGeo, goldLineMaterial)
  sacredGroup.add(starBig)

  const starMidGeo = createRubElHizbGeometry(8.5)
  const starMid = new THREE.LineSegments(starMidGeo, emeraldLineMaterial)
  starMid.rotation.z = Math.PI / 8
  sacredGroup.add(starMid)

  // Cincin Konsentris
  const ring1Geo = createCircleGeometry(12)
  const ring1 = new THREE.LineLoop(ring1Geo, goldLineMaterial)
  sacredGroup.add(ring1)

  const ring2Geo = createCircleGeometry(14.5)
  const ring2 = new THREE.LineLoop(ring2Geo, emeraldLineMaterial)
  sacredGroup.add(ring2)

  const ring3Geo = createCircleGeometry(6)
  const ring3 = new THREE.LineLoop(ring3Geo, goldLineMaterial)
  sacredGroup.add(ring3)

  // Posisikan di latar belakang tengah dengan sedikit kemiringan perspektif 3D
  sacredGroup.position.set(4, 0, -12)
  sacredGroup.rotation.x = 0.35
  sacredGroup.rotation.y = -0.2
  scene.add(sacredGroup)

  // =========================================================================
  // 3. HALO 3D DI BELAKANG PIRINGAN VINYL SURAH (SISI KIRI LAYAR)
  // =========================================================================
  leftHaloGroup = new THREE.Group()

  const leftRing1Geo = createCircleGeometry(6.5, 48)
  const leftRing1 = new THREE.LineLoop(leftRing1Geo, emeraldLineMaterial)
  leftHaloGroup.add(leftRing1)

  const leftStarGeo = createRubElHizbGeometry(5.2)
  const leftStar = new THREE.LineSegments(leftStarGeo, goldLineMaterial)
  leftHaloGroup.add(leftStar)

  const leftRing2Geo = createCircleGeometry(7.8, 48)
  const leftRing2 = new THREE.LineLoop(leftRing2Geo, goldLineMaterial)
  leftHaloGroup.add(leftRing2)

  // Posisikan sejajar di belakang komponen Vinyl Player di kiri
  leftHaloGroup.position.set(-14, 1.5, -4)
  leftHaloGroup.rotation.x = 0.15
  scene.add(leftHaloGroup)

  // Mulai Loop Animasi
  animate()
}

// Loop Animasi 60 FPS yang Lembut & Ringan
let clock = 0
const animate = () => {
  animationFrameId = requestAnimationFrame(animate)

  clock += 0.016
  const isReciting = props.isPlaying
  const pulseSpeed = isReciting ? 2.2 : 1.0
  const rotSpeedMultiplier = isReciting ? 1.6 : 1.0

  // 1. Animasi Partikel Bintang (Mengambang Naik & Berkelip Halus)
  if (starsGeometry && starPositions) {
    const positions = starsGeometry.attributes.position.array as Float32Array
    for (let i = 0; i < 1000; i++) {
      const i3 = i * 3
      // Pergerakan vertikal halus ke atas
      positions[i3 + 1] += starSpeeds[i] * rotSpeedMultiplier
      // Osilasi horizontal lembut
      positions[i3] += Math.sin(clock + i) * 0.003

      // Reset partikel jika keluar dari layar atas
      if (positions[i3 + 1] > 28) {
        positions[i3 + 1] = -28
      }
    }
    starsGeometry.attributes.position.needsUpdate = true
  }

  // 2. Rotasi & Denyut Nafas Geometri Suci Pusat
  if (sacredGroup) {
    sacredGroup.rotation.z += 0.0012 * rotSpeedMultiplier
    sacredGroup.rotation.y = -0.2 + Math.sin(clock * 0.4) * 0.05
    // Denyutan ritmis mengikuti lantunan tilawah
    const pulseScale = 1 + Math.sin(clock * pulseSpeed) * 0.035
    sacredGroup.scale.set(pulseScale, pulseScale, pulseScale)
  }

  // 3. Rotasi Halo Sisi Kiri Vinyl
  if (leftHaloGroup) {
    leftHaloGroup.rotation.z -= 0.002 * rotSpeedMultiplier
    const haloPulse = 1 + Math.cos(clock * pulseSpeed) * 0.03
    leftHaloGroup.scale.set(haloPulse, haloPulse, haloPulse)
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

// Tangani Perubahan Ukuran Layar / Mode Fullscreen TV
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
  // Tunggu DOM terpasang sempurna
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
  if (starsGeometry) starsGeometry.dispose()
  if (renderer) {
    renderer.dispose()
    renderer.forceContextLoss()
  }
  scene = null
  camera = null
  renderer = null
})
</script>

<style scoped>
@keyframes pulseSlow {
  0%, 100% {
    opacity: 0.15;
    transform: scale(1);
  }
  50% {
    opacity: 0.28;
    transform: scale(1.12);
  }
}

.animate-pulse-slow {
  animation: pulseSlow 8s ease-in-out infinite;
}
</style>

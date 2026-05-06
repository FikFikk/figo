// Template QR - Koleksi dekorasi canvas untuk Pre-Made Templates
export interface QrTemplate {
  id: string
  label: string
  icon: string
  bgColor: string
  borderColor: string
  accentColor: string
  qrShape?: string
  qrExtEye?: string
  qrIntEye?: string
  qrDark?: string
  qrLight?: string
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, pad: number, drawInnerBox: () => void) => void
}

// Helper: gambar bunga kecil
function drawFlower(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, center: string) {
  ctx.fillStyle = color
  for (let i = 0; i < 5; i++) {
    const a = (Math.PI * 2 / 5) * i - Math.PI / 2
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * r * 0.6, cy + Math.sin(a) * r * 0.6, r * 0.5, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = center
  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.35, 0, Math.PI * 2)
  ctx.fill()
}

// Helper: gambar hati
function drawHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(cx, cy + size * 0.3)
  ctx.bezierCurveTo(cx, cy, cx - size, cy, cx - size, cy + size * 0.3)
  ctx.bezierCurveTo(cx - size, cy + size * 0.7, cx, cy + size, cx, cy + size * 1.1)
  ctx.bezierCurveTo(cx, cy + size, cx + size, cy + size * 0.7, cx + size, cy + size * 0.3)
  ctx.bezierCurveTo(cx + size, cy, cx, cy, cx, cy + size * 0.3)
  ctx.fill()
}

// Helper: gambar daun
function drawLeaf(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, angle: number, color: string) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.quadraticCurveTo(size * 0.5, -size * 0.4, size, 0)
  ctx.quadraticCurveTo(size * 0.5, size * 0.4, 0, 0)
  ctx.fill()
  // Garis tengah daun
  ctx.strokeStyle = color === '#4caf50' ? '#388e3c' : '#2e7d32'
  ctx.lineWidth = size * 0.04
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(size * 0.9, 0)
  ctx.stroke()
  ctx.restore()
}

// Helper: gambar bintang
function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, points = 5) {
  ctx.fillStyle = color
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * 0.4
    const a = (Math.PI / points) * i - Math.PI / 2
    const fn = i === 0 ? 'moveTo' : 'lineTo'
    ctx[fn](cx + rad * Math.cos(a), cy + rad * Math.sin(a))
  }
  ctx.closePath()
  ctx.fill()
}

// Helper: gambar gelombang
function drawWave(ctx: CanvasRenderingContext2D, startX: number, startY: number, width: number, amp: number, color: string) {
  ctx.strokeStyle = color
  ctx.lineWidth = amp * 0.3
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(startX, startY)
  for (let x = 0; x <= width; x += 2) {
    ctx.lineTo(startX + x, startY + Math.sin(x * 0.05) * amp)
  }
  ctx.stroke()
}

// Helper: gambar berlian kecil
function drawDiamond(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(cx, cy - size)
  ctx.lineTo(cx + size * 0.6, cy)
  ctx.lineTo(cx, cy + size)
  ctx.lineTo(cx - size * 0.6, cy)
  ctx.closePath()
  ctx.fill()
}

// Helper: gambar confetti
function drawConfetti(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, color: string, angle: number) {
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(angle)
  ctx.fillStyle = color
  ctx.fillRect(-size / 2, -size * 1.5, size, size * 3)
  ctx.restore()
}

// Helper: gambar lingkaran dengan glow
function drawGlowCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, alpha: number) {
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
}

// Seeded random untuk konsistensi visual
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Helper: gambar lantern (lampion)
function drawLantern(ctx: CanvasRenderingContext2D, lx: number, ly: number, scale: number) {
  // tali gantung
  ctx.strokeStyle = '#e5b95c'
  ctx.lineWidth = scale * 0.05
  ctx.beginPath()
  ctx.moveTo(lx, ly - scale * 1.5)
  ctx.lineTo(lx, ly - scale * 0.8)
  ctx.stroke()
  
  // lantern body
  ctx.fillStyle = '#f44336'
  ctx.beginPath()
  ctx.ellipse(lx, ly, scale * 0.6, scale, 0, 0, Math.PI * 2)
  ctx.fill()
  
  // lantern lines (emas)
  ctx.strokeStyle = '#e5b95c'
  ctx.lineWidth = scale * 0.05
  ctx.beginPath()
  ctx.ellipse(lx, ly, scale * 0.3, scale, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(lx, ly - scale)
  ctx.lineTo(lx, ly + scale)
  ctx.stroke()
  
  // top/bottom caps
  ctx.fillStyle = '#e5b95c'
  ctx.fillRect(lx - scale * 0.3, ly - scale * 1.1, scale * 0.6, scale * 0.2)
  ctx.fillRect(lx - scale * 0.3, ly + scale * 0.9, scale * 0.6, scale * 0.2)
  
  // tassel
  ctx.fillStyle = '#f44336'
  ctx.fillRect(lx - scale * 0.1, ly + scale * 1.1, scale * 0.2, scale * 0.8)
}

export const qrTemplates: QrTemplate[] = [
  {
    id: 'none',
    label: 'None',
    icon: '✕',
    bgColor: '#ffffff',
    borderColor: 'transparent',
    accentColor: 'transparent',
    draw: (ctx, w, h, pad, drawInnerBox) => { drawInnerBox() }
  },
  {
    id: 'lunar',
    label: 'Lunar',
    icon: '🏮',
    bgColor: '#ffffff',
    borderColor: '#e5b95c',
    accentColor: '#c62828',
    qrShape: 'dots',
    qrExtEye: 'circle',
    qrIntEye: 'circle',
    qrDark: '#c62828',
    qrLight: '#ffffff',
    draw(ctx, w, h, pad, drawInnerBox) {
      // Background inner box
      drawInnerBox()

      // Border frame emas
      ctx.strokeStyle = '#e5b95c'
      ctx.lineWidth = pad * 0.15
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      const r = pad * 0.4
      const x = pad * 0.25
      const y = pad * 0.25
      const bw = w - pad * 0.5
      const bh = h - pad * 0.5
      
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.arcTo(x + bw, y, x + bw, y + bh, r)
      ctx.arcTo(x + bw, y + bh, x, y + bh, r)
      ctx.arcTo(x, y + bh, x, y, r)
      ctx.arcTo(x, y, x + bw, y, r)
      ctx.closePath()
      ctx.stroke()
      
      // Lampion Kiri & Kanan
      drawLantern(ctx, pad * 0.3, h * 0.55, pad * 0.6)
      drawLantern(ctx, w - pad * 0.3, h * 0.65, pad * 0.5)
      
      // Cherry Blossoms Emas/Merah
      drawFlower(ctx, pad * 0.4, pad * 0.4, pad * 0.6, '#e5b95c', '#c62828')
      drawFlower(ctx, w - pad * 0.4, pad * 0.6, pad * 0.5, '#e5b95c', '#c62828')
      drawFlower(ctx, pad * 0.5, pad * 0.8, pad * 0.3, '#e5b95c', '#c62828')
      drawFlower(ctx, pad * 0.1, pad * 0.6, pad * 0.25, '#e5b95c', '#c62828')
      drawFlower(ctx, w - pad * 0.1, pad * 0.8, pad * 0.3, '#e5b95c', '#c62828')
    }
  },
  {
    id: 'love',
    label: 'Love',
    icon: '❤️',
    bgColor: '#fff0f0',
    borderColor: '#e53935',
    accentColor: '#ff1744',
    qrShape: 'dots',
    qrExtEye: 'rounded',
    qrIntEye: 'circle',
    qrDark: '#d32f2f',
    qrLight: '#ffffff',
    draw(ctx, w, h, pad, drawInnerBox) {
      drawInnerBox()
      // Border merah
      ctx.strokeStyle = '#e53935'
      ctx.lineWidth = pad * 0.1
      const r = pad * 0.3
      ctx.beginPath()
      ctx.moveTo(pad * 0.2 + r, pad * 0.2)
      ctx.arcTo(w - pad * 0.2, pad * 0.2, w - pad * 0.2, h - pad * 0.2, r)
      ctx.arcTo(w - pad * 0.2, h - pad * 0.2, pad * 0.2, h - pad * 0.2, r)
      ctx.arcTo(pad * 0.2, h - pad * 0.2, pad * 0.2, pad * 0.2, r)
      ctx.arcTo(pad * 0.2, pad * 0.2, w - pad * 0.2, pad * 0.2, r)
      ctx.closePath()
      ctx.stroke()
      // Hati di sudut
      const hs = pad * 0.2
      drawHeart(ctx, pad * 0.4, pad * 0.15, hs, '#e53935')
      drawHeart(ctx, w - pad * 0.4, pad * 0.15, hs, '#ff5252')
      drawHeart(ctx, pad * 0.4, h - pad * 0.6, hs, '#ff5252')
      drawHeart(ctx, w - pad * 0.4, h - pad * 0.6, hs, '#e53935')
      // Hati kecil bertebaran
      const rng = seededRandom(99)
      for (let i = 0; i < 16; i++) {
        const x = rng() * w
        const y = rng() * h
        if (x > pad * 0.8 && x < w - pad * 0.8 && y > pad * 0.8 && y < h - pad * 0.8) continue
        drawHeart(ctx, x, y, pad * (0.06 + rng() * 0.08), `rgba(229, 57, 53, ${0.2 + rng() * 0.4})`)
      }
      // Titik dekoratif di border
      ctx.fillStyle = '#ffcdd2'
      for (let i = 0; i < 20; i++) {
        const t = i / 20
        ctx.beginPath()
        ctx.arc(pad * 0.2 + t * (w - pad * 0.4), pad * 0.1, pad * 0.02, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(pad * 0.2 + t * (w - pad * 0.4), h - pad * 0.1, pad * 0.02, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  },
  {
    id: 'gold',
    label: 'Elegant Gold',
    icon: '👑',
    bgColor: '#fffdf5',
    borderColor: '#c9a94e',
    accentColor: '#d4a017',
    qrShape: 'rounded',
    qrExtEye: 'leaf',
    qrIntEye: 'leaf',
    qrDark: '#b38728',
    qrLight: '#fffdf5',
    draw(ctx, w, h, pad, drawInnerBox) {
      drawInnerBox()
      // Outer border emas
      ctx.strokeStyle = '#c9a94e'
      ctx.lineWidth = pad * 0.15
      ctx.strokeRect(pad * 0.12, pad * 0.12, w - pad * 0.24, h - pad * 0.24)
      // Inner border
      ctx.strokeStyle = '#e8d48b'
      ctx.lineWidth = pad * 0.04
      ctx.strokeRect(pad * 0.28, pad * 0.28, w - pad * 0.56, h - pad * 0.56)
      // Corner ornamen filigree
      const corners = [
        [pad * 0.15, pad * 0.15, 0],
        [w - pad * 0.15, pad * 0.15, Math.PI / 2],
        [w - pad * 0.15, h - pad * 0.15, Math.PI],
        [pad * 0.15, h - pad * 0.15, -Math.PI / 2],
      ]
      corners.forEach(([cx, cy, angle]) => {
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(angle)
        // Spiral ornamen
        ctx.strokeStyle = '#c9a94e'
        ctx.lineWidth = pad * 0.04
        ctx.beginPath()
        for (let t = 0; t < Math.PI * 1.5; t += 0.1) {
          const r = t * pad * 0.06
          const fn = t === 0 ? 'moveTo' : 'lineTo'
          ctx[fn](r * Math.cos(t), r * Math.sin(t))
        }
        ctx.stroke()
        // Berlian kecil
        drawDiamond(ctx, pad * 0.15, pad * 0.15, pad * 0.08, '#d4a017')
        ctx.restore()
      })
      // Bintang emas kecil di sisi
      drawStar(ctx, w / 2, pad * 0.18, pad * 0.1, '#d4a017')
      drawStar(ctx, w / 2, h - pad * 0.18, pad * 0.1, '#d4a017')
    }
  },
  {
    id: 'botanical',
    label: 'Botanical',
    icon: '🌷',
    bgColor: '#ffffff',
    borderColor: '#cde0d7',
    accentColor: '#5e9ca0',
    qrShape: 'liquid',
    qrExtEye: 'rounded',
    qrIntEye: 'rounded',
    qrDark: '#5e9ca0',
    qrLight: '#ffffff',
    draw(ctx, w, h, pad, drawInnerBox) {
      // 1. Gambar blob organik sage-green sebagai base background
      ctx.fillStyle = '#cde0d7'
      ctx.beginPath()
      ctx.moveTo(pad * 0.5, pad * 0.5)
      ctx.bezierCurveTo(w * 0.3, pad * 0.1, w * 0.7, pad * 0.2, w - pad * 0.5, pad * 0.5)
      ctx.bezierCurveTo(w - pad * 0.1, h * 0.3, w - pad * 0.2, h * 0.7, w - pad * 0.5, h - pad * 0.5)
      ctx.bezierCurveTo(w * 0.7, h - pad * 0.1, w * 0.3, h - pad * 0.2, pad * 0.5, h - pad * 0.5)
      ctx.bezierCurveTo(pad * 0.1, h * 0.7, pad * 0.2, h * 0.3, pad * 0.5, pad * 0.5)
      ctx.fill()

      // 2. Gambar inner white box (pelindung QR)
      drawInnerBox()

      // 3. Gambar dekorasi bunga pastel di luar white box
      // Top left area
      drawLeaf(ctx, pad * 0.6, pad * 0.4, pad * 0.5, -0.5, '#7bc4b8')
      drawFlower(ctx, pad * 0.8, pad * 0.3, pad * 0.3, '#79aec8', '#ffeb3b') // blue flower
      
      // Top right area
      drawLeaf(ctx, w - pad * 0.8, pad * 0.3, pad * 0.5, 0.5, '#7bc4b8')
      drawFlower(ctx, w - pad * 0.5, pad * 0.4, pad * 0.25, '#f4d03f', '#e67e22') // yellow flower
      
      // Bottom right area
      drawLeaf(ctx, w - pad * 0.6, h - pad * 0.4, pad * 0.5, 2.5, '#7bc4b8')
      drawFlower(ctx, w - pad * 0.8, h - pad * 0.3, pad * 0.4, '#f1948a', '#ffffff') // pink flower
      
      // Bottom left area
      drawLeaf(ctx, pad * 0.8, h - pad * 0.3, pad * 0.4, -2.5, '#7bc4b8')
      drawFlower(ctx, pad * 0.5, h - pad * 0.4, pad * 0.35, '#f4d03f', '#e67e22') // yellow flower
      
      // Extra scattered details
      drawFlower(ctx, pad * 0.2, h * 0.4, pad * 0.2, '#f1948a', '#fff')
      drawFlower(ctx, w - pad * 0.2, h * 0.6, pad * 0.2, '#79aec8', '#fff')
      
      // Titik pastel kecil
      const rng = seededRandom(11)
      for (let i = 0; i < 15; i++) {
        const x = rng() * w
        const y = rng() * h
        if (x > pad * 0.9 && x < w - pad * 0.9 && y > pad * 0.9 && y < h - pad * 0.9) continue
        drawGlowCircle(ctx, x, y, pad * (0.03 + rng() * 0.03), '#f1948a', 0.8)
      }
    }
  },
  {
    id: 'ocean',
    label: 'Ocean',
    icon: '🌊',
    bgColor: '#e3f2fd',
    borderColor: '#1e88e5',
    accentColor: '#0d47a1',
    qrShape: 'dots',
    qrExtEye: 'circle',
    qrIntEye: 'rounded',
    qrDark: '#0d47a1',
    qrLight: '#e3f2fd',
    draw(ctx, w, h, pad, drawInnerBox) {
      drawInnerBox()
      // Gelombang atas
      drawWave(ctx, 0, pad * 0.3, w, pad * 0.15, '#42a5f5')
      drawWave(ctx, 0, pad * 0.5, w, pad * 0.1, '#90caf9')
      // Gelombang bawah
      drawWave(ctx, 0, h - pad * 0.3, w, pad * 0.15, '#42a5f5')
      drawWave(ctx, 0, h - pad * 0.5, w, pad * 0.1, '#90caf9')
      // Bubble
      const rng = seededRandom(55)
      for (let i = 0; i < 18; i++) {
        const x = rng() * w
        const y = rng() * h
        if (x > pad * 0.6 && x < w - pad * 0.6 && y > pad * 0.6 && y < h - pad * 0.6) continue
        const r = pad * (0.03 + rng() * 0.06)
        ctx.strokeStyle = `rgba(30, 136, 229, ${0.2 + rng() * 0.4})`
        ctx.lineWidth = r * 0.3
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.stroke()
        // Highlight
        ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + rng() * 0.3})`
        ctx.beginPath()
        ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.2, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  },
  {
    id: 'festive',
    label: 'Festive',
    icon: '🎉',
    bgColor: '#fffde7',
    borderColor: '#ff6f00',
    accentColor: '#e65100',
    qrShape: 'rounded',
    qrExtEye: 'rounded',
    qrIntEye: 'circle',
    qrDark: '#e65100',
    qrLight: '#ffffff',
    draw(ctx, w, h, pad, drawInnerBox) {
      drawInnerBox()
      // Border berwarna
      ctx.strokeStyle = '#ff6f00'
      ctx.lineWidth = pad * 0.1
      ctx.setLineDash([pad * 0.15, pad * 0.08])
      ctx.strokeRect(pad * 0.15, pad * 0.15, w - pad * 0.3, h - pad * 0.3)
      ctx.setLineDash([])
      // Confetti
      const colors = ['#e53935', '#1e88e5', '#43a047', '#ff6f00', '#8e24aa', '#ffb300']
      const rng = seededRandom(123)
      for (let i = 0; i < 30; i++) {
        const x = rng() * w
        const y = rng() * h
        if (x > pad * 0.7 && x < w - pad * 0.7 && y > pad * 0.7 && y < h - pad * 0.7) continue
        const color = colors[Math.floor(rng() * colors.length)]
        drawConfetti(ctx, x, y, pad * 0.03, color, rng() * Math.PI)
      }
      // Bintang di sudut
      drawStar(ctx, pad * 0.35, pad * 0.35, pad * 0.15, '#ffb300')
      drawStar(ctx, w - pad * 0.35, pad * 0.35, pad * 0.12, '#e53935')
      drawStar(ctx, pad * 0.35, h - pad * 0.35, pad * 0.12, '#1e88e5')
      drawStar(ctx, w - pad * 0.35, h - pad * 0.35, pad * 0.15, '#43a047')
    }
  },
  {
    id: 'stars',
    label: 'Starry',
    icon: '⭐',
    bgColor: '#f3e5f5',
    borderColor: '#ab47bc',
    accentColor: '#7b1fa2',
    qrShape: 'diamond',
    qrExtEye: 'circle',
    qrIntEye: 'rounded',
    qrDark: '#4a148c',
    qrLight: '#ffffff',
    draw(ctx, w, h, pad, drawInnerBox) {
      drawInnerBox()
      // Border ungu
      ctx.strokeStyle = '#ce93d8'
      ctx.lineWidth = pad * 0.08
      ctx.strokeRect(pad * 0.15, pad * 0.15, w - pad * 0.3, h - pad * 0.3)
      // Bintang di sekeliling
      const rng = seededRandom(333)
      const colors = ['#ffeb3b', '#ffc107', '#ff9800', '#ab47bc', '#ce93d8']
      for (let i = 0; i < 20; i++) {
        const x = rng() * w
        const y = rng() * h
        if (x > pad * 0.7 && x < w - pad * 0.7 && y > pad * 0.7 && y < h - pad * 0.7) continue
        const size = pad * (0.06 + rng() * 0.1)
        const color = colors[Math.floor(rng() * colors.length)]
        drawStar(ctx, x, y, size, color, 4 + Math.floor(rng() * 3))
      }
      // Sparkle besar di sudut
      drawStar(ctx, pad * 0.35, pad * 0.35, pad * 0.18, '#ffeb3b', 4)
      drawStar(ctx, w - pad * 0.35, h - pad * 0.35, pad * 0.18, '#ffc107', 4)
    }
  },
  {
    id: 'candy',
    label: 'Candy',
    icon: '🍬',
    bgColor: '#fce4ec',
    borderColor: '#ec407a',
    accentColor: '#c2185b',
    qrShape: 'circle',
    qrExtEye: 'circle',
    qrIntEye: 'rounded',
    qrDark: '#880e4f',
    qrLight: '#fce4ec',
    draw(ctx, w, h, pad, drawInnerBox) {
      drawInnerBox()
      // Border dotted candy
      ctx.strokeStyle = '#ec407a'
      ctx.lineWidth = pad * 0.06
      ctx.setLineDash([pad * 0.06, pad * 0.06])
      ctx.strokeRect(pad * 0.12, pad * 0.12, w - pad * 0.24, h - pad * 0.24)
      ctx.setLineDash([])
      ctx.strokeStyle = '#7c4dff'
      ctx.lineWidth = pad * 0.04
      ctx.setLineDash([pad * 0.08, pad * 0.08])
      ctx.strokeRect(pad * 0.22, pad * 0.22, w - pad * 0.44, h - pad * 0.44)
      ctx.setLineDash([])
      // Lingkaran candy
      const colors = ['#ec407a', '#7c4dff', '#26c6da', '#66bb6a', '#ffca28', '#ff7043']
      const rng = seededRandom(456)
      for (let i = 0; i < 22; i++) {
        const x = rng() * w
        const y = rng() * h
        if (x > pad * 0.7 && x < w - pad * 0.7 && y > pad * 0.7 && y < h - pad * 0.7) continue
        const r = pad * (0.04 + rng() * 0.06)
        const color = colors[Math.floor(rng() * colors.length)]
        ctx.fillStyle = color
        ctx.globalAlpha = 0.6 + rng() * 0.4
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }
  },
  {
    id: 'neon',
    label: 'Neon Glow',
    icon: '💎',
    bgColor: '#0a0a1a',
    borderColor: '#00e5ff',
    accentColor: '#76ff03',
    qrShape: 'square',
    qrExtEye: 'square',
    qrIntEye: 'square',
    qrDark: '#00e5ff',
    qrLight: '#0a0a1a',
    draw(ctx, w, h, pad, drawInnerBox) {
      drawInnerBox()
      // Glow border
      const glows = ['#00e5ff', '#76ff03', '#e040fb']
      glows.forEach((color, i) => {
        ctx.shadowColor = color
        ctx.shadowBlur = pad * (0.2 - i * 0.05)
        ctx.strokeStyle = color
        ctx.lineWidth = pad * (0.04 - i * 0.01)
        ctx.globalAlpha = 0.6
        ctx.strokeRect(pad * (0.15 + i * 0.05), pad * (0.15 + i * 0.05), w - pad * (0.3 + i * 0.1), h - pad * (0.3 + i * 0.1))
      })
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
      // Corner dots
      const corners = [[pad * 0.3, pad * 0.3], [w - pad * 0.3, pad * 0.3], [pad * 0.3, h - pad * 0.3], [w - pad * 0.3, h - pad * 0.3]]
      corners.forEach(([x, y], i) => {
        ctx.shadowColor = glows[i % 3]
        ctx.shadowBlur = pad * 0.15
        ctx.fillStyle = glows[i % 3]
        ctx.beginPath()
        ctx.arc(x, y, pad * 0.06, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.shadowBlur = 0
    }
  },
  {
    id: 'vintage',
    label: 'Vintage',
    icon: '📜',
    bgColor: '#faf3e0',
    borderColor: '#8d6e63',
    accentColor: '#5d4037',
    qrShape: 'rounded',
    qrExtEye: 'leaf',
    qrIntEye: 'square',
    qrDark: '#4e342e',
    qrLight: '#faf3e0',
    draw(ctx, w, h, pad, drawInnerBox) {
      drawInnerBox()
      // Double border coklat
      ctx.strokeStyle = '#8d6e63'
      ctx.lineWidth = pad * 0.1
      ctx.strokeRect(pad * 0.12, pad * 0.12, w - pad * 0.24, h - pad * 0.24)
      ctx.strokeStyle = '#bcaaa4'
      ctx.lineWidth = pad * 0.03
      ctx.strokeRect(pad * 0.26, pad * 0.26, w - pad * 0.52, h - pad * 0.52)
      // Corner ornamen L
      const cSize = pad * 0.25
      ctx.strokeStyle = '#8d6e63'
      ctx.lineWidth = pad * 0.05
      // Top-left
      ctx.beginPath(); ctx.moveTo(pad * 0.05, pad * 0.05 + cSize); ctx.lineTo(pad * 0.05, pad * 0.05); ctx.lineTo(pad * 0.05 + cSize, pad * 0.05); ctx.stroke()
      // Top-right
      ctx.beginPath(); ctx.moveTo(w - pad * 0.05 - cSize, pad * 0.05); ctx.lineTo(w - pad * 0.05, pad * 0.05); ctx.lineTo(w - pad * 0.05, pad * 0.05 + cSize); ctx.stroke()
      // Bottom-left
      ctx.beginPath(); ctx.moveTo(pad * 0.05, h - pad * 0.05 - cSize); ctx.lineTo(pad * 0.05, h - pad * 0.05); ctx.lineTo(pad * 0.05 + cSize, h - pad * 0.05); ctx.stroke()
      // Bottom-right
      ctx.beginPath(); ctx.moveTo(w - pad * 0.05 - cSize, h - pad * 0.05); ctx.lineTo(w - pad * 0.05, h - pad * 0.05); ctx.lineTo(w - pad * 0.05, h - pad * 0.05 - cSize); ctx.stroke()
      // Berlian tengah atas dan bawah
      drawDiamond(ctx, w / 2, pad * 0.15, pad * 0.08, '#8d6e63')
      drawDiamond(ctx, w / 2, h - pad * 0.15, pad * 0.08, '#8d6e63')
    }
  },
]

// Export daftar template untuk selector
export const templateList = qrTemplates.map(t => ({ id: t.id, label: t.label, icon: t.icon }))

// Cari template berdasarkan ID
export function getTemplate(id: string): QrTemplate | undefined {
  return qrTemplates.find(t => t.id === id)
}

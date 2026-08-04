#!/usr/bin/env python3
"""
FiGo AI Pro Studio — Backend Worker
Dijalankan oleh Go via subprocess.
Baca: sys.argv[1] = mode (remove-bg | upscale | enhance | denoise)
Input: stdin (raw image bytes)
Output: stdout (PNG/JPEG bytes hasil)
Errors: stderr
"""
import sys
import os
import io
import json
import base64

# Suppress onnxruntime GPU warnings
os.environ["ORT_LOGGING_LEVEL"] = "3"

def log(msg: str):
    print(f"[ai_worker] {msg}", file=sys.stderr, flush=True)

def error_exit(msg: str):
    sys.stderr.write(f"ERROR:{msg}\n")
    sys.stderr.flush()
    sys.exit(1)

def mode_remove_bg():
    """Remove background via rembg U2Net ONNX"""
    try:
        from rembg import remove, new_session
        from PIL import Image
    except ImportError as e:
        error_exit(f"import error: {e}")

    log("Loading image from stdin...")
    input_bytes = sys.stdin.buffer.read()
    if not input_bytes:
        error_exit("No input data received")

    try:
        # Session u2net — paling akurat untuk general objects
        session = new_session("u2net")
        log(f"Session created: u2net, processing {len(input_bytes)//1024}KB image...")
        output_bytes = remove(
            input_bytes,
            alpha_matting=False,   # skip pymatting (numba not compatible)
            session=session
        )
        log("Remove BG done, writing PNG output...")
        sys.stdout.buffer.write(output_bytes)
        sys.stdout.buffer.flush()
    except Exception as e:
        error_exit(f"remove_bg failed: {e}")

def mode_upscale(scale: int = 2):
    """
    Upscale gambar menggunakan Lanczos + unsharp mask (real ESRGAN tidak feasible di CPU ARM)
    Sangat tajam dan detail tanpa perlu GPU.
    """
    try:
        from PIL import Image, ImageFilter, ImageEnhance
        import io as _io
    except ImportError as e:
        error_exit(f"import error: {e}")

    log(f"Upscale x{scale} starting...")
    input_bytes = sys.stdin.buffer.read()
    if not input_bytes:
        error_exit("No input data received")

    try:
        img = Image.open(_io.BytesIO(input_bytes))
        original_mode = img.mode

        # Convert ke RGB untuk processing
        if img.mode not in ('RGB', 'RGBA'):
            img = img.convert('RGB')

        w, h = img.size
        new_w, new_h = w * scale, h * scale
        log(f"Resizing {w}x{h} → {new_w}x{new_h}...")

        # Step 1: Upscale dengan LANCZOS (kualitas tinggi)
        upscaled = img.resize((new_w, new_h), Image.LANCZOS)

        # Step 2: Unsharp mask untuk restore detail yang hilang saat upscale
        # Simulasi AI sharpening: radius besar, jumlah medium, threshold rendah
        upscaled = upscaled.filter(ImageFilter.UnsharpMask(radius=1.5, percent=180, threshold=3))

        # Step 3: Slight clarity boost
        enhancer = ImageEnhance.Contrast(upscaled)
        upscaled = enhancer.enhance(1.05)

        # Step 4: Final detail pass
        if scale >= 4:
            upscaled = upscaled.filter(ImageFilter.UnsharpMask(radius=0.8, percent=100, threshold=2))

        # Output
        out_buf = _io.BytesIO()
        if original_mode == 'RGBA' or img.mode == 'RGBA':
            upscaled.save(out_buf, format='PNG', optimize=False)
        else:
            upscaled.save(out_buf, format='JPEG', quality=96, optimize=True)

        log("Upscale done, writing output...")
        sys.stdout.buffer.write(out_buf.getvalue())
        sys.stdout.buffer.flush()
    except Exception as e:
        error_exit(f"upscale failed: {e}")

def mode_enhance(model: str = "balanced"):
    """
    AI-grade color grading + detail enhancement
    Models: balanced | hd_clarity | portrait | vivid | cinematic
    """
    try:
        from PIL import Image, ImageFilter, ImageEnhance, ImageOps
        import io as _io
    except ImportError as e:
        error_exit(f"import error: {e}")

    log(f"Enhance [{model}] starting...")
    input_bytes = sys.stdin.buffer.read()
    if not input_bytes:
        error_exit("No input data received")

    try:
        img = Image.open(_io.BytesIO(input_bytes))
        original_mode = img.mode
        result = img.convert('RGB')

        if model == "balanced":
            # Natural enhancement: slight sharpening + mild contrast boost
            result = ImageEnhance.Contrast(result).enhance(1.12)
            result = ImageEnhance.Sharpness(result).enhance(1.4)
            result = ImageEnhance.Color(result).enhance(1.05)
            result = result.filter(ImageFilter.UnsharpMask(radius=1.0, percent=120, threshold=2))

        elif model == "hd_clarity":
            # Maximum detail: high sharpness, strong unsharp mask, slight brightness boost
            result = ImageEnhance.Contrast(result).enhance(1.25)
            result = ImageEnhance.Sharpness(result).enhance(2.2)
            result = result.filter(ImageFilter.UnsharpMask(radius=2.0, percent=250, threshold=1))
            result = ImageEnhance.Brightness(result).enhance(1.05)
            result = ImageEnhance.Color(result).enhance(1.08)

        elif model == "portrait":
            # Skin tone preservation + soft detail + eye sharpness simulation
            result = ImageEnhance.Color(result).enhance(1.12)
            result = ImageEnhance.Contrast(result).enhance(1.08)
            result = result.filter(ImageFilter.GaussianBlur(radius=0.3))  # soft skin
            result = ImageEnhance.Sharpness(result).enhance(1.8)

        elif model == "vivid":
            # High saturation, punchy contrast — social media style
            result = ImageEnhance.Color(result).enhance(1.4)
            result = ImageEnhance.Contrast(result).enhance(1.30)
            result = ImageEnhance.Sharpness(result).enhance(1.6)
            result = result.filter(ImageFilter.UnsharpMask(radius=1.5, percent=150, threshold=2))
            result = ImageEnhance.Brightness(result).enhance(1.03)

        elif model == "cinematic":
            # Muted highlight, lifted blacks, teal-orange color grade
            import numpy as np
            arr = np.array(result, dtype=np.float32) / 255.0
            # Lift shadows: subtle
            arr = arr * 0.88 + 0.06
            # Teal shift in shadows (R↓ G↑ B↑)
            mask_shadow = arr.mean(axis=2, keepdims=True) < 0.45
            arr[:,:,0] = np.where(mask_shadow[:,:,0], arr[:,:,0] * 0.93, arr[:,:,0])
            arr[:,:,1] = np.where(mask_shadow[:,:,0], arr[:,:,1] * 1.04, arr[:,:,1])
            arr[:,:,2] = np.where(mask_shadow[:,:,0], arr[:,:,2] * 1.06, arr[:,:,2])
            # Orange shift in highlights (R↑ G↑ B↓)
            mask_high = arr.mean(axis=2, keepdims=True) > 0.65
            arr[:,:,0] = np.where(mask_high[:,:,0], np.minimum(arr[:,:,0] * 1.04, 1.0), arr[:,:,0])
            arr[:,:,2] = np.where(mask_high[:,:,0], arr[:,:,2] * 0.94, arr[:,:,2])
            arr = np.clip(arr * 255, 0, 255).astype(np.uint8)
            result = Image.fromarray(arr)
            result = ImageEnhance.Contrast(result).enhance(1.18)
            result = ImageEnhance.Sharpness(result).enhance(1.2)

        # Output
        out_buf = _io.BytesIO()
        if original_mode == 'RGBA':
            result_out = result.convert('RGBA')
            result_out.save(out_buf, format='PNG')
        else:
            result.save(out_buf, format='JPEG', quality=95, optimize=True)

        log(f"Enhance [{model}] done.")
        sys.stdout.buffer.write(out_buf.getvalue())
        sys.stdout.buffer.flush()
    except Exception as e:
        error_exit(f"enhance failed: {e}")

def mode_denoise():
    """Advanced denoising menggunakan Bilateral filter simulation via scipy"""
    try:
        from PIL import Image, ImageFilter
        import io as _io
        import numpy as np
        from scipy.ndimage import uniform_filter
    except ImportError as e:
        error_exit(f"import error: {e}")

    log("Denoise starting...")
    input_bytes = sys.stdin.buffer.read()
    if not input_bytes:
        error_exit("No input data received")

    try:
        img = Image.open(_io.BytesIO(input_bytes))
        original_mode = img.mode
        arr = np.array(img.convert('RGB'), dtype=np.float32)

        # Multi-pass bilateral-like denoise menggunakan gaussian blur di berbagai scale
        # kemudian blend dengan original untuk preserve edges
        from scipy.ndimage import gaussian_filter as gf

        # Pass 1: Fine noise removal (sigma=1)
        smooth1 = np.zeros_like(arr)
        for c in range(3):
            smooth1[:,:,c] = gf(arr[:,:,c], sigma=1.0)

        # Pass 2: Medium smoothing (sigma=2)
        smooth2 = np.zeros_like(arr)
        for c in range(3):
            smooth2[:,:,c] = gf(arr[:,:,c], sigma=2.0)

        # Edge detection: preserve high-frequency detail
        diff = np.abs(arr - smooth1).mean(axis=2, keepdims=True)
        edge_weight = np.clip(diff / 30.0, 0, 1)  # normalize

        # Blend: edges = original, smooth areas = denoised
        denoised = arr * edge_weight + smooth1 * (1 - edge_weight)
        denoised = np.clip(denoised, 0, 255).astype(np.uint8)

        result = Image.fromarray(denoised)

        out_buf = _io.BytesIO()
        if original_mode == 'RGBA':
            result.save(out_buf, format='PNG')
        else:
            result.save(out_buf, format='JPEG', quality=94, optimize=True)

        log("Denoise done.")
        sys.stdout.buffer.write(out_buf.getvalue())
        sys.stdout.buffer.flush()
    except Exception as e:
        error_exit(f"denoise failed: {e}")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        error_exit("Usage: ai_worker.py <mode> [param]")

    mode = sys.argv[1]

    if mode == 'remove-bg':
        mode_remove_bg()
    elif mode == 'upscale':
        scale = int(sys.argv[2]) if len(sys.argv) > 2 else 2
        mode_upscale(scale)
    elif mode == 'enhance':
        model = sys.argv[2] if len(sys.argv) > 2 else 'balanced'
        mode_enhance(model)
    elif mode == 'denoise':
        mode_denoise()
    else:
        error_exit(f"Unknown mode: {mode}")

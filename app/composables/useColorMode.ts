export function useColorMode() {
  const colorMode = useState<'dark' | 'light'>('color-mode', () => 'dark')

  function toggle(event?: MouseEvent) {
    const isAppearanceTransition =
      import.meta.client &&
      document.startViewTransition &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isAppearanceTransition || !event) {
      colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark'
      apply()
      save()
      return
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );

    const isCurrentlyDark = colorMode.value === 'dark';
    const willBeDark = !isCurrentlyDark;

    const transition = document.startViewTransition(async () => {
      colorMode.value = willBeDark ? 'dark' : 'light';
      apply();
      save();
      await nextTick();
    });

    transition.ready.then(() => {
      // 3 Pantulan yang membagi layar menjadi 3 langkah ekspansi dengan overshoot yang sangat jelas
      const keyframeDefinitions = [
        { t: 0.0, p: 0.0 },

        // Langkah 1: Ekspansi ke 1/3
        { t: 0.15, p: 0.45 }, // Overshoot BESAR
        { t: 0.25, p: 0.28 }, // Pantulan kembali BESAR
        { t: 0.33, p: 0.33 }, // Menetap

        // Langkah 2: Ekspansi ke 2/3
        { t: 0.48, p: 0.78 }, // Overshoot BESAR
        { t: 0.58, p: 0.61 }, // Pantulan kembali BESAR
        { t: 0.66, p: 0.66 }, // Menetap

        // Langkah 3: Ekspansi ke 3/3 (Layar penuh)
        { t: 0.81, p: 1.12 }, // Overshoot BESAR
        { t: 0.91, p: 0.95 }, // Pantulan kembali BESAR
        { t: 1.0, p: 1.0 }, // Menetap
      ];

      const animationKeyframes = keyframeDefinitions.map((kf) => {
        const currentRadius = endRadius * kf.p;
        return {
          offset: kf.t,
          easing: "ease-in-out", // Melengkungkan kecepatan antar setiap keyframe secara sempurna!
          clipPath: `circle(${currentRadius}px at ${x}px ${y}px)`,
        };
      });

      document.documentElement.animate(animationKeyframes, {
        duration: 2000, // 2.0s untuk memungkinkan 3 pantulan yang membesar terlihat dengan sangat jelas
        easing: "linear", // Pertahankan playback keseluruhan linear agar pengaturan waktu keyframe manual kita dihormati dengan ketat
        pseudoElement: "::view-transition-new(root)",
      });
    });
  }

  function apply() {
    if (import.meta.client) {
      const html = document.documentElement
      if (colorMode.value === 'dark') {
        html.classList.add('dark')
        html.classList.remove('light')
      } else {
        html.classList.add('light')
        html.classList.remove('dark')
      }
    }
  }

  function save() {
    if (import.meta.client) {
      localStorage.setItem('figo_color_mode', colorMode.value)
    }
  }

  function load() {
    if (import.meta.client) {
      const saved = localStorage.getItem('figo_color_mode') as 'dark' | 'light' | null
      colorMode.value = saved || 'dark'
      apply()
    }
  }

  const isDark = computed(() => colorMode.value === 'dark')

  onMounted(() => {
    load()
  })

  return {
    colorMode: readonly(colorMode),
    isDark,
    toggle,
  }
}

<script setup lang="ts">
/**
 * Redirect index /kalender to 2026 or current year
 * for SEO purpose
 */
const currentYear = new Date().getFullYear()
const targetYear = 2026 // Target SEO 2026

await navigateTo(`/kalender/${targetYear}`, { redirectCode: 301 })
</script>

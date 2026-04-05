<script setup lang="ts">
definePageMeta({
  middleware: [
    function (to, from) {
      return navigateTo('/kalender/2026', { redirectCode: 301 })
    }
  ]
})
</script>

<script setup lang="ts">
definePageMeta({
  middleware: [
    function (to, from) {
      return navigateTo(`/kalender/${new Date().getFullYear()}`, { redirectCode: 302 })
    }
  ]
})
</script>

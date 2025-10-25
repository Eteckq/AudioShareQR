<template>
  <div class="text-center py-12">
    <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
    <p class="text-sm text-gray-600 mt-2">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: 'Chargement...'
  }
})
</script>

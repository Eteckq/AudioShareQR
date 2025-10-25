<template>
  <div class="text-center py-8">
    <p class="text-gray-400">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: 'Aucun élément'
  }
})
</script>

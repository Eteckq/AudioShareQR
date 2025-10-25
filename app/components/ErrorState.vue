<template>
  <div class="text-center py-12">
    <p class="text-red-600 mb-4">{{ message }}</p>
    <button 
      v-if="showRetry"
      @click="$emit('retry')" 
      class="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-800"
    >
      {{ retryText }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    required: true
  },
  showRetry: {
    type: Boolean,
    default: true
  },
  retryText: {
    type: String,
    default: 'Réessayer'
  }
})

defineEmits(['retry'])
</script>

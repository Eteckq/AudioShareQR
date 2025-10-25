<template>
  <div class="flex items-center space-x-2">
    <slot>
      <!-- Boutons par défaut -->
      <button
        v-if="showListen"
        @click="$emit('listen')"
        class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
      >
        Écouter
      </button>
      
      <button
        v-if="showQR"
        @click="$emit('qr')"
        class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
      >
        QR
      </button>
      
      <button
        v-if="showDelete"
        @click="$emit('delete')"
        class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
      >
        Suppr
      </button>
    </slot>
  </div>
</template>

<script setup>
defineProps({
  showListen: {
    type: Boolean,
    default: true
  },
  showQR: {
    type: Boolean,
    default: true
  },
  showDelete: {
    type: Boolean,
    default: true
  }
})

defineEmits(['listen', 'qr', 'delete'])
</script>

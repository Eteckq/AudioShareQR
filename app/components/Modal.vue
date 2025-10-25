<template>
  <Teleport to="body">
    <div 
      v-if="isOpen" 
      class="fixed inset-0 bg-black text-white bg-opacity-50 flex items-center justify-center z-50"
      @click="handleBackdropClick"
    >
      <div 
        class="bg-black border rounded p-6 w-full max-w-md mx-4"
        :class="contentClass"
        @click.stop
      >
        <!-- Header -->
        <div v-if="title" class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-medium">{{ title }}</h2>
          <button
            v-if="showCloseButton"
            @click="close"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Contenu -->
        <div class="space-y-4">
          <slot></slot>
        </div>

        <!-- Footer avec boutons -->
        <div v-if="showFooter" class="flex gap-3 mt-6">
          <slot name="footer">
            <button
              v-if="showCancelButton"
              @click="close"
              class="flex-1 border rounded py-2 hover:bg-gray-800 transition-colors"
            >
              {{ cancelText }}
            </button>
            <button
              v-if="showConfirmButton"
              @click="confirm"
              :disabled="confirmDisabled"
              class="flex-1 border rounded py-2 hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ confirmText }}
            </button>
          </slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  contentClass: {
    type: String,
    default: ''
  },
  showCloseButton: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  showCancelButton: {
    type: Boolean,
    default: true
  },
  showConfirmButton: {
    type: Boolean,
    default: false
  },
  cancelText: {
    type: String,
    default: 'Annuler'
  },
  confirmText: {
    type: String,
    default: 'Confirmer'
  },
  confirmDisabled: {
    type: Boolean,
    default: false
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close', 'confirm'])

const close = () => {
  emit('close')
}

const confirm = () => {
  emit('confirm')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    close()
  }
}

// Fermer avec Escape
onMounted(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape' && props.isOpen) {
      close()
    }
  }
  
  document.addEventListener('keydown', handleEscape)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>

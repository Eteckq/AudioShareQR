<template>
  <div>
    <!-- Bouton pour générer le QR Code -->
    <button
      @click="openModal"
      :disabled="!fileId"
      class="border rounded px-4 py-2 hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ buttonText }}
    </button>

    <!-- Modal QR Code -->
    <Modal
      :is-open="showModal"
      title="QR Code généré"
      @close="closeModal"
    >
      <!-- Loading -->
      <div v-if="loading" class="text-center">
        <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-current mb-2"></div>
        <p class="text-sm text-gray-400">Génération du QR Code...</p>
      </div>

      <!-- QR Code généré -->
      <div v-else-if="qrData" class="text-center space-y-4">
        <div class="flex justify-center">
          <img :src="qrData.qrCodeDataUrl" alt="QR Code" class="border rounded" />
        </div>
        
        <p v-if="showUrl" class="text-sm text-gray-400 break-all">{{ qrData.url }}</p>
        
        <div v-if="showActions" class="flex gap-2 justify-center">
          <button
            @click="downloadQR"
            class="border rounded px-4 py-2 hover:bg-white hover:text-black transition-colors"
          >
            Télécharger
          </button>
        </div>
      </div>

      <!-- Erreur -->
      <div v-else-if="error" class="text-red-400 text-sm text-center">
        {{ error }}
      </div>

      <template #footer>
        <button
          @click="closeModal"
          class="flex-1 border rounded py-2 hover:bg-gray-800 transition-colors"
        >
          Fermer
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
const props = defineProps({
  fileId: {
    type: String,
    required: true
  },
  buttonText: {
    type: String,
    default: "Générer QR Code"
  },
  showUrl: {
    type: Boolean,
    default: true
  },
  showActions: {
    type: Boolean,
    default: true
  },
  autoGenerate: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['generated', 'error', 'close'])

const qrData = ref(null)
const loading = ref(false)
const error = ref('')
const showModal = ref(false)

const openModal = async () => {
  if (!props.fileId) return
  
  showModal.value = true
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch(`/api/qr/${props.fileId}`)
    qrData.value = response
    emit('generated', response)
  } catch (err) {
    console.error('Erreur génération QR:', err)
    error.value = 'Erreur lors de la génération du QR Code'
    emit('error', err)
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  showModal.value = false
  qrData.value = null
  error.value = ''
  emit('close')
}

const downloadQR = () => {
  if (qrData.value?.qrCodeDataUrl) {
    const link = document.createElement('a')
    link.download = `qr-code-${props.fileId}.png`
    link.href = qrData.value.qrCodeDataUrl
    link.click()
  }
}

// Auto-génération si demandée
onMounted(() => {
  if (props.autoGenerate && props.fileId) {
    openModal()
  }
})

// Exposer des méthodes pour le contrôle externe
defineExpose({
  openModal,
  closeModal,
  downloadQR
})
</script>

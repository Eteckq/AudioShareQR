<template>
  <div class="space-y-4">
    <!-- Nom de l'audio -->
    <div v-if="showNameInput">
      <label class="block text-sm text-gray-400 mb-2">Nom de l'audio</label>
      <input
        v-model="form.name"
        type="text"
        class="w-full border-b bg-transparent py-2 placeholder-gray-400 focus:outline-none"
        placeholder="Nom de l'audio"
        @input="onNameChange"
      />
    </div>

    <!-- Zone de sélection de fichier -->
    <div>
      <label v-if="showFileLabel" class="block text-sm text-gray-400 mb-2">Fichier audio</label>
      <div
        class="border-2 border-gray-300 border-dashed rounded p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
        :class="fileZoneClass"
        @click="triggerFileInput"
      >
        <!-- Animation d'upload -->
        <div v-if="uploading" class="space-y-2">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
          <p class="text-gray-400">Upload en cours...</p>
        </div>
        
        <!-- Fichier sélectionné -->
        <div v-else-if="form.file" class="space-y-2">
          <p class="text-green-400">✓ {{ form.file.name }}</p>
        </div>
        
        <!-- Zone de drop -->
        <div v-else class="space-y-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 mx-auto fill-gray-500" viewBox="0 0 32 32">
            <path d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z"/>
            <path d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z"/>
          </svg>
          <p class="text-gray-400">{{ fileZoneText }}</p>
        </div>
      </div>
      
      <input
        ref="fileInput"
        type="file"
        accept="*"
        @change="handleFileChange"
        class="hidden"
      />
    </div>

    <!-- Message d'erreur -->
    <div v-if="error" class="text-red-400 text-sm">
      {{ error }}
    </div>

    <!-- Boutons d'action -->
    <div v-if="showActions" class="flex gap-3">
      <button
        @click="handleSubmit"
        :disabled="!canSubmit || uploading"
        class="flex-1 border rounded py-2 hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ submitText }}
      </button>
      <button
        v-if="showCancel"
        @click="handleCancel"
        class="flex-1 border rounded py-2 hover:bg-gray-800 transition-colors"
      >
        Annuler
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  // Configuration du formulaire
  showNameInput: {
    type: Boolean,
    default: true
  },
  showFileLabel: {
    type: Boolean,
    default: true
  },
  showActions: {
    type: Boolean,
    default: true
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  
  // Textes personnalisables
  fileZoneText: {
    type: String,
    default: "Cliquer pour sélectionner un fichier"
  },
  submitText: {
    type: String,
    default: "Uploader"
  },
  
  // Classes CSS personnalisables
  fileZoneClass: {
    type: String,
    default: ""
  },
  
  // Valeurs initiales
  initialName: {
    type: String,
    default: ""
  }
})

const emit = defineEmits(['submit', 'cancel', 'name-change', 'file-change', 'error'])

const form = ref({
  name: props.initialName,
  file: null
})

const uploading = ref(false)
const error = ref('')
const fileInput = ref(null)

const canSubmit = computed(() => {
  return form.value.name?.trim() && form.value.file
})

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    form.value.file = file
    error.value = ''
    emit('file-change', file)
  }
}

const onNameChange = () => {
  error.value = ''
  emit('name-change', form.value.name)
}

const handleSubmit = async () => {
  if (!canSubmit.value) return
  
  uploading.value = true
  error.value = ''
  
  try {
    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('file', form.value.file)
    
    const response = await $fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (response.success) {
      emit('submit', response)
      resetForm()
    }
  } catch (err) {
    console.error('Erreur upload:', err)
    error.value = err.data?.message || 'Erreur lors de l\'upload du fichier'
    emit('error', err)
  } finally {
    uploading.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
  resetForm()
}

const resetForm = () => {
  form.value = {
    name: props.initialName,
    file: null
  }
  error.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Exposer des méthodes pour le contrôle externe
defineExpose({
  resetForm,
  setError: (err) => { error.value = err },
  setUploading: (state) => { uploading.value = state }
})
</script>

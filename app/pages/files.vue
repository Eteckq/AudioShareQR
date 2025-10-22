<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header simple -->
    <div class="bg-white border-b border-gray-200 px-4 py-3">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-gray-900">Audios uploadés</h1>
        <NuxtLink 
          to="/" 
          class="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Retour
        </NuxtLink>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="p-4">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        <p class="text-sm text-gray-600 mt-2">Chargement...</p>
      </div>

      <!-- Erreur -->
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button 
          @click="loadFiles" 
          class="px-4 py-2 bg-gray-900 text-white text-sm rounded hover:bg-gray-800"
        >
          Réessayer
        </button>
      </div>

      <!-- Liste des fichiers -->
      <div v-else class="space-y-2">
        <div 
          v-for="file in files" 
          :key="file.id"
          class="bg-white border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-medium text-gray-900 truncate">
                {{ file.name || 'Sans nom' }}
              </h3>
              <p class="text-xs text-gray-500 mt-1">
                {{ file.originalName }}
              </p>
              <p class="text-xs text-gray-600 mt-1">
                {{ formatDate(file.createdAt) }}
              </p>
            </div>
            
            <div class="flex items-center space-x-2 ml-4">
              <!-- Écouter -->
              <NuxtLink 
                :to="`/audio/${file.id}`"
                class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Écouter
              </NuxtLink>
              
              <!-- QR Code -->
              <NuxtLink 
                :to="`/success/${file.id}`"
                class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                QR
              </NuxtLink>
              
              <!-- Supprimer -->
              <button 
                @click="confirmDelete(file)"
                class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Suppr
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation -->
    <div 
      v-if="fileToDelete" 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="cancelDelete"
    >
      <div 
        class="bg-white rounded-lg p-6 max-w-sm w-full mx-4"
        @click.stop
      >
        <h3 class="text-lg font-medium text-gray-900 mb-2">Supprimer ?</h3>
        <p class="text-sm text-gray-600 mb-6">
          Supprimer "{{ fileToDelete.name || 'Sans nom' }}" ?
        </p>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="cancelDelete"
            class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            Annuler
          </button>
          <button 
            @click="deleteFile"
            :disabled="deleting"
            class="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-50"
          >
            {{ deleting ? '...' : 'Supprimer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const files = ref([])
const loading = ref(true)
const error = ref('')
const fileToDelete = ref(null)
const deleting = ref(false)

const loadFiles = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch('/api/files')
    files.value = response.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (err) {
    console.error('Erreur:', err)
    error.value = 'Erreur de chargement'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const confirmDelete = (file) => {
  fileToDelete.value = file
}

const cancelDelete = () => {
  fileToDelete.value = null
}

const deleteFile = async () => {
  if (!fileToDelete.value) return
  
  deleting.value = true
  
  try {
    await $fetch(`/api/files/${fileToDelete.value.id}`, {
      method: 'DELETE'
    })
    
    files.value = files.value.filter(f => f.id !== fileToDelete.value.id)
    fileToDelete.value = null
    
  } catch (err) {
    console.error('Erreur:', err)
    error.value = 'Erreur de suppression'
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadFiles()
})
</script>
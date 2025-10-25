<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Header simple -->
    <div class="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-white">Audios uploadés</h1>
        <NuxtLink 
          to="/" 
          class="text-sm text-gray-400 hover:text-white"
        >
          ← Retour
        </NuxtLink>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="p-4">
      <!-- Loading -->
      <LoadingState v-if="loading" />

      <!-- Erreur -->
      <ErrorState 
        v-else-if="error" 
        :message="error"
        @retry="loadFiles"
      />

      <!-- Liste des fichiers -->
      <ItemList 
        :items="files"
        @delete="confirmDelete"
      >
        <template #actions="{ item }">
          <!-- Écouter -->
          <NuxtLink 
            :to="`/audio/${item.id}`"
            class="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
          >
            Écouter
          </NuxtLink>
          
          <!-- QR Code -->
          <NuxtLink 
            :to="`/success/${item.id}`"
            class="px-2 py-1 text-xs bg-blue-900 text-blue-300 rounded hover:bg-blue-800"
          >
            QR
          </NuxtLink>
          
          <!-- Supprimer -->
          <button 
            @click="confirmDelete(item)"
            class="px-2 py-1 text-xs bg-red-900 text-red-300 rounded hover:bg-red-800"
          >
            Suppr
          </button>
        </template>
      </ItemList>
    </div>

    <!-- Modal de confirmation -->
    <Modal
      :is-open="!!fileToDelete"
      title="Supprimer ?"
      @close="cancelDelete"
    >
      <p class="text-sm text-gray-400 mb-6">
        Supprimer "{{ fileToDelete?.name || 'Sans nom' }}" ?
      </p>
      
      <template #footer>
        <button 
          @click="cancelDelete"
          class="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded hover:bg-gray-600"
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
      </template>
    </Modal>
  </div>
</template>

<script setup>
const { requireAuth } = useAuth()

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
  if (!requireAuth()) return
  loadFiles()
})
</script>
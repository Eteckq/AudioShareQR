<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Écran de connexion PIN -->
    <div v-if="!isAuthenticated" class="min-h-screen flex items-center justify-center">
      <div class="max-w-sm mx-auto px-5">
        <div class="space-y-4">
          <input
            v-model="pinInput"
            type="text"
            maxlength="4"
            class="w-full text-center text-2xl tracking-widest border-b bg-transparent py-3 placeholder-gray-400 focus:outline-none"
            placeholder="••••"
            @keyup.enter="verifyPin"
          />
          
          <button
            @click="verifyPin"
            :disabled="pinInput.length !== 4"
            class="w-full border rounded py-3 hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Accéder
          </button>
        </div>
        
        <div v-if="pinError" class="mt-4 text-red-400 text-sm text-center">
          {{ pinError }}
        </div>
      </div>
    </div>

    <!-- Interface principale après authentification -->
    <div v-else class="min-h-screen">
      <!-- Header -->
      <PageHeader 
        title="Mes Audios"
        :show-logout="true"
        @logout="logout"
      />

      <!-- Contenu principal -->
      <div class="p-4">
        <!-- Formulaire d'upload -->
        <div class="mb-6 border border-gray-800 rounded-lg p-4 bg-gray-900">
          <h2 class="text-lg font-semibold mb-4">Uploader un audio</h2>
          <UploadForm
            @submit="handleUploadSuccess"
            @error="handleUploadError"
          />
        </div>

        <!-- Liste des fichiers -->
        <div v-if="loading" class="text-center py-8">
          <p class="text-gray-400">Chargement des audios...</p>
        </div>

        <ErrorState 
          v-else-if="error" 
          :message="error"
          @retry="loadFiles"
        />

        <EmptyState 
          v-else-if="files.length === 0"
          message="Aucun audio uploadé"
        />

        <ItemList 
          v-else
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
    </div>

    <!-- Modal de confirmation de suppression -->
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
const { isAuthenticated, checkAuth, setAuth } = useAuth()

const pinInput = ref('')
const pinError = ref('')
const files = ref([])
const loading = ref(false)
const error = ref('')
const fileToDelete = ref(null)
const deleting = ref(false)

// Vérifier l'authentification au chargement de la page
onMounted(() => {
  if (checkAuth()) {
    loadFiles()
  }
})

const verifyPin = async () => {
  if (pinInput.value.length !== 4) return
  
  try {
    const response = await $fetch('/api/auth/pin', {
      method: 'POST',
      body: { pin: pinInput.value }
    })
    
    if (response.success) {
      setAuth(true)
      await loadFiles()
    } else {
      pinError.value = 'Code PIN incorrect'
      pinInput.value = ''
    }
  } catch (error) {
    pinError.value = 'Erreur de connexion'
  }
}

const logout = () => {
  setAuth(false)
  pinInput.value = ''
  pinError.value = ''
  files.value = []
}

const loadFiles = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch('/api/files')
    files.value = response.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (err) {
    console.error('Erreur chargement fichiers:', err)
    error.value = 'Erreur de chargement'
  } finally {
    loading.value = false
  }
}

const handleUploadSuccess = async (response) => {
  // Recharger la liste des fichiers après un upload réussi
  await loadFiles()
}

const handleUploadError = (err) => {
  error.value = err.data?.message || 'Erreur lors de l\'upload'
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
</script>

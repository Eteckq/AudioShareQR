<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Header -->
    <PageHeader 
      :title="playlist?.name || 'Playlist'"
      :subtitle="playlist?.description"
      :show-back-button="true"
      back-text="Retour aux playlists"
      back-to="/"
    >
      <template #actions>
        <button
          @click="showUploadModal = true"
          class="border rounded px-4 py-2 hover:bg-white hover:text-black transition-colors text-sm"
        >
          + Ajouter un audio
        </button>
      </template>
    </PageHeader>

    <!-- Contenu principal -->
    <div class="p-6">
      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-400">Chargement...</p>
      </div>

      <div v-else-if="error" class="text-center py-8">
        <p class="text-red-400">{{ error }}</p>
      </div>

      <div v-else-if="!playlist" class="text-center py-8">
        <p class="text-gray-400">Playlist non trouvée</p>
      </div>

      <div v-else-if="playlist.files?.length === 0" class="text-center py-8">
        <p class="text-gray-400">Aucun audio dans cette playlist</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="file in playlist.files"
          :key="file.id"
          class="border rounded p-4 hover:bg-gray-900 transition-colors"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h3 class="text-lg font-medium mb-2">{{ file.name }}</h3>
              <p class="text-gray-400 text-sm mb-3">
                {{ file.originalName }}
              </p>
              <div class="flex gap-4 text-sm text-gray-500">
                <QRCode 
                  :file-id="file.id"
                  button-text="Afficher le QR Code"
                />
                <button
                  @click="deleteFile(file.id)"
                  class="text-red-400 hover:text-red-300 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'upload -->
    <Modal
      :is-open="showUploadModal"
      title="Ajouter un audio"
      :showFooter="false"
      @close="cancelUpload"
    >
      <UploadForm
        :playlist-id="playlistId"
        submit-text="Ajouter"
        @submit="handleUploadSuccess"
        @cancel="cancelUpload"
        @error="handleUploadError"
      />
    </Modal>
  </div>
</template>

<script setup>
const { requireAuth } = useAuth()

const route = useRoute()
const playlistId = route.params.id

const playlist = ref(null)
const loading = ref(true)
const error = ref('')
const showUploadModal = ref(false)

const loadPlaylist = async () => {
  loading.value = true
  try {
    const response = await $fetch(`/api/playlists/${playlistId}`)
    playlist.value = response
  } catch (err) {
    console.error('Erreur chargement playlist:', err)
    error.value = 'Playlist non trouvée'
  } finally {
    loading.value = false
  }
}

// Vérifier l'authentification au chargement
onMounted(() => {
  requireAuth()
})

const handleUploadSuccess = async (response) => {
  await loadPlaylist()
  showUploadModal.value = false
}

const handleUploadError = (err) => {
  console.error('Erreur upload:', err)
}

const cancelUpload = () => {
  showUploadModal.value = false
}

const deleteFile = async (fileId) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet audio ?')) return
  
  try {
    await $fetch(`/api/files/${fileId}`, {
      method: 'DELETE'
    })
    await loadPlaylist()
  } catch (err) {
    console.error('Erreur suppression:', err)
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

onMounted(() => {
  requireAuth()
  loadPlaylist()
})
</script>

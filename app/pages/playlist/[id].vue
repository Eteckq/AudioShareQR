<template>
  <div class="min-h-screen bg-black text-white">
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <p class="text-gray-400">Chargement...</p>
    </div>

    <div v-else-if="error" class="min-h-screen flex items-center justify-center">
      <p class="text-red-400">{{ error }}</p>
    </div>

    <div v-else-if="!playlist" class="min-h-screen flex items-center justify-center">
      <p class="text-gray-400">Playlist non trouvée</p>
    </div>

    <div v-else class="min-h-screen">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-800">
        <h1 class="text-xl font-light">{{ playlist.name }}</h1>
        <p v-if="playlist.description" class="text-gray-400 text-sm mt-1">
          {{ playlist.description }}
        </p>
      </div>

      <!-- Contenu principal -->
      <div class="px-6 py-4 ">
        <div v-if="playlist.files?.length === 0" class="text-center py-8">
          <p class="text-gray-400">Aucun audio dans cette playlist</p>
        </div>

        <div v-else class="space-y-2 ">
          <div
            v-for="(file, index) in playlist.files"
            :key="file.id"
            class="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-gray-900 transition-colors rounded"
            :class="{ 'bg-gray-900': currentFileId === file.id }"
            @click="playFile(file)"
          >
            <div class="flex items-center space-x-3 flex-1 min-w-0">
              <div class="w-6 h-6 flex items-center justify-center flex-shrink-0">
                <div v-if="currentFileId === file.id && isPlaying" class="w-3 h-3 bg-green-500 rounded-sm animate-pulse"></div>
                <div v-else-if="currentFileId === file.id" class="w-3 h-3 bg-gray-500 rounded-sm"></div>
                <div v-else class="w-3 h-3 border border-gray-400 rounded-sm"></div>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-medium ">{{ file.name }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Player audio -->
      <div v-if="currentFile" class="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4">
        <div class="max-w-4xl mx-auto">
          <h3 class="text-sm font-medium mb-3 text-center">{{ currentFile.name }}</h3>
          <AudioPlayer 
            :src="audioUrl" 
            :key="currentFileId"
            :has-previous="hasPrevious"
            :has-next="hasNext"
            @play="onPlay"
            @pause="onPause"
            @ended="onEnded"
            @previous="playPrevious"
            @next="playNext"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const playlistId = route.params.id

const playlist = ref(null)
const loading = ref(true)
const error = ref('')
const currentFile = ref(null)
const currentFileId = ref(null)
const isPlaying = ref(false)
const audioUrl = ref('')

// Computed properties pour la navigation
const hasPrevious = computed(() => {
  if (!playlist.value?.files || !currentFileId.value) return false
  const currentIndex = playlist.value.files.findIndex(f => f.id === currentFileId.value)
  return currentIndex > 0
})

const hasNext = computed(() => {
  if (!playlist.value?.files || !currentFileId.value) return false
  const currentIndex = playlist.value.files.findIndex(f => f.id === currentFileId.value)
  return currentIndex < playlist.value.files.length - 1
})

const loadPlaylist = async () => {
  loading.value = true
  try {
    const response = await $fetch(`/api/playlists/${playlistId}`)
    playlist.value = response
    
    // Si c'est un fichier spécifique dans l'URL, le charger directement
    const fileId = route.query.file
    if (fileId && playlist.value.files) {
      const file = playlist.value.files.find(f => f.id === fileId)
      if (file) {
        // Charger le fichier immédiatement
        playFile(file)
        
        // Attendre que le DOM soit prêt puis démarrer l'autoplay
        await nextTick()
        setTimeout(() => {
          startAutoplay()
        }, 800)
      }
    }
  } catch (err) {
    console.error('Erreur chargement playlist:', err)
    error.value = 'Playlist non trouvée'
  } finally {
    loading.value = false
  }
}

const playFile = (file) => {
  currentFile.value = file
  currentFileId.value = file.id
  audioUrl.value = `/api/files/serve/${file.path.split('/').pop()}`
}

const startAutoplay = () => {
  // Trouver l'élément audio et le démarrer
  const audioElement = document.querySelector('audio')
  if (audioElement) {
    audioElement.play().catch(err => {
      console.log('Autoplay bloqué:', err)
      showPlayButton()
    })
  }
}

const showPlayButton = () => {
  // Optionnel: afficher un bouton play si l'autoplay est bloqué
  console.log('Autoplay bloqué - l\'utilisateur devra cliquer pour jouer')
}

const onPlay = () => {
  isPlaying.value = true
}

const onPause = () => {
  isPlaying.value = false
}

const onEnded = () => {
  isPlaying.value = false
  // Auto-play next file
  playNext()
}

const playPrevious = () => {
  if (!hasPrevious.value) return
  const currentIndex = playlist.value.files.findIndex(f => f.id === currentFileId.value)
  const previousFile = playlist.value.files[currentIndex - 1]
  playFile(previousFile)
  setTimeout(() => {
    startAutoplay()
  }, 100)
}

const playNext = () => {
  if (!hasNext.value) return
  const currentIndex = playlist.value.files.findIndex(f => f.id === currentFileId.value)
  const nextFile = playlist.value.files[currentIndex + 1]
  playFile(nextFile)
  setTimeout(() => {
    startAutoplay()
  }, 100)
}



const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

onMounted(() => {
  loadPlaylist()
})
</script>
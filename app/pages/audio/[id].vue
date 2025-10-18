<template>
  <div class="min-h-screen bg-white p-8">
    <div class="max-w-sm mx-auto">

      <div v-if="loading" class="text-center">
        <p class="text-black">Chargement...</p>
      </div>

      <div v-else-if="error" class="text-red-600">
        {{ error }}
      </div>

      <div v-else-if="file">
        <h1 class="text-xl font-normal text-black mb-8 text-center">
          {{ file.name }}
        </h1>

        <audio
          ref="audioPlayer"
          :src="audioUrl"
          controls
          preload="metadata"
          class="w-full mb-6"
          @loadedmetadata="onLoadedMetadata"
          @timeupdate="onTimeUpdate"
          @ended="onEnded"
        >
          Votre navigateur ne supporte pas l'élément audio.
        </audio>

        <div class="flex justify-center space-x-4">
          <button
            @click="togglePlayPause"
            class="border border-black py-2 px-4 text-black hover:bg-black hover:text-white transition-colors"
          >
            {{ isPlaying ? 'Pause' : 'Lecture' }}
          </button>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const fileId = route.params.id

const file = ref(null)
const loading = ref(true)
const error = ref('')
const audioUrl = ref('')
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)

const audioPlayer = ref(null)

// Charger les informations du fichier
const loadFile = async () => {
  try {
    const response = await $fetch(`/api/files/${fileId}`)
    file.value = response
    audioUrl.value = `/api/files/serve/${response.path.split('/').pop()}`
  } catch (err) {
    console.error('Erreur chargement fichier:', err)
    error.value = 'Fichier non trouvé'
  } finally {
    loading.value = false
  }
}

// Contrôles audio
const togglePlayPause = () => {
  if (audioPlayer.value) {
    if (isPlaying.value) {
      audioPlayer.value.pause()
    } else {
      audioPlayer.value.play()
    }
  }
}

const onLoadedMetadata = () => {
  duration.value = audioPlayer.value.duration
}

const onTimeUpdate = () => {
  currentTime.value = audioPlayer.value.currentTime
}

const onEnded = () => {
  isPlaying.value = false
}

// Écouter les événements de lecture/pause
watch(() => audioPlayer.value, (newPlayer) => {
  if (newPlayer) {
    newPlayer.addEventListener('play', () => { isPlaying.value = true })
    newPlayer.addEventListener('pause', () => { isPlaying.value = false })
  }
})

// Utilitaires
const formatTime = (time) => {
  if (!time || isNaN(time)) return '0:00'
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}


// Charger le fichier au montage
onMounted(() => {
  loadFile()
})
</script>

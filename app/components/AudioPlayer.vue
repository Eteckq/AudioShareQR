<template>
  <div class="w-full max-w-md mx-auto">

    <!-- Bouton de lecture principal -->
    <div class="flex justify-center my-16">
      <button
        @click="togglePlay"
        class="w-24 h-24 border-2 border-purple-400 rounded-full flex items-center justify-center"
        :class="{ 'animate-pulse': isPlaying }"
      >
        <svg 
          v-if="!isPlaying" 
          class="w-16 h-16 text-purple-400 ml-1" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M8 5v14l11-7z"/>
        </svg>
        <svg 
          v-else 
          class="w-12 h-12 text-purple-400" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
        </svg>
      </button>
    </div>


    <!-- Barre de temps -->
    <div class="mb-8">
      <div class="flex justify-between text-sm text-gray-300 mb-2">
        <span>{{ formatTime(isDragging ? (dragPercentage / 100) * duration : currentTime) }}</span>
        <span>{{ formatTime(duration) }}</span>
      </div>
      <div 
        class="w-full h-2 bg-gray-700 rounded-full cursor-pointer select-none"
        @click="seekTo"
        @mousedown="startDrag"
        @touchstart="startTouchDrag"
        ref="progressBar"
      >
        <div 
          class="h-full bg-purple-500 rounded-full transition-all duration-100"
          :style="{ width: (isDragging ? dragPercentage : progressPercentage) + '%' }"
        ></div>
      </div>
    </div>

    <!-- Audio élément caché -->
    <audio
      ref="audioElement"
      :src="src"
      @loadedmetadata="onLoadedMetadata"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      @play="onPlay"
      @pause="onPause"
      preload="metadata"
    ></audio>
  </div>
</template>

<script setup>
const props = defineProps({
  src: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['play', 'pause', 'ended', 'timeupdate'])

const audioElement = ref(null)
const progressBar = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const progressPercentage = ref(0)
const isDragging = ref(false)
const dragPercentage = ref(0)

const togglePlay = () => {
  if (!audioElement.value) return
  
  if (isPlaying.value) {
    audioElement.value.pause()
  } else {
    audioElement.value.play()
  }
}

const seekTo = (event) => {
  if (!audioElement.value || !progressBar.value) return
  
  const rect = progressBar.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = Math.max(0, Math.min(1, clickX / rect.width))
  const newTime = percentage * duration.value
  
  audioElement.value.currentTime = newTime
}

const getPercentageFromEvent = (event) => {
  if (!progressBar.value) return 0
  
  const rect = progressBar.value.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  return Math.max(0, Math.min(1, clickX / rect.width))
}

const startDrag = (event) => {
  isDragging.value = true
  dragPercentage.value = getPercentageFromEvent(event) * 100
  
  // Empêcher la sélection de texte pendant le glissement
  event.preventDefault()
}

const handleDrag = (event) => {
  if (!isDragging.value) return
  
  // Mettre à jour seulement le pourcentage visuel pendant le glissement
  dragPercentage.value = getPercentageFromEvent(event) * 100
  event.preventDefault()
}

const stopDrag = () => {
  if (!isDragging.value) return
  
  // Maintenant mettre à jour le currentTime de l'audio
  const newTime = (dragPercentage.value / 100) * duration.value
  if (audioElement.value) {
    audioElement.value.currentTime = newTime
  }
  
  isDragging.value = false
}

// Gestionnaires pour les événements tactiles (mobile)
const startTouchDrag = (event) => {
  isDragging.value = true
  const touch = event.touches[0]
  const mouseEvent = new MouseEvent('mousedown', {
    clientX: touch.clientX,
    clientY: touch.clientY
  })
  dragPercentage.value = getPercentageFromEvent(mouseEvent) * 100
  event.preventDefault()
}

const handleTouchDrag = (event) => {
  if (!isDragging.value) return
  
  const touch = event.touches[0]
  const mouseEvent = new MouseEvent('mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY
  })
  dragPercentage.value = getPercentageFromEvent(mouseEvent) * 100
  event.preventDefault()
}

const stopTouchDrag = () => {
  if (!isDragging.value) return
  
  // Mettre à jour le currentTime de l'audio
  const newTime = (dragPercentage.value / 100) * duration.value
  if (audioElement.value) {
    audioElement.value.currentTime = newTime
  }
  
  isDragging.value = false
}

const formatTime = (time) => {
  if (!time || isNaN(time)) return '0:00'
  
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const onLoadedMetadata = () => {
  duration.value = audioElement.value.duration
}

const onTimeUpdate = () => {
  if (isDragging.value) return // Ne pas mettre à jour pendant le glissement
  
  currentTime.value = audioElement.value.currentTime
  progressPercentage.value = (currentTime.value / duration.value) * 100
  emit('timeupdate', currentTime.value)
}

const onPlay = () => {
  isPlaying.value = true
  emit('play')
}

const onPause = () => {
  isPlaying.value = false
  emit('pause')
}

const onEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
  progressPercentage.value = 0
  emit('ended')
}

// Ajouter les gestionnaires d'événements globaux
onMounted(() => {
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', handleTouchDrag, { passive: false })
  document.addEventListener('touchend', stopTouchDrag)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', handleTouchDrag)
  document.removeEventListener('touchend', stopTouchDrag)
})

// Exposer des méthodes pour le contrôle externe
defineExpose({
  play: () => audioElement.value?.play(),
  pause: () => audioElement.value?.pause(),
  togglePlay,
  seekTo: (time) => {
    if (audioElement.value) {
      audioElement.value.currentTime = time
    }
  }
})
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .8;
  }
}
</style>

<template>
  <div class="w-full max-w-md mx-auto">

    <!-- Bouton de lecture principal -->
    <div class="flex justify-center my-16">
      <button
        @click="togglePlay"
        class="w-24 h-24 bg-purple-500 hover:bg-purple-400 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
        :class="{ 'animate-pulse': isPlaying }"
      >
        <svg 
          v-if="!isPlaying" 
          class="w-8 h-8 text-white ml-1" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M8 5v14l11-7z"/>
        </svg>
        <svg 
          v-else 
          class="w-8 h-8 text-white" 
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
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ formatTime(duration) }}</span>
      </div>
      <div 
        class="w-full h-2 bg-gray-700 rounded-full cursor-pointer"
        @click="seekTo"
        ref="progressBar"
      >
        <div 
          class="h-full bg-purple-500 rounded-full transition-all duration-100"
          :style="{ width: progressPercentage + '%' }"
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
  const percentage = clickX / rect.width
  const newTime = percentage * duration.value
  
  audioElement.value.currentTime = newTime
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

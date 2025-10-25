<template>
  <div class="w-full max-w-md mx-auto">
    <!-- Bouton de lecture principal -->
    <div class="flex justify-center my-16">
      <button
        @click="togglePlay"
        :disabled="!isReady"
        class="w-24 h-24 border-2 rounded-full flex items-center justify-center transition-all duration-200"
        :class="{
          [`border-${color}-400 animate-pulse`]: isPlaying,
          [`border-${color}-400 hover:border-${color}-300`]: isReady && !isPlaying,
          'border-gray-500 cursor-not-allowed opacity-50': !isReady,
        }"
      >
        <!-- Indicateur de chargement -->
        <svg
          v-if="isLoading"
          class="w-8 h-8 text-gray-400 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <!-- Bouton Play -->
        <svg
          v-else-if="!isPlaying"
          class="w-16 h-16 ml-1 transition-colors duration-200"
          :class="isReady ? `text-${color}-400` : 'text-gray-400'"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
        <!-- Bouton Pause -->
        <svg
          v-else
          :class="`w-12 h-12 text-${color}-400`"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      </button>
    </div>

    <!-- Message de statut -->
    <div v-if="isLoading" class="text-center text-sm text-gray-400 mb-4">
      Chargement de l'audio...
    </div>
    <div v-else-if="!isReady" class="text-center text-sm text-red-400 mb-4">
      Erreur de chargement
    </div>

    <!-- Barre de temps -->
    <div class="mb-8">
      <div class="flex justify-between text-sm text-gray-300 mb-2">
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ formatTime(duration) }}</span>
      </div>
      <div
        class="w-full h-3 bg-gray-700 rounded-full transition-all duration-200"
        :class="isReady ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'"
        @click="seekTo"
        ref="progressBar"
      >
        <div
          :class="`h-full bg-${color}-500 rounded-full transition-all duration-100`"
          :style="{ width: progressPercentage + '%' }"
        ></div>
      </div>
    </div>

    <!-- Audio élément caché -->
    <audio
      ref="audioElement"
      :src="src"
      @loadstart="onLoadStart"
      @loadedmetadata="onLoadedMetadata"
      @loadeddata="onLoadedData"
      @canplay="onCanPlay"
      @error="onError"
      @timeupdate="onTimeUpdate"
      @ended="onEnded"
      @play="onPlay"
      @pause="onPause"
      preload="metadata"
      :autoplay="autoplay"
    ></audio>
  </div>
</template>

<script setup>
const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: 'purple'
  },
  autoplay: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(["play", "pause", "ended", "timeupdate", "loadeddata"]);

const audioElement = ref(null);
const progressBar = ref(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const progressPercentage = ref(0);
const isLoading = ref(true);
const isReady = ref(false);

const togglePlay = () => {
  if (!audioElement.value || !isReady.value) return;

  if (isPlaying.value) {
    audioElement.value.pause();
  } else {
    audioElement.value.play();
  }
};

const seekTo = (event) => {
  if (!isReady.value || !audioElement.value || !progressBar.value) return;

  const rect = progressBar.value.getBoundingClientRect();
  const clickX = event.clientX - rect.left;
  const percentage = clickX / rect.width;
  const newTime = percentage * duration.value;

  audioElement.value.currentTime = newTime;
};

const formatTime = (time) => {
  if (!time || isNaN(time)) return "0:00";

  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const onLoadStart = () => {
  isLoading.value = true;
  isReady.value = false;
};

const onLoadedMetadata = () => {
  duration.value = audioElement.value.duration;
};

const onLoadedData = () => {
  emit("loadeddata");
};

const onCanPlay = () => {
  isLoading.value = false;
  isReady.value = true;
};

const onError = () => {
  isLoading.value = false;
  isReady.value = false;
  console.error("Erreur lors du chargement de l'audio");
};

const onTimeUpdate = () => {
  currentTime.value = audioElement.value.currentTime;
  progressPercentage.value = (currentTime.value / duration.value) * 100;
  emit("timeupdate", currentTime.value);
};

const onPlay = () => {
  isPlaying.value = true;
  emit("play");
};

const onPause = () => {
  isPlaying.value = false;
  emit("pause");
};

const onEnded = () => {
  isPlaying.value = false;
  currentTime.value = 0;
  progressPercentage.value = 0;
  emit("ended");
};

// Exposer des méthodes pour le contrôle externe
defineExpose({
  play: () => audioElement.value?.play(),
  pause: () => audioElement.value?.pause(),
  togglePlay,
  seekTo: (time) => {
    if (audioElement.value) {
      audioElement.value.currentTime = time;
    }
  },
});
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
</style>

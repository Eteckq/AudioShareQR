<template>
  <div class="w-full">
    <!-- Contrôles de navigation -->
    <div class="flex items-center justify-center space-x-6">
      <!-- Bouton précédent -->
      <button
        @click="$emit('previous')"
        :disabled="!hasPrevious"
        class="w-10 h-10 flex items-center justify-center transition-colors duration-200"
        :class="
          hasPrevious
            ? 'text-gray-300 hover:text-white'
            : 'text-gray-600 cursor-not-allowed'
        "
      >
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </button>

      <!-- Bouton play/pause principal -->
      <button
        @click="togglePlay"
        :disabled="!isReady"
        class="w-14 h-14 flex items-center rounded-full border border-blue-400 justify-center transition-all duration-200"
        :class="{
          [`text-blue-400`]: isReady && isPlaying,
          [`text-gray-300 hover:text-white`]: isReady && !isPlaying,
          'text-gray-600 cursor-not-allowed': !isReady,
        }"
      >
        <!-- Indicateur de chargement -->
        <svg
          v-if="isLoading"
          class="w-7 h-7 animate-spin"
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
          class="w-7 h-7 ml-0.5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
        <!-- Bouton Pause -->
        <svg v-else class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      </button>

      <!-- Bouton suivant -->
      <button
        @click="$emit('next')"
        :disabled="!hasNext"
        class="w-10 h-10 flex items-center justify-center transition-colors duration-200"
        :class="
          hasNext
            ? 'text-gray-300 hover:text-white'
            : 'text-gray-600 cursor-not-allowed'
        "
      >
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>
    </div>

    <!-- Barre de progression -->
    <div class="px-4 pb-4">
      <div class="flex justify-between text-sm text-gray-400 mb-2">
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ formatTime(duration) }}</span>
      </div>
      <div
        class="w-full h-2 bg-gray-700 rounded-full transition-all duration-200"
        :class="isReady ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'"
        @click="seekTo"
        ref="progressBar"
      >
        <div
          :class="`h-full bg-blue-500 rounded-full transition-all duration-100`"
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
  autoplay: {
    type: Boolean,
    default: true,
  },
  hasPrevious: {
    type: Boolean,
    default: false,
  },
  hasNext: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "play",
  "pause",
  "ended",
  "timeupdate",
  "loadeddata",
  "previous",
  "next",
]);

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
  if (audioElement.value) {
    currentTime.value = audioElement.value.currentTime;
    progressPercentage.value = (currentTime.value / duration.value) * 100;
    emit("timeupdate", currentTime.value);
  }
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

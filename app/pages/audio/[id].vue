<template>
  <div class="mx-auto w-full ">
    <div v-if="loading" class="text-center">
      <p class="text-black">Chargement...</p>
    </div>

    <div v-else-if="error" class="text-red-600 text-center">
      {{ error }}
    </div>

    <div v-else-if="file" class="px-4">
      <h1 class="text-2xl text-white font-normal mb-8 text-center">
        {{ file.name }}
      </h1>

      <AudioPlayer :src="audioUrl" @ended="onEnded" />
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const fileId = route.params.id;

const file = ref(null);
const loading = ref(true);
const error = ref("");
const audioUrl = ref("");

// Charger les informations du fichier
const loadFile = async () => {
  try {
    const response = await $fetch(`/api/files/${fileId}`);
    file.value = response;
    audioUrl.value = `/api/files/serve/${response.path.split("/").pop()}`;
  } catch (err) {
    console.error("Erreur chargement fichier:", err);
    error.value = "Fichier non trouvé";
  } finally {
    loading.value = false;
  }
};

const onEnded = () => {};

// Charger le fichier au montage
onMounted(() => {
  loadFile();
});
</script>

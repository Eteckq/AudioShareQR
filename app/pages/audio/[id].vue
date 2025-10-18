<template>
  <div class="mx-auto w-full ">
    <div v-if="loading" class="text-center">
      <p class="text-black">Chargement...</p>
    </div>

    <div v-else-if="error" class="text-red-600">
      {{ error }}
    </div>

    <div v-else-if="file" class=" ">
      <h1 class="text-xl font-normal text-black mb-8 text-center">
        {{ file.name }}
      </h1>

      <audio class="w-full" :src="audioUrl"  controlsList="nodownload" controls>
        Votre navigateur ne supporte pas l'élément audio.
      </audio>
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

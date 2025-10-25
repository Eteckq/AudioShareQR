<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Header -->
    <PageHeader 
      title="Upload Audio Individuel"
      :show-back-button="true"
      back-text="Retour"
      back-to="/"
    />

    <!-- Contenu principal -->
    <div class="max-w-sm mx-auto mt-20 px-5">
      <!-- Étape 1: Saisie du nom -->
      <div v-if="step === 1" class="space-y-6">
        <div>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full border-b bg-transparent py-2 placeholder-gray-400 focus:outline-none"
            placeholder="Nom de l'audio"
            @input="checkNameInput"
          />
        </div>
        <button
          @click="nextStep"
          :disabled="!form.name.trim()"
          class="w-full border rounded py-2 hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuer
        </button>
      </div>

      <!-- Étape 2: Upload du fichier -->
      <div v-if="step === 2" class="space-y-6">
        <div class="text-center">
          <p class="text-md text-gray-300 mb-4">
            Fichier: <strong>{{ form.name }}</strong>
          </p>
        </div>

        <UploadForm
          :show-name-input="false"
          :show-file-label="false"
          :show-actions="false"
          :show-cancel="false"
          file-zone-text="Sélectionner un fichier audio"
          file-zone-class="text-slate-500 font-semibold text-base rounded max-w-md h-52 mx-auto min-w-72"
          @file-change="handleFileChange"
        />

        <button
          @click="resetToStep1"
          class="w-full text-gray-500 py-2 hover:text-gray-700 transition-colors"
        >
          ← Retour
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const { requireAuth } = useAuth()

const form = ref({
  name: "",
  file: null,
});

const step = ref(1); // 1: nom, 2: upload
const uploading = ref(false);
const error = ref("");

const checkNameInput = () => {
  error.value = "";
};

const nextStep = () => {
  if (form.value.name.trim()) {
    step.value = 2;
    error.value = "";
  }
};

const resetToStep1 = () => {
  step.value = 1;
  form.value.file = null;
  error.value = "";
  // Reset du file input
  const fileInput = document.getElementById("fileInput");
  if (fileInput) fileInput.value = "";
};

const handleFileChange = async (event) => {
  form.value.file = event.target.files[0];
  error.value = "";

  // Upload automatiquement le fichier dès qu'il est sélectionné
  if (form.value.file) {
    await uploadFile();
  }
};

const uploadFile = async () => {
  if (!form.value.file || !form.value.name) {
    error.value = "Veuillez sélectionner un fichier";
    return;
  }

  uploading.value = true;
  error.value = "";

  try {
    const formData = new FormData();
    formData.append("name", form.value.name);
    formData.append("file", form.value.file);
    // Pas de playlistId pour les fichiers individuels

    const response = await $fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (response.success) {
      // Rediriger vers la page de succès
      await navigateTo(`/success/${response.file.id}`);
    }
  } catch (err) {
    console.error("Erreur upload:", err);
    error.value = err.data?.message || "Erreur lors de l'upload du fichier";
  } finally {
    uploading.value = false;
  }
};

// Plus besoin de goBack car géré par PageHeader

// Vérifier l'authentification au chargement
onMounted(() => {
  requireAuth()
})
</script>

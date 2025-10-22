<template>
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

      <div
        class=" text-slate-500 font-semibold text-base rounded max-w-md h-52 cursor-pointer border-2 border-gray-300 border-dashed mx-auto hover:border-gray-400 transition-colors text-center flex flex-col items-center justify-center min-w-72"
      >
        <!-- Animation d'upload -->
        <div v-if="uploading">
          <div
            class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"
          ></div>
          <p class="text-gray-400">Upload en cours...</p>
        </div>
        <label
          v-else
          class="flex flex-col items-center justify-center p-8"
          for="fileInput"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-11 mb-3 fill-gray-500"
            viewBox="0 0 32 32"
          >
            <path
              d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z"
              data-original="#000000"
            />
            <path
              d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z"
              data-original="#000000"
            />
          </svg>
          Sélectionner un fichier audio

          <input
            ref="fileInput"
            id="fileInput"
            type="file"
            accept="audio/*"
            required
            @change="handleFileChange"
            class="hidden"
          />
        </label>
      </div>

      <button
        @click="resetToStep1"
        class="w-full text-gray-500 py-2 hover:text-gray-700 transition-colors"
      >
        ← Retour
      </button>
    </div>

    <div v-if="error" class="mt-4 text-red-600 text-sm text-center">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
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

const resetForm = () => {
  step.value = 1;
  form.value.name = "";
  form.value.file = null;
  error.value = "";

  // Reset du file input
  const fileInput = document.getElementById("fileInput");
  if (fileInput) fileInput.value = "";
};
</script>

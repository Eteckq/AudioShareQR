<template>
  <div class="max-w-sm mx-auto">
    <!-- Étape 1: Saisie du nom -->
    <div v-if="step === 1" class="space-y-6">
      <div>
        <input
          v-model="form.name"
          type="text"
          required
          class="w-full border-b border-black bg-transparent py-2 text-black placeholder-gray-400 focus:outline-none"
          placeholder="Nom du fichier"
          @input="checkNameInput"
        />
      </div>
      <button
        @click="nextStep"
        :disabled="!form.name.trim()"
        class="w-full border border-black py-2 text-black hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continuer
      </button>
    </div>

    <!-- Étape 2: Upload du fichier -->
    <div v-if="step === 2" class="space-y-6">
      <div class="text-center">
        <p class="text-sm text-gray-600 mb-4">
          Fichier: <strong>{{ form.name }}</strong>
        </p>
      </div>

      <div
        class="bg-white text-slate-500 font-semibold text-base rounded max-w-md h-52 cursor-pointer border-2 border-gray-300 border-dashed mx-auto hover:border-gray-400 transition-colors text-center flex flex-col items-center justify-center min-w-72"
      >
        <!-- Animation d'upload -->
        <div v-if="uploading">
          <div
            class=" inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"
          ></div>
          <p class="text-gray-600">Upload en cours...</p>
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

    <!-- Étape 3: Résultat avec QR code -->
    <div v-if="step === 3 && qrCodeUrl" class="text-center space-y-6">
      <div class="space-y-4">
        <h2 class="text-xl font-semibold text-black">
          Fichier uploadé avec succès!
        </h2>
        <img :src="qrCodeUrl" alt="QR Code" class="mx-auto mb-4" />
        <div class="space-y-2">
          <p class="text-sm text-gray-600">
            Nom: <strong>{{ form.name }}</strong>
          </p>
          <NuxtLink
            :to="`/audio/${fileId}`"
            class="inline-block text-black underline hover:text-gray-600 transition-colors"
          >
            Écouter le fichier
          </NuxtLink>
        </div>
      </div>

      <button
        @click="resetForm"
        class="w-full border border-black py-2 text-black hover:bg-black hover:text-white transition-colors"
      >
        Uploader un nouveau fichier
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

const step = ref(1); // 1: nom, 2: upload, 3: résultat
const uploading = ref(false);
const qrCodeUrl = ref("");
const fileId = ref("");
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
      fileId.value = response.file.id;
      // Récupérer le QR code
      const qrResponse = await $fetch(`/api/qr/${response.file.id}`);
      qrCodeUrl.value = qrResponse.qrCodeDataUrl;

      // Passer à l'étape 3 (résultat)
      step.value = 3;
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
  qrCodeUrl.value = "";
  fileId.value = "";
  error.value = "";

  // Reset du file input
  const fileInput = document.getElementById("fileInput");
  if (fileInput) fileInput.value = "";
};
</script>

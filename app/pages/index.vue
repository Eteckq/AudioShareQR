<template>
  <div class="min-h-screen bg-white p-8">
    <div class="max-w-sm mx-auto">
      <form @submit.prevent="uploadFile" class="space-y-6">
        <div>
          <input
            v-model="form.name"
            type="text"
            required
            class="w-full border-b border-black bg-transparent py-2 text-black placeholder-gray-400 focus:outline-none"
            placeholder="Nom du fichier"
          />
        </div>

        <div>
          <label
            for="fileInput"
            class="bg-white text-slate-500 font-semibold text-base rounded max-w-md h-52 flex flex-col items-center justify-center cursor-pointer border-2 border-gray-300 border-dashed mx-auto"
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
            Upload audio file

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
          type="submit"
          :disabled="uploading"
          class="w-full border border-black py-2 text-black hover:bg-black hover:text-white transition-colors disabled:opacity-50"
        >
          {{ uploading ? "Upload..." : "Upload" }}
        </button>
      </form>

      <div v-if="qrCodeUrl" class="mt-12 text-center">
        <img :src="qrCodeUrl" alt="QR Code" class="mx-auto mb-4" />
        <NuxtLink :to="`/audio/${fileId}`" class="text-black underline">
          Écouter
        </NuxtLink>
      </div>

      <div v-if="error" class="mt-4 text-red-600 text-sm">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
const form = ref({
  name: "",
  file: null,
});

const uploading = ref(false);
const qrCodeUrl = ref("");
const fileId = ref("");
const error = ref("");

const handleFileChange = (event) => {
  form.value.file = event.target.files[0];
};

const uploadFile = async () => {
  if (!form.value.file || !form.value.name) {
    error.value = "Veuillez remplir tous les champs";
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

      // Reset du formulaire
      form.value.name = "";
      form.value.file = null;
      const fileInput = document.getElementById("file");
      if (fileInput) fileInput.value = "";
    }
  } catch (err) {
    console.error("Erreur upload:", err);
    error.value = err.data?.message || "Erreur lors de l'upload du fichier";
  } finally {
    uploading.value = false;
  }
};
</script>

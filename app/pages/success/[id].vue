<template>
  <div class="max-w-sm mx-auto">
    <!-- Affichage du résultat avec QR code -->
    <div v-if="fileData && qrCodeUrl" class="text-center space-y-6">
      <div class="space-y-4">
        <h2 class="text-xl font-semibold ">
          Audio uploadé!
        </h2>
        <img :src="qrCodeUrl" alt="QR Code" class="mx-auto mb-4" />
        <div class="space-y-2">
          <p class="text-sm text-gray-400">
            Nom: <strong>{{ fileData.name }}</strong>
          </p>
          <NuxtLink
            :to="`/audio/${fileId}`"
            class="inline-block  underline hover:text-gray-300 transition-colors"
          >
            Écouter
          </NuxtLink>
        </div>
      </div>

      <button
        @click="uploadNewFile"
        class="w-full border border-white rounded p-2  hover:bg-black hover:text-white transition-colors"
      >
        Uploader un nouveau fichier
      </button>
    </div>

    <!-- État de chargement -->
    <div v-else-if="loading" class="text-center space-y-6">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
      <p class="text-gray-300">Chargement des informations...</p>
    </div>

    <!-- Erreur -->
    <div v-else-if="error" class="text-center space-y-6">
      <div class="text-red-600 text-sm">
        {{ error }}
      </div>
      <button
        @click="uploadNewFile"
        class="w-full border border-black py-2 text-black hover:bg-black hover:text-white transition-colors"
      >
        Retour à l'accueil
      </button>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()

const fileId = route.params.id
const fileData = ref(null)
const qrCodeUrl = ref("")
const loading = ref(true)
const error = ref("")

// Fonction pour charger les données du fichier
const loadFileData = async () => {
  try {
    loading.value = true
    error.value = ""

    // Récupérer les informations du fichier
    const fileResponse = await $fetch(`/api/files/${fileId}`)
    fileData.value = fileResponse

    // Récupérer le QR code
    const qrResponse = await $fetch(`/api/qr/${fileId}`)
    qrCodeUrl.value = qrResponse.qrCodeDataUrl

  } catch (err) {
    console.error("Erreur lors du chargement:", err)
    error.value = err.data?.message || "Erreur lors du chargement des informations du fichier"
  } finally {
    loading.value = false
  }
}

// Fonction pour retourner à l'accueil
const uploadNewFile = () => {
  router.push('/')
}

// Charger les données au montage du composant
onMounted(() => {
  loadFileData()
})

// Définir le titre de la page
useHead({
  title: 'Upload réussi - QR Code Upload'
})
</script>

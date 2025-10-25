<template>
  <div class="min-h-screen bg-black text-white">
    <!-- Écran de connexion PIN -->
    <div v-if="!isAuthenticated" class="min-h-screen flex items-center justify-center">
      <div class="max-w-sm mx-auto px-5">
        <div class="space-y-4">
          <input
            v-model="pinInput"
            type="text"
            maxlength="4"
            class="w-full text-center text-2xl tracking-widest border-b bg-transparent py-3 placeholder-gray-400 focus:outline-none"
            placeholder="••••"
            @keyup.enter="verifyPin"
          />
          
          <button
            @click="verifyPin"
            :disabled="pinInput.length !== 4"
            class="w-full border rounded py-3 hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Accéder
          </button>
        </div>
        
        <div v-if="pinError" class="mt-4 text-red-400 text-sm text-center">
          {{ pinError }}
        </div>
      </div>
    </div>

    <!-- Interface principale après authentification -->
    <div v-else class="min-h-screen">
      <!-- Header -->
      <PageHeader 
        title="Gestion des Playlists"
        :show-logout="true"
        @logout="logout"
      />

      <!-- Contenu principal -->
      <div class="p-6">
        <!-- Boutons d'action -->
        <ActionButtonsMain 
          :buttons="mainButtons"
          @action="handleMainAction"
        />

        <!-- Liste des playlists -->
        <div v-if="loading" class="text-center py-8">
          <p class="text-gray-400">Chargement des playlists...</p>
        </div>

        <EmptyState 
          v-else-if="playlists.length === 0"
          message="Aucune playlist créée"
        />

        <CardGrid 
          v-else
          :items="playlists"
          @item-click="goToPlaylist"
        />
      </div>
    </div>

    <!-- Modal de création de playlist -->
    <Modal
      :is-open="showCreatePlaylist"
      title="Créer une playlist"
      @close="cancelCreatePlaylist"
    >
      <FormFields
        name-label="Nom de la playlist"
        name-placeholder="Ma playlist"
        :show-description="true"
        description-label="Description (optionnel)"
        description-placeholder="Description de la playlist"
        @name-change="onNameChange"
        @description-change="onDescriptionChange"
      />
      
      <template #footer>
        <button
          @click="createPlaylist"
          :disabled="!newPlaylist.name"
          class="flex-1 border rounded py-2 hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Créer
        </button>
        <button
          @click="cancelCreatePlaylist"
          class="flex-1 border rounded py-2 hover:bg-gray-800 transition-colors"
        >
          Annuler
        </button>
      </template>
      
      <div v-if="createError" class="mt-4 text-red-400 text-sm">
        {{ createError }}
      </div>
    </Modal>
  </div>
</template>

<script setup>
const { isAuthenticated, checkAuth, setAuth } = useAuth()

const pinInput = ref('')
const pinError = ref('')
const playlists = ref([])
const loading = ref(false)
const showCreatePlaylist = ref(false)
const createError = ref('')

const newPlaylist = ref({
  name: '',
  description: ''
})

// Vérifier l'authentification au chargement de la page
onMounted(() => {
  if (checkAuth()) {
    loadPlaylists()
  }
})


const verifyPin = async () => {
  if (pinInput.value.length !== 4) return
  
  try {
    const response = await $fetch('/api/auth/pin', {
      method: 'POST',
      body: { pin: pinInput.value }
    })
    
    if (response.success) {
      setAuth(true)
      await loadPlaylists()
    } else {
      pinError.value = 'Code PIN incorrect'
      pinInput.value = ''
    }
  } catch (error) {
    pinError.value = 'Erreur de connexion'
  }
}

const logout = () => {
  setAuth(false)
  pinInput.value = ''
  pinError.value = ''
  playlists.value = []
}

const loadPlaylists = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/playlists')
    playlists.value = response
  } catch (error) {
    console.error('Erreur chargement playlists:', error)
  } finally {
    loading.value = false
  }
}

const createPlaylist = async () => {
  if (!newPlaylist.value.name) return
  
  try {
    const response = await $fetch('/api/playlists', {
      method: 'POST',
      body: newPlaylist.value
    })
    
    if (response.success) {
      await loadPlaylists()
      cancelCreatePlaylist()
    }
  } catch (error) {
    createError.value = error.data?.message || 'Erreur lors de la création'
  }
}

const onNameChange = (name) => {
  newPlaylist.value.name = name
}

const onDescriptionChange = (description) => {
  newPlaylist.value.description = description
}

const cancelCreatePlaylist = () => {
  showCreatePlaylist.value = false
  newPlaylist.value = { name: '', description: '' }
  createError.value = ''
}

const mainButtons = ref([
  {
    id: 'create-playlist',
    text: '+ Créer une nouvelle playlist',
    class: 'hover:bg-white hover:text-black'
  },
  {
    id: 'upload-individual',
    text: 'Upload audio individuel',
    class: 'hover:bg-gray-800'
  }
])

const handleMainAction = (actionId) => {
  switch (actionId) {
    case 'create-playlist':
      showCreatePlaylist.value = true
      break
    case 'upload-individual':
      goToUpload()
      break
  }
}

const goToUpload = () => {
  navigateTo('/upload')
}

const goToPlaylist = (playlist) => {
  navigateTo(`/admin/playlist/${playlist.id}`)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}
</script>

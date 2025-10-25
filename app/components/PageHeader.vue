<template>
  <div class="border-b border-gray-800 px-6 py-4">
    <div class="flex justify-between items-center">
      <div class="flex-1">
        <!-- Bouton retour -->
        <button
          v-if="showBackButton"
          @click="goBack"
          class="text-gray-400 hover:text-white transition-colors text-sm mb-2 block"
        >
          ← {{ backText }}
        </button>
        
        <!-- Titre principal -->
        <h1 class="text-xl font-light">{{ title }}</h1>
        
        <!-- Sous-titre/description -->
        <p v-if="subtitle" class="text-gray-400 text-sm mt-1">
          {{ subtitle }}
        </p>
      </div>
      

    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  showBackButton: {
    type: Boolean,
    default: false
  },
  backText: {
    type: String,
    default: 'Retour'
  },
  backTo: {
    type: String,
    default: '/'
  },
  showLogout: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['back', 'logout'])

const goBack = () => {
  emit('back')
  navigateTo(props.backTo)
}

const logout = () => {
  emit('logout')
}
</script>

<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm text-gray-400 mb-2">{{ nameLabel }}</label>
      <input
        v-model="form.name"
        type="text"
        class="w-full border-b bg-transparent py-2 placeholder-gray-400 focus:outline-none"
        :placeholder="namePlaceholder"
        @input="onNameChange"
      />
    </div>
    
    <div v-if="showDescription">
      <label class="block text-sm text-gray-400 mb-2">{{ descriptionLabel }}</label>
      <textarea
        v-model="form.description"
        class="w-full border-b bg-transparent py-2 placeholder-gray-400 focus:outline-none resize-none"
        :placeholder="descriptionPlaceholder"
        :rows="descriptionRows"
        @input="onDescriptionChange"
      ></textarea>
    </div>
    
    <div v-if="error" class="text-red-400 text-sm">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  nameLabel: {
    type: String,
    default: 'Nom'
  },
  namePlaceholder: {
    type: String,
    default: 'Nom'
  },
  showDescription: {
    type: Boolean,
    default: false
  },
  descriptionLabel: {
    type: String,
    default: 'Description (optionnel)'
  },
  descriptionPlaceholder: {
    type: String,
    default: 'Description'
  },
  descriptionRows: {
    type: Number,
    default: 2
  },
  initialName: {
    type: String,
    default: ''
  },
  initialDescription: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['name-change', 'description-change', 'error'])

const form = ref({
  name: props.initialName,
  description: props.initialDescription
})

const error = ref('')

const onNameChange = () => {
  error.value = ''
  emit('name-change', form.value.name)
}

const onDescriptionChange = () => {
  emit('description-change', form.value.description)
}

// Exposer le formulaire pour le contrôle externe
defineExpose({
  form,
  setError: (err) => { error.value = err },
  reset: () => {
    form.value = {
      name: props.initialName,
      description: props.initialDescription
    }
    error.value = ''
  }
})
</script>

<template>
  <div class="space-y-2 text-white">
    <div 
      v-for="item in items" 
      :key="item.id"
      class=" border border-gray-200 rounded-lg p-4"
    >
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <h3 class="text-sm font-medium text-gray-200 truncate">
            {{ item.name || 'Sans nom' }}
          </h3>
          <p v-if="item.originalName" class="text-xs text-gray-200 mt-1">
            {{ item.originalName }}
          </p>
          <p v-if="item.description" class="text-xs text-gray-300 mt-1">
            {{ item.description }}
          </p>
          <p class="text-xs text-gray-600 mt-1">
            {{ formatDate(item.createdAt) }}
          </p>
        </div>
        
        <div class="flex items-center space-x-2 ml-4">
          <slot name="actions" :item="item">
            <!-- Actions par défaut -->
            <NuxtLink 
              v-if="item.id"
              :to="`/audio/${item.id}`"
              class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Écouter
            </NuxtLink>
            
            <NuxtLink 
              v-if="item.id"
              :to="`/success/${item.id}`"
              class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              QR
            </NuxtLink>
            
            <button 
              @click="$emit('delete', item)"
              class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Suppr
            </button>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  items: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['delete'])

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

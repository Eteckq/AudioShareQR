<template>
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    <div
      v-for="item in items"
      :key="item.id"
      class="border rounded p-4 hover:bg-gray-900 transition-colors cursor-pointer"
      @click="$emit('item-click', item)"
    >
      <h3 class="text-lg font-medium mb-2">{{ item.name }}</h3>
      <p v-if="item.description" class="text-gray-400 text-sm mb-3">
        {{ item.description }}
      </p>
      <div class="flex justify-between items-center text-sm text-gray-500">
        <span>{{ item.filesCount || 0 }} audio(s)</span>
        <span>{{ formatDate(item.createdAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true
  }
})

defineEmits(['item-click'])

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}
</script>

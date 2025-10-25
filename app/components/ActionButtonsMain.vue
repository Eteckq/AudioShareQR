<template>
  <div class="mb-8 flex gap-4">
    <button
      v-for="button in buttons"
      :key="button.id"
      @click="$emit('action', button.id)"
      class="border rounded px-6 py-3 hover:bg-white hover:text-black transition-colors"
      :class="button.class"
    >
      {{ button.text }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  buttons: {
    type: Array,
    required: true
  }
})

defineEmits(['action'])
</script>

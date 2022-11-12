<template>
  <button @click="emit('click', props.d)" class="text-lg relative p-3 rounded bg-gray-100 border-2 border-red-700 shadow-sm hover:shadow-md hover:bg-gray-800 hover:text-white">
    d{{props.d}}
    <span v-if="props.rolls" class="absolute min-w-6 h-6 px-1 text-center -top-3 -right-3 rounded-full bg-red-500 text-white">{{props.rolls}}</span>
  </button>
</template>

<script lang="ts" setup>

const emit = defineEmits(['click'])

const props = defineProps({
  d: Number,
  rolls: Number,
})

</script>

<style></style>
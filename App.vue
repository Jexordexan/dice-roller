<template>
  <div class="navbar navbar-dark bg-dark">
    <div class="navbar-brand">
      Dice calculator
    </div>
  </div>
  <main class="container">
    <Dice />
  </main>
</template>

<script lang="ts">
import { ref } from 'vue';
import Dice from './components/Dice.vue';

export default {
  components: {
    Dice,
  },
  setup() {
    const count = ref(0);
    return {
      count,
    };
  },
};
</script>

<style>
h1,
p {
  font-family: Arial, Helvetica, sans-serif;
}

main {
  max-width: 900px;
}

button.btn {
  touch-action: manipulation;
}
</style>

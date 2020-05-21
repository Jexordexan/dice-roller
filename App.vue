<template>
  <main class="container">
    <Dice />
  </main>
  <footer class="text-muted small p-2 text-center">
    Made with 🎲 by Jordan Simonds
  </footer>
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
body {
  font-family: 'Lato', 'Helvetica Neue', 'Roboto', sans-serif;
}

main {
  max-width: 900px;
  min-height: 100vh;
}

button.btn {
  touch-action: manipulation;
  text-transform: uppercase;
}
</style>

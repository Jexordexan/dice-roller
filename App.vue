<template>
  <main class="container">
    <Dice />
    <!-- <DiceObject /> -->
  </main>
  <footer class="text-muted small p-2 text-center">
    Made with 🎲 by Jordan Simonds
  </footer>
</template>

<script lang="ts">
import { ref } from 'vue';
import Dice from './components/Dice.vue';
import DiceObject from './components/DiceObject.vue';

export default {
  components: {
    Dice,
    DiceObject,
  },
};
</script>

<style>
body {
  font-family: 'Tinos', 'Garamond', serif;
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

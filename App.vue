<template>
  <main>
    <Dice />
  </main>
  <footer class="text-muted small p-2 text-center">
    Made with 🎲 by Jordan Simonds
  </footer>
</template>

<script lang="ts" setup>
import Dice from './components/Dice.vue';
</script>

<style>
body {
  font-family: 'Tinos', 'Garamond', serif;
  /* min-height: 100vh;
  display: flex; */
}

main {
  margin: 0 auto;
  padding: 0 2rem;
  max-width: 700px;
  flex-grow: 1;
}

button.btn {
  touch-action: manipulation;
  text-transform: uppercase;
}
</style>

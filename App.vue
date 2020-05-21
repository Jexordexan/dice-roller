<template>
  <div class="navbar navbar-dark bg-dark mb-3">
    <div class="navbar-brand">
      Dice roller
    </div>
  </div>
  <div class="container">
    <Dice />
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import Bingo from './components/Bingo.vue';
import Dice from './components/Dice.vue';

export default {
  components: {
    Bingo,
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

<style scoped>
h1 {
  color: #4fc08d;
}

h1,
p {
  font-family: Arial, Helvetica, sans-serif;
}
</style>

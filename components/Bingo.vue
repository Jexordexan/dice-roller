<template>
  <input type="text" @keypress.enter="roll" v-model="expr" />
  <button @click="roll">ROLL!</button>
  <div v-if="result">Result: {{ result }}</div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

interface IBook {
  id: string;
  isbn?: string;
  title?: string;
}

export default defineComponent({
  props: {
    name: String,
    greeting: {
      type: String,
      default: 'hello',
    },
    books: Array as PropType<IBook[]>,
  },
  setup(props) {
    console.log(props);
    const expr = ref('');
    const result = ref(0);

    function dN(N: number) {
      const random = Math.random();
      return Math.ceil(random * N);
    }

    function MdN(M: number, N: number) {
      let sum = 0;
      for (let i = 0; i < M; i++) {
        sum += dN(N);
      }
      return sum;
    }

    function parseConstant(str: string): number {
      return Number(str);
    }

    function parseRoll(str: string): number {
      const rollRE = /(\d+)d(\d+)/;
      const match = rollRE.exec(str);
      if (!match) return 0;
      const [_, M, N] = match;
      return MdN(parseConstant(M), parseConstant(N));
    }

    function roll() {
      const portions = expr.value.split('+').map((s) => s.trim());

      result.value = portions.reduce((sum, r) => {
        if (r.includes('d')) {
          return sum + parseRoll(r);
        } else if (!Number.isNaN(Number(r))) {
          return sum + parseConstant(r);
        } else {
          return sum;
        }
      }, 0);
    }

    return {
      expr,
      result,
      roll,
    };
  },
});
</script>

<style></style>

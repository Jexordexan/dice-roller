<template>
  <div class="list-group-item d-flex">
    <div>
      <strong>
        {{ name }}
      </strong>
      <div class="text-muted">
        {{ expression }}
      </div>
    </div>
    <span class="ml-auto mr-2 h2 align-self-center">{{ tweenedResult || '--' }}</span>
    <button class="btn btn-primary" @click="roll">
      ROLL
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import useTween from '../hooks/useTween';

export default defineComponent({
  props: {
    name: String,
    expression: {
      type: String,
      default: '',
    },
  },
  setup(props) {
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
      const portions = props.expression.split('+').map((s) => s.trim());

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

    const { tweened: tweenedResult } = useTween(result, 250);

    return {
      tweenedResult,
      result,
      roll,
    };
  },
});
</script>

<style></style>

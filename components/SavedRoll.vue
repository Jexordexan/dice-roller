<template>
  <div class="list-group-item d-flex">
    <button class="close mr-2 ml-n2" @click="$emit('delete')">
      <div class="sr-only">Delete</div>
      &times;
    </button>
    <div>
      <strong>
        {{ name }}
      </strong>
      <div class="text-muted">
        {{ expression }}
      </div>
    </div>
    <span class="ml-auto mx-2 my-0 h2 align-self-center text-success flex-shrink-0">{{ tweenedResult || '--' }}</span>
    <button class="btn btn-primary" @click="rollDice">
      Roll
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import useTween from '../hooks/useTween';
import { rollExpression, playDiceSound } from '../utils/diceRolling';

export default defineComponent({
  name: 'SavedRoll',
  props: {
    expression: {
      type: String,
      default: '', // `default: ''` or `required: true` make this prop non-null
      // required: true
    },
    name: {
      type: String, // This prop is optional
    },
  },
  setup(props) {
    const result = ref(0);
    const { tweened: tweenedResult } = useTween(result, 250);

    function rollDice() {
      playDiceSound();
      result.value = rollExpression(props.expression);
    }

    return {
      tweenedResult,
      rollDice,
      result,
    };
  },
});
</script>

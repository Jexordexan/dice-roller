<template>
  <div class="form">
    <div class="row">
      <div class="col-md-4 mx-auto p-2 text-center bg-light rounded">
        <legend>Total</legend>
        <h1 :class="{ wiggle: animating }">{{ tweenedTotal }}</h1>
        <div class="sr-only" aria-live="polite">Total: {{ total }}</div>
      </div>
    </div>
    <div class="form-group">
      <label for="modifier">Modifier</label>
      <div class="input-group input-group-lg">
        <div class="input-group-prepend w-25">
          <button class="btn btn-primary flex-fill" @click="modifier += -1">–</button>
        </div>
        <input id="modifier" class="form-control text-center" type="number" v-model.number="modifier" />
        <div class="input-group-append w-25">
          <button class="btn btn-primary flex-fill" @click="modifier += 1">+</button>
        </div>
      </div>
    </div>
    <div class="form-group">
      <label for="expression">Dice rolls</label>
      <input id="expression" class="form-control text-center" type="text" readonly :value="expression" />
    </div>
    <div class="form-group">
      <label class="form-label">Add dice</label>
      <br />
      <div class="row flex-wrap">
        <div class="col-lg-2 col-md-3 col-sm-4 col-6 d-flex" v-for="die in dice" :key="die">
          <button class="flex-fill btn btn-secondary btn-lg mb-3" @click="roll(die)">d{{ die }}</button>
        </div>
      </div>
    </div>
    <div class="form-group">
      <button class="btn btn-primary btn-lg" @click="reroll">
        RE-ROLL
      </button>
      <button class="btn btn-light float-right" @click="clear">
        CLEAR
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed } from 'vue';
import useTween from '../hooks/useTween';

export default defineComponent({
  name: 'Dice',
  setup() {
    const dice = [4, 6, 8, 10, 12, 20, 100];
    const result = ref(0);
    const modifier = ref(0);
    const rolls = reactive(new Map<number, number>());
    const expression = computed(() => {
      const list: string[] = [];
      rolls.forEach((count, die) => list.push(`${count}d${die}`));
      return list.join(' + ');
    });

    function roll(die: number) {
      rolls.set(die, (rolls.get(die) || 0) + 1);
      result.value += Math.ceil(Math.random() * die);
    }

    function clear() {
      rolls.clear();
      result.value = 0;
    }

    function reroll() {
      result.value = 0;
      rolls.forEach((count, die) => {
        for (let i = 0; i < count; i++) {
          result.value += Math.ceil(Math.random() * die);
        }
      });
    }

    const { source: total, tweened: tweenedTotal, animating } = useTween(
      computed(() => result.value + modifier.value),
      250
    );

    return {
      dice,
      rolls,
      result,
      total,
      tweenedTotal,
      animating,
      modifier,
      roll,
      reroll,
      expression,
      clear,
    };
  },
});
</script>

<style>
.wiggle {
  animation: wiggle 250ms ease-in-out;
  opacity: 0.5;
  filter: blur(2px);
}

@keyframes wiggle {
  0% {
    transform: translateX(0px);
  }
  25% {
    transform: translateX(20px);
  }
  75% {
    transform: translateX(-20px);
  }
  100% {
    transform: translateX(0px);
  }
}
</style>

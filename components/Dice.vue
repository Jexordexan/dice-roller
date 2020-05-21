<template>
  <div>
    <div class="row text-center bg-light rounded">
      <div class="col mx-auto p-2">
        <legend>Total</legend>
        <h1 class="text-success" :class="{ wiggle: animating }">{{ tweenedTotal }}</h1>
        <div class="sr-only" aria-live="polite">Total: {{ total }}</div>
      </div>
    </div>
    <div class="form-group">
      <label for="expression">Current expression</label>
      <input id="expression" class="form-control text-center" type="text" readonly :value="expression" />
    </div>
    <div class="form-group">
      <label class="form-label">Add dice</label>
      <br />
      <div class="d-flex flex-wrap justify-content-center die-buttons">
        <button
          class="die-button btn btn-secondary btn-lg m-1 flex-grow-1"
          v-for="die in dice"
          :key="die"
          @click="recordRoll(die)"
        >
          d{{ die }}
        </button>
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
      <button class="btn btn-primary btn-lg mr-2" @click="reRoll">
        RE-ROLL
      </button>
      <button class="btn btn-secondary btn-lg" @click="save" v-show="rollMap.size > 0">
        SAVE
      </button>
      <button class="btn btn-light btn-lg float-right" @click="clear">
        CLEAR
      </button>
    </div>
    <template v-if="savedRolls.length">
      <hr />
      <h3>Saved rolls</h3>
      <div class="list-group">
        <SavedRoll v-for="roll in savedRolls" :key="roll.name" :name="roll.name" :expression="roll.expression" />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed } from 'vue';
import useTween from '../hooks/useTween';
import useLocalStorage from '../hooks/useLocalStorage';

import SavedRoll from './SavedRoll.vue';

interface Roll {
  expression: string;
  name?: string;
}

function rollDie(die: number) {
  return Math.ceil(Math.random() * die);
}

export default defineComponent({
  name: 'Dice',
  components: {
    SavedRoll,
  },
  setup() {
    // Current roll editor
    const dice = [4, 6, 8, 10, 12, 20, 100];
    const result = ref(0);
    const modifier = ref(0);
    const rollMap = reactive(new Map<number, number>());
    const expression = computed(() => {
      const list: string[] = [];
      rollMap.forEach((count, die) => list.push(`${count}d${die}`));
      if (modifier.value > 0) list.push(`${modifier.value}`);
      return list.join(' + ');
    });

    function recordRoll(die: number) {
      rollMap.set(die, (rollMap.get(die) || 0) + 1);
      result.value += rollDie(die);
    }

    function clear() {
      rollMap.clear();
      modifier.value = 0;
      result.value = 0;
    }

    function reRoll() {
      result.value = 0;
      rollMap.forEach((count, die) => {
        for (let i = 0; i < count; i++) {
          result.value += rollDie(die);
        }
      });
    }

    const { source: total, tweened: tweenedTotal, animating } = useTween(
      computed(() => result.value + modifier.value),
      250
    );

    // Saved roll equations
    const savedRolls = useLocalStorage('savedRolls', [] as Roll[]);

    function save() {
      if (rollMap.size === 0) return;
      const name = prompt('Enter a name for this roll') || 'Unnamed';
      savedRolls.value.push({ name, expression: expression.value });
      clear();
    }

    return {
      dice,
      rollMap,
      result,
      total,
      tweenedTotal,
      animating,
      modifier,
      recordRoll,
      reRoll,
      expression,
      clear,
      save,
      savedRolls,
    };
  },
});
</script>

<style scoped>
.die-button {
  width: 100px;
}

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

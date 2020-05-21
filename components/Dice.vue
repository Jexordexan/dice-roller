<template>
  <div>
    <header class="row text-center bg-dark mb-2 text-light">
      <div class="col mx-auto p-2">
        <legend id="total-label" class="font-weight-bold">Total</legend>
        <h1 id="roll-total" aria-describedby="total-label" class="text-warning" :class="{ wiggle: animating }">
          {{ tweenedTotal || '--' }}
        </h1>
        <div class="sr-only" aria-live="polite">Total: {{ total }}</div>
        <div class="text-white-50">
          {{ expression || 'Roll some dice!' }}
        </div>
      </div>
    </header>
    <div class="form-group">
      <label class="form-label">Add dice</label>
      <br />
      <div class="d-flex flex-wrap justify-content-center die-buttons">
        <button
          class="die-button btn btn-secondary btn-lg m-1 flex-grow-1"
          v-for="die in diceBag"
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
          <button class="btn btn-outline-dark flex-fill" @click="modifier += -1">–</button>
        </div>
        <input
          id="modifier"
          class="form-control text-center"
          type="number"
          inputmode="numeric"
          v-model.number="modifier"
        />
        <div class="input-group-append w-25">
          <button class="btn btn-outline-dark flex-fill" @click="modifier += 1">+</button>
        </div>
      </div>
    </div>
    <div class="form-group d-flex flex-row-reverse">
      <button class="btn btn-warning btn-lg" @click="reRoll" :disabled="!rollMap.size > 0 || animating">
        Roll
      </button>
      <button class="btn btn-secondary btn-lg mr-1" @click="saveRoll" v-show="rollMap.size > 0">
        Save
      </button>
      <button class="btn btn-light btn-lg mr-auto" @click="clear" v-show="expression">
        Clear
      </button>
    </div>
    <template v-if="savedRolls.length">
      <hr />
      <h3>Saved rolls</h3>
      <div class="list-group">
        <SavedRoll
          v-for="(roll, index) in savedRolls"
          :key="index"
          :name="roll.name"
          :expression="roll.expression"
          @delete="deleteRoll(index)"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed } from 'vue';

// These composition functions are just expoerted reactive logic engines
import useTween from '../hooks/useTween';
import useLocalStorage from '../hooks/useLocalStorage';

// Import components the same old way
import SavedRoll from './SavedRoll.vue';
import { rollDie, rollExpression, playDiceSound } from '../utils/diceRolling';

interface Roll {
  expression: string;
  name?: string;
}

export default defineComponent({
  name: 'Dice',
  components: {
    SavedRoll,
  },
  setup() {
    // This is a true constant, we will never update this array
    // No need to make it reactive
    const diceBag = [2, 4, 6, 8, 10, 12, 20, 100];

    // Think of these like data from the object API
    // But instead of being bound to this, each ref has a .value
    // TIP: Use ref whenever you would use `let` in normal JS
    const result = ref(0);
    const modifier = ref(0);

    // we use this to count each die thats been rolled
    // using reactive to wrap a Map, yes Maps/Sets are now reactive!
    // TIP: Use reactive whenever you would use `const` in regular JS
    const rollMap = reactive(new Map<number, number>());

    // ComputedRefs are equivalent to computed section in object api
    // Like refs, they also have a readonly .value property

    // This computed ref converts our Map and modifier to a string like "1d8 + 2d6 + 3"
    const expression = computed(() => {
      const list: string[] = [];
      rollMap.forEach((count, die) => list.push(`${count}d${die}`));
      if (modifier.value > 0) list.push(`${modifier.value}`);
      return list.join(' + ');
    });

    const total = computed(() => result.value + modifier.value);

    // Using external logic to get a ref for a tweened value
    const { tweened: tweenedTotal, animating } = useTween(total, 250);

    // These are methods
    function recordRoll(die: number) {
      playDiceSound();
      rollMap.set(die, (rollMap.get(die) || 0) + 1);
      result.value += rollDie(die);
    }

    function clear() {
      rollMap.clear();
      modifier.value = 0;
      result.value = 0;
    }

    function reRoll() {
      playDiceSound();
      result.value = 0;
      result.value = rollExpression(expression.value);
    }

    // Saved roll equations
    const savedRolls = useLocalStorage('savedRolls', [] as Roll[]);

    function saveRoll() {
      if (rollMap.size === 0) return;
      const name = prompt('Enter a name for this roll');
      if (name == null) return;
      savedRolls.value.push({ name: name.trim() || 'No name', expression: expression.value });
      clear();
    }

    function deleteRoll(index: number) {
      if (index < 0 || index >= savedRolls.value.length) return;
      savedRolls.value.splice(index, 1);
    }

    return {
      // Roll editor
      diceBag,
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

      // Saved rolls
      saveRoll,
      deleteRoll,
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
  transform-origin: center;
}

@keyframes wiggle {
  0% {
    transform: translate(0px, 0px) rotate(0);
  }
  20% {
    transform: translateX(20px) rotate(10deg);
  }
  40% {
    transform: translateY(20px) rotate(-10deg);
  }
  60% {
    transform: translateX(-20px) rotate(10deg);
  }
  80% {
    transform: translateY(-20px) rotate(-10deg);
  }
  100% {
    transform: translate(0px, 0px) rotate(0);
  }
}
</style>

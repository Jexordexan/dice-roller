<template>
  <div>
    <header class="row text-center bg-dark mb-2 text-light total-header">
      <div class="col mx-auto p-0">
        <Histogram :class="{ invisible: rollMap.size === 0 }" :expression="expression" :value="result" />
        <div class="header-content">
          <legend id="total-label" class="font-weight-bold">Total</legend>
          <h1 id="roll-total" aria-describedby="total-label" class="text-warning" :class="{ shake: animating }">
            {{ tweenedTotal || '--' }}
          </h1>
          <div class="sr-only" aria-live="polite">Total: {{ total }}</div>
          <div class="text-white-50">
            {{ expression || 'Roll some dice!' }}
          </div>
        </div>
      </div>
    </header>
    <div class="form-group">
      <label class="form-label">Add dice</label>
      <br />
      <div class="grid gap-3 grid-cols-3 flex-wrap justify-content-center die-buttons">
        <DiceButton v-for="die in diceBag" :key="die" :d="die" :rolls="getRolls(die)" @click="recordRoll(die)"/>
        <button
          class="die-button btn btn-outline-secondary btn-lg"
          @click="clear"
          :disabled="!expression"
        >
          Clear
        </button>
      </div>
    </div>
    <div class="form-group">
      <label for="modifier">Modifier</label>
      <div class="input-group input-group-lg">
        <div class="input-group-prepend w-25">
          <button class="btn btn-light border border-gray flex-fill" aria-label="Subtract 1" @click="modifier -= 1">–</button>
        </div>
        <input
          id="modifier"
          class="form-control text-center border-gray"
          type="number"
          inputmode="numeric"
          v-model.number="modifier"
        />
        <div class="input-group-append w-25">
          <button class="btn btn-light border border-gray flex-fill" aria-label="Add 1" @click="modifier += 1">+</button>
        </div>
      </div>
    </div>
    <div class="row flex-row-reverse">
      <div class="col">
        <button class="btn btn-block btn-warning btn-lg" @click="reRoll" :disabled="rollMap.size === 0 || animating">
          Roll
        </button>
      </div>
      <div class="col">
        <button class="btn btn-block btn-secondary btn-lg mr-1" @click="saveRoll" v-show="rollMap.size > 0">
          Save
        </button>
      </div>
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

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue';

// Utilities for rolling dice
import { rollDie, rollExpression, playDiceSound, injectSounds, runSimulation, simulate } from '../utils/diceRolling';

// These composition functions are just shared reactive logic utilities
import useTween from '../hooks/useTween';
import useLocalStorage from '../hooks/useLocalStorage';

// Import components the same old way
import SavedRoll from './SavedRoll.vue';
import Histogram from './Histogram.vue';
import DiceButton from './DiceButton.vue';

interface Roll {
  expression: string;
  name?: string;
}
/**
 * DICE CALCULATOR
 */

// This is a true constant, we will never update this array
// No need to make it reactive
const diceBag = [2, 4, 6, 8, 10, 12, 20, 100];

// Think of these like data from the object API
// But instead of being bound to `this`, each ref has a .value
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

// Using external logic to get a ref for a tweened version of result
const { tweened, animating } = useTween(result, 250);

const total = computed(() => result.value + modifier.value);
const tweenedTotal = computed(() => tweened.value + modifier.value);

// onMounted hook runs when this component mounts to the DOM
// just like the mounted lifecycle method
// This allows us to play dice sounds by injecting <audio> elements
onMounted(() => {
  injectSounds();
});

// These are like methods, except they are plain old functions!
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
  result.value = rollExpression(expression.value);
}

/**
 * SAVED ROLLS
 */
const savedRolls = useLocalStorage('savedRolls', [] as Roll[]);

function saveRoll() {
  if (rollMap.size === 0) return;
  const name = window.prompt('Enter a name for this roll');
  if (name == null) return;
  savedRolls.value.push({ name: name.trim() || 'No name', expression: expression.value });
  clear();
}

function deleteRoll(index: number) {
  if (index < 0 || index >= savedRolls.value.length) return;
  savedRolls.value.splice(index, 1);
}

function getRolls(die: number): number {
  return rollMap.get(die) || 0
}

</script>

<style scoped>
.total-header {
  position: relative;
  height: 150px;
}

.header-content {
  position: relative;
  z-index: 1;
}

.shake {
  opacity: 0.5;
  filter: blur(3px);
  animation: shake 250ms;
}

@keyframes shake {
  0% {
    transform: translate(0px, 0px) rotate(0);
  }
  20% {
    transform: translate(20px, 20px) rotate(10deg);
  }
  80% {
    transform: translate(-20px, -20px) rotate(-10deg);
  }
  100% {
    transform: translate(0px, 0px) rotate(0);
  }
}
</style>

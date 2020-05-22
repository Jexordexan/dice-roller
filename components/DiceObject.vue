<template>
  <div>
    <header class="row text-center bg-dark mb-2 text-light">
      <div class="col mx-auto p-2">
        <legend id="total-label" class="font-weight-bold">Total</legend>
        <h1 id="roll-total" aria-describedby="total-label" class="text-warning" :class="{ wiggle: animating }">
          {{ tweenedResult || '--' }}
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
        <button
          class="die-button btn btn-outline-secondary btn-lg m-1 flex-grow-1"
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
          <button class="btn btn-light border border-gray flex-fill" @click="modifier -= 1">–</button>
        </div>
        <input
          id="modifier"
          class="form-control text-center border-gray"
          type="number"
          inputmode="numeric"
          v-model.number="modifier"
        />
        <div class="input-group-append w-25">
          <button class="btn btn-light border border-gray flex-fill" @click="modifier += 1">+</button>
        </div>
      </div>
    </div>
    <div class="row flex-row-reverse">
      <div class="col">
        <button class="btn btn-block btn-warning btn-lg" @click="reRoll" :disabled="noRolls || animating">
          Roll
        </button>
      </div>
      <div class="col">
        <button class="btn btn-block btn-secondary btn-lg mr-1" @click="saveRoll" v-show="!noRolls">
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

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted } from 'vue';
import TWEEN from '@tweenjs/tween.js';

// Utilities for rolling dice
import { rollDie, rollExpression, playDiceSound, injectSounds } from '../utils/diceRolling';

// Import components the same old way
import SavedRoll from './SavedRoll.vue';

interface Roll {
  expression: string;
  name?: string;
}

export default defineComponent({
  name: 'Dice',
  components: {
    SavedRoll,
  },
  data() {
    return {
      diceBag: [2, 4, 6, 8, 10, 12, 20, 100],
      result: 0,
      modifier: 0,
      rollMap: {} as Record<string, number>,
      savedRolls: [] as Roll[],
      tweenedResult: 0,
      tweenDuration: 250,
      animating: false,
    };
  },
  computed: {
    expression() {
      const list: string[] = [];
      Object.keys(this.rollMap).forEach((die) => list.push(`${this.rollMap[die]}d${die}`));
      if (this.modifier > 0) list.push(`${this.modifier}`);
      return list.join(' + ');
    },
    total() {
      return this.result + this.modifier;
    },
    tweenedTotal() {
      return this.tweenedResult + this.modifier;
    },
    noRolls() {
      return Object.keys(this.rollMap).length === 0;
    },
  },
  methods: {
    recordRoll(die: number) {
      playDiceSound();
      this.rollMap[die] = (this.rollMap[die] || 0) + 1;
      this.result += rollDie(die);
    },

    clear() {
      this.rollMap = {};
      this.modifier = 0;
      this.result = 0;
    },

    reRoll() {
      playDiceSound();
      this.result = 0;
      this.result = rollExpression(this.expression);
    },

    saveRoll() {
      if (this.noRolls) return;
      const name = prompt('Enter a name for this roll');
      if (name == null) return;
      this.savedRolls.push({ name: name.trim() || 'No name', expression: this.expression });
      this.clear();
    },
    deleteRoll(index: number) {
      if (index < 0 || index >= this.savedRolls.length) return;
      this.savedRolls.splice(index, 1);
    },
  },
  mounted() {
    injectSounds();
  },
  watch: {
    result(currentValue: number) {
      // This is our main logic block. It handles tweening from a start value to an end value.
      let frameHandler: number;

      // Handles updating the tween on each frame.
      const animate = (currentTime: number) => {
        TWEEN.update(currentTime);
        frameHandler = requestAnimationFrame(animate);
      };

      const tweened = {
        value: currentValue,
      };

      new TWEEN.Tween(tweened)
        .to({ value: currentValue }, this.tweenDuration)
        .onUpdate(() => {
          this.tweenedResult = Math.round(tweened.value);
        })
        .onComplete(() => {
          // Make sure to clean up after ourselves.
          cancelAnimationFrame(frameHandler);
          this.animating = false;
        })
        // This actually starts the tween.
        .start();
      this.animating = true;

      frameHandler = requestAnimationFrame(animate);
    },
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

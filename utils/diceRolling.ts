import { memoizeWith, zipWith, identity, countBy, toPairs } from 'ramda';

export function rollDie(N: number) {
  const random = Math.random();
  return Math.ceil(random * N);
}

export function rollDieMTimes(M: number, N: number) {
  let sum = 0;
  for (let i = 0; i < M; i++) {
    sum += rollDie(N);
  }
  return sum;
}

export function toInt(str: string): number {
  return parseInt(str, 10);
}

export function parseRoll(str: string): () => number {
  const rollRE = /(\d+)d(\d+)/;
  const match = rollRE.exec(str);
  if (!match) return () => 0;
  const [_, M, N] = match;
  return () => rollDieMTimes(toInt(M), toInt(N));
}

const audioElementId = 'diceRollAudio';

export function injectSounds() {
  if (document.getElementById(audioElementId)) return;
  const audioElement = document.createElement('audio');
  audioElement.id = audioElementId;
  audioElement.setAttribute('src', '/public/roll.wav');
  document.body.appendChild(audioElement);
}

export function playDiceSound() {
  const audioElement = document.getElementById('diceRollAudio') as HTMLAudioElement;
  if (!audioElement) return;
  audioElement.currentTime = 0;
  audioElement.play();
}

export function rollExpression(expression: string): number {
  const portions = expression.split('+').map((s) => s.trim());

  const result = portions.reduce((sum, r) => {
    if (r.includes('d')) {
      return sum + parseRoll(r)();
    } else if (toInt(r)) {
      return sum + toInt(r);
    } else {
      return sum;
    }
  }, 0);

  return result;
}

// Run simulation,
// 10000 samples,
// parse once,
// cache simulation
// export data for histogram

export const simulate = memoizeWith(
  (e: string, s: number) => `${e}@${s}`,
  (expression: string, sampleCount: number) => {
    const portions = expression.split('+').map((s) => s.trim());

    if (portions.length > 1) {
      let subSimulations = new Array(sampleCount).fill(0);
      portions.forEach((p) => {
        subSimulations = zipWith((x, y) => x + y, subSimulations, simulate(p, sampleCount));
      });
      return subSimulations;
    }

    const rolls: number[] = [];
    for (let i = 0; i < sampleCount; i++) {
      rolls.push(parseRoll(expression)());
    }
    return rolls;
  }
);

const defaultSamples = 50000;
export const runSimulation = memoizeWith(identity, (expression: string) => {
  console.time('roll simulation took:');
  const result = simulate(expression, defaultSamples);
  console.timeEnd('roll simulation took:');
  return toPairs(countBy(Number)(result));
});

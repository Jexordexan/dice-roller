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

export function parseInt(str: string): number {
  return Number(str);
}

export function parseRoll(str: string): number {
  const rollRE = /(\d+)d(\d+)/;
  const match = rollRE.exec(str);
  if (!match) return 0;
  const [_, M, N] = match;
  return rollDieMTimes(parseInt(M), parseInt(N));
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
      return sum + parseRoll(r);
    } else if (parseInt(r)) {
      return sum + parseInt(r);
    } else {
      return sum;
    }
  }, 0);

  return result;
}

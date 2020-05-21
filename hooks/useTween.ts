import { ref, watch, Ref } from 'vue';
import TWEEN from '@tweenjs/tween.js';

export default function useTween(source: Ref<number>, duration: number = 500) {
  const tweened = ref(source.value);
  const animating = ref(false);

  watch(source, (current) => {
    // This is our main logic block. It handles tweening from a start value to an end value.
    let frameHandler: number;

    // Handles updating the tween on each frame.
    const animate = (currentTime: number) => {
      TWEEN.update(currentTime);
      frameHandler = requestAnimationFrame(animate);
    };

    const myTween = new TWEEN.Tween(tweened)
      .to({ value: current }, duration)
      .onUpdate(() => {
        tweened.value = Math.round(tweened.value);
      })
      .onComplete(() => {
        // Make sure to clean up after ourselves.
        cancelAnimationFrame(frameHandler);
        animating.value = false;
      })
      // This actually starts the tween.
      .start();
    animating.value = true;

    frameHandler = requestAnimationFrame(animate);
  });

  return { source, tweened, animating };
}

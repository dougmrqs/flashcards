import { cubicInOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

interface FlyCardParams {
  /** The element the card flies from (intro) or to (outro). */
  at: () => Element | null | undefined;
  /** Start face-down and flip over on the way. */
  flip?: boolean;
  /** Extra rotation (deg) at the far end, so cards land a bit askew. */
  tilt?: number;
  duration?: number;
  delay?: number;
}

/**
 * FLIP-style transition between an anchor element and the node's resting
 * place. Svelte runs `t` 0→1 for intros and 1→0 for outros, so the same
 * function flies a card out of a deck and back onto a pile.
 */
export function flyCard(
  node: Element,
  { at, flip = false, tilt = 0, duration = 560, delay = 0 }: FlyCardParams,
): TransitionConfig {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const anchor = at()?.getBoundingClientRect();
  if (reduceMotion || !anchor) {
    return { duration: 180, delay, css: (t) => `opacity: ${t}` };
  }

  const box = node.getBoundingClientRect();
  const dx = anchor.left + anchor.width / 2 - (box.left + box.width / 2);
  const dy = anchor.top + anchor.height / 2 - (box.top + box.height / 2);
  const scale = Math.min(anchor.width / box.width, anchor.height / box.height);

  return {
    duration,
    delay,
    easing: cubicInOut,
    css: (t, u) => `
      transform:
        translate(${dx * u}px, ${dy * u}px)
        scale(${scale + (1 - scale) * t})
        rotateY(${flip ? -180 * u : 0}deg)
        rotateZ(${tilt * u}deg);
    `,
  };
}

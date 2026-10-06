<script lang="ts">
  import { backOut } from 'svelte/easing';
  import { fade, type TransitionConfig } from 'svelte/transition';
  import type { DrawnCard } from '../game.svelte.ts';
  import { stripInline } from '../markdown.ts';
  import MiniCard from './MiniCard.svelte';

  interface Props {
    open: boolean;
    /** Newest first. */
    cards: DrawnCard[];
    /** The card currently lifted into evidence; its slot stays empty. */
    liftedId: string | null;
    onSelect: (card: DrawnCard) => void;
    onClose: () => void;
  }

  let { open, cards, liftedId, onSelect, onClose }: Props = $props();

  let track: HTMLElement | undefined = $state();

  /** Cards spring up into place one after another. */
  function popUp(_node: Element, { delay = 0 }: { delay?: number }): TransitionConfig {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return { duration: 150, css: (t) => `opacity: ${t}` };
    }
    return {
      delay,
      duration: 420,
      easing: backOut,
      css: (t, u) => `opacity: ${Math.min(1, t * 2)}; transform: translateY(${u * 40}px) scale(${0.5 + 0.5 * t});`,
    };
  }

  function scrollByPage(direction: 1 | -1) {
    track?.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' });
  }
</script>

{#if open}
  <div
    class="backdrop"
    role="presentation"
    onclick={onClose}
    transition:fade|global={{ duration: 220 }}
  ></div>

  <div class="layer" role="dialog" aria-modal="true" aria-label="Discard pile">
    <header transition:fade|global={{ duration: 220 }}>
      <h2>Discard pile <span>{cards.length} {cards.length === 1 ? 'card' : 'cards'}</span></h2>
      <button class="ghost close" onclick={onClose}>Close ✕</button>
    </header>

    <div class="carousel">
      <button class="ghost arrow" onclick={() => scrollByPage(-1)} aria-label="Scroll left">←</button>
      <!-- Clicking the empty track counts as clicking outside. -->
      <ul class="track" bind:this={track} onclick={(e) => e.target === e.currentTarget && onClose()} role="presentation">
        {#each cards as card, i (card.id)}
          <li>
            <button
              class="mini"
              class:lifted={card.id === liftedId}
              data-mini={card.id}
              onclick={() => onSelect(card)}
              aria-label="{card.deckTitle}: {stripInline(card.title)}"
              in:popUp|global={{ delay: Math.min(i, 12) * 45 }}
              out:fade|global={{ duration: 140 }}
            >
              <MiniCard {card} detailed />
            </button>
          </li>
        {/each}
      </ul>
      <button class="ghost arrow" onclick={() => scrollByPage(1)} aria-label="Scroll right">→</button>
    </div>

    <p class="hint" transition:fade|global={{ duration: 220 }}>
      Click a card to bring it into focus. Click outside to put it back.
    </p>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 55;
    background: var(--backdrop);
    backdrop-filter: blur(4px);
    cursor: pointer;
  }

  .layer {
    position: fixed;
    inset: 0;
    z-index: 60;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 18px;
    /* Only the controls catch clicks; the rest falls through to the backdrop. */
    pointer-events: none;
  }

  .layer > *,
  .carousel > * {
    pointer-events: auto;
  }

  .carousel {
    pointer-events: none;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    width: min(100% - 32px, 1100px);
    margin: 0 auto;
    color: #fff;
  }

  h2 {
    margin: 0;
    font-size: 1.3rem;
  }

  h2 span {
    margin-left: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    opacity: 0.75;
  }

  .close {
    color: #fff;
    border-color: rgb(255 255 255 / 0.35);
  }

  .carousel {
    position: relative;
    display: flex;
    align-items: center;
  }

  .track {
    flex: 1;
    display: flex;
    gap: 18px;
    margin: 0;
    padding: 32px 24px;
    list-style: none;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    pointer-events: auto;
  }

  .track::-webkit-scrollbar {
    display: none;
  }

  li {
    flex: 0 0 clamp(130px, 16vw, 180px);
    scroll-snap-align: center;
  }

  /* Centre the row when it fits; auto margins collapse once it overflows. */
  li:first-child {
    margin-left: auto;
  }

  li:last-child {
    margin-right: auto;
  }

  .mini {
    display: block;
    width: 100%;
    padding: 0;
    background: none;
    border: 0;
    border-radius: var(--card-radius);
    transition: transform 160ms ease;
  }

  .mini:hover,
  .mini:focus-visible {
    transform: translateY(-10px) rotate(-1.5deg);
  }

  .mini.lifted {
    visibility: hidden;
  }

  .arrow {
    position: absolute;
    z-index: 1;
    width: 44px;
    height: 44px;
    padding: 0;
    border-radius: 50%;
    background: var(--surface);
    box-shadow: var(--shadow-md);
  }

  .arrow:first-child {
    left: 16px;
  }

  .arrow:last-child {
    right: 16px;
  }

  .hint {
    margin: 0;
    text-align: center;
    color: rgb(255 255 255 / 0.8);
    font-size: 0.9rem;
    padding: 0 16px;
  }

  @media (max-width: 600px) {
    .arrow {
      display: none;
    }
  }
</style>

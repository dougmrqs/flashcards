<script lang="ts">
  import type { DrawnCard } from '../game.svelte.ts';
  import MiniCard from './MiniCard.svelte';

  interface Props {
    /** Newest first. */
    cards: DrawnCard[];
    /** Still visible (as a landing target) but not clickable. */
    busy: boolean;
    onOpen: () => void;
  }

  let { cards, busy, onOpen }: Props = $props();

  const top = $derived(cards.slice(0, 3).reverse());

  // A stable, slightly messy angle per card.
  function tilt(id: string): number {
    let hash = 0;
    for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
    return (Math.abs(hash) % 17) - 8;
  }
</script>

<div class="wrap" class:busy>
  <button
    class="pile"
    data-discard-pile
    onclick={onOpen}
    disabled={cards.length === 0}
    aria-label="Discard pile, {cards.length} cards. Open to review."
  >
    {#if cards.length === 0}
      <span class="empty">Discard pile</span>
    {:else}
      {#each top as card (card.id)}
        <div class="slot" style:--tilt="{tilt(card.id)}deg">
          <MiniCard {card} />
        </div>
      {/each}
      {#key cards.length}
        <span class="count">{cards.length}</span>
      {/key}
    {/if}
  </button>
  {#if cards.length}
    <span class="label">Review pile</span>
  {/if}
</div>

<style>
  .wrap {
    position: fixed;
    right: max(24px, env(safe-area-inset-right));
    bottom: max(16px, env(safe-area-inset-bottom));
    z-index: 45;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .wrap.busy {
    pointer-events: none;
  }

  .pile {
    position: relative;
    width: clamp(64px, 9vw, 92px);
    aspect-ratio: 5 / 7;
    padding: 0;
    background: none;
    border: 0;
  }

  .pile:disabled {
    cursor: default;
  }

  .slot {
    position: absolute;
    inset: 0;
    transform: rotate(var(--tilt));
    transition: transform 160ms ease;
  }

  .pile:not(:disabled):hover .slot:last-of-type {
    transform: rotate(var(--tilt)) translateY(-6px);
  }

  .empty {
    display: grid;
    place-content: center;
    height: 100%;
    padding: 6px;
    border: 2px dashed var(--border);
    border-radius: var(--card-radius);
    background: var(--bg);
    color: var(--text-faint);
    font-size: 0.72rem;
    font-weight: 600;
    line-height: 1.3;
  }

  .count {
    position: absolute;
    top: -10px;
    right: -10px;
    min-width: 26px;
    padding: 3px 7px;
    border-radius: 999px;
    background: var(--accent);
    color: var(--on-accent);
    font-size: 0.78rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    box-shadow: var(--shadow-sm);
    animation: bump 320ms ease;
  }

  @keyframes bump {
    40% {
      transform: scale(1.35);
    }
  }

  .label {
    padding: 2px 8px;
    border-radius: 999px;
    background: var(--bg);
    color: var(--text-muted);
    font-size: 0.72rem;
    font-weight: 600;
  }
</style>

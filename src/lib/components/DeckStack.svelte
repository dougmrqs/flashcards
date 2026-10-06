<script lang="ts">
  import type { Pile } from '../game.svelte.ts';
  import CardBack from './CardBack.svelte';

  interface Props {
    pile: Pile;
    remaining: number;
    onDraw: () => void;
    onReshuffle: () => void;
  }

  let { pile, remaining, onDraw, onReshuffle }: Props = $props();

  // The stack gets visibly thinner as it runs out.
  const layers = $derived(Math.min(4, Math.ceil((remaining / pile.cards.length) * 4)));
</script>

<div class="deck">
  <button
    class="stack"
    data-deck={pile.key}
    onclick={remaining ? onDraw : onReshuffle}
    aria-label={remaining
      ? `Draw a card from ${pile.title} (${remaining} left)`
      : `${pile.title} is empty. Reshuffle it`}
  >
    {#if remaining}
      {#each { length: layers } as _, i}
        <div class="layer" style:--depth={layers - 1 - i}>
          <CardBack icon={pile.icon} hue={pile.hue} />
        </div>
      {/each}
    {:else}
      <span class="empty">↻<br />Reshuffle</span>
    {/if}
  </button>

  <div class="meta">
    <h2>{pile.title}</h2>
    <p>{pile.description}</p>
    <span class="count">{remaining} / {pile.cards.length} left</span>
  </div>
</div>

<style>
  .deck {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .stack {
    display: block;
    position: relative;
    width: 100%;
    aspect-ratio: 5 / 7;
    padding: 0;
    background: none;
    border: 0;
    border-radius: var(--card-radius);
  }

  .layer {
    position: absolute;
    inset: 0;
    /* Lower cards sit down and to the right, so the top card is the "real" one. */
    transform: translate(calc(var(--depth) * 3px), calc(var(--depth) * 3px));
    transition: transform 180ms ease;
  }

  .stack:hover .layer:last-child,
  .stack:focus-visible .layer:last-child {
    transform: translate(-4px, -10px) rotate(-3deg);
  }

  .empty {
    display: grid;
    place-content: center;
    height: 100%;
    border: 2px dashed var(--border);
    border-radius: var(--card-radius);
    color: var(--text-faint);
    font-weight: 600;
    line-height: 1.6;
    transition:
      color 140ms ease,
      border-color 140ms ease;
  }

  .stack:hover .empty {
    color: var(--accent-text);
    border-color: var(--accent);
  }

  .meta h2 {
    margin: 0 0 4px;
    font-size: 1.05rem;
    font-weight: 650;
  }

  .meta p {
    margin: 0 0 6px;
    color: var(--text-muted);
    font-size: 0.86rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .count {
    color: var(--accent-text);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
</style>

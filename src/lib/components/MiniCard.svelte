<script lang="ts">
  import type { DrawnCard } from '../game.svelte.ts';
  import { renderInline } from '../markdown.ts';

  interface Props {
    card: DrawnCard;
    /** Show the deck and title; otherwise just placeholder text lines. */
    detailed?: boolean;
  }

  let { card, detailed = false }: Props = $props();
</script>

<div class="mini" style:--hue={card.hue}>
  <div class="band"><span aria-hidden="true">{card.deckIcon}</span></div>
  {#if detailed}
    <p class="deck">{card.deckTitle}</p>
    <p class="title">{@html renderInline(card.title)}</p>
  {:else}
    <div class="lines" aria-hidden="true"><i></i><i></i><i></i></div>
  {/if}
</div>

<style>
  .mini {
    container-type: inline-size;
    width: 100%;
    aspect-ratio: 5 / 7;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    text-align: left;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--card-radius);
    box-shadow: var(--shadow-sm);
  }

  .band {
    flex: 0 0 26%;
    display: flex;
    align-items: center;
    padding: 0 9cqi;
    font-size: 14cqi;
    background:
      repeating-linear-gradient(45deg, rgb(255 255 255 / 0.08) 0 5px, transparent 5px 10px),
      hsl(var(--hue) 45% 42%);
  }

  .deck {
    margin: 9cqi 9cqi 3cqi;
    color: hsl(var(--hue) 50% var(--hue-text-l));
    font-size: 7cqi;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .title {
    margin: 0 9cqi;
    font-size: 10.5cqi;
    font-weight: 650;
    line-height: 1.25;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .lines {
    display: grid;
    gap: 7cqi;
    padding: 12cqi 10cqi;
  }

  .lines i {
    height: 6cqi;
    border-radius: 99px;
    background: var(--border);
  }

  .lines i:last-child {
    width: 60%;
  }
</style>

<script lang="ts">
  import type { ComponentProps } from 'svelte';
  import { fade } from 'svelte/transition';
  import type { DrawnCard } from '../game.svelte.ts';
  import PlayingCard from './PlayingCard.svelte';

  type CardProps = Omit<ComponentProps<typeof PlayingCard>, 'card' | 'startRevealed'>;

  interface Props extends CardProps {
    card: DrawnCard | null;
    /** Which overlay layer this is; the evidence layer sits above the carousel. */
    layer: 'hand' | 'evidence';
    isRevealed?: (card: DrawnCard) => boolean;
  }

  let { card, layer, isRevealed, ...cardProps }: Props = $props();
</script>

{#if card}
  <!-- Clicking anywhere outside the card dismisses it; Esc does the same. -->
  <div
    class="backdrop {layer}"
    role="presentation"
    onclick={cardProps.onDismiss}
    transition:fade|global={{ duration: 220 }}
  ></div>
{/if}

<div class="stage {layer}">
  {#if card}
    {#key card.id}
      <PlayingCard {card} startRevealed={isRevealed?.(card)} {...cardProps} />
    {/key}
  {/if}
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 40;
    background: var(--backdrop);
    backdrop-filter: blur(3px);
    cursor: pointer;
  }

  .stage {
    position: fixed;
    inset: 0;
    z-index: 50;
    display: grid;
    place-items: center;
    padding: 16px;
    perspective: 1800px;
    /* Clicks pass through to the backdrop except on the card itself. */
    pointer-events: none;
  }

  /* Outgoing and incoming cards share the cell so they don't push each other. */
  .stage > :global(*) {
    grid-area: 1 / 1;
  }

  .backdrop.evidence {
    z-index: 65;
  }

  .stage.evidence {
    z-index: 70;
  }
</style>

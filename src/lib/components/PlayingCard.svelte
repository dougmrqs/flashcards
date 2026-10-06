<script lang="ts">
  import type { DrawnCard } from '../game.svelte.ts';
  import { flyCard } from '../flyCard.ts';
  import CardBack from './CardBack.svelte';
  import Spoiler from './Spoiler.svelte';
  import { renderInline, stripInline } from '../markdown.ts';

  interface Props {
    card: DrawnCard;
    /** Where the card flies in from and out to. */
    from: (card: DrawnCard) => Element | null;
    to: (card: DrawnCard) => Element | null;
    /** Arrive face-down and flip over (drawing from a deck). */
    flipIn?: boolean;
    startRevealed?: boolean;
    dismissLabel: string;
    onDismiss: () => void;
    onNext?: () => void;
    onReveal: (card: DrawnCard) => void;
    onLanded: (card: DrawnCard) => void;
  }

  let props: Props = $props();

  // Snapshot the card: while this instance animates out, the parent's prop
  // already points at the next card (or null).
  // svelte-ignore state_referenced_locally
  const card = props.card;
  // svelte-ignore state_referenced_locally
  let revealed = $state(props.startRevealed ?? false);
  let leaving = $state(false);
  let root: HTMLElement;

  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${stripInline(card.title)} ${card.deckTitle}`)}`;

  $effect(() => root.focus({ preventScroll: true }));

  function reveal() {
    if (revealed) return;
    revealed = true;
    props.onReveal(card);
  }

  function onKeydown(event: KeyboardEvent) {
    if (leaving || event.metaKey || event.ctrlKey || event.altKey) return;
    // Let focused buttons and links handle their own Space.
    const onControl = (event.target as HTMLElement).closest('button, a, input, textarea');
    if ((event.key === ' ' && !onControl) || event.key === 'r') {
      event.preventDefault();
      reveal();
    } else if ((event.key === 'n' || event.key === 'ArrowRight') && props.onNext) {
      props.onNext();
    }
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div
  class="card"
  bind:this={root}
  tabindex="-1"
  role="dialog"
  aria-modal="true"
  aria-label={stripInline(card.title)}
  style:--hue={card.hue}
  in:flyCard|global={{ at: () => props.from(card), flip: props.flipIn }}
  out:flyCard|global={{ at: () => props.to(card), tilt: 7, duration: 480 }}
  onoutrostart={() => (leaving = true)}
  onoutroend={() => props.onLanded(card)}
>
  <div class="face front">
    <p class="eyebrow"><span aria-hidden="true">{card.deckIcon}</span> {card.deckTitle}</p>
    <h2>{@html renderInline(card.title)}</h2>
    <p class="hint">Could you explain this to a teammate? Think it through, then reveal.</p>

    <Spoiler markdown={card.answer} {revealed} onReveal={reveal} />

    <div class="actions">
      <a class="ghost button" href={searchUrl} target="_blank" rel="noopener noreferrer">
        🔍 Search
      </a>
      <button class="ghost" onclick={props.onDismiss}>{props.dismissLabel}</button>
      {#if props.onNext}
        <button class="primary" onclick={props.onNext}>Next →</button>
      {/if}
    </div>
  </div>

  <div class="face back" aria-hidden="true">
    <CardBack icon={card.deckIcon} hue={card.hue} />
  </div>
</div>

<style>
  .card {
    position: relative;
    width: min(100%, 460px);
    transform-style: preserve-3d;
    pointer-events: auto;
    outline: none;
  }

  .face {
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: calc(var(--card-radius) * 1.6);
  }

  .front {
    display: flex;
    flex-direction: column;
    aspect-ratio: 5 / 7;
    max-height: calc(100dvh - 32px);
    overflow-y: auto;
    padding: clamp(22px, 5vw, 32px);
    background: var(--surface);
    border: 1px solid var(--border);
    border-top: 8px solid hsl(var(--hue) 45% 42%);
    box-shadow: var(--shadow-lg);
  }

  /* Long answers scroll the card instead of squashing the spoiler. */
  .front > :global(*) {
    flex-shrink: 0;
  }

  .back {
    position: absolute;
    inset: 0;
    transform: rotateY(180deg);
  }

  .back :global(.back) {
    border-radius: inherit;
  }

  .eyebrow {
    margin: 0 0 10px;
    color: hsl(var(--hue) 50% var(--hue-text-l));
    font-size: 0.78rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }

  h2 {
    margin: 0 0 8px;
    font-size: clamp(1.35rem, 3.4vw, 1.75rem);
    line-height: 1.25;
    letter-spacing: -0.01em;
    text-wrap: balance;
  }

  .hint {
    margin: 0 0 20px;
    color: var(--text-muted);
    font-size: 0.92rem;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: auto;
    padding-top: 22px;
  }

  .actions .primary {
    margin-left: auto;
  }

  @media (max-width: 520px) {
    /* Phones are tall: grow with the answer rather than scroll inside a 5:7 card. */
    .front {
      aspect-ratio: auto;
      min-height: min(70dvh, 560px);
    }
    .actions > * {
      flex: 1 1 auto;
    }
    .actions .primary {
      flex-basis: 100%;
      order: -1;
    }
  }
</style>

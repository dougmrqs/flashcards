<script lang="ts">
  import { game, piles, type DrawnCard } from './lib/game.svelte.ts';
  import DeckStack from './lib/components/DeckStack.svelte';
  import CardStage from './lib/components/CardStage.svelte';
  import DiscardPile from './lib/components/DiscardPile.svelte';
  import DiscardCarousel from './lib/components/DiscardCarousel.svelte';

  let carouselOpen = $state(false);
  /** The discarded card lifted out of the carousel for a closer look. */
  let evidence = $state.raw<DrawnCard | null>(null);
  /** Keeps its carousel slot empty until the card has flown back. */
  let liftedId = $state<string | null>(null);

  const find = (selector: string) => document.querySelector(selector);
  const deckOf = () => find(`[data-deck="${game.current?.pileKey}"]`);
  const discardPile = () => find('[data-discard-pile]');
  const miniOf = (card: DrawnCard) => find(`[data-mini="${CSS.escape(card.id)}"]`);

  function select(card: DrawnCard) {
    liftedId = card.id;
    evidence = card;
  }

  function onKeydown(event: KeyboardEvent) {
    if (event.key !== 'Escape') return;
    if (evidence) evidence = null;
    else if (carouselOpen) carouselOpen = false;
    else game.dismiss();
  }

  // Don't let the table scroll behind an open card or the carousel.
  $effect(() => {
    document.body.style.overflow = game.current || carouselOpen ? 'hidden' : '';
  });
</script>

<svelte:window onkeydown={onKeydown} />

<main class="table">
  <header class="hero">
    <h1><span aria-hidden="true">🃏</span> Dev Flash Cards</h1>
    <p>
      Draw a card from any deck. Read the title, decide whether you could explain it, then reveal
      the answer. Click outside to discard it. Everything you discard goes to one pile, so you can
      come back later to whatever was fuzzy and look it up.
    </p>
  </header>

  <ul class="decks">
    {#each piles as pile (pile.key)}
      <li>
        <DeckStack
          {pile}
          remaining={game.remaining[pile.key].length}
          onDraw={() => game.draw(pile.key)}
          onReshuffle={() => game.reshuffle(pile.key)}
        />
      </li>
    {/each}
  </ul>

  <footer>
    <span>No accounts, no tracking. The table resets when you reload.</span>
    <span class="keys">
      <kbd>Space</kbd> reveal · <kbd>N</kbd> next card · <kbd>Esc</kbd> / click outside to discard
    </span>
  </footer>
</main>

<DiscardPile
  cards={game.discarded}
  busy={!!game.current || carouselOpen}
  onOpen={() => (carouselOpen = true)}
/>

<CardStage
  layer="hand"
  card={game.current?.card ?? null}
  from={deckOf}
  to={discardPile}
  flipIn
  dismissLabel="Discard"
  onDismiss={() => game.dismiss()}
  onNext={() => game.drawNext()}
  onReveal={(card) => game.markRevealed(card)}
  onLanded={(card) => game.land(card)}
/>

<DiscardCarousel
  open={carouselOpen}
  cards={game.discarded}
  {liftedId}
  onSelect={select}
  onClose={() => (carouselOpen = false)}
/>

<CardStage
  layer="evidence"
  card={evidence}
  from={miniOf}
  to={miniOf}
  isRevealed={(card) => game.revealed.has(card.id)}
  dismissLabel="Put back"
  onDismiss={() => (evidence = null)}
  onReveal={(card) => game.markRevealed(card)}
  onLanded={(card) => {
    if (liftedId === card.id) liftedId = null;
  }}
/>

<style>
  .table {
    max-width: 1100px;
    margin: 0 auto;
    /* Bottom room so the fixed discard pile never covers the last row. */
    padding: 32px 16px 150px;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .hero h1 {
    margin: 0 0 10px;
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    letter-spacing: -0.02em;
  }

  .hero p {
    margin: 0;
    max-width: 66ch;
    color: var(--text-muted);
    font-size: 1.05rem;
    line-height: 1.6;
  }

  .decks {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
    gap: 36px 28px;
  }

  @media (max-width: 420px) {
    .decks {
      grid-template-columns: repeat(2, 1fr);
      gap: 28px 18px;
    }
  }

  footer {
    margin-top: auto;
    padding-top: 24px;
    border-top: 1px solid var(--border);
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 8px 24px;
    color: var(--text-faint);
    font-size: 0.85rem;
  }
</style>

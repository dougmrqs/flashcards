// All table state: what's left in each deck, the card in hand and the shared
// discard pile. It lives in memory only, so a refresh starts a fresh table.
import { decks } from './decks.ts';
import { shuffle } from './shuffle.ts';
import type { Card } from './parse.ts';

export interface DrawnCard extends Card {
  /** Unique across decks: `<deck-id>/<index>`. */
  id: string;
  deckTitle: string;
  deckIcon: string;
  hue: number;
}

export interface Pile {
  key: string;
  title: string;
  description: string;
  icon: string;
  hue: number;
  cards: DrawnCard[];
}

const deckPiles: Pile[] = decks.map((deck, i) => {
  // Spread deck colours evenly around the colour wheel.
  const hue = Math.round(230 + (i * 360) / decks.length) % 360;
  return {
    key: deck.id,
    title: deck.title,
    description: deck.description,
    icon: deck.icon,
    hue,
    cards: deck.cards.map((card, j) => ({
      ...card,
      id: `${deck.id}/${j}`,
      deckTitle: deck.title,
      deckIcon: deck.icon,
      hue,
    })),
  };
});

export const piles: Pile[] = [
  ...deckPiles,
  {
    key: 'all',
    title: 'Everything',
    description: 'Every deck shuffled together.',
    icon: '🎲',
    hue: 40,
    cards: deckPiles.flatMap((pile) => pile.cards),
  },
];

const pilesByKey = new Map(piles.map((pile) => [pile.key, pile]));

class Game {
  remaining = $state.raw<Record<string, DrawnCard[]>>(
    Object.fromEntries(piles.map((pile) => [pile.key, shuffle(pile.cards)])),
  );
  current = $state.raw<{ card: DrawnCard; pileKey: string } | null>(null);
  /** Newest first. A card appears at most once. */
  discarded = $state.raw<DrawnCard[]>([]);
  revealed = $state.raw<ReadonlySet<string>>(new Set());

  draw(pileKey: string) {
    const [card, ...rest] = this.remaining[pileKey] ?? [];
    if (!card) return;
    this.remaining = { ...this.remaining, [pileKey]: rest };
    this.current = { card, pileKey };
  }

  /** Discards the card in hand (it lands on the pile via `land`) and draws from the same deck. */
  drawNext() {
    if (!this.current) return;
    const { pileKey } = this.current;
    if (this.remaining[pileKey].length) this.draw(pileKey);
    else this.dismiss();
  }

  dismiss() {
    this.current = null;
  }

  /** Called once the discard animation reaches the pile. */
  land(card: DrawnCard) {
    this.discarded = [card, ...this.discarded.filter((c) => c.id !== card.id)];
  }

  reshuffle(pileKey: string) {
    const pile = pilesByKey.get(pileKey);
    if (pile) this.remaining = { ...this.remaining, [pileKey]: shuffle(pile.cards) };
  }

  markRevealed(card: DrawnCard) {
    if (!this.revealed.has(card.id)) this.revealed = new Set(this.revealed).add(card.id);
  }
}

export const game = new Game();

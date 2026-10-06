import { parseDeck, type Deck } from './parse.ts';

const sources = import.meta.glob('../decks/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const decks: Deck[] = Object.entries(sources)
  .map(([path, source]) => parseDeck(path.split('/').pop()!.replace(/\.md$/, ''), source))
  .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

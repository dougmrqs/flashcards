// Parses a deck Markdown file. Shared by the app and scripts/validate-decks.ts,
// so it must stay free of browser/Vite APIs and non-erasable TS syntax.
//
// Format:
//   ---
//   title: JavaScript
//   description: Runtime quirks and language specifics
//   icon: ⚡
//   ---
//   ## Card title
//   Answer in Markdown…

export interface Card {
  title: string;
  answer: string;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  cards: Card[];
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function parseDeck(id: string, source: string): Deck {
  const match = source.match(FRONTMATTER);
  if (!match) throw new Error(`Deck "${id}" is missing frontmatter`);

  const meta: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    meta[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
  }

  const body = source.slice(match[0].length);
  const cards: Card[] = [];
  // Split on level-2 headings only; "###" and fenced code stay inside answers.
  for (const chunk of body.split(/^## /m).slice(1)) {
    const newline = chunk.indexOf('\n');
    const title = (newline === -1 ? chunk : chunk.slice(0, newline)).trim();
    const answer = newline === -1 ? '' : chunk.slice(newline + 1).trim();
    cards.push({ title, answer });
  }

  return {
    id,
    title: meta.title ?? id,
    description: meta.description ?? '',
    icon: meta.icon ?? '🃏',
    order: Number(meta.order ?? 999),
    cards,
  };
}

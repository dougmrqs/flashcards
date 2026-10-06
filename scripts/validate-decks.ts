// Validates every deck in src/decks. Run with `npm run validate` (Node >= 22.18
// strips TypeScript types natively). Exits non-zero on any problem.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseDeck } from '../src/lib/parse.ts';

const MAX_ANSWER_LENGTH = 700;
const DECKS_DIR = join(import.meta.dirname, '..', 'src', 'decks');

const errors: string[] = [];
let total = 0;

for (const file of readdirSync(DECKS_DIR).filter((f) => f.endsWith('.md')).sort()) {
  const id = file.replace(/\.md$/, '');
  let deck;
  try {
    deck = parseDeck(id, readFileSync(join(DECKS_DIR, file), 'utf8'));
  } catch (error) {
    errors.push(`${file}: ${(error as Error).message}`);
    continue;
  }

  for (const field of ['title', 'description', 'icon'] as const) {
    if (!deck[field]) errors.push(`${file}: missing frontmatter "${field}"`);
  }
  if (deck.cards.length === 0) errors.push(`${file}: deck has no cards`);

  const seen = new Set<string>();
  for (const card of deck.cards) {
    const key = card.title.toLowerCase();
    if (!card.title) errors.push(`${file}: card with empty title`);
    if (seen.has(key)) errors.push(`${file}: duplicate card "${card.title}"`);
    seen.add(key);
    if (!card.answer) errors.push(`${file}: "${card.title}" has no answer`);
    if (card.answer.length > MAX_ANSWER_LENGTH) {
      errors.push(
        `${file}: "${card.title}" answer is ${card.answer.length} chars (max ${MAX_ANSWER_LENGTH})`,
      );
    }
  }

  total += deck.cards.length;
  console.log(`  ${deck.icon}  ${deck.title.padEnd(22)} ${deck.cards.length} cards`);
}

if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n${errors.map((e) => `  - ${e}`).join('\n')}`);
  process.exit(1);
}
console.log(`\n✓ ${total} cards OK`);

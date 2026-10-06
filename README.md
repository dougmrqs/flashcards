# 🃏 Dev Flash Cards

Flash cards that help developers find the gaps in what they know. Click a deck to draw a card; it flips over in the middle of the screen. Decide whether you could explain the title, then reveal the answer. Click outside to discard it. Every deck shares one discard pile, and clicking the pile lays those cards out in a carousel so you can go back to the fuzzy ones and look them up.

It's a static Svelte 5 + Vite app hosted on GitHub Pages. There's no backend and nothing is stored.

## Develop

```sh
npm install
npm run dev        # http://localhost:5173/flashcards/
npm run validate   # lint all decks
npm run check      # svelte-check / TypeScript
npm run build      # validate + build to dist/
```

Requires Node ≥ 22.18. The validator runs TypeScript natively; `.tool-versions` pins the version.

## Adding cards

Each deck is a Markdown file in `src/decks/`. A new file becomes a new deck automatically.

```markdown
---
title: JavaScript
description: Runtime quirks and language specifics
icon: ⚡
order: 1
---

## What is the event loop?
One short paragraph. Markdown works: `code`, **bold**, lists, small code blocks.
```

- Each `## heading` is a card and the text below it is the answer.
- Keep answers to one short paragraph. The validator fails above 700 characters.
- Titles must be unique within a deck.

## Deploy

1. Push to GitHub.
2. In **Settings → Pages**, set **Source: GitHub Actions**.
3. Each push to `main` builds and deploys. The base path comes from the repo name automatically.

## Keyboard

<kbd>Space</kbd> / <kbd>R</kbd> reveal · <kbd>N</kbd> / <kbd>→</kbd> next card from the same deck · <kbd>Esc</kbd> discard (or close the top layer)

import { marked } from 'marked';

// Deck content is authored in this repo, so rendering it as HTML is safe.

export function renderMarkdown(source: string): string {
  return marked.parse(source, { async: false });
}

/** For titles: `code` and **bold**, no wrapping <p>. */
export function renderInline(source: string): string {
  return marked.parseInline(source, { async: false });
}

/** Plain text for search queries and labels. */
export function stripInline(source: string): string {
  return source.replace(/[`*_]/g, '');
}

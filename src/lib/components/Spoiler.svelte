<script lang="ts">
  import { renderMarkdown } from '../markdown.ts';

  interface Props {
    markdown: string;
    revealed: boolean;
    onReveal: () => void;
  }

  let { markdown, revealed, onReveal }: Props = $props();

  const html = $derived(renderMarkdown(markdown));
</script>

<div class="spoiler" class:revealed>
  <div class="answer" aria-hidden={!revealed} inert={!revealed}>
    {@html html}
  </div>
  {#if !revealed}
    <button class="cover" onclick={onReveal} aria-label="Reveal response">
      <span class="label"><span aria-hidden="true">👁</span> Reveal response</span>
    </button>
  {/if}
</div>

<style>
  .spoiler {
    position: relative;
    border-radius: var(--radius);
    background: var(--surface-2);
    border: 1px solid var(--border);
    overflow: hidden;
  }

  .answer {
    padding: 20px 22px;
    line-height: 1.65;
    filter: blur(7px);
    opacity: 0.55;
    user-select: none;
    transition:
      filter 260ms ease,
      opacity 260ms ease;
  }

  .revealed .answer {
    filter: none;
    opacity: 1;
    user-select: text;
  }

  .answer :global(p) {
    margin: 0 0 0.8em;
  }

  .answer :global(:last-child) {
    margin-bottom: 0;
  }

  .answer :global(code) {
    font-family: var(--font-mono);
    font-size: 0.88em;
    padding: 0.1em 0.35em;
    border-radius: 5px;
    background: var(--code-bg);
  }

  .answer :global(pre) {
    margin: 0 0 0.8em;
    padding: 12px 14px;
    overflow-x: auto;
    border-radius: 8px;
    background: var(--code-bg);
  }

  .answer :global(pre code) {
    padding: 0;
    background: none;
  }

  .answer :global(ul),
  .answer :global(ol) {
    margin: 0 0 0.8em;
    padding-left: 1.3em;
  }

  .cover {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    width: 100%;
    background: repeating-linear-gradient(
      -45deg,
      transparent 0 10px,
      var(--stripe) 10px 20px
    );
    border: 0;
    border-radius: 0;
  }

  .label {
    padding: 10px 18px;
    border-radius: 999px;
    background: var(--surface);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
    font-weight: 600;
    transition:
      transform 140ms ease,
      border-color 140ms ease;
  }

  .cover:hover .label,
  .cover:focus-visible .label {
    transform: scale(1.04);
    border-color: var(--accent);
  }
</style>

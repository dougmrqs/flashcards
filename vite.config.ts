import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// GitHub Pages serves the site from /<repo-name>/.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/flashcards/',
  plugins: [svelte()],
});

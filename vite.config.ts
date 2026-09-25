import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 1200 },
  preview: { allowedHosts: ['.trycloudflare.com'] },
});

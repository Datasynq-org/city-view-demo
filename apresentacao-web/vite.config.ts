import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

// @ds: o design system compartilhado (../design-system/src), usado também pela vitrine (../design-system-vitrine).
// dedupe: os componentes do design system usam o React deste app (o pacote não tem node_modules).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@ds': fileURLToPath(new URL('../design-system/src', import.meta.url)) },
    dedupe: ['react', 'react-dom'],
  },
  server: { port: 5190, fs: { allow: ['..'] } },
});

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Caminhos relativos: o build abre de qualquer pasta de um servidor estático.
  base: './',
  plugins: [react(), tailwindcss()],
  server: { port: 5200 },
  // O worker do MapLibre 6 é um módulo ES.
  worker: { format: 'es' },
  test: { include: ['src/**/*.test.ts'], environment: 'node' },
});

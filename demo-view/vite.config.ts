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
  // Alguns testes geram a cidade inteira (180 dias); numa máquina ocupada passam dos 5 s padrão.
  test: { include: ['src/**/*.test.ts'], environment: 'node', testTimeout: 30_000 },
});

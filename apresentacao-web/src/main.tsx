import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import 'lenis/dist/lenis.css';
import './estilos.css';
import { App } from './App';
import { aplicarTema, temaInicial } from '@ds';

aplicarTema(temaInicial());

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

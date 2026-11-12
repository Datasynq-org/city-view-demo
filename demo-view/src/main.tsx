import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Barlow acompanha o build: no Windows aparece a Bahnschrift, nos demais a Barlow, sem rede.
import '@fontsource/barlow/latin-400.css';
import '@fontsource/barlow/latin-500.css';
import '@fontsource/barlow/latin-600.css';
import '@fontsource/barlow-condensed/latin-600.css';
import './estilos.css';
import { App } from './App';

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

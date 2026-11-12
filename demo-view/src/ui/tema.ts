/**
 * Tema da interface: escuro (o padrão, de sala de comando) ou claro (para sala
 * iluminada, projetor e impressão). O tema vale para os painéis e para os mapas
 * de dados; a imagem de satélite da sala continua escura nos dois, porque o
 * calor e os contornos foram ajustados para ela.
 *
 * A escolha fica no navegador. `?tema=claro` no endereço abre já no claro.
 */
import { useSyncExternalStore } from 'react';

export type Tema = 'escuro' | 'claro';

const CHAVE = 'cityview-tema';
const ouvintes = new Set<() => void>();

function inicial(): Tema {
  if (typeof window === 'undefined') return 'escuro';
  const doEndereco = new URLSearchParams(window.location.search).get('tema');
  if (doEndereco === 'claro' || doEndereco === 'escuro') return doEndereco;
  try {
    return window.localStorage.getItem(CHAVE) === 'claro' ? 'claro' : 'escuro';
  } catch {
    return 'escuro';
  }
}

let atual: Tema = inicial();
if (typeof document !== 'undefined') document.documentElement.dataset.tema = atual;

export const temaAtual = (): Tema => atual;
export const ehClaro = () => atual === 'claro';

export function mudarTema(tema: Tema) {
  if (tema === atual) return;
  atual = tema;
  document.documentElement.dataset.tema = tema;
  try {
    window.localStorage.setItem(CHAVE, tema);
  } catch {
    // Sem armazenamento (navegação privada): o tema vale só nesta visita.
  }
  for (const avisar of ouvintes) avisar();
}

const assinar = (avisar: () => void) => {
  ouvintes.add(avisar);
  return () => ouvintes.delete(avisar);
};

/** O tema em uso; o componente redesenha quando ele muda. */
export const useTema = (): Tema => useSyncExternalStore(assinar, temaAtual, () => 'escuro' as Tema);

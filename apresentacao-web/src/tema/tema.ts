// Tema claro/escuro. Ordem: ?tema=claro|escuro → escolha salva → tema do sistema.
export type Tema = 'claro' | 'escuro';
const CHAVE = 'cityview-tema';

function salvo(): Tema | null {
  try {
    const v = localStorage.getItem(CHAVE);
    return v === 'claro' || v === 'escuro' ? v : null;
  } catch {
    return null;
  }
}

export function temaInicial(): Tema {
  const p = new URLSearchParams(location.search).get('tema');
  if (p === 'claro' || p === 'escuro') return p;
  return salvo() ?? (matchMedia('(prefers-color-scheme: light)').matches ? 'claro' : 'escuro');
}

export function aplicarTema(t: Tema, guardar = false) {
  document.documentElement.dataset.tema = t;
  if (guardar) {
    try { localStorage.setItem(CHAVE, t); } catch { /* sem armazenamento: vale só nesta visita */ }
  }
}

export const temaAtual = (): Tema => (document.documentElement.dataset.tema === 'claro' ? 'claro' : 'escuro');

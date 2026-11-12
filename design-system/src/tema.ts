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

const EVENTO = 'cityview:tema';

export function aplicarTema(t: Tema, guardar = false) {
  document.documentElement.dataset.tema = t;
  if (guardar) {
    try { localStorage.setItem(CHAVE, t); } catch { /* sem armazenamento: vale só nesta visita */ }
  }
  window.dispatchEvent(new CustomEvent<Tema>(EVENTO, { detail: t }));
}

export const temaAtual = (): Tema => (document.documentElement.dataset.tema === 'claro' ? 'claro' : 'escuro');

// Avisa quando o tema muda (para canvas/WebGL relerem a paleta). Devolve a função que cancela.
export function aoMudarTema(fn: (t: Tema) => void) {
  const ouvinte = (e: Event) => fn((e as CustomEvent<Tema>).detail);
  window.addEventListener(EVENTO, ouvinte);
  return () => window.removeEventListener(EVENTO, ouvinte);
}

// Lê os tokens de cor do tema ativo para quem não usa CSS: canvas 2D, WebGL (MapLibre, deck.gl), SVG gerado.
// Releia sempre que o tema mudar (ver `aoMudarTema` em tema.ts).

export type Paleta = {
  fundo: string;
  tinta: string;
  tinta2: string;
  acento: string;
  ok: string;
  atencao: string;
  alerta: string;
  painelBorda: string;
  areas: string[]; // --area-0..6
  status: string[]; // --status-0..2: resolvido, em resolução, aberto
  traco: string; // --mapa-traco
  conexao: string;
  anel: string;
  calorModo: GlobalCompositeOperation;
  claro: boolean;
};

export const NUM_AREAS = 7;

export function lerPaleta(el: Element = document.documentElement): Paleta {
  const cs = getComputedStyle(el);
  const v = (n: string) => cs.getPropertyValue(n).trim();
  return {
    fundo: v('--fundo'),
    tinta: v('--tinta'),
    tinta2: v('--tinta-2'),
    acento: v('--acento'),
    ok: v('--ok'),
    atencao: v('--atencao'),
    alerta: v('--alerta'),
    painelBorda: v('--painel-borda'),
    areas: Array.from({ length: NUM_AREAS }, (_, i) => v(`--area-${i}`)),
    status: [0, 1, 2].map((i) => v(`--status-${i}`)),
    traco: v('--mapa-traco'),
    conexao: v('--conexao'),
    anel: v('--anel'),
    calorModo: (v('--calor-modo') || 'lighter') as GlobalCompositeOperation,
    claro: (el as HTMLElement).closest?.('[data-tema]')?.getAttribute('data-tema') === 'claro',
  };
}

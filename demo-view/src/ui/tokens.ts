/**
 * Cores da direção C (navy, teal, âmbar), para o que não lê variáveis CSS: o
 * estilo do mapa e as camadas deck.gl. Espelham o `@theme` de `src/estilos.css`;
 * mudou lá, mude aqui. Origem: `apresentacao/src/tema.js` do repositório city-view-demo.
 */
export const CORES = {
  navy: '#0B1E31',
  navy2: '#12293F',
  linha: '#1E3852',
  teal: '#0196B2',
  tealClaro: '#38C3DB',
  ambar: '#F2A93B',
  /** Concentração alta no mapa de calor (I1). */
  alerta: '#E5484D',
  texto: '#C9D6E2',
  rotulo: '#B7C6D4',
} as const;

export type RGB = [number, number, number];
export const rgb = (hex: string): RGB => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as RGB;

/**
 * Escala de concentração (pouco → muito) do mapa de calor e dos hexágonos:
 * teal escuro → teal → teal claro → âmbar → vermelho. Sempre com legenda.
 */
export const ESCALA_CONCENTRACAO: RGB[] = [rgb('#0E4A5C'), rgb(CORES.teal), rgb(CORES.tealClaro), rgb('#C9C27A'), rgb(CORES.ambar), rgb(CORES.alerta)];

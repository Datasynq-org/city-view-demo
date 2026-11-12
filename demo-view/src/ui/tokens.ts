/**
 * Cores da interface, para o que não lê variáveis CSS: o estilo do mapa e as
 * camadas deck.gl. Espelham o `@theme` de `src/estilos.css`; mudou lá, mude aqui.
 *
 * Base neutra (grafite), com a cor reservada a uma função: o teal da marca para
 * o que está ativo ou ao vivo, o âmbar para o aviso de demonstração e a rampa
 * quente para a concentração de chamados.
 */
export const CORES = {
  base: '#0C0E10',
  painel: '#14171A',
  linha: '#2A2F35',
  acento: '#0196B2',
  acentoClaro: '#4CC3D6',
  aviso: '#E9A23B',
  alerta: '#E5484D',
  texto: '#D5D9DD',
  texto2: '#A4ABB3',
} as const;

export type RGB = [number, number, number];
export const rgb = (hex: string): RGB => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as RGB;

/**
 * Escala de concentração (pouco → muito) do mapa de calor, dos hexágonos e das
 * regiões: um só matiz quente, com a luminosidade e a saturação sempre subindo.
 * O pouco é um marrom quase neutro, que recua sobre o mapa; o muito é um amarelo
 * claro, que salta. Sempre com legenda.
 */
export const ESCALA_CONCENTRACAO: RGB[] = ['#3A2C25', '#6E3519', '#A6481A', '#DA6B24', '#F3A13C', '#FBDC97'].map(rgb);

/**
 * A mesma família no mapa de calor, com o começo mais claro: lá a cor é
 * translúcida sobre a imagem de satélite, e um marrom escuro sumiria nela.
 * [cor, opacidade] de cada uma das seis faixas, do pouco ao muito.
 */
export const ESCALA_DO_CALOR: readonly (readonly [string, number])[] = [
  ['#7A5546', 0.36],
  ['#8E4E33', 0.48],
  ['#A9501F', 0.6],
  ['#D2661F', 0.74],
  ['#F29A38', 0.86],
  ['#FCE0A0', 0.95],
];

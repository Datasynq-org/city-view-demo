/**
 * Onde as camadas deck.gl entram na pilha do MapLibre: por baixo dos nomes das
 * RAs (`mapa/estilo.ts`). `beforeId` vale no modo intercalado do
 * @deck.gl/maplibre, mas não está nos tipos das camadas; por isso entra por
 * espalhamento, sem a checagem de propriedades.
 */
export const NA_PILHA = { beforeId: 'ras-rotulos' } as Record<string, unknown>;

/** Para pontos que precisam aparecer mesmo atrás de uma coluna em 3D. */
export const SEMPRE_POR_CIMA = { parameters: { depthCompare: 'always', depthWriteEnabled: false } } as Record<string, unknown>;

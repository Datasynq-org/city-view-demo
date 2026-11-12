/**
 * Números pseudoaleatórios com semente: a mesma semente dá sempre a mesma cidade.
 * `mulberry32` e `poisson` vêm de `City-view/apps/sala-de-situacao/src/data/simulacao.ts`.
 */

export type Rand = () => number;

export function mulberry32(semente: number): Rand {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash FNV-1a de 32 bits. */
function hash(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Uma sequência própria para cada chave. Assim, acrescentar um órgão ou um foco
 * não desloca os sorteios do resto da cidade.
 */
export const randDe = (semente: number, chave: string): Rand => mulberry32((semente ^ hash(chave)) >>> 0);

export function normal(rand: Rand): number {
  const u = Math.max(rand(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

export const exponencial = (media: number, rand: Rand) => -media * Math.log(1 - rand());

export function poisson(lambda: number, rand: Rand): number {
  if (lambda <= 0) return 0;
  // Acima de 40, aproximação normal.
  if (lambda > 40) return Math.max(0, Math.round(lambda + Math.sqrt(lambda) * normal(rand)));
  const limite = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rand();
  } while (p > limite);
  return k - 1;
}

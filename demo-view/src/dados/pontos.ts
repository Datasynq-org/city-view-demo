/**
 * Onde cada incidente SIMULADO cai dentro da RA. Endereços fictícios: servem para
 * mostrar o padrão, não lugares.
 *
 * O ponto é sorteado dentro da mancha urbana do DF (`mancha.json`, gerada por
 * `scripts/gerar-mancha.mjs`): só onde a ocupação urbana oficial de 2023 diz que
 * há cidade, com mais peso perto de escolas, unidades de saúde e comunidades.
 * Assim o mapa de calor acompanha os bairros, e não cai sobre cerrado e lavoura.
 *
 * Antes (método de `City-view/.../data/pontos.ts`) era uma nuvem em volta de um
 * ponto só por RA; isso ficou como reserva, para uma RA sem mancha.
 */
import { dentroDaRegiao, GRAUS_POR_UNIDADE, type Regiao } from '../dominio/ras';
import { normal, type Rand } from './aleatorio';
import mancha from './mancha.json';

const TENTATIVAS = 12;
const arredondar = (n: number) => Math.round(n * 1e5) / 1e5;

const [OESTE, SUL] = mancha.origem as [number, number];
/** Lado da célula da mancha, em graus de longitude e de latitude (~200 m). */
export const PASSO_DA_MANCHA = mancha.passo as [number, number];
const [DX, DY] = PASSO_DA_MANCHA;

interface Celulas {
  colunas: Uint16Array;
  linhas: Uint16Array;
  /** Soma dos pesos até cada célula, para sortear pelo peso. */
  acumulado: Float64Array;
}

const CELULAS = new Map<string, Celulas | null>();

function celulasDe(raId: string): Celulas | null {
  let c = CELULAS.get(raId);
  if (c !== undefined) return c;
  const plano = (mancha.ras as Record<string, number[]>)[raId];
  if (!plano?.length) c = null;
  else {
    const n = plano.length / 3;
    c = { colunas: new Uint16Array(n), linhas: new Uint16Array(n), acumulado: new Float64Array(n) };
    let soma = 0;
    for (let k = 0; k < n; k++) {
      c.colunas[k] = plano[k * 3]!;
      c.linhas[k] = plano[k * 3 + 1]!;
      soma += plano[k * 3 + 2]!;
      c.acumulado[k] = soma;
    }
  }
  CELULAS.set(raId, c);
  return c;
}

/** A primeira posição cujo acumulado passa de `alvo` (busca binária). */
function posicao(acumulado: Float64Array, alvo: number): number {
  let a = 0;
  let b = acumulado.length - 1;
  while (a < b) {
    const m = (a + b) >> 1;
    if (acumulado[m]! > alvo) b = m;
    else a = m + 1;
  }
  return a;
}

/** Quantas células de mancha a RA tem. */
export const celulasDaMancha = (raId: string) => celulasDe(raId)?.colunas.length ?? 0;

/** O ponto cai numa célula da mancha urbana da RA? */
export function naMancha(raId: string, lon: number, lat: number): boolean {
  const c = celulasDe(raId);
  if (!c) return false;
  const i = Math.floor((lon - OESTE) / DX);
  const j = Math.floor((lat - SUL) / DY);
  for (let k = 0; k < c.colunas.length; k++) if (c.colunas[k] === i && c.linhas[k] === j) return true;
  return false;
}

/** Reserva: perto do núcleo urbano da RA (o ponto do rótulo), com até 1,2 km de espalhamento. */
function pertoDoNucleo(ra: Regiao, rand: Rand): [number, number] {
  const [gx, gy] = GRAUS_POR_UNIDADE;
  const [cx, cy] = ra.rotulo;
  const raio = Math.min(12, Math.max(4, Math.sqrt(ra.areaKm2) * 0.8));
  for (let t = 0; t < TENTATIVAS; t++) {
    // O espalhamento encolhe a cada tentativa: numa RA estreita, o ponto acaba cabendo.
    const s = raio / (1 + t * 0.5);
    const lon = arredondar(cx + normal(rand) * s * gx);
    const lat = arredondar(cy + normal(rand) * s * gy);
    if (dentroDaRegiao(ra, lon, lat)) return [lon, lat];
  }
  return [cx, cy];
}

/**
 * Sorteia um ponto na mancha urbana da RA: primeiro a célula, pelo peso, depois
 * um lugar qualquer dentro dela. Uma célula na divisa pode cair fora da RA; aí
 * sorteia de novo.
 */
export function sortearPonto(ra: Regiao, rand: Rand): [number, number] {
  const c = celulasDe(ra.id);
  if (c) {
    const total = c.acumulado[c.acumulado.length - 1]!;
    for (let t = 0; t < TENTATIVAS; t++) {
      const k = posicao(c.acumulado, rand() * total);
      // Arredonda antes de testar: o arredondamento não pode tirar o ponto da RA.
      const lon = arredondar(OESTE + (c.colunas[k]! + rand()) * DX);
      const lat = arredondar(SUL + (c.linhas[k]! + rand()) * DY);
      if (dentroDaRegiao(ra, lon, lat)) return [lon, lat];
    }
  }
  return pertoDoNucleo(ra, rand);
}

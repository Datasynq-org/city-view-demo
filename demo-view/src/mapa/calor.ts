/**
 * O mapa de calor dos chamados SIMULADOS, desenhado pela camada de calor nativa
 * do MapLibre ("onde as coisas estão pegando, onde as coisas estão mais
 * tranquilas", ATA 221–222).
 *
 * Três decisões fazem dele uma medida, e não um efeito:
 *
 * 1. **O raio é do chão, não da tela.** Cada chamado espalha a sua influência por
 *    uma distância em metros (`RAIO_NO_CHAO`). Ao aproximar, a mancha fica
 *    presa às mesmas ruas; ela só ganha detalhe aos poucos, porque o raio
 *    encolhe devagar com o zoom.
 * 2. **A cor é relativa ao maior foco da seleção, não ao que está na tela.**
 *    A intensidade é calibrada pelo pico de chamados do período, da área e da RA
 *    escolhidos (`intensidadePorZoom`). Arrastar o mapa não muda cor nenhuma.
 * 3. **Faixas, não degradê.** A concentração é lida em seis faixas com borda
 *    nítida (`corDoCalor`), como curvas de nível. As faixas dobram de uma para a
 *    outra: a cidade tem muita área com poucos chamados e poucos focos com muitos,
 *    e faixas iguais deixariam quase tudo na primeira.
 *
 * O MapLibre desenha a partir de células de ~120 m (`agregar`), e não de cada
 * chamado: é mais leve e nenhum chamado aparece sozinho no mapa. Quando chega um
 * chamado novo, só a célula dele muda (`diferenca`).
 *
 * Antes, a camada era a `HeatmapLayer` do deck.gl, que refazia a agregação
 * inteira na GPU a cada chegada e a cada mudança de zoom: travava ~300 ms.
 */
import type { Feature, FeatureCollection, Point } from 'geojson';
import type { GeoJSONSourceDiff } from 'maplibre-gl';
import type { Incidente } from '../dominio/incidente';
import { GRAUS_POR_UNIDADE, LIMITES_DF } from '../dominio/ras';
import { ESCALA_DO_CALOR, rgb } from '../ui/tokens';

export const FONTE_CALOR = 'calor';
export const CAMADA_CALOR = 'calor';

// ---------------------------------------------------------------- escala no chão

/**
 * [zoom, raio do núcleo em metros no chão]. Na vista do DF inteiro o raio é
 * largo o bastante para o foco se ler de longe; ao aproximar, ele encolhe até a
 * escala do bairro (~500 m) e para aí: com poucos chamados por quadra, um raio
 * menor só mostraria ruído. No nível da rua o calor some (`OPACIDADE_POR_ZOOM`)
 * e fica a imagem; os dois últimos raios só existem para o apagar ser suave.
 */
export const RAIO_NO_CHAO: readonly (readonly [number, number])[] = [
  [7, 3200],
  [8, 2400],
  [9, 1600],
  [10, 1150],
  [11, 820],
  [12, 640],
  [13, 540],
  [14, 500],
  [15, 480],
  [16, 400],
  [17, 220],
];

/**
 * [zoom, opacidade da camada]. Inteiro na vista do DF e das RAs; de perto vira
 * um tom sobre a imagem, e no nível da rua sai de cena.
 */
export const OPACIDADE_POR_ZOOM: readonly (readonly [number, number])[] = [
  [11, 0.92],
  [13, 0.72],
  [14, 0.58],
  [15, 0.42],
  [16, 0.26],
  [17, 0],
];

/** A expressão de `heatmap-opacity`. */
export const opacidadePorZoom = (): unknown[] => ['interpolate', ['linear'], ['zoom'], ...OPACIDADE_POR_ZOOM.flat()];

/** Latitude de referência (o meio do DF) para converter metros em pixels. */
const LATITUDE = (LIMITES_DF[0][1] + LIMITES_DF[1][1]) / 2;
const CIRCUNFERENCIA_M = 40_075_016.686;

/** Metros por pixel no zoom `z`, na latitude do DF (blocos de 512 px, como o MapLibre). */
export const metrosPorPixel = (z: number) => (CIRCUNFERENCIA_M * Math.cos((LATITUDE * Math.PI) / 180)) / (512 * 2 ** z);

/** O raio do núcleo em pixels, zoom a zoom: a expressão de `heatmap-radius`. */
export function raioPorZoom(): unknown[] {
  // Exponencial de base 2 entre as paradas: entre dois zooms, o raio em pixels dobra junto com o mapa.
  return ['interpolate', ['exponential', 2], ['zoom'], ...RAIO_NO_CHAO.flatMap(([z, m]) => [z, +(m / metrosPorPixel(z)).toFixed(2)])];
}

// ---------------------------------------------------------------- cor

/**
 * Onde começa cada uma das seis faixas, de 0 (nada) a 1 (o maior foco da
 * seleção). Cada faixa começa perto do dobro da anterior.
 */
export const FAIXAS = [0.025, 0.06, 0.13, 0.27, 0.5, 0.8] as const;
/** Meia largura da transição entre faixas, em proporção do começo dela: borda nítida, sem serrilhado. */
const BORDA = 0.06;

const rgba = (k: number, opaco = true) => `rgba(${rgb(ESCALA_DO_CALOR[k]![0]).join(',')},${opaco ? ESCALA_DO_CALOR[k]![1] : 0})`;

/** A cor de cada faixa, como aparece no mapa (para a legenda). */
export const CORES_DAS_FAIXAS = FAIXAS.map((_, k) => rgba(k));

/** A expressão de `heatmap-color`: transparente abaixo da primeira faixa, depois seis degraus. */
export function corDoCalor(): unknown[] {
  const paradas: (number | string)[] = [0, rgba(0, false), FAIXAS[0] * (1 - BORDA), rgba(0, false)];
  FAIXAS.forEach((inicio, k) => {
    paradas.push(inicio * (1 + BORDA), rgba(k));
    const fim = FAIXAS[k + 1];
    if (fim !== undefined) paradas.push(fim * (1 - BORDA), rgba(k));
  });
  paradas.push(1, rgba(FAIXAS.length - 1));
  return ['interpolate', ['linear'], ['heatmap-density'], ...paradas];
}

// ---------------------------------------------------------------- agregação em grade

/** Lado da célula de agregação, em unidades de ~100 m: 120 m. */
const LADO = 1.2;
const [[OESTE, SUL], [LESTE, NORTE]] = LIMITES_DF;
const DX = GRAUS_POR_UNIDADE[0] * LADO;
const DY = GRAUS_POR_UNIDADE[1] * LADO;
export const COLUNAS = Math.ceil((LESTE - OESTE) / DX);
export const LINHAS = Math.ceil((NORTE - SUL) / DY);
/** Lado da célula em metros. */
export const LADO_M = LADO * 100;

export interface Grade {
  /** Chamados em cada célula (linha × COLUNAS + coluna). */
  conta: Uint32Array;
  /** Soma das longitudes e das latitudes, para o ponto médio dos chamados da célula. */
  somaLon: Float64Array;
  somaLat: Float64Array;
  total: number;
}

export const novaGrade = (): Grade => ({
  conta: new Uint32Array(COLUNAS * LINHAS),
  somaLon: new Float64Array(COLUNAS * LINHAS),
  somaLat: new Float64Array(COLUNAS * LINHAS),
  total: 0,
});

/** Conta os chamados por célula. Reaproveita `destino`, se vier, para não alocar a cada chegada. */
export function agregar(incidentes: readonly Incidente[], destino: Grade = novaGrade()): Grade {
  destino.conta.fill(0);
  destino.somaLon.fill(0);
  destino.somaLat.fill(0);
  let total = 0;
  for (const inc of incidentes) {
    const { lon, lat } = inc.local;
    const i = Math.floor((lon - OESTE) / DX);
    const j = Math.floor((lat - SUL) / DY);
    if (i < 0 || j < 0 || i >= COLUNAS || j >= LINHAS) continue;
    const k = j * COLUNAS + i;
    destino.conta[k]!++;
    destino.somaLon[k]! += lon;
    destino.somaLat[k]! += lat;
    total++;
  }
  destino.total = total;
  return destino;
}

const arredondar = (n: number) => Math.round(n * 1e5) / 1e5;

function celula(g: Grade, k: number): Feature<Point, { n: number }> {
  const n = g.conta[k]!;
  // O ponto médio dos chamados da célula, e não o centro dela: sem padrão de grade no mapa.
  return { type: 'Feature', id: k, geometry: { type: 'Point', coordinates: [arredondar(g.somaLon[k]! / n), arredondar(g.somaLat[k]! / n)] }, properties: { n } };
}

/** As células com chamados, como o MapLibre recebe. */
export function paraGeoJSON(g: Grade): FeatureCollection<Point, { n: number }> {
  const features: Feature<Point, { n: number }>[] = [];
  for (let k = 0; k < g.conta.length; k++) if (g.conta[k]! > 0) features.push(celula(g, k));
  return { type: 'FeatureCollection', features };
}

/** Acima disto, é mais barato mandar tudo de novo do que a diferença. */
const DIFERENCA_MAXIMA = 400;

/**
 * O que mudou entre duas agregações (uma chegada muda uma célula). `null` quando
 * mudou coisa demais, como numa troca de filtro: aí vale mandar tudo de novo.
 */
export function diferenca(antes: Grade, depois: Grade): GeoJSONSourceDiff | null {
  const add: Feature[] = [];
  const update: NonNullable<GeoJSONSourceDiff['update']> = [];
  const remove: number[] = [];
  for (let k = 0; k < depois.conta.length; k++) {
    const a = antes.conta[k]!;
    const d = depois.conta[k]!;
    if (a === d && (d === 0 || (antes.somaLon[k] === depois.somaLon[k] && antes.somaLat[k] === depois.somaLat[k]))) continue;
    if (add.length + update.length + remove.length >= DIFERENCA_MAXIMA) return null;
    if (d === 0) remove.push(k);
    else if (a === 0) add.push(celula(depois, k));
    else {
      const f = celula(depois, k);
      update.push({ id: k, newGeometry: f.geometry, addOrUpdateProperties: [{ key: 'n', value: d }] });
    }
  }
  return { add, update, remove };
}

export const diferencaVazia = (d: GeoJSONSourceDiff) => !d.add?.length && !d.update?.length && !d.remove?.length;

// ---------------------------------------------------------------- calibração

/** O núcleo do MapLibre: cada ponto soma `peso × intensidade × GAUSS × e^(−d²/2σ²)`, com σ = raio/3. */
const GAUSS = 0.3989422804014327;

/** Soma acumulada (tabela de áreas somadas), reaproveitada entre calibrações. */
let somas: Float64Array | null = null;
const W = COLUNAS + 1;

function somar(g: Grade): Float64Array {
  somas ??= new Float64Array(W * (LINHAS + 1));
  for (let j = 0; j < LINHAS; j++) {
    let linha = 0;
    for (let i = 0; i < COLUNAS; i++) {
      linha += g.conta[j * COLUNAS + i]!;
      somas[(j + 1) * W + i + 1] = somas[j * W + i + 1]! + linha;
    }
  }
  return somas;
}

/**
 * O pico do campo que o MapLibre desenha: o maior valor de Σ n·e^(−d²/2σ²), com
 * σ = raio/3, em qualquer lugar do DF.
 *
 * Em dois passos, para não borrar a grade inteira a cada calibração: primeiro o
 * quadrado com mais chamados (um núcleo gaussiano de desvio σ pesa como um
 * quadrado de lado σ√(2π)), depois a soma gaussiana de verdade, célula a célula,
 * dentro e em volta dele.
 */
function maiorFoco(g: Grade, s: Float64Array, raioM: number): number {
  const sigma = raioM / 3 / LADO_M; // em células
  const k = Math.max(1, Math.round(sigma * Math.sqrt(2 * Math.PI)));
  // Um quadrado grande muda pouco de uma célula para a vizinha: dá para andar aos saltos.
  const passo = Math.max(1, Math.floor(k / 4));
  let maior = -1;
  let bi = k;
  let bj = k;
  for (let j = k; j <= LINHAS; j += passo) {
    for (let i = k; i <= COLUNAS; i += passo) {
      const v = s[j * W + i]! - s[(j - k) * W + i]! - s[j * W + i - k]! + s[(j - k) * W + i - k]!;
      if (v > maior) {
        maior = v;
        bi = i;
        bj = j;
      }
    }
  }
  // O quadrado vencedor ocupa as células [bi−k, bi) × [bj−k, bj).
  const alcance = Math.ceil(3 * sigma);
  const peso = Float64Array.from({ length: alcance + 1 }, (_, d) => Math.exp(-(d * d) / (2 * sigma * sigma)));
  const folga = Math.max(1, passo);
  const salto = Math.max(1, Math.floor(sigma / 2));
  let pico = 0;
  for (let cj = bj - k - folga; cj < bj + folga; cj += salto) {
    for (let ci = bi - k - folga; ci < bi + folga; ci += salto) {
      let soma = 0;
      for (let dj = -alcance; dj <= alcance; dj++) {
        const j = cj + dj;
        if (j < 0 || j >= LINHAS) continue;
        const pj = peso[Math.abs(dj)]!;
        for (let di = -alcance; di <= alcance; di++) {
          const i = ci + di;
          if (i < 0 || i >= COLUNAS) continue;
          const n = g.conta[j * COLUNAS + i]!;
          if (n) soma += n * pj * peso[Math.abs(di)]!;
        }
      }
      if (soma > pico) pico = soma;
    }
  }
  return pico;
}

/** O maior número de chamados sob um núcleo de raio `raioM`, já com o peso do núcleo, em qualquer lugar do DF. */
export const pico = (g: Grade, raioM: number) => (g.total === 0 ? 0 : maiorFoco(g, somar(g), raioM));

/**
 * Até onde o maior foco passa do topo da escala. Com 1, só o ponto exato do
 * pico chegaria à última faixa; com esta folga, o foco inteiro chega.
 */
export const FOLGA_DO_TOPO = 1.25;

/**
 * A expressão de `heatmap-intensity`: em cada zoom, o maior foco da seleção
 * chega ao topo da escala. Sem chamados, zero.
 */
export function intensidadePorZoom(g: Grade): unknown[] {
  const s = g.total === 0 ? null : somar(g);
  // Raios iguais dão picos iguais.
  const cache = new Map<number, number>();
  const paradas = RAIO_NO_CHAO.flatMap(([z, raio]) => {
    let p = cache.get(raio);
    if (p === undefined) cache.set(raio, (p = s ? maiorFoco(g, s, raio) : 0));
    return [z, p > 0 ? FOLGA_DO_TOPO / (GAUSS * p) : 0];
  });
  return ['interpolate', ['linear'], ['zoom'], ...paradas];
}

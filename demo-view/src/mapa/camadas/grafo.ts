/**
 * O grafo da inteligência (I3) no mapa: os chamados como pontos, as ligações
 * que a IA encontra como arcos e os incidentes sugeridos como colunas.
 *
 * Vem do grafo da demo exploratória (`components/grafo-deck.tsx`, do Calebe):
 * as três etapas, os arcos em 3D, o sinal correndo nos arcos que cruzam órgãos,
 * o colapso no incidente e a onda ao confirmar. Aqui, depurado: tom neutro em
 * tudo, cor só no incidente aberto, e uma coisa só se mexendo por vez.
 */
import type { Layer } from '@deck.gl/core';
import { ColumnLayer, PathLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { type Chamado, type Incidente, type Ligacao, metros, type Resultado } from '../../inteligencia/agrupamento';
import { type Severidade, siglaDoOrgao } from '../../inteligencia/casos';
import { CORES, type RGB, rgb } from '../../ui/tokens';
import { NA_PILHA, SEMPRE_POR_CIMA } from './pilha';

/** 0: os chamados · 1: as ligações · 2: os incidentes. */
export type Etapa = 0 | 1 | 2;
export const ETAPAS: { nome: string; dica: string }[] = [
  { nome: 'Chamados', dica: 'Cada ponto é um chamado, onde o problema foi relatado' },
  { nome: 'Ligações', dica: 'A IA liga o que fala da mesma coisa, perto e na mesma hora' },
  { nome: 'Incidentes', dica: 'Chamados ligados viram um incidente sugerido' },
];

type Pos3 = [number, number, number];
type RGBA = [number, number, number, number];

const NEUTRO: RGB = [198, 204, 210];
const ACENTO = rgb(CORES.acentoClaro);
/** Cor só para o que pede atenção: crítico e sério. O resto é neutro. */
export const COR_DA_SEVERIDADE: Record<Severidade, RGB> = { crítico: rgb(CORES.alerta), sério: rgb(CORES.aviso), atenção: [150, 158, 166] };

const AMOSTRAS = 16;
const DURACAO_DO_SINAL = 2400;
export const DURACAO_DA_ONDA = 1600;

/** Arco parabólico entre dois pontos, com a altura em metros. */
export function arco(a: [number, number], b: [number, number], altura: number): Pos3[] {
  return Array.from({ length: AMOSTRAS }, (_, k) => {
    const t = k / (AMOSTRAS - 1);
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, altura * 4 * t * (1 - t)];
  });
}

/** O ponto a `s` (0 a 1) do caminho. */
export function pontoNoArco(c: readonly Pos3[], s: number): Pos3 {
  const x = Math.min(1, Math.max(0, s)) * (c.length - 1);
  const i = Math.min(c.length - 2, Math.floor(x));
  const f = x - i;
  const a = c[i]!;
  const b = c[i + 1]!;
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

/** Altura da coluna de um incidente, em metros: cresce com a raiz dos chamados reunidos. */
export const alturaDaColuna = (chamados: number) => 500 + Math.sqrt(chamados) * 380;

export interface PontoDoGrafo {
  i: number;
  ponto: [number, number];
  descricao: string;
  orgao: string;
  peso: number;
}

export interface ArcoDoGrafo {
  caminho: Pos3[];
  cruza: boolean;
  /** Incidente a que o arco pertence. */
  grupo: number;
  /** Defasagem do sinal que corre por ele (0 a 1). */
  fase: number;
}

export interface Onda {
  id: number;
  centro: [number, number];
  cor: RGB;
  /** `performance.now()` de quando começou. */
  em: number;
}

/** O que não muda com a etapa nem com a seleção: calculado uma vez por agrupamento. */
export interface BaseDoGrafo {
  pontos: PontoDoGrafo[];
  /** As ligações mostradas: no máximo as 3 mais fortes de cada chamado. */
  arcos: ArcoDoGrafo[];
  /** Um arco de cada chamado ao centro do seu incidente. */
  raios: ArcoDoGrafo[];
}

const MAXIMO_POR_PONTO = 3;

export function prepararGrafo(chamados: readonly Chamado[], r: Resultado): BaseDoGrafo {
  const pontos = chamados.map((c, i) => ({ i, ponto: c.ponto, descricao: c.descricao, orgao: siglaDoOrgao(c.orgaoId), peso: c.peso }));
  const usadas = new Int32Array(chamados.length);
  const arcos: ArcoDoGrafo[] = [];
  for (const l of [...r.ligacoes].sort((x, y) => y.forca - x.forca)) {
    if (usadas[l.a]! >= MAXIMO_POR_PONTO || usadas[l.b]! >= MAXIMO_POR_PONTO) continue;
    usadas[l.a]!++;
    usadas[l.b]!++;
    arcos.push(arcoDaLigacao(chamados, l, r.grupo[l.a] ?? -1));
  }
  const raios = r.incidentes.flatMap((inc, k) =>
    inc.membros.map((m, n) => {
      const a = chamados[m]!.ponto;
      return { caminho: arco(a, inc.centro, Math.min(2200, Math.max(60, metros(a, inc.centro) * 0.6))), cruza: true, grupo: k, fase: (n * 0.37) % 1 };
    }),
  );
  return { pontos, arcos, raios };
}

function arcoDaLigacao(ch: readonly Chamado[], l: Ligacao, grupo: number): ArcoDoGrafo {
  const a = ch[l.a]!.ponto;
  const b = ch[l.b]!.ponto;
  const d = metros(a, b);
  // Os que cruzam órgãos sobem mais: são os que os silos não veem.
  const altura = l.cruza ? Math.min(2600, Math.max(140, d * 0.5)) : Math.min(1100, Math.max(50, d * 0.25));
  return { caminho: arco(a, b, altura), cruza: l.cruza, grupo, fase: ((l.a * 31 + l.b * 17) % 100) / 100 };
}

export interface EstadoDoGrafo {
  base: BaseDoGrafo;
  resultado: Resultado;
  etapa: Etapa;
  /** Índice do incidente aberto, ou −1. */
  aberto: number;
  /** Incidentes descartados por uma pessoa: os chamados voltam a ser avulsos. */
  descartados: ReadonlySet<number>;
}

/** As camadas que só mudam quando o estado muda. */
export function camadasDoGrafo(e: EstadoDoGrafo): Layer[] {
  const { base, resultado, etapa, aberto, descartados } = e;
  const grupoDe = (i: number) => resultado.grupo[i] ?? -1;
  const noIncidente = (i: number) => grupoDe(i) >= 0 && !descartados.has(grupoDe(i));
  const haAberto = aberto >= 0;
  const chave = [etapa, aberto, descartados];

  const alfaDoPonto = (p: PontoDoGrafo): number => {
    const g = grupoDe(p.i);
    if (haAberto) return g === aberto ? 255 : 26;
    if (etapa === 0) return 215;
    if (etapa === 1) return noIncidente(p.i) ? 235 : 70;
    return noIncidente(p.i) ? 0 : 70;
  };
  const corDoPonto = (p: PontoDoGrafo): RGBA => [...(haAberto && grupoDe(p.i) === aberto ? ACENTO : NEUTRO), alfaDoPonto(p)];
  // Na etapa 3, os chamados de um incidente se recolhem no centro dele (o aberto fica espalhado, para ser lido).
  const posicao = (p: PontoDoGrafo): [number, number] => (etapa === 2 && noIncidente(p.i) && grupoDe(p.i) !== aberto ? resultado.incidentes[grupoDe(p.i)]!.centro : p.ponto);

  const camadas: Layer[] = [];

  if (etapa >= 1) {
    const visiveis = etapa === 1 ? base.arcos.filter((a) => !descartados.has(a.grupo)) : [];
    camadas.push(
      new PathLayer<ArcoDoGrafo>({
        id: 'grafo-ligacoes',
        data: visiveis,
        getPath: (a) => a.caminho,
        getColor: (a) => {
          const fraco = haAberto && a.grupo !== aberto;
          if (a.cruza) return [...ACENTO, fraco ? 16 : 190];
          return [...NEUTRO, fraco ? 12 : 70];
        },
        getWidth: (a) => (a.cruza ? 1.5 : 1),
        widthUnits: 'pixels',
        updateTriggers: { getColor: chave },
        ...SEMPRE_POR_CIMA,
        ...NA_PILHA,
      }),
    );
  }

  // De longe, os arcos de um grupo cabem em poucos pixels: um anel marca onde há chamados ligados.
  if (etapa === 1) {
    const nos = resultado.incidentes.map((inc, k) => ({ ...inc, k })).filter((c) => !descartados.has(c.k));
    camadas.push(
      new ScatterplotLayer<(typeof nos)[number]>({
        id: 'grafo-nos',
        data: nos,
        getPosition: (c) => c.centro,
        getRadius: (c) => c.raio * 1.25,
        radiusMinPixels: 11,
        filled: false,
        stroked: true,
        getLineColor: (c) => [...(c.orgaos.length > 1 ? ACENTO : NEUTRO), haAberto ? (c.k === aberto ? 0 : 40) : 200],
        lineWidthMinPixels: 1.5,
        pickable: true,
        updateTriggers: { getLineColor: chave },
        ...SEMPRE_POR_CIMA,
        ...NA_PILHA,
      }),
    );
  }

  if (etapa === 2 && haAberto) {
    camadas.push(
      new PathLayer<ArcoDoGrafo>({
        id: 'grafo-raios',
        data: base.raios.filter((a) => a.grupo === aberto),
        getPath: (a) => a.caminho,
        getColor: [...ACENTO, 150],
        getWidth: 1.2,
        widthUnits: 'pixels',
        ...SEMPRE_POR_CIMA,
        ...NA_PILHA,
      }),
    );
  }

  camadas.push(
    new ScatterplotLayer<PontoDoGrafo>({
      id: 'grafo-halo',
      data: base.pontos,
      getPosition: posicao,
      getRadius: (p) => 160 + Math.sqrt(p.peso) * 60,
      radiusMinPixels: 7,
      radiusMaxPixels: 26,
      getFillColor: (p) => {
        const [r, g, b, a] = corDoPonto(p);
        // No incidente aberto os pontos ficam juntos: brilho menor, para não virar uma mancha.
        return [r, g, b, Math.round(a * (haAberto ? 0.07 : 0.2))];
      },
      transitions: { getPosition: 900 },
      updateTriggers: { getPosition: chave, getFillColor: chave },
      ...SEMPRE_POR_CIMA,
      ...NA_PILHA,
    }),
    new ScatterplotLayer<PontoDoGrafo>({
      id: 'grafo-chamados',
      data: base.pontos,
      getPosition: posicao,
      getRadius: (p) => 45 + Math.sqrt(p.peso) * 22,
      radiusMinPixels: 2.6,
      radiusMaxPixels: 9,
      getFillColor: corDoPonto,
      pickable: true,
      transitions: { getPosition: 900, getFillColor: 300 },
      updateTriggers: { getPosition: chave, getFillColor: chave },
      ...SEMPRE_POR_CIMA,
      ...NA_PILHA,
    }),
  );

  if (etapa === 2) {
    const colunas = resultado.incidentes.map((inc, k) => ({ ...inc, k })).filter((c) => !descartados.has(c.k));
    // A coluna do incidente aberto sai de cena: no lugar ficam os chamados dele e os raios.
    const alfa = (k: number) => (haAberto ? (k === aberto ? 0 : 50) : 235);
    camadas.push(
      new ColumnLayer<(typeof colunas)[number]>({
        id: 'grafo-colunas',
        data: colunas,
        diskResolution: 6,
        radius: 520,
        extruded: true,
        getPosition: (c) => c.centro,
        getElevation: (c) => alturaDaColuna(c.chamados),
        getFillColor: (c) => [...COR_DA_SEVERIDADE[c.severidade], alfa(c.k)],
        material: { ambient: 0.75, diffuse: 0.45, shininess: 18 },
        pickable: true,
        transitions: { getElevation: 700, getFillColor: 300 },
        updateTriggers: { getFillColor: chave },
        ...NA_PILHA,
      }),
      new TextLayer<(typeof colunas)[number]>({
        id: 'grafo-numeros',
        data: colunas.filter((c) => !haAberto || c.k === aberto),
        getPosition: (c) => [c.centro[0], c.centro[1], c.k === aberto ? 0 : alturaDaColuna(c.chamados) + 350],
        getText: (c) => Math.round(c.chamados).toLocaleString('pt-BR'),
        getSize: 13,
        getColor: [255, 255, 255, 255],
        fontFamily: 'Bahnschrift, "Barlow Condensed", system-ui, sans-serif',
        fontWeight: 600,
        characterSet: '0123456789.',
        background: true,
        getBackgroundColor: [12, 14, 16, 215],
        backgroundPadding: [5, 2, 5, 2],
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'bottom',
        getPixelOffset: (c) => [0, c.k === aberto ? -22 : 0],
        updateTriggers: { getPosition: chave, getPixelOffset: chave },
        ...SEMPRE_POR_CIMA,
        ...NA_PILHA,
      }),
    );
  }

  return camadas;
}

/**
 * O que se mexe: o sinal correndo nos arcos do incidente aberto e a onda de
 * quem acabou de ser confirmado. `ativo` diz se ainda há o que animar.
 */
export function camadasVivas(e: EstadoDoGrafo, ondas: readonly Onda[], t: number): { camadas: Layer[]; ativo: boolean } {
  if (!Number.isFinite(t)) return { camadas: [], ativo: false };
  const camadas: Layer[] = [];
  const percorridos = e.aberto < 0 || e.etapa === 0 ? [] : e.etapa === 2 ? e.base.raios.filter((a) => a.grupo === e.aberto) : e.base.arcos.filter((a) => a.grupo === e.aberto && a.cruza);
  if (percorridos.length) {
    camadas.push(
      new ScatterplotLayer<ArcoDoGrafo>({
        id: 'grafo-sinais',
        data: percorridos,
        getPosition: (a) => pontoNoArco(a.caminho, (t / DURACAO_DO_SINAL + a.fase) % 1),
        getRadius: 3,
        radiusUnits: 'pixels',
        getFillColor: [235, 250, 255, 255],
        updateTriggers: { getPosition: t },
        ...SEMPRE_POR_CIMA,
        ...NA_PILHA,
      }),
    );
  }
  const vivas = ondas.filter((o) => t - o.em < DURACAO_DA_ONDA);
  if (vivas.length) {
    const p = (o: Onda) => 1 - Math.pow(1 - Math.min(1, Math.max(0, (t - o.em) / DURACAO_DA_ONDA)), 3);
    camadas.push(
      new ScatterplotLayer<Onda>({
        id: 'grafo-ondas',
        data: vivas,
        getPosition: (o) => o.centro,
        getRadius: (o) => 200 + p(o) * 3200,
        filled: false,
        stroked: true,
        getLineColor: (o) => [...o.cor, Math.round(255 * (1 - p(o)))],
        lineWidthMinPixels: 2,
        updateTriggers: { getRadius: t, getLineColor: t },
        ...SEMPRE_POR_CIMA,
        ...NA_PILHA,
      }),
    );
  }
  return { camadas, ativo: percorridos.length > 0 || vivas.length > 0 };
}

/** A câmera para ler um incidente: mais perto quanto menor o grupo. */
export const zoomDoIncidente = (inc: Pick<Incidente, 'raio'>) => Math.min(15.5, Math.max(11.5, 16.4 - Math.log2(Math.max(60, inc.raio) / 100)));

/**
 * Os chamados SIMULADOS no mapa, em três leituras (I1):
 *
 * - **Calor** (a principal): a mancha de calor, "onde as coisas estão pegando,
 *   onde as coisas estão mais tranquilas" (ATA 221–222). É desenhada pelo
 *   próprio MapLibre (`mapa/calor.ts`), e não por uma camada daqui;
 * - **Hexágonos 3D**: os chamados agrupados em hexágonos de ~650 m;
 * - **Regiões 3D**: cada RA sobe e clareia conforme o volume de chamados (a taxa
 *   por 10 mil habitantes fica na dica e no cartão da RA). Clicar escolhe a RA
 *   (o clique passa pelo `Mapa.tsx`).
 */
import type { Layer } from '@deck.gl/core';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { PolygonLayer } from '@deck.gl/layers';
import type { Incidente } from '../../dominio/incidente';
import { REGIOES } from '../../dominio/ras';
import type { ChamadosDaRa } from '../../indicadores/indicadores';
import { ESCALA_CONCENTRACAO } from '../../ui/tokens';
import { NA_PILHA } from './pilha';

export type ModoMapa = 'regioes' | 'hexagonos' | 'calor' | 'anormal';

/** Na ordem em que aparecem: o calor é a leitura principal e a que abre. */
export const MODOS: { id: ModoMapa; nome: string }[] = [
  { id: 'calor', nome: 'Calor' },
  { id: 'hexagonos', nome: 'Hexágonos 3D' },
  { id: 'regioes', nome: 'Regiões 3D' },
  { id: 'anormal', nome: 'Fora do normal' },
];

/** A razão em que a cor chega ao topo da escala (50% acima do normal). */
export const TETO_DO_ANORMAL = 1.5;
/** De 0 (no normal) a 1 (muito acima): quanto a região saiu do próprio normal. Quem saiu nunca fica em zero. */
export const excessoDoNormal = (v: { razao: number | null; fora: boolean } | undefined) => (!v?.fora || v.razao === null ? 0 : Math.min(1, Math.max(0.2, (v.razao - 1) / (TETO_DO_ANORMAL - 1))));

export const MODO_INICIAL: ModoMapa = 'calor';

/** Altura máxima de uma RA, em metros: alta o bastante para ler com a câmera inclinada. */
const ALTURA_MAXIMA_RA = 4200;

/** Cor contínua na escala de concentração, de 0 (pouco) a 1 (muito). */
export function corNaEscala(t: number): [number, number, number] {
  const x = Math.min(1, Math.max(0, t)) * (ESCALA_CONCENTRACAO.length - 1);
  const i = Math.min(ESCALA_CONCENTRACAO.length - 2, Math.floor(x));
  const f = x - i;
  const a = ESCALA_CONCENTRACAO[i]!;
  const b = ESCALA_CONCENTRACAO[i + 1]!;
  return [0, 1, 2].map((k) => Math.round(a[k]! + (b[k]! - a[k]!) * f)) as [number, number, number];
}

/** Um polígono de RA (as RAs com mais de uma parte viram mais de um polígono). */
export interface PoligonoRa {
  id: string;
  nome: string;
  contorno: number[][][];
  v: ChamadosDaRa | undefined;
  /** Volume relativo à RA com mais chamados (0 a 1). */
  t: number;
}

const PARTES_RA = REGIOES.flatMap((r) =>
  (r.geometria.type === 'Polygon' ? [r.geometria.coordinates] : r.geometria.coordinates).map((contorno) => ({ id: r.id, nome: r.nome, contorno })),
);

export interface EstadoChamados {
  modo: ModoMapa;
  /** Período, área e RA: alimentam os hexágonos (e o calor, no `Mapa.tsx`). */
  filtrados: Incidente[];
  /** Período e área, RA por RA: alimentam as Regiões 3D (a RA escolhida se destaca entre as outras). */
  porRa: Map<string, ChamadosDaRa>;
  raSelecionada: string | null;
  /** Com camadas reais ligadas, as RAs ficam baixas e translúcidas, para os pontos aparecerem. */
  discreto: boolean;
  /** No modo "fora do normal": cada região contra a própria média (`indicadores/regioes.ts`). */
  anormal?: ReadonlyMap<string, { razao: number | null; fora: boolean }> | null;
}

export function camadasDeChamados(e: EstadoChamados): Layer[] {
  // O calor não é uma camada do deck.gl: ver `mapa/calor.ts`.
  if (e.modo === 'calor') return [];

  if (e.modo === 'hexagonos') {
    return [
      new HexagonLayer<Incidente>({
        id: 'hexagonos',
        data: e.filtrados,
        getPosition: (i) => [i.local.lon, i.local.lat],
        radius: 650,
        coverage: 0.86,
        extruded: true,
        // Proporcional ao volume filtrado, até 3,6 km (menos de três vezes a largura do
        // hexágono): com os chamados espalhados pela mancha urbana, mais que isso vira
        // uma floresta de torres que esconde o mapa.
        elevationRange: [0, Math.min(3600, Math.max(900, e.filtrados.length * 0.22))],
        upperPercentile: 99,
        colorRange: ESCALA_CONCENTRACAO,
        opacity: e.discreto ? 0.55 : 0.95,
        pickable: true,
        autoHighlight: true,
        highlightColor: [255, 255, 255, 70],
        material: { ambient: 0.6, diffuse: 0.6, shininess: 24 },
        transitions: { elevationScale: 600 },
        ...NA_PILHA,
      }),
    ];
  }

  const maximo = Math.max(1, ...[...e.porRa.values()].map((v) => v.chamados));
  const foraDoNormal = e.modo === 'anormal';
  const dados: PoligonoRa[] = PARTES_RA.map((p) => {
    const v = e.porRa.get(p.id);
    // No "fora do normal", a altura e a cor medem o quanto a região saiu do próprio normal, não o volume.
    return { ...p, v, t: foraDoNormal ? excessoDoNormal(e.anormal?.get(p.id)) : (v?.chamados ?? 0) / maximo };
  });
  const sel = e.raSelecionada;
  // Com uma RA escolhida, as outras baixam e apagam: de perto, não viram muralhas em volta dela.
  const escala = (d: PoligonoRa) => (e.discreto ? 0.3 : sel !== null && d.id !== sel ? 0.08 : 1);
  // Calmo por padrão, vivo quando importa: as RAs com pouco ficam quase transparentes,
  // as carregadas acendem.
  const alfa = (d: PoligonoRa) => (e.discreto ? 70 : sel === null ? Math.round(48 + 192 * Math.pow(d.t, 0.9)) : d.id === sel ? 165 : 45);
  // Quem está no normal fica neutro: a cor é só de quem saiu dele.
  const NEUTRO: [number, number, number] = [120, 128, 136];
  return [
    new PolygonLayer<PoligonoRa>({
      id: 'regioes',
      data: dados,
      getPolygon: (d) => d.contorno,
      extruded: true,
      getElevation: (d) => 100 + Math.pow(d.t, 0.9) * ALTURA_MAXIMA_RA * escala(d),
      // Só as RAs de fato carregadas chegam ao âmbar e ao amarelo claro.
      getFillColor: (d) => (foraDoNormal && d.t === 0 ? [...NEUTRO, e.discreto ? 40 : 60] : [...corNaEscala(foraDoNormal ? 0.25 + 0.75 * d.t : Math.pow(d.t, 1.1)), foraDoNormal ? Math.round(150 + 90 * d.t) : alfa(d)]),
      material: { ambient: 0.55, diffuse: 0.55, shininess: 32 },
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 255, 255, 60],
      transitions: { getElevation: 700, getFillColor: 400 },
      updateTriggers: { getElevation: [e.porRa, sel, e.discreto, e.modo, e.anormal], getFillColor: [e.porRa, sel, e.discreto, e.modo, e.anormal] },
      ...NA_PILHA,
    }),
  ];
}

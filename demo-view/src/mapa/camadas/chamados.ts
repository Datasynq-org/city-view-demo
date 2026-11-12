/**
 * Os chamados SIMULADOS no mapa, em três leituras (I1):
 *
 * - **Regiões 3D**: cada RA sobe e esquenta conforme o volume de chamados (a taxa
 *   por 10 mil habitantes fica na dica e no cartão da RA). Clicar escolhe a RA
 *   (o clique passa pelo `Mapa.tsx`);
 * - **Hexágonos 3D**: os chamados agrupados em hexágonos de ~650 m;
 * - **Calor**: a mancha de calor, "onde as coisas estão pegando, onde as coisas
 *   estão mais tranquilas" (ATA 221–222).
 */
import type { Layer } from '@deck.gl/core';
import { HeatmapLayer, HexagonLayer } from '@deck.gl/aggregation-layers';
import { PolygonLayer } from '@deck.gl/layers';
import type { Incidente } from '../../dominio/incidente';
import { REGIOES } from '../../dominio/ras';
import type { ChamadosDaRa } from '../../indicadores/indicadores';
import { ESCALA_CONCENTRACAO } from '../../ui/tokens';
import { NA_PILHA } from './pilha';

export type ModoMapa = 'regioes' | 'hexagonos' | 'calor';

export const MODOS: { id: ModoMapa; nome: string }[] = [
  { id: 'regioes', nome: 'Regiões 3D' },
  { id: 'hexagonos', nome: 'Hexágonos 3D' },
  { id: 'calor', nome: 'Calor' },
];

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
  /** Período, área e RA: alimentam hexágonos e calor. */
  filtrados: Incidente[];
  /** Período e área, RA por RA: alimentam as Regiões 3D (a RA escolhida se destaca entre as outras). */
  porRa: Map<string, ChamadosDaRa>;
  raSelecionada: string | null;
  /** Com camadas reais ligadas, as RAs ficam baixas e translúcidas, para os pontos aparecerem. */
  discreto: boolean;
}

export function camadasDeChamados(e: EstadoChamados): Layer[] {
  if (e.modo === 'calor') {
    return [
      new HeatmapLayer<Incidente>({
        id: 'calor',
        data: e.filtrados,
        getPosition: (i) => [i.local.lon, i.local.lat],
        radiusPixels: 38,
        intensity: 1.1,
        threshold: 0.04,
        colorRange: ESCALA_CONCENTRACAO,
        ...NA_PILHA,
      }),
    ];
  }

  if (e.modo === 'hexagonos') {
    return [
      new HexagonLayer<Incidente>({
        id: 'hexagonos',
        data: e.filtrados,
        getPosition: (i) => [i.local.lon, i.local.lat],
        radius: 650,
        coverage: 0.86,
        extruded: true,
        // Proporcional ao volume filtrado: com poucos chamados, poucas colunas não viram torres.
        elevationRange: [0, Math.min(14000, Math.max(1500, e.filtrados.length * 0.9))],
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
  const dados: PoligonoRa[] = PARTES_RA.map((p) => {
    const v = e.porRa.get(p.id);
    return { ...p, v, t: (v?.chamados ?? 0) / maximo };
  });
  const sel = e.raSelecionada;
  // Com uma RA escolhida, as outras baixam e apagam: de perto, não viram muralhas em volta dela.
  const escala = (d: PoligonoRa) => (e.discreto ? 0.3 : sel !== null && d.id !== sel ? 0.08 : 1);
  // Calmo por padrão, vivo quando importa: as RAs com pouco ficam quase transparentes,
  // as carregadas acendem.
  const alfa = (d: PoligonoRa) => (e.discreto ? 70 : sel === null ? Math.round(55 + 185 * Math.pow(d.t, 0.7)) : d.id === sel ? 230 : 40);
  return [
    new PolygonLayer<PoligonoRa>({
      id: 'regioes',
      data: dados,
      getPolygon: (d) => d.contorno,
      extruded: true,
      getElevation: (d) => 100 + Math.pow(d.t, 0.9) * ALTURA_MAXIMA_RA * escala(d),
      // Só as RAs de fato carregadas chegam ao âmbar e ao vermelho.
      getFillColor: (d) => [...corNaEscala(Math.pow(d.t, 0.8)), alfa(d)],
      material: { ambient: 0.55, diffuse: 0.55, shininess: 32 },
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 255, 255, 60],
      transitions: { getElevation: 700, getFillColor: 400 },
      updateTriggers: { getElevation: [e.porRa, sel, e.discreto], getFillColor: [e.porRa, sel, e.discreto] },
      ...NA_PILHA,
    }),
  ];
}

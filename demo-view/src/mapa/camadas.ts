/**
 * Camadas deck.gl da sala de guerra (I1): os chamados SIMULADOS agrupados no mapa,
 * em calor ou em hexágonos 3D. "Todos os chamados agrupados e classificados num
 * mapa de calor: onde as coisas estão pegando, onde estão mais tranquilas" (ATA 220–222).
 */
import type { Layer, PickingInfo } from '@deck.gl/core';
import { HeatmapLayer, HexagonLayer } from '@deck.gl/aggregation-layers';
import type { Incidente } from '../dominio/incidente';
import { CORES, ESCALA_CONCENTRACAO } from '../ui/tokens';

export type ModoMapa = 'calor' | 'hexagonos';

/**
 * Os hexágonos e o calor ficam por baixo dos nomes das RAs (`mapa/estilo.ts`).
 * `beforeId` vale no modo intercalado do @deck.gl/maplibre, mas não está nos tipos
 * das camadas; por isso entra por espalhamento, sem a checagem de propriedades.
 */
const NA_PILHA = { beforeId: 'ras-rotulos' } as Record<string, unknown>;
const posicao = (i: Incidente): [number, number] => [i.local.lon, i.local.lat];

export function montarCamadas(incidentes: Incidente[], modo: ModoMapa): Layer[] {
  if (modo === 'calor') {
    return [
      new HeatmapLayer<Incidente>({
        id: 'calor',
        data: incidentes,
        getPosition: posicao,
        radiusPixels: 38,
        intensity: 1.1,
        threshold: 0.04,
        colorRange: ESCALA_CONCENTRACAO,
        ...NA_PILHA,
      }),
    ];
  }
  return [
    new HexagonLayer<Incidente>({
      id: 'hexagonos',
      data: incidentes,
      getPosition: posicao,
      radius: 650,
      coverage: 0.86,
      extruded: true,
      elevationScale: 1,
      // Altura em metros: alta o bastante para a concentração aparecer com a câmera inclinada,
      // mas proporcional ao volume filtrado (com poucos chamados, poucas colunas não viram torres).
      elevationRange: [0, Math.min(14000, Math.max(1500, incidentes.length * 0.9))],
      upperPercentile: 99,
      colorRange: ESCALA_CONCENTRACAO,
      pickable: true,
      autoHighlight: true,
      highlightColor: [255, 255, 255, 70],
      material: { ambient: 0.6, diffuse: 0.6, shininess: 24 },
      ...NA_PILHA,
    }),
  ];
}

/** Dica ao passar o mouse num hexágono: quantos chamados estão ali. */
export function dicaDoMapa({ object }: PickingInfo): { html: string; style: Record<string, string> } | null {
  const valor = (object as { colorValue?: number } | null)?.colorValue;
  if (valor === undefined) return null;
  const n = Math.round(valor);
  return {
    html: `<strong>${n.toLocaleString('pt-BR')}</strong> chamado${n === 1 ? '' : 's'} neste trecho`,
    style: {
      background: 'rgba(18, 41, 63, 0.92)',
      color: CORES.texto,
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '10px',
      padding: '6px 10px',
      fontFamily: 'Bahnschrift, Barlow, system-ui, sans-serif',
      fontSize: '13px',
    },
  };
}

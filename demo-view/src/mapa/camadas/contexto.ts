/**
 * Camadas REAIS de contexto (`dados/contexto.ts`): unidades públicas de saúde,
 * escolas públicas e favelas e comunidades urbanas. Desligadas ao abrir; quem
 * liga é a pessoa, no painel de camadas, sempre com o selo da fonte.
 */
import type { Layer } from '@deck.gl/core';
import { GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
import { type CamadaContexto, type Contexto, type Ponto, RAIO_SAUDE } from '../../dados/contexto';
import { CORES, rgb } from '../../ui/tokens';
import { NA_PILHA, SEMPRE_POR_CIMA } from './pilha';

/** Cores neutras: a cor forte fica com os chamados. */
export const COR_CONTEXTO: Record<CamadaContexto, string> = {
  saude: '#FFFFFF',
  escolas: '#9DB4CB',
  favelas: '#E8E1D0',
};

export function camadasDeContexto(contexto: Contexto | null, ligadas: ReadonlySet<CamadaContexto>): Layer[] {
  if (!contexto) return [];
  const camadas: Layer[] = [];

  if (ligadas.has('favelas')) {
    camadas.push(
      new GeoJsonLayer({
        id: 'favelas',
        data: contexto.favelas as never,
        filled: true,
        getFillColor: [...rgb(COR_CONTEXTO.favelas), 40],
        stroked: true,
        getLineColor: [...rgb(COR_CONTEXTO.favelas), 210],
        getLineWidth: 1.5,
        lineWidthUnits: 'pixels',
        pickable: true,
        ...SEMPRE_POR_CIMA,
        ...NA_PILHA,
      }),
    );
  }

  if (ligadas.has('escolas')) {
    camadas.push(
      new ScatterplotLayer<Ponto>({
        id: 'escolas',
        data: contexto.escolas.linhas,
        getPosition: (d) => [d[0], d[1]],
        getRadius: 70,
        radiusMinPixels: 2,
        getFillColor: [...rgb(COR_CONTEXTO.escolas), 230],
        pickable: true,
        ...SEMPRE_POR_CIMA,
        ...NA_PILHA,
      }),
    );
  }

  if (ligadas.has('saude')) {
    camadas.push(
      new ScatterplotLayer<Ponto>({
        id: 'saude',
        data: contexto.saude.linhas,
        getPosition: (d) => [d[0], d[1]],
        getRadius: (d) => RAIO_SAUDE[d[3]] ?? 120,
        radiusMinPixels: 3,
        getFillColor: [...rgb(COR_CONTEXTO.saude), 240],
        stroked: true,
        getLineColor: [...rgb(CORES.navy), 255],
        lineWidthMinPixels: 1.5,
        pickable: true,
        ...SEMPRE_POR_CIMA,
        ...NA_PILHA,
      }),
    );
  }

  return camadas;
}

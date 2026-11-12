/**
 * Estilo do mapa, montado no código: fundo navy, o desenho da cidade (água,
 * verde e vias do OpenFreeMap) em tons de navy e, por cima, as RAs.
 *
 * De perto (zoom 13 em diante), os prédios sobem em 3D, com a altura do
 * OpenStreetMap: dá a escala da cidade quando a câmera inclina.
 *
 * Só o desenho da cidade depende da rede. O fundo, os contornos e os nomes das
 * RAs são locais: sem internet, o mapa abre igual, só sem água e vias.
 */
import type { FeatureCollection, Point } from 'geojson';
import type { StyleSpecification } from 'maplibre-gl';
import type { Regiao } from '../dominio/ras';
import { CORES } from '../ui/tokens';

/** Mapa de ruas gratuito e sem chave (dados do OpenStreetMap, esquema OpenMapTiles). */
export const URL_OPENFREEMAP = 'https://tiles.openfreemap.org/planet';

/** Nome da fonte dos rótulos dentro do estilo. O arquivo vem em `font-faces`. */
const FONTE_ROTULO = 'Barlow Condensed SemiBold';

/** Tons do desenho da cidade: variações do navy, do mais discreto ao mais visível. */
const TONS = {
  verde: '#0D2536',
  agua: '#0C3049',
  viaMenor: CORES.navy2,
  viaPrincipal: CORES.linha,
  rodovia: '#2A4A68',
  predioBaixo: '#173750',
  predioAlto: '#2B5F80',
};

export const CAMADA_PREDIOS = 'predios';

export const CAMADA_RAS = 'ras-preenchimento';
export const FONTE_RAS = 'ras';

const classeEm = (...classes: string[]) => ['match', ['get', 'class'], classes, true, false] as ['match', ...unknown[]];

export interface OpcoesEstilo {
  regioes: readonly Regiao[];
  /** URL do arquivo de fonte (woff2) dos nomes das RAs. */
  urlFonteRotulo: string;
}

export function montarEstilo({ regioes, urlFonteRotulo }: OpcoesEstilo): StyleSpecification {
  const contornos: FeatureCollection = {
    type: 'FeatureCollection',
    features: regioes.map((ra) => ({
      type: 'Feature',
      geometry: ra.geometria,
      properties: { id: ra.id, nome: ra.nome, codigo: ra.codigo },
    })),
  };
  const rotulos: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: regioes.map((ra) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: ra.rotulo },
      properties: { nome: ra.nome, populacao: ra.populacao },
    })),
  };
  const sobre = ['boolean', ['feature-state', 'sobre'], false];
  const selecionada = ['boolean', ['feature-state', 'selecionada'], false];

  return {
    version: 8,
    // Sem `glyphs` nem `sprite`: o texto é desenhado no navegador com a fonte abaixo.
    'font-faces': { [FONTE_ROTULO]: urlFonteRotulo },
    sources: {
      openfreemap: { type: 'vector', url: URL_OPENFREEMAP },
      [FONTE_RAS]: {
        type: 'geojson',
        data: contornos,
        promoteId: 'id',
        attribution: 'Limites das RAs: GDF, IDE/DF',
      },
      'ras-rotulos': { type: 'geojson', data: rotulos },
    },
    layers: [
      { id: 'fundo', type: 'background', paint: { 'background-color': CORES.navy } },
      {
        id: 'verde',
        type: 'fill',
        source: 'openfreemap',
        'source-layer': 'park',
        paint: { 'fill-color': TONS.verde },
      },
      {
        id: 'agua',
        type: 'fill',
        source: 'openfreemap',
        'source-layer': 'water',
        paint: { 'fill-color': TONS.agua },
      },
      {
        id: 'vias-menores',
        type: 'line',
        source: 'openfreemap',
        'source-layer': 'transportation',
        minzoom: 11,
        filter: classeEm('minor', 'service'),
        paint: { 'line-color': TONS.viaMenor, 'line-width': ['interpolate', ['linear'], ['zoom'], 11, 0.4, 16, 3] },
      },
      {
        id: 'vias-principais',
        type: 'line',
        source: 'openfreemap',
        'source-layer': 'transportation',
        filter: classeEm('primary', 'secondary', 'tertiary', 'trunk'),
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': TONS.viaPrincipal, 'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.5, 12, 1.4, 16, 6] },
      },
      {
        id: 'rodovias',
        type: 'line',
        source: 'openfreemap',
        'source-layer': 'transportation',
        filter: classeEm('motorway'),
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': TONS.rodovia, 'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.8, 12, 2, 16, 8] },
      },
      {
        id: CAMADA_RAS,
        type: 'fill',
        source: FONTE_RAS,
        paint: { 'fill-color': CORES.tealClaro, 'fill-opacity': ['case', sobre, 0.18, 0.06] },
      },
      {
        id: 'ras-contorno',
        type: 'line',
        source: FONTE_RAS,
        layout: { 'line-join': 'round' },
        paint: {
          'line-color': ['case', selecionada, '#FFFFFF', CORES.tealClaro],
          'line-opacity': ['case', ['any', sobre, selecionada], 1, 0.55],
          'line-width': ['case', selecionada, 2.8, sobre, 2.2, 1],
        },
      },
      {
        // Depois das RAs, para o tom das regiões não pintar os prédios por cima.
        id: CAMADA_PREDIOS,
        type: 'fill-extrusion',
        source: 'openfreemap',
        'source-layer': 'building',
        minzoom: 13,
        paint: {
          'fill-extrusion-color': ['interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 6], 0, TONS.predioBaixo, 60, TONS.predioAlto],
          'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 13, 0, 14, ['coalesce', ['get', 'render_height'], 6]],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
          'fill-extrusion-opacity': 0.88,
        },
      },
      {
        id: 'ras-rotulos',
        type: 'symbol',
        source: 'ras-rotulos',
        layout: {
          'text-field': ['get', 'nome'],
          'text-font': [FONTE_ROTULO],
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.08,
          'text-size': ['interpolate', ['linear'], ['zoom'], 8, 10.5, 11, 14, 14, 18],
          'text-max-width': 7,
          'text-padding': 4,
          // As RAs mais populosas ganham a disputa por espaço.
          'symbol-sort-key': ['-', ['get', 'populacao']],
        },
        paint: { 'text-color': CORES.rotulo, 'text-halo-color': CORES.navy, 'text-halo-width': 1.6 },
      },
    ],
  } as StyleSpecification;
}

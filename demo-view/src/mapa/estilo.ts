/**
 * Estilo do mapa, montado no código. De baixo para cima:
 *
 * - fundo grafite (o que sobra sem rede);
 * - imagem de satélite: o Sentinel-2 na vista do DF e, de perto, a imagem de
 *   2021 do GDF, com 50 cm (ver `ortofoto.ts`), as duas escurecidas;
 * - água do OpenFreeMap;
 * - o mapa de calor dos chamados (`calor.ts`), preso ao chão;
 * - vias em traço fino, por cima do calor, para a rua continuar legível;
 * - limites das RAs, prédios em 3D (zoom 13 em diante), nomes das vias de perto
 *   e nomes das RAs.
 *
 * Só as imagens e o desenho da cidade dependem da rede. O fundo, os contornos,
 * os nomes das RAs e o calor são locais: sem internet, o mapa abre igual, só
 * sem a imagem, a água e as vias.
 */
import type { FeatureCollection, Point } from 'geojson';
import type { StyleSpecification } from 'maplibre-gl';
import { LIMITES_DF, type Regiao } from '../dominio/ras';
import { CORES } from '../ui/tokens';
import { CAMADA_CALOR, corDoCalor, FONTE_CALOR, opacidadePorZoom, raioPorZoom } from './calor';
import { CREDITO_ORTOFOTO, LADO, URL_ORTOFOTO, ZOOM_MAXIMO_DA_ORTOFOTO } from './ortofoto';

/** Mapa de ruas gratuito e sem chave (dados do OpenStreetMap, esquema OpenMapTiles). */
export const URL_OPENFREEMAP = 'https://tiles.openfreemap.org/planet';

/**
 * Imagem de satélite gratuita e sem chave: o mosaico Sentinel-2 sem nuvens de
 * 2016, da EOX, sob CC BY 4.0 (os mosaicos de 2017 em diante não permitem uso
 * comercial). Resolução de 10 m: serve à vista do DF e das RAs, não à da rua.
 */
export const URL_SATELITE = 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/{z}/{y}/{x}.jpg';
const CREDITO_SATELITE =
  '<a href="https://s2maps.eu" target="_blank" rel="noopener">Sentinel-2 cloudless</a> por <a href="https://eox.at" target="_blank" rel="noopener">EOX</a> (contém dados Copernicus Sentinel modificados, 2016)';

/** Nome da fonte dos rótulos dentro do estilo. O arquivo vem em `font-faces`. */
const FONTE_ROTULO = 'Barlow Condensed SemiBold';

/** O desenho da cidade sobre a imagem: neutro, para a cor ficar com os dados. */
const TONS = {
  agua: '#080B0E',
  via: '#FFFFFF',
  limite: '#FFFFFF',
  predioBaixo: '#2B2F34',
  predioAlto: '#555C64',
};

export const CAMADA_PREDIOS = 'predios';
export const CAMADA_SATELITE = 'satelite';
export const CAMADA_ORTOFOTO = 'ortofoto';

export const CAMADA_RAS = 'ras-preenchimento';
export const FONTE_RAS = 'ras';

/**
 * A partir de que zoom a imagem de perto começa a aparecer, e quando está
 * inteira. Antes disso a tela mostra o DF e o entorno juntos, e duas imagens
 * diferentes lado a lado deixariam um retângulo marcado no mapa.
 */
const ORTOFOTO_DESDE = 12;
const ORTOFOTO_INTEIRA = 13;

const classeEm = (...classes: string[]) => ['match', ['get', 'class'], classes, true, false] as ['match', ...unknown[]];

export interface OpcoesEstilo {
  regioes: readonly Regiao[];
  /** A caixa do DF: [[oeste, sul], [leste, norte]]. Padrão: `LIMITES_DF`. */
  limites?: [[number, number], [number, number]];
  /** URL do arquivo de fonte (woff2) dos nomes das RAs. */
  urlFonteRotulo: string;
}

export function montarEstilo({ regioes, urlFonteRotulo, limites = LIMITES_DF }: OpcoesEstilo): StyleSpecification {
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
  const comZoom = (...paradas: number[]) => ['interpolate', ['linear'], ['zoom'], ...paradas];

  return {
    version: 8,
    // Sem `glyphs` nem `sprite`: o texto é desenhado no navegador com a fonte abaixo.
    // Com a câmera bem inclinada aparece o horizonte: um céu grafite, com uma névoa
    // mais clara rente ao chão, no lugar de uma faixa preta de borda dura.
    sky: {
      'sky-color': CORES.base,
      'horizon-color': '#2A2F35',
      'fog-color': '#1B1F23',
      'sky-horizon-blend': 0.7,
      'horizon-fog-blend': 0.6,
      'fog-ground-blend': 0.75,
      'atmosphere-blend': 0,
    },
    'font-faces': { [FONTE_ROTULO]: urlFonteRotulo },
    sources: {
      satelite: { type: 'raster', tiles: [URL_SATELITE], tileSize: 256, maxzoom: 14, attribution: CREDITO_SATELITE },
      // `bounds`: fora do DF o serviço não tem imagem; o MapLibre nem pede.
      ortofoto: { type: 'raster', tiles: [URL_ORTOFOTO], tileSize: LADO, minzoom: ORTOFOTO_DESDE, maxzoom: ZOOM_MAXIMO_DA_ORTOFOTO, bounds: limites.flat() as [number, number, number, number], attribution: CREDITO_ORTOFOTO },
      openfreemap: { type: 'vector', url: URL_OPENFREEMAP },
      // Blocos até o zoom 12 e depois ampliados: de perto, o núcleo do calor é
      // largo e precisa das células vizinhas, que um bloco pequeno deixaria de fora.
      [FONTE_CALOR]: { type: 'geojson', data: { type: 'FeatureCollection', features: [] }, maxzoom: 12, buffer: 128, tolerance: 0 },
      [FONTE_RAS]: {
        type: 'geojson',
        data: contornos,
        promoteId: 'id',
        attribution: 'Limites das RAs: GDF, IDE/DF',
      },
      'ras-rotulos': { type: 'geojson', data: rotulos },
    },
    layers: [
      { id: 'fundo', type: 'background', paint: { 'background-color': CORES.base } },
      {
        // Escura, quase sem cor e com pouco contraste: o território aparece, mas quem
        // fala são os dados. De longe, a textura do cerrado e das lavouras vira ruído;
        // por isso a imagem fica mais apagada na vista do DF.
        id: CAMADA_SATELITE,
        type: 'raster',
        source: 'satelite',
        paint: {
          'raster-saturation': -0.55,
          'raster-contrast': -0.1,
          'raster-opacity': comZoom(9, 0.8, 12.5, 0.95),
          'raster-brightness-max': comZoom(10.5, 0.6, 12.5, 0.66),
          'raster-fade-duration': 250,
        },
      },
      {
        // De perto, a imagem de 50 cm entra por cima do Sentinel e clareia aos
        // poucos: na escala da rua, o território precisa parecer o que é.
        id: CAMADA_ORTOFOTO,
        type: 'raster',
        source: 'ortofoto',
        minzoom: ORTOFOTO_DESDE,
        paint: {
          'raster-opacity': comZoom(ORTOFOTO_DESDE, 0, ORTOFOTO_INTEIRA, 1),
          'raster-saturation': comZoom(12, -0.55, 16, -0.2),
          'raster-brightness-max': comZoom(12, 0.62, 16, 0.86),
          'raster-contrast': comZoom(12, -0.08, 16, 0.08),
          'raster-fade-duration': 250,
        },
      },
      {
        id: 'agua',
        type: 'fill',
        source: 'openfreemap',
        'source-layer': 'water',
        paint: { 'fill-color': TONS.agua, 'fill-opacity': comZoom(11, 0.72, 14, 0.3) },
      },
      {
        // Apagada até o `Mapa.tsx` mandar os chamados e a intensidade da seleção.
        id: CAMADA_CALOR,
        type: 'heatmap',
        source: FONTE_CALOR,
        layout: { visibility: 'none' },
        paint: {
          'heatmap-weight': ['get', 'n'],
          'heatmap-radius': raioPorZoom(),
          'heatmap-intensity': 0,
          'heatmap-color': corDoCalor(),
          // De perto, o calor cede para a rua aparecer por baixo, até sumir.
          'heatmap-opacity': opacidadePorZoom(),
        },
      },
      {
        id: 'vias-menores',
        type: 'line',
        source: 'openfreemap',
        'source-layer': 'transportation',
        minzoom: 11,
        filter: classeEm('minor', 'service'),
        paint: { 'line-color': TONS.via, 'line-opacity': comZoom(11, 0.08, 15, 0.16), 'line-width': comZoom(11, 0.4, 16, 2.2) },
      },
      {
        id: 'vias-principais',
        type: 'line',
        source: 'openfreemap',
        'source-layer': 'transportation',
        filter: classeEm('primary', 'secondary', 'tertiary', 'trunk'),
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': TONS.via, 'line-opacity': comZoom(9, 0.16, 15, 0.24), 'line-width': comZoom(8, 0.4, 12, 1.1, 16, 4) },
      },
      {
        id: 'rodovias',
        type: 'line',
        source: 'openfreemap',
        'source-layer': 'transportation',
        filter: classeEm('motorway'),
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': TONS.via, 'line-opacity': comZoom(9, 0.26, 15, 0.32), 'line-width': comZoom(8, 0.6, 12, 1.5, 16, 5.5) },
      },
      {
        id: CAMADA_RAS,
        type: 'fill',
        source: FONTE_RAS,
        paint: { 'fill-color': TONS.limite, 'fill-opacity': ['case', sobre, 0.1, 0.02] },
      },
      {
        // Base escura sob o limite: a linha clara se lê sobre qualquer textura da imagem.
        id: 'ras-contorno-base',
        type: 'line',
        source: FONTE_RAS,
        layout: { 'line-join': 'round' },
        paint: { 'line-color': CORES.base, 'line-opacity': 0.55, 'line-width': ['case', selecionada, 5, 3] },
      },
      {
        id: 'ras-contorno',
        type: 'line',
        source: FONTE_RAS,
        layout: { 'line-join': 'round' },
        paint: {
          'line-color': TONS.limite,
          'line-opacity': ['case', selecionada, 1, sobre, 0.9, 0.6],
          'line-width': ['case', selecionada, 2.4, sobre, 1.6, 1],
        },
      },
      {
        // Depois das RAs, para o tom das regiões não pintar os prédios por cima.
        // Opaco: translúcido, o MapLibre desenha cada prédio duas vezes.
        id: CAMADA_PREDIOS,
        type: 'fill-extrusion',
        source: 'openfreemap',
        'source-layer': 'building',
        minzoom: 13,
        paint: {
          'fill-extrusion-color': ['interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 6], 0, TONS.predioBaixo, 60, TONS.predioAlto],
          'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 13, 0, 14, ['coalesce', ['get', 'render_height'], 6]],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
          'fill-extrusion-opacity': 1,
        },
      },
      {
        // Nomes das vias, só de perto: é o que falta à imagem para virar mapa.
        id: 'vias-nomes',
        type: 'symbol',
        source: 'openfreemap',
        'source-layer': 'transportation_name',
        minzoom: 14,
        filter: classeEm('motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor'),
        layout: {
          'symbol-placement': 'line',
          'symbol-spacing': 340,
          'text-field': ['get', 'name'],
          'text-font': [FONTE_ROTULO],
          'text-size': comZoom(14, 11.5, 17, 14),
          'text-letter-spacing': 0.04,
          'text-max-angle': 30,
        },
        paint: { 'text-color': '#E3E6E9', 'text-halo-color': CORES.base, 'text-halo-width': 1.6 },
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
          'text-size': ['interpolate', ['linear'], ['zoom'], 8, 11.5, 11, 15, 14, 19],
          'text-max-width': 7,
          'text-padding': 4,
          // As RAs mais populosas ganham a disputa por espaço.
          'symbol-sort-key': ['-', ['get', 'populacao']],
        },
        paint: { 'text-color': '#F4F5F6', 'text-halo-color': CORES.base, 'text-halo-width': 2, 'text-halo-blur': 0.5 },
      },
    ],
  } as StyleSpecification;
}

/**
 * O mesmo estilo, sem imagem de satélite, sem prédios e sem nomes de vias: fundo
 * grafite, água, vias e as RAs. Para as telas em que os dados são a única coisa
 * com cor (a inteligência, I3). Não pede imagem a servidor nenhum.
 */
export function semImagens(estilo: StyleSpecification): StyleSpecification {
  const fora = new Set<string>([CAMADA_SATELITE, CAMADA_ORTOFOTO, CAMADA_PREDIOS, 'vias-nomes']);
  const { [CAMADA_SATELITE]: _s, [CAMADA_ORTOFOTO]: _o, ...fontes } = estilo.sources;
  return { ...estilo, sources: fontes, layers: estilo.layers.filter((c) => !fora.has(c.id) && !('source' in c && (c.source === CAMADA_SATELITE || c.source === CAMADA_ORTOFOTO))) };
}

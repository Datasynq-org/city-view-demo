import { describe, expect, it } from 'vitest';
import { REGIOES } from '../dominio/ras';
import { CAMADA_CALOR, FONTE_CALOR } from './calor';
import { CAMADA_ORTOFOTO, CAMADA_PREDIOS, CAMADA_RAS, CAMADA_SATELITE, FONTE_RAS, montarEstilo, semImagens, URL_OPENFREEMAP, URL_SATELITE } from './estilo';
import { URL_ORTOFOTO } from './ortofoto';

const estilo = montarEstilo({ regioes: REGIOES, urlFonteRotulo: '/fontes/rotulo.woff2' });
const camadas = estilo.layers;

describe('estilo do mapa', () => {
  it('começa pelo fundo grafite, que é o que sobra sem rede', () => {
    expect(camadas[0]).toMatchObject({ type: 'background', paint: { 'background-color': '#0C0E10' } });
  });

  it('põe a imagem de satélite logo acima do fundo, escurecida', () => {
    const satelite = camadas[1] as { id: string; type: string; paint: Record<string, number> };
    expect(satelite).toMatchObject({ id: CAMADA_SATELITE, type: 'raster' });
    expect(JSON.stringify(satelite.paint['raster-brightness-max'])).toContain('"zoom"');
    expect(satelite.paint['raster-saturation']).toBeLessThan(0);
    // contraste baixo: a textura não disputa com os limites e os dados
    expect(satelite.paint['raster-contrast']).toBeLessThanOrEqual(0);
  });

  it('tem céu grafite para quando a câmera inclina até o horizonte', () => {
    expect((estilo as { sky?: Record<string, unknown> }).sky?.['sky-color']).toBe('#0C0E10');
  });

  it('não depende de glifos nem de sprite remotos', () => {
    expect(estilo.glyphs).toBeUndefined();
    expect(estilo.sprite).toBeUndefined();
  });

  it('só busca na rede as imagens (EOX e IDE/DF) e o desenho da cidade (OpenFreeMap)', () => {
    const fontes = Object.values(estilo.sources) as { url?: string; tiles?: string[]; data?: unknown }[];
    const buscadas = fontes.flatMap((f) => [f.url, ...(f.tiles ?? [])]).filter((u): u is string => typeof u === 'string');
    expect(buscadas.sort()).toEqual([URL_SATELITE, URL_OPENFREEMAP, URL_ORTOFOTO].sort());
    // Os contornos e os nomes das RAs vão dentro do estilo, não por URL.
    expect(fontes.filter((f) => typeof f.data === 'string')).toEqual([]);
  });

  it('dá o crédito da imagem de satélite, que a licença CC BY exige', () => {
    const satelite = estilo.sources['satelite'] as { attribution: string };
    expect(satelite.attribution).toContain('Sentinel-2 cloudless');
    expect(satelite.attribution).toContain('EOX');
    expect(URL_SATELITE).toContain('/s2cloudless_3857/');
  });

  it('a imagem de perto entra por cima do Sentinel, só de perto, e com crédito', () => {
    const i = camadas.findIndex((c) => c.id === CAMADA_ORTOFOTO);
    expect(i).toBe(camadas.findIndex((c) => c.id === CAMADA_SATELITE) + 1);
    const orto = camadas[i] as { type: string; minzoom: number };
    expect(orto.type).toBe('raster');
    expect(orto.minzoom).toBeGreaterThanOrEqual(12);
    // Fora do DF o serviço não tem imagem: o MapLibre nem pede.
    const fonte = estilo.sources['ortofoto'] as { bounds: number[]; minzoom: number; maxzoom: number; tileSize: number };
    expect(fonte.bounds).toHaveLength(4);
    expect(fonte.minzoom).toBe(orto.minzoom);
    expect(fonte.maxzoom).toBe(17);
    expect(fonte.tileSize).toBe(512);
    expect((estilo.sources['ortofoto'] as { attribution: string }).attribution).toMatch(/Maxar.*IDE\/DF/);
  });

  it('o calor é do MapLibre: preso ao chão, sob as vias e os limites, apagado até receber os chamados', () => {
    const i = camadas.findIndex((c) => c.id === CAMADA_CALOR);
    const calor = camadas[i] as { type: string; source: string; layout: { visibility: string }; paint: Record<string, unknown> };
    expect(calor).toMatchObject({ type: 'heatmap', source: FONTE_CALOR, layout: { visibility: 'none' } });
    expect(calor.paint['heatmap-intensity']).toBe(0);
    expect(calor.paint['heatmap-weight']).toEqual(['get', 'n']);
    expect(i).toBeGreaterThan(camadas.findIndex((c) => c.id === CAMADA_ORTOFOTO));
    expect(i).toBeLessThan(camadas.findIndex((c) => c.id === 'vias-menores'));
    expect(i).toBeLessThan(camadas.findIndex((c) => c.id === 'ras-contorno'));
    // Blocos até o zoom 12, ampliados de perto: o núcleo largo precisa das células vizinhas.
    expect((estilo.sources[FONTE_CALOR] as { maxzoom: number }).maxzoom).toBe(12);
  });

  it('os nomes das vias só aparecem de perto, abaixo dos nomes das RAs', () => {
    const i = camadas.findIndex((c) => c.id === 'vias-nomes');
    expect((camadas[i] as { minzoom: number }).minzoom).toBeGreaterThanOrEqual(14);
    expect(i).toBeLessThan(camadas.findIndex((c) => c.id === 'ras-rotulos'));
  });

  it('desenha as RAs por cima do desenho plano da cidade', () => {
    // Plano: imagens, água e vias. Prédios (3D) e nomes de vias ficam por cima das RAs.
    const daRede = camadas.flatMap((c, i) => ('source' in c && ['openfreemap', 'satelite', 'ortofoto'].includes(String(c.source)) && c.id !== CAMADA_PREDIOS && c.type !== 'symbol' ? [i] : []));
    const dasRas = camadas.flatMap((c, i) => ('source' in c && String(c.source).startsWith('ras') ? [i] : []));
    expect(daRede.length).toBeGreaterThan(0);
    // preenchimento, base escura do limite, limite e nomes
    expect(dasRas).toHaveLength(4);
    expect(Math.min(...dasRas)).toBeGreaterThan(Math.max(...daRede));
    expect(camadas.some((c) => c.id === CAMADA_RAS)).toBe(true);
  });

  it('leva as 37 RAs, identificadas pelo id, e um rótulo para cada uma', () => {
    const ras = estilo.sources[FONTE_RAS] as { data: { features: unknown[] }; promoteId: string };
    expect(ras.data.features).toHaveLength(37);
    expect(ras.promoteId).toBe('id');
    const rotulos = estilo.sources['ras-rotulos'] as { data: { features: unknown[] } };
    expect(rotulos.data.features).toHaveLength(37);
  });

  it('usa nos rótulos a fonte declarada em font-faces', () => {
    const rotulos = camadas.find((c) => c.id === 'ras-rotulos') as { layout: { 'text-font': string[] } };
    const declaradas = Object.keys(estilo['font-faces'] ?? {});
    expect(declaradas).toEqual(rotulos.layout['text-font']);
  });

  it('os prédios sobem em 3D só de perto, abaixo dos nomes das RAs', () => {
    const i = camadas.findIndex((c) => c.id === CAMADA_PREDIOS);
    const predios = camadas[i] as { type: string; source: string; minzoom: number };
    expect(predios).toMatchObject({ type: 'fill-extrusion', source: 'openfreemap', 'source-layer': 'building' });
    expect(predios.minzoom).toBeGreaterThanOrEqual(13);
    expect(i).toBeLessThan(camadas.findIndex((c) => c.id === 'ras-rotulos'));
    expect(i).toBeGreaterThan(camadas.findIndex((c) => c.id === 'ras-contorno'));
  });
});

describe('estilo sem imagens (inteligência)', () => {
  const mudo = semImagens(estilo);

  it('não tem imagem de satélite, prédios nem nomes de vias, e não pede imagem a ninguém', () => {
    expect(mudo.layers.some((c) => c.type === 'raster' || c.type === 'fill-extrusion')).toBe(false);
    expect(mudo.layers.some((c) => c.id === 'vias-nomes')).toBe(false);
    expect(Object.values(mudo.sources).some((f) => f.type === 'raster')).toBe(false);
  });

  it('mantém o fundo, as RAs e os nomes delas, e não mexe no estilo original', () => {
    expect(mudo.layers[0]).toMatchObject({ type: 'background' });
    for (const id of [CAMADA_RAS, 'ras-contorno', 'ras-rotulos']) expect(mudo.layers.some((c) => c.id === id), id).toBe(true);
    expect(estilo.layers.some((c) => c.type === 'raster')).toBe(true);
  });
});


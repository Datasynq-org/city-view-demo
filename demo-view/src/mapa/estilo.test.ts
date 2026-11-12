import { describe, expect, it } from 'vitest';
import { REGIOES } from '../dominio/ras';
import { CAMADA_RAS, FONTE_RAS, montarEstilo, URL_OPENFREEMAP } from './estilo';

const estilo = montarEstilo({ regioes: REGIOES, urlFonteRotulo: '/fontes/rotulo.woff2' });
const camadas = estilo.layers;

describe('estilo do mapa', () => {
  it('começa pelo fundo navy', () => {
    expect(camadas[0]).toMatchObject({ type: 'background', paint: { 'background-color': '#0B1E31' } });
  });

  it('não depende de glifos nem de sprite remotos', () => {
    expect(estilo.glyphs).toBeUndefined();
    expect(estilo.sprite).toBeUndefined();
  });

  it('só busca na rede o desenho da cidade, no OpenFreeMap', () => {
    const externas = JSON.stringify(estilo).match(/https?:\/\/[^"]+/g) ?? [];
    expect(externas).toEqual([URL_OPENFREEMAP]);
  });

  it('desenha as RAs por cima do desenho da cidade', () => {
    const daRede = camadas.flatMap((c, i) => ('source' in c && c.source === 'openfreemap' ? [i] : []));
    const dasRas = camadas.flatMap((c, i) => ('source' in c && String(c.source).startsWith('ras') ? [i] : []));
    expect(daRede.length).toBeGreaterThan(0);
    expect(dasRas).toHaveLength(3);
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
});

import { describe, expect, it } from 'vitest';
import { dentroDaRegiao, PESOS_SIMULADOS, POPULACAO_TOTAL, REGIAO_POR_ID, REGIOES } from './ras';

describe('regiões administrativas', () => {
  it('são 37, com ids e códigos únicos e números de 1 a 37', () => {
    expect(REGIOES).toHaveLength(37);
    expect(new Set(REGIOES.map((r) => r.id)).size).toBe(37);
    expect(new Set(REGIOES.map((r) => r.codigo)).size).toBe(37);
    expect(REGIOES.map((r) => r.numero)).toEqual(Array.from({ length: 37 }, (_, i) => i + 1));
  });

  it('somam a população do DF no Censo 2022 (magno, seção 8)', () => {
    expect(POPULACAO_TOTAL).toBe(2_817_381);
  });

  it('marcam como estimada a população das 4 RAs sem Censo', () => {
    const estimadas = REGIOES.filter((r) => r.populacaoEstimada).map((r) => r.id);
    expect(estimadas.sort()).toEqual(['26-de-setembro', 'agua-quente', 'arapoanga', 'ponte-alta']);
  });

  it('têm pesos simulados entre 0 e 1', () => {
    for (const ra of REGIOES) {
      const pesos = PESOS_SIMULADOS[ra.codigo]!;
      for (const peso of [pesos.vulnerabilidade, pesos.centralidade]) {
        expect(peso).toBeGreaterThanOrEqual(0);
        expect(peso).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe('dentroDaRegiao', () => {
  it('aceita o ponto do rótulo de cada RA, e só nela', () => {
    for (const ra of REGIOES) {
      const [lon, lat] = ra.rotulo;
      const donas = REGIOES.filter((outra) => dentroDaRegiao(outra, lon, lat)).map((outra) => outra.id);
      expect(donas, ra.nome).toEqual([ra.id]);
    }
  });

  it('respeita os buracos: Arapoanga fica fora de Planaltina e o Varjão fora do Lago Norte', () => {
    const arapoanga = REGIAO_POR_ID['arapoanga']!.rotulo;
    expect(dentroDaRegiao(REGIAO_POR_ID['planaltina']!, ...arapoanga)).toBe(false);
    const varjao = REGIAO_POR_ID['varjao']!.rotulo;
    expect(dentroDaRegiao(REGIAO_POR_ID['lago-norte']!, ...varjao)).toBe(false);
  });

  it('aceita as duas partes do Park Way', () => {
    const parkWay = REGIAO_POR_ID['park-way']!;
    expect(parkWay.geometria.type).toBe('MultiPolygon');
    const partes = parkWay.geometria.coordinates as number[][][][];
    expect(partes).toHaveLength(2);
    for (const [externo] of partes) {
      // Um ponto logo para dentro do primeiro vértice, na direção do meio da parte.
      const [x0, y0] = externo![0] as [number, number];
      const cx = externo!.reduce((s, p) => s + p[0]!, 0) / externo!.length;
      const cy = externo!.reduce((s, p) => s + p[1]!, 0) / externo!.length;
      const dentro = [0.2, 0.4, 0.6, 0.8].some((f) => dentroDaRegiao(parkWay, x0 + (cx - x0) * f, y0 + (cy - y0) * f));
      expect(dentro).toBe(true);
    }
  });

  it('recusa um ponto fora do DF', () => {
    for (const ra of REGIOES) expect(dentroDaRegiao(ra, -46.6, -23.5)).toBe(false);
  });
});

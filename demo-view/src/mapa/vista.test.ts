import { describe, expect, it } from 'vitest';
import { LIMITES_DF, REGIAO_POR_ID, REGIOES } from '../dominio/ras';
import { caixaDaRa, DURACAO_DO_VOO, DURACAO_DO_VOO_NO_TOUR, GIRO_POR_PIXEL, girar, INCLINACAO_POR_PIXEL } from './vista';

describe('caixa da RA', () => {
  it('contém a RA inteira e fica dentro do DF', () => {
    const [[oesteDf, sulDf], [lesteDf, norteDf]] = LIMITES_DF;
    for (const ra of REGIOES) {
      const [[oeste, sul], [leste, norte]] = caixaDaRa(ra);
      expect(oeste, ra.nome).toBeLessThan(leste);
      expect(sul, ra.nome).toBeLessThan(norte);
      expect(oeste).toBeGreaterThanOrEqual(oesteDf);
      expect(leste).toBeLessThanOrEqual(lesteDf);
      expect(sul).toBeGreaterThanOrEqual(sulDf);
      expect(norte).toBeLessThanOrEqual(norteDf);
      // O ponto do nome da RA está dentro da caixa.
      expect(ra.rotulo[0]).toBeGreaterThan(oeste);
      expect(ra.rotulo[0]).toBeLessThan(leste);
      expect(ra.rotulo[1]).toBeGreaterThan(sul);
      expect(ra.rotulo[1]).toBeLessThan(norte);
    }
  });

  it('encosta na RA pelos quatro lados', () => {
    const ra = REGIAO_POR_ID['ceilandia']!;
    const [[oeste, sul], [leste, norte]] = caixaDaRa(ra);
    const anel = (ra.geometria.type === 'Polygon' ? ra.geometria.coordinates : ra.geometria.coordinates[0]!)[0] as [number, number][];
    expect(Math.min(...anel.map((p) => p[0]))).toBe(oeste);
    expect(Math.max(...anel.map((p) => p[0]))).toBe(leste);
    expect(Math.min(...anel.map((p) => p[1]))).toBe(sul);
    expect(Math.max(...anel.map((p) => p[1]))).toBe(norte);
  });

  it('junta as duas partes do Park Way', () => {
    const ra = REGIAO_POR_ID['park-way']!;
    const partes = (ra.geometria.coordinates as number[][][][]).map(([externo]) => externo as [number, number][]);
    expect(partes).toHaveLength(2);
    const caixaDe = (pontos: [number, number][]) => [
      [Math.min(...pontos.map((p) => p[0])), Math.min(...pontos.map((p) => p[1]))],
      [Math.max(...pontos.map((p) => p[0])), Math.max(...pontos.map((p) => p[1]))],
    ];
    expect(caixaDaRa(ra)).toEqual(caixaDe(partes.flat()));
    // Nenhuma das partes, sozinha, dá a caixa inteira.
    for (const parte of partes) expect(caixaDe(parte)).not.toEqual(caixaDaRa(ra));
  });
});

describe('modo girar', () => {
  const inicio = { rotacao: -14, inclinacao: 52 };

  it('arrastar para os lados gira; para cima inclina mais, para baixo deita a câmera', () => {
    expect(girar(inicio, 100, 0, 70)).toEqual({ rotacao: -14 + 100 * GIRO_POR_PIXEL, inclinacao: 52 });
    expect(girar(inicio, -100, 0, 70).rotacao).toBe(-14 - 100 * GIRO_POR_PIXEL);
    expect(girar(inicio, 0, -20, 70).inclinacao).toBe(52 + 20 * INCLINACAO_POR_PIXEL);
    expect(girar(inicio, 0, 20, 70).inclinacao).toBe(52 - 20 * INCLINACAO_POR_PIXEL);
  });

  it('a inclinação para no chão e no limite da câmera', () => {
    expect(girar(inicio, 0, -5000, 70).inclinacao).toBe(70);
    expect(girar(inicio, 0, 5000, 70).inclinacao).toBe(0);
  });

  it('sem arrastar, nada muda; e a volta desfaz a ida', () => {
    expect(girar(inicio, 0, 0, 70)).toEqual(inicio);
    const ida = girar(inicio, 37, -12, 70);
    expect(girar(ida, -37, 12, 70).rotacao).toBeCloseTo(inicio.rotacao, 9);
    expect(girar(ida, -37, 12, 70).inclinacao).toBeCloseTo(inicio.inclinacao, 9);
  });

  it('meia tela de arrasto dá uma volta completa: gesto curto gira pouco, gesto longo dá a volta', () => {
    expect(800 * GIRO_POR_PIXEL).toBe(360);
  });
});

describe('voos', () => {
  it('o voo comum é rápido; o do tour, de apresentação', () => {
    expect(DURACAO_DO_VOO).toBeLessThanOrEqual(1800);
    expect(DURACAO_DO_VOO_NO_TOUR).toBeGreaterThan(DURACAO_DO_VOO);
  });
});

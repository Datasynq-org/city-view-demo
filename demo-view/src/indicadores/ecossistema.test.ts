import { describe, expect, it } from 'vitest';
import { cidade } from '../dados/cidade';
import { ORGAO_POR_ID } from '../dominio/orgaos';
import { REGIOES } from '../dominio/ras';
import { DOMINIOS, faixaDoIndice, indiceDasPartes, indiceDoDominio, LIMITE_DA_ATENCAO, LIMITE_DO_BOM, MINIMO_DE_CHAMADOS, PESOS, serieDoDominio } from './ecossistema';

const { chegados, inicio } = cidade();

describe('analytics do ecossistema', () => {
  it('os quatro domínios apontam para órgãos que existem', () => {
    expect(DOMINIOS.map((d) => d.id)).toEqual(['energia', 'iluminacao', 'saneamento', 'seguranca']);
    for (const d of DOMINIOS) expect(ORGAO_POR_ID[d.orgaoId], d.id).toBeDefined();
  });

  it('os pesos somam 1; o índice vai de 0 a 100', () => {
    expect(PESOS.pressao + PESOS.prazo + PESOS.fila).toBeCloseTo(1);
    expect(indiceDasPartes({ pressao: 1, prazo: 1, fila: 1 })).toBe(100);
    expect(indiceDasPartes({ pressao: 0, prazo: 0, fila: 0 })).toBe(0);
    expect(indiceDasPartes({ pressao: 0.5, prazo: 0.8, fila: 0.9 })).toBe(70);
  });

  it('as faixas seguem os limites declarados', () => {
    expect(faixaDoIndice(LIMITE_DO_BOM)).toBe('bom');
    expect(faixaDoIndice(LIMITE_DO_BOM - 1)).toBe('atencao');
    expect(faixaDoIndice(LIMITE_DA_ATENCAO - 1)).toBe('critico');
  });

  for (const d of DOMINIOS) {
    it(`${d.id}: toda região tem linha; quem tem chamados de menos fica sem índice`, () => {
      const r = indiceDoDominio(chegados, inicio, d.id);
      expect(r.regioes).toHaveLength(REGIOES.length);
      for (const ra of r.regioes) {
        if (ra.indice === null) continue;
        expect(ra.chamados).toBeGreaterThanOrEqual(MINIMO_DE_CHAMADOS);
        expect(ra.indice).toBeGreaterThanOrEqual(0);
        expect(ra.indice).toBeLessThanOrEqual(100);
        expect(ra.indice).toBe(indiceDasPartes(ra.partes!));
      }
      expect(r.piores.length).toBeGreaterThan(3);
      expect(r.piores.map((x) => x.indice)).toEqual([...r.piores.map((x) => x.indice!)].sort((a, b) => a - b));
      expect(r.df).toBeGreaterThan(0);
      expect(r.df).toBeLessThanOrEqual(100);
      expect(r.chamados).toBe(r.regioes.reduce((s, x) => s + x.chamados, 0));
    });
  }

  it('a região mais pressionada tem a parte de pressão em zero; a menos, em um', () => {
    const r = indiceDoDominio(chegados, inicio, 'energia');
    const com = r.regioes.filter((x) => x.partes);
    const maisPressionada = [...com].sort((a, b) => b.por10mil - a.por10mil)[0]!;
    const menos = [...com].sort((a, b) => a.por10mil - b.por10mil)[0]!;
    expect(maisPressionada.partes!.pressao).toBe(0);
    expect(menos.partes!.pressao).toBe(1);
  });

  it('a série diária soma os chamados do período', () => {
    const s = serieDoDominio(chegados, inicio, 'saneamento', 28);
    expect(s).toHaveLength(28);
    expect(s.reduce((a, b) => a + b, 0)).toBe(chegados.filter((i) => i.orgaoId === 'caesb' && i.criadoEm > inicio - 28 * 86_400_000 && i.criadoEm <= inicio).length);
  });

  it('sem chamados, não quebra e não inventa índice', () => {
    const r = indiceDoDominio([], inicio, 'seguranca');
    expect(r.df).toBeNull();
    expect(r.piores).toEqual([]);
  });
});

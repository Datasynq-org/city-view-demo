import { describe, expect, it } from 'vitest';
import { gerarBase } from '../dados/gerador';
import { REGIAO_POR_ID, REGIOES } from '../dominio/ras';
import { classe, composicao, perfis, quebras, ranking } from './regioes';

const base = gerarBase({ agora: Date.UTC(2026, 10, 12, 18, 30), dias: 28, diasDetalhados: 7 });
const { regioes, df } = perfis(base.incidentes);

describe('perfil das regiões', () => {
  it('traz as 37 RAs, e os chamados somam o DF', () => {
    expect(regioes.map((p) => p.ra)).toEqual(REGIOES.map((r) => r.id));
    expect(regioes.reduce((s, p) => s + p.chamados, 0)).toBe(df.chamados);
    expect(df.chamados).toBe(base.incidentes.length);
    expect(regioes.reduce((s, p) => s + p.abertos, 0)).toBe(df.abertos);
  });

  it('a taxa por 10 mil usa a população da RA', () => {
    const p = regioes.find((x) => x.ra === 'ceilandia')!;
    expect(p.por10mil).toBeCloseTo((p.chamados / REGIAO_POR_ID.ceilandia!.populacao) * 10_000);
  });

  it('o ranking vai do maior ao menor; no prazo, do pior ao melhor', () => {
    const r = ranking(regioes, 'por10mil');
    expect(r).toHaveLength(37);
    for (let k = 1; k < r.length; k++) expect(r[k - 1]!.por10mil).toBeGreaterThanOrEqual(r[k]!.por10mil);
    const prazo = ranking(regioes, 'noPrazo').filter((p) => p.noPrazo !== null);
    for (let k = 1; k < prazo.length; k++) expect(prazo[k - 1]!.noPrazo!).toBeLessThanOrEqual(prazo[k]!.noPrazo!);
  });

  it('quem não tem dado vai para o fim do ranking', () => {
    const r = ranking([{ ra: 'a', chamados: 0, por10mil: 0, abertos: 0, tempo: null, noPrazo: null }, { ra: 'b', chamados: 3, por10mil: 1, abertos: 0, tempo: 5, noPrazo: 1 }], 'tempo');
    expect(r.map((p) => p.ra)).toEqual(['b', 'a']);
  });

  it('a composição por área soma 100%', () => {
    const c = composicao(base.incidentes);
    expect(c.reduce((s, x) => s + x.parte, 0)).toBeCloseTo(1);
    expect(c[0]!.chamados).toBeGreaterThanOrEqual(c.at(-1)!.chamados);
    expect(composicao([])).toHaveLength(6);
  });

  it('as quebras por quantis dividem em grupos parecidos', () => {
    const valores = regioes.map((p) => p.por10mil);
    const limites = quebras(valores, 5);
    expect(limites).toHaveLength(4);
    const grupos = [0, 0, 0, 0, 0];
    for (const v of valores) grupos[classe(v, limites)]!++;
    expect(Math.min(...grupos)).toBeGreaterThanOrEqual(5);
    expect(classe(-1, limites)).toBe(0);
    expect(classe(1e9, limites)).toBe(4);
  });
});

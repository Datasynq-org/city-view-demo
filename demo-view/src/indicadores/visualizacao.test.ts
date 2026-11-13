import { describe, expect, it } from 'vitest';
import { cidade } from '../dados/cidade';
import type { Incidente } from '../dominio/incidente';
import { naturezaDoOrgao, ORGAOS } from '../dominio/orgaos';
import { type Comparacao, leituraEmFrase } from './gestao';
import { agruparChegadas, chegandoAgora, quantil, tempoAteResolver, tempoNoQuantil } from './indicadores';
import { contraAMeta, META_NO_PRAZO, pontosDaMeta } from './metas';
import { ALTA_MINIMA, foraDoNormal, MINIMO_PARA_COMPARAR } from './regioes';

const c = (noPrazo: number | null, tempo: number | null): Comparacao => ({ atual: { chamados: 1, tempo: 4, noPrazo: 0.77 }, anterior: { chamados: 1, tempo: 4, noPrazo: 0.77 }, tempo, noPrazo, leitura: 'estável' });

describe('a frase da velocidade da gestão diz as duas medidas', () => {
  it('quando andam em sentidos diferentes, usa "mas"', () => {
    expect(leituraEmFrase(c(0.6, 0.102))).toBe('A gestão cumpre o prazo como no período anterior, mas leva 10% mais tempo para resolver.');
    expect(leituraEmFrase(c(2, 0.1))).toMatch(/resolve mais dentro do prazo \(2 pontos a mais\), mas leva 10% mais tempo/);
  });
  it('quando andam juntas, usa "e"', () => {
    expect(leituraEmFrase(c(3, -0.08))).toMatch(/resolve mais dentro do prazo .* e leva 8% menos tempo/);
    expect(leituraEmFrase(c(-2.5, 0.2))).toMatch(/resolve menos dentro do prazo .* e leva 20% mais tempo/);
    expect(leituraEmFrase(c(0.2, 0.01))).toBe('A gestão cumpre o prazo como no período anterior e leva o mesmo tempo para resolver.');
  });
  it('sem período anterior, diz isso', () => {
    expect(leituraEmFrase(c(null, null))).toMatch(/não há período anterior/);
  });
});

describe('quantil do tempo até resolver', () => {
  it('interpola entre os vizinhos', () => {
    expect(quantil(new Float64Array([4, 1, 3, 2, 5]), 0.5)).toBe(3);
    expect(quantil(new Float64Array([1, 2, 3, 4, 5]), 0.9)).toBeCloseTo(4.6);
    expect(quantil(new Float64Array([]), 0.9)).toBeNull();
  });
  it('na cidade simulada, 9 em cada 10 demoram mais que a metade; e a metade é a mediana', () => {
    const { chegados } = cidade();
    const metade = tempoNoQuantil(chegados, 0.5)!;
    expect(metade).toBeCloseTo(tempoAteResolver(chegados)!, 5);
    expect(tempoNoQuantil(chegados, 0.9)!).toBeGreaterThan(metade);
  });
});

describe('metas de exemplo', () => {
  it('diz a distância até a meta em pontos', () => {
    expect(pontosDaMeta(0.77)).toBe(-3);
    expect(contraAMeta(0.77)).toBe(`3 pontos abaixo da meta de ${Math.round(META_NO_PRAZO * 100)}%`);
    expect(contraAMeta(0.81)).toMatch(/1 ponto acima/);
    expect(contraAMeta(0.8)).toMatch(/^na meta/);
    expect(contraAMeta(null)).toMatch(/sem dado/);
  });
});

describe('chegadas agrupadas', () => {
  const i = (id: string, tipoId: string, raId: string): Incidente => ({ id, tipoId, area: 'energia', local: { raId } } as unknown as Incidente);
  it('junta só os seguidos do mesmo tipo, e a chave é o mais antigo do grupo', () => {
    const g = agruparChegadas([i('5', 'a', 'x'), i('4', 'a', 'y'), i('3', 'a', 'x'), i('2', 'b', 'x'), i('1', 'a', 'x')]);
    expect(g.map((x) => [x.tipoId, x.chamados])).toEqual([['a', 3], ['b', 1], ['a', 1]]);
    expect(g[0]!.id).toBe('3');
    expect(g[0]!.ras).toEqual(['x', 'y']);
    expect(g[0]!.maisRecente.id).toBe('5');
  });
  it('na cidade simulada, nunca perde chamado', () => {
    const recentes = chegandoAgora(cidade().chegados, 24);
    expect(agruparChegadas(recentes).reduce((s, g) => s + g.chamados, 0)).toBe(recentes.length);
  });
});

describe('fora do normal: cada região contra ela mesma', () => {
  const { chegados, inicio } = cidade();
  const f = foraDoNormal(chegados, inicio);
  it('toda região tem conta; a razão é atual sobre a média das semanas anteriores', () => {
    for (const v of f.values()) {
      if (v.razao === null) expect(v.esperado).toBeLessThan(MINIMO_PARA_COMPARAR);
      else expect(v.razao).toBeCloseTo(v.atual / v.esperado);
    }
    expect([...f.values()].some((v) => v.razao !== null)).toBe(true);
  });
  it('o que mudou no DF inteiro é descontado: o esperado soma o que chegou', () => {
    const atual = [...f.values()].reduce((s, v) => s + v.atual, 0);
    expect([...f.values()].reduce((s, v) => s + v.esperado, 0)).toBeCloseTo(atual, 3);
  });
  it('só conta como fora do normal a alta que passa do mínimo e do acaso; são poucas regiões', () => {
    const fora = [...f.values()].filter((v) => v.fora);
    for (const v of fora) {
      expect(v.razao!).toBeGreaterThanOrEqual(ALTA_MINIMA);
      expect(v.atual - v.esperado).toBeGreaterThanOrEqual(2 * Math.sqrt(v.esperado));
    }
    expect(fora.length).toBeLessThan(f.size / 3);
  });
  it('o filtro de área só conta a área', () => {
    const e = foraDoNormal(chegados, inicio, 'energia');
    expect([...e.values()].reduce((s, v) => s + v.atual, 0)).toBeLessThan([...f.values()].reduce((s, v) => s + v.atual, 0));
  });
});

describe('natureza dos órgãos', () => {
  it('a concessionária e a segurança são marcadas; o resto é governo', () => {
    expect(naturezaDoOrgao('neoenergia')).toBe('concessionária');
    expect(naturezaDoOrgao('pmdf')).toBe('segurança');
    expect(ORGAOS.filter((o) => naturezaDoOrgao(o.id) === 'governo').length).toBe(ORGAOS.length - 2);
  });
});

import { describe, expect, it } from 'vitest';
import { gerarBase } from '../dados/gerador';
import { SITUACOES } from '../dominio/incidente';
import { estadoPublico, estadosDoGrau, GRAUS, parteResolvida, porRegiao, publicos, total } from './transparencia';

const base = gerarBase({ agora: Date.UTC(2026, 10, 12, 18, 30), dias: 28, diasDetalhados: 7 });

describe('mapa público', () => {
  it('são três graus, cada um liberando mais que o anterior', () => {
    expect(GRAUS.map((g) => g.id)).toEqual(['resolvidos', 'em-resolucao', 'tudo']);
    expect(estadosDoGrau('resolvidos')).toEqual(['resolvido']);
    const n = GRAUS.map((g) => publicos(base.incidentes, g.id).length);
    expect(n[0]!).toBeGreaterThan(0);
    expect(n[1]!).toBeGreaterThan(n[0]!);
    expect(n[2]!).toBeGreaterThan(n[1]!);
  });

  it('segurança pública nunca entra, em nenhum grau', () => {
    for (const g of GRAUS) expect(publicos(base.incidentes, g.id).some((p) => p.incidente.area === 'seguranca')).toBe(false);
    expect(base.incidentes.some((i) => i.area === 'seguranca')).toBe(true);
  });

  it('no grau "só o resolvido", nada em aberto ou em resolução aparece', () => {
    expect(publicos(base.incidentes, 'resolvidos').every((p) => p.estado === 'resolvido')).toBe(true);
    const { df } = porRegiao(base.incidentes, 'resolvidos');
    expect(df).toMatchObject({ 'em-resolucao': 0, aberto: 0 });
    expect(parteResolvida(df)).toBe(1);
  });

  it('toda situação tem leitura pública, menos o cancelado', () => {
    for (const s of SITUACOES) expect(estadoPublico(s) === null, s).toBe(s === 'cancelado');
    expect(estadoPublico('encerrado')).toBe('resolvido');
    expect(estadoPublico('reaberto')).toBe('em-resolucao');
  });

  it('as regiões somam o DF, e o resolvido é o mesmo em todos os graus', () => {
    const tudo = porRegiao(base.incidentes, 'tudo');
    expect([...tudo.regioes.values()].reduce((s, c) => s + total(c), 0)).toBe(total(tudo.df));
    expect(tudo.regioes.size).toBe(37);
    expect(porRegiao(base.incidentes, 'resolvidos').df.resolvido).toBe(tudo.df.resolvido);
    expect(parteResolvida(tudo.df)!).toBeLessThan(1);
    expect(parteResolvida({ resolvido: 0, 'em-resolucao': 0, aberto: 0 })).toBeNull();
  });
});

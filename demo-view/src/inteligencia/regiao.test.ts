import { describe, expect, it } from 'vitest';
import { limiarDaSensibilidade, SENSIBILIDADE_PADRAO } from './agrupamento';
import { agruparJuntos, chamadosJuntos, ligacoesJuntas } from './juntos';
import { resumoDaRegiao } from './regiao';

const t = chamadosJuntos();
const r = agruparJuntos(t, ligacoesJuntas(t), limiarDaSensibilidade(SENSIBILIDADE_PADRAO));
const de = (ra: string) => resumoDaRegiao(ra, t.chamados, r, t.simulados)!;

describe('o que a inteligência sabe de uma região', () => {
  it('região que não existe não tem resumo', () => {
    expect(resumoDaRegiao('atlantida', t.chamados, r, t.simulados)).toBeNull();
  });

  it('Águas Claras: quase todos os chamados são relatos reais, e há relatos abertos e finalizados', () => {
    const a = de('aguas-claras');
    expect(a.nome).toBe('Águas Claras');
    expect(a.reais).toBeGreaterThan(500);
    expect(a.reais).toBeLessThanOrEqual(a.chamados);
    expect(a.relatos!.abertos + a.relatos!.finalizados).toBe(a.reais);
    expect(a.incidentesReais).toBeGreaterThan(5);
    expect(a.incidentes).toBeGreaterThanOrEqual(a.incidentesReais);
  });

  it('Planaltina: só dado simulado, com o incidente do apagão', () => {
    const p = de('planaltina');
    expect(p.reais).toBe(0);
    expect(p.relatos).toBeNull();
    expect(p.incidentes).toBe(1);
    expect(p.porSeveridade.crítico).toBe(1);
    expect(p.incidentesReais).toBe(0);
  });

  it('as contas fecham: os agrupados cabem nos chamados; a soma por órgão é o total; a taxa é por habitante', () => {
    for (const ra of ['aguas-claras', 'planaltina', 'ceilandia', 'plano-piloto']) {
      const x = de(ra);
      expect(x.agrupados, ra).toBeLessThanOrEqual(x.chamados + 1e-6);
      expect(x.porOrgao.reduce((s, o) => s + o.chamados, 0), ra).toBeCloseTo(x.chamados);
      expect(x.por10mil, ra).toBeCloseTo((x.chamados / x.populacao) * 10_000);
      expect(x.porSeveridade.crítico + x.porSeveridade.sério + x.porSeveridade.atenção, ra).toBe(x.incidentes);
      expect(x.porOrgao.map((o) => o.chamados), ra).toEqual([...x.porOrgao.map((o) => o.chamados)].sort((a, b) => b - a));
    }
  });
});

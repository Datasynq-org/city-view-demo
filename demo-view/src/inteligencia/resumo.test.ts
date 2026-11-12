import { describe, expect, it } from 'vitest';
import { agrupar, calcularLigacoes, gerarChamados } from './agrupamento';
import { avancar, confirmar, descartar } from './decisoes';
import { filtrarInsights, opcoesDeFiltro, resumir, SEM_FILTRO } from './resumo';

const chamados = gerarChamados();
const r = agrupar(chamados, calcularLigacoes(chamados));

describe('resumo do painel de insights', () => {
  it('conta os incidentes por severidade e por situação', () => {
    const s = resumir(r);
    expect(s.incidentes).toBe(r.incidentes.length);
    expect(s.porSeveridade.crítico + s.porSeveridade.sério + s.porSeveridade.atenção).toBe(s.incidentes);
    expect(s.porSituacao.sugerido).toBe(s.incidentes);
    expect(s.chamados).toBeCloseTo(r.total);
    expect(s.agrupados + r.avulsos).toBeCloseTo(r.total);
  });

  it('o que se poupa é, em cada incidente, todos os chamados menos um', () => {
    const s = resumir(r);
    expect(s.evitados).toBeCloseTo(s.agrupados - s.incidentes);
    expect(s.entreOrgaos).toBeGreaterThan(0);
    expect(s.comOperacao).toBeGreaterThan(0);
  });

  it('incidente descartado não poupa nada; confirmado continua contando', () => {
    const a = r.incidentes[0]!;
    const b = r.incidentes[1]!;
    const d = avancar(confirmar(descartar({}, a.codigo, 'Não é o mesmo problema'), b.codigo, 0), 99_999);
    const s = resumir(r, d);
    expect(s.porSituacao).toMatchObject({ descartado: 1, confirmado: 1, sugerido: r.incidentes.length - 2 });
    expect(s.evitados).toBeCloseTo(resumir(r).evitados - (a.chamados - 1));
  });
});

describe('filtros da grade', () => {
  it('sem filtro, vêm todos, na ordem da fila', () => {
    expect(filtrarInsights(r.incidentes, SEM_FILTRO).map((x) => x.k)).toEqual(r.incidentes.map((_, k) => k));
  });

  it('filtra por severidade, por tipo de caso e por órgão (inclusive o que só aparece na operação)', () => {
    expect(filtrarInsights(r.incidentes, { ...SEM_FILTRO, severidade: 'crítico' }).every((x) => x.inc.severidade === 'crítico')).toBe(true);
    expect(filtrarInsights(r.incidentes, { ...SEM_FILTRO, tipo: 'Causa comum' }).map((x) => x.inc.casoId).sort()).toEqual(['cadeia-taguatinga', 'dengue-sol-nascente']);
    const daNovacap = filtrarInsights(r.incidentes, { ...SEM_FILTRO, orgao: 'novacap' }).map((x) => x.inc.casoId);
    expect(daNovacap).toContain('cadeia-taguatinga');
    expect(daNovacap).toContain('alagamento-vicente-pires');
  });

  it('as opções saem do que há na fila, os órgãos do mais ao menos presente', () => {
    const o = opcoesDeFiltro(r.incidentes);
    expect(o.tipos).toContain('Reclassificação');
    expect(o.orgaos[0]).toBeDefined();
    expect(new Set(o.orgaos).size).toBe(o.orgaos.length);
  });
});

import { describe, expect, it } from 'vitest';
import { agrupar, calcularLigacoes, gerarChamados, limiarDaSensibilidade, SENSIBILIDADE_PADRAO } from './agrupamento';
import { enderecoDoIncidente, incidentesSugeridos } from './atual';
import { agruparJuntos, chamadosJuntos, ehRelatoReal, ligacoesJuntas, resultadoPadrao } from './juntos';
import { ehReal } from './reais';

const t = chamadosJuntos();
const lig = ligacoesJuntas(t);
const r = agruparJuntos(t, lig, limiarDaSensibilidade(SENSIBILIDADE_PADRAO));
const sim = agrupar(gerarChamados(), calcularLigacoes(gerarChamados()));

describe('as duas fontes juntas', () => {
  it('primeiro vêm os chamados simulados, depois os relatos reais', () => {
    expect(t.simulados).toBe(gerarChamados().length);
    expect(t.chamados.length).toBeGreaterThan(t.simulados);
    expect(ehRelatoReal(t, 0)).toBe(false);
    expect(ehRelatoReal(t, t.simulados)).toBe(true);
    expect(t.chamados[t.simulados]!.canal).toMatch(/Águas Claras/);
  });

  it('nenhuma ligação cruza as fontes: real não entra em caso simulado, nem o contrário', () => {
    for (const l of lig.simuladas) expect(l.a < t.simulados && l.b < t.simulados).toBe(true);
    for (const l of lig.reais) expect(l.a >= t.simulados && l.b >= t.simulados).toBe(true);
    for (const i of r.incidentes) {
      const reais = i.membros.filter((m) => ehRelatoReal(t, m)).length;
      expect(reais === 0 || reais === i.membros.length, i.codigo).toBe(true);
      expect(ehReal(i), i.codigo).toBe(reais > 0);
    }
  });

  it('os incidentes simulados são os mesmos de antes; os reais entram com código próprio', () => {
    const simulados = r.incidentes.filter((i) => !ehReal(i));
    expect(simulados.map((i) => i.codigo).sort()).toEqual(sim.incidentes.map((i) => i.codigo).sort());
    const reais = r.incidentes.filter(ehReal);
    expect(reais.length).toBeGreaterThan(5);
    for (const i of reais) expect(i.codigo).toMatch(/^AC-\d{2}$/);
    expect(new Set(r.incidentes.map((i) => i.codigo)).size).toBe(r.incidentes.length);
  });

  it('a fila é uma só, por urgência, e os índices apontam para a lista junta', () => {
    expect(r.incidentes.map((i) => i.urgencia)).toEqual([...r.incidentes.map((i) => i.urgencia)].sort((a, b) => b - a));
    r.incidentes.forEach((inc, k) => inc.membros.forEach((m) => expect(r.grupo[m]).toBe(k)));
    expect(r.total).toBeCloseTo(sim.total + (t.chamados.length - t.simulados));
    expect(r.avulsos + r.incidentes.reduce((s, i) => s + i.chamados, 0)).toBeCloseTo(r.total);
  });

  it('a sala e o resumo veem a mesma fila; o endereço abre pelo caso ou pelo código', () => {
    expect(incidentesSugeridos()).toBe(resultadoPadrao().incidentes);
    expect(incidentesSugeridos().map((i) => i.codigo)).toEqual(r.incidentes.map((i) => i.codigo));
    expect(enderecoDoIncidente({ casoId: 'apagao-planaltina', codigo: 'COR-01' })).toBe('#/inteligencia?caso=apagao-planaltina');
    expect(enderecoDoIncidente({ casoId: null, codigo: 'AC-03' })).toBe('#/inteligencia?codigo=AC-03');
  });
});

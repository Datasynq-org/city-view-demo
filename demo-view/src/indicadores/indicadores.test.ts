import { describe, expect, it } from 'vitest';
import { gerarBase, indiceDaContagem, inicioDoDia } from '../dados/gerador';
import { estaAberto, type Incidente } from '../dominio/incidente';
import { AREAS, TIPO_POR_ID, TIPOS } from '../dominio/orgaos';
import { REGIOES } from '../dominio/ras';
import {
  abertosAgora,
  chamadosPorRa,
  chegandoAgora,
  duracao,
  filtrar,
  haQuanto,
  inicioDoPeriodo,
  percentual,
  percentualNoPrazo,
  serieDiaria,
  tempoAteResolver,
  tiposMaisFrequentes,
  velocidadePorArea,
} from './indicadores';

const H = 3_600_000;
const DIA = 24 * H;
/** Quinta-feira, 12/11/2026, 15h30 em Brasília (o mesmo "agora" dos testes do gerador). */
const AGORA = Date.UTC(2026, 10, 12, 18, 30);
const base = gerarBase({ agora: AGORA, dias: 28, diasDetalhados: 7 });
const TIPO_0 = TIPOS[0]!;
const AREA_0 = AREAS[0]!;

/** Incidente mínimo para testar contas sem depender do gerador. */
function inc(criadoH: number, resolvidoH?: number, tipoId = TIPO_0.id): Incidente {
  const tipo = TIPO_POR_ID[tipoId]!;
  return {
    id: 'INC-2026-000001',
    origem: { canalId: '162' },
    local: { lon: -47.9, lat: -15.8, raId: REGIOES[0]!.id },
    tipoId,
    area: tipo.area,
    orgaoId: tipo.orgaoId,
    situacao: resolvidoH === undefined ? 'em-atendimento' : 'resolvido',
    severidade: 'atencao',
    criadoEm: criadoH * H,
    resolvidoEm: resolvidoH === undefined ? undefined : resolvidoH * H,
    vinculos: [],
  };
}

describe('períodos e filtro', () => {
  it('o período começa às 00:00 de Brasília e hoje conta como um dia', () => {
    expect(inicioDoPeriodo(AGORA, 'hoje')).toBe(inicioDoDia(AGORA));
    expect(inicioDoPeriodo(AGORA, '7d')).toBe(inicioDoDia(AGORA) - 6 * DIA);
  });

  it('"hoje" só traz o que foi aberto hoje; 7 dias traz a janela detalhada inteira', () => {
    const hoje = filtrar(base.incidentes, AGORA, { periodo: 'hoje', area: null });
    expect(hoje.length).toBeGreaterThan(0);
    expect(hoje.every((i) => i.criadoEm >= inicioDoDia(AGORA) && i.criadoEm <= AGORA)).toBe(true);
    expect(filtrar(base.incidentes, AGORA, { periodo: '7d', area: null }).length).toBe(base.incidentes.length);
  });

  it('o filtro de área só deixa a área pedida, e as áreas somam o total', () => {
    const total = filtrar(base.incidentes, AGORA, { periodo: '7d', area: null }).length;
    const soma = AREAS.reduce((s, a) => {
      const lista = filtrar(base.incidentes, AGORA, { periodo: '7d', area: a.id });
      expect(lista.every((i) => i.area === a.id)).toBe(true);
      return s + lista.length;
    }, 0);
    expect(soma).toBe(total);
  });
});

describe('recorte por RA', () => {
  const RA = REGIOES[0]!;

  it('o filtro de RA só deixa a RA pedida, e as RAs somam o total', () => {
    const lista = filtrar(base.incidentes, AGORA, { periodo: '7d', area: null, ra: RA.id });
    expect(lista.length).toBeGreaterThan(0);
    expect(lista.every((i) => i.local.raId === RA.id)).toBe(true);
    const porRa = chamadosPorRa(base.incidentes);
    expect(porRa.size).toBe(REGIOES.length);
    expect([...porRa.values()].reduce((s, v) => s + v.chamados, 0)).toBe(base.incidentes.length);
    expect(porRa.get(RA.id)!.chamados).toBe(lista.length);
  });

  it('a taxa por 10 mil habitantes usa a população da RA', () => {
    const v = chamadosPorRa(base.incidentes).get(RA.id)!;
    expect(v.por10mil).toBeCloseTo((v.chamados / RA.populacao) * 10_000);
  });

  it('a série de uma RA é parte da série total', () => {
    const total = serieDiaria(base, null, 7);
    const daRa = serieDiaria(base, null, 7, RA.id);
    expect(daRa.every((v, k) => v <= total[k]!)).toBe(true);
    expect(daRa.some((v) => v > 0)).toBe(true);
  });

  it('os tipos mais frequentes vêm do mais ao menos', () => {
    const t = tiposMaisFrequentes(base.incidentes, 3);
    expect(t).toHaveLength(3);
    expect(t[0]!.chamados).toBeGreaterThanOrEqual(t[1]!.chamados);
    expect(t[1]!.chamados).toBeGreaterThanOrEqual(t[2]!.chamados);
  });
});

describe('velocidade da gestão', () => {
  it('mediana do tempo até resolver, ignorando o que não foi resolvido', () => {
    expect(tempoAteResolver([inc(0, 10), inc(0, 30), inc(0, 20), inc(0)])).toBe(20);
    expect(tempoAteResolver([inc(0, 10), inc(0, 30)])).toBe(20);
    expect(tempoAteResolver([inc(0)])).toBeNull();
  });

  it('% no prazo usa o prazo de cada tipo', () => {
    const prazo = TIPO_0.prazoHoras;
    expect(percentualNoPrazo([inc(0, prazo), inc(0, prazo + 1), inc(0, prazo / 2), inc(0)])).toBeCloseTo(2 / 3);
    expect(percentualNoPrazo([inc(0)])).toBeNull();
  });

  it('na base simulada os indicadores ficam em faixas plausíveis', () => {
    const p = percentualNoPrazo(base.incidentes)!;
    const t = tempoAteResolver(base.incidentes)!;
    expect(p).toBeGreaterThan(0.2);
    expect(p).toBeLessThan(1);
    expect(t).toBeGreaterThan(1);
  });

  it('velocidade por área cobre todas as áreas e soma os chamados', () => {
    const v = velocidadePorArea(base.incidentes);
    expect(v.map((x) => x.area)).toEqual(AREAS.map((a) => a.id));
    expect(v.reduce((s, x) => s + x.chamados, 0)).toBe(base.incidentes.length);
  });

  it('abertos agora conta só quem ainda depende de alguém agir', () => {
    expect(abertosAgora(base.incidentes)).toBe(base.incidentes.filter((i) => estaAberto(i.situacao)).length);
    const area = AREA_0.id;
    expect(abertosAgora(base.incidentes, area)).toBe(base.incidentes.filter((i) => i.area === area && estaAberto(i.situacao)).length);
  });
});

describe('série diária e chegando agora', () => {
  it('a série soma as contagens de todos os tipos e RAs, dia a dia', () => {
    const serie = serieDiaria(base, null, 7);
    expect(serie).toHaveLength(7);
    let esperado = 0;
    TIPOS.forEach((_, t) => REGIOES.forEach((__, r) => (esperado += base.contagens[indiceDaContagem(base, t, r, base.dias - 1)]!)));
    expect(serie[6]).toBe(esperado);
  });

  it('a série de uma área é parte da série total', () => {
    const total = serieDiaria(base, null, 7);
    const somaAreas = AREAS.map((a) => serieDiaria(base, a.id, 7)).reduce((s, x) => s.map((v, k) => v + x[k]!));
    expect(somaAreas).toEqual(total);
  });

  it('chegando agora traz os mais recentes, do mais novo ao mais antigo', () => {
    const ultimos = chegandoAgora(base.incidentes, 8);
    expect(ultimos).toHaveLength(8);
    for (let k = 1; k < ultimos.length; k++) expect(ultimos[k - 1]!.criadoEm).toBeGreaterThanOrEqual(ultimos[k]!.criadoEm);
    expect(ultimos[0]!.criadoEm).toBe(Math.max(...base.incidentes.map((i) => i.criadoEm)));
  });
});

describe('formatos', () => {
  it('duração, percentual e "há quanto"', () => {
    expect(duracao(null)).toBe('–');
    expect(duracao(18.4)).toBe('18 h');
    expect(duracao(81.6)).toBe('3,4 dias');
    expect(percentual(0.714)).toBe('71%');
    expect(haQuanto(AGORA, AGORA - 30_000)).toBe('agora');
    expect(haQuanto(AGORA, AGORA - 12 * 60_000)).toBe('há 12 min');
    expect(haQuanto(AGORA, AGORA - 5 * H)).toBe('há 5 h');
    expect(haQuanto(AGORA, AGORA - 3 * DIA)).toBe('há 3 dias');
  });
});

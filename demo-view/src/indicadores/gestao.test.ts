import { describe, expect, it } from 'vitest';
import { gerarBase, inicioDoDia } from '../dados/gerador';
import { estaAberto, type Incidente } from '../dominio/incidente';
import { ORGAOS, TIPO_POR_ID, TIPOS } from '../dominio/orgaos';
import { REGIOES } from '../dominio/ras';
import { comoEm, comparar, cumprimentoDoPrazo, entre, foraDoPrazo, medir, PERTO_M, porDia, porOrgao, porRegiao, porTipo, repetidos } from './gestao';

const H = 3_600_000;
const DIA = 24 * H;
const AGORA = Date.UTC(2026, 10, 12, 18, 30);
const base = gerarBase({ agora: AGORA, dias: 40, diasDetalhados: 30 });
const TIPO = TIPOS[0]!;

/** Incidente mínimo, a `horasAtras` de agora, resolvido em `resolveuEmH` horas (ou aberto). */
function inc(horasAtras: number, resolveuEmH?: number, lon = -47.9, lat = -15.8, tipoId = TIPO.id): Incidente {
  const t = TIPO_POR_ID[tipoId]!;
  const criadoEm = AGORA - horasAtras * H;
  return {
    id: 'INC-2026-000001',
    origem: { canalId: '162' },
    local: { lon, lat, raId: REGIOES[0]!.id },
    tipoId,
    area: t.area,
    orgaoId: t.orgaoId,
    situacao: resolveuEmH === undefined ? 'em-atendimento' : 'resolvido',
    severidade: 'atencao',
    criadoEm,
    resolvidoEm: resolveuEmH === undefined ? undefined : criadoEm + resolveuEmH * H,
    vinculos: [],
  };
}

describe('velocidade da gestão', () => {
  it('compara o período com o anterior, do mesmo tamanho', () => {
    const p = TIPO.prazoHoras;
    // Esta semana: tudo no prazo, em metade do tempo. Semana passada: metade fora.
    const lista = [inc(24, p / 2), inc(48, p / 2), inc(8 * 24, p), inc(9 * 24, p * 2)];
    const c = comparar(lista, AGORA, 7);
    expect(c.atual).toMatchObject({ chamados: 2, noPrazo: 1, tempo: p / 2 });
    expect(c.anterior).toMatchObject({ chamados: 2, noPrazo: 0.5 });
    expect(c.noPrazo).toBeCloseTo(50);
    expect(c.tempo).toBeLessThan(0);
    expect(c.leitura).toBe('mais rápida');
  });

  it('diz "mais lenta" quando o prazo cai, e "sem comparação" quando falta período', () => {
    const p = TIPO.prazoHoras;
    expect(comparar([inc(24, p * 3), inc(8 * 24, p / 2)], AGORA, 7).leitura).toBe('mais lenta');
    expect(comparar([inc(24, p)], AGORA, 7).leitura).toBe('sem comparação');
  });

  it('o período anterior entra como estava naquela época: os dois com a mesma idade', () => {
    const p = TIPO.prazoHoras;
    // Aberto há 10 dias e resolvido só há 2: há 7 dias, ainda estava aberto.
    const tardio = inc(10 * 24, 8 * 24);
    expect(comoEm(tardio, AGORA - 7 * DIA).situacao).toBe('em-atendimento');
    expect(comoEm(tardio, AGORA - 7 * DIA).resolvidoEm).toBeUndefined();
    expect(comoEm(tardio, AGORA)).toBe(tardio);
    const c = comparar([inc(24, p), tardio, inc(9 * 24, p)], AGORA, 7);
    // Sem a correção, o anterior teria dois resolvidos (um deles muito lento).
    expect(c.anterior).toMatchObject({ chamados: 2, noPrazo: 1, tempo: p });
  });

  it('o prazo cumprido só conta os chamados cujo prazo já venceu', () => {
    const p = TIPO.prazoHoras;
    const lista = [...Array.from({ length: 15 }, () => inc(p * 3, p / 2)), ...Array.from({ length: 5 }, () => inc(p * 3)), inc(p / 4), inc(p / 4, p / 8)];
    expect(cumprimentoDoPrazo(lista, AGORA)).toEqual({ vencidos: 20, noPrazo: 0.75 });
    expect(cumprimentoDoPrazo(lista.slice(0, 10), AGORA).noPrazo).toBeNull();
  });

  it('na base simulada, os dois períodos têm chamados e medidas', () => {
    const c = comparar(base.incidentes, AGORA, 7);
    expect(c.atual.chamados).toBeGreaterThan(1000);
    expect(c.anterior.chamados).toBeGreaterThan(1000);
    expect(c.leitura).not.toBe('sem comparação');
  });

  it('a série por dia cobre os dias pedidos e soma os chamados do período', () => {
    const serie = porDia(base.incidentes, AGORA, 14);
    expect(serie).toHaveLength(14);
    expect(serie.at(-1)!.dia).toBe(inicioDoDia(AGORA));
    const fim = inicioDoDia(AGORA) + DIA;
    expect(serie.reduce((s, d) => s + d.chamados, 0)).toBe(entre(base.incidentes, fim - 14 * DIA, fim).length);
    expect(serie.every((d) => d.vencidos <= d.chamados && (d.noPrazo === null || (d.noPrazo >= 0 && d.noPrazo <= 1)))).toBe(true);
  });

  it('fora do prazo conta só o que está aberto há mais tempo que o prazo do tipo', () => {
    const p = TIPO.prazoHoras;
    expect(foraDoPrazo([inc(p + 1), inc(p - 1), inc(p * 5, p * 4)], AGORA)).toBe(1);
  });
});

describe('chamados repetidos', () => {
  const metro = 1 / 110_540;

  it('conta quem tem outro do mesmo tipo, perto e no mesmo dia', () => {
    const a = inc(10);
    const perto = inc(5, undefined, -47.9, -15.8 + 50 * metro);
    const longe = inc(5, undefined, -47.9, -15.8 + (PERTO_M + 80) * metro);
    const tarde = inc(40);
    expect(repetidos([a, perto])).toBe(1);
    expect(repetidos([a, longe])).toBe(0);
    expect(repetidos([tarde, a])).toBe(0);
  });

  it('tipos diferentes no mesmo lugar não são repetidos; três do mesmo tipo dão dois', () => {
    const outro = TIPOS.find((t) => t.id !== TIPO.id)!;
    expect(repetidos([inc(10), inc(9, undefined, -47.9, -15.8, outro.id)])).toBe(0);
    expect(repetidos([inc(10), inc(9), inc(8)])).toBe(2);
  });

  it('pega o vizinho do outro lado da borda da célula', () => {
    // Dois pontos a 20 m, um de cada lado de um múltiplo do tamanho da célula.
    const grausLat = PERTO_M / 110_540;
    const borda = Math.floor(-15.8 / grausLat) * grausLat;
    expect(repetidos([inc(10, undefined, -47.9, borda - 10 * metro), inc(9, undefined, -47.9, borda + 10 * metro)])).toBe(1);
  });

  it('na base simulada há repetidos, e menos que o total', () => {
    const fim = inicioDoDia(AGORA) + DIA;
    const semana = entre(base.incidentes, fim - 7 * DIA, fim);
    const n = repetidos(semana);
    expect(n).toBeGreaterThan(0);
    expect(n).toBeLessThan(semana.length);
  });
});

describe('visão por órgão, tipo e região', () => {
  it('a tabela tem todos os órgãos, e as filas somam o período', () => {
    const tabela = porOrgao(base.incidentes, AGORA, 7);
    expect(tabela.map((l) => l.orgaoId)).toEqual(ORGAOS.map((o) => o.id));
    const fim = inicioDoDia(AGORA) + DIA;
    expect(tabela.reduce((s, l) => s + l.chamados, 0)).toBe(entre(base.incidentes, fim - 7 * DIA, fim).length);
    for (const l of tabela) {
      expect(l.serie).toHaveLength(7);
      expect(l.abertos).toBeLessThanOrEqual(l.chamados);
      expect(l.foraDoPrazo).toBeLessThanOrEqual(l.abertos);
    }
  });

  it('o filtro de área deixa só os órgãos da área', () => {
    const tabela = porOrgao(base.incidentes, AGORA, 7, { area: 'saneamento' });
    expect(tabela.every((l) => ORGAOS.find((o) => o.id === l.orgaoId)!.area === 'saneamento')).toBe(true);
    expect(tabela.length).toBeGreaterThan(0);
  });

  it('os tipos de um órgão vêm do mais ao menos frequente, com o prazo de cada um', () => {
    const fim = inicioDoDia(AGORA) + DIA;
    const caesb = entre(base.incidentes, fim - 7 * DIA, fim, { orgaoId: 'caesb' });
    const tipos = porTipo(caesb);
    expect(tipos.reduce((s, t) => s + t.chamados, 0)).toBe(caesb.length);
    for (let k = 1; k < tipos.length; k++) expect(tipos[k - 1]!.chamados).toBeGreaterThanOrEqual(tipos[k]!.chamados);
    expect(tipos.every((t) => t.prazoHoras > 0)).toBe(true);
    expect(medir(caesb).chamados).toBe(caesb.length);
    expect(caesb.some((i) => estaAberto(i.situacao))).toBe(true);
  });

  it('as regiões com mais chamados vêm em ordem', () => {
    const r = porRegiao(base.incidentes, 5);
    expect(r).toHaveLength(5);
    expect(r[0]!.chamados).toBeGreaterThanOrEqual(r[4]!.chamados);
  });
});

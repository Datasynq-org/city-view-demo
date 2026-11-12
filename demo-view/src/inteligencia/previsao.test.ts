import { describe, expect, it } from 'vitest';
import { gerarBase } from '../dados/gerador';
import { REGIOES } from '../dominio/ras';
import { diaDaSemana, foraDoNormal, HISTORICO_NO_GRAFICO, HORIZONTE, pressaoPorRegiao, prever, previsaoPara, serieDiaria, ultimoDia, variacaoPorTipo } from './previsao';

/** Quinta-feira, 12/11/2026, 15h30 em Brasília. */
const AGORA = Date.UTC(2026, 10, 12, 18, 30);
const base = gerarBase({ agora: AGORA });
const dow = (d: number) => d % 7;

describe('previsão', () => {
  it('série constante dá previsão constante, com faixa de largura zero', () => {
    const p = prever(new Array<number>(80).fill(100), 79, dow);
    expect(p.valores).toHaveLength(HORIZONTE);
    for (const v of p.valores) expect(v).toBeCloseTo(100);
    expect(p.superior[0]! - p.inferior[0]!).toBeCloseTo(0);
  });

  it('aprende o padrão do dia da semana', () => {
    // Fim de semana (dias 5 e 6) com o dobro dos demais.
    const serie = Array.from({ length: 84 }, (_, d) => (dow(d) >= 5 ? 200 : 100));
    const p = prever(serie, 83, dow);
    p.valores.forEach((v, i) => expect(v).toBeCloseTo(dow(84 + i) >= 5 ? 200 : 100, 0));
  });

  it('a faixa contém o previsto, alarga com o tempo e nunca fica negativa', () => {
    const serie = serieDiaria(base);
    const p = prever(serie, ultimoDia(base), (d) => diaDaSemana(base, d));
    p.valores.forEach((v, i) => {
      expect(p.inferior[i]!).toBeLessThanOrEqual(v);
      expect(p.superior[i]!).toBeGreaterThanOrEqual(v);
      expect(p.inferior[i]!).toBeGreaterThanOrEqual(0);
    });
    expect(p.superior[13]! - p.inferior[13]!).toBeGreaterThan(p.superior[0]! - p.inferior[0]!);
  });

  it('só usa o passado: mudar o futuro não muda a previsão', () => {
    const serie = serieDiaria(base);
    const fim = ultimoDia(base) - 20;
    const outra = serie.map((v, d) => (d > fim ? v * 9 : v));
    const dd = (d: number) => diaDaSemana(base, d);
    expect(prever(outra, fim, dd)).toEqual(prever(serie, fim, dd));
  });

  it('o dia da semana segue o calendário de Brasília', () => {
    // O último dia da base é hoje: quinta-feira.
    expect(diaDaSemana(base, base.dias - 1)).toBe(4);
    expect(diaDaSemana(base, base.dias - 2)).toBe(3);
  });

  it('o resultado traz o histórico, as duas semanas à frente e um acerto entre 0 e 1', () => {
    const r = previsaoPara(base);
    expect(r.pontos).toHaveLength(HISTORICO_NO_GRAFICO + HORIZONTE);
    expect(r.pontos.filter((p) => p.real !== null)).toHaveLength(HISTORICO_NO_GRAFICO);
    expect(r.pontos.at(-1)).toMatchObject({ real: null });
    expect(r.acerto).toBeGreaterThan(0.6);
    expect(r.acerto).toBeLessThanOrEqual(1);
    expect(r.proximos).toBeGreaterThan(0);
    expect(previsaoPara(base)).toEqual(r);
  });

  it('a série de uma área é parte da série total', () => {
    const total = serieDiaria(base);
    const energia = serieDiaria(base, { area: 'energia' });
    expect(energia.every((v, d) => v <= total[d]!)).toBe(true);
    expect(serieDiaria(base, { ra: REGIOES[0]!.id }).reduce((s, v) => s + v, 0)).toBeLessThan(total.reduce((s, v) => s + v, 0));
  });
});

describe('o que sobe, onde reforçar e o que está fora do normal', () => {
  it('a variação por tipo só traz tipos com volume, com um motivo', () => {
    const v = variacaoPorTipo(base);
    expect(v.length).toBeGreaterThan(5);
    expect(v.every((x) => x.ultimos >= 60 && Number.isFinite(x.variacao))).toBe(true);
    expect(v.find((x) => x.tipo.perfil === 'chuva')?.motivo ?? 'chuva').toBe('chuva');
  });

  it('a pressão por região vem de quem terá mais chamados a mais', () => {
    const p = pressaoPorRegiao(base);
    expect(p).toHaveLength(37);
    for (let k = 1; k < p.length; k++) expect(p[k - 1]!.aMais).toBeGreaterThanOrEqual(p[k]!.aMais);
  });

  it('fora do normal: só o que está bem acima do esperado, do mais ao menos', () => {
    const a = foraDoNormal(base);
    expect(a.length).toBeLessThanOrEqual(8);
    expect(a.every((x) => x.semana >= 20 && x.vezes >= 1.5)).toBe(true);
    for (let k = 1; k < a.length; k++) expect(a[k - 1]!.vezes).toBeGreaterThanOrEqual(a[k]!.vezes);
  });

  it('um foco plantado numa região aparece como fora do normal', () => {
    const tipo = 'lampada-apagada';
    const ra = 'gama';
    const comFoco = gerarBase({ agora: AGORA, focos: [{ tipoId: tipo, raId: ra, multiplicador: 8, dias: 7 }] });
    const a = foraDoNormal(comFoco, {}, 40);
    expect(a.some((x) => x.tipo.id === tipo && x.ra.id === ra)).toBe(true);
  });

  it('com histórico curto demais, não inventa anomalia', () => {
    expect(foraDoNormal(gerarBase({ agora: AGORA, dias: 40, diasDetalhados: 7 }))).toEqual([]);
  });
});

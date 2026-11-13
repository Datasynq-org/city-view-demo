import { describe, expect, it } from 'vitest';
import { cidade } from '../dados/cidade';
import { contarFontes, fontesDe } from '../dominio/origem';
import { foraDoNormal, mudancaDoDf } from '../indicadores/regioes';
import { TELAS } from '../navegacao';
import { PERGUNTAS } from './perguntas';

const { chegados, inicio } = cidade();
const c = { incidentes: chegados, agora: inicio };

describe('pergunte à cidade: perguntas prontas, contas de verdade', () => {
  it('toda pergunta responde com frase, números, a conta feita e para onde ir', () => {
    expect(new Set(PERGUNTAS.map((p) => p.id)).size).toBe(PERGUNTAS.length);
    for (const p of PERGUNTAS) {
      const r = p.responder(c);
      expect(r.texto.length, p.id).toBeGreaterThan(10);
      expect(r.conta.length, p.id).toBeGreaterThan(20);
      expect(TELAS.map((t) => t.id), p.id).toContain(r.ver.tela);
      for (const i of r.itens) expect(i.valor, `${p.id}: ${i.nome}`).not.toMatch(/NaN|undefined|Infinity/);
      expect(r.texto, p.id).not.toMatch(/NaN|undefined|Infinity/);
    }
  });

  it('a resposta sobre o que saiu do normal é a mesma conta do mapa da sala', () => {
    const r = PERGUNTAS.find((p) => p.id === 'fora-do-normal')!.responder(c);
    const fora = [...foraDoNormal(chegados, inicio)].filter(([, v]) => v.fora);
    expect(r.itens).toHaveLength(Math.min(4, fora.length));
    expect(r.mapa).toBeDefined();
  });

  it('a do órgão ordena pela parte fora do prazo, não pelo total', () => {
    const r = PERGUNTAS.find((p) => p.id === 'fora-do-prazo')!.responder(c);
    const partes = r.itens.map((i) => Number(i.valor.match(/^(\d+)%/)![1]));
    expect(partes).toEqual([...partes].sort((a, b) => b - a));
  });

  it('sem chamados, responde sem quebrar', () => {
    for (const p of PERGUNTAS) expect(() => p.responder({ incidentes: [], agora: inicio })).not.toThrow();
  });
});

describe('a mudança do DF inteiro', () => {
  it('é a última semana sobre a média das três anteriores', () => {
    const m = mudancaDoDf(chegados, inicio)!;
    expect(m).toBeGreaterThan(-0.5);
    expect(m).toBeLessThan(0.5);
    expect(mudancaDoDf([], inicio)).toBeNull();
  });
});

describe('de onde vem cada número', () => {
  it('não inventa integração: quase tudo é proposta', () => {
    const { ligadas, propostas } = contarFontes(fontesDe());
    expect(ligadas).toBeGreaterThan(0);
    expect(propostas).toBeGreaterThan(ligadas);
  });

  it('o recorte de órgão traz só o sistema dele; o de área, os da área e os portais gerais', () => {
    expect(fontesDe({ orgaoId: 'caesb' }).every((f) => f.dono === 'CAESB')).toBe(true);
    const energia = fontesDe({ area: 'energia' }).map((f) => f.dono);
    expect(energia).toContain('GDF');
    expect(energia).toContain('CEB IPes');
    expect(energia).not.toContain('CAESB');
  });

  it('a operação só conta os sistemas que a trariam', () => {
    expect(fontesDe({ operacao: true }).length).toBeLessThan(fontesDe().length);
  });
});

import { describe, expect, it } from 'vitest';
import { CONECTORES, contar, metodoDe, METODOS, nomeDoDono, REGRAS } from './conectores';
import { ORGAOS } from './orgaos';

describe('catálogo de conectores', () => {
  it('não repete conector e cobre todos os órgãos da demo', () => {
    const ids = CONECTORES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const o of ORGAOS) expect(CONECTORES.some((c) => c.orgaoId === o.id), o.id).toBe(true);
  });

  it('todo conector diz de onde vem a informação, e o que existe ou está pronto tem nota com fato', () => {
    for (const c of CONECTORES) {
      expect(c.fonte.length, c.id).toBeGreaterThan(4);
      if (c.situacao !== 'proposta') expect(c.nota, c.id).toMatch(/\d|pronta/);
    }
  });

  it('só o que tem história é dito como existente ou pronto', () => {
    expect(CONECTORES.filter((c) => c.situacao === 'existe').map((c) => c.id)).toEqual(['participadf', 'portal-cidadao']);
    expect(CONECTORES.filter((c) => c.situacao === 'pronto').map((c) => c.id)).toEqual(['iluminadf']);
    const n = contar();
    expect(n.existe + n.pronto + n.proposta).toBe(CONECTORES.length);
    expect(n.orgao).toBe(0);
  });

  it('conector proposto não tem método decidido; o que existe diz como é feito hoje', () => {
    expect(CONECTORES.filter((c) => c.situacao === 'proposta').every((c) => c.metodo === 'a-mapear' && !c.comoHoje)).toBe(true);
    expect(CONECTORES.filter((c) => c.situacao !== 'proposta').every((c) => c.comoHoje && /dfac/.test(c.fonte))).toBe(true);
    expect(metodoDe(CONECTORES.find((c) => c.id === 'portal-cidadao')!)).toMatch(/navegador/);
    expect(metodoDe(CONECTORES.find((c) => c.id === 'caesb')!)).toBe('A mapear');
    expect(METODOS.map((m) => m.id)).toEqual(['api', 'robo', 'arquivos', 'a-mapear']);
  });

  it('o ADM 24h aparece como não identificado, sem afirmar o que é', () => {
    const adm = CONECTORES.find((c) => c.id === 'adm-24h')!;
    expect(adm.situacao).toBe('proposta');
    expect(adm.nota).toMatch(/não identificados/);
  });

  it('o dono vem pelo nome do órgão quando há, e as regras incluem a do robô', () => {
    expect(nomeDoDono(CONECTORES.find((c) => c.id === 'caesb')!)).toMatch(/Saneamento/);
    expect(nomeDoDono(CONECTORES.find((c) => c.id === 'participadf')!)).toBe('GDF');
    expect(REGRAS.some((r) => /autorização formal/.test(r))).toBe(true);
  });
});

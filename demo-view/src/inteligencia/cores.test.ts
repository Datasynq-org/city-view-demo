import { describe, expect, it } from 'vitest';
import { ORGAOS } from '../dominio/orgaos';
import { CASOS } from './casos';
import { corDoOrgao, FAMILIAS, familiaDoOrgao, familiasDe } from './cores';

describe('cores por área (tema claro da inteligência)', () => {
  it('são as sete da apresentação, sem repetir cor', () => {
    expect(FAMILIAS).toHaveLength(7);
    expect(new Set(FAMILIAS.map((f) => f.cor)).size).toBe(7);
    expect(FAMILIAS.every((f) => /^#[0-9a-f]{6}$/.test(f.cor))).toBe(true);
  });

  it('todo órgão do catálogo e dos casos tem cor', () => {
    const todos = [...ORGAOS.map((o) => o.id), ...CASOS.flatMap((c) => c.sinais.map((s) => s.orgaoId))];
    for (const o of todos) expect(corDoOrgao(o), o).toMatch(/^#/);
  });

  it('segue as famílias da apresentação', () => {
    expect(familiaDoOrgao('pmdf')).toBe('seguranca');
    expect(familiaDoOrgao('pcdf')).toBe('seguranca');
    expect(familiaDoOrgao('ceb-ipes')).toBe('iluminacao');
    expect(familiaDoOrgao('neoenergia')).toBe('energia');
    expect(familiaDoOrgao('caesb')).toBe('agua');
    expect(familiaDoOrgao('detran')).toBe('vias');
    expect(familiaDoOrgao('slu')).toBe('limpeza');
    expect(familiaDoOrgao('ses')).toBe('outros');
  });

  it('um caso que cruza órgãos mistura cores; a legenda só traz as presentes', () => {
    const apagao = CASOS.find((c) => c.id === 'apagao-planaltina')!;
    const f = familiasDe(apagao.sinais.map((s) => s.orgaoId));
    expect(f.length).toBeGreaterThan(1);
    expect(f.map((x) => x.id)).toContain('energia');
    expect(familiasDe([])).toEqual([]);
  });
});

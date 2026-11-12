import { describe, expect, it } from 'vitest';
import { AREAS, CANAIS, CANAL_CITY_VIEW, CANAL_POR_ID, ORGAOS, TIPOS } from './orgaos';

const unicos = (ids: string[]) => new Set(ids).size === ids.length;

describe('catálogo de órgãos', () => {
  it('não repete ids de órgãos, tipos e canais', () => {
    expect(unicos(ORGAOS.map((o) => o.id))).toBe(true);
    expect(unicos(TIPOS.map((t) => t.id))).toBe(true);
    expect(unicos(CANAIS.map((c) => c.id))).toBe(true);
  });

  it('dá a cada órgão uma área conhecida, a fonte no magno e ao menos um tipo', () => {
    const areas = new Set(AREAS.map((a) => a.id));
    for (const orgao of ORGAOS) {
      expect(areas.has(orgao.area), orgao.sigla).toBe(true);
      expect(orgao.fonte, orgao.sigla).toMatch(/^magno, se/);
      expect(orgao.tipos.length, orgao.sigla).toBeGreaterThan(0);
    }
  });

  it('usa só canais que existem, com pesos que somam 1', () => {
    for (const orgao of ORGAOS) {
      for (const { canalId } of orgao.canais) expect(CANAL_POR_ID[canalId], `${orgao.sigla}: ${canalId}`).toBeDefined();
      const soma = orgao.canais.reduce((s, c) => s + c.peso, 0);
      expect(soma, orgao.sigla).toBeCloseTo(1, 9);
    }
  });

  it('exige fonte de todo canal com nome próprio', () => {
    for (const canal of CANAIS) {
      if (canal.generico || canal.proposto) expect(canal.fonte, canal.id).toBeUndefined();
      else expect(canal.fonte, canal.id).toMatch(/^magno, se/);
    }
  });

  it('tem o canal do City View só como proposta, fora dos canais dos órgãos', () => {
    expect(CANAL_POR_ID[CANAL_CITY_VIEW]?.proposto).toBe(true);
    expect(ORGAOS.flatMap((o) => o.canais).some((c) => c.canalId === CANAL_CITY_VIEW)).toBe(false);
  });

  it('tem números de simulação válidos em todo tipo', () => {
    for (const tipo of TIPOS) {
      expect(tipo.volumeMensal, tipo.id).toBeGreaterThan(0);
      expect(tipo.prazoHoras, tipo.id).toBeGreaterThan(0);
      expect(tipo.tempoMedioHoras, tipo.id).toBeGreaterThan(0);
      expect(['atencao', 'serio', 'critico'], tipo.id).toContain(tipo.severidadeBase);
    }
  });
});

import { describe, expect, it } from 'vitest';
import { gerarBase } from '../../dados/gerador';
import { REGIAO_POR_ID } from '../../dominio/ras';
import { filtrar } from '../../indicadores/indicadores';
import { MODOS } from '../../mapa/camadas';
import { areaMaisLenta, raMaisAberta, TOUR } from './tour';

const AGORA = Date.UTC(2026, 10, 12, 18, 30);
const base = gerarBase({ agora: AGORA, dias: 28, diasDetalhados: 7 });
const cena = {
  incidentes: base.incidentes,
  doPeriodo: filtrar(base.incidentes, AGORA, { periodo: '7d', area: null }),
  nomePeriodo: '7 dias',
  contexto: null,
};
/**
 * A ATA fica fora desta pasta (`docs/fonte/` do repositório city-view-demo). Se a
 * pasta for movida sozinha, o teste das frases é pulado, e o resto continua.
 */
const atas = Object.values(import.meta.glob<string>('../../../../docs/fonte/CV-ATA-001-*.md', { query: '?raw', import: 'default', eager: true }));
/** A ATA em uma linha só, sem quebras, para achar frases que atravessam linhas. */
const ataCorrida = (atas[0] ?? '').replace(/\s+/g, ' ').toLowerCase();

describe('tour da sala de guerra', () => {
  it('tem cinco paradas, cada uma num modo que existe', () => {
    expect(TOUR).toHaveLength(5);
    const modos = MODOS.map((m) => m.id);
    expect(TOUR.every((p) => modos.includes(p.modo))).toBe(true);
    expect(new Set(TOUR.map((p) => p.id)).size).toBe(TOUR.length);
  });

  it.skipIf(!atas.length)('toda frase está, palavra por palavra, na conversa de 10/11', () => {
    for (const p of TOUR) {
      const frase = p.frase.replace(/\.$/, '').toLowerCase();
      expect(ataCorrida, p.id).toContain(frase);
    }
  });

  it('toda vista cai dentro do DF, com inclinação e zoom de sala de comando', () => {
    for (const p of TOUR) {
      const v = p.vista(cena);
      if (v === null) continue;
      expect(v.centro[0]).toBeGreaterThan(-48.4);
      expect(v.centro[0]).toBeLessThan(-47.2);
      expect(v.centro[1]).toBeGreaterThan(-16.1);
      expect(v.centro[1]).toBeLessThan(-15.4);
      expect(v.inclinacao).toBeGreaterThanOrEqual(45);
      expect(v.zoom).toBeGreaterThan(9);
    }
  });

  it('todo texto sai preenchido, sem buracos', () => {
    for (const p of TOUR) {
      const t = p.texto(cena);
      expect(t.length, p.id).toBeGreaterThan(30);
      expect(t, p.id).not.toMatch(/undefined|NaN|null/);
    }
    expect(TOUR.filter((p) => /\d/.test(p.texto(cena))).length).toBeGreaterThanOrEqual(3);
  });

  it('a RA mais aberta e a área mais lenta vêm dos dados', () => {
    const m = raMaisAberta(base.incidentes);
    expect(REGIAO_POR_ID[m.ra]).toBeDefined();
    expect(m.abertos).toBeGreaterThan(0);
    const l = areaMaisLenta(cena.doPeriodo)!;
    expect(l.noPrazo).not.toBeNull();
  });
});

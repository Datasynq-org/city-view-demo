import { describe, expect, it } from 'vitest';
import { gerarBase } from '../dados/gerador';
import { ADIANTE_MS, intervaloDeChegada, receber, separarFila } from './relogio';

const AGORA = Date.UTC(2026, 10, 12, 18, 30);
const base = gerarBase({ agora: AGORA + ADIANTE_MS, dias: 28, diasDetalhados: 7 });
const { chegados, fila } = separarFila(base.incidentes, AGORA);

describe('relógio da demo', () => {
  it('separa o que já chegou da fila, sem perder ninguém', () => {
    expect(chegados.length + fila.length).toBe(base.incidentes.length);
    expect(fila.length).toBeGreaterThan(0);
    expect(chegados.every((i) => i.criadoEm <= AGORA)).toBe(true);
    expect(fila.every((i) => i.criadoEm > AGORA)).toBe(true);
  });

  it('a fila sai na ordem de criação', () => {
    for (let k = 1; k < fila.length; k++) expect(fila[k]!.criadoEm).toBeGreaterThanOrEqual(fila[k - 1]!.criadoEm);
  });

  it('nada do que chegou foi encaminhado ou resolvido depois de agora', () => {
    expect(chegados.every((i) => (i.resolvidoEm ?? 0) <= AGORA && (i.encaminhadoEm ?? 0) <= AGORA)).toBe(true);
    expect(chegados.every((i) => !['resolvido', 'encerrado'].includes(i.situacao) || i.resolvidoEm !== undefined)).toBe(true);
  });

  it('quem chega vem como recebido, com o horário de agora', () => {
    const i = receber(fila[0]!, AGORA + 5000);
    expect(i).toMatchObject({ id: fila[0]!.id, situacao: 'recebido', criadoEm: AGORA + 5000 });
    expect(i.resolvidoEm).toBeUndefined();
    expect(i.encaminhadoEm).toBeUndefined();
  });

  it('as chegadas vêm a cada 3,5 a 7 segundos', () => {
    expect(intervaloDeChegada(0)).toBe(3500);
    expect(intervaloDeChegada(1)).toBe(7000);
  });
});

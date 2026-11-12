import { describe, expect, it } from 'vitest';
import { agrupar, calcularLigacoes, gerarChamados } from '../../inteligencia/agrupamento';
import { alturaDaColuna, arco, camadasDoGrafo, camadasVivas, DURACAO_DA_ONDA, type Etapa, pontoNoArco, prepararGrafo, zoomDoIncidente } from './grafo';

const chamados = gerarChamados();
const resultado = agrupar(chamados, calcularLigacoes(chamados));
const base = prepararGrafo(chamados, resultado);
const estado = (etapa: Etapa, aberto = -1, descartados: number[] = []) => ({ base, resultado, etapa, aberto, descartados: new Set(descartados) });
const ids = (e: ReturnType<typeof estado>) => camadasDoGrafo(e).map((c) => c.id);

describe('grafo da inteligência', () => {
  it('o arco sai de um ponto, sobe e chega ao outro', () => {
    const c = arco([-48, -15.8], [-47.9, -15.7], 1000);
    expect(c[0]).toEqual([-48, -15.8, 0]);
    expect(c.at(-1)![2]).toBeCloseTo(0);
    expect(Math.max(...c.map((p) => p[2]))).toBeGreaterThan(900);
    expect(pontoNoArco(c, 0)).toEqual(c[0]);
    expect(pontoNoArco(c, 2)).toEqual(c.at(-1));
  });

  it('cada chamado é um ponto, com no máximo três ligações desenhadas, e um raio por membro', () => {
    expect(base.pontos).toHaveLength(chamados.length);
    expect(base.arcos.length).toBeLessThanOrEqual((chamados.length * 3) / 2);
    expect(base.raios).toHaveLength(resultado.incidentes.reduce((s, i) => s + i.membros.length, 0));
    expect(base.arcos.some((a) => a.cruza)).toBe(true);
  });

  it('cada etapa mostra só o que é dela', () => {
    expect(ids(estado(0))).toEqual(['grafo-halo', 'grafo-chamados']);
    expect(ids(estado(1))).toEqual(['grafo-ligacoes', 'grafo-nos', 'grafo-halo', 'grafo-chamados']);
    expect(ids(estado(2))).toEqual(['grafo-ligacoes', 'grafo-halo', 'grafo-chamados', 'grafo-colunas', 'grafo-numeros']);
    expect(ids(estado(2, 0))).toContain('grafo-raios');
  });

  it('incidente descartado perde a coluna', () => {
    const colunas = (e: ReturnType<typeof estado>) => (camadasDoGrafo(e).find((c) => c.id === 'grafo-colunas')!.props.data as unknown[]).length;
    expect(colunas(estado(2))).toBe(resultado.incidentes.length);
    expect(colunas(estado(2, -1, [0, 1]))).toBe(resultado.incidentes.length - 2);
  });

  it('só se mexe o incidente aberto e a onda de quem foi confirmado; com movimento reduzido, nada', () => {
    expect(camadasVivas(estado(2), [], 1000)).toEqual({ camadas: [], ativo: false });
    expect(camadasVivas(estado(2, 0), [], 1000).camadas.map((c) => c.id)).toEqual(['grafo-sinais']);
    const onda = { id: 1, centro: [-47.9, -15.8] as [number, number], cor: [255, 0, 0] as [number, number, number], em: 1000 };
    expect(camadasVivas(estado(0), [onda], 1500).ativo).toBe(true);
    expect(camadasVivas(estado(0), [onda], 1000 + DURACAO_DA_ONDA + 1).ativo).toBe(false);
    expect(camadasVivas(estado(2, 0), [onda], Number.POSITIVE_INFINITY)).toEqual({ camadas: [], ativo: false });
  });

  it('mais chamados, coluna mais alta; grupo menor, câmera mais perto', () => {
    expect(alturaDaColuna(743)).toBeGreaterThan(alturaDaColuna(54));
    expect(zoomDoIncidente({ raio: 140 })).toBeGreaterThan(zoomDoIncidente({ raio: 1500 }));
    expect(zoomDoIncidente({ raio: 5 })).toBeLessThanOrEqual(15.5);
  });
});

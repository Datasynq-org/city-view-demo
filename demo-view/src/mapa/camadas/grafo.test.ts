import { describe, expect, it } from 'vitest';
import { agrupar, calcularLigacoes, gerarChamados } from '../../inteligencia/agrupamento';
import { alturaDaColuna, arco, camadasDoGrafo, camadasVivas, chegadosAte, chegadosPorIncidente, DURACAO_DA_ONDA, type Etapa, jaExistia, pontoNoArco, prepararGrafo, zoomDoIncidente } from './grafo';

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
    expect(ids(estado(0))).toEqual(['grafo-avulsos', 'grafo-halo', 'grafo-chamados']);
    expect(ids(estado(1))).toEqual(['grafo-ligacoes', 'grafo-nos', 'grafo-avulsos', 'grafo-halo', 'grafo-chamados']);
    expect(ids(estado(2))).toEqual(['grafo-ligacoes', 'grafo-avulsos', 'grafo-halo', 'grafo-chamados', 'grafo-colunas', 'grafo-numeros']);
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

describe('voltar no tempo no grafo', () => {
  it('sem corte, tudo existe; com corte, só o que chegou antes', () => {
    expect(jaExistia(3, null)).toBe(true);
    expect(jaExistia(3, 2)).toBe(true);
    expect(jaExistia(1, 2)).toBe(false);
    expect(chegadosAte(base, null)).toBeCloseTo(resultado.total);
    expect(chegadosAte(base, 1e9)).toBe(0);
    expect(chegadosAte(base, 24)).toBeLessThan(chegadosAte(base, 6));
  });

  it('o arco só existe quando os dois chamados que ele liga já chegaram', () => {
    for (const a of base.arcos.slice(0, 200)) expect(a.desde).toBeGreaterThanOrEqual(0);
    const maisNovo = Math.min(...base.pontos.map((p) => p.horas));
    expect(base.arcos.every((a) => a.desde >= maisNovo)).toBe(true);
  });

  it('o incidente se forma: cresce com os chamados que chegam e some antes do segundo', () => {
    const agora = chegadosPorIncidente(base, resultado, null);
    resultado.incidentes.forEach((inc, k) => expect(agora[k]!.chamados).toBeCloseTo(inc.chamados));
    const inc = resultado.incidentes[0]!;
    const horas = inc.membros.map((m) => chamados[m]!.horas).sort((x, y) => y - x);
    // Logo depois do primeiro chamado, só há um ponto: ainda não é incidente.
    const cedo = chegadosPorIncidente(base, resultado, (horas[0]! + horas[1]!) / 2)[0]!;
    expect(cedo.pontos).toBe(1);
    const meio = chegadosPorIncidente(base, resultado, horas[Math.floor(horas.length / 2)]!)[0]!;
    expect(meio.chamados).toBeGreaterThan(cedo.chamados);
    expect(meio.chamados).toBeLessThan(inc.chamados);
    // No mapa: sem coluna enquanto não se formou.
    const colunasEm = (corte: number) => (camadasDoGrafo({ ...estado(2), corte }).find((c) => c.id === 'grafo-colunas')!.props.data as unknown[]).length;
    expect(colunasEm(1e9)).toBe(0);
    expect(colunasEm(0)).toBe(resultado.incidentes.length);
  });
});

describe('com volume, a tinta vai para o que foi agrupado', () => {
  const dados = (e: ReturnType<typeof estado>, id: string) => camadasDoGrafo(e).find((c) => c.id === id)!.props.data as unknown[];

  it('antes de agrupar, todo chamado é um ponto pequeno, sem brilho', () => {
    expect(dados(estado(0), 'grafo-avulsos')).toHaveLength(chamados.length);
    expect(dados(estado(0), 'grafo-halo')).toHaveLength(0);
    expect(dados(estado(0), 'grafo-chamados')).toHaveLength(0);
  });

  it('depois, só quem está num incidente leva brilho; avulso e agrupado somam todos', () => {
    const agrupados = resultado.incidentes.reduce((s, i) => s + i.membros.length, 0);
    expect(dados(estado(1), 'grafo-halo')).toHaveLength(agrupados);
    expect(dados(estado(1), 'grafo-chamados')).toHaveLength(agrupados);
    expect(dados(estado(1), 'grafo-avulsos')).toHaveLength(chamados.length - agrupados);
  });

  it('descartar um incidente devolve os chamados dele aos avulsos', () => {
    const k = 0;
    const antes = dados(estado(1), 'grafo-avulsos').length;
    expect(dados(estado(1, -1, [k]), 'grafo-avulsos')).toHaveLength(antes + resultado.incidentes[k]!.membros.length);
  });
});

/**
 * A Inteligência com as duas fontes juntas: a cidade simulada (o DF inteiro,
 * com os casos escritos pela equipe) e os relatos REAIS de Águas Claras
 * (`dados/aguasClaras/`). Mesmo mapa, mesma lista; cada incidente diz de onde
 * vem (`ehReal`, em `reais.ts`).
 *
 * As duas não se misturam na conta: cada uma é ligada e agrupada pela sua
 * regra (`agrupamento.ts` e `reais.ts`), e só depois os incidentes vão para a
 * mesma fila, por urgência. Um relato real nunca entra num caso simulado, nem o
 * contrário. Os códigos dos incidentes reais começam com "AC-".
 * Funções puras.
 */
import { agrupar, calcularLigacoes, type Chamado, gerarChamados, type Incidente, type Ligacao, limiarDaSensibilidade, type Resultado, SENSIBILIDADE_PADRAO } from './agrupamento';
import { agruparReais, chamadosReais, ligacoesReais } from './reais';

export interface Tudo {
  chamados: Chamado[];
  /** Quantos dos chamados, do começo da lista, são da cidade simulada. Os demais são relatos reais. */
  simulados: number;
}

export function chamadosJuntos(): Tudo {
  const sim = gerarChamados();
  return { chamados: [...sim, ...chamadosReais()], simulados: sim.length };
}

/** O relato de índice `i` é real? */
export const ehRelatoReal = (t: Pick<Tudo, 'simulados'>, i: number) => i >= t.simulados;

const deslocar = (l: Ligacao, n: number): Ligacao => ({ ...l, a: l.a + n, b: l.b + n });

/** As ligações de cada fonte, calculadas em separado, com os índices da lista junta. */
export function ligacoesJuntas(t: Tudo): { simuladas: Ligacao[]; reais: Ligacao[] } {
  return {
    simuladas: calcularLigacoes(t.chamados.slice(0, t.simulados)),
    reais: ligacoesReais(t.chamados.slice(t.simulados)).map((l) => deslocar(l, t.simulados)),
  };
}

export function agruparJuntos(t: Tudo, lig: { simuladas: Ligacao[]; reais: Ligacao[] }, limiar: number): Resultado {
  const n = t.simulados;
  const sim = agrupar(t.chamados.slice(0, n), lig.simuladas, limiar);
  const real = agruparReais(
    t.chamados.slice(n),
    lig.reais.map((l) => deslocar(l, -n)),
    limiar,
  );
  const reais: Incidente[] = real.incidentes.map((i, k) => ({ ...i, codigo: `AC-${String(k + 1).padStart(2, '0')}`, membros: i.membros.map((m) => m + n) }));
  const incidentes = [...sim.incidentes, ...reais].sort((a, b) => b.urgencia - a.urgencia || b.chamados - a.chamados);
  const grupo = new Int32Array(t.chamados.length).fill(-1);
  incidentes.forEach((inc, k) => inc.membros.forEach((i) => (grupo[i] = k)));
  return { grupo, incidentes, ligacoes: [...sim.ligacoes, ...real.ligacoes.map((l) => deslocar(l, n))], total: sim.total + real.total, avulsos: sim.avulsos + real.avulsos };
}

let guardado: Resultado | null = null;

/** O resultado com a sensibilidade padrão, calculado uma vez: é o que a sala e o resumo mostram. */
export function resultadoPadrao(): Resultado {
  if (!guardado) {
    const t = chamadosJuntos();
    guardado = agruparJuntos(t, ligacoesJuntas(t), limiarDaSensibilidade(SENSIBILIDADE_PADRAO));
  }
  return guardado;
}

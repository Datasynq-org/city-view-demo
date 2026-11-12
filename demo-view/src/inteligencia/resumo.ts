/**
 * O resumo do painel de insights: quantos chamados viraram quantos incidentes,
 * o que isso poupa, e os filtros da grade. Funções puras.
 */
import type { Incidente, Resultado } from './agrupamento';
import type { Severidade, TipoCaso } from './casos';
import { decisaoDe, type Decisoes, type Situacao } from './decisoes';

export interface Resumo {
  /** Chamados reais (soma dos pesos) e quantos entraram em algum incidente. */
  chamados: number;
  agrupados: number;
  incidentes: number;
  /** Atendimentos repetidos que deixam de existir: em cada incidente, todos menos um. */
  evitados: number;
  /** Incidentes que cruzam mais de um órgão: o que nenhum deles vê sozinho. */
  entreOrgaos: number;
  /** Incidentes que cruzam o relato do cidadão com a operação dos sistemas dos órgãos. */
  comOperacao: number;
  porSeveridade: Record<Severidade, number>;
  porSituacao: Record<Situacao, number>;
}

export function resumir(r: Resultado, decisoes: Decisoes = {}): Resumo {
  const porSeveridade: Record<Severidade, number> = { crítico: 0, sério: 0, atenção: 0 };
  const porSituacao: Record<Situacao, number> = { sugerido: 0, enviando: 0, confirmado: 0, descartado: 0 };
  let agrupados = 0;
  let evitados = 0;
  for (const i of r.incidentes) {
    porSeveridade[i.severidade]++;
    const situacao = decisaoDe(decisoes, i.codigo).situacao;
    porSituacao[situacao]++;
    // O que foi descartado por uma pessoa volta a ser chamado avulso: não poupa nada.
    if (situacao === 'descartado') continue;
    agrupados += i.chamados;
    evitados += Math.max(0, i.chamados - 1);
  }
  return {
    chamados: r.total,
    agrupados,
    incidentes: r.incidentes.length,
    evitados,
    entreOrgaos: r.incidentes.filter((i) => i.orgaos.length > 1).length,
    comOperacao: r.incidentes.filter((i) => i.evidencias.some((e) => e.fonte === 'operação')).length,
    porSeveridade,
    porSituacao,
  };
}

export interface FiltroDeInsights {
  severidade: Severidade | null;
  tipo: TipoCaso | null;
  orgao: string | null;
}

export const SEM_FILTRO: FiltroDeInsights = { severidade: null, tipo: null, orgao: null };

/** Os incidentes que passam no filtro, com o índice de cada um na fila. */
export function filtrarInsights(incidentes: readonly Incidente[], f: FiltroDeInsights): { inc: Incidente; k: number }[] {
  return incidentes
    .map((inc, k) => ({ inc, k }))
    .filter(({ inc }) => (!f.severidade || inc.severidade === f.severidade) && (!f.tipo || inc.tipoDoCaso === f.tipo) && (!f.orgao || inc.orgaos.includes(f.orgao) || inc.evidencias.some((e) => e.orgaoId === f.orgao)));
}

/** Os tipos de caso e os órgãos que aparecem na fila, para montar os filtros. */
export function opcoesDeFiltro(incidentes: readonly Incidente[]): { tipos: TipoCaso[]; orgaos: string[] } {
  const tipos = [...new Set(incidentes.map((i) => i.tipoDoCaso).filter((t): t is TipoCaso => t !== null))];
  const conta = new Map<string, number>();
  for (const i of incidentes) for (const o of new Set(i.evidencias.map((e) => e.orgaoId))) conta.set(o, (conta.get(o) ?? 0) + 1);
  return { tipos, orgaos: [...conta].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([o]) => o) };
}

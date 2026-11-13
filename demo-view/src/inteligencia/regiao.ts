/**
 * O que a Inteligência sabe de uma região, para o cartão que aparece sobre ela
 * quando é escolhida no seletor: os chamados que caem dentro do limite da
 * região, quantos viraram incidente, e, onde há dado real (Águas Claras),
 * quantos relatos seguem abertos.
 *
 * Um chamado é da região quando o ponto dele cai dentro do limite oficial. Um
 * incidente é da região pelo `raId` dele, como na fila. Funções puras.
 */
import { DEMANDAS, estaAberta } from '../dados/aguasClaras/demandas';
import { dentroDaRegiao, REGIAO_POR_ID } from '../dominio/ras';
import type { Chamado, Resultado } from './agrupamento';
import type { Severidade } from './casos';
import { ehReal } from './reais';

export interface ResumoDaRegiao {
  ra: string;
  nome: string;
  populacao: number;
  /** Chamados com o ponto dentro da região (soma dos pesos), e quantos são relatos reais. */
  chamados: number;
  reais: number;
  /** Dos chamados da região, quantos estão em algum incidente. */
  agrupados: number;
  /** Chamados por 10 mil habitantes. */
  por10mil: number;
  incidentes: number;
  porSeveridade: Record<Severidade, number>;
  /** Incidentes feitos de relatos reais. */
  incidentesReais: number;
  /** Só para o dado real: relatos abertos e finalizados na região. `null` onde não há dado real. */
  relatos: { abertos: number; finalizados: number } | null;
  /** Os órgãos com mais chamados na região, do maior ao menor. */
  porOrgao: { orgaoId: string; chamados: number }[];
}

/**
 * `simulados` diz quantos dos chamados, do começo da lista, são da cidade
 * simulada (ver `juntos.ts`); os demais são relatos reais.
 */
export function resumoDaRegiao(raId: string, chamados: readonly Chamado[], resultado: Resultado, simulados: number): ResumoDaRegiao | null {
  const ra = REGIAO_POR_ID[raId];
  if (!ra) return null;
  let total = 0;
  let reais = 0;
  let agrupados = 0;
  const porOrgao = new Map<string, number>();
  chamados.forEach((c, i) => {
    if (!dentroDaRegiao(ra, c.ponto[0], c.ponto[1])) return;
    total += c.peso;
    if (i >= simulados) reais += c.peso;
    if ((resultado.grupo[i] ?? -1) >= 0) agrupados += c.peso;
    porOrgao.set(c.orgaoId, (porOrgao.get(c.orgaoId) ?? 0) + c.peso);
  });
  const daRegiao = resultado.incidentes.filter((i) => i.raId === raId);
  const porSeveridade: Record<Severidade, number> = { crítico: 0, sério: 0, atenção: 0 };
  for (const i of daRegiao) porSeveridade[i.severidade]++;
  // Os relatos reais da região, pelo status do site.
  let abertos = 0;
  let finalizados = 0;
  for (const d of DEMANDAS) {
    if (!d.ponto || !dentroDaRegiao(ra, d.ponto[0], d.ponto[1])) continue;
    if (estaAberta(d)) abertos++;
    else finalizados++;
  }
  return {
    ra: raId,
    nome: ra.nome,
    populacao: ra.populacao,
    chamados: total,
    reais,
    agrupados,
    por10mil: ra.populacao > 0 ? (total / ra.populacao) * 10_000 : 0,
    incidentes: daRegiao.length,
    porSeveridade,
    incidentesReais: daRegiao.filter(ehReal).length,
    relatos: abertos + finalizados > 0 ? { abertos, finalizados } : null,
    porOrgao: [...porOrgao].map(([orgaoId, n]) => ({ orgaoId, chamados: n })).sort((a, b) => b.chamados - a.chamados),
  };
}

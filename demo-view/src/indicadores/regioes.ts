/**
 * As 37 regiões administrativas, lado a lado: quem tem mais chamados para o
 * tamanho que tem, quem espera mais, e o perfil de cada uma contra o DF.
 * Funções puras sobre os incidentes SIMULADOS; a população é a do Censo 2022
 * (`dominio/ras.ts`).
 */
import { estaAberto, type Incidente } from '../dominio/incidente';
import { type AreaId, AREAS } from '../dominio/orgaos';
import { POPULACAO_TOTAL, REGIOES } from '../dominio/ras';
import { percentualNoPrazo, tempoAteResolver, tiposMaisFrequentes } from './indicadores';

export interface PerfilDaRa {
  ra: string;
  chamados: number;
  por10mil: number;
  abertos: number;
  /** Mediana, em horas, até resolver. */
  tempo: number | null;
  noPrazo: number | null;
}

const perfilDe = (ra: string, populacao: number, lista: readonly Incidente[]): PerfilDaRa => ({
  ra,
  chamados: lista.length,
  por10mil: populacao > 0 ? (lista.length / populacao) * 10_000 : 0,
  abertos: lista.filter((i) => estaAberto(i.situacao)).length,
  tempo: tempoAteResolver(lista),
  noPrazo: percentualNoPrazo(lista),
});

/** O perfil de cada RA (na ordem de `REGIOES`) e o do DF inteiro, para comparar. */
export function perfis(incidentes: readonly Incidente[]): { regioes: PerfilDaRa[]; df: PerfilDaRa } {
  const grupos = new Map<string, Incidente[]>(REGIOES.map((r) => [r.id, []]));
  for (const i of incidentes) grupos.get(i.local.raId)?.push(i);
  return { regioes: REGIOES.map((r) => perfilDe(r.id, r.populacao, grupos.get(r.id)!)), df: perfilDe('df', POPULACAO_TOTAL, incidentes) };
}

export type Medida = 'por10mil' | 'chamados' | 'tempo' | 'noPrazo';

export const MEDIDAS: { id: Medida; nome: string; nota: string }[] = [
  { id: 'por10mil', nome: 'Por 10 mil hab.', nota: 'Chamados por 10 mil habitantes: compara regiões de tamanhos diferentes' },
  { id: 'chamados', nome: 'Chamados', nota: 'Total de chamados no período' },
  { id: 'tempo', nome: 'Tempo de espera', nota: 'Mediana, em horas, até resolver' },
  { id: 'noPrazo', nome: 'No prazo', nota: 'Dos resolvidos, a parte dentro do prazo' },
];

/** As RAs em ordem, da maior para a menor na medida (no prazo: da pior para a melhor). Sem dado, no fim. */
export function ranking(regioes: readonly PerfilDaRa[], medida: Medida): PerfilDaRa[] {
  const v = (p: PerfilDaRa) => p[medida];
  const com = regioes.filter((p) => v(p) !== null);
  const sem = regioes.filter((p) => v(p) === null);
  com.sort((a, b) => (medida === 'noPrazo' ? v(a)! - v(b)! : v(b)! - v(a)!));
  return [...com, ...sem];
}

/** De onde vêm os chamados de um conjunto: a parte de cada área, da maior à menor. */
export function composicao(incidentes: readonly Incidente[]): { area: AreaId; nome: string; chamados: number; parte: number }[] {
  const conta = new Map<AreaId, number>();
  for (const i of incidentes) conta.set(i.area, (conta.get(i.area) ?? 0) + 1);
  return AREAS.map((a) => ({ area: a.id, nome: a.curto, chamados: conta.get(a.id) ?? 0, parte: incidentes.length ? (conta.get(a.id) ?? 0) / incidentes.length : 0 })).sort((a, b) => b.chamados - a.chamados);
}

export { tiposMaisFrequentes };

/** Limites que dividem os valores em `classes` grupos do mesmo tamanho (quantis). */
export function quebras(valores: number[], classes: number): number[] {
  const v = valores.filter(Number.isFinite).sort((a, b) => a - b);
  if (!v.length) return [];
  return Array.from({ length: classes - 1 }, (_, i) => v[Math.floor(((i + 1) / classes) * (v.length - 1))]!);
}

/** Em que grupo cai `v` (0 = o mais baixo). */
export function classe(v: number, limites: number[]): number {
  const i = limites.findIndex((l) => v <= l);
  return i === -1 ? limites.length : i;
}

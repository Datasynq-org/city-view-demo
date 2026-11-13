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

const SEMANA = 7 * 86_400_000;
/** Semanas anteriores que fazem o "normal" de cada região. */
export const SEMANAS_DE_BASE = 3;
/** Abaixo disto a região tem chamados de menos para a razão dizer alguma coisa. */
export const MINIMO_PARA_COMPARAR = 12;

export interface ForaDoNormal {
  /** Chamados nos últimos 7 dias e a média semanal das semanas anteriores. */
  atual: number;
  esperado: number;
  /**
   * atual ÷ esperado, descontado o que mudou no DF inteiro: 1,3 = 30% acima do
   * normal da própria região. `null` quando a região tem chamados de menos.
   */
  razao: number | null;
  /** Saiu do normal de verdade: a alta é maior que o vaivém esperado para o tamanho da região. */
  fora: boolean;
}

/** A alta precisa passar disto (8%) e de dois desvios do acaso para contar. */
export const ALTA_MINIMA = 1.08;

/**
 * Cada região contra ela mesma (CV-DEM-002, V7): os últimos 7 dias contra a
 * média das semanas anteriores. Mostra onde **mudou**, não onde mora mais gente.
 *
 * Duas correções, para não acender o mapa inteiro: o que subiu no DF todo é
 * descontado (uma semana de chuva sobe todas as regiões), e a alta só conta
 * quando passa do vaivém do acaso (região pequena oscila muito sozinha).
 */
export function foraDoNormal(incidentes: readonly Incidente[], agora: number, area: string | null = null): Map<string, ForaDoNormal> {
  const atual = new Map<string, number>();
  const antes = new Map<string, number>();
  const inicio = agora - SEMANA;
  const base = inicio - SEMANAS_DE_BASE * SEMANA;
  for (const i of incidentes) {
    if (i.criadoEm > agora || i.criadoEm < base || (area !== null && i.area !== area)) continue;
    const m = i.criadoEm >= inicio ? atual : antes;
    m.set(i.local.raId, (m.get(i.local.raId) ?? 0) + 1);
  }
  const soma = (m: Map<string, number>) => [...m.values()].reduce((s, v) => s + v, 0);
  const esperadoDf = soma(antes) / SEMANAS_DE_BASE;
  // Quanto o DF inteiro mudou: é o que se espera de cada região, sem novidade nenhuma.
  const doDf = esperadoDf > 0 ? soma(atual) / esperadoDf : 1;
  return new Map(
    REGIOES.map((r) => {
      const a = atual.get(r.id) ?? 0;
      const e = ((antes.get(r.id) ?? 0) / SEMANAS_DE_BASE) * doDf;
      const razao = e >= MINIMO_PARA_COMPARAR ? a / e : null;
      return [r.id, { atual: a, esperado: e, razao, fora: razao !== null && razao >= ALTA_MINIMA && a - e >= 2 * Math.sqrt(e) }];
    }),
  );
}

/**
 * Quanto o DF inteiro mudou: os últimos 7 dias sobre a média das semanas
 * anteriores (0,11 = 11% acima). `null` sem base. É o "o que mudou?" mais simples.
 */
export function mudancaDoDf(incidentes: readonly Incidente[], agora: number): number | null {
  let atual = 0;
  let antes = 0;
  const inicio = agora - SEMANA;
  const base = inicio - SEMANAS_DE_BASE * SEMANA;
  for (const i of incidentes) {
    if (i.criadoEm > agora || i.criadoEm < base) continue;
    if (i.criadoEm >= inicio) atual++;
    else antes++;
  }
  return antes > 0 ? atual / (antes / SEMANAS_DE_BASE) - 1 : null;
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

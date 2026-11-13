/**
 * Velocidade da gestão (I4, CV-DEM-001 seção 6): "uma ferramenta que vai te dar
 * condição de ver a velocidade da sua gestão. E ver como a sua gestão realmente
 * está" (ATA 147–148). E a visão de cada gestor: "o cara da CAESB quer ter uma
 * visão do que diz respeito a ele" (ATA 223–224).
 *
 * Funções puras sobre os incidentes SIMULADOS. A velocidade é medida de dois
 * jeitos, definidos pela equipe: a mediana do tempo até resolver e a parte dos
 * resolvidos que ficou dentro do prazo do tipo.
 */
import { inicioDoDia } from '../dados/gerador';
import { estaAberto, type Incidente, type Instante } from '../dominio/incidente';
import { type AreaId, ORGAOS, TIPO_POR_ID } from '../dominio/orgaos';
import { percentualNoPrazo, tempoAteResolver } from './indicadores';

const HORA = 3_600_000;
const DIA = 24 * HORA;

/** De quem se fala: todas as áreas, uma área, um órgão, uma RA. */
export interface Recorte {
  area?: AreaId | null;
  orgaoId?: string | null;
  ra?: string | null;
}

export const noRecorte = (i: Incidente, r: Recorte) => (!r.area || i.area === r.area) && (!r.orgaoId || i.orgaoId === r.orgaoId) && (!r.ra || i.local.raId === r.ra);

/** Os incidentes abertos em [de, ate), no recorte. */
export const entre = (incidentes: readonly Incidente[], de: Instante, ate: Instante, r: Recorte = {}) => incidentes.filter((i) => i.criadoEm >= de && i.criadoEm < ate && noRecorte(i, r));

export interface Medida {
  chamados: number;
  /** Mediana, em horas, até resolver. */
  tempo: number | null;
  /** Parte dos resolvidos dentro do prazo, de 0 a 1. */
  noPrazo: number | null;
}

export const medir = (incidentes: readonly Incidente[]): Medida => ({ chamados: incidentes.length, tempo: tempoAteResolver(incidentes), noPrazo: percentualNoPrazo(incidentes) });

export interface Comparacao {
  atual: Medida;
  anterior: Medida;
  /** Variação do tempo até resolver, em fração (−0,1 = 10% mais rápida). */
  tempo: number | null;
  /** Variação do % no prazo, em pontos percentuais. */
  noPrazo: number | null;
  /** A gestão acelerou, desacelerou ou ficou igual (menos de 3% e de 1 ponto). */
  leitura: 'mais rápida' | 'mais lenta' | 'estável' | 'sem comparação';
}

/** O incidente como era em `quando`: o que foi resolvido depois ainda estava aberto. */
export function comoEm(i: Incidente, quando: Instante): Incidente {
  if (i.resolvidoEm === undefined || i.resolvidoEm <= quando) return i;
  const { resolvidoEm: _depois, ...resto } = i;
  return { ...resto, situacao: 'em-atendimento' };
}

/**
 * Os últimos `dias` dias (contando hoje) contra os `dias` anteriores.
 *
 * Os dois períodos são medidos com a mesma idade: o anterior entra como estava
 * há `dias` dias. Sem isso, o período atual pareceria sempre mais rápido, porque
 * dele só os chamados fáceis já foram resolvidos, e do anterior quase todos.
 */
export function comparar(incidentes: readonly Incidente[], agora: Instante, dias: number, r: Recorte = {}): Comparacao {
  const fim = inicioDoDia(agora) + DIA;
  const atual = medir(entre(incidentes, fim - dias * DIA, fim, r));
  const anterior = medir(entre(incidentes, fim - 2 * dias * DIA, fim - dias * DIA, r).map((i) => comoEm(i, agora - dias * DIA)));
  const tempo = atual.tempo !== null && anterior.tempo ? atual.tempo / anterior.tempo - 1 : null;
  const noPrazo = atual.noPrazo !== null && anterior.noPrazo !== null ? (atual.noPrazo - anterior.noPrazo) * 100 : null;
  let leitura: Comparacao['leitura'] = 'sem comparação';
  if (tempo !== null && noPrazo !== null) {
    // O prazo cumprido pesa primeiro; o tempo desempata.
    if (noPrazo >= 1 || (Math.abs(noPrazo) < 1 && tempo <= -0.03)) leitura = 'mais rápida';
    else if (noPrazo <= -1 || tempo >= 0.03) leitura = 'mais lenta';
    else leitura = 'estável';
  }
  return { atual, anterior, tempo, noPrazo, leitura };
}

const pts = (v: number) => `${Math.abs(v).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ponto${Math.abs(v) < 2 ? '' : 's'}`;

/**
 * A comparação em uma frase que diz as duas medidas (CV-DEM-002, V1): o prazo
 * cumprido e o tempo até resolver podem andar em sentidos diferentes, e a frase
 * não escolhe um deles. Os limites são os mesmos de `comparar`.
 */
export function leituraEmFrase(c: Comparacao): string {
  if (c.tempo === null || c.noPrazo === null) return 'Ainda não há período anterior para comparar.';
  const prazo = c.noPrazo >= 1 ? `resolve mais dentro do prazo (${pts(c.noPrazo)} a mais)` : c.noPrazo <= -1 ? `resolve menos dentro do prazo (${pts(c.noPrazo)} a menos)` : 'cumpre o prazo como no período anterior';
  const pct = `${Math.round(Math.abs(c.tempo) * 100)}%`;
  const tempo = c.tempo <= -0.03 ? `leva ${pct} menos tempo para resolver` : c.tempo >= 0.03 ? `leva ${pct} mais tempo para resolver` : 'leva o mesmo tempo para resolver';
  const mesmoSentido = (c.noPrazo >= 1 && c.tempo <= -0.03) || (c.noPrazo <= -1 && c.tempo >= 0.03) || (Math.abs(c.noPrazo) < 1 && Math.abs(c.tempo) < 0.03);
  return `A gestão ${prazo}${mesmoSentido ? ' e ' : ', mas '}${tempo}.`;
}

export interface Dia {
  /** 00:00 de Brasília. */
  dia: Instante;
  chamados: number;
  /** Chamados do dia cujo prazo já venceu: só eles dizem se o prazo foi cumprido. */
  vencidos: number;
  /** Dos vencidos, a parte resolvida dentro do prazo. `null` com poucos vencidos. */
  noPrazo: number | null;
}

/** Com menos vencidos que isto no dia, o percentual não é mostrado. */
export const MINIMO_DE_VENCIDOS = 20;

/**
 * O prazo cumprido, medido só nos chamados cujo prazo já venceu: aí a conta é
 * exata, e não depende de quem ainda vai ser resolvido.
 */
export function cumprimentoDoPrazo(incidentes: readonly Incidente[], agora: Instante): { vencidos: number; noPrazo: number | null } {
  let vencidos = 0;
  let noPrazo = 0;
  for (const i of incidentes) {
    const prazo = TIPO_POR_ID[i.tipoId]?.prazoHoras;
    if (prazo === undefined || i.situacao === 'cancelado' || i.criadoEm + prazo * HORA > agora) continue;
    vencidos++;
    if (i.resolvidoEm !== undefined && i.resolvidoEm - i.criadoEm <= prazo * HORA) noPrazo++;
  }
  return { vencidos, noPrazo: vencidos >= MINIMO_DE_VENCIDOS ? noPrazo / vencidos : null };
}

/** Dia a dia, pelos chamados abertos em cada dia (do mais antigo a hoje): o volume e o prazo cumprido. */
export function porDia(incidentes: readonly Incidente[], agora: Instante, dias: number, r: Recorte = {}): Dia[] {
  const hoje = inicioDoDia(agora);
  const grupos: Incidente[][] = Array.from({ length: dias }, () => []);
  for (const i of incidentes) {
    if (!noRecorte(i, r)) continue;
    const k = dias - 1 - Math.floor((hoje - inicioDoDia(i.criadoEm)) / DIA);
    if (k >= 0 && k < dias) grupos[k]!.push(i);
  }
  return grupos.map((g, k) => ({ dia: hoje - (dias - 1 - k) * DIA, chamados: g.length, ...cumprimentoDoPrazo(g, agora) }));
}

/** Abertos há mais tempo que o prazo do tipo: o que já estourou e ainda espera. */
export function foraDoPrazo(incidentes: readonly Incidente[], agora: Instante): number {
  let n = 0;
  for (const i of incidentes) {
    const prazo = TIPO_POR_ID[i.tipoId]?.prazoHoras;
    if (estaAberto(i.situacao) && prazo !== undefined && agora - i.criadoEm > prazo * HORA) n++;
  }
  return n;
}

/** Raio e janela em que dois chamados do mesmo tipo provavelmente falam do mesmo fato. */
export const PERTO_M = 150;
export const JANELA_H = 24;

/**
 * Chamados repetidos: os que têm outro do mesmo tipo, mais antigo, a menos de
 * 150 m e de 24 horas. É o que o City View agruparia num incidente só. Regra da
 * equipe, mais simples que o agrupamento da inteligência, para valer na base inteira.
 */
export function repetidos(incidentes: readonly Incidente[]): number {
  // Grade de células do tamanho do raio: só se compara com as células vizinhas.
  const grausLat = PERTO_M / 110_540;
  const grausLon = PERTO_M / (111_320 * Math.cos((15.8 * Math.PI) / 180));
  const celulas = new Map<string, Incidente[]>();
  const emOrdem = [...incidentes].sort((a, b) => a.criadoEm - b.criadoEm);
  let n = 0;
  for (const i of emOrdem) {
    const cx = Math.floor(i.local.lon / grausLon);
    const cy = Math.floor(i.local.lat / grausLat);
    let repetido = false;
    for (let dx = -1; dx <= 1 && !repetido; dx++) {
      for (let dy = -1; dy <= 1 && !repetido; dy++) {
        const lista = celulas.get(`${i.tipoId}|${cx + dx}|${cy + dy}`);
        if (!lista) continue;
        for (let k = lista.length - 1; k >= 0; k--) {
          const o = lista[k]!;
          if (i.criadoEm - o.criadoEm > JANELA_H * HORA) break;
          const mx = (i.local.lon - o.local.lon) * 111_320 * Math.cos((i.local.lat * Math.PI) / 180);
          const my = (i.local.lat - o.local.lat) * 110_540;
          if (Math.hypot(mx, my) <= PERTO_M) {
            repetido = true;
            break;
          }
        }
      }
    }
    if (repetido) n++;
    const chave = `${i.tipoId}|${cx}|${cy}`;
    (celulas.get(chave) ?? celulas.set(chave, []).get(chave)!).push(i);
  }
  return n;
}

export interface LinhaDoOrgao {
  orgaoId: string;
  chamados: number;
  abertos: number;
  foraDoPrazo: number;
  repetidos: number;
  tempo: number | null;
  noPrazo: number | null;
  /** Variação do % no prazo contra o período anterior, em pontos. */
  variacao: number | null;
  /** Chamados por dia no período, para a minilinha. */
  serie: number[];
}

/** A tabela dos órgãos no período: o que cada gestor veria da sua fila. */
export function porOrgao(incidentes: readonly Incidente[], agora: Instante, dias: number, r: Recorte = {}): LinhaDoOrgao[] {
  const fim = inicioDoDia(agora) + DIA;
  return ORGAOS.filter((o) => !r.area || o.area === r.area).map((o) => {
    const recorte = { ...r, orgaoId: o.id };
    const doPeriodo = entre(incidentes, fim - dias * DIA, fim, recorte);
    const c = comparar(incidentes, agora, dias, recorte);
    return {
      orgaoId: o.id,
      chamados: doPeriodo.length,
      abertos: doPeriodo.filter((i) => estaAberto(i.situacao)).length,
      foraDoPrazo: foraDoPrazo(doPeriodo, agora),
      repetidos: repetidos(doPeriodo),
      tempo: c.atual.tempo,
      noPrazo: c.atual.noPrazo,
      variacao: c.noPrazo,
      serie: porDia(incidentes, agora, dias, recorte).map((d) => d.chamados),
    };
  });
}

export interface LinhaDoTipo {
  tipoId: string;
  nome: string;
  prazoHoras: number;
  chamados: number;
  tempo: number | null;
  noPrazo: number | null;
  repetidos: number;
}

/** Os tipos de um conjunto de incidentes, do mais ao menos frequente. */
export function porTipo(incidentes: readonly Incidente[]): LinhaDoTipo[] {
  const grupos = new Map<string, Incidente[]>();
  for (const i of incidentes) (grupos.get(i.tipoId) ?? grupos.set(i.tipoId, []).get(i.tipoId)!).push(i);
  return [...grupos]
    .map(([tipoId, lista]) => {
      const t = TIPO_POR_ID[tipoId];
      return { tipoId, nome: t?.nome ?? tipoId, prazoHoras: t?.prazoHoras ?? 0, ...medir(lista), repetidos: repetidos(lista) };
    })
    .sort((a, b) => b.chamados - a.chamados);
}

/** As RAs com mais chamados num conjunto, da maior à menor. */
export function porRegiao(incidentes: readonly Incidente[], n = 6): { ra: string; chamados: number }[] {
  const conta = new Map<string, number>();
  for (const i of incidentes) conta.set(i.local.raId, (conta.get(i.local.raId) ?? 0) + 1);
  return [...conta].map(([ra, chamados]) => ({ ra, chamados })).sort((a, b) => b.chamados - a.chamados).slice(0, n);
}

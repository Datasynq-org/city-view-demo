/**
 * Indicadores da sala de guerra (I1, CV-DEM-001 seção 6): o que a governadora vê
 * no telão. Só funções puras sobre a base SIMULADA (`dados/gerador.ts`).
 *
 * "Ver a velocidade da sua gestão" (ATA 147–148): tempo até resolver e % no prazo.
 * "Todos os chamados agrupados e classificados num mapa de calor" (ATA 220–222):
 * filtros por período e por área, que alimentam o mapa e os números juntos.
 */
import { type BaseSimulada, indiceDaContagem, inicioDoDia } from '../dados/gerador';
import { estaAberto, type Incidente, type Instante } from '../dominio/incidente';
import { type AreaId, AREAS, TIPO_POR_ID, TIPOS } from '../dominio/orgaos';
import { REGIOES } from '../dominio/ras';

const HORA_MS = 3_600_000;
const DIA_MS = 24 * HORA_MS;

export type Periodo = 'hoje' | '7d' | '30d';

export const PERIODOS: { id: Periodo; nome: string; dias: number }[] = [
  { id: 'hoje', nome: 'Hoje', dias: 1 },
  { id: '7d', nome: '7 dias', dias: 7 },
  { id: '30d', nome: '30 dias', dias: 30 },
];

export interface Filtro {
  periodo: Periodo;
  /** `null` = todas as áreas. */
  area: AreaId | null;
  /** RA escolhida no mapa (`null` ou ausente = o DF inteiro). */
  ra?: string | null;
}

/** 00:00 de Brasília do primeiro dia do período (hoje conta como um dia). */
export function inicioDoPeriodo(agora: Instante, periodo: Periodo): Instante {
  const dias = PERIODOS.find((p) => p.id === periodo)!.dias;
  return inicioDoDia(agora) - (dias - 1) * DIA_MS;
}

/** Incidentes abertos no período e, se houver, na área e na RA. A base vem em ordem de criação. */
export function filtrar(incidentes: readonly Incidente[], agora: Instante, filtro: Filtro): Incidente[] {
  const inicio = inicioDoPeriodo(agora, filtro.periodo);
  const ra = filtro.ra ?? null;
  return incidentes.filter(
    (i) => i.criadoEm >= inicio && i.criadoEm <= agora && (filtro.area === null || i.area === filtro.area) && (ra === null || i.local.raId === ra),
  );
}

/** Ainda dependem de alguém agir, em toda a janela detalhada (não só no período). */
export function abertosAgora(incidentes: readonly Incidente[], area: AreaId | null = null, ra: string | null = null): number {
  let n = 0;
  for (const i of incidentes) if (estaAberto(i.situacao) && (area === null || i.area === area) && (ra === null || i.local.raId === ra)) n++;
  return n;
}

const horasAteResolver = (i: Incidente) => (i.resolvidoEm === undefined ? undefined : (i.resolvidoEm - i.criadoEm) / HORA_MS);

/** O valor abaixo do qual fica a fração `q` (0 a 1) dos números, com interpolação. Ordena `v` no lugar. */
export function quantil(v: Float64Array, q: number): number | null {
  if (!v.length) return null;
  v.sort();
  const p = Math.min(1, Math.max(0, q)) * (v.length - 1);
  const k = Math.floor(p);
  return v[k]! + ((v[Math.min(v.length - 1, k + 1)]! - v[k]!) * (p - k));
}

/** Mediana. Ordena `v` no lugar: é um vetor numérico, que o motor ordena várias vezes mais rápido que uma lista. */
function mediana(v: Float64Array): number | null {
  if (!v.length) return null;
  v.sort();
  const m = v.length >> 1;
  return v.length % 2 ? v[m]! : (v[m - 1]! + v[m]!) / 2;
}

/** Mediana, em horas, entre abrir e resolver. `null` quando nada foi resolvido. */
export function tempoAteResolver(incidentes: readonly Incidente[]): number | null {
  // Roda a cada chamado que chega, sobre dezenas de milhares: sem listas intermediárias.
  const horas = new Float64Array(incidentes.length);
  let n = 0;
  for (const i of incidentes) {
    const h = horasAteResolver(i);
    if (h !== undefined) horas[n++] = h;
  }
  return mediana(horas.subarray(0, n));
}

/**
 * Em quantas horas a fração `q` dos resolvidos foi resolvida: com 0,9, "9 em
 * cada 10 em até X". A mediana sozinha esconde quem esperou muito.
 */
export function tempoNoQuantil(incidentes: readonly Incidente[], q: number): number | null {
  const horas = new Float64Array(incidentes.length);
  let n = 0;
  for (const i of incidentes) {
    const h = horasAteResolver(i);
    if (h !== undefined) horas[n++] = h;
  }
  return quantil(horas.subarray(0, n), q);
}

/** Parte dos resolvidos que ficou dentro do prazo do tipo (0 a 1). `null` quando nada foi resolvido. */
export function percentualNoPrazo(incidentes: readonly Incidente[]): number | null {
  let resolvidos = 0;
  let noPrazo = 0;
  for (const i of incidentes) {
    const h = horasAteResolver(i);
    if (h === undefined) continue;
    resolvidos++;
    const prazo = TIPO_POR_ID[i.tipoId]?.prazoHoras;
    if (prazo !== undefined && h <= prazo) noPrazo++;
  }
  return resolvidos ? noPrazo / resolvidos : null;
}

export interface VelocidadeDaArea {
  area: AreaId;
  chamados: number;
  tempoAteResolver: number | null;
  noPrazo: number | null;
}

/** A velocidade da gestão em cada área, na ordem de `AREAS`. */
export function velocidadePorArea(incidentes: readonly Incidente[]): VelocidadeDaArea[] {
  const grupos = new Map<AreaId, Incidente[]>(AREAS.map((a) => [a.id, []]));
  for (const i of incidentes) grupos.get(i.area)!.push(i);
  return AREAS.map((a) => {
    const lista = grupos.get(a.id)!;
    return { area: a.id, chamados: lista.length, tempoAteResolver: tempoAteResolver(lista), noPrazo: percentualNoPrazo(lista) };
  });
}

/** Chamados por dia nos últimos `dias` dias (do mais antigo a hoje), somando todas as RAs ou só a pedida. */
export function serieDiaria(base: BaseSimulada, area: AreaId | null = null, dias = 30, ra: string | null = null): number[] {
  const n = Math.min(dias, base.dias);
  const serie = new Array<number>(n).fill(0);
  const so = ra === null ? -1 : REGIOES.findIndex((r) => r.id === ra);
  TIPOS.forEach((tipo, t) => {
    if (area !== null && tipo.area !== area) return;
    for (let r = 0; r < REGIOES.length; r++) {
      if (so >= 0 && r !== so) continue;
      for (let k = 0; k < n; k++) serie[k] = serie[k]! + (base.contagens[indiceDaContagem(base, t, r, base.dias - n + k)] ?? 0);
    }
  });
  return serie;
}

/** Chamados de cada RA e a taxa por 10 mil habitantes (a população é real; ver `dominio/ras.ts`). */
export interface ChamadosDaRa {
  ra: string;
  chamados: number;
  por10mil: number;
}

export function chamadosPorRa(incidentes: readonly Incidente[]): Map<string, ChamadosDaRa> {
  const n = new Map<string, number>();
  for (const i of incidentes) n.set(i.local.raId, (n.get(i.local.raId) ?? 0) + 1);
  return new Map(
    REGIOES.map((r) => {
      const chamados = n.get(r.id) ?? 0;
      return [r.id, { ra: r.id, chamados, por10mil: r.populacao > 0 ? (chamados / r.populacao) * 10_000 : 0 }];
    }),
  );
}

/** Os `n` tipos mais frequentes, do mais ao menos. */
export function tiposMaisFrequentes(incidentes: readonly Incidente[], n = 3): { tipoId: string; chamados: number }[] {
  const conta = new Map<string, number>();
  for (const i of incidentes) conta.set(i.tipoId, (conta.get(i.tipoId) ?? 0) + 1);
  return [...conta].map(([tipoId, chamados]) => ({ tipoId, chamados })).sort((a, b) => b.chamados - a.chamados || a.tipoId.localeCompare(b.tipoId)).slice(0, n);
}

/**
 * Os `n` incidentes mais recentes, do mais novo ao mais antigo; entre dois do
 * mesmo instante, vem antes o que estava antes na lista (como numa ordenação
 * estável). Uma passada só, guardando os `n` melhores: ordenar a lista inteira a
 * cada chegada pesava.
 *
 * A passada vai do fim para o começo. A base vem em ordem de criação; assim os
 * `n` primeiros que aparecem já são a resposta, e o resto é descartado na hora.
 */
export function chegandoAgora(incidentes: readonly Incidente[], n: number): Incidente[] {
  const recentes: Incidente[] = [];
  if (n <= 0) return recentes;
  for (let p = incidentes.length - 1; p >= 0; p--) {
    const i = incidentes[p]!;
    if (recentes.length === n && i.criadoEm < recentes[n - 1]!.criadoEm) continue;
    // Entra antes dos de mesmo instante que já estão: eles vinham depois na lista.
    let k = recentes.length;
    while (k > 0 && recentes[k - 1]!.criadoEm <= i.criadoEm) k--;
    recentes.splice(k, 0, i);
    if (recentes.length > n) recentes.pop();
  }
  return recentes;
}

/** Chamados seguidos do mesmo tipo, vistos como um grupo na lista do que chega. */
export interface Chegadas {
  /** O mais antigo do grupo: a chave não muda quando chega mais um. */
  id: string;
  tipoId: string;
  area: AreaId;
  chamados: number;
  /** As regiões de onde vieram, sem repetir, da mais recente para trás. */
  ras: string[];
  maisRecente: Incidente;
  maisAntigo: Incidente;
}

/**
 * Junta os chamados **seguidos** do mesmo tipo (a lista vem do mais novo ao mais
 * antigo). Não diz que são o mesmo fato: isso é a inteligência que sugere. Só
 * evita que a lista repita a mesma linha seis vezes.
 */
export function agruparChegadas(recentes: readonly Incidente[]): Chegadas[] {
  const grupos: Chegadas[] = [];
  for (const i of recentes) {
    const ultimo = grupos.at(-1);
    if (ultimo && ultimo.tipoId === i.tipoId) {
      ultimo.chamados++;
      ultimo.maisAntigo = i;
      ultimo.id = i.id;
      if (!ultimo.ras.includes(i.local.raId)) ultimo.ras.push(i.local.raId);
    } else grupos.push({ id: i.id, tipoId: i.tipoId, area: i.area, chamados: 1, ras: [i.local.raId], maisRecente: i, maisAntigo: i });
  }
  return grupos;
}

// ---------------------------------------------------------------- formatos

export const numero = (n: number) => Math.round(n).toLocaleString('pt-BR');

/** "18 h" até dois dias; depois, "3,4 dias". */
export function duracao(horas: number | null): string {
  if (horas === null) return '–';
  if (horas < 48) return `${Math.round(horas)} h`;
  return `${(horas / 24).toFixed(1).replace('.', ',')} dias`;
}

export const percentual = (p: number | null) => (p === null ? '–' : `${Math.round(p * 100)}%`);

/** "agora", "há 12 min", "há 3 h", "há 2 dias". */
export function haQuanto(agora: Instante, t: Instante): string {
  const min = Math.max(0, Math.floor((agora - t) / 60_000));
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  return h < 48 ? `há ${h} h` : `há ${Math.floor(h / 24)} dias`;
}

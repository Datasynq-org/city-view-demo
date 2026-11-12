/**
 * Modelo único de incidente (CV-DEM-001, seção 4; magno 7.3) e o seu ciclo de vida.
 * Só tipos e funções puras.
 */
import { type AreaId, CANAL_POR_ID, type Severidade, TIPO_POR_ID } from './orgaos';
import { REGIAO_POR_ID } from './ras';

export type { Severidade };

export type Situacao =
  | 'recebido'
  | 'em-triagem'
  | 'encaminhado'
  | 'em-atendimento'
  | 'resolvido'
  | 'encerrado'
  | 'cancelado'
  | 'falha-de-envio'
  | 'reaberto';

/** Na ordem do ciclo de vida, com as saídas no fim. */
export const SITUACOES: Situacao[] = [
  'recebido',
  'em-triagem',
  'encaminhado',
  'em-atendimento',
  'resolvido',
  'encerrado',
  'cancelado',
  'falha-de-envio',
  'reaberto',
];

export const ROTULO_SITUACAO: Record<Situacao, string> = {
  recebido: 'Recebido',
  'em-triagem': 'Em triagem',
  encaminhado: 'Encaminhado',
  'em-atendimento': 'Em atendimento',
  resolvido: 'Resolvido',
  encerrado: 'Encerrado',
  cancelado: 'Cancelado',
  'falha-de-envio': 'Falha de envio',
  reaberto: 'Reaberto',
};

/** Milissegundos desde 1970 (UTC). */
export type Instante = number;

export interface Vinculo {
  tipo: 'mesmo-incidente-que' | 'relacionado-a';
  alvoId: string;
}

export interface Incidente {
  /** `INC-2026-000123`. */
  id: string;
  origem: { canalId: string; protocoloExterno?: string };
  local: { lon: number; lat: number; raId: string };
  tipoId: string;
  area: AreaId;
  /** Órgão responsável. */
  orgaoId: string;
  situacao: Situacao;
  severidade: Severidade;
  criadoEm: Instante;
  encaminhadoEm?: Instante;
  /** Presente só enquanto a situação é resolvido ou encerrado. */
  resolvidoEm?: Instante;
  vinculos: Vinculo[];
}

/**
 * Para onde cada situação pode ir. Leitura da equipe do ciclo descrito no magno
 * 7.3 ("recebido → em triagem → encaminhado → em atendimento → resolvido →
 * encerrado, com saídas para cancelado, falha de envio e reaberto").
 */
export const TRANSICOES: Record<Situacao, Situacao[]> = {
  recebido: ['em-triagem', 'cancelado'],
  'em-triagem': ['encaminhado', 'falha-de-envio', 'cancelado'],
  'falha-de-envio': ['encaminhado', 'cancelado'],
  encaminhado: ['em-atendimento', 'cancelado'],
  'em-atendimento': ['resolvido', 'cancelado'],
  resolvido: ['encerrado', 'reaberto'],
  reaberto: ['em-atendimento'],
  encerrado: [],
  cancelado: [],
};

export const podeTransitar = (de: Situacao, para: Situacao) => TRANSICOES[de].includes(para);

/** Ainda depende de alguém agir: tudo menos resolvido, encerrado e cancelado. */
export const estaAberto = (situacao: Situacao) =>
  situacao !== 'resolvido' && situacao !== 'encerrado' && situacao !== 'cancelado';

const FORMATO_ID = /^INC-\d{4}-\d{6}$/;

export function formatarId(ano: number, sequencial: number): string {
  if (!Number.isInteger(sequencial) || sequencial < 1 || sequencial > 999_999) {
    throw new RangeError(`Sequencial fora de 1 a 999999: ${sequencial}`);
  }
  return `INC-${ano}-${String(sequencial).padStart(6, '0')}`;
}

export const idValido = (id: string) => FORMATO_ID.test(id);

/** Lista o que está incoerente no incidente. Vazia quando está tudo certo. */
export function validarIncidente(inc: Incidente): string[] {
  const erros: string[] = [];
  if (!idValido(inc.id)) erros.push(`id fora do formato: ${inc.id}`);

  const tipo = TIPO_POR_ID[inc.tipoId];
  if (!tipo) erros.push(`tipo desconhecido: ${inc.tipoId}`);
  else {
    if (tipo.area !== inc.area) erros.push(`área ${inc.area} não é a do tipo ${inc.tipoId}`);
    if (tipo.orgaoId !== inc.orgaoId) erros.push(`órgão ${inc.orgaoId} não é o dono do tipo ${inc.tipoId}`);
  }
  if (!CANAL_POR_ID[inc.origem.canalId]) erros.push(`canal desconhecido: ${inc.origem.canalId}`);
  if (!REGIAO_POR_ID[inc.local.raId]) erros.push(`RA desconhecida: ${inc.local.raId}`);

  const resolvido = inc.situacao === 'resolvido' || inc.situacao === 'encerrado';
  if (resolvido && inc.resolvidoEm === undefined) erros.push(`${inc.situacao} sem data de resolução`);
  if (!resolvido && inc.resolvidoEm !== undefined) erros.push(`${inc.situacao} com data de resolução`);

  if (inc.encaminhadoEm !== undefined && inc.encaminhadoEm < inc.criadoEm) erros.push('encaminhado antes de criado');
  if (inc.resolvidoEm !== undefined && inc.resolvidoEm < (inc.encaminhadoEm ?? inc.criadoEm)) {
    erros.push('resolvido antes de encaminhado');
  }
  return erros;
}

export function contarPorSituacao(incidentes: readonly Incidente[]): Record<Situacao, number> {
  const contagem = Object.fromEntries(SITUACOES.map((s) => [s, 0])) as Record<Situacao, number>;
  for (const inc of incidentes) contagem[inc.situacao]++;
  return contagem;
}

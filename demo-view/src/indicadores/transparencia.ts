/**
 * O que o cidadão vê (I4): "A gestão libera para o cidadão para que ele veja
 * assim, esse mês aqui verdinho no mapa, tudo isso aqui foi resolvido. […] Se a
 * gestão for mais arrojada, vai deixar ver tudo que está em resolução também,
 * sendo solucionado, as coisas que ainda estão abertas e não resolvidas"
 * (ATA 234–237).
 *
 * A gestão escolhe o grau; o mapa público mostra só o que o grau permite.
 * Ocorrências de segurança pública nunca entram no mapa aberto (decisão da
 * equipe, já na demo exploratória). Funções puras sobre dados SIMULADOS.
 */
import type { Incidente, Situacao } from '../dominio/incidente';
import type { AreaId } from '../dominio/orgaos';
import { REGIOES } from '../dominio/ras';

/** O que a gestão libera: só o resolvido; também o que está andando; tudo. */
export type Grau = 'resolvidos' | 'em-resolucao' | 'tudo';

export const GRAUS: { id: Grau; nome: string; nota: string }[] = [
  { id: 'resolvidos', nome: 'Só o resolvido', nota: 'O que a gestão entregou' },
  { id: 'em-resolucao', nome: '+ Em resolução', nota: 'Também o que já está com o órgão' },
  { id: 'tudo', nome: '+ Em aberto', nota: 'Também o que ainda espera: a gestão mais arrojada' },
];

/** Como o cidadão lê cada demanda. */
export type Estado = 'resolvido' | 'em-resolucao' | 'aberto';

export const NOME_DO_ESTADO: Record<Estado, string> = { resolvido: 'Resolvido', 'em-resolucao': 'Em resolução', aberto: 'Em aberto' };

const ESTADO: Partial<Record<Situacao, Estado>> = {
  resolvido: 'resolvido',
  encerrado: 'resolvido',
  encaminhado: 'em-resolucao',
  'em-atendimento': 'em-resolucao',
  reaberto: 'em-resolucao',
  recebido: 'aberto',
  'em-triagem': 'aberto',
  'falha-de-envio': 'aberto',
};

/** O estado público de uma situação. `null` para o que não vai ao mapa (cancelado). */
export const estadoPublico = (s: Situacao): Estado | null => ESTADO[s] ?? null;

/** Áreas que nunca entram no mapa aberto. */
export const FORA_DO_MAPA: readonly AreaId[] = ['seguranca'];

const LIBERADO: Record<Grau, readonly Estado[]> = { resolvidos: ['resolvido'], 'em-resolucao': ['resolvido', 'em-resolucao'], tudo: ['resolvido', 'em-resolucao', 'aberto'] };

export const estadosDoGrau = (g: Grau): readonly Estado[] => LIBERADO[g];

/** O que vai ao mapa público no grau escolhido. */
export function publicos(incidentes: readonly Incidente[], grau: Grau): { incidente: Incidente; estado: Estado }[] {
  const liberados = LIBERADO[grau];
  const lista: { incidente: Incidente; estado: Estado }[] = [];
  for (const i of incidentes) {
    if (FORA_DO_MAPA.includes(i.area)) continue;
    const estado = estadoPublico(i.situacao);
    if (estado && liberados.includes(estado)) lista.push({ incidente: i, estado });
  }
  return lista;
}

export type Contagem = Record<Estado, number>;
const zero = (): Contagem => ({ resolvido: 0, 'em-resolucao': 0, aberto: 0 });

/** O que o cidadão vê por região e no DF. Os estados não liberados ficam em zero. */
export function porRegiao(incidentes: readonly Incidente[], grau: Grau): { regioes: Map<string, Contagem>; df: Contagem } {
  const regioes = new Map<string, Contagem>(REGIOES.map((r) => [r.id, zero()]));
  const df = zero();
  for (const { incidente, estado } of publicos(incidentes, grau)) {
    df[estado]++;
    const c = regioes.get(incidente.local.raId);
    if (c) c[estado]++;
  }
  return { regioes, df };
}

export const total = (c: Contagem) => c.resolvido + c['em-resolucao'] + c.aberto;

/** A parte resolvida do que é mostrado (de 0 a 1). `null` sem nada a mostrar. */
export const parteResolvida = (c: Contagem) => (total(c) ? c.resolvido / total(c) : null);

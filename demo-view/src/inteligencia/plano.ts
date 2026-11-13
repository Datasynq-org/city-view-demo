/**
 * O plano de envio de um incidente: para quem vai cada pedido, por quê, com que
 * prazo e por onde. É a racionalização da IA transformada em encaminhamento:
 * o City View está ligado a cada órgão nos dois sentidos, então direciona um
 * pedido a cada um e recebe a resposta (`encaminhamento.ts`).
 *
 * SIMULADO, e proposta: o envio ao sistema de cada órgão depende de o governo
 * apontar e liberar esses sistemas (magno 4.2). Por isso o "por onde vai" lê a
 * situação do conector em `dominio/conectores.ts`, sem inventar integração.
 * Funções puras.
 */
import { CONECTORES } from '../dominio/conectores';
import type { SituacaoPeca } from '../dominio/ponte';
import type { Incidente } from './agrupamento';
import { CASO_POR_ID, type Papel, siglaDoOrgao } from './casos';

export const ROTULO_DO_PAPEL: Record<Papel, string> = { responsável: 'Responsável', apoio: 'Apoio', avisado: 'Avisado' };

export interface ItemDoPlano {
  orgaoId: string;
  papel: Papel;
  /** O que se pede a este órgão. */
  pedido: string;
  /** Por que este órgão: o que ele tem a ver com o incidente. */
  motivo: string;
  /** Horas para atender; 0 para quem só é avisado. */
  prazoH: number;
  /** Por onde o pedido vai: o sistema do próprio órgão e em que pé está a ligação. */
  via: { sistema: string; situacao: SituacaoPeca };
  /** Roteiro da demonstração: este órgão devolve o pedido, com este motivo. */
  devolve?: string;
}

const n = (v: number) => Math.round(v).toLocaleString('pt-BR');

/** O sistema do órgão, pelo catálogo de conectores; quem não está lá é "a apontar". */
export function viaDoOrgao(orgaoId: string): ItemDoPlano['via'] {
  const c = CONECTORES.find((x) => x.orgaoId === orgaoId);
  return c ? { sistema: c.sistema, situacao: c.situacao } : { sistema: 'Sistema do órgão, a apontar na implantação', situacao: 'proposta' };
}

/** O que liga o órgão ao incidente, dito com os números das evidências. */
function motivoDe(inc: Incidente, orgaoId: string): string {
  const dele = inc.evidencias.filter((e) => e.orgaoId === orgaoId);
  const chamados = dele.filter((e) => e.fonte === 'chamado').reduce((s, e) => s + e.quantidade, 0);
  const operacao = dele.some((e) => e.fonte === 'operação');
  if (chamados > 0) return `${n(chamados)} chamado${chamados === 1 ? '' : 's'} do incidente chegaram a ele${operacao ? ', e a operação dele confirma' : ''}`;
  if (operacao) return 'A operação dele registrou o mesmo fato';
  if (dele.length > 0) return 'Trouxe o contexto que explica o incidente';
  return 'Não recebeu chamados: entra porque a solução passa por ele';
}

const ORDEM: Record<Papel, number> = { responsável: 0, apoio: 1, avisado: 2 };

export function planoDe(inc: Incidente): ItemDoPlano[] {
  const caso = inc.casoId ? CASO_POR_ID[inc.casoId] : undefined;
  if (caso) {
    return [...caso.encaminhamentos]
      .sort((a, b) => ORDEM[a.papel] - ORDEM[b.papel])
      .map((e) => ({ orgaoId: e.orgaoId, papel: e.papel, pedido: e.pedido, motivo: motivoDe(inc, e.orgaoId), prazoH: e.prazoH, via: viaDoOrgao(e.orgaoId), devolve: e.devolve }));
  }
  // Grupo do dia a dia: o órgão que recebeu mais chamados assume; os outros apoiam.
  const porOrgao = new Map<string, number>();
  for (const e of inc.evidencias) if (e.fonte === 'chamado') porOrgao.set(e.orgaoId, (porOrgao.get(e.orgaoId) ?? 0) + e.quantidade);
  const ordenados = [...porOrgao].sort((a, b) => b[1] - a[1]);
  return ordenados.map(([orgaoId], k) => ({
    orgaoId,
    papel: k === 0 ? ('responsável' as const) : ('apoio' as const),
    pedido: k === 0 ? `Tratar os ${n(inc.chamados)} chamados como um só atendimento` : 'Acompanhar o atendimento e fechar os chamados da sua fila junto',
    motivo: motivoDe(inc, orgaoId),
    prazoH: 24,
    via: viaDoOrgao(orgaoId),
  }));
}

export const responsavelDe = (plano: readonly ItemDoPlano[]) => plano.find((p) => p.papel === 'responsável');

export const prazoEmTexto = (h: number) => (h <= 0 ? 'sem prazo' : h < 48 ? `${n(h)} h` : `${n(h / 24)} dias`);

/** A mensagem única que os cidadãos do incidente recebem: ao assumir e ao resolver. */
export function mensagensAoCidadao(inc: Incidente, plano: readonly ItemDoPlano[]): { aoAssumir: string; aoResolver: string } {
  const dono = responsavelDe(plano);
  const quem = dono ? siglaDoOrgao(dono.orgaoId) : 'o órgão responsável';
  const onde = inc.local ? ` em ${inc.local}` : '';
  return {
    aoAssumir: `Sua solicitação faz parte de um problema maior${onde}, que já está com ${quem}${dono && dono.prazoH > 0 ? `, com prazo de ${prazoEmTexto(dono.prazoH)}` : ''}. Você não precisa ligar de novo: avisamos por aqui quando resolver.`,
    aoResolver: `Resolvido: o problema${onde} foi atendido por ${quem}. Se ainda não estiver certo aí, responda esta mensagem e reabrimos.`,
  };
}

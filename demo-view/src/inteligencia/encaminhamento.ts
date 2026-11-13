/**
 * Depois de confirmado, o incidente anda nos dois sentidos: o City View envia
 * um pedido ao sistema de cada órgão (ida) e cada órgão responde (volta):
 * recebeu, assumiu, devolveu ("não é comigo") ou resolveu. Quem devolve manda o
 * pedido de volta para quem revisa, que redireciona ou dispensa.
 *
 * Cada passo deixa uma linha no registro: quem, quando, o quê e por quê.
 *
 * SIMULADO: as respostas dos órgãos seguem um roteiro, em tempo acelerado.
 * Funções puras; o relógio vem de fora.
 */
import type { Papel } from './casos';
import { siglaDoOrgao } from './casos';
import type { ItemDoPlano } from './plano';

/** Onde está o pedido feito a um órgão. */
export type Passo = 'enviado' | 'recebido' | 'assumido' | 'devolvido' | 'resolvido' | 'dispensado';

export const ROTULO_DO_PASSO: Record<Passo, string> = {
  enviado: 'Enviado',
  recebido: 'Recebido',
  assumido: 'Assumido',
  devolvido: 'Devolvido',
  resolvido: 'Resolvido',
  dispensado: 'Dispensado',
};

/** O que o órgão pode responder (CV-DEM-002, F5). */
export type Resposta = 'recebido' | 'assumido' | 'devolvido' | 'resolvido';

export const ROTULO_DA_RESPOSTA: Record<Resposta, string> = { recebido: 'Recebi', assumido: 'Assumi', devolvido: 'Não é comigo', resolvido: 'Resolvido' };

export interface Trilha {
  orgaoId: string;
  papel: Papel;
  passo: Passo;
  /** Protocolo no sistema do órgão (fictício), dado quando ele recebe. */
  protocolo?: string;
  /** Por que devolveu. */
  motivo?: string;
  /** Quando entrou no passo atual, e quando o pedido foi enviado. */
  em: number;
  enviadoEm: number;
  /** Quando o pedido veio de outro órgão, que devolveu. */
  redirecionadoDe?: string;
}

export interface Andamento {
  codigo: string;
  desde: number;
  trilhas: Trilha[];
}

export type Andamentos = Readonly<Record<string, Andamento>>;

/** A situação do incidente como um todo, no ciclo do magno 7.3. */
export type SituacaoDoIncidente = 'encaminhado' | 'em atendimento' | 'resolvido';

export const ROTULO_DA_SITUACAO_DO_INCIDENTE: Record<SituacaoDoIncidente, string> = { encaminhado: 'Encaminhado', 'em atendimento': 'Em atendimento', resolvido: 'Resolvido' };

export interface Linha {
  em: number;
  codigo: string;
  /** Quem fez: a pessoa que revisa, um órgão ou o próprio City View. */
  quem: string;
  oQue: string;
  motivo?: string;
}

export const OPERADOR = 'Quem revisa';
export const CITY_VIEW = 'City View';

/** Protocolo fictício, estável para o mesmo incidente e órgão. */
export function protocoloFicticio(codigo: string, orgaoId: string): string {
  let h = 7;
  for (const c of codigo + orgaoId) h = (h * 31 + c.charCodeAt(0)) % 900_000;
  return `${siglaDoOrgao(orgaoId).replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase()}-2026-${String(100_000 + h)}`;
}

const trilhaNova = (p: Pick<ItemDoPlano, 'orgaoId' | 'papel'>, agora: number, de?: string): Trilha => ({ orgaoId: p.orgaoId, papel: p.papel, passo: 'enviado', em: agora, enviadoEm: agora, redirecionadoDe: de });

/** Confirmado o incidente, um pedido sai para cada órgão do plano. */
export function iniciar(a: Andamentos, codigo: string, plano: readonly ItemDoPlano[], agora: number): { andamentos: Andamentos; linhas: Linha[] } {
  if (a[codigo]) return { andamentos: a, linhas: [] };
  const trilhas = plano.map((p) => trilhaNova(p, agora));
  const linhas = plano.map((p) => ({ em: agora, codigo, quem: CITY_VIEW, oQue: `Enviou a ${siglaDoOrgao(p.orgaoId)} (${p.papel}): ${p.pedido}` }));
  return { andamentos: { ...a, [codigo]: { codigo, desde: agora, trilhas } }, linhas };
}

/** De onde cada resposta pode partir. Quem só é avisado apenas recebe. */
const PODE: Record<Resposta, readonly Passo[]> = {
  recebido: ['enviado'],
  assumido: ['recebido'],
  devolvido: ['recebido'],
  resolvido: ['recebido', 'assumido'],
};

export const respostasPossiveis = (t: Trilha): Resposta[] =>
  (Object.keys(PODE) as Resposta[]).filter((r) => PODE[r].includes(t.passo) && (t.papel !== 'avisado' || r === 'recebido'));

const trocar = (a: Andamentos, codigo: string, orgaoId: string, f: (t: Trilha) => Trilha): Andamentos => {
  const atual = a[codigo];
  if (!atual) return a;
  return { ...a, [codigo]: { ...atual, trilhas: atual.trilhas.map((t) => (t.orgaoId === orgaoId ? f(t) : t)) } };
};

const trilhaDe = (a: Andamentos, codigo: string, orgaoId: string) => a[codigo]?.trilhas.find((t) => t.orgaoId === orgaoId);

/** A volta: o órgão responde ao pedido. Respostas fora de ordem não mudam nada. */
export function responder(a: Andamentos, codigo: string, orgaoId: string, resposta: Resposta, agora: number, motivo?: string): { andamentos: Andamentos; linhas: Linha[] } {
  const t = trilhaDe(a, codigo, orgaoId);
  if (!t || !respostasPossiveis(t).includes(resposta)) return { andamentos: a, linhas: [] };
  const protocolo = t.protocolo ?? protocoloFicticio(codigo, orgaoId);
  const andamentos = trocar(a, codigo, orgaoId, (x) => ({ ...x, passo: resposta, em: agora, protocolo, motivo: resposta === 'devolvido' ? (motivo ?? 'Não é comigo') : undefined }));
  const oQue =
    resposta === 'recebido'
      ? `Recebeu o pedido no sistema dele, protocolo ${protocolo} (fictício)`
      : resposta === 'assumido'
        ? 'Assumiu o atendimento'
        : resposta === 'devolvido'
          ? 'Devolveu o pedido'
          : 'Informou que resolveu';
  const linhas: Linha[] = [{ em: agora, codigo, quem: siglaDoOrgao(orgaoId), oQue, motivo: resposta === 'devolvido' ? (motivo ?? 'Não é comigo') : undefined }];
  const antes = situacaoDoIncidente(a[codigo]!);
  const depois = situacaoDoIncidente(andamentos[codigo]!);
  if (depois !== antes && depois === 'resolvido') linhas.push({ em: agora, codigo, quem: CITY_VIEW, oQue: 'Fechou o incidente e avisou os cidadãos com uma resposta só' });
  return { andamentos, linhas };
}

/** Quem revisa manda o pedido devolvido para outro órgão. */
export function redirecionar(a: Andamentos, codigo: string, de: string, para: string, agora: number): { andamentos: Andamentos; linhas: Linha[] } {
  const t = trilhaDe(a, codigo, de);
  if (!t || t.passo !== 'devolvido' || de === para || trilhaDe(a, codigo, para)) return { andamentos: a, linhas: [] };
  const atual = a[codigo]!;
  const andamentos = { ...a, [codigo]: { ...atual, trilhas: atual.trilhas.map((x) => (x.orgaoId === de ? trilhaNova({ orgaoId: para, papel: t.papel }, agora, de) : x)) } };
  return { andamentos, linhas: [{ em: agora, codigo, quem: OPERADOR, oQue: `Redirecionou o pedido de ${siglaDoOrgao(de)} para ${siglaDoOrgao(para)}` }] };
}

/** Quem revisa aceita a devolução: o órgão sai do plano. */
export function dispensar(a: Andamentos, codigo: string, orgaoId: string, agora: number): { andamentos: Andamentos; linhas: Linha[] } {
  const t = trilhaDe(a, codigo, orgaoId);
  if (!t || t.passo !== 'devolvido') return { andamentos: a, linhas: [] };
  return { andamentos: trocar(a, codigo, orgaoId, (x) => ({ ...x, passo: 'dispensado', em: agora })), linhas: [{ em: agora, codigo, quem: OPERADOR, oQue: `Aceitou a devolução de ${siglaDoOrgao(orgaoId)} e tirou o órgão do plano` }] };
}

/** Quem ainda precisa resolver: responsável e apoio que não foram dispensados. */
const queResolvem = (an: Andamento) => an.trilhas.filter((t) => t.papel !== 'avisado' && t.passo !== 'dispensado');

export function situacaoDoIncidente(an: Andamento): SituacaoDoIncidente {
  const ativos = queResolvem(an);
  if (ativos.length > 0 && ativos.every((t) => t.passo === 'resolvido')) return 'resolvido';
  return ativos.some((t) => t.passo === 'assumido' || t.passo === 'resolvido') ? 'em atendimento' : 'encaminhado';
}

/** Alguém devolveu e ninguém decidiu ainda: o incidente espera quem revisa. */
export const esperaRevisao = (an: Andamento) => an.trilhas.some((t) => t.passo === 'devolvido');

/** Ainda há resposta por vir. */
export const emAberto = (an: Andamento) => situacaoDoIncidente(an) !== 'resolvido';

// ---------------------------------------------------------------- roteiro da demonstração

/** Tempos do roteiro, em ms: o que levaria horas acontece em segundos. */
export const ROTEIRO = { receber: 1400, assumir: 2600, resolver: 9000, entreOrgaos: 700 } as const;

/**
 * As respostas que o roteiro dá até `agora`: cada órgão recebe, assume (ou
 * devolve, quando o plano diz) e resolve, um depois do outro. Só anda um passo
 * por órgão a cada chamada, para a tela mostrar cada um.
 */
export function avancarRoteiro(a: Andamentos, planos: Readonly<Record<string, readonly ItemDoPlano[]>>, agora: number): { andamentos: Andamentos; linhas: Linha[] } {
  let andamentos = a;
  const linhas: Linha[] = [];
  for (const an of Object.values(a)) {
    an.trilhas.forEach((t, k) => {
      const item = planos[an.codigo]?.find((p) => p.orgaoId === t.orgaoId);
      const espera = agora - t.em;
      const folga = k * ROTEIRO.entreOrgaos;
      let resposta: Resposta | null = null;
      let motivo: string | undefined;
      if (t.passo === 'enviado' && espera >= ROTEIRO.receber + folga) resposta = 'recebido';
      else if (t.passo === 'recebido' && t.papel !== 'avisado' && espera >= ROTEIRO.assumir) {
        // Só devolve quem recebeu o pedido original; o redirecionado assume.
        if (item?.devolve && !t.redirecionadoDe) [resposta, motivo] = ['devolvido', item.devolve];
        else resposta = 'assumido';
      } else if (t.passo === 'assumido' && espera >= ROTEIRO.resolver + folga * 2) resposta = 'resolvido';
      if (!resposta) return;
      const r = responder(andamentos, an.codigo, t.orgaoId, resposta, agora, motivo);
      andamentos = r.andamentos;
      linhas.push(...r.linhas);
    });
  }
  return { andamentos, linhas };
}

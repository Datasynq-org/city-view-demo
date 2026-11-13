/**
 * O estado comum da inteligência: o que foi decidido sobre cada sugestão, como
 * anda cada incidente confirmado e o registro de tudo. Fica fora das telas para
 * que a sala, a gestão e a inteligência enxerguem os mesmos incidentes, e para
 * que as respostas dos órgãos continuem chegando quando se muda de tela.
 *
 * Vale só nesta visita: recarregar a página zera. Tudo SIMULADO.
 */
import { useSyncExternalStore } from 'react';
import type { Incidente } from './agrupamento';
import { siglaDoOrgao } from './casos';
import { avancar, cancelarEnvio, confirmar as confirmarDecisao, type Decisoes, decisaoDe, descartar as descartarDecisao, desfazerDescarte, type MotivoDeDescarte } from './decisoes';
import { type Andamentos, avancarRoteiro, CITY_VIEW, dispensar as dispensarPedido, emAberto, iniciar, type Linha, OPERADOR, redirecionar as redirecionarPedido, type Resposta, responder as responderPedido } from './encaminhamento';
import { type ItemDoPlano, planoDe } from './plano';

/** O que a sala e a gestão precisam saber do incidente, sem refazer o agrupamento. */
export interface Ficha {
  codigo: string;
  casoId: string | null;
  titulo: string;
  local: string;
  chamados: number;
  plano: ItemDoPlano[];
}

export interface Estado {
  decisoes: Decisoes;
  andamentos: Andamentos;
  fichas: Readonly<Record<string, Ficha>>;
  registro: readonly Linha[];
  /** As respostas dos órgãos seguem o roteiro sozinhas; desligado, só à mão. */
  automatico: boolean;
}

const VAZIO: Estado = { decisoes: {}, andamentos: {}, fichas: {}, registro: [], automatico: true };

let estado: Estado = VAZIO;
const ouvintes = new Set<() => void>();
let relogio: ReturnType<typeof setInterval> | null = null;

function mudar(novo: Estado) {
  if (novo === estado) return;
  estado = novo;
  cuidarDoRelogio();
  for (const avisar of ouvintes) avisar();
}

const comLinhas = (linhas: readonly Linha[]) => (linhas.length ? [...estado.registro, ...linhas] : estado.registro);

/** Há algo por acontecer: um envio na janela de cancelamento ou um órgão por responder. */
const haPendencia = () => Object.values(estado.decisoes).some((d) => d.situacao === 'enviando') || (estado.automatico && Object.values(estado.andamentos).some(emAberto));

function cuidarDoRelogio() {
  if (typeof window === 'undefined') return;
  if (haPendencia() && !relogio) relogio = setInterval(() => tique(Date.now()), 200);
  else if (!haPendencia() && relogio) {
    clearInterval(relogio);
    relogio = null;
  }
}

/** O relógio anda: o envio vence a janela, os pedidos saem e os órgãos respondem. */
export function tique(agora: number) {
  let { decisoes, andamentos } = estado;
  const linhas: Linha[] = [];
  const depois = avancar(decisoes, agora);
  if (depois !== decisoes) {
    for (const [codigo, d] of Object.entries(depois)) {
      if (d.situacao !== 'confirmado' || decisoes[codigo]?.situacao !== 'enviando') continue;
      const r = iniciar(andamentos, codigo, estado.fichas[codigo]?.plano ?? [], agora);
      andamentos = r.andamentos;
      linhas.push(...r.linhas);
    }
    decisoes = depois;
  }
  if (estado.automatico) {
    const planos = Object.fromEntries(Object.values(estado.fichas).map((f) => [f.codigo, f.plano]));
    const r = avancarRoteiro(andamentos, planos, agora);
    andamentos = r.andamentos;
    linhas.push(...r.linhas);
  }
  if (decisoes === estado.decisoes && andamentos === estado.andamentos) return;
  mudar({ ...estado, decisoes, andamentos, registro: comLinhas(linhas) });
}

// ---------------------------------------------------------------- o que a pessoa que revisa faz

export function confirmar(inc: Incidente, agora: number) {
  const decisoes = confirmarDecisao(estado.decisoes, inc.codigo, agora);
  if (decisoes === estado.decisoes) return;
  const ficha: Ficha = { codigo: inc.codigo, casoId: inc.casoId, titulo: inc.titulo, local: inc.local, chamados: inc.chamados, plano: planoDe(inc) };
  mudar({ ...estado, decisoes, fichas: { ...estado.fichas, [inc.codigo]: ficha }, registro: comLinhas([{ em: agora, codigo: inc.codigo, quem: OPERADOR, oQue: `Confirmou a sugestão: ${inc.titulo}` }]) });
}

export function cancelar(codigo: string, agora: number) {
  const decisoes = cancelarEnvio(estado.decisoes, codigo, agora);
  if (decisoes === estado.decisoes) return;
  mudar({ ...estado, decisoes, registro: comLinhas([{ em: agora, codigo, quem: OPERADOR, oQue: 'Cancelou o envio antes de os órgãos serem avisados' }]) });
}

export function descartar(inc: Incidente, motivo: MotivoDeDescarte, agora: number) {
  const decisoes = descartarDecisao(estado.decisoes, inc.codigo, motivo);
  if (decisoes === estado.decisoes) return;
  mudar({ ...estado, decisoes, registro: comLinhas([{ em: agora, codigo: inc.codigo, quem: OPERADOR, oQue: `Descartou a sugestão: ${inc.titulo}`, motivo }]) });
}

export function desfazer(codigo: string, agora: number) {
  const decisoes = desfazerDescarte(estado.decisoes, codigo);
  if (decisoes === estado.decisoes) return;
  mudar({ ...estado, decisoes, registro: comLinhas([{ em: agora, codigo, quem: OPERADOR, oQue: 'Desfez o descarte: a sugestão voltou à fila' }]) });
}

export function redirecionar(codigo: string, de: string, para: string, agora: number) {
  const r = redirecionarPedido(estado.andamentos, codigo, de, para, agora);
  if (r.andamentos === estado.andamentos) return;
  // O plano acompanha: o pedido é o mesmo, o órgão é outro.
  const ficha = estado.fichas[codigo];
  const fichas = ficha ? { ...estado.fichas, [codigo]: { ...ficha, plano: ficha.plano.map((p) => (p.orgaoId === de ? { ...p, orgaoId: para, devolve: undefined, motivo: `Redirecionado: ${siglaDoOrgao(de)} devolveu o pedido` } : p)) } } : estado.fichas;
  mudar({ ...estado, andamentos: r.andamentos, fichas, registro: comLinhas(r.linhas) });
}

export function dispensar(codigo: string, orgaoId: string, agora: number) {
  const r = dispensarPedido(estado.andamentos, codigo, orgaoId, agora);
  if (r.andamentos !== estado.andamentos) mudar({ ...estado, andamentos: r.andamentos, registro: comLinhas(r.linhas) });
}

// ---------------------------------------------------------------- o que o órgão responde (simulado)

export function responder(codigo: string, orgaoId: string, resposta: Resposta, agora: number, motivo?: string) {
  const r = responderPedido(estado.andamentos, codigo, orgaoId, resposta, agora, motivo);
  if (r.andamentos !== estado.andamentos) mudar({ ...estado, andamentos: r.andamentos, registro: comLinhas(r.linhas) });
}

export const mudarAutomatico = (automatico: boolean) => mudar({ ...estado, automatico });

/** Os grupos mudaram (sensibilidade): as decisões eram dos grupos antigos. */
export const reiniciar = () => mudar({ ...VAZIO, automatico: estado.automatico });

// ---------------------------------------------------------------- leitura

export const estadoAtual = () => estado;

const assinar = (avisar: () => void) => {
  ouvintes.add(avisar);
  return () => ouvintes.delete(avisar);
};

/** O estado comum; o componente redesenha quando ele muda. */
export const useInteligencia = (): Estado => useSyncExternalStore(assinar, estadoAtual, () => VAZIO);

/** De cada 10 sugestões decididas, quantas foram confirmadas: o lastro que a "confiança" não tem. */
export function placar(e: Estado, codigos: readonly string[]): { confirmadas: number; descartadas: number; esperando: number } {
  let confirmadas = 0;
  let descartadas = 0;
  for (const c of codigos) {
    const s = decisaoDe(e.decisoes, c).situacao;
    if (s === 'confirmado' || s === 'enviando') confirmadas++;
    else if (s === 'descartado') descartadas++;
  }
  return { confirmadas, descartadas, esperando: codigos.length - confirmadas - descartadas };
}

export { CITY_VIEW, OPERADOR };

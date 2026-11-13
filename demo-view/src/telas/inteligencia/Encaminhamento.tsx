/**
 * O que acontece depois do achado (CV-DEM-002, F1, F3 e F5): o plano da IA, com
 * um pedido para cada órgão; a ida e a volta de cada pedido; o fecho, com a
 * mensagem que os cidadãos recebem; e o registro de quem decidiu o quê.
 *
 * A comunicação é de mão dupla: o City View envia ao sistema de cada órgão e
 * recebe a resposta dele. Tudo SIMULADO, e o envio é proposta: depende de o
 * governo apontar e liberar os sistemas.
 */
import { motion } from 'motion/react';
import { type ReactNode, useState } from 'react';
import { ORGAOS } from '../../dominio/orgaos';
import { ROTULO_PECA } from '../../dominio/ponte';
import type { Incidente } from '../../inteligencia/agrupamento';
import { siglaDoOrgao } from '../../inteligencia/casos';
import { type Andamento, esperaRevisao, type Passo, type Resposta, respostasPossiveis, ROTULO_DA_RESPOSTA, ROTULO_DA_SITUACAO_DO_INCIDENTE, ROTULO_DO_PASSO, situacaoDoIncidente, type SituacaoDoIncidente, type Trilha } from '../../inteligencia/encaminhamento';
import { dispensar, type Estado, type Ficha, mudarAutomatico, placar, redirecionar, responder, useInteligencia } from '../../inteligencia/estado';
import { type ItemDoPlano, mensagensAoCidadao, planoDe, prazoEmTexto, responsavelDe, ROTULO_DO_PAPEL } from '../../inteligencia/plano';
import { reduzMovimento } from '../../mapa/vista';
import { CorDoOrgao } from './partes';

const n = (v: number) => Math.round(v).toLocaleString('pt-BR');
const hora = (ms: number) => new Date(ms).toLocaleTimeString('pt-BR');
const Rotulo = ({ children }: { children: ReactNode }) => <p className="condensado mb-1.5 text-micro text-texto-2">{children}</p>;

const COR_DA_SITUACAO: Record<SituacaoDoIncidente, string> = {
  encaminhado: 'border-linha-forte text-texto',
  'em atendimento': 'border-aviso/60 text-aviso',
  resolvido: 'border-acento-claro/60 text-acento-claro',
};

export function SeloDaSituacao({ s, espera = false }: { s: SituacaoDoIncidente; espera?: boolean }) {
  return (
    <span className={`condensado shrink-0 rounded border px-1.5 py-0.5 text-micro ${espera ? 'border-alerta/60 text-alerta' : COR_DA_SITUACAO[s]}`}>
      {espera ? 'Espera quem revisa' : ROTULO_DA_SITUACAO_DO_INCIDENTE[s]}
    </span>
  );
}

function Papel({ item }: { item: Pick<ItemDoPlano, 'papel'> }) {
  return <span className={`condensado rounded px-1.5 py-0.5 text-micro ${item.papel === 'responsável' ? 'bg-acento text-white' : 'bg-realce text-texto-2'}`}>{ROTULO_DO_PAPEL[item.papel]}</span>;
}

// ---------------------------------------------------------------- antes de confirmar: o plano

/** Para quem vai cada pedido, por quê, com que prazo e por onde. */
export function PlanoDaIA({ plano }: { plano: readonly ItemDoPlano[] }) {
  return (
    <div>
      <Rotulo>Para quem vai · o plano da IA</Rotulo>
      <p className="mb-2 text-rotulo text-texto-2">Ao confirmar, um pedido sai para o sistema de cada órgão, e cada um responde por lá.</p>
      <ul className="space-y-2">
        {plano.map((p) => (
          <li key={p.orgaoId} className="rounded border border-linha bg-poco px-3 py-2">
            <p className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2 text-nota text-tinta">
                <CorDoOrgao orgao={p.orgaoId} />
                {siglaDoOrgao(p.orgaoId)}
                <Papel item={p} />
              </span>
              <span className="shrink-0 text-micro text-texto-2">{p.prazoH > 0 ? `prazo ${prazoEmTexto(p.prazoH)}` : 'só ciência'}</span>
            </p>
            <p className="mt-1 text-nota text-texto">{p.pedido}</p>
            <p className="mt-1 text-micro text-texto-2">Por quê: {p.motivo}.</p>
            <p className="text-micro text-texto-2">
              Vai por: {p.via.sistema} · <span className={p.via.situacao === 'proposta' ? '' : 'text-acento-claro'}>{ROTULO_PECA[p.via.situacao]}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------- depois: ida e volta

const ETAPAS: Passo[] = ['enviado', 'recebido', 'assumido', 'resolvido'];
const ordemDo = (p: Passo) => (p === 'devolvido' || p === 'dispensado' ? 1 : ETAPAS.indexOf(p));

/** Uma seta que se desenha uma vez, no sentido do pedido ou da resposta. */
function Seta({ volta = false, viva }: { volta?: boolean; viva: boolean }) {
  return (
    <svg viewBox="0 0 40 8" className={`h-2 w-10 shrink-0 ${viva ? (volta ? 'text-acento-claro' : 'text-texto') : 'text-linha-forte'}`} aria-hidden="true">
      <motion.path d={volta ? 'M40 4H3' : 'M0 4h37'} stroke="currentColor" strokeWidth="1.2" fill="none" initial={reduzMovimento() || !viva ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5 }} />
      <path d={volta ? 'M6 1 2 4l4 3' : 'm34 1 4 3-4 3'} stroke="currentColor" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

function PistaDoOrgao({ codigo, t, item, automatico, fora }: { codigo: string; t: Trilha; item: ItemDoPlano | undefined; automatico: boolean; fora: string[] }) {
  const [para, setPara] = useState('');
  const respondeu = t.passo !== 'enviado';
  const possiveis = respostasPossiveis(t);
  const voltaTexto =
    t.passo === 'enviado'
      ? 'aguardando o órgão'
      : t.passo === 'recebido'
        ? t.papel === 'avisado'
          ? 'ciente'
          : 'recebido, ainda sem resposta'
        : t.passo === 'assumido'
          ? 'assumiu o atendimento'
          : t.passo === 'resolvido'
            ? 'informou que resolveu'
            : t.passo === 'devolvido'
              ? 'devolveu o pedido'
              : 'saiu do plano';
  return (
    <li className={`rounded border px-3 py-2 ${t.passo === 'devolvido' ? 'border-alerta/50' : 'border-linha'} ${t.passo === 'dispensado' ? 'opacity-55' : ''}`}>
      <p className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2 text-nota text-tinta">
          <CorDoOrgao orgao={t.orgaoId} />
          {siglaDoOrgao(t.orgaoId)}
          <Papel item={t} />
        </span>
        <span className={`condensado shrink-0 text-micro ${t.passo === 'devolvido' ? 'text-alerta' : t.passo === 'resolvido' ? 'text-acento-claro' : 'text-texto-2'}`}>{ROTULO_DO_PASSO[t.passo]}</span>
      </p>

      {/* As duas pistas: o pedido vai, a resposta volta. */}
      <div className="mt-1.5 space-y-1 text-rotulo">
        <p className="flex items-center gap-2 text-texto">
          <span className="w-16 shrink-0 text-micro text-texto-2">City View</span>
          <Seta viva />
          <span className="min-w-0">
            {item?.pedido ?? 'Pedido redirecionado'}
            <span className="text-texto-2">
              {' '}
              · {hora(t.enviadoEm)}
              {t.redirecionadoDe ? ` · veio de ${siglaDoOrgao(t.redirecionadoDe)}` : ''}
            </span>
          </span>
        </p>
        <p className="flex items-center gap-2 text-texto">
          <span className="w-16 shrink-0 truncate text-micro text-texto-2">{siglaDoOrgao(t.orgaoId)}</span>
          <Seta key={t.passo} volta viva={respondeu} />
          <span className={`min-w-0 ${respondeu ? '' : 'text-texto-2'}`}>
            {voltaTexto}
            {respondeu && <span className="text-texto-2"> · {hora(t.em)}</span>}
            {t.protocolo && <span className="block font-mono text-micro text-texto-2">{t.protocolo} (fictício)</span>}
          </span>
        </p>
      </div>

      {/* Onde o pedido está, em quatro passos. */}
      {t.passo !== 'devolvido' && t.passo !== 'dispensado' && t.papel !== 'avisado' && (
        <ol className="mt-2 grid grid-cols-4 gap-1" aria-label={`Passo: ${ROTULO_DO_PASSO[t.passo]}`}>
          {ETAPAS.map((e, k) => (
            <li key={e} className={`h-0.5 rounded-full ${k <= ordemDo(t.passo) ? 'bg-acento-claro' : 'bg-realce'}`} />
          ))}
        </ol>
      )}

      {t.passo === 'devolvido' && (
        <div className="mt-2 space-y-1.5">
          <p className="text-rotulo text-texto">
            Motivo: <span className="text-tinta">{t.motivo}</span>
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <select value={para} onChange={(e) => setPara(e.target.value)} aria-label="Redirecionar para" className="rounded border border-linha bg-poco px-2 py-1 text-rotulo text-tinta">
              <option value="">Redirecionar para…</option>
              {ORGAOS.filter((o) => !fora.includes(o.id)).map((o) => (
                <option key={o.id} value={o.id}>
                  {o.sigla}
                </option>
              ))}
            </select>
            <button type="button" disabled={!para} onClick={() => redirecionar(codigo, t.orgaoId, para, Date.now())} className="condensado rounded bg-acento px-2.5 py-1 text-micro text-white disabled:opacity-40">
              Reenviar
            </button>
            <button type="button" onClick={() => dispensar(codigo, t.orgaoId, Date.now())} className="condensado rounded border border-linha-forte px-2.5 py-1 text-micro text-texto hover:text-tinta">
              Dispensar
            </button>
          </div>
        </div>
      )}

      {!automatico && possiveis.length > 0 && <BotoesDoOrgao codigo={codigo} orgaoId={t.orgaoId} possiveis={possiveis} />}
    </li>
  );
}

/** A resposta do órgão, dada à mão (simulação): é o lado dele da conversa. */
export function BotoesDoOrgao({ codigo, orgaoId, possiveis }: { codigo: string; orgaoId: string; possiveis: readonly Resposta[] }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <span className="text-micro text-texto-2">Responder como {siglaDoOrgao(orgaoId)}:</span>
      {possiveis.map((r) => (
        <button key={r} type="button" onClick={() => responder(codigo, orgaoId, r, Date.now())} className="rounded border border-linha-forte px-2 py-0.5 text-micro text-texto hover:border-acento-claro hover:text-tinta">
          {ROTULO_DA_RESPOSTA[r]}
        </button>
      ))}
    </div>
  );
}

export function IdaEVolta({ inc, ficha, andamento, automatico }: { inc: Incidente; ficha: Ficha; andamento: Andamento; automatico: boolean }) {
  const situacao = situacaoDoIncidente(andamento);
  const noPlano = andamento.trilhas.map((t) => t.orgaoId);
  const mensagens = mensagensAoCidadao(inc, ficha.plano);
  const alguemAssumiu = situacao !== 'encaminhado';
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="condensado text-micro text-texto-2">Ida e volta com os órgãos</p>
        <SeloDaSituacao s={situacao} espera={esperaRevisao(andamento)} />
      </div>
      <ul className="space-y-2">
        {andamento.trilhas.map((t) => (
          <PistaDoOrgao key={t.orgaoId} codigo={inc.codigo} t={t} item={ficha.plano.find((p) => p.orgaoId === t.orgaoId)} automatico={automatico} fora={noPlano} />
        ))}
      </ul>

      {alguemAssumiu && (
        <motion.div initial={reduzMovimento() ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded border border-acento-claro/40 bg-poco px-3 py-2">
          <p className="condensado text-micro text-acento-claro">{situacao === 'resolvido' ? `Resolvido · ${n(inc.chamados)} cidadãos avisados com uma resposta só` : `O que os ${n(inc.chamados)} cidadãos recebem`}</p>
          <p className="mt-1 text-nota text-texto">{situacao === 'resolvido' ? mensagens.aoResolver : mensagens.aoAssumir}</p>
          <p className="mt-1 flex items-center justify-between gap-2 text-micro text-texto-2">
            <span>Pelo canal que cada um usou.</span>
            <a href="#/cidadao" className="text-acento-claro hover:underline">
              Como o cidadão acompanha →
            </a>
          </p>
        </motion.div>
      )}

      <label className="mt-2 flex items-center gap-2 text-micro text-texto-2">
        <input type="checkbox" checked={automatico} onChange={(e) => mudarAutomatico(e.target.checked)} className="accent-acento" />
        Os órgãos respondem sozinhos (roteiro simulado, em tempo acelerado)
      </label>
    </div>
  );
}

/** No insight: o plano, enquanto é sugestão; a ida e a volta, depois de confirmado. */
export function PlanoOuAndamento({ inc, descartado }: { inc: Incidente; descartado: boolean }) {
  const e = useInteligencia();
  const andamento = e.andamentos[inc.codigo];
  const ficha = e.fichas[inc.codigo];
  if (andamento && ficha) return <IdaEVolta inc={inc} ficha={ficha} andamento={andamento} automatico={e.automatico} />;
  if (descartado) return null;
  return <PlanoDaIA plano={planoDe(inc)} />;
}

// ---------------------------------------------------------------- no painel: em andamento e registro

export function EmAndamento({ estado, aoAbrir }: { estado: Estado; aoAbrir: (codigo: string) => void }) {
  const lista = Object.values(estado.andamentos).sort((a, b) => b.desde - a.desde);
  if (lista.length === 0) return <p className="text-nota text-texto-2">Nenhum incidente confirmado ainda. Abra um insight e confirme: os pedidos saem para os órgãos e as respostas aparecem aqui.</p>;
  return (
    <ul className="space-y-2">
      {lista.map((an) => {
        const f = estado.fichas[an.codigo];
        if (!f) return null;
        const dono = responsavelDe(f.plano);
        return (
          <li key={an.codigo}>
            <button type="button" onClick={() => aoAbrir(an.codigo)} className="painel-vidro block w-full p-4 text-left hover:border-linha-forte!">
              <span className="flex items-center justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate text-corpo font-semibold text-tinta">{f.titulo}</span>
                  <span className="block text-rotulo text-texto-2">
                    <span className="font-mono">{an.codigo}</span> · {n(f.chamados)} chamados · dono: {dono ? siglaDoOrgao(dono.orgaoId) : '–'}
                    {dono && dono.prazoH > 0 ? ` · prazo ${prazoEmTexto(dono.prazoH)}` : ''} · confirmado às {hora(an.desde)}
                  </span>
                </span>
                <SeloDaSituacao s={situacaoDoIncidente(an)} espera={esperaRevisao(an)} />
              </span>
              <span className="mt-2 flex flex-wrap gap-1.5">
                {an.trilhas.map((t) => (
                  <span key={t.orgaoId} className={`rounded border px-2 py-0.5 text-micro ${t.passo === 'devolvido' ? 'border-alerta/60 text-alerta' : t.passo === 'resolvido' ? 'border-acento-claro/60 text-acento-claro' : 'border-linha text-texto-2'}`}>
                    {siglaDoOrgao(t.orgaoId)} · {ROTULO_DO_PASSO[t.passo].toLowerCase()}
                  </span>
                ))}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function Registro({ estado, codigos }: { estado: Estado; codigos: readonly string[] }) {
  const p = placar(estado, codigos);
  const decididas = p.confirmadas + p.descartadas;
  return (
    <div className="painel-vidro p-5">
      <h2 className="titulo-painel">Registro de decisões</h2>
      <p className="mt-0.5 text-rotulo text-texto-2">Quem decidiu o quê, quando e por quê. Vale só nesta visita; em produção seria permanente e auditável.</p>
      <p className="mt-3 text-nota text-texto">
        {decididas === 0 ? (
          'Nenhuma sugestão decidida ainda.'
        ) : (
          <>
            De <span className="text-tinta">{decididas}</span> sugest{decididas === 1 ? 'ão decidida' : 'ões decididas'}, <span className="text-tinta">{p.confirmadas}</span> confirmada{p.confirmadas === 1 ? '' : 's'} e <span className="text-tinta">{p.descartadas}</span> descartada{p.descartadas === 1 ? '' : 's'}.
          </>
        )}{' '}
        <span className="text-texto-2">{p.esperando} esperam decisão.</span>
      </p>
      {estado.registro.length > 0 && (
        <ol className="mt-3 divide-y divide-linha">
          {[...estado.registro].reverse().map((l, k) => (
            <li key={`${l.em}${k}`} className="grid grid-cols-[4.5rem_4.5rem_7rem_1fr] gap-3 py-1.5 text-rotulo">
              <span className="text-texto-2 tabular-nums">{hora(l.em)}</span>
              <span className="font-mono text-texto-2">{l.codigo}</span>
              <span className="truncate text-tinta">{l.quem}</span>
              <span className="text-texto">
                {l.oQue}
                {l.motivo && <span className="text-texto-2"> · motivo: {l.motivo}</span>}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

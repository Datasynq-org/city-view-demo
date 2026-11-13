/**
 * Os painéis da inteligência (I3): a fila de insights, o insight explicado
 * (o que a IA viu · por quê · confiança · o que sugere, como no slide 13) e a
 * leitura "por órgão". Pouca tinta: cor só para severidade e para a ação.
 */
import { AnimatePresence, motion } from 'motion/react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { REGIAO_POR_ID } from '../../dominio/ras';
import { type Incidente, NOME_DO_TIPO, type Resultado } from '../../inteligencia/agrupamento';
import { CASO_POR_ID, type Severidade, siglaDoOrgao } from '../../inteligencia/casos';
import { type Decisao, faltaParaEnviar, JANELA_DE_ENVIO, type MotivoDeDescarte, MOTIVOS_DE_DESCARTE, ROTULO_DA_SITUACAO } from '../../inteligencia/decisoes';
import { reduzMovimento } from '../../mapa/vista';
import { corDoOrgao, familiasDe } from '../../inteligencia/cores';
import { Contador } from '../../ui/Contador';
import { Painel } from '../../ui/Painel';
import { useTema } from '../../ui/tema';
import { faixaDaConfianca, O_QUE_E_A_NOTA, ROTULO_DA_FAIXA } from '../../inteligencia/confianca';
import { ehReal } from '../../inteligencia/reais';
import type { ResumoDaRegiao } from '../../inteligencia/regiao';
import { PlanoOuAndamento } from './Encaminhamento';

const n = (v: number) => Math.round(v).toLocaleString('pt-BR');
const ROTULO_SEVERIDADE: Record<Severidade, string> = { crítico: 'Crítico', sério: 'Sério', atenção: 'Atenção' };
const COR_SEVERIDADE: Record<Severidade, string> = { crítico: 'text-alerta', sério: 'text-aviso', atenção: 'text-texto-2' };
const FUNDO_SEVERIDADE: Record<Severidade, string> = { crítico: 'bg-alerta', sério: 'bg-aviso', atenção: 'bg-texto-2' };

/** Severidade sempre com texto, nunca só cor. */
function Gravidade({ s }: { s: Severidade }) {
  return (
    <span className={`condensado inline-flex items-center gap-1.5 text-micro ${COR_SEVERIDADE[s]}`}>
      <span className={`size-1.5 rounded-full ${FUNDO_SEVERIDADE[s]}`} aria-hidden="true" />
      {ROTULO_SEVERIDADE[s]}
    </span>
  );
}

function Estado({ d }: { d: Decisao }) {
  const classe = d.situacao === 'sugerido' ? 'border-dashed border-linha-forte text-texto-2' : d.situacao === 'descartado' ? 'border-linha text-texto-2 line-through' : 'border-acento-claro/60 text-acento-claro';
  return <span className={`condensado shrink-0 rounded border px-1.5 py-0.5 text-micro ${classe}`}>{ROTULO_DA_SITUACAO[d.situacao]}</span>;
}

/** A marca de cor da área do órgão, como na apresentação. Só no tema claro; no escuro a tela é neutra. */
export function CorDoOrgao({ orgao, className = '' }: { orgao: string; className?: string }) {
  if (useTema() !== 'claro') return null;
  return <span className={`inline-block size-2 shrink-0 rounded-full ${className}`} style={{ background: corDoOrgao(orgao) }} aria-hidden="true" />;
}

/** A legenda das áreas presentes (tema claro). */
export function LegendaDasAreas({ orgaos, className = '' }: { orgaos: string[]; className?: string }) {
  if (useTema() !== 'claro') return null;
  return (
    <ul className={`flex flex-wrap gap-x-3 gap-y-1 text-micro text-texto-2 ${className}`} aria-label="Cores por área">
      {familiasDe(orgaos).map((f) => (
        <li key={f.id} className="flex items-center gap-1.5">
          <span className="size-2 rounded-full" style={{ background: f.cor }} aria-hidden="true" />
          {f.nome}
        </li>
      ))}
    </ul>
  );
}

const SUAVE = [0.2, 0.8, 0.2, 1] as const;
const pct = (v: number) => `${Math.round(v)}%`;

/** A faixa lateral de quem está selecionado: cresce de cima para baixo. */
export function Faixa({ ativo }: { ativo: boolean }) {
  const parado = reduzMovimento();
  return (
    <AnimatePresence initial={false}>
      {ativo && <motion.span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] origin-top bg-acento-claro" initial={parado ? false : { scaleY: 0 }} animate={{ scaleY: 1 }} exit={parado ? undefined : { opacity: 0 }} transition={{ duration: 0.28, ease: SUAVE }} />}
    </AnimatePresence>
  );
}

/** O insight abre em cascata: uma parte depois da outra, curto, e para. */
const CASCATA = { oculto: {}, visivel: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } };
const PARTE = { oculto: { opacity: 0, y: 8 }, visivel: { opacity: 1, y: 0, transition: { duration: 0.28, ease: SUAVE } } };

const Rotulo = ({ children }: { children: ReactNode }) => <p className="condensado mb-1.5 text-micro text-texto-2">{children}</p>;

// ---------------------------------------------------------------- fila

export function Fila({ resultado, ra = null, aberto, decisaoDe, aoAbrir }: {
  resultado: Resultado;
  /** A região escolhida no seletor: a fila mostra só os insights dela. */
  ra?: string | null;
  aberto: number;
  decisaoDe: (codigo: string) => Decisao;
  aoAbrir: (k: number) => void;
}) {
  const { incidentes, total, avulsos } = resultado;
  const daRegiao = incidentes.filter((i) => ra === null || i.raId === ra);
  // Quem anda pela fila com as setas não perde o item de vista.
  const ativoRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    ativoRef.current?.scrollIntoView({ block: 'nearest', behavior: reduzMovimento() ? 'auto' : 'smooth' });
  }, [aberto]);
  return (
    <Painel className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-linha px-4 py-3">
        <p className="text-nota text-texto-2">
          <span className="text-valor leading-8 font-semibold text-tinta tabular-nums">{n(total)}</span> chamados viram
        </p>
        <p className="text-nota text-texto-2">
          <span className="text-valor leading-8 font-semibold text-tinta tabular-nums">{incidentes.length}</span> incidentes sugeridos
          <span className="text-rotulo"> · {n(avulsos)} seguem avulsos</span>
        </p>
        <p className={`text-rotulo text-acento-claro ${ra ? '' : 'hidden'}`}>
          {daRegiao.length} em {(ra && REGIAO_POR_ID[ra]?.nome) || ''}
        </p>
      </header>
      <ol className="min-h-0 flex-1 overflow-y-auto" aria-label="Insights, do mais urgente ao menos">
        {incidentes.map((inc, k) => {
          if (ra !== null && inc.raId !== ra) return null;
          const ativo = k === aberto;
          return (
            <li key={inc.codigo}>
              <button ref={ativo ? ativoRef : undefined} type="button" onClick={() => aoAbrir(k)} aria-current={ativo ? 'true' : undefined} className={`relative block w-full border-b border-linha px-4 py-2.5 text-left transition-colors ${ativo ? 'bg-realce' : 'hover:bg-poco'}`}>
                <Faixa ativo={ativo} />
                <span className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <Gravidade s={inc.severidade} />
                    {ehReal(inc) && <span className="condensado rounded border border-aviso/70 px-1 text-micro text-aviso">Dado real</span>}
                  </span>
                  <span className="font-mono text-micro text-texto-2">{inc.codigo}</span>
                </span>
                <span className={`mt-0.5 block text-nota ${ativo ? 'text-tinta' : 'text-texto'}`}>{inc.titulo}</span>
                <span className="mt-1 flex items-center justify-between gap-2">
                  <span className="truncate text-rotulo text-texto-2">
                    {(inc.raId && REGIAO_POR_ID[inc.raId]?.nome) || '–'} · {n(inc.chamados)} chamados · {inc.orgaos.length} órgão{inc.orgaos.length === 1 ? '' : 's'}
                    {inc.evidencias.some((e) => e.fonte === 'operação') && <span className="text-acento-claro" title="Cruza o que os cidadãos relataram com a operação dos sistemas dos órgãos"> · + operação</span>}
                  </span>
                  <Estado d={decisaoDe(inc.codigo)} />
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </Painel>
  );
}

// ---------------------------------------------------------------- insight explicado

function Barra({ valor, rotulo }: { valor: number; rotulo: string }) {
  const claro = useTema() === 'claro';
  return (
    <div className="grid grid-cols-[5.5rem_1fr_2.25rem] items-center gap-2 text-rotulo text-texto-2">
      <span>{rotulo}</span>
      <span className="h-1 rounded-full bg-realce">
        <motion.span className={`block h-1 rounded-full ${claro ? 'bg-acento' : 'bg-texto-2'}`} initial={reduzMovimento() ? false : { width: 0 }} animate={{ width: `${Math.round(valor * 100)}%` }} transition={{ duration: 0.6, delay: 0.4, ease: SUAVE }} />
      </span>
      <span className="text-right tabular-nums">
        <Contador valor={Math.round(valor * 100)} formato={pct} doZero atraso={0.4} />
      </span>
    </div>
  );
}

export function Insight({ inc, decisao, agora, aoConfirmar, aoCancelar, aoDescartar, aoDesfazer, aoFechar, aoVerNoGrafo }: {
  inc: Incidente;
  decisao: Decisao;
  agora: number;
  aoConfirmar: () => void;
  aoCancelar: () => void;
  aoDescartar: (m: MotivoDeDescarte) => void;
  aoDesfazer: () => void;
  aoFechar: () => void;
  /** Só no painel: leva ao mesmo insight no mapa. */
  aoVerNoGrafo?: () => void;
}) {
  const [descartando, setDescartando] = useState(false);
  const deChamado = inc.evidencias.filter((e) => e.fonte === 'chamado');
  const deOperacao = inc.evidencias.filter((e) => e.fonte === 'operação');
  const deContexto = inc.evidencias.filter((e) => e.fonte === 'contexto');
  const falta = faltaParaEnviar(decisao, agora);
  const parado = reduzMovimento();
  return (
    <Painel className="flex min-h-0 flex-1 flex-col">
      <motion.header initial={parado ? false : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: SUAVE }} className="border-b border-linha px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Gravidade s={inc.severidade} />
            <span className={`condensado rounded border px-1.5 py-px text-micro ${ehReal(inc) ? 'border-aviso/70 text-aviso' : 'border-linha text-texto-2'}`}>{ehReal(inc) ? 'Dado real · Águas Claras' : 'Caso simulado'}</span>
            <span className="condensado text-micro text-texto-2">
              {NOME_DO_TIPO[inc.tipo]}
              {inc.tipoDoCaso && inc.tipoDoCaso !== 'Mesmo incidente' ? ` · ${inc.tipoDoCaso}` : ''}
            </span>
            <span className="font-mono text-micro text-texto-2">{inc.codigo}</span>
          </div>
          <button type="button" onClick={aoFechar} aria-label="Fechar (Esc)" title="Fechar (Esc)" className="-mt-1 -mr-1 rounded px-2 py-1 text-texto-2 hover:bg-poco hover:text-tinta">
            ✕
          </button>
        </div>
        <h2 className="mt-1.5 text-corpo leading-snug font-semibold text-tinta">{inc.titulo}</h2>
        <p className="mt-0.5 text-rotulo text-texto-2">{inc.local}</p>
        {aoVerNoGrafo && (
          <button type="button" onClick={aoVerNoGrafo} className="condensado mt-2 rounded border border-linha-forte px-2.5 py-1 text-micro text-texto hover:border-acento-claro hover:text-tinta">
            Ver no grafo →
          </button>
        )}
      </motion.header>

      <motion.div variants={CASCATA} initial={parado ? false : 'oculto'} animate="visivel" className="min-h-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto px-4 py-3">
        {inc.casoId && CASO_POR_ID[inc.casoId]?.duvidoso && (
          <motion.p variants={PARTE} className="rounded border border-dashed border-aviso/60 px-3 py-2 text-rotulo text-texto">
            <span className="condensado mr-1.5 text-micro text-aviso">Para descartar</span>
            {CASO_POR_ID[inc.casoId]!.duvidoso}
          </motion.p>
        )}
        <motion.p variants={PARTE} className="rounded border border-linha bg-poco px-3 py-2 text-nota text-tinta">{inc.ganho}</motion.p>

        <motion.section variants={PARTE}>
          <Rotulo>O que a IA viu</Rotulo>
          <p className="text-nota text-texto">{inc.leitura}</p>
        </motion.section>

        <motion.section variants={PARTE}>
          <Rotulo>Por quê</Rotulo>
          <p className="mb-2 text-nota text-texto">{inc.motivo}</p>
          <p className="mb-0.5 flex items-center gap-2 text-micro text-texto-2">
            <i className="h-px w-3 bg-texto-2" aria-hidden="true" />O que os cidadãos relataram
          </p>
          <ul>
            {deChamado.map((e) => (
              <li key={`${e.orgaoId}${e.descricao}`} className="flex items-baseline justify-between gap-3 border-t border-linha py-1.5 text-nota first:border-t-0">
                <span className="min-w-0">
                  <CorDoOrgao orgao={e.orgaoId} className="mr-1.5" />
                  <span className="text-tinta">{siglaDoOrgao(e.orgaoId)}</span> <span className="text-texto-2">· {e.canal}</span>
                  <span className="block text-rotulo text-texto-2">{e.descricao}</span>
                </span>
                <span className="text-corpo text-tinta tabular-nums">
                  <Contador valor={e.quantidade} formato={n} doZero atraso={0.2} />
                </span>
              </li>
            ))}
          </ul>
          {deOperacao.length > 0 && (
            <>
              <p className="mt-3 mb-0.5 flex items-center gap-2 text-micro text-acento-claro">
                <i className="w-3 border-t border-dashed border-acento-claro" aria-hidden="true" />O que os sistemas dos órgãos registraram
              </p>
              <ul>
                {deOperacao.map((e) => (
                  <li key={`${e.orgaoId}${e.descricao}`} className="flex items-baseline justify-between gap-3 border-t border-linha py-1.5 text-nota first:border-t-0">
                    <span className="min-w-0">
                      <CorDoOrgao orgao={e.orgaoId} className="mr-1.5" />
                      <span className="text-tinta">{siglaDoOrgao(e.orgaoId)}</span> <span className="text-texto-2">· {e.canal}</span>
                      <span className="block text-rotulo text-texto-2">{e.descricao}</span>
                    </span>
                    <span className="text-corpo text-tinta tabular-nums">
                  <Contador valor={e.quantidade} formato={n} doZero atraso={0.2} />
                </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {deContexto.length > 0 && (
            <ul className="mt-2 border-t border-dashed border-linha-forte pt-1.5">
              {deContexto.map((e) => (
                <li key={e.descricao} className="py-0.5 text-rotulo text-texto-2">
                  <span className="condensado text-micro">Contexto da cidade</span> · {siglaDoOrgao(e.orgaoId)}: {e.descricao}
                </li>
              ))}
            </ul>
          )}
        </motion.section>

        {ehReal(inc) && (
          <motion.section variants={PARTE}>
            <Rotulo>
              O que os cidadãos escreveram · {inc.relatos.length} relatos reais
            </Rotulo>
            <ul>
              {inc.relatos.slice(0, 6).map((r) => (
                <li key={r.protocolo} className="border-t border-linha py-1.5 first:border-t-0">
                  <p className="text-nota text-texto">{r.texto}</p>
                  <p className="mt-0.5 flex justify-between gap-2 text-micro text-texto-2">
                    <span>
                      {r.quando} · <span className="font-mono">{r.protocolo}</span>
                    </span>
                    <span className={r.aberto ? 'text-aviso' : 'text-acento-claro'}>{r.status}</span>
                  </p>
                </li>
              ))}
            </ul>
            {inc.relatos.length > 6 && <p className="mt-1 text-micro text-texto-2">e mais {inc.relatos.length - 6}, mais antigos.</p>}
            <p className="mt-1.5 text-micro text-texto-2">Texto do mapa público, sem foto; telefone, e-mail, CPF e placa são retirados. Relatos não são pessoas: o mapa não diz quem relatou.</p>
          </motion.section>
        )}

        <motion.section variants={PARTE}>
          <Rotulo>Confiança</Rotulo>
          <div className="flex items-center gap-3">
            <span className="w-16 shrink-0" title={O_QUE_E_A_NOTA}>
              <span className="block text-corpo leading-6 font-semibold text-tinta">{ROTULO_DA_FAIXA[faixaDaConfianca(inc.confianca)]}</span>
              <span className="block text-micro text-texto-2 tabular-nums">
                nota <Contador valor={Math.round(inc.confianca * 100)} formato={(v) => String(Math.round(v))} doZero atraso={0.3} />
              </span>
            </span>
            <div className="flex-1 space-y-1">
              <Barra valor={inc.partes.assunto} rotulo="Mesmo assunto" />
              <Barra valor={inc.partes.espaco} rotulo="Mesmo lugar" />
              <Barra valor={inc.partes.tempo} rotulo="Mesma hora" />
            </div>
          </div>
          <p className="mt-1.5 text-micro text-texto-2">{O_QUE_E_A_NOTA}</p>
        </motion.section>

        <motion.section variants={PARTE}>
          <Rotulo>O que sugere</Rotulo>
          <ol className="list-decimal space-y-1 pl-4 text-nota text-texto marker:text-texto-2">
            {inc.recomendacao.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
        </motion.section>

        <motion.section variants={PARTE}>
          <PlanoOuAndamento inc={inc} descartado={decisao.situacao === 'descartado'} />
        </motion.section>

        {inc.linhaDoTempo.length > 0 && (
          <motion.section variants={PARTE}>
            <Rotulo>Linha do tempo</Rotulo>
            <ol className="space-y-0.5 text-rotulo">
              {inc.linhaDoTempo.map((l) => (
                <li key={l.texto} className="grid grid-cols-[5.5rem_1fr] gap-2">
                  <span className="text-texto-2">{l.quando}</span>
                  <span className="text-texto">{l.texto}</span>
                </li>
              ))}
            </ol>
          </motion.section>
        )}
      </motion.div>

      <motion.footer initial={parado ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.35 }} className="space-y-2 border-t border-linha px-4 py-3">
        {decisao.situacao === 'sugerido' && !descartando && (
          <>
            <div className="flex gap-2">
              <button type="button" onClick={aoConfirmar} className="condensado flex-1 rounded-md bg-acento px-3 py-2 text-rotulo text-white hover:bg-acento-claro hover:text-base">
                Confirmar e enviar
              </button>
              <button type="button" onClick={() => setDescartando(true)} className="condensado rounded-md border border-linha-forte px-3 py-2 text-rotulo text-texto hover:text-tinta">
                Descartar
              </button>
            </div>
            <p className="text-micro text-texto-2">A IA sugere e monta o plano. Uma pessoa decide antes de qualquer pedido sair para um órgão.</p>
          </>
        )}
        {decisao.situacao === 'sugerido' && descartando && (
          <div role="group" aria-label="Motivo do descarte">
            <Rotulo>Por que descartar?</Rotulo>
            <div className="flex flex-wrap gap-1.5">
              {MOTIVOS_DE_DESCARTE.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setDescartando(false);
                    aoDescartar(m);
                  }}
                  className="rounded-md border border-linha-forte px-2.5 py-1.5 text-rotulo text-texto hover:border-acento-claro hover:text-tinta"
                >
                  {m}
                </button>
              ))}
              <button type="button" onClick={() => setDescartando(false)} className="px-2 py-1.5 text-rotulo text-texto-2 hover:text-tinta">
                Voltar
              </button>
            </div>
          </div>
        )}
        {decisao.situacao === 'enviando' && (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="text-nota text-tinta">Confirmado. Os pedidos saem para os órgãos em {Math.ceil(falta / 1000)} s…</p>
              <button type="button" onClick={aoCancelar} className="condensado rounded-md border border-linha-forte px-3 py-1.5 text-rotulo text-texto hover:text-tinta">
                Cancelar envio
              </button>
            </div>
            <div className="h-0.5 bg-realce">
              <div className="h-full bg-acento-claro" style={{ width: `${100 - (falta / JANELA_DE_ENVIO) * 100}%` }} />
            </div>
          </>
        )}
        {decisao.situacao === 'confirmado' && <p className="text-nota text-texto">Confirmado por uma pessoa. Os pedidos seguiram para os órgãos; as respostas aparecem acima, em "Ida e volta".</p>}
        {decisao.situacao === 'descartado' && (
          <div className="flex items-center justify-between gap-3">
            <p className="text-nota text-texto">
              Descartado: <span className="text-tinta">{decisao.motivo}</span>. Os chamados voltam a ser avulsos.
            </p>
            <button type="button" onClick={aoDesfazer} className="condensado rounded-md border border-linha-forte px-3 py-1.5 text-rotulo text-texto hover:text-tinta">
              Desfazer
            </button>
          </div>
        )}
      </motion.footer>
    </Painel>
  );
}

// ---------------------------------------------------------------- a região escolhida

/**
 * O cartão da região escolhida no seletor, na lateral direita: os chamados que
 * caem nela e o que a inteligência fez deles.
 */
export function CartaoDaRegiao({ r, aoFechar }: { r: ResumoDaRegiao; aoFechar: () => void }) {
  const maior = Math.max(1, ...r.porOrgao.map((o) => o.chamados));
  const parte = (v: number, de: number) => (de > 0 ? `${Math.round((v / de) * 100)}%` : '–');
  return (
    <div>
      <Painel className="pointer-events-auto w-[21.5rem] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="condensado text-micro text-texto-2">Região escolhida</p>
            <h2 className="truncate text-corpo font-semibold text-tinta">{r.nome}</h2>
            <p className="text-micro text-texto-2">{n(r.populacao)} habitantes</p>
          </div>
          <button type="button" onClick={aoFechar} aria-label="Voltar ao DF inteiro" title="Voltar ao DF inteiro" className="-mt-1 -mr-1 rounded px-2 py-1 text-texto-2 hover:bg-poco hover:text-tinta">
            ✕
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div>
            <p className="text-valor leading-7 font-semibold text-tinta tabular-nums">
              <Contador valor={r.chamados} formato={n} doZero atraso={0.3} />
            </p>
            <p className="text-rotulo text-texto">chamados</p>
            <p className="text-micro text-texto-2">{n(r.por10mil)} por 10 mil hab.</p>
          </div>
          <div>
            <p className="text-valor leading-7 font-semibold text-tinta tabular-nums">
              <Contador valor={r.incidentes} formato={n} doZero atraso={0.4} />
            </p>
            <p className="text-rotulo text-texto">incidente{r.incidentes === 1 ? '' : 's'}</p>
            <p className="text-micro text-texto-2">
              {r.porSeveridade.crítico} crítico{r.porSeveridade.crítico === 1 ? '' : 's'} · {r.porSeveridade.sério} sério{r.porSeveridade.sério === 1 ? '' : 's'}
            </p>
          </div>
          <div>
            <p className="text-valor leading-7 font-semibold text-tinta tabular-nums">{parte(r.agrupados, r.chamados)}</p>
            <p className="text-rotulo text-texto">agrupados</p>
            <p className="text-micro text-texto-2">{n(r.chamados - r.agrupados)} avulsos</p>
          </div>
        </div>

        {r.relatos && (
          <div className="mt-3 rounded border border-aviso/50 px-3 py-2">
            <p className="flex items-center justify-between gap-2 text-rotulo text-texto">
              <span>
                <span className="condensado mr-1.5 rounded border border-aviso/70 px-1 text-micro text-aviso">Dado real</span>
                {n(r.relatos.abertos + r.relatos.finalizados)} relatos do mapa público
              </span>
            </p>
            <div className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-realce" aria-hidden="true">
              <span className="bg-acento-claro" style={{ width: parte(r.relatos.finalizados, r.relatos.abertos + r.relatos.finalizados) }} />
            </div>
            <p className="mt-1 flex justify-between text-micro text-texto-2">
              <span>
                {n(r.relatos.finalizados)} finalizados ({parte(r.relatos.finalizados, r.relatos.abertos + r.relatos.finalizados)})
              </span>
              <span className="text-aviso">{n(r.relatos.abertos)} abertos</span>
            </p>
          </div>
        )}

        <p className="condensado mt-3 mb-1 text-micro text-texto-2">Órgãos com mais chamados</p>
        <ul className="space-y-1">
          {r.porOrgao.slice(0, 4).map((o) => (
            <li key={o.orgaoId} className="grid grid-cols-[7.5rem_1fr_2.75rem] items-center gap-2 text-rotulo">
              <span className="flex min-w-0 items-center gap-1.5 truncate text-texto">
                <CorDoOrgao orgao={o.orgaoId} />
                <span className="truncate">{siglaDoOrgao(o.orgaoId)}</span>
              </span>
              <span className="h-1 rounded-full bg-realce">
                <span className="block h-1 rounded-full bg-texto-2" style={{ width: `${(o.chamados / maior) * 100}%` }} />
              </span>
              <span className="text-right text-tinta tabular-nums">{n(o.chamados)}</span>
            </li>
          ))}
        </ul>

        <p className="mt-3 flex items-center justify-between gap-2 text-micro text-texto-2">
          <span>{r.reais > 0 ? (r.reais >= r.chamados - 0.5 ? 'Tudo dado real.' : 'Dado real e simulado, somados.') : 'Dado simulado.'}</span>
          <a href={`#/regioes?ra=${r.ra}`} className="text-acento-claro hover:underline">
            Ver a região inteira →
          </a>
        </p>
      </Painel>
    </div>
  );
}

// ---------------------------------------------------------------- por órgão

/**
 * A mesma informação sem geografia: cada fila de órgão à esquerda, o incidente
 * à direita, e a espessura da linha pelo volume. Para quando o cruzamento
 * importa mais que o lugar.
 */
export function PorOrgao({ inc }: { inc: Incidente }) {
  const filas = inc.evidencias.filter((e) => e.fonte !== 'contexto');
  const maior = Math.max(...filas.filter((e) => e.fonte === 'chamado').map((e) => e.quantidade));
  const claro = useTema() === 'claro';
  const altura = Math.max(150, filas.length * 54);
  const y = (k: number) => ((k + 0.5) / filas.length) * altura;
  return (
    <Painel className="w-[min(36rem,calc(100vw-2rem))] bg-painel! p-5">
      <p className="condensado text-micro text-texto-2">Por órgão · {inc.codigo}</p>
      <p className="mt-1 text-corpo text-tinta">
        {filas.length} sina{filas.length === 1 ? 'l' : 'is'} separado{filas.length === 1 ? '' : 's'}, um incidente
      </p>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_5rem_9rem] items-stretch">
        <ul className="flex flex-col justify-around" style={{ height: altura }}>
          {filas.map((e) => (
            <li key={`${e.orgaoId}${e.descricao}`} className="pr-3 text-right">
              <p className="text-nota text-tinta">
                <CorDoOrgao orgao={e.orgaoId} className="mr-1.5" />
                {siglaDoOrgao(e.orgaoId)} <span className="text-texto-2">· {e.canal}</span>
              </p>
              <p className="truncate text-rotulo text-texto-2">
                {e.fonte === 'operação' ? <span className="text-acento-claro">operação · </span> : `${n(e.quantidade)} · `}
                {e.descricao}
              </p>
            </li>
          ))}
        </ul>
        <svg viewBox={`0 0 100 ${altura}`} preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
          {filas.map((e, k) => (
            <path key={k} d={`M0 ${y(k)} C 55 ${y(k)}, 45 ${altura / 2}, 100 ${altura / 2}`} fill="none" stroke={claro ? corDoOrgao(e.orgaoId) : new Set(filas.map((f) => f.orgaoId)).size > 1 ? '#4cc3d6' : '#a4abb3'} strokeOpacity="0.75" strokeWidth={e.fonte === 'operação' ? 1.2 : 1 + 5 * Math.sqrt(e.quantidade / maior)} strokeDasharray={e.fonte === 'operação' ? '4 3' : undefined} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        <div className="flex flex-col justify-center border-l border-linha-forte pl-4">
          <Gravidade s={inc.severidade} />
          <p className="text-valor leading-8 font-semibold text-tinta tabular-nums">{n(inc.chamados)}</p>
          <p className="text-rotulo text-texto-2">chamados em 1 incidente</p>
        </div>
      </div>
    </Painel>
  );
}

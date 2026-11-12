/**
 * Os painéis da inteligência (I3): a fila de insights, o insight explicado
 * (o que a IA viu · por quê · confiança · o que sugere, como no slide 13) e a
 * leitura "por órgão". Pouca tinta: cor só para severidade e para a ação.
 */
import { motion } from 'motion/react';
import { type ReactNode, useState } from 'react';
import { REGIAO_POR_ID } from '../../dominio/ras';
import { type Incidente, NOME_DO_TIPO, type Resultado } from '../../inteligencia/agrupamento';
import { type Severidade, siglaDoOrgao } from '../../inteligencia/casos';
import { type Decisao, faltaParaEnviar, JANELA_DE_ENVIO, type MotivoDeDescarte, MOTIVOS_DE_DESCARTE, ROTULO_DA_SITUACAO } from '../../inteligencia/decisoes';
import { reduzMovimento } from '../../mapa/vista';
import { Painel } from '../../ui/Painel';

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

const Rotulo = ({ children }: { children: ReactNode }) => <p className="condensado mb-1.5 text-micro text-texto-2">{children}</p>;

// ---------------------------------------------------------------- fila

export function Fila({ resultado, aberto, decisaoDe, aoAbrir }: {
  resultado: Resultado;
  aberto: number;
  decisaoDe: (codigo: string) => Decisao;
  aoAbrir: (k: number) => void;
}) {
  const { incidentes, total, avulsos } = resultado;
  return (
    <Painel className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-linha px-4 py-3">
        <p className="text-nota text-texto-2">
          <span className="text-valor leading-8 font-semibold text-white tabular-nums">{n(total)}</span> chamados viram
        </p>
        <p className="text-nota text-texto-2">
          <span className="text-valor leading-8 font-semibold text-white tabular-nums">{incidentes.length}</span> incidentes sugeridos
          <span className="text-rotulo"> · {n(avulsos)} seguem avulsos</span>
        </p>
      </header>
      <ol className="min-h-0 flex-1 overflow-y-auto" aria-label="Insights, do mais urgente ao menos">
        {incidentes.map((inc, k) => {
          const ativo = k === aberto;
          return (
            <li key={inc.codigo}>
              <button type="button" onClick={() => aoAbrir(k)} aria-current={ativo ? 'true' : undefined} className={`block w-full border-b border-linha px-4 py-2.5 text-left transition-colors ${ativo ? 'bg-realce' : 'hover:bg-poco'}`}>
                <span className="flex items-center justify-between gap-2">
                  <Gravidade s={inc.severidade} />
                  <span className="font-mono text-micro text-texto-2">{inc.codigo}</span>
                </span>
                <span className={`mt-0.5 block text-nota ${ativo ? 'text-white' : 'text-texto'}`}>{inc.titulo}</span>
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
  return (
    <div className="grid grid-cols-[5.5rem_1fr_2.25rem] items-center gap-2 text-rotulo text-texto-2">
      <span>{rotulo}</span>
      <span className="h-1 rounded-full bg-realce">
        <span className="block h-1 rounded-full bg-texto-2" style={{ width: `${Math.round(valor * 100)}%` }} />
      </span>
      <span className="text-right tabular-nums">{Math.round(valor * 100)}%</span>
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
  return (
    <Painel className="flex min-h-0 flex-1 flex-col">
      <header className="border-b border-linha px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Gravidade s={inc.severidade} />
            <span className="condensado text-micro text-texto-2">
              {NOME_DO_TIPO[inc.tipo]}
              {inc.tipoDoCaso && inc.tipoDoCaso !== 'Mesmo incidente' ? ` · ${inc.tipoDoCaso}` : ''}
            </span>
            <span className="font-mono text-micro text-texto-2">{inc.codigo}</span>
          </div>
          <button type="button" onClick={aoFechar} aria-label="Fechar (Esc)" title="Fechar (Esc)" className="-mt-1 -mr-1 rounded px-2 py-1 text-texto-2 hover:bg-poco hover:text-white">
            ✕
          </button>
        </div>
        <h2 className="mt-1.5 text-corpo leading-snug font-semibold text-white">{inc.titulo}</h2>
        <p className="mt-0.5 text-rotulo text-texto-2">{inc.local}</p>
        {aoVerNoGrafo && (
          <button type="button" onClick={aoVerNoGrafo} className="condensado mt-2 rounded border border-linha-forte px-2.5 py-1 text-micro text-texto hover:border-acento-claro hover:text-white">
            Ver no grafo →
          </button>
        )}
      </header>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-3">
        <p className="rounded border border-linha bg-poco px-3 py-2 text-nota text-white">{inc.ganho}</p>

        <section>
          <Rotulo>O que a IA viu</Rotulo>
          <p className="text-nota text-texto">{inc.leitura}</p>
        </section>

        <section>
          <Rotulo>Por quê</Rotulo>
          <p className="mb-2 text-nota text-texto">{inc.motivo}</p>
          <p className="mb-0.5 flex items-center gap-2 text-micro text-texto-2">
            <i className="h-px w-3 bg-texto-2" aria-hidden="true" />O que os cidadãos relataram
          </p>
          <ul>
            {deChamado.map((e) => (
              <li key={`${e.orgaoId}${e.descricao}`} className="flex items-baseline justify-between gap-3 border-t border-linha py-1.5 text-nota first:border-t-0">
                <span className="min-w-0">
                  <span className="text-white">{siglaDoOrgao(e.orgaoId)}</span> <span className="text-texto-2">· {e.canal}</span>
                  <span className="block text-rotulo text-texto-2">{e.descricao}</span>
                </span>
                <span className="text-corpo text-white tabular-nums">{n(e.quantidade)}</span>
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
                      <span className="text-white">{siglaDoOrgao(e.orgaoId)}</span> <span className="text-texto-2">· {e.canal}</span>
                      <span className="block text-rotulo text-texto-2">{e.descricao}</span>
                    </span>
                    <span className="text-corpo text-white tabular-nums">{n(e.quantidade)}</span>
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
        </section>

        <section>
          <Rotulo>Confiança</Rotulo>
          <div className="flex items-center gap-3">
            <span className="text-valor leading-8 font-semibold text-white tabular-nums">{Math.round(inc.confianca * 100)}%</span>
            <div className="flex-1 space-y-1">
              <Barra valor={inc.partes.assunto} rotulo="Mesmo assunto" />
              <Barra valor={inc.partes.espaco} rotulo="Mesmo lugar" />
              <Barra valor={inc.partes.tempo} rotulo="Mesma hora" />
            </div>
          </div>
        </section>

        <section>
          <Rotulo>O que sugere</Rotulo>
          <ol className="list-decimal space-y-1 pl-4 text-nota text-texto marker:text-texto-2">
            {inc.recomendacao.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
        </section>

        {inc.linhaDoTempo.length > 0 && (
          <section>
            <Rotulo>Linha do tempo</Rotulo>
            <ol className="space-y-0.5 text-rotulo">
              {inc.linhaDoTempo.map((l) => (
                <li key={l.texto} className="grid grid-cols-[5.5rem_1fr] gap-2">
                  <span className="text-texto-2">{l.quando}</span>
                  <span className="text-texto">{l.texto}</span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>

      <footer className="space-y-2 border-t border-linha px-4 py-3">
        {decisao.situacao === 'sugerido' && !descartando && (
          <>
            <div className="flex gap-2">
              <button type="button" onClick={aoConfirmar} className="condensado flex-1 rounded-md bg-acento px-3 py-2 text-rotulo text-white hover:bg-acento-claro hover:text-base">
                Confirmar
              </button>
              <button type="button" onClick={() => setDescartando(true)} className="condensado rounded-md border border-linha-forte px-3 py-2 text-rotulo text-texto hover:text-white">
                Descartar
              </button>
            </div>
            <p className="text-micro text-texto-2">A IA sugere. Uma pessoa decide antes de qualquer órgão ser avisado.</p>
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
                  className="rounded-md border border-linha-forte px-2.5 py-1.5 text-rotulo text-texto hover:border-acento-claro hover:text-white"
                >
                  {m}
                </button>
              ))}
              <button type="button" onClick={() => setDescartando(false)} className="px-2 py-1.5 text-rotulo text-texto-2 hover:text-white">
                Voltar
              </button>
            </div>
          </div>
        )}
        {decisao.situacao === 'enviando' && (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="text-nota text-white">Confirmado. Avisando os órgãos em {Math.ceil(falta / 1000)} s…</p>
              <button type="button" onClick={aoCancelar} className="condensado rounded-md border border-linha-forte px-3 py-1.5 text-rotulo text-texto hover:text-white">
                Cancelar envio
              </button>
            </div>
            <div className="h-0.5 bg-realce">
              <div className="h-full bg-acento-claro" style={{ width: `${100 - (falta / JANELA_DE_ENVIO) * 100}%` }} />
            </div>
          </>
        )}
        {decisao.situacao === 'confirmado' && (
          <div>
            <Rotulo>Confirmado por uma pessoa · avisados (simulado)</Rotulo>
            <ul className="flex flex-wrap gap-1.5">
              {inc.orgaos.map((o, k) => (
                <motion.li key={o} initial={reduzMovimento() ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: k * 0.25 }} className="rounded border border-acento-claro/50 px-2 py-1 text-rotulo text-acento-claro">
                  ✓ {siglaDoOrgao(o)}
                </motion.li>
              ))}
              <motion.li initial={reduzMovimento() ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: inc.orgaos.length * 0.25 }} className="rounded border border-acento-claro/50 px-2 py-1 text-rotulo text-acento-claro">
                ✓ {n(inc.chamados)} cidadãos, com uma resposta só
              </motion.li>
            </ul>
          </div>
        )}
        {decisao.situacao === 'descartado' && (
          <div className="flex items-center justify-between gap-3">
            <p className="text-nota text-texto">
              Descartado: <span className="text-white">{decisao.motivo}</span>. Os chamados voltam a ser avulsos.
            </p>
            <button type="button" onClick={aoDesfazer} className="condensado rounded-md border border-linha-forte px-3 py-1.5 text-rotulo text-texto hover:text-white">
              Desfazer
            </button>
          </div>
        )}
      </footer>
    </Painel>
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
  const altura = Math.max(150, filas.length * 54);
  const y = (k: number) => ((k + 0.5) / filas.length) * altura;
  return (
    <Painel className="w-[min(46rem,calc(100vw-2rem))] p-5">
      <p className="condensado text-micro text-texto-2">Por órgão · {inc.codigo}</p>
      <p className="mt-1 text-corpo text-white">
        {filas.length} sina{filas.length === 1 ? 'l' : 'is'} separado{filas.length === 1 ? '' : 's'}, um incidente
      </p>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_7rem_11rem] items-stretch">
        <ul className="flex flex-col justify-around" style={{ height: altura }}>
          {filas.map((e) => (
            <li key={`${e.orgaoId}${e.descricao}`} className="pr-3 text-right">
              <p className="text-nota text-white">
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
            <path key={k} d={`M0 ${y(k)} C 55 ${y(k)}, 45 ${altura / 2}, 100 ${altura / 2}`} fill="none" stroke={new Set(filas.map((f) => f.orgaoId)).size > 1 ? '#4cc3d6' : '#a4abb3'} strokeOpacity="0.75" strokeWidth={e.fonte === 'operação' ? 1.2 : 1 + 5 * Math.sqrt(e.quantidade / maior)} strokeDasharray={e.fonte === 'operação' ? '4 3' : undefined} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        <div className="flex flex-col justify-center border-l border-linha-forte pl-4">
          <Gravidade s={inc.severidade} />
          <p className="text-valor leading-8 font-semibold text-white tabular-nums">{n(inc.chamados)}</p>
          <p className="text-rotulo text-texto-2">chamados em 1 incidente</p>
        </div>
      </div>
    </Painel>
  );
}

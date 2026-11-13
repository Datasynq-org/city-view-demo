/**
 * O painel de insights (os "insights ocultos" da demo exploratória): o que só
 * aparece quando se cruzam os chamados e a operação de órgãos diferentes. No
 * alto, o que isso soma; abaixo, um cartão por insight. Clicar abre o insight
 * explicado, onde uma pessoa confirma ou descarta.
 */
import { motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { REGIAO_POR_ID } from '../../dominio/ras';
import { type Incidente, NOME_DO_TIPO, type Resultado } from '../../inteligencia/agrupamento';
import { type Severidade, siglaDoOrgao } from '../../inteligencia/casos';
import { faixaDaConfianca } from '../../inteligencia/confianca';
import { type Decisao, ROTULO_DA_SITUACAO } from '../../inteligencia/decisoes';
import { ROTULO_DA_SITUACAO_DO_INCIDENTE, situacaoDoIncidente } from '../../inteligencia/encaminhamento';
import type { Estado } from '../../inteligencia/estado';
import { type FiltroDeInsights, filtrarInsights, horasPoupadas, MINUTOS_POR_ATENDIMENTO, opcoesDeFiltro, type Resumo, SEM_FILTRO } from '../../inteligencia/resumo';
import { reduzMovimento } from '../../mapa/vista';
import { Painel } from '../../ui/Painel';
import { escolhaAtual } from '../../ui/perfil';
import { useTema } from '../../ui/tema';
import { Origem } from '../../ui/Origem';
import { EmAndamento, Registro } from './Encaminhamento';
import { CorDoOrgao, Faixa, LegendaDasAreas } from './partes';

const n = (v: number) => Math.round(v).toLocaleString('pt-BR');
const ROTULO: Record<Severidade, string> = { crítico: 'Crítico', sério: 'Sério', atenção: 'Atenção' };
const COR: Record<Severidade, string> = { crítico: 'text-alerta', sério: 'text-aviso', atenção: 'text-texto-2' };
const FUNDO: Record<Severidade, string> = { crítico: 'bg-alerta', sério: 'bg-aviso', atenção: 'bg-texto-2' };
const SEVERIDADES: Severidade[] = ['crítico', 'sério', 'atenção'];

function Numero({ valor, rotulo, nota }: { valor: string; rotulo: string; nota?: string }) {
  return (
    <div className="min-w-0 border-l border-linha pl-4 first:border-l-0 first:pl-0">
      <p className="text-valor font-semibold text-tinta tabular-nums">{valor}</p>
      <p className="text-nota text-texto">{rotulo}</p>
      {nota && <p className="text-micro text-texto-2">{nota}</p>}
    </div>
  );
}

function Opcao({ ativo, aoClicar, children }: { ativo: boolean; aoClicar: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={ativo} onClick={aoClicar} className={`rounded border px-2.5 py-1 text-rotulo ${ativo ? 'border-acento-claro bg-realce text-tinta' : 'border-linha text-texto-2 hover:text-tinta'}`}>
      {children}
    </button>
  );
}

function Cartao({ inc, decisao, andando, ativo, recuado, aoAbrir }: { inc: Incidente; decisao: Decisao; /** Confirmado: em que pé está com os órgãos. */ andando: string | null; ativo: boolean; /** Outro cartão está aberto: este recua. */ recuado: boolean; aoAbrir: () => void }) {
  const relatos = inc.evidencias.filter((e) => e.fonte === 'chamado');
  const operacao = inc.evidencias.filter((e) => e.fonte === 'operação');
  const descartado = decisao.situacao === 'descartado';
  const claro = useTema() === 'claro';
  const parado = reduzMovimento();
  // Depois que a grade cede espaço ao insight, o cartão escolhido volta para a vista.
  const el = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!ativo) return;
    const t = setTimeout(() => el.current?.scrollIntoView({ block: 'nearest', behavior: parado ? 'auto' : 'smooth' }), parado ? 0 : 320);
    return () => clearTimeout(t);
  }, [ativo, parado]);
  return (
    <li>
      <motion.button ref={el} type="button" onClick={aoAbrir} aria-current={ativo ? 'true' : undefined} animate={ativo && !parado ? { scale: [1, 1.018, 1] } : { scale: 1 }} transition={{ duration: 0.32, ease: 'easeOut' }} className={`painel-vidro relative flex h-full w-full flex-col overflow-hidden p-4 text-left transition-[opacity,border-color,box-shadow] duration-200 ${ativo ? 'border-acento-claro! shadow-[0_0_0_1px_var(--color-acento-claro)]' : 'hover:border-linha-forte!'} ${descartado || recuado ? 'opacity-55 hover:opacity-100' : ''}`}>
        <Faixa ativo={ativo} />
        <span className="flex items-center justify-between gap-2">
          <span className={`condensado inline-flex items-center gap-1.5 text-micro ${COR[inc.severidade]}`}>
            <span className={`size-1.5 rounded-full ${FUNDO[inc.severidade]}`} aria-hidden="true" />
            {ROTULO[inc.severidade]}
          </span>
          <span className="condensado text-micro text-texto-2">
            {inc.tipoDoCaso ?? NOME_DO_TIPO[inc.tipo]} · <span className="font-mono normal-case">{inc.codigo}</span>
          </span>
        </span>
        <span className="mt-2 block text-corpo leading-snug font-semibold text-tinta">{inc.titulo}</span>
        <span className="mt-0.5 block text-rotulo text-texto-2">{(inc.raId && REGIAO_POR_ID[inc.raId]?.nome) || '–'}</span>

        <span className="mt-3 block space-y-1">
          {relatos.map((e) => (
            <span key={`${e.orgaoId}${e.descricao}`} className="flex items-baseline justify-between gap-3 text-rotulo">
              <span className="flex min-w-0 items-baseline gap-2">
                {claro ? <CorDoOrgao orgao={e.orgaoId} /> : <i className="h-px w-3 shrink-0 translate-y-[-3px] bg-texto-2" aria-hidden="true" />}
                <span className="shrink-0 text-texto">{siglaDoOrgao(e.orgaoId)}</span>
                <span className="truncate text-texto-2">{e.descricao}</span>
              </span>
              <span className="text-tinta tabular-nums">{n(e.quantidade)}</span>
            </span>
          ))}
          {operacao.map((e) => (
            <span key={`${e.orgaoId}${e.descricao}`} className="flex items-baseline gap-2 text-rotulo">
              <i className="w-3 shrink-0 translate-y-[-3px] border-t border-dashed border-acento-claro" aria-hidden="true" />
              <span className="shrink-0 text-acento-claro">{siglaDoOrgao(e.orgaoId)} · operação</span>
              <span className="truncate text-texto-2">{e.descricao}</span>
            </span>
          ))}
        </span>

        <span className="mt-3 line-clamp-3 block text-nota text-texto">{inc.leitura}</span>
        <span className="mt-auto block pt-3">
          <span className="block rounded border border-linha bg-poco px-3 py-2 text-rotulo text-tinta">{inc.ganho}</span>
          <span className="mt-2 flex items-center justify-between gap-2 text-micro text-texto-2">
            <span>
              {n(inc.chamados)} chamados · {inc.orgaos.length} órgão{inc.orgaos.length === 1 ? '' : 's'} · confiança {faixaDaConfianca(inc.confianca)}
            </span>
            <span className={`condensado rounded border px-1.5 py-0.5 ${decisao.situacao === 'sugerido' ? 'border-dashed border-linha-forte' : descartado ? 'border-linha line-through' : 'border-acento-claro/60 text-acento-claro'}`}>{andando ?? ROTULO_DA_SITUACAO[decisao.situacao]}</span>
          </span>
        </span>
      </motion.button>
    </li>
  );
}

type Aba = 'insights' | 'andamento' | 'registro';

export function PainelDeInsights({ resultado, resumo, estado, decisaoDe, aberto, aoAbrir, comInsight }: {
  resultado: Resultado;
  resumo: Resumo;
  /** O estado comum: o andamento de cada incidente confirmado e o registro. */
  estado: Estado;
  decisaoDe: (codigo: string) => Decisao;
  aberto: number;
  aoAbrir: (k: number) => void;
  /** O insight está aberto ao lado: a grade cede espaço. */
  comInsight: boolean;
}) {
  // O gestor de órgão começa vendo os insights em que o órgão dele entra.
  const [filtro, setFiltro] = useState<FiltroDeInsights>(() => ({ ...SEM_FILTRO, orgao: escolhaAtual().orgao }));
  const [aba, setAba] = useState<Aba>('insights');
  const emAndamento = Object.keys(estado.andamentos).length;
  // Os cidadãos dos incidentes já resolvidos: receberam uma resposta só.
  const avisados = Object.values(estado.andamentos).reduce((s, an) => s + (situacaoDoIncidente(an) === 'resolvido' ? (estado.fichas[an.codigo]?.chamados ?? 0) : 0), 0);
  const abrirPeloCodigo = (codigo: string) => {
    const k = resultado.incidentes.findIndex((i) => i.codigo === codigo);
    if (k >= 0) aoAbrir(k);
  };
  const ABAS: { id: Aba; nome: string }[] = [
    { id: 'insights', nome: `Insights · ${resultado.incidentes.length}` },
    { id: 'andamento', nome: `Em andamento · ${emAndamento}` },
    { id: 'registro', nome: `Registro · ${estado.registro.length}` },
  ];
  const opcoes = useMemo(() => opcoesDeFiltro(resultado.incidentes), [resultado]);
  const visiveis = useMemo(() => filtrarInsights(resultado.incidentes, filtro), [resultado, filtro]);
  const mudar = <K extends keyof FiltroDeInsights>(k: K, v: FiltroDeInsights[K]) => setFiltro((f) => ({ ...f, [k]: f[k] === v ? null : v }));

  return (
    <div className={`pagina ${comInsight ? 'pagina-com-insight' : ''}`}>
      <Painel className="p-5">
        <h2 className="titulo-painel">Insights ocultos</h2>
        <p className="mt-0.5 text-rotulo text-texto-2">O que nenhum órgão vê sozinho: chamados e dados de operação que, cruzados, contam outra história. Sugestões da IA; uma pessoa confirma.</p>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 lg:grid-cols-5">
          <Numero valor={n(resumo.chamados)} rotulo="chamados" nota="em todas as filas" />
          <Numero valor={n(resumo.incidentes)} rotulo="incidentes sugeridos" nota={`${resumo.porSeveridade.crítico} críticos · ${resumo.porSeveridade.sério} sérios`} />
          <Numero valor={n(resumo.evitados)} rotulo="atendimentos poupados" nota={`em cada incidente, todos menos um · ≈ ${n(horasPoupadas(resumo.evitados))} h de equipe, a ${MINUTOS_POR_ATENDIMENTO} min cada (premissa de exemplo)`} />
          <Numero valor={`${resumo.entreOrgaos}`} rotulo="cruzam mais de um órgão" nota={`${resumo.comOperacao} usam a operação dos sistemas`} />
          <Numero valor={`${resumo.porSituacao.confirmado + resumo.porSituacao.enviando}`} rotulo="confirmados por uma pessoa" nota={`${resumo.porSituacao.sugerido} esperam decisão · ${resumo.porSituacao.descartado} descartados${avisados > 0 ? ` · ${n(avisados)} cidadãos avisados com uma resposta só` : ''}`} />
        </div>
        <Origem className="mt-3" conta="Chamados de órgãos diferentes ligados por assunto, lugar e hora; os grupos viram incidentes sugeridos. Os casos da demonstração são escritos pela equipe, e a IA os reencontra entre os chamados do dia a dia." />
      </Painel>

      <div role="tablist" aria-label="O que ver" className="flex gap-1 border-b border-linha">
        {ABAS.map((a) => (
          <button key={a.id} type="button" role="tab" aria-selected={a.id === aba} onClick={() => setAba(a.id)} className={`condensado -mb-px border-b-2 px-3 py-2 text-rotulo ${a.id === aba ? 'border-acento-claro text-tinta' : 'border-transparent text-texto-2 hover:text-tinta'}`}>
            {a.nome}
          </button>
        ))}
      </div>

      {aba === 'andamento' && <EmAndamento estado={estado} aoAbrir={abrirPeloCodigo} />}
      {aba === 'registro' && <Registro estado={estado} codigos={resultado.incidentes.map((i) => i.codigo)} />}

      {aba === 'insights' && (
      <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2" role="group" aria-label="Filtros">
        <span className="flex flex-wrap items-center gap-1.5">
          {SEVERIDADES.map((s) => (
            <Opcao key={s} ativo={filtro.severidade === s} aoClicar={() => mudar('severidade', s)}>
              {ROTULO[s]}
            </Opcao>
          ))}
        </span>
        <span className="flex flex-wrap items-center gap-1.5">
          {opcoes.tipos.map((t) => (
            <Opcao key={t} ativo={filtro.tipo === t} aoClicar={() => mudar('tipo', t)}>
              {t}
            </Opcao>
          ))}
        </span>
        <label className="flex items-center gap-2 text-rotulo text-texto-2">
          Órgão
          <select value={filtro.orgao ?? ''} onChange={(e) => setFiltro((f) => ({ ...f, orgao: e.target.value || null }))} className="rounded border border-linha bg-poco px-2 py-1 text-rotulo text-tinta">
            <option value="">todos</option>
            {opcoes.orgaos.map((o) => (
              <option key={o} value={o}>
                {siglaDoOrgao(o)}
              </option>
            ))}
          </select>
        </label>
        <span className="text-rotulo text-texto-2">
          {visiveis.length} de {resultado.incidentes.length}
        </span>
      </div>
      <LegendaDasAreas orgaos={opcoes.orgaos} />

      <ul className="grade-de-insights">
        {visiveis.map(({ inc, k }) => (
          <Cartao key={inc.codigo} inc={inc} decisao={decisaoDe(inc.codigo)} andando={estado.andamentos[inc.codigo] ? ROTULO_DA_SITUACAO_DO_INCIDENTE[situacaoDoIncidente(estado.andamentos[inc.codigo]!)] : null} ativo={k === aberto} recuado={comInsight && k !== aberto} aoAbrir={() => aoAbrir(k)} />
        ))}
      </ul>
      {visiveis.length === 0 && <p className="text-nota text-texto-2">Nenhum insight com esses filtros.</p>}

      {/* Triangulação (magno 7.2): fora da conta, como proposta, até a resposta à pergunta 9.3. */}
      <section className="rounded-lg border border-dashed border-linha-forte p-5">
        <p className="flex flex-wrap items-center gap-2">
          <span className="condensado rounded border border-dashed border-linha-forte px-1.5 py-0.5 text-micro text-texto-2">Proposta · não é um insight da demo</span>
          <span className="condensado text-micro text-texto-2">Triangulação</span>
        </p>
        <h3 className="mt-2 text-corpo font-semibold text-tinta">O problema invisível: quando quase ninguém reclama</h3>
        <p className="mt-1 max-w-3xl text-nota text-texto">
          Todos os insights acima partem de chamados. Chamado mede quem tem canal e costume de reclamar, não quem mais precisa. A triangulação olha o contrário: uma região em que a <span className="text-tinta">operação</span> do órgão mostra aperto (fila longa, espera alta) e os <span className="text-tinta">chamados</span> quase não aparecem.
        </p>
        <div className="mt-3 grid max-w-3xl gap-2 sm:grid-cols-3">
          {[
            ['Operação', 'espera alta na unidade de saúde da região', 'o que o sistema do órgão registra'],
            ['Chamados', 'quase nenhum, na mesma região', 'o que o cidadão relata'],
            ['Leitura', 'problema que não chega pelos canais', 'o que os dois juntos sugerem'],
          ].map(([r, v, nota]) => (
            <div key={r} className="rounded border border-linha px-3 py-2">
              <p className="condensado text-micro text-texto-2">{r}</p>
              <p className="text-nota text-tinta">{v}</p>
              <p className="text-micro text-texto-2">{nota}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 max-w-3xl text-micro text-texto-2">
          Exemplo ilustrativo, sem número: a demo não tem dado de fila de saúde. Depende de os órgãos liberarem dados de operação, o que ainda é pergunta em aberto. Não usa redes sociais: só o que o órgão registra e o que o cidadão relata.
        </p>
      </section>
      </>
      )}
    </div>
  );
}

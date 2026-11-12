/**
 * O painel de insights (os "insights ocultos" da demo exploratória): o que só
 * aparece quando se cruzam os chamados e a operação de órgãos diferentes. No
 * alto, o que isso soma; abaixo, um cartão por insight. Clicar abre o insight
 * explicado, onde uma pessoa confirma ou descarta.
 */
import { useMemo, useState } from 'react';
import { REGIAO_POR_ID } from '../../dominio/ras';
import { type Incidente, NOME_DO_TIPO, type Resultado } from '../../inteligencia/agrupamento';
import { type Severidade, siglaDoOrgao } from '../../inteligencia/casos';
import { type Decisao, ROTULO_DA_SITUACAO } from '../../inteligencia/decisoes';
import { type FiltroDeInsights, filtrarInsights, opcoesDeFiltro, type Resumo, SEM_FILTRO } from '../../inteligencia/resumo';
import { Painel } from '../../ui/Painel';

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

function Cartao({ inc, decisao, ativo, aoAbrir }: { inc: Incidente; decisao: Decisao; ativo: boolean; aoAbrir: () => void }) {
  const relatos = inc.evidencias.filter((e) => e.fonte === 'chamado');
  const operacao = inc.evidencias.filter((e) => e.fonte === 'operação');
  const descartado = decisao.situacao === 'descartado';
  return (
    <li>
      <button type="button" onClick={aoAbrir} aria-current={ativo ? 'true' : undefined} className={`painel-vidro flex h-full w-full flex-col p-4 text-left transition-colors ${ativo ? 'border-acento-claro!' : 'hover:border-linha-forte!'} ${descartado ? 'opacity-55' : ''}`}>
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
                <i className="h-px w-3 shrink-0 translate-y-[-3px] bg-texto-2" aria-hidden="true" />
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
              {n(inc.chamados)} chamados · {inc.orgaos.length} órgão{inc.orgaos.length === 1 ? '' : 's'} · confiança {Math.round(inc.confianca * 100)}%
            </span>
            <span className={`condensado rounded border px-1.5 py-0.5 ${decisao.situacao === 'sugerido' ? 'border-dashed border-linha-forte' : descartado ? 'border-linha line-through' : 'border-acento-claro/60 text-acento-claro'}`}>{ROTULO_DA_SITUACAO[decisao.situacao]}</span>
          </span>
        </span>
      </button>
    </li>
  );
}

export function PainelDeInsights({ resultado, resumo, decisaoDe, aberto, aoAbrir, comInsight }: {
  resultado: Resultado;
  resumo: Resumo;
  decisaoDe: (codigo: string) => Decisao;
  aberto: number;
  aoAbrir: (k: number) => void;
  /** O insight está aberto ao lado: a grade cede espaço. */
  comInsight: boolean;
}) {
  const [filtro, setFiltro] = useState<FiltroDeInsights>(SEM_FILTRO);
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
          <Numero valor={n(resumo.evitados)} rotulo="atendimentos repetidos a menos" nota="em cada incidente, todos menos um" />
          <Numero valor={`${resumo.entreOrgaos}`} rotulo="cruzam mais de um órgão" nota={`${resumo.comOperacao} usam a operação dos sistemas`} />
          <Numero valor={`${resumo.porSituacao.confirmado + resumo.porSituacao.enviando}`} rotulo="confirmados por uma pessoa" nota={`${resumo.porSituacao.sugerido} esperam decisão · ${resumo.porSituacao.descartado} descartados`} />
        </div>
      </Painel>

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

      <ul className="grade-de-insights">
        {visiveis.map(({ inc, k }) => (
          <Cartao key={inc.codigo} inc={inc} decisao={decisaoDe(inc.codigo)} ativo={k === aberto} aoAbrir={() => aoAbrir(k)} />
        ))}
      </ul>
      {visiveis.length === 0 && <p className="text-nota text-texto-2">Nenhum insight com esses filtros.</p>}
    </div>
  );
}

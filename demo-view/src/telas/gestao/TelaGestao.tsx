/**
 * I4 · Gestão (CV-DEM-001, seção 6): "Como está a velocidade da gestão?" e
 * "Como está a minha área?". Slides 14 e 15 do CV-APR-001.
 *
 * No alto, a velocidade da gestão contra o período anterior. Abaixo, a tabela
 * dos órgãos: hoje cada um está num sistema separado. Clicar num órgão abre a
 * visão do gestor dele. Tudo sobre dados SIMULADOS.
 */
import { type ReactNode, useMemo, useState } from 'react';
import { cidade } from '../../dados/cidade';
import { inicioDoDia } from '../../dados/gerador';
import { estaAberto } from '../../dominio/incidente';
import { type AreaId, AREAS, ORGAO_POR_ID } from '../../dominio/orgaos';
import { operacaoDoOrgao } from '../../dominio/operacao';
import { REGIAO_POR_ID } from '../../dominio/ras';
import { type Comparacao, comparar, entre, foraDoPrazo, type LinhaDoOrgao, porDia, porOrgao, porRegiao, porTipo, repetidos } from '../../indicadores/gestao';
import { duracao, numero, percentual } from '../../indicadores/indicadores';
import { CASOS } from '../../inteligencia/casos';
import { parametrosDoHash } from '../../navegacao';
import { Barra, Linha, Minilinha } from '../../ui/graficos';
import { Painel } from '../../ui/Painel';
import { Operacao } from '../jornada/Operacao';
import { Grupo } from '../sala/partes';

const DIA = 86_400_000;
type Janela = '7' | '14';
const JANELAS: { id: Janela; nome: string }[] = [
  { id: '7', nome: '7 dias' },
  { id: '14', nome: '14 dias' },
];
const dataCurta = (t: number) => new Date(t).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' });

const Titulo = ({ children, nota }: { children: ReactNode; nota?: string }) => (
  <div className="mb-3">
    <h2 className="titulo-painel">{children}</h2>
    {nota && <p className="mt-0.5 text-rotulo text-texto-2">{nota}</p>}
  </div>
);

/** Variação com texto e sinal: nunca só a cor. `bomSeCair` para tempo e filas. */
function Variacao({ valor, unidade, bomSeCair = false }: { valor: number | null; unidade: string; bomSeCair?: boolean }) {
  if (valor === null) return <span className="text-rotulo text-texto-2">sem período anterior</span>;
  const estavel = Math.abs(valor) < 0.5;
  const bom = bomSeCair ? valor < 0 : valor > 0;
  const texto = `${valor > 0 ? '+' : '−'}${Math.abs(valor).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}${unidade}`;
  return (
    <span className={`text-rotulo tabular-nums ${estavel ? 'text-texto-2' : bom ? 'text-acento-claro' : 'text-aviso'}`}>
      {estavel ? 'igual ao' : `${valor > 0 ? '▲' : '▼'} ${texto} sobre o`} período anterior
    </span>
  );
}

function Numero({ rotulo, valor, children }: { rotulo: string; valor: string; children?: ReactNode }) {
  return (
    <div className="rounded border border-linha bg-poco px-4 py-3">
      <p className="condensado text-micro text-texto-2">{rotulo}</p>
      <p className="mt-1 text-valor font-semibold text-white tabular-nums">{valor}</p>
      {children}
    </div>
  );
}

const LEITURA: Record<Comparacao['leitura'], string> = {
  'mais rápida': 'A gestão está mais rápida que no período anterior.',
  'mais lenta': 'A gestão está mais lenta que no período anterior.',
  estável: 'A gestão está no mesmo ritmo do período anterior.',
  'sem comparação': 'Ainda não há período anterior para comparar.',
};

type Coluna = 'chamados' | 'abertos' | 'foraDoPrazo' | 'noPrazo' | 'tempo' | 'repetidos';
const COLUNAS: { id: Coluna; nome: string; dica: string }[] = [
  { id: 'chamados', nome: 'Chamados', dica: 'Abertos no período' },
  { id: 'abertos', nome: 'Em aberto', dica: 'Ainda esperando alguém agir' },
  { id: 'foraDoPrazo', nome: 'Fora do prazo', dica: 'Abertos há mais tempo que o prazo do tipo' },
  { id: 'noPrazo', nome: 'No prazo', dica: 'Dos resolvidos, quantos dentro do prazo' },
  { id: 'tempo', nome: 'Tempo', dica: 'Mediana até resolver' },
  { id: 'repetidos', nome: 'Repetidos', dica: 'Mesmo tipo, a menos de 150 m e de 24 h: o City View agruparia' },
];

export function TelaGestao() {
  const { inicio: agora, chegados } = useMemo(cidade, []);
  const [janela, setJanela] = useState<Janela>('7');
  const [area, setArea] = useState<AreaId | null>(null);
  const [ordem, setOrdem] = useState<{ coluna: Coluna; desc: boolean }>({ coluna: 'chamados', desc: true });
  const [orgao, setOrgao] = useState<string | null>(() => parametrosDoHash().get('orgao'));
  const dias = Number(janela);

  const comparacao = useMemo(() => comparar(chegados, agora, dias, { area }), [chegados, agora, dias, area]);
  const serie = useMemo(() => porDia(chegados, agora, 28, { area }), [chegados, agora, area]);
  const fim = inicioDoDia(agora) + DIA;
  const doPeriodo = useMemo(() => entre(chegados, fim - dias * DIA, fim, { area }), [chegados, fim, dias, area]);
  const resumo = useMemo(() => ({ abertos: doPeriodo.filter((i) => estaAberto(i.situacao)).length, fora: foraDoPrazo(doPeriodo, agora), repetidos: repetidos(doPeriodo) }), [doPeriodo, agora]);
  const tabela = useMemo(() => porOrgao(chegados, agora, dias, { area }), [chegados, agora, dias, area]);
  const ordenada = useMemo(() => [...tabela].sort((a, b) => ((b[ordem.coluna] ?? -1) - (a[ordem.coluna] ?? -1)) * (ordem.desc ? 1 : -1)), [tabela, ordem]);
  const maisChamados = Math.max(1, ...tabela.map((l) => l.chamados));
  const escolhido = orgao ? tabela.find((l) => l.orgaoId === orgao) : undefined;

  const ordenar = (coluna: Coluna) => setOrdem((o) => ({ coluna, desc: o.coluna === coluna ? !o.desc : true }));

  return (
    <main className="pagina">
      <div className="flex flex-wrap items-center gap-2">
        <Grupo rotulo="Período" opcoes={JANELAS} valor={janela} aoMudar={setJanela} />
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Área">
          {[{ id: null, curto: 'Todas as áreas' } as { id: AreaId | null; curto: string }, ...AREAS].map((a) => (
            <button key={a.id ?? 'todas'} type="button" aria-pressed={a.id === area} onClick={() => setArea(a.id)} className={`rounded border px-2.5 py-1.5 text-rotulo ${a.id === area ? 'border-acento-claro bg-realce text-white' : 'border-linha text-texto-2 hover:text-white'}`}>
              {a.curto}
            </button>
          ))}
        </div>
      </div>

      <div className="pagina-grade">
        <Painel className="p-5">
          <Titulo nota={`Chamados abertos nos últimos ${dias} dias, contra os ${dias} dias anteriores, medidos com a mesma idade${area ? '' : ' · todos os órgãos somados'}`}>Velocidade da gestão</Titulo>
          <p className="mb-3 text-corpo text-white">{LEITURA[comparacao.leitura]}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <Numero rotulo="Resolvido no prazo" valor={percentual(comparacao.atual.noPrazo)}>
              <Variacao valor={comparacao.noPrazo} unidade=" pontos" />
            </Numero>
            <Numero rotulo="Tempo até resolver (mediana)" valor={duracao(comparacao.atual.tempo)}>
              <Variacao valor={comparacao.tempo === null ? null : comparacao.tempo * 100} unidade="%" bomSeCair />
            </Numero>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {[
              ['Em aberto', numero(resumo.abertos), 'esperando alguém agir'],
              ['Fora do prazo', numero(resumo.fora), 'abertos além do prazo do tipo'],
              ['Repetidos', numero(resumo.repetidos), 'o City View agruparia'],
            ].map(([r, v, nota]) => (
              <div key={r} className="rounded border border-linha px-3 py-2">
                <p className="condensado text-micro text-texto-2">{r}</p>
                <p className="text-corpo font-semibold text-white tabular-nums">{v}</p>
                <p className="text-micro text-texto-2">{nota}</p>
              </div>
            ))}
          </div>
        </Painel>

        <Painel className="p-5">
          <Titulo nota="Dos chamados abertos em cada dia, a parte resolvida dentro do prazo. Só entram os chamados cujo prazo já venceu; por isso a linha para antes de hoje.">Prazo cumprido, dia a dia</Titulo>
          <Linha serie={serie.map((d) => (d.noPrazo === null ? null : d.noPrazo * 100))} formato={(v) => `${Math.round(v)}%`} descricao="Percentual do prazo cumprido por dia, nos últimos 28 dias" inicio={dataCurta(serie[0]!.dia)} fim={`hoje, ${dataCurta(serie.at(-1)!.dia)}`} />
          <p className="mt-4 mb-1 text-rotulo text-texto-2">Chamados abertos por dia (hoje é parcial)</p>
          <Linha serie={serie.map((d) => d.chamados)} altura={26} desdeZero formato={(v) => numero(v)} descricao="Chamados abertos por dia, nos últimos 28 dias" />
        </Painel>
      </div>

      <div className={escolhido ? 'pagina-grade' : ''}>
        <Painel className="min-w-0 p-5">
          <Titulo nota="Hoje cada um destes está num sistema separado. Clique num órgão para ver o que o gestor dele veria. Ordene pelas colunas.">Órgãos</Titulo>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] border-collapse text-nota">
              <thead>
                <tr className="border-b border-linha-forte text-left">
                  <th scope="col" className="py-2 pr-3 font-normal">
                    <span className="condensado text-micro text-texto-2">Órgão</span>
                  </th>
                  {COLUNAS.map((c) => (
                    <th key={c.id} scope="col" className="px-2 py-2 text-right font-normal" aria-sort={ordem.coluna === c.id ? (ordem.desc ? 'descending' : 'ascending') : 'none'}>
                      <button type="button" onClick={() => ordenar(c.id)} title={c.dica} className={`condensado text-micro ${ordem.coluna === c.id ? 'text-white' : 'text-texto-2 hover:text-white'}`}>
                        {c.nome}
                        {ordem.coluna === c.id ? (ordem.desc ? ' ▼' : ' ▲') : ''}
                      </button>
                    </th>
                  ))}
                  <th scope="col" className="py-2 pl-2 text-right font-normal">
                    <span className="condensado text-micro text-texto-2">Por dia</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ordenada.map((l) => (
                  <LinhaDaTabela key={l.orgaoId} l={l} maior={maisChamados} ativo={l.orgaoId === orgao} aoAbrir={() => setOrgao((o) => (o === l.orgaoId ? null : l.orgaoId))} />
                ))}
              </tbody>
            </table>
          </div>
        </Painel>

        {escolhido && <VisaoDoGestor linha={escolhido} dias={dias} aoFechar={() => setOrgao(null)} />}
      </div>
    </main>
  );
}

function LinhaDaTabela({ l, maior, ativo, aoAbrir }: { l: LinhaDoOrgao; maior: number; ativo: boolean; aoAbrir: () => void }) {
  const o = ORGAO_POR_ID[l.orgaoId]!;
  return (
    <tr className={`cursor-pointer border-b border-linha transition-colors ${ativo ? 'bg-realce' : 'hover:bg-poco'}`} onClick={aoAbrir}>
      <th scope="row" className="py-2 pr-3 text-left font-normal">
        <button type="button" aria-expanded={ativo} className="text-left">
          <span className="text-white">{o.sigla}</span>
          <span className="block max-w-56 truncate text-micro text-texto-2">{o.nome}</span>
        </button>
      </th>
      <td className="px-2 py-2 text-right tabular-nums">
        <span className="text-white">{numero(l.chamados)}</span>
        <Barra valor={l.chamados / maior} className="mt-1 ml-auto w-16" />
      </td>
      <td className="px-2 py-2 text-right tabular-nums">{numero(l.abertos)}</td>
      <td className={`px-2 py-2 text-right tabular-nums ${l.foraDoPrazo > 0 ? 'text-aviso' : ''}`}>{numero(l.foraDoPrazo)}</td>
      <td className="px-2 py-2 text-right tabular-nums">
        <span className="text-white">{percentual(l.noPrazo)}</span>
        {l.variacao !== null && Math.abs(l.variacao) >= 0.5 && <span className={`block text-micro ${l.variacao > 0 ? 'text-acento-claro' : 'text-aviso'}`}>{l.variacao > 0 ? '▲' : '▼'} {Math.abs(l.variacao).toFixed(0)} pts</span>}
      </td>
      <td className="px-2 py-2 text-right tabular-nums">{duracao(l.tempo)}</td>
      <td className="px-2 py-2 text-right tabular-nums">{numero(l.repetidos)}</td>
      <td className="py-2 pl-2 text-right">
        <Minilinha serie={l.serie} descricao={`Chamados por dia da ${o.sigla}`} />
      </td>
    </tr>
  );
}

/** O que o gestor de um órgão veria: só a fila dele, e o que cruza com as dos outros. */
function VisaoDoGestor({ linha, dias, aoFechar }: { linha: LinhaDoOrgao; dias: number; aoFechar: () => void }) {
  const { inicio: agora, chegados } = useMemo(cidade, []);
  const o = ORGAO_POR_ID[linha.orgaoId]!;
  const fim = inicioDoDia(agora) + DIA;
  const lista = useMemo(() => entre(chegados, fim - dias * DIA, fim, { orgaoId: o.id }), [chegados, fim, dias, o.id]);
  const tipos = useMemo(() => porTipo(lista), [lista]);
  const regioes = useMemo(() => porRegiao(lista, 5), [lista]);
  const operacao = operacaoDoOrgao(o.id);
  const casos = CASOS.filter((c) => c.sinais.some((s) => s.orgaoId === o.id));
  const maior = Math.max(1, ...regioes.map((r) => r.chamados));
  return (
    <Painel className="min-w-0 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="condensado text-micro text-texto-2">Visão do gestor · {AREAS.find((a) => a.id === o.area)?.nome}</p>
          <h2 className="text-corpo font-semibold text-white">{o.nome}</h2>
          <p className="mt-0.5 text-rotulo text-texto-2">
            {numero(linha.chamados)} chamados em {dias} dias · {percentual(linha.noPrazo)} no prazo · {duracao(linha.tempo)} até resolver
          </p>
        </div>
        <button type="button" onClick={aoFechar} aria-label="Fechar a visão do gestor" className="rounded px-2 py-1 text-texto-2 hover:bg-poco hover:text-white">
          ✕
        </button>
      </div>

      <h3 className="condensado mt-4 mb-1.5 text-micro text-texto-2">O que chega, por tipo</h3>
      <ul>
        {tipos.map((t) => (
          <li key={t.tipoId} className="grid grid-cols-[1fr_auto] gap-x-3 border-t border-linha py-1.5 first:border-t-0">
            <span className="min-w-0">
              <span className="text-nota text-white">{t.nome}</span>
              <span className="block text-micro text-texto-2">
                prazo de {duracao(t.prazoHoras)} · {percentual(t.noPrazo)} no prazo · {duracao(t.tempo)} até resolver{t.repetidos > 0 ? ` · ${numero(t.repetidos)} repetidos` : ''}
              </span>
              <Barra valor={t.noPrazo ?? 0} className="mt-1 max-w-40" />
            </span>
            <span className="text-nota text-white tabular-nums">{numero(t.chamados)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded border border-linha px-3 py-2">
          <p className="condensado text-micro text-texto-2">Repetidos que o City View agruparia</p>
          <p className="text-corpo font-semibold text-white tabular-nums">{numero(linha.repetidos)}</p>
          <p className="text-micro text-texto-2">{linha.chamados ? percentual(linha.repetidos / linha.chamados) : '–'} dos chamados do período</p>
        </div>
        <div className="rounded border border-linha px-3 py-2">
          <p className="condensado text-micro text-texto-2">Fora do prazo</p>
          <p className={`text-corpo font-semibold tabular-nums ${linha.foraDoPrazo > 0 ? 'text-aviso' : 'text-white'}`}>{numero(linha.foraDoPrazo)}</p>
          <p className="text-micro text-texto-2">abertos há mais tempo que o prazo</p>
        </div>
      </div>

      <h3 className="condensado mt-4 mb-1.5 text-micro text-texto-2">Onde</h3>
      <ul className="space-y-1">
        {regioes.map((r) => (
          <li key={r.ra} className="grid grid-cols-[9rem_1fr_3rem] items-center gap-2 text-rotulo">
            <span className="truncate text-texto">{REGIAO_POR_ID[r.ra]?.nome ?? r.ra}</span>
            <Barra valor={r.chamados / maior} />
            <span className="text-right text-white tabular-nums">{numero(r.chamados)}</span>
          </li>
        ))}
      </ul>

      {operacao && (
        <>
          <h3 className="condensado mt-4 mb-1.5 text-micro text-acento-claro">O que o sistema do órgão registra · proposta</h3>
          <Operacao sistema={operacao} />
        </>
      )}

      <h3 className="condensado mt-4 mb-1.5 text-micro text-texto-2">O que cruza com outros órgãos</h3>
      {casos.length ? (
        <ul className="space-y-1.5">
          {casos.map((c) => (
            <li key={c.id}>
              <a href={`#/inteligencia?caso=${c.id}`} className="block rounded border border-linha-forte px-3 py-2 text-nota text-texto hover:border-acento-claro hover:text-white">
                {c.titulo}
                <span className="block text-micro text-texto-2">
                  {c.tipo} · {REGIAO_POR_ID[c.raId]?.nome} · ver o insight →
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-rotulo text-texto-2">Nenhum insight envolve este órgão agora. Hoje o gestor não vê a fila dos outros.</p>
      )}
    </Painel>
  );
}

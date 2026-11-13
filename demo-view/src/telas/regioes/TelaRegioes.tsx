/**
 * Regiões e serviços: "Como está cada região, e cada serviço nela?". As 37 RAs
 * lado a lado: o mapa em cores, o ranking, quem espera mais e o perfil de cada
 * uma contra o DF. No alto, os serviços da cidade (energia, luz, água e esgoto,
 * segurança): escolher um troca a leitura do mesmo mapa para o índice dele e
 * mostra os sinais do sistema do órgão. Vem da tela
 * "Regiões" da demo exploratória. Dados SIMULADOS; população do Censo 2022.
 */
import { type ReactNode, useMemo, useState } from 'react';
import { cidade } from '../../dados/cidade';
import { inicioDoDia } from '../../dados/gerador';
import { type AreaId, AREAS, TIPO_POR_ID } from '../../dominio/orgaos';
import { REGIAO_POR_ID } from '../../dominio/ras';
import { entre } from '../../indicadores/gestao';
import { type DominioId, DOMINIOS, indiceDoDominio, type IndiceDoDominio, MINIMO_DE_CHAMADOS } from '../../indicadores/ecossistema';
import { duracao, numero, percentual } from '../../indicadores/indicadores';
import { composicao, type Medida, MEDIDAS, type PerfilDaRa, perfis, ranking, tiposMaisFrequentes } from '../../indicadores/regioes';
import { casosDaRa } from '../../inteligencia/casos';
import { parametrosDoHash } from '../../navegacao';
import { Barra } from '../../ui/graficos';
import { MapaDasRas } from '../../ui/MapaDasRas';
import { Painel } from '../../ui/Painel';
import { Grupo } from '../sala/partes';
import { ComoOIndiceEFeito, FaixaDosServicos, Indice, OndeEstaPior, ServicosDaRa, SistemaDoOrgao } from './Servicos';

const DIA = 86_400_000;
type Janela = '7' | '14' | '30';
const JANELAS: { id: Janela; nome: string }[] = [
  { id: '7', nome: '7 dias' },
  { id: '14', nome: '14 dias' },
  { id: '30', nome: '30 dias' },
];

const FORMATO: Record<Medida, (v: number) => string> = {
  por10mil: (v) => v.toLocaleString('pt-BR', { maximumFractionDigits: 0 }),
  chamados: numero,
  tempo: (v) => duracao(v),
  noPrazo: (v) => percentual(v),
};

const Titulo = ({ children, nota }: { children: ReactNode; nota?: string }) => (
  <div className="mb-3">
    <h2 className="titulo-painel">{children}</h2>
    {nota && <p className="mt-0.5 text-rotulo text-texto-2">{nota}</p>}
  </div>
);

/** Um indicador da RA contra o do DF: o valor, a comparação em texto e a barra com a marca do DF. */
function Contra({ rotulo, valor, df, formato, piorSeMaior }: { rotulo: string; valor: number | null; df: number | null; formato: (v: number) => string; piorSeMaior: boolean }) {
  const razao = valor !== null && df ? valor / df : null;
  const pior = razao !== null && (piorSeMaior ? razao > 1.1 : razao < 0.9);
  const melhor = razao !== null && (piorSeMaior ? razao < 0.9 : razao > 1.1);
  const maximo = Math.max(valor ?? 0, df ?? 0) * 1.25 || 1;
  return (
    <div className="rounded border border-linha px-3 py-2">
      <p className="condensado text-micro text-texto-2">{rotulo}</p>
      <p className="text-corpo font-semibold text-tinta tabular-nums">{valor === null ? '–' : formato(valor)}</p>
      <Barra valor={(valor ?? 0) / maximo} marca={df === null ? undefined : df / maximo} className="my-1.5" />
      <p className={`text-micro ${pior ? 'text-aviso' : melhor ? 'text-acento-claro' : 'text-texto-2'}`}>
        {razao === null ? 'sem dado' : pior ? 'pior que o DF' : melhor ? 'melhor que o DF' : 'perto do DF'} · DF: {df === null ? '–' : formato(df)}
      </p>
    </div>
  );
}

export function TelaRegioes() {
  const { inicio: agora, chegados } = useMemo(cidade, []);
  const [janela, setJanela] = useState<Janela>('7');
  const [area, setArea] = useState<AreaId | null>(null);
  const [medida, setMedida] = useState<Medida>('por10mil');
  const [ra, setRa] = useState<string | null>(() => parametrosDoHash().get('ra'));
  // Um serviço escolhido troca a leitura do mapa e do ranking para o índice dele.
  const [servico, setServico] = useState<DominioId | null>(() => {
    const pedido = parametrosDoHash().get('servico');
    return DOMINIOS.some((d) => d.id === pedido) ? (pedido as DominioId) : null;
  });
  const indices = useMemo(() => DOMINIOS.map((d) => indiceDoDominio(chegados, agora, d.id)), [chegados, agora]);
  const doServico: IndiceDoDominio | undefined = indices.find((i) => i.dominio.id === servico);
  const dias = Number(janela);
  const fim = inicioDoDia(agora) + DIA;

  const doPeriodo = useMemo(() => entre(chegados, fim - dias * DIA, fim, { area }), [chegados, fim, dias, area]);
  const { regioes, df } = useMemo(() => perfis(doPeriodo), [doPeriodo]);
  const ordem = useMemo(() => ranking(regioes, medida), [regioes, medida]);
  const esperam = useMemo(() => ranking(regioes, 'tempo').filter((p) => p.tempo !== null && p.chamados >= 30).slice(0, 6), [regioes]);
  const valores = useMemo(() => (doServico ? new Map(doServico.regioes.map((r) => [r.ra, r.indice])) : new Map(regioes.map((p) => [p.ra, p.chamados ? p[medida] : null]))), [regioes, medida, doServico]);
  const semIndice = doServico ? doServico.regioes.filter((r) => r.indice === null).length : 0;
  const maior = Math.max(1e-9, ...ordem.map((p) => p[medida] ?? 0));
  const perfil = ra ? regioes.find((p) => p.ra === ra) : undefined;
  const nota = MEDIDAS.find((m) => m.id === medida)!;

  return (
    <main className="pagina">
      <FaixaDosServicos indices={indices} ativo={servico} aoEscolher={setServico} />

      {doServico && (
        <p className="flex flex-wrap items-center gap-2 text-rotulo text-texto-2">
          <span className="condensado rounded border border-dashed border-linha-forte px-2 py-1 text-micro">Proposta · simulado</span>
          Vendo o índice de <span className="text-tinta">{doServico.dominio.nome}</span>, nos últimos 30 dias.
          <button type="button" onClick={() => setServico(null)} className="rounded border border-linha px-2 py-1 text-texto hover:text-tinta">
            Voltar às medidas gerais
          </button>
        </p>
      )}

      <div className={`flex flex-wrap items-center gap-2 ${doServico ? 'hidden' : ''}`}>
        <Grupo rotulo="Período" opcoes={JANELAS} valor={janela} aoMudar={setJanela} />
        <Grupo rotulo="O que comparar" opcoes={MEDIDAS} valor={medida} aoMudar={setMedida} />
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Área">
          {[{ id: null, curto: 'Todas as áreas' } as { id: AreaId | null; curto: string }, ...AREAS].map((a) => (
            <button key={a.id ?? 'todas'} type="button" aria-pressed={a.id === area} onClick={() => setArea(a.id)} className={`rounded border px-2.5 py-1.5 text-rotulo ${a.id === area ? 'border-acento-claro bg-realce text-tinta' : 'border-linha text-texto-2 hover:text-tinta'}`}>
              {a.curto}
            </button>
          ))}
        </div>
      </div>

      <div className="pagina-grade">
        <Painel className="p-5">
          <Titulo nota={doServico ? `${doServico.dominio.mede}. Quanto mais forte o tom, pior o índice. Clique numa região para ver o perfil.` : `${nota.nota}. Limites oficiais (IDE/DF). Clique numa região para ver o perfil.`}>{doServico ? `${doServico.dominio.nome} · índice por região` : 'As 37 regiões administrativas'}</Titulo>
          {doServico ? (
            <MapaDasRas valores={valores} selecionada={ra} aoEscolher={(id) => setRa((a) => (a === id ? null : id))} formato={(v) => String(Math.round(v))} rotulo="Índice, de 0 a 100" invertida dominio={[40, 100]} comValor />
          ) : (
            <MapaDasRas valores={valores} selecionada={ra} aoEscolher={(id) => setRa((a) => (a === id ? null : id))} formato={FORMATO[medida]} rotulo={nota.nome} invertida={medida === 'noPrazo'} />
          )}
          {doServico && semIndice > 0 && <p className="mt-2 text-micro text-texto-2">{semIndice} regi{semIndice === 1 ? 'ão fica' : 'ões ficam'} sem índice: menos de {MINIMO_DE_CHAMADOS} chamados no período.</p>}
        </Painel>

        {perfil ? (
          <Perfil perfil={perfil} df={df} lista={doPeriodo.filter((i) => i.local.raId === perfil.ra)} dias={dias} aoFechar={() => setRa(null)} indices={indices} servico={servico} aoEscolherServico={setServico} />
        ) : doServico ? (
          <Painel className="p-5">
            <Titulo nota="As regiões com o pior índice deste serviço, e do que ele é feito em cada uma">Onde está pior</Titulo>
            <OndeEstaPior indice={doServico} aoEscolher={setRa} />
          </Painel>
        ) : (
          <Painel className="p-5">
            <Titulo nota="Tempo até resolver (mediana), no mesmo período. Só regiões com 30 chamados ou mais.">Quem espera mais pelo atendimento</Titulo>
            <ul className="space-y-2">
              {esperam.map((p) => (
                <li key={p.ra}>
                  <button type="button" onClick={() => setRa(p.ra)} className="grid w-full grid-cols-[10rem_1fr_4rem] items-center gap-3 rounded px-1 py-1 text-left text-nota hover:bg-poco">
                    <span className="truncate text-texto">{REGIAO_POR_ID[p.ra]?.nome}</span>
                    <Barra valor={(p.tempo ?? 0) / (esperam[0]?.tempo || 1)} marca={df.tempo === null ? undefined : df.tempo / (esperam[0]?.tempo || 1)} />
                    <span className="text-right text-tinta tabular-nums">{duracao(p.tempo)}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-micro text-texto-2">O traço branco é o DF: {duracao(df.tempo)}.</p>
          </Painel>
        )}
      </div>

      {doServico && (
        <Painel className="p-5">
          <Titulo nota="O que o sistema do órgão registraria, além dos chamados. Vale para o DF inteiro; valores e nomes ilustrativos, e cada órgão decide o que libera.">{doServico.dominio.nome} · qualidade da rede, do serviço e saúde do sistema</Titulo>
          <SistemaDoOrgao dominio={doServico.dominio} />
          <ComoOIndiceEFeito dominio={doServico.dominio} />
        </Painel>
      )}

      {doServico ? (
        <Painel className="p-5">
          <Titulo nota="Índice do serviço, do pior ao melhor. Regiões com chamados de menos ficam de fora.">Ranking das regiões</Titulo>
          <ol className="grid gap-x-8 gap-y-1 md:grid-cols-2 xl:grid-cols-3">
            {doServico.piores.map((r, k) => (
              <li key={r.ra}>
                <button type="button" onClick={() => setRa(r.ra)} aria-pressed={r.ra === ra} className={`grid w-full grid-cols-[1.5rem_1fr_auto] items-center gap-2 rounded px-1 py-1 text-left text-rotulo ${r.ra === ra ? 'bg-realce' : 'hover:bg-poco'}`}>
                  <span className="text-texto-2 tabular-nums">{k + 1}</span>
                  <span className="truncate text-texto">{REGIAO_POR_ID[r.ra]?.nome}</span>
                  <Indice valor={r.indice} />
                </button>
              </li>
            ))}
          </ol>
        </Painel>
      ) : (
      <Painel className="p-5">
        <Titulo nota={`${nota.nome}, no período${medida === 'noPrazo' ? ': do pior ao melhor' : ': do maior ao menor'}`}>Ranking das regiões</Titulo>
        <ol className="grid gap-x-8 gap-y-1 md:grid-cols-2 xl:grid-cols-3">
          {ordem.map((p, k) => (
            <li key={p.ra}>
              <button type="button" onClick={() => setRa(p.ra)} aria-pressed={p.ra === ra} className={`grid w-full grid-cols-[1.5rem_1fr_5rem_3.5rem] items-center gap-2 rounded px-1 py-1 text-left text-rotulo ${p.ra === ra ? 'bg-realce' : 'hover:bg-poco'}`}>
                <span className="text-texto-2 tabular-nums">{k + 1}</span>
                <span className="truncate text-texto">{REGIAO_POR_ID[p.ra]?.nome}</span>
                <Barra valor={(p[medida] ?? 0) / maior} />
                <span className="text-right text-tinta tabular-nums">{p[medida] === null ? '–' : FORMATO[medida](p[medida]!)}</span>
              </button>
            </li>
          ))}
        </ol>
      </Painel>
      )}
    </main>
  );
}

function Perfil({ perfil, df, lista, dias, aoFechar, indices, servico, aoEscolherServico }: { perfil: PerfilDaRa; df: PerfilDaRa; lista: ReturnType<typeof entre>; dias: number; aoFechar: () => void; indices: IndiceDoDominio[]; servico: DominioId | null; aoEscolherServico: (id: DominioId) => void }) {
  const r = REGIAO_POR_ID[perfil.ra]!;
  const areas = useMemo(() => composicao(lista), [lista]);
  const tipos = useMemo(() => tiposMaisFrequentes(lista, 5), [lista]);
  const casos = casosDaRa(perfil.ra);
  return (
    <Painel className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="condensado text-micro text-texto-2">{r.codigo} · perfil da região</p>
          <h2 className="text-corpo font-semibold text-tinta">{r.nome}</h2>
          <p className="mt-0.5 text-rotulo text-texto-2">
            {numero(r.populacao)} habitantes ({r.populacaoEstimada ? 'estimativa' : 'Censo 2022'}) · {numero(perfil.chamados)} chamados em {dias} dias
          </p>
        </div>
        <button type="button" onClick={aoFechar} aria-label="Fechar o perfil" className="rounded px-2 py-1 text-texto-2 hover:bg-poco hover:text-tinta">
          ✕
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Contra rotulo="Por 10 mil hab." valor={perfil.por10mil} df={df.por10mil} formato={FORMATO.por10mil} piorSeMaior />
        <Contra rotulo="Tempo até resolver" valor={perfil.tempo} df={df.tempo} formato={FORMATO.tempo} piorSeMaior />
        <Contra rotulo="No prazo" valor={perfil.noPrazo} df={df.noPrazo} formato={FORMATO.noPrazo} piorSeMaior={false} />
        <div className="rounded border border-linha px-3 py-2">
          <p className="condensado text-micro text-texto-2">Em aberto</p>
          <p className="text-corpo font-semibold text-tinta tabular-nums">{numero(perfil.abertos)}</p>
          <p className="mt-1.5 text-micro text-texto-2">{perfil.chamados ? percentual(perfil.abertos / perfil.chamados) : '–'} dos chamados do período</p>
        </div>
      </div>

      <h3 className="condensado mt-4 mb-1.5 text-micro text-texto-2">Os serviços nesta região · índice de 0 a 100, em 30 dias</h3>
      <ServicosDaRa linhas={indices.map((i) => ({ dominio: i.dominio, r: i.regioes.find((x) => x.ra === perfil.ra) }))} ativo={servico} aoEscolher={aoEscolherServico} />

      <h3 className="condensado mt-4 mb-1.5 text-micro text-texto-2">De onde vêm os chamados</h3>
      <ul className="space-y-1">
        {areas.filter((a) => a.chamados > 0).map((a) => (
          <li key={a.area} className="grid grid-cols-[7rem_1fr_3rem] items-center gap-2 text-rotulo">
            <span className="text-texto">{a.nome}</span>
            <Barra valor={a.parte / (areas[0]?.parte || 1)} />
            <span className="text-right text-tinta tabular-nums">{percentual(a.parte)}</span>
          </li>
        ))}
      </ul>

      <h3 className="condensado mt-4 mb-1.5 text-micro text-texto-2">O que mais chega</h3>
      <ol className="space-y-0.5 text-rotulo">
        {tipos.map((t) => (
          <li key={t.tipoId} className="flex justify-between gap-2">
            <span className="truncate text-texto">{TIPO_POR_ID[t.tipoId]?.nome ?? t.tipoId}</span>
            <span className="text-tinta tabular-nums">{numero(t.chamados)}</span>
          </li>
        ))}
      </ol>

      <div className="mt-4 flex flex-wrap gap-2">
        {casos.map((c) => (
          <a key={c.id} href={`#/inteligencia?caso=${c.id}`} className="rounded border border-linha-forte px-3 py-2 text-rotulo text-texto hover:border-acento-claro hover:text-tinta">
            <span className="condensado block text-micro text-acento-claro">Insight nesta região →</span>
            {c.titulo}
          </a>
        ))}
      </div>
    </Painel>
  );
}

/**
 * Analytics do ecossistema: "Como está cada serviço da cidade?". Energia, luz,
 * água e esgoto e segurança, lado a lado: um índice por região, o mapa, quem
 * está pior e os sinais do sistema de cada órgão (qualidade da rede, do
 * serviço, saúde do sistema). É a observabilidade levada à cidade inteira.
 *
 * PROPOSTA, sobre dados SIMULADOS. O índice é da equipe (`indicadores/ecossistema.ts`).
 */
import { type ReactNode, useMemo, useState } from 'react';
import { cidade } from '../../dados/cidade';
import { type Grupo as GrupoDeSinal, NOME_DO_GRUPO, normalDe, operacaoDoOrgao, piorSinal, ROTULO_DO_SINAL, type SituacaoDoSinal, valorDe } from '../../dominio/operacao';
import { ORGAO_POR_ID } from '../../dominio/orgaos';
import { REGIAO_POR_ID } from '../../dominio/ras';
import { DIAS_DO_INDICE, type DominioId, DOMINIOS, type Faixa, faixaDoIndice, type IndiceDaRa, indiceDoDominio, LIMITE_DA_ATENCAO, LIMITE_DO_BOM, MINIMO_DE_CHAMADOS, PESOS, ROTULO_DA_FAIXA, serieDoDominio } from '../../indicadores/ecossistema';
import { numero, percentual } from '../../indicadores/indicadores';
import { parametrosDoHash } from '../../navegacao';
import { Barra, Linha } from '../../ui/graficos';
import { MapaDasRas } from '../../ui/MapaDasRas';
import { Origem } from '../../ui/Origem';
import { Painel } from '../../ui/Painel';

const COR_DA_FAIXA: Record<Faixa, string> = { bom: 'text-acento-claro', atencao: 'text-aviso', critico: 'text-alerta' };
const PONTO_DA_FAIXA: Record<Faixa, string> = { bom: 'bg-acento-claro', atencao: 'bg-aviso', critico: 'bg-alerta' };
const COR_DO_SINAL: Record<SituacaoDoSinal, string> = { normal: 'text-texto-2', atencao: 'text-aviso', fora: 'text-alerta' };
const GRUPOS: GrupoDeSinal[] = ['rede', 'servico', 'sistema'];

const Titulo = ({ children, nota }: { children: ReactNode; nota?: string }) => (
  <div className="mb-3">
    <h2 className="titulo-painel">{children}</h2>
    {nota && <p className="mt-0.5 text-rotulo text-texto-2">{nota}</p>}
  </div>
);

/** O índice com a faixa em palavra: a cor nunca vem sozinha. */
function Indice({ valor, grande = false }: { valor: number | null; grande?: boolean }) {
  if (valor === null) return <span className="text-rotulo text-texto-2">poucos chamados</span>;
  const f = faixaDoIndice(valor);
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className={`font-semibold text-tinta tabular-nums ${grande ? 'text-valor' : 'text-corpo'}`}>{valor}</span>
      <span className={`condensado inline-flex items-center gap-1 text-micro ${COR_DA_FAIXA[f]}`}>
        <span className={`size-1.5 rounded-full ${PONTO_DA_FAIXA[f]}`} aria-hidden="true" />
        {ROTULO_DA_FAIXA[f]}
      </span>
    </span>
  );
}

const ehDominio = (v: string | null): v is DominioId => DOMINIOS.some((d) => d.id === v);

export function TelaAnalytics() {
  const { inicio: agora, chegados } = useMemo(cidade, []);
  const [id, setId] = useState<DominioId>(() => {
    const pedido = parametrosDoHash().get('dominio');
    return ehDominio(pedido) ? pedido : 'energia';
  });
  const [ra, setRa] = useState<string | null>(null);

  const todos = useMemo(() => DOMINIOS.map((d) => ({ indice: indiceDoDominio(chegados, agora, d.id), serie: serieDoDominio(chegados, agora, d.id), operacao: operacaoDoOrgao(d.orgaoId) })), [chegados, agora]);
  const atual = todos.find((t) => t.indice.dominio.id === id)!;
  const { indice, serie, operacao } = atual;
  const d = indice.dominio;
  const orgao = ORGAO_POR_ID[d.orgaoId]!;
  const valores = useMemo(() => new Map(indice.regioes.map((r) => [r.ra, r.indice])), [indice]);
  const escolhida = ra ? indice.regioes.find((r) => r.ra === ra) : undefined;
  const lista: IndiceDaRa[] = indice.piores.slice(0, 8);
  const semIndice = indice.regioes.filter((r) => r.indice === null).length;

  return (
    <main className="pagina">
      <div className="flex flex-wrap items-center gap-2">
        <span className="condensado rounded border border-dashed border-linha-forte px-2 py-1 text-micro text-texto-2">Proposta · simulado</span>
        <p className="text-rotulo text-texto-2">Cada serviço da cidade, pelo que chega aos canais e pelo que o sistema do órgão registra. Últimos {DIAS_DO_INDICE} dias.</p>
      </div>

      {/* Os quatro serviços, lado a lado: o ecossistema numa linha. */}
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" role="tablist" aria-label="Serviço">
        {todos.map((t) => {
          const dom = t.indice.dominio;
          const ativo = dom.id === id;
          const pior = t.indice.piores[0];
          const sinal = t.operacao ? piorSinal(t.operacao) : null;
          return (
            <li key={dom.id}>
              <button
                type="button"
                role="tab"
                aria-selected={ativo}
                onClick={() => {
                  setId(dom.id);
                  setRa(null);
                }}
                className={`painel-vidro block h-full w-full p-4 text-left transition-colors ${ativo ? 'border-acento-claro!' : 'hover:border-linha-forte!'}`}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="titulo-painel">{dom.nome}</span>
                  <span className="text-micro text-texto-2">{ORGAO_POR_ID[dom.orgaoId]?.sigla}</span>
                </span>
                <span className="mt-2 block">
                  <Indice valor={t.indice.df} grande />
                </span>
                <span className="mt-1 block text-rotulo text-texto-2">
                  {numero(t.indice.chamados)} chamados · {percentual(t.indice.noPrazo)} no prazo
                </span>
                <span className="mt-1 block truncate text-rotulo text-texto-2">
                  pior: <span className="text-texto">{pior ? `${REGIAO_POR_ID[pior.ra]?.nome} (${pior.indice})` : '–'}</span>
                </span>
                <span className={`mt-1 block text-micro ${sinal ? COR_DO_SINAL[sinal] : 'text-texto-2'}`}>{sinal ? `sistema do órgão: ${ROTULO_DO_SINAL[sinal].toLowerCase()}` : 'sistema do órgão: não simulado'}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="pagina-grade">
        <Painel className="min-w-0 p-5">
          <Titulo nota={`${d.mede}. Quanto mais forte o tom, pior o índice. Clique numa região.`}>{d.nome} · índice por região</Titulo>
          <MapaDasRas valores={valores} selecionada={ra} aoEscolher={(r) => setRa((a) => (a === r ? null : r))} formato={(v) => String(Math.round(v))} rotulo="Índice, de 0 a 100" invertida dominio={[40, 100]} comValor />
          <p className="mt-2 text-micro text-texto-2">
            {semIndice > 0 && `${semIndice} regi${semIndice === 1 ? 'ão fica' : 'ões ficam'} sem índice: menos de ${MINIMO_DE_CHAMADOS} chamados no período. `}
            {d.ressalva}
          </p>
        </Painel>

        <div className="flex min-w-0 flex-col gap-4">
          <Painel className="p-5">
            <Titulo nota={escolhida ? 'As três partes do índice desta região' : 'As regiões com o pior índice, e as três partes de cada um'}>{escolhida ? (REGIAO_POR_ID[escolhida.ra]?.nome ?? escolhida.ra) : 'Onde está pior'}</Titulo>
            {escolhida ? (
              <DetalheDaRa r={escolhida} aoFechar={() => setRa(null)} />
            ) : (
              <ul>
                {lista.map((r) => (
                  <li key={r.ra} className="border-t border-linha first:border-t-0">
                    <button type="button" onClick={() => setRa(r.ra)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2 text-left hover:bg-poco">
                      <span className="min-w-0">
                        <span className="block truncate text-nota text-tinta">{REGIAO_POR_ID[r.ra]?.nome ?? r.ra}</span>
                        <span className="block text-micro text-texto-2">
                          {numero(r.por10mil)} por 10 mil hab. · {percentual(r.noPrazo)} no prazo · {percentual(r.parteFora)} além do prazo
                        </span>
                      </span>
                      <Indice valor={r.indice} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Painel>

          <Painel className="p-5">
            <Titulo nota="Chamados por dia, nos últimos 28 dias">O volume</Titulo>
            <Linha serie={serie} altura={30} desdeZero formato={(v) => numero(v)} descricao={`Chamados por dia de ${d.nome}, nos últimos 28 dias`} inicio="há 28 dias" fim="hoje (parcial)" />
          </Painel>
        </div>
      </div>

      <div className="pagina-grade">
        <Painel className="p-5">
          <Titulo nota={operacao ? `${operacao.sistema} · o que o sistema do órgão registraria, além dos chamados` : 'O que o sistema do órgão registraria, além dos chamados'}>{orgao.sigla} · rede, serviço e sistema</Titulo>
          {operacao ? (
            <div className="space-y-4">
              {GRUPOS.map((g) => {
                const itens = operacao.indicadores.filter((i) => i.grupo === g);
                if (!itens.length) return null;
                return (
                  <section key={g}>
                    <h3 className="condensado mb-1 text-micro text-texto-2">{NOME_DO_GRUPO[g]}</h3>
                    <ul>
                      {itens.map((i) => (
                        <li key={i.id} className="flex items-baseline justify-between gap-3 border-t border-linha py-1.5 first:border-t-0">
                          <span className="min-w-0">
                            <span className="text-nota text-tinta">{i.nome}</span>
                            <span className="block text-micro text-texto-2">{normalDe(i)}</span>
                          </span>
                          <span className="shrink-0 text-right">
                            <span className="text-nota text-tinta tabular-nums">{valorDe(i)}</span>
                            <span className={`condensado block text-micro ${COR_DO_SINAL[i.situacao]}`}>{ROTULO_DO_SINAL[i.situacao]}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
              <p className="text-micro text-texto-2">Valores e nomes ilustrativos. Cada órgão decide o que libera do próprio sistema.</p>
            </div>
          ) : (
            <p className="rounded border border-dashed border-linha-forte px-3 py-2 text-nota text-texto-2">A demo não simula a operação da {orgao.sigla}. Na segurança, o que entraria aqui (viaturas, tempo de chegada, ocupação da central) é o dado mais sensível de todos: só com decisão do governo.</p>
          )}
        </Painel>

        <Painel className="p-5">
          <Titulo nota="Proposta da equipe, para a demo mostrar como fica. As partes e os pesos mudam com o que a gestão quiser medir.">Como o índice é feito</Titulo>
          <ol className="space-y-2 text-nota text-texto">
            <li>
              <span className="text-tinta">Pressão ({Math.round(PESOS.pressao * 100)}%)</span>: chamados por 10 mil habitantes, contra as outras regiões. A mais pressionada fica com zero nesta parte.
            </li>
            <li>
              <span className="text-tinta">Prazo ({Math.round(PESOS.prazo * 100)}%)</span>: dos chamados resolvidos, a parte dentro do prazo do tipo.
            </li>
            <li>
              <span className="text-tinta">Fila ({Math.round(PESOS.fila * 100)}%)</span>: a parte dos chamados que não está aberta além do prazo.
            </li>
          </ol>
          <p className="mt-3 text-rotulo text-texto-2">
            De 0 a 100. A partir de {LIMITE_DO_BOM}, bom; de {LIMITE_DA_ATENCAO} a {LIMITE_DO_BOM - 1}, atenção; abaixo, crítico. O do DF é a média das regiões, pesada pela população.
          </p>
          <p className="mt-2 rounded border border-linha bg-poco px-3 py-2 text-rotulo text-texto">O índice mede o serviço pelo que chega aos canais. Região que reclama pouco pode ter índice alto e problema grande: é o que a triangulação, com os dados de operação, viria corrigir.</p>
          <Origem className="mt-3" orgaoId={d.orgaoId} conta="Chamados do órgão nos últimos 30 dias, por região: volume por habitante, prazo cumprido e fila além do prazo." atualizacao="A cada chamado que chega; no produto, também a cada leitura do sistema do órgão (simulado)." />
        </Painel>
      </div>
    </main>
  );
}

function DetalheDaRa({ r, aoFechar }: { r: IndiceDaRa; aoFechar: () => void }) {
  const partes: [string, number, string][] = r.partes
    ? [
        ['Pressão', r.partes.pressao, `${numero(r.por10mil)} chamados por 10 mil hab.`],
        ['Prazo', r.partes.prazo, `${percentual(r.noPrazo)} dos resolvidos no prazo`],
        ['Fila', r.partes.fila, `${percentual(r.parteFora)} dos chamados abertos além do prazo`],
      ]
    : [];
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <Indice valor={r.indice} grande />
        <button type="button" onClick={aoFechar} className="condensado rounded border border-linha-forte px-2.5 py-1 text-micro text-texto hover:text-tinta">
          Ver todas
        </button>
      </div>
      <p className="mt-1 text-rotulo text-texto-2">{numero(r.chamados)} chamados no período</p>
      {r.partes ? (
        <ul className="mt-3 space-y-2.5">
          {partes.map(([nome, v, nota]) => (
            <li key={nome}>
              <p className="flex items-baseline justify-between gap-2 text-nota">
                <span className="text-tinta">{nome}</span>
                <span className="text-texto tabular-nums">{Math.round(v * 100)} de 100</span>
              </p>
              <Barra valor={v} className="mt-1" />
              <p className="mt-0.5 text-micro text-texto-2">{nota}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-nota text-texto-2">Chamados de menos para calcular o índice desta região.</p>
      )}
      <a href={`#/regioes?ra=${r.ra}`} className="mt-3 inline-block text-rotulo text-acento-claro hover:underline">
        Ver a região inteira →
      </a>
    </div>
  );
}

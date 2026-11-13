/**
 * Os serviços da cidade dentro da tela de Regiões: energia, luz, água e esgoto
 * e segurança, cada um com um índice por região e os sinais do sistema do
 * órgão (rede, serviço, sistema). É uma leitura a mais do mesmo mapa, não uma
 * tela à parte. PROPOSTA, sobre dados SIMULADOS (`indicadores/ecossistema.ts`).
 */
import { type Grupo as GrupoDeSinal, NOME_DO_GRUPO, normalDe, operacaoDoOrgao, piorSinal, ROTULO_DO_SINAL, type SituacaoDoSinal, valorDe } from '../../dominio/operacao';
import { ORGAO_POR_ID } from '../../dominio/orgaos';
import { REGIAO_POR_ID } from '../../dominio/ras';
import { type Dominio, type DominioId, type Faixa, faixaDoIndice, type IndiceDaRa, type IndiceDoDominio, LIMITE_DA_ATENCAO, LIMITE_DO_BOM, PESOS, ROTULO_DA_FAIXA } from '../../indicadores/ecossistema';
import { numero, percentual } from '../../indicadores/indicadores';
import { Barra } from '../../ui/graficos';
import { Origem } from '../../ui/Origem';

const COR_DA_FAIXA: Record<Faixa, string> = { bom: 'text-acento-claro', atencao: 'text-aviso', critico: 'text-alerta' };
const PONTO_DA_FAIXA: Record<Faixa, string> = { bom: 'bg-acento-claro', atencao: 'bg-aviso', critico: 'bg-alerta' };
const COR_DO_SINAL: Record<SituacaoDoSinal, string> = { normal: 'text-texto-2', atencao: 'text-aviso', fora: 'text-alerta' };
const GRUPOS: GrupoDeSinal[] = ['rede', 'servico', 'sistema'];

/** O índice com a faixa em palavra: a cor nunca vem sozinha. */
export function Indice({ valor, grande = false }: { valor: number | null; grande?: boolean }) {
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

/** A faixa dos serviços, no alto: escolher um troca a leitura do mapa; escolher de novo volta. */
export function FaixaDosServicos({ indices, ativo, aoEscolher }: { indices: IndiceDoDominio[]; ativo: DominioId | null; aoEscolher: (id: DominioId | null) => void }) {
  return (
    <div role="group" aria-label="Serviços da cidade" className="grid grid-cols-2 gap-2 xl:grid-cols-4">
      {indices.map((t) => {
        const d = t.dominio;
        const op = operacaoDoOrgao(d.orgaoId);
        const sinal = op ? piorSinal(op) : null;
        const escolhido = d.id === ativo;
        return (
          <button key={d.id} type="button" aria-pressed={escolhido} onClick={() => aoEscolher(escolhido ? null : d.id)} title={d.mede} className={`painel-vidro flex items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors ${escolhido ? 'border-acento-claro!' : 'hover:border-linha-forte!'}`}>
            <span className="min-w-0">
              <span className="block truncate text-nota text-tinta">{d.nome}</span>
              <span className={`block truncate text-micro ${sinal ? COR_DO_SINAL[sinal] : 'text-texto-2'}`}>
                {ORGAO_POR_ID[d.orgaoId]?.sigla} · {sinal ? `sistema ${ROTULO_DO_SINAL[sinal].toLowerCase()}` : 'sistema não simulado'}
              </span>
            </span>
            <Indice valor={t.df} />
          </button>
        );
      })}
    </div>
  );
}

/** As regiões com o pior índice do serviço. */
export function OndeEstaPior({ indice, aoEscolher }: { indice: IndiceDoDominio; aoEscolher: (ra: string) => void }) {
  return (
    <ul>
      {indice.piores.slice(0, 7).map((r) => (
        <li key={r.ra} className="border-t border-linha first:border-t-0">
          <button type="button" onClick={() => aoEscolher(r.ra)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-1.5 text-left hover:bg-poco">
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
  );
}

/** No perfil de uma região: os quatro serviços, lado a lado, e as partes do que estiver escolhido. */
export function ServicosDaRa({ linhas, ativo, aoEscolher }: { linhas: { dominio: Dominio; r: IndiceDaRa | undefined }[]; ativo: DominioId | null; aoEscolher: (id: DominioId) => void }) {
  const aberto = linhas.find((l) => l.dominio.id === ativo)?.r;
  return (
    <div>
      <ul className="grid grid-cols-2 gap-2">
        {linhas.map(({ dominio, r }) => (
          <li key={dominio.id}>
            <button type="button" aria-pressed={dominio.id === ativo} onClick={() => aoEscolher(dominio.id)} className={`flex w-full items-center justify-between gap-2 rounded border px-3 py-1.5 text-left ${dominio.id === ativo ? 'border-acento-claro bg-realce' : 'border-linha hover:border-linha-forte'}`}>
              <span className="truncate text-rotulo text-texto">{dominio.nome}</span>
              <Indice valor={r?.indice ?? null} />
            </button>
          </li>
        ))}
      </ul>
      {aberto?.partes && (
        <ul className="mt-2 space-y-1.5">
          {(
            [
              ['Pressão', aberto.partes.pressao, `${numero(aberto.por10mil)} chamados por 10 mil hab.`],
              ['Prazo', aberto.partes.prazo, `${percentual(aberto.noPrazo)} dos resolvidos no prazo`],
              ['Fila', aberto.partes.fila, `${percentual(aberto.parteFora)} abertos além do prazo`],
            ] as [string, number, string][]
          ).map(([nome, v, nota]) => (
            <li key={nome} className="grid grid-cols-[4rem_1fr_minmax(0,11rem)] items-center gap-2 text-micro">
              <span className="text-texto">{nome}</span>
              <Barra valor={v} />
              <span className="truncate text-right text-texto-2">{nota}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** O que o sistema do órgão registraria, além dos chamados: rede, serviço e sistema. */
export function SistemaDoOrgao({ dominio }: { dominio: Dominio }) {
  const operacao = operacaoDoOrgao(dominio.orgaoId);
  const sigla = ORGAO_POR_ID[dominio.orgaoId]?.sigla ?? dominio.orgaoId;
  if (!operacao) {
    return <p className="rounded border border-dashed border-linha-forte px-3 py-2 text-nota text-texto-2">A demo não simula a operação da {sigla}. Na segurança, o que entraria aqui (viaturas, tempo de chegada, ocupação da central) é o dado mais sensível de todos: só com decisão do governo.</p>;
  }
  return (
    <div className="grid gap-x-6 gap-y-4 md:grid-cols-3">
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
    </div>
  );
}

/** Como o índice é feito, em três linhas, e o que ele não mede. */
export function ComoOIndiceEFeito({ dominio }: { dominio: Dominio }) {
  return (
    <div className="mt-4 border-t border-linha pt-3">
      <p className="text-rotulo text-texto-2">
        <span className="text-texto">O índice</span> é proposta da equipe, de 0 a 100: pressão (chamados por 10 mil habitantes contra as outras regiões, {Math.round(PESOS.pressao * 100)}%), prazo cumprido ({Math.round(PESOS.prazo * 100)}%) e fila além do prazo ({Math.round(PESOS.fila * 100)}%), nos últimos 30 dias. A partir de {LIMITE_DO_BOM}, bom; de {LIMITE_DA_ATENCAO} a {LIMITE_DO_BOM - 1}, atenção; abaixo, crítico. Mede o serviço pelo que chega aos canais: região que reclama pouco pode ter índice alto e problema grande.
      </p>
      <p className="mt-1.5 text-rotulo text-texto">{dominio.ressalva}</p>
      <Origem className="mt-2" orgaoId={dominio.orgaoId} conta="Chamados do órgão nos últimos 30 dias, por região: volume por habitante, prazo cumprido e fila além do prazo." atualizacao="A cada chamado que chega; no produto, também a cada leitura do sistema do órgão (simulado)." />
    </div>
  );
}

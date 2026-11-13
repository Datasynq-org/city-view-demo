/**
 * I5 · Padrões e previsões (CV-DEM-001, seção 6): "O que vem por aí?".
 * As próximas duas semanas, o que está fora do normal agora, o que deve subir
 * e cair, onde reforçar as equipes, e o acerto medido do próprio método.
 * PROPOSTA, sobre dados SIMULADOS; vem da tela "Padrões e previsões" da demo
 * exploratória. A previsão é uma ideia em aberto no magno (9.9).
 */
import { type ReactNode, useMemo, useState } from 'react';
import { cidade } from '../../dados/cidade';
import { type AreaId, AREAS, ORGAO_POR_ID } from '../../dominio/orgaos';
import { numero, percentual } from '../../indicadores/indicadores';
import { foraDoNormal, HORIZONTE, pressaoPorRegiao, previsaoPara, TEXTO_DO_MOTIVO, variacaoPorTipo } from '../../inteligencia/previsao';
import { Barra, Linha } from '../../ui/graficos';
import { Origem } from '../../ui/Origem';
import { Painel } from '../../ui/Painel';

const dataCurta = (t: number) => new Date(t).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' });
const sinal = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v * 100).toFixed(0)}%`;

const Titulo = ({ children, nota }: { children: ReactNode; nota?: string }) => (
  <div className="mb-3">
    <h2 className="titulo-painel">{children}</h2>
    {nota && <p className="mt-0.5 text-rotulo text-texto-2">{nota}</p>}
  </div>
);

function Numero({ rotulo, valor, nota, destaque }: { rotulo: string; valor: string; nota: string; destaque?: boolean }) {
  return (
    <Painel className="p-4">
      <p className="condensado text-micro text-texto-2">{rotulo}</p>
      <p className={`mt-1 text-valor font-semibold tabular-nums ${destaque ? 'text-aviso' : 'text-tinta'}`}>{valor}</p>
      <p className="text-rotulo text-texto-2">{nota}</p>
    </Painel>
  );
}

export function TelaPrevisoes() {
  const { base } = useMemo(cidade, []);
  const [area, setArea] = useState<AreaId | null>(null);
  const f = useMemo(() => ({ area }), [area]);

  const r = useMemo(() => previsaoPara(base, f), [base, f]);
  const tipos = useMemo(() => variacaoPorTipo(base, f), [base, f]);
  const regioes = useMemo(() => pressaoPorRegiao(base, f), [base, f]);
  const anomalias = useMemo(() => foraDoNormal(base, f), [base, f]);

  const sobem = [...tipos].sort((a, b) => b.variacao - a.variacao).slice(0, 5);
  const caem = [...tipos].sort((a, b) => a.variacao - b.variacao).slice(0, 5).filter((t) => t.variacao < 0);
  const maiorAlta = sobem[0];
  // Só entra quem tem alta fora da margem da própria previsão: reforço em cima de ruído desmoraliza a previsão.
  const emAlta = regioes.filter((p) => p.aMais > 0);
  const reforcar = emAlta.filter((p) => p.foraDaMargem).slice(0, 8);
  const dentroDaMargem = emAlta.length - emAlta.filter((p) => p.foraDaMargem).length;
  const av = r.avaliacao;
  const ganha = av.janelas > 0 && av.erro < av.erroIngenuo;
  const maiorAMais = Math.max(1, ...reforcar.map((p) => p.aMais));
  const variacao = r.ultimos > 0 ? r.proximos / r.ultimos - 1 : 0;
  const primeiroPrevisto = r.pontos.findIndex((p) => p.real === null);

  return (
    <main className="pagina">
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Área">
        {[{ id: null, curto: 'Todas as áreas' } as { id: AreaId | null; curto: string }, ...AREAS].map((a) => (
          <button key={a.id ?? 'todas'} type="button" aria-pressed={a.id === area} onClick={() => setArea(a.id)} className={`rounded border px-2.5 py-1.5 text-rotulo ${a.id === area ? 'border-acento-claro bg-realce text-tinta' : 'border-linha text-texto-2 hover:text-tinta'}`}>
            {a.curto}
          </button>
        ))}
        <span className="condensado ml-2 rounded border border-dashed border-linha-forte px-2 py-1 text-micro text-texto-2">Proposta · simulado</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Numero rotulo="Próximas duas semanas" valor={numero(r.proximos)} nota={`chamados previstos · ${sinal(variacao)} sobre as duas últimas`} />
        <Numero rotulo="Maior alta prevista" valor={maiorAlta ? sinal(maiorAlta.variacao) : '–'} nota={maiorAlta ? `${maiorAlta.tipo.nome} · ${TEXTO_DO_MOTIVO[maiorAlta.motivo].toLowerCase()}` : 'sem tipos com volume'} />
        <Numero rotulo="Fora do normal agora" valor={`${anomalias.length}`} nota="combinações de tipo e região bem acima do esperado" destaque={anomalias.length > 0} />
        <Numero rotulo="Erro típico da previsão" valor={av.janelas ? percentual(av.erro) : '–'} nota={av.janelas ? `em ${av.janelas} janelas de duas semanas · repetir as duas últimas erra ${percentual(av.erroIngenuo)}` : 'histórico curto demais para medir'} />
      </div>

      <Painel className="p-5">
        <Titulo nota="Chamados por dia. Linha branca: o que aconteceu. Tracejada: a previsão. Faixa: a margem provável (80%).">O que vem nas próximas duas semanas</Titulo>
        <Linha
          serie={r.pontos.map((p) => p.real)}
          previsto={r.pontos.map((p) => p.previsto)}
          faixa={r.pontos.map((p) => p.faixa)}
          altura={52}
          formato={numero}
          descricao="Chamados por dia: oito semanas passadas e a previsão das próximas duas"
          inicio={dataCurta(r.pontos[0]!.dia)}
          fim={dataCurta(r.pontos.at(-1)!.dia)}
        />
        <p className="mt-1 pl-8 text-micro text-texto-2">
          A previsão começa em {dataCurta(r.pontos[primeiroPrevisto]!.dia)} e vai {HORIZONTE} dias à frente. Quanto mais longe, mais larga a margem.
        </p>
      </Painel>

      <div className="pagina-grade">
        <Painel className="p-5">
          <Titulo nota="Tipo de chamado e região com bem mais chamados na última semana do que o esperado para a região, descontado o que mudou no DF inteiro.">Fora do normal agora</Titulo>
          {anomalias.length ? (
            <ul>
              {anomalias.map((a) => (
                <li key={`${a.tipo.id}${a.ra.id}`} className="border-t border-linha first:border-t-0">
                  <a href={`#/regioes?ra=${a.ra.id}`} className="grid grid-cols-[1fr_auto] items-baseline gap-3 py-2 hover:bg-poco">
                    <span className="min-w-0">
                      <span className="text-nota text-tinta">{a.tipo.nome}</span> <span className="text-nota text-texto-2">· {a.ra.nome}</span>
                      <span className="block text-micro text-texto-2">
                        {ORGAO_POR_ID[a.tipo.orgaoId]?.sigla} · {numero(a.semana)} em 7 dias, contra {numero(a.normal)} esperados
                      </span>
                    </span>
                    <span className="text-corpo font-semibold text-aviso tabular-nums">{a.vezes.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}×</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-nota text-texto-2">Nada fora do normal neste recorte: os volumes estão dentro do esperado para cada região.</p>
          )}
        </Painel>

        <Painel className="p-5">
          <Titulo nota="Regiões em que a alta prevista para as próximas duas semanas passa da margem da própria previsão. As demais não entram: seria recomendar reforço em cima de ruído.">Onde reforçar as equipes</Titulo>
          {reforcar.length ? (
            <ul className="space-y-1.5">
              {reforcar.map((p) => (
                <li key={p.ra.id} className="grid grid-cols-[9.5rem_1fr_7rem] items-center gap-3 text-nota">
                  <a href={`#/regioes?ra=${p.ra.id}`} className="truncate text-texto hover:text-tinta">
                    {p.ra.nome}
                  </a>
                  <Barra valor={p.aMais / maiorAMais} />
                  <span className="text-right tabular-nums">
                    <span className="text-tinta">+{numero(p.aMais)}</span> <span className="text-micro text-texto-2">{sinal(p.variacao)}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-nota text-texto">Nenhuma região com alta fora da margem: não há reforço a recomendar agora.</p>
          )}
          {dentroDaMargem > 0 && <p className="mt-3 text-micro text-texto-2">{dentroDaMargem} regi{dentroDaMargem === 1 ? 'ão tem' : 'ões têm'} alta prevista dentro da margem: sem mudança relevante.</p>}
        </Painel>
      </div>

      <div className="pagina-grade">
        <Painel className="p-5">
          <Titulo nota="Tipos de chamado com volume relevante: as duas próximas semanas sobre as duas últimas.">O que deve subir e o que deve cair</Titulo>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['Sobem', sobem, 'text-aviso'],
              ['Caem', caem, 'text-acento-claro'],
            ].map(([nome, lista, cor]) => (
              <div key={nome as string}>
                <p className="condensado mb-1 text-micro text-texto-2">{nome as string}</p>
                <ul>
                  {(lista as typeof sobem).map((t) => (
                    <li key={t.tipo.id} className="flex items-baseline justify-between gap-2 border-t border-linha py-1.5 first:border-t-0">
                      <span className="min-w-0">
                        <span className="block truncate text-nota text-texto">{t.tipo.nome}</span>
                        <span className="block text-micro text-texto-2">{TEXTO_DO_MOTIVO[t.motivo]}</span>
                      </span>
                      <span className={`text-nota tabular-nums ${cor as string}`}>{sinal(t.variacao)}</span>
                    </li>
                  ))}
                  {(lista as typeof sobem).length === 0 && <li className="text-rotulo text-texto-2">Nenhum.</li>}
                </ul>
              </div>
            ))}
          </div>
        </Painel>

        <Painel className="p-5">
          <Titulo>Como a previsão é feita</Titulo>
          <ol className="list-decimal space-y-1.5 pl-4 text-nota text-texto marker:text-texto-2">
            <li>Olhamos as últimas oito semanas de chamados.</li>
            <li>Separamos o padrão de cada dia da semana (sábado não é segunda).</li>
            <li>Pegamos o nível das duas últimas semanas e a tendência recente, que vai perdendo força a cada dia.</li>
            <li>A margem vem do quanto o método errou nas últimas quatro semanas, e alarga com a distância.</li>
          </ol>
          <p className="mt-3 rounded border border-linha bg-poco px-3 py-2 text-rotulo text-texto">
            {av.janelas ? (
              <>
                O erro é medido de verdade: o método previu {av.janelas} janelas de duas semanas do passado sem vê-las, e errou em média {percentual(av.erro)} do volume. O palpite mais simples, repetir as duas semanas anteriores, erra {percentual(av.erroIngenuo)}. {ganha ? 'O método ganha do palpite simples.' : 'O método não ganha do palpite simples neste recorte: vale tanto quanto repetir as últimas semanas.'}
              </>
            ) : (
              'O histórico deste recorte é curto demais para medir o erro.'
            )}
          </p>
          <p className="mt-2 text-micro text-texto-2">O motivo "chuva" não sai do modelo: vem do tipo do chamado e do calendário (a estação chuvosa do DF vai de meados de outubro a abril). Oito semanas não enxergam estação.</p>
          <Origem className="mt-2" area={area} conta="Oito semanas de chamados por dia, o padrão de cada dia da semana e a tendência recente." atualizacao="Uma vez por dia, com o dia fechado (simulado)." />
          <p className="mt-2 text-micro text-texto-2">É uma proposta, sobre dados simulados. No produto, entrariam também a previsão do tempo, o calendário e o histórico real de cada órgão.</p>
        </Painel>
      </div>
    </main>
  );
}

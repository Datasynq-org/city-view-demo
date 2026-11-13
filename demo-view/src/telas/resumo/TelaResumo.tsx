/**
 * Resumo do dia (CV-DEM-002, A4 e A3): a página que se leva da sala. O que
 * mudou, o que pede decisão, o que foi resolvido, em uma folha que se imprime;
 * e, abaixo, as perguntas prontas ("pergunte à cidade"). O magno já previa
 * "relatórios periódicos para o planejamento" (7.2). Tudo sobre dados SIMULADOS.
 */
import { type ReactNode, useMemo, useState } from 'react';
import { cidade } from '../../dados/cidade';
import { inicioDoDia } from '../../dados/gerador';
import { estaAberto } from '../../dominio/incidente';
import { ORGAO_POR_ID } from '../../dominio/orgaos';
import { REGIAO_POR_ID } from '../../dominio/ras';
import { comparar, entre, leituraEmFrase, porOrgao } from '../../indicadores/gestao';
import { duracao, numero, percentual, tempoNoQuantil } from '../../indicadores/indicadores';
import { contraAMeta, NOTA_DA_META } from '../../indicadores/metas';
import { foraDoNormal, mudancaDoDf } from '../../indicadores/regioes';
import { incidentesSugeridos } from '../../inteligencia/atual';
import { decisaoDe } from '../../inteligencia/decisoes';
import { esperaRevisao, ROTULO_DA_SITUACAO_DO_INCIDENTE, situacaoDoIncidente } from '../../inteligencia/encaminhamento';
import { useInteligencia } from '../../inteligencia/estado';
import { PERGUNTAS } from '../../inteligencia/perguntas';
import { responsavelDe, planoDe } from '../../inteligencia/plano';
import { siglaDoOrgao } from '../../inteligencia/casos';
import { MapaDasRas } from '../../ui/MapaDasRas';
import { Origem } from '../../ui/Origem';
import { Painel } from '../../ui/Painel';
import { mudarTema, temaAtual } from '../../ui/tema';

const DIA = 86_400_000;
const sinal = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(Math.round(v * 100))}%`;

const Titulo = ({ children, nota }: { children: ReactNode; nota?: string }) => (
  <div className="mb-3">
    <h2 className="titulo-painel">{children}</h2>
    {nota && <p className="mt-0.5 text-rotulo text-texto-2">{nota}</p>}
  </div>
);

const Linha = ({ nome, valor, nota }: { nome: ReactNode; valor?: ReactNode; nota?: ReactNode }) => (
  <li className="flex items-baseline justify-between gap-3 border-t border-linha py-1.5 text-nota first:border-t-0">
    <span className="min-w-0">
      <span className="text-tinta">{nome}</span>
      {nota && <span className="block text-rotulo text-texto-2">{nota}</span>}
    </span>
    {valor && <span className="shrink-0 text-right text-texto tabular-nums">{valor}</span>}
  </li>
);

export function TelaResumo() {
  const { inicio: agora, chegados } = useMemo(cidade, []);
  const inteligencia = useInteligencia();
  const sugeridos = useMemo(incidentesSugeridos, []);
  const [pergunta, setPergunta] = useState<string | null>(null);

  const d = useMemo(() => {
    const fim = inicioDoDia(agora) + DIA;
    const semana = entre(chegados, fim - 7 * DIA, fim);
    const fora = [...foraDoNormal(chegados, agora)].filter(([, v]) => v.fora).sort((a, b) => b[1].razao! - a[1].razao!);
    const orgaos = porOrgao(chegados, agora, 7).filter((l) => l.chamados >= 30).map((l) => ({ ...l, parte: l.foraDoPrazo / l.chamados })).sort((a, b) => b.parte - a.parte);
    return {
      comparacao: comparar(chegados, agora, 7),
      p90: tempoNoQuantil(semana, 0.9),
      abertos: chegados.filter((i) => estaAberto(i.situacao)).length,
      resolvidosEm24h: chegados.filter((i) => i.resolvidoEm !== undefined && i.resolvidoEm > agora - DIA && i.resolvidoEm <= agora).length,
      recebidosEm24h: chegados.filter((i) => i.criadoEm > agora - DIA && i.criadoEm <= agora).length,
      doDf: mudancaDoDf(chegados, agora),
      fora,
      orgaos,
    };
  }, [chegados, agora]);

  // O que a inteligência sugere e ninguém decidiu, e o que já anda com os órgãos.
  const semDecisao = sugeridos.filter((i) => decisaoDe(inteligencia.decisoes, i.codigo).situacao === 'sugerido').slice(0, 4);
  const andando = Object.values(inteligencia.andamentos);
  const esperando = andando.filter(esperaRevisao);
  const resolvidos = andando.filter((an) => situacaoDoIncidente(an) === 'resolvido');
  const avisados = resolvidos.reduce((s, an) => s + (inteligencia.fichas[an.codigo]?.chamados ?? 0), 0);

  const resposta = useMemo(() => PERGUNTAS.find((p) => p.id === pergunta)?.responder({ incidentes: chegados, agora }) ?? null, [pergunta, chegados, agora]);

  // A folha sai clara, seja qual for o tema da tela.
  const imprimir = () => {
    const antes = temaAtual();
    mudarTema('claro');
    setTimeout(() => {
      window.print();
      mudarTema(antes);
    }, 200);
  };

  const data = new Date(agora).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' });
  const c = d.comparacao;

  return (
    <main className="pagina">
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="condensado text-micro text-texto-2">Resumo do dia · Distrito Federal · dados simulados</p>
            <h1 className="text-corpo font-semibold text-tinta first-letter:uppercase">{data}</h1>
          </div>
          <button type="button" onClick={imprimir} className="condensado nao-imprime rounded-md border border-linha-forte px-3 py-1.5 text-rotulo text-texto hover:text-tinta">
            Imprimir
          </button>
        </header>

        <Painel className="p-5">
          <Titulo>Em uma frase</Titulo>
          <p className="text-corpo text-tinta">{leituraEmFrase(c)}</p>
          {d.doDf !== null && Math.abs(d.doDf) >= 0.03 && (
            <p className="mt-1 text-nota text-texto">
              O volume da semana está {sinal(d.doDf)} {d.doDf > 0 ? 'acima' : 'abaixo'} da média das três semanas anteriores, no DF inteiro.
            </p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
            {[
              ['Abertos agora', numero(d.abertos), 'esperando alguém agir'],
              ['Nas últimas 24 h', `${numero(d.recebidosEm24h)} recebidos`, `${numero(d.resolvidosEm24h)} resolvidos`],
              ['No prazo (7 dias)', percentual(c.atual.noPrazo), `${contraAMeta(c.atual.noPrazo)} · ${NOTA_DA_META}`],
              ['Metade resolvida em', duracao(c.atual.tempo), `9 em cada 10 em até ${duracao(d.p90)}`],
            ].map(([r, v, nota]) => (
              <div key={r} className="rounded border border-linha bg-poco px-3 py-2">
                <p className="condensado text-micro text-texto-2">{r}</p>
                <p className="text-corpo font-semibold text-tinta tabular-nums">{v}</p>
                <p className="text-micro text-texto-2">{nota}</p>
              </div>
            ))}
          </div>
          <Origem className="mt-3" conta="Chamados dos últimos 7 dias contra os 7 anteriores, medidos com a mesma idade; o prazo é o de cada tipo de chamado." />
        </Painel>

        <div className="pagina-grade">
          <Painel className="p-5">
            <Titulo nota="O que a inteligência sugere e ninguém decidiu ainda, do mais urgente ao menos.">O que pede decisão</Titulo>
            <ul>
              {esperando.map((an) => (
                <Linha key={an.codigo} nome={inteligencia.fichas[an.codigo]?.titulo ?? an.codigo} nota="Um órgão devolveu o pedido: redirecionar ou dispensar" valor={<span className="text-alerta">espera quem revisa</span>} />
              ))}
              {semDecisao.map((i) => {
                const dono = responsavelDe(planoDe(i));
                return (
                  <Linha
                    key={i.codigo}
                    nome={
                      <a href={`#/inteligencia?caso=${i.casoId ?? ''}`} className="hover:underline">
                        {i.titulo}
                      </a>
                    }
                    nota={`${i.severidade} · ${(i.raId && REGIAO_POR_ID[i.raId]?.nome) || '–'} · ${numero(i.chamados)} chamados · iria para ${dono ? siglaDoOrgao(dono.orgaoId) : '–'}`}
                    valor="confirmar ou descartar"
                  />
                );
              })}
              {esperando.length + semDecisao.length === 0 && <li className="text-nota text-texto-2">Nada esperando decisão.</li>}
            </ul>
          </Painel>

          <Painel className="p-5">
            <Titulo nota="Onde os números saíram do lugar. Vale olhar antes de perguntarem.">O que piorou</Titulo>
            <ul>
              {d.fora.slice(0, 3).map(([ra, v]) => (
                <Linha key={ra} nome={REGIAO_POR_ID[ra]?.nome ?? ra} nota="mais chamados que o normal da própria região" valor={`${sinal(v.razao! - 1)} sobre o esperado`} />
              ))}
              {d.orgaos.slice(0, 3).map((l) => (
                <Linha key={l.orgaoId} nome={ORGAO_POR_ID[l.orgaoId]?.sigla ?? l.orgaoId} nota={`${numero(l.foraDoPrazo)} de ${numero(l.chamados)} chamados da semana abertos além do prazo`} valor={`${percentual(l.parte)} fora do prazo`} />
              ))}
              {d.fora.length + d.orgaos.length === 0 && <li className="text-nota text-texto-2">Nada fora do lugar.</li>}
            </ul>
          </Painel>
        </div>

        <Painel className="p-5">
          <Titulo nota="O que andou desde ontem, e os incidentes que os órgãos já fecharam.">O que foi resolvido</Titulo>
          <ul>
            <Linha nome="Chamados resolvidos nas últimas 24 horas" valor={numero(d.resolvidosEm24h)} />
            <Linha nome="Incidentes em andamento com os órgãos" nota={andando.length ? andando.map((an) => `${inteligencia.fichas[an.codigo]?.titulo ?? an.codigo}: ${ROTULO_DA_SITUACAO_DO_INCIDENTE[situacaoDoIncidente(an)].toLowerCase()}`).join(' · ') : 'Nenhum confirmado nesta visita'} valor={numero(andando.length)} />
            <Linha nome="Incidentes resolvidos" nota={avisados > 0 ? `${numero(avisados)} cidadãos avisados com uma resposta só` : undefined} valor={numero(resolvidos.length)} />
          </ul>
        </Painel>

        <Painel className="nao-imprime p-5">
          <Titulo nota="Perguntas prontas, respondidas com contas de verdade sobre a base simulada. A pergunta livre, escrita ou falada, precisa de um modelo de linguagem e não está feita.">Pergunte à cidade</Titulo>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Perguntas">
            {PERGUNTAS.map((p) => (
              <button key={p.id} type="button" aria-pressed={p.id === pergunta} onClick={() => setPergunta((a) => (a === p.id ? null : p.id))} className={`rounded border px-2.5 py-1.5 text-rotulo ${p.id === pergunta ? 'border-acento-claro bg-realce text-tinta' : 'border-linha text-texto-2 hover:text-tinta'}`}>
                {p.pergunta}
              </button>
            ))}
          </div>
          {resposta && (
            <div className={`mt-4 grid gap-5 ${resposta.mapa ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]' : ''}`} aria-live="polite">
              <div>
                <p className="text-corpo text-tinta">{resposta.texto}</p>
                <ul className="mt-2">
                  {resposta.itens.map((i) => (
                    <Linha key={i.nome} nome={i.nome} valor={i.valor} />
                  ))}
                </ul>
                <p className="mt-3 text-micro text-texto-2">
                  <span className="text-texto">A conta:</span> {resposta.conta}
                </p>
                <a href={`#/${resposta.ver.tela}`} className="mt-2 inline-block text-rotulo text-acento-claro hover:underline">
                  Ver em {resposta.ver.nome} →
                </a>
              </div>
              {resposta.mapa && <MapaDasRas valores={resposta.mapa.valores} formato={resposta.mapa.formato} rotulo={resposta.mapa.rotulo} />}
            </div>
          )}
        </Painel>
      </div>
    </main>
  );
}

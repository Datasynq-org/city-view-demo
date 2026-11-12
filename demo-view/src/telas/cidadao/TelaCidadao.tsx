/**
 * I4 · Visão do cidadão (CV-DEM-001, seção 6): "O que o governo está
 * entregando?". Slide 15 do CV-APR-001.
 *
 * À esquerda, o que a gestão decide: o grau de transparência. No meio, o mapa
 * público como o cidadão o veria. À direita, o acompanhamento da própria
 * demanda, pelo canal que ele usou. Dados SIMULADOS.
 */
import { type ReactNode, useMemo, useState } from 'react';
import { cidade } from '../../dados/cidade';
import { acompanhamento, AVISO_ACOMPANHAMENTO } from '../../dados/coleta';
import { inicioDoDia } from '../../dados/gerador';
import type { Mensagem } from '../../dados/jornadas';
import { REGIAO_POR_ID } from '../../dominio/ras';
import { entre } from '../../indicadores/gestao';
import { numero, percentual } from '../../indicadores/indicadores';
import { type Contagem, type Estado, estadosDoGrau, type Grau, GRAUS, NOME_DO_ESTADO, parteResolvida, porRegiao, total } from '../../indicadores/transparencia';
import { MapaDasRas } from '../../ui/MapaDasRas';
import { Painel } from '../../ui/Painel';
import { Celular } from '../jornada/Celular';

const DIA = 86_400_000;
const COR: Record<Estado, string> = { resolvido: '#58bd5e', 'em-resolucao': '#e9a23b', aberto: '#8a939c' };
/** Do pouco ao muito resolvido: o "verdinho no mapa" da conversa. */
const VERDES = ['#1d2a22', '#24402b', '#2d5a37', '#3a7a45', '#49a054', '#63c96b'];

const Titulo = ({ children, nota }: { children: ReactNode; nota?: string }) => (
  <div className="mb-3">
    <h2 className="titulo-painel">{children}</h2>
    {nota && <p className="mt-0.5 text-rotulo text-texto-2">{nota}</p>}
  </div>
);

/** A barra dos três estados: o que foi liberado aparece; o resto fica oculto, e dito. */
function Estados({ c, liberados }: { c: Contagem; liberados: readonly Estado[] }) {
  const t = total(c) || 1;
  return (
    <>
      <div className="flex h-2 overflow-hidden rounded-full bg-realce" aria-hidden="true">
        {liberados.map((e) => (
          <span key={e} style={{ width: `${(c[e] / t) * 100}%`, background: COR[e] }} />
        ))}
      </div>
      <ul className="mt-2 space-y-0.5 text-rotulo">
        {(['resolvido', 'em-resolucao', 'aberto'] as Estado[]).map((e) => (
          <li key={e} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-texto">
              <span className="size-2 rounded-full" style={{ background: liberados.includes(e) ? COR[e] : 'transparent', outline: liberados.includes(e) ? 'none' : '1px dashed var(--color-linha-forte)' }} aria-hidden="true" />
              {NOME_DO_ESTADO[e]}
            </span>
            <span className={`tabular-nums ${liberados.includes(e) ? 'text-white' : 'text-texto-2'}`}>{liberados.includes(e) ? numero(c[e]) : 'não mostrado'}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

const TRILHA = ['Recebida no WhatsApp', 'Conferida pela equipe', 'Aberta no órgão', 'Em atendimento', 'Resolvida'];

/** O acompanhamento de uma demanda de exemplo, como chega ao cidadão. */
const CONVERSA: Mensagem[] = [
  { de: 'cidadao', texto: 'ACOMPANHAR' },
  { de: 'assistente', texto: acompanhamento('CAP-0000123', 'em acompanhamento', 'Participa DF', 'OUV-2026-0048213 (fictício)') },
  { de: 'cidadao', texto: 'ATIVAR AVISOS' },
  {
    de: 'assistente',
    texto: ['Houve uma atualização no acompanhamento da sua demanda.', '', 'CAP-0000123', 'Situação interna da equipe: resolvida.', 'Destino: Participa DF.', 'Protocolo oficial: OUV-2026-0048213 (fictício).', 'Situação informada pelo portal: atendida: lâmpada substituída.', '', AVISO_ACOMPANHAMENTO].join('\n'),
  },
];

export function TelaCidadao() {
  const { inicio: agora, chegados } = useMemo(cidade, []);
  const [grau, setGrau] = useState<Grau>('resolvidos');
  const [ra, setRa] = useState<string | null>(null);
  const fim = inicioDoDia(agora) + DIA;
  const doMes = useMemo(() => entre(chegados, fim - 30 * DIA, fim), [chegados, fim]);
  const { regioes, df } = useMemo(() => porRegiao(doMes, grau), [doMes, grau]);
  const liberados = estadosDoGrau(grau);
  const valores = useMemo(() => new Map([...regioes].map(([id, c]) => [id, total(c) ? (grau === 'resolvidos' ? c.resolvido : parteResolvida(c)) : null])), [regioes, grau]);
  const escolhida = ra ? regioes.get(ra) : undefined;
  const mostrado = escolhida ?? df;

  return (
    <main className="pagina">
      <div className="cidadao-grade">
        <Painel className="p-5">
          <Titulo nota="A gestão decide o quanto mostrar. O cidadão vê só o que foi liberado.">O que a gestão libera</Titulo>
          <div role="radiogroup" aria-label="Grau de transparência" className="space-y-2">
            {GRAUS.map((g) => (
              <button key={g.id} type="button" role="radio" aria-checked={g.id === grau} onClick={() => setGrau(g.id)} className={`block w-full rounded border px-3 py-2.5 text-left ${g.id === grau ? 'border-acento-claro bg-realce' : 'border-linha hover:bg-poco'}`}>
                <span className={`block text-nota ${g.id === grau ? 'text-white' : 'text-texto'}`}>{g.nome}</span>
                <span className="block text-micro text-texto-2">{g.nota}</span>
              </button>
            ))}
          </div>
          <blockquote className="mt-4 border-l-2 border-linha-forte pl-3 text-rotulo text-texto-2">
            “Se a gestão for mais arrojada, vai deixar ver tudo que está em resolução também, sendo solucionado, as coisas que ainda estão abertas e não resolvidas.”
            <footer className="mt-1 text-micro">Conversa de 10/11/2026 · ATA, linhas 236–237</footer>
          </blockquote>
          <p className="mt-4 rounded border border-linha bg-poco px-3 py-2 text-micro text-texto-2">Ocorrências de segurança pública não entram no mapa aberto, em nenhum grau. Nenhuma demanda mostra nome, telefone ou endereço.</p>
        </Painel>

        <Painel className="min-w-0 p-5">
          <Titulo nota={`Últimos 30 dias · ${grau === 'resolvidos' ? 'quanto foi resolvido em cada região' : 'a parte resolvida do que é mostrado, em cada região'}. Clique numa região.`}>Mapa público: o que o cidadão vê</Titulo>
          <MapaDasRas valores={valores} selecionada={ra} aoEscolher={(id) => setRa((a) => (a === id ? null : id))} formato={grau === 'resolvidos' ? numero : (v) => percentual(v)} rotulo={grau === 'resolvidos' ? 'Demandas resolvidas' : 'Parte resolvida'} tons={VERDES} />
        </Painel>

        <div className="flex min-w-0 flex-col gap-4">
          <Painel className="p-5">
            <Titulo nota={ra ? 'O cidadão escolhe a própria região' : 'Clique numa região no mapa para ver só ela'}>{ra ? (REGIAO_POR_ID[ra]?.nome ?? ra) : 'Distrito Federal'}</Titulo>
            <p className="text-valor font-semibold text-white tabular-nums">{numero(mostrado.resolvido)}</p>
            <p className="mb-3 text-nota text-texto">
              demandas resolvidas neste mês
              {grau !== 'resolvidos' && parteResolvida(mostrado) !== null && <span className="text-texto-2"> · {percentual(parteResolvida(mostrado))} do que é mostrado</span>}
            </p>
            <Estados c={mostrado} liberados={liberados} />
          </Painel>

          <Painel className="p-5">
            <Titulo nota="A trilha de uma solicitação e os avisos, no canal que o cidadão usou (simulado)">Acompanhamento do cidadão</Titulo>
            <ol className="mb-3 flex gap-1" aria-label="Trilha da solicitação">
              {TRILHA.map((t, k) => (
                <li key={t} className={`flex-1 rounded px-1 py-1.5 text-center text-micro ${k === TRILHA.length - 1 ? 'bg-[#2d5a37] text-white' : 'bg-realce text-texto'}`}>
                  {t}
                </li>
              ))}
            </ol>
            <div className="h-[22rem]">
              <Celular mensagens={CONVERSA} digitando={false} />
            </div>
          </Painel>
        </div>
      </div>
    </main>
  );
}

/**
 * HUD da sala de guerra: a barra de comando no alto, o painel de camadas, o
 * cartão da RA escolhida e a legenda do tour.
 */
import { AnimatePresence, motion } from 'motion/react';
import { type ReactNode, useEffect, useState } from 'react';
import { type CamadaContexto, CAMADAS_CONTEXTO, type Contexto, tamanho } from '../../dados/contexto';
import { POPULACAO_TOTAL, REGIAO_POR_ID } from '../../dominio/ras';
import { TIPO_POR_ID } from '../../dominio/orgaos';
import { type ChamadosDaRa, numero } from '../../indicadores/indicadores';
import { casosDaRa } from '../../inteligencia/casos';
import { COR_CONTEXTO, type ModoMapa, MODOS } from '../../mapa/camadas';
import { Painel } from '../../ui/Painel';
import { ATIVO, Grupo } from './partes';
import { DURACAO_PARADA, type Parada } from './tour';

// ---------------------------------------------------------------- barra de comando

function Relogio() {
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const hora = agora.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return <span className="tabular-nums text-white">{hora}</span>;
}

function Tecla({ children }: { children: ReactNode }) {
  return <kbd className="ml-1.5 hidden rounded-[3px] border border-linha-forte px-1 font-sans text-micro text-texto-2 2xl:inline">{children}</kbd>;
}

function Botao({ ativo, aoClicar, rotulo, tecla, children }: { ativo?: boolean; aoClicar: () => void; rotulo: string; tecla: string; children: ReactNode }) {
  return (
    <button type="button" onClick={aoClicar} aria-pressed={ativo} aria-label={rotulo} title={`${rotulo} (tecla ${tecla})`}
      className={`condensado flex items-center rounded-[3px] px-2 py-2 text-rotulo whitespace-nowrap transition-colors 2xl:px-3 2xl:text-nota ${ativo ? ATIVO : 'text-texto-2 hover:bg-realce/60 hover:text-white'}`}>
      {children}
      <Tecla>{tecla}</Tecla>
    </button>
  );
}

export function BarraDeComando({ tour, aoTour, girando, aoGirar, camadasAbertas, aoCamadas, telao, aoTelao }: {
  tour: boolean; aoTour: () => void;
  /** Modo girar: arrastar o mapa gira e inclina. */
  girando: boolean; aoGirar: () => void;
  camadasAbertas: boolean; aoCamadas: () => void;
  telao: boolean; aoTelao: () => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded border border-linha bg-poco p-0.5">
      <div className="flex items-center gap-2 px-2.5 text-rotulo 2xl:text-nota" title="Ao vivo (dados simulados)">
        <span className="relative flex size-2" aria-hidden="true">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-acento-claro opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2 rounded-full bg-acento-claro" />
        </span>
        <span className="condensado hidden whitespace-nowrap text-acento-claro 2xl:inline">Ao vivo</span>
        <span className="hidden 2xl:inline"><Relogio /></span>
      </div>
      <span className="h-5 w-px bg-linha" aria-hidden="true" />
      <Botao ativo={tour} aoClicar={aoTour} rotulo={tour ? 'Parar o tour' : 'Tour guiado'} tecla="T">{tour ? '■ Tour' : '▶ Tour'}</Botao>
      <Botao ativo={girando} aoClicar={aoGirar} rotulo={girando ? 'Sair do modo girar' : 'Girar e inclinar: arraste o mapa'} tecla="O">Girar</Botao>
      <Botao ativo={camadasAbertas} aoClicar={aoCamadas} rotulo="Camadas" tecla="C">Camadas</Botao>
      <Botao ativo={telao} aoClicar={aoTelao} rotulo="Modo telão: esconde os painéis" tecla="H">Telão</Botao>
    </div>
  );
}

// ---------------------------------------------------------------- camadas

function Selo({ children, real }: { children: ReactNode; real: boolean }) {
  return (
    <span className={`condensado shrink-0 rounded-[3px] border px-1.5 py-0.5 text-micro ${real ? 'border-linha-forte text-texto' : 'border-aviso/50 text-aviso'}`}>{children}</span>
  );
}

export function PainelDeCamadas({ contexto, ligadas, aoAlternar, erro, modo, aoMudarModo }: {
  contexto: Contexto | null;
  ligadas: ReadonlySet<CamadaContexto>;
  aoAlternar: (c: CamadaContexto) => void;
  erro: string | null;
  /** Como os chamados aparecem no mapa. O calor é a leitura principal; as outras ficam aqui. */
  modo: ModoMapa;
  aoMudarModo: (m: ModoMapa) => void;
}) {
  return (
    <Painel className="w-[23rem] p-4">
      <p className="titulo-painel">Camadas</p>
      <p className="condensado mt-3 text-rotulo text-texto-2">O que entra</p>
      <div className="mt-1.5 flex items-center justify-between gap-2 text-corpo">
        <span>Chamados de todos os órgãos</span>
        <Selo real={false}>Simulado</Selo>
      </div>
      <div className="mt-2">
        <Grupo rotulo="Como ver os chamados" opcoes={MODOS} valor={modo} aoMudar={aoMudarModo} />
      </div>
      <p className="condensado mt-4 text-rotulo text-texto-2">A cidade</p>
      <ul className="mt-1.5 space-y-1">
        {CAMADAS_CONTEXTO.map((c) => {
          const on = ligadas.has(c.id);
          return (
            <li key={c.id}>
              <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1.5 text-corpo hover:bg-poco">
                <input type="checkbox" checked={on} disabled={!contexto} onChange={() => aoAlternar(c.id)} className="accent-acento" />
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: COR_CONTEXTO[c.id] }} aria-hidden="true" />
                <span className={`flex-1 ${on ? 'text-white' : ''}`}>
                  {c.nome}
                  {contexto && <span className="text-texto-2"> ({numero(tamanho(contexto, c.id))})</span>}
                </span>
                <Selo real>{c.selo}</Selo>
              </label>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-nota text-texto-2">
        {erro ? `Os dados reais não carregaram (${erro}).` : 'De perto, os prédios sobem em 3D. Nada nesta tela identifica pessoas.'}
      </p>
    </Painel>
  );
}

// ---------------------------------------------------------------- RA escolhida

export function CartaoDaRa({ ra, dados, chamadosDf, tipos, aoFechar }: {
  ra: string;
  dados: ChamadosDaRa | undefined;
  /** Chamados do DF inteiro no mesmo recorte, para comparar a taxa. */
  chamadosDf: number;
  tipos: { tipoId: string; chamados: number }[];
  aoFechar: () => void;
}) {
  const r = REGIAO_POR_ID[ra];
  if (!r) return null;
  const mediaDf = POPULACAO_TOTAL > 0 ? (chamadosDf / POPULACAO_TOTAL) * 10_000 : 0;
  const taxa = dados?.por10mil ?? 0;
  const relacao = mediaDf > 0 ? taxa / mediaDf : 1;
  return (
    <Painel className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="condensado text-rotulo text-texto-2">{r.codigo}</p>
          <p className="text-xl leading-tight font-semibold text-white">{r.nome}</p>
          <p className="mt-0.5 text-nota text-texto-2">
            {numero(r.populacao)} habitantes · {r.populacaoEstimada ? 'estimativa' : 'Censo 2022'}
          </p>
        </div>
        <button type="button" onClick={aoFechar} aria-label="Voltar ao DF inteiro (Esc)" title="Voltar ao DF inteiro (Esc)"
          className="rounded px-2 py-1 text-texto-2 hover:bg-realce hover:text-white">✕</button>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-valor font-semibold text-white tabular-nums">{taxa.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</span>
        <span className="text-nota text-texto-2">chamados por 10 mil hab.</span>
      </div>
      <p className={`text-nota ${relacao > 1.15 ? 'text-aviso' : relacao < 0.85 ? 'text-texto' : 'text-texto-2'}`}>
        {relacao > 1.15 ? `${relacao.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}× a média do DF` : relacao < 0.85 ? 'abaixo da média do DF' : 'perto da média do DF'}
      </p>
      {tipos.length > 0 && (
        <>
          <p className="condensado mt-3 text-rotulo text-texto-2">O que mais chega</p>
          <ol className="mt-1.5 space-y-1 text-corpo">
            {tipos.map((t) => (
              <li key={t.tipoId} className="flex justify-between gap-2">
                <span className="truncate">{TIPO_POR_ID[t.tipoId]?.nome ?? t.tipoId}</span>
                <span className="text-white tabular-nums">{numero(t.chamados)}</span>
              </li>
            ))}
          </ol>
        </>
      )}
      {casosDaRa(ra).map((c) => (
        <a key={c.id} href={`#/inteligencia?caso=${c.id}`} className="mt-3 block rounded border border-linha-forte px-3 py-2 text-nota text-texto hover:border-acento-claro hover:text-white">
          <span className="condensado block text-micro text-acento-claro">Insight nesta região →</span>
          {c.titulo}
        </a>
      ))}
    </Painel>
  );
}

// ---------------------------------------------------------------- tour

export function LegendaDoTour({ parada, indice, total, texto }: { parada: Parada; indice: number; total: number; texto: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div key={parada.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.45 }}>
        <Painel className="w-[min(40rem,calc(100vw-2rem))] overflow-hidden p-0">
          <div className="px-5 pt-4 pb-3">
            <p className="condensado text-rotulo text-texto-2">{indice + 1} de {total} · {parada.titulo}</p>
            <p className="mt-1.5 text-lg leading-snug text-white">“{parada.frase}”</p>
            <p className="mt-1 text-nota text-texto-2">Conversa de 10/11/2026 · ATA, linhas {parada.ata}</p>
            <p className="mt-2 text-corpo">{texto}</p>
          </div>
          <div className="h-0.5 bg-linha">
            <div className="barra-do-tour h-full bg-acento" style={{ animationDuration: `${DURACAO_PARADA}ms` }} />
          </div>
        </Painel>
      </motion.div>
    </AnimatePresence>
  );
}

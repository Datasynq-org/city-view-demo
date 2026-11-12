/**
 * HUD da sala de guerra: a barra de comando no alto, o painel de camadas, o
 * cartão da RA escolhida e a legenda do tour. Inspirado em salas de operações
 * (painel em HUD, troca de camadas, modos de sensor), no visual da direção C.
 */
import { AnimatePresence, motion } from 'motion/react';
import { type ReactNode, useEffect, useState } from 'react';
import { type CamadaContexto, CAMADAS_CONTEXTO, type Contexto, tamanho } from '../../dados/contexto';
import { POPULACAO_TOTAL, REGIAO_POR_ID } from '../../dominio/ras';
import { TIPO_POR_ID } from '../../dominio/orgaos';
import { type ChamadosDaRa, numero } from '../../indicadores/indicadores';
import { COR_CONTEXTO } from '../../mapa/camadas';
import { Painel } from '../../ui/Painel';
import { DURACAO_PARADA, type Parada } from './tour';

export type Sensor = 'padrao' | 'noturno' | 'termico';

export const SENSORES: { id: Sensor; nome: string; tecla: string }[] = [
  { id: 'padrao', nome: 'Padrão', tecla: '1' },
  { id: 'noturno', nome: 'Noturno', tecla: '2' },
  { id: 'termico', nome: 'Térmico', tecla: '3' },
];

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
  return <kbd className="ml-1.5 hidden rounded border border-white/15 px-1 font-sans text-[9px] text-rotulo/80 2xl:inline">{children}</kbd>;
}

function Botao({ ativo, aoClicar, rotulo, tecla, children }: { ativo?: boolean; aoClicar: () => void; rotulo: string; tecla: string; children: ReactNode }) {
  return (
    <button type="button" onClick={aoClicar} aria-pressed={ativo} aria-label={rotulo} title={`${rotulo} (tecla ${tecla})`}
      className={`condensado flex items-center rounded-md px-2 py-1.5 text-[11px] whitespace-nowrap transition-colors 2xl:px-2.5 ${ativo ? 'bg-teal text-white' : 'text-rotulo hover:bg-white/5 hover:text-white'}`}>
      {children}
      <Tecla>{tecla}</Tecla>
    </button>
  );
}

export function BarraDeComando({ sensor, aoMudarSensor, tour, aoTour, girando, aoGirar, camadasAbertas, aoCamadas, telao, aoTelao }: {
  sensor: Sensor; aoMudarSensor: (s: Sensor) => void;
  tour: boolean; aoTour: () => void;
  girando: boolean; aoGirar: () => void;
  camadasAbertas: boolean; aoCamadas: () => void;
  telao: boolean; aoTelao: () => void;
}) {
  return (
    <Painel className="flex items-center gap-1 px-1.5 py-1">
      <div className="flex items-center gap-2 px-2 text-[11px]" title="Ao vivo (dados simulados)">
        <span className="relative flex size-2" aria-hidden="true">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-teal-claro opacity-60 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2 rounded-full bg-teal-claro" />
        </span>
        <span className="condensado hidden whitespace-nowrap text-teal-claro 2xl:inline">Ao vivo</span>
        <span className="hidden 2xl:inline"><Relogio /></span>
      </div>
      <span className="h-5 w-px bg-white/10" aria-hidden="true" />
      <div role="group" aria-label="Modo de visão" className="flex">
        {/* Clicar de novo no modo ativo volta ao padrão; em tela média, o botão "Padrão" sai para caber. */}
        {SENSORES.map((s) => (
          <span key={s.id} className={s.id === 'padrao' ? 'hidden 2xl:contents' : 'contents'}>
            <Botao ativo={s.id === sensor} aoClicar={() => aoMudarSensor(s.id === sensor ? 'padrao' : s.id)} rotulo={`Visão ${s.nome.toLowerCase()}`} tecla={s.tecla}>{s.nome}</Botao>
          </span>
        ))}
      </div>
      <span className="h-5 w-px bg-white/10" aria-hidden="true" />
      <Botao ativo={tour} aoClicar={aoTour} rotulo={tour ? 'Parar o tour' : 'Tour guiado'} tecla="T">{tour ? '■ Tour' : '▶ Tour'}</Botao>
      <Botao ativo={girando} aoClicar={aoGirar} rotulo="Girar a câmera" tecla="O">Girar</Botao>
      <Botao ativo={camadasAbertas} aoClicar={aoCamadas} rotulo="Camadas" tecla="C">Camadas</Botao>
      <Botao ativo={telao} aoClicar={aoTelao} rotulo="Modo telão: esconde os painéis" tecla="H">Telão</Botao>
    </Painel>
  );
}

// ---------------------------------------------------------------- camadas

function Selo({ children, real }: { children: ReactNode; real: boolean }) {
  return (
    <span className={`condensado shrink-0 rounded border px-1.5 py-0.5 text-[9px] ${real ? 'border-teal-claro/40 text-teal-claro' : 'border-ambar/50 text-ambar'}`}>{children}</span>
  );
}

export function PainelDeCamadas({ contexto, ligadas, aoAlternar, erro }: {
  contexto: Contexto | null;
  ligadas: ReadonlySet<CamadaContexto>;
  aoAlternar: (c: CamadaContexto) => void;
  erro: string | null;
}) {
  return (
    <Painel className="w-80 p-4">
      <p className="condensado text-xs text-teal-claro">Camadas</p>
      <p className="mt-3 text-[10px] tracking-wider text-rotulo/70 uppercase">O que entra</p>
      <div className="mt-1.5 flex items-center justify-between gap-2 text-sm">
        <span>Chamados de todos os órgãos</span>
        <Selo real={false}>Simulado</Selo>
      </div>
      <p className="mt-4 text-[10px] tracking-wider text-rotulo/70 uppercase">A cidade</p>
      <ul className="mt-1.5 space-y-1">
        {CAMADAS_CONTEXTO.map((c) => {
          const on = ligadas.has(c.id);
          return (
            <li key={c.id}>
              <label className="flex cursor-pointer items-center gap-2 rounded-md px-1 py-1 text-sm hover:bg-white/5">
                <input type="checkbox" checked={on} disabled={!contexto} onChange={() => aoAlternar(c.id)} className="accent-teal" />
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: COR_CONTEXTO[c.id] }} aria-hidden="true" />
                <span className={`flex-1 ${on ? 'text-white' : ''}`}>
                  {c.nome}
                  {contexto && <span className="text-rotulo/70"> ({numero(tamanho(contexto, c.id))})</span>}
                </span>
                <Selo real>{c.selo}</Selo>
              </label>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[11px] text-rotulo/70">
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
          <p className="condensado text-[11px] text-teal-claro">{r.codigo}</p>
          <p className="text-lg leading-tight font-semibold text-white">{r.nome}</p>
          <p className="text-[11px] text-rotulo/80">
            {numero(r.populacao)} habitantes · {r.populacaoEstimada ? 'estimativa' : 'Censo 2022'}
          </p>
        </div>
        <button type="button" onClick={aoFechar} aria-label="Voltar ao DF inteiro (Esc)" title="Voltar ao DF inteiro (Esc)"
          className="rounded-md px-2 py-1 text-rotulo hover:bg-white/5 hover:text-white">✕</button>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-white tabular-nums">{taxa.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}</span>
        <span className="text-xs text-rotulo">chamados por 10 mil hab.</span>
      </div>
      <p className={`text-xs ${relacao > 1.15 ? 'text-ambar' : relacao < 0.85 ? 'text-teal-claro' : 'text-rotulo'}`}>
        {relacao > 1.15 ? `${relacao.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}× a média do DF` : relacao < 0.85 ? 'abaixo da média do DF' : 'perto da média do DF'}
      </p>
      {tipos.length > 0 && (
        <>
          <p className="mt-3 text-[10px] tracking-wider text-rotulo/70 uppercase">O que mais chega</p>
          <ol className="mt-1 space-y-0.5 text-sm">
            {tipos.map((t) => (
              <li key={t.tipoId} className="flex justify-between gap-2">
                <span className="truncate">{TIPO_POR_ID[t.tipoId]?.nome ?? t.tipoId}</span>
                <span className="text-white tabular-nums">{numero(t.chamados)}</span>
              </li>
            ))}
          </ol>
        </>
      )}
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
            <p className="condensado text-[11px] text-teal-claro">{indice + 1} de {total} · {parada.titulo}</p>
            <p className="mt-1.5 text-lg leading-snug text-white">“{parada.frase}”</p>
            <p className="mt-0.5 text-[11px] text-rotulo/70">Conversa de 10/11/2026 · ATA, linhas {parada.ata}</p>
            <p className="mt-2 text-sm">{texto}</p>
          </div>
          <div className="h-0.5 bg-white/5">
            <div className="barra-do-tour h-full bg-teal-claro" style={{ animationDuration: `${DURACAO_PARADA}ms` }} />
          </div>
        </Painel>
      </motion.div>
    </AnimatePresence>
  );
}

// ---------------------------------------------------------------- modos de sensor

/**
 * Filtros SVG aplicados ao mapa nos modos noturno (verde de visão noturna) e
 * térmico (preto → roxo → vermelho → amarelo → branco). Os painéis não mudam.
 */
export function FiltrosDeSensor() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <filter id="sensor-noturno" colorInterpolationFilters="sRGB">
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0 0.06 0.3" />
          <feFuncG type="table" tableValues="0.03 0.6 1" />
          <feFuncB type="table" tableValues="0.02 0.12 0.35" />
        </feComponentTransfer>
      </filter>
      <filter id="sensor-termico" colorInterpolationFilters="sRGB">
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="table" tableValues="0.03 0.3 0.75 0.97 1 1" />
          <feFuncG type="table" tableValues="0.02 0.03 0.12 0.45 0.82 1" />
          <feFuncB type="table" tableValues="0.12 0.45 0.4 0.06 0.2 0.85" />
        </feComponentTransfer>
      </filter>
    </svg>
  );
}

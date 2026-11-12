import { animate, AnimatePresence, motion } from 'motion/react';
import { type ReactNode, useEffect, useRef } from 'react';
import { type Incidente, ROTULO_SITUACAO } from '../../dominio/incidente';
import { type AreaId, AREAS, TIPO_POR_ID } from '../../dominio/orgaos';
import { REGIAO_POR_ID } from '../../dominio/ras';
import { duracao, haQuanto, numero, percentual, type Periodo, PERIODOS, type VelocidadeDaArea } from '../../indicadores/indicadores';
import { type ModoMapa, MODOS } from '../../mapa/camadas';
import { Painel } from '../../ui/Painel';
import { ESCALA_CONCENTRACAO } from '../../ui/tokens';

const NOME_AREA = Object.fromEntries(AREAS.map((a) => [a.id, a])) as Record<AreaId, (typeof AREAS)[number]>;

/** Grupo de botões curtos (período, modo do mapa). */
function Grupo<T extends string>({ rotulo, opcoes, valor, aoMudar }: { rotulo: string; opcoes: { id: T; nome: string }[]; valor: T; aoMudar: (v: T) => void }) {
  return (
    <div role="group" aria-label={rotulo} className="flex rounded-lg border border-white/10 bg-navy/40 p-0.5">
      {opcoes.map((o) => (
        <button key={o.id} type="button" aria-pressed={o.id === valor} onClick={() => aoMudar(o.id)}
          className={`condensado flex-1 rounded-md px-2.5 py-1.5 text-[11px] transition-colors ${o.id === valor ? 'bg-teal text-white' : 'text-rotulo hover:text-white'}`}>
          {o.nome}
        </button>
      ))}
    </div>
  );
}

export function Filtros({ periodo, area, ra, modo, aoMudarPeriodo, aoMudarArea, aoLimparRa, aoMudarModo }: {
  periodo: Periodo; area: AreaId | null; ra: string | null; modo: ModoMapa;
  aoMudarPeriodo: (p: Periodo) => void; aoMudarArea: (a: AreaId | null) => void; aoLimparRa: () => void; aoMudarModo: (m: ModoMapa) => void;
}) {
  return (
    <Painel className="space-y-3 p-4">
      {ra && (
        <button type="button" onClick={aoLimparRa} title="Voltar ao DF inteiro (Esc)"
          className="flex w-full items-center justify-between rounded-lg border border-white/30 bg-white/5 px-3 py-1.5 text-left text-sm text-white hover:bg-white/10">
          <span><span className="condensado mr-2 text-[10px] text-teal-claro">Região</span>{REGIAO_POR_ID[ra]?.nome ?? ra}</span>
          <span aria-hidden="true" className="text-rotulo">✕</span>
        </button>
      )}
      <Grupo rotulo="Período" opcoes={PERIODOS} valor={periodo} aoMudar={aoMudarPeriodo} />
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Área">
        {[{ id: null, curto: 'Todas' } as { id: AreaId | null; curto: string }, ...AREAS].map((a) => (
          <button key={a.id ?? 'todas'} type="button" aria-pressed={a.id === area} onClick={() => aoMudarArea(a.id)}
            className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${a.id === area ? 'border-teal-claro bg-teal/30 text-white' : 'border-white/10 text-rotulo hover:text-white'}`}>
            {a.curto}
          </button>
        ))}
      </div>
      <Grupo rotulo="Modo do mapa" opcoes={MODOS} valor={modo} aoMudar={aoMudarModo} />
    </Painel>
  );
}

/** Número que conta até o valor novo quando o filtro muda. */
function Contador({ valor, formato }: { valor: number; formato: (n: number) => string }) {
  const el = useRef<HTMLSpanElement>(null);
  const anterior = useRef(valor);
  useEffect(() => {
    const ctrl = animate(anterior.current, valor, {
      duration: 0.6,
      ease: 'easeOut',
      onUpdate: (v) => { if (el.current) el.current.textContent = formato(v); },
    });
    anterior.current = valor;
    return () => ctrl.stop();
  }, [valor, formato]);
  return <span ref={el}>{formato(valor)}</span>;
}

function Kpi({ rotulo, children, nota }: { rotulo: string; children: ReactNode; nota?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-navy/30 px-3 py-2.5">
      <p className="condensado text-[10px] text-rotulo">{rotulo}</p>
      <p className="mt-0.5 text-2xl leading-tight font-semibold text-white tabular-nums">{children}</p>
      {nota && <p className="text-[11px] text-rotulo/70">{nota}</p>}
    </div>
  );
}

export function Numeros({ abertos, recebidos, tempo, noPrazo, nomePeriodo }: { abertos: number; recebidos: number; tempo: number | null; noPrazo: number | null; nomePeriodo: string }) {
  return (
    <Painel className="p-4">
      <p className="condensado text-xs text-teal-claro">A cidade agora</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Kpi rotulo="Abertos agora" nota="esperando alguém agir"><Contador valor={abertos} formato={numero} /></Kpi>
        <Kpi rotulo="Recebidos" nota={nomePeriodo.toLowerCase()}><Contador valor={recebidos} formato={numero} /></Kpi>
        <Kpi rotulo="Tempo até resolver" nota="mediana">{duracao(tempo)}</Kpi>
        <Kpi rotulo="No prazo" nota="dos resolvidos">{percentual(noPrazo)}</Kpi>
      </div>
    </Painel>
  );
}

/** "A velocidade da sua gestão" (ATA 147–148), área por área. Clicar filtra. */
export function Velocidade({ linhas, area, aoMudarArea }: { linhas: VelocidadeDaArea[]; area: AreaId | null; aoMudarArea: (a: AreaId | null) => void }) {
  return (
    <Painel className="p-4">
      <p className="condensado text-xs text-teal-claro">Velocidade da gestão</p>
      <p className="mt-0.5 text-[11px] text-rotulo/80">% resolvido no prazo · mediana até resolver</p>
      <ul className="mt-3 space-y-2">
        {linhas.map((l) => {
          const ativa = area === l.area;
          const p = l.noPrazo ?? 0;
          return (
            <li key={l.area}>
              <button type="button" onClick={() => aoMudarArea(ativa ? null : l.area)} aria-pressed={ativa}
                className={`w-full rounded-lg px-2 py-1.5 text-left transition-colors ${ativa ? 'bg-teal/20' : 'hover:bg-white/5'}`}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className={ativa ? 'text-white' : ''}>{NOME_AREA[l.area].curto}</span>
                  <span className="tabular-nums text-white">{percentual(l.noPrazo)} <span className="text-xs text-rotulo">· {duracao(l.tempoAteResolver)}</span></span>
                </div>
                <svg className="mt-1 block h-1.5 w-full" viewBox="0 0 100 4" preserveAspectRatio="none" aria-hidden="true">
                  <rect x="0" y="0" width="100" height="4" rx="2" fill="rgba(255,255,255,0.08)" />
                  <rect x="0" y="0" width={Math.max(1, p * 100)} height="4" rx="2" fill={ativa ? '#38C3DB' : '#0196B2'} />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
    </Painel>
  );
}

/** Chamados por dia nos últimos 30 dias (barras SVG). */
export function Minigrafico({ serie }: { serie: number[] }) {
  const max = Math.max(1, ...serie);
  const w = 100 / serie.length;
  return (
    <Painel className="p-4">
      <div className="flex items-baseline justify-between">
        <p className="condensado text-xs text-teal-claro">Chamados por dia</p>
        <p className="text-[11px] text-rotulo/80">últimos {serie.length} dias</p>
      </div>
      <svg className="mt-3 block h-16 w-full" viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label={`Chamados por dia, de ${numero(Math.min(...serie))} a ${numero(max)}`}>
        {serie.map((v, k) => {
          const h = (v / max) * 38;
          return <rect key={k} x={k * w + w * 0.15} y={40 - h} width={w * 0.7} height={h} rx="0.6" fill={k === serie.length - 1 ? '#F2A93B' : '#0196B2'} opacity={k === serie.length - 1 ? 1 : 0.85} />;
        })}
      </svg>
      <div className="mt-1.5 flex justify-between text-[11px] text-rotulo/80 tabular-nums">
        <span>mín. {numero(Math.min(...serie))}</span>
        <span className="text-ambar">hoje (parcial) {numero(serie[serie.length - 1] ?? 0)}</span>
        <span>máx. {numero(max)}</span>
      </div>
    </Painel>
  );
}

/** Os chamados mais recentes, entrando com animação. */
export function ChegandoAgora({ lista, agora }: { lista: Incidente[]; agora: number }) {
  return (
    <Painel className="p-4">
      <p className="condensado text-xs text-teal-claro">Chegando agora</p>
      <ul className="mt-2">
        <AnimatePresence initial={false}>
          {lista.map((i) => (
            <motion.li key={i.id} layout initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="flex items-start justify-between gap-3 border-t border-white/10 py-2 first:border-t-0">
              <div className="min-w-0">
                <p className="truncate text-sm text-white">{TIPO_POR_ID[i.tipoId]?.nome ?? i.tipoId}</p>
                <p className="truncate text-[11px] text-rotulo/80">{REGIAO_POR_ID[i.local.raId]?.nome ?? i.local.raId} · {NOME_AREA[i.area].curto}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="condensado text-[10px] text-teal-claro">{ROTULO_SITUACAO[i.situacao]}</p>
                <p className="text-[11px] text-rotulo/80">{haQuanto(agora, i.criadoEm)}</p>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </Painel>
  );
}

/** Legenda da escala de concentração. A cor nunca vem sozinha. */
export function Legenda({ modo }: { modo: ModoMapa }) {
  const cores = ESCALA_CONCENTRACAO.map(([r, g, b]) => `rgb(${r},${g},${b})`);
  return (
    <Painel className="px-3 py-2">
      <div className="flex items-center gap-2 text-[11px] text-rotulo">
        <span>{modo === 'regioes' ? 'Menos' : 'Poucos'}</span>
        <span className="h-2 w-28 rounded-full" style={{ background: `linear-gradient(90deg, ${cores.join(',')})` }} aria-hidden="true" />
        <span>{modo === 'hexagonos' ? 'Muitos chamados' : 'Mais chamados'}</span>
      </div>
    </Painel>
  );
}

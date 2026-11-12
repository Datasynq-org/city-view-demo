import { animate, AnimatePresence, motion } from 'motion/react';
import { type ReactNode, useEffect, useRef } from 'react';
import { type Incidente, ROTULO_SITUACAO } from '../../dominio/incidente';
import { type AreaId, AREAS, TIPO_POR_ID } from '../../dominio/orgaos';
import { REGIAO_POR_ID } from '../../dominio/ras';
import { duracao, haQuanto, numero, percentual, type Periodo, PERIODOS, type VelocidadeDaArea } from '../../indicadores/indicadores';
import type { ModoMapa } from '../../mapa/camadas';
import { CORES_DAS_FAIXAS } from '../../mapa/calor';
import { Painel } from '../../ui/Painel';
import { CORES, ESCALA_CONCENTRACAO } from '../../ui/tokens';

const NOME_AREA = Object.fromEntries(AREAS.map((a) => [a.id, a])) as Record<AreaId, (typeof AREAS)[number]>;

/** O que está escolhido: fundo um tom acima e um traço do acento embaixo. */
export const ATIVO = 'bg-realce text-white shadow-[inset_0_-2px_0_var(--color-acento)]';

/** Grupo de botões curtos (período, modo do mapa). */
export function Grupo<T extends string>({ rotulo, opcoes, valor, aoMudar }: { rotulo: string; opcoes: { id: T; nome: string }[]; valor: T; aoMudar: (v: T) => void }) {
  return (
    <div role="group" aria-label={rotulo} className="flex rounded border border-linha bg-poco p-0.5">
      {opcoes.map((o) => (
        <button key={o.id} type="button" aria-pressed={o.id === valor} onClick={() => aoMudar(o.id)}
          className={`condensado flex-1 rounded-[3px] px-2.5 py-2 text-nota transition-colors ${o.id === valor ? ATIVO : 'text-texto-2 hover:text-white'}`}>
          {o.nome}
        </button>
      ))}
    </div>
  );
}

export function Filtros({ periodo, area, ra, aoMudarPeriodo, aoMudarArea, aoLimparRa }: {
  periodo: Periodo; area: AreaId | null; ra: string | null;
  aoMudarPeriodo: (p: Periodo) => void; aoMudarArea: (a: AreaId | null) => void; aoLimparRa: () => void;
}) {
  return (
    <Painel className="space-y-2.5 p-4">
      {ra && (
        <button type="button" onClick={aoLimparRa} title="Voltar ao DF inteiro (Esc)"
          className="flex w-full items-center justify-between rounded border border-linha-forte bg-poco px-3 py-2 text-left text-corpo text-white hover:bg-realce">
          <span><span className="condensado mr-2 text-rotulo text-texto-2">Região</span>{REGIAO_POR_ID[ra]?.nome ?? ra}</span>
          <span aria-hidden="true" className="text-texto-2">✕</span>
        </button>
      )}
      <Grupo rotulo="Período" opcoes={PERIODOS} valor={periodo} aoMudar={aoMudarPeriodo} />
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Área">
        {[{ id: null, curto: 'Todas' } as { id: AreaId | null; curto: string }, ...AREAS].map((a) => (
          <button key={a.id ?? 'todas'} type="button" aria-pressed={a.id === area} onClick={() => aoMudarArea(a.id)}
            className={`rounded border px-2.5 py-1.5 text-nota transition-colors ${a.id === area ? 'border-acento bg-realce text-white' : 'border-linha text-texto-2 hover:border-linha-forte hover:text-white'}`}>
            {a.curto}
          </button>
        ))}
      </div>
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
    <div className="rounded border border-linha bg-poco px-3 py-2">
      <p className="condensado text-rotulo text-texto-2">{rotulo}</p>
      <p className="mt-1 text-valor font-semibold text-white tabular-nums">{children}</p>
      {nota && <p className="text-nota text-texto-2">{nota}</p>}
    </div>
  );
}

export function Numeros({ abertos, recebidos, tempo, noPrazo, nomePeriodo }: { abertos: number; recebidos: number; tempo: number | null; noPrazo: number | null; nomePeriodo: string }) {
  return (
    <Painel className="p-4">
      <p className="titulo-painel">A cidade agora</p>
      <div className="mt-2.5 grid grid-cols-2 gap-2">
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
      <p className="titulo-painel">Velocidade da gestão</p>
      <p className="mt-1.5 text-nota text-texto-2">% resolvido no prazo · mediana até resolver</p>
      <ul className="mt-1.5 space-y-0.5">
        {linhas.map((l) => {
          const ativa = area === l.area;
          const p = l.noPrazo ?? 0;
          return (
            <li key={l.area}>
              <button type="button" onClick={() => aoMudarArea(ativa ? null : l.area)} aria-pressed={ativa}
                className={`-mx-2 block w-[calc(100%+1rem)] rounded px-2 py-1 text-left transition-colors ${ativa ? 'bg-realce' : 'hover:bg-poco'}`}>
                <div className="flex items-baseline justify-between gap-2 text-corpo">
                  <span className={ativa ? 'text-white' : ''}>{NOME_AREA[l.area].curto}</span>
                  <span className="tabular-nums text-white">{percentual(l.noPrazo)} <span className="text-nota text-texto-2">· {duracao(l.tempoAteResolver)}</span></span>
                </div>
                <svg className="mt-1.5 block h-[5px] w-full" viewBox="0 0 100 4" preserveAspectRatio="none" aria-hidden="true">
                  <rect x="0" y="0" width="100" height="4" fill={CORES.linha} />
                  <rect x="0" y="0" width={Math.max(1, p * 100)} height="4" fill={ativa ? CORES.acentoClaro : CORES.acento} />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
    </Painel>
  );
}

/** Cor das barras dos dias fechados: neutra, para o dia de hoje (parcial) se destacar. */
const BARRA_NEUTRA = '#69717A';

/** Chamados por dia nos últimos 30 dias (barras SVG). */
export function Minigrafico({ serie }: { serie: number[] }) {
  const max = Math.max(1, ...serie);
  const w = 100 / serie.length;
  return (
    <Painel className="p-4">
      <div className="flex items-baseline justify-between">
        <p className="titulo-painel">Chamados por dia</p>
        <p className="text-nota text-texto-2">últimos {serie.length} dias</p>
      </div>
      <svg className="mt-3 block h-[4.5rem] w-full" viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label={`Chamados por dia, de ${numero(Math.min(...serie))} a ${numero(max)}`}>
        {serie.map((v, k) => {
          const h = (v / max) * 38;
          return <rect key={k} x={k * w + w * 0.15} y={40 - h} width={w * 0.7} height={h} fill={k === serie.length - 1 ? CORES.acentoClaro : BARRA_NEUTRA} />;
        })}
        <line x1="0" x2="100" y1="39.75" y2="39.75" stroke={CORES.linha} strokeWidth="0.5" />
      </svg>
      <div className="mt-2 flex justify-between text-nota text-texto-2 tabular-nums">
        <span>mín. {numero(Math.min(...serie))}</span>
        <span className="flex items-center gap-1.5 text-texto">
          <span className="inline-block size-1.5 bg-acento-claro" aria-hidden="true" />
          hoje (parcial) {numero(serie[serie.length - 1] ?? 0)}
        </span>
        <span>máx. {numero(max)}</span>
      </div>
    </Painel>
  );
}

/** Os chamados mais recentes, entrando com animação. */
export function ChegandoAgora({ lista, agora }: { lista: Incidente[]; agora: number }) {
  return (
    <Painel className="p-4">
      <p className="titulo-painel">Chegando agora</p>
      <ul className="mt-1.5">
        <AnimatePresence initial={false}>
          {lista.map((i) => (
            <motion.li key={i.id} layout initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="flex items-start justify-between gap-3 border-t border-linha py-2.5 first:border-t-0">
              <div className="min-w-0">
                <p className="truncate text-corpo text-white">{TIPO_POR_ID[i.tipoId]?.nome ?? i.tipoId}</p>
                <p className="truncate text-nota text-texto-2">{REGIAO_POR_ID[i.local.raId]?.nome ?? i.local.raId} · {NOME_AREA[i.area].curto}</p>
              </div>
              <div className="shrink-0 text-right">
                {/* O que acabou de entrar leva o ponto do "ao vivo"; o resto, um ponto neutro. */}
                <p className="condensado flex items-center justify-end gap-1.5 text-rotulo text-texto">
                  <span className={`inline-block size-1.5 rounded-full ${i.situacao === 'recebido' ? 'bg-acento-claro' : 'bg-linha-forte'}`} aria-hidden="true" />
                  {ROTULO_SITUACAO[i.situacao]}
                </p>
                <p className="text-nota text-texto-2 tabular-nums">{haQuanto(agora, i.criadoEm)}</p>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </Painel>
  );
}

/**
 * Legenda do mapa: a escala de concentração e o ponto de quem acabou de chegar.
 * A cor nunca vem sozinha. No calor e nos hexágonos a escala tem seis faixas,
 * como no mapa; nas regiões, é contínua.
 */
export function Legenda({ modo }: { modo: ModoMapa }) {
  const cheias = ESCALA_CONCENTRACAO.map(([r, g, b]) => `rgb(${r},${g},${b})`);
  const faixas = modo === 'calor' ? CORES_DAS_FAIXAS : cheias;
  return (
    <Painel className="px-3.5 py-2.5">
      <div className="flex items-center gap-3 text-nota text-texto">
        <span>{modo === 'regioes' ? 'Menos' : 'Poucos'}</span>
        {modo === 'regioes' ? (
          <span className="h-2 w-20 rounded-[1px] xl:w-40" style={{ background: `linear-gradient(90deg, ${cheias.join(',')})` }} aria-hidden="true" />
        ) : (
          <span className="flex gap-px" aria-hidden="true">
            {faixas.map((cor) => <span key={cor} className="h-2 w-3.5 bg-base xl:w-6"><span className="block size-full" style={{ background: cor }} /></span>)}
          </span>
        )}
        <span>{modo === 'hexagonos' ? 'Muitos chamados' : 'Mais chamados'}</span>
        <span className="h-4 w-px bg-linha" aria-hidden="true" />
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="inline-block size-2 rounded-full bg-acento-claro ring-1 ring-base" aria-hidden="true" />
          Acabou de chegar
        </span>
      </div>
      {modo === 'calor' && <p className="mt-1 text-micro text-texto-2">Concentração em relação ao maior foco da seleção</p>}
    </Painel>
  );
}

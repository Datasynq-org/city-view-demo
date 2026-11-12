import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type CamadaContexto, carregarContexto, type Contexto } from './dados/contexto';
import { gerarBase } from './dados/gerador';
import type { Incidente } from './dominio/incidente';
import type { AreaId } from './dominio/orgaos';
import { REGIAO_POR_ID } from './dominio/ras';
import { chamadosPorRa, type Filtro, filtrar, PERIODOS } from './indicadores/indicadores';
import { ADIANTE_MS, intervaloDeChegada, receber, separarFila } from './indicadores/relogio';
import { anelAtivo, camadasDeChamados, camadasDeContexto, camadasDePulsos, type Chegada, type ModoMapa } from './mapa/camadas';
import { Mapa } from './mapa/Mapa';
import { reduzMovimento, type Vista } from './mapa/vista';
import { BarraDeComando, FiltrosDeSensor, LegendaDoTour, PainelDeCamadas, type Sensor } from './telas/sala/hud';
import { SalaDeGuerra } from './telas/sala/SalaDeGuerra';
import { type CenaDoTour, DURACAO_PARADA, TOUR } from './telas/sala/tour';
import { Selo } from './ui/Selo';

/**
 * O DF se enquadra no espaço que os painéis deixam livre: entre as duas colunas
 * em tela larga, acima deles em tela estreita. 1024 é o `lg` do Tailwind (ver `.sala-*`).
 * No modo telão, os painéis somem e o mapa ocupa a tela.
 */
const margensDoMapa = (largura: number) =>
  largura >= 1024 ? { top: 72, bottom: 72, left: 400, right: 372 } : { top: 128, bottom: 380, left: 16, right: 16 };
const MARGENS_TELAO = { top: 96, bottom: 72, left: 48, right: 48 };

/** Uma chegada no mapa, com o que o filtro precisa saber. */
interface ChegadaViva extends Chegada {
  area: AreaId;
  raId: string;
}

const vistaDaRa = (ra: string): Vista => ({ centro: REGIAO_POR_ID[ra]!.rotulo, zoom: 11.6, inclinacao: 55, rotacao: 18 });

export function App() {
  const parametros = useMemo(() => new URLSearchParams(window.location.search), []);

  // ------------------------------------------------ a cidade simulada e o relógio da demo
  const [inicio] = useState(() => Date.now());
  const base = useMemo(() => gerarBase({ agora: inicio + ADIANTE_MS }), [inicio]);
  const { chegados, fila } = useMemo(() => separarFila(base.incidentes, inicio), [base, inicio]);
  const [vivo, setVivo] = useState<{ incidentes: Incidente[]; proximo: number; agora: number; chegadas: ChegadaViva[] }>(() => ({
    incidentes: chegados,
    proximo: 0,
    agora: inicio,
    chegadas: [],
  }));

  // A cada poucos segundos, o próximo da fila chega, como "recebido agora".
  useEffect(() => {
    let espera = 0;
    const agendar = () => {
      espera = window.setTimeout(() => {
        const agora = Date.now();
        const em = performance.now();
        setVivo((s) => {
          const proximo = fila[s.proximo];
          if (!proximo) return s;
          const i = receber(proximo, agora);
          const chegada: ChegadaViva = { id: i.id, posicao: [i.local.lon, i.local.lat], em, area: i.area, raId: i.local.raId };
          return { incidentes: [...s.incidentes, i], proximo: s.proximo + 1, agora, chegadas: [...s.chegadas, chegada].slice(-8) };
        });
        agendar();
      }, intervaloDeChegada(Math.random()));
    };
    agendar();
    return () => clearTimeout(espera);
  }, [fila]);

  // ------------------------------------------------ o que a pessoa escolhe
  const [filtro, setFiltro] = useState<Filtro>({ periodo: '7d', area: null, ra: null });
  const [modo, setModo] = useState<ModoMapa>('regioes');
  const [sensor, setSensor] = useState<Sensor>('padrao');
  const [ligadas, setLigadas] = useState<Set<CamadaContexto>>(() => new Set());
  const [camadasAbertas, setCamadasAbertas] = useState(false);
  const [girando, setGirando] = useState(() => !reduzMovimento());
  const [telao, setTelao] = useState(() => parametros.get('telao') === '1');
  // `?tour=1` no endereço abre já com o tour rodando (para deixar no telão).
  const [parada, setParada] = useState<number | null>(() => (parametros.get('tour') === '1' ? 0 : null));
  const [textoDaParada, setTextoDaParada] = useState('');
  const [alvo, setAlvo] = useState<{ vista: Vista | null; chave: number }>();
  const voar = useCallback((vista: Vista | null) => setAlvo((a) => ({ vista, chave: (a?.chave ?? 0) + 1 })), []);

  const [contexto, setContexto] = useState<Contexto | null>(null);
  const [erroContexto, setErroContexto] = useState<string | null>(null);
  useEffect(() => {
    carregarContexto().then(setContexto, (e: Error) => setErroContexto(e.message));
  }, []);

  // ------------------------------------------------ recortes
  const noPeriodo = useMemo(() => filtrar(vivo.incidentes, vivo.agora, { periodo: filtro.periodo, area: null }), [vivo.incidentes, vivo.agora, filtro.periodo]);
  const daArea = useMemo(() => (filtro.area === null ? noPeriodo : noPeriodo.filter((i) => i.area === filtro.area)), [noPeriodo, filtro.area]);
  const ra = filtro.ra ?? null;
  const doPeriodo = useMemo(() => (ra === null ? noPeriodo : noPeriodo.filter((i) => i.local.raId === ra)), [noPeriodo, ra]);
  const filtrados = useMemo(() => (ra === null ? daArea : daArea.filter((i) => i.local.raId === ra)), [daArea, ra]);
  const porRa = useMemo(() => chamadosPorRa(daArea), [daArea]);

  // ------------------------------------------------ mapa
  // Clicar escolhe a RA (o deck.gl e o MapLibre podem avisar o mesmo clique; escolher de novo não desfaz).
  // Para voltar ao DF: o ✕ do cartão, o chip nos filtros ou Esc.
  const selecionarRa = useCallback((id: string) => setFiltro((f) => (f.ra === id ? f : { ...f, ra: id })), []);
  const camadas = useMemo(
    () => [
      ...camadasDeChamados({ modo, filtrados, porRa, raSelecionada: ra, discreto: ligadas.size > 0 }),
      ...camadasDeContexto(contexto, ligadas),
    ],
    [modo, filtrados, porRa, ra, ligadas, contexto],
  );
  const chegadas = useMemo(
    () => vivo.chegadas.filter((c) => (filtro.area === null || c.area === filtro.area) && (ra === null || c.raId === ra)),
    [vivo.chegadas, filtro.area, ra],
  );
  const animadas = useCallback((t: number) => ({ camadas: camadasDePulsos(chegadas, t), ativo: chegadas.some((c) => anelAtivo(t, c)) }), [chegadas]);

  // No telão e no tour, os painéis saem e o mapa fica com a tela inteira.
  const telaCheia = useRef(telao);
  telaCheia.current = telao || parada !== null;
  const margens = useCallback((largura: number) => (telaCheia.current ? MARGENS_TELAO : margensDoMapa(largura)), []);

  // ------------------------------------------------ tour
  const paradaRef = useRef(parada);
  paradaRef.current = parada;
  const nomePeriodo = PERIODOS.find((p) => p.id === filtro.periodo)!.nome;
  const cena = useRef<CenaDoTour>({ incidentes: [], doPeriodo: [], nomePeriodo, contexto: null });
  cena.current = { incidentes: vivo.incidentes, doPeriodo: noPeriodo, nomePeriodo, contexto };

  useEffect(() => {
    if (parada === null) return;
    const p = TOUR[parada]!;
    const c = cena.current;
    setModo(p.modo);
    setLigadas(new Set(p.contexto));
    setFiltro((f) => ({ ...f, area: p.area(c), ra: null }));
    setTextoDaParada(p.texto(c));
    setCamadasAbertas(false);
    voar(p.vista(c));
    setGirando(!reduzMovimento());
    const t = setTimeout(() => setParada((i) => (i === null ? null : (i + 1) % TOUR.length)), DURACAO_PARADA);
    return () => clearTimeout(t);
  }, [parada, voar]);

  // Escolher ou soltar uma RA leva a câmera até ela, ou de volta ao DF (fora do tour).
  const raAnterior = useRef(ra);
  useEffect(() => {
    if (raAnterior.current === ra) return;
    raAnterior.current = ra;
    if (paradaRef.current !== null) return;
    voar(ra ? vistaDaRa(ra) : null);
  }, [ra, voar]);

  // ------------------------------------------------ comandos
  const pararTudo = useCallback(() => {
    setParada(null);
    setGirando(false);
  }, []);
  const alternarTour = useCallback(() => {
    const parando = paradaRef.current !== null;
    setParada(parando ? null : 0);
    // Ao parar, os painéis voltam: o DF se reenquadra no espaço que eles deixam.
    if (parando) setTimeout(() => voar(null), 0);
  }, [voar]);
  const alternarTelao = useCallback(() => {
    setTelao((t) => !t);
    // Reenquadra depois que as margens mudam.
    setTimeout(() => {
      if (paradaRef.current === null) voar(null);
    }, 0);
  }, [voar]);
  const limparRa = useCallback(() => setFiltro((f) => ({ ...f, ra: null })), []);
  const alternarCamada = useCallback(
    (c: CamadaContexto) =>
      setLigadas((l) => {
        const n = new Set(l);
        if (n.has(c)) n.delete(c);
        else n.add(c);
        return n;
      }),
    [],
  );

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === '1') setSensor('padrao');
      else if (k === '2') setSensor('noturno');
      else if (k === '3') setSensor('termico');
      else if (k === 't') alternarTour();
      else if (k === 'o') setGirando((g) => !g);
      else if (k === 'h') alternarTelao();
      else if (k === 'c') setCamadasAbertas((a) => !a);
      else if (k === 'escape') {
        setCamadasAbertas(false);
        limparRa();
      }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [alternarTour, alternarTelao, limparRa]);

  const emTour = parada !== null;
  return (
    <main className={`relative h-full overflow-hidden ${telao ? 'telao' : ''} ${emTour ? 'em-tour' : ''}`}>
      <FiltrosDeSensor />
      <Mapa
        margens={margens}
        camadas={camadas}
        animadas={animadas}
        girando={girando}
        alvo={alvo}
        aoInteragir={pararTudo}
        aoClicarRa={selecionarRa}
        dicaDasRas={modo !== 'regioes'}
        raSelecionada={ra}
        telaCheia={telao || emTour}
        className={`mapa-${sensor}`}
      />
      {sensor !== 'padrao' && <div className={`varredura varredura-${sensor}`} aria-hidden="true" />}
      <header className="pointer-events-none absolute top-16 left-5 lg:top-5">
        <h1 className="condensado text-2xl tracking-[0.2em] text-white">City View</h1>
        <p className="text-sm text-rotulo">Sala de situação · Distrito Federal</p>
      </header>
      {/* Em tela média, a barra encosta depois do título, longe do selo; em tela larga, no meio. */}
      <div className="absolute top-5 left-[16rem] z-20 hidden lg:block 2xl:left-1/2 2xl:-translate-x-1/2">
        <BarraDeComando
          sensor={sensor}
          aoMudarSensor={setSensor}
          tour={emTour}
          aoTour={alternarTour}
          girando={girando}
          aoGirar={() => setGirando((g) => !g)}
          camadasAbertas={camadasAbertas}
          aoCamadas={() => setCamadasAbertas((a) => !a)}
          telao={telao}
          aoTelao={alternarTelao}
        />
        {camadasAbertas && (
          <div className="absolute top-full right-0 mt-2">
            <PainelDeCamadas contexto={contexto} ligadas={ligadas} aoAlternar={alternarCamada} erro={erroContexto} />
          </div>
        )}
      </div>
      <SalaDeGuerra
        base={base}
        incidentes={vivo.incidentes}
        agora={vivo.agora}
        doPeriodo={doPeriodo}
        filtrados={filtrados}
        porRa={porRa}
        chamadosDf={daArea.length}
        filtro={filtro}
        modo={modo}
        aoMudarFiltro={setFiltro}
        aoMudarModo={setModo}
        aoLimparRa={limparRa}
      />
      {emTour && (
        <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 -translate-x-1/2">
          <LegendaDoTour parada={TOUR[parada]!} indice={parada} total={TOUR.length} texto={textoDaParada} />
        </div>
      )}
      <Selo />
    </main>
  );
}

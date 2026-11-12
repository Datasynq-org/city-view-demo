import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type CamadaContexto, carregarContexto, type Contexto } from '../../dados/contexto';
import { cidade } from '../../dados/cidade';
import type { Incidente } from '../../dominio/incidente';
import { type AreaId, TIPO_POR_ID } from '../../dominio/orgaos';
import { REGIAO_POR_ID } from '../../dominio/ras';
import { chamadosPorRa, type Filtro, filtrar, PERIODOS } from '../../indicadores/indicadores';
import { intervaloDeChegada, receber } from '../../indicadores/relogio';
import { anelAtivo, camadasDeChamados, camadasDeContexto, camadasDePulsos, type Chegada, MODO_INICIAL, type ModoMapa } from '../../mapa/camadas';
import { Mapa } from '../../mapa/Mapa';
import { type Destino, reduzMovimento } from '../../mapa/vista';
import { BarraDeComando, LegendaDoTour, PainelDeCamadas } from './hud';
import { SalaDeGuerra } from './SalaDeGuerra';
import { type CenaDoTour, DURACAO_PARADA, TOUR } from './tour';

/**
 * O DF se enquadra no espaço que os painéis deixam livre: entre as duas colunas
 * em tela larga, acima deles em tela estreita. 1024 é o `lg` do Tailwind (ver `.sala-*`).
 * No modo telão, os painéis somem e o mapa ocupa a tela.
 */
const margensDoMapa = (largura: number) =>
  largura >= 1024 ? { top: 84, bottom: 72, left: 400, right: 368 } : { top: 128, bottom: 380, left: 16, right: 16 };
const MARGENS_TELAO = { top: 96, bottom: 72, left: 48, right: 48 };

/** Uma chegada no mapa, com o que o filtro precisa saber. */
interface ChegadaViva extends Chegada {
  area: AreaId;
  raId: string;
}

const DF: Destino = { tipo: 'df' };

const SEM_CHAMADOS: Incidente[] = [];

export function TelaSala() {
  const parametros = useMemo(() => new URLSearchParams(window.location.search), []);

  // ------------------------------------------------ a cidade simulada e o relógio da demo
  const { inicio, base, chegados, fila } = useMemo(cidade, []);
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
          const rotulo = `${TIPO_POR_ID[i.tipoId]?.nome ?? i.tipoId} · ${REGIAO_POR_ID[i.local.raId]?.nome ?? i.local.raId}`;
          const chegada: ChegadaViva = { id: i.id, posicao: [i.local.lon, i.local.lat], em, rotulo, area: i.area, raId: i.local.raId };
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
  const [modo, setModo] = useState<ModoMapa>(MODO_INICIAL);
  const [ligadas, setLigadas] = useState<Set<CamadaContexto>>(() => new Set());
  const [camadasAbertas, setCamadasAbertas] = useState(false);
  // Modo girar: arrastar o mapa gira e inclina. A órbita sozinha fica só para o tour.
  const [girando, setGirando] = useState(false);
  const [orbitando, setOrbitando] = useState(false);
  const [telao, setTelao] = useState(() => parametros.get('telao') === '1');
  // `?tour=1` no endereço abre já com o tour rodando (para deixar no telão).
  const [parada, setParada] = useState<number | null>(() => (parametros.get('tour') === '1' ? 0 : null));
  const [textoDaParada, setTextoDaParada] = useState('');
  const [alvo, setAlvo] = useState<{ destino: Destino; chave: number; lento?: boolean }>();
  const voar = useCallback((destino: Destino, lento = false) => setAlvo((a) => ({ destino, lento, chave: (a?.chave ?? 0) + 1 })), []);

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
  // No calor, quem desenha os chamados é o MapLibre: as camadas do deck.gl não mudam a cada chegada.
  const noDeck = modo === 'calor' ? SEM_CHAMADOS : filtrados;
  const porRaNoDeck = modo === 'regioes' ? porRa : null;
  const comContexto = ligadas.size > 0;
  const camadasDosChamados = useMemo(
    () => camadasDeChamados({ modo, filtrados: noDeck, porRa: porRaNoDeck ?? new Map(), raSelecionada: ra, discreto: comContexto }),
    [modo, noDeck, porRaNoDeck, ra, comContexto],
  );
  const camadasDoContexto = useMemo(() => camadasDeContexto(contexto, ligadas), [contexto, ligadas]);
  const camadas = useMemo(() => [...camadasDosChamados, ...camadasDoContexto], [camadasDosChamados, camadasDoContexto]);
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
  const raRef = useRef(ra);
  raRef.current = ra;
  const nomePeriodo = PERIODOS.find((p) => p.id === filtro.periodo)!.nome;
  const cena = useRef<CenaDoTour>({ incidentes: [], doPeriodo: [], nomePeriodo, contexto: null });
  cena.current = { incidentes: vivo.incidentes, doPeriodo: noPeriodo, nomePeriodo, contexto };

  useEffect(() => {
    if (parada === null) return;
    const p = TOUR[parada]!;
    const c = cena.current;
    const vista = p.vista(c);
    setModo(p.modo);
    setLigadas(new Set(p.contexto));
    setFiltro((f) => ({ ...f, area: p.area(c), ra: null }));
    setTextoDaParada(p.texto(c));
    setCamadasAbertas(false);
    setGirando(false);
    voar(vista ? { tipo: 'vista', vista } : DF, true);
    setOrbitando(!reduzMovimento());
    const t = setTimeout(() => setParada((i) => (i === null ? null : (i + 1) % TOUR.length)), DURACAO_PARADA);
    return () => clearTimeout(t);
  }, [parada, voar]);

  // Escolher uma RA enquadra os limites dela; soltar volta ao DF (fora do tour).
  const raAnterior = useRef(ra);
  useEffect(() => {
    if (raAnterior.current === ra) return;
    raAnterior.current = ra;
    if (paradaRef.current !== null) return;
    voar(ra ? { tipo: 'ra', ra } : DF);
  }, [ra, voar]);

  // ------------------------------------------------ comandos
  const pararTudo = useCallback(() => {
    setParada(null);
    setOrbitando(false);
  }, []);
  const alternarTour = useCallback(() => {
    const parando = paradaRef.current !== null;
    setParada(parando ? null : 0);
    if (parando) setOrbitando(false);
    // Ao parar, os painéis voltam: o DF se reenquadra no espaço que eles deixam.
    if (parando) setTimeout(() => voar(DF), 0);
  }, [voar]);
  const alternarGirar = useCallback(() => {
    pararTudo();
    setGirando((g) => !g);
  }, [pararTudo]);
  const alternarTelao = useCallback(() => {
    setTelao((t) => !t);
    // Reenquadra depois que as margens mudam.
    setTimeout(() => {
      if (paradaRef.current === null) voar(DF);
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
      if (k === 't') alternarTour();
      else if (k === 'o') alternarGirar();
      else if (k === 'h') alternarTelao();
      else if (k === 'c') setCamadasAbertas((a) => !a);
      else if (k === 'escape') {
        // Esc é a volta para casa: fecha o que está aberto e mostra o DF inteiro.
        setCamadasAbertas(false);
        setGirando(false);
        if (raRef.current !== null) limparRa();
        else if (paradaRef.current === null) voar(DF);
      }
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [alternarTour, alternarGirar, alternarTelao, limparRa, voar]);

  const emTour = parada !== null;
  return (
    <main className={`relative h-full overflow-hidden ${telao ? 'telao' : ''} ${emTour ? 'em-tour' : ''}`}>
      <Mapa
        margens={margens}
        camadas={camadas}
        animadas={animadas}
        calor={modo === 'calor' ? filtrados : null}
        orbitando={orbitando}
        girarComArrasto={girando}
        alvo={alvo}
        aoInteragir={pararTudo}
        aoClicarRa={selecionarRa}
        dicaDasRas={modo !== 'regioes'}
        raSelecionada={ra}
        telaCheia={telao || emTour}
      />
      {/* Em tela média, a barra encosta depois do título, longe do selo; em tela larga, no meio. */}
      <div className="absolute top-3 left-1/2 z-20 hidden -translate-x-1/2 lg:block">
        <BarraDeComando
          tour={emTour}
          aoTour={alternarTour}
          girando={girando}
          aoGirar={alternarGirar}
          camadasAbertas={camadasAbertas}
          aoCamadas={() => setCamadasAbertas((a) => !a)}
          telao={telao}
          aoTelao={alternarTelao}
        />
        {camadasAbertas && (
          <div className="absolute top-full right-0 mt-2">
            <PainelDeCamadas contexto={contexto} ligadas={ligadas} aoAlternar={alternarCamada} erro={erroContexto} modo={modo} aoMudarModo={setModo} />
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
        aoLimparRa={limparRa}
      />
      {emTour && (
        <div className="pointer-events-none absolute bottom-10 left-1/2 z-20 -translate-x-1/2">
          <LegendaDoTour parada={TOUR[parada]!} indice={parada} total={TOUR.length} texto={textoDaParada} />
        </div>
      )}
    </main>
  );
}

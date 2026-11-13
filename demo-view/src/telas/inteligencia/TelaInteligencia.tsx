/**
 * I3 · Inteligência explicada (CV-DEM-001, seção 6): "O que os silos não estão
 * vendo?". Slide 13 do CV-APR-001.
 *
 * O grafo em 3D sobre o mapa do DF, em três etapas (chamados → ligações →
 * incidentes), a fila de insights e o insight explicado, que uma pessoa
 * confirma ou descarta. Sala de comando, só que limpa: fundo sem imagem, tom
 * neutro em tudo, cor só no que está aberto ou pede atenção. Tudo SIMULADO.
 */
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { limiarDaSensibilidade, SENSIBILIDADE_PADRAO } from '../../inteligencia/agrupamento';
import { decisaoDe, type Decisoes, type MotivoDeDescarte } from '../../inteligencia/decisoes';
import { cancelar, confirmar, descartar, desfazer, reiniciar, useInteligencia } from '../../inteligencia/estado';
import { camadasDoGrafo, camadasVivas, chegadosAte, chegadosPorIncidente, COR_DA_SEVERIDADE, type Etapa, ETAPAS, type Onda, prepararGrafo, zoomDoIncidente } from '../../mapa/camadas/grafo';
import { BarraDoTempo, HORAS_DA_BARRA } from './BarraDoTempo';
import { Mapa } from '../../mapa/Mapa';
import { type Destino, reduzMovimento } from '../../mapa/vista';
import { parametrosDoHash } from '../../navegacao';
import { Painel } from '../../ui/Painel';
import { useTema } from '../../ui/tema';
import { resumir } from '../../inteligencia/resumo';
import { agruparJuntos, chamadosJuntos, ligacoesJuntas } from '../../inteligencia/juntos';
import { ehReal } from '../../inteligencia/reais';
import { PainelDeInsights } from './Painel';
import { Fila, Insight, LegendaDasAreas, PorOrgao } from './partes';

const CLICAVEIS = ['grafo-colunas', 'grafo-colunas-de-bairro', 'grafo-nos', 'grafo-chamados'] as const;
const DF: Destino = { tipo: 'df' };

/** `#/inteligencia?caso=apagao-planaltina` abre já no insight daquele caso; `?codigo=AC-01`, no incidente com esse código. */
const casoDoEndereco = () => parametrosDoHash().get('caso') || parametrosDoHash().get('codigo');

export function TelaInteligencia() {
  // ------------------------------------------------ o motor
  // As duas fontes juntas: a cidade simulada (o DF inteiro) e os relatos reais de Águas Claras.
  // Cada uma é ligada e agrupada pela sua regra; só a fila é comum (`inteligencia/juntos.ts`).
  const tudo = useMemo(chamadosJuntos, []);
  const chamados = tudo.chamados;
  const ligacoes = useMemo(() => ligacoesJuntas(tudo), [tudo]);
  const [sens, setSens] = useState(SENSIBILIDADE_PADRAO);
  const resultado = useMemo(() => agruparJuntos(tudo, ligacoes, limiarDaSensibilidade(sens)), [tudo, ligacoes, sens]);
  const base = useMemo(() => prepararGrafo(chamados, resultado), [chamados, resultado]);
  // Os incidentes reais são de bairro: a coluna deles é menor.
  const pequenos = useMemo(() => new Set(resultado.incidentes.flatMap((i, k) => (ehReal(i) ? [k] : []))), [resultado]);

  // ------------------------------------------------ o que a pessoa vê e decide
  const pedido = useMemo(casoDoEndereco, []);
  // Abre no painel; quem chega por um link de caso vai direto ao grafo, no insight.
  const [vista, setVista] = useState<'painel' | 'grafo'>(() => (pedido || parametrosDoHash().get('vista') === 'grafo' ? 'grafo' : 'painel'));
  const [etapa, setEtapa] = useState<Etapa>(pedido ? 2 : 0);
  const [aberto, setAberto] = useState(() => (pedido ? resultado.incidentes.findIndex((i) => i.casoId === pedido || i.codigo === pedido) : -1));
  // As decisões e o andamento ficam no estado comum: a sala e a gestão veem os mesmos incidentes.
  const estadoComum = useInteligencia();
  const decisoes = estadoComum.decisoes;
  const [agora, setAgora] = useState(() => Date.now());
  const [ondas, setOndas] = useState<Onda[]>([]);
  const [porOrgao, setPorOrgao] = useState(false);
  const [ajustes, setAjustes] = useState(false);
  const [filaAberta, setFilaAberta] = useState(true);
  const inc = aberto >= 0 ? resultado.incidentes[aberto] : undefined;

  const descartados = useMemo(() => new Set(resultado.incidentes.flatMap((i, k) => (decisaoDe(decisoes, i.codigo).situacao === 'descartado' ? [k] : []))), [resultado, decisoes]);

  const todosOsOrgaos = useMemo(() => [...new Set(chamados.map((c) => c.orgaoId))], [chamados]);
  const resumo = useMemo(() => resumir(resultado, decisoes), [resultado, decisoes]);

  // Mudar a sensibilidade refaz os grupos: as decisões e a seleção eram dos grupos antigos.
  const mudarSens = (v: number) => {
    setSens(v);
    setAberto(-1);
    reiniciar();
  };

  // Enquanto há envio na janela de cancelamento, o relógio da tela anda (a contagem regressiva).
  const enviando = Object.values(decisoes).some((d) => d.situacao === 'enviando');
  useEffect(() => {
    if (!enviando) return;
    const t = setInterval(() => setAgora(Date.now()), 200);
    return () => clearInterval(t);
  }, [enviando]);
  // Quando um envio vence a janela e os pedidos saem, o mapa solta a onda.
  const decisoesAntes = useRef<Decisoes>(decisoes);
  useEffect(() => {
    const antes = decisoesAntes.current;
    decisoesAntes.current = decisoes;
    const novos = resultado.incidentes.filter((i) => antes[i.codigo]?.situacao === 'enviando' && decisoes[i.codigo]?.situacao === 'confirmado');
    if (novos.length === 0) return;
    const t1 = Date.now();
    setOndas((o) => [...o.slice(-4), ...novos.map((i, k) => ({ id: t1 + k, centro: i.centro, cor: COR_DA_SEVERIDADE[i.severidade], em: performance.now() }))]);
  }, [decisoes, resultado]);

  // ------------------------------------------------ mapa
  const tema = useTema();
  // O tema entra na conta: as cores das camadas mudam com ele.
  // Voltar no tempo: `momento` vai de 0 (o começo da janela) a 1 (agora); `null` é agora, com tudo.
  const [momento, setMomento] = useState<number | null>(null);
  const [tocando, setTocando] = useState(false);
  // Com um insight aberto, a janela é a dele; sem, as últimas horas da cidade.
  const janelaDoTempo = useMemo((): [number, number] => {
    if (!inc) return [0, HORAS_DA_BARRA];
    const horas = inc.membros.map((m) => chamados[m]!.horas);
    const [min, max] = [Math.min(...horas), Math.max(...horas)];
    const folga = Math.max(0.5, (max - min) * 0.08);
    return [Math.max(0, min - folga), max + folga];
  }, [inc, chamados]);
  const corte = momento === null ? null : janelaDoTempo[1] - momento * (janelaDoTempo[1] - janelaDoTempo[0]);
  // Trocar de insight troca a janela: a barra volta para "agora".
  useEffect(() => {
    setMomento(null);
    setTocando(false);
  }, [aberto]);
  // Tocar: a janela inteira em 12 segundos, e para no fim.
  useEffect(() => {
    if (!tocando) return;
    let quadro = 0;
    let antes = performance.now();
    const passo = (t: number) => {
      const dt = t - antes;
      antes = t;
      setMomento((m) => {
        const novo = (m ?? 0) + dt / 12_000;
        if (novo < 1) return novo;
        setTocando(false);
        return null;
      });
      quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [tocando]);
  const alternarTempo = useCallback(() => {
    if (reduzMovimento()) return;
    setTocando((v) => {
      if (!v) setMomento((m) => (m === null ? 0 : m));
      return !v;
    });
  }, []);
  // Com um insight aberto, a conta é a dele; sem, a da cidade.
  const chegaramAteAqui = useMemo(() => (aberto >= 0 ? (chegadosPorIncidente(base, resultado, corte)[aberto]?.chamados ?? 0) : chegadosAte(base, corte)), [base, resultado, corte, aberto]);

  const estado = useMemo(() => ({ base, resultado, etapa, aberto, descartados, corte, pequenos }), [base, resultado, etapa, aberto, descartados, corte, pequenos, tema]);
  const camadas = useMemo(() => camadasDoGrafo(estado), [estado]);
  const animadas = useCallback((t: number) => camadasVivas(estado, ondas, t), [estado, ondas]);

  const paineis = useRef({ fila: filaAberta, insight: aberto >= 0 });
  paineis.current = { fila: filaAberta, insight: aberto >= 0 };
  const margens = useCallback((largura: number) => {
    if (largura < 1024) return { top: 120, bottom: 24, left: 16, right: 16 };
    return { top: 84, bottom: 48, left: paineis.current.fila ? 372 : 32, right: paineis.current.insight ? 452 : 32 };
  }, []);

  const [alvo, setAlvo] = useState<{ destino: Destino; chave: number; lento?: boolean }>();
  const voar = useCallback((destino: Destino) => setAlvo((a) => ({ destino, chave: (a?.chave ?? 0) + 1 })), []);
  const abertoAntes = useRef<number | null>(null);
  useEffect(() => {
    if (abertoAntes.current === aberto) return;
    const primeira = abertoAntes.current === null;
    if (primeira && aberto < 0) {
      abertoAntes.current = aberto;
      return;
    }
    // Depois que as margens mudam (o painel do insight abre ou fecha). Na abertura, depois do mapa carregar.
    const t = setTimeout(() => {
      abertoAntes.current = aberto;
      voar(inc ? { tipo: 'vista', vista: { centro: inc.centro, zoom: zoomDoIncidente(inc), inclinacao: 55, rotacao: -14 } } : DF);
    }, primeira ? 3200 : 0);
    return () => clearTimeout(t);
  }, [aberto, inc, voar]);

  const abrir = useCallback((k: number) => setAberto((a) => (a === k ? a : k)), []);
  const fechar = useCallback(() => {
    setAberto(-1);
    setPorOrgao(false);
  }, []);
  const aoClicarObjeto = useCallback(
    (camada: string, objeto: unknown) => {
      if (camada === 'grafo-colunas' || camada === 'grafo-colunas-de-bairro' || camada === 'grafo-nos') abrir((objeto as { k: number }).k);
      else {
        const g = resultado.grupo[(objeto as { i: number }).i] ?? -1;
        if (g >= 0) abrir(g);
      }
    },
    [abrir, resultado],
  );

  // ------------------------------------------------ decisões
  const aoConfirmar = useCallback(() => {
    if (!inc) return;
    const t = Date.now();
    setAgora(t);
    confirmar(inc, t);
  }, [inc]);
  const aoCancelar = () => inc && cancelar(inc.codigo, Date.now());
  const aoDescartar = (m: MotivoDeDescarte) => inc && descartar(inc, m, Date.now());
  const aoDesfazer = () => inc && desfazer(inc.codigo, Date.now());

  // ------------------------------------------------ teclas
  const atalhos = useRef({ aberto, total: resultado.incidentes.length, aoConfirmar, fechar, alternarTempo, vista });
  atalhos.current = { aberto, total: resultado.incidentes.length, aoConfirmar, fechar, alternarTempo, vista };
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.metaKey || e.ctrlKey || e.altKey) return;
      const a = atalhos.current;
      if (e.key === '1' || e.key === '2' || e.key === '3') setEtapa((Number(e.key) - 1) as Etapa);
      else if (e.key === ' ' && a.vista === 'grafo' && !(e.target instanceof HTMLButtonElement)) {
        e.preventDefault();
        a.alternarTempo();
      } else if (e.key.toLowerCase() === 'p') setVista('painel');
      else if (e.key.toLowerCase() === 'g') setVista('grafo');
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setAberto(Math.min(a.total - 1, a.aberto + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setAberto(Math.max(0, a.aberto - 1));
      } else if (e.key === 'Enter' && a.aberto >= 0 && !(e.target instanceof HTMLButtonElement)) a.aoConfirmar();
      else if (e.key === 'Escape') a.fechar();
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, []);

  return (
    <main className="relative h-full overflow-hidden">
      {vista === 'grafo' ? (
        <Mapa margens={margens} camadas={camadas} animadas={animadas} alvo={alvo} semImagem dicaDasRas={false} clicaveis={CLICAVEIS} aoClicarObjeto={aoClicarObjeto} />
      ) : (
        <PainelDeInsights resultado={resultado} resumo={resumo} estado={estadoComum} decisaoDe={(c) => decisaoDe(decisoes, c)} aberto={aberto} aoAbrir={abrir} comInsight={Boolean(inc)} />
      )}

      {/* No alto: painel ou grafo e, no grafo, as três etapas. */}
      <div className="absolute top-3 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 lg:flex">
        <div role="group" aria-label="Como ver" className="flex rounded-lg border border-linha bg-painel p-0.5">
          {(['painel', 'grafo'] as const).map((v) => (
            <button key={v} type="button" aria-pressed={v === vista} onClick={() => setVista(v)} title={v === 'painel' ? 'Os insights em cartões (tecla P)' : 'Os chamados no mapa (tecla G)'} className={`condensado rounded-md px-3 py-1.5 text-rotulo ${v === vista ? 'bg-acento text-white' : 'text-texto-2 hover:text-tinta'}`}>
              {v === 'painel' ? 'Painel' : 'Grafo'}
            </button>
          ))}
        </div>
        <ol className={`rounded-lg border border-linha bg-painel p-0.5 ${vista === 'grafo' ? 'flex' : 'hidden'}`} aria-label="Etapas">
          {ETAPAS.map((e, k) => (
            <li key={e.nome}>
              <button type="button" onClick={() => setEtapa(k as Etapa)} aria-current={k === etapa ? 'step' : undefined} title={`${e.dica} (tecla ${k + 1})`} className={`condensado flex items-center gap-2 rounded-md px-3 py-1.5 text-rotulo ${k === etapa ? 'bg-realce text-tinta' : 'text-texto-2 hover:text-tinta'}`}>
                <span className={`grid size-4 place-items-center rounded-full text-micro ${k <= etapa ? 'bg-acento text-white' : 'bg-realce text-texto-2'}`}>{k + 1}</span>
                {e.nome}
              </button>
            </li>
          ))}
        </ol>
        <button type="button" onClick={() => setPorOrgao((v) => !v)} disabled={!inc} aria-pressed={porOrgao} title="A mesma leitura, sem o mapa: fila por fila" className={`condensado rounded-lg border border-linha px-3 py-2 text-rotulo disabled:opacity-35 ${vista === 'grafo' ? '' : 'hidden'} ${porOrgao ? 'bg-realce text-tinta' : 'bg-painel text-texto-2 hover:text-tinta'}`}>
          Por órgão
        </button>
        <div className="relative">
          <button type="button" onClick={() => setAjustes((v) => !v)} aria-expanded={ajustes} className={`condensado rounded-lg border border-linha px-3 py-2 text-rotulo ${ajustes ? 'bg-realce text-tinta' : 'bg-painel text-texto-2 hover:text-tinta'}`}>
            Sensibilidade
          </button>
          {ajustes && (
            <Painel className="absolute top-full right-0 mt-2 w-72 p-4">
              <label className="block text-nota text-texto" htmlFor="sensibilidade">
                Quão fácil a IA liga dois chamados
              </label>
              <input id="sensibilidade" type="range" min={10} max={95} step={5} value={sens} onChange={(e) => mudarSens(Number(e.target.value))} className="mt-2 w-full accent-acento" />
              <p className="flex justify-between text-micro text-texto-2">
                <span>Rígida: junta menos</span>
                <span>Solta: junta mais</span>
              </p>
              <p className="mt-2 text-rotulo text-texto-2">Se a IA juntar o que não devia, a pessoa descarta: nada é enviado sem confirmação.</p>
            </Painel>
          )}
        </div>
      </div>

      <div className={`absolute bottom-3 left-1/2 z-10 hidden w-[min(34rem,calc(100vw-56rem))] min-w-80 -translate-x-1/2 ${vista === 'grafo' ? 'lg:block' : ''}`}>
        <BarraDoTempo
          momento={momento}
          tocando={tocando}
          janela={janelaDoTempo}
          corte={corte}
          chegaram={chegaramAteAqui}
          total={inc ? inc.chamados : resultado.total}
          doInsight={inc ? inc.codigo : null}
          aoMudar={(m) => {
            setTocando(false);
            setMomento(m >= 0.999 ? null : m);
          }}
          aoAlternar={alternarTempo}
          dica={`${etapa + 1} de 3 · ${ETAPAS[etapa]!.dica}`}
        />
      </div>

      {vista === 'grafo' && (
        <div className={`absolute bottom-10 z-10 hidden max-w-md rounded bg-base/85 px-3 py-1.5 empty:hidden lg:block ${filaAberta ? 'left-[24.5rem]' : 'left-8'}`}>
          <LegendaDasAreas orgaos={todosOsOrgaos} />
        </div>
      )}
      <div className={`intel-coluna intel-esquerda ${filaAberta ? '' : 'intel-recolhida'} ${vista === 'grafo' ? '' : 'hidden!'}`}>
        <Fila resultado={resultado} aberto={aberto} decisaoDe={(c) => decisaoDe(decisoes, c)} aoAbrir={abrir} />
      </div>
      <button
        type="button"
        onClick={() => {
          setFilaAberta((v) => !v);
          setTimeout(() => !inc && voar(DF), 0);
        }}
        aria-label={filaAberta ? 'Recolher a fila de insights' : 'Mostrar a fila de insights'}
        className={`absolute top-1/2 z-20 hidden h-12 w-5 -translate-y-1/2 place-items-center rounded-r border border-l-0 border-linha bg-painel text-texto-2 hover:text-tinta ${vista === 'grafo' ? 'lg:grid' : ''} ${filaAberta ? 'left-[23rem]' : 'left-0'}`}
      >
        {filaAberta ? '‹' : '›'}
      </button>

      {/* O insight entra pela direita e sai por onde veio; ao trocar, só o conteúdo se refaz. */}
      <AnimatePresence>
        {inc && (
        <motion.div key="insight" className="intel-coluna intel-direita" initial={reduzMovimento() ? false : { x: 48, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={reduzMovimento() ? undefined : { x: 48, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }} transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}>
          <Insight key={inc.codigo} inc={inc} decisao={decisaoDe(decisoes, inc.codigo)} agora={agora} aoConfirmar={aoConfirmar} aoCancelar={aoCancelar} aoDescartar={aoDescartar} aoDesfazer={aoDesfazer} aoFechar={fechar} aoVerNoGrafo={vista === 'painel' ? () => { setEtapa(2); setVista('grafo'); } : undefined} />
        </motion.div>
        )}
      </AnimatePresence>

      {inc && porOrgao && (
        <div className="absolute bottom-12 left-1/2 z-20 -translate-x-1/2">
          <PorOrgao inc={inc} />
        </div>
      )}
    </main>
  );
}

import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// O worker e a fonte dos rótulos saem do próprio build: nada vem de CDN.
import urlWorker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import urlFonteRotulo from '@fontsource/barlow-condensed/files/barlow-condensed-latin-600-normal.woff2?url';
import { useEffect, useRef, useState } from 'react';
import type { Layer } from '@deck.gl/core';
import { MapLibreOverlay } from '@deck.gl/maplibre';
import { LIMITES_DF, REGIOES } from '../dominio/ras';
import { Painel } from '../ui/Painel';
import { dicaDoMapa } from './camadas';
import { CAMADA_RAS, FONTE_RAS, montarEstilo } from './estilo';
import { GRAUS_POR_SEGUNDO, INCLINACAO_INICIAL, reduzMovimento, ROTACAO_INICIAL, type Vista } from './vista';

if (!maplibregl.getWorkerUrl()) maplibregl.setWorkerUrl(urlWorker);

const [[OESTE, SUL], [LESTE, NORTE]] = LIMITES_DF;

interface Sobre {
  nome: string;
  codigo: string;
  x: number;
  y: number;
}

/** Camadas que mudam a cada quadro (os pulsos). `ativo` = ainda há movimento. */
export type Animadas = (t: number) => { camadas: Layer[]; ativo: boolean };

interface Props {
  /** Espaço que os painéis ocupam em volta do mapa, para o DF caber no que sobra. */
  margens: (largura: number) => maplibregl.PaddingOptions;
  /** Camadas deck.gl por cima do mapa. */
  camadas?: Layer[];
  /** Camadas redesenhadas a cada quadro enquanto estiverem ativas. */
  animadas?: Animadas;
  /** Órbita lenta em volta do centro (para o telão). */
  girando?: boolean;
  /** Para onde a câmera voa. Muda a `chave` para voar de novo. `vista: null` = o DF inteiro. */
  alvo?: { vista: Vista | null; chave: number };
  /** Alguém mexeu no mapa (arrastar, rolar, tocar, clicar): para a órbita e o tour. */
  aoInteragir?: () => void;
  /** Clique numa RA, nos modos em que as RAs ficam no chão. */
  aoClicarRa?: (id: string) => void;
  /** Sem painéis em volta (telão, tour): o DF inteiro chega mais perto. */
  telaCheia?: boolean;
  /** O nome da RA sob o mouse (desligado quando a camada 3D já diz o nome). */
  dicaDasRas?: boolean;
  raSelecionada?: string | null;
  className?: string;
}

/**
 * O DF inteiro, inclinado. O enquadramento é calculado como se a câmera olhasse
 * de cima; inclinada, o lado de perto alarga e encostaria nos painéis. Por isso
 * a câmera recua um pouco.
 */
const APROXIMAR_INCLINADO = -0.12;
/** Sem painéis em volta (telão, tour), a cidade pode chegar mais perto. */
const APROXIMAR_TELA_CHEIA = 0.45;

function enquadrarDf(mapa: maplibregl.Map, padding: maplibregl.PaddingOptions, duration: number, telaCheia: boolean) {
  const cam = mapa.cameraForBounds(LIMITES_DF, { padding, bearing: ROTACAO_INICIAL });
  if (cam?.zoom === undefined) return;
  // Centro do DF no centro da área livre (o `padding` vai junto, como nos outros voos).
  const centro: [number, number] = [(OESTE + LESTE) / 2, (SUL + NORTE) / 2];
  mapa.easeTo({ center: centro, zoom: cam.zoom + (telaCheia ? APROXIMAR_TELA_CHEIA : APROXIMAR_INCLINADO), pitch: INCLINACAO_INICIAL, bearing: ROTACAO_INICIAL, padding, duration, essential: true });
}

/** O mapa do DF em tela cheia, com as 37 RAs, inclinado e com câmera livre. */
export function Mapa({ margens, camadas = [], animadas, girando = false, alvo, aoInteragir, aoClicarRa, dicaDasRas = true, raSelecionada = null, telaCheia = false, className = '' }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [semMapa, setSemMapa] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [sobre, setSobre] = useState<Sobre | null>(null);
  const mapaRef = useRef<maplibregl.Map | null>(null);
  const overlay = useRef<MapLibreOverlay | null>(null);
  const voando = useRef(false);
  // Props lidas dentro dos eventos do MapLibre, que são ligados uma vez só.
  const props = useRef({ camadas, aoInteragir, aoClicarRa, dicaDasRas, telaCheia });
  props.current = { camadas, aoInteragir, aoClicarRa, dicaDasRas, telaCheia };

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const enquadre = () => ({ padding: margens(el.clientWidth) });

    let mapa: maplibregl.Map;
    try {
      mapa = new maplibregl.Map({
        container: el,
        style: montarEstilo({ regioes: REGIOES, urlFonteRotulo: new URL(urlFonteRotulo, document.baseURI).href }),
        bounds: LIMITES_DF,
        fitBoundsOptions: enquadre(),
        // Folga larga em volta do DF: apertada, ela impede o enquadramento em tela em pé.
        maxBounds: [
          [OESTE - 1.5, SUL - 1.5],
          [LESTE + 1.5, NORTE + 1.5],
        ],
        minZoom: 7.5,
        maxZoom: 17,
        maxPitch: 70,
        attributionControl: { compact: true },
      });
    } catch {
      // Sem WebGL2 o MapLibre não abre. O resto da tela continua.
      setSemMapa(true);
      return;
    }

    // Sem rede, o desenho da cidade falha a cada bloco pedido: avisa uma vez e segue.
    let avisou = false;
    mapa.on('error', (e) => {
      if (!avisou) console.warn('Mapa: o desenho da cidade não carregou; seguem o fundo e as RAs.', e.error?.message ?? '');
      avisou = true;
    });

    // Enquanto ninguém mexer no mapa, ele se reenquadra quando a janela muda de tamanho.
    let mexeu = false;
    const interagiu = () => {
      mexeu = true;
      props.current.aoInteragir?.();
    };
    for (const ev of ['mousedown', 'wheel', 'touchstart'] as const) mapa.on(ev, interagiu);
    mapa.on('resize', () => {
      if (!mexeu) enquadrarDf(mapa, enquadre().padding, 0, props.current.telaCheia);
    });
    mapa.on('moveend', () => {
      voando.current = false;
    });

    let idSobre: string | undefined;
    const soltar = () => {
      if (idSobre !== undefined) mapa.setFeatureState({ source: FONTE_RAS, id: idSobre }, { sobre: false });
      idSobre = undefined;
      setSobre(null);
    };
    mapa.on('mousemove', CAMADA_RAS, (e) => {
      const ra = e.features?.[0];
      if (!ra || !props.current.dicaDasRas) return soltar();
      const id = String(ra.id);
      if (id !== idSobre) {
        soltar();
        idSobre = id;
        mapa.setFeatureState({ source: FONTE_RAS, id }, { sobre: true });
      }
      setSobre({ nome: String(ra.properties.nome), codigo: String(ra.properties.codigo), x: e.point.x, y: e.point.y });
    });
    mapa.on('mouseleave', CAMADA_RAS, soltar);
    mapa.on('click', (e) => {
      if (props.current.dicaDasRas) {
        // RAs no chão: o MapLibre sabe qual está sob o clique.
        const ra = mapa.queryRenderedFeatures(e.point, { layers: [CAMADA_RAS] })[0];
        if (ra) props.current.aoClicarRa?.(String(ra.id));
        return;
      }
      // RAs em 3D: quem sabe qual bloco está sob o clique é o deck.gl (o topo de uma
      // RA alta fica, na tela, sobre o chão de outra). No modo intercalado, o clique
      // não chega ao onClick das camadas; por isso a pergunta é feita aqui.
      const info = overlay.current?.pickObject({ x: e.point.x, y: e.point.y, radius: 2, layerIds: ['regioes'] });
      const id = (info?.object as { id?: unknown } | undefined)?.id;
      if (typeof id === 'string') props.current.aoClicarRa?.(id);
    });

    // deck.gl intercalado: as camadas entram na pilha do MapLibre e dividem o mesmo WebGL2.
    mapaRef.current = mapa;
    mapa.on('load', () => {
      const deck = new MapLibreOverlay({ interleaved: true, layers: props.current.camadas, getTooltip: dicaDoMapa });
      mapa.addControl(deck);
      overlay.current = deck;
      setPronto(true);
      // A abertura: o DF de cima inclina devagar até a vista de sala de comando.
      voando.current = true;
      enquadrarDf(mapa, enquadre().padding, reduzMovimento() ? 0 : 2600, props.current.telaCheia);
    });

    return () => {
      overlay.current = null;
      mapaRef.current = null;
      setPronto(false);
      mapa.remove();
    };
  }, [margens]);

  // Camadas (e, se houver, os pulsos e a órbita): um quadro por vez, só enquanto há movimento.
  useEffect(() => {
    if (!pronto) return;
    const parado = reduzMovimento();
    let quadro = 0;
    let anterior = performance.now();
    const desenhar = (t: number) => {
      const a = parado ? animadas?.(Number.POSITIVE_INFINITY) : animadas?.(t);
      overlay.current?.setProps({ layers: a ? [...camadas, ...a.camadas] : camadas });
      const mapa = mapaRef.current;
      const gira = girando && !parado;
      if (gira && mapa && !voando.current) mapa.setBearing(mapa.getBearing() + ((t - anterior) / 1000) * GRAUS_POR_SEGUNDO);
      anterior = t;
      if (gira || a?.ativo) quadro = requestAnimationFrame(desenhar);
    };
    quadro = requestAnimationFrame(desenhar);
    return () => cancelAnimationFrame(quadro);
  }, [pronto, camadas, animadas, girando]);

  // Voo da câmera (tour, RA escolhida, volta ao DF).
  const chave = alvo?.chave;
  useEffect(() => {
    const mapa = mapaRef.current;
    const el = container.current;
    if (!pronto || !mapa || !el || !alvo) return;
    const duration = reduzMovimento() ? 0 : 3200;
    voando.current = true;
    if (alvo.vista === null) {
      enquadrarDf(mapa, margens(el.clientWidth), duration, props.current.telaCheia);
    } else {
      const v = alvo.vista;
      mapa.flyTo({ center: v.centro, zoom: v.zoom, pitch: v.inclinacao, bearing: v.rotacao, padding: margens(el.clientWidth), duration, essential: true });
    }
    // Só quando a chave muda: as margens e o alvo do momento valem para esse voo.
  }, [pronto, chave]);

  // A RA escolhida ganha contorno claro no chão.
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!pronto || !mapa) return;
    for (const r of REGIOES) mapa.setFeatureState({ source: FONTE_RAS, id: r.id }, { selecionada: r.id === raSelecionada });
  }, [pronto, raSelecionada]);

  return (
    <div className={`absolute inset-0 bg-navy ${className}`}>
      {/* Altura explícita: o CSS do MapLibre põe `position: relative` no contêiner. */}
      <div ref={container} className="h-full w-full" />
      {sobre && (
        <Painel className="pointer-events-none absolute z-10 px-3 py-2 whitespace-nowrap" style={{ left: sobre.x + 16, top: sobre.y + 16 }}>
          <p className="condensado text-[11px] text-teal-claro">{sobre.codigo}</p>
          <p className="text-sm font-medium text-white">{sobre.nome}</p>
        </Painel>
      )}
      {semMapa && (
        <div className="absolute inset-0 grid place-items-center p-6">
          <Painel className="max-w-sm p-5 text-sm">
            <p className="font-semibold text-white">O mapa não abriu neste navegador</p>
            <p className="mt-1">Ele precisa de WebGL2. Tente outro navegador ou ative a aceleração gráfica.</p>
          </Painel>
        </div>
      )}
    </div>
  );
}

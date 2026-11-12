import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// O worker e a fonte dos rótulos saem do próprio build: nada vem de CDN.
import urlWorker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import urlFonteRotulo from '@fontsource/barlow-condensed/files/barlow-condensed-latin-600-normal.woff2?url';
import { useEffect, useRef, useState } from 'react';
import type { Layer } from '@deck.gl/core';
import { MapLibreOverlay } from '@deck.gl/maplibre';
import type { Incidente } from '../dominio/incidente';
import { LIMITES_DF, REGIAO_POR_ID, REGIOES } from '../dominio/ras';
import { Painel } from '../ui/Painel';
import { agregar, CAMADA_CALOR, diferenca, diferencaVazia, FONTE_CALOR, type Grade, intensidadePorZoom, novaGrade, paraGeoJSON } from './calor';
import { dicaDoMapa } from './camadas';
import { CAMADA_RAS, FONTE_RAS, montarEstilo, semImagens } from './estilo';
import { carregadorDeOrtofoto, PROTOCOLO_ORTOFOTO } from './ortofoto';
import {
  caixaDaRa,
  type Destino,
  DURACAO_DO_VOO,
  DURACAO_DO_VOO_NO_TOUR,
  girar,
  GRAUS_POR_SEGUNDO,
  INCLINACAO_INICIAL,
  reduzMovimento,
  ROTACAO_INICIAL,
  ZOOM_MAXIMO_DA_RA,
} from './vista';

if (!maplibregl.getWorkerUrl()) maplibregl.setWorkerUrl(urlWorker);
// A imagem de perto (IDE/DF) entra por um protocolo próprio, com fila e novas tentativas.
maplibregl.addProtocol(PROTOCOLO_ORTOFOTO, carregadorDeOrtofoto());

const [[OESTE, SUL], [LESTE, NORTE]] = LIMITES_DF;

interface Sobre {
  nome: string;
  codigo: string;
  x: number;
  y: number;
}

/** Camadas que mudam a cada quadro (o anel de quem chega). `ativo` = ainda há movimento. */
export type Animadas = (t: number) => { camadas: Layer[]; ativo: boolean };

interface Props {
  /** Espaço que os painéis ocupam em volta do mapa, para o DF caber no que sobra. */
  margens: (largura: number) => maplibregl.PaddingOptions;
  /** Camadas deck.gl por cima do mapa. */
  camadas?: Layer[];
  /** Camadas redesenhadas a cada quadro enquanto estiverem ativas. */
  animadas?: Animadas;
  /** Os chamados do mapa de calor (já filtrados). `null` = sem calor, nos outros modos. */
  calor?: readonly Incidente[] | null;
  /** Órbita lenta em volta do centro (só o tour liga). */
  orbitando?: boolean;
  /** Modo girar: arrastar gira e inclina o mapa, em vez de mover. */
  girarComArrasto?: boolean;
  /** Para onde a câmera voa. Muda a `chave` para voar de novo. `lento` = voo de apresentação (tour). */
  alvo?: { destino: Destino; chave: number; lento?: boolean };
  /** Alguém mexeu no mapa (arrastar, rolar, tocar, clicar): para a órbita e o tour. */
  aoInteragir?: () => void;
  /** Clique numa RA. */
  aoClicarRa?: (id: string) => void;
  /** Clique em qualquer ponto do mapa, em [lon, lat] (a jornada usa no lugar do pino do WhatsApp). */
  aoClicarPonto?: (ponto: [number, number]) => void;
  /** Clique num objeto de uma destas camadas deck.gl (ids). Tem prioridade sobre o clique na RA. */
  clicaveis?: readonly string[];
  aoClicarObjeto?: (camada: string, objeto: unknown) => void;
  /** Fundo grafite, sem imagem de satélite, prédios nem nomes de vias. Vale ao criar o mapa. */
  semImagem?: boolean;
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
/** Ao enquadrar uma RA com a câmera inclinada, o mesmo recuo, um pouco maior. */
const RECUAR_NA_RA = 0.3;

// `absolutePadding`: as margens valem como estão. Sem isso, o MapLibre as soma às
// que o mapa já tem, e o enquadramento encolhia a cada volta ao DF.

function enquadrarDf(mapa: maplibregl.Map, padding: maplibregl.PaddingOptions, duration: number, telaCheia: boolean) {
  const cam = mapa.cameraForBounds(LIMITES_DF, { padding, bearing: ROTACAO_INICIAL, absolutePadding: true });
  if (cam?.zoom === undefined) return;
  // Centro do DF no centro da área livre (o `padding` vai junto, como nos outros voos).
  const centro: [number, number] = [(OESTE + LESTE) / 2, (SUL + NORTE) / 2];
  mapa.easeTo({ center: centro, zoom: cam.zoom + (telaCheia ? APROXIMAR_TELA_CHEIA : APROXIMAR_INCLINADO), pitch: INCLINACAO_INICIAL, bearing: ROTACAO_INICIAL, padding, duration, essential: true });
}

/** Enquadra a RA pelos limites dela, sem mexer no ângulo que a pessoa escolheu. */
function enquadrarRa(mapa: maplibregl.Map, raId: string, padding: maplibregl.PaddingOptions, duration: number) {
  const ra = REGIAO_POR_ID[raId];
  if (!ra) return;
  const bearing = mapa.getBearing();
  const pitch = mapa.getPitch();
  const cam = mapa.cameraForBounds(caixaDaRa(ra), { padding, bearing, absolutePadding: true, maxZoom: ZOOM_MAXIMO_DA_RA });
  if (cam?.zoom === undefined || !cam.center) return;
  mapa.easeTo({ center: cam.center, zoom: cam.zoom - (pitch > 30 ? RECUAR_NA_RA : 0), pitch, bearing, padding, duration, essential: true });
}

interface EstadoDoCalor {
  /** Duas grades que se revezam: a que está no mapa e a que recebe a próxima agregação. */
  grades: [Grade, Grade];
  noMapa: 0 | 1;
  ligado: boolean;
  /** Total de chamados quando a escala de cor foi calibrada. */
  calibradoCom: number;
}

/** O mapa do DF em tela cheia, com as 37 RAs, inclinado e com câmera livre. */
export function Mapa({
  margens,
  camadas = [],
  animadas,
  calor = null,
  orbitando = false,
  girarComArrasto = false,
  alvo,
  aoInteragir,
  aoClicarRa,
  aoClicarPonto,
  clicaveis,
  aoClicarObjeto,
  semImagem = false,
  dicaDasRas = true,
  raSelecionada = null,
  telaCheia = false,
  className = '',
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [semMapa, setSemMapa] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [sobre, setSobre] = useState<Sobre | null>(null);
  const mapaRef = useRef<maplibregl.Map | null>(null);
  const overlay = useRef<MapLibreOverlay | null>(null);
  const voando = useRef(false);
  const estadoDoCalor = useRef<EstadoDoCalor | null>(null);
  // Props lidas dentro dos eventos do MapLibre, que são ligados uma vez só.
  const props = useRef({ camadas, aoInteragir, aoClicarRa, aoClicarPonto, clicaveis, aoClicarObjeto, dicaDasRas, telaCheia });
  props.current = { camadas, aoInteragir, aoClicarRa, aoClicarPonto, clicaveis, aoClicarObjeto, dicaDasRas, telaCheia };

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    const enquadre = () => ({ padding: margens(el.clientWidth) });

    const estiloBase = () => montarEstilo({ regioes: REGIOES, urlFonteRotulo: new URL(urlFonteRotulo, document.baseURI).href });
    let mapa: maplibregl.Map;
    try {
      mapa = new maplibregl.Map({
        container: el,
        style: semImagem ? semImagens(estiloBase()) : estiloBase(),
        bounds: LIMITES_DF,
        fitBoundsOptions: enquadre(),
        // Folga larga em volta do DF: apertada, ela impede o enquadramento em tela em pé.
        maxBounds: [
          [OESTE - 1.5, SUL - 1.5],
          [LESTE + 1.5, NORTE + 1.5],
        ],
        minZoom: 7.5,
        maxZoom: 18,
        maxPitch: 70,
        attributionControl: { compact: true },
      });
    } catch {
      // Sem WebGL2 o MapLibre não abre. O resto da tela continua.
      setSemMapa(true);
      return;
    }

    // Aproximar, afastar e a bússola: clicar nela volta ao norte, visto de cima; arrastá-la gira.
    mapa.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

    // Sem rede, a imagem e o desenho da cidade falham a cada bloco pedido: avisa uma vez e segue.
    let avisou = false;
    mapa.on('error', (e) => {
      if (!avisou) console.warn('Mapa: parte da imagem ou do desenho da cidade não carregou; seguem o fundo, as RAs e os dados.', e.error?.message ?? '');
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

    // Uma dica por vez: quando o deck.gl mostra a dele (um ponto, um hexágono), o nome da RA sai.
    let dicaDoDeck = false;
    let idSobre: string | undefined;
    const soltar = () => {
      if (idSobre !== undefined) mapa.setFeatureState({ source: FONTE_RAS, id: idSobre }, { sobre: false });
      idSobre = undefined;
      setSobre(null);
    };
    mapa.on('mousemove', CAMADA_RAS, (e) => {
      const ra = e.features?.[0];
      // Com o mapa em movimento (arrastar, girar, voar), a dica só atrapalha.
      if (!ra || !props.current.dicaDasRas || mapa.isMoving() || dicaDoDeck) return soltar();
      const id = String(ra.id);
      if (id !== idSobre) {
        soltar();
        idSobre = id;
        mapa.setFeatureState({ source: FONTE_RAS, id }, { sobre: true });
      }
      setSobre({ nome: String(ra.properties.nome), codigo: String(ra.properties.codigo), x: e.point.x, y: e.point.y });
    });
    mapa.on('mouseleave', CAMADA_RAS, soltar);
    mapa.on('movestart', soltar);
    mapa.on('click', (e) => {
      props.current.aoClicarPonto?.([e.lngLat.lng, e.lngLat.lat]);
      // Objetos do deck.gl que a tela quer clicáveis (incidentes, chamados): vêm antes da RA.
      const ids = props.current.clicaveis;
      if (ids?.length) {
        const alvo = overlay.current?.pickObject({ x: e.point.x, y: e.point.y, radius: 6, layerIds: [...ids] });
        if (alvo?.object && alvo.layer) {
          props.current.aoClicarObjeto?.(alvo.layer.id, alvo.object);
          return;
        }
      }
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
      const deck = new MapLibreOverlay({
        interleaved: true,
        layers: props.current.camadas,
        getTooltip: (info) => {
          const dica = dicaDoMapa(info);
          dicaDoDeck = dica !== null;
          if (dica) soltar();
          return dica;
        },
      });
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
      estadoDoCalor.current = null;
      setPronto(false);
      mapa.remove();
    };
  }, [margens, semImagem]);

  // Camadas (e, se houver, o anel de quem chega e a órbita): um quadro por vez, só enquanto há movimento.
  useEffect(() => {
    if (!pronto) return;
    const parado = reduzMovimento();
    let quadro = 0;
    let anterior = performance.now();
    const desenhar = (t: number) => {
      const a = parado ? animadas?.(Number.POSITIVE_INFINITY) : animadas?.(t);
      overlay.current?.setProps({ layers: a ? [...camadas, ...a.camadas] : camadas });
      const mapa = mapaRef.current;
      const gira = orbitando && !parado;
      if (gira && mapa && !voando.current) mapa.setBearing(mapa.getBearing() + ((t - anterior) / 1000) * GRAUS_POR_SEGUNDO);
      anterior = t;
      if (gira || a?.ativo) quadro = requestAnimationFrame(desenhar);
    };
    quadro = requestAnimationFrame(desenhar);
    return () => cancelAnimationFrame(quadro);
  }, [pronto, camadas, animadas, orbitando]);

  // Mapa de calor: agrega os chamados em células e manda ao MapLibre só o que mudou.
  useEffect(() => {
    const mapa = mapaRef.current;
    const fonte = mapa?.getSource<maplibregl.GeoJSONSource>(FONTE_CALOR);
    if (!pronto || !mapa || !fonte) return;
    const e = (estadoDoCalor.current ??= { grades: [novaGrade(), novaGrade()], noMapa: 0, ligado: false, calibradoCom: -1 });
    if (!calor) {
      if (e.ligado) mapa.setLayoutProperty(CAMADA_CALOR, 'visibility', 'none');
      e.ligado = false;
      return;
    }
    const outra = e.noMapa === 0 ? 1 : 0;
    const antes = e.grades[e.noMapa];
    const depois = agregar(calor, e.grades[outra]);
    // Só há o que comparar se o que está no mapa é a agregação anterior.
    const mudou = e.ligado ? diferenca(antes, depois) : null;
    if (mudou) {
      if (!diferencaVazia(mudou)) void fonte.updateData(mudou);
    } else fonte.setData(paraGeoJSON(depois));
    e.noMapa = outra;
    // A escala de cor é da seleção: recalibra numa troca de filtro, ou quando as chegadas já pesam (1,5%).
    if (!mudou || Math.abs(depois.total - e.calibradoCom) > e.calibradoCom * 0.015) {
      mapa.setPaintProperty(CAMADA_CALOR, 'heatmap-intensity', intensidadePorZoom(depois) as maplibregl.ExpressionSpecification);
      e.calibradoCom = depois.total;
    }
    if (!e.ligado) mapa.setLayoutProperty(CAMADA_CALOR, 'visibility', 'visible');
    e.ligado = true;
  }, [pronto, calor]);

  // Modo girar: arrastar com o botão principal (ou um dedo) gira e inclina, em volta do centro da área livre.
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!pronto || !mapa || !girarComArrasto) return;
    const el = mapa.getCanvasContainer();
    const toque = el.style.touchAction;
    mapa.dragPan.disable();
    el.style.touchAction = 'none';
    let inicio: { x: number; y: number; rotacao: number; inclinacao: number } | null = null;
    let pendente: { bearing: number; pitch: number } | null = null;
    let quadro = 0;
    // Um ajuste de câmera por quadro, por mais eventos que o mouse mande.
    const aplicar = () => {
      quadro = 0;
      if (pendente) mapa.jumpTo(pendente);
      pendente = null;
    };
    const baixar = (ev: PointerEvent) => {
      if (ev.button !== 0 || ev.ctrlKey || !ev.isPrimary) return;
      mapa.stop();
      inicio = { x: ev.clientX, y: ev.clientY, rotacao: mapa.getBearing(), inclinacao: mapa.getPitch() };
      el.setPointerCapture(ev.pointerId);
      el.classList.add('arrastando');
    };
    const mover = (ev: PointerEvent) => {
      if (!inicio) return;
      const g = girar(inicio, ev.clientX - inicio.x, ev.clientY - inicio.y, mapa.getMaxPitch());
      pendente = { bearing: g.rotacao, pitch: g.inclinacao };
      quadro ||= requestAnimationFrame(aplicar);
    };
    const levantar = (ev: PointerEvent) => {
      if (!inicio) return;
      inicio = null;
      el.classList.remove('arrastando');
      if (el.hasPointerCapture(ev.pointerId)) el.releasePointerCapture(ev.pointerId);
    };
    el.addEventListener('pointerdown', baixar);
    el.addEventListener('pointermove', mover);
    el.addEventListener('pointerup', levantar);
    el.addEventListener('pointercancel', levantar);
    return () => {
      el.removeEventListener('pointerdown', baixar);
      el.removeEventListener('pointermove', mover);
      el.removeEventListener('pointerup', levantar);
      el.removeEventListener('pointercancel', levantar);
      cancelAnimationFrame(quadro);
      el.classList.remove('arrastando');
      el.style.touchAction = toque;
      mapa.dragPan.enable();
    };
  }, [pronto, girarComArrasto]);

  // Voo da câmera (RA escolhida, volta ao DF, tour).
  const chave = alvo?.chave;
  useEffect(() => {
    const mapa = mapaRef.current;
    const el = container.current;
    if (!pronto || !mapa || !el || !alvo) return;
    const padding = margens(el.clientWidth);
    const duration = reduzMovimento() ? 0 : alvo.lento ? DURACAO_DO_VOO_NO_TOUR : DURACAO_DO_VOO;
    const d = alvo.destino;
    voando.current = true;
    if (d.tipo === 'df') enquadrarDf(mapa, padding, duration, props.current.telaCheia);
    else if (d.tipo === 'ra') enquadrarRa(mapa, d.ra, padding, duration);
    else mapa.flyTo({ center: d.vista.centro, zoom: d.vista.zoom, pitch: d.vista.inclinacao, bearing: d.vista.rotacao, padding, duration, essential: true });
    // Só quando a chave muda: as margens e o alvo do momento valem para esse voo.
  }, [pronto, chave]);

  // A RA escolhida ganha contorno claro no chão.
  useEffect(() => {
    const mapa = mapaRef.current;
    if (!pronto || !mapa) return;
    for (const r of REGIOES) mapa.setFeatureState({ source: FONTE_RAS, id: r.id }, { selecionada: r.id === raSelecionada });
  }, [pronto, raSelecionada]);

  return (
    <div className={`absolute inset-0 bg-base ${girarComArrasto ? 'modo-girar' : ''} ${className}`}>
      {/* Altura explícita: o CSS do MapLibre põe `position: relative` no contêiner. */}
      <div ref={container} className="h-full w-full" />
      {sobre && (
        <Painel className="pointer-events-none absolute z-10 px-3 py-2 whitespace-nowrap" style={{ left: sobre.x + 16, top: sobre.y + 16 }}>
          <p className="condensado text-rotulo text-texto-2">{sobre.codigo}</p>
          <p className="text-corpo font-medium text-white">{sobre.nome}</p>
        </Painel>
      )}
      {semMapa && (
        <div className="absolute inset-0 grid place-items-center p-6">
          <Painel className="max-w-sm p-5 text-corpo">
            <p className="font-semibold text-white">O mapa não abriu neste navegador</p>
            <p className="mt-1">Ele precisa de WebGL2. Tente outro navegador ou ative a aceleração gráfica.</p>
          </Painel>
        </div>
      )}
    </div>
  );
}

import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
// O worker e a fonte dos rótulos saem do próprio build: nada vem de CDN.
import urlWorker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import urlFonteRotulo from '@fontsource/barlow-condensed/files/barlow-condensed-latin-600-normal.woff2?url';
import { useEffect, useRef, useState } from 'react';
import { LIMITES_DF, REGIOES } from '../dominio/ras';
import { Painel } from '../ui/Painel';
import { CAMADA_RAS, FONTE_RAS, montarEstilo } from './estilo';

if (!maplibregl.getWorkerUrl()) maplibregl.setWorkerUrl(urlWorker);

const [[OESTE, SUL], [LESTE, NORTE]] = LIMITES_DF;

interface Sobre {
  nome: string;
  codigo: string;
  x: number;
  y: number;
}

interface Props {
  /** Espaço que os painéis ocupam em volta do mapa, para o DF caber no que sobra. */
  margens: (largura: number) => maplibregl.PaddingOptions;
}

/** O mapa do DF em tela cheia, com as 37 RAs. */
export function Mapa({ margens }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [semMapa, setSemMapa] = useState(false);
  const [sobre, setSobre] = useState<Sobre | null>(null);

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
        maxZoom: 16,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        attributionControl: { compact: true },
      });
    } catch {
      // Sem WebGL2 o MapLibre não abre. O resto da tela continua.
      setSemMapa(true);
      return;
    }
    mapa.touchZoomRotate.disableRotation();
    mapa.keyboard.disableRotation();

    // Sem rede, o desenho da cidade falha a cada bloco pedido: avisa uma vez e segue.
    let avisou = false;
    mapa.on('error', (e) => {
      if (!avisou) console.warn('Mapa: o desenho da cidade não carregou; seguem o fundo e as RAs.', e.error?.message ?? '');
      avisou = true;
    });

    // Enquanto ninguém mexer no mapa, ele se reenquadra quando a janela muda de tamanho.
    let mexeu = false;
    mapa.on('movestart', (e) => {
      if (e.originalEvent) mexeu = true;
    });
    mapa.on('resize', () => {
      if (!mexeu) mapa.fitBounds(LIMITES_DF, { ...enquadre(), duration: 0 });
    });

    let idSobre: string | undefined;
    const soltar = () => {
      if (idSobre !== undefined) mapa.setFeatureState({ source: FONTE_RAS, id: idSobre }, { sobre: false });
      idSobre = undefined;
      setSobre(null);
    };
    mapa.on('mousemove', CAMADA_RAS, (e) => {
      const ra = e.features?.[0];
      if (!ra) return;
      const id = String(ra.id);
      if (id !== idSobre) {
        soltar();
        idSobre = id;
        mapa.setFeatureState({ source: FONTE_RAS, id }, { sobre: true });
      }
      setSobre({ nome: String(ra.properties.nome), codigo: String(ra.properties.codigo), x: e.point.x, y: e.point.y });
    });
    mapa.on('mouseleave', CAMADA_RAS, soltar);

    return () => mapa.remove();
  }, [margens]);

  return (
    <div className="absolute inset-0 bg-navy">
      {/* Altura explícita: o CSS do MapLibre põe `position: relative` no contêiner. */}
      <div ref={container} className="h-full w-full" />
      {sobre && (
        <Painel
          className="pointer-events-none absolute z-10 px-3 py-2 whitespace-nowrap"
          style={{ left: sobre.x + 16, top: sobre.y + 16 }}
        >
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

import { useEffect, useRef, useState } from 'react';
import { Map as MapaLibre, AttributionControl, setWorkerUrl, type ExpressionSpecification, type GeoJSONSource, type MapLayerMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import urlDoWorker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';

// O MapLibre roda o processamento do mapa num worker. O Vite muda o caminho dele ao empacotar,
// então o endereço é informado explicitamente (o arquivo vai junto no build: funciona sem internet).
setWorkerUrl(urlDoWorker);
import { lerPaleta, aoMudarTema, NUM_AREAS, type Paleta } from '@ds';
import ras from './ras.geo.json';
import type { Chamado } from '../dados/dados';

// Mapa do DF: limites oficiais das RAs (IDE/DF) e os chamados de exemplo, nas cores do tema.
// Sem fonte externa de tiles: funciona sem internet. O fundo é transparente, o da página aparece por baixo.

function limites(): [[number, number], [number, number]] {
  let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
  for (const f of (ras as GeoJSON.FeatureCollection).features) {
    const g = f.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;
    const polis = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    for (const p of polis) for (const [x, y] of p[0]) { a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); }
  }
  return [[a, b], [c, d]];
}

const corPorArea = (p: Paleta): ExpressionSpecification =>
  ['match', ['get', 'area'], ...Array.from({ length: NUM_AREAS }, (_, i) => [i, p.areas[i]]).flat(), p.tinta2] as unknown as ExpressionSpecification;

export function Mapa({ chamados, folga }: { chamados: Chamado[]; folga: { esquerda: number; direita: number; topo: number } }) {
  const caixa = useRef<HTMLDivElement>(null);
  const mapa = useRef<MapaLibre | null>(null);
  const [dica, setDica] = useState<{ x: number; y: number; nome: string } | null>(null);

  // cria o mapa uma vez
  useEffect(() => {
    const p = lerPaleta();
    const m = new MapaLibre({
      container: caixa.current!,
      style: { version: 8, sources: {}, layers: [] },
      bounds: limites(),
      fitBoundsOptions: { padding: { left: folga.esquerda, right: folga.direita, top: folga.topo, bottom: 40 } },
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
    });
    mapa.current = m;
    // crédito no canto inferior esquerdo, longe do painel lateral
    m.addControl(new AttributionControl({ compact: true, customAttribution: 'Limites das RAs: IDE/DF' }), 'bottom-left');
    m.on('load', () => {
      m.addSource('ras', { type: 'geojson', data: ras as GeoJSON.FeatureCollection, promoteId: 'codigo' });
      m.addLayer({ id: 'ras-preench', type: 'fill', source: 'ras', paint: { 'fill-color': p.acento, 'fill-opacity': ['case', ['boolean', ['feature-state', 'sobre'], false], 0.16, 0.03] } });
      m.addLayer({ id: 'ras-linha', type: 'line', source: 'ras', paint: { 'line-color': p.traco, 'line-width': 1.1 } });
      m.addSource('chamados', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
      m.addLayer({
        id: 'chamados', type: 'circle', source: 'chamados',
        paint: {
          'circle-color': corPorArea(p),
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 9, 3, 13, 7],
          'circle-stroke-color': p.fundo, 'circle-stroke-width': 1,
          'circle-opacity': 0.92,
        },
      });
      atualizarChamados();
    });
    let sobre: string | number | undefined;
    m.on('mousemove', 'ras-preench', (e: MapLayerMouseEvent) => {
      const f = e.features?.[0];
      if (!f) return;
      if (sobre !== undefined && sobre !== f.id) m.setFeatureState({ source: 'ras', id: sobre }, { sobre: false });
      sobre = f.id;
      m.setFeatureState({ source: 'ras', id: sobre! }, { sobre: true });
      setDica({ x: e.point.x, y: e.point.y, nome: String(f.properties?.nome ?? '') });
    });
    m.on('mouseleave', 'ras-preench', () => {
      if (sobre !== undefined) m.setFeatureState({ source: 'ras', id: sobre }, { sobre: false });
      sobre = undefined;
      setDica(null);
    });

    // tema: relê os tokens e repinta
    const desliga = aoMudarTema(() => {
      const q = lerPaleta();
      if (!m.isStyleLoaded()) return;
      m.setPaintProperty('ras-preench', 'fill-color', q.acento);
      m.setPaintProperty('ras-linha', 'line-color', q.traco);
      m.setPaintProperty('chamados', 'circle-color', corPorArea(q));
      m.setPaintProperty('chamados', 'circle-stroke-color', q.fundo);
    });
    return () => { desliga(); m.remove(); mapa.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const atualizarChamados = () => {
    const m = mapa.current;
    const fonte = m?.getSource('chamados') as GeoJSONSource | undefined;
    fonte?.setData({
      type: 'FeatureCollection',
      features: chamados.map((c) => ({ type: 'Feature', properties: { area: c.area }, geometry: { type: 'Point', coordinates: [c.lon, c.lat] } })),
    });
  };
  useEffect(atualizarChamados, [chamados]);

  return (
    <div className="absolute inset-0">
      <div ref={caixa} className="h-full w-full" />
      {dica && (
        <div className="painel pointer-events-none absolute px-3 py-1.5 text-xs" style={{ left: dica.x + 14, top: dica.y + 14, borderRadius: 8 }}>
          {dica.nome}
        </div>
      )}
    </div>
  );
}

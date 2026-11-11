import { forwardRef } from 'react';
import mapa from '../mapa/ras.json';

type Props = {
  destaque?: string; // código da RA (ex.: RA-XX)
  pontos?: boolean;
  className?: string;
};

// Mapa do DF com os limites oficiais das RAs (IDE/DF), simplificados em scripts/gerar-mapa.mjs.
// O <g class="ras"> recebe o ref para animar zoom (GSAP).
export const MapaDF = forwardRef<SVGGElement, Props>(function MapaDF({ destaque, pontos, className }, ref) {
  return (
    <svg className={`mapa ${className ?? ''}`} viewBox={`0 0 ${mapa.largura} ${mapa.altura}`} role="img" aria-label="Mapa do Distrito Federal com as regiões administrativas">
      <g ref={ref} className="ras">
        {mapa.ras.map((r) => (
          <path key={r.codigo} d={r.d} pathLength={1} data-ra={r.codigo} className={`ra${r.codigo === destaque ? ' destaque' : ''}`}>
            <title>{r.nome}</title>
          </path>
        ))}
        {pontos &&
          mapa.pontos.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.2} className="ponto" fill="var(--ponto)" />)}
      </g>
    </svg>
  );
});

export const dadosMapa = mapa;

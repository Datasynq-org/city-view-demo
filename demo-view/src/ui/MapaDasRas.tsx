import { useMemo } from 'react';
import { LIMITES_DF, REGIOES } from '../dominio/ras';
import { classe, quebras } from '../indicadores/regioes';

/**
 * O DF em cores, por região administrativa: um mapa plano e leve, em SVG, para
 * comparar as 37 RAs. Limites oficiais (IDE/DF), simplificados. A escala é por
 * quantis, e a legenda diz o que cada cor vale: a cor nunca vem sozinha.
 */

const [[OESTE, SUL], [LESTE, NORTE]] = LIMITES_DF;
const ACHATAR = Math.cos((((SUL + NORTE) / 2) * Math.PI) / 180);
const LARGURA = 1000;
const ESCALA = LARGURA / ((LESTE - OESTE) * ACHATAR);
const ALTURA = (NORTE - SUL) * ESCALA;
const px = ([lon, lat]: number[]) => `${(((lon ?? 0) - OESTE) * ACHATAR * ESCALA).toFixed(1)} ${((NORTE - (lat ?? 0)) * ESCALA).toFixed(1)}`;

/** O desenho de cada RA, calculado uma vez. */
const DESENHOS = REGIOES.map((r) => {
  const poligonos = r.geometria.type === 'Polygon' ? [r.geometria.coordinates] : r.geometria.coordinates;
  const d = poligonos.map((p) => p.map((anel) => `M${anel.map(px).join('L')}Z`).join('')).join('');
  const [x, y] = px(r.rotulo).split(' ').map(Number) as [number, number];
  return { id: r.id, nome: r.nome, d, x, y };
});

/** Do pouco ao muito: tons neutros que clareiam, para a seleção e os alertas ficarem com a cor. */
export const TONS = ['#23282d', '#39424a', '#566470', '#7b8b98', '#a9b8c4', '#dfe7ee'];

export function MapaDasRas({ valores, selecionada, aoEscolher, formato, rotulo, tons = TONS, invertida = false, className = '' }: {
  /** Valor de cada RA. Quem não está aqui (ou vem `null`) fica sem cor. */
  valores: ReadonlyMap<string, number | null>;
  selecionada?: string | null;
  aoEscolher?: (ra: string) => void;
  formato: (v: number) => string;
  /** O que a cor mede, para a legenda e o leitor de tela. */
  rotulo: string;
  tons?: string[];
  /** Quando menos é pior (% no prazo): o tom mais claro vai para os menores. */
  invertida?: boolean;
  className?: string;
}) {
  const { limites, cor } = useMemo(() => {
    const limites = quebras([...valores.values()].filter((v): v is number => v !== null), tons.length);
    const cor = (v: number | null | undefined) => {
      if (v === null || v === undefined) return 'transparent';
      const c = classe(v, limites);
      return tons[invertida ? tons.length - 1 - c : c]!;
    };
    return { limites, cor };
  }, [valores, tons, invertida]);

  return (
    <figure className={className}>
      <svg viewBox={`0 0 ${LARGURA} ${ALTURA.toFixed(0)}`} className="block h-auto w-full" role="group" aria-label={`Mapa das regiões administrativas: ${rotulo}`}>
        {DESENHOS.map((r) => {
          const v = valores.get(r.id);
          const ativa = r.id === selecionada;
          return (
            <path
              key={r.id}
              d={r.d}
              fill={cor(v)}
              fillRule="evenodd"
              stroke={ativa ? 'var(--color-acento-claro)' : 'var(--color-base)'}
              strokeWidth={ativa ? 4 : 1.2}
              vectorEffect="non-scaling-stroke"
              className={aoEscolher ? 'cursor-pointer outline-none hover:brightness-125 focus-visible:brightness-150' : ''}
              tabIndex={aoEscolher ? 0 : undefined}
              role={aoEscolher ? 'button' : undefined}
              aria-pressed={aoEscolher ? ativa : undefined}
              aria-label={`${r.nome}: ${v === null || v === undefined ? 'sem dado' : formato(v)}`}
              onClick={() => aoEscolher?.(r.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  aoEscolher?.(r.id);
                }
              }}
            >
              <title>{`${r.nome}: ${v === null || v === undefined ? 'sem dado' : formato(v)}`}</title>
            </path>
          );
        })}
        {/* A selecionada por cima, para o contorno não ficar atrás das vizinhas. */}
        {DESENHOS.filter((r) => r.id === selecionada).map((r) => (
          <path key={r.id} d={r.d} fill="none" fillRule="evenodd" stroke="var(--color-acento-claro)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" pointerEvents="none" />
        ))}
      </svg>
      <figcaption className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-micro text-texto-2">
        <span>{rotulo}</span>
        <span className="flex items-center gap-1">
          {limites.length > 0 && <span>{invertida ? 'mais' : 'menos'}</span>}
          {tons.map((t) => (
            <span key={t} className="h-2 w-5" style={{ background: t }} />
          ))}
          {limites.length > 0 && <span>{invertida ? 'menos' : 'mais'}</span>}
        </span>
        {limites.length > 0 && (
          <span className="tabular-nums">
            faixas: {limites.map(formato).join(' · ')}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

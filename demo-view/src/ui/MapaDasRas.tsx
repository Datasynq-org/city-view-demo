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
  // O tamanho no desenho (a caixa do contorno), para saber onde cabe um rótulo.
  const pontos = poligonos.flatMap((p) => p[0] ?? []);
  const lons = pontos.map((c) => c[0] ?? 0);
  const lats = pontos.map((c) => c[1] ?? 0);
  const tamanho = (Math.max(...lons) - Math.min(...lons)) * (Math.max(...lats) - Math.min(...lats));
  return { id: r.id, nome: r.nome, d, x, y, tamanho };
});

/** As regiões em que cabe escrever o valor. */
const COM_ROTULO = new Set([...DESENHOS].sort((a, b) => b.tamanho - a.tamanho).slice(0, 16).map((r) => r.id));

/** Do pouco ao muito, numa cor só: a família quente do calor da sala (definida no CSS, por tema). A seleção fica com o acento, que é frio. */
export const TONS = [0, 1, 2, 3, 4, 5].map((k) => `var(--tom-${k})`);

export function MapaDasRas({ valores, selecionada, aoEscolher, formato, rotulo, tons = TONS, invertida = false, dominio, comValor = false, className = '' }: {
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
  /**
   * Escala fixa, de [mínimo, máximo], em faixas iguais. Sem isto a escala é por
   * quantis, que estica qualquer diferença: bom para ordenar, ruim quando todos
   * estão perto (CV-DEM-002, V6).
   */
  dominio?: [number, number];
  /** Escreve o valor nas regiões maiores. */
  comValor?: boolean;
  className?: string;
}) {
  const { limites, cor } = useMemo(() => {
    const limites = dominio ? Array.from({ length: tons.length - 1 }, (_, k) => dominio[0] + ((k + 1) * (dominio[1] - dominio[0])) / tons.length) : quebras([...valores.values()].filter((v): v is number => v !== null), tons.length);
    const cor = (v: number | null | undefined) => {
      if (v === null || v === undefined) return 'transparent';
      const c = classe(v, limites);
      return tons[invertida ? tons.length - 1 - c : c]!;
    };
    return { limites, cor };
  }, [valores, tons, invertida, dominio?.[0], dominio?.[1]]);

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
        {comValor &&
          DESENHOS.filter((r) => COM_ROTULO.has(r.id) && typeof valores.get(r.id) === 'number').map((r) => (
            <text key={r.id} x={r.x} y={r.y} textAnchor="middle" dominantBaseline="middle" fontSize="20" fontWeight="600" fill="var(--color-tinta)" stroke="var(--color-base)" strokeWidth="4" paintOrder="stroke" pointerEvents="none" aria-hidden="true">
              {formato(valores.get(r.id)!)}
            </text>
          ))}
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
            {dominio ? `escala fixa, de ${formato(dominio[0])} a ${formato(dominio[1])}` : `faixas: ${limites.map(formato).join(' · ')}`}
          </span>
        )}
      </figcaption>
    </figure>
  );
}

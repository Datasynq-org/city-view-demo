/**
 * Gráficos da demo, em SVG feito à mão: linha (com faixa e trecho previsto),
 * minilinha e barras. Decisão registrada no CV-DEM-001: sem biblioteca, porque
 * os gráficos são poucos e simples. Todos trazem um resumo em texto para
 * leitores de tela, e a cor nunca é a única pista.
 */

const L = 100;

interface Escala {
  min: number;
  max: number;
}

function escalaDe(valores: (number | null | undefined)[], desdeZero: boolean): Escala {
  const v = valores.filter((x): x is number => typeof x === 'number' && Number.isFinite(x));
  if (!v.length) return { min: 0, max: 1 };
  const max = Math.max(...v);
  const min = desdeZero ? 0 : Math.min(...v);
  const folga = (max - min) * 0.12 || Math.abs(max) * 0.1 || 1;
  return { min: desdeZero ? 0 : min - folga, max: max + folga };
}

/** Caminho SVG de uma série, pulando os buracos (`null`). */
function caminho(serie: (number | null)[], n: number, e: Escala, altura: number): string {
  const x = (k: number) => (n <= 1 ? L / 2 : (k / (n - 1)) * L);
  const y = (v: number) => altura - ((v - e.min) / (e.max - e.min || 1)) * altura;
  let d = '';
  let solto = true;
  serie.forEach((v, k) => {
    if (v === null || !Number.isFinite(v)) {
      solto = true;
      return;
    }
    d += `${solto ? 'M' : 'L'}${x(k).toFixed(2)} ${y(v).toFixed(2)} `;
    solto = false;
  });
  return d.trim();
}

export interface PropsDaLinha {
  /** O que aconteceu. `null` onde não há dado. */
  serie: (number | null)[];
  /** O que se prevê, alinhado com `serie` (mesmo tamanho): `null` no passado. */
  previsto?: (number | null)[];
  /** Margem em volta do previsto: [inferior, superior] ou `null`. */
  faixa?: ([number, number] | null)[];
  /** Uma segunda série, mais discreta (o período anterior, a média). */
  referencia?: (number | null)[];
  /** Um alvo, desenhado como linha horizontal, com o nome dito embaixo: a cor nunca vem sozinha. */
  meta?: { valor: number; rotulo: string };
  altura?: number;
  desdeZero?: boolean;
  /** Para o texto alternativo e para as marcas do eixo. */
  formato?: (v: number) => string;
  descricao: string;
  /** Rótulos do começo e do fim do eixo do tempo. */
  inicio?: string;
  fim?: string;
  className?: string;
}

/** Linha no tempo: cheia para o que aconteceu, tracejada para o previsto, faixa para a margem. */
export function Linha({ serie, previsto, faixa, referencia, meta, altura = 44, desdeZero = false, formato = (v) => String(Math.round(v)), descricao, inicio, fim, className = '' }: PropsDaLinha) {
  const n = serie.length;
  const todos = [...serie, ...(previsto ?? []), ...(referencia ?? []), ...(faixa ?? []).flatMap((f) => f ?? []), ...(meta ? [meta.valor] : [])];
  const e = escalaDe(todos, desdeZero);
  const x = (k: number) => (n <= 1 ? L / 2 : (k / (n - 1)) * L);
  const y = (v: number) => altura - ((v - e.min) / (e.max - e.min || 1)) * altura;
  const comFaixa = (faixa ?? []).map((f, k) => (f ? { k, f } : null)).filter((p): p is { k: number; f: [number, number] } => p !== null);
  const area = comFaixa.length > 1 ? `M${comFaixa.map((p) => `${x(p.k).toFixed(2)} ${y(p.f[1]).toFixed(2)}`).join(' L')} L${[...comFaixa].reverse().map((p) => `${x(p.k).toFixed(2)} ${y(p.f[0]).toFixed(2)}`).join(' L')} Z` : '';
  const reais = serie.filter((v): v is number => v !== null);
  return (
    <figure className={className}>
      <div className="flex gap-2">
        <div className="flex flex-col justify-between text-right text-micro text-texto-2 tabular-nums" aria-hidden="true">
          <span>{formato(e.max)}</span>
          <span>{formato(e.min)}</span>
        </div>
        <svg viewBox={`0 0 ${L} ${altura}`} preserveAspectRatio="none" className="block min-w-0 flex-1" style={{ height: `${altura * 2.6}px` }} role="img" aria-label={`${descricao}${reais.length ? `: de ${formato(Math.min(...reais))} a ${formato(Math.max(...reais))}` : ''}`}>
          <line x1="0" x2={L} y1={altura} y2={altura} stroke="var(--color-linha)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <line x1="0" x2={L} y1="0" y2="0" stroke="var(--color-linha)" strokeWidth="1" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />
          {area && <path d={area} fill="var(--color-acento)" opacity="0.16" />}
          {meta && <line x1="0" x2={L} y1={y(meta.valor)} y2={y(meta.valor)} stroke="var(--color-acento-claro)" strokeWidth="1.2" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />}
          {referencia && <path d={caminho(referencia, n, e, altura)} fill="none" stroke="var(--color-texto-2)" strokeOpacity="0.6" strokeWidth="1" strokeDasharray="1 3" vectorEffect="non-scaling-stroke" />}
          <path d={caminho(serie, n, e, altura)} fill="none" stroke="var(--color-tinta)" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          {previsto && <path d={caminho(previsto, n, e, altura)} fill="none" stroke="var(--color-acento-claro)" strokeWidth="1.6" strokeDasharray="4 3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
        </svg>
      </div>
      {(inicio || fim) && (
        <figcaption className="mt-1 flex justify-between pl-8 text-micro text-texto-2">
          <span>{inicio}</span>
          <span>{fim}</span>
        </figcaption>
      )}
      {meta && (
        <p className="mt-1 flex items-center gap-2 pl-8 text-micro text-texto-2">
          <i className="w-5 border-t border-dashed border-acento-claro" aria-hidden="true" />
          {meta.rotulo}
        </p>
      )}
    </figure>
  );
}

/** Linha pequena, sem eixos, para caber numa célula de tabela. */
export function Minilinha({ serie, descricao, className = 'h-5 w-20' }: { serie: number[]; descricao: string; className?: string }) {
  const e = escalaDe(serie, true);
  return (
    <svg viewBox={`0 0 ${L} 20`} preserveAspectRatio="none" className={`inline-block ${className}`} role="img" aria-label={descricao}>
      <path d={caminho(serie, serie.length, e, 20)} fill="none" stroke="var(--color-texto-2)" strokeWidth="1.3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Uma barra horizontal fina, de 0 a 1. `marca` desenha um traço de referência (a meta, a média). */
export function Barra({ valor, marca, destaque = false, className = '' }: { valor: number; marca?: number; destaque?: boolean; className?: string }) {
  const p = Math.min(1, Math.max(0, valor));
  return (
    <span className={`relative block h-1.5 rounded-full bg-realce ${className}`} aria-hidden="true">
      <span className={`block h-1.5 rounded-full ${destaque ? 'bg-acento-claro' : 'bg-texto-2'}`} style={{ width: `${p * 100}%` }} />
      {marca !== undefined && <span className="absolute -top-0.5 h-2.5 w-px bg-tinta" style={{ left: `${Math.min(1, Math.max(0, marca)) * 100}%` }} />}
    </span>
  );
}

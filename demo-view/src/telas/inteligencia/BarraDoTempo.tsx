/**
 * Voltar no tempo (CV-DEM-002, V8): uma barra de horas sob o grafo. Arrastar
 * (ou tocar) mostra os chamados na hora em que chegaram, as ligações surgindo
 * e o incidente se formando. Com um insight aberto, a janela é a dele.
 */
import { reduzMovimento } from '../../mapa/vista';

/** Sem insight aberto, a barra cobre as últimas horas da cidade. */
export const HORAS_DA_BARRA = 72;

const n = (v: number) => Math.round(v).toLocaleString('pt-BR');

/** "há 3 h", "há 2 dias": de quando é o momento mostrado. */
export function haHoras(h: number): string {
  if (h < 0.75) return 'agora';
  if (h < 48) return `há ${n(h)} h`;
  return `há ${n(h / 24)} dias`;
}

export function BarraDoTempo({ momento, tocando, janela, corte, chegaram, total, doInsight, aoMudar, aoAlternar, dica }: {
  /** De 0 (o começo da janela) a 1 (agora); `null` é agora, com tudo. */
  momento: number | null;
  tocando: boolean;
  /** A janela, em horas atrás: [a mais recente, a mais antiga]. */
  janela: [number, number];
  /** O momento mostrado, em horas atrás; `null` é agora. */
  corte: number | null;
  /** Chamados que já tinham chegado no momento mostrado, e o total. */
  chegaram: number;
  total: number;
  /** O código do insight aberto, quando a janela é a dele. */
  doInsight: string | null;
  aoMudar: (momento: number) => void;
  aoAlternar: () => void;
  /** A dica da etapa, que continua aqui. */
  dica: string;
}) {
  const parado = reduzMovimento();
  const voltado = momento !== null;
  return (
    <div className="painel-vidro px-3 py-2">
      <div className="flex items-center gap-3">
        {!parado && (
          <button type="button" onClick={aoAlternar} aria-pressed={tocando} title={tocando ? 'Pausar (Espaço)' : 'Ver se formando (Espaço)'} className="grid size-7 shrink-0 place-items-center rounded-full bg-acento text-white hover:bg-acento-claro hover:text-base">
            <svg viewBox="0 0 12 12" className="size-3" fill="currentColor" aria-hidden="true">
              {tocando ? <path d="M2 1h3v10H2zM7 1h3v10H7z" /> : <path d="M2.5 1 11 6l-8.500 5z" />}
            </svg>
            <span className="sr-only">{tocando ? 'Pausar' : 'Ver se formando'}</span>
          </button>
        )}
        <div className="min-w-0 flex-1">
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round((momento ?? 1) * 1000)}
            onChange={(e) => aoMudar(Number(e.target.value) / 1000)}
            aria-label={`Voltar no tempo${doInsight ? `, na janela do insight ${doInsight}` : ''}`}
            aria-valuetext={corte === null ? 'agora' : haHoras(corte)}
            className="block w-full accent-acento"
          />
          <div className="flex justify-between text-micro text-texto-2">
            <span>{haHoras(janela[1])}</span>
            <span className={voltado ? 'text-tinta' : ''}>
              {voltado && corte !== null ? `${haHoras(corte)} · ${n(chegaram)} de ${n(total)} chamados já tinham chegado` : doInsight ? `janela do ${doInsight} · ${n(total)} chamados` : 'agora · arraste para voltar no tempo'}
            </span>
            <span>{janela[0] < 0.75 ? 'agora' : haHoras(janela[0])}</span>
          </div>
        </div>
      </div>
      <p className="mt-1 text-center text-micro text-texto-2">{dica}</p>
    </div>
  );
}

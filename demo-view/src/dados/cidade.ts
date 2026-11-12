/**
 * A cidade simulada da visita: gerada uma vez, e a mesma para todas as telas.
 * Quem vai da sala à gestão vê os mesmos chamados. O relógio "ao vivo" é só da
 * sala (`indicadores/relogio.ts`); as outras telas leem o retrato de quando a
 * página abriu.
 */
import type { Incidente, Instante } from '../dominio/incidente';
import { ADIANTE_MS, separarFila } from '../indicadores/relogio';
import { type BaseSimulada, gerarBase } from './gerador';

export interface Cidade {
  /** Quando a página abriu: o "agora" das telas que não andam ao vivo. */
  inicio: Instante;
  base: BaseSimulada;
  /** O que já tinha chegado até `inicio`, com a situação daquele instante. */
  chegados: Incidente[];
  /** O que a sala ainda vai receber, na ordem. */
  fila: Incidente[];
}

let atual: Cidade | null = null;

export function cidade(): Cidade {
  if (!atual) {
    const inicio = Date.now();
    const base = gerarBase({ agora: inicio + ADIANTE_MS });
    atual = { inicio, base, ...separarFila(base.incidentes, inicio) };
  }
  return atual;
}

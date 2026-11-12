/**
 * O relógio da demo: faz o "chegando agora" andar na frente de quem assiste.
 *
 * A cidade é gerada algumas horas à frente do relógio (`ADIANTE_MS`). Ao abrir,
 * vale o que já aconteceu até agora; o resto vira uma fila. A cada poucos
 * segundos o próximo da fila chega, carimbado como "recebido agora". Tudo
 * SIMULADO, como o resto da base.
 */
import type { Incidente, Instante } from '../dominio/incidente';

/** Quanto a base é gerada à frente do relógio: o tamanho da fila. */
export const ADIANTE_MS = 4 * 3_600_000;

/** Intervalo entre duas chegadas, em ms: entre 3,5 e 7 segundos. */
export const intervaloDeChegada = (sorte: number) => 3500 + sorte * 3500;

/**
 * O que já chegou até `agora` e a fila do que ainda vai chegar (na ordem).
 * Quem chegou antes mas só seria encaminhado ou resolvido depois de `agora`
 * volta ao passo em que estaria agora.
 */
export function separarFila(incidentes: readonly Incidente[], agora: Instante): { chegados: Incidente[]; fila: Incidente[] } {
  const chegados: Incidente[] = [];
  const fila: Incidente[] = [];
  for (const i of incidentes) {
    if (i.criadoEm > agora) fila.push(i);
    else chegados.push(noInstante(i, agora));
  }
  return { chegados, fila };
}

function noInstante(i: Incidente, agora: Instante): Incidente {
  if (i.resolvidoEm !== undefined && i.resolvidoEm > agora) {
    const { resolvidoEm: _r, ...resto } = i;
    return noInstante({ ...resto, situacao: 'em-atendimento' }, agora);
  }
  if (i.encaminhadoEm !== undefined && i.encaminhadoEm > agora) {
    const { encaminhadoEm: _e, ...resto } = i;
    return { ...resto, situacao: 'em-triagem' };
  }
  return i;
}

/** O incidente que chega agora: recebido, sem encaminhamento nem resolução. */
export function receber(i: Incidente, agora: Instante): Incidente {
  const { encaminhadoEm: _e, resolvidoEm: _r, ...resto } = i;
  return { ...resto, situacao: 'recebido', criadoEm: agora };
}

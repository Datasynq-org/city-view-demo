/**
 * Os incidentes sugeridos pela inteligência, com a sensibilidade padrão,
 * calculados uma vez: é o que a sala e o resumo mostram. São os mesmos da tela
 * da Inteligência (que refaz a conta quando alguém mexe na sensibilidade): a
 * cidade simulada e os relatos reais de Águas Claras, numa fila só.
 */
import type { Incidente } from './agrupamento';
import { resultadoPadrao } from './juntos';

/** Do mais urgente ao menos, como na fila da inteligência. */
export const incidentesSugeridos = (): Incidente[] => resultadoPadrao().incidentes;

/** O endereço que abre o incidente na Inteligência: pelo caso, ou pelo código quando não há caso (os reais). */
export const enderecoDoIncidente = (i: Pick<Incidente, 'casoId' | 'codigo'>) => `#/inteligencia?${i.casoId ? `caso=${i.casoId}` : `codigo=${i.codigo}`}`;

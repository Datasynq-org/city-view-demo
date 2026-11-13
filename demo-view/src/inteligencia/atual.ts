/**
 * Os incidentes sugeridos pela inteligência, com a sensibilidade padrão,
 * calculados uma vez: é o que a sala mostra em "pede atenção agora". A tela da
 * inteligência faz a mesma conta (e a refaz quando alguém mexe na sensibilidade).
 */
import { agrupar, calcularLigacoes, gerarChamados, type Incidente, limiarDaSensibilidade, SENSIBILIDADE_PADRAO } from './agrupamento';

let guardado: Incidente[] | null = null;

/** Do mais urgente ao menos, como na fila da inteligência. */
export function incidentesSugeridos(): Incidente[] {
  if (!guardado) {
    const chamados = gerarChamados();
    guardado = agrupar(chamados, calcularLigacoes(chamados), limiarDaSensibilidade(SENSIBILIDADE_PADRAO)).incidentes;
  }
  return guardado;
}

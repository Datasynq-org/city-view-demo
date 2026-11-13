/**
 * Metas dos indicadores (CV-DEM-002, V2): um número sem alvo não diz se está
 * bom. As metas daqui são **de exemplo**, da equipe, só para a demo mostrar
 * como fica; as reais vêm da gestão (cartas de serviço, contratos de concessão)
 * e são pergunta em aberto para o Daniel.
 */

/** Parte dos chamados resolvida dentro do prazo do tipo, de 0 a 1. */
export const META_NO_PRAZO = 0.8;

export const NOTA_DA_META = 'meta de exemplo';

/** Distância até a meta, em pontos percentuais: positivo é acima dela. */
export const pontosDaMeta = (noPrazo: number | null, meta = META_NO_PRAZO) => (noPrazo === null ? null : Math.round((noPrazo - meta) * 100));

export function contraAMeta(noPrazo: number | null, meta = META_NO_PRAZO): string {
  const p = pontosDaMeta(noPrazo, meta);
  if (p === null) return 'sem dado para comparar com a meta';
  const alvo = `${Math.round(meta * 100)}%`;
  if (p === 0) return `na meta de ${alvo}`;
  return `${Math.abs(p)} ponto${Math.abs(p) === 1 ? '' : 's'} ${p > 0 ? 'acima' : 'abaixo'} da meta de ${alvo}`;
}

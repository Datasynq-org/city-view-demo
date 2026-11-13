/**
 * De onde vem cada número (CV-DEM-002, A1): que sistemas o alimentariam, em que
 * pé está a ligação com cada um, e o que ele é hoje, na demo. Um número que
 * não sabe dizer de onde veio não se sustenta numa sala.
 *
 * Lê o catálogo de conectores (`conectores.ts`), sem inventar integração: quase
 * tudo é proposta, e a demo inteira roda sobre dados simulados.
 */
import { CONECTORES } from './conectores';
import { type AreaId, ORGAO_POR_ID } from './orgaos';
import type { SituacaoPeca } from './ponte';

export interface Fonte {
  sistema: string;
  dono: string;
  situacao: SituacaoPeca;
}

export interface Recorte {
  area?: AreaId | null;
  orgaoId?: string | null;
  /** O número usa a operação dos órgãos (rede, serviço, sistema), não só os chamados. */
  operacao?: boolean;
}

/** Os sistemas de onde o número viria, no recorte: os do órgão ou da área, mais os portais gerais. */
export function fontesDe(r: Recorte = {}): Fonte[] {
  return CONECTORES.filter((c) => {
    if (r.operacao && !c.operacao) return false;
    if (!r.operacao && !c.demandas) return false;
    if (r.orgaoId) return c.orgaoId === r.orgaoId;
    // Os portais gerais (sem órgão) recebem demanda de qualquer área.
    if (r.area) return c.orgaoId ? ORGAO_POR_ID[c.orgaoId]?.area === r.area : !r.operacao;
    return true;
  }).map((c) => ({ sistema: c.sistema, dono: c.dono, situacao: c.situacao }));
}

/** Quantas fontes em cada situação: o resumo que cabe numa linha. */
export function contarFontes(fontes: readonly Fonte[]): { ligadas: number; propostas: number } {
  const ligadas = fontes.filter((f) => f.situacao === 'existe' || f.situacao === 'pronto').length;
  return { ligadas, propostas: fontes.length - ligadas };
}

export const O_QUE_E_HOJE = 'Nesta demonstração, o número é calculado no navegador sobre uma cidade simulada. Nenhum sistema do governo foi consultado.';

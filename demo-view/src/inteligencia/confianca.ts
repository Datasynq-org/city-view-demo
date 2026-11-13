/**
 * A "confiança" de um insight em palavras (CV-DEM-002, D1). O número que o
 * agrupamento calcula é uma **nota de semelhança** (quão parecidos são os
 * chamados em assunto, lugar e hora, mais um termo de volume), não a
 * probabilidade de a IA estar certa: nada na demo mede isso. Dita como "83%",
 * lê-se como probabilidade. Por isso vira faixa, e o lastro de verdade é o
 * registro de decisões (quantas sugestões foram confirmadas ou descartadas).
 */
export type Faixa = 'alta' | 'média' | 'baixa';

export const LIMITE_DA_ALTA = 0.8;
export const LIMITE_DA_MEDIA = 0.65;

export const faixaDaConfianca = (nota: number): Faixa => (nota >= LIMITE_DA_ALTA ? 'alta' : nota >= LIMITE_DA_MEDIA ? 'média' : 'baixa');

export const ROTULO_DA_FAIXA: Record<Faixa, string> = { alta: 'Alta', média: 'Média', baixa: 'Baixa' };

export const O_QUE_E_A_NOTA = 'Nota de semelhança entre os chamados, de 0 a 100. Não é a chance de a IA estar certa: isso só o registro de decisões mostra.';

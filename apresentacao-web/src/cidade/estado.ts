// Estado visual da "cidade viva" (o canvas de fundo). As cenas animam estes campos com a rolagem.
export type Estado = {
  aparecer: number; // 0..1 opacidade geral dos pontos
  silos: number; // 0 = no mapa · 1 = separados em colunas por área
  conexoes: number; // 0..1 linhas entre chamados de áreas diferentes
  foco: number; // -1 sem foco · 0..2 índice do caso de inteligência
  zoom: number; // 0..1 aproximação do caso em foco
  agrupar: number; // 0..1 os chamados do caso se juntam num incidente
  calor: number; // 0..1 mapa de calor
  area: number; // índice da área filtrada (gestores)
  filtro: number; // 0..1 força do filtro por área
  status: number; // 0 = cor por área · 1 = cor por situação
  grau: number; // 1..3 quantos níveis de situação aparecem (cidadão)
  apagar: number; // 0..1 escurece a cidade (cenas de texto)
};

export const BASE: Estado = { aparecer: 1, silos: 0, conexoes: 0, foco: -1, zoom: 0, agrupar: 0, calor: 0, area: -1, filtro: 0, status: 0, grau: 3, apagar: 0 };

export const estado: Estado = { ...BASE, aparecer: 0 };

/**
 * O que acabou de chegar: os três chamados mais recentes da lista "chegando
 * agora", marcados no mapa com um ponto teal (a cor do "ao vivo"), e um anel
 * que se abre e some no instante em que cada um chega.
 *
 * Tudo em pixels, e não em metros: de perto, um ponto de 110 m de raio virava
 * uma bola branca do tamanho de um quarteirão, sem dizer o que era. O ponto
 * mais novo é o mais forte; os dois anteriores vão apagando. Passar o mouse
 * diz o que chegou, e a legenda explica o ponto.
 *
 * Calmo por padrão, vivo quando importa (magno 10.1): só o anel se mexe, e só
 * por um instante.
 */
import type { Layer } from '@deck.gl/core';
import { ScatterplotLayer } from '@deck.gl/layers';
import { CORES, rgb } from '../../ui/tokens';
import { NA_PILHA, SEMPRE_POR_CIMA } from './pilha';

export interface Chegada {
  id: string;
  posicao: [number, number];
  /** `performance.now()` de quando chegou. */
  em: number;
  /** O que chegou e onde, para a dica ("Falta de energia · Ceilândia"). */
  rotulo?: string;
}

/** Quanto dura o anel, em ms. */
export const DURACAO_ANEL = 1800;
/** Quantas chegadas ficam marcadas no mapa. */
export const MARCADAS = 3;
/** Opacidade do ponto, da mais nova à mais antiga das marcadas. */
const OPACIDADE = [255, 150, 85];

/** 0 → 1 ao longo do anel (desacelera no fim). */
export const progressoDoAnel = (t: number, em: number) => {
  const p = Math.min(1, Math.max(0, (t - em) / DURACAO_ANEL));
  return 1 - Math.pow(1 - p, 3);
};

export const anelAtivo = (t: number, c: Chegada) => t - c.em < DURACAO_ANEL;

const TEAL = rgb(CORES.acentoClaro);
const BASE = rgb(CORES.base);

/** `t` = `performance.now()` do quadro. */
export function camadasDePulsos(chegadas: readonly Chegada[], t: number): Layer[] {
  if (!chegadas.length) return [];
  // Da mais nova à mais antiga.
  const marcadas = chegadas.slice(-MARCADAS).reverse();
  const ordem = new Map(marcadas.map((c, k) => [c.id, k]));
  const aneis = marcadas.filter((c) => anelAtivo(t, c));
  return [
    new ScatterplotLayer<Chegada>({
      id: 'chegadas',
      data: marcadas,
      getPosition: (c) => c.posicao,
      radiusUnits: 'pixels',
      getRadius: 4.5,
      getFillColor: (c) => [...TEAL, OPACIDADE[ordem.get(c.id) ?? 0] ?? 85],
      stroked: true,
      lineWidthUnits: 'pixels',
      getLineWidth: 1.5,
      getLineColor: (c) => [...BASE, OPACIDADE[ordem.get(c.id) ?? 0] ?? 85],
      pickable: true,
      updateTriggers: { getFillColor: marcadas.map((c) => c.id).join(), getLineColor: marcadas.map((c) => c.id).join() },
      ...SEMPRE_POR_CIMA,
      ...NA_PILHA,
    }),
    new ScatterplotLayer<Chegada>({
      id: 'chegadas-anel',
      data: aneis,
      getPosition: (c) => c.posicao,
      radiusUnits: 'pixels',
      getRadius: (c) => 6 + progressoDoAnel(t, c.em) * 30,
      filled: false,
      stroked: true,
      lineWidthUnits: 'pixels',
      getLineWidth: 2,
      getLineColor: (c) => [...TEAL, Math.round(255 * (1 - progressoDoAnel(t, c.em)))],
      updateTriggers: { getRadius: t, getLineColor: t },
      ...SEMPRE_POR_CIMA,
      ...NA_PILHA,
    }),
  ];
}

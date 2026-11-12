/**
 * O que acabou de chegar: um anel que se abre e some, e um ponto com brilho
 * enquanto o chamado está na lista "chegando agora". Calmo por padrão, vivo
 * quando importa (magno 10.1): só o anel se mexe, e só por um instante.
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
}

/** Quanto dura o anel, em ms. */
export const DURACAO_ANEL = 1800;

/** 0 → 1 ao longo do anel (desacelera no fim). */
export const progressoDoAnel = (t: number, em: number) => {
  const p = Math.min(1, Math.max(0, (t - em) / DURACAO_ANEL));
  return 1 - Math.pow(1 - p, 3);
};

export const anelAtivo = (t: number, c: Chegada) => t - c.em < DURACAO_ANEL;

const AMBAR = rgb(CORES.ambar);
const CLARO = rgb(CORES.tealClaro);

/** `t` = `performance.now()` do quadro. */
export function camadasDePulsos(chegadas: readonly Chegada[], t: number): Layer[] {
  if (!chegadas.length) return [];
  const aneis = chegadas.filter((c) => anelAtivo(t, c));
  return [
    new ScatterplotLayer<Chegada>({
      id: 'chegadas-halo',
      data: chegadas,
      getPosition: (c) => c.posicao,
      getRadius: 420,
      radiusMinPixels: 9,
      getFillColor: [...CLARO, 46],
      ...SEMPRE_POR_CIMA,
      ...NA_PILHA,
    }),
    new ScatterplotLayer<Chegada>({
      id: 'chegadas',
      data: chegadas,
      getPosition: (c) => c.posicao,
      getRadius: 110,
      radiusMinPixels: 3.5,
      getFillColor: [235, 250, 255, 255],
      stroked: true,
      getLineColor: [...CLARO, 255],
      lineWidthMinPixels: 1.5,
      ...SEMPRE_POR_CIMA,
      ...NA_PILHA,
    }),
    new ScatterplotLayer<Chegada>({
      id: 'chegadas-anel',
      data: aneis,
      getPosition: (c) => c.posicao,
      getRadius: (c) => 150 + progressoDoAnel(t, c.em) * 1900,
      radiusMinPixels: 4,
      filled: false,
      stroked: true,
      getLineColor: (c) => [...AMBAR, Math.round(255 * (1 - progressoDoAnel(t, c.em)))],
      lineWidthMinPixels: 2.5,
      updateTriggers: { getRadius: t, getLineColor: t },
      ...SEMPRE_POR_CIMA,
      ...NA_PILHA,
    }),
  ];
}

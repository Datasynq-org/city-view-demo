import type { Regiao } from '../dominio/ras';

/** Onde a câmera olha: centro [lon, lat], zoom, inclinação e rotação (graus). */
export interface Vista {
  centro: [number, number];
  zoom: number;
  inclinacao: number;
  rotacao: number;
}

/** Para onde a câmera vai: o DF inteiro, uma RA (enquadrada pelos limites dela) ou uma vista pronta (tour). */
export type Destino = { tipo: 'df' } | { tipo: 'ra'; ra: string } | { tipo: 'vista'; vista: Vista };

/** A câmera ao abrir: o DF inteiro, inclinado, como numa sala de comando. */
export const INCLINACAO_INICIAL = 52;
export const ROTACAO_INICIAL = -14;

/** Graus por segundo da órbita lenta do tour. */
export const GRAUS_POR_SEGUNDO = 3;

/** Voo comum (escolher uma RA, voltar ao DF): rápido, como num mapa. O do tour é lento, de apresentação. */
export const DURACAO_DO_VOO = 1500;
export const DURACAO_DO_VOO_NO_TOUR = 3200;

/** No modo girar: graus de rotação e de inclinação por pixel arrastado. */
export const GIRO_POR_PIXEL = 0.45;
export const INCLINACAO_POR_PIXEL = 0.3;

/** Até onde a câmera chega ao enquadrar uma RA pequena: perto o bastante para ler as quadras. */
export const ZOOM_MAXIMO_DA_RA = 14.2;

/** Quem pede menos movimento no sistema não vê órbita nem pulsos. */
export const reduzMovimento = () => typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

/** A caixa da RA: [[oeste, sul], [leste, norte]], com todas as partes dela. */
export function caixaDaRa(ra: Regiao): [[number, number], [number, number]] {
  let oeste = Infinity;
  let sul = Infinity;
  let leste = -Infinity;
  let norte = -Infinity;
  const poligonos = ra.geometria.type === 'Polygon' ? [ra.geometria.coordinates] : ra.geometria.coordinates;
  for (const aneis of poligonos) {
    for (const [lon, lat] of aneis[0] as [number, number][]) {
      if (lon < oeste) oeste = lon;
      if (lon > leste) leste = lon;
      if (lat < sul) sul = lat;
      if (lat > norte) norte = lat;
    }
  }
  return [
    [oeste, sul],
    [leste, norte],
  ];
}

/** Novo giro e nova inclinação depois de arrastar `dx`, `dy` pixels, dentro do que a câmera permite. */
export function girar(inicio: { rotacao: number; inclinacao: number }, dx: number, dy: number, inclinacaoMaxima: number) {
  return {
    rotacao: inicio.rotacao + dx * GIRO_POR_PIXEL,
    inclinacao: Math.min(inclinacaoMaxima, Math.max(0, inicio.inclinacao - dy * INCLINACAO_POR_PIXEL)),
  };
}

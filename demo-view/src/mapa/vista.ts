/** Onde a câmera olha: centro [lon, lat], zoom, inclinação e rotação (graus). */
export interface Vista {
  centro: [number, number];
  zoom: number;
  inclinacao: number;
  rotacao: number;
}

/** A câmera ao abrir: o DF inteiro, inclinado, como numa sala de comando. */
export const INCLINACAO_INICIAL = 52;
export const ROTACAO_INICIAL = -14;

/** Graus por segundo da órbita lenta. */
export const GRAUS_POR_SEGUNDO = 3;

/** Quem pede menos movimento no sistema não vê órbita nem pulsos. */
export const reduzMovimento = () => typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);

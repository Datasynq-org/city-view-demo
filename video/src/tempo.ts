// Tabela de tempo do filme, em quadros a 30 fps (CV-VID-001, r2).
// Mudar o ritmo é mudar esta tabela.
export const T = {
  P01: [0, 75],
  P02: [75, 180],
  P03: [180, 300],
  P04: [300, 420],
  P05: [420, 525],
  P06: [525, 615],
  P07: [615, 720],
  P08: [720, 795],
  P09: [795, 930],
  P10: [930, 1020],
  P11: [1020, 1140],
  P12: [1140, 1245],
  P13: [1245, 1410],
  P14: [1410, 1515],
  P15: [1515, 1620],
  P16: [1620, 1725],
  P17: [1725, 1800],
  P18: [1800, 1890],
  P19: [1890, 2010],
  P20: [2010, 2100],
  CARTAO: [2130, 2250],
} as const;

export const TOTAL = 2250;

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** Progresso linear de 0 a 1 entre dois quadros. */
export const prog = (f: number, a: number, b: number) => clamp01((f - a) / (b - a));
export const suave = (t: number) => t * t * (3 - 2 * t);
export const saida = (t: number) => 1 - Math.pow(1 - t, 3);
export const entrada = (t: number) => t * t * t;
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

import { CASO, CENTRO } from "./dados";
import { ALTURA, LARGURA } from "./tema";
import { T, mix, prog, suave } from "./tempo";

export type Camera = { cx: number; cy: number; z: number };

export const ESCALA = 1.75;
const ZOOM_CASO = 6;
// No caso, o bairro fica à esquerda do centro: os painéis entram à direita.
const ALVO = {
  cx: CASO.x + (LARGURA / 2 - 640) / (ESCALA * ZOOM_CASO),
  cy: CASO.y + (ALTURA / 2 - 520) / (ESCALA * ZOOM_CASO),
};

export const camera = (f: number): Camera => {
  let cx = CENTRO.x;
  let cy = CENTRO.y;
  let z = mix(1, 1.05, prog(f, T.P03[0], T.P05[0]));
  z = mix(z, 0.86, suave(prog(f, T.P05[0] + 80, T.P06[1] - 20)));
  z = mix(z, 1.02, suave(prog(f, T.P09[0], T.P09[1])));
  const ida = suave(prog(f, T.P10[0], T.P10[1] - 12));
  const volta = suave(prog(f, T.P16[0], T.P16[0] + 70));
  const k = ida * (1 - volta);
  // Zoom em escala logarítmica, para o movimento parecer constante.
  z = Math.exp(mix(Math.log(z), Math.log(ZOOM_CASO), k));
  cx = mix(cx, ALVO.cx, k);
  cy = mix(cy, ALVO.cy, k);
  z *= 1 + 0.03 * prog(f, T.P11[0], T.P15[1]) * k;
  z *= mix(1, 1.05, prog(f, T.P16[0] + 70, T.P19[1]));
  return { cx, cy, z };
};

export const transformada = (c: Camera) =>
  `translate(${LARGURA / 2} ${ALTURA / 2}) scale(${ESCALA * c.z}) translate(${-c.cx} ${-c.cy})`;

/** Ponto do mapa -> pixel da tela. */
export const projeta = (c: Camera, x: number, y: number) => ({
  x: LARGURA / 2 + (x - c.cx) * ESCALA * c.z,
  y: ALTURA / 2 + (y - c.cy) * ESCALA * c.z,
});

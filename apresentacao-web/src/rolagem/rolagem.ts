import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import Lenis from 'lenis';
import { BASE, estado, type Estado } from '../cidade/estado';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const params = new URLSearchParams(location.search);

// Modo captura (prévias): ?cena=<id>&p=<0..1> monta só aquela cena, sem rolagem,
// com a linha do tempo parada no ponto p. Usado por scripts/capturas.ps1.
export const captura = params.has('cena');
export const cenaCapturada = params.get('cena');
export const COM_MOVIMENTO = '(prefers-reduced-motion: no-preference)';

const linhas = new Map<string, { tl: gsap.core.Timeline; base: Estado }>();

// Linha do tempo de uma cena fixa. `base` é o estado da cidade quando a cena começa.
export function linhaDaCena(id: string, trigger: Element, fim: string, base: Partial<Estado>) {
  const completo = { ...BASE, ...base };
  if (captura) {
    const tl = gsap.timeline({ paused: true });
    linhas.set(id, { tl, base: completo });
    return tl;
  }
  return gsap.timeline({
    scrollTrigger: {
      id: `cena-${id}`, trigger, start: 'top top', end: fim, pin: true, scrub: 0.6,
      onToggle: (s) => { if (s.isActive) Object.assign(estado, completo); },
    },
  });
}

export let lenis: Lenis | null = null;

// Rola até y (usado pelo tour): suave com Lenis; direto quando não há animação.
export function rolarPara(y: number, duracao: number) {
  if (lenis) lenis.scrollTo(y, { duration: duracao, easing: (x) => 1 - Math.pow(1 - x, 3) });
  else window.scrollTo({ top: y, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
}

export function iniciarRolagem() {
  if (captura || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const l = new Lenis({ lerp: 0.09 });
  lenis = l;
  l.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => l.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

export async function irParaCaptura() {
  if (!captura) return;
  await document.fonts.ready;
  const p = Math.min(1, Math.max(0, Number(params.get('p') ?? 0)));
  const l = linhas.get(cenaCapturada ?? '');
  if (l) { Object.assign(estado, l.base); l.tl.progress(p); }
  document.documentElement.dataset.pronto = '1';
}

export { gsap, ScrollTrigger, useGSAP };

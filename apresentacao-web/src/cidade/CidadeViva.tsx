import { useEffect, useRef } from 'react';
import mapa from '../mapa/ras.json';
import { AREAS, AREA, silos as textoSilos } from '../conteudo/narrativa';
import { estado } from './estado';
import { gsap } from '../rolagem/rolagem';
import { lerPaleta } from '@ds';

// Canvas fixo atrás da página: o DF com chamados ILUSTRATIVOS (pontos sorteados dentro dos
// limites oficiais das RAs). As cenas mudam o `estado`, e este componente desenha.

const L = mapa.largura, A = mapa.altura;
const base = mapa.pontos as [number, number][];
let semente = 11112026;
const rnd = () => (semente = (semente * 1664525 + 1013904223) % 4294967296) / 4294967296;

const pesoTotal = AREAS.reduce((s, a) => s + a.peso, 0);
const area = base.map(() => {
  let r = rnd() * pesoTotal;
  for (let k = 0; k < AREAS.length; k++) { r -= AREAS[k].peso; if (r <= 0) return k; }
  return 0;
});
const situacao = base.map(() => { const r = rnd(); return r < 0.55 ? 0 : r < 0.8 ? 1 : 2; });
const fase = base.map(() => rnd() * Math.PI * 2);
const jitter = base.map(() => { const a = rnd() * Math.PI * 2, d = Math.sqrt(rnd()); return [Math.cos(a) * d, Math.sin(a) * d]; });

// três casos de inteligência: centro (no mapa) e os chamados que viram um incidente
// ancorados em RAs urbanas só para o visual ser plausível; os cartões não citam lugar (cenários ilustrativos)
const rotuloDa = (codigo: string) => (mapa.ras.find((r) => r.codigo === codigo)?.rotulo ?? [L / 2, A / 2]) as [number, number];
const CENTROS: [number, number][] = [rotuloDa('RA-IX'), rotuloDa('RA-XV'), rotuloDa('RA-III')];
const membros = CENTROS.map(([cx, cy]) =>
  base.map((p, i) => [i, (p[0] - cx) ** 2 + (p[1] - cy) ** 2] as const).sort((a, b) => a[1] - b[1]).slice(0, 30).map(([i]) => i),
);
const membroDe = new Map<number, number>();
membros.forEach((m, k) => m.forEach((i, j) => {
  membroDe.set(i, k);
  if (k === 0) area[i] = j < 25 ? AREA.seguranca : AREA.ouvidoria; // 190 + órgão ambiental
  if (k === 1) area[i] = j % 2 ? AREA.vias : AREA.seguranca; // pedras + roubos
  if (k === 2) area[i] = j % 3 === 0 ? AREA.seguranca : AREA.vias; // placa + acidente
}));

// conexões entre chamados próximos de áreas diferentes
const pares: [number, number][] = [];
for (let i = 0; i < base.length; i += 4) {
  let melhor = -1, d = 45 ** 2;
  for (let j = 0; j < base.length; j++) {
    if (area[j] === area[i]) continue;
    const dd = (base[j][0] - base[i][0]) ** 2 + (base[j][1] - base[i][1]) ** 2;
    if (dd < d && dd > 4) { d = dd; melhor = j; }
  }
  if (melhor >= 0) pares.push([i, melhor]);
}

// posição de cada ponto dentro da coluna (silo) da sua área
const contagem = AREAS.map(() => 0);
const ordem = area.map((k) => contagem[k]++);
const AMPLIA = 1.8; // quanto o zoom aproxima um caso (escala final 1 + AMPLIA)
const caminhos = mapa.ras.map((r) => new Path2D(r.d));

export function CidadeViva() {
  const tela = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = tela.current!;
    const ctx = c.getContext('2d')!;
    const xs = new Float32Array(base.length), ys = new Float32Array(base.length);
    let paleta = lerPaleta();
    let tema = document.documentElement.dataset.tema;

    const desenhar = (t: number) => {
      const e = estado;
      if (document.documentElement.dataset.tema !== tema) { tema = document.documentElement.dataset.tema; paleta = lerPaleta(); }
      const dpr = Math.min(2, devicePixelRatio || 1);
      const w = c.clientWidth, h = c.clientHeight;
      if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // palco 16:9 (o mesmo do CSS): tudo se posiciona e escala por ele, em qualquer tela
      const pw = Math.min(w, (h * 16) / 9), px0 = (w - pw) / 2;
      const k = pw / 1600; // 1 num palco de 1600 px
      // enquadramento do mapa: grande, à direita da coluna de texto (que ocupa ~34% do palco)
      const esc = Math.min((pw * 0.64) / L, (h * 0.88) / A);
      const ox = px0 + pw - L * esc - pw * 0.025, oy = (h - A * esc) / 2;
      const alvo = [px0 + pw * 0.67, h * 0.5];
      const foco = Math.round(e.foco);
      const cf = foco >= 0 ? [ox + CENTROS[foco][0] * esc, oy + CENTROS[foco][1] * esc] : alvo;
      const Z = 1 + AMPLIA * e.zoom;
      const cam = (x: number, y: number): [number, number] => [x + (alvo[0] + (x - cf[0]) * Z - x) * e.zoom, y + (alvo[1] + (y - cf[1]) * Z - y) * e.zoom];

      // contorno das RAs
      const vis = e.aparecer * (1 - 0.85 * e.apagar);
      ctx.save();
      ctx.globalAlpha = 0.9 * vis * (1 - e.silos);
      // cam() é linear: escala efetiva 1 + AMPLIA·zoom², a mesma aplicada aos pontos
      const S = esc * (1 + AMPLIA * e.zoom * e.zoom);
      const [tx, ty] = cam(ox, oy);
      ctx.translate(tx, ty);
      ctx.scale(S, S);
      ctx.lineWidth = (1.1 * k) / S;
      ctx.strokeStyle = paleta.traco;
      caminhos.forEach((p) => ctx.stroke(p));
      ctx.restore();

      // silos: colunas por área
      const x0 = px0 + pw * 0.38, colW = (pw * 0.6) / AREAS.length, passo = 6.5 * k;
      const porLinha = Math.max(4, Math.floor((colW * 0.72) / passo));
      const chao = h * 0.8;

      for (let i = 0; i < base.length; i++) {
        let [x, y] = cam(ox + base[i][0] * esc, oy + base[i][1] * esc);
        const m = membroDe.get(i);
        if (m === foco && e.agrupar > 0) {
          const gx = cf[0] + (alvo[0] - cf[0]) * e.zoom + jitter[i][0] * 30 * k, gy = cf[1] + (alvo[1] - cf[1]) * e.zoom + jitter[i][1] * 30 * k;
          x += (gx - x) * e.agrupar; y += (gy - y) * e.agrupar;
        }
        if (e.silos > 0) {
          const col = area[i];
          const sx = x0 + col * colW + colW * 0.14 + (ordem[i] % porLinha) * passo;
          const sy = chao - Math.floor(ordem[i] / porLinha) * passo;
          x += (sx - x) * e.silos; y += (sy - y) * e.silos;
        }
        xs[i] = x; ys[i] = y;
      }

      // mapa de calor (densidade em grade)
      if (e.calor > 0.01) {
        const cel = 26 * k, cols = Math.ceil(w / cel), lin = Math.ceil(h / cel);
        const g = new Uint16Array(cols * lin);
        let max = 1;
        for (let i = 0; i < base.length; i++) {
          const gi = Math.floor(xs[i] / cel) + Math.floor(ys[i] / cel) * cols;
          if (gi >= 0 && gi < g.length) max = Math.max(max, ++g[gi]);
        }
        ctx.globalCompositeOperation = paleta.calorModo;
        for (let gi = 0; gi < g.length; gi++) {
          const v = g[gi] / max;
          if (v < (paleta.claro ? 0.32 : 0.18)) continue; // só onde há concentração: o resto fica calmo
          const cx = (gi % cols) * cel + cel / 2, cy = Math.floor(gi / cols) * cel + cel / 2;
          const raio = cel * (0.9 + v);
          const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, raio);
          const cor = v > 0.65 ? '248, 113, 113' : v > 0.4 ? '251, 191, 36' : '56, 189, 248';
          rg.addColorStop(0, `rgba(${cor}, ${(paleta.claro ? 0.45 : 0.32) * v * e.calor})`);
          rg.addColorStop(1, `rgba(${cor}, 0)`);
          ctx.fillStyle = rg;
          ctx.fillRect(cx - raio, cy - raio, raio * 2, raio * 2);
        }
        ctx.globalCompositeOperation = 'source-over';
      }

      // conexões entre áreas diferentes
      if (e.conexoes > 0.01 && e.silos < 0.5) {
        ctx.strokeStyle = paleta.conexao;
        ctx.globalAlpha = e.conexoes * vis;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        for (const [a, b] of pares) { ctx.moveTo(xs[a], ys[a]); ctx.lineTo(xs[b], ys[b]); }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // pontos
      for (let i = 0; i < base.length; i++) {
        let r = (2.3 + 1.3 * e.zoom) * k;
        let alfa = vis * (0.72 + 0.28 * Math.sin(t * 2 + fase[i])) * (1 - 0.6 * e.calor);
        if (e.filtro > 0) {
          if (area[i] !== Math.round(e.area)) alfa *= 1 - 0.88 * e.filtro;
          else r += 1.4 * e.filtro * k;
        }
        if (foco >= 0 && e.zoom > 0 && membroDe.get(i) !== foco) alfa *= 1 - 0.35 * e.zoom;
        else if (foco >= 0 && e.zoom > 0) r += 0.8 * e.zoom * k;
        let cor = paleta.areas[area[i]];
        if (e.status > 0.5) {
          cor = paleta.status[situacao[i]];
          if (situacao[i] >= Math.round(e.grau)) alfa *= 0.06;
        }
        if (alfa < 0.01) continue;
        ctx.globalAlpha = alfa;
        ctx.fillStyle = cor;
        ctx.beginPath(); ctx.arc(xs[i], ys[i], r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // anel do incidente em foco
      if (foco >= 0 && e.agrupar > 0.5) {
        const forca = (e.agrupar - 0.5) * 2;
        ctx.strokeStyle = paleta.anel;
        ctx.globalAlpha = forca;
        ctx.lineWidth = 1.5 * k;
        ctx.beginPath(); ctx.arc(alvo[0] * e.zoom + cf[0] * (1 - e.zoom), alvo[1] * e.zoom + cf[1] * (1 - e.zoom), (44 + 6 * Math.sin(t * 3)) * k, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // rótulos dos silos
      if (e.silos > 0.6) {
        const forca = (e.silos - 0.6) / 0.4;
        ctx.globalAlpha = forca * vis;
        ctx.textAlign = 'left';
        AREAS.forEach((a, i) => {
          const x = x0 + i * colW + colW * 0.14;
          ctx.fillStyle = paleta.tinta; ctx.font = `600 ${Math.round(14 * k)}px "Geist Variable", system-ui`;
          ctx.fillText(a.nome, x, chao + 28 * k);
          ctx.fillStyle = paleta.tinta2; ctx.font = `${Math.round(12 * k)}px "Geist Mono Variable", monospace`;
          ctx.fillText(a.canal, x, chao + 46 * k);
          const topo = chao - Math.ceil(contagem[i] / porLinha) * passo - 16 * k;
          ctx.fillStyle = paleta.ok; ctx.fillText(`● ${textoSilos.okColuna}`, x, topo);
        });
        ctx.globalAlpha = 1;
      }
    };

    const tick = (t: number) => desenhar(t);
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return <canvas ref={tela} className="fixed inset-0 h-screen w-screen" aria-hidden="true" />;
}

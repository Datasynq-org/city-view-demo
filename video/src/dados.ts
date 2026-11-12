// Geometria e dados ilustrativos do filme. Tudo é determinístico.
// O mapa vem de apresentacao-web/src/mapa/ras.json (limites oficiais das RAs,
// IDE/DF). Os pontos são ilustrativos: o mesmo número por RA, só efeito visual.
import mapa from "./dados/ras.json";

export const MAPA_L = mapa.largura;
export const MAPA_A = mapa.altura;
export const CENTRO = { x: MAPA_L / 2, y: MAPA_A / 2 };

export const ras = mapa.ras as { nome: string; codigo: string; d: string; rotulo: number[] }[];

const semente = (s: number) => () => {
  s |= 0;
  s = (s + 0x6d2b79f5) | 0;
  let t = Math.imul(s ^ (s >>> 15), 1 | s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const AREAS = ["ÁGUA E ESGOTO", "ENERGIA", "ILUMINAÇÃO", "VIAS", "LIMPEZA URBANA", "SEGURANÇA"];
export const COLUNA_X = AREAS.map((_, i) => 135 + i * 146);
export const SILO_TOPO = 205;
const PASSO = 6.4;
const POR_LINHA = 10;

export type Ponto = {
  x: number;
  y: number;
  ra: number;
  area: number;
  sx: number;
  sy: number;
  orfao: boolean;
  /** 0..1: ordem em que acende no P04 (devagar, depois rápido). */
  acende: number;
  r1: number;
  r2: number;
};

const rnd = semente(20261112);
const contagem = AREAS.map(() => 0);
const POR_RA = Math.round(mapa.pontos.length / ras.length);

export const pontos: Ponto[] = (mapa.pontos as number[][]).map(([x, y], i) => {
  const area = Math.floor(rnd() * AREAS.length);
  const orfao = i % 97 === 11;
  let sx: number;
  let sy: number;
  if (orfao) {
    const vao = Math.floor(rnd() * (AREAS.length - 1));
    sx = (COLUNA_X[vao] + COLUNA_X[vao + 1]) / 2 + (rnd() - 0.5) * 34;
    sy = SILO_TOPO + 12 + rnd() * 180;
  } else {
    const k = contagem[area]++;
    sx = COLUNA_X[area] + ((k % POR_LINHA) - (POR_LINHA - 1) / 2) * PASSO;
    sy = SILO_TOPO + Math.floor(k / POR_LINHA) * PASSO;
  }
  return {
    x,
    y,
    ra: Math.floor(i / POR_RA),
    area,
    sx,
    sy,
    orfao,
    acende: Math.pow(rnd(), 1 / 2.4),
    r1: rnd(),
    r2: rnd(),
  };
});

export const SILO_BASE =
  SILO_TOPO + Math.ceil(Math.max(...contagem) / POR_LINHA) * PASSO;

// Arestas do grafo: cada terceiro ponto se liga aos dois vizinhos mais próximos.
export type Aresta = { a: number; b: number; ordem: number };
export const arestas: Aresta[] = (() => {
  const idx = pontos.map((_, i) => i).filter((i) => i % 3 === 0);
  const vistos = new Set<string>();
  const lista: Aresta[] = [];
  for (const i of idx) {
    const p = pontos[i];
    const perto = idx
      .filter((j) => j !== i)
      .map((j) => ({ j, d: Math.hypot(pontos[j].x - p.x, pontos[j].y - p.y) }))
      .filter((o) => o.d < 30)
      .sort((u, v) => u.d - v.d)
      .slice(0, 2);
    for (const { j } of perto) {
      const chave = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      const mx = (p.x + pontos[j].x) / 2;
      const my = (p.y + pontos[j].y) / 2;
      lista.push({ a: i, b: j, ordem: Math.hypot(mx - CENTRO.x, my - CENTRO.y) / 560 });
    }
  }
  return lista;
})();

// Rede entre RAs: cada RA se liga às três mais próximas. Por ela correm os pulsos.
export type Elo = { ax: number; ay: number; bx: number; by: number; fase: number; ordem: number };
export const elos: Elo[] = (() => {
  const vistos = new Set<string>();
  const lista: Elo[] = [];
  const r = semente(77);
  ras.forEach((ra, i) => {
    const perto = ras
      .map((o, j) => ({ j, d: Math.hypot(o.rotulo[0] - ra.rotulo[0], o.rotulo[1] - ra.rotulo[1]) }))
      .filter((o) => o.j !== i)
      .sort((u, v) => u.d - v.d)
      .slice(0, 3);
    for (const { j } of perto) {
      const chave = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      const [ax, ay] = ra.rotulo;
      const [bx, by] = ras[j].rotulo;
      lista.push({
        ax,
        ay,
        bx,
        by,
        fase: r(),
        ordem: Math.hypot((ax + bx) / 2 - CENTRO.x, (ay + by) / 2 - CENTRO.y) / 560,
      });
    }
  });
  return lista;
})();

// O par que a primeira aresta liga no P08: um sinal de energia e um de iluminação.
export const PAR_P08 = (() => {
  const meio = SILO_TOPO + 95;
  const maisPerto = (area: number) =>
    pontos
      .map((p, i) => ({ i, p }))
      .filter((o) => o.p.area === area && !o.p.orfao)
      .sort(
        (u, v) =>
          Math.abs(u.p.sy - meio) +
          Math.abs(u.p.sx - COLUNA_X[area]) -
          (Math.abs(v.p.sy - meio) + Math.abs(v.p.sx - COLUNA_X[area])),
      )[0].i;
  return { a: maisPerto(1), b: maisPerto(2) };
})();

// --- O caso do apagão (cenário ilustrativo, sem RA nomeada) ---
export const CASO = { x: 313.8, y: 354.7, raio: 15 };

// Malha de "postes" que aparece só no zoom: quadras com ruas entre elas.
export type Poste = { x: number; y: number; d: number; r: number };
export const postes: Poste[] = (() => {
  const r = semente(4812);
  const lista: Poste[] = [];
  const passo = 2.3;
  for (let gx = -52; gx <= 52; gx++) {
    for (let gy = -30; gy <= 30; gy++) {
      if (((gx % 7) + 7) % 7 === 0 || ((gy % 5) + 5) % 5 === 0) continue;
      if (r() < 0.2) continue;
      const x = CASO.x + 30 + gx * passo + (r() - 0.5) * 0.5;
      const y = CASO.y + gy * passo + (r() - 0.5) * 0.5;
      lista.push({ x, y, d: Math.hypot(x - CASO.x, y - CASO.y), r: r() });
    }
  }
  return lista;
})();

export const relatos = (() => {
  const r = semente(140);
  return Array.from({ length: 46 }, () => {
    const ang = r() * Math.PI * 2;
    const raio = 2.5 + Math.sqrt(r()) * (CASO.raio - 3);
    return { x: CASO.x + Math.cos(ang) * raio, y: CASO.y + Math.sin(ang) * raio * 0.9, t: r() };
  });
})();

export const NO_ENERGIA = { x: CASO.x, y: CASO.y };
export const NO_ILUMINACAO = { x: CASO.x + 11.5, y: CASO.y - 9.5 };
export const NO_TRANSITO = { x: CASO.x - 12.5, y: CASO.y + 9 };
export const NO_INSIGHT = {
  x: (NO_ENERGIA.x + NO_ILUMINACAO.x + NO_TRANSITO.x) / 3 + 1.5,
  y: (NO_ENERGIA.y + NO_ILUMINACAO.y + NO_TRANSITO.y) / 3 - 13,
};

export const satelites = (centro: { x: number; y: number }, n: number, s: number) => {
  const r = semente(s);
  return Array.from({ length: n }, () => {
    const ang = r() * Math.PI * 2;
    const raio = 2 + r() * 4;
    return { x: centro.x + Math.cos(ang) * raio, y: centro.y + Math.sin(ang) * raio, t: r() };
  });
};
export const satIluminacao = satelites(NO_ILUMINACAO, 7, 31);
export const satTransito = satelites(NO_TRANSITO, 5, 32);

// Mapa de calor do P16 (simulado): um peso por RA.
export const calor = (() => {
  const r = semente(916);
  return ras.map((ra) => ({ x: ra.rotulo[0], y: ra.rotulo[1], peso: 0.25 + r() * 0.75 }));
})();

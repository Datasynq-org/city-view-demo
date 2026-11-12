// Gera os contornos das 37 regiões administrativas usados pelo demo-view.
//
// Uso:   npm run geo -- <caminho do ra_gdf.geojson> [arquivo de saída]
// Saída: src/dominio/ras-geo.json
//
// A entrada é a base oficial da IDE/DF (ver o README desta pasta). Ela fica fora
// do demo-view e por isso entra por argumento.
//
// Projeta lon/lat num plano (equirretangular corrigida pela latitude do DF, que
// nessa escala não distorce de forma visível), simplifica com Douglas-Peucker e
// volta para lon/lat. Grava, por região, a geometria GeoJSON, o ponto do rótulo
// (sempre dentro da região), o centroide e a área aproximada em km².
//
// Portado de `City-view/scripts/build-mapa-ras.mjs`.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
const [entrada, saida] = process.argv.slice(2);
if (!entrada) {
  console.error("Uso: npm run geo -- <caminho do ra_gdf.geojson> [arquivo de saída]");
  process.exit(1);
}
const geo = JSON.parse(readFileSync(resolve(entrada), "utf8"));
const target = saida ? resolve(saida) : join(aqui, "../src/dominio/ras-geo.json");

const WIDTH = 1000;
const TOLERANCE = 0.2; // em unidades do plano (1 unidade ≈ 100 m)

const polygonsOf = (g) => (g.type === "Polygon" ? [g.coordinates] : g.coordinates);

let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
for (const f of geo.features) {
  for (const poly of polygonsOf(f.geometry)) {
    for (const ring of poly) {
      for (const [lon, lat] of ring) {
        minLon = Math.min(minLon, lon); maxLon = Math.max(maxLon, lon);
        minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
      }
    }
  }
}
const kx = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180));
const scale = WIDTH / ((maxLon - minLon) * kx);
const project = ([lon, lat]) => [(lon - minLon) * kx * scale, (maxLat - lat) * scale];
const unproject = ([x, y]) => [round5(minLon + x / (kx * scale)), round5(maxLat - y / scale)];
const round5 = (n) => Math.round(n * 1e5) / 1e5;
// km por unidade do plano (1 grau de latitude ≈ 111,32 km)
const kmPerUnit = 111.32 / scale;

function simplify(points, tol) {
  if (points.length < 4) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    const [ax, ay] = points[a], [bx, by] = points[b];
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
    let max = 0, idx = -1;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = points[i];
      const d = Math.abs(dy * px - dx * py + bx * ay - by * ax) / len;
      if (d > max) { max = d; idx = i; }
    }
    if (max > tol && idx > 0) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return points.filter((_, i) => keep[i]);
}

// Anel fechado (primeiro ponto = último): divide no ponto mais distante do
// início e simplifica as duas metades, senão o algoritmo descarta o anel todo.
function simplifyRing(ring, tol) {
  const [x0, y0] = ring[0];
  let far = 0, dmax = -1;
  ring.forEach(([x, y], i) => {
    const d = Math.hypot(x - x0, y - y0);
    if (d > dmax) { dmax = d; far = i; }
  });
  const a = simplify(ring.slice(0, far + 1), tol);
  const b = simplify(ring.slice(far), tol);
  return [...a, ...b.slice(1, -1)];
}

const ringArea = (pts) => {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
    s += x1 * y2 - x2 * y1;
  }
  return s / 2;
};

// Nomes com acentuação e caixa corretas, a partir dos códigos oficiais.
const NOMES = JSON.parse(readFileSync(join(aqui, "ras-nomes.json"), "utf8"));

// Ponto dentro do polígono (par-ímpar, considera buracos).
function dentro([px, py], aneis) {
  let ok = false;
  for (const anel of aneis) {
    for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
      const [xi, yi] = anel[i], [xj, yj] = anel[j];
      if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) ok = !ok;
    }
  }
  return ok;
}

function distanciaBorda([px, py], aneis) {
  let min = Infinity;
  for (const anel of aneis) {
    for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
      const [ax, ay] = anel[j], [bx, by] = anel[i];
      const dx = bx - ax, dy = by - ay;
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
      min = Math.min(min, Math.hypot(px - ax - t * dx, py - ay - t * dy));
    }
  }
  return min;
}

// Ponto do rótulo: o mais distante da borda numa grade fina (aproxima o "polo de
// inacessibilidade"), para o nome nunca cair fora de regiões em forma de C.
function pontoRotulo(aneis) {
  const xs = aneis[0].map((p) => p[0]), ys = aneis[0].map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  let melhor = null, dMelhor = -1;
  const N = 48;
  for (let i = 0; i <= N; i++) {
    for (let j = 0; j <= N; j++) {
      const p = [x0 + ((x1 - x0) * i) / N, y0 + ((y1 - y0) * j) / N];
      if (!dentro(p, aneis)) continue;
      const d = distanciaBorda(p, aneis);
      if (d > dMelhor) { dMelhor = d; melhor = p; }
    }
  }
  return melhor ?? aneis[0][0];
}

// Núcleo urbano das RAs com muita área rural: o rótulo e os pontos simulados
// ficam na cidade, não no meio da área rural. Coordenadas aproximadas do centro
// de cada cidade; só valem se caírem dentro da RA.
const NUCLEO_URBANO = {
  "plano-piloto": [-47.8828, -15.7939],
  brazlandia: [-48.2004, -15.6748],
  planaltina: [-47.6532, -15.6185],
  sobradinho: [-47.7883, -15.6524],
  gama: [-48.0627, -16.0185],
  paranoa: [-47.7795, -15.7747],
  "sao-sebastiao": [-47.7786, -15.9014],
  ceilandia: [-48.1077, -15.8174],
  samambaia: [-48.0858, -15.8757],
  "santa-maria": [-48.0128, -16.0186],
  "recanto-das-emas": [-48.0628, -15.9076],
};

const regions = geo.features.map((f) => {
  const { ra_codigo, ra_cira: cira, ra_nome } = f.properties;
  // A base oficial grava Ponte Alta como "XXXVII", sem o prefixo das demais.
  const codigo = ra_codigo.startsWith("RA-") ? ra_codigo : `RA-${ra_codigo}`;
  const meta = NOMES[codigo];
  if (!meta) throw new Error(`Sem nome para ${codigo} (${ra_nome})`);
  const poligonos = [];
  let area = 0, cx = 0, cy = 0, biggest = 0, principal = null;
  for (const poly of polygonsOf(f.geometry)) {
    const aneis = [];
    poly.forEach((ring, r) => {
      const pts = simplifyRing(ring.map(project), TOLERANCE);
      if (pts.length < 3) return;
      if (r > 0 && aneis.length === 0) return;
      aneis.push(pts);
      const a = Math.abs(ringArea(pts));
      area += r === 0 ? a : -a;
      if (r === 0 && a > biggest) {
        biggest = a;
        // centroide do maior anel externo
        let sx = 0, sy = 0, sa = 0;
        for (let i = 0; i < pts.length; i++) {
          const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
          const c = x1 * y2 - x2 * y1;
          sx += (x1 + x2) * c; sy += (y1 + y2) * c; sa += c;
        }
        cx = sx / (3 * sa); cy = sy / (3 * sa);
        principal = aneis;
      }
    });
    if (aneis.length) poligonos.push(aneis);
  }
  const fechar = (anel) => [...anel.map(unproject), unproject(anel[0])];
  let rotulo = unproject(pontoRotulo(principal));
  const nucleo = NUCLEO_URBANO[meta.id];
  if (nucleo) {
    if (poligonos.some((aneis) => dentro(project(nucleo), aneis))) rotulo = nucleo;
    else console.warn(`Núcleo urbano de ${meta.nome} fora da RA; mantido o ponto calculado.`);
  }
  const coords = poligonos.map((aneis) => aneis.map(fechar));
  return {
    id: meta.id,
    codigo,
    numero: cira,
    nome: meta.nome,
    geometria: coords.length === 1 ? { type: "Polygon", coordinates: coords[0] } : { type: "MultiPolygon", coordinates: coords },
    rotulo,
    centroide: unproject([cx, cy]),
    areaKm2: Math.round(area * kmPerUnit * kmPerUnit),
  };
}).sort((a, b) => a.numero - b.numero);

writeFileSync(target, JSON.stringify({
  fonte: "GDF, IDE/DF (SEDUH), serviço Publico/LIMITES, camada Regiões Administrativas, baixado em 07/11/2026.",
  limites: [[round5(minLon), round5(minLat)], [round5(maxLon), round5(maxLat)]],
  // Graus de longitude e de latitude por unidade do plano (≈100 m).
  grausPorUnidade: [1 / (kx * scale), 1 / scale],
  regioes: regions,
}));
console.log(`${regions.length} regiões → ${target}`);

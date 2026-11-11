// Gera src/mapa/ras.json a partir dos limites oficiais das RAs (assets/geo/ra_gdf.geojson, IDE/DF).
// Simplifica com mapshaper, projeta para coordenadas de SVG e sorteia (de forma
// determinística) pontos ilustrativos dentro do DF, usados só como efeito visual.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mapshaper from 'mapshaper';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const origem = path.resolve(aqui, '../../assets/geo/ra_gdf.geojson');
const destino = path.resolve(aqui, '../src/mapa/ras.json');

const LARGURA = 1000; // viewBox: 1000 de largura, altura proporcional
const PONTOS = 1800;

const entrada = fs.readFileSync(origem, 'utf8');
const saida = await mapshaper.applyCommands(
  '-i entrada.json -simplify 4% keep-shapes -o saida.json format=geojson precision=0.00001',
  { 'entrada.json': entrada },
);
const geo = JSON.parse(saida['saida.json']);

// limites em lon/lat
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
const aneis = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates);
for (const f of geo.features) for (const poli of aneis(f.geometry)) for (const anel of poli) for (const [x, y] of anel) {
  minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
}
// projeção equirretangular com correção pela latitude média (o DF é pequeno: suficiente para ilustração)
const k = Math.cos(((minY + maxY) / 2) * (Math.PI / 180));
const escala = LARGURA / ((maxX - minX) * k);
const ALTURA = Math.round((maxY - minY) * escala);
const px = ([x, y]) => [+(((x - minX) * k) * escala).toFixed(1), +((maxY - y) * escala).toFixed(1)];

const normalizaCodigo = (c) => (c.startsWith('RA-') ? c : `RA-${c}`);
const titulo = (s) => s.toLowerCase().replace(/(^|\s|-)(\p{L})/gu, (m, a, b) => a + b.toUpperCase()).replace(/\b(Do|Da|De|Dos|Das)\b/g, (m) => m.toLowerCase());

const ras = geo.features.map((f) => {
  const partes = aneis(f.geometry);
  let d = '';
  let soma = [0, 0, 0];
  for (const poli of partes) {
    poli.forEach((anel, i) => {
      const pts = anel.map(px);
      d += 'M' + pts.map((p) => p.join(',')).join('L') + 'Z';
      if (i === 0) for (const p of pts) { soma[0] += p[0]; soma[1] += p[1]; soma[2]++; }
    });
  }
  return {
    nome: titulo(f.properties.ra_nome),
    codigo: normalizaCodigo(f.properties.ra_codigo),
    d,
    rotulo: [+(soma[0] / soma[2]).toFixed(1), +(soma[1] / soma[2]).toFixed(1)],
  };
});

// pontos ilustrativos dentro do DF (ponto-no-polígono no anel externo)
const dentro = (p, anel) => {
  let c = false;
  for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
    const [xi, yi] = anel[i], [xj, yj] = anel[j];
    if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
// mesmo número de pontos por RA: as RAs urbanas (pequenas) ficam densas e as rurais
// (grandes) ficam esparsas. É só efeito visual; não representa volume real de chamados.
let semente = 20261111;
const rnd = () => ((semente = (semente * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pontos = [];
const porRA = Math.round(PONTOS / geo.features.length);
for (const f of geo.features) {
  const externos = aneis(f.geometry).map((poli) => poli[0].map(px));
  const xs = externos.flat().map((p) => p[0]), ys = externos.flat().map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  let n = 0, tentativas = 0;
  while (n < porRA && tentativas++ < 50000) {
    const p = [x0 + rnd() * (x1 - x0), y0 + rnd() * (y1 - y0)];
    if (externos.some((a) => dentro(p, a))) { pontos.push([+p[0].toFixed(1), +p[1].toFixed(1)]); n++; }
  }
}

fs.mkdirSync(path.dirname(destino), { recursive: true });
fs.writeFileSync(destino, JSON.stringify({ largura: LARGURA, altura: ALTURA, fonte: 'IDE/DF (SEDUH), Regiões Administrativas, baixado em 07/11/2026', ras, pontos }));
console.log(`ras.json: ${ras.length} RAs, ${pontos.length} pontos, viewBox 0 0 ${LARGURA} ${ALTURA}, ${Math.round(fs.statSync(destino).size / 1024)} KB`);
console.log('Águas Claras:', ras.find((r) => /guas Claras/i.test(r.nome))?.codigo);

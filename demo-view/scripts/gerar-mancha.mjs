// Gera a mancha urbana do DF: onde os chamados SIMULADOS podem cair, e com que peso.
//
// Uso:   npm run mancha                       (baixa a mancha oficial da IDE/DF)
//        npm run mancha -- <arquivo.geojson>  (usa uma cópia já baixada)
// Lê:    "DF Mancha Urbana 2023" (GDF, IDE/DF, SEDUH): a ocupação urbana do DF,
//        traçada sobre imagem de 2023
//        public/dados/escolas.json, saude.json e favelas.json (dados reais, ver o README)
//        src/dominio/ras-geo.json (limites das RAs)
// Grava: src/dados/mancha.json
//
// Sem isto, cada chamado era sorteado numa nuvem em volta de um ponto só por RA,
// e o mapa de calor aparecia sobre cerrado e lavoura. Agora:
//
// 1. a cidade é dividida em células de ~200 m; só entram as que a mancha urbana
//    oficial cobre, ou que caem numa favela ou comunidade urbana (IBGE);
// 2. o peso de cada célula sobe perto de uma escola pública, de uma unidade
//    pública de saúde ou de uma comunidade: são lugares onde sabidamente mora
//    gente, e dão ao mapa os focos que uma cidade de verdade tem;
// 3. um ruído suave e fixo evita que bairros inteiros fiquem iguais.
//
// O gerador (src/dados/pontos.ts) sorteia a célula pelo peso e um ponto dentro
// dela. Os pontos continuam fictícios: a mancha só diz onde é plausível.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const ler = (caminho) => JSON.parse(readFileSync(join(raiz, caminho), "utf8"));

/** A camada "DF Mancha Urbana 2023", em lon/lat, simplificada a ~20 m. */
const URL_MANCHA =
  "https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Publico/IDEDF/MapServer/75/query" +
  "?where=1%3D1&outFields=macrozona,ano_img&returnGeometry=true&outSR=4326&geometryPrecision=5&maxAllowableOffset=0.0002&f=geojson";

const geo = ler("src/dominio/ras-geo.json");
const escolas = ler("public/dados/escolas.json");
const saude = ler("public/dados/saude.json");
const favelas = ler("public/dados/favelas.json");

/** Ocupação urbana em macrozona rural (chácaras, condomínios) é mais rala. */
const COBERTURA = { URBANA: 1, RURAL: 0.6 };
/** Lado da célula, em unidades de ~100 m. */
const LADO = 2;
/** Alcance de uma âncora (desvio da gaussiana), em metros. */
const ALCANCE_M = 450;
/** Peso de uma célula urbana longe de qualquer âncora. */
const BASE = 0.4;
const PESO_MAXIMO = 31;

const [GX, GY] = geo.grausPorUnidade; // graus por ~100 m
const [[OESTE, SUL], [LESTE, NORTE]] = geo.limites;
const DX = GX * LADO, DY = GY * LADO;
const NX = Math.ceil((LESTE - OESTE) / DX), NY = Math.ceil((NORTE - SUL) / DY);

// ---------------------------------------------------------------- geometria

function noAnel(lon, lat, anel) {
  let dentro = false;
  for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
    const [xi, yi] = anel[i], [xj, yj] = anel[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}
const poligonosDe = (g) => (g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : []);
const noPoligono = (aneis, lon, lat) => noAnel(lon, lat, aneis[0]) && !aneis.slice(1).some((b) => noAnel(lon, lat, b));
const raDoPonto = (lon, lat) => geo.regioes.find((ra) => poligonosDe(ra.geometria).some((p) => noPoligono(p, lon, lat)))?.id ?? null;

// Cobertura de cada célula (0 a 1): 4 amostras por célula.
const cobertura = new Float32Array(NX * NY);
const AMOSTRAS = [[0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]];

/** Soma `peso` às células que o polígono cobre. */
function pintar(aneis, peso) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of aneis[0]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const i0 = Math.max(0, Math.floor((x0 - OESTE) / DX)), i1 = Math.min(NX - 1, Math.floor((x1 - OESTE) / DX));
  const j0 = Math.max(0, Math.floor((y0 - SUL) / DY)), j1 = Math.min(NY - 1, Math.floor((y1 - SUL) / DY));
  for (let j = j0; j <= j1; j++) {
    for (let i = i0; i <= i1; i++) {
      let dentro = 0;
      for (const [ax, ay] of AMOSTRAS) if (noPoligono(aneis, OESTE + (i + ax) * DX, SUL + (j + ay) * DY)) dentro++;
      if (dentro) cobertura[j * NX + i] = Math.min(1, cobertura[j * NX + i] + (peso * dentro) / AMOSTRAS.length);
    }
  }
}

// ---------------------------------------------------------------- mancha urbana oficial

const arquivo = process.argv[2];
const mancha = arquivo ? JSON.parse(readFileSync(resolve(arquivo), "utf8")) : await (await fetch(URL_MANCHA)).json();
if (!mancha.features?.length) throw new Error("A mancha urbana veio vazia.");
if (mancha.exceededTransferLimit) throw new Error("A IDE/DF cortou a resposta; baixe em partes e passe o arquivo.");
let areaOficial = 0;
for (const f of mancha.features) {
  const peso = COBERTURA[f.properties.macrozona] ?? 0;
  if (!peso) continue;
  for (const aneis of poligonosDe(f.geometry)) pintar(aneis, peso);
  areaOficial++;
}
const anos = [...new Set(mancha.features.map((f) => f.properties.ano_img))].join(", ");

// Favelas e comunidades urbanas contam como cidade mesmo onde a mancha não chegou.
for (const f of favelas.features) for (const aneis of poligonosDe(f.geometry)) pintar(aneis, 1);

// ---------------------------------------------------------------- âncoras (dados reais)

const centro = (g) => {
  const anel = poligonosDe(g).map((p) => p[0]).sort((a, b) => b.length - a.length)[0];
  return [anel.reduce((s, p) => s + p[0], 0) / anel.length, anel.reduce((s, p) => s + p[1], 0) / anel.length];
};
const ancoras = [
  ...escolas.linhas.map((l) => [l[0], l[1], 1]),
  ...saude.linhas.map((l) => [l[0], l[1], 1]),
  ...favelas.features.map((f) => [...centro(f.geometry), 1.5]),
];

// Influência das âncoras em cada célula: soma de gaussianas, calculada só na vizinhança de cada uma.
const influencia = new Float32Array(NX * NY);
const desvio = ALCANCE_M / 100 / LADO; // em células
const alcance = Math.ceil(3 * desvio);
for (const [lon, lat, peso] of ancoras) {
  const ci = (lon - OESTE) / DX, cj = (lat - SUL) / DY;
  for (let j = Math.max(0, Math.floor(cj) - alcance); j <= Math.min(NY - 1, Math.floor(cj) + alcance); j++) {
    for (let i = Math.max(0, Math.floor(ci) - alcance); i <= Math.min(NX - 1, Math.floor(ci) + alcance); i++) {
      const d2 = ((i + 0.5 - ci) / desvio) ** 2 + ((j + 0.5 - cj) / desvio) ** 2;
      influencia[j * NX + i] += peso * Math.exp(-d2 / 2);
    }
  }
}

// Ruído suave e fixo (interpolação de valores numa grade de ~1 km), entre 0,65 e 1,5.
const semente = (i, j) => { let h = (i * 374761393 + j * 668265263) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
const suave = (t) => t * t * (3 - 2 * t);
function ruido(i, j) {
  const u = i / 5, v = j / 5, i0 = Math.floor(u), j0 = Math.floor(v), fu = suave(u - i0), fv = suave(v - j0);
  const a = semente(i0, j0), b = semente(i0 + 1, j0), c = semente(i0, j0 + 1), d = semente(i0 + 1, j0 + 1);
  return 0.65 + 0.85 * (a + (b - a) * fu + (c - a) * fv + (a - b - c + d) * fu * fv);
}

// ---------------------------------------------------------------- saída

const brutos = [];
let maior = 0;
for (let j = 0; j < NY; j++) {
  for (let i = 0; i < NX; i++) {
    const c = cobertura[j * NX + i];
    if (c < 0.25) continue;
    const ra = raDoPonto(OESTE + (i + 0.5) * DX, SUL + (j + 0.5) * DY);
    if (!ra) continue;
    // A influência satura: dez escolas juntas não valem dez vezes uma.
    const peso = c * (BASE + Math.min(2.2, influencia[j * NX + i])) * ruido(i, j);
    if (peso > maior) maior = peso;
    brutos.push([ra, i, j, peso]);
  }
}
const ras = {};
for (const [ra, i, j, peso] of brutos) (ras[ra] ??= []).push(i, j, Math.max(1, Math.round((peso / maior) * PESO_MAXIMO)));
const ordenado = Object.fromEntries(geo.regioes.filter((r) => ras[r.id]).map((r) => [r.id, ras[r.id]]));

writeFileSync(
  join(raiz, "src/dados/mancha.json"),
  JSON.stringify({
    nota: "Mancha urbana do DF, usada só para sortear onde caem os chamados SIMULADOS. Gerada por scripts/gerar-mancha.mjs; não editar à mão.",
    fontes: [`DF Mancha Urbana ${anos}: GDF, IDE/DF (SEDUH), serviço Publico/IDEDF, camada 75`, escolas.fonte, saude.fonte, favelas.fonte],
    origem: [OESTE, SUL],
    passo: [DX, DY],
    campos: "por RA: coluna, linha e peso de cada célula, em sequência",
    ras: ordenado,
  }),
);

const km2 = (n) => (n * (LADO * 0.1) ** 2).toFixed(0);
console.log(`${areaOficial} polígonos da mancha urbana ${anos}; ${brutos.length} células de ${LADO * 100} m (${km2(brutos.length)} km²) em ${Object.keys(ras).length} RAs → src/dados/mancha.json`);
console.log(geo.regioes.map((r) => `${r.nome}: ${km2((ras[r.id]?.length ?? 0) / 3)} km²`).join(" · "));
const sem = geo.regioes.filter((r) => !ras[r.id]).map((r) => r.nome);
if (sem.length) console.log(`Sem mancha (o sorteio usa o núcleo urbano): ${sem.join(", ")}`);

// Gera os dados geográficos da demo a partir dos limites oficiais das RAs (assets/geo/ra_gdf.geojson, IDE/DF):
//   src/mapa/ras.geo.json      contornos simplificados (lon/lat) com nome, código e ponto do rótulo
//   src/dados/exemplos.json    chamados de EXEMPLO (simulados) dentro das RAs, para vestir a interface
// Os exemplos são determinísticos e sempre rotulados como simulados na tela. Não são dados do DF.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mapshaper from 'mapshaper';

const aqui = path.dirname(fileURLToPath(import.meta.url));
const origem = path.resolve(aqui, '../../assets/geo/ra_gdf.geojson');
const destinoMapa = path.resolve(aqui, '../src/mapa/ras.geo.json');
const destinoDados = path.resolve(aqui, '../src/dados/exemplos.json');

const saida = await mapshaper.applyCommands(
  '-i entrada.json -simplify 6% keep-shapes -o saida.json format=geojson precision=0.00001',
  { 'entrada.json': fs.readFileSync(origem, 'utf8') },
);
const geo = JSON.parse(saida['saida.json']);
const aneis = (g) => (g.type === 'Polygon' ? [g.coordinates] : g.coordinates);
const titulo = (s) => s.toLowerCase().replace(/(^|\s|-)(\p{L})/gu, (m, a, b) => a + b.toUpperCase()).replace(/\b(Do|Da|De|Dos|Das)\b/g, (m) => m.toLowerCase());
const codigo = (c) => (c.startsWith('RA-') ? c : `RA-${c}`);

for (const f of geo.features) {
  const ext = aneis(f.geometry)[0][0];
  const cx = ext.reduce((s, p) => s + p[0], 0) / ext.length, cy = ext.reduce((s, p) => s + p[1], 0) / ext.length;
  f.properties = { nome: titulo(f.properties.ra_nome), codigo: codigo(f.properties.ra_codigo), rotulo: [+cx.toFixed(5), +cy.toFixed(5)] };
}

// chamados de exemplo: mesmo número por RA (só para a interface ter o que mostrar)
const dentro = (p, anel) => {
  let c = false;
  for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
    const [xi, yi] = anel[i], [xj, yj] = anel[j];
    if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
let semente = 11112026;
const rnd = () => (semente = (semente * 1664525 + 1013904223) % 4294967296) / 4294967296;
// áreas na ordem dos tokens --area-0..6, com peso e exemplos de assunto
const AREAS = [
  { peso: 22, assuntos: ['Reclamação sobre atendimento', 'Pedido de informação', 'Denúncia de obra irregular'] },
  { peso: 20, assuntos: ['Som alto de madrugada', 'Veículo abandonado', 'Movimentação suspeita'] },
  { peso: 16, assuntos: ['Poste apagado', 'Lâmpada piscando', 'Praça sem iluminação'] },
  { peso: 14, assuntos: ['Buraco na via', 'Placa caída', 'Semáforo com defeito'] },
  { peso: 12, assuntos: ['Falta d’água', 'Vazamento na calçada', 'Esgoto a céu aberto'] },
  { peso: 10, assuntos: ['Entulho na calçada', 'Coleta não passou', 'Mato alto em lote'] },
  { peso: 6, assuntos: ['Queda de energia', 'Fio solto no poste', 'Oscilação de energia'] },
];
const total = AREAS.reduce((s, a) => s + a.peso, 0);
const sorteiaArea = () => { let r = rnd() * total; for (let k = 0; k < AREAS.length; k++) { r -= AREAS[k].peso; if (r <= 0) return k; } return 0; };
const chamados = [];
for (const f of geo.features) {
  const ext = aneis(f.geometry).map((p) => p[0]);
  const xs = ext.flat().map((p) => p[0]), ys = ext.flat().map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  let n = 0, tent = 0;
  while (n < 9 && tent++ < 20000) {
    const p = [x0 + rnd() * (x1 - x0), y0 + rnd() * (y1 - y0)];
    if (!ext.some((a) => dentro(p, a))) continue;
    const area = sorteiaArea();
    const r = rnd();
    chamados.push({
      id: `EX-${String(chamados.length + 1).padStart(4, '0')}`,
      lon: +p[0].toFixed(5), lat: +p[1].toFixed(5),
      area, assunto: AREAS[area].assuntos[Math.floor(rnd() * 3)],
      ra: f.properties.nome,
      situacao: r < 0.55 ? 0 : r < 0.8 ? 1 : 2, // 0 resolvido · 1 em resolução · 2 aberto
      minutos: Math.floor(rnd() * 600),
    });
    n++;
  }
}

fs.mkdirSync(path.dirname(destinoMapa), { recursive: true });
fs.mkdirSync(path.dirname(destinoDados), { recursive: true });
fs.writeFileSync(destinoMapa, JSON.stringify(geo));
fs.writeFileSync(destinoDados, JSON.stringify({ aviso: 'Exemplos simulados para a interface. Não são dados do DF.', chamados }));
console.log(`ras.geo.json: ${geo.features.length} RAs, ${Math.round(fs.statSync(destinoMapa).size / 1024)} KB`);
console.log(`exemplos.json: ${chamados.length} chamados simulados`);

// Gera out/CityView_Apresentacao.pptx (18 slides, direção C · Híbrida).
// Texto: src/conteudo.js (espelho do docs/CV-APR-001). Tokens: src/tema.js.
const path = require('path');
const fs = require('fs');
const PptxGenJS = require('pptxgenjs');
const T = require('./tema');
const C = require('./conteudo');

const { W, H, cor, fonte } = T;
const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.title = 'City View · Apresentação base';
pptx.company = 'DataSynq';
const SH = pptx.ShapeType;
const TOTAL = 18;
let contagem = 0;
const novoSlide = () => { contagem++; return pptx.addSlide(); };

// ---------- utilitários ----------
const semLinha = { color: 'FFFFFF', width: 0, transparency: 100 };
const txt = (s, text, o) => s.addText(text, { margin: 0, valign: 'top', ...o });
const ret = (s, x, y, w, h, fill, extra = {}) =>
  s.addShape(SH.rect, { x, y, w, h, fill: { color: fill }, line: semLinha, ...extra });
const linha = (s, x, y, w, h, color, width = 1, extra = {}) =>
  s.addShape(SH.line, { x, y, w, h, line: { color, width, ...extra } });
const logo = (s, escuro, x, y, w) =>
  s.addImage({ path: escuro ? T.logo.sobreEscuro : T.logo.sobreClaro, x, y, w, h: w / T.logo.proporcao });
const notas = (s, c) => s.addNotes(`${c.fala}\n\nOrigem: ${c.origem}`);

const fundoImagem = (s, nome) => {
  const h = W / T.proporcaoImagem;
  s.addImage({ path: T.imagem(nome), x: 0, y: (H - h) / 2, w: W, h });
};
// véu navy da esquerda para a direita, em faixas (pptxgenjs não tem gradiente em forma)
const veu = (s, inicio, fim, opaco = 8) => {
  ret(s, 0, 0, inicio, H, cor.escuro, { fill: { color: cor.escuro, transparency: opaco } });
  const n = 16;
  const passo = (fim - inicio) / n;
  for (let i = 0; i < n; i++) {
    const t = opaco + ((100 - opaco) * (i + 1)) / (n + 1);
    ret(s, inicio + i * passo, 0, passo + 0.01, H, cor.escuro, { fill: { color: cor.escuro, transparency: Math.round(t) } });
  }
};
const legendaImagem = (s) =>
  txt(s, 'Imagem ilustrativa', { x: W - 3.3, y: 7.08, w: 3.0, h: 0.22, fontFace: fonte.corpo, fontSize: 8.5, color: cor.tinta3, align: 'right' });

const selo = (s, texto, escuro = false) => {
  const w = Math.max(1.45, 0.11 * texto.length + 0.5);
  ret(s, W - 0.65 - w, 0.35, w, 0.32, cor.ambar);
  txt(s, texto.toUpperCase(), { x: W - 0.65 - w, y: 0.35, w, h: 0.32, fontFace: fonte.rotulo, fontSize: 10.5, color: cor.tinta, align: 'center', valign: 'middle', charSpacing: 1.5 });
};

// moldura comum dos slides de conteúdo
function moldura(n, kicker, { escuro = false, tag = null, titulo, sub } = {}) {
  const s = novoSlide();
  s.background = { color: escuro ? cor.escuro : cor.claro };
  ret(s, 0, 0, 0.14, H, cor.teal);
  txt(s, kicker.toUpperCase(), { x: 0.7, y: 0.38, w: 8.5, h: 0.28, fontFace: fonte.rotulo, fontSize: 12, color: escuro ? cor.tealClaro : cor.teal, charSpacing: 2 });
  if (tag) selo(s, tag, escuro);
  if (titulo) txt(s, titulo, { x: 0.7, y: 0.82, w: 11.9, h: 0.7, fontFace: fonte.titulo, fontSize: 32, color: escuro ? 'FFFFFF' : cor.tinta });
  if (sub) txt(s, sub, { x: 0.7, y: 1.45, w: 11.9, h: 0.55, fontFace: fonte.leve, fontSize: 24, color: escuro ? cor.textoSobreEscuro : cor.tinta2 });
  logo(s, escuro, 0.7, 6.95, 1.25);
  txt(s, String(n).padStart(2, '0'), { x: W - 1.4, y: 6.98, w: 0.75, h: 0.3, fontFace: fonte.titulo, fontSize: 12, color: escuro ? cor.tinta3 : cor.tinta2, align: 'right' });
  return s;
}
const rodapeFonte = (s, texto, escuro = false, y = 6.5) =>
  txt(s, texto, { x: 0.7, y, w: 11.9, h: 0.3, fontFace: fonte.corpo, fontSize: 9.5, color: escuro ? cor.tinta3 : cor.tinta2 });

// caixa de painel claro com título e descrição
function caixa(s, x, y, w, h, t, d, { escura = false, barra = null, tamT = 16, tamD = 12 } = {}) {
  ret(s, x, y, w, h, escura ? cor.escuro : cor.painel);
  if (barra) ret(s, x, y, 0.08, h, barra);
  txt(s, t, { x: x + 0.25, y: y + 0.18, w: w - 0.4, h: 0.42, fontFace: fonte.titulo, fontSize: tamT, color: escura ? 'FFFFFF' : cor.tinta });
  if (d) txt(s, d, { x: x + 0.25, y: y + 0.18 + tamT / 40 + 0.12, w: w - 0.4, h: h - 0.7, fontFace: fonte.corpo, fontSize: tamD, color: escura ? cor.tealClaro : cor.tinta2 });
}
const seta = (s, x, y, w, h, color = cor.tinta3, extra = {}) =>
  linha(s, x, y, w, h, color, 1.5, { endArrowType: 'triangle', ...extra });

// pílula de situação: já funciona / em parte / proposta / em uso / etc.
function pilula(s, x, y, texto) {
  const forte = /já funciona|em uso|tudo certo|em dia/.test(texto);
  const meio = /em parte|pronta|pronto|protótipo/.test(texto);
  const fundo = forte ? cor.teal : meio ? 'DDF2F6' : 'FFFFFF';
  const corTxt = forte ? 'FFFFFF' : meio ? cor.teal : cor.tinta2;
  const w = 0.09 * texto.length + 0.45;
  s.addShape(SH.roundRect, { x, y, w, h: 0.3, rectRadius: 0.15, fill: { color: fundo }, line: forte || meio ? semLinha : { color: cor.tinta3, width: 0.75, dashType: 'dash' } });
  txt(s, texto, { x, y, w, h: 0.3, fontFace: fonte.rotulo, fontSize: 10.5, color: corTxt, align: 'center', valign: 'middle', charSpacing: 0.5 });
  return w;
}

// ================= SLIDES =================

// 1 · Capa
(() => {
  const c = C.s1;
  const s = novoSlide();
  s.background = { color: cor.escuro };
  fundoImagem(s, 'teste-01-capa-cidade');
  veu(s, 4.2, 8.2);
  ret(s, 0, 0, 0.14, H, cor.teal);
  txt(s, c.rotulo.toUpperCase(), { x: 0.8, y: 2.0, w: 6.5, h: 0.3, fontFace: fonte.rotulo, fontSize: 13, color: cor.tealClaro, charSpacing: 2.5 });
  txt(s, c.titulo.toUpperCase(), { x: 0.8, y: 2.4, w: 6.6, h: 1.3, fontFace: fonte.titulo, fontSize: 76, color: 'FFFFFF' });
  ret(s, 0.82, 3.85, 1.1, 0.08, cor.ambar);
  txt(s, c.sub, { x: 0.8, y: 4.15, w: 6.5, h: 0.6, fontFace: fonte.leve, fontSize: 26, color: cor.textoSobreEscuro });
  logo(s, true, 0.8, 6.5, 1.7);
  txt(s, c.data.toUpperCase(), { x: 3.0, y: 6.6, w: 3.5, h: 0.25, fontFace: fonte.rotulo, fontSize: 11, color: cor.tinta3, charSpacing: 2 });
  legendaImagem(s);
  notas(s, c);
})();

// 2 · A promessa
(() => {
  const c = C.s2;
  const s = novoSlide();
  s.background = { color: cor.escuro };
  ret(s, 0, 0, 0.14, H, cor.teal);
  txt(s, c.linhas[0], { x: 0.9, y: 2.3, w: 11.5, h: 1.1, fontFace: fonte.titulo, fontSize: 60, color: 'FFFFFF' });
  txt(s, c.linhas[1], { x: 0.9, y: 3.45, w: 11.5, h: 1.1, fontFace: fonte.leve, fontSize: 60, color: cor.ambar });
  logo(s, true, 0.7, 6.95, 1.25);
  txt(s, '02', { x: W - 1.4, y: 6.98, w: 0.75, h: 0.3, fontFace: fonte.titulo, fontSize: 12, color: cor.tinta3, align: 'right' });
  notas(s, c);
})();

// 3 · Divisória: o problema
(() => {
  const c = C.s3;
  const s = novoSlide();
  s.background = { color: cor.escuro };
  fundoImagem(s, 'teste-02-silos');
  ret(s, 0, 0, 0.14, H, cor.teal);
  txt(s, c.kicker.toUpperCase(), { x: 0.8, y: 0.75, w: 6, h: 0.3, fontFace: fonte.rotulo, fontSize: 13, color: cor.tealClaro, charSpacing: 2.5 });
  txt(s, c.titulo, { x: 0.8, y: 1.15, w: 11.5, h: 0.8, fontFace: fonte.titulo, fontSize: 44, color: 'FFFFFF' });
  legendaImagem(s);
  notas(s, c);
})();

// 4 · Separado, tudo funciona
(() => {
  const c = C.s4;
  const s = moldura(4, c.kicker, { tag: 'Ilustrativo', titulo: c.titulo, sub: c.sub });
  const n = c.areas.length;
  const gap = 0.25;
  const w = (W - 1.4 - gap * (n - 1)) / n;
  c.areas.forEach(([t, d], i) => {
    const x = 0.7 + i * (w + gap);
    ret(s, x, 2.45, w, 2.35, cor.painel);
    ret(s, x, 2.45, w, 0.07, cor.teal);
    txt(s, t, { x: x + 0.25, y: 2.72, w: w - 0.5, h: 0.45, fontFace: fonte.titulo, fontSize: 20, color: cor.tinta });
    txt(s, d, { x: x + 0.25, y: 3.18, w: w - 0.5, h: 0.35, fontFace: fonte.corpo, fontSize: 13, color: cor.tinta2 });
    pilula(s, x + 0.25, 4.25, c.status);
  });
  ret(s, 0.7, 5.15, W - 1.4, 0.95, cor.ambar);
  txt(s, c.faixaRotulo.toUpperCase(), { x: 1.0, y: 5.4, w: 3, h: 0.45, fontFace: fonte.rotulo, fontSize: 14, color: cor.tinta, charSpacing: 2, valign: 'middle' });
  txt(s, c.faixa, { x: 4.0, y: 5.35, w: 8.4, h: 0.55, fontFace: fonte.titulo, fontSize: 24, color: cor.tinta, align: 'right', valign: 'middle' });
  notas(s, c);
})();

// 5 · Na cidade, os silos são os órgãos
(() => {
  const c = C.s5;
  const s = moldura(5, c.kicker, { titulo: c.titulo, sub: c.sub });
  const n = c.orgaos.length;
  const gap = 0.14;
  const w = (W - 1.4 - gap * (n - 1)) / n;
  c.orgaos.forEach(([t, d], i) => {
    const x = 0.7 + i * (w + gap);
    ret(s, x, 2.4, w, 1.65, cor.painel);
    ret(s, x, 2.4, w, 0.07, cor.teal);
    txt(s, t, { x: x + 0.15, y: 2.62, w: w - 0.3, h: 0.4, fontFace: fonte.titulo, fontSize: 16, color: cor.tinta });
    txt(s, d, { x: x + 0.15, y: 3.02, w: w - 0.3, h: 0.35, fontFace: fonte.corpo, fontSize: 12, color: cor.tinta2 });
    pilula(s, x + 0.15, 3.55, 'em dia');
  });
  txt(s, c.exemploRotulo.toUpperCase(), { x: 0.7, y: 4.4, w: 8, h: 0.3, fontFace: fonte.rotulo, fontSize: 13, color: cor.teal, charSpacing: 2 });
  c.exemplo.forEach(([q, quem], i) => {
    const x = 0.7 + i * 6.05;
    ret(s, x, 4.8, 5.85, 1.0, cor.escuro);
    txt(s, q, { x: x + 0.3, y: 4.8, w: 3.4, h: 1.0, fontFace: fonte.corpo, fontSize: 18, color: cor.textoSobreEscuro, valign: 'middle' });
    seta(s, x + 3.55, 5.3, 0.55, 0, cor.tealClaro);
    txt(s, quem, { x: x + 4.2, y: 4.8, w: 1.6, h: 1.0, fontFace: fonte.titulo, fontSize: 18, color: cor.ambar, valign: 'middle' });
  });
  rodapeFonte(s, c.fonte);
  notas(s, c);
})();

// 6 · O tamanho das filas (escuro)
(() => {
  const c = C.s6;
  const s = moldura(6, c.kicker, { escuro: true, titulo: c.titulo });
  const w = (W - 1.4 - 2 * 0.4) / 3;
  c.numeros.forEach((it, i) => {
    const x = 0.7 + i * (w + 0.4);
    if (i > 0) linha(s, x - 0.2, 2.2, 0, 3.4, cor.linhaEscura, 1.25);
    txt(s, it.n, { x, y: 2.1, w, h: 1.2, fontFace: fonte.leve, fontSize: it.n.length > 8 ? 54 : 66, color: i === 0 ? 'FFFFFF' : i === 1 ? cor.ambar : cor.tealClaro });
    txt(s, it.l, { x, y: 3.45, w: w - 0.2, h: 0.9, fontFace: fonte.corpo, fontSize: 17, color: cor.rotuloSobreEscuro });
    txt(s, it.p.toUpperCase(), { x, y: 4.45, w, h: 0.3, fontFace: fonte.rotulo, fontSize: 12, color: cor.tealClaro, charSpacing: 1.5 });
    txt(s, it.f, { x, y: 4.8, w: w - 0.2, h: 0.5, fontFace: fonte.corpo, fontSize: 10, color: cor.tinta3 });
  });
  txt(s, c.nota, { x: 0.7, y: 5.9, w: 11.9, h: 0.35, fontFace: fonte.rotulo, fontSize: 14, color: cor.tealClaro, charSpacing: 1.5 });
  notas(s, c);
})();

// 7 · O mesmo barulho, duas portas
(() => {
  const c = C.s7;
  const s = moldura(7, c.kicker, { titulo: c.titulo });
  txt(s, c.n1, { x: 0.7, y: 1.9, w: 5.6, h: 1.7, fontFace: fonte.leve, fontSize: 118, color: cor.tinta });
  txt(s, c.l1, { x: 0.75, y: 3.75, w: 5.5, h: 0.9, fontFace: fonte.corpo, fontSize: 19, color: cor.tinta2 });
  linha(s, 6.6, 2.15, 0, 2.55, cor.regua, 1.25);
  txt(s, c.n2, { x: 7.1, y: 1.9, w: 5.6, h: 1.7, fontFace: fonte.leve, fontSize: 118, color: cor.teal });
  txt(s, c.l2, { x: 7.15, y: 3.75, w: 5.5, h: 0.9, fontFace: fonte.corpo, fontSize: 19, color: cor.tinta2 });
  ret(s, 0.7, 5.05, W - 1.4, 0.85, cor.escuro);
  txt(s, c.destaque, { x: 1.0, y: 5.05, w: W - 2.0, h: 0.85, fontFace: fonte.titulo, fontSize: 20, color: 'FFFFFF', valign: 'middle' });
  rodapeFonte(s, c.fonte);
  notas(s, c);
})();

// 8 · Parece uma coisa, é outra
(() => {
  const c = C.s8;
  const s = moldura(8, c.kicker, { tag: 'Cenário ilustrativo', titulo: c.titulo });
  caixa(s, 0.7, 2.2, 3.6, 1.25, c.entradas[0][0], c.entradas[0][1], { barra: cor.teal, tamT: 18, tamD: 13 });
  caixa(s, 0.7, 3.85, 3.6, 1.25, c.entradas[1][0], c.entradas[1][1], { barra: cor.teal, tamT: 18, tamD: 13 });
  // conectores em cotovelo até o centro
  linha(s, 4.3, 2.82, 0.6, 0, cor.tinta3, 1.5);
  linha(s, 4.3, 4.47, 0.6, 0, cor.tinta3, 1.5);
  linha(s, 4.9, 2.82, 0, 1.65, cor.tinta3, 1.5);
  seta(s, 4.9, 3.65, 0.6, 0);
  caixa(s, 5.5, 3.0, 3.3, 1.3, c.centro[0], c.centro[1], { escura: true, tamT: 22, tamD: 14 });
  seta(s, 8.8, 3.65, 0.7, 0);
  ret(s, 9.5, 3.0, 3.13, 1.3, cor.ambar);
  txt(s, c.saida[0], { x: 9.75, y: 3.18, w: 2.7, h: 0.45, fontFace: fonte.titulo, fontSize: 22, color: cor.tinta });
  txt(s, c.saida[1], { x: 9.75, y: 3.7, w: 2.7, h: 0.4, fontFace: fonte.corpo, fontSize: 14, color: cor.tinta });
  linha(s, 0.7, 5.6, W - 1.4, 0, cor.regua, 1);
  txt(s, [{ text: c.rodape[0] + '  ', options: { fontFace: fonte.titulo, color: cor.tinta } }, { text: c.rodape[1], options: { fontFace: fonte.corpo, color: cor.tinta2 } }], { x: 0.7, y: 5.8, w: 11.9, h: 0.45, fontSize: 18 });
  notas(s, c);
})();

// 9 · Divisória: a proposta
(() => {
  const c = C.s9;
  const s = novoSlide();
  s.background = { color: cor.escuro };
  fundoImagem(s, 'divisoria-proposta');
  veu(s, 4.6, 8.0);
  ret(s, 0, 0, 0.14, H, cor.teal);
  txt(s, c.kicker.toUpperCase(), { x: 0.8, y: 2.0, w: 6, h: 0.3, fontFace: fonte.rotulo, fontSize: 13, color: cor.tealClaro, charSpacing: 2.5 });
  txt(s, c.titulo, { x: 0.8, y: 2.45, w: 6.4, h: 2.6, fontFace: fonte.titulo, fontSize: 38, color: 'FFFFFF' });
  legendaImagem(s);
  notas(s, c);
})();

// 10 · Cinco camadas, três visões
(() => {
  const c = C.s10;
  const s = moldura(10, c.kicker, { titulo: c.titulo });
  const x0 = 0.7, wL = 8.0, h = 0.72, g = 0.14, y0 = 1.75;
  c.camadas.forEach((k, i) => {
    const y = y0 + i * (h + g);
    const destaque = k.n === '5';
    ret(s, x0, y, wL, h, destaque ? cor.escuro : cor.painel);
    txt(s, k.n, { x: x0 + 0.2, y, w: 0.5, h, fontFace: fonte.titulo, fontSize: 24, color: destaque ? cor.tealClaro : cor.teal, valign: 'middle' });
    txt(s, k.t, { x: x0 + 0.75, y: y + 0.08, w: 5.2, h: 0.35, fontFace: fonte.titulo, fontSize: 16, color: destaque ? 'FFFFFF' : cor.tinta });
    txt(s, k.d, { x: x0 + 0.75, y: y + 0.4, w: 5.4, h: 0.3, fontFace: fonte.corpo, fontSize: 11.5, color: destaque ? cor.textoSobreEscuro : cor.tinta2 });
    const pw = 0.09 * k.s.length + 0.45;
    pilula(s, x0 + wL - pw - 0.2, y + (h - 0.3) / 2, k.s);
    if (i < c.camadas.length - 1) seta(s, x0 + 0.45, y + h, 0, g, cor.tinta3, { width: 1 });
  });
  // visões
  const xV = 9.55, wV = 3.08, hV = 1.0;
  const yLast = y0 + 4 * (h + g) + h / 2;
  c.visoes.forEach(([t, d], i) => {
    const y = 2.05 + i * (hV + 0.28);
    caixa(s, xV, y, wV, hV, t, d, { barra: i === 0 ? cor.ambar : cor.teal, tamT: 17, tamD: 12 });
  });
  // ligação da camada 5 às visões
  linha(s, x0 + wL, yLast, 0.45, 0, cor.tinta3, 1.5);
  linha(s, x0 + wL + 0.45, 2.55, 0, yLast - 2.55, cor.tinta3, 1.5);
  [0, 1, 2].forEach((i) => seta(s, x0 + wL + 0.45, 2.55 + i * (hV + 0.28), xV - (x0 + wL + 0.45), 0));
  rodapeFonte(s, c.legenda, false, 6.35);
  notas(s, c);
})();

// 11 · Camadas 1 e 2
(() => {
  const c = C.s11;
  const s = moldura(11, c.kicker, { titulo: c.titulo, sub: c.sub });
  txt(s, 'CANAIS', { x: 0.7, y: 2.3, w: 4, h: 0.3, fontFace: fonte.rotulo, fontSize: 13, color: cor.teal, charSpacing: 2 });
  c.canais.forEach(([t, st], i) => {
    const y = 2.72 + i * 0.82;
    ret(s, 0.7, y, 4.9, 0.68, cor.painel);
    txt(s, t, { x: 0.95, y, w: 2.6, h: 0.68, fontFace: fonte.titulo, fontSize: 16, color: cor.tinta, valign: 'middle' });
    const pw = 0.09 * st.length + 0.45;
    pilula(s, 0.7 + 4.9 - pw - 0.2, y + 0.19, st);
  });
  seta(s, 5.8, 4.1, 0.6, 0);
  txt(s, 'PONTE DE ABERTURA DE DEMANDAS', { x: 6.6, y: 2.3, w: 6, h: 0.3, fontFace: fonte.rotulo, fontSize: 13, color: cor.teal, charSpacing: 2 });
  c.passos.forEach((p, i) => {
    const y = 2.72 + i * 0.66;
    ret(s, 6.6, y, 6.03, 0.54, i === c.passos.length - 1 ? cor.escuro : cor.painel);
    txt(s, String(i + 1), { x: 6.8, y, w: 0.4, h: 0.54, fontFace: fonte.titulo, fontSize: 16, color: i === c.passos.length - 1 ? cor.tealClaro : cor.teal, valign: 'middle' });
    txt(s, p, { x: 7.25, y, w: 5.2, h: 0.54, fontFace: fonte.corpo, fontSize: 15, color: i === c.passos.length - 1 ? 'FFFFFF' : cor.tinta, valign: 'middle' });
  });
  notas(s, c);
})();

// 12 · Camada 3: hub
(() => {
  const c = C.s12;
  const s = moldura(12, c.kicker, { titulo: c.titulo, sub: c.sub });
  const cx = W / 2, cy = 4.12, r = 1.55; // raio vertical; o horizontal é r + 2.15
  const nos = [...c.ligados.map(([t, st]) => ({ t, st, cheio: true })), ...c.exemplos.map((t) => ({ t, st: 'exemplo', cheio: false }))];
  const wN = 2.15, hN = 0.66;
  nos.forEach((no, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / nos.length;
    const nx = cx + Math.cos(a) * (r + 2.15) - wN / 2;
    const ny = cy + Math.sin(a) * r - hN / 2;
    // linha do centro ao nó
    const x1 = cx, y1 = cy, x2 = nx + wN / 2, y2 = ny + hN / 2;
    s.addShape(SH.line, {
      x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1) || 0.001, h: Math.abs(y2 - y1) || 0.001,
      flipH: x2 < x1, flipV: y2 < y1,
      line: { color: no.cheio ? cor.teal : cor.tinta3, width: no.cheio ? 2 : 1.25, dashType: no.cheio ? 'solid' : 'dash' },
    });
    s.addShape(SH.roundRect, { x: nx, y: ny, w: wN, h: hN, rectRadius: 0.1, fill: { color: no.cheio ? 'DDF2F6' : 'FFFFFF' }, line: no.cheio ? { color: cor.teal, width: 1.25 } : { color: cor.tinta3, width: 1, dashType: 'dash' } });
    txt(s, no.t, { x: nx, y: ny + 0.06, w: wN, h: 0.32, fontFace: fonte.titulo, fontSize: 13.5, color: cor.tinta, align: 'center' });
    txt(s, no.st, { x: nx, y: ny + 0.36, w: wN, h: 0.24, fontFace: fonte.corpo, fontSize: 10, color: no.cheio ? cor.teal : cor.tinta2, align: 'center' });
  });
  s.addShape(SH.ellipse, { x: cx - 0.85, y: cy - 0.85, w: 1.7, h: 1.7, fill: { color: cor.escuro }, line: { color: cor.teal, width: 2 } });
  txt(s, 'City View', { x: cx - 0.85, y: cy - 0.3, w: 1.7, h: 0.6, fontFace: fonte.titulo, fontSize: 20, color: 'FFFFFF', align: 'center', valign: 'middle' });
  txt(s, c.meios, { x: 0.7, y: 6.25, w: 11.9, h: 0.35, fontFace: fonte.rotulo, fontSize: 14, color: cor.teal, align: 'center', charSpacing: 1.5 });
  txt(s, c.legenda, { x: 0.7, y: 6.6, w: 11.9, h: 0.25, fontFace: fonte.corpo, fontSize: 9.5, color: cor.tinta2, align: 'center' });
  notas(s, c);
})();

// 13 · Camadas 4 e 5: cartão de insight
(() => {
  const c = C.s13;
  const k = c.cartao;
  const s = moldura(13, c.kicker, { tag: 'Ilustrativo', titulo: c.titulo, sub: c.sub });
  // cartão
  const x = 0.7, y = 2.3, w = 8.3, h = 4.25;
  ret(s, x, y, w, h, cor.escuro);
  ret(s, x, y, w, 0.07, cor.ambar);
  txt(s, k.tipo.toUpperCase(), { x: x + 0.35, y: y + 0.25, w: 4, h: 0.3, fontFace: fonte.rotulo, fontSize: 12, color: cor.ambar, charSpacing: 2 });
  txt(s, `Confiança: ${k.confianca}`, { x: x + w - 3.3, y: y + 0.25, w: 3.0, h: 0.3, fontFace: fonte.rotulo, fontSize: 12, color: cor.tealClaro, align: 'right', charSpacing: 1.5 });
  txt(s, k.titulo, { x: x + 0.35, y: y + 0.6, w: w - 0.7, h: 0.5, fontFace: fonte.titulo, fontSize: 22, color: 'FFFFFF' });
  txt(s, 'O QUE A IA VIU', { x: x + 0.35, y: y + 1.25, w: 3, h: 0.25, fontFace: fonte.rotulo, fontSize: 10.5, color: cor.tinta3, charSpacing: 1.5 });
  txt(s, k.viu, { x: x + 0.35, y: y + 1.5, w: w - 0.7, h: 0.75, fontFace: fonte.corpo, fontSize: 13.5, color: cor.textoSobreEscuro });
  txt(s, 'POR QUÊ', { x: x + 0.35, y: y + 2.3, w: 3, h: 0.25, fontFace: fonte.rotulo, fontSize: 10.5, color: cor.tinta3, charSpacing: 1.5 });
  let px = x + 0.35;
  k.porque.forEach((p) => {
    const pw = 0.072 * p.length + 0.3;
    s.addShape(SH.roundRect, { x: px, y: y + 2.58, w: pw, h: 0.32, rectRadius: 0.16, fill: { color: cor.escuro2 }, line: { color: cor.linhaEscura, width: 1 } });
    txt(s, p, { x: px, y: y + 2.58, w: pw, h: 0.32, fontFace: fonte.corpo, fontSize: 11, color: cor.tealClaro, align: 'center', valign: 'middle' });
    px += pw + 0.12;
  });
  txt(s, 'O QUE SUGERE', { x: x + 0.35, y: y + 3.05, w: 3, h: 0.25, fontFace: fonte.rotulo, fontSize: 10.5, color: cor.tinta3, charSpacing: 1.5 });
  txt(s, k.sugere, { x: x + 0.35, y: y + 3.3, w: 5.4, h: 0.75, fontFace: fonte.corpo, fontSize: 13.5, color: 'FFFFFF' });
  // botões
  ret(s, x + w - 2.55, y + h - 0.75, 1.1, 0.45, cor.teal);
  txt(s, 'Confirmar', { x: x + w - 2.55, y: y + h - 0.75, w: 1.1, h: 0.45, fontFace: fonte.titulo, fontSize: 12, color: 'FFFFFF', align: 'center', valign: 'middle' });
  s.addShape(SH.rect, { x: x + w - 1.35, y: y + h - 0.75, w: 1.1, h: 0.45, fill: { color: cor.escuro }, line: { color: cor.tinta3, width: 1 } });
  txt(s, 'Descartar', { x: x + w - 1.35, y: y + h - 0.75, w: 1.1, h: 0.45, fontFace: fonte.titulo, fontSize: 12, color: cor.textoSobreEscuro, align: 'center', valign: 'middle' });
  // lado direito
  c.lado.forEach((t, i) => {
    const yy = 2.3 + i * 0.72;
    ret(s, 9.4, yy, 3.23, 0.58, cor.painel);
    ret(s, 9.4, yy, 0.08, 0.58, cor.teal);
    txt(s, t, { x: 9.65, y: yy, w: 2.9, h: 0.58, fontFace: fonte.titulo, fontSize: 17, color: cor.tinta, valign: 'middle' });
  });
  txt(s, c.decide, { x: 9.4, y: 5.3, w: 3.23, h: 1.2, fontFace: fonte.titulo, fontSize: 17, color: cor.teal });
  notas(s, c);
})();

// 14 · Governadora (escuro, espaço para a captura da demo)
(() => {
  const c = C.s14;
  const s = moldura(14, c.kicker, { escuro: true, tag: 'Demonstração · dados simulados', titulo: c.titulo });
  c.itens.forEach((t, i) => {
    const y = 2.2 + i * 1.15;
    ret(s, 0.7, y, 0.08, 0.8, i === 2 ? cor.ambar : cor.tealClaro);
    txt(s, t, { x: 1.0, y, w: 3.4, h: 0.8, fontFace: fonte.titulo, fontSize: 19, color: 'FFFFFF', valign: 'middle' });
  });
  // área reservada à captura da demo (iteração I1)
  const x = 4.75, y = 1.85, w = W - 0.7 - 4.75, h = w / (16 / 9);
  s.addShape(SH.rect, { x, y, w, h, fill: { color: cor.escuro2 }, line: { color: cor.linhaEscura, width: 1, dashType: 'dash' } });
  txt(s, c.captura, { x, y: y + h / 2 - 0.2, w, h: 0.4, fontFace: fonte.rotulo, fontSize: 13, color: cor.tinta3, align: 'center', charSpacing: 1.5 });
  notas(s, c);
})();

// 15 · Gestores e cidadão
(() => {
  const c = C.s15;
  const s = moldura(15, c.kicker, { tag: 'Demonstração · dados simulados', titulo: c.titulo, sub: c.sub });
  txt(s, 'GESTORES · UM PAINEL POR ÁREA', { x: 0.7, y: 2.3, w: 5.5, h: 0.3, fontFace: fonte.rotulo, fontSize: 12.5, color: cor.teal, charSpacing: 2 });
  c.areas.forEach((a, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.7 + col * 2.75, y = 2.72 + row * 1.12;
    ret(s, x, y, 2.6, 0.98, cor.painel);
    txt(s, a, { x: x + 0.2, y: y + 0.12, w: 2.2, h: 0.35, fontFace: fonte.titulo, fontSize: 14, color: cor.tinta });
    [0.45, 0.7, 0.35, 0.9, 0.6].forEach((v, k) => ret(s, x + 0.2 + k * 0.42, y + 0.88 - v * 0.38, 0.28, v * 0.38, k === 3 ? cor.teal : 'C9D3DC'));
  });
  txt(s, 'CIDADÃO · TRANSPARÊNCIA À ESCOLHA DA GESTÃO', { x: 6.5, y: 2.3, w: 6.2, h: 0.3, fontFace: fonte.rotulo, fontSize: 12.5, color: cor.teal, charSpacing: 2 });
  const pontos = [[0.3, 0.3], [0.62, 0.22], [0.45, 0.55], [0.2, 0.7], [0.75, 0.62], [0.55, 0.82], [0.33, 0.45], [0.8, 0.35], [0.12, 0.42], [0.68, 0.45]];
  c.graus.forEach(([t, d], g) => {
    const x = 6.5 + g * 2.07, y = 2.72, w = 1.95, h = 2.6;
    ret(s, x, y, w, h, cor.escuro);
    pontos.forEach(([px, py], k) => {
      const tipo = k % 3; // 0 resolvido, 1 em resolução, 2 aberto
      if (tipo > g) return;
      const corP = tipo === 0 ? '3BE08F' : tipo === 1 ? cor.ambar : 'FF6B6B';
      s.addShape(SH.ellipse, { x: x + 0.15 + px * (w - 0.45), y: y + 0.2 + py * (h - 1.2), w: 0.16, h: 0.16, fill: { color: corP }, line: semLinha });
    });
    txt(s, t, { x: x + 0.15, y: y + h - 0.85, w: w - 0.3, h: 0.35, fontFace: fonte.titulo, fontSize: 13.5, color: 'FFFFFF' });
    txt(s, d, { x: x + 0.15, y: y + h - 0.5, w: w - 0.3, h: 0.3, fontFace: fonte.corpo, fontSize: 10.5, color: cor.textoSobreEscuro });
  });
  txt(s, [{ text: '● ', options: { color: '3BE08F' } }, { text: 'resolvido   ', options: { color: cor.tinta2 } }, { text: '● ', options: { color: cor.ambar } }, { text: 'em resolução   ', options: { color: cor.tinta2 } }, { text: '● ', options: { color: 'FF6B6B' } }, { text: 'aberto', options: { color: cor.tinta2 } }], { x: 6.5, y: 5.45, w: 6.2, h: 0.3, fontFace: fonte.corpo, fontSize: 11 });
  notas(s, c);
})();

// 16 · Águas Claras
(() => {
  const c = C.s16;
  const s = moldura(16, c.kicker, { titulo: c.titulo });
  const top = c.numeros.slice(0, 3), base = c.numeros.slice(3);
  const w3 = (W - 1.4 - 2 * 0.3) / 3;
  top.forEach((it, i) => {
    const x = 0.7 + i * (w3 + 0.3);
    txt(s, it.n, { x, y: 1.85, w: w3, h: 1.2, fontFace: fonte.leve, fontSize: 80, color: i === 1 ? cor.teal : cor.tinta });
    txt(s, it.l, { x: x + 0.05, y: 3.1, w: w3 - 0.2, h: 0.6, fontFace: fonte.corpo, fontSize: 16, color: cor.tinta2 });
  });
  linha(s, 0.7, 3.95, W - 1.4, 0, cor.regua, 1);
  const w2 = (W - 1.4 - 0.3) / 2;
  base.forEach((it, i) => {
    const x = 0.7 + i * (w2 + 0.3);
    ret(s, x, 4.2, w2, 1.55, cor.escuro);
    txt(s, it.n, { x: x + 0.3, y: 4.2, w: 1.7, h: 1.55, fontFace: fonte.leve, fontSize: 60, color: cor.ambar, valign: 'middle' });
    txt(s, it.l, { x: x + 2.0, y: 4.2, w: w2 - 2.3, h: 1.55, fontFace: fonte.corpo, fontSize: 16, color: cor.textoSobreEscuro, valign: 'middle' });
  });
  rodapeFonte(s, c.fonte, false, 6.1);
  notas(s, c);
})();

// 17 · Como fazemos e como começa
(() => {
  const c = C.s17;
  const s = moldura(17, c.kicker, { titulo: c.titulo });
  txt(s, 'COMO FAZEMOS', { x: 0.7, y: 1.85, w: 5, h: 0.3, fontFace: fonte.rotulo, fontSize: 13, color: cor.teal, charSpacing: 2 });
  c.principios.forEach((p, i) => {
    const y = 2.3 + i * 0.98;
    ret(s, 0.7, y, 5.8, 0.82, cor.painel);
    ret(s, 0.7, y, 0.08, 0.82, cor.teal);
    txt(s, p, { x: 0.98, y, w: 5.35, h: 0.82, fontFace: fonte.corpo, fontSize: 15.5, color: cor.tinta, valign: 'middle' });
  });
  txt(s, 'COMO COMEÇA', { x: 7.0, y: 1.85, w: 5, h: 0.3, fontFace: fonte.rotulo, fontSize: 13, color: cor.teal, charSpacing: 2 });
  c.passos.forEach((p, i) => {
    const y = 2.3 + i * 1.32;
    s.addShape(SH.ellipse, { x: 7.0, y: y + 0.12, w: 0.78, h: 0.78, fill: { color: i === 2 ? cor.ambar : cor.escuro }, line: semLinha });
    txt(s, String(i + 1), { x: 7.0, y: y + 0.12, w: 0.78, h: 0.78, fontFace: fonte.titulo, fontSize: 22, color: i === 2 ? cor.tinta : 'FFFFFF', align: 'center', valign: 'middle' });
    if (i < 2) linha(s, 7.39, y + 0.9, 0, 0.54, cor.regua, 1.5);
    txt(s, p, { x: 8.05, y, w: 4.6, h: 1.0, fontFace: fonte.corpo, fontSize: 16.5, color: cor.tinta, valign: 'middle' });
  });
  notas(s, c);
})();

// 18 · Encerramento
(() => {
  const c = C.s18;
  const s = novoSlide();
  s.background = { color: cor.escuro };
  fundoImagem(s, 'encerramento');
  veu(s, 4.8, 8.6, 6);
  ret(s, 0, 0, 0.14, H, cor.teal);
  txt(s, c.titulo.toUpperCase(), { x: 0.8, y: 2.3, w: 6.6, h: 1.3, fontFace: fonte.titulo, fontSize: 76, color: 'FFFFFF' });
  ret(s, 0.82, 3.75, 1.1, 0.08, cor.ambar);
  txt(s, c.linhas.join('\n'), { x: 0.8, y: 4.05, w: 6.6, h: 1.2, fontFace: fonte.leve, fontSize: 26, color: cor.textoSobreEscuro, paraSpaceAfter: 6 });
  logo(s, true, 0.8, 6.5, 1.7);
  legendaImagem(s);
  notas(s, c);
})();

(async () => {
  const out = path.join(__dirname, '..', 'out');
  fs.mkdirSync(out, { recursive: true });
  const arquivo = path.join(out, 'CityView_Apresentacao.pptx');
  await pptx.writeFile({ fileName: arquivo });
  console.log("gerado:", arquivo, `(${contagem} slides)`);
  if (contagem !== TOTAL) throw new Error(`esperava ${TOTAL} slides`);
})();

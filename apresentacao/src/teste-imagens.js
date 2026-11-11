// Teste da linguagem de imagem (Higgsfield) dentro da direção C: capa e divisória.
const path = require('path');
const fs = require('fs');
const PptxGenJS = require('pptxgenjs');
const T = require('./tema');

const { W, H, cor, fonte } = T;
const txt = (s, text, o) => s.addText(text, { margin: 0, valign: 'top', ...o });
const logo = (s, escuro, x, y, w) =>
  s.addImage({ path: escuro ? T.logo.sobreEscuro : T.logo.sobreClaro, x, y, w, h: w / T.logo.proporcao });

// Imagem sangrando o slide inteiro (mantém a proporção, corta o excesso embaixo)
const fundo = (s, nome) => {
  const h = W / T.proporcaoImagem;
  s.addImage({ path: T.imagem(nome), x: 0, y: (H - h) / 2, w: W, h });
};

// Véu navy da esquerda para a direita, em faixas, para o texto ler sobre a imagem
const veu = (pptx, s, ate, inicio, fim, opaco = 8) => {
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: inicio, h: H, fill: { color: cor.escuro, transparency: opaco }, line: { color: cor.escuro, width: 0, transparency: 100 } });
  const n = 16;
  const passo = (fim - inicio) / n;
  for (let i = 0; i < n; i++) {
    const t = opaco + ((100 - opaco) * (i + 1)) / (n + 1);
    s.addShape(pptx.ShapeType.rect, { x: inicio + i * passo, y: 0, w: passo + 0.01, h: H, fill: { color: cor.escuro, transparency: Math.round(t) }, line: { color: cor.escuro, width: 0, transparency: 100 } });
  }
};

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.title = 'City View · Teste de imagem (Higgsfield)';

// 1 · Capa com a cidade
let s = pptx.addSlide();
s.background = { color: cor.escuro };
fundo(s, 'teste-01-capa-cidade');
veu(pptx, s, W, 4.2, 8.2);
s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.14, h: H, fill: { color: cor.teal }, line: { color: cor.teal, width: 0 } });
txt(s, 'PROPOSTA AO GOVERNO DO DISTRITO FEDERAL', { x: 0.8, y: 2.0, w: 6.5, h: 0.3, fontFace: fonte.rotulo, fontSize: 13, color: cor.tealClaro, charSpacing: 2.5 });
txt(s, 'CITY VIEW', { x: 0.8, y: 2.4, w: 6.6, h: 1.3, fontFace: fonte.titulo, fontSize: 76, color: 'FFFFFF' });
s.addShape(pptx.ShapeType.rect, { x: 0.82, y: 3.85, w: 1.1, h: 0.08, fill: { color: cor.ambar }, line: { color: cor.ambar, width: 0 } });
txt(s, 'Observabilidade da gestão da cidade', { x: 0.8, y: 4.15, w: 6.5, h: 0.6, fontFace: fonte.leve, fontSize: 26, color: cor.textoSobreEscuro });
logo(s, true, 0.8, 6.5, 1.7);
txt(s, 'NOVEMBRO DE 2026', { x: 3.0, y: 6.6, w: 3.5, h: 0.25, fontFace: fonte.rotulo, fontSize: 11, color: cor.tinta3, charSpacing: 2 });
txt(s, 'Imagem ilustrativa', { x: W - 3.3, y: 7.08, w: 3.0, h: 0.22, fontFace: fonte.corpo, fontSize: 8.5, color: cor.tinta3, align: 'right' });
s.addNotes('Teste de linguagem de imagem: capa com imagem gerada na Higgsfield (Seedream 5.0 Pro).');

// 2 · Divisória "O problema" com os silos
s = pptx.addSlide();
s.background = { color: cor.escuro };
fundo(s, 'teste-02-silos');
s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.14, h: H, fill: { color: cor.teal }, line: { color: cor.teal, width: 0 } });
txt(s, '01 · O PROBLEMA', { x: 0.8, y: 0.75, w: 6, h: 0.3, fontFace: fonte.rotulo, fontSize: 13, color: cor.tealClaro, charSpacing: 2.5 });
txt(s, 'Cada órgão vê só o próprio pedaço.', { x: 0.8, y: 1.15, w: 11.5, h: 0.8, fontFace: fonte.titulo, fontSize: 44, color: 'FFFFFF' });
txt(s, 'Imagem ilustrativa', { x: W - 3.3, y: 7.08, w: 3.0, h: 0.22, fontFace: fonte.corpo, fontSize: 8.5, color: cor.tinta3, align: 'right' });
s.addNotes('Teste de linguagem de imagem: divisória de seção com imagem gerada na Higgsfield (Seedream 5.0 Pro).');

(async () => {
  const out = path.join(__dirname, '..', 'out');
  fs.mkdirSync(out, { recursive: true });
  const arquivo = path.join(out, 'teste-higgsfield.pptx');
  await pptx.writeFile({ fileName: arquivo });
  console.log('gerado:', arquivo);
})();

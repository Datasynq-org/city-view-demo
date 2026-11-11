// Gera 3 mini-decks de amostra (direções estéticas A, B e C) em out/.
// Texto provisório, tirado só do magno (CV-SPEC-000). Não é o roteiro final.
const path = require('path');
const fs = require('fs');
const PptxGenJS = require('pptxgenjs');

const OUT = path.join(__dirname, '..', 'out');
const ASSETS = path.join(__dirname, '..', 'assets');
const LOGO_ESCURO = path.join(ASSETS, 'logo_dark.png'); // texto navy, para fundo claro
const LOGO_CLARO = path.join(ASSETS, 'logo_light.png'); // texto branco, para fundo escuro
const LOGO_RATIO = 840 / 180;
const W = 13.333;
const H = 7.5;

// ---------- Conteúdo comum (fonte: magno) ----------
const C = {
  capa: {
    rotulo: 'Proposta ao Governo do Distrito Federal',
    titulo: 'City View',
    sub: 'Observabilidade da gestão da cidade',
    data: 'Novembro de 2026',
  },
  silos: {
    kicker: '02 · O problema',
    titulo: 'Cada sistema diz que está tudo certo.',
    titulo2: 'Olhando a cidade inteira, não está.',
    orgaos: [
      ['Ouvidoria', 'manifestações'],
      ['PMDF', 'segurança · 190'],
      ['CAESB', 'água e esgoto'],
      ['CEB IPes', 'iluminação'],
      ['Neoenergia', 'energia'],
      ['SLU', 'limpeza urbana'],
      ['DER-DF', 'vias'],
    ],
    todo: 'Visão do todo',
    todoStatus: 'ninguém está olhando',
  },
  dado: {
    kicker: '03 · Evidência',
    titulo: 'O mesmo barulho chega por duas portas.',
    n1: '5.467',
    l1: 'reclamações de perturbação\ndo sossego à PMDF',
    n2: '1.278',
    l2: 'notificações de poluição sonora\nao Ibram e à Ouvidoria',
    fonte: 'Fonte: Correio Braziliense, 12/08/2024 · 1º semestre de 2024',
  },
  conceito: {
    kicker: '04 · A proposta',
    titulo: 'Uma camada por cima dos sistemas que já existem.',
    cidadao: ['Cidadão', 'WhatsApp · app · SMS · Instagram'],
    centro: ['City View', 'recebe · classifica · agrupa · acompanha'],
    legados: ['Sistemas dos órgãos', 'continuam como estão · API, robô ou arquivo'],
    gov: ['Governo', 'sala de guerra e painel por gestor'],
    publico: ['Transparência', 'mapa do que a gestão resolveu'],
  },
  notas: 'Amostra de estética. Texto provisório tirado do Documento Magno (CV-SPEC-000); não é o roteiro final.',
};

const logo = (slide, claro, x, y, w) =>
  slide.addImage({ path: claro ? LOGO_CLARO : LOGO_ESCURO, x, y, w, h: w / LOGO_RATIO });

const txt = (slide, text, o) => slide.addText(text, { margin: 0, valign: 'top', ...o });

function zonaImagem(pptx, slide, x, y, w, h, fundo, linha, legenda, corLegenda) {
  slide.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color: fundo }, line: { color: fundo, width: 0 } });
  for (let i = 1; i < 12; i++) {
    slide.addShape(pptx.ShapeType.line, { x: x + (w * i) / 12, y, w: 0, h, line: { color: linha, width: 0.5 } });
  }
  for (let i = 1; i < 14; i++) {
    slide.addShape(pptx.ShapeType.line, { x, y: y + (h * i) / 14, w, h: 0, line: { color: linha, width: 0.5 } });
  }
  txt(slide, legenda, { x: x + 0.3, y: y + h - 0.5, w: w - 0.6, h: 0.3, fontSize: 9, color: corLegenda, fontFace: 'IBM Plex Mono', align: 'right' });
}

// ============ Direção A · Sala de Operações ============
function direcaoA() {
  const T = {
    bg: '05080D', bg2: '0A0F17', panel: '111826', line: '1B2636',
    tx: 'E6EDF5', tx2: '8A97A8', tx3: '4E5B6C',
    cyan: '3DD9EB', indigo: '7C8CFF', violet: 'C68BFF', ok: '3BE08F', warn: 'F5B83D',
    head: 'Chakra Petch SemiBold', headR: 'Chakra Petch', body: 'IBM Plex Sans', bodyL: 'IBM Plex Sans Light', mono: 'IBM Plex Mono',
  };
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = 'City View · Amostra A · Sala de Operações';

  const chrome = (s, n, kicker, tag) => {
    s.background = { color: T.bg };
    txt(s, `CITY VIEW  //  ${kicker.toUpperCase()}`, { x: 0.6, y: 0.35, w: 8, h: 0.25, fontFace: T.mono, fontSize: 10, color: T.tx3, charSpacing: 2 });
    if (tag) txt(s, `[ ${tag} ]`, { x: W - 3.6, y: 0.35, w: 3, h: 0.25, fontFace: T.mono, fontSize: 10, color: T.warn, align: 'right', charSpacing: 2 });
    s.addShape(pptx.ShapeType.line, { x: 0.6, y: 6.85, w: W - 1.2, h: 0, line: { color: T.line, width: 0.75 } });
    logo(s, true, 0.6, 6.98, 1.25);
    txt(s, `${String(n).padStart(2, '0')} / 04`, { x: W - 2.1, y: 7.02, w: 1.5, h: 0.25, fontFace: T.mono, fontSize: 10, color: T.tx3, align: 'right' });
    s.addNotes(C.notas);
  };

  // Capa
  let s = pptx.addSlide();
  s.background = { color: T.bg };
  zonaImagem(pptx, s, 7.3, 0, W - 7.3, H, T.bg2, '0F1722', 'área para imagem de apoio · Higgsfield', T.tx3);
  txt(s, C.capa.rotulo.toUpperCase(), { x: 0.8, y: 2.0, w: 6.3, h: 0.3, fontFace: T.mono, fontSize: 11, color: T.cyan, charSpacing: 3 });
  txt(s, C.capa.titulo, { x: 0.8, y: 2.45, w: 6.4, h: 1.3, fontFace: T.head, fontSize: 72, color: T.tx });
  s.addShape(pptx.ShapeType.rect, { x: 0.82, y: 3.9, w: 0.9, h: 0.06, fill: { color: T.cyan }, line: { color: T.cyan, width: 0 } });
  txt(s, C.capa.sub, { x: 0.8, y: 4.15, w: 6.3, h: 0.6, fontFace: T.bodyL, fontSize: 24, color: T.tx2 });
  logo(s, true, 0.8, 6.55, 1.6);
  txt(s, C.capa.data.toUpperCase(), { x: 3.0, y: 6.62, w: 3.5, h: 0.25, fontFace: T.mono, fontSize: 10, color: T.tx3, charSpacing: 2 });
  s.addNotes(C.notas);

  // Silos
  s = pptx.addSlide();
  chrome(s, 2, C.silos.kicker, 'ILUSTRATIVO');
  txt(s, C.silos.titulo, { x: 0.6, y: 0.8, w: 12, h: 0.6, fontFace: T.head, fontSize: 30, color: T.tx });
  txt(s, C.silos.titulo2, { x: 0.6, y: 1.35, w: 12, h: 0.55, fontFace: T.headR, fontSize: 24, color: T.tx2 });
  const cw = (W - 1.2 - 6 * 0.15) / 7;
  C.silos.orgaos.forEach(([nome, area], i) => {
    const x = 0.6 + i * (cw + 0.15);
    s.addShape(pptx.ShapeType.rect, { x, y: 2.25, w: cw, h: 2.75, fill: { color: T.bg2 }, line: { color: T.line, width: 0.75 } });
    txt(s, nome, { x: x + 0.15, y: 2.4, w: cw - 0.3, h: 0.35, fontFace: T.head, fontSize: 15, color: T.tx });
    txt(s, area, { x: x + 0.15, y: 2.78, w: cw - 0.3, h: 0.3, fontFace: T.body, fontSize: 10, color: T.tx2 });
    for (let k = 0; k < 5; k++) {
      const bh = 0.25 + ((i * 7 + k * 3) % 5) * 0.12;
      s.addShape(pptx.ShapeType.rect, { x: x + 0.18 + k * 0.24, y: 4.35 - bh, w: 0.14, h: bh, fill: { color: T.line }, line: { color: T.line, width: 0 } });
    }
    txt(s, [{ text: '● ', options: { color: T.ok } }, { text: 'OK', options: { color: T.tx2 } }], { x: x + 0.15, y: 4.55, w: cw - 0.3, h: 0.3, fontFace: T.mono, fontSize: 11 });
  });
  s.addShape(pptx.ShapeType.rect, { x: 0.6, y: 5.3, w: W - 1.2, h: 0.95, fill: { color: T.bg2 }, line: { color: T.warn, width: 1, dashType: 'dash' } });
  txt(s, C.silos.todo.toUpperCase(), { x: 0.9, y: 5.55, w: 4, h: 0.4, fontFace: T.mono, fontSize: 12, color: T.tx2, charSpacing: 2, valign: 'middle' });
  txt(s, [{ text: '● ', options: { color: T.warn } }, { text: C.silos.todoStatus, options: { color: T.tx } }], { x: 5, y: 5.52, w: 7.5, h: 0.45, fontFace: T.head, fontSize: 20, align: 'right', valign: 'middle' });

  // Dado
  s = pptx.addSlide();
  chrome(s, 3, C.dado.kicker);
  txt(s, C.dado.titulo, { x: 0.6, y: 0.8, w: 12, h: 0.6, fontFace: T.head, fontSize: 30, color: T.tx });
  txt(s, C.dado.n1, { x: 0.6, y: 2.2, w: 5.5, h: 1.6, fontFace: T.head, fontSize: 110, color: T.cyan });
  txt(s, C.dado.l1, { x: 0.65, y: 3.95, w: 5, h: 0.9, fontFace: T.body, fontSize: 18, color: T.tx2 });
  txt(s, C.dado.n2, { x: 7.0, y: 2.2, w: 5.5, h: 1.6, fontFace: T.head, fontSize: 110, color: T.violet });
  txt(s, C.dado.l2, { x: 7.05, y: 3.95, w: 5.2, h: 0.9, fontFace: T.body, fontSize: 18, color: T.tx2 });
  s.addShape(pptx.ShapeType.line, { x: 6.45, y: 2.35, w: 0, h: 2.6, line: { color: T.line, width: 1 } });
  txt(s, 'MESMO FATO, DUAS FILAS', { x: 0.6, y: 5.35, w: 12, h: 0.3, fontFace: T.mono, fontSize: 12, color: T.warn, charSpacing: 3 });
  txt(s, C.dado.fonte, { x: 0.6, y: 6.45, w: 12, h: 0.25, fontFace: T.mono, fontSize: 9.5, color: T.tx3 });

  // Conceito
  s = pptx.addSlide();
  chrome(s, 4, C.conceito.kicker, 'PROPOSTA');
  txt(s, C.conceito.titulo, { x: 0.6, y: 0.8, w: 12, h: 0.6, fontFace: T.head, fontSize: 30, color: T.tx });
  const caixa = (x, y, w, h, [t, d], cor, destaque) => {
    s.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color: destaque ? T.panel : T.bg2 }, line: { color: cor, width: destaque ? 1.75 : 0.75 } });
    txt(s, t, { x: x + 0.2, y: y + 0.18, w: w - 0.4, h: 0.4, fontFace: T.head, fontSize: destaque ? 22 : 16, color: destaque ? T.cyan : T.tx });
    txt(s, d, { x: x + 0.2, y: y + (destaque ? 0.75 : 0.6), w: w - 0.4, h: 0.6, fontFace: T.body, fontSize: 11.5, color: T.tx2 });
  };
  caixa(0.6, 3.55, 3.1, 1.4, C.conceito.cidadao, T.line);
  caixa(5.0, 3.35, 3.33, 1.8, C.conceito.centro, T.cyan, true);
  caixa(9.63, 3.55, 3.1, 1.4, C.conceito.legados, T.line);
  caixa(5.0, 1.95, 3.33, 0.95, C.conceito.gov, T.indigo);
  caixa(5.0, 5.6, 3.33, 0.95, C.conceito.publico, T.violet);
  const seta = { color: T.tx3, width: 1.25, endArrowType: 'triangle' };
  s.addShape(pptx.ShapeType.line, { x: 3.7, y: 4.25, w: 1.3, h: 0, line: seta });
  s.addShape(pptx.ShapeType.line, { x: 8.33, y: 4.25, w: 1.3, h: 0, line: { ...seta, beginArrowType: 'triangle' } });
  s.addShape(pptx.ShapeType.line, { x: 6.665, y: 2.9, w: 0, h: 0.45, line: { color: T.tx3, width: 1.25, beginArrowType: 'triangle' } });
  s.addShape(pptx.ShapeType.line, { x: 6.665, y: 5.15, w: 0, h: 0.45, line: seta });

  return pptx;
}

// ============ Direção B · Institucional claro ============
function direcaoB() {
  const T = {
    bg: 'F7F6F2', paper: 'FFFFFF', ink: '0F2A43', ink2: '4A5B6D', ink3: '8C98A4', rule: 'D8DCE0',
    accent: '0196B2', alerta: 'B5523B',
    head: 'IBM Plex Serif', headM: 'IBM Plex Serif Medium', body: 'IBM Plex Sans', bodyL: 'IBM Plex Sans Light', bodyM: 'IBM Plex Sans Medm',
  };
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = 'City View · Amostra B · Institucional claro';

  const chrome = (s, n, kicker, tag) => {
    s.background = { color: T.bg };
    txt(s, kicker, { x: 0.8, y: 0.38, w: 6, h: 0.25, fontFace: T.bodyM, fontSize: 10.5, color: T.accent });
    const dx = tag ? 1.5 : 0;
    txt(s, 'City View · Proposta ao GDF', { x: W - 4.8 - dx, y: 0.38, w: 4, h: 0.25, fontFace: T.body, fontSize: 10, color: T.ink3, align: 'right' });
    s.addShape(pptx.ShapeType.line, { x: 0.8, y: 0.72, w: W - 1.6, h: 0, line: { color: T.rule, width: 0.75 } });
    if (tag) {
      s.addShape(pptx.ShapeType.roundRect, { x: W - 2.15, y: 0.33, w: 1.35, h: 0.3, rectRadius: 0.15, fill: { color: T.bg }, line: { color: T.ink3, width: 0.75 } });
      txt(s, tag, { x: W - 2.15, y: 0.33, w: 1.35, h: 0.3, fontFace: T.body, fontSize: 9.5, color: T.ink2, align: 'center', valign: 'middle' });
    }
    logo(s, false, 0.8, 6.95, 1.25);
    txt(s, String(n), { x: W - 1.3, y: 7.0, w: 0.5, h: 0.25, fontFace: T.body, fontSize: 10, color: T.ink3, align: 'right' });
    s.addNotes(C.notas);
  };

  // Capa
  let s = pptx.addSlide();
  s.background = { color: T.bg };
  zonaImagem(pptx, s, 7.6, 0, W - 7.6, H, 'E9EBEC', 'E1E4E6', 'área para imagem de apoio · Higgsfield', T.ink3);
  txt(s, C.capa.rotulo, { x: 0.9, y: 2.0, w: 6.4, h: 0.3, fontFace: T.bodyM, fontSize: 12, color: T.accent });
  txt(s, C.capa.titulo, { x: 0.9, y: 2.4, w: 6.5, h: 1.3, fontFace: T.headM, fontSize: 66, color: T.ink });
  s.addShape(pptx.ShapeType.rect, { x: 0.92, y: 3.85, w: 1.2, h: 0.05, fill: { color: T.accent }, line: { color: T.accent, width: 0 } });
  txt(s, C.capa.sub, { x: 0.9, y: 4.1, w: 6.4, h: 0.6, fontFace: T.bodyL, fontSize: 24, color: T.ink2 });
  logo(s, false, 0.9, 6.5, 1.7);
  txt(s, C.capa.data, { x: 3.0, y: 6.6, w: 3.5, h: 0.25, fontFace: T.body, fontSize: 11, color: T.ink3 });
  s.addNotes(C.notas);

  // Silos
  s = pptx.addSlide();
  chrome(s, 2, C.silos.kicker, 'Ilustrativo');
  txt(s, C.silos.titulo, { x: 0.8, y: 1.0, w: 10, h: 0.65, fontFace: T.headM, fontSize: 32, color: T.ink });
  txt(s, C.silos.titulo2, { x: 0.8, y: 1.62, w: 10, h: 0.6, fontFace: T.head, fontSize: 26, color: T.alerta });
  const cw = (W - 1.6) / 7;
  C.silos.orgaos.forEach(([nome, area], i) => {
    const x = 0.8 + i * cw;
    if (i > 0) s.addShape(pptx.ShapeType.line, { x, y: 2.75, w: 0, h: 2.2, line: { color: T.rule, width: 0.75 } });
    txt(s, nome, { x: x + 0.18, y: 2.85, w: cw - 0.3, h: 0.35, fontFace: T.bodyM, fontSize: 15, color: T.ink });
    txt(s, area, { x: x + 0.18, y: 3.22, w: cw - 0.3, h: 0.3, fontFace: T.body, fontSize: 10.5, color: T.ink2 });
    txt(s, [{ text: '● ', options: { color: T.accent } }, { text: 'em dia', options: { color: T.ink2 } }], { x: x + 0.18, y: 4.5, w: cw - 0.3, h: 0.3, fontFace: T.body, fontSize: 11.5 });
  });
  s.addShape(pptx.ShapeType.line, { x: 0.8, y: 5.35, w: W - 1.6, h: 0, line: { color: T.alerta, width: 1.5 } });
  txt(s, C.silos.todo, { x: 0.8, y: 5.55, w: 4, h: 0.4, fontFace: T.bodyM, fontSize: 13, color: T.ink2 });
  txt(s, C.silos.todoStatus.charAt(0).toUpperCase() + C.silos.todoStatus.slice(1) + '.', { x: 4.8, y: 5.5, w: 7.7, h: 0.5, fontFace: T.headM, fontSize: 22, color: T.alerta, align: 'right' });

  // Dado
  s = pptx.addSlide();
  chrome(s, 3, C.dado.kicker);
  txt(s, C.dado.titulo, { x: 0.8, y: 1.0, w: 11, h: 0.65, fontFace: T.headM, fontSize: 32, color: T.ink });
  txt(s, C.dado.n1, { x: 0.8, y: 2.3, w: 5.4, h: 1.5, fontFace: T.head, fontSize: 96, color: T.ink });
  txt(s, C.dado.l1, { x: 0.85, y: 3.95, w: 4.8, h: 0.9, fontFace: T.body, fontSize: 17, color: T.ink2 });
  s.addShape(pptx.ShapeType.line, { x: 6.67, y: 2.45, w: 0, h: 2.5, line: { color: T.rule, width: 1 } });
  txt(s, C.dado.n2, { x: 7.2, y: 2.3, w: 5.4, h: 1.5, fontFace: T.head, fontSize: 96, color: T.accent });
  txt(s, C.dado.l2, { x: 7.25, y: 3.95, w: 5, h: 0.9, fontFace: T.body, fontSize: 17, color: T.ink2 });
  txt(s, 'O mesmo fato, em duas filas que não se falam.', { x: 0.8, y: 5.4, w: 11, h: 0.45, fontFace: T.head, fontSize: 19, color: T.ink });
  txt(s, C.dado.fonte, { x: 0.8, y: 6.45, w: 11, h: 0.25, fontFace: T.body, fontSize: 9.5, color: T.ink3 });

  // Conceito
  s = pptx.addSlide();
  chrome(s, 4, C.conceito.kicker, 'Proposta');
  txt(s, C.conceito.titulo, { x: 0.8, y: 1.0, w: 11.8, h: 0.65, fontFace: T.headM, fontSize: 32, color: T.ink });
  const caixa = (x, y, w, h, [t, d], destaque, cor) => {
    s.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color: destaque ? T.ink : T.paper }, line: { color: destaque ? T.ink : (cor || T.rule), width: cor ? 1.25 : 0.75 } });
    txt(s, t, { x: x + 0.22, y: y + 0.18, w: w - 0.44, h: 0.4, fontFace: destaque ? T.headM : T.bodyM, fontSize: destaque ? 22 : 15, color: destaque ? 'FFFFFF' : T.ink });
    txt(s, d, { x: x + 0.22, y: y + (destaque ? 0.75 : 0.58), w: w - 0.44, h: 0.6, fontFace: T.body, fontSize: 11.5, color: destaque ? 'C9D3DC' : T.ink2 });
  };
  caixa(0.8, 3.65, 3.0, 1.4, C.conceito.cidadao);
  caixa(5.0, 3.45, 3.33, 1.8, C.conceito.centro, true);
  caixa(9.53, 3.65, 3.0, 1.4, C.conceito.legados);
  caixa(5.0, 2.05, 3.33, 0.95, C.conceito.gov, false, T.accent);
  caixa(5.0, 5.7, 3.33, 0.95, C.conceito.publico, false, T.accent);
  const seta = { color: T.ink3, width: 1.25, endArrowType: 'triangle' };
  s.addShape(pptx.ShapeType.line, { x: 3.8, y: 4.35, w: 1.2, h: 0, line: seta });
  s.addShape(pptx.ShapeType.line, { x: 8.33, y: 4.35, w: 1.2, h: 0, line: { ...seta, beginArrowType: 'triangle' } });
  s.addShape(pptx.ShapeType.line, { x: 6.665, y: 3.0, w: 0, h: 0.45, line: { color: T.ink3, width: 1.25, beginArrowType: 'triangle' } });
  s.addShape(pptx.ShapeType.line, { x: 6.665, y: 5.25, w: 0, h: 0.45, line: seta });

  return pptx;
}

// ============ Direção C · Híbrida (Bahnschrift, nativa do Windows) ============
function direcaoC() {
  const T = {
    dark: '0B1E31', dark2: '12293F', darkLine: '1E3852', light: 'FFFFFF', ink: '0F2A43', ink2: '52667A', ink3: '93A1AE', rule: 'DDE3E8',
    teal: '0196B2', tealL: '38C3DB', amber: 'F2A93B',
    head: 'Bahnschrift SemiBold', body: 'Bahnschrift', light_: 'Bahnschrift Light', cond: 'Bahnschrift SemiBold Condensed',
  };
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.title = 'City View · Amostra C · Híbrida';

  const chrome = (s, n, kicker, escuro, tag) => {
    s.background = { color: escuro ? T.dark : T.light };
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.14, h: H, fill: { color: T.teal }, line: { color: T.teal, width: 0 } });
    txt(s, kicker.toUpperCase(), { x: 0.7, y: 0.38, w: 6, h: 0.28, fontFace: T.cond, fontSize: 12, color: escuro ? T.tealL : T.teal, charSpacing: 2 });
    if (tag) {
      s.addShape(pptx.ShapeType.rect, { x: W - 2.1, y: 0.35, w: 1.45, h: 0.32, fill: { color: T.amber }, line: { color: T.amber, width: 0 } });
      txt(s, tag.toUpperCase(), { x: W - 2.1, y: 0.35, w: 1.45, h: 0.32, fontFace: T.cond, fontSize: 10.5, color: T.ink, align: 'center', valign: 'middle', charSpacing: 1.5 });
    }
    logo(s, escuro, 0.7, 6.95, 1.25);
    txt(s, String(n).padStart(2, '0'), { x: W - 1.4, y: 6.98, w: 0.75, h: 0.3, fontFace: T.head, fontSize: 12, color: escuro ? T.ink3 : T.ink2, align: 'right' });
    s.addNotes(C.notas);
  };

  // Capa (escura)
  let s = pptx.addSlide();
  s.background = { color: T.dark };
  zonaImagem(pptx, s, 7.5, 0, W - 7.5, H, T.dark2, '17324C', 'área para imagem de apoio · Higgsfield', T.ink3);
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.14, h: H, fill: { color: T.teal }, line: { color: T.teal, width: 0 } });
  txt(s, C.capa.rotulo.toUpperCase(), { x: 0.8, y: 2.0, w: 6.5, h: 0.3, fontFace: T.cond, fontSize: 13, color: T.tealL, charSpacing: 2.5 });
  txt(s, C.capa.titulo.toUpperCase(), { x: 0.8, y: 2.4, w: 6.6, h: 1.3, fontFace: T.head, fontSize: 76, color: 'FFFFFF' });
  s.addShape(pptx.ShapeType.rect, { x: 0.82, y: 3.85, w: 1.1, h: 0.08, fill: { color: T.amber }, line: { color: T.amber, width: 0 } });
  txt(s, C.capa.sub, { x: 0.8, y: 4.15, w: 6.5, h: 0.6, fontFace: T.light_, fontSize: 26, color: 'C9D6E2' });
  logo(s, true, 0.8, 6.5, 1.7);
  txt(s, C.capa.data.toUpperCase(), { x: 3.0, y: 6.6, w: 3.5, h: 0.25, fontFace: T.cond, fontSize: 11, color: T.ink3, charSpacing: 2 });
  s.addNotes(C.notas);

  // Silos (claro)
  s = pptx.addSlide();
  chrome(s, 2, C.silos.kicker, false, 'Ilustrativo');
  txt(s, C.silos.titulo, { x: 0.7, y: 0.85, w: 11, h: 0.65, fontFace: T.head, fontSize: 32, color: T.ink });
  txt(s, C.silos.titulo2, { x: 0.7, y: 1.45, w: 11, h: 0.6, fontFace: T.light_, fontSize: 26, color: T.ink2 });
  const cw = (W - 1.35 - 6 * 0.14) / 7;
  C.silos.orgaos.forEach(([nome, area], i) => {
    const x = 0.7 + i * (cw + 0.14);
    s.addShape(pptx.ShapeType.rect, { x, y: 2.4, w: cw, h: 2.6, fill: { color: 'F3F6F8' }, line: { color: 'F3F6F8', width: 0 } });
    s.addShape(pptx.ShapeType.rect, { x, y: 2.4, w: cw, h: 0.07, fill: { color: T.teal }, line: { color: T.teal, width: 0 } });
    txt(s, nome, { x: x + 0.15, y: 2.65, w: cw - 0.3, h: 0.35, fontFace: T.head, fontSize: 16, color: T.ink });
    txt(s, area, { x: x + 0.15, y: 3.02, w: cw - 0.3, h: 0.3, fontFace: T.body, fontSize: 11, color: T.ink2 });
    s.addShape(pptx.ShapeType.roundRect, { x: x + 0.15, y: 4.45, w: 0.75, h: 0.3, rectRadius: 0.15, fill: { color: 'DDF2F6' }, line: { color: 'DDF2F6', width: 0 } });
    txt(s, 'OK', { x: x + 0.15, y: 4.45, w: 0.75, h: 0.3, fontFace: T.cond, fontSize: 11, color: T.teal, align: 'center', valign: 'middle', charSpacing: 1.5 });
  });
  s.addShape(pptx.ShapeType.rect, { x: 0.7, y: 5.3, w: W - 1.35, h: 0.95, fill: { color: T.amber }, line: { color: T.amber, width: 0 } });
  txt(s, C.silos.todo.toUpperCase(), { x: 1.0, y: 5.55, w: 4, h: 0.45, fontFace: T.cond, fontSize: 14, color: T.ink, charSpacing: 2, valign: 'middle' });
  txt(s, C.silos.todoStatus, { x: 5, y: 5.5, w: 7.4, h: 0.55, fontFace: T.head, fontSize: 24, color: T.ink, align: 'right', valign: 'middle' });

  // Dado (escuro: "telão")
  s = pptx.addSlide();
  chrome(s, 3, C.dado.kicker, true);
  txt(s, C.dado.titulo, { x: 0.7, y: 0.85, w: 11, h: 0.65, fontFace: T.head, fontSize: 32, color: 'FFFFFF' });
  txt(s, C.dado.n1, { x: 0.7, y: 2.15, w: 5.6, h: 1.7, fontFace: T.light_, fontSize: 120, color: 'FFFFFF' });
  txt(s, C.dado.l1, { x: 0.75, y: 4.0, w: 5, h: 0.9, fontFace: T.body, fontSize: 18, color: 'B7C6D4' });
  txt(s, C.dado.n2, { x: 7.1, y: 2.15, w: 5.6, h: 1.7, fontFace: T.light_, fontSize: 120, color: T.amber });
  txt(s, C.dado.l2, { x: 7.15, y: 4.0, w: 5.2, h: 0.9, fontFace: T.body, fontSize: 18, color: 'B7C6D4' });
  s.addShape(pptx.ShapeType.line, { x: 6.6, y: 2.35, w: 0, h: 2.6, line: { color: T.darkLine, width: 1.25 } });
  txt(s, 'MESMO FATO · DUAS FILAS', { x: 0.7, y: 5.35, w: 12, h: 0.35, fontFace: T.cond, fontSize: 15, color: T.tealL, charSpacing: 3 });
  txt(s, C.dado.fonte, { x: 0.7, y: 6.45, w: 12, h: 0.25, fontFace: T.body, fontSize: 10, color: T.ink3 });

  // Conceito (claro)
  s = pptx.addSlide();
  chrome(s, 4, C.conceito.kicker, false, 'Proposta');
  txt(s, C.conceito.titulo, { x: 0.7, y: 0.85, w: 11, h: 0.65, fontFace: T.head, fontSize: 32, color: T.ink });
  const caixa = (x, y, w, h, [t, d], destaque, cor) => {
    s.addShape(pptx.ShapeType.rect, { x, y, w, h, fill: { color: destaque ? T.dark : 'F3F6F8' }, line: { color: destaque ? T.dark : 'F3F6F8', width: 0 } });
    if (cor) s.addShape(pptx.ShapeType.rect, { x, y, w: 0.08, h, fill: { color: cor }, line: { color: cor, width: 0 } });
    txt(s, t, { x: x + 0.25, y: y + 0.18, w: w - 0.45, h: 0.4, fontFace: T.head, fontSize: destaque ? 24 : 16, color: destaque ? 'FFFFFF' : T.ink });
    txt(s, d, { x: x + 0.25, y: y + (destaque ? 0.78 : 0.58), w: w - 0.4, h: 0.6, fontFace: T.body, fontSize: destaque ? 11 : 12, color: destaque ? T.tealL : T.ink2 });
  };
  caixa(0.7, 3.55, 3.1, 1.4, C.conceito.cidadao);
  caixa(5.0, 3.35, 3.33, 1.8, C.conceito.centro, true);
  caixa(9.53, 3.55, 3.1, 1.4, C.conceito.legados);
  caixa(5.0, 1.95, 3.33, 0.95, C.conceito.gov, false, T.teal);
  caixa(5.0, 5.6, 3.33, 0.95, C.conceito.publico, false, T.amber);
  const seta = { color: T.ink3, width: 1.5, endArrowType: 'triangle' };
  s.addShape(pptx.ShapeType.line, { x: 3.8, y: 4.25, w: 1.2, h: 0, line: seta });
  s.addShape(pptx.ShapeType.line, { x: 8.33, y: 4.25, w: 1.2, h: 0, line: { ...seta, beginArrowType: 'triangle' } });
  s.addShape(pptx.ShapeType.line, { x: 6.665, y: 2.9, w: 0, h: 0.45, line: { color: T.ink3, width: 1.5, beginArrowType: 'triangle' } });
  s.addShape(pptx.ShapeType.line, { x: 6.665, y: 5.15, w: 0, h: 0.45, line: seta });

  return pptx;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const direcoes = { 'amostra-A-sala-de-operacoes': direcaoA, 'amostra-B-institucional-claro': direcaoB, 'amostra-C-hibrida': direcaoC };
  for (const [nome, fn] of Object.entries(direcoes)) {
    const arquivo = path.join(OUT, `${nome}.pptx`);
    await fn().writeFile({ fileName: arquivo });
    console.log('gerado:', arquivo);
  }
})();

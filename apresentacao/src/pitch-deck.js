// Pitch Deck City View: apresentação de venda ao GDF (assessores e governadora).
// Enxuto, fundo branco, sem imagens nem gráficos: a ideia como o Daniel a explicou
// (docs/fonte/CV-ATA-001). A demonstração ao vivo mostra o painel; o deck explica a ideia.
// Uso: node src/pitch-deck.js  ->  entregas/PitchDeck_CityView.pptx
const fs = require('fs');
const path = require('path');
const PptxGenJS = require('pptxgenjs');
const JSZip = require('jszip');

const RAIZ = path.join(__dirname, '..');
const SAIDA = path.join(RAIZ, 'entregas', 'PitchDeck_CityView.pptx');
const LOGO = path.join(RAIZ, 'assets', 'logo_dark.png');

const W = 13.333;
const H = 7.5;
const M = 0.75;
const CW = W - 2 * M;

// As cores entram no arquivo como cores de tema: dá para trocar a paleta pelo PowerPoint.
const TEMA = {
  nome: 'City View',
  fonte: 'IBM Plex Sans',
  cores: {
    dk1: '0F2A43', // texto
    lt1: 'FFFFFF', // fundo
    dk2: '52667A', // texto secundário
    lt2: 'F2F5F8', // caixa
    accent1: '0196B2', // teal DataSynq, o único destaque
    accent2: '0F2A43',
    accent3: '52667A',
    accent4: '93A1AE',
    accent5: 'D5DCE3', // linhas
    accent6: 'E6F4F7', // caixa de destaque
    hlink: '0196B2',
    folHlink: '52667A',
  },
};
const HEX = TEMA.cores;

const pres = new PptxGenJS();
pres.defineLayout({ name: 'CV', width: W, height: H });
pres.layout = 'CV';
pres.theme = { headFontFace: TEMA.fonte, bodyFontFace: TEMA.fonte };
pres.title = 'Pitch Deck City View';
pres.subject = 'Observabilidade da gestão da cidade · proposta ao Governo do Distrito Federal';
pres.author = 'DataSynq';
pres.company = 'DataSynq';

const S = pres.SchemeColor;
const C = { texto: S.text1, fundo: S.background1, suave: S.text2, caixa: S.background2, teal: S.accent1, linha: S.accent5, destaque: S.accent6 };

pres.defineSlideMaster({
  title: 'CAPA',
  background: { color: C.fundo },
  objects: [
    { image: { path: LOGO, x: M, y: 0.7, w: 1.96, h: 0.42 } },
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 2.55, w: CW, h: 1.3, fontSize: 80, bold: true, color: C.texto, align: 'left', valign: 'middle', margin: 0 }, text: '' } },
  ],
});
pres.defineSlideMaster({
  title: 'CONTEUDO',
  background: { color: C.fundo },
  objects: [
    { image: { path: LOGO, x: M, y: 6.9, w: 1.12, h: 0.24 } },
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 0.6, w: CW, h: 0.8, fontSize: 32, bold: true, color: C.texto, align: 'left', valign: 'middle', margin: 0 }, text: '' } },
  ],
  slideNumber: { x: W - M - 0.5, y: 6.9, w: 0.5, h: 0.25, fontSize: 10, color: C.suave, align: 'right' },
});

// ---------- utilitários ----------
function txt(s, texto, x, y, w, h, o = {}) {
  s.addText(texto, { x, y, w, h, margin: 0, isTextBox: true, fontSize: 16, color: C.texto, valign: 'top', align: 'left', fit: 'none', ...o });
}
function caixa(s, x, y, w, h, cor) {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: cor || C.caixa }, line: { type: 'none' } });
}
function lista(s, itens, x, y, w, h, o = {}) {
  const fs_ = o.fontSize || 16;
  s.addText(itens.map((t, i) => ({ text: t, options: { bullet: { indent: 18 }, breakLine: i < itens.length - 1, paraSpaceAfter: o.espaco === undefined ? 10 : o.espaco } })), {
    x, y, w, h, margin: 0, isTextBox: true, fontSize: fs_, color: o.color || C.texto, valign: 'top', align: 'left', fit: 'none', lineSpacingMultiple: 1.08,
  });
}
function rotulo(s, texto, x, y, w) {
  txt(s, texto.toUpperCase(), x, y, w, 0.26, { fontSize: 11, bold: true, color: C.teal, charSpacing: 1.5, valign: 'middle' });
}
function rodape(s, texto) {
  txt(s, texto, 2.2, 6.86, 9.6, 0.32, { fontSize: 9, color: C.suave, valign: 'middle' });
}
function novo(titulo) {
  const s = pres.addSlide({ masterName: 'CONTEUDO' });
  s.addText(titulo, { placeholder: 'title' });
  return s;
}
const Y0 = 1.75; // topo do conteúdo

// 1 · CAPA ------------------------------------------------------------
{
  const s = pres.addSlide({ masterName: 'CAPA' });
  txt(s, 'PROPOSTA AO GOVERNO DO DISTRITO FEDERAL', M, 2.2, CW, 0.28, { fontSize: 12, bold: true, color: C.teal, charSpacing: 2.5, valign: 'middle' });
  s.addText('City View', { placeholder: 'title' });
  txt(s, 'Observabilidade da gestão da cidade', M, 3.95, CW, 0.55, { fontSize: 28, valign: 'middle' });
  txt(s, 'Todos os órgãos do Distrito Federal em um só painel.', M, 4.6, CW, 0.4, { fontSize: 18, color: C.suave, valign: 'middle' });
  txt(s, 'Novembro de 2026', M, 6.6, 4, 0.26, { fontSize: 11, color: C.suave });
  s.addNotes('O que vamos mostrar não é um canal de atendimento. É um sistema de observabilidade: uma forma de a governadora ver a cidade inteira e a velocidade da gestão.');
}

// 2 · O PROBLEMA ------------------------------------------------------
{
  const s = novo('Cada sistema vê só o seu pedaço');
  const w = (CW - 0.4) / 2; const h = 3.55;
  [
    ['Na tecnologia', [
      'Um banco tem uma ferramenta para a aplicação, outra para a rede e outra para a segurança.',
      'O sistema fica lento toda tarde. Cada equipe olha a sua ferramenta e responde: "aqui está tudo certo".',
      'Separado, tudo funciona. No todo, não.',
    ]],
    ['Na cidade', [
      'Cada órgão tem o seu sistema: água, energia, iluminação, limpeza, vias, segurança.',
      'O cidadão precisa descobrir aonde ir. A energia é em um lugar; a iluminação, em outro.',
      'O governo não tem um lugar que mostre tudo junto.',
    ]],
  ].forEach((d, i) => {
    const x = M + i * (w + 0.4);
    caixa(s, x, Y0, w, h);
    rotulo(s, d[0], x + 0.35, Y0 + 0.3, w - 0.7);
    lista(s, d[1], x + 0.35, Y0 + 0.75, w - 0.7, h - 0.95);
  });
  caixa(s, M, Y0 + h + 0.3, CW, 0.85, C.destaque);
  s.addText([
    { text: 'Olhando cada parte em separado, ninguém vê o problema. ' },
    { text: 'É isso que a observabilidade resolve.', options: { bold: true, color: C.teal } },
  ], { x: M + 0.35, y: Y0 + h + 0.3, w: CW - 0.7, h: 0.85, margin: 0, isTextBox: true, fontSize: 18, color: C.texto, valign: 'middle', fit: 'none' });
  s.addNotes('Na tecnologia, um cliente grande tem várias ferramentas, cada uma olhando uma parte: aplicação, rede, segurança, suporte. Estão em silos separados. Caso real: num banco, o sistema fica lento toda tarde. O time da aplicação diz que está tudo certo, a rede diz que está tudo certo, a segurança diz que não houve ataque. Olhando cada coisa em separado, funciona; olhando o todo, não. A observabilidade integra esses silos e resolve o problema como um todo. Na cidade, os silos são os órgãos. Em Brasília, nem tudo de energia é com a Neoenergia: a iluminação pública é com a CEB. O cidadão tem que ficar descobrindo aonde ir. Não citar o nome do banco.');
}

// 3 · OBSERVABILIDADE -------------------------------------------------
{
  const s = novo('Observabilidade: ver o todo, não só as partes');
  txt(s, 'Observabilidade é integrar todos os silos em uma só visão, para resolver o problema como um todo.', M, Y0, 11, 0.9, { fontSize: 20, lineSpacingMultiple: 1.12 });
  const g = 0.35; const w = (CW - 2 * g) / 3; const y = Y0 + 1.15; const h = 2.55;
  [
    ['Identificar', 'Saber onde o problema realmente está, e não só onde ele foi registrado.'],
    ['Diagnosticar', 'Cruzar as informações de todos os órgãos para entender a causa.'],
    ['Prever', 'Perceber o que vem pela frente, antes que vire uma fila de chamados.'],
  ].forEach((d, i) => {
    const x = M + i * (w + g);
    caixa(s, x, y, w, h);
    txt(s, d[0], x + 0.35, y + 0.3, w - 0.7, 0.5, { fontSize: 24, bold: true, color: C.teal, valign: 'middle' });
    txt(s, d[1], x + 0.35, y + 1.0, w - 0.7, 1.3, { fontSize: 16, lineSpacingMultiple: 1.12 });
  });
  caixa(s, M, y + h + 0.3, CW, 0.75, C.destaque);
  txt(s, 'Com tudo em uma só visão, resolver cada incidente fica mais fácil e mais rápido.', M + 0.35, y + h + 0.3, CW - 0.7, 0.75, { fontSize: 18, bold: true, valign: 'middle' });
  s.addNotes('Este é o ponto central. Quando você tem a observabilidade, começa a entender onde os seus problemas de fato estão. Você cruza as informações e começa a identificar, diagnosticar e prever problemas. E passa a ter mais facilidade de resolução, porque tornou fácil o processo de resolver incidentes. É o que já se vende na tecnologia: uma ferramenta de observabilidade completa, 360, que se propõe a integrar com cada um dos silos e resolver o problema como um todo. O City View leva essa mesma ideia para a gestão da cidade.');
}

// 4 · O QUE É ---------------------------------------------------------
{
  const s = novo('City View: a cidade inteira em um só painel');
  const lw = 7.4;
  txt(s, 'Um painel de observabilidade e uma camada de inteligência para a governadora.', M, Y0, lw, 1.0, { fontSize: 22, color: C.teal, bold: true, lineSpacingMultiple: 1.1 });
  lista(s, [
    'Conecta os sistemas de todos os órgãos do DF em um só lugar.',
    'Transforma cada demanda em um incidente, seja de água, de luz ou de segurança.',
    'Mostra a cidade inteira e a velocidade da gestão.',
    'Dá ao cidadão um atendimento amigável e rastreável.',
  ], M, Y0 + 1.35, lw, 3.2, { espaco: 14 });
  const rx = M + lw + 0.5; const rw = W - M - rx;
  caixa(s, rx, Y0, rw, 4.4);
  rotulo(s, 'O que não é', rx + 0.35, Y0 + 0.3, rw - 0.7);
  lista(s, [
    'Não é um WhatsApp automatizado.',
    'Não é mais um formulário.',
    'Não substitui o sistema de nenhum órgão.',
  ], rx + 0.35, Y0 + 0.8, rw - 0.7, 2.2, { espaco: 14 });
  txt(s, 'Cada órgão continua trabalhando do jeito que está acostumado.', rx + 0.35, Y0 + 3.15, rw - 0.7, 0.9, { fontSize: 14, color: C.suave, lineSpacingMultiple: 1.1 });
  s.addNotes('É um coletor inteligente de incidentes, que interage com os sistemas que o governo já tem. Não importa se o incidente é de água ou de segurança: a governadora vê tudo como incidente, numa visão só. Não estamos vendendo um formulário de entrada de dados: estamos vendendo a tomada de inteligência. E nada muda para os órgãos: nós entregamos lá, do jeito que cada um já trabalha.');
}

// 4 · COMO FUNCIONA ---------------------------------------------------
{
  const s = novo('Como funciona');
  const g = 0.35; const w = (CW - 2 * g) / 3; const h = 3.7;
  [
    ['1', 'Conecta', ['Integramos os sistemas que o governo já tem, sejam quais forem.', 'Em qualquer tecnologia: por API, por robô ou por arquivos.']],
    ['2', 'Entende', ['Tudo vira incidente, no mesmo formato.', 'A inteligência classifica, agrupa e cruza os incidentes de todos os órgãos.']],
    ['3', 'Mostra', ['A governadora vê tudo em um painel.', 'Cada gestor vê a sua área.', 'O cidadão acompanha a sua demanda.']],
  ].forEach((d, i) => {
    const x = M + i * (w + g);
    caixa(s, x, Y0, w, h);
    txt(s, d[0], x + 0.35, Y0 + 0.25, 1, 0.6, { fontSize: 34, color: C.teal, valign: 'middle' });
    txt(s, d[1], x + 0.35, Y0 + 0.9, w - 0.7, 0.45, { fontSize: 22, bold: true, valign: 'middle' });
    lista(s, d[2], x + 0.35, Y0 + 1.55, w - 0.7, h - 1.7, { fontSize: 15 });
  });
  caixa(s, M, Y0 + h + 0.3, CW, 0.75, C.destaque);
  txt(s, 'O governo aponta o que quer acompanhar. O trabalho de conectar é nosso.', M + 0.35, Y0 + h + 0.3, CW - 0.7, 0.75, { fontSize: 18, bold: true, valign: 'middle' });
  s.addNotes('Seja lá o nome que o sistema tenha por baixo, nós integramos, inclusive os que hoje não estão integrados em lugar nenhum. Um está em .NET, outro em Java, um roda no grande porte, outro no computador de alguém no órgão: a ferramenta vai até lá. Onde houver API, por API; onde não houver, por robô ou por arquivos. Faz parte da implantação o governo apontar quais são esses sistemas: quero gerir segurança, água, esgoto, luz, telefonia. Em cima disso entra a camada de decisão: BI e IA cruzando todos esses dados.');
}

// 5 · INTELIGÊNCIA ----------------------------------------------------
{
  const s = novo('O que só aparece quando se olha o todo');
  const g = 0.35; const w = (CW - 2 * g) / 3; const h = 3.7;
  [
    ['Pedras na pista', 'Vários motoristas avisam de pedras em uma via. São dez chamados sobre a mesma coisa. E o problema não era da via: as pedras eram postas ali para assaltar quem parava.', 'Era segurança pública.'],
    ['Som alto na madrugada', 'Os vizinhos ligam um depois do outro. São dezenas de chamados na fila, e todos falam da mesma casa.', 'É um incidente só.'],
    ['Placa caída', 'Parece só depredação do patrimônio. Muitas vezes é consequência de um acidente de trânsito.', 'Um fato, dois órgãos.'],
  ].forEach((d, i) => {
    const x = M + i * (w + g);
    caixa(s, x, Y0, w, h);
    txt(s, d[0], x + 0.35, Y0 + 0.3, w - 0.7, 0.45, { fontSize: 19, bold: true, valign: 'middle' });
    txt(s, d[1], x + 0.35, Y0 + 0.95, w - 0.7, 1.9, { fontSize: 15, lineSpacingMultiple: 1.12 });
    txt(s, d[2], x + 0.35, Y0 + h - 0.75, w - 0.7, 0.45, { fontSize: 17, bold: true, color: C.teal, valign: 'middle' });
  });
  caixa(s, M, Y0 + h + 0.3, CW, 0.75, C.destaque);
  txt(s, 'O City View agrupa os chamados que falam da mesma coisa e cruza o que cada órgão vê separado.', M + 0.35, Y0 + h + 0.3, CW - 0.7, 0.75, { fontSize: 17, bold: true, valign: 'middle' });
  rodape(s, 'Exemplos ilustrativos.');
  s.addNotes('Existem coisas que são ligadas umas às outras, e ninguém vê isso de forma integrada sem um integrador. Pedras na pista: quem passou e desviou avisou que havia uma pedra na via. Um falou, outro falou, outro falou: dez chamados, que na verdade são o mesmo, e que no fim não eram sobre a via, eram de segurança pública. Som alto: é a perturbação do sossego, muitos chamados para a mesma casa. Placas caídas: um incidente de trânsito que afeta um patrimônio público. Contar o caso das pedras como exemplo, sem nomes, lugar ou ano. Não afirmar que perturbação do sossego é a maior fonte de chamados da PM.');
}

// 6 · A GOVERNADORA ---------------------------------------------------
{
  const s = novo('Observabilidade para a governadora');
  const lw = 7.4;
  rotulo(s, 'A sala de situação', M, Y0, lw);
  lista(s, [
    'Todos os chamados da cidade, agrupados e classificados.',
    'Um mapa de calor: onde as coisas estão pegando e onde estão tranquilas.',
    'A velocidade da gestão, medida na cidade inteira.',
    'A informação que ela quiser, por cidade, por órgão e por assunto.',
  ], M, Y0 + 0.5, lw, 3.6, { espaco: 14 });
  const rx = M + lw + 0.5; const rw = W - M - rx;
  caixa(s, rx, Y0, rw, 4.4);
  rotulo(s, 'Um painel para cada gestor', rx + 0.35, Y0 + 0.3, rw - 0.7);
  lista(s, ['Água e esgoto', 'Energia', 'Iluminação', 'Vias públicas', 'Limpeza urbana', 'Segurança', 'Telefonia'], rx + 0.35, Y0 + 0.8, rw - 0.7, 2.75, { fontSize: 15, espaco: 4 });
  txt(s, 'Cada um vê o que diz respeito à sua área.', rx + 0.35, Y0 + 3.65, rw - 0.7, 0.5, { fontSize: 14, color: C.suave, valign: 'middle' });
  txt(s, 'A demonstração a seguir mostra este painel funcionando.', M, Y0 + 4.2, lw, 0.4, { fontSize: 15, bold: true, color: C.teal, valign: 'middle' });
  s.addNotes('A governadora pode ter uma sala de situação ao lado da sala dela, com um telão mostrando todos os chamados agrupados e classificados num mapa de calor: onde as coisas estão pegando e onde estão mais tranquilas. Ela passa a ter condição de ver a velocidade da gestão e como a gestão realmente está. E o gestor da CAESB quer ver o que diz respeito a ele: então há um painel para o gestor de água e esgoto, o de telefonia, o de iluminação, o de energia, o de vias públicas, e assim por diante. Aqui a apresentação passa para a demonstração.');
}

// VELOCIDADE DA GESTÃO ------------------------------------------------
{
  const s = novo('A velocidade da gestão, à vista');
  const lw = 7.4;
  txt(s, 'A governadora passa a ver como a gestão realmente está.', M, Y0, lw, 0.9, { fontSize: 22, color: C.teal, bold: true, lineSpacingMultiple: 1.1 });
  lista(s, [
    'Quantas demandas chegam e quantas são resolvidas.',
    'Quanto tempo cada tipo de problema leva para ser resolvido.',
    'Qual órgão e qual cidade andam mais rápido, e onde está travando.',
    'Se a gestão está melhorando ou piorando, mês a mês.',
  ], M, Y0 + 1.25, lw, 3.2, { espaco: 14 });
  const rx = M + lw + 0.5; const rw = W - M - rx;
  caixa(s, rx, Y0, rw, 4.4);
  rotulo(s, 'Hoje', rx + 0.35, Y0 + 0.3, rw - 0.7);
  txt(s, 'Cada órgão sabe do seu prazo. Ninguém soma.', rx + 0.35, Y0 + 0.7, rw - 0.7, 0.9, { fontSize: 15, lineSpacingMultiple: 1.12 });
  rotulo(s, 'Com o City View', rx + 0.35, Y0 + 2.0, rw - 0.7);
  txt(s, 'Um só número para a cidade inteira, que abre por órgão, por cidade e por assunto.', rx + 0.35, Y0 + 2.4, rw - 0.7, 1.4, { fontSize: 15, lineSpacingMultiple: 1.12 });
  s.addNotes('A frase para a governadora: a senhora vai ter agora uma ferramenta que dá condição de ver a velocidade da sua gestão, e de ver como a sua gestão realmente está. Hoje cada órgão acompanha a própria fila; com tudo no mesmo formato, dá para medir o tempo entre o problema chegar e ser resolvido, na cidade inteira. E, se a gestão quiser, pode mostrar isso ao cidadão: neste mês, estes chamados foram resolvidos. Os indicadores exatos são definidos com o governo.');
}

// O CIDADÃO -------------------------------------------------------
{
  const s = novo('E mais: um canal único para o cidadão');
  const lw = 7.4;
  lista(s, [
    'O cidadão registra qualquer demanda, para qualquer órgão, em um só canal.',
    'No canal que a gestão escolher: WhatsApp, SMS, Instagram.',
    'Por baixo, o City View abre a solicitação no sistema do órgão certo.',
    'O cidadão acompanha até a solução, sem precisar descobrir aonde ir.',
  ], M, Y0, lw, 4.2, { espaco: 14 });
  const rx = M + lw + 0.5; const rw = W - M - rx;
  caixa(s, rx, Y0, rw, 4.4);
  rotulo(s, 'Observabilidade cidadã', rx + 0.35, Y0 + 0.3, rw - 0.7);
  txt(s, 'Um mapa para ele ver como a cidade evolui. A gestão escolhe o que mostrar:', rx + 0.35, Y0 + 0.75, rw - 0.7, 1.1, { fontSize: 15, lineSpacingMultiple: 1.1 });
  s.addText([
    { text: 'Só o que foi resolvido', options: { bullet: { type: 'number' }, breakLine: true, paraSpaceAfter: 10 } },
    { text: 'Também o que está em resolução', options: { bullet: { type: 'number' }, breakLine: true, paraSpaceAfter: 10 } },
    { text: 'Também o que ainda está aberto', options: { bullet: { type: 'number' } } },
  ], { x: rx + 0.35, y: Y0 + 2.05, w: rw - 0.7, h: 2.1, margin: 0, isTextBox: true, fontSize: 15, color: C.texto, valign: 'top', fit: 'none' });
  s.addNotes('Este não é o foco, é um a mais. Nós somos a camada de interface com o cidadão: onde a gestão quiser falar com ele, a gente fala. E não pode ser só uma camada de abrir e acabou: o cidadão acompanha e tem a satisfação de ver que o problema dele está sendo tratado pela gestão pública. Se a gestão é boa, pode dar ao cidadão um mapa para ele ver como as coisas evoluem: só o que foi resolvido no mês, verdinho no mapa; ou, se a gestão for mais arrojada, também o que está em resolução e o que ainda está aberto.');
}

// CASE: ÁGUAS CLARAS x DF ---------------------------------------------
{
  const s = novo('Um primeiro exemplo: Águas Claras');
  const h = 3.75; const lw = 5.1; const rx = M + lw + 0.4; const rw = W - M - rx;
  // esquerda: o que já operamos
  caixa(s, M, Y0, lw, h, C.destaque);
  rotulo(s, 'Águas Claras, hoje', M + 0.35, Y0 + 0.28, lw - 0.7);
  txt(s, 'Captação de demandas em operação, com envio aos canais oficiais do GDF.', M + 0.35, Y0 + 0.62, lw - 0.7, 0.6, { fontSize: 13.5, color: C.suave, lineSpacingMultiple: 1.1 });
  [['843', 'demandas cadastradas'], ['389', 'já resolvidas (46%)'], ['14', 'órgãos acionados']].forEach((d, i) => {
    const y = Y0 + 1.4 + i * 0.75;
    txt(s, d[0], M + 0.35, y, 1.5, 0.65, { fontSize: 36, bold: true, color: C.teal, valign: 'middle' });
    txt(s, d[1], M + 1.95, y, lw - 2.3, 0.65, { fontSize: 16, valign: 'middle' });
  });
  // direita: os silos do DF
  caixa(s, rx, Y0, rw, h);
  rotulo(s, 'O DF, hoje: cada órgão com a sua fila', rx + 0.35, Y0 + 0.28, rw - 0.7);
  [
    ['Ouvidoria do GDF · 162', '900 a 1.000', 'manifestações por dia (2024)'],
    ['Polícia Militar · 190', '134.091', 'ocorrências atendidas (2024)'],
    ['Água e esgoto · CAESB', '36.778', 'manifestações à ouvidoria (2025)'],
    ['Iluminação · CEB IPes', '14.487', 'chamados em três meses (2026)'],
  ].forEach((d, i) => {
    const y = Y0 + 0.78 + i * 0.7;
    if (i > 0) s.addShape(pres.ShapeType.line, { x: rx + 0.35, y: y - 0.05, w: rw - 0.7, h: 0, line: { color: C.linha, width: 0.75 } });
    txt(s, d[0], rx + 0.35, y + 0.04, rw - 2.7, 0.28, { fontSize: 14.5, bold: true, valign: 'middle' });
    txt(s, d[2], rx + 0.35, y + 0.32, rw - 2.7, 0.24, { fontSize: 12, color: C.suave, valign: 'middle' });
    txt(s, d[1], rx + rw - 2.35, y, 2.0, 0.6, { fontSize: 22, bold: true, color: C.teal, align: 'right', valign: 'middle' });
  });
  txt(s, 'Em Águas Claras, conectamos uma ponta. O City View conecta todas: todos os órgãos, o DF inteiro, em um só painel.', M, Y0 + h + 0.3, CW, 0.8, { fontSize: 17, bold: true, lineSpacingMultiple: 1.12 });
  rodape(s, 'Fontes: mapa público DFÁguasClaras, 06/11/2026 (desde set. 2024) · Jornal de Brasília, 20/11/2024 · CB.Poder, 23/01/2025 · Relatório de Gestão da Ouvidoria Caesb 2025 · Agência Brasília, 29/10/2026 (jul. a set. 2026).');
  s.addNotes('O que já temos hoje é um sistema de captação de demandas rodando em Águas Claras, com envios reais aos canais oficiais do GDF: 843 demandas cadastradas desde setembro de 2024, 389 já resolvidas, 14 órgãos acionados. É um exemplo de uma das pontas, não o City View. Do outro lado estão algumas das filas do DF, cada uma no seu sistema, sem enxergar as outras. Cuidados: os números do DF são de períodos diferentes, não some. Não dizer que o cidadão prefere o canal de Águas Claras ao portal oficial: isso não foi medido.');
}

// 9 · COMO COMEÇA -----------------------------------------------------
{
  const s = novo('Como começa');
  const g = 0.35; const w = (CW - 2 * g) / 3; const h = 2.5;
  [
    ['1', 'O governo aponta', 'As áreas e os sistemas que quer acompanhar.'],
    ['2', 'Nós conectamos', 'Cada sistema, com o apoio de cada órgão.'],
    ['3', 'A governadora vê', 'A cidade inteira no painel, e a velocidade da gestão.'],
  ].forEach((d, i) => {
    const x = M + i * (w + g);
    caixa(s, x, Y0, w, h);
    txt(s, d[0], x + 0.35, Y0 + 0.25, 1, 0.6, { fontSize: 34, color: C.teal, valign: 'middle' });
    txt(s, d[1], x + 0.35, Y0 + 0.9, w - 0.7, 0.45, { fontSize: 21, bold: true, valign: 'middle' });
    txt(s, d[2], x + 0.35, Y0 + 1.45, w - 0.7, 0.85, { fontSize: 15, color: C.suave, lineSpacingMultiple: 1.1 });
  });
  txt(s, 'Para o governo ver o todo.', M, Y0 + h + 0.55, CW, 0.5, { fontSize: 26, bold: true, valign: 'middle' });
  txt(s, 'Para o cidadão ver o que o governo entrega.', M, Y0 + h + 1.1, CW, 0.5, { fontSize: 26, bold: true, color: C.teal, valign: 'middle' });
  txt(s, 'Próximo passo: demonstração do painel.', M, Y0 + h + 1.85, CW, 0.4, { fontSize: 16, color: C.suave, valign: 'middle' });
  s.addNotes('O trabalho de conectar e buscar as informações é nosso, com a ajuda do governo: ele aponta o que quer gerir e libera o acesso aos sistemas. Perguntas prováveis. Substitui o 190 ou o 162? Não: integra e acompanha. Já temos acesso aos sistemas? Não: depende de o governo apontar e liberar. Quais órgãos primeiro? A definir com o governo. Quanto custa? A definir.');
}

// ---------- grava e aplica as cores do tema ----------
async function aplicarTema(arquivo) {
  const zip = await JSZip.loadAsync(fs.readFileSync(arquivo));
  const parte = 'ppt/theme/theme1.xml';
  const xml = await zip.file(parte).async('string');
  const ordem = ['dk1', 'lt1', 'dk2', 'lt2', 'accent1', 'accent2', 'accent3', 'accent4', 'accent5', 'accent6', 'hlink', 'folHlink'];
  const esquema = `<a:clrScheme name="${TEMA.nome}">` + ordem.map((k) => `<a:${k}><a:srgbClr val="${HEX[k]}"/></a:${k}>`).join('') + '</a:clrScheme>';
  const novoXml = xml.replace(/<a:clrScheme\b[\s\S]*?<\/a:clrScheme>/, () => esquema);
  if (!novoXml.includes(esquema)) throw new Error('theme1.xml sem <a:clrScheme>');
  zip.file(parte, novoXml);
  fs.writeFileSync(arquivo, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
}

(async () => {
  fs.mkdirSync(path.dirname(SAIDA), { recursive: true });
  await pres.writeFile({ fileName: SAIDA });
  await aplicarTema(SAIDA);
  console.log('ok', SAIDA);
})();

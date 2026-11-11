// Tokens visuais da apresentação. Direção escolhida em 11/11/2026: C · Híbrida.
// Escuro (navy) para capa, divisórias e números de impacto ("telão");
// claro para conteúdo. Fonte nativa do Windows (Bahnschrift).
const path = require('path');

const ASSETS = path.join(__dirname, '..', 'assets');
const IMAGENS = path.join(__dirname, '..', 'imagens', 'deck');

module.exports = {
  W: 13.333,
  H: 7.5,
  cor: {
    escuro: '0B1E31',
    escuro2: '12293F',
    linhaEscura: '1E3852',
    claro: 'FFFFFF',
    painel: 'F3F6F8',
    tinta: '0F2A43',
    tinta2: '52667A',
    tinta3: '93A1AE',
    regua: 'DDE3E8',
    teal: '0196B2', // teal DataSynq
    tealClaro: '38C3DB',
    ambar: 'F2A93B', // destaque e selos; usar com parcimônia
    textoSobreEscuro: 'C9D6E2',
    rotuloSobreEscuro: 'B7C6D4',
  },
  fonte: {
    titulo: 'Bahnschrift SemiBold',
    corpo: 'Bahnschrift',
    leve: 'Bahnschrift Light',
    rotulo: 'Bahnschrift SemiBold Condensed',
  },
  logo: {
    sobreClaro: path.join(ASSETS, 'logo_dark.png'),
    sobreEscuro: path.join(ASSETS, 'logo_light.png'),
    proporcao: 840 / 180,
  },
  imagem: (nome) => path.join(IMAGENS, `${nome}.jpg`),
  proporcaoImagem: 2400 / 1355,
};

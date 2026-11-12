// City View · Design system "Sala de Operações"
// CSS: importe tokens.css e base.css (nessa ordem) no CSS do app. Documentação: docs/CV-DS-001.
export { Painel, Rotulo, Selo, Chip, Botao, Pilula, Kpi, Alerta, Legenda } from './componentes/basicos';
export { CartaoInsight, TrocaTema, Segmentado, BarraSuperior, Navegacao, PainelLateral, LinhaDeIncidente, type ItemNav } from './componentes/compostos';
export { temaInicial, aplicarTema, temaAtual, aoMudarTema, type Tema } from './tema';
export { lerPaleta, NUM_AREAS, type Paleta } from './paleta';

// Narrativa da página de rolagem: o que seria o City View, a partir da conversa com o Daniel.
// Fonte de cada fato ao lado: ATA = docs/fonte/CV-ATA-001 (linha); magno = CV-SPEC-000 (seção).
// Pontos, números da sala de situação e casos de inteligência são ILUSTRATIVOS e rotulados na tela.

export type Situacao = 'em uso' | 'pronta' | 'aguardando a Meta' | 'proposta' | 'exemplo';

// Áreas usadas para colorir os chamados ilustrativos (órgãos e canais citados: magno 4.8 e 8).
// As cores vêm do tema (estilos.css: --area-N e --status-N).
export const AREAS = [
  { id: 'ouvidoria', nome: 'Ouvidoria', canal: '162', peso: 22 },
  { id: 'seguranca', nome: 'Segurança', canal: '190', peso: 20 },
  { id: 'iluminacao', nome: 'Iluminação', canal: '155', peso: 16 },
  { id: 'vias', nome: 'Vias', canal: 'DER-DF', peso: 14 },
  { id: 'agua', nome: 'Água e esgoto', canal: '115', peso: 12 },
  { id: 'limpeza', nome: 'Limpeza urbana', canal: 'SLU', peso: 10 },
  { id: 'energia', nome: 'Energia', canal: 'Neoenergia', peso: 6 },
] as const;
export const AREA = Object.fromEntries(AREAS.map((a, i) => [a.id, i])) as Record<(typeof AREAS)[number]['id'], number>;
export const STATUS = [
  { nome: 'resolvido' },
  { nome: 'em resolução' },
  { nome: 'aberto' },
];

export const abertura = {
  rotulo: 'Proposta ao Governo do Distrito Federal',
  titulo: 'City View',
  sub: 'Observabilidade da gestão da cidade',
  dica: 'Role para começar',
  // [Equipe] enquadramento; exemplos de chamados: magno 4.8
  cidadeTitulo: 'Todos os dias, a cidade fala por milhares de chamados.',
  cidadeTexto: 'Um buraco, um poste apagado, um som alto, uma falta d’água. Cada ponto é uma demanda, em algum sistema, de algum órgão.',
  aviso: 'Pontos ilustrativos: não são chamados reais',
};

export const silos = {
  rotulo: 'O problema',
  passos: [
    // magno 4.1 e 4.8
    { titulo: 'Cada órgão vê só a própria fila.', texto: 'Ouvidoria, 190, água, iluminação, energia, limpeza, vias. Cada um com o seu sistema, e nenhum enxerga o do outro.' },
    // ATA 94–101 (o banco lento; sem citar o nome do banco: magno 5.1)
    { titulo: 'Separado, tudo funciona.', texto: 'Na tecnologia isso já tem nome. Num banco, o sistema fica lento toda tarde: a aplicação diz que está tudo certo, a rede também, e a segurança não viu ataque.' },
    // ATA 99–101 e 117–120
    { titulo: 'Olhando o todo, não.', texto: 'O cidadão precisa descobrir para onde ir. E ninguém vê a cidade inteira.' },
  ],
  okColuna: 'tudo certo',
};

export const virada = {
  rotulo: 'A virada',
  passos: [
    // ATA 91–93 e 105
    { titulo: 'Observabilidade.', texto: 'Integrar todos os silos e olhar a cidade como um todo, para identificar, diagnosticar e prever problemas.' },
    // ATA 143–144 e 214–216
    { titulo: 'Não é um WhatsApp automatizado.', texto: 'É um coletor inteligente de incidentes, que conversa com os sistemas que o governo já tem.' },
  ],
};

export type Caso = { tipo: string; titulo: string; viu: string; porque: string[]; confianca: string; sugere: string };

export const inteligencia = {
  rotulo: 'Inteligência',
  // ATA 148–149, 177–186; motivo, evidências e confirmação humana: magno 7.2 [Equipe]
  titulo: 'A IA liga os pontos. E explica por quê.',
  texto: 'Classifica, agrupa e cruza os chamados de todos os órgãos. Cada sugestão vem com o motivo e as evidências, e uma pessoa confirma antes de qualquer ação.',
  casos: [
    // magno 5.5 (chamados repetidos para a mesma casa; ilustrativo)
    { tipo: 'Mesmo incidente', titulo: 'Dezenas de chamados, uma só casa', viu: 'Chamados ao 190 sobre som alto no mesmo endereço, na mesma madrugada, e denúncias de poluição sonora no órgão ambiental.', porque: ['mesmo endereço', 'mesmo horário', 'mesmo assunto'], confianca: 'alta', sugere: 'Tratar como um só incidente e acionar a fiscalização pela recorrência.' },
    // magno 5.3 (cenário sem nomes, sem lugar e sem ano)
    { tipo: 'Reclassificação', titulo: 'As pedras na pista eram emboscada', viu: 'Relatos de pedras grandes na pista e roubos de carro com pneu furado, no mesmo trecho e na mesma faixa de horário.', porque: ['mesmo trecho', 'mesma faixa de horário', 'órgãos diferentes'], confianca: 'média', sugere: 'Tratar como segurança pública, não como manutenção de via.' },
    // magno 5.4
    { tipo: 'Cruzamento', titulo: 'A placa derrubada era acidente', viu: 'Placa caída no mesmo cruzamento onde houve registro de acidente de trânsito na mesma semana.', porque: ['mesmo cruzamento', 'mesma semana'], confianca: 'média', sugere: 'Tratar como incidente de trânsito que afetou o patrimônio público.' },
  ] as Caso[],
  decide: 'Uma pessoa confirma',
};

export const sala = {
  rotulo: 'Para a governadora',
  passos: [
    // ATA 220–222
    { titulo: 'A cidade inteira numa tela.', texto: '“Um telão com todos os chamados agrupados e classificados num mapa de calor: onde as coisas estão pegando, onde estão mais tranquilas.”', origem: 'Daniel, sobre a sala de guerra' },
    // ATA 147–148
    { titulo: 'E a velocidade da gestão.', texto: 'Quanto tempo cada tipo de problema leva para ser resolvido, por região e por órgão. E como a gestão realmente está.', origem: '' },
  ],
  // ILUSTRATIVO: números simulados para mostrar o painel; nenhum é dado do DF
  kpis: [
    { rotulo: 'Chamados hoje', valor: '4.812' },
    { rotulo: 'Viraram incidentes', valor: '1.327' },
    { rotulo: 'Tempo até resolver', valor: '6,4 dias' },
    { rotulo: 'No prazo', valor: '71%' },
  ],
  alertas: ['Dezenas de chamados, uma só casa', 'Pedras na pista: segurança', 'Placa derrubada: acidente'],
  selo: 'Demonstração · dados simulados',
};

export const gestores = {
  rotulo: 'Para cada gestor',
  // ATA 223–227
  citacao: '“O cara da CAESB quer ter uma visão do que diz respeito a ele.”',
  areas: ['agua', 'iluminacao', 'vias', 'seguranca'] as (keyof typeof AREA)[],
  texto: 'Um painel por área, com o que é dele e com o que cruza com os outros órgãos.',
};

export const cidadao = {
  rotulo: 'Para o cidadão',
  passos: [
    // ATA 233–235
    { titulo: 'O cidadão vê o que o governo entrega.', texto: 'Só o que foi resolvido, verdinho no mapa: tudo isso aqui foi resolvido este mês.' },
    // ATA 236–237
    { titulo: 'Se a gestão for mais arrojada…', texto: '…mostra também o que está em resolução.' },
    { titulo: '…e o que ainda está aberto.', texto: 'A gestão escolhe o quanto mostrar. E o cidadão acompanha a própria demanda até resolver.' },
  ],
};

// Arquitetura: o diagrama em camadas (CV-REF-002) com os sistemas legados à esquerda.
export const arquitetura = {
  rotulo: 'Como funciona',
  passos: [
    // ATA 169–175 ("Portal do cidadão, ADM24, ADM72, o nome que tiver")
    { titulo: 'Conecta o que já existe.', texto: 'Portal do Cidadão, ADM 24h, ADM72, o nome que tiver. Seja qual for o sistema, inclusive os que hoje não se integram com nada.' },
    // ATA 171–172, 199–205; robô só com autorização formal (CV-REF-001 §7)
    { titulo: 'Do jeito que cada sistema permitir.', texto: 'API, robô autorizado ou troca de arquivos, em qualquer tecnologia. A gestão aponta os sistemas; ligar cada um faz parte da implantação.' },
    // ATA 196–212 e 269–275 (a abertura de demandas é uma ponte)
    { titulo: 'O cidadão fala por um só lugar.', texto: 'No canal que a gestão escolher. A demanda é aberta no sistema certo de cada órgão e acompanhada até resolver.' },
    // ATA 120 e 177–179 ("data lake", "intersecção de chamados")
    { titulo: 'Tudo vira incidente, num formato só.', texto: 'Os chamados de todos os sistemas entram na mesma base: local, hora, tipo, órgão, situação e origem.' },
    // ATA 148–149, 177–186, 220–237
    { titulo: 'E a inteligência cruza tudo.', texto: 'Classifica, agrupa, cruza e prevê. Disso saem as visões da governadora, de cada gestor e do cidadão.' },
  ],
  // situação: CV-REF-002 §4.1; ADM 24h e ADM72 citados pelo Daniel, ainda não identificados (magno 9.6)
  legados: [
    { nome: 'Portal do Cidadão', situacao: 'integrado' },
    { nome: 'ADM 24h', situacao: 'citado' },
    { nome: 'ADM72', situacao: 'citado' },
    { nome: 'ParticipaDF', situacao: 'integrado' },
    { nome: 'IluminaDF · CEB', situacao: 'pronto' },
    { nome: '190 · PMDF', situacao: 'exemplo' },
    { nome: 'CAESB', situacao: 'exemplo' },
    { nome: 'Neoenergia', situacao: 'exemplo' },
    { nome: 'SLU', situacao: 'exemplo' },
    { nome: 'DER-DF', situacao: 'exemplo' },
    { nome: 'DETRAN-DF', situacao: 'exemplo' },
    { nome: 'Telefonia', situacao: 'exemplo' },
  ] as { nome: string; situacao: 'integrado' | 'pronto' | 'citado' | 'exemplo' }[],
  // ATA 199–203
  tecnologias: 'Qualquer tecnologia: .NET · Java · grande porte · site sem API',
  conectores: ['API', 'Robô autorizado', 'Troca de arquivos'],
  canais: ['WhatsApp', 'App', 'SMS', 'Instagram'],
  legenda: 'Linha cheia: integração já construída (Águas Claras). Tracejada: exemplos que a gestão pode apontar. ADM 24h e ADM72: citados pelo Daniel.',
};

// Magno 6.1 e CV-REF-001 §2. Não dizer "últimos 12 meses"; preferência do cidadão não foi medida.
export const prova = {
  rotulo: 'Já funciona numa ponta',
  titulo: 'Águas Claras.',
  texto: 'Abrir, encaminhar e acompanhar demandas já roda numa região, com envios reais aos canais oficiais do GDF.',
  numeros: [
    { valor: '843', texto: 'demandas no mapa público desde set./2024' },
    { valor: '46%', texto: 'resolvidas (389)' },
    { valor: '14', texto: 'órgãos acionados' },
    { valor: '59', texto: 'cidadãos atendidos pelo WhatsApp desde 30/09/2026' },
  ],
  fontes: 'Mapa público DFÁguasClaras, 06/11/2026 · base da ouvidoria (dfac), 28/10/2026',
  ra: 'RA-XX',
};

export const encerramento = {
  titulo: 'City View',
  // magno 1; ATA 214–216
  linhas: ['Para o governo ver o todo.', 'Para o cidadão ver o que o governo entrega.'],
};

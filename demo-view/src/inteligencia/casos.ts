/**
 * Os casos de inteligência da demo (I3): o que a camada 5 do City View mostraria
 * ao cruzar chamados de órgãos diferentes.
 *
 * SIMULADOS. Endereços, horários e contagens são fictícios; os padrões vêm da
 * conversa de 10/11/2026 (chamados repetidos de perturbação do sossego, pedras
 * na via que eram emboscada, placas caídas que indicam acidentes, causas comuns
 * entre órgãos). Portados da demo exploratória (`City-view`,
 * `apps/sala-de-situacao/src/data/inteligencia.ts`), com os textos como estavam.
 *
 * A leitura, a recomendação e o ganho são escritos à mão. O que é calculado é o
 * agrupamento (`agrupamento.ts`): quais chamados se juntam, com que força e por quê.
 */
import { type AreaId, ORGAO_POR_ID } from '../dominio/orgaos';
import { GRAUS_POR_UNIDADE, REGIAO_POR_ID } from '../dominio/ras';

export type TipoCaso = 'Mesmo incidente' | 'Reclassificação' | 'Causa comum' | 'Risco combinado' | 'Recorrência' | 'Previsão';
export type Severidade = 'crítico' | 'sério' | 'atenção';

/**
 * De onde vem o sinal: chamado = demanda do cidadão; operação = registro do
 * próprio órgão (interrupção, ordem de serviço); contexto = dado da cidade
 * (clima, eventos). Só os chamados viram pontos no mapa.
 */
export type FonteSinal = 'chamado' | 'operação' | 'contexto';

export interface Sinal {
  orgaoId: string;
  canal: string;
  /** Chamados, quando a fonte é chamado; registros, nas demais. */
  quantidade: number;
  descricao: string;
  /** Padrão: chamado. */
  fonte?: FonteSinal;
}

export const fonteDoSinal = (s: Sinal): FonteSinal => s.fonte ?? 'chamado';

export interface Caso {
  id: string;
  titulo: string;
  tipo: TipoCaso;
  severidade: Severidade;
  /** Área do caso. "saude" só existe aqui: não há órgão de saúde no catálogo da demo. */
  area: AreaId | 'saude';
  raId: string;
  local: string;
  /** Deslocamento em relação ao núcleo urbano da RA, em unidades de ~100 m ([leste, sul]). */
  deslocamento: [number, number];
  detectadoHaMin: number;
  sinais: Sinal[];
  leitura: string;
  recomendacao: string[];
  ganho: string;
  linhaDoTempo: { quando: string; texto: string }[];
}

/**
 * Órgãos que os casos citam e que ainda não estão no catálogo da demo
 * (`dominio/orgaos.ts`, que só traz os que têm volume com fonte no magno).
 * Aqui entram só como origem de sinais simulados.
 */
export const FONTES_SIMULADAS: Record<string, { sigla: string; nome: string }> = {
  pcdf: { sigla: 'PCDF', nome: 'Polícia Civil do Distrito Federal' },
  detran: { sigla: 'Detran-DF', nome: 'Departamento de Trânsito do Distrito Federal' },
  'defesa-civil': { sigla: 'Defesa Civil', nome: 'Defesa Civil do Distrito Federal' },
  vigilancia: { sigla: 'Vigilância Ambiental', nome: 'Vigilância Ambiental em Saúde' },
  ses: { sigla: 'SES-DF', nome: 'Secretaria de Saúde do Distrito Federal' },
};

export const siglaDoOrgao = (id: string) => ORGAO_POR_ID[id]?.sigla ?? FONTES_SIMULADAS[id]?.sigla ?? id;

export const CASOS: Caso[] = [
  {
    id: "pedras-recanto",
    titulo: "Pedras na pista que eram emboscada",
    tipo: "Reclassificação",
    severidade: "crítico",
    area: "seguranca",
    raId: "recanto-das-emas",
    local: "Rodovia de acesso ao Recanto das Emas, trecho de 800 m",
    deslocamento: [14, -8],
    detectadoHaMin: 38,
    sinais: [
      { orgaoId: "der", canal: "162", quantidade: 9, descricao: "\"Pedras grandes na pista\", mesmo trecho, em 12 dias" },
      { orgaoId: "pcdf", canal: "Delegacia Eletrônica", quantidade: 4, descricao: "Roubos de veículo após pneu furado, 21h às 23h" },
      { orgaoId: "pmdf", canal: "190", quantidade: 3, descricao: "\"Carro parado com pneu furado e homens se aproximando\"" },
    ],
    leitura:
      "Separados, são três problemas pequenos: manutenção de rodovia no DER, ocorrências avulsas na PCDF e chamados genéricos no 190. Juntos, no mesmo trecho e na mesma faixa de horário, formam o padrão de uma emboscada: pedras colocadas para furar pneus e abordar o motorista. Não é um incidente de via, é de segurança pública.",
    recomendacao: [
      "Reclassificar o trecho como ponto de risco de segurança e avisar a PMDF.",
      "Patrulhamento no trecho entre 20h e 0h enquanto o padrão se mantiver.",
      "DER remove as pedras e avalia iluminação do trecho.",
      "Responder aos 9 cidadãos que relataram as pedras: o relato deles ajudou a identificar o risco.",
    ],
    ganho: "16 chamados em 3 órgãos viram 1 alerta de segurança antes do próximo assalto.",
    linhaDoTempo: [
      { quando: "há 12 dias", texto: "Primeiro relato de pedras na pista (DER, via 162)" },
      { quando: "há 9 dias", texto: "Roubo de veículo com pneu furado no mesmo trecho (PCDF)" },
      { quando: "há 4 dias", texto: "Terceiro relato de pedras; segundo roubo (DER + PCDF)" },
      { quando: "ontem", texto: "Chamado ao 190: carro parado e homens se aproximando" },
      { quando: "há 38 min", texto: "City View cruza os três órgãos e abre o alerta" },
    ],
  },
  {
    id: "sossego-ceilandia",
    titulo: "47 ligações ao 190 para a mesma casa",
    tipo: "Mesmo incidente",
    severidade: "sério",
    area: "seguranca",
    raId: "ceilandia",
    local: "Ceilândia Norte, quadra residencial",
    deslocamento: [6, -10],
    detectadoHaMin: 12,
    sinais: [
      { orgaoId: "pmdf", canal: "190", quantidade: 47, descricao: "Perturbação do sossego, som alto, entre 23h10 e 1h40" },
      { orgaoId: "ibram", canal: "162", quantidade: 3, descricao: "Denúncias de poluição sonora no mesmo endereço (30 dias)" },
      { orgaoId: "pmdf", canal: "190", quantidade: 4, descricao: "Mesmo endereço nos últimos quatro fins de semana" },
    ],
    leitura:
      "Os 47 chamados descrevem um único evento: vizinhos diferentes ligando para o mesmo som alto. Hoje cada ligação ocupa o atendimento do 190 como se fosse nova. O endereço se repete há quatro fins de semana e já tem denúncias no Brasília Ambiental: é um caso de fiscalização recorrente, não só de viatura.",
    recomendacao: [
      "Uma ocorrência na PMDF, com os 47 relatos anexados.",
      "Ação conjunta com o Brasília Ambiental (poluição sonora) e o DF Legal (alvará) para encerrar a recorrência.",
      "Um único retorno aos 47 cidadãos quando a ocorrência for atendida.",
    ],
    ganho: "46 atendimentos repetidos evitados nesta noite, e um endereço reincidente que passa a ter dono.",
    linhaDoTempo: [
      { quando: "há 4 semanas", texto: "Primeiras denúncias de som no endereço (Brasília Ambiental)" },
      { quando: "23h10", texto: "Primeira ligação ao 190" },
      { quando: "23h40", texto: "12 ligações de vizinhos diferentes" },
      { quando: "há 12 min", texto: "City View agrupa 47 chamados num incidente" },
    ],
  },
  {
    id: "apagao-planaltina",
    titulo: "Um temporal, quatro órgãos, um incidente",
    tipo: "Mesmo incidente",
    severidade: "crítico",
    area: "energia",
    raId: "planaltina",
    local: "Planaltina, setores tradicional e Arapoanga",
    deslocamento: [-30, 18],
    detectadoHaMin: 95,
    sinais: [
      { orgaoId: "neoenergia", canal: "116", quantidade: 640, descricao: "Falta de energia após o temporal" },
      { orgaoId: "neoenergia", canal: "116", quantidade: 38, descricao: "Fio partido ou rede caída" },
      { orgaoId: "detran", canal: "Site Detran-DF", quantidade: 51, descricao: "Semáforos apagados em 7 cruzamentos" },
      { orgaoId: "defesa-civil", canal: "199", quantidade: 14, descricao: "Queda de árvore sobre a rede" },
      // Sinais de operação e contexto ficam no fim: não viram pontos no mapa.
      { orgaoId: "neoenergia", canal: "Operação da rede", quantidade: 3, descricao: "Alimentadores desligados após o temporal: 18.400 clientes sem energia, fora do normal", fonte: "operação" },
      { orgaoId: "detran", canal: "Câmeras do DF 360 (proposta)", quantidade: 7, descricao: "Eventos de trânsito parado nos mesmos 7 cruzamentos; só o evento, sem imagem", fonte: "operação" },
      { orgaoId: "defesa-civil", canal: "Alerta meteorológico", quantidade: 1, descricao: "Alerta de temporal com rajadas para a região, emitido na véspera", fonte: "contexto" },
    ],
    leitura:
      "Quase 750 chamados chegaram a quatro órgãos, mas a causa é uma só: árvores caídas sobre a rede elétrica no temporal. Os semáforos apagados explicam os congestionamentos relatados ao Detran. Tratar cada fila separadamente atrasa a resposta e repete a mesma explicação ao cidadão centenas de vezes.",
    recomendacao: [
      "Tratar como um incidente com responsável principal: Neoenergia.",
      "Defesa Civil e Novacap removem as árvores antes do religamento.",
      "Detran posiciona agentes nos 7 cruzamentos sem semáforo.",
      "Mensagem única aos 743 cidadãos com a previsão de religamento.",
    ],
    ganho: "743 chamados em 4 órgãos consolidados em 1 incidente com previsão única.",
    linhaDoTempo: [
      { quando: "há 3 dias", texto: "Temporal com rajadas sobre Planaltina" },
      { quando: "há 2 dias", texto: "Pico de chamados de falta de energia (116)" },
      { quando: "há 2 dias", texto: "Semáforos apagados relatados ao Detran" },
      { quando: "há 95 min", texto: "City View liga as filas pelo local e pelo horário" },
    ],
  },
  {
    id: "alagamento-vicente-pires",
    titulo: "Alagamento previsto na próxima chuva forte",
    tipo: "Previsão",
    severidade: "sério",
    area: "zeladoria",
    raId: "vicente-pires",
    local: "Vicente Pires, rua de fundo de vale com 6 bocas de lobo",
    deslocamento: [2, -3],
    detectadoHaMin: 180,
    sinais: [
      { orgaoId: "novacap", canal: "162", quantidade: 18, descricao: "Boca de lobo entupida nos 6 pontos da rua (30 dias)" },
      { orgaoId: "slu", canal: "162", quantidade: 9, descricao: "Entulho descartado junto ao meio-fio, mesma rua" },
      { orgaoId: "defesa-civil", canal: "199", quantidade: 23, descricao: "Alagamento no mesmo trecho nos dois últimos temporais" },
      { orgaoId: "defesa-civil", canal: "Previsão do tempo", quantidade: 1, descricao: "Chuva forte prevista para as próximas 48 horas", fonte: "contexto" },
    ],
    leitura:
      "O trecho alagou nos dois últimos temporais, e as bocas de lobo que drenam a rua continuam entupidas, agora com entulho ao lado. Com chuva forte prevista, a recorrência indica que vai alagar de novo. Nenhum órgão vê isso sozinho: a Novacap tem a fila de bocas de lobo, a SLU tem a de entulho e a Defesa Civil só é chamada depois que a água sobe.",
    recomendacao: [
      "Novacap prioriza a desobstrução dos 6 pontos antes da chuva.",
      "SLU recolhe o entulho no mesmo trecho, no mesmo dia.",
      "Defesa Civil deixa equipe de prontidão e avisa os moradores do trecho.",
    ],
    ganho: "Alagamento evitado ou reduzido: a ação acontece antes da chuva, não depois do chamado.",
    linhaDoTempo: [
      { quando: "há 5 semanas", texto: "Primeiro alagamento no trecho (199)" },
      { quando: "há 30 dias", texto: "Relatos de bocas de lobo entupidas (162)" },
      { quando: "há 12 dias", texto: "Segundo alagamento no mesmo trecho" },
      { quando: "há 3 h", texto: "Previsão de chuva forte; City View aponta o risco" },
    ],
  },
  {
    id: "iluminacao-samambaia",
    titulo: "Postes apagados e roubos no mesmo raio",
    tipo: "Risco combinado",
    severidade: "sério",
    area: "energia",
    raId: "samambaia",
    local: "Samambaia Sul, conjunto de quadras residenciais (raio de 400 m)",
    deslocamento: [-4, 6],
    detectadoHaMin: 260,
    sinais: [
      { orgaoId: "ceb-ipes", canal: "155 · app Ilumina DF", quantidade: 38, descricao: "Lâmpada apagada em 14 postes, há 21 dias" },
      { orgaoId: "pmdf", canal: "190", quantidade: 19, descricao: "Roubo a transeunte no mesmo raio, à noite (+62% sobre o mês anterior)" },
    ],
    leitura:
      "A troca das lâmpadas está fora do prazo há duas semanas e, no mesmo raio, os roubos a transeunte à noite subiram. A fila da iluminação não sabe disso; a da segurança não sabe dos postes apagados.",
    recomendacao: [
      "Priorizar a troca das 14 lâmpadas na fila da CEB IPes.",
      "Reforço de ronda noturna no raio até a iluminação voltar.",
      "Acompanhar se os roubos caem depois da troca.",
    ],
    ganho: "Uma manutenção de baixo custo passa a ser tratada como medida de segurança.",
    linhaDoTempo: [
      { quando: "há 21 dias", texto: "Primeiros relatos de postes apagados" },
      { quando: "há 7 dias", texto: "Prazo de troca vencido" },
      { quando: "últimos 14 dias", texto: "Alta de roubos a transeunte no raio" },
      { quando: "há 4 h", texto: "City View cruza iluminação e segurança" },
    ],
  },
  {
    id: "cadeia-taguatinga",
    titulo: "Um vazamento que vira buraco e acidente",
    tipo: "Causa comum",
    severidade: "sério",
    area: "saneamento",
    raId: "taguatinga",
    local: "Taguatinga Centro, avenida comercial",
    deslocamento: [4, 4],
    detectadoHaMin: 410,
    sinais: [
      { orgaoId: "caesb", canal: "115", quantidade: 11, descricao: "Vazamento na rede, mesmo quarteirão, em 14 dias" },
      { orgaoId: "novacap", canal: "162", quantidade: 16, descricao: "Buraco e afundamento no asfalto no mesmo ponto" },
      { orgaoId: "detran", canal: "Site Detran-DF", quantidade: 2, descricao: "Quedas de motociclistas no buraco" },
      { orgaoId: "novacap", canal: "Ordens de serviço", quantidade: 2, descricao: "Tapa-buraco já executado duas vezes no mesmo ponto", fonte: "operação" },
    ],
    leitura:
      "O buraco é consequência do vazamento. Se a Novacap tapar antes de a CAESB consertar a rede, o asfalto afunda de novo e o chamado volta. Cada órgão vê só a sua parte.",
    recomendacao: [
      "CAESB conserta a rede primeiro; Novacap recompõe o asfalto em seguida.",
      "Detran sinaliza o ponto até a recomposição.",
      "Um só acompanhamento para os 29 cidadãos, com as três etapas.",
    ],
    ganho: "Evita retrabalho da Novacap e novos acidentes no mesmo ponto.",
    linhaDoTempo: [
      { quando: "há 14 dias", texto: "Primeiro chamado de vazamento (115)" },
      { quando: "há 10 dias", texto: "Primeiro relato de buraco (162)" },
      { quando: "há 3 dias", texto: "Queda de motociclista no ponto" },
      { quando: "há 7 h", texto: "City View identifica a causa comum" },
    ],
  },
  {
    id: "dengue-sol-nascente",
    titulo: "Entulho acumulado e focos de dengue",
    tipo: "Causa comum",
    severidade: "sério",
    area: "saude",
    raId: "sol-nascente-por-do-sol",
    local: "Sol Nascente, 9 pontos de descarte irregular",
    deslocamento: [-6, 2],
    detectadoHaMin: 1440,
    sinais: [
      { orgaoId: "slu", canal: "162", quantidade: 64, descricao: "Entulho e descarte irregular em 9 pontos (45 dias)" },
      { orgaoId: "vigilancia", canal: "162", quantidade: 31, descricao: "Focos de mosquito perto dos mesmos pontos (20 dias)" },
      { orgaoId: "ses", canal: "162", quantidade: 12, descricao: "Reclamações de lotação na unidade de saúde da região" },
    ],
    leitura:
      "Com o início das chuvas, os pontos de entulho acumulam água. Os focos de mosquito aparecem justamente perto deles. É um problema de limpeza urbana com consequência de saúde.",
    recomendacao: [
      "Mutirão conjunto SLU e Vigilância Ambiental nos 9 pontos.",
      "Monitorar os pontos de descarte reincidentes com o DF Legal.",
    ],
    ganho: "Ação preventiva antes do pico de dengue da estação chuvosa.",
    linhaDoTempo: [
      { quando: "há 45 dias", texto: "Relatos de entulho começam a se acumular" },
      { quando: "há 20 dias", texto: "Início das chuvas; primeiros focos" },
      { quando: "ontem", texto: "City View sobrepõe os dois mapas" },
    ],
  },
  {
    id: "placas-aguas-claras",
    titulo: "Placas derrubadas no mesmo cruzamento",
    tipo: "Recorrência",
    severidade: "atenção",
    area: "mobilidade",
    raId: "aguas-claras",
    local: "Águas Claras, cruzamento de avenida principal",
    deslocamento: [0, -2],
    detectadoHaMin: 2900,
    sinais: [
      { orgaoId: "detran", canal: "Site Detran-DF", quantidade: 22, descricao: "Placa ou sinalização derrubada (30 dias)" },
      { orgaoId: "detran", canal: "Site Detran-DF", quantidade: 5, descricao: "Sinistros com vítima no mesmo cruzamento" },
    ],
    leitura:
      "As placas não estão sendo depredadas: são derrubadas por batidas. Repor a placa resolve o chamado, mas não o cruzamento perigoso.",
    recomendacao: [
      "Estudo de engenharia de tráfego no cruzamento (redutor, semáforo ou rotatória).",
      "Repor a sinalização com proteção.",
    ],
    ganho: "Troca um chamado de patrimônio recorrente por uma medida que evita acidentes.",
    linhaDoTempo: [
      { quando: "há 30 dias", texto: "Primeira placa derrubada" },
      { quando: "há 2 semanas", texto: "Segundo sinistro com vítima" },
      { quando: "há 2 dias", texto: "City View liga patrimônio e trânsito" },
    ],
  },
  {
    id: "agua-sao-sebastiao",
    titulo: "Falta d'água: 380 chamados, 3 interrupções",
    tipo: "Recorrência",
    severidade: "atenção",
    area: "saneamento",
    raId: "sao-sebastiao",
    local: "São Sebastião, bairros altos",
    deslocamento: [-8, -6],
    detectadoHaMin: 600,
    sinais: [
      { orgaoId: "caesb", canal: "115", quantidade: 380, descricao: "Falta d'água em 7 dias, terceira vez no trimestre" },
      { orgaoId: "caesb", canal: "Operação da rede", quantidade: 3, descricao: "Interrupções registradas pela própria CAESB no trimestre", fonte: "operação" },
    ],
    leitura:
      "Os 380 chamados correspondem a três interrupções. A recorrência no trimestre aponta para problema de capacidade na rede, não para falhas pontuais.",
    recomendacao: [
      "Comunicar a previsão de normalização a todos de uma vez, pelo canal que cada um usou.",
      "Levar a recorrência ao planejamento de investimento da CAESB.",
    ],
    ganho: "Cidadão informado sem precisar ligar; gestão vê a recorrência que o chamado isolado esconde.",
    linhaDoTempo: [
      { quando: "há 2 meses", texto: "Primeira interrupção do trimestre" },
      { quando: "há 7 dias", texto: "Terceira interrupção" },
      { quando: "há 10 h", texto: "City View marca a recorrência" },
    ],
  },
];

export const CASO_POR_ID = Object.fromEntries(CASOS.map((c) => [c.id, c])) as Record<string, Caso>;

/** Posição do caso no mapa, [lon, lat]: o núcleo urbano da RA mais o deslocamento. */
export function posicaoDoCaso(caso: Caso): [number, number] {
  const ra = REGIAO_POR_ID[caso.raId];
  if (!ra) throw new Error(`RA desconhecida: ${caso.raId}`);
  const [gx, gy] = GRAUS_POR_UNIDADE;
  return [ra.rotulo[0] + caso.deslocamento[0] * gx, ra.rotulo[1] - caso.deslocamento[1] * gy];
}

/** Total de chamados de cidadãos no caso (registros de operação e contexto não entram). */
export const totalDeChamados = (caso: Caso) => caso.sinais.reduce((s, x) => s + (fonteDoSinal(x) === 'chamado' ? x.quantidade : 0), 0);

/** Quantos casos há em cada RA (para a sala apontar onde há insight). */
export const casosDaRa = (raId: string) => CASOS.filter((c) => c.raId === raId);

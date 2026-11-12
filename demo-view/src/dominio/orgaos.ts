/**
 * Catálogo da demo: áreas, órgãos (os "silos"), tipos de incidente e canais.
 *
 * Portado em parte de `City-view/apps/sala-de-situacao/src/data/catalogo.ts`.
 * Entram só os órgãos e canais que têm fonte no Documento Magno (CV-SPEC-000);
 * os demais voltam quando uma iteração precisar (CV-DEM-001, seção 5).
 *
 * Nomes e siglas dos órgãos e os canais com `fonte` são reais. Volumes, prazos,
 * tempos, pesos e severidades são SIMULADOS.
 */

export type AreaId = 'seguranca' | 'mobilidade' | 'saneamento' | 'energia' | 'zeladoria' | 'fiscalizacao';

export interface Area {
  id: AreaId;
  nome: string;
  curto: string;
}

export const AREAS: Area[] = [
  { id: 'seguranca', nome: 'Segurança', curto: 'Segurança' },
  { id: 'mobilidade', nome: 'Vias e mobilidade', curto: 'Vias' },
  { id: 'saneamento', nome: 'Água e esgoto', curto: 'Saneamento' },
  { id: 'energia', nome: 'Energia e iluminação', curto: 'Energia' },
  { id: 'zeladoria', nome: 'Zeladoria urbana', curto: 'Zeladoria' },
  { id: 'fiscalizacao', nome: 'Fiscalização e ordem urbana', curto: 'Fiscalização' },
];

// ---------------------------------------------------------------- canais

export interface Canal {
  id: string;
  nome: string;
  /** Onde o canal está registrado no magno. Ausente só nos canais genéricos ou propostos. */
  fonte?: string;
  /** Canal sem nome nem número próprio, usado quando o magno não registra o canal do órgão. */
  generico?: boolean;
  /**
   * Canal com a marca City View, que não existe hoje. A tecnologia por trás
   * (WhatsApp com IA) já opera em Águas Claras, no dfac.
   */
  proposto?: boolean;
}

export const CANAIS: Canal[] = [
  { id: '190', nome: '190 (PMDF)', fonte: 'magno, seção 8: 190 da PMDF' },
  { id: '162', nome: 'Ouvidoria 162 · Participa DF', fonte: 'magno, seção 8: Ouvidoria do GDF' },
  { id: '115', nome: 'Central 115 (CAESB)', fonte: 'magno, seção 8: CAESB' },
  { id: '155', nome: 'Central 155 (CEB IPes)', fonte: 'magno, seção 8: iluminação pública' },
  { id: 'portal-cidadao', nome: 'Portal do Cidadão', fonte: 'magno, seção 4.8: portais e canais existentes' },
  { id: 'app-orgao', nome: 'App do órgão', fonte: 'magno, seção 8: CEB IPes e CAESB' },
  { id: 'site-orgao', nome: 'Site do órgão', fonte: 'magno, seção 8: CEB IPes' },
  { id: 'whatsapp-orgao', nome: 'WhatsApp do órgão', fonte: 'magno, seção 8: CEB IPes e CAESB' },
  { id: 'central-orgao', nome: 'Central de atendimento do órgão', generico: true },
  { id: 'whatsapp-cityview', nome: 'WhatsApp City View', proposto: true },
];

export const CANAL_POR_ID = Object.fromEntries(CANAIS.map((c) => [c.id, c])) as Record<string, Canal>;

/** O canal de entrada proposto, com a marca City View. */
export const CANAL_CITY_VIEW = 'whatsapp-cityview';

// ---------------------------------------------------------------- tipos de incidente

/**
 * Como o tipo varia no tempo (usado pela simulação). Os perfis "dias úteis" e
 * "seca" da demo antiga voltam junto com os órgãos que os usam.
 */
export type Perfil = 'noturno-fim-de-semana' | 'chuva' | 'estavel';

export type Severidade = 'atencao' | 'serio' | 'critico';

/** Todos os números de um tipo são SIMULADOS. */
export interface Tipo {
  id: string;
  nome: string;
  /** Chamados por mês no DF inteiro. */
  volumeMensal: number;
  /** Prazo de atendimento, em horas. */
  prazoHoras: number;
  /** Tempo médio até resolver, em horas. */
  tempoMedioHoras: number;
  /** Peso extra em RAs de maior vulnerabilidade (0 = proporcional à população). */
  vulnerabilidade: number;
  /** Peso extra em RAs centrais. */
  centralidade?: number;
  perfil: Perfil;
  /** Severidade de partida; o gerador promove uma parte. */
  severidadeBase: Severidade;
}

// ---------------------------------------------------------------- órgãos

export interface Orgao {
  id: string;
  sigla: string;
  nome: string;
  area: AreaId;
  /** Onde o órgão aparece no magno. */
  fonte: string;
  /** Por onde as demandas do órgão entram hoje. Os pesos somam 1. */
  canais: { canalId: string; peso: number }[];
  /** `true` quando os pesos dos canais vêm de número público, e não da simulação. */
  canaisComFonte?: boolean;
  tipos: Tipo[];
}

export const ORGAOS: Orgao[] = [
  {
    id: 'pmdf',
    sigla: 'PMDF',
    nome: 'Polícia Militar do Distrito Federal',
    area: 'seguranca',
    fonte: 'magno, seções 5 (perturbação do sossego) e 8 (190 da PMDF)',
    canais: [{ canalId: '190', peso: 1 }],
    tipos: [
      { id: 'sossego', nome: 'Perturbação do sossego', volumeMensal: 2400, prazoHoras: 2, tempoMedioHoras: 1.6, vulnerabilidade: 0.6, perfil: 'noturno-fim-de-semana', severidadeBase: 'atencao' },
      { id: 'roubo-andamento', nome: 'Roubo ou furto em andamento', volumeMensal: 4200, prazoHoras: 1, tempoMedioHoras: 0.4, vulnerabilidade: 0.8, centralidade: 0.3, perfil: 'estavel', severidadeBase: 'critico' },
      { id: 'desordem', nome: 'Briga, desordem ou atitude suspeita', volumeMensal: 9000, prazoHoras: 1.5, tempoMedioHoras: 0.9, vulnerabilidade: 0.7, perfil: 'noturno-fim-de-semana', severidadeBase: 'serio' },
    ],
  },
  {
    id: 'caesb',
    sigla: 'CAESB',
    nome: 'Companhia de Saneamento Ambiental do DF',
    area: 'saneamento',
    fonte: 'magno, seções 4.8 e 8 (CAESB)',
    canais: [
      { canalId: '115', peso: 0.5 },
      { canalId: 'whatsapp-orgao', peso: 0.3 },
      { canalId: 'app-orgao', peso: 0.2 },
    ],
    tipos: [
      { id: 'falta-agua', nome: "Falta d'água", volumeMensal: 6000, prazoHoras: 24, tempoMedioHoras: 18, vulnerabilidade: 0.7, perfil: 'estavel', severidadeBase: 'serio' },
      { id: 'vazamento', nome: 'Vazamento na rede', volumeMensal: 3800, prazoHoras: 48, tempoMedioHoras: 40, vulnerabilidade: 0.3, perfil: 'estavel', severidadeBase: 'atencao' },
      { id: 'esgoto', nome: 'Esgoto extravasado', volumeMensal: 2600, prazoHoras: 24, tempoMedioHoras: 30, vulnerabilidade: 0.8, perfil: 'chuva', severidadeBase: 'serio' },
    ],
  },
  {
    id: 'neoenergia',
    sigla: 'Neoenergia',
    nome: 'Neoenergia Brasília (distribuidora de energia)',
    area: 'energia',
    fonte: 'magno, seções 4.8 e 5.2 (energia aqui, iluminação ali)',
    canais: [{ canalId: 'central-orgao', peso: 1 }],
    tipos: [
      { id: 'falta-energia', nome: 'Falta de energia', volumeMensal: 14000, prazoHoras: 8, tempoMedioHoras: 5.5, vulnerabilidade: 0.4, perfil: 'chuva', severidadeBase: 'serio' },
      { id: 'rede-caida', nome: 'Fio partido ou rede caída', volumeMensal: 1100, prazoHoras: 4, tempoMedioHoras: 4.5, vulnerabilidade: 0.3, perfil: 'chuva', severidadeBase: 'critico' },
    ],
  },
  {
    id: 'ceb-ipes',
    sigla: 'CEB IPes',
    nome: 'CEB Iluminação Pública e Serviços',
    area: 'energia',
    fonte: 'magno, seção 8 (iluminação pública, jul.–set. 2026)',
    // Participação real de cada canal nos chamados da população (magno, seção 8).
    canais: [
      { canalId: 'app-orgao', peso: 0.468 },
      { canalId: '155', peso: 0.276 },
      { canalId: 'site-orgao', peso: 0.187 },
      { canalId: 'whatsapp-orgao', peso: 0.069 },
    ],
    canaisComFonte: true,
    tipos: [
      { id: 'lampada-apagada', nome: 'Lâmpada apagada', volumeMensal: 3900, prazoHoras: 72, tempoMedioHoras: 96, vulnerabilidade: 0.2, centralidade: 0.8, perfil: 'estavel', severidadeBase: 'atencao' },
      { id: 'acesa-dia', nome: 'Lâmpada acesa de dia', volumeMensal: 550, prazoHoras: 120, tempoMedioHoras: 150, vulnerabilidade: 0.2, perfil: 'estavel', severidadeBase: 'atencao' },
      { id: 'poste-danificado', nome: 'Poste danificado', volumeMensal: 380, prazoHoras: 120, tempoMedioHoras: 200, vulnerabilidade: 0.3, perfil: 'estavel', severidadeBase: 'serio' },
    ],
  },
  {
    id: 'der',
    sigla: 'DER-DF',
    nome: 'Departamento de Estradas de Rodagem do DF',
    area: 'mobilidade',
    fonte: 'magno, seção 4.8 (vias públicas, trânsito, DER)',
    canais: [{ canalId: '162', peso: 1 }],
    tipos: [
      { id: 'buraco-rodovia', nome: 'Buraco em rodovia', volumeMensal: 400, prazoHoras: 120, tempoMedioHoras: 160, vulnerabilidade: 0.2, perfil: 'chuva', severidadeBase: 'serio' },
      { id: 'obstaculo-pista', nome: 'Obstáculo na pista', volumeMensal: 150, prazoHoras: 8, tempoMedioHoras: 8, vulnerabilidade: 0.3, perfil: 'estavel', severidadeBase: 'critico' },
    ],
  },
  {
    id: 'slu',
    sigla: 'SLU',
    nome: 'Serviço de Limpeza Urbana',
    area: 'zeladoria',
    fonte: 'magno, seção 4.8 (limpeza urbana)',
    canais: [{ canalId: '162', peso: 1 }],
    tipos: [
      { id: 'coleta', nome: 'Coleta não realizada', volumeMensal: 700, prazoHoras: 48, tempoMedioHoras: 36, vulnerabilidade: 0.6, perfil: 'estavel', severidadeBase: 'atencao' },
      { id: 'entulho', nome: 'Entulho ou descarte irregular', volumeMensal: 1600, prazoHoras: 120, tempoMedioHoras: 140, vulnerabilidade: 0.9, perfil: 'estavel', severidadeBase: 'atencao' },
    ],
  },
  {
    id: 'novacap',
    sigla: 'Novacap',
    nome: 'Companhia Urbanizadora da Nova Capital do Brasil',
    area: 'zeladoria',
    fonte: 'magno, seção 8 (buraco na via × acidente × Novacap)',
    canais: [{ canalId: '162', peso: 1 }],
    tipos: [
      { id: 'buraco', nome: 'Buraco na via urbana', volumeMensal: 2000, prazoHoras: 168, tempoMedioHoras: 210, vulnerabilidade: 0.5, perfil: 'chuva', severidadeBase: 'atencao' },
      { id: 'poda', nome: 'Poda ou remoção de árvore', volumeMensal: 1200, prazoHoras: 720, tempoMedioHoras: 900, vulnerabilidade: 0, perfil: 'chuva', severidadeBase: 'atencao' },
      { id: 'boca-lobo', nome: 'Boca de lobo entupida', volumeMensal: 600, prazoHoras: 168, tempoMedioHoras: 190, vulnerabilidade: 0.6, perfil: 'chuva', severidadeBase: 'atencao' },
      { id: 'calcada', nome: 'Calçada ou meio-fio danificado', volumeMensal: 500, prazoHoras: 720, tempoMedioHoras: 800, vulnerabilidade: 0.3, perfil: 'estavel', severidadeBase: 'atencao' },
    ],
  },
  {
    id: 'administracoes',
    sigla: 'Adm. Regionais',
    nome: 'Administrações Regionais',
    area: 'zeladoria',
    fonte: 'magno, seções 4.8 (Portal do Cidadão) e 8 (entulho × SLU × DF Legal × administração regional)',
    canais: [
      { canalId: 'portal-cidadao', peso: 0.6 },
      { canalId: '162', peso: 0.4 },
    ],
    tipos: [
      { id: 'pracas', nome: 'Praça ou parquinho danificado', volumeMensal: 700, prazoHoras: 720, tempoMedioHoras: 760, vulnerabilidade: 0.3, perfil: 'estavel', severidadeBase: 'atencao' },
      { id: 'mato', nome: 'Mato alto em área pública', volumeMensal: 900, prazoHoras: 360, tempoMedioHoras: 380, vulnerabilidade: 0.5, perfil: 'chuva', severidadeBase: 'atencao' },
    ],
  },
  {
    id: 'dflegal',
    sigla: 'DF Legal',
    nome: 'Secretaria de Proteção da Ordem Urbanística',
    area: 'fiscalizacao',
    fonte: 'magno, seção 8 (entulho × SLU × DF Legal × administração regional)',
    canais: [{ canalId: '162', peso: 1 }],
    tipos: [
      { id: 'ocupacao', nome: 'Ocupação ou obra irregular', volumeMensal: 900, prazoHoras: 720, tempoMedioHoras: 1100, vulnerabilidade: 0.7, perfil: 'estavel', severidadeBase: 'serio' },
      { id: 'comercio', nome: 'Comércio irregular em área pública', volumeMensal: 500, prazoHoras: 360, tempoMedioHoras: 500, vulnerabilidade: 0.2, centralidade: 0.6, perfil: 'estavel', severidadeBase: 'atencao' },
    ],
  },
  {
    id: 'ibram',
    sigla: 'Ibram',
    nome: 'Instituto Brasília Ambiental',
    area: 'fiscalizacao',
    fonte: 'magno, seção 8 (barulho: notificações de poluição sonora ao Ibram)',
    canais: [{ canalId: '162', peso: 1 }],
    tipos: [
      { id: 'som-estabelecimento', nome: 'Poluição sonora (bares, eventos)', volumeMensal: 400, prazoHoras: 72, tempoMedioHoras: 140, vulnerabilidade: 0, centralidade: 0.9, perfil: 'noturno-fim-de-semana', severidadeBase: 'atencao' },
    ],
  },
];

export const ORGAO_POR_ID = Object.fromEntries(ORGAOS.map((o) => [o.id, o])) as Record<string, Orgao>;

/** Lista achatada dos tipos, com o órgão dono. A ordem é o índice usado pela simulação. */
export const TIPOS = ORGAOS.flatMap((orgao) => orgao.tipos.map((tipo) => ({ ...tipo, orgaoId: orgao.id, area: orgao.area })));
export type TipoComOrgao = (typeof TIPOS)[number];

export const TIPO_POR_ID = Object.fromEntries(TIPOS.map((t) => [t.id, t])) as Record<string, TipoComOrgao>;

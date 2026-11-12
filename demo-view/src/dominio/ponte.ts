/**
 * As camadas 1 a 5 do City View (CV-REF-002, seção 1), peça por peça, com o que
 * já existe hoje numa ponta (o dfac, em Águas Claras) e o que é proposta.
 *
 * Cada "existe" tem fonte: o código do dfac (repositório `dfac-agentic-saas`,
 * só leitura, commit `0eec955`) ou a seção 4.1 do CV-REF-002, que traz os
 * cuidados de fala. Nada aqui é dado de cidadão.
 */
import { podeTransitar, type Situacao } from './incidente';

/** `orgao`: sistema que o órgão já tem e continua usando; o City View não o substitui. */
export type SituacaoPeca = 'existe' | 'pronto' | 'proposta' | 'orgao';

export const ROTULO_PECA: Record<SituacaoPeca, string> = {
  existe: 'Existe em Águas Claras',
  pronto: 'Pronto, não ativo',
  proposta: 'Proposta',
  orgao: 'Sistema do órgão, já existe',
};

export interface Peca {
  id: string;
  nome: string;
  situacao: SituacaoPeca;
  /** Uma linha: o que ela faz, com o cuidado de fala quando houver. */
  nota: string;
  fonte: string;
  /** Subtítulo dentro da camada, quando ela tem mais de um grupo de peças. */
  grupo?: string;
}

export type NumeroCamada = 1 | 2 | 3 | 4 | 5;

export interface Camada {
  numero: NumeroCamada;
  nome: string;
  /** A ideia da camada, como no deck (CV-APR-001, slides 10 a 13). */
  ideia: string;
  pecas: Peca[];
}

const REF = 'CV-REF-002, seção 4.1';

/**
 * A demanda também nasce fora do City View, nos canais que cada órgão já tem.
 * "Eu integro com todos eles, independente do nome" (ATA 174): o órgão continua
 * como está, e o City View cuida dali para frente.
 */
const GRUPO_ORGAOS = 'Sistemas que os órgãos já têm';
const doOrgao = (id: string, nome: string, nota: string, fonte: string): Peca => ({ id: `origem-${id}`, grupo: GRUPO_ORGAOS, nome, situacao: 'orgao', nota, fonte });
const SISTEMAS_DOS_ORGAOS: Peca[] = [
  doOrgao('156', 'Portal do Cidadão · 156', 'Zeladoria e serviços urbanos', 'magno 4.8'),
  doOrgao('162', 'Participa DF · 162', 'Ouvidoria do GDF', 'magno, seção 8'),
  doOrgao('190', '190', 'PMDF', 'magno, seção 8'),
  doOrgao('116', '116 · Neoenergia', 'Falta de energia', 'magno 5.2'),
  doOrgao('115', '115 e app · CAESB', 'Água e esgoto', 'magno, seção 8'),
  doOrgao('155', '155 · CEB', 'Iluminação pública', 'magno, seção 8'),
  doOrgao('legado', 'Sistema legado do órgão', 'Qualquer tecnologia: API, robô autorizado ou troca de arquivos', 'ATA 169–174'),
];

export const CAMADAS: Camada[] = [
  {
    numero: 1,
    nome: 'Onde a demanda nasce',
    ideia: 'Não importa onde nasce: daqui para frente é igual',
    pecas: [
      { id: 'whatsapp', grupo: 'Canais do City View', nome: 'WhatsApp', situacao: 'existe', nota: 'Em produção desde 30/09/2026', fonte: `${REF}; dfac api/ouvidoria_flow.py` },
      { id: 'instagram', grupo: 'Canais do City View', nome: 'Instagram', situacao: 'pronto', nota: 'Código pronto, travado na verificação da Meta', fonte: REF },
      { id: 'app', grupo: 'Canais do City View', nome: 'App', situacao: 'proposta', nota: 'O Zela DF foi só protótipo', fonte: REF },
      { id: 'sms', grupo: 'Canais do City View', nome: 'SMS e outros', situacao: 'proposta', nota: 'Onde a gestão escolher', fonte: 'ATA 204–212' },
      ...SISTEMAS_DOS_ORGAOS,
    ],
  },
  {
    numero: 2,
    nome: 'Ponte de abertura de demandas',
    ideia: 'A demanda é aberta no sistema certo e acompanhada até resolver',
    pecas: [
      { id: 'coleta', nome: 'Coleta guiada', situacao: 'existe', nota: 'Roteiro fixo, sem IA: nome, tipo, relato, local, referência e foto', fonte: 'dfac api/ouvidoria_flow.py' },
      { id: 'triagem', nome: 'Triagem', situacao: 'existe', nota: 'Sugestão por palavras-chave; uma pessoa confirma', fonte: 'dfac api/demand_triage.py' },
      { id: 'revisao', nome: 'Revisão humana', situacao: 'existe', nota: 'Três passos: relato e evidências, classificação e local, confirmar envio', fonte: 'dfac frontend/.../DemandWizardStepper.tsx' },
      { id: 'protocolo', nome: 'Protocolo no órgão', situacao: 'existe', nota: '18 protocolos em canais oficiais até 28/10/2026', fonte: `${REF}; magno 6.1` },
      { id: 'acompanhamento', nome: 'Acompanhamento', situacao: 'existe', nota: 'ACOMPANHAR e avisos no WhatsApp, até resolver', fonte: 'dfac api/citizen_tracking.py' },
    ],
  },
  {
    numero: 3,
    nome: 'Conectores com os sistemas dos órgãos',
    ideia: 'Nada se substitui. Tudo se conecta',
    pecas: [
      { id: 'participadf', nome: 'Participa DF', situacao: 'existe', nota: '12 protocolos até 28/10/2026', fonte: REF },
      { id: 'portal-cidadao', nome: 'Portal do Cidadão', situacao: 'existe', nota: 'Sessão gov.br compartilhada; 6 protocolos até 28/10/2026', fonte: REF },
      { id: 'iluminadf', nome: 'IluminaDF (CEB)', situacao: 'pronto', nota: 'Integração pronta, envio desligado', fonte: REF },
      { id: 'caesb', nome: 'CAESB', situacao: 'proposta', nota: 'Canal próprio; o dfac não encaminha', fonte: 'dfac api/demand_triage.py' },
      { id: 'neoenergia', nome: 'Neoenergia', situacao: 'proposta', nota: 'Canal próprio; o dfac não encaminha', fonte: 'dfac api/demand_triage.py' },
    ],
  },
  {
    numero: 4,
    nome: 'Incidente único',
    ideia: 'Todo chamado vira um incidente, no mesmo formato',
    pecas: [{ id: 'incidente', nome: 'Mesmo formato para todo órgão', situacao: 'proposta', nota: 'id, origem, local, tipo, órgão, situação, datas e vínculos', fonte: 'CV-DEM-001, seção 4' }],
  },
  {
    numero: 5,
    nome: 'Inteligência',
    ideia: 'Agrupa, cruza e explica por quê; uma pessoa decide',
    pecas: [
      { id: 'proximidade', nome: 'Agrupar por proximidade', situacao: 'existe', nota: 'No código desde 01/10/2026 (até 30 m); não conferido se está ligado', fonte: REF },
      { id: 'cruzar', nome: 'Cruzar órgãos', situacao: 'proposta', nota: 'Motivo, confiança e evidências; uma pessoa confirma', fonte: 'magno 7.2' },
    ],
  },
];

export const PECA_POR_ID = Object.fromEntries(CAMADAS.flatMap((c) => c.pecas.map((p) => [p.id, p]))) as Record<string, Peca>;
export const CAMADA_DA_PECA = Object.fromEntries(CAMADAS.flatMap((c) => c.pecas.map((p) => [p.id, c.numero]))) as Record<string, NumeroCamada>;

/** As três saídas (as visões), embaixo do diagrama. */
export const SAIDAS: { id: string; nome: string; situacao: SituacaoPeca; nota: string }[] = [
  { id: 'governadora', nome: 'Governadora', situacao: 'proposta', nota: 'A sala de situação (esta demo)' },
  { id: 'gestores', nome: 'Gestores', situacao: 'proposta', nota: 'Cada um vê a sua área' },
  { id: 'cidadao', nome: 'Cidadão', situacao: 'existe', nota: 'Acompanhamento e o mapa público de Águas Claras' },
];

// ---------------------------------------------------------------- estados

/** Estados internos de uma demanda no dfac (`api/demand_models.py`). */
export type EstadoDfac =
  | 'received'
  | 'triaging'
  | 'ready_for_review'
  | 'in_review'
  | 'approved'
  | 'queued'
  | 'sending'
  | 'submitted'
  | 'tracking'
  | 'resolved'
  | 'closed'
  | 'rejected'
  | 'duplicate'
  | 'submission_failed';

/** Como o cidadão lê cada estado (`api/citizen_tracking.py`, STATUS_LABELS). */
export const ROTULO_DFAC: Record<EstadoDfac, string> = {
  received: 'recebida',
  triaging: 'em triagem',
  ready_for_review: 'aguardando revisão',
  in_review: 'em análise',
  approved: 'aprovada',
  queued: 'na fila de envio',
  sending: 'sendo enviada',
  submitted: 'registrada no portal',
  tracking: 'em acompanhamento',
  resolved: 'resolvida',
  rejected: 'reprovada',
  duplicate: 'marcada como duplicada',
  submission_failed: 'falha no envio',
  closed: 'encerrada',
};

/**
 * O estado do dfac no modelo único de incidente (`dominio/incidente.ts`).
 * Duplicada não é um estado: vira o vínculo "mesmo incidente que".
 */
export const SITUACAO_DO_DFAC: Record<Exclude<EstadoDfac, 'duplicate'>, Situacao> = {
  received: 'recebido',
  triaging: 'em-triagem',
  ready_for_review: 'em-triagem',
  in_review: 'em-triagem',
  approved: 'encaminhado',
  queued: 'encaminhado',
  sending: 'encaminhado',
  submitted: 'encaminhado',
  tracking: 'em-atendimento',
  resolved: 'resolvido',
  closed: 'encerrado',
  rejected: 'cancelado',
  submission_failed: 'falha-de-envio',
};

/**
 * A sequência de estados do modelo único que uma sequência do dfac produz
 * (estados iguais em seguida contam uma vez). `null` se alguma passagem não é
 * permitida pelo modelo.
 */
export function situacoesDoCaminho(caminho: readonly Exclude<EstadoDfac, 'duplicate'>[]): Situacao[] | null {
  const seq: Situacao[] = [];
  for (const e of caminho) {
    const s = SITUACAO_DO_DFAC[e];
    const anterior = seq[seq.length - 1];
    if (anterior === s) continue;
    if (anterior !== undefined && !podeTransitar(anterior, s)) return null;
    seq.push(s);
  }
  return seq;
}

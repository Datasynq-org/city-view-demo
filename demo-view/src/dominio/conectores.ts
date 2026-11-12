/**
 * O catálogo de conectores (I6, CV-DEM-001 seção 6): com que sistemas o City
 * View se liga, como e em que pé está cada ligação. "Eu integro com todos eles,
 * independente do nome. Portal do cidadão, ADM24, ADM72, o nome que tiver"
 * (ATA 174–175). "Seja qual for o sistema por baixo […] nós integramos" (slide 12).
 *
 * Só o que tem fonte é dito como existente; o resto é proposta. O método de
 * cada conector novo ainda está "a mapear": é a gestão que aponta os sistemas,
 * na implantação. Para os três que já existem, `comoHoje` diz como a ligação é
 * feita de fato (conferido no dfac), sem chamar de API oficial o que não foi verificado. Nenhum nome de produto interno de órgão é afirmado.
 */
import { CANAL_POR_ID, ORGAO_POR_ID, ORGAOS } from './orgaos';
import { operacaoDoOrgao } from './operacao';
import type { SituacaoPeca } from './ponte';

export type Metodo = 'api' | 'robo' | 'arquivos' | 'a-mapear';

export const METODOS: { id: Metodo; nome: string; nota: string }[] = [
  { id: 'api', nome: 'API', nota: 'O sistema do órgão oferece uma porta de integração' },
  { id: 'robo', nome: 'Robô autorizado', nota: 'Preenche o sistema como uma pessoa faria; só com autorização formal do órgão e credencial institucional' },
  { id: 'arquivos', nome: 'Troca de arquivos', nota: 'O órgão exporta, o City View lê; para sistemas sem porta de integração' },
  { id: 'a-mapear', nome: 'A mapear', nota: 'A gestão aponta o sistema na implantação; o método sai do levantamento' },
];

export const NOME_DO_METODO = Object.fromEntries(METODOS.map((m) => [m.id, m.nome])) as Record<Metodo, string>;

export interface Conector {
  id: string;
  /** O sistema ou canal do outro lado. */
  sistema: string;
  /** De quem é: sigla do órgão, ou "GDF" para os portais gerais. */
  dono: string;
  orgaoId?: string;
  situacao: SituacaoPeca;
  metodo: Metodo;
  /** Como a ligação é feita hoje, conferido no código do dfac. Vale no lugar do método, quando há. */
  comoHoje?: string;
  /** Os sinais que o conector traz (magno 7.1). A operação é sempre proposta. */
  demandas: boolean;
  operacao: boolean;
  nota: string;
  fonte: string;
}

const REF = 'CV-REF-002, seção 4.1';

/** Os que têm história: já funcionam numa região ou estão prontos (dfac). */
const COM_HISTORIA: Conector[] = [
  { id: 'participadf', sistema: 'Participa DF · Ouvidoria 162', dono: 'GDF', situacao: 'existe', metodo: 'a-mapear', comoHoje: 'Chamadas diretas ao serviço do portal', demandas: true, operacao: false, nota: '12 protocolos até 28/10/2026, em Águas Claras', fonte: `${REF}; dfac api/integrations/participadf` },
  { id: 'portal-cidadao', sistema: 'Portal do Cidadão · 156', dono: 'GDF', situacao: 'existe', metodo: 'a-mapear', comoHoje: 'Sessão de navegador, aberta por uma pessoa', demandas: true, operacao: false, nota: 'Login gov.br feito à mão; 6 protocolos até 28/10/2026', fonte: `${REF}; dfac api/integrations/portal_cidadao` },
  { id: 'iluminadf', sistema: 'IluminaDF', dono: 'CEB IPes', orgaoId: 'ceb-ipes', situacao: 'pronto', metodo: 'a-mapear', comoHoje: 'Chamadas diretas ao serviço da CEB', demandas: true, operacao: true, nota: 'Integração pronta, com o envio desligado', fonte: `${REF}; dfac api/integrations/iluminadf` },
];

/** Os órgãos do catálogo da demo que ainda não têm conector próprio: todos propostos. */
const PROPOSTOS: Conector[] = ORGAOS.filter((o) => o.id !== 'ceb-ipes').map((o) => ({
  id: o.id,
  sistema: o.canais.map((c) => CANAL_POR_ID[c.canalId]?.nome ?? c.canalId).join(' · '),
  dono: o.sigla,
  orgaoId: o.id,
  situacao: 'proposta' as const,
  metodo: 'a-mapear' as const,
  demandas: true,
  operacao: true,
  nota: operacaoDoOrgao(o.id) ? 'Demandas e operação da rede (simulada na demo)' : 'Demandas; a operação entra se o órgão liberar',
  fonte: o.fonte,
}));

/** O que a conversa cita e a equipe ainda não identificou: fica dito como está. */
const A_IDENTIFICAR: Conector[] = [
  { id: 'adm-24h', sistema: 'ADM 24h · ADM 72', dono: 'GDF', situacao: 'proposta', metodo: 'a-mapear', demandas: true, operacao: false, nota: 'Citados na conversa; ainda não identificados pela equipe', fonte: 'ATA 174; magno 9.6' },
  { id: 'legado', sistema: 'Outros sistemas legados', dono: 'A apontar', situacao: 'proposta', metodo: 'a-mapear', demandas: true, operacao: true, nota: '"Faz parte da implantação você apontar quais são esses legados"', fonte: 'ATA 171–172' },
];

export const CONECTORES: Conector[] = [...COM_HISTORIA, ...PROPOSTOS, ...A_IDENTIFICAR];

/** O que a coluna "método" mostra: como é hoje, quando existe; senão, o método proposto. */
export const metodoDe = (c: Conector) => c.comoHoje ?? NOME_DO_METODO[c.metodo];

export const nomeDoDono = (c: Conector) => (c.orgaoId ? (ORGAO_POR_ID[c.orgaoId]?.nome ?? c.dono) : c.dono);

/** Quantos conectores há em cada situação. */
export function contar(conectores: readonly Conector[] = CONECTORES): Record<SituacaoPeca, number> {
  const n: Record<SituacaoPeca, number> = { existe: 0, pronto: 0, proposta: 0, orgao: 0 };
  for (const c of conectores) n[c.situacao]++;
  return n;
}

/** As regras que valem para todo conector (equipe; CV-REF-001, seção 7). */
export const REGRAS: string[] = [
  'Nada se substitui: o órgão continua no sistema dele, do jeito que está acostumado.',
  'A gestão aponta quais são os sistemas; nós integramos, em qualquer tecnologia.',
  'Robô só com autorização formal do órgão e credencial institucional.',
  'O City View lê só o que a gestão autorizar, com finalidade declarada.',
  'Dados de operação entram como proposta: cada órgão decide o que libera.',
];

/**
 * As cores por área, como na apresentação em rolagem (`design-system/src/tokens.css`,
 * `--area-0` a `--area-6` do tema claro): cada fila de órgão tem a sua cor, e é
 * a mistura de cores num mesmo lugar que mostra o cruzamento.
 *
 * Valem no tema claro da inteligência. No escuro a tela segue neutra, com a
 * cor só no incidente aberto (decisão da I3).
 */
import { ORGAO_POR_ID } from '../dominio/orgaos';

/** As famílias da apresentação, na ordem dos tokens `--area-N`. */
export type Familia = 'outros' | 'seguranca' | 'iluminacao' | 'vias' | 'agua' | 'limpeza' | 'energia';

export const FAMILIAS: { id: Familia; nome: string; cor: string }[] = [
  { id: 'seguranca', nome: 'Segurança', cor: '#dc2626' },
  { id: 'iluminacao', nome: 'Iluminação', cor: '#d97706' },
  { id: 'vias', nome: 'Vias e trânsito', cor: '#7c3aed' },
  { id: 'agua', nome: 'Água e esgoto', cor: '#0284c7' },
  { id: 'limpeza', nome: 'Limpeza e zeladoria', cor: '#059669' },
  { id: 'energia', nome: 'Energia', cor: '#ea580c' },
  { id: 'outros', nome: 'Outros órgãos', cor: '#64748b' },
];

const COR = Object.fromEntries(FAMILIAS.map((f) => [f.id, f.cor])) as Record<Familia, string>;

/** Órgãos que não seguem a área do catálogo, ou que estão fora dele. */
const PROPRIA: Record<string, Familia> = {
  'ceb-ipes': 'iluminacao',
  pcdf: 'seguranca',
  detran: 'vias',
};

const DA_AREA: Record<string, Familia> = { seguranca: 'seguranca', mobilidade: 'vias', saneamento: 'agua', energia: 'energia', zeladoria: 'limpeza' };

export function familiaDoOrgao(orgaoId: string): Familia {
  return PROPRIA[orgaoId] ?? DA_AREA[ORGAO_POR_ID[orgaoId]?.area ?? ''] ?? 'outros';
}

export const corDoOrgao = (orgaoId: string) => COR[familiaDoOrgao(orgaoId)];

/** As famílias que aparecem num conjunto de órgãos, na ordem da legenda. */
export const familiasDe = (orgaos: Iterable<string>) => {
  const presentes = new Set([...orgaos].map(familiaDoOrgao));
  return FAMILIAS.filter((f) => presentes.has(f.id));
};

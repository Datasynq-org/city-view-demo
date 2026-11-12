import exemplos from './exemplos.json';

// Áreas na ordem fixa dos tokens --area-0..6 (design system). Órgãos e canais citados: magno 4.8 e 8.
export const AREAS = ['Ouvidoria', 'Segurança', 'Iluminação', 'Vias', 'Água e esgoto', 'Limpeza urbana', 'Energia'];
export const SITUACOES = [
  { nome: 'resolvido', tom: 'ok' as const },
  { nome: 'em resolução', tom: 'atencao' as const },
  { nome: 'aberto', tom: 'alerta' as const },
];

export type Chamado = { id: string; lon: number; lat: number; area: number; assunto: string; ra: string; situacao: number; minutos: number };

// EXEMPLOS SIMULADOS (scripts/gerar-mapa.mjs): só para vestir a interface. Não são dados do DF.
export const CHAMADOS = exemplos.chamados as Chamado[];

export const haQuanto = (min: number) => (min < 60 ? `há ${min} min` : `há ${Math.floor(min / 60)} h`);

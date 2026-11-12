/**
 * Regiões administrativas do DF: limites (IDE/DF), população e os pesos que só a
 * simulação usa.
 *
 * Portado de `City-view/apps/sala-de-situacao/src/data/ras.ts`. O dado de
 * população fica separado dos pesos simulados (CV-DEM-001, seção 5).
 */
import type { MultiPolygon, Polygon } from 'geojson';
import geo from './ras-geo.json';

export const FONTE_LIMITES = geo.fonte;

export const FONTE_POPULACAO =
  'Censo 2022 (IBGE, divulgado por RA pelo IPEDF), total 2.817.381. Riacho Fundo II corrigido para 65.658 pelo teste de soma (pesquisa de dados públicos do repositório City-view). Arapoanga, Água Quente, 26 de Setembro e Ponte Alta não existiam no Censo 2022: a população delas é estimativa da simulação, descontada das RAs de origem (Planaltina, Recanto das Emas, Vicente Pires e Gama).';

/** Habitantes por código da RA. Ver FONTE_POPULACAO. */
const POPULACAO: Record<string, number> = {
  'RA-I': 198697,
  'RA-II': 127467,
  'RA-III': 193367,
  'RA-IV': 55561,
  'RA-V': 72273,
  'RA-VI': 124960,
  'RA-VII': 63923,
  'RA-VIII': 21636,
  'RA-IX': 287023,
  'RA-X': 120641,
  'RA-XI': 25741,
  'RA-XII': 218840,
  'RA-XIII': 116622,
  'RA-XIV': 98612,
  'RA-XV': 100550,
  'RA-XVI': 26244,
  'RA-XVII': 39552,
  'RA-XVIII': 41778,
  'RA-XIX': 14040,
  'RA-XX': 128486,
  'RA-XXI': 65658,
  'RA-XXII': 44354,
  'RA-XXIII': 8609,
  'RA-XXIV': 22289,
  'RA-XXV': 36042,
  'RA-XXVI': 82785,
  'RA-XXVII': 77767,
  'RA-XXVIII': 65408,
  'RA-XXIX': 5131,
  'RA-XXX': 76871,
  'RA-XXXI': 10268,
  'RA-XXXII': 101866,
  'RA-XXXIII': 42320,
  'RA-XXXIV': 55000,
  'RA-XXXV': 15000,
  'RA-XXXVI': 20000,
  'RA-XXXVII': 12000,
};

/** RAs criadas depois do Censo 2022: a população é estimativa da simulação. */
const SEM_CENSO = new Set(['RA-XXXIV', 'RA-XXXV', 'RA-XXXVI', 'RA-XXXVII']);

export interface PesosSimulados {
  /** 0 a 1. Mais chamados de segurança e saneamento onde é maior. */
  vulnerabilidade: number;
  /** 0 a 1. Mais chamados ligados a fluxo de pessoas e veículos onde é maior. */
  centralidade: number;
}

/**
 * SIMULADO. Pesos qualitativos que dão forma à distribuição dos chamados. Não
 * são índices oficiais e não devem aparecer em tela como dado da cidade.
 */
export const PESOS_SIMULADOS: Record<string, PesosSimulados> = {
  'RA-I': { vulnerabilidade: 0.1, centralidade: 1 },
  'RA-II': { vulnerabilidade: 0.5, centralidade: 0.3 },
  'RA-III': { vulnerabilidade: 0.35, centralidade: 0.75 },
  'RA-IV': { vulnerabilidade: 0.6, centralidade: 0.1 },
  'RA-V': { vulnerabilidade: 0.35, centralidade: 0.25 },
  'RA-VI': { vulnerabilidade: 0.65, centralidade: 0.25 },
  'RA-VII': { vulnerabilidade: 0.7, centralidade: 0.1 },
  'RA-VIII': { vulnerabilidade: 0.35, centralidade: 0.3 },
  'RA-IX': { vulnerabilidade: 0.65, centralidade: 0.45 },
  'RA-X': { vulnerabilidade: 0.25, centralidade: 0.5 },
  'RA-XI': { vulnerabilidade: 0.2, centralidade: 0.4 },
  'RA-XII': { vulnerabilidade: 0.65, centralidade: 0.3 },
  'RA-XIII': { vulnerabilidade: 0.7, centralidade: 0.2 },
  'RA-XIV': { vulnerabilidade: 0.7, centralidade: 0.15 },
  'RA-XV': { vulnerabilidade: 0.75, centralidade: 0.15 },
  'RA-XVI': { vulnerabilidade: 0.05, centralidade: 0.25 },
  'RA-XVII': { vulnerabilidade: 0.5, centralidade: 0.2 },
  'RA-XVIII': { vulnerabilidade: 0.15, centralidade: 0.2 },
  'RA-XIX': { vulnerabilidade: 0.5, centralidade: 0.2 },
  'RA-XX': { vulnerabilidade: 0.15, centralidade: 0.5 },
  'RA-XXI': { vulnerabilidade: 0.65, centralidade: 0.15 },
  'RA-XXII': { vulnerabilidade: 0.1, centralidade: 0.45 },
  'RA-XXIII': { vulnerabilidade: 0.85, centralidade: 0.1 },
  'RA-XXIV': { vulnerabilidade: 0.15, centralidade: 0.15 },
  'RA-XXV': { vulnerabilidade: 0.95, centralidade: 0.2 },
  'RA-XXVI': { vulnerabilidade: 0.45, centralidade: 0.15 },
  'RA-XXVII': { vulnerabilidade: 0.15, centralidade: 0.1 },
  'RA-XXVIII': { vulnerabilidade: 0.85, centralidade: 0.1 },
  'RA-XXIX': { vulnerabilidade: 0.3, centralidade: 0.9 },
  'RA-XXX': { vulnerabilidade: 0.35, centralidade: 0.3 },
  'RA-XXXI': { vulnerabilidade: 0.85, centralidade: 0.05 },
  'RA-XXXII': { vulnerabilidade: 1, centralidade: 0.15 },
  'RA-XXXIII': { vulnerabilidade: 0.35, centralidade: 0.2 },
  'RA-XXXIV': { vulnerabilidade: 0.75, centralidade: 0.1 },
  'RA-XXXV': { vulnerabilidade: 0.8, centralidade: 0.05 },
  'RA-XXXVI': { vulnerabilidade: 0.85, centralidade: 0.05 },
  'RA-XXXVII': { vulnerabilidade: 0.75, centralidade: 0.05 },
};

export interface Regiao {
  id: string;
  /** RA-I a RA-XXXVII. */
  codigo: string;
  numero: number;
  nome: string;
  /** Limite simplificado, em lon/lat. */
  geometria: Polygon | MultiPolygon;
  /** Onde o nome aparece no mapa (núcleo urbano ou ponto mais interno), [lon, lat]. */
  rotulo: [number, number];
  /** Centroide do maior polígono, [lon, lat]. */
  centroide: [number, number];
  areaKm2: number;
  populacao: number;
  /** `true` nas RAs sem Censo 2022. Ver FONTE_POPULACAO. */
  populacaoEstimada: boolean;
}

/** Caixa do DF: [[oeste, sul], [leste, norte]]. */
export const LIMITES_DF = geo.limites as [[number, number], [number, number]];

/** Graus de [longitude, latitude] por 100 m, aproximadamente. */
export const GRAUS_POR_UNIDADE = geo.grausPorUnidade as [number, number];

export const REGIOES: Regiao[] = geo.regioes.map((r) => {
  const populacao = POPULACAO[r.codigo];
  if (populacao === undefined) throw new Error(`População ausente para ${r.codigo}`);
  if (!PESOS_SIMULADOS[r.codigo]) throw new Error(`Pesos simulados ausentes para ${r.codigo}`);
  return {
    id: r.id,
    codigo: r.codigo,
    numero: r.numero,
    nome: r.nome,
    geometria: r.geometria as Polygon | MultiPolygon,
    rotulo: r.rotulo as [number, number],
    centroide: r.centroide as [number, number],
    areaKm2: r.areaKm2,
    populacao,
    populacaoEstimada: SEM_CENSO.has(r.codigo),
  };
});

export const REGIAO_POR_ID = Object.fromEntries(REGIOES.map((r) => [r.id, r])) as Record<string, Regiao>;

export const POPULACAO_TOTAL = REGIOES.reduce((soma, r) => soma + r.populacao, 0);

function dentroDoAnel(lon: number, lat: number, anel: number[][]): boolean {
  let dentro = false;
  for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
    const [xi, yi] = anel[i] as [number, number];
    const [xj, yj] = anel[j] as [number, number];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}

/** O ponto cai dentro da RA? Considera as partes separadas e os buracos. */
export function dentroDaRegiao(ra: Regiao, lon: number, lat: number): boolean {
  const poligonos = ra.geometria.type === 'Polygon' ? [ra.geometria.coordinates] : ra.geometria.coordinates;
  return poligonos.some(
    (aneis) => dentroDoAnel(lon, lat, aneis[0]!) && !aneis.slice(1).some((buraco) => dentroDoAnel(lon, lat, buraco)),
  );
}

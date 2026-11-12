/**
 * Contexto REAL da cidade, para cruzar com os chamados simulados: escolas
 * públicas (INEP 2025), unidades públicas de saúde (CNES 04/2026) e favelas e
 * comunidades urbanas (IBGE, Censo 2022). Baixados pelo geobr (Ipea) em
 * 10/11/2026 e trazidos da demo exploratória (ver o README).
 *
 * Os arquivos ficam em `public/dados/` e vão no build: abrem sem internet.
 */
import type { Feature, Polygon, MultiPolygon } from 'geojson';

/** [lon, lat, nome, rede ou tipo, RA] */
export type Ponto = [number, number, string, string, string | null];

interface Meta {
  fonte: string;
  ano: number;
  url: string;
  baixadoEm: string;
}

export interface ArquivoPontos extends Meta {
  linhas: Ponto[];
}

export interface ArquivoFavelas extends Meta {
  type: 'FeatureCollection';
  features: Feature<Polygon | MultiPolygon, { nome: string }>[];
}

export interface Contexto {
  escolas: ArquivoPontos;
  saude: ArquivoPontos;
  favelas: ArquivoFavelas;
}

export type CamadaContexto = keyof Contexto;

/** Como cada camada aparece no painel, sempre com o selo da fonte. */
export const CAMADAS_CONTEXTO: { id: CamadaContexto; nome: string; selo: string }[] = [
  { id: 'saude', nome: 'Saúde pública', selo: 'Real · CNES 2026' },
  { id: 'escolas', nome: 'Escolas públicas', selo: 'Real · INEP 2025' },
  { id: 'favelas', nome: 'Favelas e comunidades urbanas', selo: 'Real · IBGE 2022' },
];

/** Raio, em metros, de cada tipo de unidade de saúde. */
export const RAIO_SAUDE: Record<string, number> = { Hospital: 260, UPA: 200, UBS: 120 };

async function ler<T>(nome: string): Promise<T> {
  const r = await fetch(new URL(`dados/${nome}.json`, document.baseURI));
  if (!r.ok) throw new Error(`${nome}.json: ${r.status}`);
  return (await r.json()) as T;
}

export async function carregarContexto(): Promise<Contexto> {
  const [escolas, saude, favelas] = await Promise.all([ler<ArquivoPontos>('escolas'), ler<ArquivoPontos>('saude'), ler<ArquivoFavelas>('favelas')]);
  return { escolas, saude, favelas };
}

/** Quantos itens a camada tem (para o painel). */
export const tamanho = (c: Contexto, id: CamadaContexto) => (id === 'favelas' ? c.favelas.features.length : c[id].linhas.length);

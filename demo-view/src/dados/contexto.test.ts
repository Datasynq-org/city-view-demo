import { describe, expect, it } from 'vitest';
import jsonEscolas from '../../public/dados/escolas.json';
import jsonFavelas from '../../public/dados/favelas.json';
import jsonSaude from '../../public/dados/saude.json';
import { LIMITES_DF } from '../dominio/ras';
import { type ArquivoFavelas, type ArquivoPontos, CAMADAS_CONTEXTO, RAIO_SAUDE } from './contexto';

// Os mesmos arquivos que o app busca em `dados/` (ver `carregarContexto`).
const escolas = jsonEscolas as unknown as ArquivoPontos;
const saude = jsonSaude as unknown as ArquivoPontos;
const favelas = jsonFavelas as unknown as ArquivoFavelas;
const [[OESTE, SUL], [LESTE, NORTE]] = LIMITES_DF;
const noDf = ([lon, lat]: [number, number, ...unknown[]]) => lon >= OESTE - 0.05 && lon <= LESTE + 0.05 && lat >= SUL - 0.05 && lat <= NORTE + 0.05;

describe('contexto real', () => {
  it('cada arquivo diz de onde veio, de que ano e quando foi baixado', () => {
    for (const a of [escolas, saude, favelas]) {
      expect(a.fonte).toBeTruthy();
      expect(a.url).toMatch(/^https:\/\//);
      expect(a.ano).toBeGreaterThanOrEqual(2022);
      expect(a.baixadoEm).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('os pontos caem dentro do DF', () => {
    expect(escolas.linhas.length).toBeGreaterThan(500);
    expect(saude.linhas.length).toBeGreaterThan(100);
    expect([...escolas.linhas, ...saude.linhas].every(noDf)).toBe(true);
  });

  it('todo tipo de unidade de saúde tem raio', () => {
    expect(saude.linhas.every((l) => RAIO_SAUDE[l[3]] !== undefined)).toBe(true);
  });

  it('as favelas são polígonos com nome', () => {
    expect(favelas.features.length).toBeGreaterThan(10);
    expect(favelas.features.every((f) => ['Polygon', 'MultiPolygon'].includes(f.geometry.type) && f.properties.nome)).toBe(true);
  });

  it('toda camada real tem selo com a palavra "Real"', () => {
    expect(CAMADAS_CONTEXTO.every((c) => c.selo.startsWith('Real · '))).toBe(true);
  });
});

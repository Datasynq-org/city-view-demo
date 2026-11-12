import { describe, expect, it } from 'vitest';
import { gerarBase } from '../dados/gerador';
import type { Incidente } from '../dominio/incidente';
import { LIMITES_DF } from '../dominio/ras';
import {
  agregar,
  COLUNAS,
  corDoCalor,
  CORES_DAS_FAIXAS,
  diferenca,
  diferencaVazia,
  FAIXAS,
  FOLGA_DO_TOPO,
  intensidadePorZoom,
  LADO_M,
  LINHAS,
  metrosPorPixel,
  novaGrade,
  OPACIDADE_POR_ZOOM,
  paraGeoJSON,
  pico,
  RAIO_NO_CHAO,
  raioPorZoom,
} from './calor';

const base = gerarBase({ agora: Date.UTC(2026, 10, 12, 18, 30), dias: 28, diasDetalhados: 7 });
const grade = agregar(base.incidentes);

const em = (lon: number, lat: number): Incidente => ({ ...base.incidentes[0]!, local: { lon, lat, raId: 'plano-piloto' } });

describe('raio do calor', () => {
  it('é dado em metros no chão e encolhe devagar ao aproximar', () => {
    for (let k = 1; k < RAIO_NO_CHAO.length; k++) {
      expect(RAIO_NO_CHAO[k]![0]).toBeGreaterThan(RAIO_NO_CHAO[k - 1]![0]);
      expect(RAIO_NO_CHAO[k]![1]).toBeLessThanOrEqual(RAIO_NO_CHAO[k - 1]![1]);
    }
    // Enquanto o calor está visível de fato, o raio não desce da escala do bairro:
    // com poucos chamados por quadra, um raio menor só mostraria ruído.
    const visivel = (z: number) => [...OPACIDADE_POR_ZOOM].reverse().find(([zo]) => zo <= z)?.[1] ?? 1;
    for (const [z, m] of RAIO_NO_CHAO) if (visivel(z) >= 0.4) expect(m, `zoom ${z}`).toBeGreaterThanOrEqual(4 * LADO_M);
  });

  it('no nível da rua o calor sai de cena, sem degrau', () => {
    const op = OPACIDADE_POR_ZOOM.map(([, o]) => o);
    for (let k = 1; k < op.length; k++) expect(op[k]).toBeLessThanOrEqual(op[k - 1]!);
    expect(op[0]).toBeGreaterThan(0.85);
    expect(op.at(-1)).toBe(0);
    expect(OPACIDADE_POR_ZOOM.at(-1)![0]).toBeLessThanOrEqual(RAIO_NO_CHAO.at(-1)![0]);
  });

  it('em pixels, cresce sempre com o zoom, sem saltos para trás', () => {
    const e = raioPorZoom();
    expect(e.slice(0, 3)).toEqual(['interpolate', ['exponential', 2], ['zoom']]);
    const px = e.slice(3).filter((_, k) => k % 2 === 1) as number[];
    for (let k = 1; k < px.length; k++) expect(px[k]).toBeGreaterThan(px[k - 1]!);
    // Na vista do DF (zoom ~9,5), a mancha tem tamanho de leitura, não de borrão.
    expect(px[2]).toBeGreaterThan(8);
    expect(px[2]).toBeLessThan(16);
  });

  it('converte metros em pixels na latitude do DF', () => {
    expect(metrosPorPixel(9)).toBeGreaterThan(140);
    expect(metrosPorPixel(9)).toBeLessThan(155);
    expect(metrosPorPixel(10) * 2).toBeCloseTo(metrosPorPixel(9), 6);
  });
});

describe('cor do calor', () => {
  it('começa transparente e sobe em seis faixas de borda nítida', () => {
    const e = corDoCalor();
    expect(e.slice(0, 3)).toEqual(['interpolate', ['linear'], ['heatmap-density']]);
    const paradas = e.slice(3);
    const entradas = paradas.filter((_, k) => k % 2 === 0) as number[];
    const cores = paradas.filter((_, k) => k % 2 === 1) as string[];
    for (let k = 1; k < entradas.length; k++) expect(entradas[k]).toBeGreaterThan(entradas[k - 1]!);
    expect(entradas[0]).toBe(0);
    expect(entradas.at(-1)).toBe(1);
    expect(cores[0]).toMatch(/,0\)$/);
    expect(cores[1]).toMatch(/,0\)$/);
    expect(new Set(cores).size).toBe(FAIXAS.length + 1);
    expect(CORES_DAS_FAIXAS).toHaveLength(6);
  });

  it('as faixas dobram de uma para a outra, e a mais baixa já aparece', () => {
    for (let k = 1; k < FAIXAS.length; k++) {
      const razao = FAIXAS[k]! / FAIXAS[k - 1]!;
      expect(razao).toBeGreaterThan(1.5);
      expect(razao).toBeLessThan(2.6);
    }
    // A primeira faixa é visível sobre a imagem: opacidade de pelo menos 35%.
    expect(Number(CORES_DAS_FAIXAS[0]!.match(/,([\d.]+)\)$/)![1])).toBeGreaterThanOrEqual(0.35);
  });
});

describe('agregação', () => {
  it('conta todos os chamados, em células de 120 m dentro do DF', () => {
    expect(grade.total).toBe(base.incidentes.length);
    expect(grade.conta.reduce((s, n) => s + n, 0)).toBe(base.incidentes.length);
    expect(COLUNAS * LINHAS).toBe(grade.conta.length);
    const [[oeste, sul], [leste, norte]] = LIMITES_DF;
    const fc = paraGeoJSON(grade);
    expect(fc.features.length).toBeGreaterThan(1000);
    expect(fc.features.length).toBeLessThan(base.incidentes.length);
    expect(fc.features.reduce((s, f) => s + f.properties.n, 0)).toBe(base.incidentes.length);
    for (const f of fc.features) {
      const [lon, lat] = f.geometry.coordinates as [number, number];
      expect(lon).toBeGreaterThanOrEqual(oeste);
      expect(lon).toBeLessThanOrEqual(leste);
      expect(lat).toBeGreaterThanOrEqual(sul);
      expect(lat).toBeLessThanOrEqual(norte);
    }
    expect(new Set(fc.features.map((f) => f.id)).size).toBe(fc.features.length);
  });

  it('ignora o que cai fora do DF', () => {
    expect(agregar([em(-46.6, -23.5)]).total).toBe(0);
  });

  it('reaproveita a grade que recebe', () => {
    const g = novaGrade();
    expect(agregar([em(-47.9, -15.8)], g)).toBe(g);
    expect(agregar([], g).total).toBe(0);
    expect(g.conta.every((n) => n === 0)).toBe(true);
  });
});

describe('diferença entre agregações', () => {
  it('uma chegada muda uma célula só', () => {
    const novo = em(-47.8828, -15.7939);
    const depois = agregar([...base.incidentes, novo]);
    const d = diferenca(grade, depois)!;
    expect((d.add?.length ?? 0) + (d.update?.length ?? 0)).toBe(1);
    expect(d.remove).toEqual([]);
    const mudou = d.update?.[0] ?? { id: d.add![0]!.id };
    const antes = grade.conta[mudou.id as number]!;
    expect(depois.conta[mudou.id as number]).toBe(antes + 1);
  });

  it('nada mudou, nada a mandar', () => {
    expect(diferencaVazia(diferenca(grade, agregar(base.incidentes))!)).toBe(true);
  });

  it('uma troca de filtro muda coisa demais: melhor mandar tudo', () => {
    expect(diferenca(grade, agregar(base.incidentes.filter((i) => i.area === 'energia')))).toBeNull();
  });

  it('uma célula que esvazia sai do mapa', () => {
    const so = [em(-47.9, -15.8)];
    expect(diferenca(agregar(so), agregar([]))!.remove).toHaveLength(1);
  });
});

describe('calibração', () => {
  it('num campo uniforme, o pico é a densidade vezes a área do núcleo (2πσ²)', () => {
    // Um chamado no centro de cada célula, num bloco de 60 × 60 células.
    const [[oeste, sul]] = LIMITES_DF;
    const dx = (LIMITES_DF[1][0] - oeste) / COLUNAS;
    const dy = (LIMITES_DF[1][1] - sul) / LINHAS;
    const campo: Incidente[] = [];
    for (let j = 100; j < 160; j++) for (let i = 100; i < 160; i++) campo.push(em(oeste + (i + 0.5) * dx, sul + (j + 0.5) * dy));
    const g = agregar(campo);
    expect(g.total).toBe(3600);
    for (const raio of [300, 600, 1150]) {
      const sigma = raio / 3;
      const esperado = (2 * Math.PI * sigma * sigma) / (LADO_M * LADO_M); // um chamado por célula
      expect(pico(g, raio) / esperado, `raio ${raio}`).toBeGreaterThan(0.95);
      expect(pico(g, raio) / esperado, `raio ${raio}`).toBeLessThan(1.05);
    }
  });

  it('em todo zoom, o maior foco da seleção chega ao topo da escala', () => {
    const e = intensidadePorZoom(grade);
    expect(e.slice(0, 3)).toEqual(['interpolate', ['linear'], ['zoom']]);
    const paradas = e.slice(3) as number[];
    RAIO_NO_CHAO.forEach(([z, raio], k) => {
      expect(paradas[k * 2]).toBe(z);
      const intensidade = paradas[k * 2 + 1]!;
      expect(intensidade).toBeGreaterThan(0);
      expect(intensidade * 0.3989422804014327 * pico(grade, raio)).toBeCloseTo(FOLGA_DO_TOPO, 6);
    });
  });

  it('o pico é o do campo gaussiano de verdade: um foco isolado vale o que tem', () => {
    // 500 chamados no mesmo ponto: sob o núcleo, pesam 500, qualquer que seja o raio.
    const foco = Array.from({ length: 500 }, () => em(-47.8828, -15.7939));
    const g = agregar(foco);
    for (const raio of [300, 820, 1600]) {
      expect(pico(g, raio) / 500, `raio ${raio}`).toBeGreaterThan(0.9);
      expect(pico(g, raio) / 500, `raio ${raio}`).toBeLessThanOrEqual(1.0001);
    }
  });

  it('com raio menor, cabe menos chamado sob o núcleo', () => {
    expect(pico(grade, 300)).toBeLessThan(pico(grade, 1600));
    expect(pico(grade, 300)).toBeGreaterThan(0);
  });

  it('sem chamados, a intensidade é zero', () => {
    const paradas = intensidadePorZoom(agregar([])).slice(3) as number[];
    expect(paradas.filter((_, k) => k % 2 === 1).every((v) => v === 0)).toBe(true);
    expect(pico(agregar([]), 600)).toBe(0);
  });
});

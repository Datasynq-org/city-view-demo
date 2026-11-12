import { describe, expect, it } from 'vitest';
import { dentroDaRegiao, REGIAO_POR_ID, REGIOES } from '../dominio/ras';
import { mulberry32 } from './aleatorio';
import mancha from './mancha.json';
import { celulasDaMancha, naMancha, PASSO_DA_MANCHA, sortearPonto } from './pontos';

const sortear = (raId: string, n: number, semente = 7) => {
  const rand = mulberry32(semente);
  const ra = REGIAO_POR_ID[raId]!;
  return Array.from({ length: n }, () => sortearPonto(ra, rand));
};

describe('mancha urbana', () => {
  it('cobre as 37 RAs, com células de cerca de 200 m e pesos de 1 a 31', () => {
    for (const ra of REGIOES) expect(celulasDaMancha(ra.id), ra.nome).toBeGreaterThan(0);
    const [dx, dy] = PASSO_DA_MANCHA;
    expect(dx * 107_000).toBeGreaterThan(150);
    expect(dx * 107_000).toBeLessThan(260);
    expect(dy * 111_000).toBeGreaterThan(150);
    for (const plano of Object.values(mancha.ras as Record<string, number[]>)) {
      expect(plano.length % 3).toBe(0);
      for (let k = 2; k < plano.length; k += 3) {
        expect(plano[k]).toBeGreaterThanOrEqual(1);
        expect(plano[k]).toBeLessThanOrEqual(31);
      }
    }
  });

  it('diz de onde veio', () => {
    expect(mancha.fontes.join(' ')).toMatch(/Mancha Urbana 2023.*IDE\/DF/);
  });
});

describe('sortearPonto', () => {
  it('põe o ponto dentro da RA e dentro da mancha urbana dela', () => {
    for (const ra of REGIOES) {
      const pontos = sortear(ra.id, 300);
      for (const [lon, lat] of pontos) expect(dentroDaRegiao(ra, lon, lat), ra.nome).toBe(true);
      const naCidade = pontos.filter(([lon, lat]) => naMancha(ra.id, lon, lat)).length;
      expect(naCidade / pontos.length, ra.nome).toBeGreaterThan(0.97);
    }
  });

  it('não empilha pontos no mesmo lugar', () => {
    for (const raId of ['ceilandia', 'aguas-claras', 'park-way', 'varjao', 'fercal']) {
      const vistos = new Map<string, number>();
      for (const [lon, lat] of sortear(raId, 3000)) vistos.set(`${lon},${lat}`, (vistos.get(`${lon},${lat}`) ?? 0) + 1);
      // 5 casas decimais dão ~1 m: repetir de vez em quando é esperado numa RA pequena.
      expect(Math.max(...vistos.values()), raId).toBeLessThanOrEqual(4);
    }
  });

  it('espalha os pontos pela cidade, sem um foco único', () => {
    // Ceilândia: a mancha tem ~34 km². Os pontos precisam ocupar boa parte dela.
    const pontos = sortear('ceilandia', 4000);
    const [dx, dy] = PASSO_DA_MANCHA;
    const celulas = new Set(pontos.map(([lon, lat]) => `${Math.floor(lon / dx)},${Math.floor(lat / dy)}`));
    expect(celulas.size).toBeGreaterThan(celulasDaMancha('ceilandia') * 0.6);
  });

  it('pesa mais perto de onde mora gente: células mais pesadas recebem mais pontos', () => {
    const plano = (mancha.ras as Record<string, number[]>)['ceilandia']!;
    const [oeste, sul] = mancha.origem as [number, number];
    const [dx, dy] = PASSO_DA_MANCHA;
    const peso = new Map<string, number>();
    for (let k = 0; k < plano.length; k += 3) peso.set(`${plano[k]},${plano[k + 1]}`, plano[k + 2]!);
    const pesos = [...peso.values()].sort((a, b) => a - b);
    const mediano = pesos[pesos.length >> 1]!;
    let pesadas = 0;
    const pontos = sortear('ceilandia', 6000);
    for (const [lon, lat] of pontos) if ((peso.get(`${Math.floor((lon - oeste) / dx)},${Math.floor((lat - sul) / dy)}`) ?? 0) > mediano) pesadas++;
    // Metade das células (as mais pesadas) concentra bem mais da metade dos pontos.
    expect(pesadas / pontos.length).toBeGreaterThan(0.6);
  });

  it('é determinístico', () => {
    expect(sortear('gama', 50, 3)).toEqual(sortear('gama', 50, 3));
    expect(sortear('gama', 50, 3)).not.toEqual(sortear('gama', 50, 4));
  });
});

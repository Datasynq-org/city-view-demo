import { describe, expect, it } from 'vitest';
import { estaAberto, idValido, validarIncidente } from '../dominio/incidente';
import { CANAL_CITY_VIEW, ORGAO_POR_ID, TIPOS } from '../dominio/orgaos';
import { dentroDaRegiao, REGIAO_POR_ID, REGIOES } from '../dominio/ras';
import { mulberry32, poisson, randDe } from './aleatorio';
import { type BaseSimulada, gerarBase, indiceDaContagem, inicioDoDia, inicioDoIndice } from './gerador';

const DIA = 86_400_000;
/** Quinta-feira, 12/11/2026, 15h30 em Brasília. */
const AGORA = Date.UTC(2026, 10, 12, 18, 30);
const OPCOES = { agora: AGORA, dias: 28, diasDetalhados: 7 };

const base = gerarBase(OPCOES);
const indiceTipo = new Map(TIPOS.map((t, i) => [t.id, i]));
const indiceRa = new Map(REGIOES.map((r, i) => [r.id, i]));

describe('aleatório', () => {
  it('mulberry32 repete a sequência da demo antiga para a mesma semente', () => {
    // Valores obtidos rodando a função original de City-view (simulacao.ts).
    const valores = Array.from({ length: 4 }, mulberry32(20261110));
    expect(valores).toEqual([0.47585524804890156, 0.4372278384398669, 0.7736968537792563, 0.2937412660103291]);
    expect(Array.from({ length: 4 }, mulberry32(20261111))).not.toEqual(valores);
  });

  it('randDe dá sequências diferentes para chaves diferentes', () => {
    expect(randDe(1, 'a')()).toBe(randDe(1, 'a')());
    expect(randDe(1, 'a')()).not.toBe(randDe(1, 'b')());
    expect(randDe(1, 'a')()).not.toBe(randDe(2, 'a')());
  });

  it('poisson tem a média pedida, abaixo e acima do limiar da aproximação', () => {
    for (const lambda of [3, 100]) {
      const rand = mulberry32(7);
      let soma = 0;
      for (let i = 0; i < 20_000; i++) soma += poisson(lambda, rand);
      expect(soma / 20_000).toBeCloseTo(lambda, lambda > 40 ? 0 : 1);
    }
    expect(poisson(0, mulberry32(7))).toBe(0);
    expect(poisson(-2, mulberry32(7))).toBe(0);
  });
});

describe('calendário de Brasília', () => {
  it('começa o dia às 3h UTC, seja qual for o fuso da máquina', () => {
    expect(inicioDoDia(AGORA)).toBe(Date.UTC(2026, 10, 12, 3));
    // 1h de Brasília do dia 12 ainda é dia 12; 23h59 UTC−3 do dia 11 é dia 11.
    expect(inicioDoDia(Date.UTC(2026, 10, 12, 4))).toBe(Date.UTC(2026, 10, 12, 3));
    expect(inicioDoDia(Date.UTC(2026, 10, 12, 2, 59))).toBe(Date.UTC(2026, 10, 11, 3));
  });
});

describe('gerarBase', () => {
  it('é determinístico', () => {
    const outra = gerarBase(OPCOES);
    expect(outra.contagens).toEqual(base.contagens);
    expect(outra.incidentes).toEqual(base.incidentes);
  });

  it('muda com a semente', () => {
    const outra = gerarBase({ ...OPCOES, semente: 1 });
    expect(outra.contagens).not.toEqual(base.contagens);
  });

  it('gera um volume diário da ordem do catálogo', () => {
    const porMes = TIPOS.reduce((s, t) => s + t.volumeMensal, 0);
    const total = base.contagens.reduce((s, n) => s + n, 0);
    const porDia = total / (base.dias - 1 + (AGORA - inicioDoDia(AGORA)) / DIA);
    expect(porDia).toBeGreaterThan((porMes / 30) * 0.6);
    expect(porDia).toBeLessThan((porMes / 30) * 1.9);
  });

  it('cria exatamente um incidente por chamado contado na janela detalhada', () => {
    const contados = new Int32Array(base.contagens.length);
    const inicioDaBase = inicioDoIndice(base, 0);
    for (const inc of base.incidentes) {
      const d = Math.floor((inc.criadoEm - inicioDaBase) / DIA);
      contados[indiceDaContagem(base, indiceTipo.get(inc.tipoId)!, indiceRa.get(inc.local.raId)!, d)]!++;
    }
    const primeiro = base.dias - base.diasDetalhados;
    let conferidos = 0;
    for (let t = 0; t < TIPOS.length; t++) {
      for (let r = 0; r < REGIOES.length; r++) {
        for (let d = 0; d < base.dias; d++) {
          const i = indiceDaContagem(base, t, r, d);
          expect(contados[i]).toBe(d < primeiro ? 0 : base.contagens[i]);
          conferidos += contados[i]!;
        }
      }
    }
    expect(conferidos).toBe(base.incidentes.length);
    expect(base.incidentes.length).toBeGreaterThan(5_000);
  });

  it('só gera incidentes válidos no modelo único', () => {
    for (const inc of base.incidentes) expect(validarIncidente(inc), inc.id).toEqual([]);
  });

  it('numera os incidentes na ordem de chegada, sem repetir', () => {
    const ids = base.incidentes.map((i) => i.id);
    expect(ids.every(idValido)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids[0]).toBe('INC-2026-000001');
    expect([...ids].sort()).toEqual(ids);
    for (let i = 1; i < base.incidentes.length; i++) {
      expect(base.incidentes[i]!.criadoEm).toBeGreaterThanOrEqual(base.incidentes[i - 1]!.criadoEm);
    }
  });

  it('põe cada incidente dentro da sua RA', () => {
    for (const inc of base.incidentes) {
      expect(dentroDaRegiao(REGIAO_POR_ID[inc.local.raId]!, inc.local.lon, inc.local.lat), inc.id).toBe(true);
    }
  });

  it('não tem data no futuro nem antes da janela', () => {
    const inicioDaJanela = inicioDoIndice(base, base.dias - base.diasDetalhados);
    for (const inc of base.incidentes) {
      expect(inc.criadoEm).toBeGreaterThanOrEqual(inicioDaJanela);
      for (const data of [inc.criadoEm, inc.encaminhadoEm, inc.resolvidoEm]) {
        if (data !== undefined) expect(data).toBeLessThanOrEqual(AGORA);
      }
    }
  });

  it('usa o canal do órgão responsável ou o canal do City View', () => {
    let cityView = 0;
    for (const inc of base.incidentes) {
      const doOrgao = ORGAO_POR_ID[inc.orgaoId]!.canais.map((c) => c.canalId);
      if (inc.origem.canalId === CANAL_CITY_VIEW) cityView++;
      else expect(doOrgao, inc.id).toContain(inc.origem.canalId);
    }
    expect(cityView / base.incidentes.length).toBeCloseTo(0.08, 1);
  });

  it('passa por todas as situações e deixa os antigos quase todos fechados', () => {
    const vistas = new Set(base.incidentes.map((i) => i.situacao));
    expect(vistas.size).toBe(9);
    // Perturbação do sossego leva 1,6 h em média: com mais de 3 dias, o que resta aberto é exceção.
    const antigos = base.incidentes.filter((i) => i.tipoId === 'sossego' && AGORA - i.criadoEm > 3 * DIA);
    expect(antigos.length).toBeGreaterThan(100);
    expect(antigos.filter((i) => estaAberto(i.situacao)).length / antigos.length).toBeLessThan(0.05);
  });
});

describe('foco', () => {
  const foco = { tipoId: 'sossego', raId: 'ceilandia', multiplicador: 3, dias: 5 };
  const comFoco: BaseSimulada = gerarBase({ ...OPCOES, focos: [foco] });
  const t = indiceTipo.get(foco.tipoId)!;
  const r = indiceRa.get(foco.raId)!;
  const somaDaCelula = (b: BaseSimulada, desde: number) => {
    let soma = 0;
    for (let d = desde; d < b.dias; d++) soma += b.contagens[indiceDaContagem(b, t, r, d)]!;
    return soma;
  };

  it('aumenta os chamados do tipo na RA, nos dias do foco', () => {
    const desde = base.dias - foco.dias;
    expect(somaDaCelula(comFoco, desde)).toBeGreaterThan(somaDaCelula(base, desde) * 2);
  });

  it('deixa idêntico todo o resto da cidade', () => {
    for (let i = 0; i < base.contagens.length; i++) {
      const naCelula = Math.floor(i / base.dias) === t * REGIOES.length + r;
      if (!naCelula || i % base.dias < base.dias - foco.dias) expect(comFoco.contagens[i]).toBe(base.contagens[i]);
    }
    const fora = (b: BaseSimulada) =>
      b.incidentes.filter((i) => !(i.tipoId === foco.tipoId && i.local.raId === foco.raId)).map(({ id: _, ...resto }) => resto);
    expect(fora(comFoco)).toEqual(fora(base));
  });
});

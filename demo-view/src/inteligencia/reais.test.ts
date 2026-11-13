import { writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ARQUIVO, assuntoDoTipo, DEMANDAS, numeros, orgaoDaDemanda, SEM_ORGAO } from '../dados/aguasClaras/demandas';
import { STATUS_DO_SITE } from '../dados/aguasClaras/limpar';
import { limiarDaSensibilidade, metros, SENSIBILIDADE_PADRAO } from './agrupamento';
import { siglaDoOrgao } from './casos';
import { planoDe, responsavelDe } from './plano';
import { agruparReais, chamadosReais, comPonto, ehReal, JANELA_DIAS, ligacoesReais, MINIMO_DE_RELATOS, palavras, RAIO_M, semelhanca } from './reais';

const ch = chamadosReais();
const lig = ligacoesReais(ch);
const r = agruparReais(ch, lig, limiarDaSensibilidade(SENSIBILIDADE_PADRAO));

describe('as demandas reais de Águas Claras', () => {
  it('o arquivo tem a fonte, a data da leitura e só status conhecidos', () => {
    expect(ARQUIVO.fonte).toMatch(/^https:\/\/dfaguasclaras\.com\.br\//);
    expect(Number.isNaN(Date.parse(ARQUIVO.lidoEm))).toBe(false);
    expect(DEMANDAS.length).toBeGreaterThan(500);
    for (const d of DEMANDAS) expect(STATUS_DO_SITE).toContain(d.status);
  });

  it('nada de foto, e nada que pareça telefone, e-mail ou CPF nas descrições', () => {
    const tudo = JSON.stringify(DEMANDAS);
    expect(tudo).not.toMatch(/storage\/uploads|\.jpe?g|\.png/i);
    for (const d of DEMANDAS) {
      expect(d.descricao, d.protocolo).not.toMatch(/[\w.+-]+@[\w-]+\.[\w-]+/);
      expect(d.descricao, d.protocolo).not.toMatch(/\b\d{3}\.\d{3}\.\d{3}-?\d{2}\b/);
      expect(d.descricao, d.protocolo).not.toMatch(/\b9\d{4}[\s.-]?\d{4}\b/);
    }
  });

  it('todo órgão do site tem nome na demo; os números fecham', () => {
    for (const d of DEMANDAS) {
      const o = orgaoDaDemanda(d);
      if (d.orgao) expect(o, d.orgao).not.toBe(SEM_ORGAO);
      expect(siglaDoOrgao(o), o).not.toBe(o === 'slu' ? '' : o === 'x' ? '' : undefined);
    }
    const n = numeros();
    expect(n.total).toBe(DEMANDAS.length);
    expect(n.porStatus.reduce((s, x) => s + x.n, 0)).toBe(n.total);
    expect(n.porTipo.reduce((s, x) => s + x.n, 0)).toBe(n.total);
    expect(n.porMes.reduce((s, x) => s + x.n, 0)).toBe(n.total);
    expect(n.porMes[0]!.mes <= n.porMes.at(-1)!.mes).toBe(true);
    expect(assuntoDoTipo('Obras / Manutenção')).toBe('obras-manutencao');
  });
});

describe('texto parecido', () => {
  it('ignora acento, palavras vazias e flexão; mede as palavras em comum', () => {
    expect([...palavras('Buracos na Rua 19 Sul, em frente à padaria')]).toEqual(['burac', 'sul', 'frent', 'padar']);
    expect(semelhanca(palavras('Buraco grande na pista'), palavras('buracos grandes na pista'))).toBe(1);
    expect(semelhanca(palavras('Lâmpada apagada'), palavras('Carro abandonado'))).toBe(0);
    expect(semelhanca(new Set(), palavras('qualquer coisa'))).toBe(0);
  });
});

describe('agrupamento sobre o dado real', () => {
  it('cada relato com ponto vira um chamado, com a idade contada da leitura', () => {
    expect(ch).toHaveLength(comPonto().length);
    expect(ch.every((c) => c.horas >= 0 && c.peso === 1 && c.casoId === null)).toBe(true);
  });

  it('nenhuma ligação passa do raio nem da janela', () => {
    for (const l of lig) {
      expect(metros(ch[l.a]!.ponto, ch[l.b]!.ponto)).toBeLessThanOrEqual(RAIO_M);
      expect(Math.abs(ch[l.a]!.horas - ch[l.b]!.horas) / 24).toBeLessThanOrEqual(JANELA_DIAS);
    }
  });

  it('acha incidentes, e nenhum é do tamanho do bairro', () => {
    expect(r.incidentes.length).toBeGreaterThan(5);
    for (const i of r.incidentes) {
      expect(i.raio, i.codigo).toBeLessThanOrEqual(RAIO_M);
      expect(i.membros.length, i.codigo).toBeGreaterThanOrEqual(MINIMO_DE_RELATOS);
      expect(i.chamados).toBe(i.membros.length);
    }
    expect(r.total).toBe(ch.length);
    expect(r.avulsos + r.incidentes.reduce((s, i) => s + i.chamados, 0)).toBe(r.total);
  });

  it('cada incidente conta os abertos e os finalizados e traz os relatos, do mais novo ao mais antigo', () => {
    const d = comPonto();
    for (const i of r.incidentes) {
      expect(ehReal(i)).toBe(true);
      if (!ehReal(i)) continue;
      expect(i.abertos + i.finalizados).toBe(i.chamados);
      expect(i.finalizados).toBe(i.membros.filter((m) => d[m]!.status === 'finalizado').length);
      expect(i.relatos).toHaveLength(i.chamados);
      expect(i.titulo).not.toMatch(/undefined|NaN/);
      expect(i.leitura).not.toMatch(/undefined|NaN/);
    }
  });

  it('a mesma entrada dá os mesmos grupos', () => {
    const de_novo = agruparReais(ch, ligacoesReais(ch), limiarDaSensibilidade(SENSIBILIDADE_PADRAO));
    expect(de_novo.incidentes.map((i) => i.membros)).toEqual(r.incidentes.map((i) => i.membros));
  });

  it('mais sensível junta mais; mais rígido, menos', () => {
    const solto = agruparReais(ch, lig, limiarDaSensibilidade(90));
    const rigido = agruparReais(ch, lig, limiarDaSensibilidade(20));
    expect(solto.avulsos).toBeLessThan(r.avulsos);
    expect(rigido.avulsos).toBeGreaterThan(r.avulsos);
  });

  it('todo incidente real tem plano de envio, com um responsável', () => {
    for (const i of r.incidentes) expect(responsavelDe(planoDe(i)), i.codigo).toBeDefined();
  });

  it('sonda (escreve um resumo para conferência; não afirma nada)', () => {
    const linhas = [`chamados ${ch.length} · ligações ${lig.length} · incidentes ${r.incidentes.length} · avulsos ${r.avulsos}`];
    for (const i of r.incidentes.slice(0, 14)) linhas.push(`${i.codigo} [${i.severidade}/${i.tipoDoCaso}] u${i.urgencia} c${Math.round(i.confianca * 100)} r${Math.round(i.raio)}m · ${i.titulo} · ${ehReal(i) ? `${i.abertos} abertos` : ''}\n    ${ehReal(i) ? i.relatos.slice(0, 3).map((x) => x.texto.slice(0, 90)).join(' || ') : ''}`);
    const tam = r.incidentes.map((i) => i.chamados).sort((a, b) => b - a);
    linhas.push(`tamanhos: ${tam.join(' ')}`);
    linhas.push(`tipos de caso: ${JSON.stringify(Object.fromEntries(['Recorrência', 'Mesmo incidente', 'Reclassificação'].map((t) => [t, r.incidentes.filter((i) => i.tipoDoCaso === t).length])))}`);
    if (process.env.SONDA) writeFileSync(process.env.SONDA, linhas.join('\n'), 'utf8');
  });
});

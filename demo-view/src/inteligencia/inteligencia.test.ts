import { describe, expect, it } from 'vitest';
import { ORGAO_POR_ID } from '../dominio/orgaos';
import { dentroDaRegiao, LIMITES_DF, REGIAO_POR_ID } from '../dominio/ras';
import { afinidade, agrupar, calcularLigacoes, gerarChamados, limiarDaSensibilidade, metros } from './agrupamento';
import { CASOS, casosDaRa, FONTES_SIMULADAS, posicaoDoCaso, siglaDoOrgao, totalDeChamados } from './casos';
import { avancar, cancelarEnvio, confirmar, decisaoDe, descartar, desfazerDescarte, faltaParaEnviar, JANELA_DE_ENVIO } from './decisoes';

const chamados = gerarChamados();
const ligacoes = calcularLigacoes(chamados);
const resultado = agrupar(chamados, ligacoes);
const doCaso = (id: string) => resultado.incidentes.filter((i) => i.casoId === id);

describe('casos', () => {
  it('são os nove da demo exploratória, cada um numa RA que existe', () => {
    expect(CASOS).toHaveLength(9);
    for (const c of CASOS) {
      expect(REGIAO_POR_ID[c.raId], c.id).toBeDefined();
      const [lon, lat] = posicaoDoCaso(c);
      expect(lon > LIMITES_DF[0][0] && lon < LIMITES_DF[1][0] && lat > LIMITES_DF[0][1] && lat < LIMITES_DF[1][1], c.id).toBe(true);
    }
  });

  it('todo órgão citado tem sigla: do catálogo ou das fontes simuladas', () => {
    for (const c of CASOS) for (const s of c.sinais) expect(ORGAO_POR_ID[s.orgaoId] ?? FONTES_SIMULADAS[s.orgaoId], `${c.id}: ${s.orgaoId}`).toBeDefined();
    expect(siglaDoOrgao('pmdf')).toBe('PMDF');
    expect(siglaDoOrgao('detran')).toBe('Detran-DF');
  });

  it('os textos não usam a grafia antiga do nome nem palavras a evitar (magno 7.6)', () => {
    const texto = JSON.stringify(CASOS);
    expect(texto).not.toMatch(/CityView|Palantir|God'?s Eye|espi[ãa]o/i);
  });

  it('a sala sabe onde há caso', () => {
    expect(casosDaRa('ceilandia').map((c) => c.id)).toEqual(['sossego-ceilandia']);
    expect(casosDaRa('lago-sul')).toEqual([]);
  });
});

describe('agrupamento', () => {
  it('a mesma semente dá sempre os mesmos chamados', () => {
    expect(gerarChamados()).toEqual(chamados);
    expect(gerarChamados(7)).not.toEqual(chamados);
  });

  it('a força da ligação cai com assunto, distância e tempo', () => {
    expect(afinidade('a', 'a')).toBe(1);
    expect(afinidade('sossego-ceilandia:som-alto', 'sossego-ceilandia:poluicao-sonora')).toBe(0.85);
    expect(afinidade('sossego-ceilandia:som-alto', 'falta-agua')).toBeLessThan(0.1);
    expect(metros([-47.9, -15.8], [-47.9, -15.81])).toBeGreaterThan(1000);
    expect(ligacoes.every((l) => l.forca > 0 && l.forca <= 1 && Math.abs(l.forca - l.assunto * l.espaco * l.tempo) < 1e-9)).toBe(true);
  });

  it('cada caso roteirizado vira exatamente um incidente, com todos os seus chamados', () => {
    for (const c of CASOS) {
      const incs = doCaso(c.id);
      expect(incs, c.id).toHaveLength(1);
      const nosDoCaso = chamados.filter((x) => x.casoId === c.id).length;
      expect(incs[0]!.membros.filter((i) => chamados[i]!.casoId === c.id), c.id).toHaveLength(nosDoCaso);
      expect(Math.round(incs[0]!.chamados), c.id).toBeGreaterThanOrEqual(totalDeChamados(c));
    }
  });

  it('nenhum incidente mistura dois casos', () => {
    for (const inc of resultado.incidentes) expect(new Set(inc.membros.map((i) => chamados[i]!.casoId).filter(Boolean)).size, inc.codigo).toBeLessThanOrEqual(1);
  });

  it('um órgão e um assunto é agrupamento; mais de um é correlação', () => {
    expect(doCaso('agua-sao-sebastiao')[0]!.tipo).toBe('AGR');
    expect(doCaso('pedras-recanto')[0]!).toMatchObject({ tipo: 'COR', tipoDoCaso: 'Reclassificação', severidade: 'crítico' });
    expect(doCaso('apagao-planaltina')[0]!.orgaos).toHaveLength(3);
  });

  it('o ruído do dia a dia nunca vira incidente crítico nem sério', () => {
    const doRuido = resultado.incidentes.filter((i) => i.casoId === null);
    expect(doRuido.every((i) => i.severidade === 'atenção')).toBe(true);
    expect(doRuido.length).toBeLessThan(30);
  });

  it('a fila vem por urgência, com códigos únicos e confiança entre 0 e 1', () => {
    const u = resultado.incidentes.map((i) => i.urgencia);
    expect([...u].sort((a, b) => b - a)).toEqual(u);
    expect(new Set(resultado.incidentes.map((i) => i.codigo)).size).toBe(resultado.incidentes.length);
    expect(resultado.incidentes.every((i) => i.confianca > 0.45 && i.confianca < 1)).toBe(true);
    expect(resultado.incidentes[0]!.severidade).toBe('crítico');
  });

  it('o motivo traz os números do próprio grupo, e o centro cai na RA do caso', () => {
    const sossego = doCaso('sossego-ceilandia')[0]!;
    expect(sossego.motivo).toMatch(/^54 chamados de 2 órgãos, a até \d+ m um do outro/);
    expect(dentroDaRegiao(REGIAO_POR_ID.ceilandia!, sossego.centro[0], sossego.centro[1])).toBe(true);
  });

  it('as contas fecham: o que não é avulso está em algum incidente', () => {
    const emGrupos = resultado.incidentes.reduce((s, i) => s + i.chamados, 0);
    expect(emGrupos + resultado.avulsos).toBeCloseTo(resultado.total, 6);
    expect(resultado.grupo.filter((g) => g >= 0)).toHaveLength(resultado.incidentes.reduce((s, i) => s + i.membros.length, 0));
  });

  it('menos sensível, junta menos; mais sensível, junta mais', () => {
    expect(limiarDaSensibilidade(0)).toBeCloseTo(0.8);
    expect(limiarDaSensibilidade(100)).toBeCloseTo(0.08);
    const rigido = agrupar(chamados, ligacoes, limiarDaSensibilidade(10));
    const solto = agrupar(chamados, ligacoes, limiarDaSensibilidade(95));
    expect(rigido.avulsos).toBeGreaterThan(resultado.avulsos);
    expect(solto.avulsos).toBeLessThanOrEqual(resultado.avulsos);
  });
});

describe('decisões', () => {
  it('confirmar abre a janela; passada a janela, fica confirmado', () => {
    const d = confirmar({}, 'COR-01', 1000);
    expect(decisaoDe(d, 'COR-01')).toEqual({ situacao: 'enviando', envioAte: 1000 + JANELA_DE_ENVIO });
    expect(faltaParaEnviar(decisaoDe(d, 'COR-01'), 3000)).toBe(JANELA_DE_ENVIO - 2000);
    expect(avancar(d, 1000 + JANELA_DE_ENVIO - 1)).toBe(d);
    expect(decisaoDe(avancar(d, 1000 + JANELA_DE_ENVIO), 'COR-01').situacao).toBe('confirmado');
  });

  it('dá para cancelar dentro da janela, e só dentro dela', () => {
    const d = confirmar({}, 'COR-01', 0);
    expect(decisaoDe(cancelarEnvio(d, 'COR-01', 4999), 'COR-01').situacao).toBe('sugerido');
    expect(cancelarEnvio(d, 'COR-01', 5000)).toBe(d);
  });

  it('descartar pede motivo, e dá para desfazer', () => {
    const d = descartar({}, 'AGR-02', 'Já está sendo tratado');
    expect(decisaoDe(d, 'AGR-02')).toEqual({ situacao: 'descartado', motivo: 'Já está sendo tratado' });
    expect(decisaoDe(desfazerDescarte(d, 'AGR-02'), 'AGR-02').situacao).toBe('sugerido');
  });

  it('só o que está sugerido pode ser confirmado ou descartado', () => {
    const confirmado = avancar(confirmar({}, 'X', 0), 9999);
    expect(descartar(confirmado, 'X', 'Dados insuficientes')).toBe(confirmado);
    expect(confirmar(confirmado, 'X', 10_000)).toBe(confirmado);
  });
});

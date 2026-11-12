import { describe, expect, it } from 'vitest';
import { normalDe, operacaoDoOrgao, ORGAOS_COM_OPERACAO, piorSinal, situacaoDe, valorDe } from './operacao';

describe('operação dos sistemas dos órgãos', () => {
  it('a situação sai do limite: dentro é normal, passou é atenção, passou muito é fora do normal', () => {
    expect(situacaoDe(300, 800, 'ate')).toBe('normal');
    expect(situacaoDe(900, 800, 'ate')).toBe('atencao');
    expect(situacaoDe(18_400, 800, 'ate')).toBe('fora');
    expect(situacaoDe(81, 70, 'pelo-menos')).toBe('normal');
    expect(situacaoDe(52, 70, 'pelo-menos')).toBe('atencao');
    expect(situacaoDe(3, 0, 'ate')).toBe('fora');
  });

  it('cada órgão simulado tem rede, serviço e saúde do sistema, tudo marcado como simulado', () => {
    expect(ORGAOS_COM_OPERACAO).toEqual(['neoenergia', 'ceb-ipes', 'caesb']);
    for (const id of ORGAOS_COM_OPERACAO) {
      const s = operacaoDoOrgao(id)!;
      expect(s.simulado).toBe(true);
      expect(new Set(s.indicadores.map((i) => i.grupo))).toEqual(new Set(['rede', 'servico', 'sistema']));
      expect(new Set(s.indicadores.map((i) => i.id)).size).toBe(s.indicadores.length);
    }
    expect(operacaoDoOrgao('pmdf')).toBeNull();
  });

  it('num dia comum, nada está fora do normal', () => {
    for (const id of ORGAOS_COM_OPERACAO) expect(piorSinal(operacaoDoOrgao(id)!), id).not.toBe('fora');
  });

  it('no apagão, a rede da Neoenergia sai do normal, e só ela', () => {
    const neo = operacaoDoOrgao('neoenergia', 'apagao')!;
    expect(piorSinal(neo)).toBe('fora');
    expect(neo.indicadores.find((i) => i.id === 'alimentadores')).toMatchObject({ valor: 3, situacao: 'fora' });
    expect(operacaoDoOrgao('caesb', 'apagao')).toEqual(operacaoDoOrgao('caesb'));
  });

  it('valor e faixa normal saem prontos para a tela', () => {
    const neo = operacaoDoOrgao('neoenergia', 'apagao')!;
    const sem = neo.indicadores.find((i) => i.id === 'sem-energia')!;
    expect(valorDe(sem)).toBe('18.400 clientes');
    expect(normalDe(sem)).toBe('normal: até 800 clientes');
    expect(valorDe(neo.indicadores.find((i) => i.id === 'no-prazo')!)).toBe('52%');
  });
});

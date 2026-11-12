import { describe, expect, it } from 'vitest';
import { parametrosDoHash, TELAS, telaDoEndereco } from './navegacao';

describe('navegação entre as telas', () => {
  it('lê a tela do endereço, pelo hash ou por ?tela=', () => {
    expect(telaDoEndereco('#/jornada', '')).toBe('jornada');
    expect(telaDoEndereco('#jornada', '')).toBe('jornada');
    expect(telaDoEndereco('', '?tela=jornada&auto=1')).toBe('jornada');
    expect(telaDoEndereco('#/sala', '?tela=jornada')).toBe('sala');
    expect(telaDoEndereco('#/inteligencia?caso=apagao-planaltina', '')).toBe('inteligencia');
  });

  it('conhece as oito telas, sem repetir, e lê os parâmetros do hash', () => {
    expect(TELAS.map((t) => t.id)).toEqual(['sala', 'gestao', 'regioes', 'inteligencia', 'previsoes', 'jornada', 'cidadao', 'integracoes']);
    for (const t of TELAS) expect(telaDoEndereco(`#/${t.id}`, '')).toBe(t.id);
    expect(parametrosDoHash('#/gestao?orgao=caesb').get('orgao')).toBe('caesb');
    expect(parametrosDoHash('#/gestao').get('orgao')).toBeNull();
  });

  it('sem pedido, ou com pedido desconhecido, abre a sala', () => {
    expect(telaDoEndereco('', '')).toBe('sala');
    expect(telaDoEndereco('#/nada', '?tela=outra')).toBe('sala');
  });
});

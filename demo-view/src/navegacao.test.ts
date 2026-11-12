import { describe, expect, it } from 'vitest';
import { telaDoEndereco } from './navegacao';

describe('navegação entre as telas', () => {
  it('lê a tela do endereço, pelo hash ou por ?tela=', () => {
    expect(telaDoEndereco('#/jornada', '')).toBe('jornada');
    expect(telaDoEndereco('#jornada', '')).toBe('jornada');
    expect(telaDoEndereco('', '?tela=jornada&auto=1')).toBe('jornada');
    expect(telaDoEndereco('#/sala', '?tela=jornada')).toBe('sala');
    expect(telaDoEndereco('#/inteligencia?caso=apagao-planaltina', '')).toBe('inteligencia');
  });

  it('sem pedido, ou com pedido desconhecido, abre a sala', () => {
    expect(telaDoEndereco('', '')).toBe('sala');
    expect(telaDoEndereco('#/nada', '?tela=outra')).toBe('sala');
  });
});

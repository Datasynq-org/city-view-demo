import { describe, expect, it } from 'vitest';
import { TELAS } from '../navegacao';
import { entradaDoPerfil, escolhaDe, PERFIS, telasDoPerfil } from './perfil';

describe('entrar por perfil', () => {
  it('cada perfil só mostra telas que existem, sem repetir', () => {
    const todas = TELAS.map((t) => t.id);
    for (const p of PERFIS) {
      expect(new Set(p.telas).size, p.id).toBe(p.telas.length);
      for (const t of p.telas) expect(todas, `${p.id}: ${t}`).toContain(t);
    }
  });

  it('a governadora vê três telas; o operador, todas; sem perfil, todas', () => {
    expect(telasDoPerfil('governadora')).toEqual(['sala', 'gestao', 'cidadao']);
    expect(telasDoPerfil('operador')).toHaveLength(TELAS.length);
    expect(telasDoPerfil(null)).toHaveLength(TELAS.length);
  });

  it('o que não é perfil vira "ninguém escolheu"; o órgão só vale para o gestor e se existir', () => {
    expect(escolhaDe('prefeito', 'caesb')).toEqual({ perfil: null, orgao: null });
    expect(escolhaDe(null, null)).toEqual({ perfil: null, orgao: null });
    expect(escolhaDe('gestor', 'caesb')).toEqual({ perfil: 'gestor', orgao: 'caesb' });
    expect(escolhaDe('gestor', 'nao-existe')).toEqual({ perfil: 'gestor', orgao: null });
    expect(escolhaDe('governadora', 'caesb')).toEqual({ perfil: 'governadora', orgao: null });
  });

  it('quem entra vai para a sua primeira tela; o gestor, para o órgão dele', () => {
    expect(entradaDoPerfil(escolhaDe('governadora', null))).toBe('/sala');
    expect(entradaDoPerfil(escolhaDe('gestor', 'caesb'))).toBe('/gestao?orgao=caesb');
    expect(entradaDoPerfil(escolhaDe('gestor', null))).toBe('/gestao');
  });
});

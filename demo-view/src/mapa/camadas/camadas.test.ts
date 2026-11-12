import { describe, expect, it } from 'vitest';
import { gerarBase } from '../../dados/gerador';
import { chamadosPorRa } from '../../indicadores/indicadores';
import { ESCALA_CONCENTRACAO } from '../../ui/tokens';
import { anelAtivo, camadasDeChamados, camadasDeContexto, camadasDePulsos, corNaEscala, DURACAO_ANEL, MODOS, textoDaDica } from './index';

const base = gerarBase({ agora: Date.UTC(2026, 10, 12, 18, 30), dias: 28, diasDetalhados: 7 });
const estado = { filtrados: base.incidentes, porRa: chamadosPorRa(base.incidentes), raSelecionada: null, discreto: false };

describe('camadas do mapa', () => {
  it('cada modo desenha a sua camada, por baixo dos nomes das RAs', () => {
    for (const m of MODOS) {
      const [camada] = camadasDeChamados({ ...estado, modo: m.id });
      expect(camada?.id).toBe(m.id);
      expect((camada?.props as { beforeId?: string }).beforeId).toBe('ras-rotulos');
    }
  });

  it('a escala de cor vai do primeiro ao último tom, sem sair dela', () => {
    expect(corNaEscala(0)).toEqual(ESCALA_CONCENTRACAO[0]);
    expect(corNaEscala(1)).toEqual(ESCALA_CONCENTRACAO[ESCALA_CONCENTRACAO.length - 1]);
    expect(corNaEscala(-3)).toEqual(corNaEscala(0));
    expect(corNaEscala(0.5).every((c) => c >= 0 && c <= 255)).toBe(true);
  });

  it('o contexto real só aparece quando ligado e carregado', () => {
    expect(camadasDeContexto(null, new Set(['saude']))).toEqual([]);
  });

  it('o anel de quem chegou dura pouco e depois some', () => {
    const c = { id: 'x', posicao: [-47.9, -15.8] as [number, number], em: 1000 };
    expect(anelAtivo(1000 + DURACAO_ANEL / 2, c)).toBe(true);
    expect(anelAtivo(1000 + DURACAO_ANEL + 1, c)).toBe(false);
    expect(camadasDePulsos([c], 1000 + DURACAO_ANEL + 1).find((l) => l.id === 'chegadas-anel')?.props.data).toEqual([]);
    expect(camadasDePulsos([], 0)).toEqual([]);
  });

  it('a dica diz o que é cada coisa, e escapa os nomes', () => {
    expect(textoDaDica('hexagonos', { colorValue: 1 })).toContain('1</strong> chamado neste');
    expect(textoDaDica('saude', [-47.9, -15.8, 'Hran', 'Hospital', null])).toContain('dado real');
    expect(textoDaDica('favelas', { properties: { nome: '<b>Sol</b>' } })).toContain('&lt;b&gt;Sol');
    expect(textoDaDica('nada', {})).toBeNull();
  });
});

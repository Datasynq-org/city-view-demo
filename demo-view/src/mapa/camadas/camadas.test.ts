import { describe, expect, it } from 'vitest';
import { gerarBase } from '../../dados/gerador';
import { chamadosPorRa } from '../../indicadores/indicadores';
import { ESCALA_CONCENTRACAO } from '../../ui/tokens';
import { anelAtivo, camadasDeChamados, camadasDeContexto, camadasDePulsos, corNaEscala, DURACAO_ANEL, MARCADAS, MODO_INICIAL, MODOS, textoDaDica } from './index';

const base = gerarBase({ agora: Date.UTC(2026, 10, 12, 18, 30), dias: 28, diasDetalhados: 7 });
const estado = { filtrados: base.incidentes, porRa: chamadosPorRa(base.incidentes), raSelecionada: null, discreto: false };

describe('camadas do mapa', () => {
  it('hexágonos e regiões desenham a sua camada, por baixo dos nomes das RAs', () => {
    for (const modo of ['hexagonos', 'regioes'] as const) {
      const [camada] = camadasDeChamados({ ...estado, modo });
      expect(camada?.id).toBe(modo);
      expect((camada?.props as { beforeId?: string }).beforeId).toBe('ras-rotulos');
    }
  });

  it('o calor abre a tela e não é camada do deck.gl: quem desenha é o MapLibre', () => {
    expect(MODO_INICIAL).toBe('calor');
    expect(MODOS[0]?.id).toBe('calor');
    expect(camadasDeChamados({ ...estado, modo: 'calor' })).toEqual([]);
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

  it('só as chegadas mais recentes ficam marcadas, em pixels, da mais nova à mais antiga', () => {
    const chegadas = Array.from({ length: 8 }, (_, k) => ({ id: `c${k}`, posicao: [-47.9, -15.8] as [number, number], em: k * 5000 }));
    const pontos = camadasDePulsos(chegadas, 1e9).find((l) => l.id === 'chegadas')!;
    const dados = pontos.props.data as { id: string }[];
    expect(dados.map((d) => d.id)).toEqual(['c7', 'c6', 'c5']);
    expect(dados).toHaveLength(MARCADAS);
    // Em pixels: de perto, o ponto não vira uma bola do tamanho de um quarteirão.
    expect((pontos.props as { radiusUnits?: string }).radiusUnits).toBe('pixels');
    expect(camadasDePulsos(chegadas, 1e9).some((l) => l.id === 'chegadas-halo')).toBe(false);
  });

  it('a dica diz o que é cada coisa, e escapa os nomes', () => {
    expect(textoDaDica('hexagonos', { colorValue: 1 })).toContain('1</strong> chamado neste');
    expect(textoDaDica('saude', [-47.9, -15.8, 'Hran', 'Hospital', null])).toContain('dado real');
    expect(textoDaDica('favelas', { properties: { nome: '<b>Sol</b>' } })).toContain('&lt;b&gt;Sol');
    expect(textoDaDica('chegadas', { rotulo: 'Falta de energia · Ceilândia' })).toContain('acabou de chegar');
    expect(textoDaDica('chegadas', { rotulo: 'Falta de energia · Ceilândia' })).toContain('Falta de energia · Ceilândia');
    expect(textoDaDica('nada', {})).toBeNull();
  });
});

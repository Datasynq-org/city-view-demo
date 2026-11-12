import { describe, expect, it } from 'vitest';
import { avancar, BOAS_VINDAS, confirmado, CORRIGIR_LOCAL, type Entrada, type EstadoDaColeta, inicial, normalizar, PARA_ATENDIMENTO_HUMANO, PERGUNTAS, triar } from './coleta';

const LOCAL: [number, number] = [-48.0262, -15.8402];

/** Manda uma sequência de entradas e devolve o estado final e todas as falas. */
function conversa(entradas: Entrada[], estado: EstadoDaColeta = inicial()) {
  const falas: string[] = [];
  for (const e of entradas) {
    const r = avancar(estado, e);
    estado = r.estado;
    falas.push(...r.respostas);
  }
  return { estado, falas };
}

const ATE_O_RESUMO: Entrada[] = [
  { texto: 'oi' },
  { texto: '1' },
  { texto: 'Marina' },
  { texto: '4' },
  { texto: 'Poste apagado há uma semana, a rua fica toda escura.' },
  { local: LOCAL },
  { texto: 'SIM' },
  { texto: 'Em frente à padaria' },
  { foto: true },
];

describe('coleta guiada (roteiro do dfac)', () => {
  it('pergunta na ordem do assistente de Águas Claras', () => {
    const { falas, estado } = conversa(ATE_O_RESUMO);
    expect(falas.slice(0, 8)).toEqual([BOAS_VINDAS, PERGUNTAS.nome, PERGUNTAS.tipo, PERGUNTAS.descricao, PERGUNTAS.local, PERGUNTAS.confirmaLocal, PERGUNTAS.referencia, PERGUNTAS.foto]);
    expect(estado.etapa).toBe('resumo');
    expect(falas.at(-1)).toContain('Confira os dados:');
    expect(falas.at(-1)).toContain('Tipo de problema: Iluminação');
    expect(falas.at(-1)).toContain('-15.84020, -48.02620 (local do fato confirmado)');
  });

  it('CONFIRMAR gera o código de teste e explica que ainda não há protocolo', () => {
    const { estado, falas } = conversa([...ATE_O_RESUMO, { texto: 'confirmar' }]);
    expect(estado.etapa).toBe('concluido');
    expect(estado.codigo).toBe('TESTE-0000001');
    expect(falas.at(-1)).toBe(confirmado('TESTE-0000001'));
  });

  it('descrição curta demais é pedida de novo', () => {
    const { estado, falas } = conversa([{ texto: 'oi' }, { texto: '1' }, { texto: 'Ana' }, { texto: '3' }, { texto: 'buraco' }]);
    expect(estado.etapa).toBe('descricao');
    expect(falas.at(-1)).toBe(PERGUNTAS.descricao);
  });

  it('"Outros" pede o detalhe do tipo', () => {
    const { estado } = conversa([{ texto: 'oi' }, { texto: '1' }, { texto: 'Ana' }, { texto: '5' }]);
    expect(estado.etapa).toBe('outros');
  });

  it('NÃO na conferência e CORRIGIR LOCAL pedem o local de novo', () => {
    const nao = conversa([...ATE_O_RESUMO.slice(0, 6), { texto: 'não' }]);
    expect(nao.estado.etapa).toBe('local');
    expect(nao.falas.at(-1)).toBe(CORRIGIR_LOCAL);
    const corrigir = conversa([...ATE_O_RESUMO, { texto: 'CORRIGIR LOCAL' }, { local: LOCAL }, { texto: 'sim' }]);
    expect(corrigir.estado.etapa).toBe('resumo');
  });

  it('CORRIGIR RELATO pede só a descrição e volta ao resumo', () => {
    const { estado, falas } = conversa([...ATE_O_RESUMO, { texto: 'corrigir relato' }, { texto: 'Dois postes apagados na quadra 107.' }]);
    expect(estado.etapa).toBe('resumo');
    expect(falas.at(-1)).toContain('Descrição: Dois postes apagados na quadra 107.');
  });

  it('CANCELAR passa para uma pessoa da equipe, em qualquer passo', () => {
    const { estado, falas } = conversa([...ATE_O_RESUMO.slice(0, 4), { texto: 'Cancelar' }]);
    expect(estado.etapa).toBe('humano');
    expect(falas.at(-1)).toBe(PARA_ATENDIMENTO_HUMANO);
  });

  it('normaliza como o dfac', () => {
    expect(normalizar('  Não!  ')).toBe('nao');
    expect(normalizar('CORRIGIR   Relato.')).toBe('corrigir relato');
  });
});

describe('triagem por palavras (dfac)', () => {
  it('poste apagado vai para a iluminação, pelo Participa DF', () => {
    expect(triar('O poste está apagado e a rua fica escura')).toMatchObject({ atividade: 'ILUMINAÇÃO PÚBLICA', destino: 'participadf' });
  });

  it('buraco vai ao Portal do Cidadão; água e esgoto ficam sem destino automático', () => {
    expect(triar('Abriu uma cratera, um buraco enorme')).toMatchObject({ atividade: 'TAPA BURACO', destino: 'portal-cidadao' });
    expect(triar('Vazamento de água potável no meio da rua')).toMatchObject({ atividade: 'GALERIA DE ÁGUA POTÁVEL', destino: 'sem-destino' });
  });

  it('empate fica com a primeira atividade da lista, como no dfac', () => {
    // "calçada" e "vazamento de água" valem um termo cada; calçada vem antes.
    expect(triar('Vazamento de água na calçada').atividade).toBe('CALÇADA');
  });

  it('sem palavra conhecida, não chuta: fica para a pessoa da revisão', () => {
    expect(triar('Barulho de festa todo fim de semana')).toEqual({ atividade: null, termos: [], destino: 'sem-destino' });
  });
});

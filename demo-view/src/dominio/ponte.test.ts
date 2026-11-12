import { describe, expect, it } from 'vitest';
import { CAMADAS, type EstadoDfac, PECA_POR_ID, ROTULO_DFAC, SITUACAO_DO_DFAC, situacoesDoCaminho } from './ponte';

describe('as camadas da ponte', () => {
  it('são as cinco, em ordem, sem peça repetida', () => {
    expect(CAMADAS.map((c) => c.numero)).toEqual([1, 2, 3, 4, 5]);
    const ids = CAMADAS.flatMap((c) => c.pecas.map((p) => p.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('toda peça que "existe" ou está "pronta" diz de onde vem', () => {
    for (const c of CAMADAS) for (const p of c.pecas) expect(p.fonte.length, p.id).toBeGreaterThan(4);
  });

  it('respeita os cuidados de fala do CV-REF-002', () => {
    expect(PECA_POR_ID.instagram!.situacao).not.toBe('existe');
    expect(PECA_POR_ID.iluminadf!.situacao).toBe('pronto');
    expect(PECA_POR_ID.coleta!.nota).toMatch(/sem IA/);
    expect(PECA_POR_ID.incidente!.situacao).toBe('proposta');
  });

  it('a demanda pode nascer num canal do City View ou no sistema que o órgão já tem', () => {
    const grupos = [...new Set(CAMADAS[0]!.pecas.map((p) => p.grupo))];
    expect(grupos).toEqual(['Canais do City View', 'Sistemas que os órgãos já têm']);
    const doOrgao = CAMADAS[0]!.pecas.filter((p) => p.situacao === 'orgao');
    expect(doOrgao.length).toBeGreaterThanOrEqual(6);
    expect(doOrgao.every((p) => p.id.startsWith('origem-'))).toBe(true);
    // Só a camada 1 tem sistemas alheios: dali para frente é City View.
    expect(CAMADAS.slice(1).flatMap((c) => c.pecas).some((p) => p.situacao === 'orgao')).toBe(false);
  });
});

describe('os estados do dfac no modelo único', () => {
  it('todo estado do dfac tem rótulo para o cidadão', () => {
    expect(Object.keys(ROTULO_DFAC)).toHaveLength(14);
  });

  it('o caminho feliz do dfac é um caminho válido no modelo único', () => {
    const caminho: Exclude<EstadoDfac, 'duplicate'>[] = ['received', 'triaging', 'ready_for_review', 'in_review', 'approved', 'queued', 'sending', 'submitted', 'tracking', 'resolved', 'closed'];
    expect(situacoesDoCaminho(caminho)).toEqual(['recebido', 'em-triagem', 'encaminhado', 'em-atendimento', 'resolvido', 'encerrado']);
  });

  it('a falha de envio volta a encaminhado, e a reprovação cancela', () => {
    expect(situacoesDoCaminho(['received', 'in_review', 'submission_failed', 'submitted'])).toEqual(['recebido', 'em-triagem', 'falha-de-envio', 'encaminhado']);
    expect(situacoesDoCaminho(['received', 'in_review', 'rejected'])).toEqual(['recebido', 'em-triagem', 'cancelado']);
  });

  it('um caminho que pula etapas do modelo é recusado', () => {
    expect(situacoesDoCaminho(['received', 'resolved'])).toBeNull();
  });

  it('todos os estados (menos duplicada) têm correspondente', () => {
    expect(Object.keys(SITUACAO_DO_DFAC)).toHaveLength(13);
  });
});

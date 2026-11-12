import { describe, expect, it } from 'vitest';
import {
  contarPorSituacao,
  estaAberto,
  formatarId,
  idValido,
  type Incidente,
  podeTransitar,
  SITUACOES,
  type Situacao,
  TRANSICOES,
  validarIncidente,
} from './incidente';

const T0 = Date.UTC(2026, 10, 10, 12);
const HORA = 3_600_000;

const incidente = (mudancas: Partial<Incidente> = {}): Incidente => ({
  id: 'INC-2026-000123',
  origem: { canalId: '190' },
  local: { lon: -48.1077, lat: -15.8174, raId: 'ceilandia' },
  tipoId: 'sossego',
  area: 'seguranca',
  orgaoId: 'pmdf',
  situacao: 'encaminhado',
  severidade: 'atencao',
  criadoEm: T0,
  encaminhadoEm: T0 + HORA,
  vinculos: [],
  ...mudancas,
});

describe('ciclo de vida', () => {
  it('permite o caminho do magno, passo a passo', () => {
    const caminho: Situacao[] = ['recebido', 'em-triagem', 'encaminhado', 'em-atendimento', 'resolvido', 'encerrado'];
    for (let i = 0; i + 1 < caminho.length; i++) expect(podeTransitar(caminho[i]!, caminho[i + 1]!)).toBe(true);
  });

  it('proíbe saltos e a volta', () => {
    expect(podeTransitar('recebido', 'resolvido')).toBe(false);
    expect(podeTransitar('recebido', 'encaminhado')).toBe(false);
    expect(podeTransitar('em-atendimento', 'encerrado')).toBe(false);
    expect(podeTransitar('encaminhado', 'recebido')).toBe(false);
  });

  it('não deixa sair de encerrado nem de cancelado', () => {
    expect(TRANSICOES.encerrado).toEqual([]);
    expect(TRANSICOES.cancelado).toEqual([]);
  });

  it('só falha o envio a partir da triagem e só reabre o que foi resolvido', () => {
    const chegamEm = (alvo: Situacao) => SITUACOES.filter((de) => podeTransitar(de, alvo));
    expect(chegamEm('falha-de-envio')).toEqual(['em-triagem']);
    expect(chegamEm('reaberto')).toEqual(['resolvido']);
    expect(podeTransitar('falha-de-envio', 'encaminhado')).toBe(true);
    expect(podeTransitar('reaberto', 'em-atendimento')).toBe(true);
  });

  it('cobre as nove situações, e toda transição leva a uma situação conhecida', () => {
    expect(SITUACOES).toHaveLength(9);
    expect(Object.keys(TRANSICOES).sort()).toEqual([...SITUACOES].sort());
    for (const destinos of Object.values(TRANSICOES)) for (const d of destinos) expect(SITUACOES).toContain(d);
  });

  it('considera aberto tudo menos resolvido, encerrado e cancelado', () => {
    expect(SITUACOES.filter(estaAberto)).toEqual(['recebido', 'em-triagem', 'encaminhado', 'em-atendimento', 'falha-de-envio', 'reaberto']);
  });
});

describe('id', () => {
  it('segue o formato INC-ano-sequencial', () => {
    expect(formatarId(2026, 123)).toBe('INC-2026-000123');
    expect(formatarId(2026, 999_999)).toBe('INC-2026-999999');
    expect(idValido('INC-2026-000123')).toBe(true);
  });

  it('recusa sequencial fora de 1 a 999999', () => {
    expect(() => formatarId(2026, 0)).toThrow(RangeError);
    expect(() => formatarId(2026, 1_000_000)).toThrow(RangeError);
    expect(() => formatarId(2026, 1.5)).toThrow(RangeError);
  });

  it('recusa ids fora do formato', () => {
    for (const id of ['INC-2026-123', 'INC-26-000123', 'inc-2026-000123', 'INC-2026-0001234', '']) {
      expect(idValido(id), id).toBe(false);
    }
  });
});

describe('validarIncidente', () => {
  it('aceita um incidente coerente', () => {
    expect(validarIncidente(incidente())).toEqual([]);
    expect(validarIncidente(incidente({ situacao: 'resolvido', resolvidoEm: T0 + 2 * HORA }))).toEqual([]);
    expect(validarIncidente(incidente({ situacao: 'recebido', encaminhadoEm: undefined }))).toEqual([]);
  });

  it('acusa datas fora de ordem', () => {
    expect(validarIncidente(incidente({ encaminhadoEm: T0 - 1 }))).toContain('encaminhado antes de criado');
    expect(validarIncidente(incidente({ situacao: 'resolvido', resolvidoEm: T0 + HORA - 1 }))).toContain(
      'resolvido antes de encaminhado',
    );
  });

  it('acusa data de resolução que não combina com a situação', () => {
    expect(validarIncidente(incidente({ situacao: 'encerrado' }))).toContain('encerrado sem data de resolução');
    expect(validarIncidente(incidente({ situacao: 'reaberto', resolvidoEm: T0 + 2 * HORA }))).toContain(
      'reaberto com data de resolução',
    );
  });

  it('acusa tipo, órgão, área, canal e RA que não batem com o catálogo', () => {
    expect(validarIncidente(incidente({ tipoId: 'nao-existe' }))).toHaveLength(1);
    expect(validarIncidente(incidente({ orgaoId: 'caesb' }))).toHaveLength(1);
    expect(validarIncidente(incidente({ area: 'energia' }))).toHaveLength(1);
    expect(validarIncidente(incidente({ origem: { canalId: '999' } }))).toHaveLength(1);
    expect(validarIncidente(incidente({ local: { lon: 0, lat: 0, raId: 'atlantida' } }))).toHaveLength(1);
    expect(validarIncidente(incidente({ id: 'INC-1' }))).toHaveLength(1);
  });
});

describe('contarPorSituacao', () => {
  it('conta cada situação e devolve zero onde não há incidente', () => {
    const contagem = contarPorSituacao([
      incidente(),
      incidente(),
      incidente({ situacao: 'resolvido', resolvidoEm: T0 + 2 * HORA }),
    ]);
    expect(contagem.encaminhado).toBe(2);
    expect(contagem.resolvido).toBe(1);
    expect(Object.keys(contagem).sort()).toEqual([...SITUACOES].sort());
    expect(Object.values(contagem).reduce((s, n) => s + n, 0)).toBe(3);
    expect(contarPorSituacao([]).recebido).toBe(0);
  });
});

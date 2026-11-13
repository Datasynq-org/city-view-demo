import { describe, expect, it } from 'vitest';
import { camposInesperados, consertarAcentos, dataDoSite, type DemandaDoSite, limparDemanda, limparTexto, montarArquivo, pontoDe } from './limpar';

const base: DemandaDoSite = {
  id: '1127',
  tipo: 'Obras / Manutenção',
  descricao: '2 novos buracos na Rua 19 Sul.',
  latitude: '-15.84422687',
  longitude: '-48.02514',
  bairro: null,
  endereco: 'R. 19 Sul, Águas Claras',
  imagem: '/storage/uploads/abc.jpg',
  status: 'encaminhado',
  autorizacao: 'aprovado',
  protocolo: 'DF2026001127',
  created_at: '2026-09-21 15:34:59',
  orgao_nome: 'NOVACAP',
};

describe('limpeza do texto dos cidadãos', () => {
  it('tira telefone, em vários formatos', () => {
    for (const t of ['(61) 99999-1234', '61 99999 1234', '61999991234', '9999-1234', '+55 61 99999-1234', '3333-4444']) {
      const r = limparTexto(`Favor ligar ${t} para combinar.`);
      expect(r.texto, t).toBe('Favor ligar [telefone retirado] para combinar.');
      expect(r.retirado.telefone, t).toBe(1);
    }
  });

  it('tira e-mail, CPF e placa', () => {
    const r = limparTexto('Sou fulano@exemplo.com.br, CPF 123.456.789-09. O carro ABC-1234 e o BRA2E19 estão abandonados.');
    expect(r.texto).toBe('Sou [email retirado], CPF [cpf retirado]. O carro [placa retirado] e o [placa retirado] estão abandonados.');
    expect(r.retirado).toEqual({ telefone: 0, email: 1, cpf: 1, placa: 2 });
  });

  it('não mexe em endereço, quantidade, data e protocolo', () => {
    for (const t of ['2 novos buracos na Rua 19 Sul.', 'Quadra 301, lote 5, em frente ao bloco B', 'Desde 12/11/2026 sem luz', 'Poste 12 apagado há 3 semanas', 'Protocolo DF2026001127', 'Avenida das Araucárias 1835']) {
      expect(limparTexto(t).texto, t).toBe(t);
    }
  });

  it('junta espaços e quebras de linha', () => {
    expect(limparTexto('  Buraco\n\n na   via  ').texto).toBe('Buraco na via');
  });
});

describe('demanda do site → demanda da demo', () => {
  it('guarda só o que a demo usa; a foto vira sim ou não', () => {
    const r = limparDemanda(base)!;
    expect(r.demanda).toEqual({
      id: '1127',
      protocolo: 'DF2026001127',
      tipo: 'Obras / Manutenção',
      descricao: '2 novos buracos na Rua 19 Sul.',
      bairro: null,
      endereco: 'R. 19 Sul, Águas Claras',
      ponto: [-48.02514, -15.84422687],
      status: 'encaminhado',
      orgao: 'NOVACAP',
      criadaEm: '2026-09-21T15:34:59-03:00',
      comFoto: true,
    });
    expect(JSON.stringify(r.demanda)).not.toContain('storage');
  });

  it('foto em lista também conta; lista vazia, não', () => {
    expect(limparDemanda({ ...base, imagem: ['/a.jpg', '/b.jpg'] })!.demanda.comFoto).toBe(true);
    expect(limparDemanda({ ...base, imagem: '[]' })!.demanda.comFoto).toBe(false);
    expect(limparDemanda({ ...base, imagem: null })!.demanda.comFoto).toBe(false);
  });

  it('fica de fora o que não foi aprovado, o que não tem data e o status que a demo não conhece', () => {
    expect(limparDemanda({ ...base, autorizacao: 'pendente' })).toBeNull();
    expect(limparDemanda({ ...base, created_at: null })).toBeNull();
    expect(limparDemanda({ ...base, status: 'arquivado' })).toBeNull();
  });

  it('ponto fora do DF, zerado ou vazio fica sem ponto, mas a demanda entra', () => {
    expect(pontoDe('0', '0')).toBeNull();
    expect(pontoDe('-23.5', '-46.6')).toBeNull();
    expect(pontoDe(null, '')).toBeNull();
    expect(pontoDe('-15.84', '-48.02')).toEqual([-48.02, -15.84]);
    expect(limparDemanda({ ...base, latitude: '0', longitude: '0' })!.demanda.ponto).toBeNull();
  });

  it('a data do site é a hora de Brasília', () => {
    expect(new Date(dataDoSite('2026-09-21 15:34:59')).toISOString()).toBe('2026-09-21T18:34:59.000Z');
  });
});

describe('acentos quebrados do site', () => {
  it('conserta o que é UTF-8 lido como Latin-1 e não mexe no resto', () => {
    expect(consertarAcentos('Avenida Parque \u00c3\u0081guas Claras')).toBe('Avenida Parque Águas Claras');
    expect(consertarAcentos('Avenida Jacarand\u00c3\u00a1')).toBe('Avenida Jacarandá');
    expect(consertarAcentos('Avenida das Araucárias')).toBe('Avenida das Araucárias');
    expect(consertarAcentos('SÃO PAULO')).toBe('SÃO PAULO');
    expect(limparDemanda({ ...base, bairro: 'Avenida Jacarand\u00c3\u00a1' })!.demanda.bairro).toBe('Avenida Jacarandá');
  });
});

describe('o arquivo', () => {
  it('avisa de campo que não era esperado', () => {
    expect(camposInesperados([{ ...base }])).toEqual([]);
    expect(camposInesperados([{ ...base, autor_nome: 'x', autor_telefone: 'y' }])).toEqual(['autor_nome', 'autor_telefone']);
  });

  it('ordena por data, soma o que foi retirado e conta quem ficou sem ponto', () => {
    const a = montarArquivo(
      [
        { ...base, id: 2, created_at: '2026-10-01 10:00:00', descricao: 'Ligar 61 99999-1234' },
        { ...base, id: 1, created_at: '2025-01-01 10:00:00', latitude: null },
        { ...base, id: 3, autorizacao: 'recusado' },
      ],
      'fonte',
      '2026-11-13T00:00:00Z',
    );
    expect(a.demandas.map((d) => d.id)).toEqual(['1', '2']);
    expect(a.retirado.telefone).toBe(1);
    expect(a.foraDoDf).toBe(1);
  });
});

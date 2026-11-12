import { describe, expect, it } from 'vitest';
import { podeTransitar } from '../dominio/incidente';
import { CAMADA_DA_PECA, PECA_POR_ID } from '../dominio/ponte';
import { dentroDaRegiao, REGIAO_POR_ID } from '../dominio/ras';
import { avancar, inicial } from './coleta';
import { conversar, JORNADAS, jornadaDoRelato, situacaoDoPasso } from './jornadas';

describe('jornadas roteirizadas', () => {
  it('são duas: o poste (o que existe) e o apagão (a proposta)', () => {
    expect(JORNADAS.map((j) => j.id)).toEqual(['poste', 'apagao']);
  });

  it('todo passo ilumina uma peça que existe na ponte', () => {
    for (const j of JORNADAS) for (const p of j.passos) expect(PECA_POR_ID[p.peca], `${j.id}/${p.id}`).toBeDefined();
  });

  it('toda jornada começa no canal do cidadão e chega ao incidente único', () => {
    for (const j of JORNADAS) {
      const camadas = j.passos.map((p) => CAMADA_DA_PECA[p.peca]!);
      expect(camadas[0], j.id).toBe(1);
      expect(Math.max(...camadas), j.id).toBeGreaterThanOrEqual(4);
    }
  });

  it('o estado do incidente só muda por passagens que o modelo permite', () => {
    for (const j of JORNADAS) {
      const seq = j.passos.map((p) => p.situacao).filter((s) => s !== undefined);
      for (let k = 1; k < seq.length; k++) if (seq[k] !== seq[k - 1]) expect(podeTransitar(seq[k - 1]!, seq[k]!), `${j.id}: ${seq[k - 1]} → ${seq[k]}`).toBe(true);
    }
  });

  it('o local de cada relato cai na RA do caso', () => {
    for (const j of JORNADAS) expect(dentroDaRegiao(REGIAO_POR_ID[j.ra]!, j.local[0], j.local[1]), j.id).toBe(true);
  });

  it('o caso do poste vai do WhatsApp ao resolvido, passando pela CEB', () => {
    const poste = JORNADAS[0]!;
    expect(poste.passos.map((p) => p.id)).toEqual(['canal', 'coleta', 'triagem', 'revisao', 'ceb', 'protocolo', 'acompanhamento', 'resolvido', 'incidente', 'saidas']);
    expect(poste.passos.find((p) => p.id === 'triagem')!.painel).toMatchObject({ tipo: 'triagem', triagem: { destino: 'participadf' } });
    expect(poste.passos.at(-3)!.situacao).toBe('resolvido');
  });

  it('o que vem depois do protocolo no apagão é proposta, e o texto de proposta vem marcado', () => {
    const apagao = JORNADAS[1]!;
    const depois = apagao.passos.slice(apagao.passos.findIndex((p) => p.id === 'protocolo') + 1);
    expect(depois.every((p) => situacaoDoPasso(p) === 'proposta')).toBe(true);
    const falasNovas = depois.flatMap((p) => p.mensagens).filter((m) => m.de === 'assistente');
    expect(falasNovas.every((m) => m.proposta)).toBe(true);
  });

  it('todo protocolo mostrado é marcado como fictício', () => {
    for (const j of JORNADAS)
      for (const p of j.passos) if (p.painel.tipo === 'envio') expect(p.painel.protocolo[1], `${j.id}/${p.id}`).toMatch(/fictício/);
  });
});

describe('experimente', () => {
  it('a conversa gerada intercala cidadão e assistente, com local e foto como anexos', () => {
    const { mensagens } = conversar([{ texto: 'oi' }, { texto: '1' }]);
    expect(mensagens.map((m) => m.de)).toEqual(['cidadao', 'assistente', 'cidadao', 'assistente']);
    const anexos = conversar([{ local: [-48, -15.8] }, { foto: true }]).mensagens.filter((m) => m.anexo);
    expect(anexos.map((m) => m.anexo)).toEqual(['local', 'foto']);
  });

  it('com o relato digitado, a jornada segue e nunca diz que enviou', () => {
    let e = inicial();
    for (const x of [{ texto: 'oi' }, { texto: '1' }, { texto: 'Ana' }, { texto: '3' }, { texto: 'Um buraco enorme no meio da pista' }, { local: [-48.0, -15.8] as [number, number] }, { texto: 'sim' }, { texto: 'esquina' }, { foto: true }, { texto: 'confirmar' }]) e = avancar(e, x).estado;
    const j = jornadaDoRelato(e, []);
    expect(j.passos.find((p) => p.id === 'triagem')!.painel).toMatchObject({ triagem: { atividade: 'TAPA BURACO', destino: 'portal-cidadao' } });
    const protocolo = j.passos.find((p) => p.id === 'protocolo')!;
    expect(protocolo.titulo).toMatch(/simulado/);
    expect(JSON.stringify(protocolo.painel)).toMatch(/nada é enviado/);
  });
});

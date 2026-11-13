import { describe, expect, it } from 'vitest';
import { agrupar, calcularLigacoes, gerarChamados } from './agrupamento';
import { CASOS, fonteDoSinal } from './casos';
import { type Andamentos, avancarRoteiro, dispensar, esperaRevisao, iniciar, protocoloFicticio, redirecionar, responder, respostasPossiveis, ROTEIRO, situacaoDoIncidente } from './encaminhamento';
import { mensagensAoCidadao, planoDe, responsavelDe, viaDoOrgao } from './plano';

const chamados = gerarChamados();
const r = agrupar(chamados, calcularLigacoes(chamados));
const doCaso = (id: string) => r.incidentes.find((i) => i.casoId === id)!;

describe('plano de envio', () => {
  it('todo caso tem um responsável, e só um', () => {
    for (const c of CASOS) expect(c.encaminhamentos.filter((e) => e.papel === 'responsável'), c.id).toHaveLength(1);
  });

  it('todo órgão que recebeu chamados está no plano; ninguém aparece duas vezes', () => {
    for (const c of CASOS) {
      const noPlano = c.encaminhamentos.map((e) => e.orgaoId);
      expect(new Set(noPlano).size, c.id).toBe(noPlano.length);
      for (const s of c.sinais) if (fonteDoSinal(s) === 'chamado') expect(noPlano, `${c.id}: ${s.orgaoId}`).toContain(s.orgaoId);
    }
  });

  it('quem age tem prazo; quem só é avisado, não', () => {
    for (const e of CASOS.flatMap((c) => c.encaminhamentos)) {
      if (e.papel === 'avisado') expect(e.prazoH).toBe(0);
      else expect(e.prazoH).toBeGreaterThan(0);
    }
  });

  it('o plano do incidente vem do caso, com o responsável na frente e o motivo de cada órgão', () => {
    const plano = planoDe(doCaso('apagao-planaltina'));
    expect(plano[0]!.papel).toBe('responsável');
    expect(plano[0]!.orgaoId).toBe('neoenergia');
    expect(plano[0]!.motivo).toMatch(/chamados/);
    // A Novacap não recebeu chamado: entra porque a solução passa por ela.
    expect(plano.find((p) => p.orgaoId === 'novacap')!.motivo).toMatch(/solução/);
  });

  it('não inventa integração: só a CEB IPes tem conector pronto; o resto é proposta', () => {
    expect(viaDoOrgao('ceb-ipes').situacao).toBe('pronto');
    expect(viaDoOrgao('neoenergia').situacao).toBe('proposta');
    expect(viaDoOrgao('defesa-civil').situacao).toBe('proposta');
  });

  it('grupo sem caso escrito: quem recebeu mais chamados assume', () => {
    const solto = r.incidentes.find((i) => !i.casoId);
    if (!solto) return;
    const plano = planoDe(solto);
    expect(responsavelDe(plano)).toBeDefined();
    expect(plano.filter((p) => p.papel === 'responsável')).toHaveLength(1);
  });

  it('a mensagem ao cidadão nomeia o responsável e não pede para ligar de novo', () => {
    const inc = doCaso('apagao-planaltina');
    const m = mensagensAoCidadao(inc, planoDe(inc));
    expect(m.aoAssumir).toMatch(/Neoenergia/);
    expect(m.aoAssumir).toMatch(/não precisa ligar de novo/);
    expect(m.aoResolver).toMatch(/^Resolvido/);
  });
});

describe('ida e volta com os órgãos', () => {
  const inc = doCaso('apagao-planaltina');
  const plano = planoDe(inc);
  const inicio = () => iniciar({}, inc.codigo, plano, 1000);

  it('confirmado, sai um pedido para cada órgão, e cada envio vai para o registro', () => {
    const { andamentos, linhas } = inicio();
    expect(andamentos[inc.codigo]!.trilhas.map((t) => t.passo)).toEqual(plano.map(() => 'enviado'));
    expect(linhas).toHaveLength(plano.length);
    expect(situacaoDoIncidente(andamentos[inc.codigo]!)).toBe('encaminhado');
    // Iniciar de novo não duplica.
    expect(iniciar(andamentos, inc.codigo, plano, 2000).andamentos).toBe(andamentos);
  });

  it('o órgão responde em ordem: recebe (com protocolo), assume, resolve', () => {
    let a: Andamentos = inicio().andamentos;
    // Fora de ordem não muda nada.
    expect(responder(a, inc.codigo, 'neoenergia', 'assumido', 1100).andamentos).toBe(a);
    a = responder(a, inc.codigo, 'neoenergia', 'recebido', 1200).andamentos;
    const t = a[inc.codigo]!.trilhas[0]!;
    expect(t.passo).toBe('recebido');
    expect(t.protocolo).toBe(protocoloFicticio(inc.codigo, 'neoenergia'));
    expect(respostasPossiveis(t)).toEqual(['assumido', 'devolvido', 'resolvido']);
    a = responder(a, inc.codigo, 'neoenergia', 'assumido', 1300).andamentos;
    expect(situacaoDoIncidente(a[inc.codigo]!)).toBe('em atendimento');
  });

  it('só fecha quando todos os que agem resolveram, e o fecho vai para o registro', () => {
    let a: Andamentos = inicio().andamentos;
    let ultimas: string[] = [];
    for (const p of plano) {
      a = responder(a, inc.codigo, p.orgaoId, 'recebido', 2000).andamentos;
      a = responder(a, inc.codigo, p.orgaoId, 'assumido', 3000).andamentos;
    }
    plano.forEach((p, k) => {
      expect(situacaoDoIncidente(a[inc.codigo]!)).toBe('em atendimento');
      const res = responder(a, inc.codigo, p.orgaoId, 'resolvido', 4000 + k);
      a = res.andamentos;
      ultimas = res.linhas.map((l) => l.oQue);
    });
    expect(situacaoDoIncidente(a[inc.codigo]!)).toBe('resolvido');
    expect(ultimas.at(-1)).toMatch(/avisou os cidadãos/);
  });

  it('quem devolve manda o pedido de volta: quem revisa redireciona ou dispensa', () => {
    let a: Andamentos = inicio().andamentos;
    a = responder(a, inc.codigo, 'novacap', 'recebido', 2000).andamentos;
    const dev = responder(a, inc.codigo, 'novacap', 'devolvido', 3000, 'Não é comigo');
    a = dev.andamentos;
    expect(dev.linhas[0]!.motivo).toBe('Não é comigo');
    expect(esperaRevisao(a[inc.codigo]!)).toBe(true);

    // Redirecionar: o pedido sai de novo, para outro órgão.
    const red = redirecionar(a, inc.codigo, 'novacap', 'administracoes', 4000);
    const nova = red.andamentos[inc.codigo]!.trilhas.find((t) => t.orgaoId === 'administracoes')!;
    expect(nova.passo).toBe('enviado');
    expect(nova.redirecionadoDe).toBe('novacap');
    expect(red.andamentos[inc.codigo]!.trilhas.some((t) => t.orgaoId === 'novacap')).toBe(false);
    expect(esperaRevisao(red.andamentos[inc.codigo]!)).toBe(false);
    // Não redireciona para quem já está no plano.
    expect(redirecionar(a, inc.codigo, 'novacap', 'detran', 4000).andamentos).toBe(a);

    // Dispensar: o órgão sai da conta do fecho.
    const dis = dispensar(a, inc.codigo, 'novacap', 4000).andamentos;
    expect(dis[inc.codigo]!.trilhas.find((t) => t.orgaoId === 'novacap')!.passo).toBe('dispensado');
  });

  it('quem só é avisado apenas recebe, e não segura o fecho', () => {
    const pedras = doCaso('pedras-recanto');
    const p = planoDe(pedras);
    let a: Andamentos = iniciar({}, pedras.codigo, p, 0).andamentos;
    a = responder(a, pedras.codigo, 'pcdf', 'recebido', 10).andamentos;
    expect(respostasPossiveis(a[pedras.codigo]!.trilhas.find((t) => t.orgaoId === 'pcdf')!)).toEqual([]);
    for (const o of ['pmdf', 'der']) {
      a = responder(a, pedras.codigo, o, 'recebido', 20).andamentos;
      a = responder(a, pedras.codigo, o, 'resolvido', 30).andamentos;
    }
    expect(situacaoDoIncidente(a[pedras.codigo]!)).toBe('resolvido');
  });

  it('o roteiro leva o incidente do envio ao fecho, um passo por órgão de cada vez', () => {
    let a: Andamentos = inicio().andamentos;
    const planos = { [inc.codigo]: plano };
    const linhas: string[] = [];
    for (let t = 1000; t < 1000 + 60_000 && situacaoDoIncidente(a[inc.codigo]!) !== 'resolvido'; t += 200) {
      const res = avancarRoteiro(a, planos, t);
      a = res.andamentos;
      linhas.push(...res.linhas.map((l) => l.oQue));
    }
    expect(situacaoDoIncidente(a[inc.codigo]!)).toBe('resolvido');
    expect(linhas.filter((l) => l.startsWith('Recebeu'))).toHaveLength(plano.length);
    // Antes do primeiro prazo do roteiro, nada anda.
    expect(avancarRoteiro(inicio().andamentos, planos, 1000 + ROTEIRO.receber - 1).linhas).toHaveLength(0);
  });

  it('no caso do sossego, o roteiro mostra a devolução e espera quem revisa', () => {
    const s = doCaso('sossego-ceilandia');
    const p = planoDe(s);
    let a: Andamentos = iniciar({}, s.codigo, p, 0).andamentos;
    for (let t = 0; t < 60_000; t += 200) a = avancarRoteiro(a, { [s.codigo]: p }, t).andamentos;
    const dfl = a[s.codigo]!.trilhas.find((t) => t.orgaoId === 'dflegal')!;
    expect(dfl.passo).toBe('devolvido');
    expect(dfl.motivo).toMatch(/residência/);
    expect(situacaoDoIncidente(a[s.codigo]!)).toBe('em atendimento');
    // Dispensado, os outros dois já resolveram: fecha.
    a = dispensar(a, s.codigo, 'dflegal', 60_000).andamentos;
    expect(situacaoDoIncidente(a[s.codigo]!)).toBe('resolvido');
  });
});

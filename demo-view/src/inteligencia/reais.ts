/**
 * A inteligência sobre as demandas REAIS de Águas Claras (`dados/aguasClaras/`).
 * Aqui não há caso plantado: os grupos saem do que os cidadãos escreveram.
 *
 * A regra, dita na tela, segue a de recorrência do dfac (mesmo tipo, perto,
 * texto parecido, até 180 dias):
 *
 *   - dois relatos do **mesmo tipo** se ligam quando estão a até 150 m, a até
 *     180 dias um do outro, e o texto é parecido (palavras em comum); sem texto
 *     em comum, só colados (até 25 m);
 *   - relatos de **tipos diferentes** só se ligam bem perto, em datas próximas
 *     e com texto parecido: é o mesmo problema classificado de dois jeitos, a
 *     conferir. Só a vizinhança não basta (carro abandonado e asfalto afundado
 *     na mesma quadra não são o mesmo fato);
 *   - um grupo só cresce enquanto todos os relatos cabem num raio de 150 m: um
 *     encadeamento de vizinhos não vira um incidente do tamanho do bairro;
 *   - um incidente tem pelo menos três relatos: um par pode ser coincidência.
 *
 * A leitura, a recomendação e o ganho de cada incidente são **gerados dos
 * números do grupo**, não escritos à mão. O que vem depois (plano de envio,
 * respostas dos órgãos) continua simulado.
 *
 * Devolve os mesmos tipos de `agrupamento.ts`, para as telas não mudarem.
 * Funções puras.
 */
import { assuntoDoTipo, DEMANDAS, estaAberta, LIDO_EM, orgaoDaDemanda, ROTULO_DO_STATUS, SEM_ORGAO } from '../dados/aguasClaras/demandas';
import type { DemandaReal } from '../dados/aguasClaras/limpar';
import { REGIOES } from '../dominio/ras';
import { type Chamado, type Incidente, type Ligacao, metros, type Resultado, type TipoIncidente } from './agrupamento';
import { type Severidade, siglaDoOrgao, type TipoCaso } from './casos';

const HORA = 3_600_000;
const DIA = 24 * HORA;

export const RAIO_M = 150;
export const JANELA_DIAS = 180;
/** Tipos diferentes só se ligam bem perto e em datas próximas. */
export const RAIO_DO_CRUZAMENTO_M = 60;
export const JANELA_DO_CRUZAMENTO_DIAS = 60;
/** O texto precisa ter isto em comum: no mesmo tipo (a não ser que estejam colados) e entre tipos diferentes. */
export const TEXTO_MINIMO = 0.12;
export const TEXTO_MINIMO_DO_CRUZAMENTO = 0.3;
export const COLADOS_M = 25;
/** Um par pode ser coincidência: incidente, só com três ou mais. */
export const MINIMO_DE_RELATOS = 3;

export const CANAL = 'Mapa público de Águas Claras';

/** Só entram os relatos com ponto: o grafo é um mapa. */
export const comPonto = (demandas: readonly DemandaReal[] = DEMANDAS) => demandas.filter((d): d is DemandaReal & { ponto: [number, number] } => d.ponto !== null);

/** As demandas reais como chamados do motor. `agora` é a data da leitura do site. */
export function chamadosReais(demandas: readonly DemandaReal[] = DEMANDAS, agora: number = LIDO_EM): Chamado[] {
  return comPonto(demandas).map((d) => ({
    id: d.protocolo,
    assunto: assuntoDoTipo(d.tipo),
    orgaoId: orgaoDaDemanda(d),
    canal: CANAL,
    descricao: d.descricao,
    ponto: d.ponto,
    horas: Math.max(0, (agora - Date.parse(d.criadaEm)) / HORA),
    peso: 1,
    casoId: null,
  }));
}

// ---------------------------------------------------------------- texto parecido

const VAZIAS = new Set('a o as os um uma de do da dos das em no na nos nas por para com sem que e ou se ao aos mais muito ha tem esta estao foi ser sao nao ja pela pelo entre sobre ate como local favor rua avenida av quadra'.split(' '));

/** As palavras que dizem do que o relato fala: sem acento, sem palavras vazias, sem números soltos. */
export function palavras(texto: string): Set<string> {
  const limpo = texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
  return new Set((limpo.match(/[a-z]{3,}/g) ?? []).filter((p) => !VAZIAS.has(p)).map((p) => (p.length > 5 ? p.slice(0, 5) : p)));
}

/** De 0 a 1: palavras em comum sobre o total de palavras dos dois (Jaccard). */
export function semelhanca(a: ReadonlySet<string>, b: ReadonlySet<string>): number {
  if (!a.size || !b.size) return 0;
  let comuns = 0;
  for (const p of a) if (b.has(p)) comuns++;
  return comuns / (a.size + b.size - comuns);
}

// ---------------------------------------------------------------- ligações

/** Todas as ligações possíveis entre os relatos reais. Não depende do limiar. */
export function ligacoesReais(ch: readonly Chamado[]): Ligacao[] {
  const termos = ch.map((c) => palavras(c.descricao));
  const ligacoes: Ligacao[] = [];
  for (let a = 0; a < ch.length; a++) {
    const A = ch[a]!;
    for (let b = a + 1; b < ch.length; b++) {
      const B = ch[b]!;
      const mesmoTipo = A.assunto === B.assunto;
      const d = metros(A.ponto, B.ponto);
      if (d > (mesmoTipo ? RAIO_M : RAIO_DO_CRUZAMENTO_M)) continue;
      const dias = Math.abs(A.horas - B.horas) / 24;
      if (dias > (mesmoTipo ? JANELA_DIAS : JANELA_DO_CRUZAMENTO_DIAS)) continue;
      const texto = semelhanca(termos[a]!, termos[b]!);
      if (mesmoTipo ? texto < TEXTO_MINIMO && d > COLADOS_M : texto < TEXTO_MINIMO_DO_CRUZAMENTO) continue;
      // Mesmo tipo: o texto parecido pesa mais. Tipos diferentes: parte de mais baixo, é para conferir.
      const assunto = mesmoTipo ? 0.4 + 0.6 * texto : 0.35 + 0.5 * texto;
      const espaco = Math.exp(-(d * d) / (RAIO_M * RAIO_M));
      const tempo = Math.exp(-dias / JANELA_DIAS);
      const forca = assunto * espaco * tempo;
      if (forca >= 0.06) ligacoes.push({ a, b, forca, assunto, espaco, tempo, cruza: A.orgaoId !== B.orgaoId });
    }
  }
  return ligacoes;
}

// ---------------------------------------------------------------- incidentes

const n = (v: number) => Math.round(v).toLocaleString('pt-BR');
const plural = (q: number, um: string, varios: string) => `${n(q)} ${q === 1 ? um : varios}`;
const mesEAno = (ms: number) => new Date(ms).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', timeZone: 'America/Sao_Paulo' }).replace('. de ', '/').replace(' de ', '/').replace('.', '');
const dia = (ms: number) => new Date(ms).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

/** O mais frequente de uma lista de textos (o primeiro, no empate). */
function maisFrequente(itens: (string | null)[]): string | null {
  const conta = new Map<string, number>();
  for (const i of itens) if (i) conta.set(i, (conta.get(i) ?? 0) + 1);
  return [...conta].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

/** O lugar do grupo, em poucas palavras: o logradouro que mais aparece. */
function lugarDe(M: readonly DemandaReal[]): string {
  const logradouro = (d: DemandaReal) => (d.bairro && !/^[áa]guas claras$/i.test(d.bairro) ? d.bairro : (d.endereco?.split(',')[0]?.trim() ?? null));
  return maisFrequente(M.map(logradouro)) ?? 'Águas Claras';
}

/** Um relato do grupo, como aparece no insight. */
export interface Relato {
  protocolo: string;
  quando: string;
  texto: string;
  status: string;
  aberto: boolean;
}

/** O incidente real leva também os relatos, para a tela mostrar o que os cidadãos escreveram. */
export interface IncidenteReal extends Incidente {
  relatos: Relato[];
  abertos: number;
  finalizados: number;
}

export const ehReal = (i: Incidente): i is IncidenteReal => Array.isArray((i as Partial<IncidenteReal>).relatos);

function montar(ch: readonly Chamado[], D: readonly DemandaReal[], membros: number[], internas: Ligacao[]): Omit<IncidenteReal, 'codigo'> {
  const M = membros.map((i) => D[i]!);
  const C = membros.map((i) => ch[i]!);
  const total = M.length;
  const centro: [number, number] = [C.reduce((s, c) => s + c.ponto[0], 0) / total, C.reduce((s, c) => s + c.ponto[1], 0) / total];
  const raio = Math.max(...C.map((c) => metros(c.ponto, centro)));
  const datas = M.map((d) => Date.parse(d.criadaEm));
  const [primeira, ultima] = [Math.min(...datas), Math.max(...datas)];
  const dias = (ultima - primeira) / DIA;
  const tipos = [...new Set(M.map((d) => d.tipo))];
  // "Sem órgão atribuído" não é um órgão: só conta quando é tudo o que há.
  const todos = [...new Set(C.map((c) => c.orgaoId))];
  const comDono = todos.filter((o) => o !== SEM_ORGAO);
  const orgaos = comDono.length ? comDono : todos;
  const abertos = M.filter(estaAberta).length;
  const finalizados = total - abertos;
  const media = (f: (l: Ligacao) => number) => (internas.length ? internas.reduce((s, l) => s + f(l), 0) / internas.length : 0);
  const partes = { assunto: media((l) => l.assunto), espaco: media((l) => l.espaco), tempo: media((l) => l.tempo) };
  const lugar = lugarDe(M);

  const cruzaTipos = tipos.length > 1;
  const tipo: TipoIncidente = cruzaTipos || orgaos.length > 1 ? 'COR' : 'AGR';
  const tipoDoCaso: TipoCaso = cruzaTipos ? 'Reclassificação' : dias > 30 ? 'Recorrência' : 'Mesmo incidente';
  // A gravidade vem do que segue aberto: é o que ainda pede alguém.
  const seguranca = M.some((d) => /seguran/i.test(d.tipo));
  const severidade: Severidade = abertos >= 5 || (seguranca && abertos >= 3) ? 'crítico' : abertos >= 3 ? 'sério' : 'atenção';
  const confianca = Math.min(0.97, 0.45 + 0.4 * media((l) => l.forca) + 0.15 * Math.min(1, Math.log10(1 + total) / 2));
  const recente = Math.exp(-(LIDO_EM - ultima) / (90 * DIA));
  const urgencia = Math.round(100 * Math.min(1, 0.45 * Math.min(1, abertos / 6) + 0.25 * Math.min(1, total / 10) + 0.3 * recente));

  const periodo = dias < 2 ? `em ${dia(primeira)}` : `de ${mesEAno(primeira)} a ${mesEAno(ultima)}`;
  const nomeDoTipo = tipos.length === 1 ? tipos[0]!.toLowerCase() : tipos.map((t) => t.toLowerCase()).join(' e ');
  const titulo = cruzaTipos ? `${plural(total, 'relato parecido', 'relatos parecidos')}, em tipos diferentes · ${lugar}` : `${plural(total, 'relato', 'relatos')} de ${nomeDoTipo} · ${lugar}`;
  const situacao = `${plural(finalizados, 'consta como finalizado', 'constam como finalizados')} no site e ${plural(abertos, 'segue aberto', 'seguem abertos')}`;
  const leitura = cruzaTipos
    ? `No mesmo ponto, ${periodo}, relatos parecidos foram classificados como ${nomeDoTipo}. Pode ser o mesmo problema entrando em filas diferentes: vale conferir antes de tratar como um só. ${situacao[0]!.toUpperCase()}${situacao.slice(1)}.`
    : tipoDoCaso === 'Recorrência'
      ? `O mesmo problema foi relatado ${n(total)} vezes neste ponto, ${periodo}. ${situacao[0]!.toUpperCase()}${situacao.slice(1)}. Quando o relato volta depois de finalizado, ou o conserto não segurou, ou a causa é outra.`
      : `${plural(total, 'relato', 'relatos')} em ${Math.max(1, Math.round(dias))} dia${dias >= 1.5 ? 's' : ''} falam do mesmo ponto. Tratados um a um, são ${n(total)} atendimentos; juntos, um só. ${situacao[0]!.toUpperCase()}${situacao.slice(1)}.`;
  const dono = [...new Map(orgaos.map((o) => [o, C.filter((c) => c.orgaoId === o).length]))].sort((a, b) => b[1] - a[1])[0]![0];
  const recomendacao = [
    `Tratar como um só atendimento, com ${siglaDoOrgao(dono)} à frente.`,
    ...(abertos > 0 ? [`Responder de uma vez aos ${plural(abertos, 'relato aberto', 'relatos abertos')}.`] : ['Nada aberto agora: fica o registro, caso volte.']),
    ...(tipoDoCaso === 'Recorrência' ? [`Verificar por que o problema volta: ${n(total)} relatos em ${Math.max(1, Math.round(dias / 30))} ${dias < 45 ? 'mês' : 'meses'}.`] : []),
    ...(cruzaTipos ? ['Conferir se é o mesmo problema e, se for, unificar o tipo.'] : []),
  ];

  const porOrgao = todos.map((o) => {
    const dele = M.filter((_, k) => C[k]!.orgaoId === o);
    const exemplo = [...dele].sort((a, b) => Date.parse(b.criadaEm) - Date.parse(a.criadaEm))[0]!;
    return { orgaoId: o, canal: CANAL, descricao: exemplo.descricao.length > 110 ? `${exemplo.descricao.slice(0, 107)}…` : exemplo.descricao, quantidade: dele.length, fonte: 'chamado' as const };
  });
  const relatos: Relato[] = M.map((d) => ({ protocolo: d.protocolo, quando: dia(Date.parse(d.criadaEm)), texto: d.descricao, status: ROTULO_DO_STATUS[d.status], aberto: estaAberta(d), em: Date.parse(d.criadaEm) }))
    .sort((a, b) => b.em - a.em)
    .map(({ em: _em, ...r }) => r);

  const ra = REGIOES.reduce((melhor, r) => (metros(r.rotulo, centro) < metros(melhor.rotulo, centro) ? r : melhor), REGIOES[0]!);
  return {
    tipo,
    casoId: null,
    tipoDoCaso,
    titulo,
    severidade,
    raId: ra.id,
    local: lugar === ra.nome ? ra.nome : `${lugar}, ${ra.nome}`,
    membros,
    centro,
    chamados: total,
    orgaos,
    evidencias: porOrgao.sort((a, b) => b.quantidade - a.quantidade),
    raio,
    janela: (ultima - primeira) / HORA,
    confianca,
    partes,
    motivo: `${plural(total, 'relato', 'relatos')} de ${orgaos.length === 1 ? '1 órgão' : `${orgaos.length} órgãos`}, a até ${Math.max(10, Math.round((raio * 2) / 10) * 10)} m um do outro, ${periodo}.`,
    urgencia,
    leitura,
    recomendacao,
    ganho: `${plural(total, 'relato vira', 'relatos viram')} 1 incidente; ${plural(abertos, 'segue aberto', 'seguem abertos')}.`,
    linhaDoTempo: [
      { quando: dia(primeira), texto: 'Primeiro relato neste ponto' },
      ...(total > 2 ? [{ quando: periodo, texto: `${n(total)} relatos ao todo` }] : []),
      { quando: dia(ultima), texto: 'Relato mais recente' },
    ],
    relatos,
    abertos,
    finalizados,
  };
}

/**
 * Junta os relatos em incidentes. As ligações mais fortes entram primeiro, e
 * dois grupos só se fundem se todos os relatos couberem em `RAIO_M` do centro
 * do grupo novo.
 */
export function agruparReais(ch: readonly Chamado[], todas: readonly Ligacao[], limiar: number, demandas: readonly DemandaReal[] = comPonto()): Resultado {
  const grupoDe = Int32Array.from(ch, (_, i) => i);
  const membrosDe = new Map<number, number[]>(ch.map((_, i) => [i, [i]]));
  const ligacoes = todas.filter((l) => l.forca >= limiar).sort((x, y) => y.forca - x.forca);
  for (const l of ligacoes) {
    const [ga, gb] = [grupoDe[l.a]!, grupoDe[l.b]!];
    if (ga === gb) continue;
    const juntos = [...membrosDe.get(ga)!, ...membrosDe.get(gb)!];
    const centro: [number, number] = [juntos.reduce((s, i) => s + ch[i]!.ponto[0], 0) / juntos.length, juntos.reduce((s, i) => s + ch[i]!.ponto[1], 0) / juntos.length];
    if (juntos.some((i) => metros(ch[i]!.ponto, centro) > RAIO_M)) continue;
    for (const i of membrosDe.get(gb)!) grupoDe[i] = ga;
    membrosDe.set(ga, juntos);
    membrosDe.delete(gb);
  }
  const montados = [...membrosDe.values()]
    .filter((m) => m.length >= MINIMO_DE_RELATOS)
    .map((m) => {
      const dentro = new Set(m);
      return montar(ch, demandas, [...m].sort((a, b) => a - b), ligacoes.filter((l) => dentro.has(l.a) && dentro.has(l.b)));
    })
    .sort((a, b) => b.urgencia - a.urgencia || b.chamados - a.chamados);

  const conta: Record<TipoIncidente, number> = { AGR: 0, COR: 0 };
  const incidentes: IncidenteReal[] = montados.map((m) => ({ ...m, codigo: `${m.tipo}-${String(++conta[m.tipo]).padStart(2, '0')}` }));
  const grupo = new Int32Array(ch.length).fill(-1);
  incidentes.forEach((inc, k) => inc.membros.forEach((i) => (grupo[i] = k)));
  // Só ficam as ligações de dentro dos incidentes: são as que o grafo desenha.
  const usadas = ligacoes.filter((l) => grupo[l.a] !== -1 && grupo[l.a] === grupo[l.b]);
  return { grupo, incidentes, ligacoes: usadas, total: ch.length, avulsos: ch.reduce((s, _c, i) => s + (grupo[i] === -1 ? 1 : 0), 0) };
}

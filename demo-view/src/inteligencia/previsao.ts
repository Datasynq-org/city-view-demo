/**
 * Previsão e "fora do normal" (I5, CV-DEM-001 seção 6): "O que vem por aí?".
 * PROPOSTA, sobre os dados SIMULADOS. Portado da demo exploratória
 * (`City-view`, `apps/sala-de-situacao/src/data/previsao.ts`), sem mudar o método.
 *
 * O método é simples de propósito, para caber numa frase: "olhamos as últimas
 * oito semanas, o dia da semana e a tendência recente".
 * - Previsão: nível das duas últimas semanas × padrão de cada dia da semana,
 *   com tendência amortecida. Faixa de 80% pelos erros do ajuste.
 * - Fora do normal: chamados dos últimos 7 dias contra a média semanal de um
 *   período de referência, por tipo e região, descontado o momento do DF.
 *
 * No produto, o modelo usaria também previsão do tempo, calendário e o
 * histórico real de cada órgão. Nada aqui é dado do DF.
 */
import { type BaseSimulada, indiceDaContagem, inicioDoIndice } from '../dados/gerador';
import { type AreaId, type TipoComOrgao, TIPOS } from '../dominio/orgaos';
import { type Regiao, REGIOES } from '../dominio/ras';

export const HORIZONTE = 14;
export const HISTORICO_NO_GRAFICO = 56;
const FUSO_MS = -3 * 3_600_000;

export interface Filtro {
  area?: AreaId | null;
  ra?: string | null;
  tipoId?: string | null;
}

const passa = (t: TipoComOrgao, f: Filtro) => (!f.area || t.area === f.area) && (!f.tipoId || t.id === f.tipoId);

/** Último dia completo da base (hoje ainda está em andamento). */
export const ultimoDia = (base: Pick<BaseSimulada, 'dias'>) => base.dias - 2;

/** Dia da semana (0 = domingo) do dia `d` da base, no calendário de Brasília. */
export const diaDaSemana = (base: Pick<BaseSimulada, 'agora' | 'dias'>, d: number) => new Date(inicioDoIndice(base, d) + FUSO_MS).getUTCDay();

/** Série diária (0 = mais antigo) somando os tipos e as regiões do filtro. */
export function serieDiaria(base: BaseSimulada, f: Filtro = {}): number[] {
  const s = new Array<number>(base.dias).fill(0);
  TIPOS.forEach((tipo, t) => {
    if (!passa(tipo, f)) return;
    REGIOES.forEach((ra, r) => {
      if (f.ra && ra.id !== f.ra) return;
      const ini = indiceDaContagem(base, t, r, 0);
      for (let d = 0; d < base.dias; d++) s[d] = s[d]! + base.contagens[ini + d]!;
    });
  });
  return s;
}

export interface Previsao {
  /** Previsão para cada um dos próximos dias. */
  valores: number[];
  inferior: number[];
  superior: number[];
  /** Margem (80%) da soma do período inteiro, tratando os erros dos dias como independentes. */
  margemDaSoma: number;
}

/**
 * Prevê `h` dias depois de `fim` usando só os dados até `fim`.
 * `dow(d)` devolve o dia da semana do dia `d` (inclusive dos dias futuros).
 */
export function prever(serie: readonly number[], fim: number, dow: (d: number) => number, h = HORIZONTE): Previsao {
  const semanas = 8;
  const ini = Math.max(0, fim - semanas * 7 + 1);
  // Padrão do dia da semana: média de cada dia / média geral, nas últimas 8 semanas.
  const somaDow = new Array<number>(7).fill(0);
  const nDow = new Array<number>(7).fill(0);
  let soma = 0;
  for (let d = ini; d <= fim; d++) {
    const k = dow(d);
    somaDow[k] = somaDow[k]! + serie[d]!;
    nDow[k] = nDow[k]! + 1;
    soma += serie[d]!;
  }
  const mediaGeral = soma / Math.max(1, fim - ini + 1) || 1;
  const fatorDow = somaDow.map((v, i) => (nDow[i] ? v / nDow[i]! / mediaGeral : 1));
  const fator = (d: number) => fatorDow[dow(d)] || 1;
  const dessazonal = (d: number) => (serie[d] ?? 0) / fator(d);

  let recente = 0;
  let anterior = 0;
  for (let i = 0; i < 14; i++) {
    recente += dessazonal(fim - i);
    anterior += dessazonal(fim - 14 - i);
  }
  recente /= 14;
  anterior /= 14;
  const nivel = recente;
  // Tendência diária, amortecida (0,9 por dia) para não extrapolar demais.
  const tendencia = (recente - anterior) / 14;

  // Erro típico do ajuste nas últimas 4 semanas (para a faixa).
  let somaErro2 = 0;
  for (let d = fim - 27; d <= fim; d++) somaErro2 += ((serie[d] ?? 0) - nivel * fator(d)) ** 2;
  const erro = Math.sqrt(somaErro2 / 28);

  const valores: number[] = [];
  const inferior: number[] = [];
  const superior: number[] = [];
  let acumulado = 0;
  let variancia = 0;
  for (let k = 1; k <= h; k++) {
    acumulado += tendencia * 0.9 ** k;
    const v = Math.max(0, (nivel + acumulado) * fator(fim + k));
    const margem = 1.28 * erro * Math.sqrt(1 + k / 7);
    variancia += margem ** 2;
    valores.push(v);
    inferior.push(Math.max(0, v - margem));
    superior.push(v + margem);
  }
  return { valores, inferior, superior, margemDaSoma: Math.sqrt(variancia) };
}

export interface Ponto {
  /** 00:00 de Brasília do dia. */
  dia: number;
  real: number | null;
  previsto: number | null;
  faixa: [number, number] | null;
}

export interface Resultado {
  pontos: Ponto[];
  /** Soma prevista dos próximos 14 dias e soma real dos últimos 14. */
  proximos: number;
  ultimos: number;
  /** Acerto ao prever as duas semanas que acabaram de passar (1 − erro percentual). */
  acerto: number;
  /** O erro medido em várias janelas, contra o palpite ingênuo (CV-DEM-002, D2). */
  avaliacao: Avaliacao;
}

export interface Avaliacao {
  /** Quantas janelas de duas semanas foram testadas (o histórico limita). */
  janelas: number;
  /** Erro típico: soma dos erros de cada dia sobre o total real, em média entre as janelas. */
  erro: number;
  /** O mesmo, para o palpite "vai ser igual às duas últimas semanas". */
  erroIngenuo: number;
}

/**
 * Uma janela só não é acerto, é um exemplo. Aqui o método prevê várias janelas
 * de duas semanas do passado, sem vê-las, e é comparado com o palpite mais
 * simples que existe: repetir as duas semanas anteriores. Se não ganhar dele,
 * a tela diz.
 */
export function avaliar(serie: readonly number[], U: number, dow: (d: number) => number, maximo = 4): Avaliacao {
  let janelas = 0;
  let erro = 0;
  let erroIngenuo = 0;
  for (let j = 1; j <= maximo; j++) {
    const fim = U - HORIZONTE * j;
    // O método olha oito semanas para trás de `fim`.
    if (fim - 56 < 0) break;
    const p = prever(serie, fim, dow);
    let real = 0;
    let e = 0;
    let ei = 0;
    for (let k = 1; k <= HORIZONTE; k++) {
      const r = serie[fim + k] ?? 0;
      real += r;
      e += Math.abs(r - p.valores[k - 1]!);
      ei += Math.abs(r - (serie[fim + k - HORIZONTE] ?? 0));
    }
    if (real <= 0) continue;
    janelas++;
    erro += e / real;
    erroIngenuo += ei / real;
  }
  return janelas ? { janelas, erro: erro / janelas, erroIngenuo: erroIngenuo / janelas } : { janelas: 0, erro: 0, erroIngenuo: 0 };
}

const soma = (v: readonly number[], de: number, ate: number) => {
  let s = 0;
  for (let d = de; d <= ate; d++) s += v[d] ?? 0;
  return s;
};

export function previsaoPara(base: BaseSimulada, f: Filtro = {}): Resultado {
  const serie = serieDiaria(base, f);
  const U = ultimoDia(base);
  const dow = (d: number) => diaDaSemana(base, d);
  const p = prever(serie, U, dow);
  const pontos: Ponto[] = [];
  for (let d = Math.max(0, U - HISTORICO_NO_GRAFICO + 1); d <= U; d++) {
    // No último dia real, a linha prevista começa colada na real.
    pontos.push({ dia: inicioDoIndice(base, d), real: serie[d]!, previsto: d === U ? serie[d]! : null, faixa: d === U ? [serie[d]!, serie[d]!] : null });
  }
  p.valores.forEach((v, i) => pontos.push({ dia: inicioDoIndice(base, U + 1 + i), real: null, previsto: v, faixa: [p.inferior[i]!, p.superior[i]!] }));

  // Teste honesto: prever as duas últimas semanas sem olhar para elas.
  const teste = prever(serie, U - HORIZONTE, dow);
  let realT = 0;
  let erroT = 0;
  teste.valores.forEach((v, i) => {
    const real = serie[U - HORIZONTE + 1 + i]!;
    realT += real;
    erroT += Math.abs(real - v);
  });
  return { pontos, proximos: p.valores.reduce((s, v) => s + v, 0), ultimos: soma(serie, U - HORIZONTE + 1, U), acerto: realT > 0 ? Math.max(0, 1 - erroT / realT) : 0, avaliacao: avaliar(serie, U, dow) };
}

// ---------------------------------------------------------------- o que sobe e o que cai

export type Motivo = 'chuva' | 'fim-de-semana' | 'tendencia';

/**
 * O motivo não sai do modelo (CV-DEM-002, D6): oito semanas não enxergam
 * estação. "Chuva" vem do tipo do chamado e do calendário (a estação chuvosa do
 * DF vai de meados de outubro a abril); os outros dois, do perfil do tipo.
 */
export const TEXTO_DO_MOTIVO: Record<Motivo, string> = {
  chuva: 'Tipo que sobe com a chuva · estação chuvosa, pelo calendário',
  'fim-de-semana': 'Padrão de noites e fins de semana',
  tendencia: 'Tendência das últimas semanas',
};

export interface Variacao {
  tipo: TipoComOrgao;
  ultimos: number;
  proximos: number;
  /** Fração: 0,2 = 20% a mais nas próximas duas semanas. */
  variacao: number;
  motivo: Motivo;
}

/** Os tipos com volume relevante, com a mudança prevista para as próximas duas semanas. */
export function variacaoPorTipo(base: BaseSimulada, f: Filtro = {}): Variacao[] {
  const U = ultimoDia(base);
  const dow = (d: number) => diaDaSemana(base, d);
  return TIPOS.filter((t) => passa(t, f))
    .map((tipo) => {
      const serie = serieDiaria(base, { ...f, tipoId: tipo.id });
      const ultimos = soma(serie, U - HORIZONTE + 1, U);
      const proximos = prever(serie, U, dow).valores.reduce((s, v) => s + v, 0);
      const motivo: Motivo = tipo.perfil === 'chuva' ? 'chuva' : tipo.perfil === 'noturno-fim-de-semana' ? 'fim-de-semana' : 'tendencia';
      return { tipo, ultimos, proximos, variacao: ultimos > 0 ? proximos / ultimos - 1 : 0, motivo };
    })
    .filter((v) => v.ultimos >= 60);
}

export interface Pressao {
  ra: Regiao;
  ultimos: number;
  proximos: number;
  /** Chamados a mais (ou a menos) previstos para as próximas duas semanas. */
  aMais: number;
  variacao: number;
  /** A alta prevista passa da margem da própria previsão (CV-DEM-002, D3): só então vale recomendar reforço. */
  foraDaMargem: boolean;
}

/** Onde reforçar as equipes: as regiões com mais chamados a mais previstos. */
export function pressaoPorRegiao(base: BaseSimulada, f: Filtro = {}): Pressao[] {
  const U = ultimoDia(base);
  const dow = (d: number) => diaDaSemana(base, d);
  return REGIOES.map((ra) => {
    const serie = serieDiaria(base, { ...f, ra: ra.id });
    const ultimos = soma(serie, U - HORIZONTE + 1, U);
    const p = prever(serie, U, dow);
    const proximos = p.valores.reduce((s, v) => s + v, 0);
    return { ra, ultimos, proximos, aMais: proximos - ultimos, variacao: ultimos > 0 ? proximos / ultimos - 1 : 0, foraDaMargem: proximos - ultimos > p.margemDaSoma };
  }).sort((a, b) => b.aMais - a.aMais);
}

// ---------------------------------------------------------------- fora do normal

export interface Anomalia {
  tipo: TipoComOrgao;
  ra: Regiao;
  /** Chamados nos últimos 7 dias. */
  semana: number;
  /** Quantos seriam esperados, pelo histórico da região e pelo momento do DF. */
  normal: number;
  /** semana / normal */
  vezes: number;
}

/**
 * Combinações tipo × região com volume bem acima do esperado na última semana.
 *
 * O esperado é a média semanal da região num período de referência (quatro
 * semanas, terminando cinco semanas atrás), ajustada pelo quanto aquele tipo
 * variou no DF inteiro. Assim a chuva, que aumenta os alagamentos em todo
 * lugar, não aparece como anomalia; uma concentração local, sim.
 */
export function foraDoNormal(base: BaseSimulada, f: Filtro = {}, limite = 8): Anomalia[] {
  const U = ultimoDia(base);
  const R = REGIOES.length;
  const refIni = U - 62;
  const refFim = U - 35;
  if (refIni < 0) return [];
  const semanasRef = (refFim - refIni + 1) / 7;
  const lista: Anomalia[] = [];
  TIPOS.forEach((tipo, t) => {
    if (!passa(tipo, f)) return;
    const semana = new Float64Array(R);
    const ref = new Float64Array(R);
    let somaSemana = 0;
    let somaRef = 0;
    for (let r = 0; r < R; r++) {
      const ini = indiceDaContagem(base, t, r, 0);
      for (let d = U - 6; d <= U; d++) semana[r] = semana[r]! + base.contagens[ini + d]!;
      for (let d = refIni; d <= refFim; d++) ref[r] = ref[r]! + base.contagens[ini + d]!;
      ref[r] = ref[r]! / semanasRef;
      somaSemana += semana[r]!;
      somaRef += ref[r]!;
    }
    // Quanto o tipo mudou no DF todo (estação, tendência).
    const momento = somaRef > 0 ? somaSemana / somaRef : 1;
    REGIOES.forEach((ra, r) => {
      if (f.ra && ra.id !== f.ra) return;
      const obs = semana[r]!;
      const esperado = Math.max(ref[r]! * momento, 2);
      if (obs < 20) return;
      const z = (obs - esperado) / Math.sqrt(esperado);
      if (obs / esperado < 1.5 || z < 4) return;
      lista.push({ tipo, ra, semana: obs, normal: esperado, vezes: obs / esperado });
    });
  });
  return lista.sort((a, b) => b.vezes - a.vezes).slice(0, limite);
}

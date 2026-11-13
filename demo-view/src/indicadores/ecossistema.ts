/**
 * Analytics do ecossistema: cada serviço da cidade (energia, iluminação, água e
 * esgoto, segurança) lido de uma vez, região por região, com um índice de 0 a
 * 100 e os sinais do sistema do órgão (qualidade da rede, do serviço, saúde do
 * sistema; `dominio/operacao.ts`).
 *
 * O índice é uma **proposta da equipe**, sobre dados SIMULADOS. É feito de três
 * partes, todas calculadas dos chamados dos últimos 30 dias:
 *
 *   - pressão: chamados por 10 mil habitantes, contra as outras regiões (40%);
 *   - prazo: a parte dos resolvidos que ficou dentro do prazo (40%);
 *   - fila: a parte dos chamados que não está aberta além do prazo (20%).
 *
 * Mede **o serviço pelo que chega aos canais**, não a cidade inteira. Na
 * segurança isso pesa mais: o índice vem dos chamados ao 190, não é índice de
 * criminalidade, e é sempre por região, nunca por endereço.
 * Funções puras.
 */
import { estaAberto, type Incidente, type Instante } from '../dominio/incidente';
import { TIPO_POR_ID } from '../dominio/orgaos';
import { REGIOES } from '../dominio/ras';

const HORA = 3_600_000;
const DIA = 24 * HORA;
export const DIAS_DO_INDICE = 30;
/** Abaixo disto a região tem chamados de menos para o índice dizer alguma coisa. */
export const MINIMO_DE_CHAMADOS = 15;

export type DominioId = 'energia' | 'iluminacao' | 'saneamento' | 'seguranca';

export interface Dominio {
  id: DominioId;
  nome: string;
  /** O órgão cujos chamados e cujo sistema alimentam o domínio. */
  orgaoId: string;
  /** O que o índice mede, em uma linha. */
  mede: string;
  /** O que ele não mede: o limite que a tela precisa dizer. */
  ressalva: string;
}

export const DOMINIOS: Dominio[] = [
  { id: 'energia', nome: 'Energia', orgaoId: 'neoenergia', mede: 'Falta de energia e rede caída, pelo que chega à distribuidora', ressalva: 'A distribuidora é concessionária: os dados de operação dependem de ela liberar.' },
  { id: 'iluminacao', nome: 'Luz na cidade', orgaoId: 'ceb-ipes', mede: 'Iluminação pública: lâmpadas apagadas, acesas de dia e postes danificados', ressalva: 'Poste apagado que ninguém relatou não aparece: o índice vê só o que foi pedido.' },
  { id: 'saneamento', nome: 'Água e esgoto', orgaoId: 'caesb', mede: "Falta d'água, vazamentos e esgoto extravasado", ressalva: 'Não mede a qualidade da água nem a cobertura da rede: só o atendimento aos chamados.' },
  { id: 'seguranca', nome: 'Segurança', orgaoId: 'pmdf', mede: 'Chamados ao 190: sossego, roubo ou furto em andamento, desordem', ressalva: 'Não é índice de criminalidade: mede o que chega ao 190 e como é atendido. Sempre por região, nunca por endereço, e fora do mapa público.' },
];

export const DOMINIO_POR_ID = Object.fromEntries(DOMINIOS.map((d) => [d.id, d])) as Record<DominioId, Dominio>;

export const PESOS = { pressao: 0.4, prazo: 0.4, fila: 0.2 } as const;

export type Faixa = 'bom' | 'atencao' | 'critico';
export const ROTULO_DA_FAIXA: Record<Faixa, string> = { bom: 'Bom', atencao: 'Atenção', critico: 'Crítico' };
export const LIMITE_DO_BOM = 70;
export const LIMITE_DA_ATENCAO = 55;
export const faixaDoIndice = (v: number): Faixa => (v >= LIMITE_DO_BOM ? 'bom' : v >= LIMITE_DA_ATENCAO ? 'atencao' : 'critico');

export interface IndiceDaRa {
  ra: string;
  chamados: number;
  por10mil: number;
  /** Dos resolvidos, a parte dentro do prazo (0 a 1); `null` se nada foi resolvido. */
  noPrazo: number | null;
  /** Dos chamados, a parte aberta além do prazo (0 a 1). */
  parteFora: number;
  /** As três partes, de 0 a 1 (1 é o melhor), e o índice, de 0 a 100. `null` com chamados de menos. */
  partes: { pressao: number; prazo: number; fila: number } | null;
  indice: number | null;
}

export interface IndiceDoDominio {
  dominio: Dominio;
  regioes: IndiceDaRa[];
  /** O do DF: a média das regiões, pesada pela população. */
  df: number | null;
  chamados: number;
  noPrazo: number | null;
  /** Regiões com índice, da pior para a melhor. */
  piores: IndiceDaRa[];
}

/** O índice a partir das três partes (cada uma de 0 a 1). */
export const indiceDasPartes = (p: { pressao: number; prazo: number; fila: number }) => Math.round(100 * (PESOS.pressao * p.pressao + PESOS.prazo * p.prazo + PESOS.fila * p.fila));

export function indiceDoDominio(incidentes: readonly Incidente[], agora: Instante, id: DominioId): IndiceDoDominio {
  const dominio = DOMINIO_POR_ID[id];
  const desde = agora - DIAS_DO_INDICE * DIA;
  const conta = new Map(REGIOES.map((r) => [r.id, { chamados: 0, resolvidos: 0, noPrazo: 0, fora: 0 }]));
  for (const i of incidentes) {
    if (i.orgaoId !== dominio.orgaoId || i.criadoEm < desde || i.criadoEm > agora) continue;
    const c = conta.get(i.local.raId);
    if (!c) continue;
    c.chamados++;
    const prazo = TIPO_POR_ID[i.tipoId]?.prazoHoras;
    if (i.resolvidoEm !== undefined) {
      c.resolvidos++;
      if (prazo !== undefined && (i.resolvidoEm - i.criadoEm) / HORA <= prazo) c.noPrazo++;
    } else if (estaAberto(i.situacao) && prazo !== undefined && (agora - i.criadoEm) / HORA > prazo) c.fora++;
  }
  const brutos = REGIOES.map((r) => {
    const c = conta.get(r.id)!;
    return { ra: r.id, populacao: r.populacao, chamados: c.chamados, por10mil: r.populacao > 0 ? (c.chamados / r.populacao) * 10_000 : 0, noPrazo: c.resolvidos ? c.noPrazo / c.resolvidos : null, parteFora: c.chamados ? c.fora / c.chamados : 0 };
  });
  // A pressão é relativa: a posição da região entre as que têm volume (0 = a mais pressionada).
  const comVolume = brutos.filter((b) => b.chamados >= MINIMO_DE_CHAMADOS);
  const ordenadas = [...comVolume].sort((a, b) => b.por10mil - a.por10mil).map((b) => b.ra);
  const posicao = (ra: string) => (ordenadas.length > 1 ? ordenadas.indexOf(ra) / (ordenadas.length - 1) : 1);

  const regioes: IndiceDaRa[] = brutos.map((b) => {
    const partes = b.chamados >= MINIMO_DE_CHAMADOS && b.noPrazo !== null ? { pressao: posicao(b.ra), prazo: b.noPrazo, fila: 1 - b.parteFora } : null;
    return { ra: b.ra, chamados: b.chamados, por10mil: b.por10mil, noPrazo: b.noPrazo, parteFora: b.parteFora, partes, indice: partes ? indiceDasPartes(partes) : null };
  });
  let soma = 0;
  let peso = 0;
  regioes.forEach((r, k) => {
    if (r.indice === null) return;
    soma += r.indice * brutos[k]!.populacao;
    peso += brutos[k]!.populacao;
  });
  const resolvidos = [...conta.values()].reduce((s, c) => s + c.resolvidos, 0);
  return {
    dominio,
    regioes,
    df: peso > 0 ? Math.round(soma / peso) : null,
    chamados: brutos.reduce((s, b) => s + b.chamados, 0),
    noPrazo: resolvidos ? [...conta.values()].reduce((s, c) => s + c.noPrazo, 0) / resolvidos : null,
    piores: regioes.filter((r) => r.indice !== null).sort((a, b) => a.indice! - b.indice!),
  };
}

/** Chamados por dia do domínio, nos últimos `dias` dias cheios (do mais antigo ao mais novo). */
export function serieDoDominio(incidentes: readonly Incidente[], agora: Instante, id: DominioId, dias = 28): number[] {
  const orgao = DOMINIO_POR_ID[id].orgaoId;
  const s = new Array<number>(dias).fill(0);
  for (const i of incidentes) {
    if (i.orgaoId !== orgao) continue;
    const k = dias - 1 - Math.floor((agora - i.criadoEm) / DIA);
    if (k >= 0 && k < dias) s[k] = s[k]! + 1;
  }
  return s;
}

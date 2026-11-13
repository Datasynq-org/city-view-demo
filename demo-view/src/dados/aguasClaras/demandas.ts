/**
 * As demandas reais de Águas Claras, como a demo as usa. O arquivo ao lado
 * (`aguas-claras.json`) é uma leitura única do mapa público do site parceiro
 * dfaguasclaras.com.br, já limpa (`limpar.ts`); para refazer, ver
 * `scripts/baixar-aguas-claras.ts`.
 *
 * O que o dado tem: tipo, descrição, lugar, status, órgão e data de criação.
 * O que **não** tem: a data de resolução (por isso nada de tempo até resolver
 * nem de prazo) e quem relatou (relatos não são pessoas).
 */
import bruto from './aguas-claras.json';
import type { Arquivo, DemandaReal, StatusDoSite } from './limpar';

export const ARQUIVO = bruto as unknown as Arquivo;
export const DEMANDAS: readonly DemandaReal[] = ARQUIVO.demandas;

/** Quando o site foi lido: é o "agora" da fonte real. */
export const LIDO_EM = Date.parse(ARQUIVO.lidoEm);

/** "13/11/2026": a data da leitura, para o selo e para a origem. */
export const dataDaLeitura = () => new Date(LIDO_EM).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

export const ROTULO_DO_STATUS: Record<StatusDoSite, string> = { pendente: 'Pendente', encaminhado: 'Encaminhado', em_progresso: 'Em andamento', finalizado: 'Finalizado' };

/** Para o site, só "finalizado" é resolvido. O resto segue aberto. */
export const estaAberta = (d: Pick<DemandaReal, 'status'>) => d.status !== 'finalizado';

/**
 * O órgão do site casado com o catálogo da demo, quando é o mesmo órgão. Quem
 * não está no catálogo entra com identificador próprio (os nomes ficam em
 * `inteligencia/casos.ts`, junto das outras fontes de fora do catálogo).
 */
const ORGAO_DO_SITE: [RegExp, string][] = [
  [/^NOVACAP/i, 'novacap'],
  [/^ADMINISTRA/i, 'administracoes'],
  [/^DETRAN/i, 'detran'],
  [/^NEOENERGIA/i, 'neoenergia'],
  [/^PMDF/i, 'pmdf'],
  [/^CEB/i, 'ceb-ipes'],
  [/^SSP/i, 'ssp'],
  [/^DF LEGAL/i, 'dflegal'],
  [/^DF Livre/i, 'df-livre-de-carcacas'],
  [/^SLU/i, 'slu'],
  [/^CAESB/i, 'caesb'],
  [/^SEMOB/i, 'semob'],
  [/^SEDES/i, 'sedes'],
  [/^VIGIL/i, 'vigilancia'],
];

export const SEM_ORGAO = 'sem-orgao';

export function orgaoDaDemanda(d: Pick<DemandaReal, 'orgao'>): string {
  if (!d.orgao) return SEM_ORGAO;
  return ORGAO_DO_SITE.find(([regra]) => regra.test(d.orgao!))?.[1] ?? SEM_ORGAO;
}

/** "Obras / Manutenção" → "obras-manutencao": o assunto, para o agrupamento. */
export const assuntoDoTipo = (tipo: string) =>
  tipo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z]+/g, '-')
    .replace(/^-|-$/g, '');

export interface Numeros {
  total: number;
  abertas: number;
  porStatus: { status: StatusDoSite; n: number }[];
  porTipo: { tipo: string; n: number; finalizadas: number }[];
  porOrgao: { orgaoId: string; n: number; finalizadas: number }[];
  /** Demandas criadas em cada mês, do primeiro ao último ("2024-09"). */
  porMes: { mes: string; n: number }[];
  comFoto: number;
}

/** O que o dado sustenta: volume, status, tipo, órgão e a série por mês. */
export function numeros(demandas: readonly DemandaReal[] = DEMANDAS): Numeros {
  const conta = <K extends string>(chave: (d: DemandaReal) => K) => {
    const m = new Map<K, { n: number; finalizadas: number }>();
    for (const d of demandas) {
      const v = m.get(chave(d)) ?? { n: 0, finalizadas: 0 };
      v.n++;
      if (!estaAberta(d)) v.finalizadas++;
      m.set(chave(d), v);
    }
    return [...m].sort((a, b) => b[1].n - a[1].n);
  };
  const meses = new Map<string, number>();
  for (const d of demandas) meses.set(d.criadaEm.slice(0, 7), (meses.get(d.criadaEm.slice(0, 7)) ?? 0) + 1);
  const porMes: { mes: string; n: number }[] = [];
  const ordenados = [...meses.keys()].sort();
  if (ordenados.length) {
    let [ano, mes] = ordenados[0]!.split('-').map(Number) as [number, number];
    const fim = ordenados.at(-1)!;
    for (;;) {
      const chave = `${ano}-${String(mes).padStart(2, '0')}`;
      porMes.push({ mes: chave, n: meses.get(chave) ?? 0 });
      if (chave >= fim) break;
      if (++mes > 12) [ano, mes] = [ano + 1, 1];
    }
  }
  return {
    total: demandas.length,
    abertas: demandas.filter(estaAberta).length,
    porStatus: conta((d) => d.status).map(([status, v]) => ({ status, n: v.n })),
    porTipo: conta((d) => d.tipo).map(([tipo, v]) => ({ tipo, ...v })),
    porOrgao: conta(orgaoDaDemanda).map(([orgaoId, v]) => ({ orgaoId, ...v })),
    porMes,
    comFoto: demandas.filter((d) => d.comFoto).length,
  };
}

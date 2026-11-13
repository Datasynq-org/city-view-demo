/**
 * "Pergunte à cidade" (magno 7.2; CV-DEM-002, A3), na versão que cabe na demo:
 * **perguntas prontas**, respondidas com contas de verdade sobre a base
 * SIMULADA. Não há modelo de linguagem aqui: a pergunta livre, falada ou
 * escrita, precisa de um, e segue por fazer.
 *
 * Cada resposta diz a conta que fez, traz os números e, quando faz sentido, o
 * mapa. Funções puras.
 */
import { inicioDoDia } from '../dados/gerador';
import type { Incidente, Instante } from '../dominio/incidente';
import { ORGAO_POR_ID, TIPO_POR_ID } from '../dominio/orgaos';
import { REGIAO_POR_ID } from '../dominio/ras';
import { entre, porOrgao, repetidos } from '../indicadores/gestao';
import { duracao, numero, percentual } from '../indicadores/indicadores';
import { foraDoNormal, perfis } from '../indicadores/regioes';
import type { Tela } from '../navegacao';

const DIA = 86_400_000;

export interface Resposta {
  /** A resposta em uma frase. */
  texto: string;
  /** Os números que sustentam a frase, do maior para o menor. */
  itens: { nome: string; valor: string }[];
  /** A conta feita, dita em palavras. */
  conta: string;
  /** O mapa que responde, quando a resposta é sobre regiões. */
  mapa?: { valores: Map<string, number | null>; rotulo: string; formato: (v: number) => string };
  /** Onde ver mais. */
  ver: { tela: Tela; nome: string };
}

export interface Contexto {
  incidentes: readonly Incidente[];
  agora: Instante;
}

export interface Pergunta {
  id: string;
  pergunta: string;
  responder: (c: Contexto) => Resposta;
}

const nomeDaRa = (id: string) => REGIAO_POR_ID[id]?.nome ?? id;
const sinal = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(Math.round(v * 100))}%`;

/** As duas últimas semanas (de 7 dias cheios até agora), por uma chave. */
function semanaContraSemana(c: Contexto, chave: (i: Incidente) => string | null): Map<string, { agora: number; antes: number }> {
  const m = new Map<string, { agora: number; antes: number }>();
  for (const i of c.incidentes) {
    if (i.criadoEm > c.agora || i.criadoEm <= c.agora - 14 * DIA) continue;
    const k = chave(i);
    if (k === null) continue;
    const v = m.get(k) ?? { agora: 0, antes: 0 };
    if (i.criadoEm > c.agora - 7 * DIA) v.agora++;
    else v.antes++;
    m.set(k, v);
  }
  return m;
}

export const PERGUNTAS: Pergunta[] = [
  {
    id: 'sossego',
    pergunta: 'Onde a perturbação do sossego cresceu esta semana?',
    responder: (c) => {
      const porRa = semanaContraSemana(c, (i) => (i.tipoId === 'sossego' ? i.local.raId : null));
      // Só entra quem tem volume para a variação dizer alguma coisa.
      const lista = [...porRa].filter(([, v]) => v.antes >= 8).map(([ra, v]) => ({ ra, ...v, variacao: v.agora / v.antes - 1 })).sort((a, b) => b.variacao - a.variacao);
      const subiram = lista.filter((l) => l.variacao > 0.1).slice(0, 4);
      return {
        texto: subiram.length ? `Cresceu mais em ${subiram.slice(0, 3).map((l) => nomeDaRa(l.ra)).join(', ')}.` : 'Não cresceu de forma relevante em nenhuma região esta semana.',
        itens: (subiram.length ? subiram : lista.slice(0, 4)).map((l) => ({ nome: nomeDaRa(l.ra), valor: `${numero(l.agora)} chamados · ${sinal(l.variacao)}` })),
        conta: 'Chamados de perturbação do sossego nos últimos 7 dias contra os 7 anteriores, região por região. Regiões com menos de 8 chamados na semana anterior ficam de fora.',
        mapa: { valores: new Map(lista.map((l) => [l.ra, l.variacao])), rotulo: 'Variação sobre a semana anterior', formato: sinal },
        ver: { tela: 'regioes', nome: 'Regiões' },
      };
    },
  },
  {
    id: 'fora-do-prazo',
    pergunta: 'Qual órgão está segurando mais a fila?',
    responder: (c) => {
      const linhas = porOrgao(c.incidentes, c.agora, 7).filter((l) => l.chamados >= 30).map((l) => ({ ...l, parte: l.foraDoPrazo / l.chamados })).sort((a, b) => b.parte - a.parte);
      const pior = linhas[0];
      return {
        texto: pior ? `${ORGAO_POR_ID[pior.orgaoId]?.sigla ?? pior.orgaoId}: ${percentual(pior.parte)} dos chamados da semana estão abertos além do prazo.` : 'Nenhum órgão com volume para comparar.',
        itens: linhas.slice(0, 4).map((l) => ({ nome: ORGAO_POR_ID[l.orgaoId]?.sigla ?? l.orgaoId, valor: `${percentual(l.parte)} fora do prazo · ${numero(l.foraDoPrazo)} de ${numero(l.chamados)}` })),
        conta: 'Dos chamados abertos nos últimos 7 dias, a parte que continua aberta além do prazo do tipo, em cada órgão. Pela parte, não pelo total: quem atende mais gente não é, por isso, o pior.',
        ver: { tela: 'gestao', nome: 'Gestão' },
      };
    },
  },
  {
    id: 'espera',
    pergunta: 'Que região espera mais para ser atendida?',
    responder: (c) => {
      const fim = inicioDoDia(c.agora) + DIA;
      const p = perfis(entre(c.incidentes, fim - 30 * DIA, fim)).regioes.filter((r) => r.tempo !== null && r.chamados >= 60).sort((a, b) => b.tempo! - a.tempo!);
      const pior = p[0];
      return {
        texto: pior ? `${nomeDaRa(pior.ra)}: metade dos chamados leva até ${duracao(pior.tempo)} para ser resolvida.` : 'Sem regiões com volume para comparar.',
        itens: p.slice(0, 4).map((r) => ({ nome: nomeDaRa(r.ra), valor: `${duracao(r.tempo)} · ${percentual(r.noPrazo)} no prazo` })),
        conta: 'Mediana do tempo até resolver, nos últimos 30 dias, entre as regiões com pelo menos 60 chamados.',
        mapa: { valores: new Map(p.map((r) => [r.ra, r.tempo])), rotulo: 'Metade resolvida em até', formato: (v) => duracao(v) },
        ver: { tela: 'regioes', nome: 'Regiões' },
      };
    },
  },
  {
    id: 'o-que-cresceu',
    pergunta: 'O que mais cresceu no DF esta semana?',
    responder: (c) => {
      const porTipo = semanaContraSemana(c, (i) => i.tipoId);
      const lista = [...porTipo].filter(([, v]) => v.antes >= 60).map(([tipo, v]) => ({ tipo, ...v, variacao: v.agora / v.antes - 1 })).sort((a, b) => b.variacao - a.variacao);
      const nome = (t: string) => TIPO_POR_ID[t]?.nome ?? t;
      return {
        texto: lista[0] ? `${nome(lista[0].tipo)}: ${sinal(lista[0].variacao)} sobre a semana anterior.` : 'Nenhum tipo com volume para comparar.',
        itens: lista.slice(0, 4).map((l) => ({ nome: nome(l.tipo), valor: `${numero(l.agora)} chamados · ${sinal(l.variacao)}` })),
        conta: 'Chamados de cada tipo nos últimos 7 dias contra os 7 anteriores, entre os tipos com pelo menos 60 chamados na semana anterior.',
        ver: { tela: 'previsoes', nome: 'Previsões' },
      };
    },
  },
  {
    id: 'parecidos',
    pergunta: 'Quantos chamados falam da mesma coisa?',
    responder: (c) => {
      const fim = inicioDoDia(c.agora) + DIA;
      const semana = entre(c.incidentes, fim - 7 * DIA, fim);
      const n = repetidos(semana);
      return {
        texto: `${numero(n)} dos ${numero(semana.length)} chamados da semana (${percentual(semana.length ? n / semana.length : 0)}) são parecidos com outro: mesmo tipo, a menos de 150 m e de 24 h.`,
        itens: [
          { nome: 'Chamados da semana', valor: numero(semana.length) },
          { nome: 'Parecidos com outro', valor: numero(n) },
        ],
        conta: 'Regra simples, para valer na base inteira: mesmo tipo, a menos de 150 m e de 24 h um do outro. Os incidentes da Inteligência usam uma conta mais fina, que também cruza órgãos.',
        ver: { tela: 'inteligencia', nome: 'Inteligência' },
      };
    },
  },
  {
    id: 'fora-do-normal',
    pergunta: 'Onde a cidade saiu do normal?',
    responder: (c) => {
      const f = foraDoNormal(c.incidentes, c.agora);
      const fora = [...f].filter(([, v]) => v.fora).sort((a, b) => b[1].razao! - a[1].razao!);
      return {
        texto: fora.length ? `${fora.map(([ra]) => nomeDaRa(ra)).slice(0, 3).join(', ')}: mais chamados que o normal da própria região.` : 'Nenhuma região fora do próprio normal esta semana.',
        itens: fora.slice(0, 4).map(([ra, v]) => ({ nome: nomeDaRa(ra), valor: `${numero(v.atual)} chamados · ${sinal(v.razao! - 1)} sobre o esperado` })),
        conta: 'Últimos 7 dias contra a média das 3 semanas anteriores de cada região, descontada a mudança do DF inteiro. Só conta a alta que passa do vaivém do acaso.',
        mapa: { valores: new Map([...f].map(([ra, v]) => [ra, v.razao === null ? null : v.razao - 1])), rotulo: 'Sobre o esperado da região', formato: sinal },
        ver: { tela: 'sala', nome: 'Sala de situação' },
      };
    },
  },
];

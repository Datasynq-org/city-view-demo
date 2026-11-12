/**
 * Operação: o segundo sinal da cidade (magno 7.1). Além das demandas, cada
 * órgão tem os seus sistemas, e eles sabem coisas que o cidadão não relata: a
 * rede que caiu, a fila que cresceu, o canal que está lento. É a observabilidade
 * de tecnologia de onde a conversa de 10/11 parte ("você pergunta para o cara da
 * rede, o cara da rede fala não, está tudo certo", ATA 97–98), levada à cidade.
 *
 * PROPOSTA e SIMULADO: os indicadores, os valores e os nomes dos sistemas são
 * ilustrativos. A entrada de dados de operação na proposta ainda depende de
 * validação (magno 9.3); cada órgão teria de liberar o que mostra aqui.
 */

export type SituacaoDoSinal = 'normal' | 'atencao' | 'fora';

export const ROTULO_DO_SINAL: Record<SituacaoDoSinal, string> = { normal: 'Normal', atencao: 'Atenção', fora: 'Fora do normal' };

/** Os três olhares sobre o sistema de um órgão. */
export type Grupo = 'rede' | 'servico' | 'sistema';
export const NOME_DO_GRUPO: Record<Grupo, string> = { rede: 'Qualidade da rede', servico: 'Qualidade do serviço', sistema: 'Saúde do sistema' };

export interface Indicador {
  id: string;
  grupo: Grupo;
  nome: string;
  valor: number;
  unidade: string;
  /** O limite do normal e de que lado ele fica. */
  limite: number;
  sentido: 'ate' | 'pelo-menos';
  situacao: SituacaoDoSinal;
}

export interface SistemaDoOrgao {
  orgaoId: string;
  sigla: string;
  /** Nome genérico do sistema: a demo não afirma qual produto cada órgão usa. */
  sistema: string;
  indicadores: Indicador[];
  simulado: true;
}

export type Cenario = 'normal' | 'apagao';

/** Passou do limite: atenção. Passou em mais da metade: fora do normal. */
export function situacaoDe(valor: number, limite: number, sentido: Indicador['sentido']): SituacaoDoSinal {
  const excesso = sentido === 'ate' ? (valor - limite) / Math.max(limite, 1e-9) : (limite - valor) / Math.max(limite, 1e-9);
  if (excesso <= 0) return 'normal';
  return excesso > 0.5 ? 'fora' : 'atencao';
}

type Linha = [id: string, grupo: Grupo, nome: string, unidade: string, limite: number, sentido: Indicador['sentido'], normal: number, noApagao?: number];

const SERVICO_E_SISTEMA = (fila: number, prazo: number): Linha[] => [
  ['fila', 'servico', 'Fila de atendimento', 'chamados', fila * 1.4, 'ate', fila],
  ['no-prazo', 'servico', 'Atendidos no prazo', '%', 70, 'pelo-menos', prazo],
  ['disponibilidade', 'sistema', 'Disponibilidade do canal', '%', 99, 'pelo-menos', 99.7],
  ['resposta', 'sistema', 'Tempo de resposta do sistema', 's', 2, 'ate', 0.8],
];

const TABELA: Record<string, { sigla: string; sistema: string; linhas: Linha[] }> = {
  neoenergia: {
    sigla: 'Neoenergia',
    sistema: 'Sistema de operação da rede de distribuição',
    linhas: [
      ['sem-energia', 'rede', 'Clientes sem energia', 'clientes', 800, 'ate', 310, 18_400],
      ['alimentadores', 'rede', 'Alimentadores desligados', '', 0, 'ate', 0, 3],
      ['religamento', 'rede', 'Tempo médio de religamento', 'h', 4, 'ate', 2.6, 9.5],
      ['fila', 'servico', 'Fila de atendimento', 'chamados', 400, 'ate', 280, 678],
      ['no-prazo', 'servico', 'Atendidos no prazo', '%', 70, 'pelo-menos', 81, 52],
      ['disponibilidade', 'sistema', 'Disponibilidade do canal', '%', 99, 'pelo-menos', 99.6, 99.4],
      ['resposta', 'sistema', 'Tempo de resposta do sistema', 's', 2, 'ate', 0.9, 2.6],
    ],
  },
  'ceb-ipes': {
    sigla: 'CEB IPes',
    sistema: 'Sistema de gestão da iluminação pública',
    linhas: [
      ['pontos-apagados', 'rede', 'Pontos de luz apagados', 'pontos', 2500, 'ate', 1890],
      ['ordens', 'rede', 'Ordens de serviço abertas', 'ordens', 1500, 'ate', 1120],
      ['troca', 'rede', 'Prazo médio de troca', 'dias', 3, 'ate', 4],
      ...SERVICO_E_SISTEMA(520, 74),
    ],
  },
  caesb: {
    sigla: 'CAESB',
    sistema: 'Sistema de operação da rede de água e esgoto',
    linhas: [
      ['pressao', 'rede', 'Setores com pressão baixa', 'setores', 4, 'ate', 2],
      ['interrupcoes', 'rede', 'Interrupções ativas', '', 3, 'ate', 1],
      ['vazamentos', 'rede', 'Vazamentos em reparo', '', 60, 'ate', 41],
      ...SERVICO_E_SISTEMA(690, 78),
    ],
  },
};

export const ORGAOS_COM_OPERACAO = Object.keys(TABELA);

/** O que o sistema de um órgão mostraria. `null` para quem a demo não simula. */
export function operacaoDoOrgao(orgaoId: string, cenario: Cenario = 'normal'): SistemaDoOrgao | null {
  const t = TABELA[orgaoId];
  if (!t) return null;
  return {
    orgaoId,
    sigla: t.sigla,
    sistema: t.sistema,
    simulado: true,
    indicadores: t.linhas.map(([id, grupo, nome, unidade, limite, sentido, normal, noApagao]) => {
      const valor = cenario === 'apagao' && noApagao !== undefined ? noApagao : normal;
      return { id, grupo, nome, valor, unidade, limite, sentido, situacao: situacaoDe(valor, limite, sentido) };
    }),
  };
}

/** O pior sinal do sistema: é o que aparece no resumo. */
export function piorSinal(s: SistemaDoOrgao): SituacaoDoSinal {
  if (s.indicadores.some((i) => i.situacao === 'fora')) return 'fora';
  return s.indicadores.some((i) => i.situacao === 'atencao') ? 'atencao' : 'normal';
}

const numero = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
export const valorDe = (i: Indicador) => `${numero(i.valor)}${i.unidade === '%' ? '%' : i.unidade ? ` ${i.unidade}` : ''}`;
export const normalDe = (i: Indicador) => `normal: ${i.sentido === 'ate' ? 'até' : 'pelo menos'} ${numero(i.limite)}${i.unidade === '%' ? '%' : i.unidade ? ` ${i.unidade}` : ''}`;

/**
 * O que uma pessoa decide sobre cada sugestão da IA (magno 7.2): toda sugestão
 * nasce "sugerida"; alguém confirma ou descarta. Ao confirmar, há uma janela
 * curta para cancelar antes de os órgãos serem avisados.
 * Funções puras: o relógio vem de fora.
 */
export type Situacao = 'sugerido' | 'enviando' | 'confirmado' | 'descartado';

export const ROTULO_DA_SITUACAO: Record<Situacao, string> = {
  sugerido: 'Sugerido pela IA',
  enviando: 'Confirmado · enviando',
  confirmado: 'Confirmado',
  descartado: 'Descartado',
};

export const MOTIVOS_DE_DESCARTE = ['Não é o mesmo problema', 'Já está sendo tratado', 'Dados insuficientes'] as const;
export type MotivoDeDescarte = (typeof MOTIVOS_DE_DESCARTE)[number];

/** Quanto tempo a pessoa tem para cancelar depois de confirmar, em ms. */
export const JANELA_DE_ENVIO = 5000;

export interface Decisao {
  situacao: Situacao;
  /** Até quando dá para cancelar o envio (só em "enviando"). */
  envioAte?: number;
  motivo?: MotivoDeDescarte;
}

/** Por código do incidente. Quem não está aqui continua "sugerido". */
export type Decisoes = Readonly<Record<string, Decisao>>;

export const SUGERIDO: Decisao = { situacao: 'sugerido' };
export const decisaoDe = (d: Decisoes, codigo: string): Decisao => d[codigo] ?? SUGERIDO;

const com = (d: Decisoes, codigo: string, decisao: Decisao): Decisoes => ({ ...d, [codigo]: decisao });
const sem = (d: Decisoes, codigo: string): Decisoes => {
  const { [codigo]: _fora, ...resto } = d;
  return resto;
};

/** Confirmar só vale para o que está sugerido. Abre a janela de cancelamento. */
export function confirmar(d: Decisoes, codigo: string, agora: number): Decisoes {
  return decisaoDe(d, codigo).situacao === 'sugerido' ? com(d, codigo, { situacao: 'enviando', envioAte: agora + JANELA_DE_ENVIO }) : d;
}

/** Cancelar o envio, enquanto a janela está aberta: volta a ser sugestão. */
export function cancelarEnvio(d: Decisoes, codigo: string, agora: number): Decisoes {
  const atual = decisaoDe(d, codigo);
  return atual.situacao === 'enviando' && agora < (atual.envioAte ?? 0) ? sem(d, codigo) : d;
}

/** Passada a janela, o que estava "enviando" fica confirmado. */
export function avancar(d: Decisoes, agora: number): Decisoes {
  let mudou = false;
  const novo: Record<string, Decisao> = {};
  for (const [codigo, dec] of Object.entries(d)) {
    if (dec.situacao === 'enviando' && agora >= (dec.envioAte ?? 0)) {
      novo[codigo] = { situacao: 'confirmado' };
      mudou = true;
    } else novo[codigo] = dec;
  }
  return mudou ? novo : d;
}

/** Descartar exige um motivo, e só vale para o que está sugerido. */
export function descartar(d: Decisoes, codigo: string, motivo: MotivoDeDescarte): Decisoes {
  return decisaoDe(d, codigo).situacao === 'sugerido' ? com(d, codigo, { situacao: 'descartado', motivo }) : d;
}

/** Desfazer um descarte: a sugestão volta à fila. */
export function desfazerDescarte(d: Decisoes, codigo: string): Decisoes {
  return decisaoDe(d, codigo).situacao === 'descartado' ? sem(d, codigo) : d;
}

/** Milissegundos que faltam para o envio (0 se não está enviando). */
export const faltaParaEnviar = (dec: Decisao, agora: number) => (dec.situacao === 'enviando' ? Math.max(0, (dec.envioAte ?? 0) - agora) : 0);

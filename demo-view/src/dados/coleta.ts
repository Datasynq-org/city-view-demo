/**
 * A coleta guiada do WhatsApp, para o modo "experimente" da jornada (I2).
 *
 * Segue a ordem e os textos do assistente que já funciona numa região do DF
 * (dfac, `api/ouvidoria_flow.py`, commit `0eec955`), com o nome trocado para
 * City View e sem os detalhes daquele piloto: nome, tipo do problema,
 * descrição, localização, conferência do local, ponto de referência, foto,
 * resumo e CONFIRMAR. Como lá, é um roteiro fixo: sem rede e sem IA.
 *
 * Diferenças da demo: o pino do WhatsApp vira um clique no mapa, a foto é uma
 * imagem de exemplo, e o código é `TESTE-`, como as simulações do dfac, que
 * nunca são enviadas a lugar nenhum.
 */

// ---------------------------------------------------------------- textos (do piloto, com o nome City View)

/** `WELCOME_WHATSAPP` (sem a opção de reunião, que no WhatsApp fica de fora). */
export const BOAS_VINDAS = `Olá! Sou o assistente do City View🙋‍♀️🌆.
Como posso ajudar?

1. Registrar uma demanda
2. Acompanhar uma demanda
4. CANCELAR AGENTE E FALAR COM HUMANO

Responda com o número da opção.`;

export const TIPOS_DE_PROBLEMA = ['Trânsito', 'Segurança', 'Obras/manutenção', 'Iluminação', 'Outros'] as const;
export type TipoDeProblema = (typeof TIPOS_DE_PROBLEMA)[number];

export const PERGUNTAS = {
  nome: 'Qual seu nome?',
  tipo: `Informe o tipo do problema:
1. Trânsito🚦
2. Segurança🔐
3. Obras/manutenção🚧
4. Iluminação💡
5. Outros⚙️

Responda com o número da opção.`,
  outros: 'Especifique qual é o tipo de problema.',
  descricao: 'Descreva objetivamente o que aconteceu.',
  local:
    'Compartilhe a *localização* do fato usando o botão de localização do WhatsApp. ' +
    'Se não estiver no local, pesquise o lugar na barra de pesquisa desse recurso ' +
    'e compartilhe a localização encontrada.',
  confirmaLocal: 'Essa localização é a do problema relatado? Responda SIM ou NÃO.',
  referencia: 'Informe um ponto de referência próximo ao local.',
  foto: 'Agora envie uma foto do problema.',
} as const;

export const CORRIGIR_LOCAL = `Vamos corrigir o local. ${PERGUNTAS.local}`;
export const PARA_ATENDIMENTO_HUMANO =
  'Registrei seu pedido de atendimento pela equipe. Agente cancelado. A automação ficará pausada para atendimento humano, ' +
  'se quiser voltar ao agente digite apenas "agente" .';
export const SEM_ATENDIMENTOS = 'Você ainda não tem atendimentos registrados neste contato.';
export const ESCOLHA_A_OPCAO = 'Responda com o número da opção.';
export const AVISO_ACOMPANHAMENTO =
  'Acompanhamento fornecido pela nossa equipe, sem acesso à conta usada no portal. ' +
  'A situação interna não substitui a resposta oficial do órgão.';

/** Mensagem depois do CONFIRMAR (`api/ouvidoria_service.py`). */
export const confirmado = (codigo: string) =>
  `Dados confirmados e salvos. Código da coleta: ${codigo}. ` +
  'Ainda nenhum protocolo oficial foi gerado, pois necessita de revisão dos analistas. ' +
  'Para consultar a coleta, responda ACOMPANHAR.';

/** Nota da demo, fora do roteiro do dfac: aparece como aviso do sistema, nunca como fala do assistente. */
export const NOTA_DA_DEMO = {
  local: 'Na demo, toque no mapa para marcar o local.',
  foto: 'Na demo, use o botão de foto de exemplo.',
};

// ---------------------------------------------------------------- estado

export type Etapa =
  | 'inicio'
  | 'menu'
  | 'nome'
  | 'tipo'
  | 'outros'
  | 'descricao'
  | 'local'
  | 'confirmaLocal'
  | 'referencia'
  | 'foto'
  | 'resumo'
  | 'concluido'
  | 'humano';

export interface Relato {
  nome: string;
  tipo: TipoDeProblema | null;
  detalheDoTipo: string;
  descricao: string;
  /** [lon, lat] */
  local: [number, number] | null;
  localConferido: boolean;
  referencia: string;
  foto: boolean;
}

export interface EstadoDaColeta {
  etapa: Etapa;
  relato: Relato;
  codigo: string | null;
}

export interface Entrada {
  texto?: string;
  local?: [number, number];
  foto?: boolean;
}

export interface Resposta {
  estado: EstadoDaColeta;
  /** Falas do assistente, na ordem. */
  respostas: string[];
  /** Avisos da demo (não são falas do assistente). */
  notas: string[];
}

export const RELATO_VAZIO: Relato = {
  nome: '',
  tipo: null,
  detalheDoTipo: '',
  descricao: '',
  local: null,
  localConferido: false,
  referencia: '',
  foto: false,
};

export const inicial = (): EstadoDaColeta => ({ etapa: 'inicio', relato: { ...RELATO_VAZIO }, codigo: null });

/** Como o dfac normaliza: minúsculas, sem acento, espaços simples, sem pontuação no fim. */
export const normalizar = (t: string) =>
  t
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .join(' ')
    .replace(/[.!?]+$/, '')
    .trim();

/** Parte de `HUMAN_HANDOFF_COMMANDS`. */
const PEDE_HUMANO = new Set(['atendente', 'humano', 'falar com atendente', 'falar com humano', 'cancelar', 'sair', 'desistir', 'cancelar agente', 'cancelar agente e falar com humano']);

const casas = (n: number) => n.toFixed(5);

/** O resumo antes do CONFIRMAR (`summary` do dfac). */
export function resumo(r: Relato): string {
  const local = r.local ? `${casas(r.local[1])}, ${casas(r.local[0])} (local do fato confirmado)` : '';
  const detalhe = r.detalheDoTipo ? ` — ${r.detalheDoTipo}` : '';
  return (
    `Confira os dados:\n\nNome: ${r.nome}\nLocal do fato: ${local}` +
    `\nPonto de referência: ${r.referencia}\nTipo de problema: ${r.tipo ?? ''}${detalhe}` +
    `\nDescrição: ${r.descricao}\nFoto: recebida\n\n` +
    'Para registrar, responda CONFIRMAR. Você também pode responder CORRIGIR RELATO, CORRIGIR LOCAL ou CANCELAR.'
  );
}

/** A primeira coisa que falta, na ordem do dfac (`next_problem_first_step`). */
function proximaPergunta(r: Relato): { etapa: Etapa; pergunta: string; nota?: string } {
  if (!r.nome) return { etapa: 'nome', pergunta: PERGUNTAS.nome };
  if (!r.tipo) return { etapa: 'tipo', pergunta: PERGUNTAS.tipo };
  if (r.tipo === 'Outros' && !r.detalheDoTipo) return { etapa: 'outros', pergunta: PERGUNTAS.outros };
  if (r.descricao.length < 12) return { etapa: 'descricao', pergunta: PERGUNTAS.descricao };
  if (!r.local) return { etapa: 'local', pergunta: PERGUNTAS.local, nota: NOTA_DA_DEMO.local };
  if (!r.localConferido) return { etapa: 'confirmaLocal', pergunta: PERGUNTAS.confirmaLocal };
  if (!r.referencia) return { etapa: 'referencia', pergunta: PERGUNTAS.referencia };
  if (!r.foto) return { etapa: 'foto', pergunta: PERGUNTAS.foto, nota: NOTA_DA_DEMO.foto };
  return { etapa: 'resumo', pergunta: resumo(r) };
}

function seguir(estado: EstadoDaColeta, relato: Relato, antes: string[] = []): Resposta {
  const p = proximaPergunta(relato);
  return { estado: { ...estado, etapa: p.etapa, relato }, respostas: [...antes, p.pergunta], notas: p.nota ? [p.nota] : [] };
}

const fala = (estado: EstadoDaColeta, ...respostas: string[]): Resposta => ({ estado, respostas, notas: [] });

function tipoEscolhido(texto: string): TipoDeProblema | null {
  const t = normalizar(texto);
  const n = Number(t);
  if (Number.isInteger(n) && n >= 1 && n <= 5) return TIPOS_DE_PROBLEMA[n - 1]!;
  return TIPOS_DE_PROBLEMA.find((x) => normalizar(x) === t) ?? null;
}

/** Um passo da conversa: o que o cidadão mandou e o que o assistente responde. */
export function avancar(estado: EstadoDaColeta, entrada: Entrada, codigo = 'TESTE-0000001'): Resposta {
  const texto = (entrada.texto ?? '').trim();
  const t = normalizar(texto);
  const r = estado.relato;

  if (estado.etapa !== 'inicio' && estado.etapa !== 'humano' && PEDE_HUMANO.has(t)) {
    return fala({ ...estado, etapa: 'humano' }, PARA_ATENDIMENTO_HUMANO);
  }

  switch (estado.etapa) {
    case 'inicio':
      return fala({ ...estado, etapa: 'menu' }, BOAS_VINDAS);
    case 'menu':
      if (t === '1') return seguir(estado, { ...RELATO_VAZIO });
      if (t === '2') return fala(estado, SEM_ATENDIMENTOS);
      if (t === '4') return fala({ ...estado, etapa: 'humano' }, PARA_ATENDIMENTO_HUMANO);
      return fala(estado, ESCOLHA_A_OPCAO);
    case 'nome':
      return texto ? seguir(estado, { ...r, nome: texto }) : seguir(estado, r);
    case 'tipo': {
      const tipo = tipoEscolhido(texto);
      return tipo ? seguir(estado, { ...r, tipo }) : fala(estado, PERGUNTAS.tipo);
    }
    case 'outros':
      return texto ? seguir(estado, { ...r, detalheDoTipo: texto }) : seguir(estado, r);
    case 'descricao':
      return seguir(estado, { ...r, descricao: texto.length >= 12 ? texto : '' });
    case 'local':
      return entrada.local ? seguir(estado, { ...r, local: entrada.local, localConferido: false }) : seguir(estado, r);
    case 'confirmaLocal':
      if (t === 'sim') return seguir(estado, { ...r, localConferido: true });
      if (t === 'nao') return { estado: { ...estado, etapa: 'local', relato: { ...r, local: null } }, respostas: [CORRIGIR_LOCAL], notas: [NOTA_DA_DEMO.local] };
      return fala(estado, 'Responda SIM se a localização enviada é a do fato, ou NÃO para corrigir.');
    case 'referencia':
      return texto ? seguir(estado, { ...r, referencia: texto }) : seguir(estado, r);
    case 'foto':
      return entrada.foto ? seguir(estado, { ...r, foto: true }) : seguir(estado, r);
    case 'resumo':
      if (t === 'confirmar') return fala({ ...estado, etapa: 'concluido', codigo }, confirmado(codigo));
      if (t === 'corrigir relato') return seguir(estado, { ...r, descricao: '' });
      if (t === 'corrigir local') return { estado: { ...estado, etapa: 'local', relato: { ...r, local: null, localConferido: false } }, respostas: [CORRIGIR_LOCAL], notas: [NOTA_DA_DEMO.local] };
      return fala(estado, resumo(r));
    case 'concluido':
      if (t === 'acompanhar') return fala(estado, acompanhamento(estado.codigo ?? codigo, 'aguardando revisão'));
      return fala(estado, BOAS_VINDAS);
    case 'humano':
      if (t === 'agente') return fala({ ...estado, etapa: 'menu' }, BOAS_VINDAS);
      return { estado, respostas: [], notas: ['A automação está pausada: uma pessoa da equipe responde. Digite "agente" para voltar.'] };
  }
}

/** A resposta ao ACOMPANHAR antes de haver protocolo (`format_tracking` do dfac). */
export function acompanhamento(codigo: string, situacao: string, destino?: string, protocolo?: string): string {
  const linhas = ['Seus atendimentos:', '', codigo, `Situação interna da equipe: ${situacao}.`];
  if (destino && protocolo) {
    linhas.push(`Destino: ${destino}.`, `Protocolo oficial: ${protocolo}.`, 'Situação oficial: ainda não confirmada por uma consulta.');
  } else linhas.push('Registro externo: ainda não confirmado.');
  return [...linhas, '', AVISO_ACOMPANHAMENTO].join('\n');
}

// ---------------------------------------------------------------- triagem

export type Destino = 'participadf' | 'portal-cidadao' | 'sem-destino';

export const NOME_DO_DESTINO: Record<Destino, string> = {
  participadf: 'Participa DF',
  'portal-cidadao': 'Portal do Cidadão',
  'sem-destino': 'Sem destino automático',
};

/**
 * Parte do catálogo de palavras do dfac (`ACTIVITY_KEYWORDS`, em
 * `api/demand_triage.py`): a atividade do Portal do Cidadão e os termos que o
 * cidadão de fato escreve.
 */
export const ATIVIDADES: { atividade: string; termos: string[] }[] = [
  { atividade: 'TAPA BURACO', termos: ['buraco', 'buraqueira', 'cratera', 'asfalto esburacado', 'tapa buraco'] },
  { atividade: 'BOCA DE LOBO', termos: ['boca de lobo', 'bocas de lobo', 'grelha', 'bueiro de esquina'] },
  { atividade: 'BUEIRO', termos: ['bueiro', 'bueiros'] },
  { atividade: 'REDE DE ESGOTO', termos: ['esgoto', 'fossa', 'efluente', 'agua servida'] },
  { atividade: 'ILUMINAÇÃO PÚBLICA', termos: ['poste', 'lampada', 'luminaria', 'iluminacao', 'luz da rua', 'poste apagado', 'escuro'] },
  { atividade: 'PODA DE ÁRVORE', termos: ['arvore', 'poda', 'galho', 'arvores'] },
  { atividade: 'MATO ALTO', termos: ['mato alto', 'matagal', 'mato', 'capim alto', 'rocagem'] },
  { atividade: 'COLETA DE LIXO E RESÍDUOS', termos: ['coleta de lixo', 'lixo nao recolhido', 'caminhao do lixo', 'lixo acumulado', 'entulho na rua'] },
  { atividade: 'ANIMAIS SOLTOS', termos: ['animal solto', 'animais soltos', 'cavalo solto', 'cachorro solto', 'gado solto'] },
  { atividade: 'VEÍCULO ABANDONADO', termos: ['carro abandonado', 'veiculo abandonado', 'sucata'] },
  { atividade: 'CALÇADA', termos: ['calcada', 'passeio quebrado'] },
  { atividade: 'SEMÁFORO', termos: ['semaforo', 'sinaleiro', 'farol de transito'] },
  { atividade: 'FAIXA DE PEDESTRE', termos: ['faixa de pedestre', 'faixa de pedestres'] },
  { atividade: 'PARQUE INFANTIL', termos: ['parquinho', 'parque infantil', 'playground'] },
  { atividade: 'GALERIA DE ÁGUA POTÁVEL', termos: ['agua potavel', 'vazamento de agua'] },
];

/** `ACTIVITY_DESTINATION`: o que não está aqui vai ao Portal do Cidadão. */
const DESTINO_DA_ATIVIDADE: Record<string, Destino> = {
  'ILUMINAÇÃO PÚBLICA': 'participadf',
  'VEÍCULO ABANDONADO': 'participadf',
  'REDE DE ESGOTO': 'sem-destino',
  'GALERIA DE ÁGUA POTÁVEL': 'sem-destino',
};

export interface Triagem {
  atividade: string | null;
  termos: string[];
  destino: Destino;
}

/** Vence a atividade com mais termos distintos encontrados; empate, a primeira da lista. */
export function triar(texto: string): Triagem {
  const t = normalizar(texto);
  let melhor: Triagem = { atividade: null, termos: [], destino: 'sem-destino' };
  for (const a of ATIVIDADES) {
    const achados = a.termos.filter((termo) => t.includes(termo));
    if (achados.length > melhor.termos.length) melhor = { atividade: a.atividade, termos: achados, destino: DESTINO_DA_ATIVIDADE[a.atividade] ?? 'portal-cidadao' };
  }
  return melhor;
}

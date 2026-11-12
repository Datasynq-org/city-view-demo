/**
 * Jornadas de um chamado (I2): o caminho de um relato pelas cinco camadas, passo
 * a passo, com o que existe hoje (dfac, Águas Claras) e o que é proposta.
 *
 * A conversa do WhatsApp é gerada pela mesma coleta do modo "experimente"
 * (`dados/coleta.ts`, com os textos do dfac). Nomes, protocolos e números são
 * FICTÍCIOS; os protocolos levam "(fictício)" na tela.
 */
import { type EstadoDfac, PECA_POR_ID, type SituacaoPeca } from '../dominio/ponte';
import type { Situacao } from '../dominio/incidente';
import { type Cenario, operacaoDoOrgao, type SistemaDoOrgao } from '../dominio/operacao';
import { REGIAO_POR_ID } from '../dominio/ras';
import { acompanhamento, AVISO_ACOMPANHAMENTO, avancar, type Entrada, type EstadoDaColeta, inicial, NOME_DO_DESTINO, type Relato, type Triagem, triar } from './coleta';

export type Autor = 'cidadao' | 'assistente' | 'nota';

export interface Mensagem {
  de: Autor;
  texto: string;
  anexo?: 'local' | 'foto';
  /** Texto escrito pela equipe para a proposta (não é do dfac). Vem rotulado. */
  proposta?: boolean;
}

export type Painel =
  | { tipo: 'conversa'; coletado: [string, string][] }
  | { tipo: 'triagem'; triagem: Triagem; repetidos: string }
  | { tipo: 'revisao'; original: string; refinado: string; classificacao: string; destino: string; repetidos: string }
  | { tipo: 'envio'; destino: string; campos: [string, string][]; protocolo: [string, string] }
  | { tipo: 'acompanhamento'; consulta: string }
  | { tipo: 'incidente'; campos: [string, string][] }
  | { tipo: 'campos'; rotulo: string; campos: [string, string][] }
  | { tipo: 'operacao'; sistemas: SistemaDoOrgao[]; leitura: string }
  | { tipo: 'cruzamento'; sinais: { orgao: string; canal: string; quantidade: number; descricao: string }[]; leitura: string; acao: string }
  | { tipo: 'saidas'; itens: { quem: string; ve: string; situacao: SituacaoPeca }[] };

export interface Passo {
  id: string;
  /** A peça da ponte (`dominio/ponte.ts`) que este passo ilumina. */
  peca: string;
  titulo: string;
  texto: string;
  mensagens: Mensagem[];
  /** Estado interno no dfac, quando a demanda já existe. */
  dfac?: EstadoDfac;
  /** Estado no modelo único de incidente. */
  situacao?: Situacao;
  painel: Painel;
}

export interface Jornada {
  id: 'poste' | 'apagao' | 'experimente';
  /** Onde a demanda nasce: num canal do City View ou no sistema que o órgão já tem. */
  origem: 'whatsapp' | 'orgao';
  /** Quando nasce no sistema do órgão: o registro de lá, no lugar da conversa. */
  registro?: { sistema: string; nota: string; campos: [string, string][] };
  nome: string;
  resumo: string;
  ra: string;
  /** [lon, lat] do relato. */
  local: [number, number];
  /** Outros relatos no mapa (o cruzamento do caso do apagão). */
  vizinhos: [number, number][];
  passos: Passo[];
}

export const situacaoDoPasso = (p: Passo): SituacaoPeca => PECA_POR_ID[p.peca]?.situacao ?? 'proposta';

// ---------------------------------------------------------------- conversa pela coleta

/** Roda a coleta com as entradas do cidadão e devolve a conversa em mensagens. */
export function conversar(entradas: Entrada[], estado: EstadoDaColeta = inicial(), codigo = 'CAP-0000123'): { mensagens: Mensagem[]; estado: EstadoDaColeta } {
  const mensagens: Mensagem[] = [];
  for (const e of entradas) {
    if (e.texto) mensagens.push({ de: 'cidadao', texto: e.texto });
    if (e.local) mensagens.push({ de: 'cidadao', texto: 'Localização', anexo: 'local' });
    if (e.foto) mensagens.push({ de: 'cidadao', texto: 'Foto', anexo: 'foto' });
    const r = avancar(estado, e, codigo);
    estado = r.estado;
    mensagens.push(...r.respostas.map((texto) => ({ de: 'assistente' as const, texto })));
  }
  return { mensagens, estado };
}

const coletado = (r: Relato, telefone = '***1234'): [string, string][] => [
  ['Nome', r.nome],
  ['Telefone', `${telefone} (pseudonimizado; nunca pedimos CPF)`],
  ['Tipo', r.tipo ?? '–'],
  ['Relato', r.descricao],
  ['Local', r.local ? `${r.local[1].toFixed(5)}, ${r.local[0].toFixed(5)}` : '–'],
  ['Referência', r.referencia],
  ['Foto', r.foto ? 'recebida, guardada em área privada' : '–'],
];

/** O aviso que o dfac manda quando o andamento muda (`queue_notification`). */
function aviso(codigo: string, situacao: string, destino: string, protocolo: string, portal: string, consulta: string): string {
  return [
    'Houve uma atualização no acompanhamento da sua demanda.',
    '',
    codigo,
    `Situação interna da equipe: ${situacao}.`,
    `Destino: ${destino}.`,
    `Protocolo oficial: ${protocolo}.`,
    `Situação informada pelo portal: ${portal}.`,
    `Última consulta confirmada: ${consulta} (horário de Brasília).`,
    '',
    AVISO_ACOMPANHAMENTO,
    'Para interromper esses avisos, digite DESATIVAR AVISOS.',
  ].join('\n');
}

// ---------------------------------------------------------------- a operação do sistema do órgão

/**
 * O que o sistema do próprio órgão já sabe (magno 7.1, "operação"): a rede, o
 * serviço e a saúde do sistema. Proposta, com valores simulados.
 */
function passoDeOperacao(orgaoId: string, cenario: Cenario, situacao: Situacao, leitura: string): Passo {
  const sistema = operacaoDoOrgao(orgaoId, cenario)!;
  return {
    id: 'operacao',
    peca: orgaoId === 'ceb-ipes' ? 'iluminadf' : orgaoId,
    titulo: 'O que o sistema do órgão já sabe',
    texto: `Proposta: além dos chamados, o conector lê a operação do sistema da ${sistema.sigla}: a qualidade da rede, a qualidade do serviço e a saúde do próprio sistema. O cidadão não relata nada disso, mas o órgão já mede.`,
    mensagens: [],
    situacao,
    painel: { tipo: 'operacao', sistemas: [sistema], leitura },
  };
}

// ---------------------------------------------------------------- a parte comum: da coleta ao protocolo

interface Base {
  relato: Relato;
  codigo: string;
  conversa: Mensagem[];
  refinado: string;
  protocoloCeb?: string;
  protocolo: string;
  repetidos: string;
}

function passosAteOProtocolo(b: Base): Passo[] {
  const tri = triar(b.relato.descricao);
  const destino = NOME_DO_DESTINO[tri.destino];
  const iluminacao = tri.atividade === 'ILUMINAÇÃO PÚBLICA';
  const abertura = b.conversa.slice(0, 2);
  const coleta = b.conversa.slice(2);
  const passos: Passo[] = [
    {
      id: 'canal',
      peca: 'whatsapp',
      titulo: 'O cidadão fala onde já está',
      texto: 'Chama o assistente no WhatsApp, ou no canal que a gestão escolher. Não precisa baixar app, criar conta nem saber qual órgão cuida do quê.',
      mensagens: abertura,
      painel: { tipo: 'conversa', coletado: [] },
    },
    {
      id: 'coleta',
      peca: 'coleta',
      titulo: 'Coleta guiada',
      texto: 'Um roteiro fixo pede o que o órgão vai precisar: tipo, relato, local conferido, referência e foto. No fim, o cidadão confere e confirma.',
      mensagens: coleta,
      dfac: 'received',
      situacao: 'recebido',
      painel: { tipo: 'conversa', coletado: coletado(b.relato) },
    },
    {
      id: 'triagem',
      peca: 'triagem',
      titulo: 'Triagem',
      texto: tri.atividade
        ? `As palavras do relato apontam a atividade "${tri.atividade}" e o destino ${destino}. É uma sugestão: quem decide é a pessoa da revisão.`
        : 'Nenhuma palavra conhecida: a demanda vai sem sugestão, e a pessoa da revisão classifica.',
      mensagens: [],
      dfac: 'ready_for_review',
      situacao: 'em-triagem',
      painel: { tipo: 'triagem', triagem: tri, repetidos: b.repetidos },
    },
    {
      id: 'revisao',
      peca: 'revisao',
      titulo: 'Revisão humana',
      texto: 'Uma pessoa da equipe confere relato, foto, classificação e local. A IA só reescreve o relato no tamanho do portal quando a pessoa pede; o original fica guardado.',
      mensagens: [],
      dfac: 'approved',
      situacao: 'em-triagem',
      painel: { tipo: 'revisao', original: b.relato.descricao, refinado: b.refinado, classificacao: tri.atividade ?? 'a classificar', destino, repetidos: b.repetidos },
    },
  ];
  if (iluminacao && b.protocoloCeb) {
    passos.push({
      id: 'ceb',
      peca: 'iluminadf',
      titulo: 'Protocolo da CEB (IluminaDF)',
      texto: 'A iluminação passa antes pela CEB: o IluminaDF devolve o protocolo que o Participa DF exige. A integração está pronta, com o envio desligado.',
      mensagens: [],
      dfac: 'sending',
      situacao: 'em-triagem',
      painel: { tipo: 'envio', destino: 'IluminaDF (CEB)', campos: [['Atividade', 'Iluminação pública'], ['Local', REGIAO_POR_ID['aguas-claras']?.nome ?? ''], ['Foto', '1, escolhida na revisão']], protocolo: ['Protocolo da CEB', `${b.protocoloCeb} (fictício)`] },
    });
  }
  passos.push({
    id: 'protocolo',
    peca: tri.destino === 'participadf' ? 'participadf' : 'portal-cidadao',
    titulo: `Protocolo no ${destino}`,
    texto: `A demanda é aberta no sistema que o órgão já usa, do jeito que ele está acostumado. O protocolo oficial volta para a demanda.`,
    mensagens: [],
    dfac: 'submitted',
    situacao: 'encaminhado',
    painel: {
      tipo: 'envio',
      destino,
      campos: [['Relato', b.refinado], ['Assunto', tri.atividade ?? 'a classificar'], ...(b.protocoloCeb ? ([['Protocolo da CEB', `${b.protocoloCeb} (fictício)`]] as [string, string][]) : [])],
      protocolo: ['Protocolo oficial', `${b.protocolo} (fictício)`],
    },
  });
  return passos;
}

// ---------------------------------------------------------------- caso A · poste apagado em Águas Claras

const ENTRADAS_POSTE: Entrada[] = [
  { texto: 'Oi' },
  { texto: '1' },
  { texto: 'Marina' },
  { texto: '4' },
  { texto: 'Poste apagado há uma semana na rua da quadra 107. À noite a rua fica toda escura.' },
  { local: [-48.0236, -15.8376] },
  { texto: 'SIM' },
  { texto: 'Em frente à padaria' },
  { foto: true },
  { texto: 'CONFIRMAR' },
];

function jornadaDoPoste(): Jornada {
  const codigo = 'CAP-0000123';
  const { mensagens, estado } = conversar(ENTRADAS_POSTE, inicial(), codigo);
  const protocolo = 'OUV-2026-0048213';
  const base: Base = {
    relato: estado.relato,
    codigo,
    conversa: mensagens,
    refinado: 'Poste apagado há uma semana na rua da quadra 107, em frente à padaria. A rua fica escura à noite.',
    protocoloCeb: 'CEB-2026-117740',
    protocolo,
    repetidos: 'Nenhum relato parecido a menos de 30 m',
  };
  return {
    id: 'poste',
    origem: 'whatsapp',
    nome: 'Poste apagado em Águas Claras',
    resumo: 'O caminho que já funciona, de ponta a ponta, numa região.',
    ra: 'aguas-claras',
    local: [-48.0236, -15.8376],
    vizinhos: [],
    passos: [
      ...passosAteOProtocolo(base),
      {
        id: 'acompanhamento',
        peca: 'acompanhamento',
        titulo: 'O status volta ao cidadão',
        texto: 'Uma rotina consulta o portal. Quando o andamento muda, o cidadão que pediu os avisos recebe a atualização, sem precisar perguntar.',
        mensagens: [
          { de: 'cidadao', texto: 'ATIVAR AVISOS' },
          { de: 'assistente', texto: aviso(codigo, 'em acompanhamento', 'Participa DF', protocolo, 'em análise pelo órgão', '14/11/2026 às 09:12') },
        ],
        dfac: 'tracking',
        situacao: 'em-atendimento',
        painel: { tipo: 'acompanhamento', consulta: 'A cada poucas horas, o andamento é lido no portal do órgão' },
      },
      {
        id: 'resolvido',
        peca: 'acompanhamento',
        titulo: 'Resolvido, e o cidadão fica sabendo',
        texto: 'A resposta do órgão chega ao WhatsApp e ao mapa público de Águas Claras, onde o ponto fica verde.',
        mensagens: [{ de: 'assistente', texto: aviso(codigo, 'resolvida', 'Participa DF', protocolo, 'atendida: lâmpada substituída', '18/11/2026 às 16:40') }],
        dfac: 'resolved',
        situacao: 'resolvido',
        painel: { tipo: 'acompanhamento', consulta: 'A situação oficial é a do órgão; a interna nunca a substitui' },
      },
      {
        id: 'incidente',
        peca: 'incidente',
        titulo: 'Vira um incidente, no mesmo formato de todos',
        texto: 'Proposta: a demanda entra no modelo único do City View, igual a um chamado do 155 ou do app da CEB. É o que permite somar, comparar e cruzar.',
        mensagens: [],
        situacao: 'resolvido',
        painel: {
          tipo: 'incidente',
          campos: [
            ['id', 'INC-2026-000123'],
            ['origem', `WhatsApp · ${codigo} · ${protocolo} (fictício)`],
            ['local', 'Águas Claras · quadra 107'],
            ['tipo e área', 'Lâmpada apagada · energia e iluminação'],
            ['órgão', 'CEB IPes'],
            ['situação', 'resolvido'],
            ['datas', 'recebido 12/11 · encaminhado 13/11 · resolvido 18/11'],
            ['vínculos', 'nenhum'],
          ],
        },
      },
      {
        id: 'saidas',
        peca: 'cruzar',
        titulo: 'Três visões do mesmo dado',
        texto: 'O mesmo incidente aparece para quem governa, para quem gere a área e para o cidadão, cada um no grau de detalhe que a gestão escolher.',
        mensagens: [],
        situacao: 'resolvido',
        painel: {
          tipo: 'saidas',
          itens: [
            { quem: 'Governadora', ve: 'Entra na sala de situação e na velocidade da gestão', situacao: 'proposta' },
            { quem: 'Gestor da iluminação', ve: 'Conta no painel da área e no prazo da CEB', situacao: 'proposta' },
            { quem: 'Cidadão', ve: 'Recebe o aviso e vê o ponto verde no mapa público', situacao: 'existe' },
          ],
        },
      },
    ],
  };
}

// ---------------------------------------------------------------- caso B · a rua no escuro era falta de energia

const ENTRADAS_APAGAO: Entrada[] = [
  { texto: 'Boa noite' },
  { texto: '1' },
  { texto: 'José' },
  { texto: '4' },
  { texto: 'A rua inteira está no escuro desde a chuva de ontem. Nenhum poste acende.' },
  { local: [-47.6461, -15.6468] },
  { texto: 'SIM' },
  { texto: 'Perto da feira do Arapoanga' },
  { foto: true },
  { texto: 'CONFIRMAR' },
];

function jornadaDoApagao(): Jornada {
  const codigo = 'CAP-0000124';
  const { mensagens, estado } = conversar(ENTRADAS_APAGAO, inicial(), codigo);
  const base: Base = {
    relato: estado.relato,
    codigo,
    conversa: mensagens,
    refinado: 'Rua inteira sem iluminação desde a chuva de ontem, perto da feira do Arapoanga. Nenhum poste acende.',
    protocoloCeb: 'CEB-2026-117912',
    protocolo: 'OUV-2026-0048290',
    repetidos: '2 relatos parecidos a menos de 30 m, nas últimas 24 h',
  };
  const ate = passosAteOProtocolo(base);
  return {
    id: 'apagao',
    origem: 'whatsapp',
    nome: 'A rua no escuro era falta de energia',
    resumo: 'Parece iluminação, é energia: o que só aparece quando se olha o todo.',
    ra: 'arapoanga',
    local: [-47.6461, -15.6468],
    vizinhos: [
      [-47.6512, -15.6431],
      [-47.6398, -15.6502],
      [-47.6555, -15.6199],
      [-47.6489, -15.6247],
      [-47.6602, -15.6305],
      [-47.6421, -15.6362],
    ],
    passos: [
      ...ate,
      {
        id: 'incidente',
        peca: 'incidente',
        titulo: 'Vira um incidente, no mesmo formato de todos',
        texto: 'Proposta: o relato entra no modelo único junto com os chamados do 116 da Neoenergia, do Detran e da Defesa Civil, que hoje estão em filas separadas.',
        mensagens: [],
        situacao: 'encaminhado',
        painel: {
          tipo: 'incidente',
          campos: [
            ['id', 'INC-2026-000124'],
            ['origem', `WhatsApp · ${codigo}`],
            ['local', 'Arapoanga · perto da feira'],
            ['tipo e área', 'Lâmpada apagada · energia e iluminação'],
            ['órgão', 'CEB IPes'],
            ['situação', 'encaminhado'],
            ['vínculos', 'a cruzar'],
          ],
        },
      },
      passoDeOperacao('neoenergia', 'apagao', 'encaminhado', 'A rede da Neoenergia mostra 3 alimentadores desligados, na mesma área e na mesma hora dos chamados. Não é lâmpada: é rede.'),
      {
        id: 'cruzamento',
        peca: 'cruzar',
        titulo: 'Parece iluminação, é falta de energia',
        texto: 'Proposta: no mesmo lugar e nas mesmas horas, outros órgãos recebem centenas de chamados. Eles nasceram nos sistemas de cada órgão e entraram pelo mesmo caminho. A inteligência liga as filas e explica por quê; uma pessoa confirma.',
        mensagens: [],
        situacao: 'encaminhado',
        painel: {
          tipo: 'cruzamento',
          sinais: [
            { orgao: 'Neoenergia', canal: '116', quantidade: 640, descricao: 'Falta de energia depois do temporal' },
            { orgao: 'Neoenergia', canal: '116', quantidade: 38, descricao: 'Fio partido ou rede caída' },
            { orgao: 'Detran-DF', canal: 'Site', quantidade: 51, descricao: 'Semáforos apagados em 7 cruzamentos' },
            { orgao: 'Defesa Civil', canal: '199', quantidade: 14, descricao: 'Árvore caída sobre a rede' },
            { orgao: 'CEB IPes', canal: 'WhatsApp e 155', quantidade: 3, descricao: 'Rua no escuro, postes que não acendem' },
          ],
          leitura: 'Não é lâmpada queimada: o bairro está sem energia desde o temporal. A troca de lâmpada não resolveria, e cada fila repete a mesma explicação ao cidadão.',
          acao: 'Vincular ao incidente de falta de energia da Neoenergia ("mesmo incidente que") e mandar uma mensagem única, com a previsão de religamento.',
        },
      },
      {
        id: 'aviso-unico',
        peca: 'neoenergia',
        titulo: 'Uma resposta para todos',
        texto: 'Proposta: confirmado o vínculo, quem relatou recebe a mesma explicação e a previsão da Neoenergia. A Neoenergia tem canal próprio: a ligação com ela é um conector a construir.',
        mensagens: [
          {
            de: 'assistente',
            proposta: true,
            texto:
              'Atualização da sua demanda CAP-0000124: a falta de luz na sua rua faz parte de uma queda de energia no Arapoanga depois do temporal. ' +
              'A Neoenergia já está no local; a previsão de religamento é hoje, até as 22h. Você não precisa abrir outro chamado.',
          },
        ],
        situacao: 'em-atendimento',
        painel: {
          tipo: 'saidas',
          itens: [
            { quem: 'Governadora', ve: '1 incidente no lugar de 746 chamados em 4 órgãos', situacao: 'proposta' },
            { quem: 'Gestores', ve: 'Neoenergia como responsável principal; Detran e Defesa Civil avisados', situacao: 'proposta' },
            { quem: 'Cidadão', ve: 'Uma explicação e uma previsão, sem repetir o chamado', situacao: 'proposta' },
          ],
        },
      },
    ],
  };
}

// ---------------------------------------------------------------- experimente

/** A jornada montada com o relato que a pessoa digitou na demo. Nada é enviado. */
export function jornadaDoRelato(estado: EstadoDaColeta, conversa: Mensagem[]): Jornada {
  const r = estado.relato;
  const codigo = estado.codigo ?? 'TESTE-0000001';
  const base: Base = {
    relato: r,
    codigo,
    conversa,
    refinado: r.descricao.length > 200 ? `${r.descricao.slice(0, 197)}…` : r.descricao,
    protocoloCeb: 'CEB-0000000',
    protocolo: 'TESTE (simulação: nada é enviado)',
    repetidos: 'Sem consulta: é uma simulação',
  };
  const passos = passosAteOProtocolo(base).map((p) =>
    p.id === 'protocolo' ? { ...p, titulo: 'Protocolo no órgão (simulado)', texto: 'Na simulação, como no dfac, demandas de teste nunca são enviadas a um órgão. O caminho é o mesmo de uma demanda real.' } : p,
  );
  passos.push({
    id: 'acompanhamento',
    peca: 'acompanhamento',
    titulo: 'O status volta ao cidadão',
    texto: 'Ao responder ACOMPANHAR, o cidadão vê a situação interna e, quando houver, o protocolo oficial.',
    mensagens: [
      { de: 'cidadao', texto: 'ACOMPANHAR' },
      { de: 'assistente', texto: acompanhamento(codigo, 'aguardando revisão') },
    ],
    dfac: 'ready_for_review',
    situacao: 'em-triagem',
    painel: { tipo: 'acompanhamento', consulta: 'Simulação: a demanda espera a revisão' },
  });
  return {
    id: 'experimente',
    origem: 'whatsapp',
    nome: 'O seu relato',
    resumo: 'O mesmo caminho, com o que você digitou. Nada sai desta tela.',
    ra: '',
    local: r.local ?? [-48.0236, -15.8376],
    vizinhos: [],
    passos,
  };
}

export const JORNADAS: Jornada[] = [jornadaDoPoste(), jornadaDoApagao()];

// ---------------------------------------------------------------- a mesma demanda, nascendo no sistema do órgão

const METODOS = 'API · robô autorizado · troca de arquivos';

/** Os passos comuns de quem nasce fora: o registro do órgão, o conector e o incidente único. */
function entradaAlheia(o: { pecaOrigem: string; pecaConector: string; sistema: string; orgao: string; orgaoId: string; cenario: Cenario; leitura: string; incidente: [string, string][] }): Passo[] {
  return [
    {
      id: 'origem',
      peca: o.pecaOrigem,
      titulo: `A demanda nasce no ${o.sistema}`,
      texto: `O cidadão usa o canal que já conhece, e ${o.orgao} trabalha como sempre trabalhou. Ninguém precisa saber que o City View existe.`,
      mensagens: [],
      situacao: 'recebido',
      painel: { tipo: 'campos', rotulo: 'O que muda para o órgão', campos: [['Sistema', 'o mesmo'], ['Atendimento', 'o mesmo'], ['Protocolo', 'o do próprio órgão']] },
    },
    {
      id: 'conector',
      peca: o.pecaConector,
      titulo: 'O conector lê o chamado',
      texto: 'Proposta: o City View se liga ao sistema do órgão, em qualquer tecnologia, e passa a enxergar o chamado. Só lê o que a gestão autorizar; robô, só com autorização formal do órgão.',
      mensagens: [],
      situacao: 'em-triagem',
      painel: { tipo: 'campos', rotulo: 'Como se conecta', campos: [['Métodos', METODOS], ['Quem aponta os sistemas', 'A gestão, na implantação'], ['O que o órgão muda', 'Nada']] },
    },
    { ...passoDeOperacao(o.orgaoId, o.cenario, 'em-triagem', o.leitura), peca: o.pecaConector },
    {
      id: 'incidente',
      peca: 'incidente',
      titulo: 'Vira um incidente, no mesmo formato de todos',
      texto: 'Proposta: daqui para frente, é igual a uma demanda que nasceu no WhatsApp. O mesmo formato, a mesma inteligência, as mesmas visões.',
      mensagens: [],
      situacao: 'encaminhado',
      painel: { tipo: 'incidente', campos: o.incidente },
    },
  ];
}

function alheiaDoPoste(): Jornada {
  const base = JORNADAS[0]!;
  return {
    ...base,
    origem: 'orgao',
    nome: 'Poste apagado, registrado no 155 da CEB',
    resumo: 'A mesma demanda, nascendo no canal do órgão. O City View cuida dali para frente.',
    registro: {
      sistema: '155 · CEB Iluminação Pública',
      nota: 'Registro no sistema do órgão (fictício). O City View não muda nada aqui.',
      campos: [['Protocolo', 'CEB-2026-117802 (fictício)'], ['Serviço', 'Lâmpada apagada'], ['Local', 'Águas Claras · quadra 107'], ['Aberto em', '12/11/2026, 19:42'], ['Situação', 'Em atendimento']],
    },
    passos: [
      ...entradaAlheia({
        pecaOrigem: 'origem-155',
        pecaConector: 'iluminadf',
        sistema: '155 da CEB',
        orgao: 'a CEB',
        orgaoId: 'ceb-ipes',
        cenario: 'normal',
        leitura: 'A rede de iluminação está num dia comum; o prazo médio de troca passa um pouco do combinado.',
        incidente: [['id', 'INC-2026-000125'], ['origem', '155 · CEB-2026-117802 (fictício)'], ['local', 'Águas Claras · quadra 107'], ['tipo e área', 'Lâmpada apagada · energia e iluminação'], ['órgão', 'CEB IPes'], ['situação', 'encaminhado'], ['vínculos', 'nenhum']],
      }),
      { ...base.passos.at(-1)!, situacao: 'em-atendimento' },
    ],
  };
}

function alheiaDoApagao(): Jornada {
  const base = JORNADAS[1]!;
  const fim = base.passos.slice(-2);
  return {
    ...base,
    origem: 'orgao',
    nome: 'Falta de energia, registrada no 116 da Neoenergia',
    resumo: 'Um dos 640 chamados do 116. Nasceu fora, e chega ao mesmo incidente.',
    registro: {
      sistema: '116 · Neoenergia',
      nota: 'Registro no sistema do órgão (fictício). O City View não muda nada aqui.',
      campos: [['Protocolo', 'NEO-2026-5520918 (fictício)'], ['Serviço', 'Falta de energia'], ['Local', 'Arapoanga · perto da feira'], ['Aberto em', '11/11/2026, 21:05'], ['Situação', 'Equipe a caminho']],
    },
    passos: [
      ...entradaAlheia({
        pecaOrigem: 'origem-116',
        pecaConector: 'neoenergia',
        sistema: '116 da Neoenergia',
        orgao: 'a Neoenergia',
        orgaoId: 'neoenergia',
        cenario: 'apagao',
        leitura: 'A rede mostra 3 alimentadores desligados na área do chamado: ele é um entre milhares de clientes sem energia.',
        incidente: [['id', 'INC-2026-000126'], ['origem', '116 · NEO-2026-5520918 (fictício)'], ['local', 'Arapoanga · perto da feira'], ['tipo e área', 'Falta de energia · energia e iluminação'], ['órgão', 'Neoenergia'], ['situação', 'encaminhado'], ['vínculos', 'a cruzar']],
      }),
      fim[0]!,
      { ...fim[1]!, mensagens: [], texto: 'Proposta: confirmado o vínculo, todos os que relataram, em qualquer canal, recebem a mesma explicação e a previsão da Neoenergia, cada um por onde entrou.' },
    ],
  };
}

/** Os mesmos casos, com a demanda nascendo no sistema do órgão. */
export const JORNADAS_ALHEIAS: Jornada[] = [alheiaDoPoste(), alheiaDoApagao()];

export const jornadaDe = (id: 'poste' | 'apagao', origem: Jornada['origem']): Jornada => (origem === 'orgao' ? JORNADAS_ALHEIAS : JORNADAS).find((j) => j.id === id)!;

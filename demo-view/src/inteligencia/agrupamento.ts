/**
 * Agrupamento de chamados em incidentes sugeridos (camada 5, I3).
 *
 * A ideia vem do grafo da demo exploratória (`City-view`,
 * `apps/sala-de-situacao/src/data/grafo-neural.ts`, do Calebe): dois chamados
 * se ligam quando falam de assuntos afins, perto um do outro e em horas
 * próximas. A força da ligação é o produto dos três:
 *
 *   força = afinidade × e^(−d²/raio²) × e^(−|Δh|/janela)
 *
 * Chamados ligados acima do limiar formam um grupo (union-find), e cada grupo
 * vira um incidente SUGERIDO, que uma pessoa confirma ou descarta (magno 7.2).
 * Reescrito para lon/lat e para os casos desta demo; tudo aqui é simulação.
 */
import { mulberry32, normal, type Rand } from '../dados/aleatorio';
import { sortearPonto } from '../dados/pontos';
import { TIPOS } from '../dominio/orgaos';
import { GRAUS_POR_UNIDADE, REGIAO_POR_ID, REGIOES } from '../dominio/ras';
import { type Caso, CASO_POR_ID, CASOS, fonteDoSinal, posicaoDoCaso, type Severidade, type Sinal, type TipoCaso } from './casos';

// ---------------------------------------------------------------- chamados

export interface Chamado {
  id: string;
  /** Do que o chamado fala. Chamados de assuntos iguais ou afins podem se ligar. */
  assunto: string;
  orgaoId: string;
  canal: string;
  descricao: string;
  /** [lon, lat] */
  ponto: [number, number];
  /** Há quantas horas chegou. */
  horas: number;
  /** Quantos chamados reais este ponto representa (as filas grandes vêm resumidas). */
  peso: number;
  /** De qual caso roteirizado veio (só para montar o texto depois; o agrupamento não lê). */
  casoId: string | null;
}

/** Até onde um assunto alcança: raio, em metros, e janela de tempo, em horas. */
export interface Alcance {
  raio: number;
  janela: number;
}

/**
 * O roteiro de cada caso: o raio do lugar e, para cada sinal de chamado (na
 * ordem do caso), o assunto e a janela de tempo em que os chamados chegaram.
 */
const ROTEIRO: Record<string, { raio: number; sinais: [assunto: string, janelaH: number][] }> = {
  'pedras-recanto': { raio: 420, sinais: [['pedras-na-pista', 288], ['roubo-pneu-furado', 216], ['carro-parado', 30]] },
  'sossego-ceilandia': { raio: 140, sinais: [['som-alto', 3], ['poluicao-sonora', 720], ['som-alto-reincidente', 672]] },
  'apagao-planaltina': { raio: 1500, sinais: [['falta-de-energia', 60], ['rede-caida', 60], ['semaforo-apagado', 48], ['arvore-na-rede', 66]] },
  'alagamento-vicente-pires': { raio: 320, sinais: [['boca-de-lobo', 720], ['entulho-no-meio-fio', 600], ['alagamento', 840]] },
  'iluminacao-samambaia': { raio: 400, sinais: [['poste-apagado', 504], ['roubo-a-transeunte', 336]] },
  'cadeia-taguatinga': { raio: 160, sinais: [['vazamento-na-rede', 336], ['buraco-no-asfalto', 240], ['queda-de-moto', 72]] },
  'dengue-sol-nascente': { raio: 900, sinais: [['descarte-irregular', 1080], ['foco-de-mosquito', 480], ['lotacao-na-saude', 360]] },
  'placas-aguas-claras': { raio: 120, sinais: [['placa-derrubada', 720], ['sinistro-com-vitima', 720]] },
  'agua-sao-sebastiao': { raio: 1300, sinais: [['falta-dagua', 168]] },
};

/** Alcance dos assuntos do dia a dia (o ruído): perto e recente. */
const ALCANCE_COMUM: Alcance = { raio: 260, janela: 30 };

const ALCANCE: Record<string, Alcance> = {};
/** Assuntos afins: os que, juntos no mesmo lugar e hora, costumam ser o mesmo fato ou ter a mesma causa. */
const AFINS = new Set<string>();
const par = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
for (const [id, r] of Object.entries(ROTEIRO)) {
  // A janela vale folgada: chamados do mesmo fato chegam espalhados no tempo.
  for (const [assunto, janela] of r.sinais) ALCANCE[`${id}:${assunto}`] = { raio: r.raio, janela: janela * 1.5 };
  for (const [a] of r.sinais) for (const [b] of r.sinais) if (a !== b) AFINS.add(par(`${id}:${a}`, `${id}:${b}`));
}

export const alcanceDe = (assunto: string): Alcance => ALCANCE[assunto] ?? ALCANCE_COMUM;

/** Assunto igual vale 1; assuntos afins, 0,85; o resto quase não se liga. */
export function afinidade(a: string, b: string): number {
  if (a === b) return 1;
  return AFINS.has(par(a, b)) ? 0.85 : 0.05;
}

/** Distância aproximada em metros entre dois pontos [lon, lat] (o DF é pequeno o bastante). */
export function metros(a: [number, number], b: [number, number]): number {
  const dx = (b[0] - a[0]) * 111_320 * Math.cos((a[1] * Math.PI) / 180);
  const dy = (b[1] - a[1]) * 110_540;
  return Math.hypot(dx, dy);
}

/** Em quantos pontos uma fila de `q` chamados aparece no mapa (as grandes vêm resumidas). */
const pontosDoSinal = (q: number) => Math.max(1, Math.min(q, 16, Math.round(Math.sqrt(q) * 1.6)));

function chamadosDoCaso(caso: Caso, rand: Rand): Chamado[] {
  const roteiro = ROTEIRO[caso.id];
  if (!roteiro) return [];
  const centro = posicaoDoCaso(caso);
  const [gx, gy] = GRAUS_POR_UNIDADE;
  const lista: Chamado[] = [];
  const deChamado = caso.sinais.filter((s) => fonteDoSinal(s) === 'chamado');
  deChamado.forEach((sinal, k) => {
    const [assunto, janela] = roteiro.sinais[k] ?? ['outros', 48];
    const n = pontosDoSinal(sinal.quantidade);
    for (let i = 0; i < n; i++) {
      // Espalhados em volta do lugar: um terço do raio de desvio, em unidades de 100 m.
      const sigma = roteiro.raio / 100 / 3;
      lista.push({
        id: `${caso.id}/${k}/${i}`,
        assunto: `${caso.id}:${assunto}`,
        orgaoId: sinal.orgaoId,
        canal: sinal.canal,
        descricao: sinal.descricao,
        ponto: [centro[0] + normal(rand) * sigma * gx, centro[1] + normal(rand) * sigma * gy],
        horas: caso.detectadoHaMin / 60 + rand() * janela,
        peso: sinal.quantidade / n,
        casoId: caso.id,
      });
    }
  });
  return lista;
}

/** O dia a dia da cidade: chamados avulsos, que não têm a ver uns com os outros. */
function ruido(n: number, rand: Rand): Chamado[] {
  const total = REGIOES.reduce((s, r) => s + r.populacao, 0);
  const lista: Chamado[] = [];
  for (let i = 0; i < n; i++) {
    let alvo = rand() * total;
    const ra = REGIOES.find((r) => (alvo -= r.populacao) <= 0) ?? REGIOES[0]!;
    const tipo = TIPOS[Math.floor(rand() * TIPOS.length)]!;
    lista.push({ id: `avulso/${i}`, assunto: tipo.id, orgaoId: tipo.orgaoId, canal: 'canal do órgão', descricao: tipo.nome, ponto: sortearPonto(ra, rand), horas: rand() * 72, peso: 1, casoId: null });
  }
  return lista;
}

export const SEMENTE = 20261112;

/** Os chamados da tela: os dos 9 casos e o ruído do dia a dia. A mesma semente dá sempre os mesmos. */
export function gerarChamados(semente = SEMENTE, avulsos = 220): Chamado[] {
  const rand = mulberry32(semente);
  return [...CASOS.flatMap((c) => chamadosDoCaso(c, rand)), ...ruido(avulsos, rand)];
}

// ---------------------------------------------------------------- ligações

export interface Ligacao {
  a: number;
  b: number;
  /** Força da ligação, de 0 a 1. */
  forca: number;
  /** As três partes da força. */
  assunto: number;
  espaco: number;
  tempo: number;
  /** Liga chamados de órgãos diferentes. */
  cruza: boolean;
}

/** Abaixo disto a ligação nem é guardada. */
const FORCA_MINIMA = 0.06;

/** Todas as ligações possíveis entre os chamados. Não depende do limiar. */
export function calcularLigacoes(ch: readonly Chamado[]): Ligacao[] {
  const ligacoes: Ligacao[] = [];
  for (let a = 0; a < ch.length; a++) {
    const A = ch[a]!;
    const alA = alcanceDe(A.assunto);
    for (let b = a + 1; b < ch.length; b++) {
      const B = ch[b]!;
      const assunto = afinidade(A.assunto, B.assunto);
      if (assunto < FORCA_MINIMA) continue;
      const alB = alcanceDe(B.assunto);
      const raio = Math.max(alA.raio, alB.raio);
      const d = metros(A.ponto, B.ponto);
      if (d > raio * 2.5) continue;
      const espaco = Math.exp(-(d * d) / (raio * raio));
      const tempo = Math.exp(-Math.abs(A.horas - B.horas) / Math.max(alA.janela, alB.janela));
      const forca = assunto * espaco * tempo;
      if (forca >= FORCA_MINIMA) ligacoes.push({ a, b, forca, assunto, espaco, tempo, cruza: A.orgaoId !== B.orgaoId });
    }
  }
  return ligacoes;
}

/** Sensibilidade (0 a 100) → limiar de força. Mais sensível, liga com menos. */
export const limiarDaSensibilidade = (sens: number) => 0.8 - 0.72 * (Math.min(100, Math.max(0, sens)) / 100);
export const SENSIBILIDADE_PADRAO = 60;

// ---------------------------------------------------------------- incidentes

/** AGR: vários relatos do mesmo fato. COR: fatos de órgãos diferentes com causa ou risco comum. */
export type TipoIncidente = 'AGR' | 'COR';
export const NOME_DO_TIPO: Record<TipoIncidente, string> = { AGR: 'Agrupamento', COR: 'Correlação' };

export interface Evidencia {
  orgaoId: string;
  canal: string;
  descricao: string;
  quantidade: number;
  fonte: 'chamado' | 'operação' | 'contexto';
}

export interface Incidente {
  /** `AGR-01`, `COR-02`… na ordem de urgência. */
  codigo: string;
  tipo: TipoIncidente;
  /** O caso roteirizado de onde vem o texto, quando há. */
  casoId: string | null;
  tipoDoCaso: TipoCaso | null;
  titulo: string;
  severidade: Severidade;
  raId: string | null;
  local: string;
  /** Índices dos chamados do grupo. */
  membros: number[];
  /** [lon, lat] */
  centro: [number, number];
  /** Soma dos pesos: quantos chamados reais o grupo reúne. */
  chamados: number;
  orgaos: string[];
  evidencias: Evidencia[];
  /** Raio real do grupo, em metros, e o intervalo de tempo, em horas. */
  raio: number;
  janela: number;
  /** De 0 a 1, com as três partes que a compõem (médias das ligações do grupo). */
  confianca: number;
  partes: { assunto: number; espaco: number; tempo: number };
  /** Por que a IA juntou, em uma frase, com os números do grupo. */
  motivo: string;
  /** De 0 a 100: ordena a fila. */
  urgencia: number;
  leitura: string;
  recomendacao: string[];
  ganho: string;
  linhaDoTempo: { quando: string; texto: string }[];
}

export interface Resultado {
  /** O grupo de cada chamado: índice em `incidentes`, ou −1 se ficou avulso. */
  grupo: Int32Array;
  incidentes: Incidente[];
  /** As ligações acima do limiar. */
  ligacoes: Ligacao[];
  /** Chamados reais (soma dos pesos) e quantos ficaram fora de qualquer grupo. */
  total: number;
  avulsos: number;
}

const PESO_DA_SEVERIDADE: Record<Severidade, number> = { crítico: 1, sério: 0.66, atenção: 0.33 };

const fmt = (n: number) => Math.round(n).toLocaleString('pt-BR');
const fmtDistancia = (m: number) => (m >= 950 ? `${(m / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km` : `${Math.max(10, Math.round(m / 10) * 10)} m`);
const fmtJanela = (h: number) => (h < 1.5 ? 'na mesma hora' : h < 48 ? `em ${Math.round(h)} horas` : `em ${Math.round(h / 24)} dias`);

function montar(ch: readonly Chamado[], membros: number[], internas: Ligacao[]): Omit<Incidente, 'codigo'> {
  const M = membros.map((i) => ch[i]!);
  const chamados = M.reduce((s, c) => s + c.peso, 0);
  const centro: [number, number] = [M.reduce((s, c) => s + c.ponto[0] * c.peso, 0) / chamados, M.reduce((s, c) => s + c.ponto[1] * c.peso, 0) / chamados];
  const raio = Math.max(...M.map((c) => metros(c.ponto, centro)));
  const janela = Math.max(...M.map((c) => c.horas)) - Math.min(...M.map((c) => c.horas));
  const orgaos = [...new Set(M.map((c) => c.orgaoId))];
  const media = (f: (l: Ligacao) => number) => (internas.length ? internas.reduce((s, l) => s + f(l), 0) / internas.length : 0);
  const partes = { assunto: media((l) => l.assunto), espaco: media((l) => l.espaco), tempo: media((l) => l.tempo) };

  // O caso de onde vem o texto: o da maioria dos chamados do grupo.
  const votos = new Map<string, number>();
  for (const c of M) if (c.casoId) votos.set(c.casoId, (votos.get(c.casoId) ?? 0) + 1);
  const [maisVotado, n] = [...votos].sort((a, b) => b[1] - a[1])[0] ?? [null, 0];
  const caso = maisVotado && n > M.length / 2 ? CASO_POR_ID[maisVotado]! : null;

  const tipo: TipoIncidente = orgaos.length > 1 || new Set(M.map((c) => c.assunto)).size > 1 ? 'COR' : 'AGR';
  // Mais chamados e ligações mais fortes dão mais confiança; nunca 100%: quem decide é uma pessoa.
  const confianca = Math.min(0.97, 0.45 + 0.4 * media((l) => l.forca) + 0.15 * Math.min(1, Math.log10(1 + chamados) / 2));
  const severidade: Severidade = caso?.severidade ?? 'atenção';
  const urgencia = Math.round(100 * Math.min(1, 0.5 * PESO_DA_SEVERIDADE[severidade] + 0.25 * Math.min(1, Math.log10(1 + chamados) / 3) + 0.15 * Math.min(1, (orgaos.length - 1) / 3) + 0.1 * Math.exp(-Math.min(...M.map((c) => c.horas)) / 96)));
  const motivo = `${fmt(chamados)} chamados de ${orgaos.length === 1 ? '1 órgão' : `${orgaos.length} órgãos`}, a até ${fmtDistancia(raio)} um do outro, ${fmtJanela(janela)}.`;

  if (caso) {
    const deChamado = caso.sinais.filter((s) => fonteDoSinal(s) === 'chamado');
    const evidencia = (s: Sinal): Evidencia => ({ orgaoId: s.orgaoId, canal: s.canal, descricao: s.descricao, quantidade: s.quantidade, fonte: fonteDoSinal(s) });
    return {
      tipo,
      casoId: caso.id,
      tipoDoCaso: caso.tipo,
      titulo: caso.titulo,
      severidade,
      raId: caso.raId,
      local: caso.local,
      membros,
      centro,
      chamados,
      orgaos,
      evidencias: [...deChamado.map(evidencia), ...caso.sinais.filter((s) => fonteDoSinal(s) !== 'chamado').map(evidencia)],
      raio,
      janela,
      confianca,
      partes,
      motivo,
      urgencia,
      leitura: caso.leitura,
      recomendacao: caso.recomendacao,
      ganho: caso.ganho,
      linhaDoTempo: caso.linhaDoTempo,
    };
  }

  // Grupo do dia a dia, sem caso escrito: o texto sai dos próprios números.
  const primeiro = M[0]!;
  const ra = REGIOES.find((r) => metros(r.rotulo, centro) === Math.min(...REGIOES.map((x) => metros(x.rotulo, centro)))) ?? null;
  const porOrgao = new Map<string, Evidencia>();
  for (const c of M) {
    const e = porOrgao.get(c.orgaoId) ?? { orgaoId: c.orgaoId, canal: c.canal, descricao: c.descricao, quantidade: 0, fonte: 'chamado' as const };
    e.quantidade += c.peso;
    porOrgao.set(c.orgaoId, e);
  }
  return {
    tipo,
    casoId: null,
    tipoDoCaso: null,
    titulo: `${fmt(chamados)} chamados parecidos: ${primeiro.descricao.toLowerCase()}`,
    severidade,
    raId: ra?.id ?? null,
    local: ra ? REGIAO_POR_ID[ra.id]!.nome : '',
    membros,
    centro,
    chamados,
    orgaos,
    evidencias: [...porOrgao.values()],
    raio,
    janela,
    confianca,
    partes,
    motivo,
    urgencia,
    leitura: 'Relatos do mesmo tipo, no mesmo lugar e em horas próximas: é provável que falem do mesmo fato.',
    recomendacao: ['Tratar como um só atendimento e responder a todos de uma vez.'],
    ganho: `${fmt(chamados - 1)} atendimento${chamados - 1 >= 1.5 ? 's' : ''} repetido${chamados - 1 >= 1.5 ? 's' : ''} a menos.`,
    linhaDoTempo: [],
  };
}

/** Junta os chamados ligados acima do limiar. Grupos de dois ou mais viram incidentes sugeridos. */
export function agrupar(ch: readonly Chamado[], todas: readonly Ligacao[], limiar = limiarDaSensibilidade(SENSIBILIDADE_PADRAO)): Resultado {
  const pai = Int32Array.from(ch, (_, i) => i);
  const raiz = (i: number): number => {
    while (pai[i] !== i) {
      pai[i] = pai[pai[i]!]!;
      i = pai[i]!;
    }
    return i;
  };
  const ligacoes = todas.filter((l) => l.forca >= limiar);
  for (const l of ligacoes) pai[raiz(l.a)] = raiz(l.b);

  const porRaiz = new Map<number, number[]>();
  ch.forEach((_, i) => {
    const r = raiz(i);
    (porRaiz.get(r) ?? porRaiz.set(r, []).get(r)!).push(i);
  });
  const montados = [...porRaiz.entries()]
    .filter(([, membros]) => membros.length >= 2)
    .map(([r, membros]) => montar(ch, membros, ligacoes.filter((l) => raiz(l.a) === r)))
    .sort((a, b) => b.urgencia - a.urgencia || b.chamados - a.chamados);

  const conta: Record<TipoIncidente, number> = { AGR: 0, COR: 0 };
  const incidentes: Incidente[] = montados.map((m) => ({ ...m, codigo: `${m.tipo}-${String(++conta[m.tipo]).padStart(2, '0')}` }));
  const grupo = new Int32Array(ch.length).fill(-1);
  incidentes.forEach((inc, k) => inc.membros.forEach((i) => (grupo[i] = k)));
  const total = ch.reduce((s, c) => s + c.peso, 0);
  const avulsos = ch.reduce((s, c, i) => s + (grupo[i] === -1 ? c.peso : 0), 0);
  return { grupo, incidentes, ligacoes, total, avulsos };
}

/**
 * Gerador determinístico dos dados SIMULADOS da demo. Nada aqui vem de sistema real.
 *
 * Dois estágios:
 * 1. Contagem diária de chamados por tipo × RA × dia, com sazonalidade de chuva,
 *    dia da semana e focos. Portado de `City-view/.../data/simulacao.ts`.
 * 2. Na janela mais recente, cada chamado vira um incidente no modelo único
 *    (`dominio/incidente.ts`), com hora, local, canal, situação e datas.
 *
 * O relógio entra por parâmetro e o calendário é o de Brasília, para que o
 * resultado não dependa da máquina onde roda.
 */
import { formatarId, type Incidente, type Instante, type Situacao } from '../dominio/incidente';
import { CANAL_CITY_VIEW, ORGAO_POR_ID, type Perfil, type Severidade, type TipoComOrgao, TIPOS } from '../dominio/orgaos';
import { PESOS_SIMULADOS, REGIOES } from '../dominio/ras';
import { exponencial, poisson, type Rand, randDe } from './aleatorio';
import { sortearPonto } from './pontos';

const HORA_MS = 3_600_000;
const DIA_MS = 24 * HORA_MS;
const MINUTO_MS = 60_000;
/** Brasília fica em UTC−3 o ano todo (sem horário de verão desde 2019). */
const FUSO_MS = -3 * HORA_MS;

// ---------------------------------------------------------------- parâmetros SIMULADOS
// Valores iniciais da equipe, sem fonte. Servem para a demo ter todas as situações.

/** Parte dos chamados que entra pelo canal proposto do City View. */
const FRACAO_CITY_VIEW = 0.08;
/** Parte dos envios ao órgão que falha na primeira tentativa. */
const FRACAO_FALHA_DE_ENVIO = 0.02;
const ESPERA_NOVO_ENVIO_H = 6;
/** Parte dos resolvidos que o cidadão reabre. */
const FRACAO_REABERTO = 0.03;
const ESPERA_REABERTURA_H = 24;
/** Tempo médio entre resolver e encerrar. */
const ESPERA_ENCERRAMENTO_H = 48;
/** Parte dos incidentes que sobe um nível de severidade. */
const FRACAO_PROMOVIDA = 0.08;

/** Peso de cada hora do dia (0h a 23h) na abertura de chamados. */
const HORAS_DIA = [1, 1, 1, 1, 1, 2, 4, 7, 9, 10, 10, 9, 8, 9, 9, 9, 8, 8, 7, 6, 4, 3, 2, 1];
const HORAS_NOITE = [9, 7, 5, 3, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 4, 5, 7, 9, 10, 10, 10];
const horasDoPerfil = (perfil: Perfil) => (perfil === 'noturno-fim-de-semana' ? HORAS_NOITE : HORAS_DIA);

// ---------------------------------------------------------------- calendário

/** 00:00 de Brasília do dia que contém `t`. */
export const inicioDoDia = (t: Instante): Instante => Math.floor((t + FUSO_MS) / DIA_MS) * DIA_MS - FUSO_MS;

/** A data de Brasília de `t`, lida pelos campos UTC do objeto devolvido. */
const emBrasilia = (t: Instante) => new Date(t + FUSO_MS);

/** Estação chuvosa do DF: começa em meados de outubro e vai até abril. */
function fatorChuva(dia: Instante): number {
  const data = emBrasilia(dia);
  const ano = data.getUTCMonth() >= 6 ? data.getUTCFullYear() : data.getUTCFullYear() - 1;
  const inicio = Date.UTC(ano, 9, 18) - FUSO_MS;
  const fim = Date.UTC(ano + 1, 3, 20) - FUSO_MS;
  const subida = 1 / (1 + Math.exp(-(dia - inicio) / (6 * DIA_MS)));
  const descida = 1 / (1 + Math.exp((dia - fim) / (10 * DIA_MS)));
  return 0.45 + 1.15 * subida * descida;
}

function fatorPerfil(perfil: Perfil, dia: Instante, tempestade: number): number {
  switch (perfil) {
    case 'noturno-fim-de-semana':
      // domingo a sábado
      return [1.25, 0.72, 0.7, 0.78, 0.85, 1.3, 1.7][emBrasilia(dia).getUTCDay()]!;
    case 'chuva':
      return fatorChuva(dia) * tempestade;
    default:
      return 1;
  }
}

// ---------------------------------------------------------------- contrato

/** Concentração plantada: multiplica a taxa de um tipo numa RA nos últimos `dias` dias. */
export interface Foco {
  tipoId: string;
  raId: string;
  multiplicador: number;
  dias: number;
}

export interface OpcoesGerador {
  /** O "agora" da simulação. Obrigatório: o gerador nunca lê o relógio. */
  agora: Instante;
  semente?: number;
  /** Dias de histórico de contagens, contando hoje. Padrão: 180. */
  dias?: number;
  /** Dias mais recentes que ganham incidentes individuais. Padrão: 30. */
  diasDetalhados?: number;
  focos?: Foco[];
}

export interface BaseSimulada {
  agora: Instante;
  dias: number;
  diasDetalhados: number;
  /** Chamados por tipo × RA × dia. Ver `indiceDaContagem`. */
  contagens: Int32Array;
  /** Lentidão do atendimento por RA (1 = média). */
  lentidaoRa: Float64Array;
  /** Ritmo da gestão por dia de abertura (multiplica o tempo de atendimento; < 1 = mais rápido). */
  ritmo: Float64Array;
  /** Incidentes da janela detalhada, do mais antigo ao mais novo. */
  incidentes: Incidente[];
}

/** Posição em `contagens` do tipo `t`, na RA `r`, no dia `d` (0 = mais antigo; `dias - 1` = hoje). */
export const indiceDaContagem = (base: Pick<BaseSimulada, 'dias'>, t: number, r: number, d: number) =>
  (t * REGIOES.length + r) * base.dias + d;

/** Início (00:00 de Brasília) do dia `d` da base. */
export const inicioDoIndice = (base: Pick<BaseSimulada, 'agora' | 'dias'>, d: number): Instante =>
  inicioDoDia(base.agora) - (base.dias - 1 - d) * DIA_MS;

export const SEMENTE_PADRAO = 20261111;

// ---------------------------------------------------------------- estágio 1: contagens

function gerarContagens(agora: Instante, semente: number, dias: number, focos: Foco[]) {
  const T = TIPOS.length;
  const R = REGIOES.length;
  const hoje = inicioDoDia(agora);
  const diaDe = (d: number) => hoje - (dias - 1 - d) * DIA_MS;
  const fracaoHoje = Math.max(0.05, (agora - hoje) / DIA_MS);

  // Dias de chuva forte na estação: multiplicam os tipos de chuva.
  const randTempestade = randDe(semente, 'tempestade');
  const tempestade = new Float64Array(dias).fill(1);
  for (let d = 0; d < dias; d++) {
    if (fatorChuva(diaDe(d)) > 1 && randTempestade() < 0.16) tempestade[d] = 1.6 + randTempestade() * 1.2;
  }

  const randLentidao = randDe(semente, 'lentidao');
  const lentidaoRa = Float64Array.from(
    REGIOES,
    (ra) => 0.75 + 0.8 * PESOS_SIMULADOS[ra.codigo]!.vulnerabilidade + (randLentidao() - 0.5) * 0.15,
  );

  // Uma gestão que melhora aos poucos, com oscilação semanal: de 18% mais lenta a
  // 18% mais rápida que a média ao longo do histórico.
  const randRitmo = randDe(semente, 'ritmo');
  const oscilacao = Array.from({ length: Math.ceil(dias / 7) }, () => (randRitmo() - 0.5) * 0.04);
  const ritmo = Float64Array.from(
    { length: dias },
    (_, d) => 1.18 - 0.36 * (d / Math.max(1, dias - 1)) + oscilacao[Math.floor(d / 7)]!,
  );

  const contagens = new Int32Array(T * R * dias);
  TIPOS.forEach((tipo, t) => {
    const randTipo = randDe(semente, `tipo:${tipo.id}`);
    // Peso de cada RA para este tipo.
    const pesos = REGIOES.map((ra) => {
      const { vulnerabilidade, centralidade } = PESOS_SIMULADOS[ra.codigo]!;
      const populacao = Math.max(ra.populacao, 40000 * centralidade);
      return (
        Math.pow(populacao, 0.95) *
        Math.max(0.15, 1 + tipo.vulnerabilidade * (vulnerabilidade - 0.4) * 2.2) *
        (1 + (tipo.centralidade ?? 0) * centralidade * 2.5) *
        (0.85 + randTipo() * 0.3)
      );
    });
    const soma = pesos.reduce((s, p) => s + p, 0);
    const diario = tipo.volumeMensal / 30;
    // Tendência leve e única por tipo: de −8% a +10% no período.
    const tendencia = (randTipo() - 0.45) * 0.18;

    REGIOES.forEach((ra, r) => {
      const rand = randDe(semente, `contagem:${tipo.id}:${ra.id}`);
      const focosDaqui = focos.filter((f) => f.tipoId === tipo.id && f.raId === ra.id);
      const lambdaBase = diario * (pesos[r]! / soma);
      for (let d = 0; d < dias; d++) {
        let lambda = lambdaBase * fatorPerfil(tipo.perfil, diaDe(d), tempestade[d]!) * (1 + tendencia * (d / dias - 0.5));
        for (const f of focosDaqui) if (d >= dias - f.dias) lambda *= f.multiplicador;
        if (d === dias - 1) lambda *= fracaoHoje;
        contagens[(t * R + r) * dias + d] = poisson(lambda, rand);
      }
    });
  });

  return { contagens, lentidaoRa, ritmo };
}

// ---------------------------------------------------------------- estágio 2: incidentes

/** Sorteia a hora de abertura, em horas desde o início do dia, antes de `limite`. */
function sortearHora(pesos: number[], limite: number, rand: Rand): number {
  const parte = (h: number) => Math.min(1, Math.max(0, limite - h));
  let total = 0;
  for (let h = 0; h < 24; h++) total += pesos[h]! * parte(h);
  if (total <= 0) return 0;
  let alvo = rand() * total;
  for (let h = 0; h < 24; h++) {
    alvo -= pesos[h]! * parte(h);
    if (alvo < 0) return h + rand() * parte(h);
  }
  return Math.max(0, limite - 1e-6);
}

function sortearCanal(tipo: TipoComOrgao, rand: Rand): string {
  if (rand() < FRACAO_CITY_VIEW) return CANAL_CITY_VIEW;
  const canais = ORGAO_POR_ID[tipo.orgaoId]!.canais;
  let alvo = rand();
  for (const c of canais) {
    alvo -= c.peso;
    if (alvo < 0) return c.canalId;
  }
  return canais[canais.length - 1]!.canalId;
}

const ACIMA: Record<Severidade, Severidade> = { atencao: 'serio', serio: 'critico', critico: 'critico' };

/** Fração que termina resolvida; o resto acaba cancelado sem solução. */
const taxaFinal = (tipo: TipoComOrgao) => (tipo.tempoMedioHoras > 300 ? 0.82 : 0.94);

interface Andamento {
  situacao: Situacao;
  encaminhadoEm?: Instante;
  resolvidoEm?: Instante;
}

/**
 * Sorteia a história inteira do incidente e devolve em que ponto ela está em
 * `agora`. O tempo de atendimento é exponencial, como na demo antiga.
 */
function sortearAndamento(tipo: TipoComOrgao, criadoEm: Instante, lentidao: number, agora: Instante, rand: Rand): Andamento {
  const resolve = rand() < taxaFinal(tipo);
  const mediaH = resolve ? tipo.tempoMedioHoras * lentidao : Math.max(72, tipo.tempoMedioHoras * 4);
  const duracao = exponencial(mediaH, rand) * HORA_MS;

  const triagemEm = criadoEm + Math.min((2 + 13 * rand()) * MINUTO_MS, 0.04 * duracao);
  let encaminhadoEm = criadoEm + (0.05 + 0.15 * rand()) * duracao;
  let atendimentoEm = criadoEm + (0.35 + 0.25 * rand()) * duracao;
  let fimEm = criadoEm + duracao;

  // O envio ao órgão falha e é refeito depois: tudo o que vem a seguir atrasa.
  let falhaEm: Instante | undefined;
  if (rand() < FRACAO_FALHA_DE_ENVIO) {
    const atraso = exponencial(ESPERA_NOVO_ENVIO_H, rand) * HORA_MS;
    falhaEm = encaminhadoEm;
    encaminhadoEm += atraso;
    atendimentoEm += atraso;
    fimEm += atraso;
  }
  const reabre = resolve && rand() < FRACAO_REABERTO;
  const reabertoEm = fimEm + exponencial(ESPERA_REABERTURA_H, rand) * HORA_MS;
  const segundaDuracao = exponencial(tipo.tempoMedioHoras * lentidao, rand) * HORA_MS;
  const retomadoEm = reabertoEm + (0.1 + 0.2 * rand()) * segundaDuracao;
  const encerramento = exponencial(ESPERA_ENCERRAMENTO_H, rand) * HORA_MS;

  if (agora < triagemEm) return { situacao: 'recebido' };
  if (agora < (falhaEm ?? encaminhadoEm)) return { situacao: 'em-triagem' };
  if (agora < encaminhadoEm) return { situacao: 'falha-de-envio' };
  const enc = Math.floor(encaminhadoEm);
  if (agora < atendimentoEm) return { situacao: 'encaminhado', encaminhadoEm: enc };
  if (agora < fimEm) return { situacao: 'em-atendimento', encaminhadoEm: enc };
  if (!resolve) return { situacao: 'cancelado', encaminhadoEm: enc };

  if (reabre) {
    // Só um resolvido pode ser reaberto: até lá, o incidente não encerra.
    if (agora < reabertoEm) return { situacao: 'resolvido', encaminhadoEm: enc, resolvidoEm: Math.floor(fimEm) };
    if (agora < retomadoEm) return { situacao: 'reaberto', encaminhadoEm: enc };
    if (agora < reabertoEm + segundaDuracao) return { situacao: 'em-atendimento', encaminhadoEm: enc };
    fimEm = reabertoEm + segundaDuracao;
  }
  const situacao = agora < fimEm + encerramento ? 'resolvido' : 'encerrado';
  return { situacao, encaminhadoEm: enc, resolvidoEm: Math.floor(fimEm) };
}

function gerarIncidentes(
  agora: Instante,
  semente: number,
  dias: number,
  diasDetalhados: number,
  base: Pick<BaseSimulada, 'contagens' | 'lentidaoRa' | 'ritmo'>,
): Incidente[] {
  const R = REGIOES.length;
  const hoje = inicioDoDia(agora);
  const horasDeHoje = (agora - hoje) / HORA_MS;
  const incidentes: Incidente[] = [];

  TIPOS.forEach((tipo, t) => {
    const horas = horasDoPerfil(tipo.perfil);
    REGIOES.forEach((ra, r) => {
      const rand = randDe(semente, `incidentes:${tipo.id}:${ra.id}`);
      for (let d = dias - diasDetalhados; d < dias; d++) {
        const n = base.contagens[(t * R + r) * dias + d]!;
        const inicio = hoje - (dias - 1 - d) * DIA_MS;
        const limite = d === dias - 1 ? horasDeHoje : 24;
        const lentidao = base.lentidaoRa[r]! * base.ritmo[d]!;
        for (let i = 0; i < n; i++) {
          const criadoEm = Math.min(agora, inicio + Math.floor(sortearHora(horas, limite, rand) * HORA_MS));
          const [lon, lat] = sortearPonto(ra, rand);
          const canalId = sortearCanal(tipo, rand);
          const severidade = rand() < FRACAO_PROMOVIDA ? ACIMA[tipo.severidadeBase] : tipo.severidadeBase;
          incidentes.push({
            id: '',
            origem: { canalId },
            local: { lon, lat, raId: ra.id },
            tipoId: tipo.id,
            area: tipo.area,
            orgaoId: tipo.orgaoId,
            severidade,
            criadoEm,
            ...sortearAndamento(tipo, criadoEm, lentidao, agora, rand),
            vinculos: [],
          });
        }
      }
    });
  });

  // O id segue a ordem de chegada e recomeça a cada ano.
  incidentes.sort((a, b) => a.criadoEm - b.criadoEm);
  let anoCorrente = Number.NaN;
  let sequencial = 0;
  for (const inc of incidentes) {
    const ano = emBrasilia(inc.criadoEm).getUTCFullYear();
    if (ano !== anoCorrente) {
      anoCorrente = ano;
      sequencial = 0;
    }
    inc.id = formatarId(ano, ++sequencial);
  }
  return incidentes;
}

// ---------------------------------------------------------------- entrada

export function gerarBase(opcoes: OpcoesGerador): BaseSimulada {
  const { agora } = opcoes;
  const semente = opcoes.semente ?? SEMENTE_PADRAO;
  const dias = opcoes.dias ?? 180;
  const diasDetalhados = Math.min(dias, opcoes.diasDetalhados ?? 30);
  const contagens = gerarContagens(agora, semente, dias, opcoes.focos ?? []);
  const incidentes = gerarIncidentes(agora, semente, dias, diasDetalhados, contagens);
  return { agora, dias, diasDetalhados, ...contagens, incidentes };
}

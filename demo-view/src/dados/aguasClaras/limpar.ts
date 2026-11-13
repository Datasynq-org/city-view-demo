/**
 * A limpeza das demandas do mapa público de Águas Claras, antes de entrarem na
 * demo. O que vem do site já é público, mas a descrição é texto livre de
 * cidadãos: daqui saem telefone, e-mail, CPF e placa de veículo, e as fotos não
 * entram (só o fato de haver foto).
 *
 * Sem dependências, de propósito: o script de leitura (`scripts/`) importa este
 * arquivo direto, fora do empacotador. Funções puras.
 */

/** Como a demanda vem do site (`GET /mapadedemandas/api/demandas`). */
export interface DemandaDoSite {
  id: string | number;
  tipo: string | null;
  descricao: string | null;
  latitude: string | number | null;
  longitude: string | number | null;
  bairro: string | null;
  endereco: string | null;
  imagem: unknown;
  status: string | null;
  autorizacao: string | null;
  protocolo: string | null;
  created_at: string | null;
  orgao_nome: string | null;
}

/** Os campos que o site devolve hoje. Um campo novo faz a leitura parar, para ser visto. */
export const CAMPOS_ESPERADOS = ['id', 'tipo', 'descricao', 'latitude', 'longitude', 'bairro', 'endereco', 'imagem', 'status', 'autorizacao', 'protocolo', 'created_at', 'orgao_nome'] as const;

export type StatusDoSite = 'pendente' | 'encaminhado' | 'em_progresso' | 'finalizado';
export const STATUS_DO_SITE: readonly StatusDoSite[] = ['pendente', 'encaminhado', 'em_progresso', 'finalizado'];

/** A demanda como fica guardada na demo. */
export interface DemandaReal {
  id: string;
  protocolo: string;
  tipo: string;
  descricao: string;
  bairro: string | null;
  endereco: string | null;
  /** [lon, lat], ou `null` quando o site não traz um ponto dentro do DF. */
  ponto: [number, number] | null;
  status: StatusDoSite;
  /** O nome do órgão como o site escreve; `null` quando não foi atribuído. */
  orgao: string | null;
  /** Data e hora de criação, no horário de Brasília (ISO, com −03:00). */
  criadaEm: string;
  comFoto: boolean;
}

export interface Arquivo {
  fonte: string;
  /** Quando o site foi lido (ISO). */
  lidoEm: string;
  /** O que a limpeza tirou das descrições, por tipo. */
  retirado: Record<Retirado, number>;
  foraDoDf: number;
  demandas: DemandaReal[];
}

export type Retirado = 'telefone' | 'email' | 'cpf' | 'placa';

/**
 * As regras, na ordem em que valem. O CPF vem antes do telefone: os dois são
 * sequências de 11 dígitos, e o formato com pontos é o do CPF.
 */
const REGRAS: [Retirado, RegExp][] = [
  ['email', /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g],
  ['cpf', /\b\d{3}\.\d{3}\.\d{3}-?\d{2}\b/g],
  // DDD opcional, 8 ou 9 dígitos, com ou sem separador: (61) 99999-9999, 61999999999, 9999-9999.
  // Não pode estar colado a letra ou a outro dígito: "DF2026001127" é protocolo, não telefone.
  ['telefone', /(?<![A-Za-z\d])(?:\+?55[\s.-]?)?(?:\(?\d{2}\)?[\s.-]?)?9?\d{4}[\s.-]?\d{4}(?![A-Za-z\d])/g],
  // Placa antiga (ABC-1234) e Mercosul (ABC1D23).
  ['placa', /\b[A-Za-z]{3}[\s-]?\d[A-Za-z0-9]\d{2}\b/g],
];

/** Tira o que identifica uma pessoa ou um veículo; devolve o texto e o que saiu. */
export function limparTexto(texto: string): { texto: string; retirado: Record<Retirado, number> } {
  const retirado: Record<Retirado, number> = { telefone: 0, email: 0, cpf: 0, placa: 0 };
  let limpo = texto;
  for (const [nome, regra] of REGRAS) {
    limpo = limpo.replace(regra, () => {
      retirado[nome]++;
      return `[${nome} retirado]`;
    });
  }
  return { texto: limpo.replace(/\s+/g, ' ').trim(), retirado };
}

/** Os limites do DF, com folga: um ponto fora daqui é erro de quem marcou. */
const DF = { oeste: -48.3, leste: -47.3, sul: -16.06, norte: -15.49 };

export function pontoDe(latitude: unknown, longitude: unknown): [number, number] | null {
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return lon > DF.oeste && lon < DF.leste && lat > DF.sul && lat < DF.norte ? [lon, lat] : null;
}

const temFoto = (imagem: unknown) => (Array.isArray(imagem) ? imagem.length > 0 : typeof imagem === 'string' && imagem.trim().length > 0 && imagem.trim() !== '[]');

/** "2026-09-21 15:34:59", no horário de Brasília → ISO com o fuso. */
export const dataDoSite = (s: string) => `${s.trim().replace(' ', 'T')}-03:00`;

/**
 * Alguns textos do site vêm com os acentos quebrados ("Ãguas", "JacarandÃ¡"):
 * UTF-8 lido como Latin-1. Quando o texto inteiro cabe em Latin-1 e relê como
 * UTF-8 válido, é esse o caso, e o conserto é seguro; se não, fica como veio.
 */
export function consertarAcentos(s: string): string {
  if (!/[\u00c2\u00c3]/.test(s)) return s;
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c > 255) return s;
    bytes[i] = c;
  }
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return s;
  }
}

const texto = (v: unknown) => (typeof v === 'string' && v.trim() ? consertarAcentos(v.trim()) : null);

/** Uma demanda do site, limpa. `null` para a que não pode entrar (sem aprovação, sem data, status desconhecido). */
export function limparDemanda(d: DemandaDoSite): { demanda: DemandaReal; retirado: Record<Retirado, number> } | null {
  if (d.autorizacao !== 'aprovado' || !d.created_at || !STATUS_DO_SITE.includes(d.status as StatusDoSite)) return null;
  const { texto: descricao, retirado } = limparTexto(consertarAcentos(d.descricao ?? ''));
  return {
    retirado,
    demanda: {
      id: String(d.id),
      protocolo: texto(d.protocolo) ?? `sem-protocolo-${d.id}`,
      tipo: texto(d.tipo) ?? 'Outros',
      descricao,
      bairro: texto(d.bairro),
      endereco: texto(d.endereco),
      ponto: pontoDe(d.latitude, d.longitude),
      status: d.status as StatusDoSite,
      orgao: texto(d.orgao_nome),
      criadaEm: dataDoSite(d.created_at),
      comFoto: temFoto(d.imagem),
    },
  };
}

/** Os campos que vieram e não eram esperados: se houver, a leitura para. */
export function camposInesperados(lista: readonly Record<string, unknown>[]): string[] {
  const esperados = new Set<string>(CAMPOS_ESPERADOS);
  const fora = new Set<string>();
  for (const r of lista) for (const k of Object.keys(r)) if (!esperados.has(k)) fora.add(k);
  return [...fora].sort();
}

export function montarArquivo(lista: readonly DemandaDoSite[], fonte: string, lidoEm: string): Arquivo {
  const retirado: Record<Retirado, number> = { telefone: 0, email: 0, cpf: 0, placa: 0 };
  const demandas: DemandaReal[] = [];
  for (const d of lista) {
    const r = limparDemanda(d);
    if (!r) continue;
    demandas.push(r.demanda);
    for (const k of Object.keys(retirado) as Retirado[]) retirado[k] += r.retirado[k];
  }
  demandas.sort((a, b) => (a.criadaEm < b.criadaEm ? -1 : a.criadaEm > b.criadaEm ? 1 : Number(a.id) - Number(b.id)));
  return { fonte, lidoEm, retirado, foraDoDf: demandas.filter((d) => d.ponto === null).length, demandas };
}

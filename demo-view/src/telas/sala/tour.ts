/**
 * Tour da sala de guerra: a câmera conta a história sozinha, para o telão
 * (`?tour=1` no endereço) ou para a apresentação. Uma parada por ideia; cada
 * uma traz uma frase LITERAL da conversa de 10/11/2026
 * (`docs/fonte/CV-ATA-001-conversa-daniel-2026-11-10.md`, linhas indicadas) e
 * um texto com os números do momento. Os números são SIMULADOS; as escolas e
 * as unidades de saúde são reais.
 *
 * Todas as paradas usam o mapa de calor, a leitura principal da tela. Hexágonos
 * e regiões em 3D continuam no painel de camadas, para quem quiser.
 */
import type { CamadaContexto, Contexto } from '../../dados/contexto';
import { estaAberto, type Incidente } from '../../dominio/incidente';
import { type AreaId, AREAS, TIPO_POR_ID } from '../../dominio/orgaos';
import { dentroDaRegiao, REGIAO_POR_ID, REGIOES } from '../../dominio/ras';
import { duracao, numero, percentual, velocidadePorArea } from '../../indicadores/indicadores';
import type { ModoMapa } from '../../mapa/camadas';
import type { Vista } from '../../mapa/vista';

/** O que o tour olha para escolher para onde ir e o que dizer. */
export interface CenaDoTour {
  /** O que já chegou, na janela inteira. */
  incidentes: readonly Incidente[];
  /** Do período escolhido, no DF inteiro. */
  doPeriodo: readonly Incidente[];
  nomePeriodo: string;
  contexto: Contexto | null;
}

export interface Parada {
  id: string;
  titulo: string;
  frase: string;
  /** Linhas da ATA de onde a frase vem. */
  ata: string;
  modo: ModoMapa;
  contexto: CamadaContexto[];
  /** Área que a parada filtra (`null` = todas). */
  area: (c: CenaDoTour) => AreaId | null;
  /** Para onde a câmera vai (`null` = o DF inteiro). */
  vista: (c: CenaDoTour) => Vista | null;
  texto: (c: CenaDoTour) => string;
}

/** Quanto tempo cada parada fica na tela, em ms. */
export const DURACAO_PARADA = 11_000;

/** A RA com mais chamados abertos agora. */
export function raMaisAberta(incidentes: readonly Incidente[]): { ra: string; abertos: number } {
  const conta = new Map<string, number>();
  for (const i of incidentes) if (estaAberto(i.situacao)) conta.set(i.local.raId, (conta.get(i.local.raId) ?? 0) + 1);
  let melhor = { ra: REGIOES[0]!.id, abertos: -1 };
  for (const [ra, abertos] of conta) if (abertos > melhor.abertos) melhor = { ra, abertos };
  return melhor;
}

/** A área com o menor % resolvido no prazo no período (a mais lenta). */
export function areaMaisLenta(doPeriodo: readonly Incidente[]) {
  const linhas = velocidadePorArea(doPeriodo).filter((l) => l.noPrazo !== null);
  return linhas.sort((a, b) => a.noPrazo! - b.noPrazo!)[0] ?? null;
}

const vistaDaRa = (ra: string, zoom: number, inclinacao: number, rotacao: number): Vista => ({ centro: REGIAO_POR_ID[ra]!.rotulo, zoom, inclinacao, rotacao });
const nomeDaRa = (ra: string) => REGIAO_POR_ID[ra]?.nome ?? ra;
const nomeDaArea = (a: AreaId) => AREAS.find((x) => x.id === a)!.curto;
const ultimo = (c: CenaDoTour) => c.incidentes[c.incidentes.length - 1];

export const TOUR: Parada[] = [
  {
    id: 'todo',
    titulo: 'A cidade inteira, de uma vez',
    frase: 'Se você olha cada coisa em separado, as coisas estão funcionando. Quando você olha o todo, as coisas não estão funcionando.',
    ata: '99–101',
    modo: 'calor',
    contexto: [],
    area: () => null,
    vista: () => null,
    texto: (c) => `${numero(c.doPeriodo.length)} chamados (${c.nomePeriodo.toLowerCase()}) de 10 órgãos, num mapa só. Quanto mais clara a mancha, mais chamados naquele lugar.`,
  },
  {
    id: 'pegando',
    titulo: 'Onde as coisas estão pegando',
    frase: 'Num mapa de calor, onde as coisas estão pegando, onde as coisas estão mais tranquilas.',
    ata: '221–222',
    modo: 'calor',
    contexto: [],
    area: () => null,
    vista: (c) => vistaDaRa(raMaisAberta(c.incidentes).ra, 11.4, 60, 28),
    texto: (c) => {
      const m = raMaisAberta(c.incidentes);
      return `${nomeDaRa(m.ra)} tem ${numero(m.abertos)} chamados esperando alguém agir, o maior número do DF.`;
    },
  },
  {
    id: 'velocidade',
    titulo: 'A velocidade da gestão',
    frase: 'Uma ferramenta que vai te dar condição de ver a velocidade da sua gestão. E ver como a sua gestão realmente está.',
    ata: '147–148',
    modo: 'calor',
    contexto: [],
    area: (c) => areaMaisLenta(c.doPeriodo)?.area ?? null,
    vista: () => null,
    texto: (c) => {
      const l = areaMaisLenta(c.doPeriodo);
      if (!l) return 'Sem chamados resolvidos no período.';
      return `${nomeDaArea(l.area)}: ${percentual(l.noPrazo)} resolvido no prazo, mediana de ${duracao(l.tempoAteResolver)}. É a área mais lenta no período.`;
    },
  },
  {
    id: 'chegando',
    titulo: 'O que está chegando agora',
    frase: 'A gente vai ter o primeiro input sendo do usuário.',
    ata: '191–192',
    modo: 'calor',
    contexto: [],
    area: () => null,
    vista: (c) => {
      const u = ultimo(c);
      return u ? { centro: [u.local.lon, u.local.lat], zoom: 12.2, inclinacao: 58, rotacao: -24 } : null;
    },
    texto: (c) => {
      const u = ultimo(c);
      if (!u) return 'A fila de chamados está vazia.';
      return `Acabou de chegar: ${TIPO_POR_ID[u.tipoId]?.nome ?? u.tipoId}, em ${nomeDaRa(u.local.raId)}. Um chamado novo a cada poucos segundos.`;
    },
  },
  {
    id: 'contexto',
    titulo: 'O contexto da cidade',
    frase: 'Vão ser algumas camadas de captação de dados que a gente vai cruzar e mostrar num painel para o gerenciamento da cidade.',
    ata: '194–195',
    // No chão (calor), para os pontos reais e os prédios em 3D aparecerem de perto.
    modo: 'calor',
    contexto: ['saude', 'escolas'],
    area: () => null,
    vista: (c) => vistaDaRa(raMaisAberta(c.incidentes).ra, 13.4, 60, -35),
    texto: (c) => {
      const ra = REGIAO_POR_ID[raMaisAberta(c.incidentes).ra]!;
      if (!c.contexto) return `Escolas e unidades de saúde (dados reais) sobre os chamados de ${ra.nome}.`;
      const dentro = (l: [number, number, ...unknown[]]) => dentroDaRegiao(ra, l[0], l[1]);
      const escolas = c.contexto.escolas.linhas.filter(dentro).length;
      const saude = c.contexto.saude.linhas.filter(dentro).length;
      return `${ra.nome}: ${numero(escolas)} escolas públicas e ${numero(saude)} unidades de saúde (dados reais, INEP e CNES) sobre os chamados simulados.`;
    },
  },
];

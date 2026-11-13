/**
 * Entrar por perfil (CV-DEM-002, F4): a mesma demo, com as telas e a ordem de
 * cada público. "É um dashboard para o gestor [de água e esgoto], o gestor da
 * telefonia […] o gestor da iluminação" (magno 4.6), e "logar em alguma coisa e
 * mostrar mais ou menos o que a gente falou" (ATA 267–268).
 *
 * Não é controle de acesso: é demonstração, sem senha. Qualquer endereço
 * continua abrindo em qualquer perfil; o perfil só escolhe o que a barra mostra.
 * A escolha fica no navegador. `?perfil=gestor&orgao=caesb` abre já escolhido.
 */
import { useSyncExternalStore } from 'react';
import { ORGAO_POR_ID } from '../dominio/orgaos';
import { type Tela, TELAS } from '../navegacao';

export type Perfil = 'governadora' | 'gestor' | 'operador';

export const PERFIS: { id: Perfil; nome: string; nota: string; telas: Tela[] }[] = [
  { id: 'governadora', nome: 'Governadora', nota: 'Onde agir, como anda a gestão e o que a população vê', telas: ['sala', 'resumo', 'gestao', 'cidadao'] },
  { id: 'gestor', nome: 'Gestor de órgão', nota: 'A fila do órgão, os incidentes em que ele entra e o que cruza com os outros', telas: ['gestao', 'inteligencia', 'jornada'] },
  { id: 'operador', nome: 'Operador da sala', nota: 'Todas as telas: quem revisa as sugestões e acompanha os órgãos', telas: TELAS.map((t) => t.id) },
];

export const PERFIL_POR_ID = Object.fromEntries(PERFIS.map((p) => [p.id, p])) as Record<Perfil, (typeof PERFIS)[number]>;

export interface Escolha {
  /** `null`: ninguém escolheu ainda. */
  perfil: Perfil | null;
  /** O órgão do gestor. */
  orgao: string | null;
}

const ehPerfil = (v: unknown): v is Perfil => PERFIS.some((p) => p.id === v);

/** Lê uma escolha de um texto guardado ou do endereço; o que não vale vira "ninguém escolheu". */
export function escolhaDe(perfil: string | null | undefined, orgao: string | null | undefined): Escolha {
  if (!ehPerfil(perfil)) return { perfil: null, orgao: null };
  return { perfil, orgao: perfil === 'gestor' && orgao && ORGAO_POR_ID[orgao] ? orgao : null };
}

/** As telas que a barra mostra: as do perfil, na ordem dele; sem perfil, todas. */
export const telasDoPerfil = (perfil: Perfil | null): Tela[] => (perfil ? PERFIL_POR_ID[perfil].telas : TELAS.map((t) => t.id));

/** Para onde vai quem acabou de entrar. */
export const entradaDoPerfil = (e: Escolha): string => (e.perfil === 'gestor' ? `/gestao${e.orgao ? `?orgao=${e.orgao}` : ''}` : '/sala');

const CHAVE = 'cityview-perfil';
const ouvintes = new Set<() => void>();

function inicial(): Escolha {
  if (typeof window === 'undefined') return { perfil: null, orgao: null };
  const busca = new URLSearchParams(window.location.search);
  if (busca.has('perfil')) return escolhaDe(busca.get('perfil'), busca.get('orgao'));
  try {
    const [perfil, orgao] = (window.localStorage.getItem(CHAVE) ?? '').split(':');
    return escolhaDe(perfil, orgao);
  } catch {
    return { perfil: null, orgao: null };
  }
}

let atual: Escolha = inicial();

export const escolhaAtual = (): Escolha => atual;

export function mudarPerfil(perfil: Perfil | null, orgao: string | null = null) {
  atual = escolhaDe(perfil, orgao);
  try {
    if (atual.perfil) window.localStorage.setItem(CHAVE, `${atual.perfil}:${atual.orgao ?? ''}`);
    else window.localStorage.removeItem(CHAVE);
  } catch {
    // Sem armazenamento (navegação privada): o perfil vale só nesta visita.
  }
  for (const avisar of ouvintes) avisar();
}

const assinar = (avisar: () => void) => {
  ouvintes.add(avisar);
  return () => ouvintes.delete(avisar);
};

const NINGUEM: Escolha = { perfil: null, orgao: null };

/** O perfil em uso; o componente redesenha quando ele muda. */
export const usePerfil = (): Escolha => useSyncExternalStore(assinar, escolhaAtual, () => NINGUEM);

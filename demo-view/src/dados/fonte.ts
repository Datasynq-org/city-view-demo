/**
 * De onde vêm os chamados que a demo mostra: a **cidade simulada** (o DF
 * inteiro, gerado no navegador; é o padrão) ou as **demandas reais de Águas
 * Claras**, lidas uma vez do mapa público do site parceiro e guardadas no
 * repositório (`dados/aguasClaras/`).
 *
 * A fonte real vale onde o dado sustenta a tela: hoje, a Inteligência. As
 * outras telas continuam na cidade simulada e dizem isso. Em nenhum caso a
 * demo chama o site ao abrir.
 *
 * A escolha fica no navegador. `?fonte=aguas-claras` abre já na real.
 */
import { useSyncExternalStore } from 'react';
import type { Tela } from '../navegacao';

export type Fonte = 'simulada' | 'aguas-claras';

export const FONTES: { id: Fonte; nome: string; nota: string }[] = [
  { id: 'simulada', nome: 'Cidade simulada', nota: 'O DF inteiro, com dados gerados para a demonstração' },
  { id: 'aguas-claras', nome: 'Águas Claras (real)', nota: 'Demandas reais do mapa público de Águas Claras; inteligência e órgãos simulados' },
];

/** As telas que rodam sobre a fonte real. As outras seguem na cidade simulada. */
export const TELAS_COM_DADO_REAL: readonly Tela[] = ['inteligencia'];

export const usaDadoReal = (fonte: Fonte, tela: Tela) => fonte === 'aguas-claras' && TELAS_COM_DADO_REAL.includes(tela);

const CHAVE = 'cityview-fonte';
const ouvintes = new Set<() => void>();
const ehFonte = (v: unknown): v is Fonte => FONTES.some((f) => f.id === v);

function inicial(): Fonte {
  if (typeof window === 'undefined') return 'simulada';
  const doEndereco = new URLSearchParams(window.location.search).get('fonte');
  if (ehFonte(doEndereco)) return doEndereco;
  try {
    const guardada = window.localStorage.getItem(CHAVE);
    return ehFonte(guardada) ? guardada : 'simulada';
  } catch {
    return 'simulada';
  }
}

let atual: Fonte = inicial();

export const fonteAtual = (): Fonte => atual;

export function mudarFonte(fonte: Fonte) {
  if (fonte === atual) return;
  atual = fonte;
  try {
    window.localStorage.setItem(CHAVE, fonte);
  } catch {
    // Sem armazenamento (navegação privada): a fonte vale só nesta visita.
  }
  for (const avisar of ouvintes) avisar();
}

const assinar = (avisar: () => void) => {
  ouvintes.add(avisar);
  return () => ouvintes.delete(avisar);
};

/** A fonte em uso; o componente redesenha quando ela muda. */
export const useFonte = (): Fonte => useSyncExternalStore(assinar, fonteAtual, () => 'simulada' as Fonte);

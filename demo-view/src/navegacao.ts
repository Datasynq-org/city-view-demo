/**
 * As telas da demo, uma por iteração do roadmap (CV-DEM-001, seção 6), escolhidas
 * pelo endereço: `#/sala`, `#/jornada` e `#/inteligencia`. Sem biblioteca de rotas.
 * `?tela=jornada` também abre a jornada (para links do telão e da apresentação).
 */
import { useEffect, useState } from 'react';

export type Tela = 'sala' | 'jornada' | 'inteligencia';

export const TELAS: { id: Tela; nome: string }[] = [
  { id: 'sala', nome: 'Sala de situação' },
  { id: 'jornada', nome: 'Jornada de um chamado' },
  { id: 'inteligencia', nome: 'Inteligência' },
];

const ehTela = (v: string | null | undefined): v is Tela => TELAS.some((t) => t.id === v);

/** A tela pedida pelo endereço; a sala, se nada vier. */
export function telaDoEndereco(hash: string, busca: string): Tela {
  const doHash = hash.replace(/^#\/?/, '').split(/[/?]/)[0];
  if (ehTela(doHash)) return doHash;
  const daBusca = new URLSearchParams(busca).get('tela');
  return ehTela(daBusca) ? daBusca : 'sala';
}

export function useTela(): [Tela, (t: Tela) => void] {
  const [tela, setTela] = useState<Tela>(() => telaDoEndereco(window.location.hash, window.location.search));
  useEffect(() => {
    const mudou = () => setTela(telaDoEndereco(window.location.hash, window.location.search));
    window.addEventListener('hashchange', mudou);
    return () => window.removeEventListener('hashchange', mudou);
  }, []);
  const ir = (t: Tela) => {
    window.location.hash = `/${t}`;
  };
  return [tela, ir];
}

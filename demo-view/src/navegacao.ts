/**
 * As telas da demo, escolhidas pelo endereço (`#/sala`, `#/gestao`…). Sem
 * biblioteca de rotas. `?tela=jornada` também vale, para links do telão e da
 * apresentação. A ordem é a da barra lateral: do que a governadora vê primeiro
 * ao que explica como tudo se conecta.
 */
import { useEffect, useState } from 'react';

export type Tela = 'sala' | 'gestao' | 'regioes' | 'inteligencia' | 'previsoes' | 'jornada' | 'cidadao' | 'integracoes';

export const TELAS: { id: Tela; nome: string; pergunta: string }[] = [
  { id: 'sala', nome: 'Sala de situação', pergunta: 'Onde a cidade precisa de mim agora?' },
  { id: 'gestao', nome: 'Gestão', pergunta: 'Como está a velocidade da gestão?' },
  { id: 'regioes', nome: 'Regiões', pergunta: 'Como está cada região?' },
  { id: 'inteligencia', nome: 'Inteligência', pergunta: 'O que os silos não estão vendo?' },
  { id: 'previsoes', nome: 'Previsões', pergunta: 'O que vem por aí?' },
  { id: 'jornada', nome: 'Jornada', pergunta: 'O que acontece quando o cidadão relata?' },
  { id: 'cidadao', nome: 'Cidadão', pergunta: 'O que o governo está entregando?' },
  { id: 'integracoes', nome: 'Integrações', pergunta: 'Com o que isso se conecta?' },
];

const ehTela = (v: string | null | undefined): v is Tela => TELAS.some((t) => t.id === v);

/** A tela pedida pelo endereço; a sala, se nada vier. */
export function telaDoEndereco(hash: string, busca: string): Tela {
  const doHash = hash.replace(/^#\/?/, '').split(/[/?]/)[0];
  if (ehTela(doHash)) return doHash;
  const daBusca = new URLSearchParams(busca).get('tela');
  return ehTela(daBusca) ? daBusca : 'sala';
}

/** Parâmetros depois do `?` no hash: `#/gestao?orgao=caesb`. */
export const parametrosDoHash = (hash: string = window.location.hash) => new URLSearchParams(hash.split('?')[1] ?? '');

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

/**
 * I2 · Jornada de um chamado (CV-DEM-001, seção 6): "O que acontece quando o
 * cidadão relata?". Slides 10, 11 e 12 do CV-APR-001.
 *
 * Duas formas, por decisão da equipe (12/11/2026): a história guiada, que toca
 * sozinha (dois casos), e o "experimente", em que a pessoa escreve no celular e
 * a jornada anda com o relato dela. Nada sai desta tela.
 */
import type { Layer } from '@deck.gl/core';
import { ScatterplotLayer } from '@deck.gl/layers';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { avancar, type EstadoDaColeta, inicial } from '../../dados/coleta';
import { JORNADAS, type Jornada, jornadaDoRelato, type Mensagem } from '../../dados/jornadas';
import { NA_PILHA, SEMPRE_POR_CIMA } from '../../mapa/camadas/pilha';
import { Mapa } from '../../mapa/Mapa';
import { type Destino, reduzMovimento } from '../../mapa/vista';
import { CORES, rgb } from '../../ui/tokens';
import { Celular } from './Celular';
import { Detalhe } from './Detalhe';
import { Fluxo } from './Fluxo';

type Caso = Jornada['id'];

/** Quanto tempo o passo fica na tela depois da última mensagem, tocando sozinho. */
const PAUSA_DO_PASSO = 5500;
const MARGENS = () => ({ top: 24, bottom: 24, left: 24, right: 24 });
const ACENTO = rgb(CORES.acentoClaro);
const OUTROS = rgb(CORES.aviso);

/** Quanto esperar antes de mostrar uma mensagem: o assistente "digita" mais devagar se o texto é longo. */
const esperaDa = (m: Mensagem) => (m.de === 'cidadao' ? 650 : Math.min(1900, 700 + m.texto.length * 4));

function camadasDoMapa(local: [number, number] | null, vizinhos: [number, number][]): Layer[] {
  const camadas: Layer[] = [];
  if (vizinhos.length) {
    camadas.push(
      new ScatterplotLayer<[number, number]>({
        id: 'jornada-vizinhos',
        data: vizinhos,
        getPosition: (p) => p,
        getRadius: 260,
        radiusMinPixels: 5,
        getFillColor: [...OUTROS, 170],
        stroked: true,
        getLineColor: [...OUTROS, 255],
        lineWidthMinPixels: 1,
        ...SEMPRE_POR_CIMA,
        ...NA_PILHA,
      }),
    );
  }
  if (local) {
    camadas.push(
      new ScatterplotLayer<[number, number]>({ id: 'jornada-halo', data: [local], getPosition: (p) => p, getRadius: 90, radiusMinPixels: 14, getFillColor: [...ACENTO, 60], ...SEMPRE_POR_CIMA, ...NA_PILHA }),
      new ScatterplotLayer<[number, number]>({
        id: 'jornada-local',
        data: [local],
        getPosition: (p) => p,
        getRadius: 20,
        radiusMinPixels: 6,
        getFillColor: [255, 255, 255, 255],
        stroked: true,
        getLineColor: [...ACENTO, 255],
        lineWidthMinPixels: 2.5,
        ...SEMPRE_POR_CIMA,
        ...NA_PILHA,
      }),
    );
  }
  return camadas;
}

export function TelaJornada() {
  const parametros = useMemo(() => new URLSearchParams(window.location.search), []);
  const [caso, setCaso] = useState<Caso>(() => (parametros.get('caso') === 'apagao' ? 'apagao' : 'poste'));
  const [indice, setIndice] = useState(0);
  const [revelados, setRevelados] = useState(0);
  const [tocando, setTocando] = useState(() => parametros.get('auto') === '1');
  const [digitando, setDigitando] = useState(false);

  // ------------------------------------------------ experimente
  const [coleta, setColeta] = useState<EstadoDaColeta>(inicial);
  const [conversa, setConversa] = useState<Mensagem[]>([]);
  const [relatoPronto, setRelatoPronto] = useState<Jornada | null>(null);
  const experimentando = caso === 'experimente' && !relatoPronto;

  const jornada: Jornada = caso === 'experimente' ? (relatoPronto ?? jornadaDoRelato(coleta, conversa)) : JORNADAS.find((j) => j.id === caso)!;
  const passo = jornada.passos[Math.min(indice, jornada.passos.length - 1)]!;

  // ------------------------------------------------ mensagens na tela
  const anteriores = useMemo(() => jornada.passos.slice(0, indice).flatMap((p) => p.mensagens), [jornada, indice]);
  const mensagens = experimentando ? conversa : [...anteriores, ...passo.mensagens.slice(0, revelados)];
  const percorridas = useMemo(() => new Set(jornada.passos.slice(0, indice + 1).map((p) => p.peca)), [jornada, indice]);

  const irPara = useCallback(
    (k: number, tocar = tocando) => {
      const alvo = Math.max(0, Math.min(jornada.passos.length - 1, k));
      setIndice(alvo);
      setDigitando(false);
      // Parado, o passo aparece inteiro; tocando, as mensagens chegam uma a uma.
      setRevelados(tocar && !reduzMovimento() ? 0 : (jornada.passos[alvo]?.mensagens.length ?? 0));
    },
    [jornada, tocando],
  );

  const escolherCaso = (c: Caso) => {
    setCaso(c);
    setRelatoPronto(null);
    setIndice(0);
    setDigitando(false);
    if (c === 'experimente') {
      setTocando(false);
      setColeta(inicial());
      setConversa([{ de: 'nota', texto: 'Escreva como se fosse no WhatsApp. É uma simulação: nada é enviado.' }]);
      setRevelados(0);
    } else setRevelados(tocando ? 0 : (JORNADAS.find((j) => j.id === c)?.passos[0]?.mensagens.length ?? 0));
  };

  // Ao abrir parado, o primeiro passo aparece inteiro.
  useEffect(() => {
    if (!tocando) setRevelados(passo.mensagens.length);
    // Só na primeira vez.
  }, []);

  // ------------------------------------------------ tocar sozinho
  useEffect(() => {
    if (!tocando || experimentando) return;
    const pendente = passo.mensagens[revelados];
    if (pendente) {
      const reduz = reduzMovimento();
      if (pendente.de !== 'cidadao' && !reduz) setDigitando(true);
      const t = setTimeout(() => {
        setDigitando(false);
        setRevelados((n) => n + 1);
      }, reduz ? 0 : esperaDa(pendente));
      return () => clearTimeout(t);
    }
    if (indice >= jornada.passos.length - 1) {
      setTocando(false);
      return;
    }
    const t = setTimeout(() => irPara(indice + 1, true), PAUSA_DO_PASSO);
    return () => clearTimeout(t);
  }, [tocando, experimentando, passo, revelados, indice, jornada, irPara]);

  const alternarTocar = () => {
    if (experimentando) return;
    if (!tocando && indice >= jornada.passos.length - 1 && revelados >= passo.mensagens.length) irPara(0, true);
    setTocando((t) => !t);
  };

  // ------------------------------------------------ experimente: a conversa
  const responder = useCallback(
    (entrada: Parameters<typeof avancar>[1], doCidadao: Mensagem) => {
      setConversa((c) => [...c, doCidadao]);
      const r = avancar(coleta, entrada);
      setColeta(r.estado);
      if (!r.respostas.length && !r.notas.length) return;
      setDigitando(true);
      const espera = reduzMovimento() ? 0 : Math.min(1400, 500 + (r.respostas[0]?.length ?? 0) * 3);
      setTimeout(() => {
        setDigitando(false);
        setConversa((c) => [...c, ...r.respostas.map((texto) => ({ de: 'assistente' as const, texto })), ...r.notas.map((texto) => ({ de: 'nota' as const, texto }))]);
      }, espera);
    },
    [coleta],
  );
  const aoEnviar = (texto: string) => responder({ texto }, { de: 'cidadao', texto });
  const aoFoto = () => responder({ foto: true }, { de: 'cidadao', texto: 'Foto', anexo: 'foto' });
  const aoClicarPonto = useCallback(
    (p: [number, number]) => {
      if (experimentando && coleta.etapa === 'local' && !digitando) responder({ local: p }, { de: 'cidadao', texto: 'Localização', anexo: 'local' });
    },
    [experimentando, coleta.etapa, digitando, responder],
  );
  const verAJornada = () => {
    const j = jornadaDoRelato(coleta, conversa.filter((m) => m.de !== 'nota'));
    setRelatoPronto(j);
    const triagem = j.passos.findIndex((p) => p.id === 'triagem');
    setIndice(triagem);
    setRevelados(0);
    setTocando(true);
  };

  // ------------------------------------------------ mapa
  const local = caso === 'experimente' ? coleta.relato.local : jornada.local;
  const mostrarVizinhos = ['cruzamento', 'aviso-unico'].includes(passo.id);
  const camadas = useMemo(() => camadasDoMapa(local, mostrarVizinhos ? jornada.vizinhos : []), [local, mostrarVizinhos, jornada.vizinhos]);
  const [alvo, setAlvo] = useState<{ destino: Destino; chave: number; lento?: boolean }>();
  const chaveDoAlvo = `${caso}|${local?.join(',') ?? ''}|${mostrarVizinhos}`;
  useEffect(() => {
    const destino: Destino = !local
      ? { tipo: 'df' }
      : { tipo: 'vista', vista: { centro: mostrarVizinhos ? [-47.6496, -15.635] : local, zoom: mostrarVizinhos ? 12.4 : 15.2, inclinacao: 50, rotacao: -12 } };
    setAlvo((a) => ({ destino, lento: true, chave: (a?.chave ?? 0) + 1 }));
    // A chave resume o local, o caso e os vizinhos.
  }, [chaveDoAlvo]);

  // ------------------------------------------------ teclas
  const atalhos = useRef({ alternarTocar, irPara, indice });
  atalhos.current = { alternarTocar, irPara, indice };
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.metaKey || e.ctrlKey || e.altKey) return;
      const a = atalhos.current;
      if (e.key === ' ') {
        e.preventDefault();
        a.alternarTocar();
      } else if (e.key === 'ArrowRight') a.irPara(a.indice + 1);
      else if (e.key === 'ArrowLeft') a.irPara(a.indice - 1);
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, []);

  const CASOS: { id: Caso; nome: string }[] = [
    { id: 'poste', nome: 'Poste apagado' },
    { id: 'apagao', nome: 'Rua no escuro' },
    { id: 'experimente', nome: 'Experimente' },
  ];

  return (
    <main className="jornada">
      <div className="jornada-celular">
        <Celular
          mensagens={mensagens}
          digitando={digitando}
          experimente={experimentando ? { etapa: coleta.etapa, aoEnviar, aoFoto, bloqueado: digitando } : undefined}
        />
      </div>

      <div className="jornada-centro">
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Caso" className="flex rounded-lg border border-linha bg-painel p-0.5">
            {CASOS.map((c) => (
              <button key={c.id} type="button" aria-pressed={c.id === caso} onClick={() => escolherCaso(c.id)} className={`condensado rounded-md px-3 py-1.5 text-rotulo ${c.id === caso ? 'bg-acento text-white' : 'text-texto-2 hover:text-white'}`}>
                {c.nome}
              </button>
            ))}
          </div>
          {!experimentando && (
            <div className="flex items-center gap-1" role="group" aria-label="Controles da história">
              <button type="button" onClick={() => irPara(indice - 1)} disabled={indice === 0} aria-label="Passo anterior (←)" className="rounded-md border border-linha px-2.5 py-1.5 text-rotulo text-texto hover:text-white disabled:opacity-30">
                ◀
              </button>
              <button type="button" onClick={alternarTocar} aria-label={tocando ? 'Pausar (espaço)' : 'Tocar (espaço)'} className="condensado min-w-20 rounded-md bg-acento px-3 py-1.5 text-rotulo text-white">
                {tocando ? '❚❚ Pausar' : '▶ Tocar'}
              </button>
              <button type="button" onClick={() => irPara(indice + 1)} disabled={indice >= jornada.passos.length - 1} aria-label="Próximo passo (→)" className="rounded-md border border-linha px-2.5 py-1.5 text-rotulo text-texto hover:text-white disabled:opacity-30">
                ▶
              </button>
            </div>
          )}
          {experimentando && coleta.etapa === 'concluido' && (
            <button type="button" onClick={verAJornada} className="condensado rounded-md bg-acento px-3 py-1.5 text-rotulo text-white">
              Ver o caminho deste relato →
            </button>
          )}
        </div>
        <div>
          <p className="text-corpo text-white">{experimentando ? 'Experimente: registre uma demanda' : jornada.nome}</p>
          <p className="text-nota text-texto-2">{experimentando ? 'O mesmo roteiro do assistente que funciona em Águas Claras. Nada é enviado.' : jornada.resumo}</p>
        </div>
        {!experimentando && (
          <ol className="flex gap-1" aria-label="Passos">
            {jornada.passos.map((p, k) => (
              <li key={p.id} className="flex-1">
                <button type="button" onClick={() => irPara(k)} aria-label={`Passo ${k + 1}: ${p.titulo}`} aria-current={k === indice ? 'step' : undefined} className={`block h-1.5 w-full rounded-full ${k === indice ? 'bg-acento-claro' : k < indice ? 'bg-acento/60' : 'bg-realce'}`} />
              </li>
            ))}
          </ol>
        )}
        <div className="min-h-0 flex-1">
          <Fluxo pecaAtual={experimentando ? (conversa.length > 1 ? 'coleta' : 'whatsapp') : passo.peca} percorridas={percorridas} />
        </div>
      </div>

      <div className="jornada-direita">
        <div className="mapa-pequeno relative h-56 shrink-0 overflow-hidden rounded-lg border border-linha">
          <Mapa margens={MARGENS} camadas={camadas} alvo={alvo} aoClicarPonto={aoClicarPonto} dicaDasRas />
          {experimentando && coleta.etapa === 'local' && <p className="pointer-events-none absolute inset-x-2 bottom-2 rounded bg-base/85 px-2 py-1 text-center text-rotulo text-acento-claro">Toque no mapa para marcar o local</p>}
        </div>
        {experimentando ? (
          <div className="painel-vidro space-y-2 p-4 text-nota">
            <p className="condensado text-micro text-texto-2">Como funciona</p>
            <p>Responda às perguntas no celular, como no WhatsApp: o tipo do problema, o que aconteceu, o local (no mapa), um ponto de referência e uma foto de exemplo.</p>
            <p>Ao confirmar, a demo mostra o caminho do seu relato pela triagem, pela revisão e até o órgão. O código começa com TESTE: como no dfac, simulações nunca são enviadas.</p>
          </div>
        ) : (
          <Detalhe passo={passo} indice={indice} total={jornada.passos.length} />
        )}
      </div>
    </main>
  );
}

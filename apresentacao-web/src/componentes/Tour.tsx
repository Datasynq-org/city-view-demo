import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollTrigger, rolarPara } from '../rolagem/rolagem';
import { aplicarTema, temaAtual, type Tema } from '../tema/tema';

type Parada = { y: number; nome: string; pausa: number };
const DESLOCAMENTO = 2.2; // segundos rolando entre uma parada e outra

// Paradas: um ponto por passo de cada cena fixa, na ordem da página.
function calcularParadas(): Parada[] {
  const cenas = ScrollTrigger.getAll()
    .filter((st) => String(st.vars.id ?? '').startsWith('cena-'))
    .sort((a, b) => a.start - b.start);
  return cenas.flatMap((st) => {
    const el = st.trigger as HTMLElement;
    const n = Math.max(1, Number(el.dataset.passos ?? 1));
    const pausa = Number(el.dataset.pausa ?? 4);
    const nome = el.dataset.nome ?? '';
    return Array.from({ length: n }, (_, i) => ({ y: st.start + ((i + 0.6) / n) * (st.end - st.start), nome, pausa }));
  });
}

// Tour automático: ▶ percorre a página sozinho; ← → avançam/voltam; espaço pausa; Esc para.
export function Tour() {
  const [tocando, setTocando] = useState(false);
  const [atual, setAtual] = useState(-1);
  const [total, setTotal] = useState(0);
  const [nome, setNome] = useState('');
  const [tema, setTema] = useState<Tema>(temaAtual());
  const trocarTema = () => {
    const novo: Tema = tema === 'claro' ? 'escuro' : 'claro';
    aplicarTema(novo, true);
    setTema(novo);
  };
  const paradas = useRef<Parada[]>([]);
  const indice = useRef(-1);
  const relogio = useRef<number | undefined>(undefined);
  const tocandoRef = useRef(false);

  const ir = useCallback((i: number) => {
    paradas.current = calcularParadas();
    const ps = paradas.current;
    if (!ps.length) return;
    const k = Math.min(ps.length - 1, Math.max(0, i));
    indice.current = k;
    setAtual(k); setTotal(ps.length); setNome(ps[k].nome);
    rolarPara(ps[k].y, DESLOCAMENTO);
    window.clearTimeout(relogio.current);
    if (tocandoRef.current) {
      relogio.current = window.setTimeout(() => {
        if (k >= ps.length - 1) { parar(); return; }
        ir(k + 1);
      }, (DESLOCAMENTO + ps[k].pausa) * 1000);
    }
  }, []);

  const parar = useCallback(() => {
    tocandoRef.current = false; setTocando(false);
    window.clearTimeout(relogio.current);
  }, []);

  const tocar = useCallback(() => {
    tocandoRef.current = true; setTocando(true);
    // começa da próxima parada depois da posição atual (ou do início, se estiver no fim)
    const ps = calcularParadas();
    const prox = ps.findIndex((p) => p.y > window.scrollY + 40);
    ir(prox < 0 ? 0 : prox);
  }, [ir]);

  const proxima = useCallback(() => {
    const ps = calcularParadas();
    const i = indice.current >= 0 ? indice.current + 1 : Math.max(0, ps.findIndex((p) => p.y > window.scrollY + 40));
    ir(i);
  }, [ir]);
  const anterior = useCallback(() => ir(Math.max(0, indice.current - 1)), [ir]);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); proxima(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); anterior(); }
      else if (e.key === ' ') { e.preventDefault(); if (tocandoRef.current) parar(); else tocar(); }
      else if (e.key === 'Escape') parar();
      else if (e.key === 't' || e.key === 'T') document.querySelector<HTMLButtonElement>('.tour button')?.click();
    };
    // se a pessoa rolar por conta própria, o tour para
    const manual = () => { if (tocandoRef.current) parar(); indice.current = -1; setAtual(-1); };
    window.addEventListener('keydown', tecla);
    window.addEventListener('wheel', manual, { passive: true });
    window.addEventListener('touchstart', manual, { passive: true });
    // ?tour=1 abre a página já se apresentando sozinha
    const auto = new URLSearchParams(location.search).has('tour') ? window.setTimeout(tocar, 1800) : undefined;
    return () => {
      window.clearTimeout(auto);
      window.removeEventListener('keydown', tecla);
      window.removeEventListener('wheel', manual);
      window.removeEventListener('touchstart', manual);
    };
  }, [proxima, anterior, parar, tocar]);

  return (
    <nav className="tour painel" aria-label="Tour da apresentação">
      <button onClick={trocarTema} title="Alternar tema (T)" aria-label={`Mudar para o tema ${tema === 'claro' ? 'escuro' : 'claro'}`}>
        ◐ {tema === 'claro' ? 'Escuro' : 'Claro'}
      </button>
      <button onClick={anterior} title="Voltar (←)">‹</button>
      <button className="principal" onClick={() => (tocando ? parar() : tocar())} title="Apresentar (espaço)">
        {tocando ? '❚❚ Pausar' : '▶ Apresentar'}
      </button>
      <button onClick={proxima} title="Avançar (→)">›</button>
      {atual >= 0 && <span className="onde">{nome} · {atual + 1}/{total}</span>}
    </nav>
  );
}

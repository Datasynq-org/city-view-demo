import { useRef } from 'react';
import { arquitetura as t } from '../conteudo/narrativa';
import { gsap, useGSAP, COM_MOVIMENTO, linhaDaCena } from '../rolagem/rolagem';

// Diagrama da arquitetura (viewBox 1400 × 640): legados → conectores → núcleo → visões.
const LX = 0, LW = 345, LH = 42, LY0 = 44, LP = 52; // coluna dos legados
const BUS = { x: 415, y: 214, w: 160, h: 212 }; // conectores
const NX = 650, NW = 330; // núcleo
const CAN = { y: 22, h: 92 }, ABE = { y: 150, h: 70 }, INC = { y: 286, h: 84 }, INT = { y: 418, h: 110 };
const SX = 1050, SW = 345, SH = 92, SYS = [150, 286, 422]; // visões

const RO = { integrado: 'integrado', pronto: 'pronta', citado: 'citado pelo Daniel', exemplo: 'exemplo' } as const;

function Caixa({ x, y, w, h, titulo, sub, classe, destaque }: { x: number; y: number; w: number; h: number; titulo: string; sub?: string; classe: string; destaque?: boolean }) {
  return (
    <g className={classe}>
      <rect x={x} y={y} width={w} height={h} rx={14} className={`caixa${destaque ? ' destaque' : ''}`} />
      <text x={x + 20} y={y + (sub ? 34 : h / 2 + 6)} className="ar-t">{titulo}</text>
      {sub && <text x={x + 20} y={y + 60} className="ar-s">{sub}</text>}
    </g>
  );
}

export function Arquitetura() {
  const raiz = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(COM_MOVIMENTO, () => {
        raiz.current!.classList.add('empilhado');
        const tl = linhaDaCena('arquitetura', raiz.current!, '+=520%', { apagar: 1 });
        const passos = gsap.utils.toArray<HTMLElement>('.passo', raiz.current);
        gsap.set(passos.slice(1), { autoAlpha: 0, y: 16 });
        passos.forEach((p, i) => {
          if (i === 0) return;
          tl.to(passos[i - 1], { autoAlpha: 0, y: -16, duration: 0.2 }, i - 0.1);
          tl.to(p, { autoAlpha: 1, y: 0, duration: 0.2 }, i + 0.05);
        });
        tl.to({}, { duration: passos.length }, 0);
        // 1 · legados
        tl.from('.ar-legado', { autoAlpha: 0, x: -24, stagger: 0.05, duration: 0.25 }, 0.1);
        tl.from('.ar-tec', { autoAlpha: 0, duration: 0.3 }, 0.6);
        // 2 · conectores e linhas
        tl.from('.ar-bus', { autoAlpha: 0, scale: 0.9, transformOrigin: '50% 50%', duration: 0.3 }, 1.05);
        tl.fromTo('.ar-cheia', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, stagger: 0.05 }, 1.2);
        tl.from('.ar-tracejada', { autoAlpha: 0, duration: 0.5, stagger: 0.03 }, 1.25);
        // 3 · canais e abertura de demandas
        tl.from('.ar-canais, .ar-abertura', { autoAlpha: 0, y: -16, stagger: 0.15, duration: 0.3 }, 2.05);
        tl.from('.ar-l3', { autoAlpha: 0, duration: 0.3, stagger: 0.1 }, 2.3);
        // 4 · incidente único e dados correndo
        tl.from('.ar-incidente', { autoAlpha: 0, scale: 0.95, transformOrigin: '50% 50%', duration: 0.3 }, 3.05);
        tl.from('.ar-l4', { autoAlpha: 0, duration: 0.3 }, 3.2);
        tl.from('.ar-fluxo', { autoAlpha: 0, duration: 0.3 }, 3.4);
        // 5 · inteligência e visões
        tl.from('.ar-intel', { autoAlpha: 0, scale: 0.95, transformOrigin: '50% 50%', duration: 0.3 }, 4.05);
        tl.from('.ar-l5', { autoAlpha: 0, duration: 0.3, stagger: 0.08 }, 4.25);
        tl.from('.ar-saida', { autoAlpha: 0, x: 24, stagger: 0.1, duration: 0.3 }, 4.3);
        tl.from('.ar-fluxo2', { autoAlpha: 0, duration: 0.3 }, 4.6);
      });
    },
    { scope: raiz },
  );

  // curva de cada legado até o lado esquerdo dos conectores
  const curvas = t.legados.map((l, i) => {
    const y1 = LY0 + i * LP + LH / 2;
    const y2 = BUS.y + 24 + (i * (BUS.h - 48)) / (t.legados.length - 1);
    return { d: `M${LX + LW},${y1} C${LX + LW + 50},${y1} ${BUS.x - 50},${y2} ${BUS.x},${y2}`, cheia: l.situacao === 'integrado' || l.situacao === 'pronto', l };
  });
  const meioInc = INC.y + INC.h / 2, meioInt = INT.y + INT.h / 2;
  const fluxoBus = `M${BUS.x + BUS.w},${BUS.y + BUS.h / 2} C${BUS.x + BUS.w + 50},${BUS.y + BUS.h / 2} ${NX - 50},${meioInc} ${NX},${meioInc}`;

  return (
    <section ref={raiz} className="cena relative z-10" data-cena="arquitetura" data-passos={t.passos.length} data-nome="Como funciona" data-pausa="4.5">
      <div className="palco flex-col !items-stretch justify-center gap-6">
      <div className="passos grid max-w-[56rem]">
        {t.passos.map((p, i) => (
          <div key={p.titulo} className="passo">
            {i === 0 && <p className="rotulo mb-3">{t.rotulo}</p>}
            <h2 className="titulo text-5xl">{p.titulo}</h2>
            <p className="mt-3 text-xl fraco">{p.texto}</p>
          </div>
        ))}
      </div>

      <svg className="arq w-full" viewBox="0 0 1400 660" preserveAspectRatio="xMinYMid meet" role="img" aria-label="Arquitetura do City View: sistemas legados, conectores, núcleo e visões">
        <text x={LX} y={24} className="ar-h">SISTEMAS QUE JÁ EXISTEM</text>
        <text x={BUS.x} y={BUS.y - 16} className="ar-h ar-bus">CONECTORES</text>
        <text x={NX} y={CAN.y - 6} className="ar-h ar-canais" dy={-8}>CITY VIEW</text>
        <text x={SX} y={SYS[0] - 24} className="ar-h ar-saida">VISÕES</text>

        {/* linhas legados → conectores */}
        {curvas.map((c, i) => (
          <path key={i} d={c.d} pathLength={1} className={`${c.cheia ? 'ar-cheia' : 'ar-tracejada'} s-${c.l.situacao}`} fill="none"
            strokeWidth={c.cheia ? 2 : 1.2} strokeDasharray={c.cheia ? 1 : '4 5'} style={{ fill: 'none' }} />
        ))}

        {/* legados */}
        {t.legados.map((l, i) => (
          <g key={l.nome} className="ar-legado">
            <rect x={LX} y={LY0 + i * LP} width={LW} height={LH} rx={10} className="caixa" style={l.situacao === 'integrado' || l.situacao === 'pronto' ? { stroke: `var(--${l.situacao === 'integrado' ? 'ok' : 'atencao'})` } : undefined} strokeDasharray={l.situacao === 'exemplo' || l.situacao === 'citado' ? '4 4' : undefined} />
            <text x={LX + 16} y={LY0 + i * LP + 25} className="ar-t ar-pq">{l.nome}</text>
            <text x={LX + LW - 14} y={LY0 + i * LP + 25} textAnchor="end" className={`ar-s ar-pq2 t-${l.situacao}`}>{RO[l.situacao]}</text>
          </g>
        ))}
        <text x={LX} y={LY0 + t.legados.length * LP + 10} className="ar-s ar-tec">{t.tecnologias}</text>
        <text x={LX} y={LY0 + t.legados.length * LP + 34} className="ar-s ar-tec ar-dep">{t.dependencias}</text>

        {/* conectores */}
        <g className="ar-bus">
          <rect x={BUS.x} y={BUS.y} width={BUS.w} height={BUS.h} rx={16} className="caixa destaque" />
          {t.conectores.map((c, i) => <text key={c} x={BUS.x + BUS.w / 2} y={BUS.y + 62 + i * 46} textAnchor="middle" className="ar-t ar-pq">{c}</text>)}
        </g>

        {/* núcleo */}
        <g className="ar-canais">
          <rect x={NX} y={CAN.y} width={NW} height={CAN.h} rx={14} className="caixa" />
          <text x={NX + 20} y={CAN.y + 34} className="ar-t">Canais do cidadão</text>
          <text x={NX + 20} y={CAN.y + 64} className="ar-s">{t.canais.join(' · ')}</text>
        </g>
        <Caixa classe="ar-abertura" x={NX} y={ABE.y} w={NW} h={ABE.h} titulo="Abertura de demandas" sub="coleta · triagem · revisão humana" />
        <Caixa classe="ar-incidente" x={NX} y={INC.y} w={NW} h={INC.h} titulo="Incidente único" sub="todo chamado no mesmo formato" destaque />
        <Caixa classe="ar-intel" x={NX} y={INT.y} w={NW} h={INT.h} titulo="Inteligência" sub="classificar · agrupar · cruzar · prever" destaque />

        {/* ligações do núcleo */}
        <path className="ar-l3 liga" d={`M${NX + NW / 2},${CAN.y + CAN.h} L${NX + NW / 2},${ABE.y}`} strokeWidth={1.4} markerEnd="url(#seta)" />
        <path className="ar-l3 liga" d={`M${NX},${ABE.y + ABE.h / 2} C${NX - 60},${ABE.y + ABE.h / 2} ${BUS.x + BUS.w + 40},${BUS.y + 30} ${BUS.x + BUS.w},${BUS.y + 30}`} fill="none" strokeWidth={1.4} markerEnd="url(#seta)" markerStart="url(#seta-volta)" />
        <text className="ar-l3 ar-s" x={BUS.x} y={BUS.y - 46}>protocolo no órgão ⇄ situação</text>
        <path className="ar-l4 liga" d={fluxoBus} fill="none" strokeWidth={1.6} markerEnd="url(#seta)" />
        <path className="ar-l4 liga" d={`M${NX + NW / 2},${ABE.y + ABE.h} L${NX + NW / 2},${INC.y}`} strokeWidth={1.4} markerEnd="url(#seta)" />
        <path className="ar-l5 liga" d={`M${NX + NW / 2},${INC.y + INC.h} L${NX + NW / 2},${INT.y}`} strokeWidth={1.4} markerEnd="url(#seta)" />
        {SYS.map((y, i) => (
          <path key={i} className="ar-l5 liga" d={`M${NX + NW},${meioInt} C${NX + NW + 60},${meioInt} ${SX - 60},${y + SH / 2} ${SX},${y + SH / 2}`} fill="none" strokeWidth={1.4} markerEnd="url(#seta)" />
        ))}

        {/* visões */}
        <Caixa classe="ar-saida" x={SX} y={SYS[0]} w={SW} h={SH} titulo="Governadora" sub="a cidade inteira e a velocidade da gestão" />
        <Caixa classe="ar-saida" x={SX} y={SYS[1]} w={SW} h={SH} titulo="Gestores" sub="um painel por área" />
        <Caixa classe="ar-saida" x={SX} y={SYS[2]} w={SW} h={SH} titulo="Cidadão" sub="acompanha e vê a gestão" />

        {/* dados correndo */}
        <g className="ar-fluxo">
          {curvas.filter((c) => c.cheia).map((c, i) => (
            <circle key={i} r={3.2} className={`t-${c.l.situacao}`}><animateMotion dur={`${2.4 + i * 0.4}s`} repeatCount="indefinite" path={c.d} /></circle>
          ))}
          {[0, 1, 2].map((i) => <circle key={`b${i}`} r={3.2} className="ponto-acento"><animateMotion dur="2.2s" begin={`-${i * 0.7}s`} repeatCount="indefinite" path={fluxoBus} /></circle>)}
        </g>
        <g className="ar-fluxo2">
          {SYS.map((y, i) => <circle key={i} r={3.2} className="ponto-atencao"><animateMotion dur="2.6s" begin={`-${i * 0.5}s`} repeatCount="indefinite" path={`M${NX + NW},${meioInt} C${NX + NW + 60},${meioInt} ${SX - 60},${y + SH / 2} ${SX},${y + SH / 2}`} /></circle>)}
        </g>

        <text x={1400} y={652} textAnchor="end" className="ar-s">{t.legenda}</text>

        <defs>
          <marker id="seta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" className="ponta" /></marker>
          <marker id="seta-volta" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" className="ponta" /></marker>
        </defs>
      </svg>
      </div>
    </section>
  );
}

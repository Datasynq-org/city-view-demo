import { useRef } from 'react';
import { Cena } from '../componentes/Cena';
import { MapaDF } from '../componentes/MapaDF';
import { estado, type Estado } from '../cidade/estado';
import { gsap, useGSAP, COM_MOVIMENTO, linhaDaCena, captura } from '../rolagem/rolagem';
import * as N from '../conteudo/narrativa';
import { CartaoInsight, Kpi, Alerta, Selo, Rotulo as RotuloDS } from '@ds';

// anima um campo do estado da cidade dentro da linha do tempo da cena
const anima = (tl: gsap.core.Timeline, campo: keyof Estado, de: number, para: number, em: number, dur = 0.6) =>
  tl.fromTo(estado, { [campo]: de }, { [campo]: para, duration: dur, ease: 'power2.inOut', immediateRender: false }, em);
const fixa = (tl: gsap.core.Timeline, valores: Partial<Estado>, em: number) => tl.set(estado, valores, em);

function Rotulo({ children }: { children: string }) {
  return <RotuloDS className="mb-4">{children}</RotuloDS>;
}

// 1 · Abertura: a cidade aparece
export function Abertura() {
  const raiz = useRef<HTMLElement>(null);
  useGSAP(() => {
    if (!captura) gsap.fromTo(estado, { aparecer: 0 }, { aparecer: 1, duration: 2.4, ease: 'power2.out' });
    const mm = gsap.matchMedia();
    mm.add(COM_MOVIMENTO, () => {
      raiz.current!.classList.add('empilhado');
      const tl = linhaDaCena('abertura', raiz.current!, '+=140%', { aparecer: 1 });
      gsap.set('.ab-2', { autoAlpha: 0, y: 24 });
      tl.to('.ab-1', { autoAlpha: 0, y: -24, duration: 0.2 }, 0.9).to('.ab-2', { autoAlpha: 1, y: 0, duration: 0.2 }, 1.05).to({}, { duration: 2 }, 0);
      tl.to('.ab-dica', { opacity: 0, duration: 0.2 }, 0);
    });
  }, { scope: raiz });
  const t = N.abertura;
  return (
    <section ref={raiz} className="cena relative z-10" data-cena="abertura" data-passos={2} data-nome="Abertura" data-pausa={3.5}>
      <div className="palco">
        <div className="passos coluna grid">
          <div className="ab-1 passo">
            <Rotulo>{t.rotulo}</Rotulo>
            <h1 className="titulo text-[7.5rem]">{t.titulo}</h1>
            <p className="mt-5 text-3xl fraco">{t.sub}</p>
          </div>
          <div className="ab-2 passo">
            <h2 className="titulo text-6xl">{t.cidadeTitulo}</h2>
            <p className="mt-6 text-xl fraco">{t.cidadeTexto}</p>
          </div>
        </div>
        <p className="ab-dica rotulo absolute bottom-8 left-16 fraco">{t.dica} ↓</p>
        <p className="absolute bottom-8 right-16 text-xs fraco">{t.aviso}</p>
      </div>
    </section>
  );
}

function Passo({ rotulo, titulo, texto, origem }: { rotulo?: string; titulo: string; texto: string; origem?: string }) {
  return (
    <div className="passo painel p-8">
      {rotulo && <Rotulo>{rotulo}</Rotulo>}
      <h2 className="titulo text-5xl">{titulo}</h2>
      <p className="mt-5 text-xl leading-relaxed fraco">{texto}</p>
      {origem && <p className="rotulo mt-5 fraco">{origem}</p>}
    </div>
  );
}

// 2 · Silos: os chamados se separam por órgão
export function Silos() {
  const t = N.silos;
  return (
    <Cena id="silos" nome="O problema" pausa={4} fim="+=260%" base={{ silos: 0 }} montar={(tl) => anima(tl, 'silos', 0, 1, 0.25, 0.9)}>
      {t.passos.map((p, i) => <Passo key={p.titulo} rotulo={i === 0 ? t.rotulo : undefined} titulo={p.titulo} texto={p.texto} />)}
    </Cena>
  );
}

// 3 · Virada: os silos se desfazem e a cidade se conecta
export function Virada() {
  const t = N.virada;
  return (
    <Cena id="virada" nome="A virada" pausa={4} fim="+=220%" base={{ silos: 1 }} montar={(tl) => { anima(tl, 'silos', 1, 0, 0.1, 0.8); anima(tl, 'conexoes', 0, 1, 0.7, 0.7); }}>
      {t.passos.map((p, i) => <Passo key={p.titulo} rotulo={i === 0 ? t.rotulo : undefined} titulo={p.titulo} texto={p.texto} />)}
    </Cena>
  );
}

function Cartao({ c }: { c: N.Caso }) {
  return <CartaoInsight className="passo" tipo={c.tipo} titulo={c.titulo} viu={c.viu} porque={c.porque} confianca={c.confianca} sugere={c.sugere} decide={N.inteligencia.decide} />;
}

// 4 · Inteligência: zoom em três casos; os chamados viram um incidente
export function Inteligencia() {
  const t = N.inteligencia;
  return (
    <Cena
      id="inteligencia" nome="Inteligência" pausa={6}
      fim="+=560%"
      base={{ conexoes: 0.35 }}
      montar={(tl) => {
        anima(tl, 'conexoes', 0.35, 0, 0.6, 0.3);
        t.casos.forEach((_, k) => {
          const i = k + 1;
          fixa(tl, { foco: k, agrupar: 0, zoom: 0 }, i - 0.05);
          anima(tl, 'zoom', 0, 1, i, 0.35);
          anima(tl, 'agrupar', 0, 1, i + 0.3, 0.4);
          if (k < t.casos.length - 1) { anima(tl, 'agrupar', 1, 0, i + 0.8, 0.12); anima(tl, 'zoom', 1, 0, i + 0.82, 0.15); }
        });
      }}
    >
      <Passo rotulo={t.rotulo} titulo={t.titulo} texto={t.texto} />
      {t.casos.map((c) => <Cartao key={c.titulo} c={c} />)}
    </Cena>
  );
}

// 5 · Sala de situação da governadora: mapa de calor + painel (HUD)
export function Sala() {
  const t = N.sala;
  const hud = (
    <div className="hud pointer-events-none absolute inset-0">
      <div className="absolute right-16 top-10 flex flex-col items-end gap-3">
        <Selo>{t.selo}</Selo>
        <div className="flex gap-3">
          {t.kpis.map((k) => <Kpi key={k.rotulo} rotulo={k.rotulo} valor={k.valor} />)}
        </div>
      </div>
      <Alerta className="absolute bottom-10 right-16 w-[22rem]" titulo="Alertas agora" itens={t.alertas} />
    </div>
  );
  return (
    <Cena id="sala" nome="Governadora" pausa={5} fim="+=260%" base={{ calor: 0 }} lado={hud} montar={(tl) => { anima(tl, 'calor', 0, 1, 0.2, 0.8); tl.from('.hud', { autoAlpha: 0, duration: 0.3 }, 0.3); }}>
      {t.passos.map((p, i) => <Passo key={p.titulo} rotulo={i === 0 ? t.rotulo : undefined} titulo={p.titulo} texto={p.texto} origem={p.origem || undefined} />)}
    </Cena>
  );
}

// 6 · Um painel por gestor: a cidade filtra por área
export function Gestores() {
  const t = N.gestores;
  return (
    <Cena
      id="gestores" nome="Gestores" pausa={3}
      fim="+=280%"
      base={{ filtro: 0, area: N.AREA[t.areas[0]] }}
      montar={(tl) => {
        anima(tl, 'filtro', 0, 1, 0.15, 0.4);
        t.areas.forEach((a, i) => fixa(tl, { area: N.AREA[a] }, i + 0.05));
      }}
    >
      {t.areas.map((a, i) => {
        const ar = N.AREAS[N.AREA[a]];
        return (
          <div key={a} className="passo painel p-8">
            <p className="rotulo mb-4">{t.rotulo}</p>
            <h2 className="titulo text-5xl"><span style={{ color: `var(--area-${N.AREA[a]})` }}>●</span> {ar.nome}</h2>
            <p className="mt-5 text-xl leading-relaxed fraco">{i === 0 ? t.citacao : t.texto}</p>
            {i === 0 && <p className="rotulo mt-5 fraco">Daniel, sobre os gestores</p>}
          </div>
        );
      })}
    </Cena>
  );
}

// 7 · Para o cidadão: transparência em três graus
export function Cidadao() {
  const t = N.cidadao;
  return (
    <Cena
      id="cidadao" nome="Cidadão" pausa={4}
      fim="+=260%"
      base={{ status: 1, grau: 1 }}
      montar={(tl) => { fixa(tl, { grau: 1 }, 0); fixa(tl, { grau: 2 }, 1.05); fixa(tl, { grau: 3 }, 2.05); }}
    >
      {t.passos.map((p, i) => (
        <div key={p.titulo} className="passo painel p-8">
          {i === 0 && <Rotulo>{t.rotulo}</Rotulo>}
          <h2 className="titulo text-5xl">{p.titulo}</h2>
          <p className="mt-5 text-xl leading-relaxed fraco">{p.texto}</p>
          <div className="mt-6 flex gap-5 text-sm">
            {N.STATUS.slice(0, i + 1).map((s, k) => <span key={s.nome}><span style={{ color: `var(--status-${k})` }}>●</span> {s.nome}</span>)}
          </div>
        </div>
      ))}
    </Cena>
  );
}

// 9 · Prova: Águas Claras
export function Prova() {
  const t = N.prova;
  const mapa = (
    <div className="pointer-events-none absolute right-16 top-1/2 w-[48rem] -translate-y-1/2">
      <MapaDF destaque={t.ra} className="w-full" />
      <p className="mt-2 text-right text-xs fraco">Limites oficiais das regiões administrativas (IDE/DF)</p>
    </div>
  );
  return (
    <Cena id="prova" nome="Prova" pausa={7} fim="+=120%" base={{ aparecer: 0 }} lado={mapa}>
      <div className="passo painel p-8">
        <Rotulo>{t.rotulo}</Rotulo>
        <h2 className="titulo text-6xl">{t.titulo}</h2>
        <p className="mt-5 text-xl leading-relaxed fraco">{t.texto}</p>
        <div className="mt-7 grid grid-cols-2 gap-6">
          {t.numeros.map((n) => (
            <div key={n.texto}>
              <p className="titulo text-5xl" style={{ color: 'var(--acento)' }}>{n.valor}</p>
              <p className="mt-1 text-sm fraco">{n.texto}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs fraco">{t.fontes}</p>
      </div>
    </Cena>
  );
}

// 10 · Encerramento
export function Encerramento() {
  const t = N.encerramento;
  return (
    <Cena id="fim" nome="Encerramento" pausa={4} fim="+=100%" base={{ conexoes: 0.5 }}>
      <div className="passo">
        <h2 className="titulo text-[7rem]">{t.titulo}</h2>
        {t.linhas.map((l) => <p key={l} className="mt-3 text-3xl fraco">{l}</p>)}
      </div>
    </Cena>
  );
}

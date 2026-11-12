// Os painéis do caso do apagão (P11 a P15): a conversa do cidadão, o contador
// de relatos, as etiquetas dos nós, o cartão da inteligência e a entrega aos
// sistemas dos órgãos. Tudo ilustrativo.
import React from "react";
import { useCurrentFrame } from "remotion";
import { camera, projeta } from "./camera";
import { NO_ENERGIA, NO_ILUMINACAO, NO_INSIGHT, NO_TRANSITO } from "./dados";
import { ALTURA, LARGURA, cor, fonte } from "./tema";
import { T, mix, prog, saida, suave } from "./tempo";

const PAINEL: React.CSSProperties = {
  position: "absolute",
  left: 1150,
  width: 660,
  background: "rgba(18,41,63,0.82)",
  border: `1px solid ${cor.linhaClara}`,
  padding: "30px 34px",
  boxSizing: "border-box",
};
const mono = (tam: number, c: string = cor.rotulo): React.CSSProperties => ({
  fontFamily: fonte.mono,
  fontWeight: 500,
  fontSize: tam,
  letterSpacing: "0.09em",
  color: c,
});

const entra = (f: number, de: number) => {
  const t = saida(prog(f, de, de + 12));
  return { opacity: t, transform: `translateY(${(1 - t) * 18}px)` };
};

const Balao: React.FC<{ f: number; em: number; meu?: boolean; children: React.ReactNode }> = ({ f, em, meu, children }) => (
  <div style={{ display: "flex", justifyContent: meu ? "flex-end" : "flex-start", marginBottom: 16, ...entra(f, em) }}>
    <div
      style={{
        maxWidth: 480,
        padding: "16px 20px",
        borderRadius: meu ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
        background: meu ? "#0E5C70" : "#1B3550",
        fontFamily: fonte.titulo,
        fontWeight: 500,
        fontSize: 29,
        lineHeight: 1.25,
        color: cor.branco,
      }}
    >
      {children}
    </div>
  </div>
);

const Conversa: React.FC = () => {
  const f = useCurrentFrame();
  const emP11 = f >= T.P11[0] && f < T.P11[1];
  const emP15 = f >= T.P15[0] && f < T.P15[1] + 6;
  if (!emP11 && !emP15) return null;
  const de = emP11 ? T.P11[0] : T.P15[0];
  const ate = emP11 ? T.P11[1] : T.P15[1] + 6;
  const op = prog(f, de, de + 10) * (1 - prog(f, ate - 8, ate));
  const passos = [
    { rotulo: "ENCAMINHADO", em: T.P15[0] + 15 },
    { rotulo: "EM ATENDIMENTO", em: T.P15[0] + 37 },
    { rotulo: "RESOLVIDO", em: T.P15[0] + 63 },
  ];
  return (
    <div style={{ ...PAINEL, top: 210, opacity: op }}>
      <div style={{ ...mono(18), marginBottom: 22, display: "flex", justifyContent: "space-between" }}>
        <span>CANAL DO CIDADÃO</span>
        <span>{emP11 ? "19:43" : "21:10"}</span>
      </div>
      {emP11 ? (
        <>
          <Balao f={f} em={T.P11[0] + 12} meu>
            Acabou a luz aqui. Os postes da rua também apagaram.
          </Balao>
          <Balao f={f} em={T.P11[0] + 52}>
            <div style={{ ...mono(15, cor.tealClaro), marginBottom: 6 }}>CITY VIEW</div>
            Recebido. Protocolo <b>CV-004812</b>. Avisamos você a cada passo.
          </Balao>
          <div style={{ display: "flex", gap: 10, marginTop: 26, flexWrap: "wrap" }}>
            {["WHATSAPP", "APP", "SITE", "TELEFONE"].map((c, i) => (
              <div key={c} style={{ ...mono(17, i === 0 ? cor.branco : cor.rotulo), padding: "8px 14px", border: `1px solid ${i === 0 ? cor.tealClaro : cor.linhaClara}`, opacity: prog(f, T.P11[0] + 70 + i * 5, T.P11[0] + 80 + i * 5) }}>
                {c}
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div style={{ ...mono(17), marginBottom: 18 }}>PROTOCOLO CV-004812</div>
          {passos.map((p, i) => {
            const feito = prog(f, p.em, p.em + 8);
            const ultimo = i === passos.length - 1;
            const c = ultimo ? cor.verde : cor.tealClaro;
            return (
              <div key={p.rotulo} style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 20, opacity: mix(0.28, 1, feito) }}>
                <div style={{ width: 22, height: 22, borderRadius: 11, border: `2px solid ${feito > 0 ? c : cor.linhaClara}`, background: feito >= 1 ? c : "transparent", transform: `scale(${1 + (1 - prog(f, p.em, p.em + 14)) * (feito > 0 ? 0.6 : 0)})` }} />
                <div style={{ fontFamily: fonte.cond, fontWeight: 600, fontSize: ultimo ? 54 : 40, letterSpacing: "0.04em", color: feito > 0 && ultimo ? cor.verde : cor.branco }}>{p.rotulo}</div>
              </div>
            );
          })}
          <Balao f={f} em={T.P15[0] + 70}>
            <div style={{ ...mono(15, cor.tealClaro), marginBottom: 6 }}>CITY VIEW</div>
            A energia voltou na sua rua. Obrigado por avisar.
          </Balao>
        </>
      )}
    </div>
  );
};

const Contador: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.P12[0] || f >= T.P12[1]) return null;
  const n = Math.round(140 * suave(prog(f, T.P12[0] + 5, T.P12[0] + 62)));
  const um = saida(prog(f, T.P12[0] + 88, T.P12[0] + 98));
  const op = prog(f, T.P12[0], T.P12[0] + 8) * (1 - prog(f, T.P12[1] - 8, T.P12[1]));
  return (
    <div style={{ ...PAINEL, top: 300, opacity: op }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}>
        <div style={{ fontFamily: fonte.cond, fontWeight: 600, fontSize: 190, lineHeight: 0.9, color: cor.branco, minWidth: 250 }}>{n}</div>
        <div style={mono(30, cor.tealClaro)}>RELATOS<br />ENERGIA</div>
      </div>
      <div style={{ marginTop: 26, display: "flex", alignItems: "baseline", gap: 22, opacity: um, transform: `translateX(${(1 - um) * -20}px)` }}>
        <div style={{ fontFamily: fonte.cond, fontWeight: 600, fontSize: 96, color: cor.tealClaro }}>→</div>
        <div style={{ fontFamily: fonte.cond, fontWeight: 600, fontSize: 96, color: cor.branco }}>1 INCIDENTE</div>
      </div>
    </div>
  );
};

/** Etiquetas presas aos nós do grafo. */
const Etiquetas: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.P12[0] + 80 || f >= T.P15[0] + 96) return null;
  const cam = camera(f);
  const some = 1 - prog(f, T.P15[0] + 70, T.P15[0] + 92);
  const itens = [
    { no: NO_ENERGIA, t1: "SEM ENERGIA", t2: "ENERGIA", em: T.P12[0] + 90, dx: -16, dy: 20, lado: "direita" as const, c: cor.branco },
    { no: NO_ILUMINACAO, t1: "POSTES APAGADOS", t2: "ILUMINAÇÃO", em: T.P13[0] + 58, dx: 22, dy: -12, lado: "esquerda" as const, c: cor.branco },
    { no: NO_TRANSITO, t1: "SEMÁFOROS APAGADOS", t2: "TRÂNSITO", em: T.P13[0] + 94, dx: -22, dy: 6, lado: "direita" as const, c: cor.branco },
    { no: NO_INSIGHT, t1: "1 FALHA · 3 ÓRGÃOS", t2: "INSIGHT", em: T.P13[0] + 140, dx: 30, dy: -30, lado: "esquerda" as const, c: cor.ambar },
  ];
  return (
    <>
      {itens.map((it) => {
        const p = projeta(cam, it.no.x, it.no.y);
        const op = prog(f, it.em, it.em + 10) * some;
        const estilo: React.CSSProperties =
          it.lado === "esquerda"
            ? { left: p.x + it.dx, textAlign: "left" }
            : { right: LARGURA - p.x - it.dx, textAlign: "right" };
        return (
          <div key={it.t1} style={{ position: "absolute", top: p.y + it.dy, opacity: op, whiteSpace: "nowrap", ...estilo }}>
            <div style={{ ...mono(it.c === cor.ambar ? 30 : 24, it.c), background: "rgba(11,30,49,0.78)", padding: "3px 8px", display: "inline-block" }}>{it.t1}</div>
            <br />
            <div style={{ ...mono(18, it.c === cor.ambar ? cor.ambar : cor.tealClaro), background: "rgba(11,30,49,0.78)", padding: "2px 8px", display: "inline-block" }}>{it.t2}</div>
          </div>
        );
      })}
    </>
  );
};

const SISTEMAS = ["ENERGIA", "ILUMINAÇÃO", "TRÂNSITO"];
const CARTAO_DE = T.P13[0] + 138;
const CONFIRMA = T.P14[0] + 40;
const ENVIO = T.P14[0] + 46;

const CartaoDaIA: React.FC = () => {
  const f = useCurrentFrame();
  if (f < CARTAO_DE || f >= T.P14[1] + 4) return null;
  const op = (1 - prog(f, T.P14[1] - 6, T.P14[1] + 4));
  const linha = (titulo: string, em: number, filho: React.ReactNode) => (
    <div style={{ marginTop: 20, ...entra(f, em) }}>
      <div style={mono(16)}>{titulo}</div>
      <div style={{ fontFamily: fonte.titulo, fontWeight: 500, fontSize: 27, lineHeight: 1.28, color: cor.texto, marginTop: 5 }}>{filho}</div>
    </div>
  );
  const confirmado = prog(f, CONFIRMA, CONFIRMA + 6);
  const cam = camera(f);
  const origem = projeta(cam, NO_INSIGHT.x, NO_INSIGHT.y);
  return (
    <>
      <div style={{ ...PAINEL, top: 96, borderColor: cor.ambar, ...entra(f, CARTAO_DE), opacity: op * entra(f, CARTAO_DE).opacity }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: cor.ambar }} />
          <div style={mono(17, cor.ambar)}>INSIGHT · O QUE A REDE VIU</div>
        </div>
        <div style={{ fontFamily: fonte.cond, fontWeight: 600, fontSize: 60, color: cor.branco, marginTop: 8, letterSpacing: "0.01em" }}>1 FALHA · 3 ÓRGÃOS</div>
        {linha("POR QUÊ", CARTAO_DE + 10, <>Mesma área · mesmos 10 minutos · relatos de três áreas</>)}
        {linha("CONFIANÇA", CARTAO_DE + 20, (
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 240, height: 8, background: cor.linha }}>
              <div style={{ width: `${saida(prog(f, CARTAO_DE + 22, CARTAO_DE + 44)) * 88}%`, height: 8, background: cor.ambar }} />
            </div>
            <span style={{ color: cor.branco }}>Alta</span>
          </div>
        ))}
        {linha("SUGESTÃO", CARTAO_DE + 30, (
          <>
            Energia trata a causa.<br />Iluminação não desloca equipe.<br />Trânsito vai aos cruzamentos.
          </>
        ))}
        <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 14, ...entra(f, CARTAO_DE + 42) }}>
          <div style={{ ...mono(18, confirmado > 0 ? cor.fundo : cor.branco), padding: "11px 18px", border: `1px solid ${cor.branco}`, background: confirmado > 0 ? cor.branco : "transparent", transform: `scale(${1 + Math.sin(confirmado * Math.PI) * 0.08})` }}>
            CONFIRMAR
          </div>
          <div style={{ ...mono(18), padding: "11px 18px", border: `1px solid ${cor.linhaClara}` }}>DESCARTAR</div>
          <div style={{ ...mono(18, cor.ambar), marginLeft: "auto" }}>UMA PESSOA DECIDE</div>
        </div>
      </div>

      {/* A entrega: do insight para o sistema de cada órgão. */}
      <svg width={LARGURA} height={ALTURA} style={{ position: "absolute", inset: 0, opacity: op }}>
        {SISTEMAS.map((s, i) => {
          const x = 1150 + i * 226 + 104;
          const y = 866;
          const t = suave(prog(f, ENVIO + i * 9, ENVIO + 34 + i * 9));
          if (t <= 0) return null;
          const cx = mix(origem.x, x, 0.5);
          const cy = Math.max(origem.y, y) + 150;
          const q = (u: number) => ({
            x: (1 - u) * (1 - u) * origem.x + 2 * (1 - u) * u * cx + u * u * x,
            y: (1 - u) * (1 - u) * origem.y + 2 * (1 - u) * u * cy + u * u * (y + 104),
          });
          const pts = Array.from({ length: 30 }, (_, k) => q((k / 29) * t));
          const ponta = q(t);
          return (
            <g key={s}>
              <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={cor.ambar} strokeOpacity={0.7} strokeWidth={2} />
              {t < 1 ? <circle cx={ponta.x} cy={ponta.y} r={6} fill={cor.branco} /> : null}
            </g>
          );
        })}
      </svg>
      {SISTEMAS.map((s, i) => {
        const chega = ENVIO + 34 + i * 9;
        const ok = prog(f, chega, chega + 8);
        return (
          <div key={s} style={{ position: "absolute", left: 1150 + i * 226, top: 866, width: 208, height: 104, boxSizing: "border-box", border: `1px solid ${ok > 0 ? cor.tealClaro : cor.linhaClara}`, background: "rgba(18,41,63,0.82)", padding: "14px 16px", opacity: op * prog(f, T.P14[0] + 6 + i * 5, T.P14[0] + 18 + i * 5) }}>
            <div style={mono(14)}>SISTEMA DE</div>
            <div style={{ fontFamily: fonte.cond, fontWeight: 600, fontSize: 31, color: cor.branco, letterSpacing: "0.03em" }}>{s}</div>
            <div style={{ ...mono(15, cor.tealClaro), marginTop: 4, opacity: ok }}>● RECEBIDO</div>
          </div>
        );
      })}
    </>
  );
};

export const Caso: React.FC = () => (
  <>
    <Etiquetas />
    <Conversa />
    <Contador />
    <CartaoDaIA />
  </>
);

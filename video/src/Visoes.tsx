// As três visões do ato 5 (P16 a P18). Indicadores simulados.
import React from "react";
import { useCurrentFrame } from "remotion";
import { cor, fonte } from "./tema";
import { T, prog, saida, suave } from "./tempo";

const mono = (tam: number, c: string = cor.rotulo): React.CSSProperties => ({
  fontFamily: fonte.mono,
  fontWeight: 500,
  fontSize: tam,
  letterSpacing: "0.09em",
  color: c,
});

const INDICADORES = [
  { rotulo: "TEMPO ATÉ RESOLVER", valor: (k: number) => (4.2 * k).toFixed(1).replace(".", ","), un: "dias" },
  { rotulo: "NO PRAZO", valor: (k: number) => String(Math.round(78 * k)), un: "%" },
  { rotulo: "INCIDENTES AGRUPADOS", valor: (k: number) => Math.round(1284 * k).toLocaleString("pt-BR"), un: "" },
];

export const Visoes: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.P16[0] + 40 || f >= T.P19[0]) return null;

  const sala = prog(f, T.P16[0] + 50, T.P16[0] + 62) * (1 - prog(f, T.P17[0] - 8, T.P17[0]));
  const filtro = f >= T.P17[0] && f < T.P17[1] ? Math.min(2, Math.floor((f - T.P17[0]) / 25)) : -1;
  const publico = prog(f, T.P18[0], T.P18[0] + 10) * (1 - prog(f, T.P19[0] - 8, T.P19[0]));

  return (
    <>
      {sala > 0 ? (
        <div style={{ position: "absolute", right: 96, top: 120, width: 420, opacity: sala }}>
          <div style={{ ...mono(20, cor.tealClaro), marginBottom: 14 }}>SALA DE SITUAÇÃO</div>
          {INDICADORES.map((ind, i) => {
            const em = T.P16[0] + 56 + i * 7;
            const k = suave(prog(f, em, em + 34));
            const t = saida(prog(f, em, em + 12));
            return (
              <div key={ind.rotulo} style={{ border: `1px solid ${cor.linhaClara}`, background: "rgba(18,41,63,0.82)", padding: "16px 22px", marginBottom: 12, opacity: t, transform: `translateX(${(1 - t) * 24}px)` }}>
                <div style={mono(16)}>{ind.rotulo}</div>
                <div style={{ fontFamily: fonte.cond, fontWeight: 600, fontSize: 74, lineHeight: 1.05, color: cor.branco }}>
                  {ind.valor(k)}
                  <span style={{ fontSize: 34, color: cor.rotulo, marginLeft: 8 }}>{ind.un}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {filtro >= 0 ? (
        <div style={{ position: "absolute", right: 96, top: 120, textAlign: "right" }}>
          <div style={mono(20, cor.tealClaro)}>PAINEL DO GESTOR</div>
          <div style={{ fontFamily: fonte.cond, fontWeight: 600, fontSize: 92, color: cor.branco, letterSpacing: "0.02em" }}>
            {["ÁGUA E ESGOTO", "ILUMINAÇÃO", "VIAS"][filtro]}
          </div>
        </div>
      ) : null}

      {publico > 0 ? (
        <div style={{ position: "absolute", right: 96, top: 120, textAlign: "right", opacity: publico }}>
          <div style={mono(20, cor.tealClaro)}>MAPA PÚBLICO</div>
          <div style={{ fontFamily: fonte.cond, fontWeight: 600, fontSize: 76, color: cor.verde, letterSpacing: "0.02em" }}>RESOLVIDOS ESTE MÊS</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
            {["RESOLVIDOS", "EM RESOLUÇÃO", "ABERTOS"].map((c, i) => (
              <div key={c} style={{ ...mono(17, i === 0 ? cor.fundo : cor.rotulo), padding: "8px 14px", border: `1px solid ${i === 0 ? cor.verde : cor.linhaClara}`, background: i === 0 ? cor.verde : "transparent" }}>
                {c}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
};

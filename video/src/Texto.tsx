// Tipografia do filme: títulos palavra a palavra, rótulos em mono, fontes e selos.
import React from "react";
import { useCurrentFrame } from "remotion";
import { cor, fonte } from "./tema";
import { T, prog, saida } from "./tempo";

const QUADROS_POR_PALAVRA = 10;

export const Palavras: React.FC<{ texto: string; em: number; style?: React.CSSProperties }> = ({ texto, em, style }) => {
  const f = useCurrentFrame();
  return (
    <div style={style}>
      {texto.split(" ").map((p, i) => {
        const t = saida(prog(f, em + i * QUADROS_POR_PALAVRA, em + i * QUADROS_POR_PALAVRA + 9));
        return (
          <span key={i} style={{ display: "inline-block", opacity: t, transform: `translateY(${(1 - t) * 16}px)`, marginRight: "0.26em" }}>
            {p}
          </span>
        );
      })}
    </div>
  );
};

type Linha = { texto: string; em: number };

/** Bloco de texto do canto inferior esquerdo: rótulos em mono e títulos. */
export const Bloco: React.FC<{
  de: number;
  ate: number;
  rotulos?: Linha[];
  linhas?: Linha[];
  fonteDoDado?: string;
  tam?: number;
  largura?: number;
}> = ({ de, ate, rotulos = [], linhas = [], fonteDoDado, tam = 78, largura = 1180 }) => {
  const f = useCurrentFrame();
  if (f < de || f >= ate) return null;
  const some = 1 - prog(f, ate - 8, ate);
  return (
    <>
      <div style={{ position: "absolute", left: 96, bottom: 132, opacity: some, maxWidth: largura }}>
        {rotulos.map((r) => (
          <div
            key={r.texto}
            style={{
              fontFamily: fonte.mono,
              fontWeight: 500,
              fontSize: 30,
              letterSpacing: "0.08em",
              color: cor.tealClaro,
              marginBottom: 14,
              opacity: prog(f, r.em, r.em + 8),
            }}
          >
            {r.texto}
          </div>
        ))}
        {linhas.map((l) => (
          <Palavras
            key={l.texto}
            texto={l.texto}
            em={l.em}
            style={{ fontFamily: fonte.titulo, fontWeight: 600, fontSize: tam, lineHeight: 1.08, color: cor.branco, letterSpacing: "-0.01em" }}
          />
        ))}
      </div>
      {fonteDoDado ? (
        <div style={{ position: "absolute", right: 96, bottom: 60, fontFamily: fonte.mono, fontSize: 20, color: cor.rotulo, opacity: some * prog(f, de + 6, de + 14) }}>
          Fonte: {fonteDoDado}
        </div>
      ) : null}
    </>
  );
};

const estiloSelo: React.CSSProperties = {
  fontFamily: fonte.mono,
  fontSize: 20,
  letterSpacing: "0.1em",
  padding: "8px 14px",
  border: `1px solid ${cor.linhaClara}`,
  color: cor.rotulo,
  background: "rgba(11,30,49,0.6)",
};

export const Selos: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= T.CARTAO[0]) return null;
  const extra = prog(f, T.P16[0] + 10, T.P16[0] + 22) * (1 - prog(f, T.P19[0] - 8, T.P19[0]));
  return (
    <div style={{ position: "absolute", left: 96, bottom: 54, display: "flex", gap: 12, opacity: prog(f, 20, 40) * (1 - prog(f, T.P20[0] + 30, T.P20[0] + 42)) }}>
      <div style={estiloSelo}>PROPOSTA · CENÁRIO ILUSTRATIVO</div>
      {extra > 0 ? (
        <div style={{ ...estiloSelo, borderColor: cor.ambar, color: cor.ambar, opacity: extra }}>DEMONSTRAÇÃO · DADOS SIMULADOS</div>
      ) : null}
    </div>
  );
};

/** Moldura de sala de operações: cantos de mira e leituras em mono. */
export const Hud: React.FC = () => {
  const f = useCurrentFrame();
  const op = prog(f, T.P03[0] + 10, T.P03[0] + 30) * (1 - prog(f, T.P20[0], T.P20[0] + 20));
  if (op <= 0) return null;
  const canto = (estilo: React.CSSProperties) => (
    <div style={{ position: "absolute", width: 34, height: 34, borderColor: cor.linhaClara, borderStyle: "solid", borderWidth: 0, ...estilo }} />
  );
  const seg = Math.floor(f / 30);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: op }}>
      {canto({ left: 48, top: 48, borderLeftWidth: 2, borderTopWidth: 2 })}
      {canto({ right: 48, top: 48, borderRightWidth: 2, borderTopWidth: 2 })}
      {canto({ left: 48, bottom: 28, borderLeftWidth: 2, borderBottomWidth: 2 })}
      {canto({ right: 48, bottom: 28, borderRightWidth: 2, borderBottomWidth: 2 })}
      <div style={{ position: "absolute", left: 96, top: 60, fontFamily: fonte.mono, fontSize: 18, letterSpacing: "0.12em", color: cor.rotulo }}>
        DISTRITO FEDERAL · 15°47′S 47°52′W
      </div>
      <div style={{ position: "absolute", right: 96, top: 60, fontFamily: fonte.mono, fontSize: 18, letterSpacing: "0.12em", color: cor.rotulo }}>
        {f >= T.P09[0] + 60 ? "CITY VIEW · " : ""}T+{String(Math.floor(seg / 60)).padStart(2, "0")}:{String(seg % 60).padStart(2, "0")}
      </div>
    </div>
  );
};

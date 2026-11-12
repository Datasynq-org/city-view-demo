// Rótulos das colunas de silos (P05 a P08), presos às posições do mapa.
import React from "react";
import { useCurrentFrame } from "remotion";
import { camera, projeta } from "./camera";
import { AREAS, COLUNA_X, SILO_BASE, SILO_TOPO } from "./dados";
import { cor, fonte } from "./tema";
import { T, prog } from "./tempo";

export const Silos: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.P05[0] + 20 || f >= T.P09[0] + 20) return null;
  const cam = camera(f);
  const some = 1 - prog(f, T.P09[0], T.P09[0] + 16);
  return (
    <>
      {AREAS.map((area, i) => {
        const em = T.P05[0] + 34 + i * 6;
        const topo = projeta(cam, COLUNA_X[i], SILO_TOPO - 16);
        const base = projeta(cam, COLUNA_X[i], SILO_BASE + 12);
        const ok = prog(f, em + 30, em + 38);
        return (
          <React.Fragment key={area}>
            <div style={{ position: "absolute", left: topo.x - 150, width: 300, top: topo.y - 26, textAlign: "center", fontFamily: fonte.mono, fontWeight: 500, fontSize: 21, letterSpacing: "0.08em", color: cor.texto, opacity: prog(f, em, em + 10) * some }}>
              {area}
            </div>
            <div style={{ position: "absolute", left: base.x - 150, width: 300, top: base.y, textAlign: "center", fontFamily: fonte.mono, fontWeight: 500, fontSize: 22, letterSpacing: "0.1em", color: cor.verde, opacity: ok * some }}>
              ● OK
            </div>
          </React.Fragment>
        );
      })}
    </>
  );
};

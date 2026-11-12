// A camada vetorial do filme: o mapa oficial das RAs, os sinais, os silos, o
// grafo e o caso do apagão. Tudo em coordenadas do mapa, sob uma só câmera.
import React from "react";
import { useCurrentFrame } from "remotion";
import { camera, transformada } from "./camera";
import {
  CASO,
  CENTRO,
  NO_ENERGIA,
  NO_ILUMINACAO,
  NO_INSIGHT,
  NO_TRANSITO,
  PAR_P08,
  arestas,
  calor,
  elos,
  pontos,
  postes,
  ras,
  relatos,
  satIluminacao,
  satTransito,
} from "./dados";
import { ALTURA, LARGURA, cor } from "./tema";
import { T, clamp01, entrada, mix, prog, saida, suave } from "./tempo";

/** Brilho de uma luz do bairro: 1 acesa, 0 apagada. `d` é a distância ao centro do caso. */
const brilhoDoBairro = (f: number, d: number, r: number) => {
  if (d > CASO.raio) return 1;
  const inicio = T.P10[0] + 22 + d * 1.3;
  const apagando = prog(f, inicio, inicio + 6);
  const pisca = f >= inicio - 5 && f < inicio ? (Math.sin(f * 2.7 + r * 40) > 0 ? 0.4 : 1) : 1;
  const volta = T.P15[0] + 48 + (1 - d / CASO.raio) * 26 + r * 6;
  const acendendo = prog(f, volta, volta + 7);
  return pisca * (1 - apagando * (1 - acendendo));
};

const FILTROS_P17 = [0, 2, 3]; // água e esgoto, iluminação, vias

export const Mundo: React.FC = () => {
  const f = useCurrentFrame();
  if (f < T.P03[0] - 2) return null;

  const cam = camera(f);
  const z = cam.z;
  const fino = 1 / Math.pow(z, 0.75);

  const opacidade =
    prog(f, T.P03[0], T.P03[0] + 18) *
    mix(1, 0.8, prog(f, T.P19[0] - 1, T.P19[0])) *
    (1 - prog(f, T.P20[0] + 44, T.P20[0] + 52));
  const emSilos = prog(f, T.P05[0] + 10, T.P05[0] + 70) * (1 - prog(f, T.P09[0] + 5, T.P09[0] + 70));
  const colapso = (r: number) => entrada(prog(f, T.P20[0] + r * 12, T.P20[0] + r * 12 + 26));

  // --- Polígonos das RAs ---
  const poligonos = ras.map((ra, i) => {
    const desenho = saida(prog(f, T.P03[0] + (i % 9) * 3, T.P03[0] + 70 + (i % 9) * 3));
    return (
      <path
        key={ra.codigo + i}
        d={ra.d}
        pathLength={1}
        fill={cor.tealClaro}
        fillOpacity={0.045 * desenho}
        stroke={cor.tealClaro}
        strokeOpacity={0.42}
        strokeWidth={1.4}
        vectorEffect="non-scaling-stroke"
        strokeDasharray={1}
        strokeDashoffset={1 - desenho}
        strokeLinejoin="round"
      />
    );
  });
  const opPoligonos = mix(1, 0.22, emSilos) * (1 - prog(f, T.P20[0], T.P20[0] + 30));

  // --- Sinais ---
  const filtro =
    f >= T.P17[0] && f < T.P17[1]
      ? FILTROS_P17[Math.min(2, Math.floor((f - T.P17[0]) / 25))]
      : -1;
  const sinais: React.ReactNode[] = [];
  for (let i = 0; i < pontos.length; i++) {
    const p = pontos[i];
    const acende = T.P04[0] + p.acende * 104;
    if (f < acende) continue;
    const clarao = 1 - prog(f, acende, acende + 9);
    const ida = suave(prog(f, T.P05[0] + 5 + p.r1 * 45, T.P05[0] + 45 + p.r1 * 45));
    const volta = suave(prog(f, T.P09[0] + 5 + p.r2 * 40, T.P09[0] + 50 + p.r2 * 40));
    const s = ida * (1 - volta);
    const c = colapso(p.r1);
    const x = mix(mix(p.x, p.sx, s), CENTRO.x, c);
    const y = mix(mix(p.y, p.sy, s), CENTRO.y, c);

    let alfa = 0.88;
    let fill = cor.tealClaro;
    let raio = 0.95 + clarao * 1.7;
    if (p.orfao && s > 0.5) {
      fill = cor.vermelho;
      alfa = 0.35 + 0.65 * Math.abs(Math.sin(f / 5 + p.r1 * 6));
      raio = 2.3;
    }
    if (filtro >= 0) alfa *= p.area === filtro ? 1 : 0.06;
    if (f >= T.P18[0] && f < T.P19[0]) {
      const quando = T.P18[0] + 4 + p.r2 * 58;
      if (f >= quando) {
        fill = cor.verde;
        raio += (1 - prog(f, quando, quando + 8)) * 1.4;
      }
    }
    const d = Math.hypot(p.x - CASO.x, p.y - CASO.y);
    if (d <= CASO.raio) alfa *= mix(0.1, 1, brilhoDoBairro(f, d, p.r1));
    alfa *= 1 - prog(c, 0.75, 1);
    if (alfa < 0.01) continue;
    sinais.push(<circle key={i} cx={x} cy={y} r={raio * fino} fill={fill} fillOpacity={alfa} />);
  }

  // --- Grafo: arestas entre sinais e rede entre RAs ---
  const grafo: React.ReactNode[] = [];
  if (f >= T.P09[0]) {
    const base =
      mix(0.34, 0.14, prog(z, 1.6, 3)) *
      mix(1, 0.4, prog(f, T.P16[0], T.P16[0] + 30) * (1 - prog(f, T.P19[0] - 1, T.P19[0]))) *
      (filtro >= 0 ? 0.25 : 1) *
      (1 - prog(f, T.P20[0], T.P20[0] + 24));
    for (let i = 0; i < arestas.length; i++) {
      const e = arestas[i];
      const inicio = T.P09[0] + 38 + e.ordem * 62;
      const t = saida(prog(f, inicio, inicio + 16));
      if (t <= 0) continue;
      const a = pontos[e.a];
      const b = pontos[e.b];
      const clarao = 1 - prog(f, inicio + 10, inicio + 30);
      grafo.push(
        <line
          key={i}
          x1={a.x}
          y1={a.y}
          x2={mix(a.x, b.x, t)}
          y2={mix(a.y, b.y, t)}
          stroke={cor.tealClaro}
          strokeOpacity={base + clarao * 0.5}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />,
      );
    }
    const opElos = (filtro >= 0 ? 0.3 : 1) * (1 - prog(f, T.P20[0], T.P20[0] + 24));
    elos.forEach((e, i) => {
      const inicio = T.P09[0] + 50 + e.ordem * 45;
      const t = saida(prog(f, inicio, inicio + 20));
      if (t <= 0) return;
      grafo.push(
        <line
          key={"e" + i}
          x1={e.ax}
          y1={e.ay}
          x2={mix(e.ax, e.bx, t)}
          y2={mix(e.ay, e.by, t)}
          stroke={cor.tealClaro}
          strokeOpacity={0.5 * opElos}
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
        />,
      );
      if (f < inicio + 20) return;
      // No fecho, todos os pulsos batem juntos.
      const fase = f >= T.P19[0] ? ((f - T.P19[0]) / 40) % 1 : (f / 46 + e.fase) % 1;
      grafo.push(
        <circle
          key={"p" + i}
          cx={mix(e.ax, e.bx, fase)}
          cy={mix(e.ay, e.by, fase)}
          r={2 * fino}
          fill={cor.branco}
          fillOpacity={Math.sin(fase * Math.PI) * opElos}
        />,
      );
    });
  }

  // --- P08: a primeira aresta, entre energia e iluminação ---
  let primeira: React.ReactNode = null;
  if (f >= T.P08[0] && f < T.P09[0] + 30) {
    const a = pontos[PAR_P08.a];
    const b = pontos[PAR_P08.b];
    const t = suave(prog(f, T.P08[0] + 8, T.P08[0] + 40));
    const some = 1 - prog(f, T.P09[0] + 5, T.P09[0] + 28);
    primeira = (
      <g opacity={some}>
        <line
          x1={a.sx}
          y1={a.sy}
          x2={mix(a.sx, b.sx, t)}
          y2={mix(a.sy, b.sy, t)}
          stroke={cor.tealClaro}
          strokeWidth={2.6}
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={a.sx} cy={a.sy} r={3.2} fill={cor.branco} />
        <circle cx={a.sx} cy={a.sy} r={3.2 + prog(f, T.P08[0], T.P08[0] + 30) * 14} fill="none"
          stroke={cor.tealClaro} strokeWidth={0.5} opacity={1 - prog(f, T.P08[0], T.P08[0] + 30)} />
        {t >= 1 ? <circle cx={b.sx} cy={b.sy} r={3.2} fill={cor.branco} /> : null}
        {t >= 1 ? (
          <circle cx={b.sx} cy={b.sy} r={3.2 + prog(f, T.P08[0] + 40, T.P08[0] + 70) * 14} fill="none"
            stroke={cor.tealClaro} strokeWidth={0.5} opacity={1 - prog(f, T.P08[0] + 40, T.P08[0] + 70)} />
        ) : null}
      </g>
    );
  }

  // --- Malha de luzes do bairro (só no zoom) ---
  const luzes: React.ReactNode[] = [];
  const opLuzes = prog(z, 1.8, 4.2);
  if (opLuzes > 0) {
    for (let i = 0; i < postes.length; i++) {
      const p = postes[i];
      const b = brilhoDoBairro(f, p.d, p.r);
      luzes.push(
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={0.3 + (p.r > 0.9 ? 0.16 : 0)}
          fill={p.r < 0.22 ? "#CFEFF5" : "#F1C987"}
          fillOpacity={opLuzes * mix(0.035, 0.5 + p.r * 0.5, b)}
        />,
      );
    }
  }

  const escuro = prog(f, T.P10[0] + 24, T.P10[0] + 50) * (1 - prog(f, T.P15[0] + 48, T.P15[0] + 80));
  const sombra =
    escuro > 0 ? (
      <circle cx={CASO.x} cy={CASO.y} r={CASO.raio + 1} fill="#040C15" fillOpacity={0.78 * escuro} filter="url(#suave)" />
    ) : null;

  // --- O caso: relatos, nós e o insight ---
  const caso: React.ReactNode[] = [];
  if (f >= T.P10[0] && f < T.P16[0] + 40) {
    const sai = 1 - prog(f, T.P15[0] + 70, T.P15[0] + 96);
    // Contorno da área sem energia.
    const anel = saida(prog(f, T.P10[0] + 50, T.P10[0] + 78)) * (1 - prog(f, T.P15[0] + 48, T.P15[0] + 80));
    caso.push(
      <circle key="anel" cx={CASO.x} cy={CASO.y} r={CASO.raio + 1.2} fill="none" stroke={cor.vermelho}
        strokeOpacity={0.8 * anel} strokeWidth={2} vectorEffect="non-scaling-stroke"
        strokeDasharray="12 9" transform={`rotate(${f * 0.2} ${CASO.x} ${CASO.y})`} />,
    );

    const grupo = (
      chave: string,
      lista: { x: number; y: number; t: number }[],
      no: { x: number; y: number },
      inicio: number,
      espalha: number,
      junta: number,
    ) => {
      const m = suave(prog(f, junta, junta + 26));
      lista.forEach((r, i) => {
        const nasce = inicio + r.t * espalha;
        if (f < nasce) return;
        const x = mix(r.x, no.x, m);
        const y = mix(r.y, no.y, m);
        const linha = saida(prog(f, nasce + 5, nasce + 15));
        const alfa = 1 - prog(m, 0.8, 1);
        caso.push(
          <g key={chave + i} opacity={alfa * sai}>
            <line x1={x} y1={y} x2={mix(x, no.x, linha)} y2={mix(y, no.y, linha)} stroke={cor.tealClaro}
              strokeOpacity={0.55} strokeWidth={1} vectorEffect="non-scaling-stroke" />
            <circle cx={x} cy={y} r={0.5 + (1 - prog(f, nasce, nasce + 8)) * 0.8} fill={cor.tealClaro} />
            <circle cx={x} cy={y} r={0.5 + prog(f, nasce, nasce + 16) * 2.4} fill="none" stroke={cor.tealClaro}
              strokeWidth={0.12} opacity={1 - prog(f, nasce, nasce + 16)} />
          </g>,
        );
      });
      const nasceNo = junta + 22;
      if (f >= nasceNo) {
        const esc = saida(prog(f, nasceNo, nasceNo + 12));
        caso.push(
          <g key={chave + "no"} opacity={sai}>
            <circle cx={no.x} cy={no.y} r={1.25 * esc} fill={cor.branco} />
            <circle cx={no.x} cy={no.y} r={1.25 + prog(f, nasceNo, nasceNo + 24) * 6} fill="none"
              stroke={cor.branco} strokeWidth={0.18} opacity={1 - prog(f, nasceNo, nasceNo + 24)} />
          </g>,
        );
      }
    };
    grupo("en", relatos, NO_ENERGIA, T.P12[0] + 5, 55, T.P12[0] + 66);
    grupo("il", satIluminacao, NO_ILUMINACAO, T.P13[0] + 8, 18, T.P13[0] + 34);
    grupo("tr", satTransito, NO_TRANSITO, T.P13[0] + 48, 16, T.P13[0] + 70);

    // As três áreas se ligam, e do cruzamento nasce o insight.
    const liga = T.P13[0] + 98;
    const nos = [NO_ENERGIA, NO_ILUMINACAO, NO_TRANSITO];
    nos.forEach((a, i) => {
      const b = nos[(i + 1) % 3];
      const t = saida(prog(f, liga + i * 4, liga + 18 + i * 4));
      if (t <= 0) return;
      caso.push(
        <line key={"tri" + i} x1={a.x} y1={a.y} x2={mix(a.x, b.x, t)} y2={mix(a.y, b.y, t)} stroke={cor.branco}
          strokeOpacity={0.75 * sai} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />,
      );
    });
    const sobe = liga + 20;
    const nasce = T.P13[0] + 135;
    nos.forEach((a, i) => {
      const t = saida(prog(f, sobe, nasce));
      if (t <= 0) return;
      caso.push(
        <line key={"up" + i} x1={a.x} y1={a.y} x2={mix(a.x, NO_INSIGHT.x, t)} y2={mix(a.y, NO_INSIGHT.y, t)}
          stroke={cor.ambar} strokeOpacity={0.8 * sai} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />,
      );
      if (f >= nasce) {
        const fase = ((f - nasce) / 32 + i / 3) % 1;
        caso.push(
          <circle key={"pu" + i} cx={mix(a.x, NO_INSIGHT.x, fase)} cy={mix(a.y, NO_INSIGHT.y, fase)} r={0.36}
            fill={cor.branco} opacity={Math.sin(fase * Math.PI) * sai} />,
        );
      }
    });
    if (f >= nasce) {
      const k = prog(f, nasce, nasce + 16);
      const esc = k < 1 ? saida(k) * (1 + 0.35 * Math.sin(k * Math.PI)) : 1 + 0.06 * Math.sin((f - nasce) / 8);
      caso.push(
        <g key="insight" opacity={sai}>
          <circle cx={NO_INSIGHT.x} cy={NO_INSIGHT.y} r={3.4 * esc} fill={cor.ambar} fillOpacity={0.18} />
          <circle cx={NO_INSIGHT.x} cy={NO_INSIGHT.y} r={1.9 * esc} fill={cor.ambar} />
          {[0, 14].map((atraso) => (
            <circle key={atraso} cx={NO_INSIGHT.x} cy={NO_INSIGHT.y}
              r={1.9 + prog(f, nasce + atraso, nasce + atraso + 36) * 13} fill="none" stroke={cor.ambar}
              strokeWidth={0.22} opacity={1 - prog(f, nasce + atraso, nasce + atraso + 36)} />
          ))}
        </g>,
      );
    }
  }

  // --- Mapa de calor do P16 (simulado) ---
  const opCalor = prog(f, T.P16[0] + 45, T.P16[0] + 85) * (1 - prog(f, T.P17[0] - 4, T.P17[0] + 6));
  const mapaDeCalor =
    opCalor > 0 ? (
      <g opacity={opCalor} filter="url(#borrao)">
        {calor.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r={14 + c.peso * 26}
            fill={c.peso > 0.82 ? cor.vermelho : c.peso > 0.6 ? cor.ambar : cor.tealClaro}
            fillOpacity={0.1 + c.peso * 0.22} />
        ))}
      </g>
    ) : null;

  // --- O ponto final, que vira a marca ---
  const pontoFinal =
    f >= T.P20[0] + 22 ? (
      <circle cx={CENTRO.x} cy={CENTRO.y} r={3.2 * saida(prog(f, T.P20[0] + 22, T.P20[0] + 36))}
        fill={cor.tealClaro} opacity={1} />
    ) : null;

  return (
    <svg width={LARGURA} height={ALTURA} style={{ position: "absolute", inset: 0, opacity: clamp01(opacidade) }}>
      <defs>
        <filter id="borrao" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={14} />
        </filter>
        <filter id="suave" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={1.1} />
        </filter>
      </defs>
      <g transform={transformada(cam)}>
        <g opacity={opPoligonos}>{poligonos}</g>
        {mapaDeCalor}
        {grafo}
        {sinais}
        {sombra}
        {luzes}
        {primeira}
        {caso}
        {pontoFinal}
      </g>
    </svg>
  );
};

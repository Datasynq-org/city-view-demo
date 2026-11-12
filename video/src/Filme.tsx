// "A cidade conectada" (CV-VID-001, r2). A montagem: placa aérea gerada
// embaixo, mundo vetorial em cima, textos, selos e som.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { Caso } from "./Caso";
import { Mundo } from "./Mundo";
import { Silos } from "./Silos";
import { Bloco, Hud, Palavras, Selos } from "./Texto";
import { Visoes } from "./Visoes";
import { cor, fonte } from "./tema";
import { T, mix, prog, saida } from "./tempo";

const Placa: React.FC<{ arquivo: string; de: number; ate: number; entra: number; sai: number; zoom: [number, number] }> = ({ arquivo, de, ate, entra, sai, zoom }) => {
  const f = useCurrentFrame();
  if (f < de || f >= ate) return null;
  const op = prog(f, de, de + entra) * (1 - prog(f, ate - sai, ate));
  const z = mix(zoom[0], zoom[1], prog(f, de, ate));
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <Sequence from={de} durationInFrames={ate - de} layout="none">
        <OffthreadVideo src={staticFile(arquivo)} muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${z})` }} />
      </Sequence>
      <AbsoluteFill style={{ background: "rgba(11,30,49,0.22)" }} />
    </AbsoluteFill>
  );
};

/** P01: o ponto que pulsa e some dentro das luzes da cidade. */
const Ponto: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= T.P02[0] + 30) return null;
  const batida = f % 30;
  const op = prog(f, 0, 10) * (1 - prog(f, T.P02[0] + 4, T.P02[0] + 30));
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: op }}>
      <div style={{ position: "absolute", width: 14 + batida * 3.4, height: 14 + batida * 3.4, borderRadius: "50%", border: `1.5px solid ${cor.tealClaro}`, opacity: (1 - batida / 30) * 0.7 }} />
      <div style={{ width: 14, height: 14, borderRadius: 7, background: cor.tealClaro, transform: `scale(${1 + (1 - prog(batida, 0, 9)) * 0.7})` }} />
    </AbsoluteFill>
  );
};

const Marca: React.FC<{ de: number; ate: number; tam: number; comAssinatura?: boolean }> = ({ de, ate, tam, comAssinatura }) => {
  const f = useCurrentFrame();
  if (f < de || f >= ate) return null;
  const t = saida(prog(f, de, de + 22));
  const op = prog(f, de, de + 8) * (1 - prog(f, ate - 12, ate));
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: op, background: comAssinatura ? "none" : "radial-gradient(ellipse 60% 42% at 50% 50%, rgba(11,30,49,0.82), rgba(11,30,49,0) 100%)" }}>
      <div style={{ fontFamily: fonte.cond, fontWeight: 600, fontSize: tam, color: cor.branco, letterSpacing: `${mix(0.34, 0.12, t)}em`, marginRight: `-${mix(0.34, 0.12, t)}em`, lineHeight: 1 }}>CITY VIEW</div>
      <Palavras texto="Observabilidade da gestão da cidade." em={de + (comAssinatura ? 8 : 22)} style={{ fontFamily: fonte.titulo, fontWeight: 500, fontSize: tam * 0.25, color: cor.texto, marginTop: 26 }} />
      {comAssinatura ? <Img src={staticFile("marca/datasynq_light.png")} style={{ height: 54, marginTop: 70, opacity: prog(f, de + 24, de + 38) }} /> : null}
    </AbsoluteFill>
  );
};

const CartaoFinal: React.FC = () => {
  const f = useCurrentFrame();
  const de = T.CARTAO[0] + 12;
  if (f < de) return null;
  const linha: React.CSSProperties = { fontFamily: fonte.titulo, fontWeight: 500, fontSize: 34, lineHeight: 1.5, color: cor.texto };
  return (
    <AbsoluteFill style={{ padding: "150px 190px", opacity: prog(f, de, de + 12) }}>
      <div style={{ fontFamily: fonte.mono, fontWeight: 500, fontSize: 20, letterSpacing: "0.1em", color: cor.tealClaro, marginBottom: 22 }}>FONTES</div>
      <div style={linha}>População do Distrito Federal: 2.817.381 — IBGE, Censo 2022.</div>
      <div style={linha}>Ouvidoria do GDF: 900 a 1.000 manifestações por dia — Jornal de Brasília, 20/11/2024.</div>
      <div style={linha}>Limites das regiões administrativas: IDE/DF (SEDUH).</div>
      <div style={{ fontFamily: fonte.mono, fontWeight: 500, fontSize: 20, letterSpacing: "0.1em", color: cor.ambar, margin: "60px 0 22px" }}>AVISO</div>
      <div style={{ ...linha, color: cor.branco, fontSize: 46, lineHeight: 1.3, maxWidth: 1400 }}>
        Proposta. Cenário e dados ilustrativos. Nenhuma integração com órgãos do GDF existe hoje.
      </div>
      <div style={{ ...linha, marginTop: 18 }}>Imagem aérea ilustrativa, gerada por IA. Os pontos do mapa não representam chamados reais.</div>
    </AbsoluteFill>
  );
};

export const Filme: React.FC = () => {
  const f = useCurrentFrame();
  const [fontes] = useState(() => delayRender("fontes"));
  useEffect(() => {
    document.fonts.ready.then(() => continueRender(fontes));
  }, [fontes]);

  return (
    <AbsoluteFill style={{ background: cor.fundo }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 70% at 50% 45%, ${cor.fundo2} 0%, ${cor.fundo} 62%, #071523 100%)` }} />
      <Placa arquivo="clips/aerea_desce.mp4" de={T.P02[0]} ate={T.P03[0] + 22} entra={14} sai={22} zoom={[1.02, 1.1]} />
      <Placa arquivo="clips/aerea_sobe.mp4" de={T.P19[0]} ate={T.P20[0] + 22} entra={16} sai={22} zoom={[1.1, 1.02]} />
      <Mundo />
      {/* Escurece a base, para o texto ler bem sobre o mapa. */}
      <AbsoluteFill style={{ background: "linear-gradient(to bottom, rgba(7,21,35,0.55) 0%, rgba(7,21,35,0) 14%, rgba(7,21,35,0) 62%, rgba(7,21,35,0.86) 100%)", opacity: f < T.P20[0] + 30 ? 1 : 0 }} />
      <Silos />
      <Caso />
      <Visoes />

      <Bloco de={T.P03[0] + 16} ate={T.P03[1]} rotulos={[{ texto: "DISTRITO FEDERAL · 2.817.381 PESSOAS", em: T.P03[0] + 22 }]} linhas={[{ texto: "Uma cidade feita de muitas cidades.", em: T.P03[0] + 36 }]} fonteDoDado="IBGE, Censo 2022" />
      <Bloco de={T.P04[0]} ate={T.P04[1]} rotulos={[{ texto: "900 A 1.000 MANIFESTAÇÕES POR DIA · SÓ NA OUVIDORIA", em: T.P04[0] + 8 }]} linhas={[{ texto: "Todo dia, a cidade fala.", em: T.P04[0] + 26 }]} fonteDoDado="Jornal de Brasília, 20/11/2024" />
      <Bloco de={T.P05[0]} ate={T.P05[1]} linhas={[{ texto: "Cada órgão vê a sua parte.", em: T.P05[0] + 42 }]} />
      <Bloco de={T.P06[0]} ate={T.P06[1]} linhas={[{ texto: "Ninguém vê o todo.", em: T.P06[0] + 14 }]} />
      <Bloco de={T.P07[0]} ate={T.P07[1] + 30} linhas={[{ texto: "Não por falta de esforço.", em: T.P07[0] + 6 }, { texto: "Por falta de conexão.", em: T.P07[0] + 52 }]} />
      <Marca de={T.P09[0] + 4} ate={T.P09[1]} tam={210} />
      <Bloco de={T.P10[0] + 30} ate={T.P10[1]} rotulos={[{ texto: "19:42 · UM BAIRRO DO DF", em: T.P10[0] + 34 }]} />
      <Bloco de={T.P11[0]} ate={T.P11[1]} largura={980} linhas={[{ texto: "O cidadão fala onde quiser.", em: T.P11[0] + 28 }]} />
      <Bloco de={T.P13[0] + 80} ate={T.P13[1]} largura={980} linhas={[{ texto: "Parecem três problemas.", em: T.P13[0] + 88 }, { texto: "É um só.", em: T.P13[0] + 135 }]} />
      <Bloco de={T.P14[0]} ate={T.P14[1]} largura={980} tam={70} linhas={[{ texto: "Cada órgão recebe no seu próprio sistema.", em: T.P14[0] + 12 }]} />
      <Bloco de={T.P15[0]} ate={T.P15[1]} largura={980} tam={70} linhas={[{ texto: "E o cidadão acompanha até resolver.", em: T.P15[0] + 12 }]} />
      <Bloco de={T.P16[0] + 20} ate={T.P16[1]} linhas={[{ texto: "A governadora vê a cidade inteira.", em: T.P16[0] + 34 }]} />
      <Bloco de={T.P17[0]} ate={T.P17[1]} linhas={[{ texto: "Cada gestor, a sua área.", em: T.P17[0] + 3 }]} />
      <Bloco de={T.P18[0]} ate={T.P18[1]} linhas={[{ texto: "O cidadão, o que o governo entrega.", em: T.P18[0] + 6 }]} />
      <Bloco de={T.P19[0]} ate={T.P19[1]} linhas={[{ texto: "Ver a cidade inteira.", em: T.P19[0] + 14 }, { texto: "E a velocidade da gestão.", em: T.P19[0] + 54 }]} />

      <Ponto />
      <Marca de={T.P20[0] + 42} ate={T.CARTAO[0] + 12} tam={190} comAssinatura />
      <CartaoFinal />
      <Hud />
      <Selos />
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  );
};

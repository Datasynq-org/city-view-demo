import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import React from "react";
import { Composition } from "remotion";
import { Filme } from "./Filme";
import { ALTURA, FPS, LARGURA } from "./tema";
import { TOTAL } from "./tempo";

export const Root: React.FC = () => (
  <Composition id="Filme" component={Filme} durationInFrames={TOTAL} fps={FPS} width={LARGURA} height={ALTURA} />
);

// Renderiza quadros de conferência: node scripts/conferencia.mjs 240 400 ...
// Saída em out/conf/fNNNN.jpg
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";

const quadros = process.argv.slice(2).map(Number);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const browserExecutable = process.env.REMOTION_CHROME || undefined;
const composition = await selectComposition({ serveUrl, id: "Filme", browserExecutable });
for (const frame of quadros) {
  const output = `out/conf/f${String(frame).padStart(4, "0")}.jpg`;
  await renderStill({ composition, serveUrl, frame, output, imageFormat: "jpeg", jpegQuality: 85, browserExecutable });
  console.log(output);
}

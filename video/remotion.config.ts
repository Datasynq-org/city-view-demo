import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Em sessões na nuvem o Chromium já vem instalado; aponte para ele com
// REMOTION_CHROME (ex.: /opt/pw-browsers/.../chrome-headless-shell).
if (process.env.REMOTION_CHROME) {
  Config.setBrowserExecutable(process.env.REMOTION_CHROME);
}

# Vídeo do City View: "A cidade conectada"

Filme de abertura da apresentação (1min15s com o cartão de fontes, 16:9, 1080p).
Roteiro: [`docs/CV-VID-001`](../docs/CV-VID-001-roteiro-do-video.md). Método:
[`docs/CV-REF-003`](../docs/CV-REF-003-framework-de-video.md).

**Entrega atual:** [`entregas/CityView_filme_16x9_r1.mp4`](entregas/CityView_filme_16x9_r1.mp4).

## Como é feito

- **Matéria gerada (Higgsfield):** um único clipe aéreo de 3 s (`bruto/aerea_k3.mp4`,
  Kling 3.0), usado descendo na abertura e invertido no fecho, e a trilha
  (`public/audio/trilha_bruta.mp3`, ElevenLabs Music v2, 100 BPM).
- **Todo o resto é vetor (Remotion):** o mapa oficial das RAs, os sinais, os
  silos, o grafo, o caso do apagão, os painéis e os textos.
- **Efeitos sonoros:** sintetizados em `scripts/som.py`, que também edita a
  trilha para casar com os cortes.

## Rodar

```bash
npm install
npm run clipes      # prepara public/clips/ (precisa de ffmpeg)
npm run som         # monta public/audio/mix.wav (precisa de ffmpeg e numpy)
npm run studio      # preview interativo
npm run render      # out/CityView_filme_16x9_r1.mp4
npm run conferencia -- 400 1400 2080   # quadros soltos em out/conf/
```

Em sessão na nuvem, aponte o Chromium já instalado:
`export REMOTION_CHROME=/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell`.

## Peças

- `src/tempo.ts`: a tabela de tempo, plano a plano. Mudar o ritmo é mudar esta tabela
  (e os tempos correspondentes em `scripts/som.py`).
- `src/dados.ts`: geometria e dados ilustrativos, determinísticos. O mapa vem de
  `apresentacao-web/src/mapa/ras.json`.
- `src/Mundo.tsx`: a camada vetorial (mapa, sinais, silos, grafo, apagão, mapa de calor).
- `src/Caso.tsx`: conversa do cidadão, contador, cartão da IA e entrega aos sistemas.
- `src/Visoes.tsx`: sala de situação, painel do gestor e mapa público (dados simulados).
- `src/Texto.tsx`: títulos palavra a palavra, rótulos, selos e moldura.
- `src/Filme.tsx`: a montagem.
- `prompts/`: os prompts dos quadros de referência (não gerados nesta versão).

## Pendências

- **Licença do Remotion:** gratuita para empresas com até 3 pessoas; acima disso é paga. Confirmar para a DataSynq.
- O City View ainda não tem logo: o filme fecha com o nome escrito.

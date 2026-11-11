# CV-REF-003 · Framework de produção de vídeo (herdado da NORNA)

| Campo | Valor |
| --- | --- |
| Código | CV-REF-003 |
| O que é | O framework com que a Datasynq produziu os dois filmes da NORNA (Higgsfield para matéria e movimento, Remotion para tipografia, números e interface), transcrito sem alteração |
| Registrado em | 11/11/2026, a partir do `FRAMEWORK.md` do projeto `norna-ad`, trazido pela equipe |
| Origem | **[Histórico]**, de outro produto da empresa |
| Para que serve | **Ferramenta principal** para produzir o vídeo do City View: processo em portões, comandos, prompts que funcionaram, revisão de clipes, áudio e armadilhas. Decidido pela equipe em 11/11/2026 **[Equipe]** |

## Como ler este framework no City View

O **método** vale como está:
- matéria gerada por IA embaixo, tipografia e interface vetoriais em cima;
- **a IA nunca desenha letra, número ou logo**;
- os portões (roteiro → quadros → animatic → clipes → master), com o ritmo aprovado no animatic antes de gastar com vídeo;
- gasto só com OK, a revisão de clipes e as armadilhas.

O que é **da NORNA** e precisa de equivalente do City View antes de usar:

| Na NORNA | No City View |
| --- | --- |
| Verdade do produto: só o que está na `main` (`docs/norna-ai/HANDOFF.md`) | Marcas de origem e selos do [magno](CV-SPEC-000-documento-magno.md) e do [roteiro](CV-APR-001-roteiro-da-apresentacao.md): "Ilustrativo", "Proposta", "Imagem ilustrativa"; "existe" só o que já funciona no dfac |
| Números de capturas reais da demo (Estúdio Aurora) | Números só com fonte e data (magno, seções 6.1 e 8) |
| Selo `VISÃO · EM CONSTRUÇÃO` | Nada do City View está contratado ou integrado (magno, seção 3): o filme inteiro é proposta |
| Marca NORNA: carvão, vermelhão, Inter Tight, JetBrains Mono, motivo dos fios | A definir. Pontos de partida: direção C · Híbrida do deck (`apresentacao/src/tema.js`) e "Sala de Operações" (magno 7.5) |
| Exceção de mãos sem rosto | A cidade e a gestão, nunca pessoas (magno 7.6); qualquer exceção precisa ser decidida |
| Palavras proibidas da marca | Palavras a evitar no pitch (magno 7.6) |
| Caminhos `norna-ad/`, `C:\Users\sammu\...` | A pasta do vídeo neste repositório, a definir |

Nesta sessão o Higgsfield também está disponível como conector do Claude, além do CLI descrito na seção 4.

---

## Texto original

## Framework de produção de ads da NORNA (Higgsfield + Remotion)

Este documento explica como produzimos os dois filmes da NORNA e como produzir o próximo. Ele cobre o processo, as ferramentas, os comandos, os prompts que funcionaram e os erros que custaram tempo.

**O que foi produzido** (em `out/`):

| Filme | Arquivo | Duração | Status |
|---|---|---|---|
| "A trama": produto e ROI demonstrado | `NORNA_ad_v3_16x9_master_r2.mp4` | 36s, 16:9 | aprovado; o r1 de 30s fica como histórico |
| "A operadora": visão da NORNA AI | `NORNA_visao_16x9_master_r1.mp4` | 45s, 16:9 | em revisão |

Os roteiros completos estão em `ROTEIRO.md` (r1) e `ROTEIRO_r2_visao.md` (r2 e visão).

---

## 1. A ideia em uma frase

**Matéria real gerada por IA embaixo, tipografia e interface vetoriais em cima.**

- O **Higgsfield** gera só textura e movimento: fios, tecido, mãos, luz.
- O **Remotion** desenha tudo o que precisa ser exato: texto, números, cards do produto e logo.
- **A IA nunca desenha letra, número ou logo.**

A linguagem foi decidida a partir de referências de ads premium de SaaS:
- **Vercel Ship:** um material e uma metáfora só. Aqui é carvão fosco com um único fio vermelhão.
- **Apple:** cortes escondidos. O fio real vira a linha vetorial.
- **Ramp e Nubank:** ROI mostrado como mecanismo ("muitos viram um"), nunca como estatística.
- **Claude, "Keep thinking":** a IA é o ato, não um personagem.

## 2. Regras que não se quebram

1. **Verdade do produto.**
   - Só aparece como existente o que está em produção na `main`; confira em `docs/norna-ai/HANDOFF.md`.
   - Números saem de capturas reais da demo (Estúdio Aurora, em `captures/`). Nada de estatística inventada.
   - Exemplo: a ferramenta de saldo bancário ainda não estava na `main`, então "Caixa hoje" ficou fora.
   - Exemplo: a fatura da Construtora Horizonte não estava paga, então a cena "fatura paga" ficou sem nome de cliente.
2. **Visão é marcada como visão.**
   - "A operadora" mostra roadmap: agentes especialistas, Delegue, outcome as a service.
   - Por isso ela leva o selo `VISÃO · EM CONSTRUÇÃO` o tempo todo e o caso aparece como `CENÁRIO ILUSTRATIVO`.
   - Nenhuma cena mostra a NORNA enviando mensagem a cliente, movendo dinheiro ou excluindo algo. Toda ação é "proposta, aguardando aprovação" (ADR 006).
3. **Marca** (`docs/norna/README.md`):
   - cores dos tokens;
   - Inter Tight 600 nos títulos e JetBrains Mono em caixa alta nos rótulos;
   - logo oficial em SVG, intacto;
   - **proibido:** pessoas ou personagens, logo em forma de árvore ou de fios, gradientes, brilho, glassmorphism, laranja como fundo;
   - **exceção aprovada pelo dono do projeto:** mãos sem rosto, em no máximo 2 planos por filme.
4. **Ritmo.**
   - Câmera sempre em movimento, um movimento por plano, cortes no tempo da trilha.
   - O primeiro teste falhou porque era lento: 5s de árvore quase parada.
   - O r1 depois ficou acelerado demais. O ponto certo foi cerca de 2,5–3,5s por plano e títulos a uma palavra a cada 10 quadros.
5. **Gasto só com OK.**
   - Antes de cada lote pago, mostre os prompts e o custo (`hf generate cost`).
   - O dono do projeto aprova por etapa.

## 3. O pipeline, em portões

```
Roteiro ─► Bíblia de material ─► Quadros de referência ─► Animatic ─► Clipes ─► Revisão ─► Trilha/SFX ─► Master ─► 9:16
 (0 cr)       (0 cr)              GPT Image 2.5           Remotion     Kling     prancha +     Sonilo +       Remotion
                                  ~2,75 cr/img            (0 cr)       8,75/5s   corte         Seed Audio
```

| Portão | O que sai | Quem aprova |
|---|---|---|
| 0. Roteiro | tabela plano a plano: tempo, imagem, texto exato e som | dono do projeto |
| 1. Quadros de referência | prancha com 2 variantes por plano | dono escolhe |
| 2. Animatic | o filme inteiro com os quadros parados em movimento 2,5D, vetores finais e trilha | **o ritmo é aprovado aqui, antes de gastar com vídeo** |
| 3. Clipes | um clipe de 5s por plano; usamos de 1,5 a 3s de cada | revisão técnica (seção 7) |
| 4. Master | render final, cerca de −14 LUFS | dono do projeto |
| 5. 9:16 | corte vertical, com os vetores reposicionados | dono do projeto |

A lição mais cara: **não gere vídeo antes de o animatic aprovar o ritmo.** O animatic custa zero e mostra 90% do filme.

## 4. Setup

### Higgsfield

- **Conta:** sammuel.machado@datasynq.co (plano Plus).
- **Workspace:** `5b6abacd-399d-4461-8639-ff2e784d345f`.
- Peça acesso ao dono do projeto.

```bash
npm i -g @higgsfield/cli            # comandos: higgsfield / higgs / hf
higgsfield auth login               # abre o navegador
higgsfield workspace set 5b6abacd-399d-4461-8639-ff2e784d345f
higgsfield account status           # saldo
npx skills add higgsfield-ai/skills -g -a claude-code --skill '*' -y   # skills para o Claude Code
```

Existem dois conectores do Higgsfield no claude.ai, e eles se confundem:
- **"higgsfield"** gera, envia arquivos e acessa o sandbox Higgsedit.
- **"Higgsfield AI"** é **só leitura**.

**O CLI resolve tudo sem depender de conector**, e foi o que usamos.

### Projeto de composição

```bash
cd C:\Users\sammu\NEXUS\norna-ad
npm install
npx remotion studio                                   # preview interativo
npx remotion still src/index.ts Ad16x9 out/x.png --frame=400
npx remotion render src/index.ts Ad16x9 out/master.mp4 --codec=h264 --crf=18
npx remotion render src/index.ts Vision16x9 out/visao.mp4 --codec=h264 --crf=18
npx tsc -p .                                          # typecheck
```

- **Porta:** o `remotion.config.ts` fixa a porta `3123`, porque a 3000 está ocupada por outro app na máquina. Se o render reclamar que a porta está em uso, procure um render órfão (seção 9).
- **ffmpeg:** a máquina não tinha. Usamos o binário do pacote `imageio-ffmpeg`, copiado para `tools/ffmpeg.exe`.
- **Licença:** o Remotion é gratuito para empresas com até 3 funcionários; acima disso, licença paga. **Isso está pendente de confirmação** para a DataSynq.

## 5. Estrutura de pastas

```
norna-ad/
├─ ROTEIRO.md, ROTEIRO_r2_visao.md   roteiros aprovados (fonte da verdade)
├─ FRAMEWORK.md                      este documento
├─ captures/          prints reais da demo; fonte de todos os números
├─ prompts/           um .txt por quadro (SF*, H*) e por movimento (G*, H*m); _queue*.sh são as filas
├─ styleframes/       todas as variantes geradas, mais as pranchas de escolha (board_*.jpg)
├─ clips/             clipes brutos (*_k3 = Kling 3.0, *_k4 = Kling 4.0), jobs/*.json e sheets/ (pranchas)
├─ audio/             trilhas (music_*, visao_*) e efeitos (sfx_*)
├─ public/            o que o Remotion lê: plates/ (quadros aprovados), clips/ (aprovados), audio/, brand/
├─ src/
│  ├─ brand.ts        tokens (cores, fontes, easing) copiados de artifacts/nexus/.../norna/tokens.css
│  ├─ Ad.tsx          "A trama": tabela de tempo S, mapas PLATES/CLIPS, Soundtrack
│  ├─ Vision.tsx      "A operadora": tabela V, VPLATES/VCLIPS
│  ├─ Root.tsx        registra as composições Ad16x9 e Vision16x9
│  └─ components/
│     ├─ Plate.tsx    placa gerada (imagem ou vídeo) com movimento 2,5D, desfoque, escurecimento, e Grain
│     ├─ Type.tsx     Title (palavra por palavra, aceita \n), SectionLabel, Caption, Fragments
│     ├─ Threads.tsx  ConvergingThreads (geometria portada de threads.tsx do app) e ThreadLine
│     ├─ Product.tsx  AskPanel, FlowCard, ContractCard, Stations, Zoom (todos com prop pace)
│     ├─ Agents.tsx   VisionTag, Clock, IncomingMessage, AgentLabels, InvestigationChain, BriefingCard, ApprovedStrip, Promises
│     └─ Logo.tsx     LogoLockup (SVG oficial revelado, props headline e cta)
├─ out/               masters, animatics e quadros de conferência
└─ tools/ffmpeg.exe
```

## 6. Prompts que funcionaram

### Bíblia de material

É o sufixo de **todos** os quadros de referência. É ela que mantém os planos consistentes entre si.

> Matte charcoal (#202124) seamless backdrop. Single hard key light from upper left, soft fill, deep shadows. 100mm macro lens, f/2.8, razor-thin depth of field. Real textile: visible fiber fuzz, twist and slub. Restrained low-saturation grade; the only saturated color is a matte vermilion orange (#F04412). 35mm film grain, photographic, premium brand film still. Bare charcoal surfaces with no lettering, no logos, no screens. No glow, no bloom, no lens flare, no particles.

### Quadro de referência

O formato é assunto concreto, depois material, depois composição. Gerado com:

```bash
hf generate create gpt_image_2_5 --prompt "$(cat prompts/SF5.txt)" \
  --aspect_ratio 16:9 --resolution 2k --quality high --wait --json
```

O que aprendemos com os quadros:
- **Especifique a escala.** "fine linen sewing thread, about one millimetre thick", porque "thread" sozinho virou corda grossa.
- **Especifique a forma.** "thin steel-wire heddles", porque "heddle eyelets" virou parafuso industrial.
- **Mãos:** "no face visible, dark linen sleeve, anatomically correct hand, five fingers". Funcionou nas duas vezes.
- **Peça 2 variantes por plano** e escolha numa prancha.

### Movimento (imagem para vídeo)

O formato é **câmera → ação → estado final**, com um movimento por plano, terminando no sufixo:

> Matte, photographic, 35mm film grain, consistent hard key light. The scene stays free of lettering, logos and screens.

```bash
# Kling 3.0 Pro: o padrão (8,75 cr / 5s)
hf generate create kling3_0 --prompt "$(cat prompts/G5.txt)" --start-image public/plates/SF5.webp \
  --mode pro --duration 5 --aspect_ratio 16:9 --sound off --wait --wait-timeout 20m --json

# quadro inicial e final (ex.: G8, do macro ao tecido inteiro)
hf generate create kling3_0 ... --start-image public/plates/SF5.webp --end-image public/plates/SF8.webp

# Kling 4.0: quando o 3.0 não move a cena (37,5 cr / 5s)
hf generate create kling4_0 --prompt "..." --mode image-to-video --start-image public/plates/SF4c.png \
  --duration 5 --resolution 1080p --aspect_ratio 16:9 --wait --json
```

Exemplo real (G6, as liças):
> The camera tracks along the fine vermilion thread from eyelet to eyelet at a steady speed, each thin steel heddle passing close to the lens. One continuous lateral move.

### Trilha e efeitos sonoros

- **Sonilo:** a trilha não segue marcação de tempo exata. Peça a estrutura mesmo assim, gere 3 variantes e escolha medindo a energia (seção 8).
- **Seed Audio:** cada efeito custa cerca de 1 crédito em wav a 48 kHz.

```bash
hf generate create sonilo_music --prompt "$(cat prompts/music.txt)" --duration 30 --wait --json
hf generate create seed_audio --prompt "Close-up foley: a single taut linen thread ..." --format wav --sample_rate 48000 --wait --json
```

### Filas

**Rode os jobs pagos um de cada vez.** Com dois jobs simultâneos, o plano Plus recusa o segundo com `not_enough_credits`, mesmo com saldo. Os scripts `prompts/_queue*.sh` mostram o padrão: rodam em sequência, salvam o JSON do job em `clips/jobs/` e baixam o arquivo.

## 7. Revisão dos clipes (antes de qualquer clipe entrar no filme)

Os clipes gerados quase sempre têm um defeito em algum ponto dos 5s. Já vimos:
- fibra desfiando;
- mão sumindo;
- bolso surgindo no tecido;
- urdidura virando uma faixa laranja;
- painel com texto inventado.

Por isso usamos só o trecho limpo.

1. **Prancha:** 8 quadros por clipe.
   ```bash
   tools/ffmpeg.exe -i clips/G7_k3.mp4 -vf "fps=8/5,scale=480:-1,tile=8x1" -frames:v 1 clips/sheets/G7.jpg
   ```
2. **Detecção de corte:** o Kling 3.0 é multi-shot e pode deformar a cena aos poucos.
   ```bash
   tools/ffmpeg.exe -i clip.mp4 -vf "select='gt(scene,0.25)',metadata=print" -f null - 2>&1 | grep pts_time
   ```
   Quando não há corte mas há deformação, extraia quadros em resolução cheia a cada 0,5s e olhe de perto.
3. **Registre o trecho limpo** no mapa `CLIPS` (`Ad.tsx`) ou `VCLIPS` (`Vision.tsx`), com o motivo em comentário:
   ```ts
   G3: { src: "clips/G3.mp4", startAt: 1.0, rate: 1.3 }, // right hand vanishes after ~4.4s
   ```
   No `Plate`, `startAt` é em segundos do clipe e `rate` é a velocidade (`trimBefore` e `playbackRate` do Remotion). A posição lida no clipe é `startAt + quadro × rate`.
4. **Alinhe os cortes escondidos.** Para saber onde o fio laranja passa no clipe, meça pixel a pixel (ver o `meas()` na história do projeto: ffmpeg recorta uma coluna e o Python procura os pixels laranja). Desloque a placa com `move.y` até o fio cair na altura da linha vetorial do plano seguinte (y=540).
5. **Refaça só se o trecho limpo não bastar.** Simplifique o prompt ("Locked-off static camera, no cuts"). Se falhar duas vezes, teste o Kling 4.0, como no tear.

## 8. Composição e áudio no Remotion

- **Tempo:** tudo é declarado em quadros a 30 fps na tabela `S` (`Ad.tsx`) ou `V` (`Vision.tsx`). Mudar o ritmo é mudar essas tabelas.
- **PACE:** o multiplicador de tempo de leitura dos cards (1,25 na r2).
- **Animatic e final:** a prop `stills` troca as placas entre quadros parados (`PLATES`, animatic) e clipes (`CLIPS`, final). O mesmo código serve aos dois.
- **Legibilidade:** pense em tela de celular. Títulos de 72 a 150px, rótulos mono de 24 a 42px, e cards ampliados com `<Zoom s={1.2}>`.
- **Trilha:**
  - Meça a energia a cada 0,5s para achar o drop:
    ```bash
    tools/ffmpeg.exe -i audio/music_v1.m4a -af "aformat=channel_layouts=mono,asetnsamples=22050,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level" -f null -
    ```
  - Posicione o drop com atraso (`MUSIC_DELAY`).
  - Para alongar a trilha, emende em compasso: a 120 BPM o compasso tem 2s, ex. `[0–22s] + [10–22s]` com `acrossfade` de 30 ms.
  - Faça a parada seca cortando a `Sequence` da música e ponha a batida grave final como efeito separado.
- **Volume final:** confira em cerca de −14 LUFS:
  ```bash
  tools/ffmpeg.exe -i out/master.mp4 -af ebur128 -f null - 2>&1 | grep "I:"
  ```
- **Conferência antes de entregar:**
  - prancha do master a 1–2 fps (`fps=1,tile=6x6`);
  - stills dos quadros críticos;
  - duração exata.

## 9. Armadilhas que já custaram tempo

- **Jobs simultâneos no Higgsfield:** o segundo falha com `not_enough_credits` e não cobra nada.
- **Porta do Remotion:**
  - Na 3000 o Remotion conectou num app estranho e deu "not a valid Remotion project".
  - Um render interrompido deixa um `node` órfão segurando a porta. Encontre com `Get-NetTCPConnection -LocalPort 3123` no PowerShell e encerre só se for um render do `norna-ad`.
- **Escapes em edição por script:** `\n` dentro de um heredoc Python virou quebra de linha real no `.tsx`. Use `chr(92)` ou edite à mão.
- **Edição após `sed`:** a ferramenta Edit do Claude recusa um arquivo alterado por fora. Releia o arquivo antes.
- **Kling 3.0 faz pouco movimento** em cenas "abstratas" (fios deslizando sozinhos). O movimento 2,5D do `Plate` compensa; o Kling 4.0 resolve, mas custa 4x mais.
- **Mecânica complexa não funciona:** o tear saiu confuso, com a lançadeira flutuando. Prefira ações simples com física óbvia: puxar, esticar, passar por um anel, a luz subir.
- **O scratchpad do Claude é temporário.** Tudo o que importa fica em `norna-ad/`.

## 10. Custos de referência (novembro de 2026)

| Item | Modelo | Créditos |
|---|---|---|
| Quadro de referência 2k high | `gpt_image_2_5` | 2,75 |
| Vídeo de 5s, imagem para vídeo | `kling3_0` pro, sem som | 8,75 |
| Vídeo de 5s | `kling4_0` 1080p | 37,5 |
| Vídeo de 5s | `seedance_2_5` 1080p, sem áudio | 80 |
| Trilha de 30–45s | `sonilo_music` | cerca de 2 |
| Efeito sonoro | `seed_audio` wav 48k | cerca de 1 |

Os dois filmes, com testes e refações, custaram cerca de 280 créditos. Sempre confira com `hf generate cost <modelo> ...` antes; os preços mudam.

## 11. Estado atual e próximos passos

- **Pendentes:**
  - cortes 9:16 de 15s dos dois filmes;
  - confirmar a licença do Remotion.
- **Melhoria opcional:** H2 (os fios dos agentes) em Kling 4.0, porque o Kling 3.0 quase não moveu os fios.
- **Antes de veicular "A trama":** confira de novo os números da demo e o status da NORNA AI. Se algo mudou na `main`, atualize os textos.
- **O projeto não está em git.** Se for virar trabalho de equipe, crie um repositório para o `src/`, os `prompts/` e os roteiros (sem `node_modules`, `out/` e `clips/` brutos). As mídias pesadas podem ficar num storage compartilhado.

## Referências

- Marca: `docs/norna/README.md` e `artifacts/nexus/src/design-system/norna/tokens.css` (no monorepo)
- Motivo dos fios: `artifacts/nexus/src/design-system/norna/marketing/threads.tsx`
- NORNA AI, o que está no ar e o que é roadmap: `docs/norna-ai/HANDOFF.md`, `vision.md`, `roadmap.md`, `decisions/006-background-delegation-and-autonomy.md`, `scenarios/S1-client-recovery.md`
- Higgsfield: skill `higgsfield-generate` em `~/.claude/skills/` e `hf model get <modelo>` para os parâmetros

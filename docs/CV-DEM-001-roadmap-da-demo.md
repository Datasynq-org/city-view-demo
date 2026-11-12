# CV-DEM-001 · Roadmap da demo

| Campo | Valor |
| --- | --- |
| Código | CV-DEM-001 |
| Versão | 0.3 (12/11/2026), para revisão da equipe. Registra a revisão visual e do mapa da I1 (seção 9, último acréscimo). A 0.2, do mesmo dia, mudou a pasta para `demo-view/` e registrou a I0; a 0.1 é de 11/11/2026 |
| O que é | Como a demo do City View vai ser construída: em fatias pequenas, cada uma mostrável sozinha, planejada e revista antes da próxima |
| Para que serve a demo | Complementar a apresentação ([CV-APR-001](CV-APR-001-roteiro-da-apresentacao.md)): "logar em alguma coisa e mostrar mais ou menos o que a gente falou" (ATA 267–268) |
| Onde fica | Pasta `demo-view/` deste repositório. É autocontida (tem `package.json` próprio e não lê nada de fora), para poder ser movida inteira para outro repositório |

## 1. Por que recomeçar, e do que aproveitar

A demo exploratória (Sala de Situação, repositório `City-view`,
`apps/sala-de-situacao`) acertou em vários pontos:
- a inteligência que explica cada caso;
- a conciliação de sinais de órgãos diferentes;
- os mapas;
- os dados simulados com método.

Mas ficou poluída: 8 telas, 19 órgãos e tudo ao mesmo tempo (magno, seção 3).
Esta demo aproveita o **motor** e refaz as **telas**, uma fatia por vez.

## 2. Princípios

1. **Uma fatia por iteração.** Cada iteração entrega algo que dá para mostrar sozinho, é revisto com a equipe e só então a próxima começa.
2. **Cada tela responde a uma pergunta** (magno 7.4) e tem um slide correspondente.
3. **Conceito separado de realidade.** O selo "Ambiente de demonstração · dados simulados" fica sempre visível. Cada integração aparece como **existe** (já funciona no dfac) ou **proposta**, nunca misturadas.
4. **A cidade e a gestão, nunca pessoas.** Sem nome, rosto ou endereço de cidadão. Segurança aparece agregada.
5. **Funciona na sala de reunião.** Build estático; roda sem internet (o fundo do mapa cai para liso e o resto continua); explicações da IA congeladas nos dados.
6. **Órgão, canal ou número real só com fonte** (magno, seção 8). Todo o resto é simulado e rotulado.

## 3. Pilha

| Peça | Escolha | Por quê |
| --- | --- | --- |
| Base | Vite + React 19 + TypeScript + Tailwind CSS v4 | A mesma da demo antiga: conhecida e rápida |
| Mapa | MapLibre GL JS + deck.gl (`@deck.gl/maplibre`, modo intercalado) | deck.gl dá hexágonos 3D, mancha de calor, arcos entre órgãos e animação de trajetos sobre o MapLibre. É a integração recomendada para MapLibre 5/6. *Acréscimo de 12/11/2026:* o mapa de calor passou a ser desenhado pelo próprio MapLibre; o deck.gl segue nos hexágonos, nas regiões e nos pontos |
| Fundo do mapa | OpenFreeMap (sem chave, sem limite de uso), estilo recolorido para o navy da direção C; queda para fundo liso sem rede | Resolve o limite de uso gratuito da CARTO, que a demo antiga usava. *Acréscimo de 12/11/2026:* o fundo virou imagem de satélite: Sentinel-2 de 2016 (EOX, CC BY 4.0) na vista geral e, de perto, a imagem de 50 cm de 2021 publicada pelo GDF na IDE/DF. O OpenFreeMap ficou com água, vias, nomes de vias e prédios. Sem rede, o fundo continua caindo para liso |
| Animação | Motion (React) para microanimações e transições | Leve e declarativo |
| Visual | Painéis de vidro (backdrop-blur) sobre o mapa, tokens da direção C (navy, teal, âmbar) | A estética escolhida para o deck, levada para a tela. *Acréscimo de 12/11/2026:* na demo, a direção C deu lugar a uma base grafite com cor só para função (seção 9, último acréscimo) |
| Fonte | Bahnschrift (nativa no Windows), com Barlow / Barlow Condensed (OFL) hospedada junto como alternativa | Mesma família visual do deck, sem depender de internet |
| Gráficos | A definir na I1 (Recharts, já usado antes, ou visx) | Decidir quando houver o primeiro gráfico |
| Testes | Vitest nas pastas `dominio/`, `dados/`, `mapa/` e `inteligencia/` | O motor portado precisa provar que continua certo |

Versões exatas: fixadas no `demo-view/package.json`. Cada peça entra na iteração
que a usa primeiro: a I0 tem só a base, o MapLibre e o Vitest; deck.gl, Motion e
a biblioteca de gráficos entram na I1.

**Inspirações visuais, sem código:**
- God's Eye View: painel em HUD, troca de camadas, consulta por voz. O repositório não declara licença e se apresenta como "simulador de satélite espião". O nome **não** aparece em nenhum material (magno 7.6).
- Sala de operações (magno 7.5).

## 4. Organização do código

As pastas espelham as camadas do produto (CV-REF-002):

```
demo-view/
  src/
    dominio/       modelo único de incidente, ciclo de vida, órgãos, canais, RAs e os limites das RAs (funções puras, testadas)
    dados/         gerador determinístico, cenários, conectores simulados com situação (existe/proposta)
    inteligencia/  agrupamento, correlação, previsão, insights com explicação (JSON congelado)
    mapa/          MapLibre + camadas deck.gl, fundo e queda sem rede
    ui/            componentes de vidro, selo de demonstração, tokens
    telas/         uma pasta por iteração
  scripts/         gera os limites das RAs a partir de assets/geo
```

Os limites das RAs ficam em `src/dominio/ras-geo.json`, e não em `public/geo/`
como previa a versão 0.1: o domínio e os testes importam o dado direto.

### Modelo único de incidente (camada 4)

Ponto de partida, a partir do magno 7.3 e da camada 4 do CV-REF-002:

| Campo | Exemplo |
| --- | --- |
| id | `INC-2026-000123` |
| origem | canal (WhatsApp, 190, 162…), órgão, sistema, protocolo externo |
| local | ponto (lat/lon) e RA |
| tipo e área | "som alto" · segurança |
| órgão responsável | PMDF |
| situação | recebido → em triagem → encaminhado → em atendimento → resolvido → encerrado (mais cancelado, falha de envio, reaberto) |
| severidade | atenção · sério · crítico |
| datas | criado, encaminhado, resolvido (para medir a velocidade da gestão) |
| vínculos | "mesmo incidente que" · "relacionado a" |

## 5. Decisão de reuso (registrada aqui, como pede a CV-REF-001)

**Decidido em 11/11/2026 pela equipe:**
- portar o motor da demo antiga, adaptado ao modelo novo e coberto por testes;
- refazer as telas do zero, de forma organizada e incremental.

| Origem (repositório `City-view`) | Destino | Adaptação |
| --- | --- | --- |
| `assets/geo/ra_gdf.geojson` (limites oficiais das RAs, IDE/DF) e `scripts/build-mapa-ras.mjs` | `demo-view/src/dominio/ras-geo.json`, `demo-view/scripts/gerar-ras.mjs` | Nenhuma no dado; o script recebe o caminho da base por argumento e gera para a pasta nova |
| `apps/sala-de-situacao/src/data/ras.ts` (população do Censo 2022 e pesos; a versão 0.1 dizia PDAD 2021, por engano) | `dominio/ras.ts` | Separar o dado oficial (população) dos pesos simulados, rotulando os simulados |
| `data/simulacao.ts` (série diária categoria × RA × dia, sazonalidade, focos) | `dados/gerador.ts` | Gerar incidentes no modelo novo, com origem e situação |
| `data/pontos.ts` (ponto de cada chamado perto do núcleo urbano) | `dados/pontos.ts` | Sem mudança de método |
| `data/grafo-neural.ts` (agrupamento: assunto × espaço × tempo, union-find, urgência) | `inteligencia/agrupamento.ts` | Separar o algoritmo da animação; testes com os cenários |
| `data/previsao.ts` (previsão de duas semanas, "fora do normal", acerto) | `inteligencia/previsao.ts` | Sem mudança de método; entra na I5 |
| `data/inteligencia.ts` (8 casos com sinais, leitura, recomendação, ganho, linha do tempo) | `inteligencia/insights.json` | Reescrever cada caso no formato de insight (motivo, confiança, evidências, ação); conferir os textos com o magno |
| `data/catalogo.ts` (19 órgãos, categorias, canais) | `dominio/orgaos.ts` | Entram só os órgãos e canais com fonte no magno; os demais, quando uma iteração precisar |

**Não vem:** as telas, o visual, o grafo neural animado (ele vira uma ideia a reavaliar na I3) e o mapa da CARTO.

## 6. Iterações

Cada iteração tem o seu próprio plano curto, feito ao começar. "Pronto" quer
dizer: roda, foi revisto com a equipe e tem captura para o deck.

| It. | Fatia | Pergunta que responde | Pronto quando | Slide |
| --- | --- | --- | --- | --- |
| **I0** | Fundação | — | O app abre com o mapa do DF e as RAs sobre o fundo navy, o selo e um painel de vidro de exemplo; o gerador produz incidentes no modelo novo; os testes do domínio passam; o build estático roda sem internet | — |
| **I1** | Sala de guerra | "Onde a cidade precisa de mim agora?" | Mapa de calor ou hexágonos 3D por RA; chamados agrupados; velocidade da gestão (tempo até resolver, % no prazo); "chegando agora" | 14 |
| **I2** | Jornada de um chamado | "O que acontece quando o cidadão relata?" | Um relato simulado pelo WhatsApp passa pelas camadas: coleta → triagem → revisão humana → protocolo no órgão → o status volta ao cidadão. Cada passo mostra se **existe** (dfac) ou é **proposta** | 10, 11, 12 |
| **I3** | Inteligência explicada | "O que os silos não estão vendo?" | Cartões de insight com motivo, confiança, evidências por órgão e ação sugerida; confirmar ou descartar; arcos entre órgãos no mapa. Cenários mínimos: barulho em Ceilândia (agrupamento), pedra na pista (reclassificação) e um de causa comum | 13 |
| **I4** | Gestor e cidadão | "Como está a minha área?" · "O que o governo está entregando?" | Painel por área; mapa de transparência com os três graus (resolvidos · em resolução · abertos) | 15 |
| **I5** | Previsão e "pergunte à cidade" | "O que vem por aí?" | Previsão portada, com a margem visível; pergunta em linguagem natural respondida pelo Claude ao vivo, com respostas prontas de reserva sem rede | 13 |
| **I6** | Mais conectores e etapas | "Com o que mais isso se conecta?" | Catálogo de conectores com a situação de cada um; mais fontes e etapas simuladas (ex.: tempo de fila por órgão) | 12 |

**Situação em 12/11/2026.** A I0 está construída em `demo-view/`: roda, os
testes passam e o build abre sem internet. Para ficar "pronta" faltam a revisão
da equipe e a captura para o deck. Entraram 10 órgãos (os que têm fonte no
magno) e 24 tipos de incidente. Dois pontos para a revisão, por serem propostas
iniciais sem fonte: as transições permitidas entre situações
(`dominio/incidente.ts`) e os percentuais simulados de falha de envio,
reabertura e severidade (`dados/gerador.ts`).

**Opção · Apresentação interativa.** A apresentação como página com rolagem
(scrollytelling): a mesma narrativa do CV-APR-001, com o mapa e os diagramas
da demo animando conforme a pessoa rola. Pilha provável: GSAP ScrollTrigger +
Lenis, reaproveitando os componentes da demo. **Decidir depois da I3**, quando
houver componentes prontos.

## 7. Fora do escopo, por enquanto

- **Percepção** (redes sociais) e **dados de operação** dos órgãos (magno 7.1): ideias de maior risco, sem validação do Daniel (magno 9.3).
- Login real, dados reais de cidadão e qualquer integração real.
- Visual fotorrealista 3D (CesiumJS, Google 3D Tiles): pede token ou chave paga e licença para uso comercial.

## 8. Riscos conhecidos

| Risco | Cuidado |
| --- | --- |
| Rede ruim na sala | Build estático, fontes e dados locais, fundo do mapa com queda para liso, IA ao vivo só com reserva |
| Notebook sem WebGL2 ou fraco | deck.gl intercalado exige WebGL2; testar no computador do Daniel e ter um modo sem 3D |
| Arcos serrilhados | No modo intercalado, arcos e linhas perdem suavização (limitação do deck.gl); avaliar o modo sobreposto na I3 |
| OpenFreeMap fora do ar | O serviço público não tem garantia; o mapa cai para o fundo liso com as RAs |
| Licença do GSAP | Conferir os termos atuais antes de usar na apresentação interativa |
| Demo parecer produto pronto | Selo fixo, rótulos existe/proposta, fala do apresentador (CV-APR-001) |
| Servidores públicos de imagem (EOX, IDE/DF) | *Acréscimo de 12/11/2026.* Sem garantia de disponibilidade. O da IDE/DF recusa tudo por cerca de 1 s depois de uns 200 pedidos num segundo; a demo pede no máximo 50 por segundo. A imagem de perto leva de 4 a 7 s numa área nova: passar antes pelo trajeto da apresentação (o navegador guarda por 12 horas) |
| Licença da imagem de 50 cm | *Acréscimo de 12/11/2026.* É imagem Maxar de 2021, licenciada ao GDF e publicada por ele na IDE/DF sem declarar licença. Serve à demo para o próprio GDF; antes de virar produto, confirmar os termos com a SEDUH. Tirá-la é simples: o mapa segue com o Sentinel |

---

## 9. Construção da demo (andamento)

*Acréscimo de 12/11/2026.* A partir daqui a demo é construída passo a passo,
seguindo as iterações da seção 6. Esta seção concentra o andamento; o resto do
documento continua sendo o plano.

### 9.1 Área isolada

*Revisto em 12/11/2026, ao juntar o trabalho do Lucca (decisão da equipe).*

- **A demo é a `demo-view/`:** autocontida (pacote, build, porta 5200 e README próprios; não lê nada de fora). Visual próprio na direção C (navy, teal, âmbar, Barlow condensada); *acréscimo de 12/11/2026:* trocada por base grafite com cor só para função (último acréscimo desta seção). A demo não mexe em `apresentacao-web/`, `apresentacao/`, `design-system/` nem `design-system-vitrine/`; em `docs/`, só nesta seção.
- **A `design-system-vitrine/` é a vitrine do design system** "Sala de Operações" ([CV-DS-001](CV-DS-001-design-system.md)), que vale para a apresentação em rolagem. Ela não recebe as iterações da demo. *Acréscimo de 12/11/2026:* a pasta se chamava `demo/`; foi renomeada para não se confundir com a demo. As branches das iterações continuam com o prefixo `demo/`, que é nome de branch, não de pasta.
- **Uma iteração por vez:** cada uma ganha uma branch própria (`demo/iN-<nome>`), um plano curto antes de começar e uma revisão com a equipe antes de entrar no `main`. A próxima só começa depois disso.

### 9.2 Situação das iterações

| It. | Situação | Data | O que entrou |
| --- | --- | --- | --- |
| I0 · fundação | **Feita** (Lucca), integrada ao `main` | 12/11/2026 | `demo-view/`: modelo único de incidente com ciclo de vida e validação; 10 órgãos e 24 tipos com fonte no magno; 37 RAs; gerador portado (contagens de 180 dias e incidentes dos últimos 30), com testes (50); mapa MapLibre com as RAs; selo e painel de exemplo. As transições entre situações e os percentuais simulados (ver a "Situação em 12/11/2026" na seção 6) seguem como proposta inicial da equipe, aceitos provisoriamente em 12/11/2026 para a construção continuar; voltam à revisão quando houver referência dos órgãos. Captura: `demo-view/capturas/i0-fundacao.png` |
| I1 · sala de guerra | **Feita**, integrada ao `main`; revista no visual e no mapa na branch `feature/demo-preview` (último acréscimo desta seção), aguardando revisão da equipe | 12/11/2026 | Refeita no mesmo dia como sala de comando em 3D (ver o acréscimo abaixo): o DF inclinado, que gira devagar; chamados em Regiões 3D, Hexágonos 3D ou Calor; prédios em 3D de perto; um chamado novo chegando a cada poucos segundos, com anel no mapa; RA clicável, com cartão; filtros de período, área e RA, que mudam mapa e números juntos; abertos, recebidos, tempo até resolver e % no prazo; velocidade da gestão por área; chamados por dia; camadas reais ligáveis (saúde CNES 2026, escolas INEP 2025, favelas IBGE 2022); tour de 5 paradas com frases literais da ATA (`?tour=1`); modos padrão, noturno e térmico; modo telão. Testes: 87. Capturas: `demo-view/capturas/i1-sala*.png`. *Acréscimo de 12/11/2026:* depois da revisão, o calor é o modo principal e o tour fica nele; saíram os modos noturno e térmico e a órbita ao abrir; testes: 152. As capturas são de antes da revisão. *Acréscimo de 12/11/2026:* revisão aceita pela equipe (Sammuel); a fila de pedidos de imagem passou a espaçar os inícios reais (um disparo atrasado juntava os seguintes numa rajada, o que a IDE/DF recusa); capturas refeitas no visual novo (`i1-sala.png`, `i1-sala-tour.png`, `i1-sala-contexto.png`); testes: 153 |
| I2 · jornada de um chamado | **Feita**, aguardando revisão (branch `demo/i2-jornada`) | 12/11/2026 | Tela `#/jornada`, ao lado da sala (o app ganhou uma casca com as duas telas). O celular com os textos reais do assistente do dfac; o diagrama das cinco camadas com o selo existe · pronto · proposta e a fonte de cada peça (`dominio/ponte.ts`); o detalhe de cada passo com a situação no modelo único e o estado no dfac. Dois casos: o poste apagado em Águas Claras (o que existe, de ponta a ponta) e a rua no escuro que era falta de energia (a proposta: cruzamento entre órgãos, com texto rotulado como da equipe). Modo "experimente": a pessoa escreve no celular e a jornada anda com o relato dela, pelo mesmo roteiro do dfac; nada é enviado. Testes: 185. Capturas: `demo-view/capturas/i2-jornada-*.png` |
| I3 · inteligência explicada | **Feita**, aguardando revisão (branch `demo/i3-inteligencia`) | 12/11/2026 | Tela `#/inteligencia`: o grafo em 3D sobre o DF, em três etapas (chamados → ligações → incidentes); a fila com os 9 casos da demo exploratória; o insight explicado nas quatro partes do slide 13 (o que a IA viu · por quê · confiança · o que sugere); confirmar (5 s para cancelar) e descartar com motivo; leitura "por órgão"; controle de sensibilidade. Motor em `src/inteligencia/` (casos, agrupamento, decisões). Testes: 216. Capturas: `demo-view/capturas/i3-*.png` |
| I4 a I6 | A fazer | — | Seção 6 |

A casca visual feita em `demo/` (hoje `design-system-vitrine/`) no mesmo dia (barra, navegação, painel da sala, catálogo) fica como vitrine do design system e como referência de interface para a I1, sem código copiado.

*Acréscimo de 12/11/2026, decisões da I1.*
- **Gráficos:** SVG feito à mão, sem biblioteca (Recharts e visx ficaram de fora). A I1 tem só barras e um minigráfico, que não pedem mais que isso. A escolha é revista na I4, quando vierem gráficos maiores. Isto fecha o "a definir na I1" da tabela da pilha (seção 3).
- **Versões:** deck.gl 9.4.1 (`@deck.gl/core`, `layers`, `aggregation-layers` e `maplibre`, no modo intercalado) e Motion 14.12.0, fixadas no `demo-view/package.json`.
- **Cor da concentração:** a escala do mapa vai do teal ao âmbar e termina num vermelho de alerta (`#E5484D`), acrescentado aos tokens da direção C.
- **Altura dos hexágonos:** proporcional ao volume filtrado, para que um filtro com poucos chamados não vire meia dúzia de torres.

*Acréscimo de 12/11/2026, a I1 refeita.* Na revisão, a equipe achou o mapa da
primeira versão muito abaixo do que a demo exploratória já tinha: a "Visão da
cidade" (modo comando em 3D) e o grafo do Calebe ("Do chamado ao incidente",
`apps/sala-de-situacao/src/components/grafo-deck.tsx`). Decisão: refazer a I1
nesse nível, completa mas sem poluir, e levar o grafo para a I3.
- **Voltaram:** câmera inclinada com órbita lenta, extrusão por RA, HUD com
  camadas e selo "Real · fonte", tour com legenda, modos noturno e térmico,
  pulso no que chega e as camadas reais (geobr). Telas e código reescritos no
  visual da direção C; vieram de lá os dados reais e, reescritos, os filtros SVG
  dos modos de visão.
- **Sem poluir:** ao abrir, só os chamados e os nomes das RAs; as camadas reais
  começam desligadas; no tour e no telão, os painéis saem.
- **Relógio da demo:** a cidade é gerada 4 horas à frente e o que falta chega
  aos poucos, como "recebido agora". É simulação, como o resto.
- **I3:** o grafo do Calebe é a base (chamados com brilho, arcos que cruzam
  órgãos com sinais correndo, colapso no incidente sugerido, confirmação humana),
  refinado no mesmo visual.

*Acréscimo de 12/11/2026, revisão visual e do mapa da I1.* Antes de seguir para
a I2, a equipe (Lucca) pediu duas rodadas de refinamento da I1, sem
funcionalidade nova. Entraram no commit `1289335` da branch `feature/demo-preview`.
- **Visual:** a tela parecia "dashboard genérico" pelo excesso de azul. A direção C
  deu lugar a uma base grafite; o teal da marca ficou só para o que está ativo ou
  ao vivo, o âmbar só para o selo de demonstração, e a concentração de chamados
  usa uma rampa quente de um só matiz (substitui o teal → âmbar → vermelho do
  acréscimo "decisões da I1"). Referências da equipe: Palantir, LandViewer e TIM
  SmartSignal. Escala tipográfica nomeada, de 11 a 30 px.
- **Mapa de calor como leitura principal:** é o que abre e o único modo do tour.
  Desenhado pelo próprio MapLibre a partir de células de 120 m, com raio em
  metros no chão e cor relativa ao maior foco da seleção. A camada anterior
  (deck.gl) travava o mapa por cerca de 300 ms a cada chegada; agora o mapa
  roda a 60 quadros por segundo do DF inteiro até a rua. Hexágonos 3D e Regiões
  3D continuam, no painel de camadas.
- **Onde os chamados caem:** dentro da mancha urbana oficial do DF (IDE/DF,
  2023), com mais peso perto de escolas, unidades de saúde e comunidades. Antes
  caíam numa nuvem em volta de um ponto por RA, inclusive sobre cerrado e
  lavoura. Continuam fictícios.
- **Imagem e navegação:** satélite na vista geral e imagem de 50 cm de perto
  (pilha, seção 3), com nomes de vias. Saíram os modos noturno e térmico. "Girar"
  virou rotação manual por arrasto; o mapa ganhou bússola e botões de zoom;
  escolher uma RA enquadra os limites dela. Os chamados recém-chegados viraram
  pontos pequenos, com legenda e dica.
- **Pendências:** a licença da imagem de 50 cm (riscos, seção 8) e a revisão da
  I1 com a equipe. *Acréscimo de 12/11/2026:* a revisão foi aceita como está
  (sem os modos noturno e térmico e sem a órbita); fica só a licença.

*Acréscimo de 12/11/2026, decisões da I2.*
- **O que é real na jornada:** os textos do assistente, a ordem da coleta, os
  estados da demanda e as palavras da triagem vêm do dfac (commit `0eec955`),
  conferidos no código; a situação de cada canal e conector vem da seção 4.1 do
  CV-REF-002. As conversas, os nomes, os protocolos e o cruzamento entre órgãos
  são fictícios, e tudo o que é proposta aparece rotulado, inclusive a única
  mensagem ao cidadão que não é do dfac.
- **Dois formatos** (decisão da equipe): a história guiada, que toca sozinha, e o
  "experimente", que corre a mesma máquina de coleta (`dados/coleta.ts`), com o
  pino do WhatsApp trocado por um toque no mapa e o código `TESTE-`, como as
  simulações do dfac, que nunca são enviadas.
- **Correspondência de estados:** os 14 estados do dfac entram no modelo único
  por `SITUACAO_DO_DFAC`; "duplicada" vira o vínculo "mesmo incidente que". Um
  teste garante que o caminho feliz do dfac é um caminho permitido no modelo.
- **Casca:** `App.tsx` passou a ser só a casca (título, abas e selo); a sala foi
  para `telas/sala/TelaSala.tsx` sem mudar de comportamento, e a cidade simulada
  é gerada uma vez por visita, para quem vai à jornada e volta encontrar a mesma.
- **Fica para a I3:** o caso da rua no escuro termina no cruzamento entre
  órgãos; a I3 mostra esse cruzamento acontecendo, com o grafo do Calebe.

*Acréscimo de 12/11/2026, a demanda nasce em qualquer lugar (I2).* Pedido da
equipe, a partir da arquitetura da conversa de 10/11 ("eu integro com todos
eles, independente do nome", ATA 174): não importa se a demanda nasce no dfac,
no Portal do Cidadão, no 190 ou num sistema legado; o City View cuida dali para
frente. Branch `demo/i2-origens`.
- A camada 1 virou "Onde a demanda nasce", com os canais do City View e os
  sistemas que os órgãos já têm (situação nova: "sistema do órgão, já existe").
- Cada caso da jornada ganhou a versão "pelo sistema do órgão": o registro no
  155 da CEB ou no 116 da Neoenergia, o conector (proposta) e o mesmo incidente.
- O celular deixou de se apresentar como o dfac: é "um canal do City View", com
  os textos do piloto de Águas Claras. Testes: 190.

*Acréscimo de 12/11/2026, decisões da I3.*
- **Linguagem limpa** (pedido da equipe): os grafos e o 3D ficam, mas depurados.
  Fundo grafite sem imagem de satélite nesta tela (`semImagens`, em
  `mapa/estilo.ts`), tom neutro em tudo, cor só no incidente aberto e na
  severidade, e no máximo uma coisa se mexendo: o sinal nos arcos do incidente
  aberto, ou a onda de quem acabou de ser confirmado. A sala e o calor não mudam.
- **O que é calculado e o que é escrito:** o agrupamento é calculado de verdade
  sobre chamados simulados (força = afinidade de assunto × proximidade ×
  simultaneidade; union-find; confiança pelas três partes). A afinidade entre
  assuntos é uma tabela, como na demo exploratória; aqui ela sai dos próprios
  casos. A leitura, a recomendação e o ganho são textos escritos, portados como
  estavam. Um teste garante que cada caso vira exatamente um incidente e que o
  ruído do dia a dia não vira incidente sério.
- **Órgãos fora do catálogo:** PCDF, Detran-DF, Defesa Civil, Vigilância Ambiental
  e SES-DF aparecem nos casos só como origem de sinais simulados
  (`FONTES_SIMULADAS`); o catálogo da demo continua com os 10 que têm fonte no magno.
- **Arcos serrilhados** (risco da seção 8): avaliado. Com arcos de 1 a 1,5 px em
  tom claro sobre fundo escuro, o modo intercalado ficou aceitável; não foi
  preciso o modo sobreposto.
- **Clique no modo intercalado:** o `Mapa.tsx` ganhou `clicaveis` e
  `aoClicarObjeto`, que perguntam ao deck.gl o que está sob o clique.
- **A conferir com a equipe:** o caso do apagão diz "quatro órgãos" no título e no
  ganho (texto original, que conta a Novacap), mas os chamados vêm de três
  (Neoenergia, Detran e Defesa Civil), e é isso que a fila mostra.
- **Próximo:** decidir a apresentação interativa (seção 6) e seguir para a I4.

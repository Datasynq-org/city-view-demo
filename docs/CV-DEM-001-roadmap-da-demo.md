# CV-DEM-001 · Roadmap da demo

| Campo | Valor |
| --- | --- |
| Código | CV-DEM-001 |
| Versão | 0.4 (12/11/2026), para revisão da equipe. Registra as oito telas e a comparação com a demo exploratória (seção 9.3). A 0.3, do mesmo dia: revisão visual e do mapa da I1. Registra a revisão visual e do mapa da I1 (seção 9, último acréscimo). A 0.2, do mesmo dia, mudou a pasta para `demo-view/` e registrou a I0; a 0.1 é de 11/11/2026 |
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
| I4 · gestor e cidadão | **Feita**, aguardando revisão (branches `demo/i4-gestao`, `demo/i4-regioes`, `demo/i4-cidadao`) | 12/11/2026 | Telas Gestão (velocidade da gestão contra o período anterior, tabela de órgãos, visão do gestor), Regiões (mapa em cores, ranking, perfil contra o DF) e Cidadão (mapa público em três graus, acompanhamento). Seção 9.3 |
| I5 · previsão | **Feita em parte**, aguardando revisão (branch `demo/i5-previsoes`) | 12/11/2026 | Tela Previsões: duas semanas à frente com margem, fora do normal, o que sobe e cai, onde reforçar, acerto medido. **Falta "pergunte à cidade"** (Claude ao vivo), que pede chave e um serviço intermediário. Seção 9.3 |
| I6 · conectores | **Feita**, aguardando revisão (branch `demo/i6-integracoes`) | 12/11/2026 | Tela Integrações: as cinco camadas, catálogo de 14 conectores com situação, método, sinais e fonte, e as regras. Seção 9.3 |

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

*Acréscimo de 12/11/2026, o chat e a operação dos órgãos.* Pedido da equipe
(Sammuel). Branch `demo/i2-operacao`.
- **Chat:** o assistente da jornada se apresenta como City View, e não mais como
  o do piloto; saiu também o aviso sobre Águas Claras e Taguatinga no pedido de
  localização. Os selos "existe em Águas Claras" das camadas ficam: são a prova.
- **Operação à vista:** os órgãos têm os seus sistemas, e a observabilidade
  deles entra integrada. A camada 3 passa a dizer que cada conector traz dois
  sinais, demandas e operação (qualidade da rede, qualidade do serviço e saúde
  do sistema); a jornada ganha o passo "o que o sistema do órgão já sabe"; o
  insight da inteligência separa o que os cidadãos relataram do que os sistemas
  registraram. Vem do magno 7.1 ("três sinais da cidade") e do ponto de partida
  da conversa (observabilidade de tecnologia, ATA 73–106).
- **A confirmar com o Daniel (magno 9.3):** dados de operação são ideia da
  equipe, ainda sem validação. Na demo aparecem como proposta, com indicadores,
  valores e nomes de sistemas simulados; cada órgão teria de liberar o que se
  mostra. Percepção (redes sociais) continua fora.
- Testes: 225.

### 9.3 As oito telas e a comparação com a demo exploratória

*Acréscimo de 12/11/2026.* A equipe (Sammuel e Lucca) pediu o restante das
telas, "igual ao outro": painel de inteligência e insights, velocidade da
gestão e as demais. Foram construídas em sequência, uma branch por tela, para
uma revisão do conjunto antes do `main`. A navegação passou a ser uma barra
lateral estreita (`ui/BarraLateral.tsx`).

| Tela da demo exploratória | Na demo nova | Situação |
| --- | --- | --- |
| Visão geral | **Sala de situação**: calor, números, velocidade por área, série, chegando agora; e agora órgãos com mais chamados, problemas mais relatados e atalhos | Coberta |
| Visão da cidade (3D) | **Sala**: camadas, tour, hexágonos e regiões 3D | Coberta (sem os modos noturno e térmico, por decisão da revisão da I1) |
| Regiões | **Regiões**: mapa em cores, quem espera mais, ranking, perfil contra o DF | Coberta |
| Órgãos | **Gestão**: tabela de órgãos e visão do gestor | Coberta |
| Velocidade da gestão | **Gestão**: contra o período anterior, com a mesma idade | Coberta |
| Inteligência (insights ocultos) | **Inteligência · Painel**: resumo e cartões | Coberta |
| Do chamado ao incidente | **Inteligência · Grafo**: três etapas, confirmar e descartar | Coberta |
| Padrões e previsões | **Previsões** | Coberta |
| Visão do cidadão | **Cidadão**: três graus (lá eram dois) e acompanhamento | Coberta |
| Integrações | **Integrações**: camadas, catálogo, regras | Coberta |
| (não havia) | **Jornada de um chamado**, com as duas origens e a operação dos órgãos | Nova |

**Decisões:**
- **Gráficos:** continuam em SVG à mão (`ui/graficos.tsx`: linha com faixa,
  minilinha, barra; `ui/MapaDasRas.tsx`). A I4 era o ponto de rever a biblioteca:
  os gráficos seguem poucos e simples, e ficar sem ela mantém a demo leve.
- **Comparação justa na velocidade da gestão:** o período anterior entra como
  estava na época (`comoEm`). Sem isso, a tela diria "mais rápida" sempre.
- **Prazo cumprido por dia:** só chamados com o prazo vencido entram na conta.
- **Repetidos:** mesmo tipo, a menos de 150 m e de 24 h. Regra simples, da
  equipe, para valer na base inteira; o agrupamento da inteligência é outro.
- **Previsão:** método portado sem mudança; é proposta (magno 9.9).
- **Conectores:** só Participa DF e Portal do Cidadão aparecem como existentes,
  e IluminaDF como pronto. O método dos três foi conferido no código do dfac e
  é descrito como é (chamadas ao serviço, sessão de navegador), sem chamar de
  API oficial o que não foi verificado. O ADM 24h segue "não identificado".
- **Uma cidade para todas as telas** (`dados/cidade.ts`).

**Fora, por enquanto:** "pergunte à cidade" (I5), percepção (redes sociais) e
os modos noturno e térmico. **A decidir:** a apresentação interativa (seção 6).

*Acréscimo de 12/11/2026, tema claro.* Pedido da equipe (Sammuel). Branch
`demo/tema-claro`.
- A demo ganha um tema claro, além do escuro (que continua o padrão): para sala
  iluminada, projetor e impressão. O botão fica no pé da barra lateral.
- **Como:** as cores da interface já eram variáveis; o claro redefine a paleta
  (`:root[data-tema='claro']` em `src/estilos.css`). O branco fixo dos títulos e
  números virou a "tinta" (`--color-tinta`), que muda com o tema; sobre fundos
  de cor cheia o texto continua branco. O acento escurece no claro, para manter
  o contraste.
- **Mapas:** os de dados (regiões, cidadão, grafo da inteligência) têm versão
  clara. O de satélite (sala e mini mapa da jornada) fica escuro nos dois temas:
  o calor e os contornos foram ajustados para a imagem escurecida.
- Testes: 277.
- *Acréscimo de 12/11/2026, cores por área no claro.* No tema claro, a
  inteligência colore os indicadores como a apresentação em rolagem: cada
  chamado no mapa, cada linha de evidência e cada fila do "por órgão" leva a cor
  da área do órgão (as sete de `--area-0` a `--area-6` do design system, em
  `inteligencia/cores.ts`), com legenda. É a mistura de cores num mesmo lugar
  que mostra o cruzamento. No escuro a tela segue neutra, como decidido na I3.
  Branch `demo/tema-claro-cores`. Testes: 281.

### 9.4 Depois da revisão por papéis: fluxo e visualização

*Acréscimo de 13/11/2026.* A revisão ([CV-DEM-002](CV-DEM-002-revisao-por-papeis.md))
listou 28 achados. O Sammuel escolheu fazer o bloco de **fluxo** (F1 a F5) e o
de **visualização** (V1 a V8), com um ponto dele: a comunicação com os órgãos é
**de mão dupla**. O City View está integrado a cada órgão também para enviar;
então a IA racionaliza, monta um plano e direciona um pedido a cada um, e o
órgão responde.

| Branch | O que entrou | Achados |
| --- | --- | --- |
| `demo/fluxo-incidente` | Plano de envio por órgão, ida e volta, devolução com redirecionamento, fecho com a mensagem ao cidadão, abas Em andamento e Registro, pedidos na visão do gestor, estado comum | F1, F3, F5, A5 |
| `demo/visualizacao` | "Pede atenção agora" e chegadas agrupadas na sala; variação e meta nos números; modo "Fora do normal"; frase da gestão; "9 em cada 10"; ordem e natureza dos órgãos; escala fixa no mapa público | F2, V1 a V7 |
| `demo/linha-do-tempo` | Barra de horas no grafo: o incidente se formando | V8 |
| `demo/perfis` | Entrada por perfil: governadora, gestor de órgão, operador da sala | F4 |

**Decisões:**
- **O envio é proposta.** A demo mostra o pedido saindo "pelo sistema do órgão"
  e lê a situação do conector no catálogo (`dominio/conectores.ts`): só a CEB
  IPes aparece como pronta; o resto, proposta. O protocolo é fictício e dito
  como tal. Se o City View **abre** o incidente no sistema do órgão ou só avisa
  é pergunta para o Daniel (CV-DEM-002, seção 4).
- **Quem responde pelo órgão é um roteiro**, em tempo acelerado, com a opção de
  responder à mão. Num caso (sossego), um órgão devolve o pedido, para a volta
  aparecer.
- **O plano é escrito à mão**, como a recomendação, e coerente com ela (um
  responsável por caso; todo órgão que recebeu chamado está no plano). A IA da
  demo não gera o plano: ela agrupa; o plano vem do caso.
- **As metas são de exemplo** (80% no prazo), marcadas na tela. As reais dependem
  do governo.
- **"Fora do normal" desconta o DF inteiro.** Na base simulada a última semana
  subiu 11% em todo o DF; sem o desconto, o modo acendia quase todas as regiões.
  A alta também precisa passar de dois desvios do acaso.
- **O perfil não é controle de acesso.** Escolhe as telas da barra; qualquer
  endereço continua abrindo.

**O que ficou diferente do planejado:**
- Na sala, só "Metade resolvida em" e "No prazo" ganharam variação. "Recebidos"
  e "Abertos agora" não: o dia de hoje é parcial e a comparação de volume sairia
  injusta.
- Na barra do tempo, as marcas da linha do tempo de cada caso não foram
  posicionadas: os textos ("23h10", "há 4 semanas") não são horas que a barra
  consiga situar. A lista continua no insight.

**Continuam por fazer** (CV-DEM-002): A1 a A4, A6, D1 a D6, R1 a R3. Os riscos
R1 (ponto exato de chamados de segurança; "a mesma casa") e R3 ("quatro órgãos")
seguem abertos e valem antes de mostrar a alguém de fora.

Testes: 315.

*Acréscimo de 13/11/2026 · acrescentar e método.* Pedido do Sammuel: os itens
de "acrescentar" (A1 a A4 e A6; o A5 já estava) e os de método (D1 a D6) do
CV-DEM-002. Branch `demo/acrescentar-metodo`, sobre `demo/perfis`.

**Decisões:**
- **A demo passa a ter nove telas:** entra o **Resumo do dia**, logo depois da
  sala. As perguntas prontas ficam no pé dele, e não numa tela própria: são o
  mesmo gesto de quem quer saber "o que eu preciso saber hoje".
- **"Pergunte à cidade" sem modelo de linguagem.** Seis perguntas fixas, cada
  uma uma função pura (`inteligencia/perguntas.ts`) que devolve frase, números,
  a conta e, às vezes, um mapa. A pergunta livre continua por fazer (precisa de
  chave e de um intermediário no servidor).
- **O décimo caso é para a IA errar** (`duvidoso`, em `inteligencia/casos.ts`).
  A nota de semelhança dele sai alta, porque lugar e assunto batem, e isso é o
  ponto: mostra por que a nota não é chance de acerto e por que quem decide é
  uma pessoa. Os outros nove seguem como estavam.
- **A previsão não foi mudada; foi medida melhor.** O método é o mesmo. O que
  muda é dizer o erro em várias janelas e compará-lo com o palpite mais simples.
  Na base simulada ele ganha (11% contra 15%); se não ganhasse, a tela diria.
- **Reforço só fora da margem.** Com a régua honesta, a lista de "onde reforçar"
  fica vazia na base de hoje, e a tela diz que não há reforço a recomendar. É o
  certo, mas é uma tela a menos para mostrar: se a equipe quiser a cena, o
  caminho é plantar uma alta local na base, à vista, não afrouxar a régua.
- **Premissa do ganho:** 6 minutos por atendimento repetido, de exemplo.

Com isto, do CV-DEM-002 ficam abertos só os três riscos (R1 a R3).

Testes: 331.

*Acréscimo de 13/11/2026 · Analytics do ecossistema.* Pedido do Sammuel: "uma
página só de analytics baseado no ecossistema inteiro, qualidade de rede, luz no
DF, saneamento, mapa de segurança com índices". Branch `demo/analytics`, sobre
`demo/acrescentar-metodo`. A demo passa a ter dez telas.

**Decisões:**
- **Um índice por serviço e por região**, de 0 a 100, feito só do que a base já
  tem: chamados por habitante, prazo cumprido e fila além do prazo. Os pesos
  (40, 40, 20) e as faixas (70 e 55) são da equipe, ditos na tela.
- **"Qualidade de rede" vem da operação dos órgãos** (`dominio/operacao.ts`),
  que já era proposta e simulada (magno 9.3). Ela aparece para o DF inteiro, não
  por região: a base não simula a rede região a região.
- **Segurança com cuidado dobrado:** o índice vem dos chamados ao 190, não é
  índice de criminalidade; é por região, nunca por ponto; não entra no mapa
  público. A operação da PMDF não é simulada.
- **O limite do índice está na tela:** região que reclama pouco pode ter índice
  alto e problema grande. É o mesmo ponto da triangulação.

**O que não tem:** série histórica do índice (a base detalhada cobre 30 dias,
que é a janela do próprio índice), comparação entre serviços numa mesma região
e metas por serviço.

Testes: 341.

*Acréscimo de 13/11/2026 · Analytics fundida em Regiões.* O Sammuel viu a tela
Analytics e achou ruim e supérflua: "Regiões é quase o mesmo, podem ser
combinadas em uma página só". Feito, na mesma branch. A demo volta a ter nove
telas; a de regiões passa a se chamar "Regiões e serviços".

- **O que mudou:** os quatro serviços viraram uma faixa no alto de Regiões.
  Escolher um troca a leitura do mesmo mapa e do mesmo ranking para o índice
  dele, e abre os sinais do sistema do órgão. O perfil da região ganhou os
  quatro índices. Nada da conta mudou (`indicadores/ecossistema.ts`).
- **O que saiu:** a tela à parte, o gráfico de volume por serviço (a Gestão já
  mostra por órgão) e o painel grande de "como o índice é feito", que virou um
  parágrafo.
- **A lição:** mapa por região mais ranking mais detalhe já era Regiões. Uma
  leitura nova do mesmo recorte entra como opção da tela que existe, não como
  tela nova. Onde o parágrafo anterior fala em "tela Analytics" e "dez telas",
  vale este.

*Acréscimo de 13/11/2026 · demandas reais de Águas Claras.* Pedido do Sammuel:
"puxar os dados do DFAC de Águas Claras para colocar no app e mockar nosso fluxo
(insights, rede, grafos com aqueles dados)". Branch `demo/aguas-claras`, sobre
`demo/analytics`. É a primeira vez que a demo mostra dado real.

**O que foi decidido com ele:** fonte = o mapa público agora, o banco do dfac
depois (se ele liberar o acesso); uma chave de fonte no app; mostrar o texto dos
cidadãos, limpando.

**Decisões da execução:**
- **A fonte é o endpoint público do site parceiro**
  (`GET https://dfaguasclaras.com.br/mapadedemandas/api/demandas`, sem login,
  achado no código do dfac). Uma leitura só, em 13/11/2026: 853 demandas, todas
  com `autorizacao = aprovado`, só os 13 campos esperados. O banco de produção
  do dfac não foi tocado.
- **O arquivo fica no repositório**, em `src/` (e não em `public/`, como estava
  no plano: assim o dado entra nos testes). É dado já publicado; o repositório é
  privado.
- **Agrupamento próprio para o dado real** (`inteligencia/reais.ts`), no
  espírito da regra de recorrência do dfac. A primeira versão ligava tipos
  diferentes só pela vizinhança e juntava assuntos sem relação (carro abandonado
  com asfalto afundado); passou a exigir texto parecido e pelo menos três
  relatos. De 158 grupos, ficaram 28.
- **"Sem órgão atribuído" não é órgão:** 97 demandas vêm sem órgão no site; elas
  entram, mas não contam como cruzamento entre órgãos.
- **O selo muda com a fonte e com a tela:** na Inteligência, "Demandas reais de
  Águas Claras, lidas em 13/11/2026 · fluxo simulado"; nas outras, "Esta tela:
  cidade simulada".

**O que ficou diferente do plano:**
- **Só a Inteligência roda sobre o dado real.** O plano previa também a sala e
  os blocos de volume do Resumo e da Gestão. Essas telas são construídas sobre o
  modelo da cidade simulada (prazo por tipo, tempo até resolver, chegadas ao
  vivo, DF inteiro), que o dado real não preenche. Em vez de adaptá-las pela
  metade, os números reais (total, status, tipo, órgão, série por mês) ficam num
  bloco no alto da Inteligência, e o selo avisa nas demais.
- **A "rede" (operação dos órgãos) não foi ligada ao dado real:** continua só na
  cidade simulada.

**Achados no dado, para a equipe:**
- 853 demandas em 26 meses; 46% finalizadas, 47% encaminhadas, 6% em andamento.
- Os números diferem pouco dos do magno 6.1 (843 em 06/11): são dez a mais em
  uma semana.
- Há relatos repetidos palavra por palavra no mesmo dia e ponto (oito do mesmo
  afundamento de asfalto): provavelmente a mesma pessoa reenviando.
- Há recorrência escrita pelo próprio cidadão ("pela 5ª vez em 2026 abriram
  buracos na Rua 19 Sul"): o melhor exemplo real do que o City View propõe.

**Pendente:** o banco do dfac (demandas do WhatsApp, datas de envio e de
resolução), que depende de o Sammuel liberar o acesso.

Testes: 365.

*Acréscimo de 13/11/2026 · as duas fontes juntas.* Com a chave de fonte em
"Águas Claras", a Inteligência mostrava só Águas Claras, e o Sammuel estranhou:
"agora tem só Águas Claras". Pediu os dois juntos. Feito, na mesma branch.

- **A chave de fonte saiu.** A Inteligência mostra sempre o DF simulado e os
  relatos reais de Águas Claras, no mesmo mapa e na mesma fila, por urgência: 10
  incidentes simulados e 28 reais.
- **Não se misturam na conta.** Cada fonte é ligada e agrupada pela sua regra;
  um relato real nunca entra num caso simulado (`inteligencia/juntos.ts`, com
  teste). Só a fila é comum.
- **Cada insight diz de onde vem:** etiqueta "Dado real" ou "Simulado" no
  cartão, na fila do grafo, no insight e em "Pede atenção agora" da sala. Os
  códigos dos reais são "AC-01", "AC-02"…
- **No grafo**, os incidentes reais têm coluna dez vezes menor (são de quadra,
  não de região), para não cobrir o bairro.
- **O selo** da Inteligência passa a dizer "Águas Claras: dado real de
  13/11/2026 · DF e fluxo simulados". Onde o parágrafo anterior fala em chave de
  fonte e em selo por fonte, vale este.

Testes: 370.

*Acréscimo de 13/11/2026 · o grafo com volume.* O Sammuel mostrou o grafo de
Águas Claras de perto, no tema claro: "com volume (que vai ter) a view fica
poluída". Cada um dos 853 pontos tinha um brilho, e os brilhos se somavam numa
mancha. Regra nova: **a tinta vai para o que foi agrupado.** Antes de agrupar,
todo chamado é um ponto pequeno; depois, só os de incidente levam brilho e cor,
e o avulso vira um ponto neutro. É a regra da I3 ("cor só para função") levada
ao volume. Não há agregação por zoom: se o volume crescer outra ordem de
grandeza, o passo seguinte é juntar os avulsos em células, como o calor da sala.

Testes: 373.


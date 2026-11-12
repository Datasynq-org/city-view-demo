# City View · demo

A demo do painel do City View, construída em fatias conforme o roadmap
(CV-DEM-001). Tudo o que aparece é **simulado**: não há API, login nem dado real
de cidadão. O selo "Ambiente de demonstração · dados simulados" fica sempre
visível.

Esta pasta é autocontida: tem o seu próprio `package.json` e não lê nada de
fora dela. Pode ser movida inteira para outro repositório.

## Onde está

**I0 · Fundação** (pronta): o mapa do DF com as 37 regiões administrativas sobre
o mapa de fundo, o selo e o gerador de incidentes no modelo único, com testes.

**I1 · Sala de guerra** (feita, aguardando revisão): "onde a cidade precisa de
mim agora?" (slide 14). Uma sala de comando: o DF inclinado, sobre imagem de
satélite, que conta a história sozinho no tour. Capturas, já no visual revisto:
`capturas/i1-sala.png` (abertura com os painéis), `i1-sala-tour.png` (parada
"onde as coisas estão pegando") e `i1-sala-contexto.png` (dados reais de perto).

- **Mapa de calor:** a leitura principal, e a que abre. Mostra onde os chamados
  se concentram, em seis faixas, preso ao chão: ao aproximar, a mancha fica nas
  mesmas ruas e ganha detalhe. Clicar numa RA enquadra os limites dela, abre o
  cartão (população, chamados por 10 mil habitantes, o que mais chega) e filtra
  a tela.
- **Outras leituras**, no painel de camadas: **Hexágonos 3D** e **Regiões 3D**
  (cada RA sobe e clareia com o volume).
- **De perto**, o mapa troca para a imagem de 50 cm do GDF, com os nomes das
  vias e os prédios em 3D; no nível da rua o calor sai de cena.
- **Ao vivo:** a cada 3,5 a 7 segundos chega um chamado novo, com um anel no
  mapa e a entrada em "chegando agora" (o relógio da demo, `indicadores/relogio.ts`).
  Os três mais recentes ficam marcados com um ponto teal; passar o mouse diz o que é.
- **Filtros** de período (hoje, 7 dias, 30 dias), área e RA. Mapa e números
  mudam juntos.
- **A cidade agora:** abertos, recebidos, tempo até resolver (mediana) e % no
  prazo. **Velocidade da gestão** por área. **Chamados por dia** em 30 dias.
- **Camadas reais**, desligadas ao abrir, com o selo da fonte: unidades públicas
  de saúde (CNES 04/2026), escolas públicas (INEP 2025) e favelas e comunidades
  urbanas (IBGE 2022).
- **Tour** (5 paradas, cada uma com uma frase literal da conversa de 10/11):
  o DF inteiro → onde está pegando → a velocidade da gestão → o que chega
  agora → o contexto da cidade. Abre já rodando com `?tour=1` no endereço.
  Todas as paradas usam o mapa de calor.

| Tecla | Faz |
| --- | --- |
| T | Liga e desliga o tour |
| O | Modo girar: arrastar o mapa gira e inclina, em vez de mover |
| C | Abre o painel de camadas (e a escolha entre calor, hexágonos e regiões) |
| H | Modo telão: esconde os painéis (também com `?telao=1`) |
| Esc | Fecha o que estiver aberto e volta ao DF inteiro |

O mapa se navega como qualquer mapa: arrastar move, a roda aproxima no ponto
do cursor, o botão direito (ou Ctrl + arrastar) gira e inclina. No canto do
mapa ficam os botões de aproximar e afastar e a bússola; clicar nela volta ao
norte, visto de cima. Mexer no mapa para o tour. O mapa só gira sozinho durante
o tour. Com "reduzir movimento" ligado no sistema, nada gira nem pulsa. Os
gráficos são SVG feito à mão, sem biblioteca; a escolha é revista na I4.

### O mapa

- **Calor** (`mapa/calor.ts`): desenhado pela camada de calor do próprio
  MapLibre, a partir de células de 120 m, e não de cada chamado. O raio é do
  chão (em metros, por zoom), não da tela. A cor é relativa ao maior foco da
  seleção (período, área e RA), não ao que está na tela: arrastar o mapa não
  muda cor nenhuma. Quando chega um chamado, só a célula dele é atualizada.
  Antes era a `HeatmapLayer` do deck.gl, que refazia tudo na placa de vídeo a
  cada chegada e a cada zoom, e travava o mapa por cerca de 300 ms.
- **Onde os chamados caem** (`dados/pontos.ts`): dentro da mancha urbana oficial
  do DF, com mais peso perto de escolas, unidades de saúde e comunidades. Antes
  eram uma nuvem em volta de um ponto por RA, e o calor aparecia sobre cerrado
  e lavoura. Os pontos continuam fictícios.
- **Imagem de perto** (`mapa/ortofoto.ts`): do zoom 12 em diante, o mosaico de
  2021 do DF (50 cm), servido pela IDE/DF. O serviço só entrega blocos prontos
  na projeção do GDF (UTM 23S); o arquivo os reprojeta para a do mapa. Os
  pedidos têm ritmo (até 8 ao mesmo tempo e 50 por segundo), porque o servidor
  é público e recusa tudo por cerca de 1 s depois de uns 200 pedidos num segundo.
- **Câmera** (`mapa/vista.ts`): escolher uma RA enquadra os limites dela, no
  ângulo em que a pessoa já está; o voo comum dura 1,5 s e o do tour, 3,2 s.

## Rodar

Precisa de Node 22.12 ou mais novo.

```bash
npm install
npm run dev        # http://localhost:5200
npm test           # testes do domínio, do gerador, do mapa, dos indicadores e do tour
npm run build      # build estático em dist/
npm run preview    # serve o build em http://localhost:4200
```

O `dist/` é estático e usa caminhos relativos: abre de qualquer pasta de
qualquer servidor de arquivos. Não abre direto do disco (`file://`).

## Sem internet

Três coisas vêm da rede: a imagem de satélite da vista geral (mosaico Sentinel-2
da EOX), a imagem de perto (mosaico de 2021, da IDE/DF) e o desenho da cidade
(água, vias, nomes de vias e prédios, do OpenFreeMap). Sem internet, o mapa abre
com o fundo grafite liso, as RAs e o calor, e o resto continua igual. Fontes,
contornos e dados vão no build. Com rede ruim, a imagem de perto demora ou não
vem, e fica a do Sentinel no lugar.

O navegador guarda os blocos da imagem de perto por 12 horas: passar antes pelo
trajeto da apresentação faz com que ele abra na hora, mesmo com rede lenta.

Para conferir: rode `npm run build && npm run preview`, bloqueie
`tiles.openfreemap.org`, `tiles.maps.eox.at` e `www.geoservicos.ide.df.gov.br`
nas ferramentas do navegador (ou desligue o Wi-Fi) e recarregue. O modo "Offline" das ferramentas não serve, porque bloqueia também
o `localhost`.

O mapa exige WebGL2. Onde não há, a tela mostra um aviso no lugar do mapa.

## Organização

```
src/
  dominio/   modelo único de incidente, ciclo de vida, órgãos, canais e RAs (funções puras)
  dados/     gerador determinístico dos dados simulados e a mancha urbana (mancha.json)
  indicadores/ contas da sala de guerra: filtros, velocidade, séries (funções puras)
  mapa/      MapLibre, estilo do mapa, calor, imagem de perto, câmera e camadas deck.gl (camadas/)
  ui/        painel, selo e cores
  telas/     uma pasta por iteração (sala/: painéis, HUD e tour da I1)
public/dados/  contexto real (escolas, saúde, favelas), servido junto com o build
scripts/     gerar-ras.mjs (contornos das RAs) e gerar-mancha.mjs (mancha urbana)
```

- **Incidente** (`dominio/incidente.ts`): id `INC-2026-000123`, origem, local,
  tipo, área, órgão responsável, situação, severidade, datas e vínculos. O ciclo
  de vida é recebido → em triagem → encaminhado → em atendimento → resolvido →
  encerrado, com as saídas cancelado, falha de envio e reaberto.
- **Gerador** (`dados/gerador.ts`): `gerarBase({ agora })` devolve a contagem
  diária por tipo × RA × dia (180 dias) e os incidentes individuais dos últimos
  30 dias. A mesma semente e o mesmo `agora` dão sempre a mesma cidade, em
  qualquer fuso.
- **Cores** (experimento de direção visual de 12/11/2026, ainda sem registro no
  roadmap): base neutra em grafite, com a cor reservada a uma função. O teal da
  marca marca o que está ativo ou ao vivo; o âmbar, o aviso de demonstração; a
  concentração de chamados usa uma rampa quente de um só matiz. Estão em
  `src/estilos.css` e repetidas em `src/ui/tokens.ts`, porque o mapa não lê
  variáveis CSS. A versão anterior era a direção C (navy, teal, âmbar).

## O que é real e o que é simulado

| Real, com fonte | Simulado |
| --- | --- |
| Limites das 37 RAs (GDF, IDE/DF) | Todos os incidentes, com local, hora, situação e severidade |
| População por RA (Censo 2022), fora 4 RAs sem Censo, marcadas como estimadas | Volumes, prazos e tempos de cada tipo de incidente |
| Nomes e siglas dos 10 órgãos e os canais com `fonte` (Documento Magno) | Pesos de vulnerabilidade e centralidade das RAs |
| Participação dos canais da CEB IPes (magno, seção 8) | Participação dos demais canais e do canal proposto do City View |
| Escolas públicas (INEP, Censo Escolar 2025), via geobr (Ipea) | O ritmo de chegada dos chamados "ao vivo" |
| Unidades públicas de saúde (CNES, 04/2026), via geobr (Ipea) | |
| Favelas e comunidades urbanas (IBGE, Censo 2022), via geobr (Ipea) | |
| Mancha urbana do DF de 2023 (GDF, IDE/DF): diz onde há cidade | Em que ponto da mancha cada chamado cai, e o peso de cada lugar |
| Imagens de satélite (Sentinel-2 de 2016; Maxar de 2021, via IDE/DF) | |

Os pontos no mapa são fictícios. Nenhum incidente tem nome, rosto ou endereço.
O mapa de calor mostra o padrão de uma cidade simulada: os focos caem em bairros
de verdade, mas não dizem nada sobre o que acontece neles.

## Contornos das RAs

`src/dominio/ras-geo.json` é gerado a partir da base oficial da IDE/DF
(`ra_gdf.geojson`, baixada em 07/11/2026; no repositório city-view-demo ela está
em `assets/geo/`, com a URL de origem no README de lá):

```bash
npm run geo -- <caminho do ra_gdf.geojson>
```

Pendente: confirmar os termos de uso dos dados da IDE/DF antes de produção.

## Mancha urbana

`src/dados/mancha.json` diz onde os chamados simulados podem cair. É gerado a
partir da camada "DF Mancha Urbana 2023" da IDE/DF (a ocupação urbana do DF,
traçada sobre imagem de 2023) e dos dados reais de `public/dados/`:

```bash
npm run mancha                        # baixa a camada da IDE/DF
npm run mancha -- <arquivo.geojson>   # usa uma cópia já baixada
```

A cidade é dividida em células de 200 m; só entram as que a mancha cobre. O
peso de cada uma sobe perto de uma escola pública, de uma unidade pública de
saúde ou de uma comunidade, com um ruído suave e fixo por cima. Os pesos são da
simulação; a mancha é dado oficial.

## Origem do código e licenças

- O motor (RAs, catálogo de órgãos, gerador, pontos e o script das RAs) foi
  portado da demo exploratória, repositório `Datasynq-org/City-view`,
  `apps/sala-de-situacao`, commit `12c4502`, e adaptado ao modelo novo de
  incidente. As telas e o visual são novos.
- Os dados reais de `public/dados/` (escolas, saúde, favelas) vêm da mesma demo
  exploratória (`apps/sala-de-situacao/public/dados/`, commit `8104ebb`),
  baixados pelo geobr em 10/11/2026. Citação: Pereira, R. H. M.; Barbosa, R. J.
  et al. geobr. Ipea.
- A I1 se inspira na "Visão da cidade" (modo comando em 3D) e no grafo do Calebe,
  ambos da demo exploratória; o grafo entra na I3. Os modos de visão noturno e
  térmico, que vieram de lá, saíram em 12/11/2026.
- MapLibre GL JS: BSD-3-Clause. deck.gl: MIT. Motion: MIT. Barlow e Barlow Condensed: OFL-1.1.
- Desenho da cidade: OpenFreeMap, com dados © OpenMapTiles e © colaboradores do
  OpenStreetMap.
- Imagem de satélite da vista geral: Sentinel-2 cloudless (https://s2maps.eu)
  por EOX IT Services GmbH, com dados Copernicus Sentinel modificados de 2016,
  sob CC BY 4.0. É o mosaico de 2016 de propósito: os de 2017 em diante são CC
  BY-NC-SA e não permitem uso comercial. A resolução é de 10 m e a imagem não
  mostra o que foi construído depois de 2016.
- Imagem de perto: serviço `Imagens/2021_50CM` da IDE/DF (SEDUH), descrito lá
  como "cobertura de imagem de satélite Maxar Vivid 2021, 50 cm, do Distrito
  Federal". **O serviço não declara licença.** É imagem comercial da Maxar,
  licenciada ao GDF e publicada por ele sem login. Mostrar ao próprio GDF a
  imagem que ele publica é uma coisa; usar num produto é outra, e depende de
  confirmar os termos com a SEDUH (a mesma pendência dos contornos das RAs).
  Para tirar a imagem de perto, basta remover a fonte e a camada `ortofoto` de
  `mapa/estilo.ts`: o mapa segue com o Sentinel.
- Mancha urbana: camada "DF Mancha Urbana 2023" da IDE/DF (SEDUH), mesma
  pendência de termos de uso.
- As atribuições aparecem no canto do mapa e devem continuar lá.

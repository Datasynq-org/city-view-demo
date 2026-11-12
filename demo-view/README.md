# City View · demo

A demo do painel do City View, construída em fatias conforme o roadmap
(CV-DEM-001). Tudo o que aparece é **simulado**: não há API, login nem dado real
de cidadão. O selo "Ambiente de demonstração · dados simulados" fica sempre
visível.

Esta pasta é autocontida: tem o seu próprio `package.json` e não lê nada de
fora dela. Pode ser movida inteira para outro repositório.

## Onde está

**I0 · Fundação** (pronta): o mapa do DF com as 37 regiões administrativas sobre
o fundo navy, o selo, um painel de vidro de exemplo e o gerador de incidentes no
modelo único, com testes.

Ainda não há mapa de calor, indicadores, gráficos nem grafos. Eles entram a
partir da I1 (Sala de guerra), junto com deck.gl, Motion e a biblioteca de
gráficos.

## Rodar

Precisa de Node 22.12 ou mais novo.

```bash
npm install
npm run dev        # http://localhost:5200
npm test           # testes do domínio, do gerador e do estilo do mapa
npm run build      # build estático em dist/
npm run preview    # serve o build em http://localhost:4200
```

O `dist/` é estático e usa caminhos relativos: abre de qualquer pasta de
qualquer servidor de arquivos. Não abre direto do disco (`file://`).

## Sem internet

Só o desenho da cidade (água, verde e vias) vem da rede, do OpenFreeMap. Sem
internet, o mapa abre com o fundo navy liso e as RAs, e o resto continua igual.
Fontes, contornos e dados vão no build.

Para conferir: rode `npm run build && npm run preview`, bloqueie
`tiles.openfreemap.org` nas ferramentas do navegador (ou desligue o Wi-Fi) e
recarregue. O modo "Offline" das ferramentas não serve, porque bloqueia também
o `localhost`.

O mapa exige WebGL2. Onde não há, a tela mostra um aviso no lugar do mapa.

## Organização

```
src/
  dominio/   modelo único de incidente, ciclo de vida, órgãos, canais e RAs (funções puras)
  dados/     gerador determinístico dos dados simulados
  mapa/      MapLibre, estilo do mapa e a queda sem rede
  ui/        painel de vidro, selo e cores
  telas/     uma pasta por iteração
scripts/     gerar-ras.mjs: regenera os contornos das RAs
```

- **Incidente** (`dominio/incidente.ts`): id `INC-2026-000123`, origem, local,
  tipo, área, órgão responsável, situação, severidade, datas e vínculos. O ciclo
  de vida é recebido → em triagem → encaminhado → em atendimento → resolvido →
  encerrado, com as saídas cancelado, falha de envio e reaberto.
- **Gerador** (`dados/gerador.ts`): `gerarBase({ agora })` devolve a contagem
  diária por tipo × RA × dia (180 dias) e os incidentes individuais dos últimos
  30 dias. A mesma semente e o mesmo `agora` dão sempre a mesma cidade, em
  qualquer fuso.
- **Cores**: direção C (navy, teal, âmbar). Estão em `src/estilos.css` e
  repetidas em `src/ui/tokens.ts`, porque o mapa não lê variáveis CSS.

## O que é real e o que é simulado

| Real, com fonte | Simulado |
| --- | --- |
| Limites das 37 RAs (GDF, IDE/DF) | Todos os incidentes, com local, hora, situação e severidade |
| População por RA (Censo 2022), fora 4 RAs sem Censo, marcadas como estimadas | Volumes, prazos e tempos de cada tipo de incidente |
| Nomes e siglas dos 10 órgãos e os canais com `fonte` (Documento Magno) | Pesos de vulnerabilidade e centralidade das RAs |
| Participação dos canais da CEB IPes (magno, seção 8) | Participação dos demais canais e do canal proposto do City View |

Os pontos no mapa são fictícios. Nenhum incidente tem nome, rosto ou endereço.

## Contornos das RAs

`src/dominio/ras-geo.json` é gerado a partir da base oficial da IDE/DF
(`ra_gdf.geojson`, baixada em 07/11/2026; no repositório city-view-demo ela está
em `assets/geo/`, com a URL de origem no README de lá):

```bash
npm run geo -- <caminho do ra_gdf.geojson>
```

Pendente: confirmar os termos de uso dos dados da IDE/DF antes de produção.

## Origem do código e licenças

- O motor (RAs, catálogo de órgãos, gerador, pontos e o script das RAs) foi
  portado da demo exploratória, repositório `Datasynq-org/City-view`,
  `apps/sala-de-situacao`, commit `12c4502`, e adaptado ao modelo novo de
  incidente. As telas e o visual são novos.
- MapLibre GL JS: BSD-3-Clause. Barlow e Barlow Condensed: OFL-1.1.
- Mapa de fundo: OpenFreeMap, com dados © OpenMapTiles e © colaboradores do
  OpenStreetMap. A atribuição aparece no canto do mapa e deve continuar lá.

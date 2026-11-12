# CV-DEM-001 · Roadmap da demo

| Campo | Valor |
| --- | --- |
| Código | CV-DEM-001 |
| Versão | 0.2 (12/11/2026), para revisão da equipe. Muda a pasta para `demo-view/` e registra a I0 construída. A 0.1 é de 11/11/2026 |
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
| Mapa | MapLibre GL JS + deck.gl (`@deck.gl/maplibre`, modo intercalado) | deck.gl dá hexágonos 3D, mancha de calor, arcos entre órgãos e animação de trajetos sobre o MapLibre. É a integração recomendada para MapLibre 5/6 |
| Fundo do mapa | OpenFreeMap (sem chave, sem limite de uso), estilo recolorido para o navy da direção C; queda para fundo liso sem rede | Resolve o limite de uso gratuito da CARTO, que a demo antiga usava |
| Animação | Motion (React) para microanimações e transições | Leve e declarativo |
| Visual | Painéis de vidro (backdrop-blur) sobre o mapa, tokens da direção C (navy, teal, âmbar) | A estética escolhida para o deck, levada para a tela |
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

---

## 9. Construção da demo (andamento)

*Acréscimo de 12/11/2026.* A partir daqui a demo é construída passo a passo,
seguindo as iterações da seção 6. Esta seção concentra o andamento; o resto do
documento continua sendo o plano.

### 9.1 Área isolada

*Revisto em 12/11/2026, ao juntar o trabalho do Lucca (decisão da equipe).*

- **A demo é a `demo-view/`:** autocontida (pacote, build, porta 5200 e README próprios; não lê nada de fora). Visual próprio na direção C (navy, teal, âmbar, Barlow condensada). A demo não mexe em `apresentacao-web/`, `apresentacao/`, `design-system/` nem `demo/`; em `docs/`, só nesta seção.
- **A `demo/` é a vitrine do design system** "Sala de Operações" ([CV-DS-001](CV-DS-001-design-system.md)), que vale para a apresentação em rolagem. Ela não recebe as iterações da demo.
- **Uma iteração por vez:** cada uma ganha uma branch própria (`demo/iN-<nome>`), um plano curto antes de começar e uma revisão com a equipe antes de entrar no `main`. A próxima só começa depois disso.

### 9.2 Situação das iterações

| It. | Situação | Data | O que entrou |
| --- | --- | --- | --- |
| I0 · fundação | Construída (Lucca), **aguardando revisão** | 12/11/2026 | `demo-view/`: modelo único de incidente com ciclo de vida e validação; 10 órgãos e 24 tipos com fonte no magno; 37 RAs; gerador portado (contagens de 180 dias e incidentes dos últimos 30), com testes (50); mapa MapLibre com as RAs; selo e painel de exemplo. Pontos para a revisão: transições entre situações e percentuais simulados (ver a "Situação em 12/11/2026" na seção 6) |
| I1 · sala de guerra | **Próxima** | — | Seção 6 |
| I2 a I6 | A fazer | — | Seção 6 |

A casca visual feita em `demo/` no mesmo dia (barra, navegação, painel da sala, catálogo) fica como vitrine do design system e como referência de interface para a I1, sem código copiado.

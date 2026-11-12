# CV-DS-001 · Design system "Sala de Operações"

| Campo | Valor |
| --- | --- |
| Código | CV-DS-001 |
| Versão | 0.1 (12/11/2026) |
| O que é | O mapeamento da estética da apresentação em rolagem como design system: princípios, tokens, tipografia, layout, componentes, mapa e dados, movimento e acessibilidade |
| Onde está o código | `design-system/` (pacote compartilhado). Usado por `apresentacao-web/` e `demo/` pelo atalho `@ds` |
| Catálogo vivo | A demo com `?catalogo` (`demo/src/catalogo/Catalogo.tsx`): tokens e componentes lado a lado nos dois temas |
| Origem | A estética da página de rolagem aprovada pela equipe; inspirações registradas no magno 7.5 (Sala de Operações) e no CV-DEM-001 |

## 1. Princípios

1. **A cidade à noite, vista de uma sala de operações.** O mapa do DF é o fundo; o conteúdo flutua sobre ele em vidro.
2. **Cor só para sinais.** Áreas, situação e alertas têm cor; o resto é tinta e vidro. A cor nunca vem sozinha: sempre com o nome ao lado (legenda, rótulo, texto).
3. **Leituras em mono.** Rótulos, números de painel, filtros e situações usam a fonte mono, em caixa alta e espaçada.
4. **A cidade e a gestão, nunca pessoas.** Nada de rosto, nome ou endereço de cidadão. Segurança aparece agregada.
5. **Simulado sempre rotulado.** Todo número, ponto ou caso que não é real leva selo ("Ilustrativo", "Demonstração · dados simulados") com a mesma cor nos dois temas.
6. **Uma ideia por tela.** Pouco texto, um título que diz a mensagem e o resto como apoio.
7. **Composição fixa.** Tudo escala com a tela; ninguém precisa dar zoom no navegador.

## 2. Tokens

Arquivo: `design-system/src/tokens.css`. Dois temas com os mesmos papéis, escolhidos por `data-tema="escuro|claro"` em qualquer elemento (o catálogo usa isso para mostrar os dois lado a lado).

### 2.1 Superfícies e tinta

| Token | Escuro | Claro | Uso |
| --- | --- | --- | --- |
| `--fundo` | `#05080d` | `#f3f5f8` | Fundo da página e do mapa |
| `--painel` | `rgba(10,16,28,.55)` | `rgba(255,255,255,.62)` | Vidro dos painéis |
| `--painel-borda` | branco 12% | tinta 10% | Borda do vidro, divisórias |
| `--caixa` / `--caixa-borda` | branco 4% / 16% | branco 75% / tinta 16% | Caixas de diagrama, chips, botões neutros |
| `--destaque` | acento 12% | acento 8% | Item ativo, caixa em destaque |
| `--tinta` | `#eaf0ff` | `#0b1220` | Texto principal |
| `--tinta-2` | `#94a3bd` | `#4b5a70` | Texto de apoio (`.fraco`) |
| `--acento` | `#7dd3fc` | `#0369a1` | Rótulos, botão principal, foco, linhas do diagrama |
| `--sobre-acento` | `#05080d` | `#ffffff` | Texto sobre o acento |
| `--brilho-1`, `--brilho-2` | ciano e violeta suaves | idem, mais claros | Brilho radial do fundo |

### 2.2 Sinais

| Token | Escuro | Claro | Uso |
| --- | --- | --- | --- |
| `--ok` | `#34d399` | `#047857` | Em uso, resolvido, integrado |
| `--atencao` | `#fbbf24` | `#b45309` | Pronto, em resolução, tipo de insight, alerta leve |
| `--alerta` | `#f87171` | `#b91c1c` | Aberto, título de alertas |
| `--selo-fundo` / `--selo-tinta` | `#fbbf24` / `#1c1405` | iguais | Selo de simulado/ilustrativo (igual nos dois temas) |

### 2.3 Áreas e situação (dados)

Ordem fixa, usada pelo canvas, pelo MapLibre e pelas legendas:

| Índice | Área | Escuro | Claro |
| --- | --- | --- | --- |
| `--area-0` | Ouvidoria | `#94a3b8` | `#64748b` |
| `--area-1` | Segurança | `#f87171` | `#dc2626` |
| `--area-2` | Iluminação | `#fbbf24` | `#d97706` |
| `--area-3` | Vias | `#a78bfa` | `#7c3aed` |
| `--area-4` | Água e esgoto | `#38bdf8` | `#0284c7` |
| `--area-5` | Limpeza urbana | `#34d399` | `#059669` |
| `--area-6` | Energia | `#fb923c` | `#ea580c` |
| `--status-0` / `-1` / `-2` | resolvido / em resolução / aberto | verde / âmbar / vermelho | idem, mais profundos |

### 2.4 Mapa

`--mapa-traco` (contorno das RAs), `--conexao` (linhas entre chamados), `--anel` (anel do incidente em foco), `--calor-modo` (`lighter` no escuro, `source-over` no claro, para o mapa de calor).

### 2.5 Forma e tempo

`--raio-painel` 18px · `--raio-botao` 10px · `--raio-selo` 6px · `--vidro` `blur(18px) saturate(140%)` · `--dur-rapida` 0,2s · `--dur` 0,4s.

## 3. Tipografia

| Papel | Família | Uso |
| --- | --- | --- |
| Títulos (`.titulo`) | Geist, 600, espaçamento −0,025em, entrelinha 1,04 | Mensagem da tela, nomes de painel, números |
| Corpo | Geist | Texto corrido; apoio em `.fraco` |
| Leituras (`.rotulo`) | Geist Mono, caixa alta, espaçamento 0,12em, 0,75rem | Cabeçalhos de seção, KPIs, filtros, situações |

Escala em uso (rem): abertura 7,5 · título de cena 3–3,75 · título de painel 2–2,25 · número de KPI 1,875 · corpo 1–1,25 · rótulo 0,75 · pequeno 0,65–0,75.

## 4. Layout e escala

- **Fonte base proporcional:** `html { font-size: max(9px, min(1vw, 1.7778vh)) }`: 16px numa tela de 1600×900. Como tudo é em rem, a composição é a mesma em qualquer monitor (verificado em 1280×720, 1366×768, 1600×900, 1920×1080 e 2560×1080).
- **Palco 16:9 (apresentação):** `.palco` centralizado, largura `min(100vw, 177,78vh)`, margem lateral 4rem; coluna de texto `.coluna` de 30rem à esquerda; mapa à direita.
- **Casca de aplicativo (demo):** o mapa ocupa a tela inteira; por cima, em vidro: barra superior (largura total), navegação à esquerda (15rem) e painel lateral à direita (27rem), com 1rem de espaço e 1,25rem de margem.

## 5. Componentes

Código em `design-system/src/componentes/`; importar de `@ds`.

| Componente | Quando usar | Não fazer |
| --- | --- | --- |
| `Painel` | Todo conteúdo por cima do mapa | Painel dentro de painel com o mesmo vidro (use `Caixa`/borda) |
| `Rotulo` | Cabeçalho de seção, leitura | Frases longas em rótulo |
| `Selo` | Simulado, ilustrativo, demonstração | Usar para outra coisa que não seja aviso |
| `Chip` | Evidência, filtro aplicado, sistema | Como botão |
| `Botao` (`principal`) | Ações; uma principal por grupo | Dois principais lado a lado |
| `Pilula` (`ok`/`atencao`/`neutro`) | Situação de algo: em uso, pronta, proposta, exemplo | Situação de chamado (use texto colorido da `LinhaDeIncidente`) |
| `Kpi` | Número de painel com rótulo | Número sem período ou sem selo de simulado quando for simulado |
| `Alerta` | Lista curta de alertas | Mais de 4 itens |
| `Legenda` | Toda vez que a cor carrega significado | Omitir a legenda |
| `Segmentado` | Filtros curtos (período, área) | Mais de 4 opções |
| `CartaoInsight` | Sugestão da IA: o que viu, por quê, confiança, sugestão, decisão humana | Sugestão sem evidência ou sem "uma pessoa confirma" |
| `BarraSuperior` | Topo do aplicativo: marca, contexto, selo, tema | Navegação dentro da barra |
| `Navegacao` | Troca de telas; "em breve" desabilitado e rotulado | Esconder telas futuras sem avisar |
| `PainelLateral` | Conteúdo da tela, com rolagem própria e rodapé de fonte | Conteúdo sem rodapé quando há dado simulado |
| `LinhaDeIncidente` | Item de lista: área (cor + nome), título, RA, situação, quando | Mostrar dado pessoal |
| `TrocaTema` | Alternar tema (tecla T) | — |

Para canvas e WebGL: `lerPaleta()` lê os tokens do tema ativo; `aoMudarTema()` avisa quando relê-los.

## 6. Mapa e dados

- **Base:** limites oficiais das RAs (IDE/DF), `assets/geo/`. Contorno em `--mapa-traco`; preenchimento quase transparente; RA sob o mouse em `--acento` a 16%.
- **Pontos:** cor por área, borda na cor do fundo, sempre com legenda. Pontos de exemplo sempre rotulados como simulados.
- **Mapa de calor:** só onde há concentração; azul → âmbar → vermelho.
- **Sem dependência de rede:** o mapa da demo não usa tiles externos (funciona offline). O fundo de ruas (OpenFreeMap) fica para quando for necessário, recolorido pelos tokens.

## 7. Movimento

- Na apresentação, o movimento acompanha a rolagem (GSAP ScrollTrigger + Lenis); na demo, transições curtas (`--dur-rapida`).
- Um movimento por vez; nada pisca sem motivo (o "pulsar" dos pontos indica chamados vivos).
- Com `prefers-reduced-motion`, tudo fica estático e o conteúdo segue em sequência.

## 8. Acessibilidade

- Contraste medido (WCAG): no escuro, todos os pares de texto ≥ 7:1; no claro, `--tinta` 17:1, `--tinta-2` 6,4:1, `--acento` 5,4:1, `--ok` 5,0:1, `--atencao` 4,6:1, `--alerta` 5,9:1; selo 10,9:1. Em 12/11/2026, `--ok` e `--alerta` do tema claro foram escurecidos para passar de 4,5:1.
- Cor nunca sozinha: legenda, rótulo ou texto ao lado.
- Foco visível em todo elemento interativo (`:focus-visible` no acento).
- Estados por atributos acessíveis: `aria-current` (tela atual), `aria-pressed` (segmentado), `aria-disabled` (em breve).

## 9. Como usar num app novo

1. No `vite.config.ts`: alias `@ds` → `../design-system/src` e `resolve.dedupe: ['react', 'react-dom']`.
2. No `tsconfig.json`: `paths` para `@ds` e para `react` (ver `demo/tsconfig.json`), e `include` com `../design-system/src`.
3. No CSS do app: `@import "tailwindcss" source(".")`, `@source "../../design-system/src"`, depois `tokens.css` e `base.css`.
4. Fontes: `@fontsource-variable/geist` e `@fontsource-variable/geist-mono` no `main.tsx`; `aplicarTema(temaInicial())` antes de renderizar.

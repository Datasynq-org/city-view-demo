# CV-VID-001 · Roteiro do vídeo "A cidade conectada"

| Campo | Valor |
| --- | --- |
| Código | CV-VID-001 |
| Versão | r2 (12/11/2026), para revisão da equipe. É o **portão 0** do [framework de vídeo](CV-REF-003-framework-de-video.md). Substitui a r1 ([seção 10](#10-histórico-de-versões)) |
| O que é | O filme que **abre a reunião**: 1min10s, 16:9, sem locução. Vende a sensação; o detalhe fica no [deck](CV-APR-001-roteiro-da-apresentacao.md) e na fala do Daniel |
| Ideia | O DF é uma cidade feita de muitas cidades, e cada órgão vê só a sua parte. Quando os sinais se conectam, a rede descobre o que nenhum sistema via sozinho, e o cidadão acompanha até resolver |
| Fontes | [Magno](CV-SPEC-000-documento-magno.md) (1, 4.2 a 4.7, 5.1, 5.2, 7.2, 7.6, 8) · [Conversa](fonte/CV-ATA-001-conversa-daniel-2026-11-10.md) |
| Projeto | Pasta `video/` deste repositório |

## 1. O que o filme precisa deixar na cabeça

Quatro ideias, na ordem, e nada além delas:

1. **O DF inteiro**, não só o Plano Piloto: todas as regiões com o mesmo peso.
2. **O problema é estrutural, não da gestão:** cada órgão vê a sua parte e
   ninguém vê o todo (a analogia do banco lento, magno 5.1).
3. **O City View conecta sem substituir** e produz informação nova: classifica,
   agrupa, reclassifica, com uma pessoa decidindo (magno 4.2, 4.5, 7.2).
4. **O cidadão fala onde quiser e acompanha até resolver** — "amigável e
   rastreável", a frase da conversa (magno 1, 4.3, 4.4). A governadora vê a
   cidade e a velocidade da gestão (magno 4.6).

**Fica fora do filme e vai para o deck:** a prova de Águas Claras (slide 16, onde
o Daniel explica os 46%), a previsão (magno 9.9, ainda em aberto), a arquitetura
em camadas (slide 10), a segurança pública como caso.

## 2. A gramática do grafo

| Elemento | Forma | Significa |
| --- | --- | --- |
| **Sinal** | Ponto pequeno teal que acende | Um relato, de qualquer canal |
| **Lugar** | Polígono da RA, linha fina | Limites oficiais (IDE/DF) |
| **Aresta** | Linha que se desenha entre sinais | Uma relação: *mesmo trecho*, *mesmo fato*, *mesma causa* |
| **Incidente** | Nó maior, branco | Vários sinais fundidos num só fato |
| **Pulso** | Luz correndo pela aresta | A inteligência trabalhando |
| **Insight** | Nó **âmbar** que nasce de outros | Informação nova, que não existia em nenhum silo |

O grafo mostra **relações**; o pulso e o nó âmbar são o lado "neural", o
momento em que a rede pensa. Regras:
- **Nenhum nó é uma pessoa** e nenhum lugar é um endereço (magno 7.6).
- **Âmbar só para o que é novo:** aparece uma vez, no P13.
- **Todas as RAs com o mesmo peso visual.** Nenhum monumento como protagonista.

A estética de plataforma de inteligência (HUD fino, rótulos em mono, densidade)
é referência interna. Nenhum nome de referência aparece no material (magno 7.6).

## 3. Arco

| Ato | Tempo | O que o espectador sente |
| --- | --- | --- |
| 1 · O DF | 0:00–0:10 | Escala e pertencimento: muitas cidades, uma só |
| 2 · Os silos | 0:10–0:24 | Incômodo, sem culpa: o sistema é que não conversa |
| 3 · A virada | 0:24–0:31 | Alívio e grandeza: a rede se forma |
| 4 · Um caso | 0:31–0:54 | Entendimento: o cidadão fala, a rede descobre, o órgão resolve, o cidadão vê |
| 5 · A promessa | 0:54–1:10 | Poder: a cidade inteira e a velocidade da gestão |

## 4. Plano a plano

**Legenda:** **[IA]** placa gerada no Higgsfield · **[V]** vetor no Remotion ·
`RÓTULO` em mono caixa alta · *Título* palavra a palavra.

**Selo fixo** no canto inferior esquerdo, o filme inteiro:
`PROPOSTA · CENÁRIO ILUSTRATIVO`. Só dois números reais aparecem, cada um com a
fonte curta no rodapé; a referência completa está no cartão final.

### Ato 1 · O DF

| # | Tempo | Imagem | Texto na tela | Som |
| --- | --- | --- | --- | --- |
| P01 | 0:00–0:02,5 | [V] Preto. Um ponto teal pulsa no centro, como batimento | — | Sub grave, um pulso |
| P02 | 0:02,5–0:06 | [IA SF02] Altíssima altitude, noite: vários núcleos urbanos de luz espalhados pelo planalto, separados por cerrado escuro; câmera descendo. **Corte escondido:** o ponto de P01 é uma dessas luzes | — | Pad cresce |
| P03 | 0:06–0:10 | [V] Cada núcleo de luz vira o polígono da sua RA; todas se desenham ao mesmo tempo, sem centro | `DISTRITO FEDERAL · 2.817.381 PESSOAS` · rodapé: *IBGE, Censo 2022* · *Uma cidade feita de muitas cidades.* | Um tique por RA, em cascata |

### Ato 2 · Os silos

| # | Tempo | Imagem | Texto na tela | Som |
| --- | --- | --- | --- | --- |
| P04 | 0:10–0:14 | [V] Sinais acendem por todas as RAs, de forma equilibrada, cada vez mais rápido | `900 A 1.000 MANIFESTAÇÕES POR DIA · SÓ NA OUVIDORIA` · rodapé: *Jornal de Brasília, 2024* · *Todo dia, a cidade fala.* | Tiques de dados acelerando |
| P05 | 0:14–0:17,5 | [V] Os sinais são puxados para colunas verticais, uma por área; cada coluna ganha `● OK` | `ÁGUA E ESGOTO` `ENERGIA` `ILUMINAÇÃO` `VIAS` `LIMPEZA URBANA` `SEGURANÇA` · *Cada órgão vê a sua parte.* | Ritmo mecânico, cada coluna isolada |
| P06 | 0:17,5–0:20,5 | [V] A câmera recua. Nos vãos entre as colunas, pontos que nenhuma coluna pegou ficam piscando | *Ninguém vê o todo.* | Dissonância leve |
| P07 | 0:20,5–0:24 | [V] Segura o quadro, as colunas imóveis | *Não por falta de esforço.* *Por falta de conexão.* | **Corte seco.** Silêncio |

### Ato 3 · A virada

| # | Tempo | Imagem | Texto na tela | Som |
| --- | --- | --- | --- | --- |
| P08 | 0:24–0:26,5 | [V] No silêncio, uma única aresta teal atravessa duas colunas: liga um sinal de **energia** a um de **iluminação** (planta o caso do ato 4) | — | Um clique sináptico |
| P09 | 0:26,5–0:31 | [V] As colunas desabam; os sinais voltam ao mapa e centenas de arestas se desenham; pulsos correm pela rede, que cobre o DF inteiro | **CITY VIEW** · *Observabilidade da gestão da cidade.* | **Drop da trilha** |

### Ato 4 · Um caso: o apagão

Cenário **ilustrativo**, sem RA nomeada. Parte de um fato real: no DF, a
energia é da Neoenergia Brasília e a iluminação pública é da CEB IPes (magno
5.2). Quando um bairro fica no escuro, o cidadão não sabe para quem ligar e
cada órgão recebe só um pedaço do problema. O caso mostra numa linha só o que a
conversa pede: canal amigável, agrupar, cruzar áreas, entregar no legado de
cada órgão, acompanhar até resolver. Na linguagem do filme, em que a cidade é
feita de luzes, é o momento em que uma parte dela **se apaga**.

| # | Tempo | Imagem | Texto na tela | Som |
| --- | --- | --- | --- | --- |
| P10 | 0:31–0:34 | [IA SF10] Do alto, à noite: um bairro residencial inteiro no escuro, cercado de quadras acesas; a câmera desce. Antes, zoom vetorial do mapa até o ponto, e os sinais daquela área se apagam | `19:42 · UM BAIRRO DO DF` | A trilha cai; zumbido elétrico que morre |
| P11 | 0:34–0:38 | [V] Uma conversa de mensagens, sem nome nem foto: *"Acabou a luz aqui. Os postes da rua também apagaram."* → *"Recebido. Protocolo CV-004812. Avisamos você a cada passo."* Ao lado, os canais | `WHATSAPP · APP · SITE · TELEFONE` · *O cidadão fala onde quiser.* | Toque de mensagem |
| P12 | 0:38–0:41,5 | [V] No mapa, relatos de falta de energia acendem às dezenas na área escura; as arestas convergem num nó branco | `140 RELATOS · ENERGIA → 1 INCIDENTE` | Cada relato um tique; a fusão, um tom |
| P13 | 0:41,5–0:47 | [V] Na mesma área, relatos de outras áreas acendem: `POSTES APAGADOS · ILUMINAÇÃO`, `SEMÁFOROS APAGADOS · TRÂNSITO`. Arestas cruzam as três áreas, o pulso corre e **nasce o nó âmbar**. Cartão: *por quê:* mesma área, mesmos 10 minutos, três áreas · *confiança:* alta · *sugestão:* energia trata a causa; iluminação não desloca equipe; trânsito vai aos cruzamentos · `UMA PESSOA DECIDE` | `1 FALHA · 3 ÓRGÃOS` · *Parecem três problemas.* *É um só.* | Três notas que viram um acorde |
| P14 | 0:47–0:50,5 | [IA SF14] Rente ao chão: um cruzamento largo no escuro, o semáforo apagado em primeiro plano, faróis cruzando devagar. Por cima, [V] o incidente se divide e entra em três blocos: `SISTEMA DE ENERGIA` `SISTEMA DE ILUMINAÇÃO` `SISTEMA DE TRÂNSITO` | *Cada órgão recebe no seu próprio sistema.* | Buzina distante, abafada |
| P15 | 0:50,5–0:54 | [V] De volta à conversa: o status desce em degraus `ENCAMINHADO → EM ATENDIMENTO → RESOLVIDO`. O bairro **reacende** no mapa, ponto a ponto | *E o cidadão acompanha até resolver.* | A trilha volta; notas ascendentes |

### Ato 5 · A promessa

Selo extra durante o ato: `DEMONSTRAÇÃO · DADOS SIMULADOS`.

| # | Tempo | Imagem | Texto na tela | Som |
| --- | --- | --- | --- | --- |
| P16 | 0:54–0:57,5 | [V] Zoom out: o DF inteiro como mapa de calor, com o HUD da sala de situação | `TEMPO ATÉ RESOLVER` `NO PRAZO` `INCIDENTES AGRUPADOS` · *A governadora vê a cidade inteira.* | Trilha inteira |
| P17 | 0:57,5–1:00 | [V] O mapa filtra em sequência: água e esgoto → iluminação → vias | *Cada gestor, a sua área.* | Um corte por filtro |
| P18 | 1:00–1:03 | [V] A visão pública: pontos resolvidos ficam verdes, espalhados por todas as RAs | *O cidadão, o que o governo entrega.* | Notas ascendentes |
| P19 | 1:03–1:07 | [IA SF19] Aérea noturna do DF inteiro, câmera subindo; por cima, a rede pulsa em sincronia com as luzes | *Ver a cidade inteira.* *E a velocidade da gestão.* | Crescendo |
| P20 | 1:07–1:10 | [V] A rede se recolhe no ponto teal de P01, que se abre no nome escrito (o City View ainda não tem logo) | **CITY VIEW** · *Observabilidade da gestão da cidade.* · DataSynq | Parada seca e batida grave |

**Cartão final** (4s, depois do filme; pode ser cortado na exibição): fontes
completas dos dois números e o aviso "Proposta. Cenário e dados ilustrativos.
Nenhuma integração com órgãos do GDF existe hoje."

## 5. Direção visual

| Elemento | Valor |
| --- | --- |
| Fundos | Navy da direção C: `#0B1E31`, `#12293F`; linhas `#1E3852` (`apresentacao/src/tema.js`) |
| Sinal e rede | Teal `#0196B2` e `#38C3DB` |
| Insight | Âmbar `#F2A93B`, uma vez só (P13) |
| Resolvido | Verde `#3BE08F`, só em P18; em P15 o "resolvido" é o bairro reacendendo |
| Texto | `#C9D6E2` sobre escuro; títulos em branco |
| Tipografia | Títulos: Bahnschrift SemiBold (ou Barlow, OFL); rótulos: IBM Plex Mono em caixa alta (`apresentacao/fonts/`) |
| HUD | Linhas de 1px, cantos de mira, coordenadas em mono; grade só nos zooms |
| Ritmo | 2,5 a 5,5s por plano, um movimento de câmera por plano, títulos a uma palavra a cada 10 quadros (CV-REF-003) |

**Reuso:** a apresentação web (`apresentacao-web/`) já tem o mapa das RAs
simplificado com pontos ilustrativos (`src/mapa/ras.json`) e cenas de silos e
virada. A geometria e os dados podem ser portados para o Remotion em vez de
refeitos.

## 6. Matéria gerada (portão 1)

### Bíblia de material

Sufixo de todos os quadros:

> Night cinematography of a sprawling, polycentric city on a high savanna
> plateau. Deep navy night (#0B1E31), warm sodium and cool LED street lights,
> thin dry-season haze. Long lens, slow and steady camera. Restrained,
> low-saturation grade; the only accent is a cool teal light (#38C3DB).
> Photographic, 35mm film grain, premium documentary film still. No lettering,
> no signs, no logos, no screens, no landmarks, no people, no faces. Vehicles
> only as light trails. No glow, no bloom, no lens flare.

### Quadros

| Quadro | Assunto | Cuidado |
| --- | --- | --- |
| SF02 | Vários núcleos urbanos de luz no planalto, separados por cerrado escuro, vistos de muito alto | O formato exato vem do vetor em P03; aqui importa a sensação de "muitas cidades" |
| SF10 | Bairro residencial de casas baixas à noite, visto do alto em ângulo: uma área inteira no escuro, cercada de quadras acesas | A fronteira entre escuro e aceso precisa ser nítida; sem pessoas nas lajes |
| SF14 | Cruzamento largo no escuro, semáforo apagado em primeiro plano, faróis em rastro | Semáforo sem texto nem placa; nada que pareça acidente |
| SF19 | O DF inteiro à noite, câmera subindo | Fecha o filme: duas variantes no mínimo |

Para o movimento, preferir ações simples com física óbvia (CV-REF-003, seção
9): a câmera desce, os faróis passam, a câmera sobe. O apagar e o reacender do
bairro são feitos no Remotion (máscara e brilho sobre a placa), não pela IA.

### Custo estimado

| Item | Conta | Créditos |
| --- | --- | --- |
| Quadros | 4 × 2 variantes × 2,75 | ~22 |
| Clipes Kling 3.0 | 4 × 8,75, mais ~50% de refação | ~53 |
| Trilha | 3 variantes × ~2 | ~6 |
| Efeitos | ~12 × ~1 | ~12 |
| **Total** | | **~95** |

Conferir cada lote com `hf generate cost` e gerar só com OK.

O custo maior é o trabalho vetorial: 16 de 20 planos. Estimativa da equipe a
fazer antes do portão 2 (animatic).

## 7. Som

- **Trilha** (Sonilo): híbrida, orquestral com eletrônica, um pulso grave de
  batimento do começo ao fim. Ato 2 mecânico e contido; silêncio seco em 0:24;
  drop em 0:26,5; o caso com a trilha baixa, deixando os efeitos falarem; volta
  inteira em 0:54; parada seca em 1:10. Três variantes, escolhidas pela energia
  medida (CV-REF-003, seção 8).
- **Efeitos** (Seed Audio): tique de dado, clique sináptico, fusão em tom
  único, toque de mensagem, zumbido elétrico que morre, buzina distante,
  batida final.
- **Sem locução.** O filme abre a reunião e o Daniel fala depois.

## 8. Lugar na reunião

O filme roda **antes do slide 1** do deck. Como ele já cobre a sensação do
problema (silos) e da proposta, a parte 1 do deck (slides 3 a 8) pode ficar
mais curta; isso é decisão do deck, não deste roteiro.

## 9. Checagem

| Regra | Como o roteiro cumpre |
| --- | --- |
| Número real só com fonte (magno 8) | Dois números, cada um com fonte no rodapé e completa no cartão final |
| Cenário inventado rotulado | Selo fixo `PROPOSTA · CENÁRIO ILUSTRATIVO`; `DADOS SIMULADOS` no ato 5; protocolo e conversa fictícios |
| A cidade e a gestão, nunca pessoas (magno 7.6) | Nenhum nó é pessoa; conversa sem nome nem foto; nenhuma RA nomeada no caso; IA sem pessoas |
| Sem cara de vigilância | Nenhum caso de segurança; sem previsão; a polícia aparece como uma das fontes de demanda, uma coluna entre seis |
| O DF inteiro | Abre com muitos núcleos, todas as RAs com o mesmo peso, sem monumentos |
| Problema estrutural, não da gestão | "Não por falta de esforço. Por falta de conexão." |
| Acoplação, não substituição (magno 4.2) | P14: "Cada órgão recebe no seu próprio sistema." |
| Amigável e rastreável (magno 1, 4.3, 4.4) | P11 e P15: canal à escolha e acompanhamento até resolver |
| Uma pessoa decide (magno 7.2) | Cartão do P13 |
| Palavras a evitar (magno 7.6) | Nenhum nome de referência no material; "Governo Federal" não aparece |
| Nada parece contratado (magno 3) | Selo permanente e aviso no cartão final |

### Respostas da equipe (12/11/2026)

| # | Pergunta | Resposta |
| --- | --- | --- |
| 1 | O City View tem logo? | Ainda não. O filme fecha com "CITY VIEW" escrito |
| 2 | A polícia só como coluna? | Sim: a polícia é uma das fontes de coleta de demanda |
| 3 | Onde fica o projeto do vídeo? | Na pasta `video/` |
| 4 | O caso do buraco | Trocar por um caso mais impactante, simulado, que faça sentido no DF: virou o apagão (ato 4) |

## 9.2 Produção da primeira montagem (12/11/2026)

A primeira montagem está em `video/entregas/CityView_filme_16x9_r1.mp4`
(1min15s com o cartão de fontes, 1080p). Ela segue este roteiro, com quatro
diferenças impostas pelo saldo de 10 créditos da conta do Higgsfield:

| Roteiro | Montagem | Por quê |
| --- | --- | --- |
| 4 planos gerados (SF02, SF10, SF14, SF19), com quadros de referência | **1 clipe aéreo de 3 s**, texto direto para vídeo, usado descendo em P02 e invertido em P19 | Custo: 4,5 créditos |
| SF10, o bairro no escuro visto do alto | Feito no vetor: a malha de luzes do bairro se apaga e reacende no mapa | Sem crédito para o clipe |
| SF14, o cruzamento com o semáforo apagado | Fica só a entrega aos três sistemas, em vetor | Sem crédito para o clipe |
| Trilha no Sonilo, 3 variantes; efeitos no Seed Audio | Trilha única no ElevenLabs Music v2 (4,8 créditos), editada em compasso; efeitos sintetizados em `video/scripts/som.py` | O Sonilo não está liberado para uso avulso nesta conta |

Mudanças de tempo: a trilha volta inteira em 0:52,9, quando o bairro reacende
(e não em 0:54), porque é onde o compasso da música cai; a parada seca é em
1:08,4, quando o nome aparece; o cartão final entra em 1:11.

Gasto: 9,3 créditos. Não houve refação. O som foi conferido por medição
(−16 LUFS, cortes nos tempos previstos), não por escuta.

## 10. Histórico de versões

| Versão | Data | O que mudou |
| --- | --- | --- |
| r0 | 11/11/2026 | 1min50s, 7 atos, 28 planos, três casos (som alto em Ceilândia, iluminação × furto × insegurança em Samambaia, alagamento previsto em Vicente Pires), visões e prova de Águas Claras |
| r1 | 12/11/2026 | Reescrita a partir da crítica da equipe à r0. **Papel:** filme de abertura, que vende a sensação; o detalhe fica no deck. **Duração:** 1min10s, 20 planos. **Saiu:** os casos de segurança e a previsão (cara de vigilância; previsão em aberto no magno 9.9), Samambaia com crime simulado (lugar inventado), o Eixo Monumental como abertura (centro contra periferia), a prova de Águas Claras (os 46% precisam da fala do Daniel), o diagrama de camadas como "rede neural" (metáfora misturada), os rodapés de fonte em excesso. **Entrou:** o DF como "muitas cidades", o problema como estrutural, um só caso (buraco que é vazamento) com a jornada do cidadão, a acoplação aos sistemas dos órgãos e o acompanhamento até resolver |
| r2 | 12/11/2026 | Respostas da equipe. O caso do buraco que era vazamento vira **o apagão**: um bairro no escuro, 140 relatos de energia viram 1 incidente, e postes e semáforos apagados se cruzam numa só falha de três órgãos. Parte do exemplo real do Daniel (energia e iluminação em órgãos diferentes, magno 5.2) e usa a linguagem do filme (a cidade de luzes que se apaga e reacende). Fecho com o nome escrito, sem logo; projeto na pasta `video/` |

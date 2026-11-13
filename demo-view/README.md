# City View · demo

A demo do painel do City View, construída em fatias conforme o roadmap
(CV-DEM-001). Tudo o que aparece é **simulado**: não há API, login nem dado real
de cidadão. O selo "Ambiente de demonstração · dados simulados" fica sempre
visível.

Esta pasta é autocontida: tem o seu próprio `package.json` e não lê nada de
fora dela. Pode ser movida inteira para outro repositório.

## Onde está

Oito telas, na barra lateral (recolhe com a tecla `[`). Cada uma responde a uma
pergunta e abre pelo endereço (`#/sala`, `#/gestao`…) ou por `?tela=`.

| Tela | Pergunta | Slide |
| --- | --- | --- |
| Sala de situação | Onde a cidade precisa de mim agora? | 14 |
| Gestão | Como está a velocidade da gestão? Como está a minha área? | 14, 15 |
| Regiões | Como está cada região? | 15 |
| Inteligência | O que os silos não estão vendo? | 13 |
| Previsões | O que vem por aí? | 13 |
| Jornada | O que acontece quando o cidadão relata? | 10, 11, 12 |
| Cidadão | O que o governo está entregando? | 15 |
| Integrações | Com o que isso se conecta? | 12 |

**Tema claro e escuro:** o botão no pé da barra lateral troca o tema (a escolha
fica guardada no navegador; `?tema=claro` abre já no claro). O claro vale para
os painéis, os gráficos e os mapas de dados (regiões, cidadão, grafo). O mapa
de satélite da sala continua escuro nos dois temas, porque o calor e os
contornos foram ajustados para ele. Captura: `capturas/todas-as-telas-tema-claro.png`.
No claro, a inteligência colore os chamados e as evidências pela área do órgão,
com as mesmas sete cores da apresentação em rolagem (`inteligencia/cores.ts`);
no escuro ela segue neutra. Captura: `capturas/i3-insight-tema-claro.png`.

A cidade simulada é a mesma em todas as telas (`dados/cidade.ts`); só a sala
anda "ao vivo".

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

**I2 · Jornada de um chamado** (feita, aguardando revisão): "o que acontece
quando o cidadão relata?" (slides 10, 11 e 12). Abre em `#/jornada` (ou pela
aba no título). Capturas: `capturas/i2-jornada-*.png`.

- **O celular:** a conversa no WhatsApp com o assistente do City View. O roteiro e
  os textos são os do piloto que já funciona numa região (dfac,
  `api/ouvidoria_flow.py`), com o nome trocado e sem os detalhes daquele piloto. Nenhuma mensagem de
  cidadão é real; os nomes, o telefone (sempre mascarado) e os protocolos são
  fictícios e vêm marcados.
- **As cinco camadas:** o diagrama do slide 10 (canais · ponte · conectores ·
  incidente único · inteligência), com as três visões embaixo. Cada peça traz o
  selo **● existe em Águas Claras**, **◐ pronto, não ativo** ou **○ proposta**,
  com a fonte (`dominio/ponte.ts`). O marcador percorre as peças conforme o
  relato anda.
- **O detalhe do passo:** o que acontece ali (o que a coleta guardou, as
  palavras da triagem, os três passos da revisão humana, a prévia do envio e o
  protocolo, o aviso que volta ao cidadão, o incidente no modelo único, o
  cruzamento entre órgãos) e a situação no modelo único, com o nome do estado no
  dfac.
- **Dois casos roteirizados** (`dados/jornadas.ts`): *Poste apagado em Águas
  Claras*, o caminho que existe de ponta a ponta (CEB pelo IluminaDF, Participa
  DF, avisos até "resolvida"); e *A rua no escuro era falta de energia*, em que o
  mesmo começo desemboca na proposta: o relato é cruzado com os chamados da
  Neoenergia, do Detran e da Defesa Civil, e uma resposta só volta a todos. O
  que é proposta vem rotulado, inclusive a mensagem escrita pela equipe.
- **A demanda pode nascer em qualquer lugar:** o seletor "Pelo WhatsApp · Pelo
  sistema do órgão" mostra o mesmo caso nascendo no 155 da CEB ou no 116 da
  Neoenergia. O celular dá lugar ao registro do órgão (fictício), a jornada pula
  a coleta, entra pelo conector e chega ao mesmo incidente. A camada 1 lista os
  canais do City View e os sistemas que os órgãos já têm (`?origem=orgao`).
- **A operação dos sistemas dos órgãos** (`dominio/operacao.ts`): cada conector
  traz dois sinais, as **demandas** e a **operação** do sistema do órgão
  (qualidade da rede, qualidade do serviço e saúde do próprio sistema). No caso
  da rua no escuro, o passo "o que o sistema do órgão já sabe" mostra a rede da
  Neoenergia fora do normal, e é isso que fecha o raciocínio. É **proposta**,
  com valores simulados: a entrada de dados de operação ainda depende de
  validação (magno 7.1 e 9.3). Na inteligência, o insight separa "o que os
  cidadãos relataram" de "o que os sistemas dos órgãos registraram".
- **Experimente** (`dados/coleta.ts`): a pessoa escreve no celular e o roteiro é
  o mesmo do dfac (tipo de 1 a 5, descrição com ao menos 12 caracteres, local,
  SIM/NÃO, referência, foto, CONFIRMAR / CORRIGIR RELATO / CORRIGIR LOCAL /
  CANCELAR), com a triagem por um subconjunto das palavras-chave de
  `api/demand_triage.py`. O local é um toque no mapa; a foto, uma imagem de
  exemplo; o código começa com `TESTE-` e, como no dfac, nada é enviado.

| Tecla | Faz |
| --- | --- |
| Espaço | Toca e pausa a história |
| ← → | Passo anterior e próximo |

`?tela=jornada&auto=1` abre a jornada já tocando; `&caso=apagao` abre no
segundo caso. O relógio da sala continua andando enquanto a jornada está aberta.

**I3 · Inteligência explicada** (feita, aguardando revisão): "o que os silos não
estão vendo?" (slide 13). Abre em `#/inteligencia`. Capturas: `capturas/i3-*.png`.
Sala de comando, só que limpa: o DF em 3D sobre fundo grafite, sem imagem de
satélite; tom neutro em tudo, cor só no que está aberto ou pede atenção; uma
coisa só se mexendo por vez.

- **Três etapas** (teclas 1, 2, 3): **Chamados** (cada ponto é um chamado),
  **Ligações** (arcos entre os que falam da mesma coisa, perto e na mesma hora;
  em acento os que cruzam órgãos; de longe, um anel marca cada grupo) e
  **Incidentes** (os chamados se recolhem numa coluna por incidente: a altura é
  o número de chamados, a cor é a severidade).
- **Fila de insights**, do mais urgente ao menos: os 9 casos da demo
  exploratória (apagão em Planaltina, pedras na pista, 47 ligações para a mesma
  casa, vazamento que vira buraco…). ↑ ↓ percorrem a fila.
- **O insight explicado**, nas quatro partes do slide 13: o que a IA viu · por
  quê (evidências por órgão e canal, com os números do grupo) · confiança (com
  as três partes: assunto, lugar e hora) · o que sugere. **Confirmar** (Enter)
  abre 5 s para cancelar e só então "avisa" os órgãos; **Descartar** pede o
  motivo, e os chamados voltam a ser avulsos. Uma pessoa sempre decide.
- **Por órgão:** a mesma leitura sem o mapa, fila por fila, até o incidente.
- **Sensibilidade:** quão fácil a IA liga dois chamados, para a pergunta "e se
  ela errar?".
- Chega-se a um insight também pela jornada (o caso da rua no escuro) e pela
  sala (o cartão da RA aponta os insights da região):
  `#/inteligencia?caso=apagao-planaltina`.

O agrupamento é calculado (`inteligencia/agrupamento.ts`: força = afinidade de
assunto × proximidade × simultaneidade; grupos por union-find); a leitura, a
recomendação e o ganho de cada caso são escritos à mão (`inteligencia/casos.ts`).
Tudo simulado. Esta tela não depende de rede.

**Gestão** (feita, aguardando revisão): a velocidade da gestão e a visão de cada
órgão. Capturas: `capturas/i4-gestao.png` e `i4-gestor.png`.

- **Velocidade da gestão:** % resolvido no prazo e tempo até resolver, contra o
  período anterior. Os dois períodos são medidos com a mesma idade (o anterior
  entra como estava há 7 ou 14 dias); sem isso, o período atual pareceria
  sempre mais rápido, porque dele só os chamados fáceis já foram resolvidos.
- **Prazo cumprido, dia a dia:** só entram os chamados cujo prazo já venceu.
- **Órgãos:** tabela ordenável (chamados, em aberto, fora do prazo, no prazo,
  tempo, repetidos). **Repetidos** são chamados do mesmo tipo a menos de 150 m e
  de 24 h: o que o City View agruparia.
- **Visão do gestor** (clicar num órgão, ou `#/gestao?orgao=caesb`): os tipos
  dele com prazo, onde, a operação do sistema quando a demo simula, e os
  insights que cruzam com outros órgãos.

**Regiões** (feita, aguardando revisão): as 37 RAs lado a lado. Captura:
`capturas/i4-regioes.png`. O mapa em cores (por 10 mil habitantes, chamados,
tempo de espera ou % no prazo), quem espera mais, o ranking e o perfil de cada
região contra o DF (`#/regioes?ra=ceilandia`).

**Inteligência · painel de insights** (feita, aguardando revisão): a tela abre
no **Painel** (tecla P) e alterna com o **Grafo** (tecla G). O painel soma o que
os insights valem (chamados, incidentes, atendimentos repetidos a menos,
cruzamentos entre órgãos, decisões) e mostra um cartão por insight, com filtros
por severidade, tipo de caso e órgão. Captura: `capturas/i3-painel.png`.

*Acréscimo de 12/11/2026:* abrir um insight tem animação de abertura e de
seleção. O cartão (ou a linha da fila, no grafo) escolhido ganha contorno e uma
faixa lateral, e os outros recuam; o insight entra pela direita, com as partes
em cascata, os números contando e as barras de confiança enchendo. Curto e
termina; com "reduzir movimento" ligado no sistema, tudo aparece pronto.

*Acréscimo de 13/11/2026 · o ciclo do incidente, a régua dos números, o tempo e
os perfis.* Feito a partir da revisão por papéis
([CV-DEM-002](../docs/CV-DEM-002-revisao-por-papeis.md)), em quatro branches em
cadeia (`demo/fluxo-incidente`, `demo/visualizacao`, `demo/linha-do-tempo`,
`demo/perfis`), aguardando revisão.

- **Ida e volta com os órgãos (Inteligência).** O insight não acaba mais no
  "confirmar". Antes de confirmar, mostra **o plano da IA**: um pedido para cada
  órgão, com o papel (responsável, apoio, avisado), o motivo, o prazo e por onde
  vai (o sistema do próprio órgão, com a situação do conector como está no
  catálogo: quase tudo "proposta"). Depois de confirmar, cada órgão tem duas
  pistas: o pedido que **vai** e a resposta que **volta** (recebeu, com protocolo
  fictício; assumiu; devolveu; resolveu). Quem devolve ("não é comigo") manda o
  pedido de volta a quem revisa, que **redireciona** ou **dispensa**. Quando
  todos resolvem, a tela mostra **a mensagem única que os cidadãos recebem**.
  As respostas seguem um roteiro simulado, em tempo acelerado; dá para desligar
  e responder à mão ("responder como o órgão"). No caso do sossego, o roteiro
  mostra uma devolução. Capturas: `capturas/fluxo-*.png`.
- **Painel:** abas **Em andamento** (incidentes confirmados, com dono, prazo e
  situação) e **Registro** (quem decidiu o quê, quando e por quê, e quantas
  sugestões foram confirmadas ou descartadas).
- **Gestão, visão do gestor:** "Incidentes do meu órgão", com os pedidos que o
  City View mandou e os botões de resposta. É o lado do órgão da mesma conversa.
- **Estado comum** (`inteligencia/estado.ts`): as decisões e o andamento valem
  para todas as telas e continuam andando ao trocar de tela. Valem só na visita.
- **Sala:** **Pede atenção agora** traz os três incidentes mais graves e a
  situação de cada um; clicar voa até o lugar. Chamados seguidos do mesmo tipo
  entram numa linha só. "Metade resolvida em" e "No prazo" ganham a variação
  contra o período anterior e a distância até a meta. Novo modo do mapa, **Fora
  do normal**: cada região contra a própria média das três semanas anteriores,
  descontada a mudança do DF inteiro e o vaivém do acaso. Capturas:
  `capturas/vis-sala-*.png`.
- **Gestão:** a frase do alto diz o prazo e o tempo, sem escolher um; a **meta
  de exemplo** (80% no prazo, marcada como exemplo: a real vem da gestão)
  aparece no número e como linha tracejada; "9 em cada 10 em até" ao lado da
  mediana; os órgãos abrem ordenados pela **parte fora do prazo**, com a natureza
  de cada um (concessionária, segurança). Captura: `capturas/vis-gestao.png`.
- **Cidadão:** o mapa da parte resolvida usa **escala fixa** (50% a 100%) e
  escreve o valor nas regiões maiores. Captura: `capturas/vis-cidadao-escala-fixa.png`.
- **Voltar no tempo (grafo):** uma barra de horas sob o mapa; arrastar ou tocar
  (tecla Espaço) mostra os chamados chegando, as ligações surgindo e a coluna do
  incidente crescendo. Com um insight aberto, a janela e a contagem são as dele.
  Captura: `capturas/tempo-incidente-se-formando.png`.
- **Entrar por perfil:** na raiz, "Entrar como": **governadora** (sala, gestão,
  cidadão), **gestor de órgão** (escolhe o órgão; gestão, inteligência, jornada)
  e **operador da sala** (tudo). Sem senha: é demonstração. Um endereço de tela
  (`#/previsoes`) abre direto em qualquer perfil; `?perfil=gestor&orgao=caesb`
  entra já escolhido; o botão acima do tema troca de perfil. Captura:
  `capturas/perfis-entrada.png`.

Testes: 315.

*Acréscimo de 13/11/2026 · o que faltava acrescentar e o método.* Branch
`demo/acrescentar-metodo`, sobre `demo/perfis`. Também vem do
[CV-DEM-002](../docs/CV-DEM-002-revisao-por-papeis.md).

- **Resumo do dia** (tela nova, `#/resumo`, a segunda da governadora): a frase
  da gestão, o que mudou no DF inteiro, o que pede decisão, o que piorou e o que
  foi resolvido. **Imprimir** tira a folha no tema claro, sem a barra.
  Captura: `capturas/acresc-resumo.png`.
- **Pergunte à cidade**, no pé do resumo: seis **perguntas prontas**,
  respondidas com contas de verdade sobre a base simulada, com a conta dita e o
  mapa quando a resposta é sobre regiões. A pergunta livre, escrita ou falada,
  precisa de um modelo de linguagem e **não está feita**; a tela diz isso.
  Captura: `capturas/acresc-pergunta.png`.
- **De onde vem:** sob os painéis de números (sala, gestão, inteligência,
  previsões, resumo), uma linha que abre a conta, a atualização e os sistemas de
  onde o número viria, com a situação de cada ligação lida do catálogo de
  conectores. Hoje: 3 ligados, 11 propostos, e tudo simulado.
- **Ganho em tempo de equipe:** os atendimentos poupados aparecem também em
  horas, a 6 minutos cada. É **premissa de exemplo**, marcada na tela.
- **Triangulação:** um cartão no pé do painel de insights, marcado "Proposta ·
  não é um insight da demo": o problema que não chega pelos canais (operação
  apertada, quase nenhum chamado). Sem número e sem rede social.
- **Confiança em palavras:** "alta", "média" ou "baixa", com a nota ao lado e a
  frase que diz o que ela é: semelhança entre os chamados, não a chance de a IA
  estar certa.
- **Uma sugestão para descartar:** o décimo caso ("Buracos e falta d'água na
  mesma quadra", Guará) é plantado para a IA errar. A operação da CAESB mostra
  manutenção programada, sem vazamento. O insight diz "Para descartar" e por
  quê. Captura: `capturas/acresc-para-descartar.png`.
- **Previsão avaliada:** no lugar do "acerto 91%" de uma janela, o **erro
  típico** em quatro janelas de duas semanas (11%), contra o palpite de repetir
  as duas semanas anteriores (15%). **Onde reforçar as equipes** só lista região
  cuja alta passa da margem da própria previsão: hoje, nenhuma.
- **"Chuva"** como motivo de alta agora diz de onde vem: do tipo do chamado e do
  calendário, não do modelo.
- **Dois nomes para duas contas:** "chamados parecidos" na Gestão (regra simples
  de 150 m e 24 h) e "atendimentos poupados" na Inteligência.

Testes: 331.

*Acréscimo de 13/11/2026 · os serviços dentro de Regiões.* Pedido do Sammuel:
analytics do ecossistema inteiro (qualidade de rede, luz no DF, saneamento, mapa
de segurança com índices). A primeira versão foi uma tela à parte ("Analytics");
ficou repetindo Regiões e foi **fundida nela** no mesmo dia. Branch
`demo/analytics`.

**Regiões e serviços** (`#/regioes`; `?servico=seguranca` abre num serviço,
`?ra=ceilandia` numa região). PROPOSTA, sobre dados simulados.

- **No alto, os quatro serviços:** Energia (Neoenergia), Luz na cidade (CEB
  IPes), Água e esgoto (CAESB) e Segurança (PMDF), cada um com o índice do DF (0
  a 100, com a faixa em palavra) e o sinal do sistema do órgão.
- **Escolher um serviço troca a leitura do mesmo mapa** para o índice dele, em
  escala fixa e com o valor escrito; ao lado, onde está pior; abaixo, a
  **qualidade da rede, do serviço e a saúde do sistema** do órgão
  (`dominio/operacao.ts`) e como o índice é feito. Escolher de novo, ou "Voltar
  às medidas gerais", devolve a tela de sempre.
- **No perfil de cada região:** os quatro índices lado a lado e as três partes
  do que estiver escolhido.
- **O índice** é proposta da equipe (`indicadores/ecossistema.ts`): pressão
  (chamados por 10 mil habitantes contra as outras regiões, 40%), prazo (40%) e
  fila além do prazo (20%). Mede o serviço **pelo que chega aos canais**. Na
  segurança, a tela diz que **não é índice de criminalidade**, é sempre por
  região e fica fora do mapa público. A PMDF não tem operação simulada.

Capturas: `capturas/regioes-servico.png`, `capturas/regioes-servico-regiao.png`.
A demo tem nove telas. Testes: 341.

*Acréscimo de 13/11/2026 · cor nos mapas por região.* Os mapas em cores
(`ui/MapaDasRas.tsx`: Regiões e serviços, e o mapa das perguntas no Resumo)
deixam o cinza e passam a usar uma cor só, a família quente do calor da sala:
quanto mais quente, mais chamados ou pior o índice. A região escolhida continua
com o contorno do acento, que é frio. O mapa público segue em verde.

*Acréscimo de 13/11/2026 · demandas reais de Águas Claras.* Pedido do Sammuel:
puxar os dados do dfac de Águas Claras e rodar o nosso fluxo por cima. Branch
`demo/aguas-claras`.

**As duas fontes juntas, na Inteligência** (acréscimo do mesmo dia: a primeira
versão tinha uma chave "cidade simulada / Águas Claras", e com ela ligada o DF
sumia; o Sammuel pediu os dois juntos). O DF inteiro, com os casos simulados, e
Águas Claras, com os relatos reais, ficam no mesmo mapa e na mesma lista. Cada
insight leva a etiqueta **Dado real** ou **Simulado**, o painel filtra por
origem, e os códigos dos reais começam com "AC-". As duas fontes não se
misturam na conta: cada uma é agrupada pela sua regra (`inteligencia/juntos.ts`).

- **O que é real:** 853 demandas do **mapa público** do site parceiro
  dfaguasclaras.com.br (o mesmo que o dfac alimenta), de set./2024 a nov./2026:
  tipo, descrição, lugar, status, órgão e data. Lidas **uma vez**, em
  13/11/2026, e guardadas em `src/dados/aguasClaras/aguas-claras.json`. A demo
  não chama o site ao abrir.
- **O que é calculado sobre o real:** os incidentes da Inteligência
  (`inteligencia/reais.ts`). Regra: mesmo tipo, a até 150 m e 180 dias, com
  texto parecido; tipos diferentes só bem perto e com texto parecido; pelo menos
  três relatos; nenhum grupo passa de 150 m de raio. Saem 28 incidentes de 853
  relatos. A leitura, a recomendação e o ganho são **gerados dos números do
  grupo**; o insight mostra **o que os cidadãos escreveram**.
- **O que continua simulado:** o plano de envio, as respostas dos órgãos e a
  mensagem ao cidadão.
- **Onde vale:** na **Inteligência** (painel, grafo, ida e volta, registro,
  voltar no tempo). O filtro "Águas Claras · real" abre o bloco "Águas Claras
  em números". Os incidentes reais também entram na fila de "Pede atenção
  agora" da sala e no Resumo do dia, marcados. **O resto das telas segue na
  cidade simulada.** O selo da Inteligência diz: "Águas Claras: dado real de
  13/11/2026 · DF e fluxo simulados".
- **O que o dado não tem:** a data de resolução (logo, nada de tempo até
  resolver nem de prazo) e quem relatou. Isso viria do banco do dfac.

**Cuidados com o dado** (`src/dados/aguasClaras/limpar.ts`, com testes):
- só entram os 13 campos que o site publica; campo novo faz a leitura parar;
- das descrições saem telefone, e-mail, CPF e placa (na leitura de 13/11 saiu
  uma placa; nenhum telefone, e-mail ou CPF apareceu);
- **as fotos não entram**: só o fato de haver foto;
- acentos quebrados que vêm do site são consertados.

**Para refazer a leitura:** `node --experimental-strip-types scripts/baixar-aguas-claras.ts`
(dentro de `demo-view/`). É uma chamada ao endpoint público, sem login.

Capturas: `capturas/ac-painel.png`, `capturas/ac-insight.png`,
`capturas/ac-grafo.png`. Testes: 370.

*Acréscimo de 13/11/2026 · o grafo com volume.* Com os 853 relatos reais, o
grafo de perto virava uma mancha: cada ponto tinha um brilho em volta. Agora a
tinta vai para o que foi agrupado (`mapa/camadas/grafo.ts`):
- **Etapa 1 (chamados):** todo chamado é um ponto pequeno, sem brilho; quanto
  mais pontos, mais transparente cada um, para a sobreposição mostrar onde
  concentra.
- **Etapas 2 e 3:** só quem está num incidente leva brilho, tamanho e cor; o
  chamado avulso recua para um ponto pequeno e neutro.
- A legenda das áreas subiu, para não ficar sobre a barra do tempo.
- O selo da Inteligência ficou mais curto ("Águas Claras: dado real · DF e
  fluxo simulados"); a data da leitura está no painel.

Testes: 373.

*Acréscimo de 13/11/2026 · seletor de região na Inteligência.* No alto da tela,
ao lado de Painel/Grafo, um seletor com as regiões que têm insight e a contagem
de cada uma ("Águas Claras (29)"); `?ra=aguas-claras` abre já escolhida.
- **A fila, o painel e as setas** passam a olhar só para a região.
- **O mapa** voa até ela e fica de perto: as colunas vão para a escala de
  bairro, e os incidentes de outras regiões saem de foco (sem coluna, com os
  pontos neutros).
- "Todo o DF" devolve a visão inteira.
- O selo da Inteligência ficou "Águas Claras real · DF simulado", para caber
  ao lado da barra.

**Previsões** (feita, aguardando revisão; proposta): as próximas duas semanas
com a margem, o que está fora do normal agora, o que deve subir e cair, onde
reforçar as equipes e o acerto do método, medido ao prever as duas últimas
semanas sem vê-las. Captura: `capturas/i5-previsoes.png`. "Pergunte à cidade"
(pergunta em linguagem natural) **não está feita**: precisa de chave e de um
serviço intermediário, e fica para um passo próprio.

**Cidadão** (feita, aguardando revisão): o mapa público com os **três graus** de
transparência que a gestão escolhe (só o resolvido · + em resolução · + em
aberto) e o acompanhamento da demanda. Segurança pública não entra no mapa, em
nenhum grau. Captura: `capturas/i4-cidadao.png`.

**Integrações** (feita, aguardando revisão): as cinco camadas, o catálogo de
conectores (14 ligações, com situação, método, sinais e fonte) e as regras.
Para os três que já existem, a coluna do método diz como a ligação é feita
hoje, conferido no código do dfac; os propostos ficam "a mapear". Captura:
`capturas/i6-integracoes.png`.

Na **sala**, a coluna da direita alterna entre "Agora", "Órgãos" (com mais
chamados) e "Problemas" (mais relatados), e tem atalhos para os insights e a gestão.

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
  dominio/   modelo único de incidente, ciclo de vida, órgãos, canais, RAs e a ponte (camadas 1 a 5, com o que existe e o que é proposta)
  dados/     gerador determinístico, a mancha urbana (mancha.json), a coleta do WhatsApp e as jornadas roteirizadas
  indicadores/ contas das telas: sala, gestão, regiões, transparência (funções puras)
  inteligencia/ os 9 casos, o agrupamento de chamados em incidentes e as decisões (confirmar, descartar)
  mapa/      MapLibre, estilo do mapa, calor, imagem de perto, câmera e camadas deck.gl (camadas/)
  ui/        painel, selo, cores, barra lateral, gráficos em SVG e o mapa das RAs em cores
  telas/     uma pasta por iteração (sala/: painéis, HUD e tour da I1; jornada/: celular, fluxo e detalhe da I2)
  navegacao.ts  as telas, pelo hash do endereço (#/sala, #/jornada)
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
| Textos do assistente do WhatsApp, a ordem da coleta, os estados da demanda e as palavras da triagem (dfac, `Datasynq-org/dfac-agentic-saas`, commit `0eec955`) | As conversas, os nomes, os protocolos e o cruzamento entre órgãos da jornada |
| A situação de cada canal e conector (CV-REF-002, seção 4.1; magno 6.1) | |
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
- A I2 reproduz, sem copiar código, o roteiro do assistente do dfac
  (`api/ouvidoria_flow.py`, `api/ouvidoria_service.py`, `api/citizen_tracking.py`
  e `api/demand_triage.py`, repositório `Datasynq-org/dfac-agentic-saas`, só
  leitura, commit `0eec955`). Os textos do assistente vêm de lá, com o nome
  trocado para City View; a triagem é um subconjunto das palavras de lá.
- A I3 porta, da demo exploratória, os 9 casos (`data/inteligencia.ts`, com os
  textos como estavam) e a ideia do agrupamento e do grafo do Calebe
  (`data/grafo-neural.ts`, `components/grafo-deck.tsx`, `components/rede-neural.tsx`):
  as três etapas, os arcos em 3D, o colapso no incidente, confirmar e descartar
  com motivo. O código foi reescrito para lon/lat e para o visual desta demo.
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

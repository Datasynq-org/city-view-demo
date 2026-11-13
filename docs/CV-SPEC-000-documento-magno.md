# CV-SPEC-000 · Documento Magno do City View

| Campo | Valor |
| --- | --- |
| Código | CV-SPEC-000 |
| O que é | O apanhado do que se sabe sobre o projeto: o que é, o que o Daniel quer, o que a equipe está pensando, o que já existe e o que ainda não se sabe |
| O que não é | Não é especificação, plano, cronograma nem conjunto de regras. Nada aqui está decidido ou contratado |
| Criado em | 11/11/2026 |
| Fontes | [CV-ATA-001](fonte/CV-ATA-001-conversa-daniel-2026-11-10.md), a conversa com o Daniel (10/11/2026), fonte primária · [CV-REF-001](CV-REF-001-historico-dos-projetos.md), o histórico dos projetos anteriores · pesquisa de dados públicos do repositório `cityView` (10/11/2026) · respostas da equipe em 11/11/2026 |
| Dono | Equipe Datasynq |

## Como este documento cresce

- **Só por acréscimo.** O texto existente não é reescrito nem apagado. Um tópico
  novo entra no fim da seção a que pertence ou como seção nova.
- Se algo aqui se mostrar errado, acrescenta-se uma nota datada logo abaixo
  (*Acréscimo de dd/mm/aaaa: …*) dizendo o que mudou e por quê. O texto original
  fica.
- Todo acréscimo é anotado no [registro](#12-registro-de-acréscimos), no fim.
- Este documento substitui a versão 1.1 do magno (10/11/2026), descartada em
  11/11/2026 porque misturava o que foi dito na conversa com ideias da equipe e
  já definia regras e fases. As ideias daquela versão estão preservadas na
  [seção 7](#7-ideias-que-a-equipe-está-pensando).

### Marcas de origem

Cada afirmação traz a sua origem:

| Marca | Significa |
| --- | --- |
| **[Conversa]** | Dito na conversa de 10/11/2026. A transcrição não separa quem fala; vale o sentido da conversa |
| **[Equipe]** | Ideia ou leitura da equipe Datasynq, ainda não validada com o Daniel |
| **[Histórico]** | Vem dos projetos anteriores (dfac, Zela DF, primeira tentativa do CityView) |
| **[Pesquisa]** | Dado público, com fonte e data |

---

## 1. O projeto em poucas palavras

O **City View** é uma proposta da Datasynq ao Governo do Distrito Federal (GDF):
uma **plataforma de observabilidade da gestão da cidade**. Ela se conecta aos
sistemas que os órgãos já usam, recebe as demandas do cidadão num canal amigável,
acompanha cada uma até a resolução e cruza tudo com inteligência, para que o
governo veja a cidade como um todo e o cidadão veja o que o governo entrega.
**[Conversa]**

A frase que resume a conversa: *"Nós temos que vender que é um sistema de
observabilidade que vai dar uma interação para o cidadão amigável e rastreável."*
**[Conversa]**

---

## 2. Quem é quem

| Quem | Papel |
| --- | --- |
| **Datasynq** | A equipe que constrói o City View. Fez antes a Máquina de Ouvidoria (dfac) e o Zela DF (ver [CV-REF-001](CV-REF-001-historico-dos-projetos.md)) **[Histórico]** |
| **Daniel** | Leva a proposta ao GDF. Trabalha com observabilidade de tecnologia: *"A gente está vendendo a Viltinet [Viewtinet], né? Que é espanhola"*. Já conversou com o governo sobre a ideia: *"quando eu falei com eles, eram já pensando, inclusive a gente falou de polícia até, de notícia crime"* **[Conversa]** |
| **Assessores da governadora** | Primeira audiência: *"eu quero apresentar para os assessores primeiro, para eles verem se estão satisfeitos com isso. Aí a gente marca com ela"* **[Conversa]** |
| **Governadora do DF** | Quem decide e quem usaria a visão do todo: *"você, governadora, vai ter agora uma ferramenta que vai te dar condição de ver a velocidade da sua gestão"* **[Conversa]** |
| **Gestores setoriais** | Cada área quer a própria visão: *"o cara da CAESB quer ter uma visão do que diz respeito a ele"* **[Conversa]** |
| **Órgãos e concessionárias** | Donos dos sistemas legados, que continuam funcionando como hoje **[Conversa]** |
| **Cidadão** | Relata problemas, acompanha e vê o que a gestão resolve **[Conversa]** |

---

## 3. Momento atual

- **É venda.** *"A gente sabe que agora é venda, a gente ainda vai fazer isso a
  fundo, entendeu? Mas é venda."* **[Conversa]**
- **Nada foi contratado** e **não existe integração** com nenhum órgão do GDF.
  O acesso às APIs e sistemas depende do governo liberar: *"a gente precisaria
  […] de uma colaboração deles para a disponibilização de API pública […] que
  hoje a gente não tem acesso"*. Depois da compra, a expectativa é que o governo
  libere e indique os pontos de integração: *"Não, a ideia é essa."* **[Conversa]**
- **Como a venda deve acontecer:** o Daniel apresenta primeiro aos assessores,
  depois à governadora, e a equipe entra depois do "sim": *"nessa primeira eu vou
  ter que fazer ela […] Ainda não vou conseguir levar vocês. Aí ela comprando a
  ideia […] Que aí vocês vão entrar."* **[Conversa]**
- **O que se pediu:** uma apresentação (*"Vamos fazer uma apresentação, um
  PowerPointzinho"*) e, se possível, algo em que se possa entrar e mostrar
  (*"seria bem legal se a gente já conseguisse mostrar para ela, logar em alguma
  coisa e mostrar para ela mais ou menos o que a gente falou"*). **[Conversa]**
- **Prazo:** na conversa falou-se em "amanhã", com folga (*"Se estourar um
  diazinho aí, não tem problema"*). Em 11/11/2026 a equipe registrou que **não há
  prazo definido** e que a reunião com os assessores ainda não está marcada.
  **[Conversa] [Equipe]**
- **Neste repositório** (`city-view-demo`) há só documentação. Nenhum código.
  **[Histórico]**
- *Acréscimo de 11/11/2026:* **a apresentação começa do zero.** A primeira
  tentativa (repositório `City-view`) chegou a ter uma apresentação de 14 slides
  e a demo "Sala de Situação", com várias integrações. Ficou legal, mas
  poluída. Por isso o caminho agora é o inverso: primeiro uma **apresentação
  concisa, detalhada e completa**; depois incrementá-la; só então construir a
  **demo**, a partir do que está levantado e documentado. A apresentação antiga
  fica como referência do que já se tentou, não como base. **[Equipe]**

---

## 4. O que o Daniel quer

O que saiu da conversa, por tema. As citações são literais da
[transcrição](fonte/CV-ATA-001-conversa-daniel-2026-11-10.md).

### 4.1 Vender observabilidade, não um canal

O ponto de partida é o mundo em que o Daniel já trabalha, a observabilidade de
tecnologia: *"Eu foquei muito nessa coisa da observabilidade, porque a gente já
mexe com isso, né? A gente já vende isso."* **[Conversa]**

- Num cliente grande há várias ferramentas, cada uma olhando uma parte (APM,
  rede, segurança, suporte), cada uma num silo: *"Vários fatores. E eles estão em
  filos [silos] separados."*
- A observabilidade 360 *"se propõe a integrar com cada um desses filos […] E
  resolver o problema como um todo."*
- O que ela entrega: *"Você começa a identificar, diagnosticar e prever
  problemas."* E: *"Você tem uma maior facilidade de resolução dos problemas
  porque você tornou fácil o processo de resolução de incidentes."*
- Na cidade, os silos são os órgãos: *"Não interessa se é o Portal do Cidadão, é
  o Caesby [CAESB], não sei das quantas, é o Neo Energia"*.
- O que **não** vender: *"Se você vender que é um WhatsApp automatizado, cara,
  não esquece. Não vai valer."* E: *"não é só você ter um formulário que faça
  input de dados. Não é isso. A gente está vendendo a tomada de inteligência."*
- A definição: *"É um coletor inteligente de incidentes que vai interagir com o
  seu legado."*

### 4.2 Integrar os legados, quaisquer que sejam

- *"Seja lá o nome que tenha por baixo, nós vamos integrar com os legados. […]
  Seja lá quais sejam eles, inclusive os que não estão integrados em lugar nenhum
  hoje."* **[Conversa]**
- **Abstrair:** na defesa da proposta, o nome dos sistemas não importa. *"Primeiro,
  é abstraindo."* *"Abstraia, abstraia."* **[Conversa]**
- **Qualquer tecnologia e qualquer meio:** *"Se um está em, sei lá, Dotnet, o
  outro está em Java, um está rodando no grande porte, outro no plataforma
  intermediária, ou está rodando no computador do cara lá do DR [DER] […] Ah, via
  API, vamos ter que fazer um robô para entrar no site do cara e botar em files."*
  **[Conversa]**
- **Quem aponta é a gestão:** *"Faz parte da implantação do Seriviu [City View],
  você apontar quais são esses legados e nós vamos lá integrar com eles"*. *"o
  gestor vai nos apontar, eu quero gerenciar segurança, quero gerenciar água,
  esgoto, luz, telefonia, sei lá, tudo que ele colocar"*. **[Conversa]**
- **Os órgãos continuam como estão:** *"Nós vamos entregar do jeito que você está
  acostumado. Na polícia, na KSB [CAESB], etc. Nós vamos entregar lá."* A equipe
  já tinha chegado à mesma conclusão: *"acoplação e não substituição"*.
  **[Conversa]**

### 4.3 Uma camada única de contato com o cidadão

- O City View é a interface com o cidadão: *"nós seremos a camada de interface
  com o cidadão. Nós seremos a camada de interface que nós vamos integrar com os
  legados"*. **[Conversa]**
- Hoje o cidadão precisa descobrir para onde ir: *"o cidadão tem que ficar
  descobrindo onde ele vai. Ele não tem uma coisa centralizada"*. **[Conversa]**
- **Para qualquer demanda:** *"A abertura de demandas vai ter que ter. […] Para
  qualquer demanda, essa é a primeira ponte. Qualquer legado, qualquer que seja o
  sistema."* E: *"Qualquer que seja o sistema, nós vamos integrar. E vai ser um
  silo novo que a gente coloca aqui."* **[Conversa]**
- **O canal é escolha da gestão:** *"Onde você quer falar com o cidadão? Ah, você
  quer falar no WhatsApp? Então vamos no WhatsApp. […] Via SMS? A gente fala. Você
  quer falar via Instagram? A gente fala."* Por baixo, o City View faz *"todo o
  processo que é necessário para que uma solicitação seja aberta"*. **[Conversa]**
- **Leitura da equipe (11/11/2026):** a ideia é **centralizar num canal a
  abertura de todas as demandas**. A frase *"Eu não falei que a gente vai
  concentrar toda a abertura de chamadas, entendeu?"* é lida como pergunta
  retórica ("não falei que…?"). Na transcrição ela também pode ser lida ao
  contrário; vale confirmar com o Daniel. **[Equipe]**

### 4.4 Acompanhar até resolver

- *"Você não pode ser só uma camada de abrir e acabou. Não pode, é uma
  observabilidade."* **[Conversa]**
- *"O cidadão vai poder acompanhar isso. Ele vai conseguir acompanhar e ter a
  satisfação de que o seu sentimento de desajuste está sendo tratado pela gestão
  pública."* **[Conversa]**
- Cada demanda precisa de *"uma integração para acompanhamento"*. **[Conversa]**

### 4.5 Inteligência: classificar, agrupar, cruzar

- *"Sem uma ferramenta que faça a leitura de todas essas coisas com I.A., com
  inteligência, né? Com um B.I. trabalhando esses dados"*. **[Conversa]**
- *"Eu trago uma camada de decisão. Então eu posso ter um BI cruzando todas essas
  coisas, usando a IA, ter um data lake, etc. Fazer todos os cruzamentos, fazer a
  intersecção de chamados."* **[Conversa]**
- **Classificar e cruzar:** *"classificar os incidentes, cruzar os incidentes,
  trazer inteligência pra gerir a cidade"*. **[Conversa]**
- **Agrupar:** *"Isso vai abrir dez chamados lá, que na verdade são os mesmos
  chamados […] Agrupar chamados. Porque, cara, na verdade, todas essas
  solicitações falam da mesma coisa."* **[Conversa]**
- **Coisas ligadas a outras:** *"Existem questões que vão acabar se
  retroalimentando."* *"Que existem coisas que são acopladas às outras"*.
  **[Conversa]**
- **Tudo vira incidente:** *"Independente dos rios [silos], você conseguir ver
  isso como mais um incidente. Não importa se ele é de água, de segurança"*.
  *"a minha ferramenta, ela se conecta com os legados e ela faz uma interface de
  geração de incidentes e acompanhamento e resolução."* **[Conversa]**
- Os exemplos que ilustram isso estão na [seção 5](#5-os-exemplos-da-conversa).

### 4.6 A visão do governo

- **Sala de guerra:** *"A governadora quer colocar uma sala de guerra do lado da
  sala dela com um telão vendo todos os chamados agrupados e classificados num
  mapa onde ela pode ver, num mapa de calor, onde as coisas estão pegando, onde
  as coisas estão mais tranquilas"*. **[Conversa]**
- **Velocidade da gestão:** *"ver a velocidade da sua gestão. E ver como a sua
  gestão realmente está."* **[Conversa]**
- **Uma visão por gestor:** *"é um dashboard para o gestor da Arles Bruto [água e
  esgoto], o gestor da telefonia […] o gestor da iluminação, o gestor da energia,
  o gestor das vias públicas. E aí, por aí vai."* **[Conversa]**
- *"A gente vai dar as camadas de observabilidade que a gestão vai precisar"*.
  **[Conversa]**

### 4.7 A visão do cidadão sobre a gestão

- *"dar ao cidadão também a possibilidade de ter uma observabilidade da gestão"*.
  **[Conversa]**
- *"se a minha gestão é boa, eu posso dar para o cidadão um mapa para ele ver
  como as coisas estão evoluindo na cidade."* **[Conversa]**
- **Três graus de abertura, à escolha da gestão:** só o que foi resolvido
  (*"esse mês aqui verdinho no mapa, tudo isso aqui foi resolvido. Esses mil
  chamados aqui foram resolvidos esse mês"*); e, *"se a gestão for mais
  arrojada"*, também o que está em resolução e o que ainda está aberto sem
  solução. **[Conversa]**
- O nome que apareceu na conversa, *"observabilidade anticidadã [cidadã], alguma
  coisa assim, não sei que nome dar"*, é lido pela equipe como um **adendo** do
  projeto: um módulo a mais para o cidadão ver a gestão, não o nome do produto.
  **[Conversa] [Equipe]**

### 4.8 Áreas e órgãos citados

Todos são **exemplos**. Nada foi escolhido como escopo. **[Conversa]**

| Área | Como apareceu |
| --- | --- |
| Segurança pública, polícia | *"seria importante integrar com a polícia"*; *"a gente falou de polícia até, de notícia crime"*; *"a captação e integração com o policiamento, com segurança pública"*; perturbação do sossego |
| Água e esgoto (CAESB) | *"o cara da CAESB quer ter uma visão do que diz respeito a ele"* |
| Energia (Neoenergia) e iluminação (CEB) | O exemplo de que energia e iluminação ficam em lugares diferentes ([seção 5.2](#52-energia-aqui-iluminação-ali)) |
| Vias públicas, trânsito, DER | *"o gestor das vias públicas"*; *"o computador do cara lá do DR"* |
| Limpeza urbana (SLU) | *"O sistema da SLU, SLU Limpeza Urbana também."* |
| Telefonia | *"esgoto, luz, telefonia"*; *"o gestor da telefonia"* |
| Portais e canais existentes | *"Portal do cidadão, ADM24, ADM72, o nome que tiver"* |

### 4.9 Narrativa

- **O tamanho da proposta depende da narrativa:** *"Se você entra, se implore
  [simplório], vai vindo um projetinho. Se você constrói uma narrativa […]
  Observabilidade. Observabilidade, mais uma vez."* **[Conversa]**
- *"tudo é narrativa. A forma como você embala o produto, mostra o produto."* A
  comparação: *"É essa diferença entre um Windows e um Ubuntu."* **[Conversa]**
- Como contexto (do mundo da observabilidade em que o Daniel trabalha, não como
  dado do projeto), ele citou projetos de observabilidade de centenas de milhões:
  *"O projeto de 400 milhões"* e *"A Dayna 3 [Dynatrace] vendeu o APM na caixa
  agora há 250 milhões"*, *"um software que fica lendo log"*. Em 11/11/2026 a
  equipe registrou que isso foi conversa paralela, sem fonte. **[Conversa] [Equipe]**
- *"Tem que fazer uma defesa muito boa disso. Muito boa."* **[Conversa]**
- A referência de "algo maior" trazida na conversa foi um projeto espanhol em
  Madri, ainda não identificado: *"a gente viu aqui o exemplo de […] o Madrid,
  que foi um projeto da Espanha"*. **[Conversa]**

---

## 5. Os exemplos da conversa

Exemplos usados para explicar a ideia. São ilustrações: nenhum é dado medido.

### 5.1 O banco lento

*"À tarde, o sistema fica lento. Isso é um case real. […] você pergunta para o
cara da aplicação, ele olha no APM e fala não, no caso está tudo certo. Você
pergunta para o cara da rede, o cara da rede fala não, está tudo certo. Pergunta
para o cara da segurança, teve algum ataque? Não, nenhum ataque. Então, se você
olha cada coisa em separado, as coisas estão funcionando. Quando você olha o
todo, as coisas não estão funcionando."* **[Conversa]**

É a analogia central: cada silo diz que está tudo bem e o problema só aparece
quando se olha o todo. O banco citado era a Caixa Econômica Federal; o caso não
precisa do nome do banco para funcionar.

### 5.2 Energia aqui, iluminação ali

*"Vocês sabem que nem tudo de energia é na Neo Energia? […] tem parte que está
na SEGA [CEB] ainda e tem parte na Neo Energia. […] O cidadão vai, dependendo do
que ele vai fazer, a energia aqui e a iluminação é ali."* **[Conversa]**

Os dados públicos confirmam: a distribuição de energia é da **Neoenergia
Brasília** (antiga CEB Distribuição, vendida em leilão em dez./2020); a
iluminação pública é da **CEB IPes**, subsidiária da CEB, desde fev./2021.
**[Pesquisa]**

### 5.3 Pedras na via

Um ator, de quem o Daniel lembrou o nome, foi baleado num assalto no Rio de
Janeiro: pedras colocadas numa via furavam os pneus, e os motoristas eram
abordados quando paravam. *"Aquilo não era um incidente na via, mas era um
incidente de segurança."* Quem passou antes e desviou da pedra relatou o problema
à via: *"Isso vai abrir dez chamados lá, que na verdade são os mesmos chamados, e
que no final não eram chamados a respeito da via, mas era de segurança pública."*
**[Conversa]**

O exemplo mostra duas coisas juntas: **agrupar** relatos do mesmo fato e
**reclassificar** um problema que parece de uma área e é de outra. Nome, local e
ano do caso não foram confirmados. Em 11/11/2026 a equipe decidiu não citar o
caso real por enquanto. **[Equipe]**

### 5.4 Placas caídas

*"Placas caídas e deterioradas. Muitas vezes não diz respeito apenas a uma
depredação do patrimônio, mas também a acidentes. Então, você tem um incidente de
trânsito que afeta um patrimônio público."* **[Conversa]**

### 5.5 Perturbação do sossego

*"O que dá mais problema para a polícia hoje, para a PM, é o que a gente chama
perturbação de sossego. É a maior fonte de chamado hoje na polícia. É o som alto
do cara, está lá na Ceilândia, bota um sonzão meia noite, aí entra aquele tanto
de chamado. 50 chamados que é a mesma casa"*. A informação veio de um coronel.
**[Conversa]**

O exemplo mostra muitos chamados sobre o mesmo fato. Os números públicos não
confirmam que seja a maior fonte de chamados da PM: no 1º semestre de 2024 foram
5.467 reclamações de perturbação do sossego à PMDF (Correio Braziliense,
12/08/2024), da ordem de 8% das 134.091 ocorrências atendidas pelo 190 em 2024
(CB.Poder, 23/01/2025; o percentual é cálculo da equipe, com períodos que não
coincidem). Os "50 chamados" são ilustrativos. **[Pesquisa]**

---

## 6. O que já temos

O detalhe está no [histórico dos projetos](CV-REF-001-historico-dos-projetos.md).
Resumo: **[Histórico]**

| O quê | Onde | Estado |
| --- | --- | --- |
| **Máquina de Ouvidoria**: módulo de ouvidoria cívica do dfac (canal DFÁGUASCLARAS, Águas Claras). O cidadão relata pelo WhatsApp, um operador revisa, a plataforma envia ao ParticipaDF, ao Portal do Cidadão ou ao IluminaDF e acompanha | `dfac-agentic-saas` | Em produção. Não se altera |
| **Zela DF**: a ouvidoria como produto próprio para o DF inteiro (conversa com IA, revisão humana, encaminhamento, mapa público, limites oficiais das RAs) | `cityView`, em `referencia/zela-df/` | POC parada, guardada como referência |
| **CityView, primeira tentativa**: documentação e uma demo ("Sala de Situação") feitas logo depois da conversa | `cityView` | Substituída por este repositório |
| **Pesquisa de dados públicos** com fonte e data | `cityView/docs/fonte/2026-11-10-pesquisa-dados-publicos.md` | Base para qualquer número citado |
| **Este repositório** | `city-view-demo` | Só documentação |

*Acréscimo de 11/11/2026:* a primeira tentativa do CityView também deixou uma
apresentação de 14 slides (`City-view/assets/pitch/CityView_Apresentacao.pptx`,
roteiro em `City-view/docs/04-roteiro-do-pitch.md`). Fica como referência; a
apresentação nova começa do zero ([seção 3](#3-momento-atual)). O pitch do Zela
DF (`City-view/referencia/zela-df/assets/pitch`) **nunca foi mostrado a
ninguém**; o `RESUMO.md` do Zela, que fala em "apresentação entregue ao GDF",
está errado nesse ponto. **[Equipe]**

### 6.1 Águas Claras: um exemplo real de uma das pontas

O que a ouvidoria de Águas Claras mostra: o cidadão usa um canal que centraliza
demandas fora dos canais oficiais, como o Portal do Cidadão. É uma prova de uma
das pontas do City View, a centralização das demandas numa ferramenta, **não o
escopo principal**. **[Equipe]**

| Indicador | Valor | Fonte e data |
| --- | --- | --- |
| Demandas no mapa público DFÁguasClaras | 843 desde set./2024; 389 resolvidas (46%); 14 órgãos acionados; 98% com foto | API pública do site, 06/11/2026 |
| Últimos 12 meses | 348 registradas, 141 resolvidas | idem |
| Por tipo | Obras/Manutenção 308, Outros 209, Trânsito 153, Iluminação 136, Segurança 37 | idem |
| Demandas na fila de revisão da ouvidoria | 102 (89 do mapa, 13 do WhatsApp) | Banco de produção do dfac, só leitura, 28/10/2026 |
| Protocoladas em canais oficiais | 18 (12 ParticipaDF, 6 Portal do Cidadão) | idem |
| Cidadãos atendidos no WhatsApp | 59 (62 conversas), desde 30/09/2026 | idem |

As 843 demandas se acumulam desde setembro de 2024, não são "dos últimos 12
meses". A comparação "o cidadão prefere este canal ao portal oficial" **não foi
medida**. **[Histórico]**

### 6.2 O que se aprendeu nos projetos anteriores

Lições que valem como conhecimento ([CV-REF-001](CV-REF-001-historico-dos-projetos.md),
seções 2 a 4). **[Histórico]**

- O Portal do Cidadão depende de sessão gov.br humana (CAPTCHA, segundo fator).
  - *Acréscimo de 11/11/2026:* continua verdade, e o dfac já trabalha com isso
    sem automatizar credencial. Desde 30/09/2026 um operador conecta por uma
    extensão de Chrome/Edge, faz o login gov.br à mão no site oficial, e a
    sessão fica compartilhada no servidor até expirar; aí alguém reconecta
    (`dfac-agentic-saas/docs/portal-cidadao-shared-session.md` e
    `portal-connector-extension.md`). A seção 8 do `CONTEXTO_PLATAFORMA.md` do
    dfac, de 29/09/2026, é anterior a isso e ainda diz que o portal não funciona.
- O Instagram ficou pronto no código e travado na verificação da Meta.
- URLs de mídia dos canais expiram; a evidência precisa ser baixada na chegada.
- Canal sem botão de localização precisa de alternativa por endereço.
- Duplicata que só vira candidata para revisão humana não muda a prioridade de nada.
  - *Acréscimo de 11/11/2026:* **desatualizado.** Desde 01/10/2026 o dfac eleva
    a prioridade sozinho: associa relatos automaticamente quando estão a até
    30 m (de 30 a 100 m vira candidato para revisão; acima disso, nada), 3 a 9
    remetentes deixam a demanda em Alta, 10 ou mais em Urgente, e a prioridade
    efetiva é a maior entre a manual e a da recorrência
    (`dfac-agentic-saas/api/demand_recurrence.py`,
    `docs/demand-recurrence-design.md`). A frase original veio do Zela DF
    (`referencia/zela-df/docs/04-heranca-dfac.md`). Está no código do `main`
    do dfac; não foi conferido se está ligado em produção.
- Misturar a ouvidoria com módulos comerciais no mesmo banco foi um dos motivos para separar o produto.
- Um canal de abertura de demandas, sozinho, não se vende ao governo; foi isso que levou do Zela DF ao City View.

---

## 7. Ideias que a equipe está pensando

Tudo nesta seção é **[Equipe]**: ideias que surgiram depois da conversa, a maior
parte na versão 1.1 do magno (10/11/2026). **Nenhuma foi validada com o Daniel.**
Ficam registradas com o máximo de detalhe para não se perderem, sem que isso as
torne decisões.

### 7.1 Três sinais da cidade

| Sinal | Pergunta | Fontes imaginadas |
| --- | --- | --- |
| **Demandas** | O que o cidadão relata? | Canais do City View e chamados abertos direto nos sistemas dos órgãos |
| **Operação** | O que o governo faz e entrega? | Ordens de serviço, filas, tempos, equipes, vindos dos legados (SLU, CAESB, SES, PMDF, DER…) |
| **Percepção** | Como a cidade se sente, inclusive sobre o que ninguém registra? | Relatos recebidos, redes públicas via fornecedor licenciado (sempre agregado), comentários nos perfis oficiais, pesquisas curtas de satisfação |

A conversa fala de demandas e de acompanhamento. **Operação** amplia o que cada
órgão teria de liberar. **Percepção** é a ideia de maior alcance e de maior
risco (leitura de vigilância, LGPD, uso político) e é a que mais precisa da
opinião do Daniel.

### 7.2 Quatro tipos de inteligência

| Tipo | O que é | Exemplo pensado |
| --- | --- | --- |
| **Agrupamento** | Vários chamados do mesmo fato | Dezenas de chamados de som alto → um incidente, a mesma casa |
| **Correlação** | Incidentes de áreas diferentes com uma causa comum | Pedras na via + roubos no mesmo trecho → segurança pública |
| **Triangulação** | Divergência entre os três sinais | Percepção ruim sobre saúde numa RA + espera alta na UPA + quase nenhuma demanda → "problema invisível" |
| **Previsão** | Tendência a partir do histórico e do contexto | Chuva prevista + bueiros entupidos recorrentes → alagamento provável |

Cada sugestão da IA mostraria o motivo, a confiança e as evidências, e uma pessoa
confirmaria ou descartaria.

Outras ideias de inteligência: normalizar indicadores por população; detectar
temas emergentes; consulta por voz ou linguagem natural ("Onde a perturbação do
sossego cresceu este mês?"), com o mapa respondendo; relatórios periódicos para
o planejamento.

### 7.3 Módulos imaginados

| Código | Módulo | Resumo |
| --- | --- | --- |
| CID | Interface Cidadão | Canais, coleta, acompanhamento, pesquisa de satisfação |
| CON | Conectores | Integração com legados: abrir lá e trazer o status de volta |
| INC | Núcleo de Incidentes | Modelo único de incidente, ciclo de vida, histórico |
| PER | Percepção | Sentimento e temas, sempre agregados |
| INL | Inteligência | Agrupamento, correlação, triangulação, previsão, data lake |
| GOV | Interface Governo | Sala de guerra, painéis setoriais, relatórios |
| TRP | Transparência | Mapa e painel públicos para o cidadão |
| PLT | Plataforma | Identidade, acesso, auditoria, hospedagem |

Ciclo de vida pensado para um incidente: recebido → em triagem → encaminhado →
em atendimento → resolvido → encerrado, com saídas para cancelado, falha de envio
e reaberto. Cada incidente teria órgão responsável, região administrativa, tema,
local, severidade, protocolo no legado e datas de criação e resolução (estas
últimas para medir a velocidade da gestão).

### 7.4 Uma demo imaginada

Telas pensadas, cada uma respondendo a uma pergunta:

| Tela | Pergunta |
| --- | --- |
| Acesso | Login de demonstração |
| Sala de Guerra | "Onde a cidade precisa de mim agora?" |
| Inteligência | "O que os silos não estão vendo?" |
| Percepção | "Como a cidade se sente?" |
| Gestão | "Qual a velocidade da minha gestão?" |
| Cidadão | "O que o governo está entregando?" |

Cenas pensadas: os órgãos aparecendo conectados; o DF inteiro com incidentes
chegando no mapa; dezenas de chamados de som alto em Ceilândia virando um só;
pedras na via reclassificadas como segurança; um "problema invisível" de saúde no
Sol Nascente; alagamento provável em Vicente Pires; uma pergunta em linguagem
natural; o mesmo dado virando o mapa público para o cidadão.

Cuidado já anotado: dados simulados precisam aparecer como simulados
("Ambiente de demonstração · dados simulados"), inclusive a ideia de órgãos
"conectados", que hoje não existe.

### 7.5 Um visual imaginado: "Sala de Operações"

Estética de centro de operações (fundo escuro, técnico, preciso) com conteúdo de
gestão pública: a cidade e os serviços, nunca pessoas. Movimento só quando algo
novo acontece. Uma pergunta por tela. Cor reservada para tipo de sinal e
severidade, sempre acompanhada de texto.

| Elemento | Valor pensado |
| --- | --- |
| Fundos | `#05080D`, `#0A0F17`, `#111826`; linhas `#1B2636` |
| Textos | `#E6EDF5`, `#8A97A8`, `#4E5B6C` |
| Sinais | Demandas `#3DD9EB` (ciano), Operação `#7C8CFF` (índigo), Percepção `#C68BFF` (violeta) |
| Severidade | OK `#3BE08F`, atenção `#F5B83D`, crítico `#FF4D5E` |
| Tipografia | Chakra Petch (títulos e números), IBM Plex Sans (texto), IBM Plex Mono (IDs e rótulos) |
| Mapa | Contorno do DF em linha fina, RAs como nós, Lago Paranoá em silhueta, mapa de calor |

### 7.6 Cuidados que a equipe levantou

- **Observar a cidade e a gestão, nunca pessoas.** A percepção seria sempre
  agregada por tema, região e período, sem busca nem relatório por pessoa.
  Precedente lembrado pela equipe: STF, ADPF 722 (conferir antes de citar fora).
- **Percepção para orientar políticas públicas**, nunca para comunicação
  política ou campanha (CF, art. 37, impessoalidade).
- **Redes sociais só por API oficial ou fornecedor licenciado**; grupos privados
  nunca seriam fonte.
- **LGPD:** finalidade declarada, minimização, pseudonimização e relatório de
  impacto antes de qualquer produção.
- **Hospedagem compatível com governo**, no Brasil.
- **Palavras a evitar no pitch:** "Palantir", "God's Eye View", "olho de Deus",
  "software espião" (soam como vigilância); "direcionar a narrativa do governo"
  (esbarra na impessoalidade); "detector de corrupção" (gera desconfiança no
  comprador); "Governo Federal" (o cliente é o GDF).

### 7.7 Referências técnicas lembradas

| Referência | Para quê |
| --- | --- |
| geobr, censobr, geocodebr, enderecobr (IPEA) | Malhas, população por setor censitário, geocodificação de endereços |
| Limites oficiais das RAs (IDE/DF, Geoportal, IPEDF) | Mapa; já existem em `cityView/assets/geo/` |
| God's Eye View (github.com/bilawalsidhu/gods-eye-view) | Referência visual de sala de operações e consulta por voz (conferir licença) |
| Palantir Gotham | Conceito de integração de fontes heterogêneas (só referência interna) |
| Ferramentas de social listening (Stilingue/Blip, Buzzmonitor, Brandwatch, Talkwalker…) | Possível fonte licenciada de percepção |
| MapLibre + OpenStreetMap | Mapa da demo antiga, sem chave nem licença paga |

### 7.8 Leituras da equipe sobre a conversa (11/11/2026)

- A integração com a polícia, a notícia-crime, a telefonia e os demais órgãos
  são **exemplos** do Daniel, não escopo fechado.
- Percepção e dados de operação podem entrar no material com o máximo de
  detalhe, como ideias.
- Os números de Águas Claras ajudam como exemplo real de uma das pontas
  ([6.1](#61-águas-claras-um-exemplo-real-de-uma-das-pontas)).
- "Observabilidade cidadã" é um adendo, um módulo para o cidadão ver a gestão
  ([4.7](#47-a-visão-do-cidadão-sobre-a-gestão)).

### 7.9 Rascunho de fluxo e roteiro, anterior à demo exploratória

*Acréscimo de 11/11/2026.* A equipe trouxe um rascunho feito depois da conversa
com o Daniel e antes da demo exploratória do `City-view`. Ele está transcrito,
com as imagens originais, em
[CV-REF-002](CV-REF-002-rascunho-fluxo-e-roteiro.md). Em resumo:

- **Cinco camadas:**
  1. canais do cidadão;
  2. ponte de abertura de demandas;
  3. conectores com os legados;
  4. data lake com o incidente único;
  5. camada de inteligência.

  Delas saem **três visões**: governadora (sala de situação), gestores (um
  painel por área) e cidadão (transparência). Cada item vem marcado como
  "existe" ou "proposta".
- **O caso da pedra na via** como possível slide de abertura: vários relatos no
  mesmo ponto mais um roubo de veículo viram um só incidente, de segurança e
  não de trânsito.
- **Um roteiro de pitch em seis passos:** problema, exemplos da cidade,
  solução, prova (Águas Claras), o que a governadora ganha, implantação em
  ondas.

O papel dele é servir de **checagem de completude** para a apresentação e,
depois, para a demo. A seção 4 do CV-REF-002 confere cada "existe" com o que se
sabe hoje. Os pontos que pedem cuidado:
- o Instagram está travado na Meta;
- o IluminaDF tem envio desligado;
- o "ADM 24h" não foi identificado;
- a ordem das ondas e o DETRAN não vieram do Daniel;
- a pedra na via não está confirmada e supõe dados da PMDF que não existem.

**[Equipe]**

---

## 8. Números públicos já levantados

Uma seleção ligada aos exemplos da conversa. Todos vêm da pesquisa de 10/11/2026
do repositório `cityView` (`docs/fonte/2026-11-10-pesquisa-dados-publicos.md`),
onde estão os links. Antes de usar qualquer número, confira lá a fonte e o
período. **[Pesquisa]**

| Tema | Número | Período | Fonte |
| --- | --- | --- | --- |
| População do DF | 2.817.381 | Censo 2022 | IBGE/IPEDF |
| Regiões administrativas | 35 desde dez./2022; mais duas aprovadas pela CLDF em 30/06/2026, sanção não confirmada | 2022–2026 | Correio Braziliense; Correio da Manhã |
| Ouvidoria do GDF (162 / Participa DF) | 900 a 1.000 manifestações por dia; tempo médio de resposta de 9,8 dias; 90 órgãos no sistema | 2024 | Jornal de Brasília, 20/11/2024 |
| 190 da PMDF | 134.091 ocorrências atendidas; ~5 mil ligações por dia em 2025 | 2024 | CB.Poder, 23/01/2025; Jornal de Brasília, 05/05/2025 |
| Barulho | 5.467 chamados de perturbação do sossego à PMDF e 1.278 notificações de poluição sonora ao Ibram/Ouvidoria. Ceilândia, Samambaia e Taguatinga lideram no 190; Plano Piloto lidera no Ibram | 1º sem. 2024 | Correio Braziliense, 12/08/2024 |
| Iluminação pública (CEB IPes) | 14.487 chamados da população por quatro canais: app 46,8%, telefone 155 27,6%, internet 18,7%, WhatsApp 6,9% | jul.–set. 2026 | Sou Brasília / Agência Brasília, 29/10/2026 |
| Iluminação na Ouvidoria | 6.038 queixas, +81% sobre o mesmo período de 2024 | jan.–set. 2025 | Metrópoles, 30/09/2025 |
| CAESB | 36.778 manifestações à ouvidoria própria; canais 115, WhatsApp e app | 2025 | Relatório de Gestão da Ouvidoria Caesb 2025 |

A mesma pesquisa reúne casos documentados de problemas que atravessam órgãos:
iluminação apagada × furto de cabos × sensação de insegurança; buraco na via ×
acidente × condenação da Novacap; barulho registrado em dois canais e dois órgãos;
entulho × SLU × DF Legal × administração regional (seção 9 da pesquisa).

---

## 9. O que ainda não sabemos

Perguntas em aberto. Nenhuma bloqueia a documentação. Quando houver resposta,
ela entra como acréscimo, com data e origem.

### Sobre o que o Daniel quer

| # | Pergunta |
| --- | --- |
| 9.1 | A abertura de todas as demandas fica centralizada no City View? (leitura da equipe: sim; ver [4.3](#43-uma-camada-única-de-contato-com-o-cidadão)) |
| 9.2 | O produto da Viewtinet entra na oferta ou serve só de referência de observabilidade? |
| 9.3 | Percepção e dados de operação ([7.1](#71-três-sinais-da-cidade)) entram na proposta? Como diferencial central ou como evolução? |
| 9.4 | O que já foi conversado com o governo sobre polícia: PMDF (190, sossego), PCDF (notícia-crime) ou as duas? |
| 9.5 | Qual é o projeto de Madri citado como referência? |
| 9.6 | O que são "ADM 24h" e "ADM72"? |
| 9.7 | A demo entra já na reunião com os assessores ou só a apresentação? |
| 9.8 | Quais indicadores a governadora quer ver primeiro? |
| 9.9 | O que "prever problemas" significa para a gestão? |

### Sobre o cliente e a venda

| # | Pergunta |
| --- | --- |
| 9.10 | Quem é o cliente formal e o patrocinador dentro do GDF? |
| 9.11 | Quem são os assessores que verão a primeira apresentação? |
| 9.12 | Qual seria o modelo comercial? |

### Sobre o produto, se a venda avançar

| # | Pergunta |
| --- | --- |
| 9.13 | Começar pelo DF inteiro ou por algumas regiões? |
| 9.14 | Quais áreas e órgãos primeiro? |
| 9.15 | Quais legados existem, quem responde por eles e como se chega a cada um (API, robô, arquivos)? |
| 9.16 | Robô é aceito onde não houver API? |
| 9.17 | Há acesso aos chamados abertos direto nos órgãos (190, 115, 162…)? |
| 9.18 | Quem revisa e encaminha as demandas na escala do DF? Quem decide quando um incidente muda de área? |
| 9.19 | Que nível de transparência pública a gestão quer no começo? |
| 9.20 | Tempo real é necessário? Existe telão e infraestrutura para a sala de guerra? |
| 9.21 | Onde o sistema seria hospedado? |
| 9.22 | Quem é o encarregado de dados (LGPD) do governo? |
| 9.23 | Se a percepção entrar: o governo já contrata monitoramento de redes? Quem seria o dono dessa camada? Há acesso a filas e tempos de espera da saúde? |

### Sobre fatos citados

| # | Pergunta |
| --- | --- |
| 9.24 | O caso do ator e das pedras na via: nome, local e ano |
| 9.25 | A medida de adesão de Águas Claras em relação ao portal oficial, que ainda não existe |
| 9.26 | Quantas RAs existem hoje (35, 36 ou 37)? |

---

## 10. Nomes

| Nome | O que é |
| --- | --- |
| **City View** | O nome do produto, até que se decida outro. Escreve-se assim, separado |
| SOMA | Nome considerado e abandonado em 10/11/2026 |
| CityView | Nome de trabalho no repositório antigo |
| Viewtinet | Empresa espanhola de observabilidade com que o Daniel trabalha (na transcrição, "Viltinet") |
| dfac, DFÁGUASCLARAS, Máquina de Ouvidoria, Zela DF | Projetos e canais anteriores ([CV-REF-001](CV-REF-001-historico-dos-projetos.md), seção 6) |
| Sala de guerra | Expressão da conversa para a tela da governadora |

As outras grafias erradas da transcrição estão no cabeçalho da
[CV-ATA-001](fonte/CV-ATA-001-conversa-daniel-2026-11-10.md).

---

## 11. Os documentos do projeto

| Documento | O que tem |
| --- | --- |
| [CV-SPEC-000 Documento Magno](CV-SPEC-000-documento-magno.md) | Este documento |
| [CV-ATA-001 Conversa com o Daniel](fonte/CV-ATA-001-conversa-daniel-2026-11-10.md) | A transcrição da conversa de 10/11/2026, fonte primária |
| [CV-REF-001 Histórico dos projetos](CV-REF-001-historico-dos-projetos.md) | De onde o projeto veio: dfac, Zela DF, primeira tentativa do CityView |
| [CV-REF-002 Rascunho do fluxo e do roteiro](CV-REF-002-rascunho-fluxo-e-roteiro.md) | *Acréscimo de 11/11/2026.* Fluxograma em camadas, caso da pedra na via e roteiro de seis passos, anteriores à demo exploratória, conferidos com o que se sabe hoje |
| [CV-APR-001 Roteiro da apresentação](CV-APR-001-roteiro-da-apresentacao.md) | *Acréscimo de 11/11/2026.* Os 18 slides da apresentação base (direção visual C · Híbrida): mensagem, tela, fala, origem e momentos de demo, com checagem de completude |
| [CV-DEM-001 Roadmap da demo](CV-DEM-001-roadmap-da-demo.md) | *Acréscimo de 11/11/2026.* Como a demo será construída em iterações (I0 a I6), a pilha, a organização do código e a decisão de reuso do motor da demo exploratória. *Acréscimo de 12/11/2026:* v0.2. A demo fica na pasta `demo-view/` (era `demo/`), autocontida; a I0 (fundação) está construída e aguarda a revisão da equipe *Acréscimo de 12/11/2026:* v0.3, com a revisão visual e do mapa da I1 (base grafite no lugar da direção C, mapa de calor como leitura principal, imagem de satélite) |
| [CV-REF-003 Framework de produção de vídeo](CV-REF-003-framework-de-video.md) | *Acréscimo de 11/11/2026.* O framework dos filmes da NORNA (Higgsfield + Remotion), adotado como ferramenta principal para o vídeo do City View, com o que muda de um produto para o outro |
| [CV-VID-001 Roteiro do vídeo](CV-VID-001-roteiro-do-video.md) | *Acréscimo de 11/11/2026.* O filme "A cidade conectada" (1min50s, 16:9), plano a plano: Brasília como rede, silos, virada em grafo e rede neural, três casos de inteligência, visões e prova. Portão 0 do framework. *Acréscimo de 12/11/2026:* a r1 substitui a r0: filme de abertura de 1min10s, um só caso (buraco que é vazamento) com a jornada do cidadão, sem casos de segurança nem previsão |
| [CV-DS-001 Design system](CV-DS-001-design-system.md) | *Acréscimo de 12/11/2026.* O design system "Sala de Operações", mapeado a partir da apresentação em rolagem: princípios, tokens dos dois temas, tipografia, escala, componentes, mapa, movimento e acessibilidade. Código em `design-system/`, usado pela apresentação em rolagem e pela demo |
| [CV-DEM-002 Revisão da demo por papéis](CV-DEM-002-revisao-por-papeis.md) | *Acréscimo de 12/11/2026.* Leitura crítica da demo como espectador, em quatro papéis (assessor, governadora, cientista de dados, tomador de decisão), com achados, propostas, inspirações pesquisadas e priorização. Não é decisão |

Os nomes seguem o formato `CV-<TIPO>-<NNN>-<slug>.md`. Tipos em uso: `SPEC`
(o magno), `ATA` (registro de conversa) e `REF` (documento de referência). A
versão fica dentro do documento, nunca no nome do arquivo.

---

## 12. Registro de acréscimos

| Data | O que entrou |
| --- | --- |
| 11/11/2026 | Criação. Substitui o magno v1.1 (10/11/2026), descartado. Reúne a conversa com o Daniel por tema, os exemplos, o que já existe, as ideias da equipe (marcadas como tais), números públicos com fonte e as perguntas em aberto. Incorpora as leituras da equipe de 11/11/2026: grafia "Viewtinet", centralização das demandas, polícia e telefonia como exemplos, ausência de prazo, papel do caso Águas Claras e "observabilidade cidadã" como adendo |
| 11/11/2026 | Leitura dos repositórios `City-view` e `dfac-agentic-saas`. Seção 3: a apresentação começa do zero, com o motivo e a ordem (apresentação concisa → incremento → demo). Seção 6: a apresentação de 14 slides da primeira tentativa como referência; o pitch do Zela DF nunca foi mostrado. Seção 6.2: o Portal do Cidadão já tem conexão por extensão com login manual; a prioridade por recorrência já existe no dfac desde 01/10/2026 |
| 11/11/2026 | Seção 7.9 e seção 11: o rascunho de fluxo em camadas e de roteiro, anterior à demo exploratória, registrado em CV-REF-002 como checagem de completude |
| 11/11/2026 | Seção 11: o roteiro da apresentação base (CV-APR-001, 18 slides, direção visual C · Híbrida) e o roadmap da demo (CV-DEM-001, com a decisão de portar o motor da demo exploratória e refazer as telas) |
| 11/11/2026 | Seção 11: o framework de produção de vídeo da NORNA (CV-REF-003), adotado pela equipe como ferramenta principal para o vídeo do City View |
| 11/11/2026 | Seção 11: o roteiro do vídeo (CV-VID-001, r0), portão 0 do framework de vídeo |
| 12/11/2026 | Seção 11: o roteiro do vídeo passa à r1, reescrito a partir da crítica à r0 (o histórico está no próprio CV-VID-001) |
| 12/11/2026 | Seção 11: o roadmap da demo passa à v0.2 (pasta `demo-view/`, autocontida) e a iteração I0 (fundação) está construída: mapa do DF com as 37 RAs, selo, painel de exemplo e gerador de incidentes no modelo único, com testes |
| 12/11/2026 | Seção 11: o design system "Sala de Operações" (CV-DS-001), com o pacote `design-system/` e a casca da demo (`demo/`) vestida por ele |
| 12/11/2026 | Roteiro do vídeo na r2 (o caso vira o apagão) e primeira montagem do filme na pasta `video/` (`entregas/CityView_filme_16x9_r1.mp4`); o que mudou do roteiro para a montagem está na seção 9.2 do CV-VID-001 |
| 12/11/2026 | Decisão da equipe: a demo segue na pasta `demo-view/` (do Lucca), com o visual da direção C; a pasta `demo/` fica como vitrine do design system, que vale para a apresentação em rolagem (CV-DEM-001, seção 9; CV-DS-001) |
| 12/11/2026 | A pasta `demo/` (vitrine do design system) passa a se chamar `design-system-vitrine/`, para não se confundir com a demo, que continua em `demo-view/`. Onde os registros anteriores dizem `demo/`, é dessa vitrine que se trata |
| 12/11/2026 | Seção 11: o roadmap da demo passa à v0.3. A demo (`demo-view/`) deixa a direção C por uma base grafite, com cor só para função, e o mapa da I1 passa a ter o calor como leitura principal, sobre imagem de satélite (Sentinel-2 e a imagem de 50 cm do GDF, cuja licença falta confirmar com a SEDUH). Saem os modos noturno e térmico |
| 12/11/2026 | Seção 11: o roadmap da demo passa à v0.4. A demo (`demo-view/`) passa a ter oito telas (sala, gestão, regiões, inteligência, previsões, jornada, cidadão e integrações), cobrindo as da demo exploratória; a comparação tela a tela e as decisões estão na seção 9.3 do CV-DEM-001. Dados de operação dos órgãos e previsão aparecem como proposta (perguntas 9.3 e 9.9); falta "pergunte à cidade" |
| 12/11/2026 | Seção 11: a revisão da demo por papéis (CV-DEM-002), com achados e propostas para discussão; a hipótese de que o projeto de Madri (pergunta 9.5) seja o MiNT fica registrada lá, sem confirmação. Na demo, abrir um insight ganha animação de abertura e de seleção (branch `demo/i3-animacao`) |
| 13/11/2026 | Seção 11: a demo ganha o ciclo do incidente com ida e volta entre o City View e os órgãos (plano da IA por órgão, resposta do órgão, devolução, fecho com a mensagem ao cidadão, registro de decisões), a sala passa a mostrar os incidentes, os números ganham variação e meta de exemplo, o grafo permite voltar no tempo e a entrada passa a ser por perfil. Feito a partir do CV-DEM-002 (seção 7 dele); decisões no CV-DEM-001, seção 9.4. O envio aos sistemas dos órgãos aparece como proposta |

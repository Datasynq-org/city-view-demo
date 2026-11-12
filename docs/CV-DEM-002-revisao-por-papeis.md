# CV-DEM-002 · Revisão da demo por papéis

| Campo | Valor |
| --- | --- |
| Código | CV-DEM-002 |
| Versão | 0.1 (12/11/2026), para discussão da equipe |
| O que é | Uma leitura crítica da demo (`demo-view/`, oito telas, branch `demo/i3-animacao`) feita como espectador, em quatro papéis: assessor, governadora, cientista de dados e tomador de decisão. Cada ponto traz a evidência, o motivo e uma proposta |
| O que não é | Não é decisão nem plano de trabalho. Nada aqui muda a demo. O que a equipe aceitar vira trabalho depois, com plano próprio |
| Quem pediu | Sammuel, em 12/11/2026 |

## 1. Como ler

Cada afirmação diz de onde vem:

- **[Tela]** o que está na demo hoje, com a tela e, quando ajuda, o arquivo.
- **[Doc]** o que está na documentação (magno, ATA, CV-APR-001, CV-DEM-001).
- **[Pesquisa]** o que foi conferido fora, com o endereço.
- **[Revisão]** opinião de quem revisou. É a maior parte das propostas.

Os papéis são encenados: ninguém do governo viu a demo. As perguntas "que eu
faria na sala" são hipóteses para a equipe se preparar, não relatos.

Os nomes das inspirações (seção 5) aparecem aqui porque o documento é interno.
Continuam fora de qualquer tela, slide ou fala (magno 7.6).

**O resumo em seis linhas:**

1. A demo mostra bem o *estado* da cidade e o *achado* da IA. Mostra pouco o que
   acontece **depois** do achado: quem assume, até quando, e como se sabe que
   resolveu. É a maior lacuna, e é onde o tomador de decisão vê valor.
2. A sala de situação e a inteligência estão separadas. Quem abre a sala não vê
   que há um incidente crítico; vê uma lista de "falta de energia" repetida.
3. Faltam **metas** e **variação**. Um número sem alvo e sem "contra ontem" não
   diz se está bom.
4. Três números pedem cuidado antes de qualquer plateia técnica: a
   **confiança** do insight, o **acerto** da previsão e os **repetidos**.
5. Há um risco de privacidade na inteligência: pontos de chamados de segurança
   no endereço exato, e um caso que identifica uma casa.
6. Três perguntas ao Daniel mudam telas inteiras: que indicadores a governadora
   quer primeiro (9.8), o que "prever" significa (9.9) e o grau de transparência
   inicial (9.19).

---

## 2. Quatro leituras

### 2.1 Assessor

Quem filtra o que chega à governadora. Procura o que pode dar errado: manchete,
questionamento jurídico, promessa que não se cumpre.

**O que funciona**
- O selo "Ambiente de demonstração · dados simulados" fica em todas as telas, e
  as previsões e a operação dos órgãos levam "proposta". **[Tela]** Responde à
  primeira desconfiança, a de que os órgãos já estariam conectados (magno 7.4).
- Integrações diz o que existe, o que está pronto e o que é proposta, e descreve
  os três conectores reais como são, sem chamar de API oficial. **[Tela]**
- O mapa público abre no grau mais conservador ("Só o resolvido") e segurança
  pública nunca aparece nele. **[Tela]** `telas/cidadao/TelaCidadao.tsx:74`
- "A IA sugere. Uma pessoa decide antes de qualquer órgão ser avisado." está
  escrito no ponto da decisão. **[Tela]** É a resposta preparada no roteiro
  (CV-APR-001, perguntas prováveis).

**O que falta**
- **Quem decide.** A tela diz "uma pessoa confirma", mas não diz quem: operador
  da sala, o órgão dono, um comitê? É a pergunta 9.18 do magno, e o assessor vai
  fazê-la. **[Doc] [Revisão]**
- **Registro do que foi decidido.** Não há histórico de quem confirmou ou
  descartou, quando e por quê. Para o controle interno e para o TCDF, a trilha
  vale tanto quanto o achado. **[Tela] [Revisão]**

**O que confunde ou preocupa**
- **A Gestão abre dizendo "A gestão está mais lenta que no período anterior".**
  **[Tela]** A conta está certa e a comparação é justa (CV-DEM-001, 9.3), mas é
  a primeira frase que o assessor lê, sobre a gestão de quem ele assessora. Ao
  lado, "resolvido no prazo" sobe 0,6 ponto: a mensagem é mista e a tela escolhe
  a metade ruim. Ver achado V1.
- **Tabela de órgãos em ranking.** **[Tela]** Põe na mesma lista órgão do
  governo, concessionária privada (Neoenergia) e polícia, ordenados por volume
  de chamados. Quem atende mais gente aparece no topo como se fosse o pior. Ver
  achado V5.
- **"47 ligações ao 190 para a mesma casa"** e os pontos de cada chamado no
  grafo. **[Tela]** `inteligencia/casos.ts:108` Dado simulado, mas mostra o
  produto apontando para um domicílio. Contraria o cuidado "observar a cidade e
  a gestão, nunca pessoas" (magno 7.6). Ver achado R1.
- **"Roubo ou furto em andamento · Gama · 1,7×"** em Previsões. **[Tela]** Num
  telão ao lado do gabinete, anomalia de segurança por região é assunto
  sensível. Decidir o que vai ao telão e o que fica na tela do operador.
- **O apagão diz "quatro órgãos"** e os chamados vêm de três (Neoenergia,
  Detran, Defesa Civil). **[Tela]** `inteligencia/casos.ts:138` Pequeno, mas é o
  tipo de coisa que um assessor aponta para medir o cuidado do resto.

**O que eu perguntaria na sala**
- Quem aperta "confirmar"? Com que respaldo?
- Se a IA juntar o que não devia e um órgão for acionado à toa, de quem é a
  responsabilidade?
- Esse ranking de órgãos e de regiões pode vazar? Quem tem acesso?
- O que disso a população vê, e quem escolhe?

### 2.2 Governadora

Tem pouco tempo. Quer saber onde agir, se a gestão dela está andando e o que
pode mostrar.

**O que funciona**
- A sala responde em dez segundos "onde está pegando": o calor sobre o mapa é a
  leitura principal, como ela pediu (ATA, "um mapa de calor, onde as coisas estão
  pegando"; magno 4.6). **[Tela] [Doc]**
- Cada tela tem uma pergunta no alto ("Onde a cidade precisa de mim agora?").
  **[Tela]** Ajuda quem chega sem treinamento.
- O insight é lido em quatro partes curtas e termina numa frase de ganho ("743
  chamados em 4 órgãos consolidados em 1 incidente"). **[Tela]**
- O tema claro serve à sala iluminada e ao papel. **[Tela]**

**O que falta**
- **"O que mudou desde ontem?"** Os quatro números de "A cidade agora" não têm
  variação nem meta. **[Tela]** 8.337 abertos é muito ou pouco? Ver V2 e V3.
- **O incidente crítico não está na sala.** A inteligência achou um temporal
  com 743 chamados; na sala isso aparece como seis linhas seguidas de "Falta de
  energia" em "Chegando agora" e um atalho pequeno "9 insights" no canto de
  baixo. **[Tela]** A tela mais importante não conta a notícia mais importante.
  Ver F2.
- **"Quem está cuidando disso?"** Depois de confirmar, o incidente some da
  conversa. Ver F1.
- **Um resumo para levar.** Ela não vai ficar na frente do telão. Falta a página
  única do dia: o que piorou, o que foi resolvido, o que pede decisão. O magno já
  previa "relatórios periódicos" (7.2). Ver A4.
- **Perguntar.** "Onde a perturbação do sossego cresceu este mês?" (magno 7.2)
  é o gesto que mais aproxima a ferramenta de quem não opera painéis. Segue por
  fazer (CV-DEM-001, 9.3). Ver A3.

**O que confunde**
- **Oito telas.** Para ela são demais; três bastam (sala, gestão, o que o
  cidadão vê). As outras são do operador e do gestor. Ver F4.
- **Mediana.** "Tempo até resolver: 4 h, mediana" pede tradução: "metade dos
  chamados é resolvida em até 4 horas". Ver V4.

**O que eu perguntaria na sala**
- O que piorou esta semana, e por quê?
- Qual secretaria está segurando a fila?
- O que eu posso mostrar para a população hoje sem me arrepender amanhã?
- Isso funciona no meu celular?

### 2.3 Cientista de dados

Procura onde o número não sustenta a frase.

**O que funciona**
- A comparação de períodos mede o anterior "com a mesma idade", e o prazo por
  dia só conta chamados com prazo vencido. **[Tela] [Doc]** (CV-DEM-001, 9.3)
  São dois vieses clássicos de painel de atendimento, e a demo evita os dois.
- A previsão mostra faixa de 80%, diz o método em passos e leva "proposta".
  **[Tela]**
- Regiões compara por 10 mil habitantes e marca população estimada × Censo.
  **[Tela]** `indicadores/regioes.ts:25`
- A confiança é decomposta em três partes visíveis (assunto, lugar, hora).
  **[Tela]**

**O que não se sustenta**
- **"Confiança 77%" não é probabilidade.** É uma nota: 0,45 + 0,4 × força média
  das ligações + 0,15 × um termo de volume, com teto de 0,97. **[Tela]**
  `inteligencia/agrupamento.ts:272` Um leitor entende "em 77 de 100 casos assim
  a IA acerta", e nada mede isso. Ver D1.
- **"Acerto da previsão 91%"** vem de um único teste: prever as duas últimas
  semanas. **[Tela]** `inteligencia/previsao.ts:148` Uma janela não é acerto, é
  um exemplo. E falta a comparação com o palpite ingênuo ("igual à semana
  passada"), que em séries assim costuma acertar perto disso. Ver D2.
- **"Estação chuvosa"** aparece como motivo de alta, com oito semanas de
  histórico. **[Tela]** Oito semanas não enxergam estação. Ou o motivo vem de
  fora (calendário, previsão do tempo, dito como tal), ou sai.
- **"Onde reforçar as equipes"** lista regiões com +2% a +4%. **[Tela]** Está
  dentro da margem que a própria tela desenha. Recomendar reforço em cima de
  ruído é o tipo de erro que desmoraliza previsão. Ver D3.
- **Dois "repetidos" diferentes.** Gestão mostra 1.173 repetidos (mesmo tipo, a
  menos de 150 m e de 24 h); Inteligência mostra 1.454 "atendimentos repetidos a
  menos" (em cada incidente, todos menos um). **[Tela]**
  `inteligencia/resumo.ts:36` São contas diferentes com nomes parecidos. Ver D4.
- **Os casos são plantados.** Os nove insights saem de `inteligencia/casos.ts`;
  o motor encontra o que a equipe escondeu. **[Tela]** É legítimo numa demo e o
  selo cobre, mas a pergunta "e em dado real, quantos alarmes falsos?" não tem
  resposta. Ver D5.
- **Calor por contagem absoluta.** Na sala, a região mais populosa fica sempre
  mais quente; o valor por 10 mil habitantes está só na dica. **[Tela]**
  `mapa/camadas/chamados.ts:9` Para "onde está pegando", a taxa ou o desvio
  contra o normal da região diz mais que o volume.
- **Mapa público com cinco tons para três pontos.** As faixas vão de 83% a 86%.
  **[Tela]** O mapa pinta de escuro e claro regiões praticamente iguais. Ver V6.

**O que falta**
- **Viés de quem reclama.** Chamado mede quem tem canal e costume de reclamar,
  não quem mais precisa. Era o que a triangulação respondia (magno 7.2: "quase
  nenhuma demanda → problema invisível"). Fora da demo, o painel pode reforçar o
  atendimento a quem já é mais atendido. Ver A6.
- **Retorno das decisões para o modelo.** O descarte pede motivo ("Não é o mesmo
  problema", "Já está sendo tratado", "Dados insuficientes") e o motivo não vai
  a lugar nenhum. **[Tela]** `inteligencia/decisoes.ts:16`

**O que eu perguntaria na sala**
- Como vocês sabem que dois chamados são o mesmo fato? Quem definiu a tabela?
- Qual a taxa de falso positivo aceitável antes de avisar um órgão?
- A previsão ganha de "semana passada"?

### 2.4 Tomador de decisão

Secretário, presidente de companhia, gestor de órgão. Recebe o incidente e tem
de fazer alguma coisa com ele.

**O que funciona**
- "O que sugere" vem em passos numerados e curtos. **[Tela]**
- A janela de cinco segundos para cancelar o envio e o descarte com motivo
  mostram que o controle é de quem decide. **[Tela]**
- "Por órgão" mostra de que filas o incidente é feito, e a visão do gestor
  mostra só a fila dele e o que cruza com as dos outros. **[Tela]**
- A jornada mostra que o chamado nasce em qualquer sistema e que o órgão
  continua trabalhando no dele (magno 4.2, "acoplação e não substituição").
  **[Tela] [Doc]**

**O que falta**
- **O "e agora?".** Confirmado o incidente, a tela mostra "avisados (simulado)"
  e para. **[Tela]** Não há responsável principal, prazo, situação, nem volta
  ("resolvido: 743 cidadãos avisados com uma resposta só"). A recomendação até
  nomeia o responsável em texto ("responsável principal: Neoenergia",
  `inteligencia/casos.ts:159`), mas isso não vira estado. O Daniel descreveu
  exatamente esse fim: "geração de incidentes e acompanhamento e resolução"
  (magno 4.5). Ver F1.
- **Minha fila de incidentes.** O gestor vê a fila de *chamados* do órgão. Não
  vê "os incidentes em que meu órgão é o dono ou foi avisado". **[Tela]**
- **O que o cidadão recebe.** O incidente promete "uma resposta só" para
  centenas de pessoas; a mensagem que elas recebem não aparece em lugar nenhum.
  **[Tela]** É a ligação natural com a tela do cidadão.
- **Discordar.** Se o órgão avisado acha que não é com ele, não há caminho de
  volta ("não é meu", "já resolvi", "falta informação"). A pergunta 9.18 ("quem
  decide quando um incidente muda de área?") continua sem resposta. **[Doc]**

**O que confunde**
- **Sensibilidade.** Mexer no controle refaz os grupos e apaga as decisões.
  **[Tela]** `telas/inteligencia/TelaInteligencia.tsx:57` Para quem decide,
  parâmetro de modelo não é controle de tela; é configuração de implantação.

**O que eu perguntaria na sala**
- Isso chega no meu sistema ou eu tenho de abrir mais um?
- Quem cobra o prazo: vocês ou eu?
- Se eu resolver no meu sistema, o City View fica sabendo sozinho?

---

## 3. Achados e propostas

Esforço: **P** até um dia, **M** alguns dias, **G** uma iteração inteira. É
estimativa de quem revisou.

### 3.1 Repensar o fluxo

| # | Achado | Proposta | Esf. | Serve a |
| --- | --- | --- | --- | --- |
| F1 | O insight acaba no "confirmar". Não há dono, prazo, situação nem fechamento | O incidente confirmado ganha **responsável principal, prazo e situação** (o ciclo do magno 7.3: encaminhado → em atendimento → resolvido) e passa a morar numa lista "incidentes em andamento". Ao resolver, a tela fecha a conta: quantos cidadãos avisados, em quanto tempo | M | Decisão, governadora |
| F2 | A sala não mostra os incidentes; a inteligência não mostra a cidade | Na sala, uma faixa **"pede atenção agora"** com os um a três incidentes mais graves; clicar voa até o lugar e abre o insight. Em "Chegando agora", os chamados de um incidente entram agrupados ("Falta de energia · 640 · parte do apagão") | M | Governadora |
| F3 | O descarte e a confirmação não deixam rastro | **Registro de decisões**: quem, quando, o quê, motivo. Alimenta o número "de cada 10 sugestões, N foram confirmadas", que substitui a confiança sem lastro (D1) | P/M | Assessor, dados |
| F4 | Uma navegação só, de oito telas, para públicos diferentes | **Entrar por perfil** (governadora · gestor de órgão · operador da sala): a mesma demo, com as telas e a ordem de cada um. Atende "um dashboard para o gestor de…" (magno 4.6) e o "logar em alguma coisa" (CV-DEM-001) | M | Todos |
| F5 | O órgão avisado não tem como responder | No incidente, a resposta do órgão: **assumi · não é comigo · já resolvido**. "Não é comigo" devolve para quem revisa | M | Decisão |

### 3.2 Mudar a visualização

| # | Achado | Proposta | Esf. | Serve a |
| --- | --- | --- | --- | --- |
| V1 | Gestão abre com "mais lenta" enquanto o prazo melhora | Frase que diz as duas coisas ("resolve um pouco mais dentro do prazo e demora 10% mais"). Não maquiar a conta; se a equipe quiser abrir com notícia boa, muda-se a semente do dado simulado, à vista | P | Assessor |
| V2 | Números sem meta | Uma **meta por indicador**, definida pela gestão, desenhada como linha. Sem meta, mostrar ao menos a faixa normal do próprio indicador | P/M | Governadora |
| V3 | Sala sem variação | Em cada número de "A cidade agora", o **contra ontem / contra a semana passada**, como a Gestão já faz | P | Governadora |
| V4 | Mediana sozinha | Trocar o rótulo por frase ("metade resolvida em até 4 h") e acrescentar a cauda ("9 em cada 10 em até X") | P | Governadora, dados |
| V5 | Ranking de órgãos por volume | Ordenar por padrão pela **parte fora do prazo**; marcar a natureza (governo · concessionária · segurança); volume vira coluna, não ordem | P | Assessor |
| V6 | Mapa público com escala esticada | Escala com domínio fixo e declarado (por exemplo 50% a 100%) e o valor escrito na região | P | Dados, assessor |
| V7 | Calor por volume absoluto | Um modo "fora do normal": cada região contra a própria média. Mostra onde *mudou*, não onde mora mais gente | M | Governadora, dados |
| V8 | A linha do tempo do insight é uma lista | **Voltar no tempo no mapa**: uma barra de horas que mostra o incidente se formando (os pontos chegando, as ligações aparecendo). É a cena mais forte que a demo ainda não tem | M/G | Todos |

### 3.3 Acrescentar

| # | Achado | Proposta | Esf. | Serve a |
| --- | --- | --- | --- | --- |
| A1 | Nenhum número diz de onde veio | **Origem em cada número**: de que sistema, por qual conector, atualizado quando, real ou simulado. A tela de Integrações já tem o catálogo; falta a ligação a partir do número | M | Assessor, dados |
| A2 | O ganho é contado em chamados | Dizer o ganho em **tempo de equipe e em cidadãos avisados**, não só em "atendimentos a menos". Só com premissa declarada e conferida com o Daniel | P | Decisão |
| A3 | "Pergunte à cidade" por fazer | Versão de demo **sem chave**: cinco ou seis perguntas prontas, respondidas com contas reais sobre a base simulada, o mapa respondendo. A versão livre fica para quando houver proxy | M | Governadora |
| A4 | Não há o que levar da sala | **Resumo do dia** numa página (tema claro, imprimível): o que piorou, o que foi resolvido, o que pede decisão | P/M | Governadora, assessor |
| A5 | O cidadão do incidente não aparece | No incidente confirmado, **a mensagem que os cidadãos recebem**, e a ligação com o acompanhamento da tela do cidadão | P | Decisão |
| A6 | Triangulação e percepção estão no magno e fora da demo | Manter fora até a resposta do Daniel (9.3). O deck já as deixou de fora (CV-APR-001). Se entrarem, um único cartão "problema invisível", marcado como proposta, sem rede social | P | Dados |

### 3.4 Incrementar o que já existe (método)

| # | Achado | Proposta | Esf. |
| --- | --- | --- | --- |
| D1 | "Confiança 77%" lida como probabilidade | Trocar por faixa em palavras (alta · média · baixa) e manter as três barras. O percentual volta quando houver registro de decisões para calibrar (F3) | P |
| D2 | "Acerto 91%" de uma janela só | Testar em várias janelas, mostrar o erro típico e comparar com "igual à semana passada". Se não ganhar do ingênuo, dizer | P/M |
| D3 | Reforço de equipes dentro do ruído | Só listar região cuja alta sai da margem; as outras ficam como "sem mudança relevante" | P |
| D4 | Dois "repetidos" | Um nome para cada conta ("chamados parecidos" na Gestão; "atendimentos poupados" na Inteligência) ou uma conta só | P |
| D5 | Casos plantados | Incluir **um falso positivo de propósito**: uma sugestão errada que a pessoa descarta. Mostra o controle humano funcionando e responde à pergunta antes de ela ser feita | P |
| D6 | "Estação chuvosa" sem dado que sustente | Declarar a fonte (calendário, previsão do tempo) ou tirar | P |

### 3.5 Riscos a tratar antes de mostrar

| # | Achado | Proposta | Esf. |
| --- | --- | --- | --- |
| R1 | Pontos de chamados de segurança no endereço; caso "a mesma casa" | Em segurança, o ponto vira **quadra ou trecho** (deslocado e agregado); o caso do sossego passa a "o mesmo endereço" sem ponto exato, ou "a mesma quadra". Vale escrever a regra na tela | P/M |
| R2 | Anomalia de segurança no telão | Um **modo telão** que mostra só o que pode ficar na parede | P |
| R3 | "Quatro órgãos" × três | Corrigir o texto do caso | P |

---

## 4. O que decidir com o Daniel

Somam-se às perguntas do magno (seção 9); as três primeiras já estão lá e são
repetidas porque mudam telas.

| # | Pergunta | O que muda na demo |
| --- | --- | --- |
| 9.8 | Que indicadores a governadora quer ver primeiro? | A sala e a página de resumo (V2, V3, A4) |
| 9.9 | O que "prever" significa para a gestão? | Se Previsões é tela, cartão dentro da sala, ou fica de fora |
| 9.19 | Que transparência a gestão quer no começo? | O grau em que o mapa público abre |
| 9.18 | Quem confirma um incidente, e quem decide quando muda de área? | O fluxo F1 e F5 inteiro |
| nova | O incidente confirmado é **aberto no sistema do órgão** pelo City View, ou o órgão só é avisado? | Se a demo mostra "aberto lá, protocolo tal" ou só "avisado" |
| nova | Ranking de órgãos e de regiões pode aparecer para a governadora? Para os gestores uns dos outros? | V5 e a visão por perfil (F4) |
| nova | Há metas de atendimento já pactuadas (cartas de serviço, contratos de concessão)? | V2 |
| 9.5 | Qual é o projeto de Madri? | Seção 5 deste documento |

---

## 5. Inspirações

O que vale levar de cada referência e o que não vale. A pesquisa é de
12/11/2026. **(lido)** quer dizer que a página foi aberta e lida; **(resumo)**
quer dizer que só o resumo do resultado da busca foi lido, e o fato precisa ser
conferido antes de sair deste documento. Os nomes ficam aqui dentro (magno 7.6).

### 5.1 Madri: a hipótese é o MiNT

O magno registra o projeto de Madri como "não identificado" (4.9 e pergunta
9.5). Na transcrição, a referência aparece na fala de quem pergunta ao Daniel
("a gente viu aqui o exemplo de […] o Madrid, que foi um projeto da Espanha",
ATA 41–43), então a própria equipe deve saber qual é. **A revisão não afirma
qual é.** O candidato mais provável:

- **MiNT (Madrid iNTeligente)**, da prefeitura de Madri com a IBM (via INSA),
  apresentado em julho de 2014, cerca de 14,7 milhões de euros. Cobre serviços
  urbanos: resíduos, limpeza, árvores, irrigação, pavimento, iluminação, fontes.
  Junta avisos do cidadão (foto e local, mensagens de confirmação e de
  resolução), relatos de inspetores, sensores e dados das empresas contratadas,
  e despacha ordens de serviço. Mais de 300 indicadores, medidos em cerca de
  1.500 inspeções por dia; a prefeitura paga as empresas "em função dos níveis
  de serviço". **(lido)**
  https://esmartcity.es/2014/07/09/ibm-y-el-ayuntamiento-de-madrid-presentan-la-plataforma-mint
- Hoje, segundo um caso publicado pela própria IBM (material promocional):
  mais de 1 milhão de avisos de cidadãos por ano, 2,5 milhões de ordens de
  serviço de mais de 25 fornecedores, e a frase "passou de pagar por atividades
  a pagar por resultados". **(lido)** https://www.ibm.com/es-es/case-studies/madrid-city
- Outros sistemas de Madri que podem ser "o de Madri": o **CISEM** (centro
  integrado de segurança e emergências: polícia municipal, bombeiros e SAMUR) e
  o **Gêmeo Digital** em contratação (2024 a 2028). **(resumo)**
  https://diario.madrid.es/blog/notas-de-prensa/el-ayuntamiento-autoriza-el-contrato-para-comenzar-a-crear-el-gemelo-digital-de-madrid/

**O que levar:** o **ciclo fechado**. Aviso do cidadão → ordem de serviço →
inspeção → indicador de qualidade → consequência no contrato, com a situação
voltando ao cidadão. É o F1 deste documento com um passo a mais: o indicador
tem consequência. No DF, o paralelo são os contratos de concessão e de
terceirização (energia, iluminação, limpeza).

**O que não levar:** é municipal, de serviços urbanos e amarrado a um produto
de gestão de ativos. O City View propõe o que ele não faz: cruzar órgãos de
áreas diferentes, segurança incluída.

### 5.2 Palantir (Foundry e Gotham)

- A **Ontologia** é uma camada sobre os dados com objetos, propriedades e
  ligações, mais **ações** e segurança. **(lido)**
  https://www.palantir.com/docs/foundry/ontology/overview/
- Uma **ação** é um conjunto de mudanças que a pessoa faz de uma vez, com
  validação de permissão e efeitos (avisos, chamadas a outros sistemas), gravada
  de volta. **(lido)** https://www.palantir.com/docs/foundry/action-types/overview/
- **Linhagem**: grafo de por onde o dado passou. **Auditoria**: registro de
  toda ação. **(resumo)** https://palantir.com/docs/foundry/data-lineage ·
  https://www.palantir.com/docs/foundry/security/audit-logs-overview/
- As visões de grafo, mapa e linha do tempo do Gotham só foram confirmadas numa
  descrição antiga do produto. **(resumo)**
- Controvérsia: o contrato com o serviço de saúde inglês (2023) enfrenta
  oposição por privacidade e dependência do fornecedor. **(resumo)**
  https://computerweekly.com/news/366640417/Health-workers-call-for-Palantir-to-be-booted-from-NHS-contracts

**O que levar:** três ideias de fluxo, não o visual. (1) **O incidente é um
objeto** com ligações (chamados, órgãos, lugar, decisão), o mesmo em toda tela:
é o modelo único do CV-DEM-001. (2) **Do achado à ação no sistema de origem**,
com permissão e registro: F1, F3 e F5. (3) **Todo número responde "de onde
veio"**: A1.

**O que não levar:** análise de vínculos centrada em pessoas, e um modelo que
deixa o dado do governo refém do fornecedor. A segunda é argumento a favor: o
City View integra e o dado fica com o governo e com os órgãos.

### 5.3 Centro de Operações Rio (COR)

- Inaugurado em dezembro de 2010, depois das chuvas de abril daquele ano;
  integra cerca de 50 órgãos, entre secretarias e concessionárias; telão de 104
  m² depois da ampliação de 2022. **(lido, Wikipédia; os números variam entre as
  fontes)** https://pt.wikipedia.org/wiki/Centro_de_Opera%C3%A7%C3%B5es_Rio
- **Cinco estágios** da cidade, do 1 (normalidade) ao 5 (cidade gravemente
  afetada, além da capacidade de resposta), anunciados nos canais oficiais.
  **(lido)** https://exame.com/brasil/apos-retaliacao-do-crime-rio-entra-em-estagio-de-risco-de-alto-impacto/
- Crítica acadêmica (lida só em resumo de terceiros): ganhos em desastres e
  trânsito, pouco efeito sobre desigualdade. **(resumo)**

**O que levar:** **um estágio da cidade**, em palavra e número, com definição
simples, no alto da sala. Responde "está normal ou não?" antes de qualquer
gráfico, e é o mesmo termo para dentro e para a população. Entra junto com F2.
É também a referência brasileira que os assessores já conhecem.

**O que não levar:** o telão como espetáculo, e o deslize de coordenação de
serviços para policiamento.

### 5.4 Outras, em uma linha cada

| Referência | O que levar | Fonte |
| --- | --- | --- |
| **Boston CityScore** | Cada indicador dividido pela sua meta: acima de 1, melhor que a meta; abaixo, pior. É o V2 | (lido) https://www.boston.gov/departments/analytics-team/cityscore |
| **Baltimore CitiStat** | O painel alimenta uma **reunião com dono e cobrança**: "informação precisa e na hora, resposta rápida, tática eficaz, acompanhamento implacável". Sem rotina, painel vira enfeite. Vale para a proposta, mais que para a demo | (lido) https://www.baltimorecity.gov/opi/citistat |
| **Singapura, OneService** | O cidadão não precisa saber qual órgão; o caso é roteado. É a "camada única" do magno 4.3 | (resumo) https://mnd.gov.sg/mso/oneservice |
| **Nova York, 311** | Chamados publicados como dado aberto. A crítica também serve: "fechado" sem dizer como foi resolvido | (resumo) https://opendata.cityofnewyork.us/311-service-requests-from-2010-to-present-updates/ |
| **Brasil: SP156, Fala.BR, Colab** | Mostram que o canal único já existe por aqui. O que não existe é o cruzamento entre órgãos e o acompanhamento até resolver: é onde o City View se diferencia | (resumo) |

### 5.5 Brother Eye e God's Eye

- **Brother Eye** (DC Comics): um satélite que o Batman constrói para vigiar os
  outros heróis e que é tomado e usado contra eles. **(resumo)**
  https://en.wikipedia.org/wiki/The_OMAC_Project
- **God's Eye** (*Velozes e Furiosos 7*): um programa que invade qualquer
  câmera para localizar uma pessoa. **(resumo)**
  https://fastandfurious.fandom.com/wiki/God%27s_Eye
- **God's Eye View** (o repositório citado no magno 7.7) é referência visual de
  sala de operações e de consulta por voz.

**O que levar:** a **visão única** e, do repositório, três gestos de
interface: camadas que se ligam e desligam, a linha do tempo que se arrasta
(V8) e a pergunta falada com o mapa respondendo (A3).

**O que não levar:** o assunto. As duas histórias são sobre localizar pessoas
e perder o controle da ferramenta. O City View observa serviços e lugares. É
por isso que R1 (tirar o ponto exato dos chamados de segurança) pesa mais do
que parece: é o detalhe que separa uma coisa da outra aos olhos de um assessor.

### 5.6 O que as inspirações têm em comum

As que duraram (Madri, Rio, Baltimore) não são lembradas pela tela. São
lembradas por um **ciclo**: alguém vê, alguém assume, alguém confere, e há
consequência. A demo hoje é forte em "ver". O passo seguinte é mostrar o resto
do ciclo.

---

## 6. Priorização sugerida

**Antes de mostrar a alguém de fora** (tudo P, um a dois dias no total):
R3, R1, V1, D1, D4, D6, V4, V6. São correções de texto, de rótulo e de escala
que tiram da frente as perguntas fáceis de fazer e difíceis de responder.

**A próxima iteração que mais muda a demo:** F1 + F2 + A5, juntas. O incidente
passa a ter dono, prazo e fim, aparece na sala e fecha no cidadão. É a história
"acompanhar até resolver" (magno 4.4) contada de ponta a ponta, e hoje ela para
no meio.

**Depois:** V8 (voltar no tempo), F4 (entrar por perfil), A3 (perguntas
prontas), A4 (resumo do dia), V2 e V3 (metas e variação), F3 (registro).

**Esperar o Daniel:** A6 (triangulação), A2 (ganho em tempo de equipe), F5
(resposta do órgão), o destino de Previsões.

**Não fazer:** reconhecimento de pessoas, placas ou rostos; busca por pessoa;
percepção por rede social sem resposta à 9.3; mais efeitos no mapa. A demo já
tem movimento suficiente, e cada item acima rende mais que um efeito novo.

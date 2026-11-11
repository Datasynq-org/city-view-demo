# CV-APR-001 · Roteiro da apresentação base

| Campo | Valor |
| --- | --- |
| Código | CV-APR-001 |
| Versão | 0.1 (11/11/2026), para revisão da equipe |
| O que é | Os 18 slides da apresentação base do City View, slide por slide: mensagem, texto da tela, fala do apresentador, origem de cada afirmação, visual e momentos de demo |
| Quem apresenta | O Daniel, primeiro aos assessores e depois à governadora (magno, seção 3) |
| Estética | Direção **C · Híbrida**: conteúdo em fundo claro, capa, divisórias e números de impacto em fundo escuro, fonte Bahnschrift. Tokens em `apresentacao/src/tema.js` |
| Fontes | [Magno](CV-SPEC-000-documento-magno.md) (CV-SPEC-000) · [Conversa com o Daniel](fonte/CV-ATA-001-conversa-daniel-2026-11-10.md) (CV-ATA-001, citada por número de linha) · [Rascunho de fluxo](CV-REF-002-rascunho-fluxo-e-roteiro.md) (CV-REF-002) |

## Como ler

- **Tela** é o texto que aparece no slide. É curto de propósito: uma ideia por slide.
- **Fala** vai para as notas do apresentador. É onde mora o detalhe.
- **Origem** usa as marcas do magno: [Conversa], [Pesquisa], [Histórico], [Equipe].
  "ATA 147" é a linha 147 da transcrição.
- **Selos** no slide: "Ilustrativo" para cenário inventado, "Proposta" para o
  que ainda não existe, "Imagem ilustrativa" para imagem gerada. Número sempre
  com fonte e data no rodapé.
- **Demo** marca o ponto em que a demonstração entra (roadmap em
  [CV-DEM-001](CV-DEM-001-roadmap-da-demo.md)).

## Linha narrativa

> O governo já tem muitos sistemas, e cada um funciona. O que falta é ver o
> todo. O City View conecta o que já existe, conversa com o cidadão onde a
> gestão quiser e transforma chamados soltos em incidentes entendidos, com
> inteligência que explica o porquê. A governadora vê a cidade e a velocidade
> da gestão; cada gestor vê a sua área; o cidadão vê o que o governo entrega.

Quatro partes: **o problema** (3 a 8), **a proposta** (9 a 13), **o que cada
um ganha** (14 e 15), **prova e caminho** (16 a 18).

---

## Abertura

### Slide 1 · Capa

- **Visual:** escuro, imagem da cidade em rede (Higgsfield, aprovada em 11/11/2026), selo "Imagem ilustrativa".
- **Tela:**
  - PROPOSTA AO GOVERNO DO DISTRITO FEDERAL
  - **CITY VIEW**
  - Observabilidade da gestão da cidade
  - DataSynq · Novembro de 2026
- **Fala:** "O que vamos mostrar não é um canal de atendimento. É uma forma de o governo ver a cidade inteira e de o cidadão ver o que o governo entrega."
- **Origem:** magno 1 [Conversa]; ATA 214–216 ("sistema de observabilidade").

### Slide 2 · A promessa

- **Visual:** escuro, só texto, grande.
- **Tela:**
  - **Ver a cidade inteira.**
  - **E a velocidade da gestão.**
- **Fala:** "A proposta é dar à governadora uma ferramenta para ver a velocidade da sua gestão e como a gestão realmente está. E dar ao cidadão a certeza de que o problema dele está sendo tratado."
- **Origem:** ATA 147–148 ("ver a velocidade da sua gestão. E ver como a sua gestão realmente está"); ATA 217–218 [Conversa].

---

## Parte 1 · O problema

### Slide 3 · Divisória

- **Visual:** escuro, imagem dos silos (Higgsfield; pode ser refeita com 7 colunas), selo "Imagem ilustrativa".
- **Tela:**
  - 01 · O PROBLEMA
  - **Cada órgão vê só o próprio pedaço.**
- **Fala:** (transição) "Começo por uma situação que quem trabalha com tecnologia conhece bem."
- **Origem:** magno 4.1 [Conversa]; frase de CV-REF-002 [Equipe].

### Slide 4 · Separado, tudo funciona

- **Visual:** claro, diagrama. Quatro caixas lado a lado (aplicação, rede, segurança, suporte), cada uma com "tudo certo"; embaixo, uma faixa âmbar: "o sistema fica lento toda tarde". Selo "Ilustrativo".
- **Tela:**
  - **Separado, cada área diz que está tudo certo.**
  - **Olhando o todo, não está.**
- **Fala:** "Um banco tem o sistema lento toda tarde. O time de aplicação olha o monitoramento e diz que está tudo certo. A rede diz que está tudo certo. A segurança diz que não houve ataque. Olhando cada coisa em separado, tudo funciona; olhando o todo, não. Observabilidade é ligar essas partes para identificar, diagnosticar e prever o problema."
- **Origem:** magno 5.1; ATA 94–105 [Conversa]. Não citar o nome do banco (magno 5.1).

### Slide 5 · Na cidade, os silos são os órgãos

- **Visual:** claro. Uma fileira de órgãos com o seu canal (Ouvidoria 162, PMDF 190, CAESB 115, CEB IPes 155, Neoenergia, SLU, DER-DF), cada um "em dia". Ao lado, um destaque: "Falta de luz em casa → Neoenergia. Poste apagado → CEB IPes."
- **Tela:**
  - **Na cidade, os silos são os órgãos.**
  - **E o cidadão precisa descobrir para onde ir.**
- **Fala:** "Cada órgão tem o seu sistema e a sua fila. Vista de dentro, cada fila funciona. Quem fica perdido é o cidadão: no DF, a falta de luz em casa é com a Neoenergia e o poste apagado é com a CEB IPes. É energia aqui e iluminação ali."
- **Origem:** magno 4.3 e 5.2; ATA 113–120 [Conversa]. Neoenergia × CEB IPes: magno 5.2 [Pesquisa]. Canais: magno 8 [Pesquisa].

### Slide 6 · O tamanho das filas

- **Visual:** escuro, "telão", três números grandes com rótulo e fonte em cada um.
- **Tela:**
  - **900 a 1.000** manifestações por dia na Ouvidoria do GDF · 2024
  - **134.091** ocorrências atendidas pelo 190 da PMDF · 2024
  - **14.487** chamados de iluminação pública em três meses, por quatro canais · jul. a set. 2026
- **Rodapé:** Jornal de Brasília, 20/11/2024 · CB.Poder, 23/01/2025 · Sou Brasília / Agência Brasília, 29/10/2026
- **Fala:** "Isso é o volume de três filas, só três. Cada uma tem o seu sistema, e nenhuma enxerga a outra. A iluminação pública sozinha recebe chamados por app, telefone, internet e WhatsApp."
- **Origem:** magno 8 [Pesquisa]. Os períodos são diferentes; não somar.

### Slide 7 · Muitos chamados, um só fato

- **Visual:** claro, dois números lado a lado (é a amostra aprovada na estética).
- **Tela:**
  - **O mesmo barulho chega por duas portas.**
  - **5.467** reclamações de perturbação do sossego à PMDF
  - **1.278** notificações de poluição sonora ao Ibram e à Ouvidoria
  - Rodapé: Correio Braziliense, 12/08/2024 · 1º semestre de 2024
- **Fala:** "O barulho é o exemplo mais simples. Quando o som alto atravessa a madrugada, os vizinhos ligam, um depois do outro: são dezenas de chamados para a mesma casa, e cada um ocupa o atendimento como se fosse novo. E o mesmo tipo de problema ainda chega por duas portas, a PMDF e o órgão ambiental, sem que uma saiba da outra."
- **Origem:** magno 5.5 e 8 [Pesquisa]. "Dezenas de chamados para a mesma casa" é ilustrativo (ATA 246–248, [Conversa]). **Não** dizer que é "a maior fonte de chamados da PM": os números públicos não confirmam (magno 5.5).

### Slide 8 · Parece uma coisa, é outra

- **Visual:** claro, diagrama de convergência (o da CV-REF-002, seção 2). À esquerda, "Pedra na pista · vários relatos no mesmo trecho" e "Roubo de veículo com pneu furado · mesmo trecho". No centro, "City View agrupa e cruza". À direita, "1 incidente · segurança, não trânsito". Embaixo, uma linha: "Placa derrubada: depredação ou acidente de trânsito?". Selo "Cenário ilustrativo".
- **Tela:**
  - **Às vezes o problema parece de uma área e é de outra.**
- **Fala:** "Imagine vários relatos de pedras grandes na pista, no mesmo trecho, e roubos de carro com pneu furado ali perto. Separados, são manutenção de via e ocorrências avulsas. Juntos, são um problema de segurança. O mesmo vale para placas caídas: muitas vezes não é depredação, é consequência de acidente. Sem alguém ligando os pontos, ninguém vê."
- **Origem:** magno 5.3 e 5.4; ATA 128–161 e 180–185 [Conversa]. O caso real não está confirmado, e a equipe decidiu não citá-lo (magno 5.3 [Equipe]): **cenário sem nomes, sem lugar e sem ano**.

---

## Parte 2 · A proposta

### Slide 9 · Divisória

- **Visual:** escuro, imagem nova da Higgsfield (sugestão: os mesmos pontos de luz da capa, agora ligados numa rede), selo "Imagem ilustrativa".
- **Tela:**
  - 02 · A PROPOSTA
  - **Um coletor inteligente de incidentes que conversa com os sistemas que já existem.**
- **Fala:** "O City View não é um WhatsApp automatizado nem um formulário. É uma camada de observabilidade: se conecta aos sistemas que o governo já tem, conversa com o cidadão e dá inteligência para gerir a cidade."
- **Origem:** ATA 141–144 e 214–216 [Conversa]; magno 4.1.

### Slide 10 · O fluxo

- **Visual:** claro, o diagrama-mestre. Cinco camadas empilhadas (1 canais do cidadão · 2 ponte de abertura de demandas · 3 conectores com os sistemas dos órgãos · 4 incidente único · 5 inteligência), com as três saídas embaixo (governadora · gestores · cidadão). Um ponto teal marca o que **já funciona em Águas Claras** (camadas 1 e 2, parte da 3, agrupamento por proximidade, acompanhamento do cidadão). Legenda "● já funciona em pequena escala · ○ proposta".
- **Tela:**
  - **Cinco camadas, três visões.**
- **Fala:** "Este é o desenho inteiro. Em cima, o cidadão fala com o governo. A demanda é aberta no sistema certo e acompanhada. Tudo vira um incidente no mesmo formato, e a inteligência cruza esses incidentes. Disso saem três visões: a da governadora, a de cada gestor e a do cidadão. As partes marcadas já funcionam hoje, em pequena escala."
- **Origem:** CV-REF-002, seção 1 [Equipe], conferido na seção 4 dele; magno 4.2 a 4.7 [Conversa].
- **Demo:** a iteração I2 (jornada de um chamado) mostra este fluxo andando.

### Slide 11 · Camadas 1 e 2: o cidadão fala, a demanda anda

- **Visual:** claro, duas colunas. À esquerda, os canais com a situação de cada um: WhatsApp (em uso em Águas Claras), Instagram (pronto, aguardando verificação da Meta), app, SMS e outros canais (proposta). À direita, a ponte: coleta guiada · triagem · revisão humana · protocolo no órgão · acompanhamento até resolver.
- **Tela:**
  - **O cidadão fala onde a gestão escolher.**
  - **A demanda é aberta no sistema certo e acompanhada até resolver.**
- **Fala:** "A gestão escolhe onde quer falar com o cidadão: WhatsApp, SMS, Instagram, o que fizer sentido. Por baixo, o City View faz todo o processo para abrir a solicitação no órgão certo, de qualquer tipo, e acompanha. Não é uma camada de abrir e acabou."
- **Origem:** ATA 204–212 [Conversa]; magno 4.3 e 4.4. Situação dos canais: CV-REF-002, seção 4.1 [Histórico].

### Slide 12 · Camada 3: os órgãos continuam como estão

- **Visual:** claro. Ao centro, o City View; em volta, os sistemas dos órgãos ligados por linhas. Três ligações cheias (ParticipaDF e Portal do Cidadão em uso; IluminaDF integração pronta) e as demais tracejadas, como exemplos (CAESB, Neoenergia, SLU, DER-DF, PMDF). Embaixo: "API · robô autorizado · troca de arquivos".
- **Tela:**
  - **Nada se substitui. Tudo se conecta.**
  - **A gestão aponta os sistemas; nós integramos, em qualquer tecnologia.**
- **Fala:** "Seja qual for o sistema por baixo, em qualquer linguagem, num computador grande ou no computador de alguém, nós integramos. Faz parte da implantação o governo apontar quais são esses sistemas. E cada órgão continua trabalhando do jeito que está acostumado."
- **Origem:** ATA 145–146, 169–173 e 199–205 [Conversa]; magno 4.2. "Nada se substitui, tudo se conecta" é frase da equipe (CV-REF-002) [Equipe]. Robô só com autorização formal do órgão e credencial institucional (CV-REF-001, seção 7) [Equipe]. Integrações existentes: CV-REF-002, seção 4.1 [Histórico].

### Slide 13 · Camadas 4 e 5: de chamados a incidentes

- **Visual:** claro, um cartão de insight de exemplo (o do barulho ou o da pedra), com quatro partes: **o que a IA viu** · **por quê** (evidências de cada órgão) · **confiança** · **o que sugere**. Ao lado, um botão "confirmar / descartar" com "uma pessoa decide". Selo "Ilustrativo".
- **Tela:**
  - **Todo chamado vira um incidente.**
  - **A IA classifica, agrupa, cruza e prevê. E explica por quê.**
- **Fala:** "Não importa se o chamado é de água ou de segurança: tudo entra no mesmo formato. A inteligência agrupa os chamados que falam da mesma coisa, cruza incidentes de órgãos diferentes e aponta tendências. Cada sugestão vem com o motivo e as evidências, e uma pessoa confirma antes de qualquer ação."
- **Origem:** ATA 120, 148–149, 177–185 [Conversa]; magno 4.5. Motivo, confiança, evidências e confirmação humana: magno 7.2 [Equipe].
- **Demo:** iteração I3 (inteligência explicada).

---

## Parte 3 · O que cada um ganha

### Slide 14 · Para a governadora: a sala de situação

- **Visual:** escuro, captura da demo (sala de guerra: mapa de calor do DF, chamados agrupados, velocidade da gestão). Selo "Demonstração · dados simulados".
- **Tela:**
  - **A cidade inteira numa tela.**
  - Onde as coisas estão pegando · os chamados agrupados · a velocidade da gestão
- **Fala:** "A governadora pode ter, ao lado da sala dela, um telão com todos os chamados agrupados e classificados num mapa de calor: onde as coisas estão pegando e onde estão tranquilas. E pode ver a velocidade da gestão: quanto tempo cada tipo de problema leva para ser resolvido."
- **Origem:** ATA 220–222 e 147–148 [Conversa]; magno 4.6. Como medir a velocidade (tempo até resolver, % no prazo): [Equipe].
- **Demo:** iteração I1 (sala de guerra). **Aqui a apresentação passa para a demo ao vivo.**

### Slide 15 · Para os gestores e para o cidadão

- **Visual:** claro, duas metades. Gestores: miniaturas de painéis por área (água e esgoto, energia, iluminação, vias, segurança). Cidadão: o mapa de transparência com três graus lado a lado: **resolvidos** · **em resolução** · **abertos**. Selo "Demonstração · dados simulados".
- **Tela:**
  - **Cada gestor vê a sua área.**
  - **O cidadão vê o que o governo entrega, no grau que a gestão escolher.**
- **Fala:** "O gestor de água e esgoto quer ver o que é dele, e o de iluminação também: cada um tem o seu painel. E o cidadão acompanha a própria demanda e pode ver o mapa da cidade. A gestão escolhe o quanto mostrar: só o que foi resolvido, verdinho no mapa, ou, se for mais arrojada, também o que está em resolução e o que ainda está aberto."
- **Origem:** ATA 223–237 [Conversa]; magno 4.6 e 4.7.
- **Demo:** iteração I4 (gestor e cidadão).

---

## Parte 4 · Prova e caminho

### Slide 16 · Já funciona numa ponta

- **Visual:** claro, números com fonte. Mapa ou foto do mapa público de Águas Claras como apoio.
- **Tela:**
  - **Uma das pontas já funciona, em Águas Claras.**
  - **843** demandas no mapa público desde set./2024 · **46%** resolvidas · **14** órgãos acionados
  - **59** cidadãos atendidos pelo WhatsApp desde 30/09/2026 · **18** protocolos em canais oficiais
  - Rodapé: mapa público DFÁguasClaras, 06/11/2026 · base da ouvidoria, 28/10/2026
- **Fala:** "Isso não é teoria. A abertura e o acompanhamento de demandas já funcionam numa região, com envios reais aos canais oficiais do GDF. É uma das pontas do City View; o que propomos é levar isso para a cidade inteira e acrescentar a integração e a inteligência."
- **Origem:** magno 6.1 [Histórico]. **Não** dizer "nos últimos 12 meses" (as 843 são desde set./2024). **Não** dizer que o cidadão prefere este canal ao portal oficial: não foi medido.

### Slide 17 · Como fazemos e como começa

- **Visual:** claro, duas colunas. À esquerda, quatro princípios com ícone. À direita, três passos.
- **Tela:**
  - **Como fazemos**
    - Uma pessoa confere antes de qualquer envio a um órgão
    - Observamos a cidade e a gestão, nunca pessoas
    - Dado pessoal protegido (LGPD) e hospedado no Brasil
    - O que é exemplo aparece como exemplo
  - **Como começa**
    1. O governo aponta os sistemas e as áreas que quer gerir
    2. Primeira fase com poucos órgãos, escolhidos com o governo
    3. A sala de situação passa a mostrar dados reais
- **Fala:** "Nada é enviado a um órgão sem conferência humana e sem a liberação daquele órgão. O sistema olha a cidade e os serviços, nunca as pessoas. E a implantação começa pelo governo apontando onde quer chegar primeiro."
- **Origem:** magno 3 (o governo libera e indica as integrações) [Conversa]; ATA 241–242; magno 7.6 e CV-REF-001, seção 7 [Equipe]. **Sem ordem de órgãos**: não está decidida (magno 9.13 e 9.14).

### Slide 18 · Encerramento

- **Visual:** escuro, imagem nova da Higgsfield (sugestão: a cidade da capa, mais aberta e clara, sugerindo "visível"), selo "Imagem ilustrativa".
- **Tela:**
  - **CITY VIEW**
  - Para o governo ver o todo.
  - Para o cidadão ver o que o governo entrega.
  - DataSynq (logo, sem contato)
- **Fala:** "Uma plataforma de observabilidade que dá ao cidadão uma interação amigável e rastreável, e ao governo a visão da cidade inteira."
- **Origem:** magno 1; ATA 214–216 [Conversa]. Sem contato no slide (decisão da equipe, 11/11/2026).

---

## Perguntas prováveis dos assessores (respostas para as notas)

Só com o que se sabe. O que está em aberto aparece como "a definir com o governo".

| Pergunta | Resposta preparada | Origem |
| --- | --- | --- |
| Isso substitui o 190, o 162, o Portal do Cidadão? | Não. Os órgãos continuam nos seus sistemas; o City View integra e acompanha | magno 4.2 [Conversa] |
| Vocês já têm acesso aos sistemas dos órgãos? | Não. As integrações dependem de o governo apontar e liberar os sistemas, o que faz parte da implantação | magno 3 [Conversa] |
| E onde não houver API? | Integração por robô ou troca de arquivos, só com autorização formal do órgão e credencial institucional | ATA 202; CV-REF-001, seção 7 [Equipe] |
| Por onde começa? Quais órgãos primeiro? | A definir com o governo; a proposta é começar com poucos órgãos | magno 9.13 e 9.14 |
| A IA decide sozinha? | Não. Ela sugere com motivo e evidências; uma pessoa confirma | magno 7.2 [Equipe] |
| E os dados pessoais do cidadão? | Protegidos (pseudonimizados), nunca no mapa público, hospedados no Brasil | magno 7.6; CV-REF-001, seção 7 [Equipe] |
| Precisa de telão e tempo real? | A definir com o governo | magno 9.20 |
| Quanto custa? | A definir (modelo comercial em aberto) | magno 9.12 |

## Checagem de completude

### Temas do magno (seção 4)

| Tema | Slides |
| --- | --- |
| 4.1 Vender observabilidade, não um canal | 1, 2, 4, 9 |
| 4.2 Integrar os legados | 12, 17 |
| 4.3 Uma camada única de contato com o cidadão | 5, 11 |
| 4.4 Acompanhar até resolver | 11, 15 |
| 4.5 Inteligência: classificar, agrupar, cruzar | 7, 8, 13 |
| 4.6 A visão do governo | 14, 15 |
| 4.7 A visão do cidadão sobre a gestão | 15 |
| 4.8 Áreas e órgãos citados | 5, 12 (como exemplos) |
| 4.9 Narrativa | Estrutura inteira. Os valores de "400 milhões" e "250 milhões" **ficam fora**: são conversa paralela, sem fonte (magno 4.9) |

### Camadas e visões (CV-REF-002)

| Camada ou visão | Slides |
| --- | --- |
| 1 Canais do cidadão | 10, 11 |
| 2 Ponte de abertura de demandas | 10, 11 |
| 3 Conectores com os legados | 10, 12 |
| 4 Incidente único | 10, 13 |
| 5 Inteligência | 10, 13 |
| Governadora | 14 |
| Gestores | 15 |
| Cidadão | 15 |

### Fica de fora desta versão, por decisão

- **Percepção** (redes sociais) e **dados de operação** (magno 7.1): ideias da equipe de maior risco, não validadas com o Daniel (magno 9.3).
- **Previsão de alagamento** e **"problema invisível"** (magno 7.2): entram na demo (iteração I5) se fizer sentido; no deck, só a palavra "prevê" no slide 13.
- **Viewtinet** e o projeto de Madri: em aberto (magno 9.2 e 9.5).
- **Implantação em ondas** com órgãos nomeados: não decidido (CV-REF-002, seção 4.2).

## Pendências desta versão

- Imagens novas da Higgsfield: divisória da proposta (9) e encerramento (18); talvez refazer os silos (3) com 7 colunas.
- Capturas da demo nos slides 13, 14 e 15, à medida que as iterações ficarem prontas.

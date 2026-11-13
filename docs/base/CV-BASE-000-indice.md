# CV-BASE-000 · Base de conhecimento do City View

| Campo | Valor |
| --- | --- |
| Código | CV-BASE-000 |
| Versão | 0.1 (13/11/2026), primeira passada: larga, não funda |
| O que é | O índice da base de conhecimento: um cartão por sistema, produto ou fonte de dado que interessa ao City View, com o que se sabe, de onde veio e o que falta confirmar |
| Para que serve | Para a apresentação, a demo e os próximos documentos citarem "o cartão do sistema X" em vez de repetir a pesquisa |
| Quem pediu | Sammuel, em 13/11/2026 |

## Como ler

- **Um cartão por sistema**, todos com as mesmas seções (o modelo está em [`_modelo.md`](_modelo.md)).
- Cada fonte leva uma marca: **(lido)** a página foi aberta e lida; **(resumo)** só o resumo do resultado de busca foi visto, e precisa ser conferido antes de sair daqui; **(repositório)** vem do código ou dos documentos do projeto.
- A **confiança** de cada cartão diz o quanto dele se apoia em fonte lida.
- "Como o City View chegaria a ele" só diz o que uma fonte sustenta. Onde não há fonte, diz **"não sabemos"**.
- A pesquisa é de **13/11/2026**. Parte dos sites do governo estava fora do ar ou bloqueou a leitura nesse dia (Anatel, ADASA, o portal de dados abertos do GDF, a Polícia Civil): esses cartões têm confiança baixa e pedem uma segunda visita.
- Os cartões de produtos comparáveis usam nomes que **não devem aparecer no material de venda** (magno 7.6). Aqui é base interna.

## O que esta passada achou de mais importante

1. **"ADM 24h" está identificado.** É a Administração Regional Digital 24h, a plataforma do GDF para pedidos às Administrações Regionais, e já está ligando outros órgãos (SLU, iluminação; Caesb e Segurança "em alinhamento"). [Cartão](adm-24h.md). "ADM72" continua sem rastro.
2. **O governo já está unificando a entrada.** Um decreto de julho de 2026 define um portal, um aplicativo e um WhatsApp oficiais, e uma secretaria nova (SGDI) precisa revisar qualquer canal novo. [Portal e 156](portal-do-cidadao-156.md) · [SGDI](sgdi-governanca-digital.md). A proposta tem de entrar **por trás** dos canais oficiais, não como mais um.
3. **A emergência já é integrada.** O 190, o 193 e o 199 são atendidos no mesmo centro, o CIOB, com 22 órgãos. [Cartão](ciob-190-193-199.md). O espaço do City View é o que não é emergência.
4. **Há dado real de "qualidade de rede", aberto, hoje.** A ANEEL publica toda interrupção de energia desde 2017, com hora, por área menor que o município. [Cartão](aneel.md). Dá para trocar o apagão simulado por um real, sem pedir nada à distribuidora.
5. **Há dado real de segurança por região, mensal.** [SSP-DF](ssp-df-estatisticas.md).
6. **O City Monitor não é concorrente direto.** É um produto de sensores e painéis para cidades pequenas da Áustria e da Alemanha, sem demanda do cidadão. [Cartão](city-monitor.md). O concorrente brasileiro mais próximo, na ponta do canal, é o [Colab](colab.md).
7. **A documentação do projeto não citava a SGDI, o CIOB, a ADM 24h como sistema, nem os dados da ANEEL.** São quatro lacunas que mudam o discurso.

## Os cartões

### Nossos

O que é do projeto, e de que a demo depende.

| Cartão | Setor | Confiança |
| --- | --- | --- |
| [dfac · Máquina de Ouvidoria (DFÁGUASCLARAS)](dfac.md) | projeto nosso | alta |
| [Mapa de demandas de Águas Claras (dfaguasclaras.com.br)](mapa-de-demandas-aguas-claras.md) | privado (site parceiro de uma comunidade) | alta (o endpoint foi lido em 13/11/2026) |
| [Mapas, imagens e bibliotecas de que a demo depende](mapas-e-imagens-da-demo.md) | referência de fora (serviços e projetos de código aberto) | média |
| [geobr (Ipea): escolas, saúde e comunidades](geobr-ipea.md) | federal (Ipea, com dados do INEP, do CNES e do IBGE) | média |

### Canais do cidadão no DF

Por onde o cidadão fala com o governo hoje.

| Cartão | Setor | Confiança |
| --- | --- | --- |
| [Como o cidadão do DF fala com o governo hoje](canais-do-cidadao-no-df.md) | GDF, concessionárias e federal | média |
| [Participa DF · Ouvidoria-Geral · 162](participa-df.md) | GDF | alta |
| [Portal do Cidadão · Central 156 (CentralDF)](portal-do-cidadao-156.md) | GDF | alta para a norma e o menu do 156; baixa para volumes |
| [ADM 24h · Administração Regional Digital 24h](adm-24h.md) | GDF | alta para a identificação; média para os números (a própria notícia se contradiz) |
| [eGDF (aplicativo oficial do GDF)](egdf.md) | GDF | média |
| [Administrações Regionais (35 regiões)](administracoes-regionais.md) | GDF | média |
| [Wi-Fi Social DF](wifi-social-df.md) | GDF, operado por empresas credenciadas | alta para o modelo e o número de pontos; os números de uso se contradizem |

### Órgãos e sistemas do GDF

Quem recebe e executa.

| Cartão | Setor | Confiança |
| --- | --- | --- |
| [CIOB · 190, 193 e 199 (segurança e emergência)](ciob-190-193-199.md) | GDF | alta para a estrutura; baixa para volumes |
| [PCDF · Delegacia Eletrônica](pcdf-delegacia-eletronica.md) | GDF | baixa |
| [DF 360 (videomonitoramento)](df-360.md) | GDF | média |
| [Novacap](novacap.md) | GDF | média |
| [SLU · Serviço de Limpeza Urbana](slu.md) | GDF | baixa |
| [DER-DF](der-df.md) | GDF | baixa |
| [Detran-DF](detran-df.md) | GDF | média |
| [SEMOB · DF no Ponto](semob-df-no-ponto.md) | GDF | alta para o aplicativo |
| [DF Legal e Brasília Ambiental (Ibram)](df-legal-e-brasilia-ambiental.md) | GDF | baixa |
| [SES-DF · InfoSaúde e Vigilância Ambiental](ses-df-infosaude.md) | GDF | média |

### Concessionárias e empresas do governo

Energia, luz, água.

| Cartão | Setor | Confiança |
| --- | --- | --- |
| [Neoenergia Brasília](neoenergia-brasilia.md) | concessionária privada | alta para números de 2025 (relatório anual lido); média para a privatização (resumos) |
| [CEB IPes · iluminação pública · Ilumina DF](ceb-ipes.md) | empresa pública (subsidiária da CEB) | média |
| [CAESB](caesb.md) | empresa mista controlada pelo GDF | média |
| [O que se pode pedir a uma concessionária](concessao-e-acesso-a-dados.md) | federal (leis) | média |

### Dados abertos e reguladores

O que já está publicado, e quem governa.

| Cartão | Setor | Confiança |
| --- | --- | --- |
| [ANEEL · dados abertos de energia](aneel.md) | federal | alta |
| [SSP-DF · estatísticas por região administrativa](ssp-df-estatisticas.md) | GDF | alta |
| [IPEDF · PDAD e indicadores por região](ipedf.md) | GDF | média |
| [IDE/DF · Geoportal](ide-df-geoportal.md) | GDF | alta para o serviço; os termos de uso seguem sem confirmação |
| [dados.df.gov.br (portal de dados abertos do GDF)](dados-df.md) | GDF | baixa |
| [ADASA](adasa.md) | GDF | baixa |
| [Anatel · cobertura e qualidade de telecomunicações](anatel.md) | federal | baixa |
| [SGDI · Governança Digital e Integração](sgdi-governanca-digital.md) | GDF | média |

### Produtos comparáveis

Referências, concorrentes e inspirações.

| Cartão | Setor | Confiança |
| --- | --- | --- |
| [City Monitor (Citymonitor, da Weavs)](city-monitor.md) | privado · Áustria | média |
| [Palantir (Foundry, Gotham, AIP)](palantir.md) | privado · Estados Unidos | média |
| [Colab](colab.md) | privado · Brasil | baixa |
| [Centro de Operações Rio (COR)](centro-de-operacoes-rio.md) | município do Rio de Janeiro | alta |
| [Madri · MiNT (Madrid iNTeligente)](madrid-mint.md) | município de Madri (Espanha) | média |
| [São Paulo · SP156](sp156.md) | município de São Paulo | média |
| [Fala.BR (CGU)](fala-br.md) | federal | média |
| [Singapura · OneService](singapura-oneservice.md) | governo de Singapura | média |
| [Nova York · 311 e dados abertos](nyc-311.md) | município de Nova York (EUA) | alta |
| [Boston CityScore](boston-cityscore.md) | município de Boston (EUA) | alta para o que a página oficial diz |
| [Baltimore CitiStat](baltimore-citistat.md) | município de Baltimore (EUA) | alta |

## O que se liga a quê

- **A entrada.** O cidadão chega por [doze telefones, cinco portais e seis aplicativos](canais-do-cidadao-no-df.md). A [ouvidoria (162)](participa-df.md) recebe o que é de vários órgãos: [Novacap](novacap.md), [SLU](slu.md), [DF Legal e Brasília Ambiental](df-legal-e-brasilia-ambiental.md) mandam o cidadão para lá.
- **A unificação em curso.** [ADM 24h](adm-24h.md), [eGDF](egdf.md) e a [CentralDF](portal-do-cidadao-156.md), sob a [SGDI](sgdi-governanca-digital.md). A ADM 24h já recebe da [iluminação](ceb-ipes.md) e do SLU.
- **A emergência**, à parte, no [CIOB](ciob-190-193-199.md), que também tem [Novacap, CEB, Caesb, SLU e Detran](ciob-190-193-199.md) na sala.
- **As concessionárias.** [Neoenergia](neoenergia-brasilia.md) (privada, regulada pela [ANEEL](aneel.md)); [Caesb](caesb.md) (do GDF, regulada pela [ADASA](adasa.md)); [CEB IPes](ceb-ipes.md) (do GDF). O que cada uma pode ser obrigada a entregar está [aqui](concessao-e-acesso-a-dados.md).
- **O que já temos ligado**, pelo [dfac](dfac.md): [Participa DF](participa-df.md), [Portal do Cidadão](portal-do-cidadao-156.md), [IluminaDF](ceb-ipes.md) e o [mapa de Águas Claras](mapa-de-demandas-aguas-claras.md). Todos usados como um cidadão usaria, sem acordo de integração.
- **O mapa** depende da [IDE/DF](ide-df-geoportal.md) e de [serviços abertos](mapas-e-imagens-da-demo.md); o contexto, do [Ipea](geobr-ipea.md); a população, do Censo e do [IPEDF](ipedf.md).

## Para aprofundar em seguida

Seis, na ordem em que eu faria:

1. **[ADM 24h](adm-24h.md).** É o sistema do governo mais próximo da nossa ponta de entrada e já integra órgãos. Saber o que ele registra, quem o desenvolve e se tem porta de integração decide o desenho da proposta.
2. **[ANEEL](aneel.md), interrupções de energia.** Baixar o conjunto, recortar o DF, ver como as áreas da ANEEL caem nas regiões administrativas. É o caminho mais curto para dado real de rede na demo.
3. **[SGDI](sgdi-governanca-digital.md) e o programa DF+Digital.** Ler os decretos e a estratégia de governança digital: quem aprova, que padrões exige, se há plataforma de interoperabilidade.
4. **[CIOB](ciob-190-193-199.md).** Como os 22 órgãos trabalham na sala e o que o sistema de ocorrências registra: é o modelo de integração que o governo já aceitou.
5. **[SSP-DF](ssp-df-estatisticas.md), estatísticas por região.** Baixar as planilhas e ver se servem para o índice de segurança da demo.
6. **[Participa DF](participa-df.md), painel e dados abertos.** Ver se o painel separa por região e por órgão, e o que os arquivos trazem: é o maior silo de demandas.

Dois cartões pedem só uma segunda visita, com os sites no ar: [Anatel](anatel.md) e [ADASA](adasa.md). E o [portal de dados abertos do GDF](dados-df.md) pede uma visita à mão.

## Perguntas que a pesquisa levantou

Somam-se às do magno, seção 9. As três primeiras respondem ou mudam perguntas que já estavam lá.

| # | Pergunta | De onde vem |
| --- | --- | --- |
| 9.6 | O "ADM 24h" da conversa é a Administração Regional Digital 24h? E "ADM72", o que é? | [adm-24h](adm-24h.md) |
| 9.26 | São 35 regiões administrativas, como diz o GDF, ou 37, como na base de mapas que a demo usa? | [administracoes-regionais](administracoes-regionais.md) |
| 9.10 | O patrocinador dentro do GDF passa pela SGDI? A proposta entra no DF+Digital? | [sgdi](sgdi-governanca-digital.md) |
| nova | O City View fica por trás dos canais oficiais (eGDF, CentralDF, ADM 24h), sem canal próprio? O decreto de julho de 2026 parece exigir isso. | [portal-do-cidadao-156](portal-do-cidadao-156.md) |
| nova | Como a proposta se apresenta diante do CIOB, que já é a "sala integrada" da segurança? | [ciob](ciob-190-193-199.md) |
| nova | O DF 360 tem reconhecimento facial. Tiramos a menção a ele do caso do apagão na demo? | [df-360](df-360.md) |
| nova | Vale propor que o governo exija das empresas do Wi-Fi Social o dado de disponibilidade dos pontos? | [wifi-social-df](wifi-social-df.md) |
| nova | Para a Neoenergia, basta o dado público da ANEEL, ou a proposta conta com dado da própria empresa? | [neoenergia](neoenergia-brasilia.md) · [concessão](concessao-e-acesso-a-dados.md) |

## O que esta passada não fez

- Não aprofundou nenhum sistema: é para isso a lista acima.
- Não conferiu, na fonte, o que está marcado como **(resumo)**.
- Não leu contratos de concessão, decretos de criação de órgãos nem cartas de serviço.
- Não deu parecer jurídico: onde a lei importa, o cartão aponta a pergunta.
- Não mudou a demo. O que a base sugere mudar lá (dado real de energia e de segurança, a menção ao DF 360, as 35 regiões) está dito nos cartões e fica para decisão.

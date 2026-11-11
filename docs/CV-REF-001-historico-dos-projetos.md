# CV-REF-001 · Histórico dos projetos que levaram ao City View

| Campo | Valor |
| --- | --- |
| Código | CV-REF-001 |
| Versão | 0.3 (11/11/2026) |
| Status | Contexto de partida do repositório `city-view-demo` |
| Fontes | Repositórios `dfac-agentic-saas` e `cityView` (antigo `zela-df`), lidos em 11/11/2026 · [Documento Magno](CV-SPEC-000-documento-magno.md) (CV-SPEC-000) · [conversa com o Daniel](fonte/CV-ATA-001-conversa-daniel-2026-11-10.md) (CV-ATA-001) |
| Dono | Equipe Datasynq |

> **Para que serve.** O `city-view-demo` começa do zero, de propósito. Este
> documento conta de onde o City View veio: três projetos anteriores, o que cada
> um provou e o que se aprendeu com eles. É **contexto, não código**. Nada dos
> repositórios antigos entra aqui sem uma decisão registrada. Em caso de
> conflito, vale o [Documento Magno](CV-SPEC-000-documento-magno.md) (CV-SPEC-000).

---

## 1. Linha do tempo em uma tabela

| Fase | Projeto | Repositório (GitHub `Datasynq-org`) | Período | O que é | Estado hoje |
| --- | --- | --- | --- | --- | --- |
| A | **dfac** (DFÁC Analytics) e sua ouvidoria, a "Máquina de Ouvidoria" | `dfac-agentic-saas` | ouvidoria no WhatsApp desde 30/09/2026 | Plataforma do canal DFÁGUASCLARAS (Águas Claras). Faz campanhas comerciais por WhatsApp e tem um módulo de **ouvidoria cívica** | **Em produção.** Não alterar |
| B | **Zela DF** | `City-view` (antes `zela-df`, só mudou o nome; o código do Zela fica em `referencia/zela-df/`) | 07 a 09/11/2026 | A ouvidoria do dfac abstraída como produto próprio para o DF inteiro: conversa com IA, revisão humana, encaminhamento, mapa público | POC parada, guardada como referência |
| C | **CityView** (1ª tentativa) | o mesmo repositório `City-view` | 10/11/2026 | Depois da conversa com o Daniel: o escopo vira observabilidade da cidade. Documentação nova e um app de demonstração, a "Sala de Situação" | Substituído por este repositório |
| D | **City View Demo** | `city-view-demo` (este) | desde 11/11/2026 | Recomeço limpo: primeiro a apresentação, depois a demo, guiados pelo Documento Magno | **Ativo** |

### Como achar os repositórios na sua máquina

Os caminhos variam de pessoa para pessoa. Procure um clone local antes de clonar
de novo:

```bash
# troque ~ pela pasta onde você guarda projetos, se quiser acelerar
find ~ -maxdepth 4 -type d -iname "dfac-agentic-saas" -o -maxdepth 4 -type d -iname "city*view*" 2>/dev/null
```

Se não achar, clone pela organização `Datasynq-org` no GitHub:

| Repositório no GitHub | Pasta costuma se chamar | Observação |
| --- | --- | --- |
| `Datasynq-org/dfac-agentic-saas` | `dfac-agentic-saas` | Em produção |
| `Datasynq-org/City-view` | `cityView` | É o antigo `Datasynq-org/zela-df`, renomeado. Clones antigos podem ter o remoto com o nome antigo (o GitHub redireciona). O Zela está em `referencia/zela-df/` |
| `Datasynq-org/city-view-demo` | `city-view-demo` | Este repositório |

Atenção: `City-view` (antigo, fases B e C) e `city-view-demo` (novo, fase D)
têm nomes parecidos e são repositórios diferentes.

---

## 2. Fase A: o dfac e a Máquina de Ouvidoria

### O que é

O **DFÁC Analytics** é a plataforma do canal **DFÁGUASCLARAS**, uma rede de
grupos de WhatsApp de Águas Claras. Nasceu para campanhas comerciais
(anunciantes locais, rastreamento de cliques, ROI), um agente de notícias e um
módulo pessoal de um operador (Cleber). Dentro dele cresceu um módulo de
**ouvidoria cívica**. O Documento Magno chama essa ouvidoria de **Máquina de
Ouvidoria**.

O ciclo da ouvidoria:

1. O cidadão relata um problema urbano (buraco, poste apagado, mato alto) pelo WhatsApp, conversando com um assistente.
2. O assistente coleta local, ponto de referência, tipo, descrição e foto, e registra a demanda.
3. Um operador revisa numa fila interna, corrige e encaminha ao órgão.
4. A plataforma envia ao canal oficial (**ParticipaDF**, **Portal do Cidadão** ou **IluminaDF**) e acompanha o protocolo.
5. O status volta ao cidadão e ao mapa público do site parceiro `dfaguasclaras.com.br`.

### Stack

Python, FastAPI, Celery (worker e beat com eleição de líder por Redis),
PostgreSQL, Redis, React 18 + Vite + Tailwind + shadcn/ui, SDKs da Anthropic e
da OpenAI, WhatsApp pela Z-API. Deploy numa VM do Replit. Mais de 700 testes em
pytest.

### O que ele provou

É a **tração real** do City View: o ciclo coletar → encaminhar → acompanhar
funciona, com envios reais a canais oficiais do GDF.

| Indicador | Valor | Fonte e data |
| --- | --- | --- |
| Demandas no mapa público DFÁguasClaras | 843 desde setembro de 2024; 389 resolvidas (46%); 14 órgãos acionados; 98% com foto | API pública do site, 06/11/2026 |
| Demandas na fila de revisão da ouvidoria | 102 (89 do mapa, 13 do WhatsApp) | Banco de produção do dfac, só leitura, 28/10/2026 |
| Protocoladas em canais oficiais | 18 (12 ParticipaDF, 6 Portal do Cidadão) | idem |
| Cidadãos atendidos no WhatsApp | 59 (62 conversas), desde 30/09/2026 | idem |

Cuidados com esses números:

- As 843 demandas se acumulam desde setembro de 2024. **Não apresentar como "últimos 12 meses".**
- O percentual levantado na conversa, "o cidadão prefere o canal do DFÁguasClaras ao portal oficial", **ainda não foi medido** (magno, seção 6.1).

### O que se aprendeu (vale para qualquer código novo)

- **Portal do Cidadão** depende de sessão gov.br humana (CAPTCHA, segundo fator). Não automatizar credencial pessoal de gov.br.
  - *Acréscimo de 11/11/2026:* o dfac resolve isso sem automatizar credencial. Desde 30/09/2026 um operador conecta por uma extensão de Chrome/Edge (instalada por ZIP, fora da Web Store), faz o login gov.br à mão no site oficial e confirma a conta central; a sessão fica compartilhada no servidor até expirar, e então alguém reconecta. Ver `docs/portal-cidadao-shared-session.md` e `docs/portal-connector-extension.md`. A seção 8 do `CONTEXTO_PLATAFORMA.md` (29/09/2026) é anterior e ainda diz que o portal não funciona.
- **Instagram** ficou pronto no código e travado na verificação da Meta.
- **URLs de mídia dos canais expiram.** Baixar a evidência quando a mensagem chega, não na confirmação.
- **Canal sem botão de localização** prende o cidadão num estágio da conversa. Sempre ter fallback por endereço.
- **Trocar o segredo do HMAC** transforma o mesmo cidadão em duas pessoas.
- **Prioridade por recorrência** existia como campo, mas nada a alterava. A duplicata só virava um candidato para revisão humana.
  - *Acréscimo de 11/11/2026:* **desatualizado.** A frase veio do Zela DF (`referencia/zela-df/docs/04-heranca-dfac.md`). Desde 01/10/2026 o dfac eleva a prioridade sozinho: associação automática a até 30 m com descrição específica e tipo não genérico; de 30 a 100 m vira candidato para revisão; acima de 100 m, nada. 1–2 remetentes não elevam, 3–9 = Alta, 10+ = Urgente; prioridade efetiva = a maior entre a manual e a da recorrência; tudo com histórico e sem autorizar envio. Ver `api/demand_recurrence.py` e `docs/demand-recurrence-design.md`. Está no código do `main`; não foi conferido se está ligado em produção.
- O dfac mistura ouvidoria com módulos comerciais no mesmo banco e nas mesmas filas. Foi um dos motivos para separar o produto.

### Onde ler mais (caminhos a partir da raiz do `dfac-agentic-saas`)

- `docs/CONTEXTO_PLATAFORMA.md`: leitura obrigatória; seções 8 (o que não funciona) e 9 (erros que já aconteceram).
- `docs/MODELO_DADOS_DEMANDAS.md`: modelo da demanda (versões, anexos, histórico, tentativas de envio).
- `api/ouvidoria_flow.py` (motor de conversa), `api/demand_intake.py` (pseudonimização e duplicatas), `api/integrations/` (ParticipaDF, Portal do Cidadão, IluminaDF).

### Regra

**O dfac está em produção atendendo Águas Claras.** Ninguém altera nada lá sem
pedido explícito, e o banco dele é somente leitura.

---

## 3. Fase B: Zela DF

### O que é

O **Zela DF** pegou a Máquina de Ouvidoria e a transformou em produto próprio,
para as 37 regiões administrativas do DF: um canal único para o cidadão relatar
**problemas de zeladoria** (buraco, iluminação, poda, trânsito) conversando com
uma IA, pelo app ou pelo WhatsApp. A demanda chegava completa a uma equipe de
revisão, que encaminhava ao canal oficial. Um mapa público mostrava as demandas
por região, sem dados de quem abriu.

### O que foi construído (POC, 07 a 09/11/2026)

| Peça | O que faz |
| --- | --- |
| API (Node + Fastify) | Camadas domain / application / infrastructure; conversa com IA, demandas, revisão, métricas, WhatsApp (Z-API), servidor MCP com as ferramentas do agente |
| Motor de conversa | Função pura: recebe estado + mensagem, devolve estado + resposta. Sem rede nem banco |
| Ferramentas do agente | Cada ação é uma ferramenta (schema zod + descrição), compartilhada entre o agente guiado, o Claude e o MCP |
| Revisão humana | Toda ação sobre uma demanda passa por transições validadas e fica registrada; fotos liberadas uma a uma para o mapa |
| Recorrência | Relatos iguais somam na mesma demanda; 5 relatos = alta, 10 = urgente |
| Regiões | Limites oficiais das 37 RAs (IDE/DF) e conversão ponto → região |
| Privacidade | CPF e celular pseudonimizados (HMAC); nada que identifique o cidadão vai ao mapa |
| Banco | Postgres + PostGIS no Supabase; sem banco, tudo em memória |
| App do cidadão | Expo: conversar, minhas demandas, mapa, perfil |
| Painel da equipe | Vite + React: fila de revisão, encaminhamento, indicadores; conta "governadora" só com indicadores |
| Pitch | Apresentação do Zela DF em `assets/pitch` |

*Acréscimo de 11/11/2026:* o pitch do Zela DF **nunca foi mostrado a ninguém**.
O `referencia/zela-df/RESUMO.md`, que fala em "apresentação entregue ao GDF em
novembro de 2026", está errado nesse ponto.

### Por que não bastou

Na conversa de 10/11/2026 ficou claro que um canal de abertura de demandas não
se vende ao governo. Nas palavras do Daniel: *"Se você vender que é um WhatsApp
automatizado, não vai valer. Nós temos que vender que é um sistema de
observabilidade."* A ouvidoria, sozinha,
parece o Portal do Cidadão ou o ADM 24h, com diferencial pequeno, uma região e
destinos fixos.

### Decisões do Zela que continuam valendo como conhecimento

- WhatsApp oficial pela API da Meta em produção (Z-API só em prova de conceito).
- Limites das RAs pela base oficial IDE/DF.
- Dado real de cidadão exige hospedagem no Brasil.
- O servidor confere antes de qualquer envio a órgão; nada sai sem pessoa no circuito.
- Nunca automatizar credenciais de gov.br.

### Onde ler mais (caminhos a partir da raiz do `cityView`)

- `referencia/zela-df/RESUMO.md`: o Zela em uma página.
- `referencia/zela-df/docs/`: nove documentos (visão, jornadas, roadmap, herança do dfac, dados e LGPD, integrações, decisões, caso Águas Claras, arquitetura).
- `assets/geo/`: limites oficiais das 37 RAs (IDE/DF), útil para qualquer mapa da demo.

---

## 4. Fase C: CityView, a primeira tentativa

### O que mudou

Em 10/11/2026, na conversa com o Daniel, o escopo foi ampliado:

| | Zela DF | City View |
| --- | --- | --- |
| Escopo | Zeladoria | Qualquer solicitação a qualquer órgão ou concessionária do GDF |
| O que se vende | Canal de abertura de demandas | Observabilidade: integração dos silos, visão única, inteligência |
| Abertura de demandas | O produto | Uma das pontes de entrada (continua obrigatória) |
| Comprador | Administração regional, ouvidoria | Governo do DF, a partir da governadora |
| Dados públicos | Já disponíveis ou raspados | Liberados pelo governo depois da compra |

O repositório `zela-df` foi reorganizado e renomeado para **`City-view`**: o Zela foi
movido intacto para `referencia/zela-df/`, e nasceram:

- `docs/00` a `docs/05`: contexto, visão, órgãos e fontes, Sala de Situação, roteiro do pitch e decisões (D1 a D11).
- `docs/fonte/`: a transcrição da conversa e uma **pesquisa de dados públicos com fonte e data**.
- `apps/sala-de-situacao`: painel de demonstração para a governadora (Vite + React + Tailwind + Recharts, mapa MapLibre com fundo da CARTO, grafo de correlações, dados simulados no navegador).
- *Acréscimo de 11/11/2026 (faltava nesta lista):* `assets/pitch/CityView_Apresentacao.pptx`, uma apresentação de 14 slides com roteiro de fala nas notas, gerada por `assets/pitch/build.js`. A sequência e as frases estão em `docs/04-roteiro-do-pitch.md`.

### Por que recomeçar

A sessão do cityView acumulou código e decisões de duas fases (Zela e a
primeira versão do City View) antes de a narrativa estar fechada. O
`city-view-demo` recomeça com o Documento Magno como única fonte, construindo
**primeiro a apresentação, depois a demo**, sem herdar telas nem código.

*Acréscimo de 11/11/2026:* o argumento da equipe. A apresentação e a demo da
primeira tentativa testaram várias integrações e ficaram legais, mas poluídas.
Por isso o caminho é o inverso: primeiro uma **apresentação concisa, detalhada
e completa**; depois incrementá-la; só então construir a **demo**, a partir do
que está levantado e documentado.

### O que vale trazer do cityView (como conhecimento, não como código)

- **A pesquisa de dados públicos** (`docs/fonte/2026-11-10-pesquisa-dados-publicos.md` no `cityView`). Antes de citar qualquer número no pitch, confira lá a fonte e a data.
- **O cuidado com a perturbação do sossego.** O Daniel ouviu de um coronel que é a maior fonte de chamados da PM. Os números públicos não confirmam: em 2024 foram cerca de 5,5 mil chamados no semestre, uns 8% das ocorrências do 190. Use a ideia dos chamados duplicados, não "a maior fonte".
- **O caso das pedras na via** (Rio de Janeiro, assaltos, ator baleado) **não foi confirmado**: falta nome, local e ano. Na demo ele aparece como caso simulado no DF, sem nomes.
- **Decisões que continuam abertas** no `docs/05` do cityView e que o magno também lista como perguntas em aberto (seção 9): órgãos da primeira fase, dados de segurança pública, modelo comercial, hospedagem, robôs em sistemas sem API.
- **Mapa:** a escolha de MapLibre com OpenStreetMap em vez de Google Maps (sem chave exposta no build estático, sem custo de licença) foi feita para a demo antiga. Reavaliar na demo nova; a CARTO tem limite de uso gratuito.

### O que não trazer

- *Acréscimo de 11/11/2026:* a apresentação de 14 slides. Ela fica como referência do que já se tentou; a nova começa do zero.
- O código e o visual da Sala de Situação. As ideias da equipe para uma demo nova e um visual novo ("Sala de Operações") estão no magno, seção 7, e não herdam telas da Sala de Situação.
- Os módulos comerciais do dfac, o deploy no Replit e o acoplamento a uma região.

---

## 5. Fase D: City View Demo (este repositório)

### O que já tem

- [CV-SPEC-000 Documento Magno](CV-SPEC-000-documento-magno.md): o apanhado do que se sabe sobre o projeto (o que é, o que o Daniel quer, o que a equipe está pensando, o que já existe, o que ainda não se sabe). Cresce só por acréscimo. Substitui o magno v1.1 de 10/11/2026, que foi descartado.
- [CV-ATA-001 Conversa com o Daniel](fonte/CV-ATA-001-conversa-daniel-2026-11-10.md): transcrição da conversa de 10/11/2026, fonte primária.
- Este documento.

### O que vem depois

Com a documentação clara, o material de venda (apresentação e, se fizer
sentido, uma demo) parte do magno. Nada disso tem etapa ou prazo definido.

### Como as fases anteriores aparecem no magno

| Do passado | No magno |
| --- | --- |
| Máquina de Ouvidoria (dfac), Zela DF e a primeira tentativa do CityView | Seção 6, "O que já temos" |
| Números de Águas Claras | Seção 6.1, como exemplo real de uma das pontas (a centralização das demandas) |
| Lições aprendidas | Seção 6.2 |
| Ideias da primeira tentativa (três sinais, módulos, demo, visual "Sala de Operações") | Seção 7, marcadas como ideias da equipe |

---

## 6. Nomes, para não confundir

| Nome | O que é |
| --- | --- |
| **dfac**, DFÁC Analytics | A plataforma em produção (`dfac-agentic-saas`) |
| **DFÁGUASCLARAS**, DF Águas Claras | O canal/rede de grupos e o site parceiro com o mapa público |
| **Máquina de Ouvidoria** | O módulo de ouvidoria cívica do dfac |
| **Zela DF** | A ouvidoria como produto próprio para o DF (07 a 09/11/2026) |
| **CityView** | Nome de trabalho no repositório antigo (10/11/2026) |
| **City View** | O nome do produto (10/11/2026), até que se decida outro. Escreva assim |
| **SOMA** | Nome considerado e abandonado |
| **Sala de Situação** | A demo antiga, no `cityView` |
| **Sala de guerra** / **Sala de Operações** | A tela da governadora, como a conversa a chama, e o visual imaginado pela equipe (magno, seção 7.5) |

---

## 7. Regras que atravessam todas as fases

1. **Separar conceito de realidade.** Nunca apresentar como existente o que é proposta. Dado simulado é rotulado: "Ambiente de demonstração · dados simulados".
2. **Número público só com fonte e data.** O que não foi confirmado não vai para o pitch.
3. **Os órgãos continuam nos seus sistemas.** O City View integra; não substitui o 190, o 115, o SIGO ou qualquer legado.
4. **Pessoa no circuito.** Nada é enviado a um órgão sem conferência humana e liberação daquele órgão.
5. **Dado pessoal nunca em claro.** Nada que identifique o cidadão vai ao mapa público. O City View observa a cidade e a gestão, nunca pessoas.
6. **Nunca automatizar credenciais pessoais do gov.br.**
7. **O dfac está em produção.** Não alterar; banco somente leitura.

---

## 8. Pendências herdadas

- Medir a adesão de Águas Claras (canal DFÁguasClaras × portal oficial), com fonte e data (magno, pergunta 9.25).
- Confirmar com o Daniel os nomes que a transcrição pode ter errado: o projeto de Madri e o caso do ator. A empresa espanhola é a Viewtinet (informado pela equipe em 11/11/2026).
- Confirmar o mecanismo atual de envio ao Portal do Cidadão no dfac antes de prometer esse conector.
  - *Acréscimo de 11/11/2026:* o mecanismo está documentado no dfac (seção 2, acréscimo sobre o Portal do Cidadão): sessão compartilhada com login manual por extensão de navegador. Ainda vale conferir que está em uso em produção antes de prometer o conector.

---

## Histórico de versões

| Versão | Data | Mudança |
| --- | --- | --- |
| 0.3 | 11/11/2026 | Acréscimos datados, sem apagar texto, após leitura dos repositórios `City-view` e `dfac-agentic-saas`: conexão ao Portal do Cidadão por extensão com login manual (seção 2 e pendências); prioridade por recorrência já existe no dfac desde 01/10/2026 (seção 2); pitch do Zela DF nunca foi mostrado (seção 3); a apresentação de 14 slides da fase C e o motivo de recomeçar do zero (seção 4) |
| 0.2 | 11/11/2026 | Recebe o código CV-REF-001 e o novo nome de arquivo. Links atualizados para CV-SPEC-000 e CV-ATA-001. Seção 5 reescrita para o novo magno (sem ordem de trabalho nem referências a requisitos, telas e regras do magno v1.1). Correções pontuais: atribuição do percentual de adesão, grafia Viewtinet |
| 0.1 | 11/11/2026 | Primeira versão, a partir da leitura dos repositórios `dfac-agentic-saas` e `cityView` |

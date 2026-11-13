# dfac · Máquina de Ouvidoria (DFÁGUASCLARAS)

| Campo | Valor |
| --- | --- |
| Setor | projeto nosso |
| Tipo | canal do cidadão e sistema de envio aos portais oficiais |
| Pesquisado em | 13/11/2026 |
| Confiança | alta para o que está no código; média para o que roda em produção (não conferido) |

## O que é

A plataforma do canal DFÁGUASCLARAS, uma rede de grupos de WhatsApp de Águas Claras. Nasceu como ferramenta de campanhas e ganhou o módulo de ouvidoria: o cidadão relata pelo WhatsApp ou pelo mapa do site parceiro, um operador revisa, e a plataforma protocola nos portais oficiais e acompanha.

## Quem opera

Datasynq. Repositório `Datasynq-org/dfac-agentic-saas`, em produção (`dfacanalytics.com.br`). **Não é do governo:** é um canal de uma comunidade, que usa os portais do governo como qualquer cidadão usaria.

## O que o cidadão faz ali

- Relata um problema pelo **WhatsApp** (assistente que coleta tipo, descrição, local e foto) ou pelo **mapa de demandas** do site parceiro ([cartão](mapa-de-demandas-aguas-claras.md)).
- Recebe o protocolo oficial e as mudanças de situação pelo mesmo canal.

## Que dado tem

- Tabela `ouvidoria_demands`: tipo, relato (original e refinado), endereço, ponto de referência, coordenadas, canal de origem, destino, protocolos oficiais, datas de criação, aprovação, envio e **resolução**, situação externa.
- Situações: recebida → triagem → pronta para revisão → em revisão → aprovada → fila → enviando → enviada → acompanhando → resolvida → encerrada, mais rejeitada, duplicada e falha de envio.
- Telefone do cidadão guardado como pseudônimo (HMAC) e mascarado; sem nome, CPF ou e-mail na demanda. O texto livre e o endereço podem conter dado pessoal.
- **Nada disso é dado aberto.** O que é público é o mapa do site parceiro.

## Como o City View chegaria a ele

- É nosso: o acesso é uma decisão da equipe, não uma integração a negociar.
- Leitura do banco de produção existe (réplica só de leitura, citada nos relatórios do repositório), mas **não foi usada para a demo** e depende de liberação do Sammuel.
- Exportação `GET /api/demands/export.csv` exige login de operador e traz endereço e ponto de referência.

## O que já temos

- A demo reproduz o roteiro do assistente, sem copiar código (`demo-view/src/dados/coleta.ts`, `demo-view/src/telas/jornada/`).
- Os estados do dfac estão mapeados para o modelo único da demo (`demo-view/src/dominio/ponte.ts`).
- Os três conectores reais estão no catálogo como são (`demo-view/src/dominio/conectores.ts`): Participa DF, Portal do Cidadão e IluminaDF.
- A regra de recorrência do dfac inspirou o agrupamento dos relatos reais (`demo-view/src/inteligencia/reais.ts`).

## Por que importa para a proposta

É a prova de uma das pontas: um canal que centraliza a entrada, envia aos sistemas oficiais e acompanha. Números em magno 6.1. Não é o escopo do City View, que é a observabilidade por cima.

## Do que ele depende (por dentro)

- **Portais oficiais:** [Participa DF](participa-df.md), [Portal do Cidadão](portal-do-cidadao-156.md), [IluminaDF](ceb-ipes.md). Os três são usados como um cidadão usaria (chamadas ao serviço do portal, sessão de navegador), sem contrato de integração.
- **WhatsApp:** por um provedor de API de WhatsApp (o repositório tem relatórios de prontidão do provedor em `reports/`).
- **Geocodificação:** há uma revisão sobre o uso do Google Geocoding em `docs/GOOGLE_GEOCODING_REVIEW.md`.
- **Hospedagem:** Replit (VM sempre ligada), PostgreSQL e Redis, segundo o README.

## O que não foi confirmado

- Se a regra nova de recorrência (no `main` desde 01/10/2026) está ligada em produção.
- Os números atuais do banco: os do magno 6.1 são de 28/10/2026.
- Prazo de retenção e caminho de exclusão dos dados: o diagnóstico de produção diz que ainda não existem.
- O provedor de WhatsApp e a hospedagem não foram relidos nesta pesquisa além do README e dos nomes dos arquivos.

## Fontes

- **(repositório)** `dfac-agentic-saas` no remoto, `main` em `0eec955` (09/11/2026): `README.md`, `api/ouvidoria_schema.py`, `api/demand_models.py`, `api/demand_intake.py`, `api/demand_triage.py`, `api/demand_recurrence.py`, `docs/MODELO_DADOS_DEMANDAS.md`, `docs/DIAGNOSTICO_PRODUCAO.md`, `CONTEXTO_PLATAFORMA.md`.
- **(repositório)** `docs/CV-REF-001-historico-dos-projetos.md` e `docs/CV-SPEC-000-documento-magno.md`, seção 6.1.

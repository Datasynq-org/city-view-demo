# SLU · Serviço de Limpeza Urbana

| Campo | Valor |
| --- | --- |
| Setor | GDF |
| Tipo | sistema de órgão · dado aberto |
| Pesquisado em | 13/11/2026 |
| Confiança | baixa: só resumos |

## O que é

A autarquia de limpeza urbana do DF: coleta, entulho, descarte irregular.

## Quem opera

Serviço de Limpeza Urbana do DF.

## O que o cidadão faz ali

Pede pelo 162 / Participa DF. O aplicativo "SLU Coleta DF" mostra dias e horários de coleta.

## Que dado tem

10 conjuntos no portal de dados abertos, a maioria marcada como **inativa** desde 31/01/2024.

## Como o City View chegaria a ele

Hoje o pedido do cidadão entra pela ouvidoria ([Participa DF](participa-df.md)) ou pela [ADM 24h](adm-24h.md). **Não sabemos.** Nenhuma fonte lida descreve API ou porta de integração. Há um módulo do SLU dentro da ADM 24h.

## O que já temos

No catálogo de conectores da demo como **proposta**, sem método definido (`demo-view/src/dominio/conectores.ts`); no catálogo de órgãos (`demo-view/src/dominio/orgaos.ts`).

## Por que importa para a proposta

É um dos órgãos já ligados à ADM 24h: bom exemplo de que a integração entre sistemas do GDF está começando.

## O que não foi confirmado

- Tudo o que está aqui veio de resumo de busca.

## Fontes

- **(resumo)** https://www.slu.df.gov.br/aplicativo-slu-coleta-df
- **(resumo)** https://www.dados.df.gov.br/organization/slu-servico-de-limpeza-urbana-do-distrito-federal
- **(lido)** Integração com a ADM 24h: https://www.agenciabrasilia.df.gov.br/w/administracao-regional-digital-24h-e-gdf-presente-passam-a-ter-integracao-na-execucao-de-servicos

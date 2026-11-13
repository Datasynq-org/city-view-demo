# CEB IPes · iluminação pública · Ilumina DF

| Campo | Valor |
| --- | --- |
| Setor | empresa pública (subsidiária da CEB) |
| Tipo | sistema de órgão · canal do cidadão |
| Pesquisado em | 13/11/2026 |
| Confiança | média: canais e prazos vêm de um site não oficial que cita a carta de serviços |

## O que é

A empresa que mantém e moderniza a iluminação pública do DF.

## Quem opera

CEB Iluminação Pública e Serviços, subsidiária integral da Companhia Energética de Brasília (do GDF).

## O que o cidadão faz ali

Telefone **155** (24 h), WhatsApp (61) 3774-1155, aplicativo "Ilumina DF" (marca o poste no mapa) e site.

## Que dado tem

- 324.573 luminárias em cerca de 262 mil postes (número atribuído a "dados do GDF").
- Prazos declarados: 72 h para lâmpada apagada em área urbana, 12 h para risco; 144 h e 24 h na área rural.
- Desde 01/12/2025 está integrada à [ADM 24h](adm-24h.md).
- Dado aberto: nenhum achado.

## Como o City View chegaria a ele

Já chegamos: o dfac tem a integração com o IluminaDF pronta, por chamadas diretas ao serviço.

## O que já temos

Conector **pronto, não ativo** no catálogo (`demo-view/src/dominio/conectores.ts`). É o único conector de órgão que não é proposta. No dado real de Águas Claras, iluminação são 137 demandas.

## Por que importa para a proposta

É a integração mais adiantada que temos com um órgão. E há um número incômodo, a conferir: uma reportagem diz que só 6,9% das reclamações de iluminação na ouvidoria constavam como resolvidas (jan. a set. de 2025).

## O que não foi confirmado

- O número oficial de pontos de luz (324 mil ou 369 mil).
- Os prazos na carta de serviços original.
- Os 6,9% (só em resumo).

## Fontes

- **(lido)** Não oficial: https://soubrasilia.com/servicos/iluminacao-publica-ceb-ipes/
- **(lido)** Não oficial: https://soubrasilia.com/iluminacao-publica-df-155-como-acionar/
- **(resumo)** https://www.metropoles.com/distrito-federal/ceb-resolve-so-69-das-reclamacoes-sobre-iluminacao-precaria-no-df
- **(repositório)** `dfac-agentic-saas`, `api/demand_ceb.py`

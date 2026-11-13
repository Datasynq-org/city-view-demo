# ANEEL · dados abertos de energia

| Campo | Valor |
| --- | --- |
| Setor | federal |
| Tipo | regulador · dado aberto |
| Pesquisado em | 13/11/2026 |
| Confiança | alta: as páginas dos conjuntos foram lidas |

## O que é

A agência reguladora de energia elétrica. Publica, como dado aberto, a continuidade do serviço de cada distribuidora.

## Quem opera

Agência Nacional de Energia Elétrica.

## O que o cidadão faz ali

Tem ouvidoria setorial; não é canal de serviço.

## Que dado tem

- **Interrupções de energia nas redes de distribuição:** toda interrupção desde 2017, com data e hora ao segundo, por conjunto de unidades consumidoras. Arquivos anuais (Parquet), atualização mensal.
- **DEC e FEC:** realizados e limites por conjunto, compensações pagas. CSV e Parquet, mensal, licença aberta (ODbL).
- **Ouvidoria setorial:** reclamações, CSV anual de 2014 a 2026, por município, atualização diária.
- **Ocorrências emergenciais nas redes** (só o título foi visto).
- Os conjuntos são menores que o município: o DF se divide em vários.

## Como o City View chegaria a ele

**Dado aberto, por download, hoje.** Sem contrato, sem pedir à distribuidora.

## O que já temos

Nada. A demo simula a rede da Neoenergia.

## Por que importa para a proposta

**É o melhor achado desta pesquisa para a "qualidade de rede".** Permite mostrar interrupções reais no DF, por área e por hora, e cruzá-las com chamados. Um apagão de verdade, com data, em vez do simulado.

## O que não foi confirmado

- Como os conjuntos da ANEEL se encaixam nas regiões administrativas.
- Se a base de ouvidoria separa por distribuidora.
- O atraso entre o fato e a publicação (a atualização é mensal).

## Fontes

- **(lido)** https://dadosabertos.aneel.gov.br/dataset/indicadores-coletivos-de-continuidade-dec-e-fec
- **(lido)** https://dadosabertos.aneel.gov.br/dataset/interrupcoes-de-energia-eletrica-nas-redes-de-distribuicao
- **(lido)** https://dadosabertos.aneel.gov.br/dataset/ouvidoria-setorial-aneel

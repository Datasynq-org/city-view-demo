# DF Legal e Brasília Ambiental (Ibram)

| Campo | Valor |
| --- | --- |
| Setor | GDF |
| Tipo | sistema de órgão |
| Pesquisado em | 13/11/2026 |
| Confiança | baixa: só resumos |

## O que é

A fiscalização urbana (DF Legal: obras e ocupações irregulares) e a ambiental (Brasília Ambiental: poluição sonora, crimes ambientais).

## Quem opera

Secretaria DF Legal e Instituto Brasília Ambiental.

## O que o cidadão faz ali

Os dois recebem denúncia **só pela ouvidoria** (162 / Participa DF) ou presencialmente.

## Que dado tem

Não achei dado aberto nem volumes.

## Como o City View chegaria a ele

Hoje o pedido do cidadão entra pela ouvidoria ([Participa DF](participa-df.md)) ou pela [ADM 24h](adm-24h.md). **Não sabemos.** Nenhuma fonte lida descreve API ou porta de integração.

## O que já temos

No catálogo de conectores da demo como **proposta**, sem método definido (`demo-view/src/dominio/conectores.ts`); no catálogo de órgãos (`demo-view/src/dominio/orgaos.ts`). Os dois aparecem no caso do sossego (simulado).

## Por que importa para a proposta

Dependem inteiramente do 162: o que chega a eles já passou por um silo.

## O que não foi confirmado

- Tudo veio de resumo; a página do Ibram é antiga.

## Fontes

- **(resumo)** https://www.dflegal.df.gov.br/a-ouvidoria-da-df-legal
- **(resumo)** https://www.ibram.df.gov.br/denuncia-autuacao/
- **(repositório)** `demo-view/src/dominio/orgaos.ts`

# geobr (Ipea): escolas, saúde e comunidades

| Campo | Valor |
| --- | --- |
| Setor | federal (Ipea, com dados do INEP, do CNES e do IBGE) |
| Tipo | dado aberto · dependência técnica |
| Pesquisado em | 13/11/2026 |
| Confiança | média: vem do README da demo; a origem não foi relida nesta pesquisa |

## O que é

Um pacote do Ipea que entrega bases geográficas oficiais do Brasil já prontas para uso. A demo usa três delas como "camadas reais" do mapa da sala.

## Quem opera

Ipea (pacote geobr). Os dados de origem são do INEP (escolas), do Ministério da Saúde (CNES, unidades de saúde) e do IBGE (favelas e comunidades urbanas).

## O que o cidadão faz ali

Não é canal do cidadão.

## Que dado tem

Na demo, baixados em 10/11/2026 (`demo-view/public/dados/`):
- **Escolas públicas** do DF: 722 (INEP 2025, pelo rótulo da tela).
- **Unidades públicas de saúde:** 241 (CNES 2026).
- **Favelas e comunidades urbanas:** 62 (IBGE 2022).

## Como o City View chegaria a ele

Dado aberto, sem chave, pelo pacote. Para produção, o caminho é ir às fontes de origem (INEP, CNES, IBGE), que publicam os mesmos dados com mais campos.

## O que já temos

- As três camadas na sala (`demo-view/src/mapa/camadas/contexto.ts`, `demo-view/src/dados/contexto.ts`).
- Elas também pesam onde os chamados simulados caem (`demo-view/src/dados/mancha.json`, README "Mancha urbana").

## Por que importa para a proposta

São o exemplo de "contexto da cidade" cruzado com os chamados: um problema perto de uma escola ou de uma unidade de saúde pesa diferente. E são dado real, marcado como real na tela.

## O que não foi confirmado

- A licença de cada base na origem.
- A citação pedida pelo pacote está no README da demo ("Pereira, R. H. M.; Barbosa, R. J. et al. geobr. Ipea"); a forma atual da citação não foi conferida.
- As contagens são as da tela da demo; não foram comparadas com a origem.

## Fontes

- **(repositório)** `demo-view/README.md`, "Origem do código e licenças"; `demo-view/public/dados/`.
- **(repositório)** `docs/CV-SPEC-000-documento-magno.md`, seção 7.7.

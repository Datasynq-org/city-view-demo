# Neoenergia Brasília

| Campo | Valor |
| --- | --- |
| Setor | concessionária privada |
| Tipo | sistema de órgão · canal do cidadão |
| Pesquisado em | 13/11/2026 |
| Confiança | alta para números de 2025 (relatório anual lido); média para a privatização (resumos) |

## O que é

A distribuidora de energia elétrica do DF, antiga CEB Distribuição.

## Quem opera

- Neoenergia Distribuição Brasília S.A., controlada pela Neoenergia S.A. Leilão em 04/12/2020 (R$ 2,515 bilhões); contrato de venda assinado em 02/03/2021.
- Regulada e fiscalizada pela [ANEEL](aneel.md), que é federal. **Quem regula não é o GDF** ([cartão sobre o que se pode pedir](concessao-e-acesso-a-dados.md)).

## O que o cidadão faz ali

Telefone **116**, WhatsApp (61) 3465-9318, aplicativo "Neoenergia Brasília" e agência virtual.

## Que dado tem

- 1,214 milhão de clientes em 2025.
- **DEC 5,73 h** (limite 6,80 h) e **FEC 3,93** (limite 4,73) em 2025; em 2024, 5,04 e 3,80.
- A página de falta de energia **não traz mapa nem lista de áreas afetadas**. Desligamento programado tem consulta por cidade.
- Dado aberto da própria empresa: nenhum achado. O dado aberto é o da ANEEL.

## Como o City View chegaria a ele

Para a operação em tempo real, **não sabemos**, e depende da empresa. **Para o histórico, não depende dela:** a ANEEL publica todas as interrupções ([cartão](aneel.md)).

## O que já temos

No catálogo de órgãos e de conectores da demo (`demo-view/src/dominio/orgaos.ts`, `conectores.ts`). A "qualidade da rede" da Neoenergia na demo é **simulada** (`demo-view/src/dominio/operacao.ts`): 310 clientes sem energia, religamento em 2,6 h. O caso do apagão de Planaltina é simulado.

## Por que importa para a proposta

É o exemplo do Sammuel para o setor privado, e o caso mais forte da demo. A boa notícia: **dá para trocar o número simulado por um real** (DEC, FEC e interrupções da ANEEL) sem pedir nada à empresa.

## O que não foi confirmado

- O que a página "Energia em tempo real" mostra (não carregou).
- O desfecho das ações judiciais contra a privatização.
- Os limites regulatórios de 2024.
- O contrato de concessão não foi lido.

## Fontes

- **(lido)** Relatório anual de 2025: https://cdn.jornaldebrasilia.com.br/wp-content/uploads/2026/02/12065042/NEO-ENERGIA_5X34_1202.pdf
- **(lido)** https://www.neoenergia.com/web/brasilia/falta-de-energia
- **(lido)** https://www.neoenergia.com/web/brasilia/sua-casa/tipos-de-desligamento
- **(resumo)** https://eixos.com.br/neoenergia-vence-leilao-de-privatizacao-da-ceb-distribuicao-por-r-25-bi/
- **(repositório)** magno, seção 5.2

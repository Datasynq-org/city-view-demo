# SES-DF · InfoSaúde e Vigilância Ambiental

| Campo | Valor |
| --- | --- |
| Setor | GDF |
| Tipo | dado aberto · sistema de órgão |
| Pesquisado em | 13/11/2026 |
| Confiança | média: InfoSaúde só em resumo; Vigilância lida |

## O que é

O portal de dados da saúde do DF (InfoSaúde) e a vigilância ambiental, que cuida de focos de dengue.

## Quem opera

Secretaria de Saúde do DF; o InfoSaúde foi feito com a Fiocruz.

## O que o cidadão faz ali

Disque-Saúde **160** (na mesma central do 156). Foco de dengue: telefones da Vigilância, 160 ou 162.

## Que dado tem

InfoSaúde: cerca de 231 painéis, com exportação em CSV e 4,2 milhões de acessos em 2024 (só em resumo).

## Como o City View chegaria a ele

Dado agregado pelos painéis, se a exportação existir como descrito. Para filas e esperas, **não sabemos**.

## O que já temos

Saúde só aparece como sinal simulado (caso da dengue; `demo-view/src/inteligencia/casos.ts`). O cartão de triangulação da demo usa "espera alta na unidade de saúde" como exemplo sem número.

## Por que importa para a proposta

Se o InfoSaúde tiver espera ou ocupação por região, é o primeiro dado real para a **triangulação** (operação apertada e poucos chamados).

## O que não foi confirmado

- Se há painel de dengue por região administrativa.
- O que os 231 painéis cobrem; se há fila ou espera.

## Fontes

- **(lido)** https://www.saude.df.gov.br/servicos-dival
- **(resumo)** https://www.saude.df.gov.br/web/guest/w/portal-infosa%C3%BAde-df-bate-recorde-com-mais-de-4-milh%C3%B5es-de-acessos-em-2024
- **(lido)** O 160 na central do 156: https://www.economia.df.gov.br/central-de-atendimento-ao-cidadao

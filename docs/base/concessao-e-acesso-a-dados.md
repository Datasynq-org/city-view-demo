# O que se pode pedir a uma concessionária

| Campo | Valor |
| --- | --- |
| Setor | federal (leis) |
| Tipo | marco legal |
| Pesquisado em | 13/11/2026 |
| Confiança | média: o texto das leis foi lido; a aplicação ao caso não |

## O que é

O que as leis dizem sobre o dado de uma concessionária ou de uma empresa do governo. **Não é parecer jurídico:** aponta a pergunta.

## Quem opera

Lei das Concessões (8.987/1995) e Lei de Acesso à Informação (12.527/2011).

## O que o cidadão faz ali

Não é canal do cidadão.

## Que dado tem

- **Lei das Concessões:** o poder concedente tem acesso, na fiscalização, aos dados administrativos, contábeis, técnicos, econômicos e financeiros da concessionária (art. 30); a concessionária presta contas ao poder concedente e aos usuários (art. 31).
- **Lei de Acesso à Informação:** alcança órgãos públicos, empresas de economia mista e entidades controladas pelo governo. Pelo texto, alcança a Caesb e a CEB IPes.

## Como o City View chegaria a ele

Não se aplica.

## O que já temos

A regra da demo "dados de operação entram como proposta: cada órgão decide o que libera" (`demo-view/src/dominio/conectores.ts`).

## Por que importa para a proposta

Separa dois casos. **Caesb e CEB IPes** são do GDF: o governo pode mandar. **A Neoenergia** é privada e regulada por uma agência federal, a ANEEL: tudo indica que o GDF não é quem fiscaliza (ver o que não foi confirmado). Para ela, o caminho mais curto é o dado que a ANEEL já publica.

## O que não foi confirmado

- Que o poder concedente da distribuição é a União **é inferência, não foi lido numa fonte**.
- Se a Lei de Acesso à Informação alcança uma concessionária privada.
- O contrato de concessão da Neoenergia Brasília não foi lido.
- Regras da ANEEL sobre troca de informação de iluminação pública: só em resumo.

## Fontes

- **(lido)** https://www.planalto.gov.br/ccivil_03/leis/l8987cons.htm
- **(lido)** https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm

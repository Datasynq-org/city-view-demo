# CAESB

| Campo | Valor |
| --- | --- |
| Setor | empresa mista controlada pelo GDF |
| Tipo | sistema de órgão · canal do cidadão |
| Pesquisado em | 13/11/2026 |
| Confiança | média: o site foi lido; participação acionária e relatórios só em resumo |

## O que é

A companhia de água e esgoto do DF.

## Quem opera

Companhia de Saneamento Ambiental do DF, de economia mista; o GDF tem cerca de 89% das ações ordinárias. Regulada pela [ADASA](adasa.md).

## O que o cidadão faz ali

Telefone **115** (24 h), portal de serviços e aplicativo. Serviços "Consultar Falta de Água" e "Informar Falta de Água".

## Que dado tem

- Avisos de manutenção datados na página inicial (por exemplo: Guará II, 17/11, das 8h às 23h30).
- Relatórios em PDF: ouvidoria trimestral (8.066 manifestações no 2º trimestre de 2026), indicadores de desempenho, qualidade da água (só em resumo).

## Como o City View chegaria a ele

**Não sabemos.** Nenhuma fonte lida descreve API ou porta de integração. Os avisos de manutenção são públicos e legíveis na página.

## O que já temos

No catálogo de órgãos e de conectores da demo (`demo-view/src/dominio/orgaos.ts`, `conectores.ts`). A operação da CAESB na demo é **simulada** (`operacao.ts`). O dfac deixa água e esgoto sem destino, porque a CAESB tem canal próprio.

## Por que importa para a proposta

Por ser controlada pelo GDF, é mais fácil de trazer do que a concessionária privada. Os avisos de manutenção já publicados são o tipo de "operação" que explicaria chamados (o caso plantado do Guará usa exatamente isso).

## O que não foi confirmado

- O formato da consulta de falta de água (a página entrou em laço).
- WhatsApp e nome do aplicativo, na fonte oficial.
- A participação exata do GDF.

## Fontes

- **(lido)** https://www.caesb.df.gov.br/
- **(resumo)** https://soubrasilia.com/servicos/caesb/

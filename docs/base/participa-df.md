# Participa DF · Ouvidoria-Geral · 162

| Campo | Valor |
| --- | --- |
| Setor | GDF |
| Tipo | canal do cidadão · dado aberto |
| Pesquisado em | 13/11/2026 |
| Confiança | alta: páginas oficiais lidas; volumes recentes não |

## O que é

A plataforma única do GDF para manifestações de ouvidoria e pedidos de acesso à informação. Juntou os antigos OUV-DF e e-SIC.

## Quem opera

Controladoria-Geral do DF (CGDF), pela Ouvidoria-Geral. Cada órgão tem a sua ouvidoria seccional.

## O que o cidadão faz ali

- Site participa.df.gov.br, com cadastro próprio (CPF e senha).
- Telefone **162**, gratuito, de segunda a sexta das 7h às 21h, fins de semana e feriados das 8h às 18h.
- Presencial na ouvidoria de cada órgão; canal em Libras.

## Que dado tem

- **Painel de Ouvidoria** (painel.ouv.df.gov.br), com filtro por período, tipo, assunto e órgão. Não vi filtro por região administrativa.
- Estatísticas do sistema de ouvidorias em CSV e PDF no portal de dados abertos (só em resumo).
- 157.527 manifestações em 2017 e 293.306 em 2021 (só em resumo).

## Como o City View chegaria a ele

Dado agregado pelo painel e pelos arquivos abertos. Para o registro de cada manifestação, **não sabemos**: nenhuma fonte descreve API. O dfac registra ali como um cidadão registraria.

## O que já temos

O dfac protocola no Participa DF por chamadas diretas ao serviço do portal (12 protocolos até 28/10/2026, magno 6.1). No catálogo da demo como **existe** (`demo-view/src/dominio/conectores.ts`).

## Por que importa para a proposta

É por onde entra, hoje, boa parte do que seria "demanda" de vários órgãos (Novacap, SLU, DF Legal, Ibram pedem que o cidadão use o 162). É o silo mais largo, e é de ouvidoria, não de ordem de serviço.

## O que não foi confirmado

- Totais anuais de 2022 a 2025.
- Se aceita login gov.br.
- O formato das colunas dos arquivos abertos.
- Se o painel separa por região administrativa.

## Fontes

- **(lido)** https://www.participa.df.gov.br/
- **(lido)** https://ouvidoria.df.gov.br/o-participa-df-e-o-novo-canal-do-gdf-para-registrar-demandas-de-ouvidorias-e-pedidos-de-acesso-a-informacao
- **(lido)** https://www.cg.df.gov.br/w/painel-de-ouvidoria-do-df-ganha-novo-visual-e-amplia-acesso-a-dados-sobre-servicos-publicos
- **(resumo)** https://www.dados.df.gov.br/dataset?groups=participacao-social
- **(resumo)** https://www.ouvidoria.df.gov.br/em-cinco-anos-cresce-em-86-o-numero-de-registros-em-ouvidorias-do-gdf

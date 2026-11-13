# Palantir (Foundry, Gotham, AIP)

| Campo | Valor |
| --- | --- |
| Setor | privado · Estados Unidos |
| Tipo | produto comparável |
| Pesquisado em | 13/11/2026 |
| Confiança | média: documentação oficial e o prospecto de 2020 lidos; contratos no Brasil sem documento primário |

## O que é

Plataformas de integração e análise de dados para governo e grandes empresas. O Foundry organiza os dados numa "ontologia" (objetos, ligações e ações); o Gotham é a linha de segurança e defesa; o AIP liga modelos de linguagem a essa ontologia.

## Quem opera

- Palantir Technologies. Vende sobretudo a governos nacionais e defesa.
- **No nível de cidade e estado, o que achei é policial:** Nova Orleans (análise de vínculos para a polícia, sem custo, de cerca de 2012 a 2018, encerrado depois de vir a público) e três estados alemães (Hesse, Baviera e Renânia do Norte-Vestfália). A base legal de Hesse foi julgada inconstitucional em 16/02/2023.
- **Não achei uso em operação de cidade ou central de atendimento.**

## O que o cidadão faz ali

Não é canal do cidadão do DF. É ferramenta interna de órgãos.

## Que dado tem

- **Ontologia:** objetos, propriedades e ligações, mais ações e funções, sobre os dados da organização.
- **Ações:** mudanças que a pessoa faz de uma vez, com validação de permissão, gravadas de volta no sistema de origem.
- **Linhagem e auditoria:** de onde veio cada dado e o registro de toda ação.
- **AIP:** ferramentas para construir sobre a ontologia com modelos de linguagem (AIP Logic, Chatbot Studio, Evals).

## Como o City View chegaria a ele

Não se aplica: é referência de desenho, não um sistema a integrar.

## O que já temos

A leitura de desenho está em `docs/CV-DEM-002-revisao-por-papeis.md`, seção 5.2. Três ideias já entraram na demo: o incidente como objeto único, a ação que volta ao sistema de origem (ida e volta com os órgãos) e a origem de cada número ("De onde vem").

## Por que importa para a proposta

É a referência de "integrar fontes diferentes e agir a partir do achado". E é o nome a evitar no pitch (magno 7.6): toda vez que entrou em governo sem licitação clara ou sem transparência, a reação veio.

## O que levar e o que não copiar

- **Levar:** um piloto barato que prova um caso de uso antes de crescer; engenheiros trabalhando dentro do órgão.
- **Não copiar:** a entrada opaca ou sem licitação (Nova Orleans, Hesse, FNDE), que gerou a reação em todos os casos; e a análise de vínculos centrada em pessoas.

## O que não foi confirmado

- **Brasil:** um artigo de opinião afirma uma doação ao governo de São Paulo na pandemia e trabalho na Prodesp; o FNDE teria usado o Foundry "via Serpro", e o Serpro negou parceria. **Não achei documento de contrato**: tratar como não confirmado.
- Uso comercial no Brasil (Grupo Globo desde 2019) só em resumo de busca.
- Valores dos contratos de Hesse e de Nova York.

## Fontes

- **(lido)** https://www.palantir.com/docs/foundry/ontology/overview/
- **(lido)** https://www.palantir.com/docs/foundry/action-types/overview/
- **(lido)** https://www.palantir.com/docs/foundry/aip/overview
- **(lido)** Prospecto de 2020 (modelo "adquirir, expandir, escalar"; pilotos "a baixo custo ou sem custo"; contratos de até cinco anos; receita média de US$ 5,6 milhões por cliente em 2019): https://www.sec.gov/Archives/edgar/data/1321655/000119312520230013/d904406ds1.htm
- **(lido)** Nova Orleans: https://typeinvestigations.org/impact/2018/03/15/new-orleans-ends-its-palantir-predictive-policing-program/
- **(lido)** Estados alemães: https://heise.de/-10453589
- **(lido)** Opinião, sem números de contrato: https://www.cartacapital.com.br/artigo/as-sombras-da-palantir-e-o-brasil/
- **(resumo)** Linhagem e auditoria: https://palantir.com/docs/foundry/data-lineage · https://www.palantir.com/docs/foundry/security/audit-logs-overview/

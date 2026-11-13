# IDE/DF · Geoportal

| Campo | Valor |
| --- | --- |
| Setor | GDF |
| Tipo | dado aberto · dependência técnica |
| Pesquisado em | 13/11/2026 |
| Confiança | alta para o serviço; os termos de uso seguem sem confirmação |

## O que é

A infraestrutura de dados espaciais do DF: os mapas oficiais.

## Quem opera

Secretaria de Desenvolvimento Urbano e Habitação (Seduh).

## O que o cidadão faz ali

Não é canal do cidadão.

## Que dado tem

- Serviço de mapas público (ArcGIS REST), com até 1.000 registros por consulta: lotes, edificações, quadras, setores, localidades, sistema viário, topografia, áreas queimadas.
- Catálogo de metadados à parte (só em resumo).

## Como o City View chegaria a ele

Serviço público, consultável, sem chave.

## O que já temos

- Os contornos das regiões administrativas (`demo-view/src/dominio/ras-geo.json`, baixados em 07/11/2026).
- A imagem de perto, de 2021, com 50 cm.
- A mancha urbana de 2023 (`demo-view/src/dados/mancha.json`).

## Por que importa para a proposta

É a base do mapa. Tudo o que o City View desenhar por região depende dela.

## O que não foi confirmado

- **Licença e termos de uso**: pendência já registrada no README da demo, que continua aberta.
- Por que há 37 contornos de região ([cartão](administracoes-regionais.md)).

## Fontes

- **(lido)** https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Publico/IDEDF/MapServer
- **(repositório)** `demo-view/README.md`, "Contornos das RAs" e "Mancha urbana"

# Mapas, imagens e bibliotecas de que a demo depende

| Campo | Valor |
| --- | --- |
| Setor | referência de fora (serviços e projetos de código aberto) |
| Tipo | dependência técnica |
| Pesquisado em | 13/11/2026 |
| Confiança | média: vem do README da demo; as licenças não foram relidas na origem nesta pesquisa |

## O que é

O que a demo (`demo-view/`) busca na rede ou embute para desenhar o mapa, e as bibliotecas que a fazem funcionar. Serve para responder "o que quebra se X mudar" e "o que precisa de crédito na tela".

## Quem opera

| Dependência | Quem | Para quê na demo |
| --- | --- | --- |
| OpenFreeMap (dados OpenMapTiles e OpenStreetMap) | projeto aberto | o desenho da cidade: água, vias, nomes, prédios |
| Sentinel-2 cloudless 2016 (s2maps.eu) | EOX IT Services | a imagem de satélite da vista geral |
| Imagem 2021, 50 cm | IDE/DF (SEDUH) | a imagem de perto ([cartão da IDE/DF](ide-df-geoportal.md)) |
| MapLibre GL JS | projeto aberto | o motor do mapa |
| deck.gl | projeto aberto (OpenJS) | as camadas 3D por cima do mapa |
| React, Vite, Tailwind, Motion, Vitest | projetos abertos | a interface, o build, as animações, os testes |
| Barlow e Barlow Condensed | fontes abertas | a tipografia |

## O que o cidadão faz ali

Não é canal do cidadão.

## Que dado tem

- **OpenFreeMap:** blocos vetoriais do mapa-base, de `tiles.openfreemap.org`.
- **Sentinel-2 cloudless:** mosaico mundial sem nuvens, 10 m de resolução, de `tiles.maps.eox.at`.
- **IDE/DF:** ver o cartão próprio.

## Como o City View chegaria a ele

Já chega: são serviços públicos, sem chave. Em produção, o caminho normal é hospedar os próprios blocos, para não depender da disponibilidade de terceiros.

## O que já temos

- Versões fixas em `demo-view/package.json`: MapLibre GL 6.17.0, deck.gl 9.4.1, React 19.3.1, Vite 8.3.8, Tailwind 4.3.5, Motion 14.12.0, Vitest 5.1.0.
- Sem internet, o mapa abre com fundo liso, as regiões e o calor; o resto continua (README da demo, "Sem internet").
- Os créditos aparecem no rodapé do mapa.

## Por que importa para a proposta

Nenhum destes exige licença paga nem chave, e isso mantém a demo barata e portátil. Dois cuidados valem antes de produção, abaixo.

## O que não foi confirmado

- **Licenças na origem:** o README registra MapLibre BSD-3-Clause, deck.gl e Motion MIT, fontes OFL-1.1, e Sentinel-2 cloudless 2016 sob CC BY 4.0 (os mosaicos de 2017 em diante seriam CC BY-NC-SA, sem uso comercial; por isso o de 2016). Nada disso foi reaberto nesta pesquisa.
- **Termos de uso do OpenFreeMap** para uso em produção e em volume.
- A imagem do Sentinel é de 2016: não mostra o que foi construído depois.

## Fontes

- **(repositório)** `demo-view/README.md`, seções "Sem internet" e "Origem do código e licenças"; `demo-view/package.json`.

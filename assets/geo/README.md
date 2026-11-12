# Limites das regiões administrativas do DF

`ra_gdf.geojson`: as 37 regiões administrativas do Distrito Federal, da base
oficial do GDF, baixadas em 07/11/2026 da Infraestrutura de Dados Espaciais do
DF (IDE/DF, SEDUH), serviço ArcGIS `Publico/LIMITES`, camada 1 "Regiões
Administrativas", em WGS 84 (EPSG:4326):

```
https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Publico/LIMITES/MapServer/1/query?where=1%3D1&outFields=ra_nome,ra_codigo,ra_cira&returnGeometry=true&outSR=4326&f=geojson
```

Campos usados: `ra_cira` (número da RA), `ra_codigo` (RA-I a RA-XXXVII) e
`ra_nome`. O Park Way é um MultiPolygon (duas partes); Lago Norte e Planaltina
têm buracos, onde ficam Varjão e Arapoanga.

Para atualizar: baixe de novo pela URL acima e regenere os derivados:

- `npm run build:mapa` (raiz): contornos simplificados em lon/lat (GeoJSON), ponto do rótulo e centroide de cada RA para o mapa da Sala de Situação, em `apps/sala-de-situacao/src/data/ras-geo.json`;
- `npm run build:regions` (dentro de `referencia/zela-df`): regiões da API do Zela DF.

A base grava o código de Ponte Alta como `XXXVII`, sem o prefixo `RA-` das demais; o
`build:mapa` normaliza.

Até 06/11/2026 usávamos os limites do OpenStreetMap, que tinham só 35 regiões
(faltavam 26 de Setembro e Ponte Alta) e erravam a divisa entre Park Way e
Águas Claras: o SMPW Quadra 5 caía em Águas Claras.

Pendente: confirmar os termos de uso dos dados da IDE/DF antes de produção.

## Neste repositório (`city-view-demo`)

Copiado de `Datasynq-org/City-view` (`assets/geo/`) em 11/11/2026, sem alteração
no dado. É o reuso previsto no CV-DEM-001, seção 5. Os comandos acima são do
repositório antigo. Aqui, os derivados são gerados por:

- `npm run mapa` (dentro de `apresentacao-web/`): contornos simplificados e
  projetados para SVG, com o ponto do rótulo de cada RA, em
  `apresentacao-web/src/mapa/ras.json`.
- `npm run geo -- ../assets/geo/ra_gdf.geojson` (dentro de `demo-view/`):
  contornos simplificados em lon/lat, ponto do rótulo, centroide e área de cada
  RA, em `demo-view/src/dominio/ras-geo.json`.

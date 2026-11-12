# Demo do City View

A demo vestida com o design system "Sala de Operações" (`../design-system`,
documentado em `docs/CV-DS-001`). Roadmap das iterações: `docs/CV-DEM-001`.

## Estado: casca da iteração I0/I1

- Barra superior, navegação (telas futuras marcadas como "em breve") e painel lateral em vidro.
- Mapa do DF (MapLibre) com os limites oficiais das RAs (IDE/DF) e **chamados de exemplo simulados**, coloridos por área. Funciona sem internet (sem tiles externos).
- Sala de situação: filtro de período, números, legenda e "chegando agora", calculados sobre os exemplos.
- `?catalogo`: catálogo vivo do design system, nos dois temas lado a lado.
- Tema claro/escuro (botão ◐ ou tecla T; `?tema=claro|escuro`).

O motor de dados portado da demo exploratória entra na próxima iteração (CV-DEM-001, seção 5).

## Rodar

```bash
npm install
npm run mapa      # regenera src/mapa/ras.geo.json e src/dados/exemplos.json (só quando mudar a base)
npm run dev       # http://localhost:5191   ·   catálogo: http://localhost:5191/?catalogo
npm run build     # typecheck + build estático em dist/
```

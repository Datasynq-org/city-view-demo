# Vitrine do design system "Sala de Operações"

Uma casca de aplicativo vestida com o design system (`../design-system`,
documentado em `docs/CV-DS-001`) e o catálogo vivo dos componentes.

**Esta não é a demo do City View.** A demo fica em `../demo-view/` e tem visual
próprio (CV-DEM-001, seção 9.1). Esta pasta se chamava `demo/` até 12/11/2026 e
não recebe as iterações da demo.

## O que tem

- Barra superior, navegação (telas futuras marcadas como "em breve") e painel lateral em vidro.
- Mapa do DF (MapLibre) com os limites oficiais das RAs (IDE/DF) e **chamados de exemplo simulados**, coloridos por área. Funciona sem internet (sem tiles externos).
- Sala de situação: filtro de período, números, legenda e "chegando agora", calculados sobre os exemplos.
- `?catalogo`: catálogo vivo do design system, nos dois temas lado a lado.
- Tema claro/escuro (botão ◐ ou tecla T; `?tema=claro|escuro`).

Os dados são exemplos fixos, só para a interface ter o que mostrar. O motor de
dados simulados está na demo (`../demo-view/`).

## Rodar

```bash
npm install
npm run mapa      # regenera src/mapa/ras.geo.json e src/dados/exemplos.json (só quando mudar a base)
npm run dev       # http://localhost:5191   ·   catálogo: http://localhost:5191/?catalogo
npm run build     # typecheck + build estático em dist/
```

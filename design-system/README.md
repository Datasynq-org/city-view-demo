# Design system "Sala de Operações"

Tokens, base CSS e componentes React do City View, compartilhados por
`apresentacao-web/` (a apresentação em rolagem) e `demo/` (a demo). Não é um pacote npm:
cada app importa pelo atalho `@ds`.

- **Documentação:** [docs/CV-DS-001-design-system.md](../docs/CV-DS-001-design-system.md)
- **Catálogo vivo:** `cd demo && npm run dev`, depois abra `http://localhost:5191/?catalogo`

```
src/
  tokens.css     temas escuro e claro (superfícies, tinta, acento, sinais, áreas, situação, mapa)
  base.css       escala proporcional, palco 16:9, tipografia, vidro, peças e padrões de aplicativo
  tema.ts        tema claro/escuro (?tema= → escolha salva → sistema) e aviso de troca
  paleta.ts      leitura dos tokens para canvas e WebGL
  componentes/   Painel, Rotulo, Selo, Chip, Botao, Pilula, Kpi, Alerta, Legenda,
                 CartaoInsight, TrocaTema, Segmentado, BarraSuperior, Navegacao,
                 PainelLateral, LinhaDeIncidente
  index.ts
```

Como ligar num app: ver a seção 9 do CV-DS-001.

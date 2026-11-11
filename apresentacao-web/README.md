# Apresentação em rolagem (experimento)

Branch `experimento/apresentacao-scroll`. O que seria o City View, contado como página
com rolagem, **agnóstica do .pptx**: a narrativa parte da conversa com o Daniel
(`docs/fonte/CV-ATA-001`), com a observabilidade no centro e a abertura de demandas
como uma das pontes.

## A ideia visual: uma cidade viva

Um único mapa do DF (limites oficiais das RAs, IDE/DF) cheio de chamados **ilustrativos**
fica fixo ao fundo e muda de estado com a rolagem:

| Cena | O que a cidade faz | Origem |
| --- | --- | --- |
| Abertura | Os chamados aparecem pelo DF | magno 4.8 |
| O problema | Os chamados se separam em silos, um por órgão, cada um "tudo certo" | ATA 83–101, 117–120 |
| A virada | Os silos se desfazem e os chamados se conectam | ATA 91–105, 143–144, 214 |
| Como funciona | Diagrama de arquitetura se monta: sistemas legados (Portal do Cidadão, ADM 24h, ADM72…) → conectores (API, robô autorizado, arquivo) → canais, abertura de demandas, incidente único, inteligência → visões; dados correndo pelas linhas | ATA 169–212; CV-REF-002 |
| Inteligência | Zoom em três casos; os chamados viram um incidente, com cartão explicando por quê | ATA 148–149, 177–186; magno 5.3–5.5, 7.2 |
| Para a governadora | Mapa de calor e painel (KPIs e alertas simulados) | ATA 147–148, 220–222 |
| Para cada gestor | A cidade filtra por área | ATA 223–227 |
| Para o cidadão | Transparência em três graus | ATA 229–237 |
| Prova | Águas Claras, com números e fontes | magno 6.1 |
| Encerramento | A cidade inteira, conectada | magno 1 |

Estética: noite, painéis de vidro, leituras em mono (inspiração: sala de operações do
magno 7.5 e o HUD do God's Eye View, só como referência visual).

## Apresentar

- **▶ Apresentar** (canto inferior direito) percorre a página sozinho, parando em cada passo.
- **← / →** (ou PageUp / PageDown) voltam e avançam um passo; **espaço** pausa; **Esc** para.
- Rolar com o mouse interrompe o tour.
- `?tour=1` abre a página já se apresentando (para deixar rodando numa tela).
- **◐ Claro / Escuro** (ou tecla **T**) alterna o tema; a escolha fica salva no navegador. Sem escolha salva, segue o tema do sistema. `?tema=claro` ou `?tema=escuro` força pelo endereço.
- Todas as cores (inclusive do canvas e do diagrama) vêm das variáveis de `src/estilos.css`.

## Rodar

```bash
npm install
npm run dev        # http://localhost:5190
npm run build      # typecheck + build estático em dist/
```

## Prévias (sem instalar nada além do Edge, que vem no Windows)

```bash
npm run build && npm run preview          # deixe rodando
powershell -File scripts/capturas.ps1     # grava out/capturas/slide-NN.png
```

`?cena=<id>&p=0..1` abre só aquela cena, com a animação parada no ponto `p`.

## Peças

- `src/conteudo/narrativa.ts`: todo o texto, com a origem de cada fato ao lado.
- `src/cidade/`: o canvas da cidade viva (`CidadeViva.tsx`) e o estado que as cenas animam (`estado.ts`).
- `src/cenas/Cenas.tsx`: as cenas; `src/componentes/Cena.tsx` faz a cena fixa com passos.
- `src/mapa/ras.json`: limites das RAs simplificados por `npm run mapa` (de `../assets/geo/`), com ~1.800 pontos ilustrativos, o mesmo número por RA (só efeito visual: não representa volume real).
- `src/rolagem/`: GSAP ScrollTrigger + Lenis; com `prefers-reduced-motion`, a página fica estática.

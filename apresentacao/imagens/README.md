# Imagens de apoio (Higgsfield)

Imagens geradas para a apresentação. São **ilustrativas**: nunca mostram dado,
lugar real reconhecível, pessoa, texto ou marca. No slide, levam a legenda
"Imagem ilustrativa".

- `prompts/`: o prompt exato de cada imagem.
- `deck/`: JPG de 2400 px usado no .pptx (gerado por `scripts/otimizar-imagens.ps1`).
- Os PNGs originais (2720×1536) e as respostas da API ficam fora do git. Para
  baixar de novo, use o ID do job: `higgsfield generate get <id> --json`.

| Imagem | Modelo | Proporção | Job | Seed | Data | Situação |
| --- | --- | --- | --- | --- | --- | --- |
| `teste-01-capa-cidade` | Seedream 5.0 Pro (`seedream_v5_pro`), 2k | 16:9 | `1b56f505-4c78-4845-90ff-470b23292065` | 164079 | 11/11/2026 | Teste. Boa para a capa |
| `teste-02-silos` | Seedream 5.0 Pro (`seedream_v5_pro`), 2k | 16:9 | `d9f2cd90-cf57-4558-98ce-d717d200a814` | 205650 | 11/11/2026 | Teste. Saíram 9 colunas (o prompt pedia 7), e duas linhas âmbar chegam a ligar colunas |

Custo: 2,5 créditos por imagem. Saldo depois do teste: 15,22.

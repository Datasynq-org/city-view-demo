# Mapa de demandas de Águas Claras (dfaguasclaras.com.br)

| Campo | Valor |
| --- | --- |
| Setor | privado (site parceiro de uma comunidade) |
| Tipo | canal do cidadão · dado público |
| Pesquisado em | 13/11/2026 |
| Confiança | alta (o endpoint foi lido em 13/11/2026) |

## O que é

Um mapa público, no site da comunidade DFÁGUASCLARAS, onde moradores marcam problemas da região. É a única fonte de dado real que a demo usa.

## Quem opera

O site parceiro `dfaguasclaras.com.br`. O [dfac](dfac.md) lê o mapa e escreve nele (com credencial) para devolver protocolo e situação. Não é um sistema do GDF.

## O que o cidadão faz ali

Marca um ponto no mapa, escolhe o tipo, descreve e anexa foto. Vê as demandas dos outros e a situação de cada uma.

## Que dado tem

Lido em 13/11/2026: **853 demandas**, de set./2024 a nov./2026, todas com `autorizacao = aprovado`.
- Campos: `id`, `tipo`, `descricao`, `latitude`, `longitude`, `bairro`, `endereco`, `imagem`, `status`, `autorizacao`, `protocolo`, `created_at`, `orgao_nome`. Nenhum campo de nome, telefone ou e-mail.
- Por situação: 405 encaminhadas, 396 finalizadas, 52 em andamento.
- Por tipo: Obras/Manutenção 314, Outros 212, Trânsito 153, Iluminação 137, Segurança 37.
- 835 têm foto. 97 vêm sem órgão atribuído.
- **Não traz a data de resolução** nem quem relatou.

## Como o City View chegaria a ele

`GET https://dfaguasclaras.com.br/mapadedemandas/api/demandas`: público, sem login, sem parâmetros, devolve a lista inteira em JSON. A escrita (`/api/integracao/…`) exige credencial e leva nome e telefone do autor: não é usada pela demo.

## O que já temos

- Leitura única e limpeza: `demo-view/scripts/baixar-aguas-claras.ts` e `demo-view/src/dados/aguasClaras/limpar.ts` (sem fotos; saem telefone, e-mail, CPF e placa da descrição).
- O arquivo: `demo-view/src/dados/aguasClaras/aguas-claras.json`.
- O agrupamento desses relatos: `demo-view/src/inteligencia/reais.ts` (28 incidentes).

## Por que importa para a proposta

É dado real, com texto de cidadão, de uma região do DF. Mostra recorrência escrita por quem relata ("pela 5ª vez em 2026 abriram buracos na Rua 19 Sul") e relatos repetidos do mesmo ponto: o que o City View propõe enxergar.

## O que não foi confirmado

- Os termos de uso do site para reutilização do dado. É público, mas não há licença declarada que tenhamos lido.
- Se as demandas "finalizadas" foram de fato resolvidas pelo órgão ou só encerradas no site.
- O critério de `orgao_nome`: quem atribui, e quando.

## Fontes

- **(lido)** o próprio endpoint, em 13/11/2026.
- **(repositório)** `dfac-agentic-saas`: `dfaguasclaras/settings.py`, `client.py`, `models.py`, `write_client.py`, `docs/map-requester-phone.md`.
- **(repositório)** `docs/CV-DEM-001-roadmap-da-demo.md`, seção 9.4, acréscimo de 13/11/2026.

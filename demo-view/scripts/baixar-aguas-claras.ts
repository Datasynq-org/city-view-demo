/**
 * Lê UMA vez o mapa público de demandas de Águas Claras e grava o arquivo que a
 * demo usa (`src/dados/aguasClaras/aguas-claras.json`). A demo não chama o site ao abrir:
 * continua funcionando sem internet.
 *
 *   node --experimental-strip-types scripts/baixar-aguas-claras.ts
 *   node --experimental-strip-types scripts/baixar-aguas-claras.ts caminho/de/um/bruto.json
 *
 * Com um caminho, usa o arquivo já baixado em vez de chamar o site de novo.
 *
 * O endpoint é público, sem login (o mesmo que alimenta o mapa do site parceiro
 * dfaguasclaras.com.br). Se vier um campo que não era esperado, o script para
 * sem gravar: campo novo pode ser dado pessoal, e isso se decide olhando.
 * As descrições passam pela limpeza de `src/dados/aguasClaras/limpar.ts`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { camposInesperados, type DemandaDoSite, montarArquivo } from '../src/dados/aguasClaras/limpar.ts';

const FONTE = 'https://dfaguasclaras.com.br/mapadedemandas/api/demandas';
const SAIDA = new URL('../src/dados/aguasClaras/aguas-claras.json', import.meta.url);

const jaBaixado = process.argv[2];
let bruto: unknown;
if (jaBaixado) {
  bruto = JSON.parse(readFileSync(jaBaixado, 'utf8'));
} else {
  const resposta = await fetch(FONTE, { headers: { Accept: 'application/json', 'User-Agent': 'leitor-de-dados-abertos/1.0' } });
  if (!resposta.ok) throw new Error(`O site respondeu ${resposta.status}. Nada foi gravado.`);
  bruto = await resposta.json();
}

if (!Array.isArray(bruto)) throw new Error('O formato mudou: a resposta não é uma lista. Nada foi gravado.');
const fora = camposInesperados(bruto as Record<string, unknown>[]);
if (fora.length) throw new Error(`Vieram campos que não eram esperados: ${fora.join(', ')}. Nada foi gravado: confira se algum é dado pessoal.`);

const arquivo = montarArquivo(bruto as DemandaDoSite[], FONTE, new Date().toISOString());
writeFileSync(SAIDA, `${JSON.stringify(arquivo)}\n`, 'utf8');

const contar = (chave: (d: (typeof arquivo.demandas)[number]) => string) => {
  const c: Record<string, number> = {};
  for (const d of arquivo.demandas) c[chave(d)] = (c[chave(d)] ?? 0) + 1;
  return c;
};
console.log(`${bruto.length} no site · ${arquivo.demandas.length} gravadas · ${arquivo.foraDoDf} sem ponto no DF`);
console.log('por status:', contar((d) => d.status));
console.log('por tipo:', contar((d) => d.tipo));
console.log('retirado das descrições:', arquivo.retirado);
console.log('com foto:', arquivo.demandas.filter((d) => d.comFoto).length);

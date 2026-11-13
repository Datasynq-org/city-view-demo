/**
 * A variação contra o período anterior, com texto e sinal: nunca só a cor.
 * `bomSeCair` para tempo e filas. `curta` para caber num cartão pequeno.
 */
export function Variacao({ valor, unidade, bomSeCair = false, curta = false }: { valor: number | null; unidade: string; bomSeCair?: boolean; curta?: boolean }) {
  if (valor === null) return <span className="text-rotulo text-texto-2">{curta ? 'sem comparação' : 'sem período anterior'}</span>;
  const estavel = Math.abs(valor) < 0.5;
  const bom = bomSeCair ? valor < 0 : valor > 0;
  const texto = `${valor > 0 ? '+' : '−'}${Math.abs(valor).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}${unidade}`;
  return (
    <span className={`text-rotulo tabular-nums ${estavel ? 'text-texto-2' : bom ? 'text-acento-claro' : 'text-aviso'}`}>
      {estavel ? (curta ? 'igual ao anterior' : 'igual ao período anterior') : `${valor > 0 ? '▲' : '▼'} ${texto}${curta ? '' : ' sobre o período anterior'}`}
    </span>
  );
}

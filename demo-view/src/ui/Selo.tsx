/**
 * O selo que separa conceito de realidade. Fica sempre visível, por cima de
 * qualquer tela (CV-DEM-001, princípio 3). Na cidade simulada o texto não
 * muda; com a fonte real (`dados/fonte.ts`), diz o que é real e o que não é.
 */
export function Selo({ texto = 'Ambiente de demonstração · dados simulados' }: { texto?: string }) {
  return <p className="condensado pointer-events-none fixed top-4 right-4 z-50 max-w-[min(34rem,calc(100vw-2rem))] rounded border border-aviso/70 bg-base/90 px-3 py-1.5 text-right text-rotulo text-aviso">{texto}</p>;
}

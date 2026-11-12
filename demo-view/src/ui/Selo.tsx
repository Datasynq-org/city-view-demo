/**
 * O selo que separa conceito de realidade. Fica sempre visível, por cima de
 * qualquer tela (CV-DEM-001, princípio 3). O texto não muda.
 */
export function Selo() {
  return (
    <p className="condensado pointer-events-none fixed top-4 right-4 z-50 rounded border border-aviso/70 bg-base/90 px-3 py-1.5 text-rotulo text-aviso">
      Ambiente de demonstração · dados simulados
    </p>
  );
}

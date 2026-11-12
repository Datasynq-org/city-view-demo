/**
 * O selo que separa conceito de realidade. Fica sempre visível, por cima de
 * qualquer tela (CV-DEM-001, princípio 3). O texto não muda.
 */
export function Selo() {
  return (
    <p className="condensado pointer-events-none fixed top-5 right-5 z-50 rounded-md bg-ambar px-3 py-1.5 text-xs text-navy shadow-lg shadow-black/30">
      Ambiente de demonstração · dados simulados
    </p>
  );
}

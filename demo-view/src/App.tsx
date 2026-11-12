import { useMemo } from 'react';
import { gerarBase } from './dados/gerador';
import { Mapa } from './mapa/Mapa';
import { PainelFundacao } from './telas/fundacao/PainelFundacao';
import { Selo } from './ui/Selo';

/**
 * O DF se enquadra no espaço que o painel deixa livre: à direita dele em tela
 * larga, acima dele em tela estreita. 1024 é o `lg` do Tailwind, usado abaixo.
 */
const margensDoMapa = (largura: number) =>
  largura >= 1024 ? { top: 72, bottom: 48, left: 392, right: 48 } : { top: 128, bottom: 340, left: 16, right: 16 };

export function App() {
  // A cidade simulada é gerada uma vez, ao abrir.
  const base = useMemo(() => gerarBase({ agora: Date.now() }), []);

  return (
    <main className="relative h-full overflow-hidden">
      <Mapa margens={margensDoMapa} />
      <header className="pointer-events-none absolute top-16 left-5 lg:top-5">
        <h1 className="condensado text-2xl tracking-[0.2em] text-white">City View</h1>
        <p className="text-sm text-rotulo">Distrito Federal</p>
      </header>
      <div className="absolute inset-x-4 bottom-12 lg:inset-x-auto lg:top-24 lg:bottom-auto lg:left-5 lg:w-80">
        <PainelFundacao base={base} />
      </div>
      <Selo />
    </main>
  );
}

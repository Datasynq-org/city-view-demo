import { useMemo, useState } from 'react';
import { gerarBase } from './dados/gerador';
import { type Filtro, filtrar } from './indicadores/indicadores';
import { type ModoMapa, montarCamadas } from './mapa/camadas';
import { Mapa } from './mapa/Mapa';
import { SalaDeGuerra } from './telas/sala/SalaDeGuerra';
import { Selo } from './ui/Selo';

/**
 * O DF se enquadra no espaço que os painéis deixam livre: entre as duas colunas
 * em tela larga, acima deles em tela estreita. 1024 é o `lg` do Tailwind (ver `.sala-*`).
 */
const margensDoMapa = (largura: number) =>
  largura >= 1024 ? { top: 72, bottom: 72, left: 400, right: 372 } : { top: 128, bottom: 380, left: 16, right: 16 };

export function App() {
  // A cidade simulada é gerada uma vez, ao abrir.
  const base = useMemo(() => gerarBase({ agora: Date.now() }), []);
  const [filtro, setFiltro] = useState<Filtro>({ periodo: '7d', area: null });
  const [modo, setModo] = useState<ModoMapa>('calor');

  const doPeriodo = useMemo(() => filtrar(base.incidentes, base.agora, { periodo: filtro.periodo, area: null }), [base, filtro.periodo]);
  const filtrados = useMemo(() => (filtro.area === null ? doPeriodo : doPeriodo.filter((i) => i.area === filtro.area)), [doPeriodo, filtro.area]);
  const camadas = useMemo(() => montarCamadas(filtrados, modo), [filtrados, modo]);

  return (
    <main className="relative h-full overflow-hidden">
      <Mapa margens={margensDoMapa} camadas={camadas} inclinado={modo === 'hexagonos'} />
      <header className="pointer-events-none absolute top-16 left-5 lg:top-5">
        <h1 className="condensado text-2xl tracking-[0.2em] text-white">City View</h1>
        <p className="text-sm text-rotulo">Sala de situação · Distrito Federal</p>
      </header>
      <SalaDeGuerra base={base} doPeriodo={doPeriodo} filtrados={filtrados} filtro={filtro} modo={modo} aoMudarFiltro={setFiltro} aoMudarModo={setModo} />
      <Selo />
    </main>
  );
}

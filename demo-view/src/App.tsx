import { TELAS, useTela } from './navegacao';
import { TelaJornada } from './telas/jornada/TelaJornada';
import { TelaSala } from './telas/sala/TelaSala';
import { Selo } from './ui/Selo';

/**
 * A casca da demo: o título, a troca de tela e o selo de demonstração, que
 * vale para todas as telas. Cada tela é uma iteração do roadmap.
 */
export function App() {
  const [tela, ir] = useTela();
  return (
    <>
      {tela === 'sala' ? <TelaSala /> : <TelaJornada />}
      {/* Por cima do mapa e por baixo da barra de comando da sala (z-20). */}
      <div className="faixa-superior z-10" aria-hidden="true" />
      <header className="pointer-events-none absolute top-14 left-4 z-30 lg:top-2 lg:left-5">
        <h1 className="condensado text-[22px] leading-7 tracking-[0.22em] text-white">City View</h1>
        <nav aria-label="Telas da demo" className="pointer-events-auto flex gap-3 text-nota leading-4">
          {TELAS.map((t) => (
            <a
              key={t.id}
              href={`#/${t.id}`}
              onClick={(e) => {
                e.preventDefault();
                ir(t.id);
              }}
              aria-current={t.id === tela ? 'page' : undefined}
              className={t.id === tela ? 'text-white' : 'text-texto-2 hover:text-white'}
            >
              {t.nome}
            </a>
          ))}
        </nav>
      </header>
      <Selo />
    </>
  );
}

import { useEffect, useState } from 'react';
import { type Tela, TELAS, useTela } from './navegacao';
import { TelaCidadao } from './telas/cidadao/TelaCidadao';
import { TelaGestao } from './telas/gestao/TelaGestao';
import { TelaIntegracoes } from './telas/integracoes/TelaIntegracoes';
import { TelaInteligencia } from './telas/inteligencia/TelaInteligencia';
import { TelaJornada } from './telas/jornada/TelaJornada';
import { TelaPrevisoes } from './telas/previsoes/TelaPrevisoes';
import { TelaRegioes } from './telas/regioes/TelaRegioes';
import { TelaSala } from './telas/sala/TelaSala';
import { BarraLateral } from './ui/BarraLateral';
import { Selo } from './ui/Selo';

function conteudo(tela: Tela) {
  switch (tela) {
    case 'sala':
      return <TelaSala />;
    case 'gestao':
      return <TelaGestao />;
    case 'regioes':
      return <TelaRegioes />;
    case 'previsoes':
      return <TelaPrevisoes />;
    case 'cidadao':
      return <TelaCidadao />;
    case 'jornada':
      return <TelaJornada />;
    case 'inteligencia':
      return <TelaInteligencia />;
    case 'integracoes':
      return <TelaIntegracoes />;
  }
}

/**
 * A casca da demo: a barra lateral com as telas, a faixa do alto e o selo de
 * demonstração, que vale para todas. Cada tela responde a uma pergunta.
 */
export function App() {
  const [tela, ir] = useTela();
  // Em tela larga a barra abre com os nomes; nas demais, só os ícones.
  const [aberta, setAberta] = useState(() => window.innerWidth >= 1536);
  const atual = TELAS.find((t) => t.id === tela)!;

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === '[' && !(e.target instanceof HTMLInputElement) && !e.metaKey && !e.ctrlKey && !e.altKey) setAberta((a) => !a);
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, []);

  return (
    <div className="flex h-full">
      <BarraLateral tela={tela} aoIr={ir} aberta={aberta} aoAlternar={() => setAberta((a) => !a)} />
      <div className="relative min-w-0 flex-1">
        {conteudo(tela)}
        {/* Por cima do mapa e por baixo da barra de comando de cada tela (z-20). */}
        <div className="faixa-superior z-10" aria-hidden="true" />
        <p className="pointer-events-none absolute top-0 left-4 z-30 flex h-[3.75rem] max-w-[calc(50%-14rem)] items-center text-nota text-texto-2 lg:left-5">
          <span className="truncate">
            <span className="text-tinta">{atual.nome}</span>
            <span className="ml-2 hidden 2xl:inline">· {atual.pergunta}</span>
          </span>
        </p>
      </div>
      <Selo />
    </div>
  );
}

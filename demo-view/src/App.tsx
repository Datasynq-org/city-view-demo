import { useEffect, useState } from 'react';
import { type Tela, TELAS, useTela } from './navegacao';
import { TelaCidadao } from './telas/cidadao/TelaCidadao';
import { TelaGestao } from './telas/gestao/TelaGestao';
import { TelaIntegracoes } from './telas/integracoes/TelaIntegracoes';
import { TelaInteligencia } from './telas/inteligencia/TelaInteligencia';
import { TelaJornada } from './telas/jornada/TelaJornada';
import { TelaPrevisoes } from './telas/previsoes/TelaPrevisoes';
import { TelaRegioes } from './telas/regioes/TelaRegioes';
import { TelaResumo } from './telas/resumo/TelaResumo';
import { TelaSala } from './telas/sala/TelaSala';
import { TelaEntrada } from './telas/entrada/TelaEntrada';
import { BarraLateral } from './ui/BarraLateral';
import { usePerfil } from './ui/perfil';
import { Selo } from './ui/Selo';

function conteudo(tela: Tela) {
  switch (tela) {
    case 'sala':
      return <TelaSala />;
    case 'resumo':
      return <TelaResumo />;
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
  // Na Inteligência há dado real junto do simulado: o selo diz qual é qual.
  const selo = tela === 'inteligencia' ? 'Águas Claras: dado real · DF e fluxo simulados' : undefined;
  // Quem chega pela raiz, sem ter escolhido, vê a entrada. Um endereço de tela abre direto, em qualquer perfil.
  const { perfil } = usePerfil();
  const semEndereco = !/^#\/?\w/.test(window.location.hash) && !new URLSearchParams(window.location.search).has('tela');

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === '[' && !(e.target instanceof HTMLInputElement) && !e.metaKey && !e.ctrlKey && !e.altKey) setAberta((a) => !a);
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, []);

  if (perfil === null && semEndereco) return <TelaEntrada />;

  return (
    <div className="flex h-full">
      <BarraLateral tela={tela} aoIr={ir} aberta={aberta} aoAlternar={() => setAberta((a) => !a)} />
      <div className="relative min-w-0 flex-1">
        {conteudo(tela)}
        {/* Por cima do mapa e por baixo da barra de comando de cada tela (z-20). */}
        <div className="faixa-superior z-10" aria-hidden="true" />
        <p className="nao-imprime pointer-events-none absolute top-0 left-4 z-30 flex h-[3.75rem] max-w-[calc(50%-14rem)] items-center text-nota text-texto-2 lg:left-5">
          <span className="truncate">
            <span className="text-tinta">{atual.nome}</span>
            <span className="ml-2 hidden 2xl:inline">· {atual.pergunta}</span>
          </span>
        </p>
      </div>
      <Selo texto={selo} />
    </div>
  );
}

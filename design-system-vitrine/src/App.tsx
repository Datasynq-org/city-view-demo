import { useEffect, useMemo, useState } from 'react';
import { BarraSuperior, Navegacao, Selo, TrocaTema, type ItemNav } from '@ds';
import { Mapa } from './mapa/Mapa';
import { SalaDeSituacao, filtrarPeriodo, type Periodo } from './casca/SalaDeSituacao';
import { Catalogo } from './catalogo/Catalogo';

// Telas previstas no roadmap (CV-DEM-001). Só a sala de situação existe nesta iteração.
const TELAS: ItemNav[] = [
  { id: 'sala', nome: 'Sala de situação' },
  { id: 'jornada', nome: 'Jornada de um chamado', emBreve: true },
  { id: 'inteligencia', nome: 'Inteligência', emBreve: true },
  { id: 'gestores', nome: 'Gestores', emBreve: true },
  { id: 'cidadao', nome: 'Cidadão', emBreve: true },
  { id: 'catalogo', nome: 'Design system' },
];

const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

export function App() {
  const catalogo = new URLSearchParams(location.search).has('catalogo');
  const [periodo, setPeriodo] = useState<Periodo>('hoje');
  const chamados = useMemo(() => filtrarPeriodo(periodo), [periodo]);

  // tecla T alterna o tema
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if ((e.key === 't' || e.key === 'T') && !(e.target instanceof HTMLInputElement)) document.querySelector<HTMLButtonElement>('[aria-label^="Mudar para o tema"]')?.click();
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, []);

  if (catalogo) return <Catalogo />;

  // folga do mapa: a navegação (15rem) à esquerda e o painel (27rem) à direita
  const r = remPx();
  return (
    <div className="casca">
      <Mapa chamados={chamados} folga={{ esquerda: r * 17, direita: r * 29, topo: r * 5 }} />
      <div className="casca-camadas">
        <div className="casca-barra">
          <BarraSuperior marca="City View" sub="Sala de situação · Distrito Federal" direita={<><Selo>Ambiente de demonstração · dados simulados</Selo><TrocaTema /></>} />
        </div>
        <div className="casca-nav">
          <Navegacao titulo="Telas" itens={TELAS} atual="sala" aoEscolher={(id) => { if (id === 'catalogo') location.search = '?catalogo'; }} />
        </div>
        <div className="casca-painel">
          <SalaDeSituacao periodo={periodo} aoMudarPeriodo={setPeriodo} />
        </div>
      </div>
    </div>
  );
}

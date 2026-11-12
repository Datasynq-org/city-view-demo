import { useMemo } from 'react';
import type { BaseSimulada } from '../../dados/gerador';
import type { Incidente } from '../../dominio/incidente';
import type { AreaId } from '../../dominio/orgaos';
import {
  abertosAgora,
  chegandoAgora,
  type Filtro,
  type Periodo,
  PERIODOS,
  percentualNoPrazo,
  serieDiaria,
  tempoAteResolver,
  velocidadePorArea,
} from '../../indicadores/indicadores';
import type { ModoMapa } from '../../mapa/camadas';
import { ChegandoAgora, Filtros, Legenda, Minigrafico, Numeros, Velocidade } from './partes';

/**
 * I1 · Sala de guerra (CV-DEM-001, seção 6): "Onde a cidade precisa de mim agora?".
 * Slide 14 do CV-APR-001. O mapa mostra os chamados agrupados; os painéis, a
 * velocidade da gestão e o que está chegando. Tudo sobre dados SIMULADOS.
 */
export function SalaDeGuerra({ base, doPeriodo, filtrados, filtro, modo, aoMudarFiltro, aoMudarModo }: {
  base: BaseSimulada;
  /** Incidentes do período, todas as áreas (para comparar as áreas entre si). */
  doPeriodo: Incidente[];
  /** Incidentes do período e da área escolhida. */
  filtrados: Incidente[];
  filtro: Filtro;
  modo: ModoMapa;
  aoMudarFiltro: (f: Filtro) => void;
  aoMudarModo: (m: ModoMapa) => void;
}) {
  const nomePeriodo = PERIODOS.find((p) => p.id === filtro.periodo)!.nome;
  const numeros = useMemo(
    () => ({
      abertos: abertosAgora(base.incidentes, filtro.area),
      recebidos: filtrados.length,
      tempo: tempoAteResolver(filtrados),
      noPrazo: percentualNoPrazo(filtrados),
    }),
    [base, filtrados, filtro.area],
  );
  // a velocidade por área é a comparação entre elas: respeita o período, não o filtro de área
  const porArea = useMemo(() => velocidadePorArea(doPeriodo), [doPeriodo]);
  const serie = useMemo(() => serieDiaria(base, filtro.area, 30), [base, filtro.area]);
  const recentes = useMemo(() => chegandoAgora(filtrados, 8), [filtrados]);

  const mudarPeriodo = (periodo: Periodo) => aoMudarFiltro({ ...filtro, periodo });
  const mudarArea = (area: AreaId | null) => aoMudarFiltro({ ...filtro, area });

  return (
    <>
      <div className="sala-coluna sala-esquerda">
        <Filtros periodo={filtro.periodo} area={filtro.area} modo={modo} aoMudarPeriodo={mudarPeriodo} aoMudarArea={mudarArea} aoMudarModo={aoMudarModo} />
        <Numeros {...numeros} nomePeriodo={nomePeriodo} />
        <Velocidade linhas={porArea} area={filtro.area} aoMudarArea={mudarArea} />
      </div>
      <div className="sala-coluna sala-direita">
        <Minigrafico serie={serie} />
        <ChegandoAgora lista={recentes} agora={base.agora} />
      </div>
      <div className="sala-legenda">
        <Legenda modo={modo} />
      </div>
    </>
  );
}

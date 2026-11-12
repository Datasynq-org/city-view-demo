import { AnimatePresence, motion } from 'motion/react';
import { useMemo } from 'react';
import type { BaseSimulada } from '../../dados/gerador';
import type { Incidente, Instante } from '../../dominio/incidente';
import type { AreaId } from '../../dominio/orgaos';
import {
  abertosAgora,
  type ChamadosDaRa,
  chegandoAgora,
  type Filtro,
  type Periodo,
  PERIODOS,
  percentualNoPrazo,
  serieDiaria,
  tempoAteResolver,
  tiposMaisFrequentes,
  velocidadePorArea,
} from '../../indicadores/indicadores';
import type { ModoMapa } from '../../mapa/camadas';
import { CartaoDaRa } from './hud';
import { ChegandoAgora, Filtros, Legenda, Minigrafico, Numeros, Velocidade } from './partes';

/**
 * I1 · Sala de guerra (CV-DEM-001, seção 6): "Onde a cidade precisa de mim agora?".
 * Slide 14 do CV-APR-001. O mapa mostra onde os chamados se concentram; os
 * painéis, a velocidade da gestão e o que está chegando. Tudo sobre dados SIMULADOS.
 */
export function SalaDeGuerra({ base, incidentes, agora, doPeriodo, filtrados, porRa, chamadosDf, filtro, modo, aoMudarFiltro, aoLimparRa }: {
  base: BaseSimulada;
  /** O que já chegou (a base menos a fila do relógio da demo). */
  incidentes: readonly Incidente[];
  agora: Instante;
  /** Período e RA, todas as áreas (para comparar as áreas entre si). */
  doPeriodo: Incidente[];
  /** Período, área e RA. */
  filtrados: Incidente[];
  porRa: Map<string, ChamadosDaRa>;
  /** Chamados do DF inteiro no período e na área (para a média do cartão da RA). */
  chamadosDf: number;
  filtro: Filtro;
  modo: ModoMapa;
  aoMudarFiltro: (f: Filtro) => void;
  aoLimparRa: () => void;
}) {
  const ra = filtro.ra ?? null;
  const nomePeriodo = PERIODOS.find((p) => p.id === filtro.periodo)!.nome;
  const numeros = useMemo(
    () => ({
      abertos: abertosAgora(incidentes, filtro.area, ra),
      recebidos: filtrados.length,
      tempo: tempoAteResolver(filtrados),
      noPrazo: percentualNoPrazo(filtrados),
    }),
    [incidentes, filtrados, filtro.area, ra],
  );
  // a velocidade por área é a comparação entre elas: respeita o período e a RA, não o filtro de área
  const porArea = useMemo(() => velocidadePorArea(doPeriodo), [doPeriodo]);
  const serie = useMemo(() => serieDiaria(base, filtro.area, 30, ra), [base, filtro.area, ra]);
  const recentes = useMemo(() => chegandoAgora(filtrados, 8), [filtrados]);
  const tipos = useMemo(() => (ra ? tiposMaisFrequentes(filtrados, 3) : []), [ra, filtrados]);

  const mudarPeriodo = (periodo: Periodo) => aoMudarFiltro({ ...filtro, periodo });
  const mudarArea = (area: AreaId | null) => aoMudarFiltro({ ...filtro, area });

  return (
    <>
      <div className="sala-coluna sala-esquerda">
        <Filtros periodo={filtro.periodo} area={filtro.area} ra={ra} aoMudarPeriodo={mudarPeriodo} aoMudarArea={mudarArea} aoLimparRa={aoLimparRa} />
        <Numeros {...numeros} nomePeriodo={nomePeriodo} />
        <Velocidade linhas={porArea} area={filtro.area} aoMudarArea={mudarArea} />
      </div>
      <div className="sala-coluna sala-direita">
        <AnimatePresence initial={false}>
          {ra && (
            <motion.div key={ra} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <CartaoDaRa ra={ra} dados={porRa.get(ra)} chamadosDf={chamadosDf} tipos={tipos} aoFechar={aoLimparRa} />
            </motion.div>
          )}
        </AnimatePresence>
        <Minigrafico serie={serie} />
        <ChegandoAgora lista={recentes} agora={agora} />
      </div>
      <div className="sala-legenda">
        <Legenda modo={modo} />
      </div>
    </>
  );
}

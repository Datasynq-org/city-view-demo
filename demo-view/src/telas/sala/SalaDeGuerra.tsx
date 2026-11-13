import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import type { BaseSimulada } from '../../dados/gerador';
import type { Incidente, Instante } from '../../dominio/incidente';
import { type AreaId, ORGAO_POR_ID, TIPO_POR_ID } from '../../dominio/orgaos';
import { comparar } from '../../indicadores/gestao';
import type { Incidente as Sugerido } from '../../inteligencia/agrupamento';
import { incidentesSugeridos } from '../../inteligencia/atual';
import { useInteligencia } from '../../inteligencia/estado';
import {
  abertosAgora,
  agruparChegadas,
  tempoNoQuantil,
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
import { ChegandoAgora, Filtros, Legenda, Minigrafico, Numeros, PedeAtencao, Velocidade, Grupo, MaisFrequentes } from './partes';

type Lista = 'agora' | 'orgaos' | 'problemas';
const LISTAS: { id: Lista; nome: string }[] = [
  { id: 'agora', nome: 'Agora' },
  { id: 'orgaos', nome: 'Órgãos' },
  { id: 'problemas', nome: 'Problemas' },
];

/** Conta os incidentes por uma chave e devolve os 8 maiores. */
function contarPor(lista: readonly Incidente[], chave: (i: Incidente) => string, nome: (id: string) => string) {
  const conta = new Map<string, number>();
  for (const i of lista) conta.set(chave(i), (conta.get(chave(i)) ?? 0) + 1);
  return [...conta].map(([id, chamados]) => ({ id, nome: nome(id), chamados })).sort((a, b) => b.chamados - a.chamados).slice(0, 8);
}

/**
 * I1 · Sala de guerra (CV-DEM-001, seção 6): "Onde a cidade precisa de mim agora?".
 * Slide 14 do CV-APR-001. O mapa mostra onde os chamados se concentram; os
 * painéis, a velocidade da gestão e o que está chegando. Tudo sobre dados SIMULADOS.
 */
export function SalaDeGuerra({ base, incidentes, agora, doPeriodo, filtrados, porRa, chamadosDf, filtro, modo, aoMudarFiltro, aoLimparRa, aoVoarPara }: {
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
  /** Leva o mapa a um ponto ([lon, lat]): o lugar de um incidente. */
  aoVoarPara: (centro: [number, number]) => void;
}) {
  const ra = filtro.ra ?? null;
  const nomePeriodo = PERIODOS.find((p) => p.id === filtro.periodo)!.nome;
  const numeros = useMemo(
    () => ({
      abertos: abertosAgora(incidentes, filtro.area, ra),
      recebidos: filtrados.length,
      tempo: tempoAteResolver(filtrados),
      noPrazo: percentualNoPrazo(filtrados),
      p90: tempoNoQuantil(filtrados, 0.9),
    }),
    [incidentes, filtrados, filtro.area, ra],
  );
  // A régua: o mesmo período contra o anterior, com a mesma idade (a conta da Gestão).
  const dias = PERIODOS.find((p) => p.id === filtro.periodo)!.dias;
  const comparacao = useMemo(() => comparar(incidentes, agora, dias, { area: filtro.area, ra }), [incidentes, agora, dias, filtro.area, ra]);
  // O que a inteligência sugere de mais grave, e em que pé está cada um.
  const sugeridos = useMemo(incidentesSugeridos, []);
  const inteligencia = useInteligencia();
  // a velocidade por área é a comparação entre elas: respeita o período e a RA, não o filtro de área
  const porArea = useMemo(() => velocidadePorArea(doPeriodo), [doPeriodo]);
  const serie = useMemo(() => serieDiaria(base, filtro.area, 30, ra), [base, filtro.area, ra]);
  const recentes = useMemo(() => agruparChegadas(chegandoAgora(filtrados, 24)).slice(0, 6), [filtrados]);
  const tipos = useMemo(() => (ra ? tiposMaisFrequentes(filtrados, 3) : []), [ra, filtrados]);
  const [lista, setLista] = useState<Lista>('agora');
  // Só são contados quando a lista está à vista: a cada chegada, o conjunto muda.
  const orgaos = useMemo(() => (lista === 'orgaos' ? contarPor(filtrados, (i) => i.orgaoId, (id) => ORGAO_POR_ID[id]?.sigla ?? id) : []), [lista, filtrados]);
  const problemas = useMemo(() => (lista === 'problemas' ? tiposMaisFrequentes(filtrados, 8).map((t) => ({ id: t.tipoId, nome: TIPO_POR_ID[t.tipoId]?.nome ?? t.tipoId, chamados: t.chamados })) : []), [lista, filtrados]);

  const mudarPeriodo = (periodo: Periodo) => aoMudarFiltro({ ...filtro, periodo });
  const mudarArea = (area: AreaId | null) => aoMudarFiltro({ ...filtro, area });

  return (
    <>
      <div className="sala-coluna sala-esquerda">
        <Filtros periodo={filtro.periodo} area={filtro.area} ra={ra} aoMudarPeriodo={mudarPeriodo} aoMudarArea={mudarArea} aoLimparRa={aoLimparRa} />
        <Numeros {...numeros} nomePeriodo={nomePeriodo} variacaoDoTempo={comparacao.tempo === null ? null : comparacao.tempo * 100} variacaoDoPrazo={comparacao.noPrazo} />
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
        {!ra && <PedeAtencao incidentes={sugeridos.slice(0, 3)} total={sugeridos.length} estado={inteligencia} aoVoar={(i: Sugerido) => aoVoarPara(i.centro)} />}
        <Minigrafico serie={serie} />
        <div className="flex gap-2">
          <Grupo rotulo="O que listar" opcoes={LISTAS} valor={lista} aoMudar={setLista} />
        </div>
        {lista === 'agora' ? <ChegandoAgora lista={recentes} agora={agora} /> : <MaisFrequentes titulo={lista === 'orgaos' ? 'Órgãos com mais chamados' : 'Problemas mais relatados'} nota={lista === 'orgaos' ? 'Hoje cada fila está num sistema separado' : 'Tipos de todos os órgãos, lado a lado'} linhas={lista === 'orgaos' ? orgaos : problemas} />}
      </div>
      <div className="sala-legenda">
        <Legenda modo={modo} />
      </div>
    </>
  );
}

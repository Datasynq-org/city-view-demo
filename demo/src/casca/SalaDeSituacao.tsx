import { useMemo } from 'react';
import { Kpi, Legenda, LinhaDeIncidente, PainelLateral, Segmentado, Rotulo } from '@ds';
import { AREAS, CHAMADOS, SITUACOES, haQuanto, type Chamado } from '../dados/dados';

type Periodo = 'hora' | '4h' | 'hoje';
const PERIODOS: { id: Periodo; nome: string; max: number }[] = [
  { id: 'hora', nome: 'Última hora', max: 60 },
  { id: '4h', nome: '4 horas', max: 240 },
  { id: 'hoje', nome: 'Hoje', max: Infinity },
];

export const filtrarPeriodo = (p: Periodo) => CHAMADOS.filter((c) => c.minutos <= PERIODOS.find((x) => x.id === p)!.max);

// Painel da sala de situação (casca da iteração I1): números, filtro de período, legenda e "chegando agora".
// Tudo calculado sobre os EXEMPLOS SIMULADOS.
export function SalaDeSituacao({ periodo, aoMudarPeriodo }: { periodo: Periodo; aoMudarPeriodo: (p: Periodo) => void }) {
  const lista = useMemo(() => filtrarPeriodo(periodo), [periodo]);
  const conta = (s: number) => lista.filter((c) => c.situacao === s).length;
  const recentes = useMemo(() => [...lista].sort((a, b) => a.minutos - b.minutos).slice(0, 9), [lista]);

  return (
    <PainelLateral rotulo="Sala de situação" titulo="A cidade agora" rodape="Exemplos simulados para a interface: não são dados do DF.">
      <Segmentado rotulo="Período" opcoes={PERIODOS} valor={periodo} aoMudar={aoMudarPeriodo} />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Kpi rotulo="Chamados" valor={lista.length.toLocaleString('pt-BR')} />
        <Kpi rotulo="Abertos" valor={conta(2).toLocaleString('pt-BR')} />
        <Kpi rotulo="Em resolução" valor={conta(1).toLocaleString('pt-BR')} />
        <Kpi rotulo="Resolvidos" valor={lista.length ? `${Math.round((100 * conta(0)) / lista.length)}%` : '–'} />
      </div>
      <Rotulo className="mt-5" tom="fraco">Áreas</Rotulo>
      <Legenda className="mt-2" itens={AREAS.map((nome, i) => ({ nome, cor: `var(--area-${i})` }))} />
      <Rotulo className="mt-5" tom="fraco">Chegando agora</Rotulo>
      <div className="mt-1">
        {recentes.map((c: Chamado) => (
          <LinhaDeIncidente key={c.id} corArea={`var(--area-${c.area})`} area={AREAS[c.area]} titulo={c.assunto} ra={c.ra}
            situacao={SITUACOES[c.situacao].nome} tomSituacao={SITUACOES[c.situacao].tom} quando={haQuanto(c.minutos)} />
        ))}
        {!recentes.length && <p className="py-4 text-sm fraco">Nenhum chamado neste período.</p>}
      </div>
    </PainelLateral>
  );
}

export type { Periodo };

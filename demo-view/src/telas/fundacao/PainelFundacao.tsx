import type { BaseSimulada } from '../../dados/gerador';
import { contarPorSituacao, ROTULO_SITUACAO, SITUACOES } from '../../dominio/incidente';
import { ORGAOS } from '../../dominio/orgaos';
import { REGIOES } from '../../dominio/ras';
import { Painel } from '../../ui/Painel';

const numero = (n: number) => n.toLocaleString('pt-BR');

/**
 * Painel de exemplo da I0: prova que o gerador produz incidentes no modelo novo
 * e que o vidro funciona sobre o mapa. Sai de cena quando a I1 chegar.
 */
export function PainelFundacao({ base }: { base: BaseSimulada }) {
  const porSituacao = contarPorSituacao(base.incidentes);
  return (
    <Painel className="p-4 lg:p-5">
      <p className="condensado text-xs text-teal-claro">Incidentes simulados · últimos {base.diasDetalhados} dias</p>
      <p className="mt-2 text-4xl leading-none font-semibold tracking-tight text-white tabular-nums lg:text-5xl">
        {numero(base.incidentes.length)}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 border-t border-white/10 pt-3 text-sm lg:mt-5 lg:grid-cols-1">
        {SITUACOES.map((situacao) => (
          <div key={situacao} className="flex items-baseline justify-between py-1">
            <dt>{ROTULO_SITUACAO[situacao]}</dt>
            <dd className="font-medium text-white tabular-nums">{numero(porSituacao[situacao])}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 border-t border-white/10 pt-3 text-xs text-rotulo/80">
        {REGIOES.length} regiões administrativas · {ORGAOS.length} órgãos · gerado no navegador com semente fixa
      </p>
    </Painel>
  );
}

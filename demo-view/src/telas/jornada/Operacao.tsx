import { type Grupo, type Indicador, NOME_DO_GRUPO, normalDe, piorSinal, ROTULO_DO_SINAL, type SistemaDoOrgao, type SituacaoDoSinal, valorDe } from '../../dominio/operacao';

const COR: Record<SituacaoDoSinal, string> = { normal: 'text-texto-2', atencao: 'text-aviso', fora: 'text-alerta' };
const FUNDO: Record<SituacaoDoSinal, string> = { normal: 'bg-texto-2', atencao: 'bg-aviso', fora: 'bg-alerta' };

/** A situação sempre com texto, nunca só cor. */
function Sinal({ s }: { s: SituacaoDoSinal }) {
  return (
    <span className={`condensado inline-flex shrink-0 items-center gap-1.5 text-micro ${COR[s]}`}>
      <span className={`size-1.5 rounded-full ${FUNDO[s]}`} aria-hidden="true" />
      {ROTULO_DO_SINAL[s]}
    </span>
  );
}

function Linha({ i }: { i: Indicador }) {
  return (
    <li className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 border-t border-linha py-1 first:border-t-0">
      <span className="min-w-0">
        <span className="text-nota text-texto">{i.nome}</span>
        <span className="block text-micro text-texto-2">{normalDe(i)}</span>
      </span>
      <span className="text-right">
        <span className={`block text-nota tabular-nums ${i.situacao === 'normal' ? 'text-white' : COR[i.situacao]}`}>{valorDe(i)}</span>
        {i.situacao !== 'normal' && <Sinal s={i.situacao} />}
      </span>
    </li>
  );
}

const GRUPOS: Grupo[] = ['rede', 'servico', 'sistema'];

/**
 * O que o sistema do próprio órgão mede: a rede, o serviço e a saúde do
 * sistema. É a observabilidade do órgão, que o City View lê pelo conector.
 * Proposta, com valores simulados (magno 7.1 e 9.3).
 */
export function Operacao({ sistema }: { sistema: SistemaDoOrgao }) {
  return (
    <section className="rounded border border-linha-forte" aria-label={`Operação do sistema da ${sistema.sigla}`}>
      <header className="flex items-start justify-between gap-3 border-b border-linha bg-poco px-3 py-2">
        <div className="min-w-0">
          <p className="text-nota text-white">{sistema.sigla}</p>
          <p className="text-micro text-texto-2">{sistema.sistema} · simulado</p>
        </div>
        <Sinal s={piorSinal(sistema)} />
      </header>
      <div className="space-y-2 px-3 py-2">
        {GRUPOS.map((g) => (
          <div key={g}>
            <p className="condensado text-micro text-texto-2">{NOME_DO_GRUPO[g]}</p>
            <ul>
              {sistema.indicadores
                .filter((i) => i.grupo === g)
                .map((i) => (
                  <Linha key={i.id} i={i} />
                ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

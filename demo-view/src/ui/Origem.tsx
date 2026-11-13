import { contarFontes, fontesDe, O_QUE_E_HOJE, type Recorte } from '../dominio/origem';
import { ROTULO_PECA } from '../dominio/ponte';

/**
 * "De onde vem": abre, sob um painel, a origem dos números dele. Fechado, cabe
 * numa linha; aberto, diz a conta, os sistemas e a situação de cada ligação.
 */
export function Origem({ conta, atualizacao = 'A cada chamado que chega (simulado).', className = '', ...recorte }: Recorte & { /** Como o número é calculado, em uma frase. */ conta: string; atualizacao?: string; className?: string }) {
  const fontes = fontesDe(recorte);
  const { ligadas, propostas } = contarFontes(fontes);
  return (
    <details className={`group text-micro text-texto-2 nao-imprime ${className}`}>
      <summary className="cursor-pointer list-none select-none hover:text-tinta">
        <span className="condensado border-b border-dashed border-linha-forte">De onde vem</span>
        <span className="ml-2">
          simulado · {fontes.length} sistema{fontes.length === 1 ? '' : 's'} de origem ({ligadas} ligado{ligadas === 1 ? '' : 's'}, {propostas} proposto{propostas === 1 ? '' : 's'})
        </span>
      </summary>
      <div className="mt-2 space-y-2 rounded border border-linha bg-poco p-3">
        <p className="text-texto">{O_QUE_E_HOJE}</p>
        <p>
          <span className="text-texto">A conta:</span> {conta}
        </p>
        <p>
          <span className="text-texto">Atualização:</span> {atualizacao}
        </p>
        <div>
          <p className="text-texto">No produto, viria de:</p>
          <ul className="mt-1 grid gap-x-4 gap-y-0.5 sm:grid-cols-2">
            {fontes.map((f) => (
              <li key={`${f.dono}/${f.sistema}`} className="flex items-baseline justify-between gap-2">
                <span className="min-w-0 truncate">
                  {f.dono} · {f.sistema}
                </span>
                <span className={`shrink-0 ${f.situacao === 'proposta' ? '' : 'text-acento-claro'}`}>{ROTULO_PECA[f.situacao]}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  );
}

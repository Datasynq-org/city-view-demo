import { motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import { reduzMovimento } from '../../mapa/vista';
import { CAMADA_DA_PECA, CAMADAS, ROTULO_PECA, SAIDAS, type SituacaoPeca } from '../../dominio/ponte';

/** O sinal de cada situação, sempre com texto: a cor nunca vem sozinha. */
export function Marca({ situacao, comTexto = false }: { situacao: SituacaoPeca; comTexto?: boolean }) {
  const forma =
    situacao === 'existe' ? (
      <span className="size-2 shrink-0 rounded-full bg-acento-claro" />
    ) : situacao === 'orgao' ? (
      <span className="size-2 shrink-0 rounded-[2px] bg-texto-2" />
    ) : situacao === 'pronto' ? (
      <span className="size-2 shrink-0 rounded-full border border-acento-claro bg-[linear-gradient(90deg,var(--color-acento-claro)_50%,transparent_50%)]" />
    ) : (
      <span className="size-2 shrink-0 rounded-full border border-texto-2" />
    );
  return (
    <span className="inline-flex items-center gap-1.5" title={ROTULO_PECA[situacao]}>
      {forma}
      {comTexto && <span className="text-micro text-texto-2">{ROTULO_PECA[situacao]}</span>}
    </span>
  );
}

/** O traço de cada sinal: cheio para as demandas, tracejado em acento para a operação (proposta). */
function Traco({ proposta }: { proposta: boolean }) {
  return proposta ? <i className="block w-3 border-t border-dashed border-acento-claro" /> : <i className="block h-px w-3 bg-texto-2" />;
}

/**
 * O diagrama-mestre do slide 10: as cinco camadas e as três saídas. A peça do
 * passo atual acende; as que o relato já percorreu ficam marcadas.
 */
export function Fluxo({ pecaAtual, percorridas }: { pecaAtual: string; percorridas: ReadonlySet<string> }) {
  const camadaAtual = CAMADA_DA_PECA[pecaAtual];
  const ativaRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    ativaRef.current?.scrollIntoView({ block: 'nearest', behavior: reduzMovimento() ? 'auto' : 'smooth' });
  }, [camadaAtual]);
  return (
    <section aria-label="As cinco camadas do City View" className="flex h-full min-h-0 flex-col gap-2">
      <ol className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {CAMADAS.map((c) => {
          const ativa = c.numero === camadaAtual;
          return (
            <li key={c.numero} ref={ativa ? ativaRef : undefined} className={`flex shrink-0 flex-1 flex-col justify-center rounded-lg border px-4 py-2 transition-colors ${ativa ? 'border-acento-claro/70 bg-acento/10' : 'border-linha bg-painel/80'}`}>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className={`condensado text-rotulo ${ativa ? 'text-acento-claro' : 'text-texto-2'}`}>Camada {c.numero}</span>
                <span className={`text-corpo ${ativa ? 'text-tinta' : 'text-texto'}`}>{c.nome}</span>
                <span className="text-rotulo text-texto-2">· {c.ideia}</span>
              </div>
              {c.fluxos && (
                <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-micro text-texto-2">
                  Cada conector traz
                  {c.fluxos.map((f) => (
                    <span key={f.nome} className="inline-flex items-center gap-1.5" title={f.nota}>
                      <Traco proposta={f.proposta} />
                      <span className="text-texto">{f.nome}</span>
                      {f.nota.startsWith('Qualidade') && <span>({f.nota.toLowerCase()})</span>}
                    </span>
                  ))}
                </p>
              )}
              {[...new Set(c.pecas.map((p) => p.grupo))].map((grupo) => (
              <div key={grupo ?? 'unico'} className="mt-2 flex flex-wrap items-center gap-1.5">
                {grupo && <span className="w-full text-micro text-texto-2">{grupo}</span>}
              <ul className="flex flex-wrap gap-1.5">
                {c.pecas.filter((p) => p.grupo === grupo).map((p) => {
                  const atual = p.id === pecaAtual;
                  const feita = percorridas.has(p.id);
                  return (
                    <li key={p.id} className="relative">
                      {atual && <motion.span layoutId="marcador-do-passo" className="absolute -inset-px rounded-md border-2 border-acento-claro shadow-[0_0_14px_rgba(76,195,214,0.45)]" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
                      <span
                        className={`relative flex items-center gap-1.5 rounded-md text-nota ${p.grupo ? 'px-2 py-1' : 'px-2.5 py-1.5'} ${p.situacao === 'proposta' ? 'border border-dashed border-linha-forte' : 'border border-linha'} ${atual ? 'text-tinta' : feita ? 'bg-realce/70 text-texto' : 'text-texto-2'}`}
                        title={`${p.nota} · ${p.fonte}`}
                      >
                        <Marca situacao={p.situacao} />
                        {p.nome}
                        {(c.fluxos || p.situacao === 'orgao') && (
                          <span className="ml-0.5 flex flex-col gap-[3px]" title="Traz demandas e operação" aria-hidden="true">
                            <Traco proposta={false} />
                            <Traco proposta />
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
              </div>
              ))}
            </li>
          );
        })}
      </ol>
      <div className="grid shrink-0 grid-cols-3 gap-2" aria-label="As três visões">
        {SAIDAS.map((s) => (
          <div key={s.id} className="rounded-lg border border-linha bg-painel/80 px-3 py-1.5">
            <p className="flex items-center gap-1.5 text-rotulo text-tinta">
              <Marca situacao={s.situacao} />
              {s.nome}
            </p>
            <p className="text-micro text-texto-2">{s.nota}</p>
          </div>
        ))}
      </div>
      <p className="flex shrink-0 flex-wrap gap-x-4 gap-y-1">
        <Marca situacao="existe" comTexto />
        <Marca situacao="pronto" comTexto />
        <Marca situacao="orgao" comTexto />
        <Marca situacao="proposta" comTexto />
      </p>
    </section>
  );
}

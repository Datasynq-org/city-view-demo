import { motion } from 'motion/react';
import { CAMADA_DA_PECA, CAMADAS, ROTULO_PECA, SAIDAS, type SituacaoPeca } from '../../dominio/ponte';

/** O sinal de cada situação, sempre com texto: a cor nunca vem sozinha. */
export function Marca({ situacao, comTexto = false }: { situacao: SituacaoPeca; comTexto?: boolean }) {
  const forma =
    situacao === 'existe' ? (
      <span className="size-2 shrink-0 rounded-full bg-acento-claro" />
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

/**
 * O diagrama-mestre do slide 10: as cinco camadas e as três saídas. A peça do
 * passo atual acende; as que o relato já percorreu ficam marcadas.
 */
export function Fluxo({ pecaAtual, percorridas }: { pecaAtual: string; percorridas: ReadonlySet<string> }) {
  const camadaAtual = CAMADA_DA_PECA[pecaAtual];
  return (
    <section aria-label="As cinco camadas do City View" className="flex h-full min-h-0 flex-col gap-2">
      <ol className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
        {CAMADAS.map((c) => {
          const ativa = c.numero === camadaAtual;
          return (
            <li key={c.numero} className={`flex shrink-0 flex-1 flex-col justify-center rounded-lg border px-4 py-2 transition-colors ${ativa ? 'border-acento-claro/70 bg-acento/10' : 'border-linha bg-painel/80'}`}>
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className={`condensado text-rotulo ${ativa ? 'text-acento-claro' : 'text-texto-2'}`}>Camada {c.numero}</span>
                <span className={`text-corpo ${ativa ? 'text-white' : 'text-texto'}`}>{c.nome}</span>
                <span className="text-rotulo text-texto-2">· {c.ideia}</span>
              </div>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {c.pecas.map((p) => {
                  const atual = p.id === pecaAtual;
                  const feita = percorridas.has(p.id);
                  return (
                    <li key={p.id} className="relative">
                      {atual && <motion.span layoutId="marcador-do-passo" className="absolute -inset-px rounded-md border-2 border-acento-claro shadow-[0_0_14px_rgba(76,195,214,0.45)]" transition={{ type: 'spring', stiffness: 380, damping: 34 }} />}
                      <span
                        className={`relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-nota ${p.situacao === 'proposta' ? 'border border-dashed border-linha-forte' : 'border border-linha'} ${atual ? 'text-white' : feita ? 'bg-realce/70 text-texto' : 'text-texto-2'}`}
                        title={`${p.nota} · ${p.fonte}`}
                      >
                        <Marca situacao={p.situacao} />
                        {p.nome}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>
      <div className="grid shrink-0 grid-cols-3 gap-2" aria-label="As três visões">
        {SAIDAS.map((s) => (
          <div key={s.id} className="rounded-lg border border-linha bg-painel/80 px-3 py-1.5">
            <p className="flex items-center gap-1.5 text-rotulo text-white">
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
        <Marca situacao="proposta" comTexto />
      </p>
    </section>
  );
}

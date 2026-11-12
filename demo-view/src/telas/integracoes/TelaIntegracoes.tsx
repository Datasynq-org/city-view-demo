/**
 * I6 · Integrações (CV-DEM-001, seção 6): "Com o que isso se conecta?".
 * Slide 12 do CV-APR-001: "Nada se substitui. Tudo se conecta."
 *
 * A arquitetura em camadas numa faixa, o catálogo de conectores com a situação
 * de cada um, os métodos de integração e as regras. O que existe tem fonte; o
 * resto é proposta.
 */
import { type ReactNode, useState } from 'react';
import { CONECTORES, contar, metodoDe, METODOS, nomeDoDono, REGRAS } from '../../dominio/conectores';
import { CAMADAS, ROTULO_PECA, SAIDAS, type SituacaoPeca } from '../../dominio/ponte';
import { Painel } from '../../ui/Painel';
import { Marca } from '../jornada/Fluxo';

const Titulo = ({ children, nota }: { children: ReactNode; nota?: string }) => (
  <div className="mb-3">
    <h2 className="titulo-painel">{children}</h2>
    {nota && <p className="mt-0.5 text-rotulo text-texto-2">{nota}</p>}
  </div>
);

const Sim = ({ proposta }: { proposta?: boolean }) => (
  <span className="inline-flex items-center gap-1.5">
    {proposta ? <i className="block w-4 border-t border-dashed border-acento-claro" aria-hidden="true" /> : <i className="block h-px w-4 bg-texto-2" aria-hidden="true" />}
    <span className={proposta ? 'text-acento-claro' : 'text-texto'}>{proposta ? 'proposta' : 'sim'}</span>
  </span>
);

const FILTROS: { id: SituacaoPeca | null; nome: string }[] = [
  { id: null, nome: 'Todos' },
  { id: 'existe', nome: 'Já funciona' },
  { id: 'pronto', nome: 'Pronto' },
  { id: 'proposta', nome: 'Proposta' },
];

export function TelaIntegracoes() {
  const [filtro, setFiltro] = useState<SituacaoPeca | null>(null);
  const n = contar();
  const visiveis = CONECTORES.filter((c) => !filtro || c.situacao === filtro);

  return (
    <main className="pagina">
      <Painel className="p-5">
        <Titulo nota="Cada órgão continua no sistema dele. O City View se liga a eles e cuida dali para frente.">Nada se substitui. Tudo se conecta.</Titulo>
        <ol className="grid gap-2 lg:grid-cols-5">
          {CAMADAS.map((c) => (
            <li key={c.numero} className="rounded border border-linha bg-poco px-3 py-2.5">
              <p className="condensado text-micro text-texto-2">Camada {c.numero}</p>
              <p className="text-nota text-tinta">{c.nome}</p>
              <p className="mt-0.5 text-micro text-texto-2">{c.ideia}</p>
              <p className="mt-2 flex flex-wrap gap-x-2 gap-y-0.5 text-micro text-texto-2">
                {(['existe', 'pronto', 'orgao', 'proposta'] as SituacaoPeca[]).map((s) => {
                  const k = c.pecas.filter((p) => p.situacao === s).length;
                  return k ? (
                    <span key={s} className="inline-flex items-center gap-1" title={ROTULO_PECA[s]}>
                      <Marca situacao={s} />
                      {k}
                    </span>
                  ) : null;
                })}
              </p>
            </li>
          ))}
        </ol>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {SAIDAS.map((s) => (
            <div key={s.id} className="rounded border border-linha px-3 py-2">
              <p className="flex items-center gap-1.5 text-nota text-tinta">
                <Marca situacao={s.situacao} />
                {s.nome}
              </p>
              <p className="text-micro text-texto-2">{s.nota}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          <Marca situacao="existe" comTexto />
          <Marca situacao="pronto" comTexto />
          <Marca situacao="orgao" comTexto />
          <Marca situacao="proposta" comTexto />
        </p>
      </Painel>

      <Painel className="min-w-0 p-5">
        <Titulo nota={`${CONECTORES.length} ligações: ${n.existe} já funcionam numa região, ${n.pronto} está pronta e ${n.proposta} são propostas. A gestão aponta os sistemas na implantação.`}>Catálogo de conectores</Titulo>
        <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Situação">
          {FILTROS.map((f) => (
            <button key={f.nome} type="button" aria-pressed={f.id === filtro} onClick={() => setFiltro(f.id)} className={`rounded border px-2.5 py-1 text-rotulo ${f.id === filtro ? 'border-acento-claro bg-realce text-tinta' : 'border-linha text-texto-2 hover:text-tinta'}`}>
              {f.nome}
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] border-collapse text-nota">
            <thead>
              <tr className="border-b border-linha-forte text-left">
                {['Sistema ou canal', 'De quem é', 'Situação', 'Método', 'Demandas', 'Operação', 'Fonte'].map((h) => (
                  <th key={h} scope="col" className="condensado px-2 py-2 text-micro font-normal text-texto-2 first:pl-0">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visiveis.map((c) => (
                <tr key={c.id} className="border-b border-linha align-top">
                  <th scope="row" className="py-2 pr-2 text-left font-normal">
                    <span className="text-tinta">{c.sistema}</span>
                    <span className="block max-w-80 text-micro text-texto-2">{c.nota}</span>
                  </th>
                  <td className="px-2 py-2">
                    <span className="text-texto">{c.dono}</span>
                    {c.orgaoId && <span className="block max-w-52 truncate text-micro text-texto-2">{nomeDoDono(c)}</span>}
                  </td>
                  <td className="px-2 py-2 whitespace-nowrap">
                    <Marca situacao={c.situacao} comTexto />
                  </td>
                  <td className={`max-w-44 px-2 py-2 ${c.comoHoje ? 'text-texto' : 'text-texto-2'}`}>{metodoDe(c)}</td>
                  <td className="px-2 py-2 text-rotulo whitespace-nowrap">{c.demandas ? <Sim proposta={c.situacao === 'proposta'} /> : '–'}</td>
                  <td className="px-2 py-2 text-rotulo whitespace-nowrap">{c.operacao ? <Sim proposta /> : <span className="text-texto-2">–</span>}</td>
                  <td className="py-2 pl-2 text-micro text-texto-2">{c.fonte}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Painel>

      <div className="pagina-grade">
        <Painel className="p-5">
          <Titulo nota="Seja qual for o sistema por baixo, em qualquer linguagem. Os métodos propostos para os conectores novos:">Como se conecta</Titulo>
          <ul className="space-y-2">
            {METODOS.map((m) => (
              <li key={m.id} className="rounded border border-linha px-3 py-2">
                <p className="text-nota text-tinta">{m.nome}</p>
                <p className="text-rotulo text-texto-2">{m.nota}</p>
              </li>
            ))}
          </ul>
        </Painel>
        <Painel className="p-5">
          <Titulo>As regras de toda integração</Titulo>
          <ol className="list-decimal space-y-1.5 pl-4 text-nota text-texto marker:text-texto-2">
            {REGRAS.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ol>
          <blockquote className="mt-4 border-l-2 border-linha-forte pl-3 text-rotulo text-texto-2">
            “Eu integro com todos eles, independente do nome. Portal do cidadão, ADM24, ADM72, o nome que tiver, seja lá o que for, a gente entrega.”
            <footer className="mt-1 text-micro">Conversa de 10/11/2026 · ATA, linhas 174–175</footer>
          </blockquote>
        </Painel>
      </div>
    </main>
  );
}

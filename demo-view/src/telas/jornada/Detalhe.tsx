import { AnimatePresence, motion } from 'motion/react';
import { NOME_DO_DESTINO } from '../../dados/coleta';
import { type Painel, type Passo, situacaoDoPasso } from '../../dados/jornadas';
import { ROTULO_SITUACAO, type Situacao } from '../../dominio/incidente';
import { CAMADA_DA_PECA, CAMADAS, PECA_POR_ID, ROTULO_DFAC } from '../../dominio/ponte';
import { reduzMovimento } from '../../mapa/vista';
import { Marca } from './Fluxo';
import { Operacao } from './Operacao';

function Campos({ linhas }: { linhas: [string, string][] }) {
  return (
    <dl className="grid grid-cols-[7.5rem_1fr] gap-x-3 gap-y-1 text-nota">
      {linhas.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-texto-2">{k}</dt>
          <dd className="text-texto">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

const Rotulo = ({ children }: { children: string }) => <p className="condensado mb-1.5 text-micro text-texto-2">{children}</p>;

function Conteudo({ painel }: { painel: Painel }) {
  switch (painel.tipo) {
    case 'conversa':
      return painel.coletado.length ? (
        <>
          <Rotulo>O que a coleta guardou</Rotulo>
          <Campos linhas={painel.coletado} />
        </>
      ) : (
        <p className="text-nota text-texto-2">A conversa está no celular, ao lado.</p>
      );
    case 'triagem':
      return (
        <div className="space-y-3">
          <div>
            <Rotulo>Palavras encontradas no relato</Rotulo>
            <p className="flex flex-wrap gap-1.5">
              {painel.triagem.termos.length ? (
                painel.triagem.termos.map((t) => (
                  <span key={t} className="rounded border border-acento-claro/50 px-1.5 py-0.5 text-rotulo text-acento-claro">
                    {t}
                  </span>
                ))
              ) : (
                <span className="text-nota text-texto-2">nenhuma</span>
              )}
            </p>
          </div>
          <Campos
            linhas={[
              ['Atividade', painel.triagem.atividade ?? 'a classificar na revisão'],
              ['Destino sugerido', NOME_DO_DESTINO[painel.triagem.destino]],
              ['Repetidos', painel.repetidos],
            ]}
          />
        </div>
      );
    case 'revisao':
      return (
        <div className="space-y-3">
          <ol className="grid grid-cols-3 gap-1.5 text-center text-micro">
            {['Relato e evidências', 'Classificação e local', 'Confirmar envio'].map((t, k) => (
              <li key={t} className="rounded border border-acento-claro/40 bg-acento/10 px-1 py-1 text-texto">
                <span className="block text-acento-claro">{k + 1}</span>
                {t}
              </li>
            ))}
          </ol>
          <div className="grid gap-2">
            <div className="rounded border border-linha p-2">
              <Rotulo>Relato original (fica guardado)</Rotulo>
              <p className="text-nota">{painel.original}</p>
            </div>
            <div className="rounded border border-linha p-2">
              <Rotulo>Relato para o portal (até 200 caracteres)</Rotulo>
              <p className="text-nota text-white">{painel.refinado}</p>
            </div>
          </div>
          <Campos linhas={[['Classificação', painel.classificacao], ['Destino', painel.destino], ['Repetidos', painel.repetidos]]} />
        </div>
      );
    case 'envio':
      return (
        <div className="space-y-3">
          <Rotulo>{`Prévia do envio · ${painel.destino}`}</Rotulo>
          <Campos linhas={painel.campos} />
          <div className="rounded border border-acento-claro/50 bg-acento/10 px-3 py-2">
            <p className="text-micro text-texto-2">{painel.protocolo[0]}</p>
            <p className="text-corpo text-white tabular-nums">{painel.protocolo[1]}</p>
          </div>
        </div>
      );
    case 'acompanhamento':
      return <p className="text-nota text-texto">{painel.consulta}.</p>;
    case 'incidente':
      return (
        <>
          <Rotulo>Modelo único de incidente</Rotulo>
          <Campos linhas={painel.campos} />
        </>
      );
    case 'campos':
      return (
        <>
          <Rotulo>{painel.rotulo}</Rotulo>
          <Campos linhas={painel.campos} />
        </>
      );
    case 'operacao':
      return (
        <div className="space-y-3">
          {painel.sistemas.map((s) => (
            <Operacao key={s.orgaoId} sistema={s} />
          ))}
          <p className="rounded border border-dashed border-acento-claro/60 px-3 py-2 text-nota text-white">{painel.leitura}</p>
        </div>
      );
    case 'cruzamento':
      return (
        <div className="space-y-3">
          <Rotulo>O que outros órgãos receberam, no mesmo lugar e horário (simulado)</Rotulo>
          <ul className="space-y-1">
            {painel.sinais.map((s) => (
              <li key={s.descricao} className="flex items-baseline justify-between gap-3 border-b border-linha pb-1 text-nota">
                <span>
                  <span className="text-white">{s.orgao}</span> <span className="text-texto-2">· {s.canal}</span>
                  <span className="block text-rotulo text-texto-2">{s.descricao}</span>
                </span>
                <span className="text-corpo text-white tabular-nums">{s.quantidade}</span>
              </li>
            ))}
          </ul>
          <div className="rounded border border-dashed border-acento-claro/60 p-2">
            <Rotulo>Por quê</Rotulo>
            <p className="text-nota">{painel.leitura}</p>
            <Rotulo>O que sugere · uma pessoa confirma</Rotulo>
            <p className="text-nota text-white">{painel.acao}</p>
          </div>
          <a href="#/inteligencia?caso=apagao-planaltina" className="condensado inline-block rounded-md border border-acento-claro/60 px-3 py-1.5 text-rotulo text-acento-claro hover:text-white">
            Ver este cruzamento na inteligência →
          </a>
        </div>
      );
    case 'saidas':
      return (
        <ul className="space-y-2">
          {painel.itens.map((i) => (
            <li key={i.quem} className="rounded border border-linha px-3 py-2">
              <p className="flex items-center gap-2 text-nota text-white">
                <Marca situacao={i.situacao} />
                {i.quem}
              </p>
              <p className="text-rotulo text-texto-2">{i.ve}</p>
            </li>
          ))}
        </ul>
      );
  }
}

/** A linha do tempo do incidente no modelo único, com o passo atual aceso. */
const CAMINHO: Situacao[] = ['recebido', 'em-triagem', 'encaminhado', 'em-atendimento', 'resolvido'];

function LinhaDoTempo({ passo }: { passo: Passo }) {
  const atual = passo.situacao ? CAMINHO.indexOf(passo.situacao) : -1;
  return (
    <div>
      <Rotulo>Situação no modelo único</Rotulo>
      <ol className="flex gap-1">
        {CAMINHO.map((s, k) => (
          <li key={s} className={`flex-1 rounded px-1 py-1 text-center text-micro ${k === atual ? 'bg-acento text-white' : k < atual ? 'bg-realce text-texto' : 'border border-linha text-texto-2'}`}>
            {ROTULO_SITUACAO[s]}
          </li>
        ))}
      </ol>
      {passo.dfac && <p className="mt-1 text-micro text-texto-2">No dfac: “{ROTULO_DFAC[passo.dfac]}”</p>}
    </div>
  );
}

export function Detalhe({ passo, indice, total }: { passo: Passo; indice: number; total: number }) {
  const situacao = situacaoDoPasso(passo);
  const peca = PECA_POR_ID[passo.peca];
  const camada = CAMADAS.find((c) => c.numero === CAMADA_DA_PECA[passo.peca]);
  return (
    <AnimatePresence mode="wait">
      <motion.article
        key={passo.id}
        initial={reduzMovimento() ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="painel-vidro flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 [&>*]:shrink-0"
      >
        <header>
          <p className="condensado text-micro text-texto-2">
            Passo {indice + 1} de {total} · Camada {camada?.numero} · {camada?.nome}
          </p>
          <h2 className="mt-1 text-corpo font-semibold text-white">{passo.titulo}</h2>
          <p className="mt-1">
            <Marca situacao={situacao} comTexto />
          </p>
        </header>
        <p className="text-nota text-texto">{passo.texto}</p>
        <div>
          <Conteudo painel={passo.painel} />
        </div>
        <LinhaDoTempo passo={passo} />
        {peca && <p className="mt-auto text-micro text-texto-2">Fonte: {peca.fonte}</p>}
      </motion.article>
    </AnimatePresence>
  );
}

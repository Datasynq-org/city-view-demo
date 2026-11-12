import { AnimatePresence, motion } from 'motion/react';
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import type { Etapa } from '../../dados/coleta';
import type { Mensagem } from '../../dados/jornadas';
import { reduzMovimento } from '../../mapa/vista';

/** O WhatsApp marca negrito com *asteriscos*; o assistente do dfac usa isso. */
function comNegrito(texto: string): ReactNode[] {
  return texto.split(/(\*[^*\n]+\*)/g).map((parte, k) => (parte.startsWith('*') && parte.endsWith('*') && parte.length > 2 ? <strong key={k}>{parte.slice(1, -1)}</strong> : parte));
}

function Anexo({ tipo }: { tipo: 'local' | 'foto' }) {
  if (tipo === 'local') {
    return (
      <span className="flex items-center gap-2">
        <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden="true">
          <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" fill="currentColor" />
        </svg>
        Localização compartilhada
      </span>
    );
  }
  return (
    <span className="block">
      {/* Foto ilustrativa: a demo não tem fotos de cidadãos. */}
      <svg viewBox="0 0 160 96" className="mb-1 block h-20 w-36 rounded" role="img" aria-label="Foto ilustrativa">
        <rect width="160" height="96" fill="#1b1f23" />
        <rect y="70" width="160" height="26" fill="#23282d" />
        <rect x="104" y="14" width="4" height="58" fill="#5b636b" />
        <path d="M106 16h-18" stroke="#5b636b" strokeWidth="3" />
        <circle cx="86" cy="19" r="4" fill="#3b4148" />
      </svg>
      <span className="text-micro text-texto-2">Foto ilustrativa</span>
    </span>
  );
}

function Bolha({ m }: { m: Mensagem }) {
  if (m.de === 'nota') {
    return <p className="mx-auto max-w-[85%] rounded bg-poco px-2.5 py-1 text-center text-micro text-texto-2">{m.texto}</p>;
  }
  const doCidadao = m.de === 'cidadao';
  return (
    <div className={`flex ${doCidadao ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[86%] rounded-lg px-3 py-2 text-nota whitespace-pre-line ${doCidadao ? 'rounded-br-sm bg-[#0e3b45] text-white' : 'rounded-bl-sm bg-realce text-texto'} ${m.proposta ? 'border border-dashed border-acento-claro/60' : ''}`}
      >
        {m.proposta && <span className="condensado mb-1 block text-micro text-acento-claro">Proposta · texto da equipe</span>}
        {m.anexo ? <Anexo tipo={m.anexo} /> : comNegrito(m.texto)}
      </div>
    </div>
  );
}

/** Respostas rápidas por etapa da coleta, para o "experimente" andar sem digitar tudo. */
const ATALHOS: Partial<Record<Etapa, string[]>> = {
  inicio: ['Oi'],
  menu: ['1'],
  tipo: ['1', '2', '3', '4', '5'],
  confirmaLocal: ['SIM', 'NÃO'],
  resumo: ['CONFIRMAR', 'CORRIGIR RELATO', 'CORRIGIR LOCAL', 'CANCELAR'],
  concluido: ['ACOMPANHAR'],
};

export function Celular({ mensagens, digitando, experimente }: {
  mensagens: Mensagem[];
  digitando: boolean;
  /** Só no modo "experimente": a pessoa escreve. */
  experimente?: { etapa: Etapa; aoEnviar: (texto: string) => void; aoFoto: () => void; bloqueado: boolean };
}) {
  const lista = useRef<HTMLDivElement>(null);
  const [texto, setTexto] = useState('');
  useEffect(() => {
    const el = lista.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduzMovimento() ? 'auto' : 'smooth' });
  }, [mensagens.length, digitando]);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (!experimente || !texto.trim()) return;
    experimente.aoEnviar(texto.trim());
    setTexto('');
  };

  return (
    <section aria-label="Conversa no WhatsApp" className="flex h-full min-h-0 flex-col overflow-hidden rounded-[1.6rem] border-[6px] border-[#22272c] bg-[#0f1214] shadow-2xl shadow-black/50">
      <header className="flex items-center gap-3 border-b border-linha bg-painel px-4 py-2.5">
        <span className="grid size-8 place-items-center rounded-full bg-acento/30 text-rotulo text-white" aria-hidden="true">DF</span>
        <div className="min-w-0">
          <p className="truncate text-nota text-white">Assistente DFÁGUASCLARAS</p>
          <p className="text-micro text-texto-2">{digitando ? 'digitando…' : 'WhatsApp · textos reais do assistente (dfac)'}</p>
        </div>
      </header>
      <div ref={lista} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-3" aria-live="polite">
        <AnimatePresence initial={false}>
          {mensagens.map((m, k) => (
            <motion.div key={k} initial={reduzMovimento() ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <Bolha m={m} />
            </motion.div>
          ))}
        </AnimatePresence>
        {digitando && (
          <div className="flex justify-start" aria-hidden="true">
            <span className="flex gap-1 rounded-lg rounded-bl-sm bg-realce px-3 py-2.5">
              {[0, 1, 2].map((k) => (
                <span key={k} className="ponto-digitando size-1.5 rounded-full bg-texto-2" style={{ animationDelay: `${k * 0.15}s` }} />
              ))}
            </span>
          </div>
        )}
      </div>
      {experimente && (
        <footer className="space-y-2 border-t border-linha bg-painel px-3 py-2.5">
          <div className="flex flex-wrap gap-1.5">
            {(ATALHOS[experimente.etapa] ?? []).map((a) => (
              <button key={a} type="button" disabled={experimente.bloqueado} onClick={() => experimente.aoEnviar(a)} className="rounded-full border border-linha-forte px-2.5 py-1 text-rotulo text-texto hover:border-acento-claro hover:text-white disabled:opacity-40">
                {a}
              </button>
            ))}
            {experimente.etapa === 'foto' && (
              <button type="button" disabled={experimente.bloqueado} onClick={experimente.aoFoto} className="rounded-full border border-acento-claro/60 px-2.5 py-1 text-rotulo text-acento-claro hover:text-white disabled:opacity-40">
                Enviar foto de exemplo
              </button>
            )}
            {experimente.etapa === 'local' && <span className="py-1 text-rotulo text-acento-claro">Toque no mapa ao lado para marcar o local</span>}
          </div>
          <form onSubmit={enviar} className="flex gap-2">
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              disabled={experimente.bloqueado}
              placeholder="Mensagem"
              aria-label="Escreva a mensagem"
              className="min-w-0 flex-1 rounded-full border border-linha bg-poco px-3.5 py-1.5 text-nota text-white placeholder:text-texto-2 focus:border-acento-claro focus:outline-none"
            />
            <button type="submit" disabled={experimente.bloqueado || !texto.trim()} className="rounded-full bg-acento px-3.5 text-rotulo text-white disabled:opacity-40">
              Enviar
            </button>
          </form>
        </footer>
      )}
    </section>
  );
}

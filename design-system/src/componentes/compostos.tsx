import { useState, type ReactNode } from 'react';
import { aplicarTema, temaAtual, type Tema } from '../tema';

/** Cartão de insight da IA: o que viu, por quê (evidências), confiança, o que sugere e a decisão humana. */
export function CartaoInsight({ tipo, titulo, viu, porque, confianca, sugere, decide = 'Uma pessoa confirma', selo = 'Ilustrativo', className }: {
  tipo: string; titulo: string; viu: string; porque: string[]; confianca: string; sugere: string; decide?: string; selo?: string; className?: string;
}) {
  return (
    <div className={`painel p-7 ${className ?? ''}`}>
      <div className="flex items-center justify-between">
        <p className="rotulo c-atencao">{tipo}</p>
        {selo && <span className="selo">{selo}</span>}
      </div>
      <h2 className="titulo mt-3 text-4xl">{titulo}</h2>
      <p className="rotulo mt-6 fraco">O que a IA viu</p>
      <p className="mt-2 text-lg">{viu}</p>
      <p className="rotulo mt-5 fraco">Por quê</p>
      <div className="mt-2 flex flex-wrap gap-2">{porque.map((p) => <span key={p} className="chip">{p}</span>)}</div>
      <p className="rotulo mt-5 fraco">Sugere · confiança {confianca}</p>
      <p className="mt-2 text-lg">{sugere}</p>
      <div className="mt-6 flex items-center gap-3">
        <span className="botao botao-sim">Confirmar</span>
        <span className="botao">Descartar</span>
        <span className="ml-2 text-sm fraco">{decide}</span>
      </div>
    </div>
  );
}

/** Botão de troca de tema. Guarda a escolha. */
export function TrocaTema({ className }: { className?: string }) {
  const [tema, setTema] = useState<Tema>(temaAtual());
  const outro: Tema = tema === 'claro' ? 'escuro' : 'claro';
  return (
    <button type="button" className={className ?? 'botao'} onClick={() => { aplicarTema(outro, true); setTema(outro); }} title="Alternar tema (T)" aria-label={`Mudar para o tema ${outro}`}>
      ◐ {tema === 'claro' ? 'Escuro' : 'Claro'}
    </button>
  );
}

/** Controle segmentado (filtros curtos: período, área). */
export function Segmentado<T extends string>({ opcoes, valor, aoMudar, rotulo }: { opcoes: { id: T; nome: string }[]; valor: T; aoMudar: (v: T) => void; rotulo: string }) {
  return (
    <div className="segmentado" role="group" aria-label={rotulo}>
      {opcoes.map((o) => (
        <button key={o.id} type="button" aria-pressed={o.id === valor} onClick={() => aoMudar(o.id)}>{o.nome}</button>
      ))}
    </div>
  );
}

/** Barra superior do aplicativo: marca à esquerda, avisos e ações à direita. */
export function BarraSuperior({ marca, sub, direita }: { marca: ReactNode; sub?: ReactNode; direita?: ReactNode }) {
  return (
    <header className="painel flex items-center justify-between gap-6 px-5 py-3">
      <div className="flex items-baseline gap-3">
        <span className="titulo text-xl">{marca}</span>
        {sub && <span className="rotulo fraco">{sub}</span>}
      </div>
      <div className="flex items-center gap-3">{direita}</div>
    </header>
  );
}

export type ItemNav = { id: string; nome: string; emBreve?: boolean };

/** Navegação entre telas. Itens "em breve" aparecem desabilitados e rotulados. */
export function Navegacao({ itens, atual, aoEscolher, titulo }: { itens: ItemNav[]; atual: string; aoEscolher: (id: string) => void; titulo?: string }) {
  return (
    <nav className="painel flex flex-col gap-1 p-3" aria-label={titulo ?? 'Telas'}>
      {titulo && <p className="rotulo fraco px-2 pb-2">{titulo}</p>}
      {itens.map((i) => (
        <button key={i.id} type="button" className="nav-item" aria-current={i.id === atual ? 'page' : undefined} aria-disabled={i.emBreve || undefined}
          onClick={() => !i.emBreve && aoEscolher(i.id)}>
          <span className="flex-1">{i.nome}</span>
          {i.emBreve && <span className="pilula proposta">em breve</span>}
        </button>
      ))}
    </nav>
  );
}

/** Painel lateral do aplicativo: título fixo, conteúdo com rolagem própria. */
export function PainelLateral({ rotulo, titulo, children, rodape }: { rotulo?: string; titulo: string; children: ReactNode; rodape?: ReactNode }) {
  return (
    <aside className="painel flex min-h-0 flex-col p-5">
      {rotulo && <p className="rotulo mb-2">{rotulo}</p>}
      <h2 className="titulo text-2xl">{titulo}</h2>
      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">{children}</div>
      {rodape && <div className="mt-3 border-t pt-3 text-xs fraco" style={{ borderColor: 'var(--painel-borda)' }}>{rodape}</div>}
    </aside>
  );
}

/** Item de lista de incidentes: cor da área (com nome), título, RA, situação e quando. */
export function LinhaDeIncidente({ corArea, area, titulo, ra, situacao, tomSituacao, quando }: {
  corArea: string; area: string; titulo: string; ra: string; situacao: string; tomSituacao: 'ok' | 'atencao' | 'alerta'; quando: string;
}) {
  const classe = tomSituacao === 'ok' ? 'c-ok' : tomSituacao === 'atencao' ? 'c-atencao' : 'c-alerta';
  return (
    <div className="linha-incidente">
      <span className="ponto-area" style={{ background: corArea }} aria-hidden="true" />
      <div className="min-w-0">
        <p className="truncate text-sm">{titulo}</p>
        <p className="mt-0.5 text-xs fraco">{area} · {ra}</p>
      </div>
      <div className="text-right">
        <p className={`rotulo ${classe}`} style={{ fontSize: '0.62rem' }}>{situacao}</p>
        <p className="mt-0.5 text-xs fraco">{quando}</p>
      </div>
    </div>
  );
}

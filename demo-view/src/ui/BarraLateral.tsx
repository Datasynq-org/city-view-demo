import type { ReactNode } from 'react';
import { type Tela, TELAS } from '../navegacao';
import { mudarPerfil, PERFIL_POR_ID, telasDoPerfil, usePerfil } from './perfil';
import { FONTES, mudarFonte, useFonte } from '../dados/fonte';
import { mudarTema, useTema } from './tema';

/** Ícones próprios, de traço fino (24×24). Sem biblioteca. */
const ICONE: Record<Tela, ReactNode> = {
  sala: <path d="M3 5h18v11H3zM8 20h8M12 16v4" />,
  resumo: <path d="M7 3h8l4 4v14H7zM15 3v4h4M10 12h6M10 16h6" />,
  gestao: <path d="M4 19V9M10 19V5M16 19v-7M21 19H3" />,
  regioes: <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" />,
  inteligencia: (
    <>
      <circle cx="6" cy="7" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="12" cy="17" r="2.5" />
      <path d="m7.5 8.5 3.3 6.3M16.8 7.7l-3.6 7.1M8 7h8" />
    </>
  ),
  previsoes: <path d="M3 17l5-5 4 3 5-7M15 8h2v2M19 13v0M21 11v0" strokeDasharray="0" />,
  jornada: <path d="M8 3h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM10.5 18h3" />,
  cidadao: (
    <>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20c.8-3.6 3.5-5.5 7-5.5s6.200 1.900 7 5.500" />
    </>
  ),
  integracoes: <path d="M9 7V3M15 7V3M7 7h10v4a5 5 0 0 1-10 0zM12 16v5" />,
};

/**
 * A barra lateral: uma coluna fina com as telas da demo. Aberta, mostra o nome;
 * recolhida, só o ícone (o nome vem na dica e para leitores de tela).
 */
export function BarraLateral({ tela, aoIr, aberta, aoAlternar }: { tela: Tela; aoIr: (t: Tela) => void; aberta: boolean; aoAlternar: () => void }) {
  const tema = useTema();
  const fonte = useFonte();
  const outraFonte = FONTES.find((f) => f.id !== fonte)!;
  const { perfil, orgao } = usePerfil();
  // A barra mostra as telas do perfil, na ordem dele; a tela aberta por endereço aparece mesmo fora dela.
  const doPerfil = telasDoPerfil(perfil);
  const telas = [...doPerfil.map((id) => TELAS.find((t) => t.id === id)!), ...TELAS.filter((t) => t.id === tela && !doPerfil.includes(t.id))];
  const trocar = () => {
    window.location.hash = '';
    mudarPerfil(null);
  };
  return (
    <aside className={`barra-lateral ${aberta ? 'barra-aberta' : ''}`}>
      <div className="flex h-[3.75rem] shrink-0 items-center border-b border-linha px-3">
        <p className="condensado overflow-hidden text-[20px] leading-6 tracking-[0.2em] whitespace-nowrap text-tinta" aria-label="City View">
          {aberta ? 'City View' : 'CV'}
        </p>
      </div>
      <nav aria-label="Telas da demo" className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-1.5">
        {telas.map((t) => {
          const ativa = t.id === tela;
          return (
            <a
              key={t.id}
              href={`#/${t.id}`}
              onClick={(e) => {
                e.preventDefault();
                aoIr(t.id);
              }}
              aria-current={ativa ? 'page' : undefined}
              title={`${t.nome} · ${t.pergunta}`}
              className={`flex h-10 items-center gap-3 rounded-md border-l-2 px-2.5 text-nota whitespace-nowrap transition-colors ${ativa ? 'border-acento-claro bg-realce text-tinta' : 'border-transparent text-texto-2 hover:bg-poco hover:text-tinta'}`}
            >
              <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {ICONE[t.id]}
              </svg>
              <span className={aberta ? '' : 'sr-only'}>{t.nome}</span>
            </a>
          );
        })}
      </nav>
      <button type="button" onClick={() => mudarFonte(outraFonte.id)} aria-pressed={fonte === 'aguas-claras'} title={`Fonte dos chamados: ${FONTES.find((f) => f.id === fonte)!.nome}. Trocar para ${outraFonte.nome} (${outraFonte.nota})`} className={`mx-1.5 mb-0.5 flex h-9 shrink-0 items-center gap-3 rounded-md px-2.5 text-rotulo hover:bg-poco hover:text-tinta ${fonte === 'aguas-claras' ? 'text-aviso' : 'text-texto-2'}`}>
        <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 6c0-1.700 3.600-3 8-3s8 1.300 8 3-3.600 3-8 3-8-1.300-8-3zM4 6v6c0 1.700 3.600 3 8 3s8-1.300 8-3V6M4 12v6c0 1.700 3.600 3 8 3s8-1.300 8-3v-6" />
        </svg>
        <span className={`truncate ${aberta ? '' : 'sr-only'}`}>{FONTES.find((f) => f.id === fonte)!.nome}</span>
      </button>
      <button type="button" onClick={trocar} title={perfil ? `Perfil: ${PERFIL_POR_ID[perfil].nome}${orgao ? ` (${orgao})` : ''}. Trocar` : 'Escolher um perfil'} className="mx-1.5 mb-0.5 flex h-9 shrink-0 items-center gap-3 rounded-md px-2.5 text-rotulo text-texto-2 hover:bg-poco hover:text-tinta">
        <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8l-4 4 4 4M6 12h10" />
        </svg>
        <span className={`truncate ${aberta ? '' : 'sr-only'}`}>{perfil ? PERFIL_POR_ID[perfil].nome : 'Escolher perfil'}</span>
      </button>
      <button type="button" onClick={() => mudarTema(tema === 'claro' ? 'escuro' : 'claro')} aria-pressed={tema === 'claro'} title={tema === 'claro' ? 'Mudar para o tema escuro' : 'Mudar para o tema claro'} className="mx-1.5 flex h-9 shrink-0 items-center gap-3 rounded-md px-2.5 text-rotulo text-texto-2 hover:bg-poco hover:text-tinta">
        <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {tema === 'claro' ? <path d="M20 14.5A8 8 0 0 1 9.500 4a8 8 0 1 0 10.500 10.500z" /> : <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.600 5.600l1.400 1.400M17 17l1.400 1.400M5.600 18.400 7 17M17 7l1.400-1.400M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />}
        </svg>
        <span className={aberta ? '' : 'sr-only'}>{tema === 'claro' ? 'Tema escuro' : 'Tema claro'}</span>
      </button>
      <button type="button" onClick={aoAlternar} aria-expanded={aberta} title={aberta ? 'Recolher a barra ( [ )' : 'Abrir a barra ( [ )'} className="m-1.5 flex h-9 shrink-0 items-center gap-3 rounded-md px-2.5 text-rotulo text-texto-2 hover:bg-poco hover:text-tinta">
        <svg viewBox="0 0 24 24" className={`size-5 shrink-0 transition-transform ${aberta ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M14 6l-6 6 6 6M19 5v14" />
        </svg>
        <span className={aberta ? '' : 'sr-only'}>Recolher</span>
      </button>
    </aside>
  );
}

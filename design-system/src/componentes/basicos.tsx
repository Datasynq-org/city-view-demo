import type { ReactNode } from 'react';

type ComClasse = { className?: string; children?: ReactNode };
const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

/** Superfície de vidro sobre o mapa. Use para todo conteúdo que fica por cima da cidade. */
export function Painel({ className, children, as: Tag = 'div' }: ComClasse & { as?: 'div' | 'section' | 'aside' | 'header' | 'nav' }) {
  return <Tag className={cx('painel', className)}>{children}</Tag>;
}

/** Rótulo em mono, caixa alta, cor de acento (ou sinal). Para leituras e cabeçalhos de seção. */
export function Rotulo({ className, children, tom }: ComClasse & { tom?: 'acento' | 'fraco' | 'atencao' | 'alerta' }) {
  return <p className={cx('rotulo', tom === 'fraco' && 'fraco', tom === 'atencao' && 'c-atencao', tom === 'alerta' && 'c-alerta', className)}>{children}</p>;
}

/** Selo de aviso: "Ilustrativo", "Demonstração · dados simulados". Mesma cor nos dois temas. */
export function Selo({ children, className }: ComClasse) {
  return <span className={cx('selo', className)}>{children}</span>;
}

/** Etiqueta neutra (evidência, filtro aplicado, nome de sistema). */
export function Chip({ children, className }: ComClasse) {
  return <span className={cx('chip', className)}>{children}</span>;
}

/** Botão. `principal` usa o acento; os demais são vidro com borda. */
export function Botao({ children, className, principal, onClick, title }: ComClasse & { principal?: boolean; onClick?: () => void; title?: string }) {
  return (
    <button type="button" className={cx('botao', principal && 'botao-sim', className)} onClick={onClick} title={title}>
      {children}
    </button>
  );
}

/** Situação de algo que existe ou não: "em uso" (ok), "pronta"/"em parte" (atenção), "proposta"/"exemplo" (neutro). */
export function Pilula({ tom, children }: { tom: 'ok' | 'atencao' | 'neutro'; children: ReactNode }) {
  const classe = tom === 'ok' ? 'funciona' : tom === 'atencao' ? 'parte' : 'proposta';
  return <span className={cx('pilula', classe)}>{children}</span>;
}

/** Leitura numérica de painel (HUD). */
export function Kpi({ rotulo, valor, className }: { rotulo: string; valor: ReactNode; className?: string }) {
  return (
    <div className={cx('painel px-5 py-3 text-right', className)}>
      <p className="rotulo fraco">{rotulo}</p>
      <p className="titulo mt-1 text-3xl">{valor}</p>
    </div>
  );
}

/** Lista curta de alertas, com marcador de atenção. */
export function Alerta({ titulo, itens, className }: { titulo: string; itens: ReactNode[]; className?: string }) {
  return (
    <div className={cx('painel px-5 py-4', className)}>
      <p className="rotulo c-alerta">{titulo}</p>
      <ul className="mt-2 flex flex-col gap-2 text-sm">
        {itens.map((a, i) => (
          <li key={i} className="flex items-center gap-2"><span className="c-atencao" aria-hidden="true">●</span>{a}</li>
        ))}
      </ul>
    </div>
  );
}

/** Legenda de cores (áreas, situação). A cor nunca vem sozinha: sempre com o nome. */
export function Legenda({ itens, className }: { itens: { cor: string; nome: string }[]; className?: string }) {
  return (
    <ul className={cx('flex flex-wrap gap-x-4 gap-y-1 text-xs fraco', className)}>
      {itens.map((i) => (
        <li key={i.nome} className="flex items-center gap-1.5"><span className="ponto-area" style={{ background: i.cor, marginTop: 0 }} aria-hidden="true" />{i.nome}</li>
      ))}
    </ul>
  );
}

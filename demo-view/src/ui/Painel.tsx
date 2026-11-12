import type { CSSProperties, ReactNode } from 'react';

interface Props {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** Painel sobre o mapa: quase opaco, com borda fina (ver `.painel-vidro` em estilos.css). */
export function Painel({ className = '', style, children }: Props) {
  return (
    <section className={`painel-vidro ${className}`} style={style}>
      {children}
    </section>
  );
}

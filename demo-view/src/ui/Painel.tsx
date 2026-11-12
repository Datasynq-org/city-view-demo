import type { CSSProperties, ReactNode } from 'react';

interface Props {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/** Painel de vidro: fica sobre o mapa e deixa a cidade aparecer por trás. */
export function Painel({ className = '', style, children }: Props) {
  return (
    <section className={`painel-vidro ${className}`} style={style}>
      {children}
    </section>
  );
}

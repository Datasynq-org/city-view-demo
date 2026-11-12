import { animate } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { reduzMovimento } from '../mapa/vista';

/**
 * Um número que conta até o valor quando ele muda. Com `doZero`, conta também
 * ao aparecer (o insight que abre). Quem pede menos movimento vê o valor pronto.
 */
export function Contador({ valor, formato, doZero = false, atraso = 0 }: { valor: number; formato: (n: number) => string; doZero?: boolean; atraso?: number }) {
  const el = useRef<HTMLSpanElement>(null);
  const atual = useRef(doZero && !reduzMovimento() ? 0 : valor);
  // O texto do React fica o do primeiro desenho; daí em diante quem escreve é a animação.
  const [primeiro] = useState(() => formato(atual.current));
  useEffect(() => {
    if (atual.current === valor) return;
    const escrever = (v: number) => {
      atual.current = v;
      if (el.current) el.current.textContent = formato(v);
    };
    if (reduzMovimento()) return escrever(valor);
    const ctrl = animate(atual.current, valor, { duration: 0.6, delay: atraso, ease: 'easeOut', onUpdate: escrever });
    return () => ctrl.stop();
  }, [valor, formato, atraso]);
  return <span ref={el}>{primeiro}</span>;
}

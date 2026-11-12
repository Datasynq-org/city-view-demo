import { Children, useRef, type ReactNode } from 'react';
import { gsap, useGSAP, COM_MOVIMENTO, linhaDaCena } from '../rolagem/rolagem';
import type { Estado } from '../cidade/estado';

type Props = {
  id: string;
  fim: string; // duração da rolagem (ex.: '+=200%')
  base: Partial<Estado>; // estado da cidade ao entrar na cena
  montar?: (tl: gsap.core.Timeline, passos: number) => void; // animações extras (cidade, números…)
  lado?: ReactNode; // conteúdo fixo da cena além dos passos (ex.: HUD)
  nome: string; // nome mostrado no tour
  pausa?: number; // segundos parado em cada passo no tour
  children: ReactNode; // cada filho com className "passo"
};

// Cena fixa na tela. Os elementos `.passo` se sucedem com a rolagem (um por unidade de tempo).
// Sem animação (prefers-reduced-motion), os passos seguem um abaixo do outro.
export function Cena({ id, fim, base, montar, lado, nome, pausa = 4, children }: Props) {
  const raiz = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(COM_MOVIMENTO, () => {
        raiz.current!.classList.add('empilhado');
        const tl = linhaDaCena(id, raiz.current!, fim, base);
        const passos = gsap.utils.toArray<HTMLElement>('.passo', raiz.current);
        gsap.set(passos.slice(1), { autoAlpha: 0, y: 24 });
        passos.forEach((p, i) => {
          if (i === 0) return;
          tl.to(passos[i - 1], { autoAlpha: 0, y: -24, duration: 0.2 }, i - 0.1);
          tl.to(p, { autoAlpha: 1, y: 0, duration: 0.2 }, i + 0.05);
        });
        tl.to({}, { duration: passos.length }, 0); // duração mínima: um passo por unidade
        montar?.(tl, passos.length);
      });
    },
    { scope: raiz },
  );

  return (
    <section ref={raiz} className="cena relative z-10" data-cena={id} data-passos={Children.count(children)} data-nome={nome} data-pausa={pausa}>
      <div className="palco">
        <div className="passos coluna grid">{children}</div>
        {lado}
      </div>
    </section>
  );
}

import { useEffect } from 'react';
import { CidadeViva } from './cidade/CidadeViva';
import { Abertura, Silos, Virada, Inteligencia, Sala, Gestores, Cidadao, Prova, Encerramento } from './cenas/Cenas';
import { Arquitetura } from './cenas/Arquitetura';
import { Tour } from './componentes/Tour';
import { iniciarRolagem, irParaCaptura, captura, cenaCapturada } from './rolagem/rolagem';

// no modo captura, só a cena pedida é montada
const mostrar = (id: string) => !captura || cenaCapturada === id;

export function App() {
  useEffect(() => {
    iniciarRolagem();
    void irParaCaptura();
  }, []);

  return (
    <main>
      <CidadeViva />
      {!captura && <Tour />}
      {mostrar('abertura') && <Abertura />}
      {mostrar('silos') && <Silos />}
      {mostrar('virada') && <Virada />}
      {mostrar('arquitetura') && <Arquitetura />}
      {mostrar('inteligencia') && <Inteligencia />}
      {mostrar('sala') && <Sala />}
      {mostrar('gestores') && <Gestores />}
      {mostrar('cidadao') && <Cidadao />}
      {mostrar('prova') && <Prova />}
      {mostrar('fim') && <Encerramento />}
    </main>
  );
}

/**
 * A entrada da demo (CV-DEM-002, F4): escolher como quem se vai olhar. Sem
 * senha: é demonstração, e a tela diz isso. O perfil escolhe as telas e a
 * ordem; qualquer endereço continua abrindo em qualquer perfil.
 */
import { useState } from 'react';
import { ORGAOS } from '../../dominio/orgaos';
import { TELAS } from '../../navegacao';
import { entradaDoPerfil, escolhaDe, mudarPerfil, type Perfil, PERFIS } from '../../ui/perfil';
import { Selo } from '../../ui/Selo';

const NOME_DA_TELA = Object.fromEntries(TELAS.map((t) => [t.id, t.nome]));

export function TelaEntrada() {
  const [orgao, setOrgao] = useState(ORGAOS[0]!.id);
  const entrar = (perfil: Perfil) => {
    const o = perfil === 'gestor' ? orgao : null;
    window.location.hash = entradaDoPerfil(escolhaDe(perfil, o));
    mudarPerfil(perfil, o);
  };
  return (
    <main className="grid h-full place-items-center overflow-y-auto bg-base px-4 py-10">
      <div className="w-full max-w-4xl">
        <p className="condensado text-[28px] tracking-[0.24em] text-tinta">City View</p>
        <h1 className="mt-6 text-corpo text-tinta">Entrar como</h1>
        <p className="mt-0.5 text-rotulo text-texto-2">Cada um vê o que precisa. Ambiente de demonstração: sem senha, com dados simulados.</p>
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {PERFIS.map((p) => (
            <li key={p.id} className="painel-vidro flex flex-col p-5">
              <h2 className="titulo-painel">{p.nome}</h2>
              <p className="mt-1.5 text-nota text-texto">{p.nota}</p>
              <p className="mt-3 text-micro text-texto-2">{p.telas.length === TELAS.length ? `As ${TELAS.length} telas` : p.telas.map((t) => NOME_DA_TELA[t]).join(' · ')}</p>
              {p.id === 'gestor' && (
                <label className="mt-3 block text-rotulo text-texto-2">
                  Órgão
                  <select value={orgao} onChange={(e) => setOrgao(e.target.value)} className="mt-1 block w-full rounded border border-linha bg-poco px-2 py-1.5 text-nota text-tinta">
                    {ORGAOS.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.sigla} · {o.nome}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <div className="mt-auto pt-4">
                <button type="button" onClick={() => entrar(p.id)} className="condensado w-full rounded-md bg-acento px-3 py-2 text-rotulo text-white hover:bg-acento-claro hover:text-base">
                  Entrar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <Selo />
    </main>
  );
}

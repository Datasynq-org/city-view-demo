import type { ReactNode } from 'react';
import { Alerta, BarraSuperior, Botao, CartaoInsight, Chip, Kpi, Legenda, LinhaDeIncidente, Navegacao, Painel, Pilula, Rotulo, Segmentado, Selo, TrocaTema } from '@ds';

// Catálogo vivo do design system: tokens, tipografia e componentes, lado a lado nos dois temas.
// Documentação escrita: docs/CV-DS-001-design-system.md.

const SUPERFICIES = ['--fundo', '--painel', '--caixa', '--destaque', '--painel-borda'];
const TINTAS = ['--tinta', '--tinta-2', '--acento', '--sobre-acento'];
const SINAIS = ['--ok', '--atencao', '--alerta'];
const AREAS = ['Ouvidoria', 'Segurança', 'Iluminação', 'Vias', 'Água e esgoto', 'Limpeza urbana', 'Energia'];
const STATUS = ['resolvido', 'em resolução', 'aberto'];

function Amostra({ nome, rotulo }: { nome: string; rotulo?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-8 w-8 shrink-0 rounded-lg" style={{ background: `var(${nome})`, border: '1px solid var(--painel-borda)' }} />
      <span className="font-mono text-[0.7rem] leading-tight fraco">{rotulo ? <>{rotulo}<br /></> : null}{nome}</span>
    </div>
  );
}

function Bloco({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <Rotulo className="mb-3">{titulo}</Rotulo>
      {children}
    </section>
  );
}

function Tema({ tema }: { tema: 'escuro' | 'claro' }) {
  return (
    <div data-tema={tema} className="rounded-3xl p-8" style={{ background: 'var(--fundo)', color: 'var(--tinta)', border: '1px solid var(--painel-borda)' }}>
      <p className="titulo text-3xl">Tema {tema}</p>

      <Bloco titulo="Superfícies e tinta">
        <div className="grid grid-cols-3 gap-3">{[...SUPERFICIES, ...TINTAS].map((n) => <Amostra key={n} nome={n} />)}</div>
      </Bloco>
      <Bloco titulo="Sinais · áreas · situação">
        <div className="grid grid-cols-3 gap-3">
          {SINAIS.map((n) => <Amostra key={n} nome={n} />)}
          {AREAS.map((a, i) => <Amostra key={a} nome={`--area-${i}`} rotulo={a} />)}
          {STATUS.map((s, i) => <Amostra key={s} nome={`--status-${i}`} rotulo={s} />)}
        </div>
      </Bloco>

      <Bloco titulo="Tipografia">
        <p className="titulo text-6xl">City View</p>
        <p className="titulo mt-2 text-4xl">Cada órgão vê só a própria fila.</p>
        <p className="mt-3 text-xl fraco">Corpo em Geist, cor fraca para o texto de apoio.</p>
        <p className="rotulo mt-3">Rótulo · Geist Mono · caixa alta</p>
      </Bloco>

      <Bloco titulo="Peças">
        <div className="flex flex-wrap items-center gap-3">
          <Selo>Demonstração · dados simulados</Selo>
          <Chip>mesmo endereço</Chip>
          <Botao principal>Confirmar</Botao>
          <Botao>Descartar</Botao>
          <Pilula tom="ok">em uso</Pilula>
          <Pilula tom="atencao">pronta</Pilula>
          <Pilula tom="neutro">proposta</Pilula>
        </div>
        <div className="mt-4"><Segmentado rotulo="Período" opcoes={[{ id: 'a', nome: 'Última hora' }, { id: 'b', nome: '4 horas' }, { id: 'c', nome: 'Hoje' }]} valor="b" aoMudar={() => {}} /></div>
        <Legenda className="mt-4" itens={AREAS.map((nome, i) => ({ nome, cor: `var(--area-${i})` }))} />
      </Bloco>

      <Bloco titulo="Painéis">
        <div className="grid grid-cols-2 gap-3">
          <Kpi rotulo="Chamados" valor="4.812" />
          <Kpi rotulo="No prazo" valor="71%" />
        </div>
        <Alerta className="mt-3" titulo="Alertas agora" itens={['Dezenas de chamados, uma só casa', 'Pedras na pista: segurança']} />
        <Painel className="mt-3 p-4">
          <LinhaDeIncidente corArea="var(--area-2)" area="Iluminação" titulo="Poste apagado" ra="Ceilândia" situacao="aberto" tomSituacao="alerta" quando="há 12 min" />
          <LinhaDeIncidente corArea="var(--area-4)" area="Água e esgoto" titulo="Vazamento na calçada" ra="Taguatinga" situacao="em resolução" tomSituacao="atencao" quando="há 2 h" />
          <LinhaDeIncidente corArea="var(--area-3)" area="Vias" titulo="Buraco na via" ra="Gama" situacao="resolvido" tomSituacao="ok" quando="há 5 h" />
        </Painel>
      </Bloco>

      <Bloco titulo="Navegação e barra">
        <BarraSuperior marca="City View" sub="Sala de situação" direita={<Selo>Simulado</Selo>} />
        <div className="mt-3 w-64"><Navegacao titulo="Telas" atual="sala" aoEscolher={() => {}} itens={[{ id: 'sala', nome: 'Sala de situação' }, { id: 'int', nome: 'Inteligência', emBreve: true }]} /></div>
      </Bloco>

      <Bloco titulo="Cartão de insight">
        <CartaoInsight tipo="Mesmo incidente" titulo="Dezenas de chamados, uma só casa" viu="Chamados ao 190 sobre som alto no mesmo endereço, na mesma madrugada." porque={['mesmo endereço', 'mesmo horário']} confianca="alta" sugere="Tratar como um só incidente." />
      </Bloco>
    </div>
  );
}

export function Catalogo() {
  return (
    <div className="mx-auto max-w-[110rem] p-8">
      <BarraSuperior marca="City View" sub="Design system · Sala de Operações" direita={<><a className="botao" href="?">← Voltar à demo</a><TrocaTema /></>} />
      <p className="mt-6 max-w-[60rem] text-lg fraco">
        Os mesmos tokens e componentes da apresentação em rolagem e da demo. Cor só para sinais e sempre com o nome; vidro sobre o mapa;
        leituras em mono; tudo que é simulado leva selo. Documentação em <span className="font-mono">docs/CV-DS-001-design-system.md</span>.
      </p>
      <div className="mt-8 grid grid-cols-2 gap-6">
        <Tema tema="escuro" />
        <Tema tema="claro" />
      </div>
    </div>
  );
}

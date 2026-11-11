import type { Situacao } from '../conteudo/narrativa';

const classe: Record<Situacao, string> = { 'em uso': 'funciona', pronta: 'parte', 'aguardando a Meta': 'parte', proposta: 'proposta', exemplo: 'proposta' };

export function Pilula({ situacao }: { situacao: Situacao }) {
  return <span className={`pilula ${classe[situacao]}`}>{situacao}</span>;
}

/**
 * Camadas deck.gl da sala de guerra (I1): os chamados SIMULADOS em hexágonos ou
 * regiões (o calor é do MapLibre, ver `mapa/calor.ts`), o contexto REAL que a
 * pessoa liga e o que acabou de chegar. Funções puras: recebem o estado e
 * devolvem as camadas.
 */
import type { PickingInfo } from '@deck.gl/core';
import { CORES } from '../../ui/tokens';
import type { PoligonoRa } from './chamados';

export { camadasDeChamados, corNaEscala, type EstadoChamados, MODO_INICIAL, type ModoMapa, MODOS } from './chamados';
export { camadasDeContexto, COR_CONTEXTO } from './contexto';
export { anelAtivo, camadasDePulsos, type Chegada, DURACAO_ANEL, MARCADAS } from './pulsos';

const ESTILO_DICA = {
  background: 'rgba(20, 23, 26, 0.96)',
  color: CORES.texto,
  border: `1px solid ${CORES.linha}`,
  borderRadius: '4px',
  padding: '7px 11px',
  fontFamily: 'Bahnschrift, Barlow, system-ui, sans-serif',
  fontSize: '14px',
  lineHeight: '1.4',
};

const fmt = (n: number, casas = 0) => n.toLocaleString('pt-BR', { maximumFractionDigits: casas, minimumFractionDigits: casas });
const escapar = (t: string) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** O texto da dica de cada coisa no mapa, ou `null` se não há o que dizer. */
export function textoDaDica(id: string | undefined, object: unknown): string | null {
  if (!object || !id) return null;
  if (id === 'hexagonos') {
    const n = Math.round((object as { colorValue?: number }).colorValue ?? 0);
    return `<strong>${fmt(n)}</strong> chamado${n === 1 ? '' : 's'} neste trecho`;
  }
  if (id === 'regioes') {
    const d = object as PoligonoRa;
    if (!d.v) return `<strong>${escapar(d.nome)}</strong>`;
    return `<strong>${escapar(d.nome)}</strong><br>${fmt(d.v.chamados)} chamados · ${fmt(d.v.por10mil, 1)} por 10 mil hab.<br><span style="opacity:.7">clique para ver a RA</span>`;
  }
  if (id === 'saude' || id === 'escolas') {
    const p = object as [number, number, string, string];
    const rotulo = id === 'saude' ? p[3] : `Escola ${p[3]}`;
    return `<strong>${escapar(p[2])}</strong><br><span style="opacity:.75">${escapar(rotulo)} · dado real</span>`;
  }
  if (id === 'chegadas') {
    const rotulo = (object as { rotulo?: string }).rotulo;
    return `<strong>Chamado que acabou de chegar</strong>${rotulo ? `<br>${escapar(rotulo)}` : ''}<br><span style="opacity:.75">simulado</span>`;
  }
  if (id === 'favelas') {
    const nome = (object as { properties?: { nome?: string } }).properties?.nome ?? '';
    return `<strong>${escapar(nome)}</strong><br><span style="opacity:.75">Favela ou comunidade urbana · IBGE 2022</span>`;
  }
  return null;
}

/** Dica ao passar o mouse, no visual dos painéis. */
export function dicaDoMapa({ object, layer }: PickingInfo): { html: string; style: Record<string, string> } | null {
  const html = textoDaDica(layer?.id, object);
  return html ? { html, style: ESTILO_DICA } : null;
}

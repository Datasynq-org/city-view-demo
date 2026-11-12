/**
 * Onde cada incidente SIMULADO cai dentro da RA. Endereços fictícios: servem para
 * mostrar o padrão, não lugares. Método de `City-view/.../data/pontos.ts`.
 */
import { dentroDaRegiao, GRAUS_POR_UNIDADE, type Regiao } from '../dominio/ras';
import { normal, type Rand } from './aleatorio';

const TENTATIVAS = 12;
const arredondar = (n: number) => Math.round(n * 1e5) / 1e5;

/**
 * Sorteia um ponto perto do núcleo urbano da RA (o ponto do rótulo), com
 * espalhamento proporcional ao tamanho dela: de 0,7 a 2,5 km. Se nenhuma
 * tentativa cair dentro da RA, devolve o próprio núcleo.
 */
export function sortearPonto(ra: Regiao, rand: Rand): [number, number] {
  const [gx, gy] = GRAUS_POR_UNIDADE;
  const [cx, cy] = ra.rotulo;
  const raio = Math.min(25, Math.max(7, Math.sqrt(ra.areaKm2) * 1.2));
  for (let t = 0; t < TENTATIVAS; t++) {
    const lon = cx + normal(rand) * raio * gx;
    const lat = cy + normal(rand) * raio * gy;
    if (dentroDaRegiao(ra, lon, lat)) return [arredondar(lon), arredondar(lat)];
  }
  return [cx, cy];
}

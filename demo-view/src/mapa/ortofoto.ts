/**
 * A imagem de perto: o mosaico de satélite de 2021 do DF inteiro (Maxar, 50 cm),
 * publicado pelo GDF na IDE/DF (SEDUH). Com ele dá para ler ruas e quadras; o
 * Sentinel-2 da vista geral (10 m) não chega a isso.
 *
 * O serviço tem dois jeitos de entregar a imagem. Medido em 12/11/2026:
 *
 * - recortar na hora, já na projeção do mapa (`exportImage`): ~0,6 s por bloco
 *   e só um pedido por vez. Com dois ou mais ao mesmo tempo, de 25% a 50%
 *   voltam com erro, e tentar de novo não resolve;
 * - blocos prontos, em cache (`tile`): ~0,1 s cada, 48 de 48 com 16 ao mesmo
 *   tempo. Só que na projeção do GDF (UTM 23S, SIRGAS 2000), não na do mapa.
 *
 * Por isso este arquivo monta cada bloco do mapa (Web Mercator) a partir dos
 * blocos prontos: descobre quais cobrem o bloco pedido, baixa e os desenha
 * girados e esticados no lugar certo. Num bloco de poucos quilômetros, a
 * diferença entre as duas projeções é uma transformação afim (rotação de ~0,8°
 * e escala), com erro de menos de meio pixel.
 *
 * Enquanto um bloco não chega, aparece o Sentinel por baixo; sem rede, o mapa
 * segue igual. O navegador guarda os blocos por 12 horas: um trajeto ensaiado
 * antes abre na hora.
 *
 * Este arquivo não importa o MapLibre: quem liga o protocolo é o `Mapa.tsx`.
 */

const SERVICO = 'https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Imagens/2021_50CM/ImageServer/tile';
export const PROTOCOLO_ORTOFOTO = 'ortofoto';

/** O endereço dos blocos no estilo do mapa. */
export const URL_ORTOFOTO = `${PROTOCOLO_ORTOFOTO}://{z}/{x}/{y}`;
export const CREDITO_ORTOFOTO = 'Imagem de 2021: Maxar, via GDF, IDE/DF (SEDUH)';

/** Lado, em pixels, do bloco entregue ao mapa. */
export const LADO = 512;
/** No zoom 17 um pixel da tela já vale ~57 cm, a resolução da imagem: acima disso o mapa só amplia. */
export const ZOOM_MAXIMO_DA_ORTOFOTO = 17;

// ---------------------------------------------------------------- a grade do cache (EPSG:31983)

/** Canto de cima, à esquerda, da grade: [leste, norte], em metros. */
const ORIGEM: readonly [number, number] = [-5120900, 19998100];
const LADO_DO_CACHE = 256;
/** Onde o serviço tem imagem: [oeste, sul, leste, norte], em metros. É o retângulo em volta do DF. */
const COBERTURA: readonly [number, number, number, number] = [148_012, 8_222_802, 253_020, 8_284_705];
/**
 * Metros por pixel de cada nível do cache (escalas de 1:400.000 a 1:2.500). O
 * serviço ainda tem os níveis 10 e 11, que só ampliam a imagem de 50 cm.
 */
export const RESOLUCOES: readonly number[] = [
  105.83354500042335, 79.37515875031751, 52.91677250021167, 26.458386250105836, 13.229193125052918, 6.614596562526459, 2.6458386250105836,
  1.9843789687579376, 1.3229193125052918, 0.6614596562526459,
];

/**
 * O nível do cache para uma resolução pedida: o mais grosso que ainda tem
 * detalhe de sobra (até 20% abaixo do pedido passa). Mais fino que isso
 * multiplicaria os pedidos sem melhorar o que se vê.
 */
export function nivelPara(metrosPorPixel: number): number {
  const k = RESOLUCOES.findIndex((r) => r <= metrosPorPixel * 1.2);
  return k < 0 ? RESOLUCOES.length - 1 : k;
}

// ---------------------------------------------------------------- lon/lat → UTM 23S

const A = 6378137; // GRS80, o elipsoide do SIRGAS 2000
const F = 1 / 298.257222101;
const K0 = 0.9996;
const MERIDIANO = (-45 * Math.PI) / 180; // meridiano central do fuso 23
const N = F / (2 - F);
const RAIO = (A / (1 + N)) * (1 + (N * N) / 4 + N ** 4 / 64);
const ALFA = [N / 2 - (2 * N * N) / 3 + (5 * N ** 3) / 16, (13 * N * N) / 48 - (3 * N ** 3) / 5, (61 * N ** 3) / 240];
const E2 = (2 * Math.sqrt(N)) / (1 + N);

/** [leste, norte] em UTM 23S (EPSG:31983), pela série de Krüger. Erro de milímetros. */
export function paraUtm(lon: number, lat: number): [number, number] {
  const fi = (lat * Math.PI) / 180;
  const dl = (lon * Math.PI) / 180 - MERIDIANO;
  const t = Math.sinh(Math.atanh(Math.sin(fi)) - E2 * Math.atanh(E2 * Math.sin(fi)));
  const xi = Math.atan2(t, Math.cos(dl));
  const eta = Math.atanh(Math.sin(dl) / Math.sqrt(1 + t * t));
  let leste = eta;
  let norte = xi;
  ALFA.forEach((a, k) => {
    const j = 2 * (k + 1);
    leste += a * Math.cos(j * xi) * Math.sinh(j * eta);
    norte += a * Math.sin(j * xi) * Math.cosh(j * eta);
  });
  return [500_000 + K0 * RAIO * leste, 10_000_000 + K0 * RAIO * norte];
}

// ---------------------------------------------------------------- o plano de um bloco

/** [lon, lat] do canto de cima, à esquerda, do bloco `x`, `y` no zoom `z` (Web Mercator). */
export function cantoDoBloco(z: number, x: number, y: number): [number, number] {
  const n = 2 ** z;
  return [(x / n) * 360 - 180, (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n))) * 180) / Math.PI];
}

export interface Plano {
  nivel: number;
  /** A parte da transformação que vale para todos os blocos do cache: `setTransform(a, b, c, d, e, f)`. */
  a: number;
  b: number;
  c: number;
  d: number;
  blocos: { linha: number; coluna: number; e: number; f: number }[];
}

/**
 * Quais blocos do cache cobrem o bloco `z/x/y` do mapa, e como desenhar cada um
 * num quadro de `LADO` pixels. A transformação é a afim que leva três cantos do
 * bloco (em UTM) aos cantos do quadro.
 */
export function planejar(z: number, x: number, y: number): Plano {
  const [e0, n0] = paraUtm(...cantoDoBloco(z, x, y));
  const [e1, n1] = paraUtm(...cantoDoBloco(z, x + 1, y));
  const [e2, n2] = paraUtm(...cantoDoBloco(z, x, y + 1));
  const [e3, n3] = paraUtm(...cantoDoBloco(z, x + 1, y + 1));
  // u e v: os lados de cima e da esquerda do bloco, em metros. M leva u a (LADO, 0) e v a (0, LADO).
  const ux = e1 - e0, uy = n1 - n0, vx = e2 - e0, vy = n2 - n0;
  const det = ux * vy - vx * uy;
  const m11 = (LADO * vy) / det, m12 = (-LADO * vx) / det, m21 = (-LADO * uy) / det, m22 = (LADO * ux) / det;

  const nivel = nivelPara(Math.hypot(ux, uy) / LADO);
  const r = RESOLUCOES[nivel]!;
  const passo = LADO_DO_CACHE * r;
  const coluna0 = Math.floor((Math.min(e0, e1, e2, e3) - ORIGEM[0]) / passo);
  const coluna1 = Math.floor((Math.max(e0, e1, e2, e3) - ORIGEM[0]) / passo);
  const linha0 = Math.floor((ORIGEM[1] - Math.max(n0, n1, n2, n3)) / passo);
  const linha1 = Math.floor((ORIGEM[1] - Math.min(n0, n1, n2, n3)) / passo);

  const a = m11 * r, b = m21 * r, c = -m12 * r, d = -m22 * r;
  const blocos: Plano['blocos'] = [];
  for (let linha = linha0; linha <= linha1; linha++) {
    for (let coluna = coluna0; coluna <= coluna1; coluna++) {
      const oeste = ORIGEM[0] + coluna * passo;
      const norte = ORIGEM[1] - linha * passo;
      // Fora da cobertura o serviço responde 404: nem pede.
      if (oeste >= COBERTURA[2] || oeste + passo <= COBERTURA[0] || norte <= COBERTURA[1] || norte - passo >= COBERTURA[3]) continue;
      const de = oeste - e0;
      const dn = norte - n0;
      const e = m11 * de + m12 * dn;
      const f = m21 * de + m22 * dn;
      // Com a rotação, um bloco do canto pode nem tocar o quadro: não vale o pedido.
      const xs = [e, e + a * LADO_DO_CACHE, e + c * LADO_DO_CACHE, e + (a + c) * LADO_DO_CACHE];
      const ys = [f, f + b * LADO_DO_CACHE, f + d * LADO_DO_CACHE, f + (b + d) * LADO_DO_CACHE];
      if (Math.max(...xs) <= 0 || Math.min(...xs) >= LADO || Math.max(...ys) <= 0 || Math.min(...ys) >= LADO) continue;
      blocos.push({ linha, coluna, e, f });
    }
  }
  return { nivel, a, b, c, d, blocos };
}

// ---------------------------------------------------------------- pedidos

/**
 * Fila de espera: no máximo `limite` tarefas correndo e, se `intervaloMs` vier,
 * no máximo uma tarefa começando a cada `intervaloMs`.
 *
 * O intervalo conta do início *real* da tarefa anterior (um portão em cadeia),
 * não de um horário marcado antes: se o navegador atrasar um disparo, as
 * seguintes atrasam junto, em vez de saírem quase ao mesmo tempo (a IDE/DF
 * recusa tudo depois de uma rajada).
 */
export function criarFila(limite: number, intervaloMs = 0) {
  let correndo = 0;
  let portao: Promise<void> = Promise.resolve();
  let ultimoInicio = Number.NEGATIVE_INFINITY;
  const esperando: (() => void)[] = [];
  const entrar = () =>
    new Promise<void>((ok) => {
      if (correndo < limite) {
        correndo++;
        ok();
      } else esperando.push(ok);
    });
  const sair = () => {
    const proximo = esperando.shift();
    if (proximo) proximo();
    else correndo--;
  };
  const naVez = (): Promise<void> => {
    if (!intervaloMs) return Promise.resolve();
    const vez = portao.then(async () => {
      // O relógio dos timers pode disparar 1 ms antes: confere e espera o resto.
      for (let falta = ultimoInicio + intervaloMs - performance.now(); falta > 0; falta = ultimoInicio + intervaloMs - performance.now()) {
        await new Promise((ok) => setTimeout(ok, falta));
      }
      ultimoInicio = performance.now();
    });
    portao = vez;
    return vez;
  };
  return async function naFila<T>(tarefa: () => Promise<T>): Promise<T> {
    await entrar();
    try {
      await naVez();
      return await tarefa();
    } finally {
      sair();
    }
  };
}

export const enderecoNoCache = (nivel: number, linha: number, coluna: number) => `${SERVICO}/${nivel}/${linha}/${coluna}`;

/**
 * Baixa um bloco do cache. `null` quando o serviço diz que ali não há imagem
 * (404, fora da cobertura). Uma falha de rede é tentada de novo uma vez.
 */
export async function buscarNoCache(endereco: string, sinal: AbortSignal, buscar: typeof fetch = fetch): Promise<Blob | null> {
  for (let tentativa = 1; ; tentativa++) {
    sinal.throwIfAborted();
    try {
      const r = await buscar(endereco, { signal: sinal });
      if (r.status === 404) return null;
      if (r.ok && (r.headers.get('content-type') ?? '').startsWith('image/')) return await r.blob();
      throw new Error(`ortofoto: a IDE/DF respondeu ${r.status} a ${endereco}`);
    } catch (e) {
      if (sinal.aborted || tentativa >= 2) throw e;
    }
  }
}

/**
 * Ritmo dos pedidos. O servidor da IDE/DF é público e se protege: recusa tudo
 * (403) por cerca de 1 s depois de uns 200 pedidos num segundo. Aqui, no máximo
 * 8 ao mesmo tempo e 50 por segundo, um quarto disso.
 */
const SIMULTANEOS = 8;
const INTERVALO_MS = 20;
/** Blocos vizinhos do mapa pedem os mesmos blocos do cache quase juntos: a imagem pronta fica à mão por este tempo. */
const GUARDAR_MS = 15_000;

/** Desenha os blocos do cache no quadro, cada um no seu lugar. */
function montarNoQuadro(plano: Plano, imagens: readonly (ImageBitmap | null)[]): ImageBitmap {
  const quadro = new OffscreenCanvas(LADO, LADO);
  const ctx = quadro.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  plano.blocos.forEach((b, k) => {
    const img = imagens[k];
    if (!img) return;
    ctx.setTransform(plano.a, plano.b, plano.c, plano.d, b.e, b.f);
    // Meio pixel de sobra de cada lado: sem isso, a emenda entre dois blocos aparece como um fio.
    ctx.drawImage(img, -0.5, -0.5, LADO_DO_CACHE + 1, LADO_DO_CACHE + 1);
  });
  // Onde o cache não tem imagem, o quadro fica transparente e o Sentinel aparece.
  return quadro.transferToImageBitmap();
}

/** O que o carregador usa do navegador; trocável nos testes. */
export interface Meios<I> {
  buscar: typeof fetch;
  decodificar: (dados: Blob) => Promise<I>;
  montar: (plano: Plano, imagens: readonly (I | null)[]) => I;
  simultaneos: number;
  intervaloMs: number;
}

/**
 * O que o MapLibre chama para cada bloco `ortofoto://z/x/y` (ver `addProtocol`):
 * devolve o bloco já montado, como imagem pronta para a placa de vídeo.
 *
 * Um mesmo bloco do cache serve a até quatro blocos vizinhos do mapa: é baixado
 * uma vez só. E, numa aproximação, o mapa pede blocos de cada zoom por onde
 * passa e desiste deles em seguida: o que ainda estava na fila nem é baixado.
 */
export function carregadorDeOrtofoto<I = ImageBitmap>(meios: Partial<Meios<I>> = {}) {
  const buscar = meios.buscar ?? fetch;
  const decodificar = meios.decodificar ?? ((dados: Blob) => createImageBitmap(dados) as Promise<I>);
  const montar = meios.montar ?? (montarNoQuadro as unknown as Meios<I>['montar']);
  const naFila = criarFila(meios.simultaneos ?? SIMULTANEOS, meios.intervaloMs ?? INTERVALO_MS);
  const semCancelar = new AbortController().signal;
  const recentes = new Map<string, { imagem: Promise<I | null>; interessados: Set<AbortSignal> }>();

  const pedir = (endereco: string, sinal: AbortSignal): Promise<I | null> => {
    let p = recentes.get(endereco);
    if (!p) {
      const interessados = new Set<AbortSignal>();
      const imagem = naFila(async () => {
        if ([...interessados].every((s) => s.aborted)) {
          // Sai da lista já, para um pedido novo deste bloco começar do zero.
          recentes.delete(endereco);
          throw new DOMException('Ninguém mais espera este bloco.', 'AbortError');
        }
        const dados = await buscarNoCache(endereco, semCancelar, buscar);
        return dados ? await decodificar(dados) : null;
      });
      const novo = { imagem, interessados };
      p = novo;
      recentes.set(endereco, novo);
      const esquecer = () => {
        if (recentes.get(endereco) === novo) recentes.delete(endereco);
      };
      imagem.then(() => setTimeout(esquecer, GUARDAR_MS), esquecer);
    }
    p.interessados.add(sinal);
    return p.imagem;
  };

  return async (pedido: { url: string }, abortar: AbortController): Promise<{ data: I }> => {
    const [z, x, y] = pedido.url.slice(PROTOCOLO_ORTOFOTO.length + 3).split('/').map(Number) as [number, number, number];
    const plano = planejar(z, x, y);
    const imagens = await Promise.all(plano.blocos.map((b) => pedir(enderecoNoCache(plano.nivel, b.linha, b.coluna), abortar.signal)));
    abortar.signal.throwIfAborted();
    return { data: montar(plano, imagens) };
  };
}

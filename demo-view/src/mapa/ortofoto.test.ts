import { describe, expect, it } from 'vitest';
import { LIMITES_DF } from '../dominio/ras';
import { buscarNoCache, cantoDoBloco, carregadorDeOrtofoto, criarFila, enderecoNoCache, LADO, nivelPara, paraUtm, type Plano, planejar, RESOLUCOES, URL_ORTOFOTO } from './ortofoto';

/**
 * Os mesmos pontos nas duas projeções, como a IDE/DF os devolve (camada
 * Publico/LIMITES, vértices das RAs, pedidos em EPSG:4326 e em EPSG:31983).
 * [lon, lat, leste, norte]
 */
const REFERENCIA: [number, number, number, number][] = [
  [-48.2082472182537, -15.740339062266306, 156150.4989, 8257172.9977], // Brazlândia
  [-48.202413018038605, -15.623707598102099, 156580.98000000045, 8270100.59], // Brazlândia
  [-47.859501544699235, -15.688227457957664, 193478.14829999954, 8263481.1408], // Plano Piloto
  [-47.78468968575963, -15.795459907277934, 201659.73000000045, 8251714.9], // Plano Piloto
  [-47.418406916554375, -15.501819582900566, 240552.97470000014, 8284705.234], // Planaltina
  [-47.3421982080214, -15.796611746631012, 249092.67310000025, 8252165.4462], // Planaltina
  [-48.12208286086935, -15.95567856540621, 165748.53139999975, 8233462.0146], // Gama
  [-48.04504848737883, -16.020217466877167, 174107.31539999973, 8226436.7049], // Gama
];

const bloco = (lon: number, lat: number, z: number): [number, number, number] => {
  const n = 2 ** z;
  return [z, Math.floor(((lon + 180) / 360) * n), Math.floor(((1 - Math.asinh(Math.tan((lat * Math.PI) / 180)) / Math.PI) / 2) * n)];
};
/** Onde um ponto em UTM cai no quadro, segundo o plano (pela transformação do primeiro bloco do cache). */
function noQuadro(plano: ReturnType<typeof planejar>, leste: number, norte: number): [number, number] {
  const b = plano.blocos[0]!;
  const r = RESOLUCOES[plano.nivel]!;
  // (u, v): pixel dentro do bloco do cache, a partir do canto de cima, à esquerda.
  const u = (leste - (-5120900 + b.coluna * 256 * r)) / r;
  const v = (19998100 - b.linha * 256 * r - norte) / r;
  return [plano.a * u + plano.c * v + b.e, plano.b * u + plano.d * v + b.f];
}

describe('lon/lat → UTM 23S', () => {
  it('bate com a IDE/DF em todo o DF, com menos de 5 cm de diferença', () => {
    for (const [lon, lat, leste, norte] of REFERENCIA) {
      const [e, n] = paraUtm(lon, lat);
      expect(Math.abs(e - leste), `leste de ${lon}, ${lat}`).toBeLessThan(0.05);
      expect(Math.abs(n - norte), `norte de ${lon}, ${lat}`).toBeLessThan(0.05);
    }
  });
});

describe('nível do cache', () => {
  it('acompanha o zoom do mapa, sem pedir mais detalhe do que a tela mostra', () => {
    // Metros por pixel de um bloco de 512 px na latitude do DF: ~75.300 / 2^z.
    const mpp = (z: number) => 75_323 / 2 ** z;
    expect([11, 12, 13, 14, 15, 16, 17].map((z) => nivelPara(mpp(z)))).toEqual([3, 4, 5, 6, 6, 8, 9]);
    for (let z = 11; z <= 17; z++) {
      const q = RESOLUCOES[nivelPara(mpp(z))]! / mpp(z);
      expect(q, `zoom ${z}`).toBeLessThanOrEqual(1.2); // nunca borra mais que 20%
      expect(q, `zoom ${z}`).toBeGreaterThan(0.5); // nem pede o dobro do detalhe
    }
  });

  it('para no nível 9, o último com detalhe de verdade', () => {
    expect(nivelPara(0.1)).toBe(9);
    expect(RESOLUCOES).toHaveLength(10);
    expect(nivelPara(1000)).toBe(0);
  });
});

describe('plano de um bloco do mapa', () => {
  const casos = [bloco(-47.8828, -15.7939, 13), bloco(-48.1077, -15.8174, 15), bloco(-47.6532, -15.6185, 16), bloco(-48.0627, -16.0185, 17), bloco(-48.2, -15.67, 14), bloco(-47.6, -15.7, 12)];

  it('leva os cantos do bloco aos cantos do quadro, com erro de menos de meio pixel', () => {
    for (const [z, x, y] of casos) {
      const plano = planejar(z, x, y);
      const canto = (dx: number, dy: number) => noQuadro(plano, ...paraUtm(...cantoDoBloco(z, x + dx, y + dy)));
      const perto = (p: [number, number], ex: number, ey: number, tol: number) => {
        expect(Math.abs(p[0] - ex), `${z}/${x}/${y}`).toBeLessThan(tol);
        expect(Math.abs(p[1] - ey), `${z}/${x}/${y}`).toBeLessThan(tol);
      };
      perto(canto(0, 0), 0, 0, 1e-6);
      perto(canto(1, 0), LADO, 0, 1e-6);
      perto(canto(0, 1), 0, LADO, 1e-6);
      // O quarto canto não entra na conta da transformação: mede o erro dela.
      perto(canto(1, 1), LADO, LADO, 0.5);
    }
  });

  it('gira pouco (menos de 1,5°) e não espelha a imagem', () => {
    for (const [z, x, y] of casos) {
      const { a, b, c, d } = planejar(z, x, y);
      expect(a).toBeGreaterThan(0);
      expect(d).toBeGreaterThan(0);
      expect(Math.abs((Math.atan2(b, a) * 180) / Math.PI)).toBeLessThan(1.5);
      expect(Math.abs((Math.atan2(-c, d) * 180) / Math.PI)).toBeLessThan(1.5);
    }
  });

  it('cobre o quadro inteiro com os blocos do cache, sem pedir demais', () => {
    for (const [z, x, y] of casos) {
      const plano = planejar(z, x, y);
      expect(plano.blocos.length, `${z}/${x}/${y}`).toBeGreaterThanOrEqual(4);
      expect(plano.blocos.length, `${z}/${x}/${y}`).toBeLessThanOrEqual(30);
      // Cada ponto de uma grade sobre o quadro cai dentro de algum bloco do cache.
      const det = plano.a * plano.d - plano.b * plano.c;
      for (let py = 1; py < LADO; py += 51) {
        for (let px = 1; px < LADO; px += 51) {
          const coberto = plano.blocos.some((bl) => {
            const dx = px - bl.e, dy = py - bl.f;
            const u = (plano.d * dx - plano.c * dy) / det, v = (plano.a * dy - plano.b * dx) / det;
            return u >= 0 && u <= 256 && v >= 0 && v <= 256;
          });
          expect(coberto, `${z}/${x}/${y} em ${px},${py}`).toBe(true);
        }
      }
      expect(new Set(plano.blocos.map((bl) => `${bl.linha}/${bl.coluna}`)).size).toBe(plano.blocos.length);
    }
  });

  it('não pede blocos de fora da cobertura do serviço', () => {
    // Bem a oeste do DF (Goiás) e no mar: nenhum bloco. Na divisa: só os de dentro.
    expect(planejar(...bloco(-49.5, -15.8, 14)).blocos).toEqual([]);
    expect(planejar(...bloco(-38.5, -13, 14)).blocos).toEqual([]);
    const naDivisa = planejar(...bloco(-48.2859, -15.8, 13));
    const dentro = planejar(...bloco(-47.9, -15.8, 13));
    expect(naDivisa.blocos.length).toBeGreaterThan(0);
    expect(naDivisa.blocos.length).toBeLessThan(dentro.blocos.length);
  });

  it('o canto do bloco fica onde o Web Mercator diz', () => {
    expect(cantoDoBloco(0, 0, 0)[0]).toBe(-180);
    expect(cantoDoBloco(1, 1, 1)).toEqual([0, 0]);
    const [z, x, y] = bloco(-47.8828, -15.7939, 14);
    const [oeste, norte] = cantoDoBloco(z, x, y);
    const [leste, sul] = cantoDoBloco(z, x + 1, y + 1);
    expect(-47.8828).toBeGreaterThan(oeste);
    expect(-47.8828).toBeLessThan(leste);
    expect(-15.7939).toBeLessThan(norte);
    expect(-15.7939).toBeGreaterThan(sul);
    // O DF inteiro cai na grade do serviço: nenhum canto do DF dá linha ou coluna negativa.
    for (const [lon, lat] of [LIMITES_DF[0], LIMITES_DF[1]]) expect(planejar(...bloco(lon, lat, 13)).blocos.every((b) => b.linha > 0 && b.coluna > 0)).toBe(true);
  });
});

describe('pedidos ao cache da IDE/DF', () => {
  const sinal = () => new AbortController().signal;
  const resposta = (corpo: BodyInit | null, tipo: string, status = 200) => new Response(corpo, { status, headers: { 'content-type': tipo } });
  const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);

  it('monta o endereço do bloco pronto: nível, linha e coluna', () => {
    expect(enderecoNoCache(9, 69363, 31369)).toBe('https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Imagens/2021_50CM/ImageServer/tile/9/69363/31369');
    expect(URL_ORTOFOTO).toBe('ortofoto://{z}/{x}/{y}');
  });

  it('devolve a imagem quando ela chega', async () => {
    const dados = await buscarNoCache('x', sinal(), (async () => resposta(JPEG, 'image/jpeg')) as typeof fetch);
    expect(new Uint8Array(await dados!.arrayBuffer())).toEqual(JPEG);
  });

  it('404 quer dizer que ali não há imagem: não é erro, nem motivo para insistir', async () => {
    let pedidos = 0;
    const buscar = (async () => (pedidos++, resposta('não achei', 'text/html', 404))) as typeof fetch;
    expect(await buscarNoCache('x', sinal(), buscar)).toBeNull();
    expect(pedidos).toBe(1);
  });

  it('tenta de novo uma vez quando a rede falha, e depois desiste', async () => {
    let pedidos = 0;
    const umaFalha = (async () => {
      if (++pedidos === 1) throw new TypeError('rede');
      return resposta(JPEG, 'image/jpeg');
    }) as typeof fetch;
    expect(await buscarNoCache('x', sinal(), umaFalha)).not.toBeNull();
    expect(pedidos).toBe(2);

    pedidos = 0;
    const sempre = (async () => (pedidos++, resposta('erro', 'text/plain', 500))) as typeof fetch;
    await expect(buscarNoCache('x', sinal(), sempre)).rejects.toThrow(/IDE\/DF respondeu 500/);
    expect(pedidos).toBe(2);
  });

  it('não pede nada depois de cancelado', async () => {
    const controle = new AbortController();
    controle.abort();
    let pedidos = 0;
    await expect(buscarNoCache('x', controle.signal, (async () => (pedidos++, resposta(JPEG, 'image/jpeg'))) as typeof fetch)).rejects.toThrow();
    expect(pedidos).toBe(0);
  });
});

describe('carregador do protocolo ortofoto://', () => {
  const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
  /** Um servidor de mentira: conta os pedidos e pode segurar as respostas. */
  function servidor(opcoes: { semImagem?: (u: string) => boolean } = {}) {
    const pedidos: string[] = [];
    let soltar: () => void = () => {};
    const portao = new Promise<void>((ok) => (soltar = ok));
    let segurar = false;
    const buscar = (async (u: string) => {
      pedidos.push(u);
      if (segurar) await portao;
      return opcoes.semImagem?.(u) ? new Response('nada', { status: 404 }) : new Response(JPEG, { headers: { 'content-type': 'image/jpeg' } });
    }) as typeof fetch;
    return { pedidos, buscar, segurarRespostas: () => (segurar = true), soltar };
  }
  const meios = (s: ReturnType<typeof servidor>, simultaneos = 8) => ({
    buscar: s.buscar,
    decodificar: async () => 'imagem',
    montar: (plano: Plano, imagens: readonly (string | null)[]) => `${plano.blocos.length} blocos, ${imagens.filter(Boolean).length} com imagem`,
    simultaneos,
    intervaloMs: 0,
  });
  const [z, x, y] = bloco(-47.8828, -15.7939, 15);
  const url = (dx = 0) => ({ url: `ortofoto://${z}/${x + dx}/${y}` });

  it('monta o bloco com todos os blocos do cache que o cobrem', async () => {
    const s = servidor();
    const { data } = await carregadorDeOrtofoto(meios(s))(url(), new AbortController());
    const plano = planejar(z, x, y);
    expect(data).toBe(`${plano.blocos.length} blocos, ${plano.blocos.length} com imagem`);
    expect(new Set(s.pedidos)).toEqual(new Set(plano.blocos.map((b) => enderecoNoCache(plano.nivel, b.linha, b.coluna))));
  });

  it('dois blocos vizinhos do mapa não baixam duas vezes o bloco do cache que dividem', async () => {
    const s = servidor();
    const carregar = carregadorDeOrtofoto(meios(s));
    await Promise.all([carregar(url(0), new AbortController()), carregar(url(1), new AbortController())]);
    const deCadaUm = [planejar(z, x, y), planejar(z, x + 1, y)].flatMap((p) => p.blocos.map((b) => enderecoNoCache(p.nivel, b.linha, b.coluna)));
    const distintos = new Set(deCadaUm);
    expect(distintos.size).toBeLessThan(deCadaUm.length); // eles dividem blocos
    expect(s.pedidos).toHaveLength(distintos.size);
    expect(new Set(s.pedidos).size).toBe(s.pedidos.length);
  });

  it('onde o cache não tem imagem, monta com o que há', async () => {
    const plano = planejar(z, x, y);
    const fora = enderecoNoCache(plano.nivel, plano.blocos[0]!.linha, plano.blocos[0]!.coluna);
    const s = servidor({ semImagem: (u) => u === fora });
    const { data } = await carregadorDeOrtofoto(meios(s))(url(), new AbortController());
    expect(data).toBe(`${plano.blocos.length} blocos, ${plano.blocos.length - 1} com imagem`);
  });

  it('não baixa o que ficou na fila de um bloco de que o mapa desistiu', async () => {
    // Um pedido por vez, com a primeira resposta presa: o resto fica na fila.
    const s = servidor();
    s.segurarRespostas();
    const carregar = carregadorDeOrtofoto(meios(s, 1));
    const desistente = new AbortController();
    const primeiro = carregar(url(0), desistente).catch((e: Error) => e.name);
    const firme = new AbortController();
    const segundo = carregar(url(3), firme); // longe: não divide blocos com o primeiro
    await new Promise((ok) => setTimeout(ok, 5));
    expect(s.pedidos).toHaveLength(1);
    desistente.abort();
    s.soltar();
    expect(await primeiro).toBe('AbortError');
    await segundo;
    const doSegundo = planejar(z, x + 3, y);
    // Do bloco abandonado só saiu o pedido que já estava em curso; o do outro veio inteiro.
    expect(s.pedidos).toHaveLength(1 + doSegundo.blocos.length);
  });

  it('um bloco pedido de novo depois de abandonado é baixado normalmente', async () => {
    const s = servidor();
    s.segurarRespostas();
    const carregar = carregadorDeOrtofoto(meios(s, 1));
    const desistente = new AbortController();
    const abandonado = carregar(url(0), desistente).catch((e: Error) => e.name);
    await new Promise((ok) => setTimeout(ok, 5));
    desistente.abort();
    s.soltar();
    expect(await abandonado).toBe('AbortError');
    const plano = planejar(z, x, y);
    const { data } = await carregar(url(0), new AbortController());
    expect(data).toBe(`${plano.blocos.length} blocos, ${plano.blocos.length} com imagem`);
  });
});

describe('fila de pedidos', () => {
  it('com intervalo, não começa mais de uma tarefa a cada tanto', async () => {
    const naFila = criarFila(8, 15);
    const inicios: number[] = [];
    await Promise.all(Array.from({ length: 6 }, () => naFila(async () => void inicios.push(performance.now()))));
    // Os inícios são marcados a cada 15 ms a partir do primeiro; o relógio do sistema pode adiantar 1 ou 2 ms.
    for (let k = 1; k < inicios.length; k++) expect(inicios[k]! - inicios[k - 1]!).toBeGreaterThan(10);
    expect(inicios.at(-1)! - inicios[0]!).toBeGreaterThan(5 * 15 - 6);
  });

  it('nunca passa do limite de tarefas ao mesmo tempo, e atende todas', async () => {
    const naFila = criarFila(4);
    let correndo = 0;
    let maximo = 0;
    const tarefa = (k: number) => async () => {
      maximo = Math.max(maximo, ++correndo);
      await new Promise((ok) => setTimeout(ok, 5));
      correndo--;
      return k;
    };
    const feitas = await Promise.all(Array.from({ length: 20 }, (_, k) => naFila(tarefa(k))));
    expect(maximo).toBe(4);
    expect(feitas).toEqual(Array.from({ length: 20 }, (_, k) => k));
  });

  it('uma tarefa que falha não trava a fila', async () => {
    const naFila = criarFila(1);
    await expect(
      naFila(async () => {
        throw new Error('falhou');
      }),
    ).rejects.toThrow('falhou');
    await expect(naFila(async () => 'ok')).resolves.toBe('ok');
  });
});

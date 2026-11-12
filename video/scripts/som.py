"""Monta a banda sonora do filme: edita a trilha gerada (100 BPM, compasso de
2,4 s) para casar com a tabela de tempo e sintetiza os efeitos.

Uso: python3 scripts/som.py   (precisa de ffmpeg e numpy)
Entrada: public/audio/trilha_bruta.mp3   Saída: public/audio/mix.wav
Os tempos são do filme, em segundos (src/tempo.ts dividido por 30).
"""
import subprocess, wave
from pathlib import Path
import numpy as np

SR = 44100
RAIZ = Path(__file__).resolve().parent.parent
DUR = 75.0

bruto = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", str(RAIZ / "public/audio/trilha_bruta.mp3"), "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
    capture_output=True, check=True).stdout
trilha = np.frombuffer(bruto, dtype=np.float32).reshape(-1, 2)
mix = np.zeros((int(DUR * SR), 2), dtype=np.float64)


def db(v):
    return 10 ** (v / 20)


def trecho(filme, faixa, dur, ganho=0.0, ganho_fim=None, entra=0.03, sai=0.03):
    """Põe `dur` segundos da trilha (a partir de `faixa`) no tempo `filme`."""
    n = int(dur * SR)
    seg = trilha[int(faixa * SR): int(faixa * SR) + n].astype(np.float64)
    g = np.linspace(db(ganho), db(ganho if ganho_fim is None else ganho_fim), len(seg))
    env = np.ones(len(seg))
    ne, ns = int(entra * SR), int(sai * SR)
    env[:ne] = np.linspace(0, 1, ne) ** 2
    env[-ns:] *= np.linspace(1, 0, ns) ** 2
    i = int(filme * SR)
    mix[i:i + len(seg)] += seg * (g * env)[:, None]


# --- Trilha ---
trecho(0.0, 60.1, 11.2, ganho=13, entra=0.6, sai=1.4)            # abertura: pulso contido
trecho(9.6, 9.7, 14.4, ganho=-9, ganho_fim=-4, entra=1.4)      # volume e silos: tensão
#   24,0 a 24,6: silêncio (corte seco)
trecho(24.6, 36.6, 6.9, ganho=1.5, entra=0.2, sai=1.0)              # subida e explosão em 26,5
trecho(30.5, 59.3, 5.63, ganho=13, entra=1.0, sai=0.04)           # o caso: pulso contido
trecho(36.1, 60.1, 16.83, ganho=13, ganho_fim=7, entra=0.04, sai=0.05)  # ...e a subida até 52,9
trecho(52.9, 38.5, 15.5, ganho=1.5, entra=0.02, sai=0.03)        # o bairro reacende: trilha inteira
#   68,4: parada seca


# --- Efeitos sintetizados ---
t_ = lambda d: np.arange(int(d * SR)) / SR
rng = np.random.default_rng(7)


def poe(filme, som, ganho=0.0, pan=0.0):
    i = int(filme * SR)
    som = som[: len(mix) - i]
    e, d = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    mix[i:i + len(som), 0] += som * db(ganho) * e * 1.414
    mix[i:i + len(som), 1] += som * db(ganho) * d * 1.414


def batida(freq=52, dur=0.9):
    t = t_(dur)
    f = freq * (1 + 1.6 * np.exp(-t * 28))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5.5)


def tique(freq=3200, dur=0.05):
    t = t_(dur)
    return (np.sin(2 * np.pi * freq * t) * 0.6 + rng.normal(0, 0.3, len(t))) * np.exp(-t * 110)


def nota(freq, dur=1.2, queda=3.0):
    t = t_(dur)
    s = sum(np.sin(2 * np.pi * freq * h * t) / h ** 1.6 for h in (1, 2, 3, 4.02))
    return s * np.exp(-t * queda) * np.minimum(1, t * 220) * 0.4


def soma(*sons):
    fora = np.zeros(max(len(x) for x in sons))
    for x in sons:
        fora[:len(x)] += x
    return fora


def eco(som, atraso=0.11, vezes=5, queda=0.5):
    fora = np.zeros(len(som) + int(atraso * SR) * vezes)
    for k in range(vezes + 1):
        j = int(atraso * SR) * k
        fora[j:j + len(som)] += som * queda ** k
    return fora


RE, FA, LA, RE2 = 293.66, 369.99, 440.0, 587.33

for s in (0.0, 1.0, 2.0):                                   # P01: batimento
    poe(s, batida(), -9)
    poe(s + 0.17, batida(46, 0.6), -14)
for k in range(37):                                         # P03: um tique por RA
    poe(6.1 + k * 0.075, tique(2400 + 40 * k), -22, pan=(k % 9 - 4) / 5)
ti = 10.2
while ti < 14.0:                                            # P04: sinais acelerando
    poe(ti, tique(3000 + rng.uniform(-600, 900)), -24, pan=rng.uniform(-0.8, 0.8))
    ti += max(0.012, 0.3 * (1 - (ti - 10.2) / 3.9) ** 1.7 + 0.012)
poe(24.45, eco(soma(tique(1700, 0.09) * 3, nota(RE2 * 2, 0.5, 9))), -7)   # P08: clique sináptico
poe(25.5, eco(soma(tique(1700, 0.09) * 3, nota(LA * 2, 0.5, 9))), -9, pan=0.3)

t = t_(1.5)                                                 # P10: zumbido que morre
zum = sum(np.sin(2 * np.pi * np.cumsum(60 * h * (1 - 0.55 * (t / 1.5) ** 2)) / SR) / h for h in (1, 2, 3, 5))
poe(31.6, zum * np.exp(-t * 1.6) * 0.35, -9)

for s, (a, b) in ((34.4, (RE2, LA * 2)), (35.75, (LA * 2, RE2 * 2))):   # P11: mensagens
    poe(s, nota(a, 0.25, 12), -15, pan=0.4)
    poe(s + 0.09, nota(b, 0.4, 9), -15, pan=0.4)
for k in range(46):                                         # P12: relatos e fusão
    poe(38.17 + rng.uniform(0, 1.85), tique(2600 + rng.uniform(0, 1400)), -23, pan=rng.uniform(-0.7, 0.2))
poe(40.93, eco(nota(RE, 1.4, 2.5)), -11, pan=-0.3)
poe(43.37, eco(nota(FA, 1.2, 2.8)), -12, pan=-0.1)          # P13: iluminação
poe(44.57, eco(nota(LA, 1.2, 2.8)), -12, pan=-0.4)          # P13: trânsito
acorde = nota(RE, 2.6, 1.3) + nota(FA, 2.6, 1.3) + nota(LA, 2.6, 1.3) + nota(RE2, 2.6, 1.5)
poe(46.0, eco(acorde, 0.14), -8, pan=-0.2)                  # P13: nasce o insight
poe(48.33, tique(1500, 0.07) * 2.5, -12, pan=0.4)           # P14: confirmar
for k, s in enumerate((49.4, 49.7, 50.0)):                  # P14: entrega aos sistemas
    poe(s, nota((RE2, LA * 2, RE2 * 2)[k], 0.35, 8), -15, pan=0.5)
for k, s in enumerate((51.0, 51.73, 52.6)):                 # P15: status
    poe(s, eco(nota((RE2, FA * 2, LA * 2)[k], 0.7, 4)), -13, pan=0.4)
for s in (57.5, 58.33, 59.17):                              # P17: um corte por filtro
    poe(s, soma(tique(900, 0.1) * 3, batida(70, 0.3)), -13)
t = t_(3.6)                                                 # P20: batida grave final
final = batida(40, 3.6) * 1.2 + rng.normal(0, 0.12, len(t)) * np.exp(-t * 9) + nota(RE / 2, 3.6, 0.9) * 0.8
poe(68.4, final, -6)

pico = np.abs(mix).max()
mix = np.tanh(mix * 0.85) / 0.85 * 0.83  # limitador suave, sem baixar o resto
with wave.open(str(RAIZ / "public/audio/mix.wav"), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype(np.int16).tobytes())
print("mix.wav", DUR, "s  pico bruto", round(float(pico), 2))

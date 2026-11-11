# Captura cenas da página com o Edge headless (precisa de `npm run preview` rodando na porta 4173).
# Uso: powershell -File scripts/capturas.ps1 [-Tema claro|escuro] [-Largura 1600] [-Altura 900]
param([string]$Tema = '', [int]$Largura = 1600, [int]$Altura = 900, [string]$Base = 'http://localhost:4173/')
$ErrorActionPreference = 'Stop'
$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
$pasta = if ($Tema) { "capturas-$Tema" } else { 'capturas' }
$saida = Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')) "out\$pasta"
if (Test-Path $saida) { Remove-Item $saida -Recurse -Force }
New-Item -ItemType Directory $saida | Out-Null
# cena e posição (0..1) dentro da cena fixa
$quadros = @(
    @('abertura', 0), @('abertura', 0.8), @('silos', 0.9), @('virada', 0.8), @('arquitetura', 0.3), @('arquitetura', 0.62), @('arquitetura', 1),
    @('inteligencia', 0.44), @('inteligencia', 0.69), @('sala', 0.85), @('gestores', 0.6),
    @('cidadao', 0.95), @('prova', 0.5), @('fim', 0.5)
)
$n = 0
foreach ($q in $quadros) {
    $n++
    $arq = Join-Path $saida ('slide-{0:D2}.png' -f $n)
    $url = "${Base}?cena=$($q[0])&p=$($q[1])"
    if ($Tema) { $url += "&tema=$Tema" }
    # o Edge escreve avisos inofensivos no stderr; não deixar o PowerShell 5 tratar como erro fatal
    $ErrorActionPreference = 'Continue'
    & $edge --headless=new --disable-gpu --hide-scrollbars --mute-audio --no-first-run "--window-size=$Largura,$Altura" --virtual-time-budget=6000 "--screenshot=$arq" $url 2>&1 | Out-Null
    $ErrorActionPreference = 'Stop'
    if (-not (Test-Path $arq)) { throw "captura falhou: $url" }
    "{0}  {1}" -f (Split-Path $arq -Leaf), $url
}

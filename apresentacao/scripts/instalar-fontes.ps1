# Instala as fontes de apresentacao/fonts só para o usuário atual (sem admin).
# Necessário para o PowerPoint renderizar as prévias com as fontes certas.
$ErrorActionPreference = 'Stop'
$origem = Join-Path $PSScriptRoot '..\fonts'
$destino = Join-Path $env:LOCALAPPDATA 'Microsoft\Windows\Fonts'
$registro = 'HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Fonts'
New-Item -ItemType Directory -Force $destino | Out-Null
if (-not (Test-Path $registro)) { New-Item -Path $registro -Force | Out-Null }
Add-Type -AssemblyName System.Drawing
foreach ($f in Get-ChildItem $origem -Filter *.ttf) {
    $alvo = Join-Path $destino $f.Name
    if (-not (Test-Path $alvo)) { Copy-Item $f.FullName $alvo }
    $col = New-Object System.Drawing.Text.PrivateFontCollection
    $col.AddFontFile($alvo)
    $nome = "$($col.Families[0].Name) $($f.BaseName.Split('-')[-1]) (TrueType)"
    Set-ItemProperty -Path $registro -Name $nome -Value $alvo
    "instalada: $($f.Name)"
}

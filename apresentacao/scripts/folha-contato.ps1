# Junta os PNGs de uma pasta de render numa grade (para revisar o deck inteiro de uma vez).
# Uso: powershell -File scripts/folha-contato.ps1 -Pasta out\CityView_Apresentacao-png [-Colunas 3]
param([Parameter(Mandatory)][string]$Pasta, [int]$Colunas = 3, [int]$Largura = 960)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$imgs = Get-ChildItem $Pasta -Filter 'slide-*.png' | Sort-Object Name
$alt = [int]($Largura * 9 / 16); $gap = 16
$linhas = [math]::Ceiling($imgs.Count / $Colunas)
$bmp = New-Object System.Drawing.Bitmap ($Colunas * ($Largura + $gap) + $gap), ($linhas * ($alt + $gap) + $gap)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = 'HighQualityBicubic'
$g.Clear([System.Drawing.Color]::FromArgb(0xD5, 0xDA, 0xE0))
$i = 0
foreach ($f in $imgs) {
    $im = [System.Drawing.Image]::FromFile($f.FullName)
    $x = $gap + ($i % $Colunas) * ($Largura + $gap); $y = $gap + [math]::Floor($i / $Colunas) * ($alt + $gap)
    $g.DrawImage($im, $x, $y, $Largura, $alt); $im.Dispose(); $i++
}
$destino = Join-Path (Split-Path $Pasta -Parent) ((Split-Path $Pasta -Leaf) + '-contato.png')
$bmp.Save($destino, [System.Drawing.Imaging.ImageFormat]::Png); $g.Dispose(); $bmp.Dispose()
"folha: $destino"

# Converte os PNGs originais da Higgsfield (imagens\*.png) em JPGs leves para o deck (imagens\deck\*.jpg).
param([int]$Largura = 2400, [long]$Qualidade = 86)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$pasta = Resolve-Path (Join-Path $PSScriptRoot '..\imagens')
$saida = Join-Path $pasta 'deck'
New-Item -ItemType Directory -Force $saida | Out-Null
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$params = New-Object System.Drawing.Imaging.EncoderParameters 1
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), $Qualidade
foreach ($f in Get-ChildItem $pasta -Filter *.png) {
    $img = [System.Drawing.Image]::FromFile($f.FullName)
    $h = [int]($img.Height * $Largura / $img.Width)
    $bmp = New-Object System.Drawing.Bitmap $Largura, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = 'HighQualityBicubic'
    $g.DrawImage($img, 0, 0, $Largura, $h)
    $destino = Join-Path $saida ($f.BaseName + '.jpg')
    $bmp.Save($destino, $codec, $params)
    $g.Dispose(); $bmp.Dispose(); $img.Dispose()
    "{0} -> {1} KB ({2}x{3})" -f $f.Name, [int]((Get-Item $destino).Length / 1KB), $Largura, $h
}

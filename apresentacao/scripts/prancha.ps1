# Monta out\comparacao.png: uma linha por amostra (A, B, C), com os 4 slides lado a lado.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$out = Join-Path (Resolve-Path (Join-Path $PSScriptRoot '..')) 'out'
$pastas = Get-ChildItem $out -Directory -Filter 'amostra-*-png' | Sort-Object Name
$tw = 800; $th = 450; $gap = 24; $rotulo = 56; $cols = 4
$W = $cols * $tw + ($cols + 1) * $gap
$H = $pastas.Count * ($th + $rotulo + $gap) + $gap
$bmp = New-Object System.Drawing.Bitmap $W, $H
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = 'HighQualityBicubic'; $g.TextRenderingHint = 'AntiAlias'
$g.Clear([System.Drawing.Color]::FromArgb(0xE9, 0xEB, 0xEE))
$fonte = New-Object System.Drawing.Font('Segoe UI Semibold', 22)
$pincel = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(0x0F, 0x2A, 0x43))
$y = $gap
foreach ($p in $pastas) {
    # rótulos com códigos de caractere: o PowerShell 5.1 lê este arquivo como ANSI
    $ponto = [char]0xB7
    $letra = $p.Name.Substring(8, 1)
    $nomes = @{
        'A' = 'Sala de Opera' + [char]0xE7 + [char]0xF5 + 'es'
        'B' = 'Institucional claro'
        'C' = 'H' + [char]0xED + 'brida'
    }
    $g.DrawString("$letra $ponto $($nomes[$letra])", $fonte, $pincel, $gap, $y + 8)
    $y += $rotulo
    $x = $gap
    foreach ($img in (Get-ChildItem $p.FullName -Filter *.png | Sort-Object Name | Select-Object -First $cols)) {
        $i = [System.Drawing.Image]::FromFile($img.FullName)
        $g.DrawImage($i, $x, $y, $tw, $th); $i.Dispose()
        $x += $tw + $gap
    }
    $y += $th + $gap
}
$destino = Join-Path $out 'comparacao.png'
$bmp.Save($destino, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()
"prancha: $destino"

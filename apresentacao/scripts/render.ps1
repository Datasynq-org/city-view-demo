# Renderiza .pptx pelo PowerPoint instalado: PNG por slide, PDF e (opcional) cópia com fontes embutidas.
# Uso: powershell -File scripts/render.ps1 [-Arquivos out\a.pptx,out\b.pptx] [-Embutir]
# Sem -Arquivos, renderiza todo .pptx em out\ que não seja cópia embutida.
param(
    [string[]]$Arquivos,
    [switch]$Embutir,
    [int]$Largura = 1920,
    [int]$Altura = 1080
)
$ErrorActionPreference = 'Stop'
$raiz = Resolve-Path (Join-Path $PSScriptRoot '..')
$out = Join-Path $raiz 'out'
if (-not $Arquivos) {
    $Arquivos = Get-ChildItem $out -Filter *.pptx | Where-Object { $_.Name -notlike '*-embutido.pptx' } | ForEach-Object FullName
}
$app = New-Object -ComObject PowerPoint.Application
try {
    foreach ($a in $Arquivos) {
        $caminho = (Resolve-Path $a).Path
        $base = [IO.Path]::GetFileNameWithoutExtension($caminho)
        $pastaPng = Join-Path $out "$base-png"
        if (Test-Path $pastaPng) { Remove-Item $pastaPng -Recurse -Force }
        New-Item -ItemType Directory $pastaPng | Out-Null
        # Open(FileName, ReadOnly, Untitled, WithWindow)
        $p = $app.Presentations.Open($caminho, -1, 0, 0)
        try {
            foreach ($s in $p.Slides) {
                $s.Export((Join-Path $pastaPng ('slide-{0:D2}.png' -f $s.SlideIndex)), 'PNG', $Largura, $Altura)
            }
            $p.SaveAs((Join-Path $out "$base.pdf"), 32)  # ppSaveAsPDF
            if ($Embutir) {
                $p.SaveAs((Join-Path $out "$base-embutido.pptx"), 24, -1)  # OpenXML, EmbedTrueTypeFonts
            }
            "ok: $base ($($p.Slides.Count) slides)"
        } finally { $p.Close() }
    }
} finally {
    $app.Quit()
    [void][Runtime.InteropServices.Marshal]::ReleaseComObject($app)
}

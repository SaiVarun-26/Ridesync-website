# Generates every icon the site needs from the official logo, without recolouring
# or stretching it. Source: screenshots/ridesync_logo.png (or the "- Copy" file).
# Usage: powershell -File scripts/make-brand-assets.ps1   (run from the project root)

Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"

$srcPath = Join-Path (Get-Location) "screenshots\ridesync_logo.png"
if (-not (Test-Path $srcPath)) { $srcPath = Join-Path (Get-Location) "screenshots\ridesync_logo - Copy.png" }
$srcPath = (Resolve-Path $srcPath).Path

New-Item public -ItemType Directory -Force | Out-Null
Copy-Item $srcPath "public\ridesync_logo.png" -Force

$src = [System.Drawing.Bitmap]::FromFile($srcPath)

# Find the artwork bounds (alpha > 16). No pixel is changed.
$rect = New-Object System.Drawing.Rectangle 0, 0, $src.Width, $src.Height
$data = $src.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$bytes = New-Object byte[] ($data.Stride * $src.Height)
[System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)
$src.UnlockBits($data)
$minX = $src.Width; $minY = $src.Height; $maxX = 0; $maxY = 0
for ($y = 0; $y -lt $src.Height; $y++) {
  $row = $y * $data.Stride
  for ($x = 0; $x -lt $src.Width; $x++) {
    if ($bytes[$row + $x * 4 + 3] -gt 16) {
      if ($x -lt $minX) { $minX = $x }
      if ($x -gt $maxX) { $maxX = $x }
      if ($y -lt $minY) { $minY = $y }
      if ($y -gt $maxY) { $maxY = $y }
    }
  }
}
$w = $maxX - $minX + 1
$h = $maxY - $minY + 1
Write-Host "artwork bounds: x $minX..$maxX, y $minY..$maxY ($w x $h) inside $($src.Width) x $($src.Height)"

# Square mark: the same pixels copied 1:1 and centred, only transparent margin added.
$S = [int][Math]::Ceiling([Math]::Max($w, $h) / 0.86)
$mark = New-Object System.Drawing.Bitmap $S, $S, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($mark)
$g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
$dx = [int](($S - $w) / 2)
$dy = [int](($S - $h) / 2)
$dest = New-Object System.Drawing.Rectangle $dx, $dy, $w, $h
$from = New-Object System.Drawing.Rectangle $minX, $minY, $w, $h
$g.DrawImage($src, $dest, $from, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$mark.Save((Join-Path (Get-Location) "public\ridesync_mark.png"), [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "mark: $S x $S"

function New-Icon([int]$size, [double]$scale, [string]$bgHex, [string]$out) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $gg = [System.Drawing.Graphics]::FromImage($bmp)
  $gg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $gg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $gg.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  if ($bgHex) { $gg.Clear([System.Drawing.ColorTranslator]::FromHtml($bgHex)) } else { $gg.Clear([System.Drawing.Color]::Transparent) }
  $d = $size * $scale
  $o = ($size - $d) / 2
  $gg.DrawImage($mark, [single]$o, [single]$o, [single]$d, [single]$d)
  $gg.Dispose()
  $bmp.Save((Join-Path (Get-Location) $out), [System.Drawing.Imaging.ImageFormat]::Png)
  return $bmp
}

$f16 = New-Icon 16 1.12 "" "public\favicon-16.png"
$f32 = New-Icon 32 1.12 "" "public\favicon-32.png"
$f48 = New-Icon 48 1.12 "" "public\favicon-48.png"
$null = New-Icon 180 0.78 "#000000" "public\apple-touch-icon.png"
$null = New-Icon 192 1.0 "" "public\icon-192.png"
$null = New-Icon 512 1.0 "" "public\icon-512.png"
$null = New-Icon 512 0.62 "#000000" "public\icon-maskable-512.png"

# favicon.ico with PNG frames (16, 32, 48)
$frames = @()
foreach ($b in @($f16, $f32, $f48)) {
  $ms = New-Object System.IO.MemoryStream
  $b.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
  $frames += , @($b.Width, $ms.ToArray())
}
$ico = New-Object System.IO.MemoryStream
$bw = New-Object System.IO.BinaryWriter $ico
$bw.Write([uint16]0); $bw.Write([uint16]1); $bw.Write([uint16]$frames.Count)
$off = 6 + 16 * $frames.Count
foreach ($fr in $frames) {
  $bw.Write([byte]$fr[0]); $bw.Write([byte]$fr[0]); $bw.Write([byte]0); $bw.Write([byte]0)
  $bw.Write([uint16]1); $bw.Write([uint16]32)
  $bw.Write([uint32]$fr[1].Length); $bw.Write([uint32]$off)
  $off += $fr[1].Length
}
foreach ($fr in $frames) { $bw.Write($fr[1]) }
[System.IO.File]::WriteAllBytes((Join-Path (Get-Location) "public\favicon.ico"), $ico.ToArray())

# Social card: black, logo centred.
$og = New-Object System.Drawing.Bitmap 1200, 630, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$go = [System.Drawing.Graphics]::FromImage($og)
$go.Clear([System.Drawing.Color]::Black)
$go.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$go.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$go.DrawImage($mark, [single]420, [single]115, [single]360, [single]360)
$go.Dispose()
$og.Save((Join-Path (Get-Location) "public\og-image.png"), [System.Drawing.Imaging.ImageFormat]::Png)

$src.Dispose()
Get-ChildItem public | ForEach-Object { "{0,-26} {1,7} KB" -f $_.Name, [int]($_.Length / 1KB) }

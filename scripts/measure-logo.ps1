# Measures the logo geometry in the official PNG and where the same logo sits in the sign-in screenshot.
Add-Type -AssemblyName System.Drawing

function Scan([string]$path, [int[]]$region) {
  $bmp = [System.Drawing.Bitmap]::FromFile((Resolve-Path $path))
  $rect = New-Object System.Drawing.Rectangle 0, 0, $bmp.Width, $bmp.Height
  $data = $bmp.LockBits($rect, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $buf = New-Object byte[] ($data.Stride * $bmp.Height)
  [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $buf, 0, $buf.Length)
  $bmp.UnlockBits($data)
  foreach ($kind in 'purple', 'white') {
    $minX = 99999; $minY = 99999; $maxX = -1; $maxY = -1; $n = 0; $sx = 0; $sy = 0
    for ($y = $region[1]; $y -lt $region[3]; $y++) {
      for ($x = $region[0]; $x -lt $region[2]; $x++) {
        $o = $y * $data.Stride + $x * 4
        $pb = $buf[$o]; $pg = $buf[$o + 1]; $pr = $buf[$o + 2]; $pa = $buf[$o + 3]
        if ($pa -lt 200) { continue }
        if ($kind -eq 'purple') { $hit = ($pb -gt 190 -and $pg -lt 110 -and $pr -gt 70 -and $pr -lt 190) }
        else { $hit = ($pr -gt 225 -and $pg -gt 225 -and $pb -gt 225) }
        if ($hit) {
          if ($x -lt $minX) { $minX = $x }
          if ($x -gt $maxX) { $maxX = $x }
          if ($y -lt $minY) { $minY = $y }
          if ($y -gt $maxY) { $maxY = $y }
          $n++; $sx += $x; $sy += $y
        }
      }
    }
    $cx = [int]($sx / [Math]::Max($n, 1)); $cy = [int]($sy / [Math]::Max($n, 1))
    "  ${kind}: x $minX..$maxX  y $minY..$maxY  n=$n  centroid ($cx, $cy)"
  }
  $bmp.Dispose()
}


"PNG centre dot (x560..760, y520..720):"; Scan 'screenshots\ridesync_logo.png' @(560, 520, 760, 720)
"PNG ball (x680..880, y170..370):"; Scan 'screenshots\ridesync_logo.png' @(680, 170, 880, 370)
"PNG ring thickness row y=640 (x 200..400):"; Scan 'screenshots\ridesync_logo.png' @(200, 640, 400, 641)
"Screenshot logo (x30..200, y560..720):"; Scan 'screenshots\google_signin.jpeg' @(30, 560, 200, 720)

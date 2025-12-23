# Download vendor JS files and update index.html to reference local copies
# Run this from the project root in PowerShell:
#   .\scripts\make-offline.ps1

$projectRoot = Get-Location
$vendorDir = Join-Path $projectRoot "vendor/js"
if (-not (Test-Path $vendorDir)) { New-Item -ItemType Directory -Path $vendorDir -Force | Out-Null }

# Candidate URLs for jscolor (try until one works)
$jscolorUrls = @(
    # try official releases first
    'https://jscolor.com/releases/2.4.5/jscolor.min.js',
    'https://jscolor.com/releases/jscolor.min.js',
    # fallback CDNs
    'https://cdn.jsdelivr.net/npm/@jscolor/picker@2.3.1/build/jscolor.min.js',
    'https://unpkg.com/@jscolor/picker@2.3.1/build/jscolor.min.js',
    'https://cdn.jsdelivr.net/npm/jscolor@2.4.5/jscolor.min.js'
)
$html2canvasUrl = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js'

$jscolorDest = Join-Path $vendorDir 'jscolor.min.js'
$html2canvasDest = Join-Path $vendorDir 'html2canvas.min.js'

# Helper to download with basic parsing
function Try-Download($url, $outPath) {
    try {
        Write-Host "Downloading $url ..."
        Invoke-WebRequest -Uri $url -OutFile $outPath -UseBasicParsing -ErrorAction Stop
        # quick sanity check: file should be non-trivial
        $fi = Get-Item $outPath -ErrorAction Stop
        if ($fi.Length -lt 2000) {
            Write-Host "Downloaded file is unexpectedly small ($($fi.Length) bytes). Treating as failure."
            Remove-Item $outPath -ErrorAction SilentlyContinue
            return $false
        }
        return $true
    } catch {
        Write-Host "Failed: $url -- $($_.Exception.Message)"
        return $false
    }
}

# Download jscolor (try fallback URLs)
$downloaded = $false
foreach ($u in $jscolorUrls) {
    if (Try-Download $u $jscolorDest) {
        # additional content check for jscolor
        try {
            $txt = Get-Content $jscolorDest -Raw -ErrorAction Stop
            if ($txt -notmatch 'jscolor') {
                Write-Host "Downloaded file from $u doesn't look like jscolor content. Trying next URL."
                Remove-Item $jscolorDest -ErrorAction SilentlyContinue
                continue
            }
        } catch {
            Write-Host "Warning: couldn't validate downloaded jscolor content: $($_.Exception.Message)"
        }
        $downloaded = $true; break
    }
}
if (-not $downloaded) {
    Write-Warning "Could not download jscolor automatically. Please download a compatible jscolor build and save it to $jscolorDest"
}

# Download html2canvas
if (-not (Try-Download $html2canvasUrl $html2canvasDest)) {
    Write-Warning "Could not download html2canvas automatically. Please download it and save to $html2canvasDest"
}

# Update index.html to reference local vendor files
$indexPath = Join-Path $projectRoot 'index.html'
if (-not (Test-Path $indexPath)) { Write-Error "index.html not found in project root" ; exit 1 }

$content = Get-Content $indexPath -Raw -ErrorAction Stop

# Replace common CDN references with local vendor paths
$content = $content -replace 'https://cdn.jsdelivr.net/npm/@jscolor/picker@2.3.1/build/jscolor.min.js', 'vendor/js/jscolor.min.js'
$content = $content -replace 'https://unpkg.com/@jscolor/picker@2.3.1/build/jscolor.min.js', 'vendor/js/jscolor.min.js'
$content = $content -replace 'https://cdn.jsdelivr.net/npm/jscolor@2.4.5/jscolor.min.js', 'vendor/js/jscolor.min.js'
$content = $content -replace 'https://html2canvas.hertzen.com/dist/html2canvas.min.js', 'vendor/js/html2canvas.min.js'

Set-Content -Path $indexPath -Value $content -Encoding UTF8
Write-Host "Updated index.html to reference local vendor files (vendor/js/)."

Write-Host "Finished. If downloads failed, manually place the files in vendor/js and re-run this script or edit index.html to point to them."
"Open index.html in your browser or run a local server: 'python -m http.server 8000' and visit http://localhost:8000"
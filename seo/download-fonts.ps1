$fontDir = Join-Path (Get-Location) 'dist/assets/fonts'
New-Item -ItemType Directory -Force -Path $fontDir | Out-Null
$fontCss = Get-Content -Raw 'seo/fonts-google.css'
$blocks = [regex]::Matches($fontCss, '/\* latin \*/\s*(@font-face\s*\{[^}]+\})')
$localCss = ''
foreach ($block in $blocks) {
    $face = $block.Groups[1].Value
    $family = if ($face.Contains('Barlow')) { 'barlow-condensed' } else { 'dm-sans' }
    $weight = [regex]::Match($face, 'font-weight: ([^;]+)').Groups[1].Value.Replace(' ', '-')
    $url = [regex]::Match($face, 'url\(([^)]+)\)').Groups[1].Value
    $name = "$family-$weight.woff2"
    Invoke-WebRequest -Uri $url -OutFile (Join-Path $fontDir $name)
    $localCss += $face.Replace($url, "/assets/fonts/$name") + "`n"
}
Set-Content -Path 'src/fonts.css' -Value $localCss -Encoding utf8
Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/google/fonts/main/ofl/barlowcondensed/OFL.txt' -OutFile (Join-Path $fontDir 'BARLOW-OFL.txt')
Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/google/fonts/main/ofl/dmsans/OFL.txt' -OutFile (Join-Path $fontDir 'DM-SANS-OFL.txt')
Get-ChildItem $fontDir | Select-Object Name, Length

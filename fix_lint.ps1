$files = @(
    "c:\Users\nnm\Documents\Antigravity\photosplit\css\style.css",
    "c:\Users\nnm\Documents\Antigravity\photosplit\css\secondary.css"
)

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
    
    # Remove existing -webkit-backdrop-filter to avoid duplicates
    $content = $content -replace '-webkit-backdrop-filter:[^;]+;\s*', ''
    
    # Add -webkit-backdrop-filter before backdrop-filter
    $content = [regex]::Replace($content, '(backdrop-filter:\s*[^;]+;)', '-webkit-$1 $1')
    
    # Fix rx: 3;
    $content = $content -replace 'rx:\s*3;', '/* rx: 3; */'

    [System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
}

# Fix inline styles in HTML
$appHtml = "c:\Users\nnm\Documents\Antigravity\photosplit\app.html"
$appContent = [System.IO.File]::ReadAllText($appHtml, [System.Text.Encoding]::UTF8)
$appContent = $appContent -replace '<div class="ad-wrap" style="max-width:960px;margin:32px auto 0;padding:0 24px;">', '<div class="ad-wrap ad-app-wrapper">'
[System.IO.File]::WriteAllText($appHtml, $appContent, [System.Text.Encoding]::UTF8)

$contactHtml = "c:\Users\nnm\Documents\Antigravity\photosplit\contact.html"
$contactContent = [System.IO.File]::ReadAllText($contactHtml, [System.Text.Encoding]::UTF8)
$contactContent = $contactContent -replace '<div class="ad-wrap" style="max-width:860px;margin:24px auto 0;padding:0 24px;">', '<div class="ad-wrap ad-contact-wrapper">'
[System.IO.File]::WriteAllText($contactHtml, $contactContent, [System.Text.Encoding]::UTF8)

Write-Host "Fixes applied."

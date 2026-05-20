param (
    [Parameter(Position = 0)]
    [string]$Version
)

$ErrorActionPreference = "Stop"

# 1. Status pruefen
$status = git status --porcelain
$hasChanges = $null -ne $status -and $status.Trim() -ne ""

# 2. Falls Aenderungen vorhanden sind, committen
if ($hasChanges) {
    Write-Host "Aenderungen gefunden. Staging laeuft..." -ForegroundColor Cyan
    git add .

    # Nach Commit-Nachricht fragen
    $commitMsg = Read-Host "Bitte eine Commit-Nachricht eingeben (Standard: 'chore: update changes')"
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "chore: update changes"
    }

    Write-Host "Commit wird erstellt: '$commitMsg'..." -ForegroundColor Cyan
    git commit -m $commitMsg
}
else {
    Write-Host "Keine lokalen Aenderungen zum Committen vorhanden." -ForegroundColor Yellow
}

# 3. Version erstellen oder nur pushen
if (-not [string]::IsNullOrEmpty($Version)) {
    # Bereinige Versionsnummer von Anfuehrungszeichen falls vorhanden (unter Verwendung von char-Codes zur Vermeidung von Parser-Problemen)
    $Version = $Version.Replace([char]34, "").Replace([char]39, "").Trim()
    
    Write-Host "Erstelle Version $Version..." -ForegroundColor Cyan
    npm version $Version

    Write-Host "Pushe main Branch und Tags zu origin..." -ForegroundColor Cyan
    git push origin main
    git push origin --tags
}
else {
    Write-Host "Keine Versionsnummer uebergeben. Pushe Aenderungen auf main zu origin..." -ForegroundColor Cyan
    git push origin main
}

Write-Host "Erfolgreich abgeschlossen!" -ForegroundColor Green
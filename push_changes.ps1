param (
    [Parameter(Position=0)]
    [string]$Version
)

$ErrorActionPreference = "Stop"

# 1. Check git status
$status = git status --porcelain
$hasChanges = $null -ne $status -and $status.Trim() -ne ""

# 2. If changes exist, commit them
if ($hasChanges) {
    Write-Host "Changes found. Staging files..." -ForegroundColor Cyan
    git add .

    # Ask for commit message
    $commitMsg = Read-Host "Enter commit message (Default: 'chore: update changes')"
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "chore: update changes"
    }

    Write-Host "Creating commit: '$commitMsg'..." -ForegroundColor Cyan
    git commit -m $commitMsg
} else {
    Write-Host "No local changes to commit." -ForegroundColor Yellow
}

# 3. Create version or just push
if (-not [string]::IsNullOrEmpty($Version)) {
    # Clean version string from quotes using char codes
    $Version = $Version.Replace([char]34, "").Replace([char]39, "").Trim()
    
    Write-Host "Creating version $Version..." -ForegroundColor Cyan
    npm version $Version

    Write-Host "Pushing main branch and tags to origin..." -ForegroundColor Cyan
    git push origin main
    git push origin --tags
} else {
    Write-Host "No version provided. Pushing changes on main to origin..." -ForegroundColor Cyan
    git push origin main
}

Write-Host "Completed successfully!" -ForegroundColor Green

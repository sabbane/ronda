param (
    [Parameter(Position=0)]
    [string]$Version
)

$ErrorActionPreference = "Stop"

# 1. Check git status
$status = git status --porcelain
$hasChanges = $null -ne $status -and $status.Trim() -ne ""

# 2. If changes exist, commit them on main
if ($hasChanges) {
    Write-Host "Changes found. Staging files..." -ForegroundColor Cyan
    git add .

    # Ask for commit message
    $commitMsg = Read-Host "Enter commit message (Default: 'chore: update changes')"
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "chore: update changes"
    }

    Write-Host "Creating commit on main: '$commitMsg'..." -ForegroundColor Cyan
    git commit -m $commitMsg
} else {
    Write-Host "No local changes to commit." -ForegroundColor Yellow
}

# 3. Create version, create branch, push, and return to main
if (-not [string]::IsNullOrEmpty($Version)) {
    # Clean version string from quotes using string-casted char codes
    $Version = $Version.Replace([string][char]34, "").Replace([string][char]39, "").Trim()
    
    Write-Host "Creating version $Version on main..." -ForegroundColor Cyan
    npm version $Version

    Write-Host "Pushing main branch and tags to origin..." -ForegroundColor Cyan
    git push origin main
    git push origin --tags

    # Create and push the version branch
    $branchName = "v$Version"
    Write-Host "Creating and switching to version branch: $branchName..." -ForegroundColor Cyan
    git checkout -b $branchName

    Write-Host "Pushing version branch $branchName to origin..." -ForegroundColor Cyan
    git push origin $branchName

    # Return to main
    Write-Host "Returning to main branch..." -ForegroundColor Cyan
    git checkout main
} else {
    Write-Host "No version provided. Pushing main to origin..." -ForegroundColor Cyan
    git push origin main
}

Write-Host "Completed successfully!" -ForegroundColor Green

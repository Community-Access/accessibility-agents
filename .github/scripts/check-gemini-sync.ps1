# check-gemini-sync.ps1
# Compares .github/skills vs .gemini/extensions/a11y-agents/skills by SHA256 hash.
# Reports files that are out of sync, missing in Gemini, or missing a canonical source comment.
#
# Usage: pwsh scripts/check-gemini-sync.ps1
#        Add -Fix to copy out-of-sync .github/skills content over the Gemini counterpart.

param(
    [switch]$Fix
)

$root = Split-Path $PSScriptRoot -Parent
$githubBase = Join-Path $root ".github\skills"
$geminiBase = Join-Path $root ".gemini\extensions\a11y-agents\skills"

$outOfSync = @()
$missingInGemini = @()
$missingComment = @()

$githubSkills = Get-ChildItem $githubBase -Directory | Sort-Object Name

foreach ($skill in $githubSkills) {
    $githubPath = Join-Path $githubBase "$($skill.Name)\SKILL.md"
    $geminiPath = Join-Path $geminiBase "$($skill.Name)\SKILL.md"

    if (-not (Test-Path $githubPath)) { continue }

    if (-not (Test-Path $geminiPath)) {
        $missingInGemini += $skill.Name
        continue
    }

    $hash1 = (Get-FileHash $githubPath -Algorithm SHA256).Hash
    $hash2 = (Get-FileHash $geminiPath -Algorithm SHA256).Hash

    if ($hash1 -ne $hash2) {
        $outOfSync += $skill.Name
        if ($Fix) {
            $content = Get-Content $githubPath -Raw
            $comment = "<!-- CANONICAL SOURCE: .github/skills/$($skill.Name)/SKILL.md -- Edit the canonical source; sync to Gemini via scripts/check-gemini-sync.ps1 -->"
            if ($content -notmatch 'CANONICAL SOURCE') {
                $content = $content -replace '^(---\r?\n[\s\S]*?\r?\n---\r?\n)', "`$1$comment`n"
            }
            [System.IO.File]::WriteAllText($geminiPath, $content, [System.Text.Encoding]::UTF8)
            Write-Host "FIXED: $($skill.Name)"
        }
    }

    $geminiContent = Get-Content $geminiPath -Raw
    if ($geminiContent -notmatch 'CANONICAL SOURCE') {
        $missingComment += $skill.Name
    }
}

if ($outOfSync.Count -eq 0 -and $missingInGemini.Count -eq 0 -and $missingComment.Count -eq 0) {
    Write-Host "All Gemini skills are in sync." -ForegroundColor Green
    exit 0
}

if ($outOfSync.Count -gt 0) {
    Write-Host "`nOUT OF SYNC ($($outOfSync.Count)):" -ForegroundColor Yellow
    $outOfSync | ForEach-Object { Write-Host "  $_" }
}

if ($missingInGemini.Count -gt 0) {
    Write-Host "`nMISSING IN GEMINI ($($missingInGemini.Count)):" -ForegroundColor Red
    $missingInGemini | ForEach-Object { Write-Host "  $_" }
}

if ($missingComment.Count -gt 0) {
    Write-Host "`nMISSING SYNC COMMENT ($($missingComment.Count)):" -ForegroundColor Cyan
    $missingComment | ForEach-Object { Write-Host "  $_" }
}

if (-not $Fix -and $outOfSync.Count -gt 0) {
    Write-Host "`nRun with -Fix to copy canonical .github/skills content to Gemini." -ForegroundColor Gray
}

exit ($outOfSync.Count + $missingInGemini.Count)

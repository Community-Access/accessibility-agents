# A11y Agent Team - Update Script (Windows PowerShell)
# Built by Taylor Arndt - https://github.com/taylorarndt
#
# Checks for updates from GitHub and installs them.
# Can be run manually or automatically via Scheduled Task.
#
# Usage:
#   powershell -File update.ps1              Update global install
#   powershell -File update.ps1 -Project     Update project install
#   powershell -File update.ps1 -Silent      Suppress output (for scheduled runs)

param(
    [switch]$Project,
    [switch]$Silent,
    [switch]$Check,
    [switch]$DryRun,
    [switch]$VsCodeStable,
    [switch]$VsCodeInsiders,
    [switch]$VsCodeBoth,
    [Alias('summary')]
    [string]$SummaryPath
)

$ErrorActionPreference = "Stop"
$ScriptDir = if ($MyInvocation.MyCommand.Path) { Split-Path -Parent $MyInvocation.MyCommand.Path } else { (Get-Location).Path }
. (Join-Path $ScriptDir 'scripts\Installer.Common.ps1')

$RepoUrl = "https://github.com/Community-Access/accessibility-agents.git"
$CacheDir = Join-Path $env:USERPROFILE ".claude\.a11y-agent-team-repo"
$VersionFile = Join-Path $env:USERPROFILE ".claude\.a11y-agent-team-version"
$LogFile = Join-Path $env:USERPROFILE ".claude\.a11y-agent-team-update.log"

# Agents are auto-detected from the cached repo after clone/pull

function Write-Log {
    param([string]$Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $Entry = "[$Timestamp] $Message"
    Add-Content -Path $LogFile -Value $Entry
    if (-not $Silent) {
        Write-Host "  $Message"
    }
}

function Write-UpdateSummaryFile {
    param([string]$Path, [hashtable]$Data)
    Write-A11ySummaryFile -Path $Path -Data $Data
}

if ($Project) {
    $InstallDir = Join-Path (Get-Location) ".claude"
}
else {
    $InstallDir = Join-Path $env:USERPROFILE ".claude"
}

$VsCodeProfileMode = Get-RequestedProfileMode -Stable:$VsCodeStable -Insiders:$VsCodeInsiders -Both:$VsCodeBoth
$DetectedVsCodeProfiles = @(Get-VSCodeProfiles)
$SelectedVsCodeProfiles = @(Select-VSCodeProfiles -Profiles $DetectedVsCodeProfiles -Mode $VsCodeProfileMode)
if (-not $SummaryPath) {
    $SummaryName = if ($DryRun -or $Check) { '.a11y-agent-team-update-plan.json' } else { '.a11y-agent-team-update-summary.json' }
    $SummaryRoot = if ($Project) { (Get-Location).Path } else { $env:USERPROFILE }
    $SummaryPath = Join-Path $SummaryRoot $SummaryName
}

$OperationRoot = if ($Project) { (Get-Location).Path } else { $env:USERPROFILE }
$BackupMetadataPath = Initialize-A11yOperationState -Operation 'update' -Root $OperationRoot -SummaryPath $SummaryPath -DryRun $DryRun -CheckMode $Check -CandidatePaths @($InstallDir, $VersionFile, $CacheDir)

$UpdateSummary = [ordered]@{
    schemaVersion = '1.0'
    timestampUtc = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
    operation = 'update'
    dryRun = [bool]$DryRun
    check = [bool]$Check
    scope = if ($Project) { 'project' } else { 'global' }
    installDir = $InstallDir
    vscodeProfileMode = $VsCodeProfileMode
    requestedOptions = [ordered]@{
        silent = [bool]$Silent
        vscodeProfileMode = $VsCodeProfileMode
    }
    selectedVsCodeProfiles = @($SelectedVsCodeProfiles | ForEach-Object { $_.Path })
    backupMetadataPath = $BackupMetadataPath
    notes = @()
}

if ($Check) {
    $UpdateSummary.notes += 'Check mode only. No files were changed.'
    Write-Host "  Check mode only. No files will be changed."
    Write-Host "  Target install directory: $InstallDir"
    Write-Host "  Backup metadata: $BackupMetadataPath"
    Write-UpdateSummaryFile -Path $SummaryPath -Data $UpdateSummary
    Write-Host "  Summary written to $SummaryPath"
    exit 0
}

if ($DryRun) {
    Write-Host "  Dry run only. No files will be changed."
    Write-Host "  Target install directory: $InstallDir"
    if (-not $Project) {
        if ($SelectedVsCodeProfiles.Count -gt 0) {
            foreach ($Profile in $SelectedVsCodeProfiles) {
                Write-Host "  Would update VS Code profile: $($Profile.Path)"
            }
        }
        else {
            Write-Host "  No matching VS Code profiles detected for the requested filter."
        }
    }
    Write-UpdateSummaryFile -Path $SummaryPath -Data $UpdateSummary
    Write-Host "  Summary written to $SummaryPath"
    exit 0
}

# Check for git
try {
    git --version | Out-Null
}
catch {
    Write-Log "Error: git is not installed. Cannot check for updates."
    exit 1
}

# Clone or pull the repo
$GitDir = Join-Path $CacheDir ".git"
if (Test-Path $GitDir) {
    Set-Location $CacheDir
    git fetch origin main --quiet 2>&1 | Out-Null
    $LocalHash = git rev-parse HEAD 2>$null
    $RemoteHash = git rev-parse origin/main 2>$null

    if ($LocalHash -eq $RemoteHash) {
        Write-Log "Already up to date."
        exit 0
    }

    git reset --hard origin/main --quiet 2>&1 | Out-Null
    Write-Log "Pulled latest changes."
}
else {
    Write-Log "Downloading a11y-agent-team..."
    $ParentDir = Split-Path $CacheDir -Parent
    New-Item -ItemType Directory -Force -Path $ParentDir | Out-Null
    git clone --quiet $RepoUrl $CacheDir 2>&1 | Out-Null
    Write-Log "Repository cloned."
}

Set-Location $CacheDir
$NewHash = git rev-parse --short HEAD 2>$null

# ---------------------------------------------------------------------------
# Merge-ConfigFile: update our marked section; never overwrites user content
# ---------------------------------------------------------------------------
function Merge-ConfigFile {
    param([string]$SrcFile, [string]$DstFile, [string]$Label)
    $start = "<!-- a11y-agent-team: start -->"
    $end = "<!-- a11y-agent-team: end -->"
    $body = ([IO.File]::ReadAllText($SrcFile, [Text.Encoding]::UTF8)).TrimEnd()
    $block = "$start`n$body`n$end"
    if (-not (Test-Path $DstFile)) {
        [IO.File]::WriteAllText($DstFile, "$block`n", [Text.Encoding]::UTF8)
        Write-Log "Created: $Label"
        $script:Updated++
        return
    }
    $existing = [IO.File]::ReadAllText($DstFile, [Text.Encoding]::UTF8)
    if ($existing -match [regex]::Escape($start)) {
        $pattern = "(?s)" + [regex]::Escape($start) + ".*?" + [regex]::Escape($end)
        $updated = [regex]::Replace($existing, $pattern, $block)
        if ($updated -ne $existing) {
            [IO.File]::WriteAllText($DstFile, $updated, [Text.Encoding]::UTF8)
            Write-Log "Updated section: $Label"
            $script:Updated++
        }
    }
    else {
        [IO.File]::WriteAllText($DstFile, $existing.TrimEnd() + "`n`n$block`n", [Text.Encoding]::UTF8)
        Write-Log "Merged section: $Label"
        $script:Updated++
    }
}

# Load manifest — only update files we installed; never touch user-created files
$ManifestPath = Join-Path $InstallDir ".a11y-agent-manifest"
$Manifest = @{}
if (Test-Path $ManifestPath) {
    [IO.File]::ReadAllLines($ManifestPath, [Text.Encoding]::UTF8) | ForEach-Object { $Manifest[$_] = $true }
}
# If local manifest is empty (lost/new install), seed it from the repo-level manifest
# generated by CI so we know which agents are official vs user-created.
if ($Manifest.Count -eq 0) {
    $RepoManifest = Join-Path $CacheDir ".a11y-agent-manifest"
    if (Test-Path $RepoManifest) {
        [IO.File]::ReadAllLines($RepoManifest, [Text.Encoding]::UTF8) | ForEach-Object {
            $line = $_.Trim()
            if ($line -ne '') { $Manifest[$line] = $true }
        }
        Write-Log "Seeded local manifest from repo ($($Manifest.Count) entries)."
    }
}

# Auto-detect and update agents — only update files we installed (in manifest)
# Never delete files: they might be user-created agents
$Updated = 0
$AgentsSrcDir = Join-Path $CacheDir ".claude\agents"
if (Test-Path $AgentsSrcDir) {
    foreach ($File in Get-ChildItem -Path $AgentsSrcDir -Filter "*.md") {
        $Dst = Join-Path $InstallDir "agents\$($File.Name)"
        $manifestKey = "agents/$($File.Name)"
        # Only update if: file is in our manifest OR doesn't exist yet (new agent)
        if (-not (Test-Path $Dst)) {
            Copy-Item -Path $File.FullName -Destination $Dst
            $Manifest[$manifestKey] = $true   # track for future updates
            Write-Log "Added (new): $($File.BaseName)"
            $Updated++
        }
        elseif ($Manifest.ContainsKey($manifestKey)) {
            $SrcContent = Get-Content $File.FullName -Raw -ErrorAction SilentlyContinue
            $DstContent = Get-Content $Dst -Raw -ErrorAction SilentlyContinue
            if ($SrcContent -ne $DstContent) {
                Copy-Item -Path $File.FullName -Destination $Dst -Force
                Write-Log "Updated: $($File.BaseName)"
                $Updated++
            }
        }
        # Files not in manifest and already present are skipped (user files)
    }
}
# Save manifest — new agents contributed to the repo are tracked for future updates
[IO.File]::WriteAllLines($ManifestPath, ($Manifest.Keys | Sort-Object), [Text.Encoding]::UTF8)

# Helper: recursively sync a source directory to a destination directory.
# Updates changed files and adds new files.
# Does NOT remove files: they might be user-created files in the same directory.
function Sync-GitHubDir {
    param([string]$SrcDir, [string]$DstDir, [string]$Label)
    if (-not (Test-Path $SrcDir)) { return }
    if (-not (Test-Path $DstDir)) { return }  # only sync if previously installed
    foreach ($File in Get-ChildItem -Recurse -File $SrcDir) {
        $Rel = $File.FullName.Substring($SrcDir.Length).TrimStart('\')
        $Dst = Join-Path $DstDir $Rel
        New-Item -ItemType Directory -Force -Path (Split-Path $Dst) | Out-Null
        $SrcContent = Get-Content $File.FullName -Raw -ErrorAction SilentlyContinue
        $DstContent = Get-Content $Dst -Raw -ErrorAction SilentlyContinue
        if ($SrcContent -ne $DstContent) {
            Copy-Item -Path $File.FullName -Destination $Dst -Force
            Write-Log "Updated $Label\$Rel"
            $script:Updated++
        }
    }
}

# ---------------------------------------------------------------------------
# Migrate-Prompts: rename old prompt filenames to new agent-matching names.
# This ensures users upgrading from v2.x to v3.0 don't lose custom prompts.
# Migration: old naming (task-based) -> new naming (agent-based)
# ---------------------------------------------------------------------------
function Migrate-Prompts {
    param([string]$SrcDir)
    if (-not (Test-Path $SrcDir)) { return }
    
    $migrations = @{
        "a11y-update.prompt.md" = "insiders-a11y-tracker.prompt.md"
        "audit-desktop-a11y.prompt.md" = "desktop-a11y-specialist.prompt.md"
        "audit-markdown.prompt.md" = "markdown-a11y-assistant.prompt.md"
        "audit-web-page.prompt.md" = "web-accessibility-wizard.prompt.md"
        "export-document-csv.prompt.md" = "document-csv-reporter.prompt.md"
        "export-markdown-csv.prompt.md" = "markdown-csv-reporter.prompt.md"
        "export-web-csv.prompt.md" = "web-csv-reporter.prompt.md"
        "package-python-app.prompt.md" = "python-specialist.prompt.md"
        "review-text-quality.prompt.md" = "text-quality-reviewer.prompt.md"
        "scaffold-nvda-addon.prompt.md" = "nvda-addon-specialist.prompt.md"
        "scaffold-wxpython-app.prompt.md" = "wxpython-specialist.prompt.md"
        "test-desktop-a11y.prompt.md" = "desktop-a11y-testing-coach.prompt.md"
    }
    
    foreach ($oldName in $migrations.Keys) {
        $newName = $migrations[$oldName]
        $oldFile = Join-Path $SrcDir $oldName
        $newFile = Join-Path $SrcDir $newName
        
        if ((Test-Path $oldFile) -and -not (Test-Path $newFile)) {
            Rename-Item -Path $oldFile -NewName $newName -ErrorAction SilentlyContinue
        }
        elseif ((Test-Path $oldFile) -and (Test-Path $newFile)) {
            # Both exist; remove old version and keep new
            Remove-Item -Path $oldFile -Force -ErrorAction SilentlyContinue
        }
    }
}

$GitHubSrc = Join-Path $CacheDir ".github"

# Update Copilot assets for project install
if ($Project) {
    $ProjectRoot = (Get-Location).Path
    $ProjectGitHub = Join-Path $ProjectRoot ".github"
    if (Test-Path $ProjectGitHub) {
        # Agents (all files: *.agent.md + AGENTS.md, shared-instructions.md, etc.)
        Sync-GitHubDir -SrcDir (Join-Path $GitHubSrc "agents") -DstDir (Join-Path $ProjectGitHub "agents") -Label "agents"
        # Config files — merged to preserve user content above/below our section
        foreach ($Config in @("copilot-instructions.md", "copilot-review-instructions.md", "copilot-commit-message-instructions.md")) {
            $Src = Join-Path $GitHubSrc $Config
            $Dst = Join-Path $ProjectGitHub $Config
            if (Test-Path $Src) {
                Merge-ConfigFile -SrcFile $Src -DstFile $Dst -Label "Copilot config: $Config"
            }
        }
        # Asset subdirs: skills, instructions, prompts
        foreach ($SubDir in @("skills", "instructions", "prompts")) {
            if ($SubDir -eq "prompts") {
                Migrate-Prompts -SrcDir (Join-Path $GitHubSrc "prompts")
            }
            Sync-GitHubDir -SrcDir (Join-Path $GitHubSrc $SubDir) -DstDir (Join-Path $ProjectGitHub $SubDir) -Label $SubDir
        }
    }
}

# Update Copilot assets for global install
if (-not $Project) {
    $CentralRoot = Join-Path $env:USERPROFILE ".a11y-agent-team"
    $Central = Join-Path $CentralRoot "copilot-agents"
    $CentralPrompts = Join-Path $CentralRoot "copilot-prompts"
    $CentralInstructions = Join-Path $CentralRoot "copilot-instructions-files"
    $CentralSkills = Join-Path $CentralRoot "copilot-skills"

    # Update central stores (agents, prompts, instructions, skills)
    if (Test-Path $Central) {
        foreach ($File in Get-ChildItem -Path (Join-Path $GitHubSrc "agents") -Filter "*.agent.md" -ErrorAction SilentlyContinue) {
            $Dst = Join-Path $Central $File.Name
            $SrcContent = Get-Content $File.FullName -Raw -ErrorAction SilentlyContinue
            $DstContent = Get-Content $Dst -Raw -ErrorAction SilentlyContinue
            if ($SrcContent -ne $DstContent) {
                Copy-Item -Path $File.FullName -Destination $Dst -Force
                Write-Log "Updated central agent: $($File.BaseName)"
                $Updated++
            }
        }
    }
    if (Test-Path $CentralPrompts) { 
        Migrate-Prompts -SrcDir (Join-Path $GitHubSrc "prompts")
        Sync-GitHubDir -SrcDir (Join-Path $GitHubSrc "prompts") -DstDir $CentralPrompts -Label "central-prompts" 
    }
    if (Test-Path $CentralInstructions) { Sync-GitHubDir -SrcDir (Join-Path $GitHubSrc "instructions") -DstDir $CentralInstructions -Label "central-instructions" }
    if (Test-Path $CentralSkills) { Sync-GitHubDir -SrcDir (Join-Path $GitHubSrc "skills")       -DstDir $CentralSkills       -Label "central-skills" }
    # Update config files in central store — merged to preserve user content
    foreach ($Config in @("copilot-instructions.md", "copilot-review-instructions.md", "copilot-commit-message-instructions.md")) {
        $Src = Join-Path $GitHubSrc $Config
        $Dst = Join-Path $CentralRoot $Config
        if (Test-Path $Src) {
            Merge-ConfigFile -SrcFile $Src -DstFile $Dst -Label "Copilot config: $Config"
        }
    }

    # Push agents, prompts, and instructions to VS Code User/prompts/ only.
    # Previous versions also wrote to User/ root, causing duplicates in the
    # agent list. This update cleans up those stale root copies automatically.
    foreach ($Profile in $SelectedVsCodeProfiles) {
        $ProfileDir = $Profile.Path
        $PromptsDir = Join-Path $ProfileDir "prompts"
        # Only update if agents were previously installed
        $HasAgents = (Get-ChildItem -Path $ProfileDir -Filter "*.agent.md" -ErrorAction SilentlyContinue).Count -gt 0
        $HasPrompts = (Test-Path $PromptsDir) -and ((Get-ChildItem -Path $PromptsDir -Filter "*.agent.md" -ErrorAction SilentlyContinue).Count -gt 0)
        if (-not ($HasAgents -or $HasPrompts)) { continue }
        New-Item -ItemType Directory -Force -Path $PromptsDir | Out-Null

        # Collect all files we manage
        $AllFiles = @()
        $AllFiles += @(Get-ChildItem -Path $Central -Filter "*.agent.md" -ErrorAction SilentlyContinue)
        $AllFiles += @(Get-ChildItem -Path $CentralPrompts -Filter "*.prompt.md" -ErrorAction SilentlyContinue)
        $AllFiles += @(Get-ChildItem -Path $CentralInstructions -Filter "*.instructions.md" -ErrorAction SilentlyContinue)

        # Copy to User/prompts/ only (the correct location)
        foreach ($File in $AllFiles) {
            if ($File) {
                Copy-Item -Path $File.FullName -Destination (Join-Path $PromptsDir $File.Name) -Force
            }
        }

        # Migration: remove duplicates from User/ root left by earlier versions
        $Cleaned = 0
        foreach ($File in $AllFiles) {
            if ($File) {
                $RootCopy = Join-Path $ProfileDir $File.Name
                if (Test-Path $RootCopy) {
                    Remove-Item $RootCopy -Force
                    $Cleaned++
                }
            }
        }
        if ($Cleaned -gt 0) {
            Write-Log "Cleaned $Cleaned duplicate(s) from $ProfileDir (migration from earlier install)"
        }

        Write-Log "Updated VS Code profile: $ProfileDir"
    }
}

# Update enforcement hooks (global install only)
if (-not $Project) {
    $HooksDir = Join-Path $env:USERPROFILE ".claude\hooks"
    $HookSrcDir = Join-Path $CacheDir "claude-code-plugin\scripts"
    if ((Test-Path $HooksDir) -and (Test-Path $HookSrcDir)) {
        foreach ($Hook in @("a11y-team-eval.sh", "a11y-enforce-edit.sh", "a11y-mark-reviewed.sh")) {
            $Src = Join-Path $HookSrcDir $Hook
            $Dst = Join-Path $HooksDir $Hook
            if (Test-Path $Src) {
                if (-not (Test-Path $Dst)) {
                    Copy-Item -Path $Src -Destination $Dst -Force
                    Write-Log "Added hook (new): $Hook"
                    $Updated++
                }
                else {
                    $SrcContent = Get-Content $Src -Raw -ErrorAction SilentlyContinue
                    $DstContent = Get-Content $Dst -Raw -ErrorAction SilentlyContinue
                    if ($SrcContent -ne $DstContent) {
                        Copy-Item -Path $Src -Destination $Dst -Force
                        Write-Log "Updated hook: $Hook"
                        $Updated++
                    }
                }
            }
        }
    }
}

# ---------------------------------------------------------------------------
# Update MCP server installation and dependencies (if present)
# ---------------------------------------------------------------------------
$McpSrcDir = Join-Path $CacheDir "mcp-server"
$McpDestDir = if ($Project) {
    Join-Path (Get-Location) "mcp-server"
}
else {
    Join-Path $env:USERPROFILE ".a11y-agent-team\mcp-server"
}

if ((Test-Path $McpSrcDir) -and (Test-Path $McpDestDir)) {
    $McpCopyMethod = Copy-A11yDirectoryTree -SourceDir $McpSrcDir -DestinationDir $McpDestDir -PreferRobocopy
    Write-Log "Updated MCP server files via $McpCopyMethod"
    $Updated++

    $McpPkg = Join-Path $McpDestDir "package.json"
    if ((Test-Path $McpPkg) -and (Get-Command node -ErrorAction SilentlyContinue) -and (Get-Command npm -ErrorAction SilentlyContinue)) {
        try {
            Push-Location $McpDestDir
            npm install --omit=dev --silent 2>$null | Out-Null
            Pop-Location
            Write-Log "MCP server dependencies updated"
        }
        catch {
            Pop-Location -ErrorAction SilentlyContinue
            Write-Log "MCP server dependency install failed (non-fatal)"
        }
    }
}

# Save version
$NewHash | Out-File -FilePath $VersionFile -Encoding utf8 -NoNewline

if ($Updated -gt 0) {
    Write-Log "Update complete ($Updated files updated, version $NewHash)."
}
else {
    Write-Log "Files already match latest version ($NewHash)."
}

$UpdateSummary.updatedFiles = $Updated
$UpdateSummary.version = $NewHash
$UpdateSummary.logFile = $LogFile
Write-UpdateSummaryFile -Path $SummaryPath -Data $UpdateSummary
Write-Log "Summary written to $SummaryPath"

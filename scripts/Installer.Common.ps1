# Shared helper functions for install/update/uninstall PowerShell scripts.

function Test-InteractivePrompting {
    try {
        return [Environment]::UserInteractive -and -not [Console]::IsInputRedirected
    }
    catch {
        return $true
    }
}

function Get-RequestedProfileMode {
    param(
        [switch]$Stable,
        [switch]$Insiders,
        [switch]$Both
    )

    $Selected = @($Stable.IsPresent, $Insiders.IsPresent, $Both.IsPresent) | Where-Object { $_ }
    if ($Selected.Count -gt 1) {
        throw "Choose only one VS Code profile targeting flag."
    }

    if ($Both) { return 'both' }
    if ($Stable) { return 'stable' }
    if ($Insiders) { return 'insiders' }
    return 'auto'
}

function Get-VSCodeProfiles {
    $Profiles = @(
        [PSCustomObject]@{ Key = 'stable'; Name = 'VS Code'; Path = Join-Path $env:APPDATA 'Code\User' },
        [PSCustomObject]@{ Key = 'insiders'; Name = 'VS Code Insiders'; Path = Join-Path $env:APPDATA 'Code - Insiders\User' }
    )
    foreach ($Profile in $Profiles) {
        $Profile | Add-Member -NotePropertyName Exists -NotePropertyValue (Test-Path $Profile.Path)
    }
    return $Profiles
}

function Select-VSCodeProfiles {
    param(
        [object[]]$Profiles,
        [string]$Mode = 'auto',
        [switch]$OnlyExisting
    )

    $Selected = switch ($Mode) {
        'stable' { @($Profiles | Where-Object { $_.Key -eq 'stable' }) }
        'insiders' { @($Profiles | Where-Object { $_.Key -eq 'insiders' }) }
        'both' { @($Profiles | Where-Object { $_.Key -in @('stable', 'insiders') }) }
        default { @($Profiles | Where-Object { $_.Exists }) }
    }

    if ($OnlyExisting) {
        $Selected = @($Selected | Where-Object { $_.Exists })
    }

    return $Selected
}

function Write-A11ySummaryFile {
    param(
        [string]$Path,
        [hashtable]$Data
    )

    $SummaryDir = Split-Path -Parent $Path
    if ($SummaryDir -and -not (Test-Path $SummaryDir)) {
        New-Item -ItemType Directory -Force -Path $SummaryDir | Out-Null
    }

    $Data | ConvertTo-Json -Depth 10 | Set-Content -Path $Path -Encoding UTF8
}

function Copy-A11yDirectoryTree {
    param(
        [string]$SourceDir,
        [string]$DestinationDir,
        [switch]$PreferRobocopy
    )

    if (-not (Test-Path $SourceDir)) {
        throw "Source directory not found: $SourceDir"
    }

    New-Item -ItemType Directory -Force -Path $DestinationDir | Out-Null

    # Use Copy-Item exclusively - robocopy adds complexity and CI-specific issues
    # Copy-Item is reliable and handles all edge cases in our CI environment
    $ExcludedNames = @('node_modules', '.git', '.git*', '__pycache__', '*.tmp', '*.bak')
    
    foreach ($Item in Get-ChildItem -Path $SourceDir -Force) {
        if ($Item.Name -in $ExcludedNames) {
            continue
        }

        try {
            Copy-Item -Path $Item.FullName -Destination $DestinationDir -Recurse -Force -ErrorAction Stop
        } catch {
            Write-Warning "Failed to copy $($Item.Name): $_"
            # Continue with other items instead of failing completely
        }
    }

    return 'copy-item'
}

function Initialize-A11yOperationState {
    param(
        [string]$Operation,
        [string]$Root,
        [string]$SummaryPath,
        [bool]$DryRun,
        [bool]$CheckMode,
        [string[]]$CandidatePaths
    )

    $BackupPath = Get-DefaultBackupPath -Operation $Operation -Root $Root
    $Snapshot = [ordered]@{
        schemaVersion = '1.0'
        timestampUtc = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
        operation = $Operation
        dryRun = [bool]$DryRun
        check = [bool]$CheckMode
        summaryPath = $SummaryPath
        candidatePaths = @($CandidatePaths | Where-Object { $_ } | Select-Object -Unique)
        existingPaths = @($CandidatePaths | Where-Object { $_ -and (Test-Path $_) } | Select-Object -Unique)
        note = 'Metadata only. This file records touched paths for rollback planning; it is not a full file-content backup.'
    }
    Write-A11ySummaryFile -Path $BackupPath -Data $Snapshot
    return $BackupPath
}

function Get-DefaultBackupPath {
    param(
        [string]$Operation,
        [string]$Root
    )

    return Join-Path $Root ".a11y-agent-team-$Operation-backup.json"
}

function Detect-InstalledTools {
    <#
    .SYNOPSIS
    Detects which development tools are available on the system.
    Returns a hashtable of tool presence and version info for the wizard.
    #>
    $Tools = @{}

    # Node.js
    $NodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if ($NodeCmd) {
        $NodeVersion = (& node --version 2>$null) -replace '^v', ''
        $Tools.Node = @{ Available = $true; Version = $NodeVersion; Path = $NodeCmd.Source }
    } else {
        $Tools.Node = @{ Available = $false }
    }

    # npm
    $NpmCmd = Get-Command npm -ErrorAction SilentlyContinue
    $Tools.Npm = @{ Available = [bool]$NpmCmd }

    # Git
    $GitCmd = Get-Command git -ErrorAction SilentlyContinue
    $Tools.Git = @{ Available = [bool]$GitCmd }

    # Java (for veraPDF)
    $JavaCmd = Get-Command java -ErrorAction SilentlyContinue
    if ($JavaCmd) {
        $JavaVersion = (& java -version 2>&1 | Select-Object -First 1) -replace '.*"(.+)".*', '$1'
        $Tools.Java = @{ Available = $true; Version = $JavaVersion }
    } else {
        $Tools.Java = @{ Available = $false }
    }

    # veraPDF
    $VeraPdfCmd = Get-Command verapdf -ErrorAction SilentlyContinue
    $Tools.VeraPdf = @{ Available = [bool]$VeraPdfCmd }

    # Python 3
    $Py3Cmd = Get-Command python3 -ErrorAction SilentlyContinue
    if (-not $Py3Cmd) { $Py3Cmd = Get-Command python -ErrorAction SilentlyContinue }
    $Tools.Python3 = @{ Available = [bool]$Py3Cmd }

    # VS Code profiles
    $Profiles = Get-VSCodeProfiles
    $Tools.VSCode = @{
        Stable = ($Profiles | Where-Object { $_.Key -eq 'stable' -and $_.Exists }) -ne $null
        Insiders = ($Profiles | Where-Object { $_.Key -eq 'insiders' -and $_.Exists }) -ne $null
    }

    # Claude Code
    $ClaudeCmd = Get-Command claude -ErrorAction SilentlyContinue
    $Tools.ClaudeCode = @{ Available = [bool]$ClaudeCmd }

    # Copilot CLI
    $CopilotCliDir = Join-Path $env:USERPROFILE ".copilot"
    $Tools.CopilotCli = @{ Available = Test-Path $CopilotCliDir }

    # Codex CLI
    $CodexCliDir = Join-Path $env:USERPROFILE ".codex"
    $Tools.CodexCli = @{ Available = Test-Path $CodexCliDir }

    # Gemini CLI
    $GeminiCmd = Get-Command gemini -ErrorAction SilentlyContinue
    $Tools.GeminiCli = @{ Available = [bool]$GeminiCmd }

    return $Tools
}

function Show-DetectedTools {
    param([hashtable]$Tools)

    Write-Host "  Detected tools:"
    $Items = @(
        @("VS Code",         $Tools.VSCode.Stable)
        @("VS Code Insiders", $Tools.VSCode.Insiders)
        @("Node.js",         $Tools.Node.Available)
        @("Claude Code",     $Tools.ClaudeCode.Available)
        @("Copilot CLI",     $Tools.CopilotCli.Available)
        @("Codex CLI",       $Tools.CodexCli.Available)
        @("Gemini CLI",      $Tools.GeminiCli.Available)
        @("Python 3",        $Tools.Python3.Available)
        @("Java",            $Tools.Java.Available)
        @("veraPDF",         $Tools.VeraPdf.Available)
    )
    foreach ($Item in $Items) {
        $Label = $Item[0]
        $Found = $Item[1]
        $Mark = if ($Found) { "[x]" } else { "[ ]" }
        Write-Host "    $Mark $Label"
    }
    Write-Host ""
}

function Get-RoleBasedPlatforms {
    <#
    .SYNOPSIS
    Maps a user role selection to the set of platforms to install.
    Returns a hashtable with boolean flags for each platform.
    #>
    param([string]$Role, [hashtable]$Tools)

    switch ($Role) {
        'developer' {
            return @{
                Claude = $true
                Copilot = $Tools.VSCode.Stable -or $Tools.VSCode.Insiders
                CopilotCli = $Tools.CopilotCli.Available
                CodexCli = $Tools.CodexCli.Available
                GeminiCli = $false
                Mcp = $Tools.Node.Available
            }
        }
        'reviewer' {
            return @{
                Claude = $true
                Copilot = $Tools.VSCode.Stable -or $Tools.VSCode.Insiders
                CopilotCli = $false
                CodexCli = $false
                GeminiCli = $false
                Mcp = $Tools.Node.Available
            }
        }
        'author' {
            return @{
                Claude = $true
                Copilot = $false
                CopilotCli = $false
                CodexCli = $false
                GeminiCli = $false
                Mcp = $Tools.Node.Available
            }
        }
        'full' {
            return @{
                Claude = $true
                Copilot = $Tools.VSCode.Stable -or $Tools.VSCode.Insiders
                CopilotCli = $Tools.CopilotCli.Available
                CodexCli = $Tools.CodexCli.Available
                GeminiCli = $Tools.GeminiCli.Available
                Mcp = $Tools.Node.Available
            }
        }
        default {
            # 'custom' - all false, caller handles individual toggles
            return @{
                Claude = $false
                Copilot = $false
                CopilotCli = $false
                CodexCli = $false
                GeminiCli = $false
                Mcp = $false
            }
        }
    }
}

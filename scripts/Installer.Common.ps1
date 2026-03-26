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

    $ExcludedNames = @('node_modules', '.git')
    $RoboCopy = if ($PreferRobocopy) { Get-Command robocopy -ErrorAction SilentlyContinue } else { $null }
    if ($RoboCopy) {
        & $RoboCopy.Source $SourceDir $DestinationDir /E /R:2 /W:1 /NFL /NDL /NJH /NJS /NC /NS /NP /XD node_modules .git | Out-Null
        $RoboCopyExitCode = $LASTEXITCODE
        if ($RoboCopyExitCode -le 7) {
            return 'robocopy'
        }

        throw "robocopy failed with exit code $RoboCopyExitCode while copying $SourceDir to $DestinationDir"
    }

    foreach ($Item in Get-ChildItem -Path $SourceDir -Force) {
        if ($Item.Name -in $ExcludedNames) {
            continue
        }

        Copy-Item -Path $Item.FullName -Destination $DestinationDir -Recurse -Force
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

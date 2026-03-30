# Accessibility Agents Installer (Windows PowerShell)
# Built by Community Access - https://community-access.org
#
# NOTE: Keep this file ASCII-only. Windows PowerShell 5.1 reads .ps1 files
# as Windows-1252 when no UTF-8 BOM is present, which corrupts non-ASCII
# characters (e.g. em-dashes become right double-quotes, breaking strings).
#
# One-liner:
#   irm https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/install.ps1 | iex

param(
    [switch]$Project,
    [switch]$Global,
    [switch]$Copilot,
    [switch]$Cli,
    [switch]$Codex,
    [switch]$Gemini,
    [ValidateSet('developer','reviewer','author','full','custom')]
    [string]$Role,
    [string]$Config,
    [switch]$Yes,
    [switch]$NoAutoUpdate,
    [switch]$Check,
    [switch]$DryRun,
    [switch]$VsCodeStable,
    [switch]$VsCodeInsiders,
    [switch]$VsCodeBoth,
    [switch]$McpProfileStable,
    [switch]$McpProfileInsiders,
    [switch]$McpProfileBoth,
    [Alias('summary')]
    [string]$SummaryPath,
    [switch]$Help,
    [switch]$Force,
    [switch]$Quiet,
    [switch]$Version
)

$ErrorActionPreference = "Stop"
$AutoApprove = $Yes.IsPresent
$ScriptDirForHelpers = if ($MyInvocation.MyCommand.Path) { Split-Path -Parent $MyInvocation.MyCommand.Path } else { (Get-Location).Path }
. (Join-Path $ScriptDirForHelpers 'scripts\Installer.Common.ps1')

# ---------------------------------------------------------------------------
# -Help: print usage and exit
# ---------------------------------------------------------------------------
if ($Help) {
    Write-Host ""
    Write-Host "  Accessibility Agents Installer (Windows PowerShell)"
    Write-Host "  Built by Community Access - https://community-access.org"
    Write-Host ""
    Write-Host "  Usage:"
    Write-Host "    .\install.ps1                         Interactive (wizard)"
    Write-Host "    .\install.ps1 -Global                 Install to ~/.claude/"
    Write-Host "    .\install.ps1 -Project                Install to .claude/ in current dir"
    Write-Host "    .\install.ps1 -Global -Copilot        Also install Copilot agents"
    Write-Host "    .\install.ps1 -Global -Cli            Also install Copilot CLI agents"
    Write-Host ""
    Write-Host "  Flags:"
    Write-Host "    -Project              Install to project scope (.claude/)"
    Write-Host "    -Global               Install to user scope (~/.claude/)"
    Write-Host "    -Copilot              Install Copilot agents to VS Code"
    Write-Host "    -Cli                  Install Copilot CLI agents"
    Write-Host "    -Codex                Install Codex CLI support"
    Write-Host "    -Gemini               Install Gemini CLI extension"
    Write-Host "    -Role <role>          developer, reviewer, author, full, custom"
    Write-Host "    -Config <path>        Path to team config JSON file"
    Write-Host "    -Yes                  Accept all prompts (non-interactive)"
    Write-Host "    -NoAutoUpdate         Skip auto-update setup"
    Write-Host "    -Check                Check mode (dry run + report)"
    Write-Host "    -DryRun               Preview actions without making changes"
    Write-Host "    -Force                Overwrite existing agent/skill files"
    Write-Host "    -Quiet                Suppress banner and informational output"
    Write-Host "    -Version              Print version and exit"
    Write-Host "    -Help                 Show this help and exit"
    Write-Host "    -VsCodeStable         Target VS Code Stable only"
    Write-Host "    -VsCodeInsiders       Target VS Code Insiders only"
    Write-Host "    -VsCodeBoth           Target both VS Code editions"
    Write-Host "    -McpProfileStable     MCP in VS Code Stable only"
    Write-Host "    -McpProfileInsiders   MCP in VS Code Insiders only"
    Write-Host "    -McpProfileBoth       MCP in both VS Code editions"
    Write-Host "    -SummaryPath <path>   Write JSON summary file"
    Write-Host ""
    Write-Host "  One-liner:"
    Write-Host "    irm https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/install.ps1 | iex"
    Write-Host ""
    exit 0
}

# ---------------------------------------------------------------------------
# -Version: print version and exit
# ---------------------------------------------------------------------------
if ($Version) {
    $VerHash = ''
    $VerTag = ''
    if (Get-Command git -ErrorAction SilentlyContinue) {
        $VDir = if ($MyInvocation.MyCommand.Path) { Split-Path -Parent $MyInvocation.MyCommand.Path } else { $null }
        if ($VDir -and (Test-Path (Join-Path $VDir '.git'))) {
            $VerHash = & git -C $VDir rev-parse --short HEAD 2>$null
            $VerTag = & git -C $VDir describe --tags --abbrev=0 2>$null
        }
    }
    if ($VerTag) { Write-Host "  Accessibility Agents $VerTag ($VerHash)" }
    elseif ($VerHash) { Write-Host "  Accessibility Agents ($VerHash)" }
    else { Write-Host "  Accessibility Agents (version unknown)" }
    exit 0
}

# ---------------------------------------------------------------------------
# Elapsed time tracking
# ---------------------------------------------------------------------------
$Stopwatch = [Diagnostics.Stopwatch]::StartNew()

# ---------------------------------------------------------------------------
# PowerShell version check
# ---------------------------------------------------------------------------
$PsMajor = $PSVersionTable.PSVersion.Major
$PsMinor = $PSVersionTable.PSVersion.Minor
if ($PsMajor -lt 5 -or ($PsMajor -eq 5 -and $PsMinor -lt 1)) {
    Write-Host ""
    Write-Host "  Error: PowerShell 5.1 or later is required (detected $PsMajor.$PsMinor)."
    Write-Host "  Upgrade to PowerShell 7+ from https://aka.ms/powershell"
    exit 1
}
if ($PsMajor -lt 7) {
    Write-Host ""
    Write-Host "  Note: Running on Windows PowerShell $PsMajor.$PsMinor."
    Write-Host "  PowerShell 7+ is recommended for best compatibility."
    Write-Host "  Upgrade: https://aka.ms/powershell"
}

# ---------------------------------------------------------------------------
# Team config file support (-Config path.json)
# Reads role, scope, and platform preferences from a shared JSON file.
# ---------------------------------------------------------------------------
if ($Config) {
    if (-not (Test-Path $Config)) {
        Write-Host "  Error: Config file not found: $Config"
        exit 1
    }
    $TeamConfig = Get-Content -Path $Config -Raw | ConvertFrom-Json
    if ($TeamConfig.scope -eq 'project') { $Project = $true }
    elseif ($TeamConfig.scope -eq 'global') { $Global = $true }
    if ($TeamConfig.role) { $Role = $TeamConfig.role }
    if ($null -ne $TeamConfig.autoUpdate -and $TeamConfig.autoUpdate -eq $false) { $NoAutoUpdate = $true }
    if ($TeamConfig.yes -eq $true) { $AutoApprove = $true }

    # Validate config keys -- warn about unrecognised entries
    $KnownConfigKeys = @('scope', 'role', 'autoUpdate', 'yes')
    $TeamConfig.PSObject.Properties.Name | ForEach-Object {
        if ($_ -notin $KnownConfigKeys) {
            Write-Host "  Warning: Unknown config key '$_' in $Config (ignored)"
        }
    }
}

# Determine source: running from repo clone or downloaded?
$Downloaded = $false
$ScriptDir = if ($MyInvocation.MyCommand.Path) {
    Split-Path -Parent $MyInvocation.MyCommand.Path
}
else {
    $null
}

if (-not $ScriptDir -or -not (Test-Path (Join-Path $ScriptDir ".claude\agents"))) {
    # Running from irm pipe or without repo - download first
    $Downloaded = $true
    $TmpDir = Join-Path $env:TEMP "a11y-agent-team-install-$(Get-Random)"
    Write-Host ""
    Write-Host "  Downloading Accessibility Agents..."

    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "  Error: git is required. Install git and try again."
        exit 1
    }

    git clone --quiet https://github.com/Community-Access/accessibility-agents.git $TmpDir 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Error: git clone failed. Check your network connection and try again."
        exit 1
    }
    $ScriptDir = $TmpDir
    Write-Host "  Downloaded."
}

$AgentsSrc = Join-Path $ScriptDir ".claude\agents"
$CopilotAgentsSrc = Join-Path $ScriptDir ".github\agents"
$CopilotConfigSrc = Join-Path $ScriptDir ".github"
$McpServerSrc = Join-Path $ScriptDir "mcp-server"

# Auto-detect agents from source directory
$Agents = @()
if (Test-Path $AgentsSrc) {
    $Agents = Get-ChildItem -Path $AgentsSrc -Filter "*.md" | Select-Object -ExpandProperty Name
}

if ($Agents.Count -eq 0) {
    Write-Host "  Error: No agents found in $AgentsSrc"
    Write-Host "  Make sure you are running this script from the accessibility-agents directory."
    if ($Downloaded) { Remove-Item -Recurse -Force $TmpDir -ErrorAction SilentlyContinue }
    exit 1
}

if (-not $Quiet) {
    Write-Host ""
    Write-Host "  Accessibility Agents Installer"
    Write-Host "  Built by Community Access"
    Write-Host "  ================================"
    Write-Host ""
}

# ---------------------------------------------------------------------------
# Auto-detect installed tools before any prompts
# ---------------------------------------------------------------------------
$DetectedTools = Detect-InstalledTools
Show-DetectedTools -Tools $DetectedTools

# ---------------------------------------------------------------------------
# Step 1 of 3: Scope
# ---------------------------------------------------------------------------
Write-Host "  Step 1 of 3 -- Where should agents be installed?"
Write-Host ""
Write-Host "  1) This project  - Adds agents to the current directory"
Write-Host "                     (recommended for team use)"
Write-Host ""
Write-Host "  2) All projects  - Installs to your home directory"
Write-Host "                     (available everywhere)"
Write-Host ""

if ($Project -and $Global) {
    Write-Host "  Error: Choose either -Project or -Global, not both."
    exit 1
}

# Smart default: if inside a git repo, default to project (1); otherwise global (2)
$InGitRepo = Test-Path (Join-Path (Get-Location) '.git')
$ScopeDefault = if ($InGitRepo) { '1' } else { '2' }

$Choice = if ($Project) {
    '1'
}
elseif ($Global) {
    '2'
}
else {
    if (-not (Test-InteractivePrompting)) {
        throw "Choose either -Project or -Global when running non-interactively."
    }
    $ScopePromptHint = if ($ScopeDefault -eq '1') { '[1*/2]' } else { '[1/2*]' }
    $ScopeInput = Read-Host "  Choose $ScopePromptHint"
    if ([string]::IsNullOrWhiteSpace($ScopeInput)) { $ScopeDefault } else { $ScopeInput }
}

switch ($Choice) {
    "1" {
        $TargetDir = Join-Path (Get-Location) ".claude"
        Write-Host ""
        Write-Host "  Installing to project: $(Get-Location)"
    }
    "2" {
        $TargetDir = Join-Path $env:USERPROFILE ".claude"
        Write-Host ""
        Write-Host "  Installing globally to: $TargetDir"
    }
    default {
        Write-Host "  Invalid choice. Exiting."
        exit 1
    }
}

# ---------------------------------------------------------------------------
# Idempotent re-install guard
# ---------------------------------------------------------------------------
$SourceHash = ''
if (Get-Command git -ErrorAction SilentlyContinue) {
    if ($ScriptDir -and (Test-Path (Join-Path $ScriptDir '.git'))) {
        $SourceHash = & git -C $ScriptDir rev-parse --short HEAD 2>$null
    }
}
$InstalledVersionFile = Join-Path $TargetDir '.a11y-agent-team-version'
if ($SourceHash -and (Test-Path $InstalledVersionFile) -and -not $Force) {
    $InstalledHash = (Get-Content $InstalledVersionFile -Raw).Trim()
    if ($InstalledHash -eq $SourceHash) {
        Write-Host ""
        Write-Host "  Already up to date ($SourceHash). Use -Force to reinstall."
        if ($Downloaded) { Remove-Item -Recurse -Force $TmpDir -ErrorAction SilentlyContinue }
        $Stopwatch.Stop()
        exit 0
    }
}

# ---------------------------------------------------------------------------
# Step 2 of 3: Role
# ---------------------------------------------------------------------------
$HasAnyPlatformFlag = $Copilot.IsPresent -or $Cli.IsPresent -or $Codex.IsPresent -or $Gemini.IsPresent

if (-not $HasAnyPlatformFlag) {
    Write-Host ""
    Write-Host "  Step 2 of 3 -- What best describes your role?"
    Write-Host ""
    Write-Host "  1) Developer      - Full toolkit: Claude, Copilot, CLI agents, MCP server"
    Write-Host "  2) Reviewer       - Audit tools: Claude, Copilot, MCP server"
    Write-Host "  3) Content author - Document scanning: Claude, MCP server"
    Write-Host "  4) Full install   - Everything your system supports"
    Write-Host "  5) Custom         - Choose each platform individually"
    Write-Host ""
}

$RoleChoice = if ($HasAnyPlatformFlag) {
    'flags'
}
elseif ($Role) {
    # -Role param provided: map to choice number and skip wizard
    switch ($Role) {
        'developer' { '1' }
        'reviewer'  { '2' }
        'author'    { '3' }
        'full'      { '4' }
        'custom'    { '5' }
    }
}
elseif ($AutoApprove -or (-not (Test-InteractivePrompting))) {
    '4'
}
else {
    $RoleInput = Read-Host "  Choose [1-5, default: 4]"
    if ([string]::IsNullOrWhiteSpace($RoleInput)) { '4' } else { $RoleInput }
}

switch ($RoleChoice) {
    '1' { $Platforms = Get-RoleBasedPlatforms -Role 'developer' -Tools $DetectedTools; $RoleName = 'Developer' }
    '2' { $Platforms = Get-RoleBasedPlatforms -Role 'reviewer'  -Tools $DetectedTools; $RoleName = 'Reviewer' }
    '3' { $Platforms = Get-RoleBasedPlatforms -Role 'author'    -Tools $DetectedTools; $RoleName = 'Content author' }
    '4' { $Platforms = Get-RoleBasedPlatforms -Role 'full'      -Tools $DetectedTools; $RoleName = 'Full install' }
    '5' {
        $Platforms = Get-RoleBasedPlatforms -Role 'custom' -Tools $DetectedTools
        $RoleName = 'Custom'
        Write-Host ""
        Write-Host "  Choose which platforms to install:"
        $r = Read-Host "    Claude Code agents? [y/N]"
        if ($r -match '^[Yy]') { $Platforms.Claude = $true }
        $r = Read-Host "    Copilot agents (VS Code)? [y/N]"
        if ($r -match '^[Yy]') { $Platforms.Copilot = $true }
        $r = Read-Host "    Copilot CLI agents? [y/N]"
        if ($r -match '^[Yy]') { $Platforms.CopilotCli = $true }
        $r = Read-Host "    Codex support (CLI + Desktop App)? [y/N]"
        if ($r -match '^[Yy]') { $Platforms.CodexCli = $true }
        $r = Read-Host "    Gemini CLI extension? [y/N]"
        if ($r -match '^[Yy]') { $Platforms.GeminiCli = $true }
        $r = Read-Host "    MCP server (document/PDF scanning)? [y/N]"
        if ($r -match '^[Yy]') { $Platforms.Mcp = $true }
    }
    'flags' {
        $Platforms = @{
            Claude     = $DetectedTools.ClaudeCode.Available
            Copilot    = $Copilot.IsPresent
            CopilotCli = $Cli.IsPresent
            CodexCli   = $Codex.IsPresent
            GeminiCli  = $Gemini.IsPresent
            Mcp        = $false
        }
        $RoleName = 'Custom (from flags)'
    }
    default {
        Write-Host "  Invalid choice. Defaulting to full install."
        $Platforms = Get-RoleBasedPlatforms -Role 'full' -Tools $DetectedTools
        $RoleName = 'Full install'
    }
}

# ---------------------------------------------------------------------------
# Step 3 of 3: Confirm
# ---------------------------------------------------------------------------
$ScopeLabel = if ($Choice -eq '1') { 'This project' } else { 'All projects (global)' }
Write-Host ""
Write-Host "  Step 3 of 3 -- Review and confirm"
Write-Host ""
Write-Host "  Role:  $RoleName"
Write-Host "  Scope: $ScopeLabel"
Write-Host ""
Write-Host "  What will be installed:"
if ($Platforms.Claude)     { Write-Host "    [x] Claude Code agents" } else { Write-Host "    [ ] Claude Code agents" }
if ($Platforms.Copilot)    { Write-Host "    [x] Copilot agents for VS Code" } else { Write-Host "    [ ] Copilot agents for VS Code" }
if ($Platforms.CopilotCli) { Write-Host "    [x] Copilot CLI agents" } else { Write-Host "    [ ] Copilot CLI agents" }
if ($Platforms.CodexCli)   { Write-Host "    [x] Codex support" } else { Write-Host "    [ ] Codex support" }
if ($Platforms.GeminiCli)  { Write-Host "    [x] Gemini CLI extension" } else { Write-Host "    [ ] Gemini CLI extension" }
if ($Platforms.Mcp)        { Write-Host "    [x] MCP server (document and PDF scanning)" } else { Write-Host "    [ ] MCP server" }
Write-Host ""

if ((-not $AutoApprove) -and (Test-InteractivePrompting)) {
    $confirm = Read-Host "  Continue? [Y/n]"
    if ($confirm -match '^[Nn]') {
        Write-Host "  Installation cancelled."
        exit 0
    }
}

# ---------------------------------------------------------------------------
# Merge-ConfigFile: append/update our section in a config markdown file.
# Never overwrites existing user content. Uses <!-- a11y-agent-team --> markers
# so the user's own content above/below our section is always preserved.
# ---------------------------------------------------------------------------
function Merge-ConfigFile {
    param([string]$SrcFile, [string]$DstFile, [string]$Label)
    $start = "<!-- a11y-agent-team: start -->"
    $end = "<!-- a11y-agent-team: end -->"
    $body = ([IO.File]::ReadAllText($SrcFile, [Text.Encoding]::UTF8)).TrimEnd()
    $block = "$start`n$body`n$end"
    if (-not (Test-Path $DstFile)) {
        [IO.File]::WriteAllText($DstFile, "$block`n", [Text.Encoding]::UTF8)
        Write-Host "    + $Label (created)"
        return
    }
    $existing = [IO.File]::ReadAllText($DstFile, [Text.Encoding]::UTF8)
    if ($existing -match [regex]::Escape($start)) {
        $pattern = "(?s)" + [regex]::Escape($start) + ".*?" + [regex]::Escape($end)
        $updated = [regex]::Replace($existing, $pattern, $block)
        [IO.File]::WriteAllText($DstFile, $updated, [Text.Encoding]::UTF8)
        Write-Host "    ~ $Label (updated our existing section)"
    }
    else {
        [IO.File]::WriteAllText($DstFile, $existing.TrimEnd() + "`n`n$block`n", [Text.Encoding]::UTF8)
        Write-Host "    + $Label (merged into your existing file)"
    }
}

function Write-InstallSummaryFile {
    param(
        [string]$Path,
        [hashtable]$Data
    )
    Write-A11ySummaryFile -Path $Path -Data $Data
}

function Configure-VSCodeMcpSettings {
    param([string]$SettingsPath, [string]$Url)

    $SettingsDir = Split-Path -Parent $SettingsPath
    if (-not (Test-Path $SettingsDir)) {
        New-Item -ItemType Directory -Force -Path $SettingsDir | Out-Null
    }

    $SettingsObject = [PSCustomObject]@{}
    if (Test-Path $SettingsPath) {
        try {
            $Raw = Get-Content $SettingsPath -Raw
            if (-not [string]::IsNullOrWhiteSpace($Raw)) {
                $Parsed = $Raw | ConvertFrom-Json -Depth 20
                if ($Parsed) {
                    $SettingsObject = $Parsed
                }
            }
        }
        catch {
            Write-Host "    ! Could not parse $SettingsPath"
            Write-Host "      Add this manually later under mcp.servers.a11y-agent-team.url = $Url"
            return
        }
    }

    if ($SettingsObject.PSObject.Properties.Name -notcontains "mcp") {
        $SettingsObject | Add-Member -NotePropertyName "mcp" -NotePropertyValue ([PSCustomObject]@{})
    }

    $McpSettings = $SettingsObject.mcp
    if ($McpSettings.PSObject.Properties.Name -notcontains "servers") {
        $McpSettings | Add-Member -NotePropertyName "servers" -NotePropertyValue ([PSCustomObject]@{})
    }

    $ServerSettings = $McpSettings.servers
    if ($ServerSettings.PSObject.Properties.Name -notcontains "a11y-agent-team") {
        $ServerSettings | Add-Member -NotePropertyName "a11y-agent-team" -NotePropertyValue ([PSCustomObject]@{})
    }

    $A11yServer = $ServerSettings.'a11y-agent-team'
    if ($A11yServer.PSObject.Properties.Name -contains "url") {
        $A11yServer.url = $Url
    }
    else {
        $A11yServer | Add-Member -NotePropertyName "url" -NotePropertyValue $Url
    }

    $SettingsObject | ConvertTo-Json -Depth 20 | Set-Content $SettingsPath -Encoding UTF8
    Write-Host "    + MCP server registered in $SettingsPath"
}

function Get-NodeMajorVersion {
    $NodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if (-not $NodeCmd) {
        return $null
    }

    try {
        return [int](& node -p "process.versions.node.split('.')[0]" 2>$null)
    }
    catch {
        return $null
    }
}

function Get-JavaMajorVersion {
    $JavaCmd = Get-Command java -ErrorAction SilentlyContinue
    if (-not $JavaCmd) {
        return $null
    }

    try {
        $JavaVersionLine = (& java -version 2>&1 | Select-Object -First 1)
    }
    catch {
        return $null
    }

    if ($JavaVersionLine -match '"(?<major>\d+)(?:\.(?<minor>\d+))?') {
        $Major = [int]$matches['major']
        if ($Major -eq 1 -and $matches['minor']) {
            return [int]$matches['minor']
        }
        return $Major
    }

    if ($JavaVersionLine -match '\b(?<major>\d+)\b') {
        return [int]$matches['major']
    }

    return $null
}

function Refresh-ProcessPath {
    $MachinePath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
    $UserPath = [System.Environment]::GetEnvironmentVariable("Path", "User")
    $env:Path = ($MachinePath, $UserPath -join ";")
}

$VsCodeProfileMode = Get-RequestedProfileMode -Stable:$VsCodeStable -Insiders:$VsCodeInsiders -Both:$VsCodeBoth
$McpProfileMode = Get-RequestedProfileMode -Stable:$McpProfileStable -Insiders:$McpProfileInsiders -Both:$McpProfileBoth
$DetectedVsCodeProfiles = @(Get-VSCodeProfiles)
$SelectedCopilotProfiles = @(Select-VSCodeProfiles -Profiles $DetectedVsCodeProfiles -Mode $VsCodeProfileMode -OnlyExisting)
$SelectedMcpProfiles = @(Select-VSCodeProfiles -Profiles $DetectedVsCodeProfiles -Mode $McpProfileMode -OnlyExisting)

if (-not $SummaryPath) {
    $SummaryName = if ($DryRun -or $Check) { '.a11y-agent-team-install-plan.json' } else { '.a11y-agent-team-install-summary.json' }
    $SummaryRoot = if ($Choice -eq '1') { (Get-Location).Path } else { $env:USERPROFILE }
    $SummaryPath = Join-Path $SummaryRoot $SummaryName
}

$OperationRoot = if ($Choice -eq '1') { (Get-Location).Path } else { $env:USERPROFILE }
$BackupMetadataPath = Initialize-A11yOperationState -Operation 'install' -Root $OperationRoot -SummaryPath $SummaryPath -DryRun $DryRun -CheckMode $Check -CandidatePaths @($TargetDir, (Join-Path $TargetDir '.a11y-agent-manifest'), (Join-Path $TargetDir '.a11y-agent-team-version'))

$InstallSummary = [ordered]@{
    schemaVersion = '1.0'
    timestampUtc = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
    operation = 'install'
    dryRun = [bool]$DryRun
    check = [bool]$Check
    scope = if ($Choice -eq '1') { 'project' } else { 'global' }
    targetDir = $TargetDir
    requestedOptions = [ordered]@{
        role = $RoleName
        copilot = [bool]$Copilot
        copilotCli = [bool]$Cli
        codex = [bool]$Codex
        gemini = [bool]$Gemini
        autoApprove = [bool]$Yes
        noAutoUpdate = [bool]$NoAutoUpdate
        vscodeProfileMode = $VsCodeProfileMode
        mcpProfileMode = $McpProfileMode
    }
    detectedVsCodeProfiles = @($DetectedVsCodeProfiles | ForEach-Object {
        [ordered]@{
            key = $_.Key
            name = $_.Name
            path = $_.Path
            exists = [bool]$_.Exists
        }
    })
    selectedCopilotProfiles = @($SelectedCopilotProfiles | ForEach-Object { $_.Path })
    selectedMcpProfiles = @($SelectedMcpProfiles | ForEach-Object { $_.Path })
    backupMetadataPath = $BackupMetadataPath
    notes = @()
}

if ($Check) {
    $InstallSummary.notes += 'Check mode only. No files were changed.'
    Write-Host ''
    Write-Host '  Check mode only. No files will be changed.'
    Write-Host "  Scope: $($InstallSummary.scope)"
    Write-Host "  Target: $TargetDir"
    Write-Host "  Backup metadata: $BackupMetadataPath"
    Write-Host "  Detected VS Code profiles: $($DetectedVsCodeProfiles.Count)"
    Write-InstallSummaryFile -Path $SummaryPath -Data $InstallSummary
    Write-Host "  Summary file: $SummaryPath"
    exit 0
}

if ($DryRun) {
    if (-not ($Copilot -or $Cli -or $Codex -or $Gemini)) {
        $InstallSummary.notes += 'Optional platforms were not selected in dry-run mode. Use -Copilot, -Cli, -Codex, and/or -Gemini to preview them explicitly.'
    }
    Write-Host ''
    Write-Host '  Dry run only. No files will be changed.'
    Write-Host "  Scope: $($InstallSummary.scope)"
    Write-Host "  Target: $TargetDir"
    if ($Choice -eq '2') {
        Write-Host '  VS Code profiles in scope:'
        if ($SelectedCopilotProfiles.Count -gt 0) {
            foreach ($Profile in $SelectedCopilotProfiles) {
                Write-Host "    -> $($Profile.Name): $($Profile.Path)"
            }
        }
        else {
            Write-Host '    -> none detected for the requested profile filter'
        }
        Write-Host '  MCP settings targets:'
        if ($SelectedMcpProfiles.Count -gt 0) {
            foreach ($Profile in $SelectedMcpProfiles) {
                Write-Host "    -> $($Profile.Name): $(Join-Path $Profile.Path 'settings.json')"
            }
        }
        else {
            Write-Host '    -> none detected for the requested profile filter'
        }
    }
    Write-Host "  Summary file: $SummaryPath"
    Write-InstallSummaryFile -Path $SummaryPath -Data $InstallSummary
    exit 0
}

function Read-YesNo {
    param(
        [string]$Prompt,
        [bool]$DefaultYes = $false
    )

    if ($AutoApprove) {
        return $true
    }

    if (-not (Test-InteractivePrompting)) {
        return $DefaultYes
    }

    $Suffix = if ($DefaultYes) { '[Y/n]' } else { '[y/N]' }
    $Answer = Read-Host "  $Prompt $Suffix"
    if ([string]::IsNullOrWhiteSpace($Answer)) {
        return $DefaultYes
    }
    return ($Answer -eq 'y' -or $Answer -eq 'Y')
}

function Get-McpCapabilityPlan {
    if ($AutoApprove -or -not (Test-InteractivePrompting)) {
        return [PSCustomObject]@{
            Focus = 'Baseline scanning'
            BrowserTools = $false
            PdfForms = $false
            DeepPdf = $false
            ConfigureVsCode = $true
        }
    }

    Write-Host ""
    Write-Host "  Choose your MCP setup focus:"
    Write-Host ""
    Write-Host "  1) Baseline scanning      - document and PDF scanning only"
    Write-Host "  2) Browser testing        - baseline plus Playwright browser tools"
    Write-Host "  3) PDF-heavy workflow     - baseline plus deep PDF and form tools"
    Write-Host "  4) Everything             - install every MCP capability we support"
    Write-Host "  5) Custom                 - choose capabilities one by one"
    Write-Host ""

    $Choice = Read-Host "  Choose [1/2/3/4/5]"
    $Plan = [ordered]@{
        Focus            = 'Baseline scanning'
        BrowserTools     = $false
        PdfForms         = $false
        DeepPdf          = $false
        ConfigureVsCode  = $true
    }

    switch ($Choice) {
        '2' {
            $Plan.Focus = 'Browser testing'
            $Plan.BrowserTools = $true
        }
        '3' {
            $Plan.Focus = 'PDF-heavy workflow'
            $Plan.PdfForms = $true
            $Plan.DeepPdf = $true
        }
        '4' {
            $Plan.Focus = 'Everything'
            $Plan.BrowserTools = $true
            $Plan.PdfForms = $true
            $Plan.DeepPdf = $true
        }
        '5' {
            $Plan.Focus = 'Custom'
            $Plan.BrowserTools = Read-YesNo -Prompt 'Enable browser-based accessibility tools now?' -DefaultYes:$false
            $Plan.PdfForms = Read-YesNo -Prompt 'Enable PDF form conversion tools now?' -DefaultYes:$false
            $Plan.DeepPdf = Read-YesNo -Prompt 'Prepare deep PDF validation tools now?' -DefaultYes:$false
            $Plan.ConfigureVsCode = Read-YesNo -Prompt 'Configure VS Code MCP settings automatically?' -DefaultYes:$true
        }
    }

    return [PSCustomObject]$Plan
}

function Show-McpCapabilityWarnings {
    param([object]$Plan)

    Write-Host ""
    Write-Host "  MCP capability plan: $($Plan.Focus)"
    Write-Host "    - Baseline scanning installs the MCP server plus core npm dependencies"
    if ($Plan.BrowserTools) {
        Write-Host "    - Browser testing needs Playwright, axe-core, and Chromium"
        Write-Host "    - Browser scans run against live pages and can take longer to install"
    }
    if ($Plan.PdfForms) {
        Write-Host "    - PDF form conversion needs the optional pdf-lib package"
    }
    if ($Plan.DeepPdf) {
        Write-Host "    - Deep PDF validation needs Java 11+ and veraPDF"
        Write-Host "    - Baseline PDF scanning still works even if deep validation is not ready"
    }
    Write-Host "    - Python is not required for MCP runtime"
    Write-Host "    - macOS is supported by the shell installer; Linux is not part of the guided installer target"
}

function Ensure-NodeJsRuntime {
    $NodeCmd = Get-Command node -ErrorAction SilentlyContinue
    $NpmCmd = Get-Command npm -ErrorAction SilentlyContinue
    $NodeMajor = Get-NodeMajorVersion

    if ($NodeCmd -and $NpmCmd -and $NodeMajor -ge 18) {
        return $true
    }

    Write-Host ""
    if ($NodeCmd -and $NodeMajor) {
        Write-Host "  Detected Node.js $NodeMajor, but the MCP server requires Node.js 18 or later."
    }
    else {
        Write-Host "  Node.js and npm were not found."
    }

    $WingetCmd = Get-Command winget -ErrorAction SilentlyContinue
    if ($WingetCmd) {
        Write-Host "  The installer can install Node.js LTS with winget."
        if (Read-YesNo -Prompt 'Install Node.js LTS now?' -DefaultYes:$true) {
            try {
                winget install --exact --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements 2>&1 | Out-Null
                if ($LASTEXITCODE -ne 0) { throw "winget install failed with exit code $LASTEXITCODE" }
                Refresh-ProcessPath
            }
            catch {
                Write-Host "    ! Node.js installation via winget failed."
            }
        }
    }
    else {
        Write-Host "  winget was not found, so Node.js cannot be installed automatically here."
    }

    $NodeCmd = Get-Command node -ErrorAction SilentlyContinue
    $NpmCmd = Get-Command npm -ErrorAction SilentlyContinue
    $NodeMajor = Get-NodeMajorVersion
    if ($NodeCmd -and $NpmCmd -and $NodeMajor -ge 18) {
        Write-Host "    + Node.js runtime is ready for the MCP server"
        return $true
    }

    Write-Host "  MCP setup can continue, but scanning will remain unavailable until Node.js 18+ and npm are installed."
    Write-Host "  Manual fallback: https://nodejs.org/en/download"
    Write-Host "  After installing Node.js, reopen your terminal and run:"
    Write-Host "    cd \"$McpDest\""
    Write-Host "    npm install"
    return $false
}

function Show-PdfDeepValidationReadiness {
    $JavaCmd = Get-Command java -ErrorAction SilentlyContinue
    $VeraPdfCmd = Get-Command verapdf -ErrorAction SilentlyContinue
    if (-not $VeraPdfCmd -and $env:ChocolateyInstall) {
        $ChocoVeraPdf = Join-Path $env:ChocolateyInstall 'bin\verapdf.bat'
        if (Test-Path $ChocoVeraPdf) { $VeraPdfCmd = $ChocoVeraPdf }
    }
    $JavaMajor = Get-JavaMajorVersion

    Write-Host ""
    Write-Host "  PDF Deep Validation Readiness:"

    if ($JavaCmd) {
        try {
            $JavaVersion = (& java -version 2>&1 | Select-Object -First 1)
            if ($JavaMajor -ge 11) {
                Write-Host "    [x] Java detected: $JavaVersion"
            }
            else {
                Write-Host "    [!] Java detected but too old: $JavaVersion"
            }
        }
        catch {
            if ($JavaMajor -ge 11) {
                Write-Host "    [x] Java command found"
            }
            else {
                Write-Host "    [!] Java command found, but version could not be confirmed as 11+"
            }
        }
    }
    else {
        Write-Host "    [ ] Java not detected"
    }

    if ($VeraPdfCmd) {
        try {
            $VeraPdfVersion = (& verapdf --version 2>&1 | Select-Object -First 1)
            Write-Host "    [x] veraPDF detected: $VeraPdfVersion"
        }
        catch {
            Write-Host "    [x] veraPDF command found"
        }
    }
    else {
        Write-Host "    [ ] veraPDF not detected"
    }

    if ($JavaCmd -and $JavaMajor -ge 11 -and $VeraPdfCmd) {
        Write-Host "    READY: run_verapdf_scan should be available once the MCP server is running."
    }
    elseif ($JavaCmd -and $JavaMajor -ge 11) {
        Write-Host "    PARTIAL: Java is ready, but veraPDF still needs to be installed."
    }
    elseif ($JavaCmd) {
        Write-Host "    NOT READY: Java 11 or later is required before veraPDF can run."
    }
    else {
        Write-Host "    NOT READY: scan_pdf_document will work, but run_verapdf_scan will not yet be available."
    }
}

function Test-McpHealthSmoke {
    param([string]$WorkingDir)

    $NodeCmd = Get-Command node -ErrorAction SilentlyContinue
    $NpmCmd = Get-Command npm -ErrorAction SilentlyContinue
    $NodeMajor = Get-NodeMajorVersion
    $CoreSdkReady = Test-NodeModuleAvailable -WorkingDir $WorkingDir -ModuleName '@modelcontextprotocol/sdk'
    $CoreSchemaReady = Test-NodeModuleAvailable -WorkingDir $WorkingDir -ModuleName 'zod'

    if (-not ($NodeCmd -and $NpmCmd -and $NodeMajor -ge 18 -and $CoreSdkReady -and $CoreSchemaReady)) {
        return [PSCustomObject]@{
            Label  = '[ ] SKIPPED'
            Detail = 'Baseline MCP prerequisites are not fully installed yet.'
        }
    }

    $Port = 4300 + (Get-Random -Minimum 0 -Maximum 200)
    $StdOut = [System.IO.Path]::GetTempFileName()
    $StdErr = [System.IO.Path]::GetTempFileName()
    $Process = $null

    try {
        $Command = "set PORT=$Port&& set A11Y_MCP_HOST=127.0.0.1&& set A11Y_MCP_STATELESS=1&& node server.js"
        $Process = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', $Command -WorkingDirectory $WorkingDir -RedirectStandardOutput $StdOut -RedirectStandardError $StdErr -WindowStyle Hidden -PassThru

        for ($Attempt = 0; $Attempt -lt 20; $Attempt++) {
            Start-Sleep -Milliseconds 500
            try {
                $Response = Invoke-RestMethod -Uri "http://127.0.0.1:$Port/health" -Method Get -TimeoutSec 2
                if ($Response.status -eq 'ok') {
                    return [PSCustomObject]@{
                        Label  = '[x] READY'
                        Detail = "HTTP health check passed on port $Port."
                    }
                }
            }
            catch {
            }
        }

        $ErrorLine = ''
        if (Test-Path $StdErr) {
            $ErrorLine = Get-Content $StdErr -ErrorAction SilentlyContinue | Select-Object -First 1
        }
        if (-not $ErrorLine -and (Test-Path $StdOut)) {
            $ErrorLine = Get-Content $StdOut -ErrorAction SilentlyContinue | Select-Object -First 1
        }
        if (-not $ErrorLine) {
            $ErrorLine = 'The temporary MCP server did not answer /health in time.'
        }

        return [PSCustomObject]@{
            Label  = '[ ] FAILED'
            Detail = $ErrorLine
        }
    }
    finally {
        if ($Process -and -not $Process.HasExited) {
            Stop-Process -Id $Process.Id -Force -ErrorAction SilentlyContinue
        }
        Remove-Item $StdOut, $StdErr -Force -ErrorAction SilentlyContinue
    }
}

function Test-NodeModuleAvailable {
    param([string]$WorkingDir, [string]$ModuleName)

    if (-not $WorkingDir -or -not (Test-Path $WorkingDir)) {
        return $false
    }

    $ModulePkgPath = Join-Path $WorkingDir "node_modules" $ModuleName "package.json"
    return (Test-Path $ModulePkgPath)
}

function Test-PlaywrightChromiumReady {
    param([string]$WorkingDir)

    $NodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if (-not $NodeCmd -or -not $WorkingDir -or -not (Test-Path $WorkingDir)) {
        return $false
    }

    try {
        Push-Location $WorkingDir
        $null = node -e "import('playwright').then(async ({ chromium }) => { const fs = await import('node:fs'); const exe = chromium.executablePath(); process.exit(exe && fs.existsSync(exe) ? 0 : 1); }).catch(() => process.exit(1))" 2>&1
        $Success = ($LASTEXITCODE -eq 0)
        Pop-Location
        return $Success
    }
    catch {
        Pop-Location -ErrorAction SilentlyContinue
        return $false
    }
}

function Show-McpCapabilityReadiness {
    param([string]$WorkingDir)

    $NodeCmd = Get-Command node -ErrorAction SilentlyContinue
    $NpmCmd = Get-Command npm -ErrorAction SilentlyContinue
    $NodeMajor = Get-NodeMajorVersion
    $JavaMajor = Get-JavaMajorVersion
    $JavaCmd = Get-Command java -ErrorAction SilentlyContinue
    $VeraPdfCmd = Get-Command verapdf -ErrorAction SilentlyContinue
    if (-not $VeraPdfCmd -and $env:ChocolateyInstall) {
        $ChocoVeraPdf = Join-Path $env:ChocolateyInstall 'bin\verapdf.bat'
        if (Test-Path $ChocoVeraPdf) { $VeraPdfCmd = $ChocoVeraPdf }
    }
    $CoreSdkReady = Test-NodeModuleAvailable -WorkingDir $WorkingDir -ModuleName '@modelcontextprotocol/sdk'
    $CoreSchemaReady = Test-NodeModuleAvailable -WorkingDir $WorkingDir -ModuleName 'zod'
    $PlaywrightReady = Test-NodeModuleAvailable -WorkingDir $WorkingDir -ModuleName 'playwright'
    $PdfLibReady = Test-NodeModuleAvailable -WorkingDir $WorkingDir -ModuleName 'pdf-lib'
    $ChromiumReady = Test-PlaywrightChromiumReady -WorkingDir $WorkingDir
    $BaselineReady = ($NodeCmd -and $NpmCmd -and $NodeMajor -ge 18 -and $CoreSdkReady -and $CoreSchemaReady)
    $SmokeTest = Test-McpHealthSmoke -WorkingDir $WorkingDir

    Write-Host ""
    Write-Host "  MCP Optional Capability Readiness:"
    if ($NodeCmd -and $NodeMajor) {
        Write-Host ("    Node.js runtime (18+):                  " + ($(if ($NodeMajor -ge 18) { "[x] READY (v$NodeMajor)" } else { "[!] TOO OLD (v$NodeMajor)" })))
    }
    else {
        Write-Host "    Node.js runtime (18+):                  [ ] NOT READY"
    }
    Write-Host ("    npm CLI:                                " + ($(if ($NpmCmd) { '[x] READY' } else { '[ ] NOT READY' })))
    Write-Host ("    MCP core dependencies:                  " + ($(if ($CoreSdkReady -and $CoreSchemaReady) { '[x] READY' } else { '[ ] NOT READY' })))
    Write-Host "    Python 3 helper (installer only):       [~] NOT REQUIRED ON WINDOWS"
    Write-Host ("    Baseline PDF scan (scan_pdf_document):  " + ($(if ($BaselineReady) { '[x] READY' } else { '[ ] NOT READY' })))
    if ($JavaCmd -and $JavaMajor) {
        Write-Host ("    Deep PDF validation (Java 11+):       " + ($(if ($JavaMajor -ge 11) { "[x] READY (v$JavaMajor)" } else { "[!] TOO OLD (v$JavaMajor)" })))
    }
    else {
        Write-Host "    Deep PDF validation (Java 11+):       [ ] NOT READY"
    }
    Write-Host ("    Deep PDF validation (veraPDF):        " + ($(if ($VeraPdfCmd) { '[x] READY' } else { '[ ] NOT READY' })))
    Write-Host ("    Local MCP health smoke test:          " + $SmokeTest.Label)
    Write-Host ("    Playwright package:                   " + ($(if ($PlaywrightReady) { '[x] READY' } else { '[ ] NOT READY' })))
    Write-Host ("    Chromium browser bundle:              " + ($(if ($ChromiumReady) { '[x] READY' } else { '[ ] NOT READY' })))
    Write-Host ("    PDF form conversion (pdf-lib):        " + ($(if ($PdfLibReady) { '[x] READY' } else { '[ ] NOT READY' })))

    if (-not $BaselineReady) {
        Write-Host "    Baseline scanning needs Node.js 18+, npm, and MCP server dependencies in the MCP directory."
    }
    Write-Host "    Python is not required for MCP runtime on Windows."
    if ($SmokeTest.Detail) {
        Write-Host "    Smoke test detail: $($SmokeTest.Detail)"
    }
    if (-not $PlaywrightReady -or -not $ChromiumReady) {
        Write-Host "    Browser-based scans need Playwright plus Chromium."
    }
    if (-not $PdfLibReady) {
        Write-Host "    PDF form conversion needs pdf-lib in the MCP server directory."
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

# ---------------------------------------------------------------------------
# Install-GlobalHooks: installs three enforcement hooks for Claude Code.
#   1. a11y-team-eval.sh     (UserPromptSubmit) - Proactive web project detection
#   2. a11y-enforce-edit.sh  (PreToolUse)       - Blocks UI file edits without review
#   3. a11y-mark-reviewed.sh (PostToolUse)      - Creates session marker after review
# ---------------------------------------------------------------------------
function Install-GlobalHooks {
    $HooksDir = Join-Path $env:USERPROFILE ".claude\hooks"
    $SettingsJson = Join-Path $env:USERPROFILE ".claude\settings.json"
    $HookSrc = Join-Path $ScriptDir "claude-code-plugin\scripts"

    if (-not (Test-Path $HookSrc)) {
        $HookSrc = Join-Path $ScriptDir ".claude\hooks"
    }
    if (-not (Test-Path $HookSrc)) {
        Write-Host "    (hook scripts not found - skipping)"
        return
    }

    New-Item -ItemType Directory -Force -Path $HooksDir | Out-Null

    # Resolve bash path - Git for Windows may not add bash.exe to PATH
    $BashCmd = "bash"
    if (-not (Get-Command bash -ErrorAction SilentlyContinue)) {
        $GitCmd = Get-Command git -ErrorAction SilentlyContinue
        if ($GitCmd) {
            $GitBin = Join-Path (Split-Path (Split-Path $GitCmd.Source)) "bin\bash.exe"
            if (Test-Path $GitBin) {
                $BashCmd = $GitBin.Replace('\', '/')
            }
            else {
                Write-Host "    Warning: bash not found in PATH or Git install. Hooks may not execute."
            }
        }
    }

    # Forward-slash path for bash on Windows (Git Bash requires forward slashes)
    $HooksDirFwd = $HooksDir.Replace('\', '/')

    foreach ($Hook in @("a11y-team-eval.sh", "a11y-enforce-edit.sh", "a11y-mark-reviewed.sh")) {
        $Src = Join-Path $HookSrc $Hook
        $Dst = Join-Path $HooksDir $Hook
        if (Test-Path $Src) {
            Copy-Item -Path $Src -Destination $Dst -Force
        }
    }

    # Register hooks in settings.json
    if (-not (Test-Path $SettingsJson)) {
        [IO.File]::WriteAllText($SettingsJson, "{}", [Text.Encoding]::UTF8)
    }

    # Helper: upsert a hook entry by matching a substring in the command
    function Set-HookEntry {
        param([string]$EventName, [string]$MatchSubstr, [hashtable]$NewEntry)
        $Settings = Get-Content $SettingsJson -Raw | ConvertFrom-Json
        if (-not $Settings.PSObject.Properties["hooks"]) {
            $Settings | Add-Member -NotePropertyName "hooks" -NotePropertyValue ([PSCustomObject]@{})
        }
        $Hooks = $Settings.hooks
        if (-not $Hooks.PSObject.Properties[$EventName]) {
            $Hooks | Add-Member -NotePropertyName $EventName -NotePropertyValue @()
        }
        $Entries = @($Hooks.$EventName)
        $Replaced = $false
        for ($i = 0; $i -lt $Entries.Count; $i++) {
            foreach ($h in $Entries[$i].hooks) {
                if ($h.command -and $h.command.Contains($MatchSubstr)) {
                    $Entries[$i] = $NewEntry
                    $Replaced = $true
                    break
                }
            }
            if ($Replaced) { break }
        }
        if (-not $Replaced) { $Entries += $NewEntry }
        $Hooks.$EventName = $Entries
        $Settings | ConvertTo-Json -Depth 10 | Set-Content $SettingsJson -Encoding UTF8
    }

    Set-HookEntry -EventName "UserPromptSubmit" -MatchSubstr "a11y-team-eval" -NewEntry @{
        hooks = @(@{ type = "command"; command = "$BashCmd `"$HooksDirFwd/a11y-team-eval.sh`"" })
    }
    Set-HookEntry -EventName "PreToolUse" -MatchSubstr "a11y-enforce-edit" -NewEntry @{
        matcher = "Edit|Write"
        hooks   = @(@{ type = "command"; command = "$BashCmd `"$HooksDirFwd/a11y-enforce-edit.sh`"" })
    }
    Set-HookEntry -EventName "PostToolUse" -MatchSubstr "a11y-mark-reviewed" -NewEntry @{
        matcher = "Agent"
        hooks   = @(@{ type = "command"; command = "$BashCmd `"$HooksDirFwd/a11y-mark-reviewed.sh`"" })
    }

    Write-Host "    + Hook 1: a11y-team-eval.sh (UserPromptSubmit - proactive web detection)"
    Write-Host "    + Hook 2: a11y-enforce-edit.sh (PreToolUse - blocks UI edits without review)"
    Write-Host "    + Hook 3: a11y-mark-reviewed.sh (PostToolUse - unlocks after review)"
    Write-Host "    + All 3 hooks registered in settings.json"
}

# Create directories
New-Item -ItemType Directory -Force -Path (Join-Path $TargetDir "agents") | Out-Null

# Track which files we install so the uninstaller can cleanly remove everything.
# The manifest is the single source of truth for what belongs to us vs. user files.
$ManifestPath = Join-Path $TargetDir ".a11y-agent-manifest"
$Manifest = [System.Collections.Generic.List[string]]::new()
if (Test-Path $ManifestPath) {
    [IO.File]::ReadAllLines($ManifestPath, [Text.Encoding]::UTF8) | Where-Object { $_.Trim() -ne "" } | ForEach-Object { $Manifest.Add($_) }
}
function Add-ManifestEntry([string]$Entry) {
    if (-not $Manifest.Contains($Entry)) { $Manifest.Add($Entry) }
}
function Save-Manifest {
    [IO.File]::WriteAllLines($ManifestPath, $Manifest.ToArray(), [Text.Encoding]::UTF8)
}

# Copy agents - skip any file that already exists (preserves user customisations)
Write-Host ""
Write-Host "  Copying agents..."
$SkippedAgents = 0
foreach ($Agent in $Agents) {
    $Src = Join-Path $AgentsSrc $Agent
    $Dst = Join-Path $TargetDir "agents\$Agent"
    $Name = $Agent -replace '\.md$', ''
    if ((Test-Path $Dst) -and -not $Force) {
        Write-Host "    ~ $Name (skipped - already exists)"
        $SkippedAgents++
    }
    else {
        Copy-Item -Path $Src -Destination $Dst -Force
        Add-ManifestEntry "agents/$Agent"
        Write-Host "    + $Name"
    }
}
if ($SkippedAgents -gt 0) {
    Write-Host "      $SkippedAgents agent(s) skipped. Use -Force to overwrite."
}

# Merge AGENTS.md (multi-agent team workflow config) into .claude/
$ClaudeAgentsMdSrc = Join-Path $ScriptDir ".claude\AGENTS.md"
if (Test-Path $ClaudeAgentsMdSrc) {
    $ClaudeAgentsMdDst = Join-Path $TargetDir "AGENTS.md"
    Merge-ConfigFile -SrcFile $ClaudeAgentsMdSrc -DstFile $ClaudeAgentsMdDst -Label "AGENTS.md (Claude team config)"
    Add-ManifestEntry "AGENTS.md"
}

# Save manifest (will be updated again as more platforms are installed)
Save-Manifest

# Copilot agents
$CopilotInstalled = $false
$CopilotDestinations = @()
$InstallCopilot = $Copilot.IsPresent -or $Platforms.Copilot

if ($InstallCopilot) {

    if ($Choice -eq "1") {
        # Project install: put agents in .github\agents\
        $ProjectDir = Get-Location
        $CopilotDst = Join-Path $ProjectDir ".github\agents"
        New-Item -ItemType Directory -Force -Path $CopilotDst | Out-Null
        $CopilotDestinations += $CopilotDst

        # Merge Copilot config files - appends our section rather than overwriting
        Write-Host ""
        Write-Host "  Merging Copilot config..."
        foreach ($Config in @("copilot-instructions.md", "copilot-review-instructions.md", "copilot-commit-message-instructions.md")) {
            $Src = Join-Path $CopilotConfigSrc $Config
            $Dst = Join-Path $ProjectDir ".github\$Config"
            if (Test-Path $Src) {
                Merge-ConfigFile -SrcFile $Src -DstFile $Dst -Label $Config
            }
        }

        # Copy Copilot agents - skip files that already exist (preserves user agents)
        Write-Host ""
        Write-Host "  Copying Copilot agents..."
        if (Test-Path $CopilotAgentsSrc) {
            foreach ($File in Get-ChildItem -Path $CopilotAgentsSrc -File) {
                $DstPath = Join-Path $CopilotDst $File.Name
                $DisplayName = $File.BaseName -replace '\.agent$', ''
                if ((Test-Path $DstPath) -and -not $Force) {
                    Write-Host "    ~ $DisplayName (skipped - already exists)"
                }
                else {
                    Copy-Item -Path $File.FullName -Destination $DstPath -Force
                    Add-ManifestEntry "copilot-agents/$($File.Name)"
                    Write-Host "    + $DisplayName"
                }
            }
        }

        # Copy Copilot asset subdirs - file-by-file, skipping files that already exist
        Write-Host ""
        Write-Host "  Copying Copilot assets..."
        foreach ($SubDir in @("skills", "instructions", "prompts")) {
            $SrcSubDir = Join-Path $CopilotConfigSrc $SubDir
            $DstSubDir = Join-Path $ProjectDir ".github\$SubDir"
            if (Test-Path $SrcSubDir) {
                # Migrate old prompt names to new agent-matching names (v2.5 -> v2.6)
                if ($SubDir -eq "prompts") {
                    Migrate-Prompts -SrcDir $SrcSubDir
                }
                
                New-Item -ItemType Directory -Force -Path $DstSubDir | Out-Null
                $Added = 0; $Skipped = 0
                foreach ($File in Get-ChildItem -Recurse -File $SrcSubDir) {
                    $Rel = $File.FullName.Substring($SrcSubDir.Length).TrimStart('\\')
                    $Dst = Join-Path $DstSubDir $Rel
                    New-Item -ItemType Directory -Force -Path (Split-Path $Dst) | Out-Null
                    if ((Test-Path $Dst) -and -not $Force) { $Skipped++ } else {
                        Copy-Item $File.FullName $Dst -Force
                        $RelEntry = $Rel.Replace('\\', '/')
                        Add-ManifestEntry "copilot-$SubDir/$RelEntry"
                        $Added++
                    }
                }
                $msg = "    + .github\$SubDir\ ($Added new"
                if ($Skipped -gt 0) { $msg += ", $Skipped skipped" }
                Write-Host "$msg)"
            }
        }
        Add-ManifestEntry "copilot-config/copilot-instructions.md"
        Add-ManifestEntry "copilot-config/copilot-review-instructions.md"
        Add-ManifestEntry "copilot-config/copilot-commit-message-instructions.md"
        Save-Manifest
        $CopilotInstalled = $true
    }
    else {
        # Global install: store Copilot agents centrally and configure VS Code
        # to discover them via chat.agentFilesLocations setting.
        $CopilotCentral = Join-Path $env:USERPROFILE ".a11y-agent-team\copilot-agents"
        New-Item -ItemType Directory -Force -Path $CopilotCentral | Out-Null

        Write-Host ""
        Write-Host "  Storing Copilot agents centrally..."
        if (Test-Path $CopilotAgentsSrc) {
            foreach ($File in Get-ChildItem -Path $CopilotAgentsSrc -Filter "*.agent.md") {
                Copy-Item -Path $File.FullName -Destination (Join-Path $CopilotCentral $File.Name) -Force
                $Name = $File.BaseName -replace '\.agent$', ''
                Write-Host "    + $Name"
            }
        }

        # Copy config files, prompts, instructions, and skills to central store.
        # VS Code 1.110+ discovers *.agent.md, *.prompt.md, *.instructions.md from User/prompts/.
        $CentralRoot = Join-Path $env:USERPROFILE ".a11y-agent-team"
        $CopilotCentralPrompts = Join-Path $CentralRoot "copilot-prompts"
        $CopilotCentralInstructions = Join-Path $CentralRoot "copilot-instructions-files"
        $CopilotCentralSkills = Join-Path $CentralRoot "copilot-skills"

        foreach ($Config in @("copilot-instructions.md", "copilot-review-instructions.md", "copilot-commit-message-instructions.md")) {
            $Src = Join-Path $CopilotConfigSrc $Config
            if (Test-Path $Src) {
                Copy-Item -Path $Src -Destination (Join-Path $CentralRoot $Config) -Force
            }
        }
        foreach ($Pair in @(
                @{ Src = Join-Path $CopilotConfigSrc "prompts"; Dst = $CopilotCentralPrompts; SubDir = "prompts" },
                @{ Src = Join-Path $CopilotConfigSrc "instructions"; Dst = $CopilotCentralInstructions; SubDir = "instructions" },
                @{ Src = Join-Path $CopilotConfigSrc "skills"; Dst = $CopilotCentralSkills; SubDir = "skills" }
            )) {
            if (Test-Path $Pair.Src) {
                # Migrate old prompt names to new agent-matching names (v2.5 -> v2.6)
                if ($Pair.SubDir -eq "prompts") {
                    Migrate-Prompts -SrcDir $Pair.Src
                }
                
                New-Item -ItemType Directory -Force -Path $Pair.Dst | Out-Null
                Copy-Item -Path "$($Pair.Src)\*" -Destination $Pair.Dst -Recurse -Force
            }
        }

        # Copy .agent.md, *.prompt.md, *.instructions.md into VS Code User profile folders.
        # VS Code discovers from User/prompts/ only. Previous versions of this
        # installer also wrote to the User/ root, which caused every agent to
        # appear twice. We now write only to User/prompts/ and clean up any
        # stale copies left in User/ by earlier installs.
        function Copy-ToVSCodeProfile {
            param([string]$ProfileDir, [string]$Label)

            if (-not (Test-Path $ProfileDir)) { return }

            $PromptsDir = Join-Path $ProfileDir "prompts"
            New-Item -ItemType Directory -Force -Path $PromptsDir | Out-Null
            Write-Host "  [found] $Label"

            $AgentFiles = Get-ChildItem -Path $CopilotCentral            -Filter "*.agent.md"       -ErrorAction SilentlyContinue
            $PromptFiles = Get-ChildItem -Path $CopilotCentralPrompts     -Filter "*.prompt.md"      -ErrorAction SilentlyContinue
            $InstructionFiles = Get-ChildItem -Path $CopilotCentralInstructions -Filter "*.instructions.md" -ErrorAction SilentlyContinue

            foreach ($File in @($AgentFiles) + @($PromptFiles) + @($InstructionFiles)) {
                if ($File) {
                    Copy-Item -Path $File.FullName -Destination (Join-Path $PromptsDir  $File.Name) -Force
                }
            }

            # Clean up duplicates left in User/ root by earlier installer versions
            foreach ($File in @($AgentFiles) + @($PromptFiles) + @($InstructionFiles)) {
                if ($File) {
                    $RootCopy = Join-Path $ProfileDir $File.Name
                    if (Test-Path $RootCopy) {
                        Remove-Item $RootCopy -Force
                    }
                }
            }

            Write-Host "    Copied $($AgentFiles.Count) agents, $($PromptFiles.Count) prompts, $($InstructionFiles.Count) instructions"

            # Disable .claude/agents in VS Code so Claude Code agents
            # don't appear as duplicates in the Copilot agent picker
            $SettingsFile = Join-Path $ProfileDir "settings.json"
            try {
                $SettingsObj = [PSCustomObject]@{}
                if (Test-Path $SettingsFile) {
                    $Raw = Get-Content $SettingsFile -Raw
                    if (-not [string]::IsNullOrWhiteSpace($Raw)) {
                        $SettingsObj = $Raw | ConvertFrom-Json -Depth 20
                    }
                }
                $LocKey = "chat.agentFilesLocations"
                if ($SettingsObj.PSObject.Properties.Name -notcontains $LocKey) {
                    $SettingsObj | Add-Member -NotePropertyName $LocKey -NotePropertyValue ([PSCustomObject]@{})
                }
                $Loc = $SettingsObj.$LocKey
                foreach ($Pair in @(
                    @{ Key = ".github/agents"; Val = $true },
                    @{ Key = ".claude/agents"; Val = $false }
                )) {
                    if ($Loc.PSObject.Properties.Name -contains $Pair.Key) {
                        $Loc.($Pair.Key) = $Pair.Val
                    } else {
                        $Loc | Add-Member -NotePropertyName $Pair.Key -NotePropertyValue $Pair.Val
                    }
                }
                $SettingsObj | ConvertTo-Json -Depth 20 | Set-Content $SettingsFile -Encoding UTF8
                Write-Host "    Configured agent discovery (disabled .claude/agents)"
            }
            catch {
                Write-Host "    ! Could not update settings.json for agent discovery"
                Write-Host "      Add manually: chat.agentFilesLocations: { .github/agents: true, .claude/agents: false }"
            }

            $script:CopilotDestinations += $PromptsDir
        }

        Write-Host ""
        $StableSelected = $SelectedCopilotProfiles | Where-Object { $_.Key -eq 'stable' }
        $InsidersSelected = $SelectedCopilotProfiles | Where-Object { $_.Key -eq 'insiders' }
        if ($StableSelected -and $InsidersSelected) {
            Write-Host "  Found both VS Code and VS Code Insiders. Installing Copilot assets into both profiles."
        }
        foreach ($Profile in $SelectedCopilotProfiles) {
            Copy-ToVSCodeProfile -ProfileDir $Profile.Path -Label $Profile.Name
        }
        if ($SelectedCopilotProfiles.Count -eq 0) {
            Write-Host "  No matching VS Code profiles were detected for Copilot assets."
        }

        # Also create a11y-copilot-init for per-project use (repos to check into git)
        $InitScript = Join-Path $CentralRoot "a11y-copilot-init.ps1"
        @'
# A11y Agent Team - Copy Copilot assets into the current project
# Usage: powershell -File a11y-copilot-init.ps1
#
# Copies agents, prompts, instructions, and skills into .github/ for this project.
# Use this when you want to check all Copilot assets into version control.

$CentralRoot   = Join-Path $env:USERPROFILE ".a11y-agent-team"
$Central       = Join-Path $CentralRoot "copilot-agents"
$CentralPrompts      = Join-Path $CentralRoot "copilot-prompts"
$CentralInstructions = Join-Path $CentralRoot "copilot-instructions-files"
$CentralSkills       = Join-Path $CentralRoot "copilot-skills"
$GithubDir     = Join-Path (Get-Location) ".github"

if (-not (Test-Path $Central)) {
    Write-Host "  Error: No Copilot agents found. Run the installer first."
    exit 1
}

# Merge helper - appends/updates our section in config files; never overwrites user content
function Merge-ConfigFile {
    param([string]$SrcFile, [string]$DstFile, [string]$Label)
    $start  = "<!-- a11y-agent-team: start -->"
    $end    = "<!-- a11y-agent-team: end -->"
    $body   = ([IO.File]::ReadAllText($SrcFile, [Text.Encoding]::UTF8)).TrimEnd()
    $block  = "$start`n$body`n$end"
    if (-not (Test-Path $DstFile)) {
        [IO.File]::WriteAllText($DstFile, "$block`n", [Text.Encoding]::UTF8)
        Write-Host "  + $Label (created)"
        return
    }
    $existing = [IO.File]::ReadAllText($DstFile, [Text.Encoding]::UTF8)
    if ($existing -match [regex]::Escape($start)) {
        $pattern = "(?s)" + [regex]::Escape($start) + ".*?" + [regex]::Escape($end)
        $updated = [regex]::Replace($existing, $pattern, $block)
        [IO.File]::WriteAllText($DstFile, $updated, [Text.Encoding]::UTF8)
        Write-Host "  ~ $Label (updated our existing section)"
    } else {
        [IO.File]::WriteAllText($DstFile, $existing.TrimEnd() + "`n`n$block`n", [Text.Encoding]::UTF8)
        Write-Host "  + $Label (merged into your existing file)"
    }
}

# Agents - skip files that already exist (preserves user customisations)
$AgentDst = Join-Path $GithubDir "agents"
New-Item -ItemType Directory -Force -Path $AgentDst | Out-Null
$AgentAdded = 0; $AgentSkipped = 0
Get-ChildItem -Path $Central | ForEach-Object {
    $dst = Join-Path $AgentDst $_.Name
    if (Test-Path $dst) { $AgentSkipped++ } else { Copy-Item $_.FullName $dst; $AgentAdded++ }
}
Write-Host "  Copied agents to .github\agents\ ($AgentAdded new, $AgentSkipped skipped)"

# Copilot config files - always merged, never overwritten
foreach ($Config in @("copilot-instructions.md", "copilot-review-instructions.md", "copilot-commit-message-instructions.md")) {
    $Src = Join-Path $CentralRoot $Config
    if (Test-Path $Src) {
        Merge-ConfigFile -SrcFile $Src -DstFile (Join-Path $GithubDir $Config) -Label $Config
    }
}

# Asset stores: prompts, instructions, skills - file-by-file, skip existing
foreach ($Pair in @(
    @{ Src = $CentralPrompts;      Sub = "prompts" },
    @{ Src = $CentralInstructions; Sub = "instructions" },
    @{ Src = $CentralSkills;       Sub = "skills" }
)) {
    if (Test-Path $Pair.Src) {
        $Dst = Join-Path $GithubDir $Pair.Sub
        New-Item -ItemType Directory -Force -Path $Dst | Out-Null
        $Added = 0; $Skipped = 0
        Get-ChildItem -Recurse -File $Pair.Src | ForEach-Object {
            $Rel  = $_.FullName.Substring($Pair.Src.Length).TrimStart('\\')
            $DstF = Join-Path $Dst $Rel
            New-Item -ItemType Directory -Force -Path (Split-Path $DstF) | Out-Null
            if (Test-Path $DstF) { $Skipped++ } else { Copy-Item $_.FullName $DstF; $Added++ }
        }
        Write-Host "  Copied .github\$($Pair.Sub)\ ($Added new, $Skipped skipped)"
    }
}

Write-Host ""
Write-Host "  All Copilot assets are now in .github/ for version control."
Write-Host "  Your existing files were preserved. Only new content was added."
'@ | Out-File -FilePath $InitScript -Encoding utf8

        Write-Host ""
        Write-Host "  To copy Copilot agents into a specific project:"
        Write-Host "    powershell -File `"$InitScript`""
        Write-Host ""

        Add-ManifestEntry "copilot-global/central-store"
        Save-Manifest
        $CopilotInstalled = $true
        $CopilotDestinations += $CopilotCentral
    }
}

# ---------------------------------------------------------------------------
# Copilot CLI support (GitHub Copilot CLI uses ~/.copilot/)
# ---------------------------------------------------------------------------
$CopilotCliInstalled = $false
$CliAgentsDst = ""
$CliSkillsDst = ""
$InstallCopilotCli = $Cli.IsPresent -or $Platforms.CopilotCli

if ($InstallCopilotCli) {
    Write-Host ""
    Write-Host "  Installing Copilot CLI agents..."

    if ($Choice -eq "1") {
        # Project install: CLI reads .github/agents/ directly
        $CliAgentsDst = Join-Path (Get-Location) ".github\agents"
        $CliSkillsDst = Join-Path (Get-Location) ".github\skills"
    }
    else {
        # Global install: use ~/.copilot/
        $CliAgentsDst = Join-Path $env:USERPROFILE ".copilot\agents"
        $CliSkillsDst = Join-Path $env:USERPROFILE ".copilot\skills"
    }

    New-Item -ItemType Directory -Force -Path $CliAgentsDst | Out-Null
    New-Item -ItemType Directory -Force -Path $CliSkillsDst | Out-Null

    # Copy agents
    if (Test-Path $CopilotAgentsSrc) {
        $Count = 0
        foreach ($File in Get-ChildItem -Path $CopilotAgentsSrc -Filter "*.agent.md") {
            $DstFile = Join-Path $CliAgentsDst $File.Name
            if (-not (Test-Path $DstFile)) {
                Copy-Item -Path $File.FullName -Destination $DstFile
                Write-Host "    + $($File.Name)"
                $Count++
            }
            else {
                Write-Host "    ~ $($File.Name) (skipped - exists)"
            }
        }
    }

    # Copy skills
    $SkillsSrc = Join-Path $CopilotConfigSrc "skills"
    if (Test-Path $SkillsSrc) {
        $Count = 0
        Get-ChildItem -Path $SkillsSrc -Directory | ForEach-Object {
            $DstSkill = Join-Path $CliSkillsDst $_.Name
            if (-not (Test-Path $DstSkill)) {
                New-Item -ItemType Directory -Force -Path $DstSkill | Out-Null
                Copy-Item -Path "$($_.FullName)\*" -Destination $DstSkill -Recurse
                Write-Host "    + $($_.Name)/"
                $Count++
            }
            else {
                Write-Host "    ~ $($_.Name)/ (skipped - exists)"
            }
        }
    }

    Write-Host ""
    Write-Host "  Copilot CLI agents installed."
    Write-Host "  Verify with: copilot /agent"

    Add-ManifestEntry "copilot-cli/agents"
    $CopilotCliInstalled = $true
}

# ---------------------------------------------------------------------------
# Codex CLI support
# ---------------------------------------------------------------------------
$CodexSrc = Join-Path $ScriptDir ".codex\AGENTS.md"
$CodexConfigSrc = Join-Path $ScriptDir ".codex\config.toml"
$CodexRolesSrc = Join-Path $ScriptDir ".codex\roles"
$CodexInstalled = $false
$CodexDst = ""
$CodexConfigDst = ""
$CodexRolesDst = ""
$InstallCodex = $Codex.IsPresent -or $Platforms.CodexCli

if ((Test-Path $CodexSrc) -or (Test-Path $CodexConfigSrc)) {
    if ($InstallCodex) {
        Write-Host ""
        Write-Host "  Installing Codex CLI support..."

        if ($Choice -eq "1") {
            $CodexTargetDir = Join-Path (Get-Location) ".codex"
        }
        else {
            $CodexTargetDir = Join-Path $env:USERPROFILE ".codex"
        }
        New-Item -ItemType Directory -Force -Path $CodexTargetDir | Out-Null

        # Merge AGENTS.md
        if (Test-Path $CodexSrc) {
            $CodexDst = Join-Path $CodexTargetDir "AGENTS.md"
            Merge-ConfigFile -SrcFile $CodexSrc -DstFile $CodexDst -Label "AGENTS.md (Codex)"
        }

        # Merge config.toml
        if (Test-Path $CodexConfigSrc) {
            $CodexConfigDst = Join-Path $CodexTargetDir "config.toml"
            Merge-ConfigFile -SrcFile $CodexConfigSrc -DstFile $CodexConfigDst -Label "config.toml (Codex experimental roles)"
            Add-ManifestEntry "codex-config/path:$CodexConfigDst"
        }

        # Copy role files
        if (Test-Path $CodexRolesSrc) {
            $CodexRolesDst = Join-Path $CodexTargetDir "roles"
            New-Item -ItemType Directory -Force -Path $CodexRolesDst | Out-Null
            $RoleCount = 0
            Get-ChildItem -Path $CodexRolesSrc -Filter "*.toml" -File | Sort-Object Name | ForEach-Object {
                Copy-Item -Path $_.FullName -Destination (Join-Path $CodexRolesDst $_.Name) -Force
                Add-ManifestEntry "codex-role/path:$(Join-Path $CodexRolesDst $_.Name)"
                $RoleCount++
            }
            Write-Host "    + roles/ ($RoleCount role files)"
        }

        $CodexInstalled = $true
        if ($Choice -eq "1") {
            Add-ManifestEntry "codex/project"
        }
        else {
            Add-ManifestEntry "codex/global"
        }
        Add-ManifestEntry "codex/path:$CodexDst"
        Save-Manifest
        Write-Host ""
        Write-Host "  Codex will now enforce WCAG AA rules on all UI code in this project."
        Write-Host "  Experimental named roles are available through .codex/config.toml."
        Write-Host "  Run: codex `"Build a login form`" -- accessibility rules apply automatically."
    }
}

# ---------------------------------------------------------------------------
# Gemini CLI extension
# ---------------------------------------------------------------------------
$GeminiSrc = Join-Path $ScriptDir ".gemini\extensions\a11y-agents"
$GeminiInstalled = $false
$GeminiDst = ""
$InstallGemini = $Gemini.IsPresent -or $Platforms.GeminiCli

if (Test-Path $GeminiSrc) {
    if ($InstallGemini) {
        Write-Host ""
        Write-Host "  Installing Gemini CLI extension..."

        if ($Choice -eq "1") {
            $GeminiDst = Join-Path (Get-Location) ".gemini\extensions\a11y-agents"
        }
        else {
            $GeminiDst = Join-Path $env:USERPROFILE ".gemini\extensions\a11y-agents"
        }

        New-Item -ItemType Directory -Force -Path $GeminiDst | Out-Null

        # Copy extension manifest and context file
        foreach ($f in @("gemini-extension.json", "GEMINI.md")) {
            $Src = Join-Path $GeminiSrc $f
            if (Test-Path $Src) {
                Copy-Item -Path $Src -Destination (Join-Path $GeminiDst $f) -Force
                Write-Host "    + $f"
            }
        }

        # Copy skills - directory by directory, skip existing
        $SkillsSrc = Join-Path $GeminiSrc "skills"
        if (Test-Path $SkillsSrc) {
            $Added = 0; $Skipped = 0
            Get-ChildItem -Path $SkillsSrc -Directory | ForEach-Object {
                $DstSkill = Join-Path $GeminiDst "skills\$($_.Name)"
                New-Item -ItemType Directory -Force -Path $DstSkill | Out-Null
                Get-ChildItem -Path $_.FullName -File | ForEach-Object {
                    $DstFile = Join-Path $DstSkill $_.Name
                    if (Test-Path $DstFile) { $Skipped++ } else { Copy-Item $_.FullName $DstFile; $Added++ }
                }
            }
            Write-Host "    + skills\ ($Added new, $Skipped skipped)"
        }

        # Copy hooks - overwrite all files (hooks are versioned with the extension)
        $HooksSrc = Join-Path $GeminiSrc "hooks"
        if (Test-Path $HooksSrc) {
            $HooksDst = Join-Path $GeminiDst "hooks"
            New-Item -ItemType Directory -Force -Path $HooksDst | Out-Null
            $Added = 0
            Get-ChildItem -Path $HooksSrc -File | ForEach-Object {
                Copy-Item $_.FullName (Join-Path $HooksDst $_.Name) -Force
                $Added++
            }
            Write-Host "    + hooks\ ($Added files)"
        }

        $GeminiInstalled = $true
        if ($Choice -eq "1") {
            Add-ManifestEntry "gemini/project"
        }
        else {
            Add-ManifestEntry "gemini/global"
        }
        Add-ManifestEntry "gemini/path:$GeminiDst"
        Save-Manifest
        Write-Host ""
        Write-Host "  Gemini CLI will now enforce WCAG AA rules on all UI code."
        Write-Host "  Run: gemini `"Build a login form`" -- accessibility skills apply automatically."
    }
}

# ---------------------------------------------------------------------------
# Install enforcement hooks (global only)
# ---------------------------------------------------------------------------
if ($Choice -eq "2") {
    Write-Host ""
    Write-Host "  Installing enforcement hooks..."
    Install-GlobalHooks
}

# ---------------------------------------------------------------------------
# Guided MCP server setup
# Copies the open-source MCP server to a stable location, installs npm
# dependencies when available, and can configure VS Code to use it.
# ---------------------------------------------------------------------------
$McpInstalled = $false
$McpDest = $null

if (Test-Path $McpServerSrc) {
    if ($Platforms.Mcp) {
        if ($Choice -eq "1") {
            $McpDest = Join-Path (Get-Location) "mcp-server"
        }
        else {
            $McpDest = Join-Path $env:USERPROFILE ".a11y-agent-team\mcp-server"
        }

        New-Item -ItemType Directory -Force -Path $McpDest | Out-Null
        $McpCopyMethod = Copy-A11yDirectoryTree -SourceDir $McpServerSrc -DestinationDir $McpDest -PreferRobocopy
        $McpInstalled = $true

        Write-Host ""
        Write-Host "  MCP server copied to: $McpDest"
        Write-Host "  MCP copy method: $McpCopyMethod"

        $CapabilityPlan = Get-McpCapabilityPlan
        Show-McpCapabilityWarnings -Plan $CapabilityPlan

        $NodeReady = Ensure-NodeJsRuntime
        $NodeCmd = Get-Command node -ErrorAction SilentlyContinue
        $NpmCmd = Get-Command npm -ErrorAction SilentlyContinue
        $NodeMajor = Get-NodeMajorVersion
        if ($NodeReady -and $NodeCmd -and $NpmCmd -and $NodeMajor -ge 18) {
            Write-Host ""
            Write-Host "  Node.js and npm are available."
            $InstallMcpDeps = Read-YesNo -Prompt 'Install MCP server npm dependencies now?' -DefaultYes:$true
            if ($InstallMcpDeps) {
                Write-Host ""
                Write-Host "  Installing MCP server dependencies..."
                try {
                    Push-Location $McpDest
                    npm install --omit=dev 2>&1 | Out-Null
                    if ($LASTEXITCODE -ne 0) { throw "npm install failed with exit code $LASTEXITCODE" }
                    Pop-Location
                    Write-Host "    + MCP server dependencies installed"
                }
                catch {
                    Pop-Location -ErrorAction SilentlyContinue
                    Write-Host "    ! npm install failed. You can retry later with:"
                    Write-Host "      cd \"$McpDest\""
                    Write-Host "      npm install"
                }
            }

            if ($CapabilityPlan.PdfForms) {
                Write-Host ""
                Write-Host "  Setting up PDF form conversion tooling..."
                try {
                    Push-Location $McpDest
                    npm install pdf-lib 2>&1 | Out-Null
                    if ($LASTEXITCODE -ne 0) { throw "npm install pdf-lib failed with exit code $LASTEXITCODE" }
                    Pop-Location
                    Write-Host "    + pdf-lib installed"
                }
                catch {
                    Pop-Location -ErrorAction SilentlyContinue
                    Write-Host "    ! pdf-lib installation failed. You can retry later with:"
                    Write-Host "      cd \"$McpDest\""
                    Write-Host "      npm install pdf-lib"
                }
            }

            if ($CapabilityPlan.BrowserTools) {
                Write-Host ""
                Write-Host "  Setting up Playwright browser tooling..."
                try {
                    Push-Location $McpDest
                    npm install playwright @axe-core/playwright 2>&1 | Out-Null
                    if ($LASTEXITCODE -ne 0) { throw "npm install playwright failed with exit code $LASTEXITCODE" }
                    npx playwright install chromium 2>&1 | Out-Null
                    if ($LASTEXITCODE -ne 0) { throw "npx playwright install chromium failed with exit code $LASTEXITCODE" }
                    Pop-Location
                    Write-Host "    + Playwright tooling and Chromium installed"
                }
                catch {
                    Pop-Location -ErrorAction SilentlyContinue
                    Write-Host "    ! Playwright setup failed. You can retry later with:"
                    Write-Host "      cd \"$McpDest\""
                    Write-Host "      npm install playwright @axe-core/playwright"
                    Write-Host "      npx playwright install chromium"
                }
            }
        }
        else {
            Write-Host ""
            Write-Host "  Node.js 18+ and npm are still not ready."
            Write-Host "  The MCP server was copied, but dependencies were not installed yet."
            Write-Host "  To enable scanning later:"
            Write-Host "    1. Install Node.js 18 or later"
            Write-Host "    2. Run: cd \"$McpDest\""
            Write-Host "    3. Run: npm install"
            Write-Host "    4. Start it with: npm start"
        }

        Write-Host ""
        $ShouldConfigureVsCode = $CapabilityPlan.ConfigureVsCode
        if (-not $ShouldConfigureVsCode) {
            $ShouldConfigureVsCode = Read-YesNo -Prompt 'Configure VS Code to use the local MCP server?' -DefaultYes:$true
        }
        if ($ShouldConfigureVsCode) {
            if ($Choice -eq "1") {
                Configure-VSCodeMcpSettings -SettingsPath (Join-Path (Get-Location) ".vscode\settings.json") -Url "http://127.0.0.1:3100/mcp"
            }
            else {
                if ($SelectedMcpProfiles.Count -eq 0) {
                    Write-Host "    ! No matching VS Code profiles were detected for MCP configuration."
                }
                foreach ($Profile in $SelectedMcpProfiles) {
                    Configure-VSCodeMcpSettings -SettingsPath (Join-Path $Profile.Path "settings.json") -Url "http://127.0.0.1:3100/mcp"
                }
            }
        }

        Write-Host ""
        $VeraPdfDetected = (Get-Command verapdf -ErrorAction SilentlyContinue) -or
            ($env:ChocolateyInstall -and (Test-Path (Join-Path $env:ChocolateyInstall 'bin\verapdf.bat')))
        if ($VeraPdfDetected) {
            Write-Host "  veraPDF detected."
            Write-Host "  Deep PDF/UA validation will be available through run_verapdf_scan."
        }
        elseif (-not $CapabilityPlan.DeepPdf) {
            Write-Host "  Deep PDF validation was not selected during setup."
            Write-Host "  Baseline PDF scanning works without it."
            Write-Host "  If you want it later, install Java 11+ and veraPDF."
            Write-Host "    Windows Java via winget: winget install --exact --id EclipseAdoptium.Temurin.21.JRE"
            Write-Host "    Windows veraPDF via Chocolatey: choco install verapdf"
            Write-Host "    macOS veraPDF via Homebrew: brew install verapdf"
        }
        else {
            $JavaCmd = Get-Command java -ErrorAction SilentlyContinue
            $JavaMajor = Get-JavaMajorVersion
            $WingetCmd = Get-Command winget -ErrorAction SilentlyContinue
            $ChocoCmd = Get-Command choco -ErrorAction SilentlyContinue

            Write-Host "  veraPDF is not installed. That is okay."
            Write-Host "  Baseline PDF scanning works without it."
            Write-Host "  For deeper PDF/UA validation later, install Java 11+ and veraPDF."

            if ((-not $JavaCmd -or $JavaMajor -lt 11) -and $WingetCmd) {
                Write-Host ""
                if (-not $JavaCmd) {
                    Write-Host "  Java was not found, and winget is available."
                }
                else {
                    Write-Host "  Java $JavaMajor was detected, but veraPDF requires Java 11 or later."
                }
                if (Read-YesNo -Prompt 'Install Java 21 JRE now with winget?' -DefaultYes:$false) {
                    try {
                        winget install --exact --id EclipseAdoptium.Temurin.21.JRE --accept-source-agreements --accept-package-agreements 2>&1 | Out-Null
                        if ($LASTEXITCODE -ne 0) { throw "winget install failed with exit code $LASTEXITCODE" }
                        # Refresh session PATH so subsequent Get-Command calls see the new binary
                        $env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
                                    [System.Environment]::GetEnvironmentVariable('Path', 'User')
                        Write-Host "    + Java 21 JRE installed via winget"
                    }
                    catch {
                        Write-Host "    ! winget Java install failed. You can retry manually with:"
                        Write-Host "      winget install --exact --id EclipseAdoptium.Temurin.21.JRE"
                    }
                }
            }

            if ($ChocoCmd) {
                Write-Host ""
                if (Read-YesNo -Prompt 'Install veraPDF now with Chocolatey?' -DefaultYes:$false) {
                    try {
                        choco install verapdf -y 2>&1 | Out-Null
                        if ($LASTEXITCODE -ne 0) { throw "choco install failed with exit code $LASTEXITCODE" }
                        # Refresh session PATH so subsequent Get-Command calls see the new binary
                        $env:Path = [System.Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
                                    [System.Environment]::GetEnvironmentVariable('Path', 'User')
                        Write-Host "    + veraPDF installed via Chocolatey"
                    }
                    catch {
                        Write-Host "    ! Chocolatey veraPDF install failed. You can retry manually with:"
                        Write-Host "      choco install verapdf"
                    }
                }
            }

            Write-Host ""
            Write-Host "  Windows options:"
            Write-Host "    Java runtime via winget: winget install --exact --id EclipseAdoptium.Temurin.21.JRE"
            Write-Host "    veraPDF via Chocolatey: choco install verapdf"
            Write-Host "    veraPDF manual install: https://docs.verapdf.org/install/"
            Write-Host "    macOS:   brew install verapdf"
        }
    }
}

# Done
Write-Host ""
Write-Host "  ========================="
Write-Host "  Installation complete!"
Write-Host ""
Write-Host "  Claude Code agents installed:"
foreach ($Agent in $Agents) {
    $Name = $Agent -replace '\.md$', ''
    $AgentPath = Join-Path $TargetDir "agents\$Agent"
    if (Test-Path $AgentPath) {
        Write-Host "    [x] $Name"
    }
    else {
        Write-Host "    [ ] $Name (missing)"
    }
}
if ($CopilotInstalled) {
    Write-Host ""
    Write-Host "  Copilot agents installed to:"
    foreach ($Dest in $CopilotDestinations) {
        Write-Host "    -> $Dest"
    }
    Write-Host ""
    Write-Host "  Copilot agents:"
    $AgentSummaryDir = if ($Choice -eq "1") { Join-Path (Get-Location) ".github\agents" } else { $CopilotDestinations[0] }
    foreach ($File in Get-ChildItem -Path $AgentSummaryDir -Filter "*.agent.md" -ErrorAction SilentlyContinue) {
        $Name = $File.BaseName -replace '\.agent$', ''
        Write-Host "    [x] $Name"
    }
}
if ($CopilotCliInstalled) {
    Write-Host ""
    Write-Host "  Copilot CLI agents installed to:"
    Write-Host "    -> $CliAgentsDst"
    Write-Host "    -> $CliSkillsDst"
    Write-Host ""
    Write-Host "  Verify with: copilot /agent"
}
if ($CodexInstalled) {
    Write-Host ""
    Write-Host "  Codex CLI support installed to:"
    Write-Host "    -> $CodexDst"
    if ($CodexConfigDst) { Write-Host "    -> $CodexConfigDst" }
    if ($CodexRolesDst) { Write-Host "    -> $CodexRolesDst/" }
}
if ($GeminiInstalled) {
    Write-Host ""
    Write-Host "  Gemini CLI extension installed to:"
    Write-Host "    -> $GeminiDst"
}
if ($McpInstalled) {
    Write-Host ""
    Write-Host "  MCP server ready at:"
    Write-Host "    -> $McpDest"
    Write-Host ""
    Write-Host "  Start it locally with:"
    Write-Host "    cd \"$McpDest\""
    Write-Host "    npm start"
    Write-Host ""
    Write-Host "  MCP endpoint: http://127.0.0.1:3100/mcp"
    Write-Host "  Health check: http://127.0.0.1:3100/health"
    Show-PdfDeepValidationReadiness
    Show-McpCapabilityReadiness -WorkingDir $McpDest
}

# ---------------------------------------------------------------------------
# Post-install health check
# ---------------------------------------------------------------------------
$HealthTotal = $Agents.Count
$HealthFound = ($Agents | Where-Object { Test-Path (Join-Path $TargetDir "agents\$_") }).Count
$HealthOk = $HealthFound -eq $HealthTotal
Write-Host ""
if ($HealthOk) {
    Write-Host "  Health check: $HealthFound/$HealthTotal agent files installed [PASS]"
} else {
    Write-Host "  Health check: $HealthFound/$HealthTotal agent files installed [WARN]"
    Write-Host "    Re-run the installer to repair missing files."
}

# ---------------------------------------------------------------------------
# Getting Started tips (role-tailored)
# ---------------------------------------------------------------------------
Write-Host ""
Write-Host "  Getting started:"
switch -Wildcard ($RoleName) {
    'Developer*' {
        Write-Host "    - In Copilot Chat, try: @accessibility-lead review this component"
        Write-Host "    - In Claude Code, try: Build a login form"
        Write-Host "    - Run a quick scan: npx @axe-core/cli http://localhost:3000"
    }
    'Reviewer*' {
        Write-Host "    - In Copilot Chat, try: @web-accessibility-wizard audit this page"
        Write-Host "    - In Claude Code, try: Run an accessibility audit of src/"
    }
    'Content*' {
        Write-Host "    - In Claude Code, try: Audit my markdown files for accessibility"
        Write-Host "    - For documents, try: @document-accessibility-wizard scan this folder"
    }
    default {
        Write-Host "    - In Copilot Chat, try: @accessibility-lead review this component"
        Write-Host "    - In Claude Code, try: Build a login form"
        Write-Host "    - For audits, try: @web-accessibility-wizard audit this page"
    }
}

# Save installed version hash for idempotent guard
if ($SourceHash) {
    $SourceHash | Set-Content (Join-Path $TargetDir '.a11y-agent-team-version') -NoNewline
}

# Auto-update setup (global install only)
$AutoUpdateEnabled = $false
if ($Choice -eq "2") {
    Write-Host ""
    if ($NoAutoUpdate) {
        Write-Host "  Auto-updates skipped because -NoAutoUpdate was supplied."
    }
    elseif (Read-YesNo -Prompt 'Enable auto-updates?' -DefaultYes:$false) {
        Write-Host "  This checks GitHub daily for new agents and improvements."
        # Copy the update script
        $UpdateSrc = Join-Path $ScriptDir "update.ps1"
        $UpdateDst = Join-Path $TargetDir ".a11y-agent-team-update.ps1"
        if (Test-Path $UpdateSrc) {
            Copy-Item -Path $UpdateSrc -Destination $UpdateDst -Force
        }

        # Create a scheduled task that runs daily at 9:00 AM
        $TaskName = "AccessibilityAgentsUpdate"
        $Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy RemoteSigned -WindowStyle Hidden -File `"$UpdateDst`" -Silent"
        $Trigger = New-ScheduledTaskTrigger -Daily -At "9:00AM"
        $Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopOnIdleEnd

        # Remove existing task if present (both old and new names)
        Unregister-ScheduledTask -TaskName "A11yAgentTeamUpdate" -Confirm:$false -ErrorAction SilentlyContinue
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

        Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "Auto-update Accessibility Agents for Claude Code" -ErrorAction SilentlyContinue | Out-Null

        if ($?) {
            Write-Host "  Auto-updates enabled (daily at 9:00 AM via Task Scheduler)."
            Write-Host "  Update log: ~\.claude\.a11y-agent-team-update.log"
            $AutoUpdateEnabled = $true
        }
        else {
            Write-Host "  Could not create scheduled task. You can run update.ps1 manually."
        }
    }
    else {
        Write-Host "  Auto-updates skipped. You can run update.ps1 manually anytime."
    }
}

# Final manifest save - captures everything installed across all platforms
Save-Manifest

# Record install scope for uninstaller
$ScopeMarker = if ($Choice -eq "1") { "scope:project" } else { "scope:global" }
if (-not $Manifest.Contains($ScopeMarker)) { Add-ManifestEntry $ScopeMarker }
Save-Manifest

if (($VsCodeProfileMode -ne 'auto') -and ($SelectedCopilotProfiles.Count -eq 0) -and $CopilotInstalled) {
    $InstallSummary.notes += 'The requested VS Code profile filter did not match any installed profile for Copilot assets.'
}
if (($McpProfileMode -ne 'auto') -and ($SelectedMcpProfiles.Count -eq 0) -and $McpInstalled) {
    $InstallSummary.notes += 'The requested MCP profile filter did not match any installed VS Code profile.'
}

$InstallSummary.installed = [ordered]@{
    claude = $true
    plugin = $false
    copilot = [bool]$CopilotInstalled
    copilotCli = [bool]$CopilotCliInstalled
    codex = [bool]$CodexInstalled
    gemini = [bool]$GeminiInstalled
    mcp = [bool]$McpInstalled
    autoUpdate = [bool]$AutoUpdateEnabled
}
$InstallSummary.destinations = [ordered]@{
    claude = @($TargetDir)
    copilot = @($CopilotDestinations)
    copilotCli = @($CliAgentsDst, $CliSkillsDst) | Where-Object { $_ }
    codex = @($CodexDst, $CodexConfigDst, $CodexRolesDst) | Where-Object { $_ }
    gemini = @($GeminiDst) | Where-Object { $_ }
    mcp = @($McpDest) | Where-Object { $_ }
}
$InstallSummary.manifestPath = $ManifestPath
if ($SourceHash) { $InstallSummary.version = $SourceHash }
$Stopwatch.Stop()
$InstallSummary.elapsedSeconds = [math]::Round($Stopwatch.Elapsed.TotalSeconds, 1)
if ($null -ne $HealthTotal) {
    $InstallSummary.healthCheck = [ordered]@{ total = $HealthTotal; found = $HealthFound; passed = $HealthOk }
}
Write-InstallSummaryFile -Path $SummaryPath -Data $InstallSummary

# Clean up temp download
if ($Downloaded) { Remove-Item -Recurse -Force $TmpDir -ErrorAction SilentlyContinue }

Write-Host ""
Write-Host "  Summary written to:"
Write-Host "    $SummaryPath"
Write-Host ""
Write-Host "  Verification:"
Write-Host "    - Re-run with -DryRun to preview profile targeting before a future change"
if ($CopilotInstalled -and $Choice -eq '2') {
    Write-Host "    - Check VS Code prompts folders under the selected profiles"
}
if ($McpInstalled) {
    Write-Host "    - Start the MCP server and check http://127.0.0.1:3100/health"
}
Write-Host ""
Write-Host "  Recovery:"
Write-Host "    - Re-run install.ps1 with the same flags to repair a partial install"
Write-Host "    - Use uninstall.ps1 if you want to remove the managed files cleanly"
Write-Host ""
Write-Host "  If agents stop loading, increase the character budget:"
Write-Host "    `$env:SLASH_COMMAND_TOOL_CHAR_BUDGET = '30000'"
Write-Host ""
Write-Host "  Completed in $([math]::Round($Stopwatch.Elapsed.TotalSeconds, 1))s"
Write-Host ""
Write-Host "  To uninstall, run:"
Write-Host "    irm https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/uninstall.ps1 | iex"

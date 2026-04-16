# Accessibility Agents post-install validation and repair (Windows PowerShell)
# Built by Community Access - https://community-access.org
#
# Purpose:
#   Validate the last install summary and repair common partial-install issues.
#   - Validates destination paths written by install.ps1
#   - Repairs MCP dependencies and Playwright/Chromium state
#   - Cleans stale Copilot duplicates in VS Code profile roots
#   - Appends findings to the install summary JSON issues array
#   - Writes a standalone repair report JSON

param(
    [string]$SummaryPath,
    [switch]$Project,
    [switch]$Global,
    [switch]$Repair,
    [switch]$RepairOptional,
    [switch]$Quiet
)

$ErrorActionPreference = "Stop"

if (-not $Repair.IsPresent) {
    # Default behavior is validate + repair unless explicitly omitted.
    $Repair = $true
}

function Write-Info {
    param([string]$Message)
    if (-not $Quiet) { Write-Host $Message }
}

function Resolve-DefaultSummaryPath {
    param([bool]$UseProject)
    if ($UseProject) {
        return Join-Path (Get-Location).Path ".a11y-agent-team-install-summary.json"
    }
    return Join-Path $env:USERPROFILE ".a11y-agent-team-install-summary.json"
}

function Add-Finding {
    param(
        [string]$Code,
        [string]$Severity,
        [string]$Component,
        [string]$Message,
        [bool]$Repaired = $false,
        [bool]$RepairAttempted = $false,
        [bool]$RequiresRework = $false,
        [string]$Recommendation = ''
    )

    $script:Findings += [ordered]@{
        timestampUtc = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
        code = $Code
        severity = $Severity
        component = $Component
        message = $Message
        repairAttempted = [bool]$RepairAttempted
        repaired = [bool]$Repaired
        requiresRework = [bool]$RequiresRework
        recommendation = $Recommendation
    }
}

function Test-CommandAvailable {
    param([string]$Name)
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Get-NodeMajor {
    if (-not (Test-CommandAvailable node)) { return $null }
    try {
        return [int](& node -p "process.versions.node.split('.')[0]" 2>$null)
    }
    catch {
        return $null
    }
}

function Test-NodeModulePackage {
    param([string]$WorkingDir, [string]$ModuleName)
    if (-not (Test-Path $WorkingDir)) { return $false }
    return Test-Path (Join-Path $WorkingDir "node_modules\$ModuleName\package.json")
}

function Test-PlaywrightChromiumReady {
    param([string]$WorkingDir)
    if (-not (Test-CommandAvailable node)) { return $false }
    if (-not (Test-Path $WorkingDir)) { return $false }

    try {
        Push-Location $WorkingDir
        $null = node -e "import('playwright').then(async ({ chromium }) => { const fs = await import('node:fs'); const exe = chromium.executablePath(); process.exit(exe && fs.existsSync(exe) ? 0 : 1); }).catch(() => process.exit(1))" 2>&1
        $ok = ($LASTEXITCODE -eq 0)
        Pop-Location
        return $ok
    }
    catch {
        Pop-Location -ErrorAction SilentlyContinue
        return $false
    }
}

function Invoke-Npm {
    param([string]$WorkingDir, [string[]]$Args)
    Push-Location $WorkingDir
    try {
        $Output = & npm @Args 2>&1
        return [PSCustomObject]@{ Success = ($LASTEXITCODE -eq 0); Output = $Output }
    }
    finally {
        Pop-Location
    }
}

function Invoke-Npx {
    param([string]$WorkingDir, [string[]]$Args)
    Push-Location $WorkingDir
    try {
        $Output = & npx @Args 2>&1
        return [PSCustomObject]@{ Success = ($LASTEXITCODE -eq 0); Output = $Output }
    }
    finally {
        Pop-Location
    }
}

function Get-InstallSummaryObject {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        throw "Install summary not found: $Path"
    }
    return (Get-Content -Path $Path -Raw | ConvertFrom-Json -Depth 50)
}

function Ensure-McpBaseDependencies {
    param([string]$McpDir)

    if (-not (Test-Path $McpDir)) {
        Add-Finding -Code 'mcp.pathMissing' -Severity 'error' -Component 'mcp' -Message "MCP destination does not exist: $McpDir" -RequiresRework $true -Recommendation 'Re-run install.ps1 to restore MCP files.'
        return
    }

    if (-not (Test-CommandAvailable node) -or -not (Test-CommandAvailable npm)) {
        Add-Finding -Code 'mcp.nodeMissing' -Severity 'error' -Component 'mcp' -Message 'Node.js or npm is missing; cannot validate or repair MCP dependencies.' -RequiresRework $true -Recommendation 'Install Node.js 18+ and rerun repair-install.ps1.'
        return
    }

    $NodeMajor = Get-NodeMajor
    if (-not $NodeMajor -or $NodeMajor -lt 18) {
        Add-Finding -Code 'mcp.nodeTooOld' -Severity 'error' -Component 'mcp' -Message "Node.js 18+ required, detected: $NodeMajor" -RequiresRework $true -Recommendation 'Upgrade Node.js and rerun repair-install.ps1.'
        return
    }

    $CoreReady = (Test-NodeModulePackage -WorkingDir $McpDir -ModuleName '@modelcontextprotocol/sdk') -and (Test-NodeModulePackage -WorkingDir $McpDir -ModuleName 'zod')
    if (-not $CoreReady) {
        if ($Repair) {
            Write-Info "  Repairing MCP base dependencies..."
            $Result = Invoke-Npm -WorkingDir $McpDir -Args @('install', '--omit=dev')
            if ($Result.Success) {
                Add-Finding -Code 'mcp.baseDepsRepaired' -Severity 'info' -Component 'mcp' -Message 'Installed MCP base dependencies with npm install --omit=dev.' -Repaired $true -RepairAttempted $true
            }
            else {
                $Tail = ($Result.Output | Select-Object -Last 20) -join [Environment]::NewLine
                Add-Finding -Code 'mcp.baseDepsRepairFailed' -Severity 'error' -Component 'mcp' -Message "Failed to install MCP base dependencies.$([Environment]::NewLine)$Tail" -RepairAttempted $true -RequiresRework $true -Recommendation 'Run npm install --omit=dev in mcp-server and review npm config/network.'
            }
        }
        else {
            Add-Finding -Code 'mcp.baseDepsMissing' -Severity 'warning' -Component 'mcp' -Message 'MCP base dependencies are missing.' -Recommendation 'Run with -Repair to install base dependencies.'
        }
    }
    else {
        Add-Finding -Code 'mcp.baseDepsReady' -Severity 'info' -Component 'mcp' -Message 'MCP base dependencies are present.'
    }
}

function Ensure-PlaywrightDependencies {
    param([string]$McpDir)

    if (-not (Test-Path $McpDir)) { return }
    if (-not (Test-CommandAvailable npm) -or -not (Test-CommandAvailable npx)) {
        Add-Finding -Code 'playwright.cliMissing' -Severity 'error' -Component 'mcp-browser-tools' -Message 'npm/npx is missing; cannot validate browser tooling.' -RequiresRework $true -Recommendation 'Install Node.js/npm and rerun repair script.'
        return
    }

    $PlaywrightReady = Test-NodeModulePackage -WorkingDir $McpDir -ModuleName 'playwright'
    $PlaywrightCoreReady = Test-NodeModulePackage -WorkingDir $McpDir -ModuleName 'playwright-core'

    if (-not $PlaywrightReady -and $RepairOptional) {
        Write-Info "  Installing optional Playwright tooling..."
        $InstallPw = Invoke-Npm -WorkingDir $McpDir -Args @('install', 'playwright', '@axe-core/playwright')
        if (-not $InstallPw.Success) {
            $Tail = ($InstallPw.Output | Select-Object -Last 20) -join [Environment]::NewLine
            Add-Finding -Code 'playwright.installFailed' -Severity 'error' -Component 'mcp-browser-tools' -Message "Failed to install Playwright tooling.$([Environment]::NewLine)$Tail" -RepairAttempted $true -RequiresRework $true -Recommendation 'Check npm connectivity/proxy settings and retry.'
            return
        }
        Add-Finding -Code 'playwright.installedOptional' -Severity 'info' -Component 'mcp-browser-tools' -Message 'Installed optional Playwright tooling.' -RepairAttempted $true -Repaired $true
        $PlaywrightReady = $true
        $PlaywrightCoreReady = Test-NodeModulePackage -WorkingDir $McpDir -ModuleName 'playwright-core'
    }

    if ($PlaywrightReady -and -not $PlaywrightCoreReady) {
        if ($Repair) {
            Write-Info "  Repairing missing playwright-core..."
            $PlaywrightVersion = ""
            try {
                Push-Location $McpDir
                $PlaywrightVersion = (& node -e "try { const pkg = require('./node_modules/playwright/package.json'); process.stdout.write(pkg.version || ''); } catch { process.stdout.write(''); }").Trim()
                Pop-Location
            }
            catch {
                Pop-Location -ErrorAction SilentlyContinue
            }

            $Args = if ($PlaywrightVersion) { @('install', "playwright-core@$PlaywrightVersion") } else { @('install', 'playwright-core') }
            $RepairPwCore = Invoke-Npm -WorkingDir $McpDir -Args $Args
            if ($RepairPwCore.Success -and (Test-NodeModulePackage -WorkingDir $McpDir -ModuleName 'playwright-core')) {
                Add-Finding -Code 'playwright.coreRepaired' -Severity 'info' -Component 'mcp-browser-tools' -Message 'Repaired missing playwright-core dependency.' -RepairAttempted $true -Repaired $true -RequiresRework $true -Recommendation 'Monitor for repeated partial npm installs on this host.'
                $PlaywrightCoreReady = $true
            }
            else {
                $Tail = ($RepairPwCore.Output | Select-Object -Last 20) -join [Environment]::NewLine
                Add-Finding -Code 'playwright.coreRepairFailed' -Severity 'error' -Component 'mcp-browser-tools' -Message "Failed to repair playwright-core.$([Environment]::NewLine)$Tail" -RepairAttempted $true -RequiresRework $true -Recommendation 'Clear npm cache and retry install from mcp-server.'
            }
        }
        else {
            Add-Finding -Code 'playwright.coreMissing' -Severity 'warning' -Component 'mcp-browser-tools' -Message 'playwright-core is missing while playwright is installed.' -Recommendation 'Run with -Repair to auto-repair playwright-core.'
        }
    }

    if ($PlaywrightReady -and $PlaywrightCoreReady) {
        $ChromiumReady = Test-PlaywrightChromiumReady -WorkingDir $McpDir
        if (-not $ChromiumReady) {
            if ($Repair) {
                Write-Info "  Installing Chromium for Playwright..."
                $InstallChromium = Invoke-Npx -WorkingDir $McpDir -Args @('playwright', 'install', 'chromium')
                if ($InstallChromium.Success -and (Test-PlaywrightChromiumReady -WorkingDir $McpDir)) {
                    Add-Finding -Code 'playwright.chromiumRepaired' -Severity 'info' -Component 'mcp-browser-tools' -Message 'Installed Chromium and verified executable resolution.' -RepairAttempted $true -Repaired $true
                }
                else {
                    $Tail = ($InstallChromium.Output | Select-Object -Last 20) -join [Environment]::NewLine
                    Add-Finding -Code 'playwright.chromiumRepairFailed' -Severity 'error' -Component 'mcp-browser-tools' -Message "Chromium install/validation failed.$([Environment]::NewLine)$Tail" -RepairAttempted $true -RequiresRework $true -Recommendation 'Run npx playwright install chromium manually and verify executable path.'
                }
            }
            else {
                Add-Finding -Code 'playwright.chromiumMissing' -Severity 'warning' -Component 'mcp-browser-tools' -Message 'Chromium is not ready for Playwright.' -Recommendation 'Run with -Repair to install Chromium.'
            }
        }
        else {
            Add-Finding -Code 'playwright.chromiumReady' -Severity 'info' -Component 'mcp-browser-tools' -Message 'Playwright Chromium executable is resolvable.'
        }
    }
}

function Repair-CopilotProfileRoots {
    param([object[]]$ProfilePaths)

    foreach ($ProfilePath in $ProfilePaths) {
        if (-not $ProfilePath -or -not (Test-Path $ProfilePath)) { continue }

        $PromptsDir = Join-Path $ProfilePath 'prompts'
        if (-not (Test-Path $PromptsDir)) {
            Add-Finding -Code 'copilot.promptsDirMissing' -Severity 'warning' -Component 'copilot' -Message "VS Code prompts directory missing: $PromptsDir" -Recommendation 'Re-run install.ps1 for Copilot assets.'
            continue
        }

        $Removed = 0
        foreach ($Pattern in @('*.agent.md', '*.prompt.md', '*.instructions.md')) {
            Get-ChildItem -Path $ProfilePath -Filter $Pattern -File -ErrorAction SilentlyContinue | ForEach-Object {
                if ($Repair) {
                    Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
                    $Removed++
                }
            }
        }

        if ($Removed -gt 0) {
            Add-Finding -Code 'copilot.rootDuplicatesRemoved' -Severity 'info' -Component 'copilot' -Message "Removed $Removed stale Copilot files from VS Code profile root: $ProfilePath" -RepairAttempted $true -Repaired $true
        }
        else {
            Add-Finding -Code 'copilot.rootDuplicatesClean' -Severity 'info' -Component 'copilot' -Message "No stale Copilot duplicates found in profile root: $ProfilePath"
        }
    }
}

function Validate-Destinations {
    param([psobject]$Summary)

    if (-not $Summary.destinations) {
        Add-Finding -Code 'summary.destinationsMissing' -Severity 'warning' -Component 'summary' -Message 'Install summary has no destinations object.' -RequiresRework $true -Recommendation 'Re-run installer to regenerate complete summary metadata.'
        return
    }

    foreach ($GroupName in @('claude', 'copilot', 'copilotCli', 'codex', 'gemini', 'mcp')) {
        $Group = $Summary.destinations.$GroupName
        if (-not $Group) { continue }
        foreach ($PathItem in $Group) {
            if (-not [string]::IsNullOrWhiteSpace($PathItem) -and -not (Test-Path $PathItem)) {
                Add-Finding -Code 'destination.missingPath' -Severity 'warning' -Component $GroupName -Message "Expected destination path is missing: $PathItem" -RequiresRework $true -Recommendation 'Re-run installer or recover path manually.'
            }
        }
    }
}

# -------------------------
# Resolve summary selection
# -------------------------
if ($Project -and $Global) {
    throw 'Choose only one of -Project or -Global.'
}

if (-not $SummaryPath) {
    if ($Project) {
        $SummaryPath = Resolve-DefaultSummaryPath -UseProject $true
    }
    elseif ($Global) {
        $SummaryPath = Resolve-DefaultSummaryPath -UseProject $false
    }
    else {
        $ProjectCandidate = Resolve-DefaultSummaryPath -UseProject $true
        $GlobalCandidate = Resolve-DefaultSummaryPath -UseProject $false
        if (Test-Path $ProjectCandidate) {
            $SummaryPath = $ProjectCandidate
        }
        elseif (Test-Path $GlobalCandidate) {
            $SummaryPath = $GlobalCandidate
        }
        else {
            Write-Host ""
            Write-Host "  ERROR: No install summary found."
            Write-Host ""
            Write-Host "  Looked in:"
            Write-Host "    $ProjectCandidate"
            Write-Host "    $GlobalCandidate"
            Write-Host ""
            Write-Host "  The install summary is created when you run install.ps1."
            Write-Host "  Run the installer first, then re-run this repair script."
            Write-Host ""
            Write-Host "  If you installed to a custom location, pass -SummaryPath:"
            Write-Host "    pwsh -File scripts/repair-install.ps1 -SummaryPath <path-to-summary.json> -Repair"
            Write-Host ""
            exit 1
        }
    }
}

Write-Info ""
Write-Info "  Accessibility Agents Repair"
Write-Info "  Summary input: $SummaryPath"
Write-Info ""

$Summary = Get-InstallSummaryObject -Path $SummaryPath
$script:Findings = @()

Validate-Destinations -Summary $Summary

$McpDest = $null
if ($Summary.destinations -and $Summary.destinations.mcp -and $Summary.destinations.mcp.Count -gt 0) {
    $McpDest = [string]$Summary.destinations.mcp[0]
}

if ($Summary.installed -and $Summary.installed.mcp -and $McpDest) {
    Ensure-McpBaseDependencies -McpDir $McpDest
    Ensure-PlaywrightDependencies -McpDir $McpDest
}

$CopilotProfiles = @()
if ($Summary.selectedCopilotProfiles) {
    $CopilotProfiles = @($Summary.selectedCopilotProfiles)
}
if ($Summary.installed -and $Summary.installed.copilot -and $CopilotProfiles.Count -gt 0) {
    Repair-CopilotProfileRoots -ProfilePaths $CopilotProfiles
}

$RepairSucceeded = -not ($Findings | Where-Object { $_.severity -eq 'error' })

# Append findings into install summary issues array for future rework analysis.
if (-not $Summary.PSObject.Properties.Name.Contains('issues') -or -not $Summary.issues) {
    $Summary | Add-Member -NotePropertyName 'issues' -NotePropertyValue @() -Force
}
foreach ($Finding in $Findings) {
    $Summary.issues += $Finding
}

$Summary.issueCount = @($Summary.issues).Count
$Summary.lastRepairRun = [ordered]@{
    timestampUtc = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
    repairEnabled = [bool]$Repair
    repairOptional = [bool]$RepairOptional
    findingsAdded = @($Findings).Count
    success = [bool]$RepairSucceeded
}

$Summary | ConvertTo-Json -Depth 50 | Set-Content -Path $SummaryPath -Encoding UTF8

$ReportPath = if ($Summary.scope -eq 'project') {
    Join-Path (Get-Location).Path '.a11y-agent-team-repair-summary.json'
}
else {
    Join-Path $env:USERPROFILE '.a11y-agent-team-repair-summary.json'
}

$Report = [ordered]@{
    schemaVersion = '1.0'
    timestampUtc = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ssZ')
    operation = 'repair-install'
    inputSummaryPath = $SummaryPath
    outputSummaryPath = $SummaryPath
    findings = $Findings
    success = [bool]$RepairSucceeded
}

$Report | ConvertTo-Json -Depth 50 | Set-Content -Path $ReportPath -Encoding UTF8

Write-Info "  Findings: $(@($Findings).Count)"
Write-Info "  Updated summary: $SummaryPath"
Write-Info "  Repair report: $ReportPath"
Write-Info ""

if (-not $RepairSucceeded) {
    exit 1
}

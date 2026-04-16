#!/bin/bash
# Accessibility Agents post-install validation and repair (shell)
# Built by Community Access - https://community-access.org
#
# Purpose:
#   Validate the last install summary and repair common partial-install issues.
#   - Validates destination paths written by install.sh
#   - Repairs MCP dependencies and Playwright/Chromium state
#   - Cleans stale Copilot duplicates in VS Code profile roots
#   - Appends findings to the install summary JSON issues array
#   - Writes a standalone repair report JSON

set -e

SUMMARY_PATH=""
SCOPE="auto"
REPAIR=true
REPAIR_OPTIONAL=false
QUIET=false

for arg in "$@"; do
  case "$arg" in
    --summary=*) SUMMARY_PATH="${arg#--summary=}" ;;
    --project) SCOPE="project" ;;
    --global) SCOPE="global" ;;
    --validate-only) REPAIR=false ;;
    --repair-optional) REPAIR_OPTIONAL=true ;;
    --quiet) QUIET=true ;;
    --help)
      cat <<EOF
Usage: bash scripts/repair-install.sh [options]

Options:
  --summary=PATH        Install summary JSON path
  --project             Use project default summary path
  --global              Use global default summary path
  --validate-only       Validate but do not repair
  --repair-optional     Also install optional browser tooling if absent
  --quiet               Suppress informational output
  --help                Show this help
EOF
      exit 0
      ;;
  esac
done

info() {
  if [ "$QUIET" != true ]; then
    echo "$1"
  fi
}

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

default_project_summary() { printf '%s/.a11y-agent-team-install-summary.json' "$(pwd)"; }
default_global_summary() { printf '%s/.a11y-agent-team-install-summary.json' "$HOME"; }

if [ -z "$SUMMARY_PATH" ]; then
  if [ "$SCOPE" = "project" ]; then
    SUMMARY_PATH="$(default_project_summary)"
  elif [ "$SCOPE" = "global" ]; then
    SUMMARY_PATH="$(default_global_summary)"
  else
    if [ -f "$(default_project_summary)" ]; then
      SUMMARY_PATH="$(default_project_summary)"
    else
      SUMMARY_PATH="$(default_global_summary)"
    fi
  fi
fi

if [ ! -f "$SUMMARY_PATH" ]; then
  echo ""
  echo "  ERROR: No install summary found."
  echo ""
  echo "  Looked in:"
  echo "    $(default_project_summary)"
  echo "    $(default_global_summary)"
  echo ""
  echo "  The install summary is created when you run install.sh."
  echo "  Run the installer first, then re-run this repair script."
  echo ""
  echo "  If you installed to a custom location, pass --summary=:"
  echo "    bash scripts/repair-install.sh --summary=<path-to-summary.json>"
  echo ""
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "Error: python3 is required for JSON processing in repair-install.sh"
  exit 1
fi

info ""
info "  Accessibility Agents Repair"
info "  Summary input: $SUMMARY_PATH"
info ""

TMP_FINDINGS="$(mktemp)"
printf '[]' > "$TMP_FINDINGS"

add_finding() {
  local code="$1"
  local severity="$2"
  local component="$3"
  local message="$4"
  local repair_attempted="$5"
  local repaired="$6"
  local requires_rework="$7"
  local recommendation="$8"

  python3 - "$TMP_FINDINGS" "$code" "$severity" "$component" "$message" "$repair_attempted" "$repaired" "$requires_rework" "$recommendation" << 'PYEOF'
import json, sys, datetime
path, code, severity, component, message, repair_attempted, repaired, requires_rework, recommendation = sys.argv[1:]
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)
entry = {
    "timestampUtc": datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
    "code": code,
    "severity": severity,
    "component": component,
    "message": message,
    "repairAttempted": repair_attempted.lower() == 'true',
    "repaired": repaired.lower() == 'true',
    "requiresRework": requires_rework.lower() == 'true',
    "recommendation": recommendation,
}
data.append(entry)
with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f)
PYEOF
}

get_summary_value() {
  local expr="$1"
  python3 - "$SUMMARY_PATH" "$expr" << 'PYEOF'
import json, sys
path, expr = sys.argv[1:]
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)
# Safe lookup helper for simple dotted path expressions
cur = data
for part in expr.split('.'):
    if isinstance(cur, dict) and part in cur:
        cur = cur[part]
    else:
        cur = None
        break
if isinstance(cur, bool):
    print('true' if cur else 'false')
elif cur is None:
    print('')
elif isinstance(cur, (dict, list)):
    print(json.dumps(cur))
else:
    print(str(cur))
PYEOF
}

validate_destinations() {
  python3 - "$SUMMARY_PATH" << 'PYEOF'
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
d = data.get('destinations', {})
for group in ('claude','copilot','copilotCli','codex','gemini','mcp'):
    vals = d.get(group) or []
    if isinstance(vals, str):
        vals = [vals]
    for v in vals:
        print(f"{group}|{v}")
PYEOF
}

repair_mcp() {
  local mcp_dir="$1"

  if [ ! -d "$mcp_dir" ]; then
    add_finding "mcp.pathMissing" "error" "mcp" "MCP destination does not exist: $mcp_dir" "false" "false" "true" "Re-run install.sh to restore MCP files."
    return
  fi

  if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    add_finding "mcp.nodeMissing" "error" "mcp" "Node.js or npm is missing; cannot validate or repair MCP dependencies." "false" "false" "true" "Install Node.js 18+ and rerun repair-install.sh."
    return
  fi

  local node_major
  node_major="$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || echo '')"
  if [ -z "$node_major" ] || [ "$node_major" -lt 18 ]; then
    add_finding "mcp.nodeTooOld" "error" "mcp" "Node.js 18+ required, detected: ${node_major:-unknown}" "false" "false" "true" "Upgrade Node.js and rerun repair-install.sh."
    return
  fi

  local core_ready=false
  [ -f "$mcp_dir/node_modules/@modelcontextprotocol/sdk/package.json" ] && [ -f "$mcp_dir/node_modules/zod/package.json" ] && core_ready=true

  if [ "$core_ready" != true ]; then
    if [ "$REPAIR" = true ]; then
      info "  Repairing MCP base dependencies..."
      if (cd "$mcp_dir" && npm install --omit=dev >/tmp/a11y-repair-npm.log 2>&1); then
        add_finding "mcp.baseDepsRepaired" "info" "mcp" "Installed MCP base dependencies with npm install --omit=dev." "true" "true" "false" ""
      else
        local tail
        tail="$(tail -n 20 /tmp/a11y-repair-npm.log 2>/dev/null || true)"
        add_finding "mcp.baseDepsRepairFailed" "error" "mcp" "Failed to install MCP base dependencies. ${tail}" "true" "false" "true" "Run npm install --omit=dev in mcp-server and review npm config/network."
      fi
    else
      add_finding "mcp.baseDepsMissing" "warning" "mcp" "MCP base dependencies are missing." "false" "false" "false" "Run without --validate-only to auto-repair."
    fi
  else
    add_finding "mcp.baseDepsReady" "info" "mcp" "MCP base dependencies are present." "false" "false" "false" ""
  fi

  local pw_ready=false
  local pw_core_ready=false
  [ -f "$mcp_dir/node_modules/playwright/package.json" ] && pw_ready=true
  [ -f "$mcp_dir/node_modules/playwright-core/package.json" ] && pw_core_ready=true

  if [ "$pw_ready" != true ] && [ "$REPAIR_OPTIONAL" = true ]; then
    info "  Installing optional Playwright tooling..."
    if (cd "$mcp_dir" && npm install playwright @axe-core/playwright >/tmp/a11y-repair-pw.log 2>&1); then
      add_finding "playwright.installedOptional" "info" "mcp-browser-tools" "Installed optional Playwright tooling." "true" "true" "false" ""
      [ -f "$mcp_dir/node_modules/playwright/package.json" ] && pw_ready=true
      [ -f "$mcp_dir/node_modules/playwright-core/package.json" ] && pw_core_ready=true
    else
      local tail
      tail="$(tail -n 20 /tmp/a11y-repair-pw.log 2>/dev/null || true)"
      add_finding "playwright.installFailed" "error" "mcp-browser-tools" "Failed to install Playwright tooling. ${tail}" "true" "false" "true" "Check npm connectivity/proxy settings and retry."
      return
    fi
  fi

  if [ "$pw_ready" = true ] && [ "$pw_core_ready" != true ]; then
    if [ "$REPAIR" = true ]; then
      info "  Repairing missing playwright-core..."
      local pw_version
      pw_version="$(cd "$mcp_dir" && node -e "try { const pkg = require('./node_modules/playwright/package.json'); process.stdout.write(pkg.version || ''); } catch { process.stdout.write(''); }" 2>/dev/null || true)"
      if [ -n "$pw_version" ]; then
        if (cd "$mcp_dir" && npm install "playwright-core@$pw_version" >/tmp/a11y-repair-pwcore.log 2>&1) && [ -f "$mcp_dir/node_modules/playwright-core/package.json" ]; then
          add_finding "playwright.coreRepaired" "info" "mcp-browser-tools" "Repaired missing playwright-core dependency." "true" "true" "true" "Monitor for repeated partial npm installs on this host."
          pw_core_ready=true
        else
          local tail
          tail="$(tail -n 20 /tmp/a11y-repair-pwcore.log 2>/dev/null || true)"
          add_finding "playwright.coreRepairFailed" "error" "mcp-browser-tools" "Failed to repair playwright-core. ${tail}" "true" "false" "true" "Clear npm cache and retry install from mcp-server."
        fi
      else
        if (cd "$mcp_dir" && npm install playwright-core >/tmp/a11y-repair-pwcore.log 2>&1) && [ -f "$mcp_dir/node_modules/playwright-core/package.json" ]; then
          add_finding "playwright.coreRepaired" "info" "mcp-browser-tools" "Repaired missing playwright-core dependency." "true" "true" "true" "Monitor for repeated partial npm installs on this host."
          pw_core_ready=true
        else
          local tail
          tail="$(tail -n 20 /tmp/a11y-repair-pwcore.log 2>/dev/null || true)"
          add_finding "playwright.coreRepairFailed" "error" "mcp-browser-tools" "Failed to repair playwright-core. ${tail}" "true" "false" "true" "Clear npm cache and retry install from mcp-server."
        fi
      fi
    else
      add_finding "playwright.coreMissing" "warning" "mcp-browser-tools" "playwright-core is missing while playwright is installed." "false" "false" "false" "Run without --validate-only to auto-repair."
    fi
  fi

  if [ "$pw_ready" = true ] && [ "$pw_core_ready" = true ]; then
    if (cd "$mcp_dir" && node -e "import('playwright').then(async ({ chromium }) => { const fs = await import('node:fs'); const exe = chromium.executablePath(); process.exit(exe && fs.existsSync(exe) ? 0 : 1); }).catch(() => process.exit(1))" >/dev/null 2>&1); then
      add_finding "playwright.chromiumReady" "info" "mcp-browser-tools" "Playwright Chromium executable is resolvable." "false" "false" "false" ""
    else
      if [ "$REPAIR" = true ]; then
        info "  Installing Chromium for Playwright..."
        if (cd "$mcp_dir" && npx playwright install chromium >/tmp/a11y-repair-chromium.log 2>&1) && (cd "$mcp_dir" && node -e "import('playwright').then(async ({ chromium }) => { const fs = await import('node:fs'); const exe = chromium.executablePath(); process.exit(exe && fs.existsSync(exe) ? 0 : 1); }).catch(() => process.exit(1))" >/dev/null 2>&1); then
          add_finding "playwright.chromiumRepaired" "info" "mcp-browser-tools" "Installed Chromium and verified executable resolution." "true" "true" "false" ""
        else
          local tail
          tail="$(tail -n 20 /tmp/a11y-repair-chromium.log 2>/dev/null || true)"
          add_finding "playwright.chromiumRepairFailed" "error" "mcp-browser-tools" "Chromium install/validation failed. ${tail}" "true" "false" "true" "Run npx playwright install chromium manually and verify executable path."
        fi
      else
        add_finding "playwright.chromiumMissing" "warning" "mcp-browser-tools" "Chromium is not ready for Playwright." "false" "false" "false" "Run without --validate-only to auto-repair."
      fi
    fi
  fi
}

repair_copilot_roots() {
  local profiles_json="$1"
  python3 - "$profiles_json" << 'PYEOF'
import json, sys
profiles = json.loads(sys.argv[1]) if sys.argv[1] else []
for p in profiles:
    print(p)
PYEOF
}

# Validate destination paths from summary
while IFS='|' read -r group path; do
  [ -n "$path" ] || continue
  if [ ! -e "$path" ]; then
    add_finding "destination.missingPath" "warning" "$group" "Expected destination path is missing: $path" "false" "false" "true" "Re-run installer or recover path manually."
  fi
done < <(validate_destinations)

installed_mcp="$(get_summary_value "installed.mcp")"
mcp_dest_json="$(get_summary_value "destinations.mcp")"
mcp_dest="$(python3 - "$mcp_dest_json" << 'PYEOF'
import json, sys
raw = sys.argv[1]
if not raw:
    print('')
    raise SystemExit(0)
try:
    arr = json.loads(raw)
except Exception:
    arr = []
print(arr[0] if isinstance(arr, list) and arr else '')
PYEOF
)"

if [ "$installed_mcp" = "true" ] && [ -n "$mcp_dest" ]; then
  repair_mcp "$mcp_dest"
fi

installed_copilot="$(get_summary_value "installed.copilot")"
copilot_profiles_json="$(get_summary_value "selectedCopilotProfiles")"
if [ "$installed_copilot" = "true" ] && [ -n "$copilot_profiles_json" ] && [ "$copilot_profiles_json" != "[]" ]; then
  while IFS= read -r profile_path; do
    [ -n "$profile_path" ] || continue
    prompts_dir="$profile_path/prompts"
    if [ ! -d "$prompts_dir" ]; then
      add_finding "copilot.promptsDirMissing" "warning" "copilot" "VS Code prompts directory missing: $prompts_dir" "false" "false" "false" "Re-run install.sh for Copilot assets."
      continue
    fi

    removed=0
    for pattern in '*.agent.md' '*.prompt.md' '*.instructions.md'; do
      while IFS= read -r file; do
        [ -n "$file" ] || continue
        if [ "$REPAIR" = true ]; then
          rm -f "$file"
          removed=$((removed + 1))
        fi
      done < <(find "$profile_path" -maxdepth 1 -type f -name "$pattern" 2>/dev/null)
    done

    if [ "$removed" -gt 0 ]; then
      add_finding "copilot.rootDuplicatesRemoved" "info" "copilot" "Removed $removed stale Copilot files from VS Code profile root: $profile_path" "true" "true" "false" ""
    else
      add_finding "copilot.rootDuplicatesClean" "info" "copilot" "No stale Copilot duplicates found in profile root: $profile_path" "false" "false" "false" ""
    fi
  done < <(python3 - "$copilot_profiles_json" << 'PYEOF'
import json, sys
raw = sys.argv[1]
try:
    arr = json.loads(raw) if raw else []
except Exception:
    arr = []
if isinstance(arr, list):
    for item in arr:
        if isinstance(item, str):
            print(item)
PYEOF
)
fi

FINDINGS_COUNT="$(python3 - "$TMP_FINDINGS" << 'PYEOF'
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
print(len(data))
PYEOF
)"

HAS_ERROR="$(python3 - "$TMP_FINDINGS" << 'PYEOF'
import json, sys
with open(sys.argv[1], 'r', encoding='utf-8') as f:
    data = json.load(f)
print('true' if any((x.get('severity') == 'error') for x in data) else 'false')
PYEOF
)"

# Append findings to summary issues and write back
python3 - "$SUMMARY_PATH" "$TMP_FINDINGS" "$REPAIR" "$REPAIR_OPTIONAL" << 'PYEOF'
import json, sys, datetime
summary_path, findings_path, repair_enabled, repair_optional = sys.argv[1:]
with open(summary_path, 'r', encoding='utf-8') as f:
    summary = json.load(f)
with open(findings_path, 'r', encoding='utf-8') as f:
    findings = json.load(f)
issues = summary.get('issues')
if not isinstance(issues, list):
    issues = []
issues.extend(findings)
summary['issues'] = issues
summary['issueCount'] = len(issues)
summary['lastRepairRun'] = {
    'timestampUtc': datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
    'repairEnabled': str(repair_enabled).lower() == 'true',
    'repairOptional': str(repair_optional).lower() == 'true',
    'findingsAdded': len(findings),
    'success': not any((x.get('severity') == 'error') for x in findings),
}
with open(summary_path, 'w', encoding='utf-8') as f:
    json.dump(summary, f, indent=2)
PYEOF

scope_value="$(get_summary_value "scope")"
if [ "$scope_value" = "project" ]; then
  REPORT_PATH="$(pwd)/.a11y-agent-team-repair-summary.json"
else
  REPORT_PATH="$HOME/.a11y-agent-team-repair-summary.json"
fi

python3 - "$REPORT_PATH" "$SUMMARY_PATH" "$TMP_FINDINGS" "$HAS_ERROR" << 'PYEOF'
import json, sys, datetime
report_path, summary_path, findings_path, has_error = sys.argv[1:]
with open(findings_path, 'r', encoding='utf-8') as f:
    findings = json.load(f)
report = {
    'schemaVersion': '1.0',
    'timestampUtc': datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ'),
    'operation': 'repair-install',
    'inputSummaryPath': summary_path,
    'outputSummaryPath': summary_path,
    'findings': findings,
    'success': str(has_error).lower() != 'true',
}
with open(report_path, 'w', encoding='utf-8') as f:
    json.dump(report, f, indent=2)
PYEOF

rm -f "$TMP_FINDINGS" /tmp/a11y-repair-npm.log /tmp/a11y-repair-pw.log /tmp/a11y-repair-pwcore.log /tmp/a11y-repair-chromium.log

info "  Findings: $FINDINGS_COUNT"
info "  Updated summary: $SUMMARY_PATH"
info "  Repair report: $REPORT_PATH"
info ""

if [ "$HAS_ERROR" = "true" ]; then
  exit 1
fi

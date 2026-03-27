#!/bin/bash
# Accessibility Agents Installer
# Started by Taylor Arndt - https://github.com/taylorarndt
#
# Usage:
#   bash install.sh                    Interactive mode (prompts for project or global)
#   bash install.sh --global           Install globally to ~/.claude/
#   bash install.sh --global --copilot Also install Copilot agents to VS Code
#   bash install.sh --global --cli     Also install Copilot CLI agents to ~/.copilot/
#   bash install.sh --global --codex   Also install Codex CLI support to ~/.codex/
#   bash install.sh --global --gemini  Also install Gemini CLI extension
#   bash install.sh --project          Install to .claude/ in the current directory
#   bash install.sh --project --copilot Also install Copilot agents to project
#   bash install.sh --project --cli    Also install Copilot CLI agents to project
#   bash install.sh --project --codex  Also install Codex CLI support to .codex/
#   bash install.sh --project --gemini Also install Gemini CLI extension
#   bash install.sh --global --vscode-stable     Target VS Code stable only for Copilot assets
#   bash install.sh --global --vscode-insiders   Target VS Code Insiders only for Copilot assets
#   bash install.sh --global --mcp-profile-both  Configure MCP settings in both VS Code profiles
#   bash install.sh --yes                        Accept optional install prompts automatically
#   bash install.sh --no-auto-update             Skip auto-update setup without prompting
#   bash install.sh --dry-run                    Preview targets without making changes
#   bash install.sh --summary=path.json          Write a machine-readable summary file
#
# One-liner:
#   curl -fsSL https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/install.sh | bash

set -e

# Determine source: running from repo clone or piped from curl?
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd)"
DOWNLOADED=false

if [ ! -d "$SCRIPT_DIR/claude-code-plugin/agents" ] && [ ! -d "$SCRIPT_DIR/.claude/agents" ]; then
  # Running from curl pipe or without repo — download first
  DOWNLOADED=true
  TMPDIR_DL="$(mktemp -d)"
  echo ""
  echo "  Downloading Accessibility Agents..."

  if ! command -v git &>/dev/null; then
    echo "  Error: git is required. Install git and try again."
    rm -rf "$TMPDIR_DL"
    exit 1
  fi

  git clone --quiet https://github.com/Community-Access/accessibility-agents.git "$TMPDIR_DL/accessibility-agents" 2>/dev/null
  if [ $? -ne 0 ]; then
    echo "  Error: git clone failed. Check your network connection and try again."
    rm -rf "$TMPDIR_DL"
    exit 1
  fi
  SCRIPT_DIR="$TMPDIR_DL/accessibility-agents"
  echo "  Downloaded."
fi

. "$SCRIPT_DIR/scripts/installer-common.sh"
enforce_shell_runtime

# Prefer claude-code-plugin/ as distribution source, fall back to .claude/agents/
if [ -d "$SCRIPT_DIR/claude-code-plugin/agents" ]; then
  AGENTS_SRC="$SCRIPT_DIR/claude-code-plugin/agents"
else
  AGENTS_SRC="$SCRIPT_DIR/.claude/agents"
fi

if [ -d "$SCRIPT_DIR/claude-code-plugin/skills" ]; then
  SKILLS_SRC="$SCRIPT_DIR/claude-code-plugin/skills"
elif [ -d "$SCRIPT_DIR/claude-code-plugin/commands" ]; then
  # Backwards compat: old repos may still have commands/
  SKILLS_SRC="$SCRIPT_DIR/claude-code-plugin/commands"
else
  SKILLS_SRC=""
fi

PLUGIN_CLAUDE_MD=""
if [ -f "$SCRIPT_DIR/claude-code-plugin/CLAUDE.md" ]; then
  PLUGIN_CLAUDE_MD="$SCRIPT_DIR/claude-code-plugin/CLAUDE.md"
fi

# Plugin source and version for global installs
PLUGIN_SRC=""
PLUGIN_VERSION="1.0.0"
if [ -d "$SCRIPT_DIR/claude-code-plugin/.claude-plugin" ]; then
  PLUGIN_SRC="$SCRIPT_DIR/claude-code-plugin"
  if command -v python3 &>/dev/null && [ -f "$PLUGIN_SRC/.claude-plugin/plugin.json" ]; then
    PLUGIN_VERSION=$(python3 -c "import json; print(json.load(open('$PLUGIN_SRC/.claude-plugin/plugin.json'))['version'])" 2>/dev/null || echo "1.0.0")
  fi
fi

COPILOT_AGENTS_SRC="$SCRIPT_DIR/.github/agents"
COPILOT_CONFIG_SRC="$SCRIPT_DIR/.github"
MCP_SERVER_SRC="$SCRIPT_DIR/mcp-server"

# Auto-detect agents from source directory
AGENTS=()
if [ -d "$AGENTS_SRC" ]; then
  for f in "$AGENTS_SRC"/*.md; do
    [ -f "$f" ] && AGENTS+=("$(basename "$f")")
  done
fi

# Auto-detect skills from source directory
SKILLS=()
if [ -n "$SKILLS_SRC" ] && [ -d "$SKILLS_SRC" ]; then
  for f in "$SKILLS_SRC"/*.md; do
    [ -f "$f" ] && SKILLS+=("$(basename "$f")")
  done
fi

# Validate source files exist
if [ ${#AGENTS[@]} -eq 0 ]; then
  echo "  Error: No agents found in $AGENTS_SRC"
  echo "  Make sure you are running this script from the accessibility-agents directory."
  [ "$DOWNLOADED" = true ] && rm -rf "$TMPDIR_DL"
  exit 1
fi

# ---------------------------------------------------------------------------
# migrate_prompts src_dir
# Rename old prompt filenames to new agent-matching names.
# This ensures users upgrading from v2.x to v3.0 don't lose custom prompts.
# Migration: old naming (task-based) → new naming (agent-based)
# ---------------------------------------------------------------------------
migrate_prompts() {
  local src_dir="$1"
  [ -d "$src_dir" ] || return
  
  local -a migrations=(
    "a11y-update.prompt.md:insiders-a11y-tracker.prompt.md"
    "audit-desktop-a11y.prompt.md:desktop-a11y-specialist.prompt.md"
    "audit-markdown.prompt.md:markdown-a11y-assistant.prompt.md"
    "audit-web-page.prompt.md:web-accessibility-wizard.prompt.md"
    "export-document-csv.prompt.md:document-csv-reporter.prompt.md"
    "export-markdown-csv.prompt.md:markdown-csv-reporter.prompt.md"
    "export-web-csv.prompt.md:web-csv-reporter.prompt.md"
    "package-python-app.prompt.md:python-specialist.prompt.md"
    "review-text-quality.prompt.md:text-quality-reviewer.prompt.md"
    "scaffold-nvda-addon.prompt.md:nvda-addon-specialist.prompt.md"
    "scaffold-wxpython-app.prompt.md:wxpython-specialist.prompt.md"
    "test-desktop-a11y.prompt.md:desktop-a11y-testing-coach.prompt.md"
  )
  
  for mapping in "${migrations[@]}"; do
    IFS=: read -r old_name new_name <<< "$mapping"
    local old_file="$src_dir/$old_name"
    local new_file="$src_dir/$new_name"
    
    if [ -f "$old_file" ] && [ ! -f "$new_file" ]; then
      mv "$old_file" "$new_file" 2>/dev/null || true
    elif [ -f "$old_file" ] && [ -f "$new_file" ]; then
      # Both exist; remove old version and keep new
      rm -f "$old_file" 2>/dev/null || true
    fi
  done
}

# Parse flags for non-interactive install
choice=""
COPILOT_FLAG=false
COPILOT_CLI_FLAG=false
CODEX_FLAG=false
GEMINI_FLAG=false
DRY_RUN=false
CHECK_MODE=false
SUMMARY_PATH=""
VSCODE_PROFILE_MODE="auto"
MCP_PROFILE_MODE="auto"
AUTO_APPROVE=false
NO_AUTO_UPDATE=false

for arg in "$@"; do
  case "$arg" in
    --global) choice="2" ;;
    --project) choice="1" ;;
    --copilot) COPILOT_FLAG=true ;;
    --cli) COPILOT_CLI_FLAG=true ;;
    --codex) CODEX_FLAG=true ;;
    --gemini) GEMINI_FLAG=true ;;
    --yes) AUTO_APPROVE=true ;;
    --no-auto-update) NO_AUTO_UPDATE=true ;;
    --check) CHECK_MODE=true ;;
    --dry-run) DRY_RUN=true ;;
    --vscode-stable) VSCODE_PROFILE_MODE=$(set_profile_mode "$VSCODE_PROFILE_MODE" "stable") ;;
    --vscode-insiders) VSCODE_PROFILE_MODE=$(set_profile_mode "$VSCODE_PROFILE_MODE" "insiders") ;;
    --vscode-both) VSCODE_PROFILE_MODE=$(set_profile_mode "$VSCODE_PROFILE_MODE" "both") ;;
    --mcp-profile-stable) MCP_PROFILE_MODE=$(set_profile_mode "$MCP_PROFILE_MODE" "stable") ;;
    --mcp-profile-insiders) MCP_PROFILE_MODE=$(set_profile_mode "$MCP_PROFILE_MODE" "insiders") ;;
    --mcp-profile-both) MCP_PROFILE_MODE=$(set_profile_mode "$MCP_PROFILE_MODE" "both") ;;
    --summary=*) SUMMARY_PATH="${arg#--summary=}" ;;
  esac
done


if [ -z "$choice" ]; then
  if ! has_tty; then
    echo "  Error: choose either --project or --global when running non-interactively."
    exit 1
  fi
  echo ""
  echo "  Accessibility Agents Installer"
  echo "  Started by Taylor Arndt"
  echo "  ================================"
  echo ""
  echo "  Where would you like to install?"
  echo ""
  echo "  1) Project   - Install to .claude/ in the current directory"
  echo "                  (recommended, check into version control)"
  echo ""
  echo "  2) Global    - Install to ~/.claude/"
  echo "                  (available in all your projects)"
  echo ""
  printf "  Choose [1/2]: "
  read -r choice < /dev/tty
fi

case "$choice" in
  1)
    TARGET_DIR="$(pwd)/.claude"
    echo ""
    echo "  Installing to project: $(pwd)"
    ;;
  2)
    TARGET_DIR="$HOME/.claude"
    echo ""
    echo "  Installing globally to: $TARGET_DIR"
    ;;
  *)
    echo "  Invalid choice. Exiting."
    [ "$DOWNLOADED" = true ] && rm -rf "$TMPDIR_DL"
    exit 1
    ;;
esac

SELECTED_COPILOT_PROFILES="$(select_vscode_profiles "$VSCODE_PROFILE_MODE")"
SELECTED_MCP_PROFILES="$(select_vscode_profiles "$MCP_PROFILE_MODE")"

if [ -z "$SUMMARY_PATH" ]; then
  if [ "$DRY_RUN" = true ] || [ "$CHECK_MODE" = true ]; then
    SUMMARY_PATH="${HOME}/.a11y-agent-team-install-plan.json"
  elif [ "$choice" = "1" ]; then
    SUMMARY_PATH="$(pwd)/.a11y-agent-team-install-summary.json"
  else
    SUMMARY_PATH="$HOME/.a11y-agent-team-install-summary.json"
  fi
fi

BACKUP_METADATA_PATH="$(initialize_operation_state install "$([ "$choice" = "1" ] && pwd || printf '%s' "$HOME")" "$SUMMARY_PATH" "$DRY_RUN" "$CHECK_MODE" "$TARGET_DIR" "$TARGET_DIR/.a11y-agent-manifest" "$TARGET_DIR/.a11y-agent-team-version")"

if [ "$CHECK_MODE" = true ]; then
  CHECK_NOTES=("Check mode only. No files were changed.")
  write_summary_file "$SUMMARY_PATH" "{\"schemaVersion\":\"1.0\",\"timestampUtc\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"operation\":\"install\",\"dryRun\":false,\"check\":true,\"scope\":\"$([ \"$choice\" = \"1\" ] && echo project || echo global)\",\"targetDir\":\"$(json_escape "$TARGET_DIR")\",\"requestedOptions\":{\"copilot\":$(json_bool "$COPILOT_FLAG"),\"copilotCli\":$(json_bool "$COPILOT_CLI_FLAG"),\"codex\":$(json_bool "$CODEX_FLAG"),\"gemini\":$(json_bool "$GEMINI_FLAG"),\"autoApprove\":$(json_bool "$AUTO_APPROVE"),\"noAutoUpdate\":$(json_bool "$NO_AUTO_UPDATE"),\"vscodeProfileMode\":\"$VSCODE_PROFILE_MODE\",\"mcpProfileMode\":\"$MCP_PROFILE_MODE\"},\"selectedCopilotProfiles\":$(json_array_from_profiles "$SELECTED_COPILOT_PROFILES" path),\"selectedMcpProfiles\":$(json_array_from_profiles "$SELECTED_MCP_PROFILES" settings),\"backupMetadataPath\":\"$(json_escape "$BACKUP_METADATA_PATH")\",\"notes\":$(json_array_from_notes "${CHECK_NOTES[@]}")}"
  echo ""
  echo "  Check mode only. No files will be changed."
  echo "  Summary file: $SUMMARY_PATH"
  echo "  Backup metadata: $BACKUP_METADATA_PATH"
  [ "$DOWNLOADED" = true ] && rm -rf "$TMPDIR_DL"
  exit 0
fi

if [ "$DRY_RUN" = true ]; then
  DRY_RUN_NOTES=()
  if [ "$AUTO_APPROVE" = true ]; then
    DRY_RUN_NOTES+=("Optional prompts would be auto-approved because --yes was supplied.")
  fi
  if [ "$NO_AUTO_UPDATE" = true ]; then
    DRY_RUN_NOTES+=("Auto-update setup would be skipped because --no-auto-update was supplied.")
  fi
  if [ "$COPILOT_FLAG" = false ] && [ "$COPILOT_CLI_FLAG" = false ] && [ "$CODEX_FLAG" = false ] && [ "$GEMINI_FLAG" = false ]; then
    DRY_RUN_NOTES+=("Optional platforms were not selected in dry-run mode. Use --copilot, --cli, --codex, and/or --gemini to preview them explicitly.")
  fi
  echo ""
  echo "  Dry run only. No files will be changed."
  echo "  Scope: $([ "$choice" = "1" ] && echo project || echo global)"
  echo "  Target: $TARGET_DIR"
  if [ "$choice" = "2" ]; then
    echo "  VS Code profiles in scope:"
    if [ -n "$SELECTED_COPILOT_PROFILES" ]; then
      while IFS='|' read -r key label path; do
        [ -n "$path" ] && echo "    -> $label: $path"
      done <<< "$SELECTED_COPILOT_PROFILES"
    else
      echo "    -> none detected for the requested profile filter"
    fi
    echo "  MCP settings targets:"
    if [ -n "$SELECTED_MCP_PROFILES" ]; then
      while IFS='|' read -r key label path; do
        [ -n "$path" ] && echo "    -> $label: $path/settings.json"
      done <<< "$SELECTED_MCP_PROFILES"
    else
      echo "    -> none detected for the requested profile filter"
    fi
  fi
  write_summary_file "$SUMMARY_PATH" "{\"schemaVersion\":\"1.0\",\"timestampUtc\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"operation\":\"install\",\"dryRun\":true,\"check\":false,\"scope\":\"$([ \"$choice\" = \"1\" ] && echo project || echo global)\",\"targetDir\":\"$(json_escape "$TARGET_DIR")\",\"requestedOptions\":{\"copilot\":$(json_bool "$COPILOT_FLAG"),\"copilotCli\":$(json_bool "$COPILOT_CLI_FLAG"),\"codex\":$(json_bool "$CODEX_FLAG"),\"gemini\":$(json_bool "$GEMINI_FLAG"),\"autoApprove\":$(json_bool "$AUTO_APPROVE"),\"noAutoUpdate\":$(json_bool "$NO_AUTO_UPDATE"),\"vscodeProfileMode\":\"$VSCODE_PROFILE_MODE\",\"mcpProfileMode\":\"$MCP_PROFILE_MODE\"},\"selectedCopilotProfiles\":$(json_array_from_profiles "$SELECTED_COPILOT_PROFILES" path),\"selectedMcpProfiles\":$(json_array_from_profiles "$SELECTED_MCP_PROFILES" settings),\"backupMetadataPath\":\"$(json_escape "$BACKUP_METADATA_PATH")\",\"notes\":$(json_array_from_notes "${DRY_RUN_NOTES[@]}")}"
  echo "  Summary file: $SUMMARY_PATH"
  [ "$DOWNLOADED" = true ] && rm -rf "$TMPDIR_DL"
  exit 0
fi

# ---------------------------------------------------------------------------
# merge_config_file src dst label
# Appends/updates our section in a config markdown file using section markers.
# Never overwrites user content above or below our section.
# ---------------------------------------------------------------------------
merge_config_file() {
  local src="$1" dst="$2" label="$3"
  local start end legacy_start legacy_end
  case "$dst" in
    *.toml)
      start="# a11y-agent-team: start"
      end="# a11y-agent-team: end"
      legacy_start="# accessibility-agents: start"
      legacy_end="# accessibility-agents: end"
      ;;
    *)
      start="<!-- a11y-agent-team: start -->"
      end="<!-- a11y-agent-team: end -->"
      legacy_start="<!-- accessibility-agents: start -->"
      legacy_end="<!-- accessibility-agents: end -->"
      ;;
  esac
  if [ ! -f "$dst" ]; then
    { printf '%s\n' "$start"; cat "$src"; printf '%s\n' "$end"; } > "$dst"
    echo "    + $label (created)"
    return
  fi
  if grep -qF "$start" "$dst" 2>/dev/null || grep -qF "$legacy_start" "$dst" 2>/dev/null; then
    if command -v python3 &>/dev/null; then
      python3 - "$src" "$dst" "$start" "$end" "$legacy_start" "$legacy_end" << 'PYEOF'
import re, sys
src_text = open(sys.argv[1]).read().rstrip()
dst_path = sys.argv[2]
dst_text = open(dst_path).read()
start = sys.argv[3]
end = sys.argv[4]
legacy_start = sys.argv[5]
legacy_end = sys.argv[6]
block = start + "\n" + src_text + "\n" + end
patterns = [re.escape(start) + r".*?" + re.escape(end)]
if legacy_start and legacy_end:
    patterns.append(re.escape(legacy_start) + r".*?" + re.escape(legacy_end))
combined = r"(?s)(?:" + "|".join(patterns) + r")"
m = re.search(combined, dst_text)
if m:
    insert_pos = m.start()
    cleaned = re.sub(combined, "", dst_text)
    updated = cleaned[:insert_pos] + block + cleaned[insert_pos:]
else:
    updated = dst_text
open(dst_path, "w").write(updated)
PYEOF
      echo "    ~ $label (updated our existing section)"
    else
      echo "    ! $label (section exists; python3 unavailable to update - edit manually)"
    fi
  else
    # For TOML files: guard against inserting duplicate table headers
    _toml_dup=""
    case "$dst" in
      *.toml)
        if command -v python3 &>/dev/null; then
          _toml_dup=$(python3 - "$src" "$dst" << 'PYEOF'
import re, sys
src_hdrs = set(re.findall(r'^\[[\w.\- "\']+\]', open(sys.argv[1]).read(), re.MULTILINE))
dst_hdrs = set(re.findall(r'^\[[\w.\- "\']+\]', open(sys.argv[2]).read(), re.MULTILINE))
dupes = src_hdrs & dst_hdrs
if dupes:
    print(",".join(sorted(dupes)))
PYEOF
          )
        fi
        ;;
    esac
    if [ -n "$_toml_dup" ]; then
      echo "    ! $label (skipped — TOML table headers already exist in destination: $_toml_dup)"
    else
      { printf '\n%s\n' "$start"; cat "$src"; printf '%s\n' "$end"; echo; } >> "$dst"
      echo "    + $label (merged into your existing file)"
    fi
  fi
}

# ---------------------------------------------------------------------------
# configure_vscode_mcp_settings settings_file server_url
# Adds or updates the VS Code MCP server entry for a11y-agent-team.
# ---------------------------------------------------------------------------
configure_vscode_mcp_settings() {
  local settings_file="$1"
  local server_url="$2"

  mkdir -p "$(dirname "$settings_file")"

  if command -v python3 &>/dev/null; then
    if A11Y_SF="$settings_file" A11Y_MCP_URL="$server_url" python3 - << 'PYEOF' 2>/dev/null
import json, os, sys
sf = os.environ['A11Y_SF']
url = os.environ['A11Y_MCP_URL']
try:
    if os.path.exists(sf):
        raw = open(sf, 'r', encoding='utf-8').read().strip()
        data = json.loads(raw) if raw else {}
    else:
        data = {}
except Exception:
    sys.exit(2)

mcp = data.setdefault('mcp', {})
servers = mcp.setdefault('servers', {})
servers['a11y-agent-team'] = {'url': url}

with open(sf, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=4)
PYEOF
    then
      echo "    + MCP server configured in $settings_file"
      return 0
    fi
    echo "    ! Could not safely update $settings_file"
  else
    echo "    ! python3 not found, so VS Code settings were not edited automatically"
  fi

  echo "      Add this manually: { \"mcp\": { \"servers\": { \"a11y-agent-team\": { \"url\": \"$server_url\" } } } }"
  return 1
}

node_major_version() {
  command -v node &>/dev/null || return 1
  node -p "process.versions.node.split('.')[0]" 2>/dev/null
}

java_major_version() {
  command -v java &>/dev/null || return 1
  local java_line
  java_line="$(java -version 2>&1 | head -n 1)"
  if [[ "$java_line" =~ \"([0-9]+)\.([0-9]+) ]]; then
    if [ "${BASH_REMATCH[1]}" = "1" ]; then
      echo "${BASH_REMATCH[2]}"
    else
      echo "${BASH_REMATCH[1]}"
    fi
    return 0
  fi
  if [[ "$java_line" =~ \"([0-9]+) ]]; then
    echo "${BASH_REMATCH[1]}"
    return 0
  fi
  if [[ "$java_line" =~ ([0-9]+) ]]; then
    echo "${BASH_REMATCH[1]}"
    return 0
  fi
  return 1
}

ensure_nodejs_runtime() {
  local node_major=""

  if command -v node &>/dev/null && command -v npm &>/dev/null; then
    node_major="$(node_major_version || true)"
    if [ -n "$node_major" ] && [ "$node_major" -ge 18 ]; then
      return 0
    fi
  fi

  echo ""
  if command -v node &>/dev/null; then
    node_major="$(node_major_version || true)"
    if [ -n "$node_major" ]; then
      echo "  Detected Node.js $node_major, but the MCP server requires Node.js 18 or later."
    else
      echo "  Node.js is installed, but its version could not be verified."
    fi
  else
    echo "  Node.js and npm were not found."
  fi

  if command -v brew &>/dev/null; then
    if has_tty || [ "$AUTO_APPROVE" = true ]; then
      echo "  The installer can install Node.js using Homebrew."
      if read_yes_no "Install Node.js now?" true; then
        brew install node || true
      fi
    fi
  else
    echo "  Automatic Node.js install is only supported by this shell installer on macOS via Homebrew."
  fi

  if command -v node &>/dev/null && command -v npm &>/dev/null; then
    node_major="$(node_major_version || true)"
    if [ -n "$node_major" ] && [ "$node_major" -ge 18 ]; then
      echo "    + Node.js runtime is ready for the MCP server"
      return 0
    fi
  fi

  echo "  MCP setup can continue, but scanning will remain unavailable until Node.js 18+ and npm are installed."
  echo "  Manual fallback: https://nodejs.org/en/download"
  echo "  After installing Node.js, reopen your terminal and run:"
  echo "    cd \"$MCP_DEST\" && npm install"
  return 1
}

read_yes_no() {
  local prompt="$1"
  local default_yes="$2"
  local reply=""
  local suffix="[y/N]"

  [ "$default_yes" = true ] && suffix="[Y/n]"
  if [ "$AUTO_APPROVE" = true ]; then
    return 0
  fi

  if has_tty; then
    printf "  %s %s: " "$prompt" "$suffix"
    read -r reply < /dev/tty
  else
    [ "$default_yes" = true ]
    return
  fi

  if [ -z "$reply" ]; then
    [ "$default_yes" = true ]
    return
  fi

  [ "$reply" = "y" ] || [ "$reply" = "Y" ]
}

choose_mcp_capability_plan() {
  MCP_PLAN_FOCUS="Baseline scanning"
  MCP_PLAN_BROWSER=false
  MCP_PLAN_PDF_FORMS=false
  MCP_PLAN_DEEP_PDF=false
  MCP_PLAN_CONFIGURE_VSCODE=true

  if [ "$AUTO_APPROVE" = true ] || ! has_tty; then
    return
  fi

  echo ""
  echo "  Choose your MCP setup focus:"
  echo ""
  echo "  1) Baseline scanning"
  echo "  2) Browser testing"
  echo "  3) PDF-heavy workflow"
  echo "  4) Everything"
  echo "  5) Custom"
  echo ""
  printf "  Choose [1/2/3/4/5]: "
  read -r mcp_plan_choice < /dev/tty

  case "$mcp_plan_choice" in
    1)
      MCP_PLAN_FOCUS="Baseline scanning"
      ;;
    2)
      MCP_PLAN_FOCUS="Browser testing"
      MCP_PLAN_BROWSER=true
      ;;
    3)
      MCP_PLAN_FOCUS="PDF-heavy workflow"
      MCP_PLAN_PDF_FORMS=true
      MCP_PLAN_DEEP_PDF=true
      ;;
    4)
      MCP_PLAN_FOCUS="Everything"
      MCP_PLAN_BROWSER=true
      MCP_PLAN_PDF_FORMS=true
      MCP_PLAN_DEEP_PDF=true
      ;;
    5)
      MCP_PLAN_FOCUS="Custom"
      read_yes_no "Enable browser tools?" false && MCP_PLAN_BROWSER=true
      read_yes_no "Enable PDF form tools?" false && MCP_PLAN_PDF_FORMS=true
      read_yes_no "Enable deep PDF validation?" false && MCP_PLAN_DEEP_PDF=true
      read_yes_no "Configure VS Code MCP?" true && MCP_PLAN_CONFIGURE_VSCODE=true
      ;;
    *)
      MCP_PLAN_FOCUS="Baseline scanning"
      ;;
  esac
}

show_mcp_capability_warnings() {
  echo ""
  echo "  MCP capability plan: $MCP_PLAN_FOCUS"
  echo "    - Baseline scanning installs the MCP server plus core npm dependencies"
  if [ "$MCP_PLAN_BROWSER" = true ]; then
    echo "    - Browser testing needs Playwright, axe-core, and Chromium"
    echo "    - Browser scans run against live pages and can take longer to install"
  fi
  if [ "$MCP_PLAN_PDF_FORMS" = true ]; then
    echo "    - PDF form conversion needs the optional pdf-lib package"
  fi
  if [ "$MCP_PLAN_DEEP_PDF" = true ]; then
    echo "    - Deep PDF validation needs Java 11+ and veraPDF"
    echo "    - Baseline PDF scanning still works even if deep validation is not ready"
  fi
  echo "    - Python is not required for MCP runtime"
  echo "    - macOS is supported by this shell installer; Linux is not part of the guided installer target"
}

# ---------------------------------------------------------------------------
# show_pdf_deep_validation_readiness
# Prints whether Java and veraPDF are available for run_verapdf_scan.
# ---------------------------------------------------------------------------
show_pdf_deep_validation_readiness() {
  local java_line=""
  local verapdf_line=""
  local java_ok=false
  local verapdf_ok=false
  local java_major=""

  if command -v java &>/dev/null; then
    java_ok=true
    java_line="$(java -version 2>&1 | head -n 1)"
    java_major="$(java_major_version || true)"
  fi

  if command -v verapdf &>/dev/null; then
    verapdf_ok=true
    verapdf_line="$(verapdf --version 2>&1 | head -n 1)"
  fi

  echo ""
  echo "  PDF Deep Validation Readiness:"

  if [ "$java_ok" = true ]; then
    if [ -n "$java_line" ]; then
      if [ -n "$java_major" ] && [ "$java_major" -ge 11 ]; then
        echo "    [x] Java detected: $java_line"
      else
        echo "    [!] Java detected but too old: $java_line"
      fi
    else
      if [ -n "$java_major" ] && [ "$java_major" -ge 11 ]; then
        echo "    [x] Java command found"
      else
        echo "    [!] Java command found, but version could not be confirmed as 11+"
      fi
    fi
  else
    echo "    [ ] Java not detected"
  fi

  if [ "$verapdf_ok" = true ]; then
    if [ -n "$verapdf_line" ]; then
      echo "    [x] veraPDF detected: $verapdf_line"
    else
      echo "    [x] veraPDF command found"
    fi
  else
    echo "    [ ] veraPDF not detected"
  fi

  if [ "$java_ok" = true ] && [ -n "$java_major" ] && [ "$java_major" -ge 11 ] && [ "$verapdf_ok" = true ]; then
    echo "    READY: run_verapdf_scan should be available once the MCP server is running."
  elif [ "$java_ok" = true ] && [ -n "$java_major" ] && [ "$java_major" -ge 11 ]; then
    echo "    PARTIAL: Java is ready, but veraPDF still needs to be installed."
  elif [ "$java_ok" = true ]; then
    echo "    NOT READY: Java 11 or later is required before veraPDF can run."
  else
    echo "    NOT READY: scan_pdf_document will work, but run_verapdf_scan will not yet be available."
  fi
}

mcp_health_smoke_test() {
  local working_dir="$1"
  local port=""
  local log_file=""
  local pid=""
  local success=false

  if ! command -v node &>/dev/null || ! command -v npm &>/dev/null; then
    echo "[ ] SKIPPED|Baseline MCP prerequisites are not fully installed yet."
    return 0
  fi

  local node_major="$(node_major_version || true)"
  if [ -z "$node_major" ] || [ "$node_major" -lt 18 ]; then
    echo "[ ] SKIPPED|Baseline MCP prerequisites are not fully installed yet."
    return 0
  fi

  if ! node_module_available "$working_dir" "@modelcontextprotocol/sdk" || ! node_module_available "$working_dir" "zod"; then
    echo "[ ] SKIPPED|Baseline MCP prerequisites are not fully installed yet."
    return 0
  fi

  port=$((4300 + RANDOM % 200))
  log_file="$(mktemp)"
  (
    cd "$working_dir" && \
    PORT="$port" A11Y_MCP_HOST=127.0.0.1 A11Y_MCP_STATELESS=1 node server.js
  ) >"$log_file" 2>&1 &
  pid=$!

  for _ in $(seq 1 20); do
    sleep 1
    if command -v curl &>/dev/null; then
      if curl -fsS "http://127.0.0.1:$port/health" 2>/dev/null | grep -q '"status":"ok"'; then
        success=true
        break
      fi
    elif command -v python3 &>/dev/null; then
      if python3 - <<PYEOF "$port" >/dev/null 2>&1
import json, sys, urllib.request
port = sys.argv[1]
with urllib.request.urlopen(f'http://127.0.0.1:{port}/health', timeout=2) as response:
    data = json.load(response)
    raise SystemExit(0 if data.get('status') == 'ok' else 1)
PYEOF
      then
        success=true
        break
      fi
    fi
  done

  if [ -n "$pid" ]; then
    kill "$pid" 2>/dev/null || true
    wait "$pid" 2>/dev/null || true
  fi

  if [ "$success" = true ]; then
    rm -f "$log_file"
    echo "[x] READY|HTTP health check passed on port $port."
    return 0
  fi

  local detail="The temporary MCP server did not answer /health in time."
  if [ -f "$log_file" ]; then
    local first_line
    first_line="$(head -n 1 "$log_file")"
    if [ -n "$first_line" ]; then
      detail="$first_line"
    fi
  fi
  rm -f "$log_file"
  echo "[ ] FAILED|$detail"
}

# ---------------------------------------------------------------------------
# node_module_available working_dir module_name
# Returns success if the Node module can be imported from the given directory.
# ---------------------------------------------------------------------------
node_module_available() {
  local working_dir="$1"
  local module_name="$2"

  command -v node &>/dev/null || return 1
  [ -n "$working_dir" ] && [ -d "$working_dir" ] || return 1

  (cd "$working_dir" && node -e "import('$module_name').then(() => process.exit(0)).catch(() => process.exit(1))" >/dev/null 2>&1)
}

# ---------------------------------------------------------------------------
# playwright_chromium_ready working_dir
# Returns success if Playwright can resolve an installed Chromium executable.
# ---------------------------------------------------------------------------
playwright_chromium_ready() {
  local working_dir="$1"

  command -v node &>/dev/null || return 1
  [ -n "$working_dir" ] && [ -d "$working_dir" ] || return 1

  (cd "$working_dir" && node -e "import('playwright').then(async ({ chromium }) => { const fs = await import('node:fs'); const exe = chromium.executablePath(); process.exit(exe && fs.existsSync(exe) ? 0 : 1); }).catch(() => process.exit(1))" >/dev/null 2>&1)
}

# ---------------------------------------------------------------------------
# show_mcp_capability_readiness working_dir
# Prints readiness for optional MCP capabilities.
# ---------------------------------------------------------------------------
show_mcp_capability_readiness() {
  local working_dir="$1"
  local node_ready=false
  local npm_ready=false
  local core_ready=false
  local python_ready=false
  local java_ready=false
  local verapdf_ready=false
  local playwright_ready=false
  local chromium_ready=false
  local pdf_lib_ready=false
  local node_major=""
  local java_major=""
  local smoke_result=""
  local smoke_label=""
  local smoke_detail=""

  if command -v node &>/dev/null; then
    node_major="$(node_major_version || true)"
    if [ -n "$node_major" ] && [ "$node_major" -ge 18 ]; then
      node_ready=true
    fi
  fi
  command -v npm &>/dev/null && npm_ready=true
  if node_module_available "$working_dir" "@modelcontextprotocol/sdk" && node_module_available "$working_dir" "zod"; then
    core_ready=true
  fi
  command -v python3 &>/dev/null && python_ready=true
  if command -v java &>/dev/null; then
    java_major="$(java_major_version || true)"
    if [ -n "$java_major" ] && [ "$java_major" -ge 11 ]; then
      java_ready=true
    fi
  fi
  command -v verapdf &>/dev/null && verapdf_ready=true
  node_module_available "$working_dir" "playwright" && playwright_ready=true
  node_module_available "$working_dir" "pdf-lib" && pdf_lib_ready=true
  playwright_chromium_ready "$working_dir" && chromium_ready=true
  smoke_result="$(mcp_health_smoke_test "$working_dir")"
  smoke_label="${smoke_result%%|*}"
  smoke_detail="${smoke_result#*|}"

  echo ""
  echo "  MCP Optional Capability Readiness:"
  if [ -n "$node_major" ]; then
    if [ "$node_ready" = true ]; then
      echo "    Node.js runtime (18+):                  [x] READY (v$node_major)"
    else
      echo "    Node.js runtime (18+):                  [!] TOO OLD (v$node_major)"
    fi
  else
    echo "    Node.js runtime (18+):                  [ ] NOT READY"
  fi
  echo "    npm CLI:                                $([ "$npm_ready" = true ] && echo '[x] READY' || echo '[ ] NOT READY')"
  echo "    MCP core dependencies:                  $([ "$core_ready" = true ] && echo '[x] READY' || echo '[ ] NOT READY')"
  echo "    Python 3 helper (installer only):       $([ "$python_ready" = true ] && echo '[x] OPTIONAL' || echo '[ ] OPTIONAL')"
  if [ "$node_ready" = true ] && [ "$npm_ready" = true ] && [ "$core_ready" = true ]; then
    echo "    Baseline PDF scan (scan_pdf_document):  [x] READY"
  else
    echo "    Baseline PDF scan (scan_pdf_document):  [ ] NOT READY"
  fi
  if [ -n "$java_major" ]; then
    if [ "$java_ready" = true ]; then
      echo "    Deep PDF validation (Java 11+):       [x] READY (v$java_major)"
    else
      echo "    Deep PDF validation (Java 11+):       [!] TOO OLD (v$java_major)"
    fi
  else
    echo "    Deep PDF validation (Java 11+):       [ ] NOT READY"
  fi
  echo "    Deep PDF validation (veraPDF):        $([ "$verapdf_ready" = true ] && echo '[x] READY' || echo '[ ] NOT READY')"
  echo "    Local MCP health smoke test:          $smoke_label"
  echo "    Playwright package:                   $([ "$playwright_ready" = true ] && echo '[x] READY' || echo '[ ] NOT READY')"
  echo "    Chromium browser bundle:              $([ "$chromium_ready" = true ] && echo '[x] READY' || echo '[ ] NOT READY')"
  echo "    PDF form conversion (pdf-lib):        $([ "$pdf_lib_ready" = true ] && echo '[x] READY' || echo '[ ] NOT READY')"

  if [ "$node_ready" != true ] || [ "$npm_ready" != true ] || [ "$core_ready" != true ]; then
    echo "    Baseline scanning needs Node.js 18+, npm, and MCP server dependencies in the MCP directory."
  fi
  if [ "$python_ready" != true ]; then
    echo "    Python 3 is not required for MCP runtime. Without it, some shell-installer config edits fall back to manual steps."
  fi
  if [ -n "$smoke_detail" ]; then
    echo "    Smoke test detail: $smoke_detail"
  fi
  if [ "$playwright_ready" != true ] || [ "$chromium_ready" != true ]; then
    echo "    Browser-based scans need Playwright plus Chromium."
  fi
  if [ "$pdf_lib_ready" != true ]; then
    echo "    PDF form conversion needs pdf-lib in the MCP server directory."
  fi
}

# ---------------------------------------------------------------------------
# register_plugin src_dir
# Registers accessibility-agents as a Claude Code plugin for global installs.
# Copies to plugin cache, updates installed_plugins.json and settings.json.
# ---------------------------------------------------------------------------
register_plugin() {
  local src="$1"
  local namespace="community-access"
  local name="accessibility-agents"
  local default_key="${name}@${namespace}"
  local plugins_json="$HOME/.claude/plugins/installed_plugins.json"
  local settings_json="$HOME/.claude/settings.json"

  echo ""
  echo "  Registering Claude Code plugin..."

  # Ensure plugins directory exists
  mkdir -p "$HOME/.claude/plugins"

  local known_json="$HOME/.claude/plugins/known_marketplaces.json"
  local actual_key="$default_key"

  # ---- Step 1: Register the community-access marketplace ----
  # Claude Code only loads plugins from known marketplaces.
  # Without this, the plugin is silently skipped.
  if command -v python3 &>/dev/null; then
    python3 - "$known_json" "$namespace" "$src" << 'PYEOF'
import json, sys, os, datetime
known_path, ns, plugin_src = sys.argv[1:4]

# Read existing or create new
if os.path.isfile(known_path):
    with open(known_path) as f:
        data = json.load(f)
else:
    data = {}

if ns not in data:
    # Create a marketplace directory alongside the plugin source
    marketplace_dir = os.path.join(os.path.dirname(plugin_src), ns + "-plugins")
    plugin_dir = os.path.join(marketplace_dir, "plugins")
    manifest_dir = os.path.join(marketplace_dir, ".claude-plugin")

    os.makedirs(plugin_dir, exist_ok=True)
    os.makedirs(manifest_dir, exist_ok=True)

    # Create marketplace.json if missing
    manifest_path = os.path.join(manifest_dir, "marketplace.json")
    if not os.path.isfile(manifest_path):
        manifest = {
            "name": ns,
            "owner": {"name": "Community Access"},
            "metadata": {"description": "Accessibility-focused Claude Code plugins"},
            "plugins": [{
                "name": "accessibility-agents",
                "source": "./plugins/accessibility-agents",
                "description": "WCAG AA accessibility enforcement with 55 agents and enforcement hooks.",
                "version": "1.0.0"
            }]
        }
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)

    # Symlink the plugin source into the marketplace
    link_target = os.path.join(plugin_dir, "accessibility-agents")
    if not os.path.exists(link_target):
        os.symlink(plugin_src, link_target)

    # Register marketplace
    now = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
    data[ns] = {
        "source": {"source": "directory", "path": marketplace_dir},
        "installLocation": marketplace_dir,
        "lastUpdated": now
    }
    with open(known_path, 'w') as f:
        json.dump(data, f, indent=2)
    print("    + Registered community-access marketplace")
else:
    print("    ~ community-access marketplace already registered")
PYEOF
  else
    echo "    ! python3 required for marketplace registration"
  fi

  # ---- Step 2: Detect existing registration (for upgrades) ----
  if [ -f "$plugins_json" ] && command -v python3 &>/dev/null; then
    local found_key
    found_key=$(python3 -c "
import json
data = json.load(open('$plugins_json'))
for k in data.get('plugins', {}):
    if k.startswith('accessibility-agents@'):
        print(k)
        break
" 2>/dev/null)
    if [ -n "$found_key" ]; then
      actual_key="$found_key"
      namespace="${actual_key#accessibility-agents@}"
    fi
  fi

  local cache="$HOME/.claude/plugins/cache/${namespace}/${name}/${PLUGIN_VERSION}"

  # ---- Step 3: Copy plugin to cache ----
  mkdir -p "$cache"
  cp -R "$src/." "$cache/"
  chmod +x "$cache/scripts/"*.sh 2>/dev/null || true
  echo "    + Plugin cached"

  # ---- Step 4: Register in installed_plugins.json ----
  if [ ! -f "$plugins_json" ]; then
    echo '{"version": 2, "plugins": {}}' > "$plugins_json"
  fi

  python3 - "$plugins_json" "$actual_key" "$cache" "$PLUGIN_VERSION" << 'PYEOF'
import json, sys, datetime
path, key, install_path, version = sys.argv[1:5]
with open(path) as f:
    data = json.load(f)
now = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S.000Z')
data.setdefault('version', 2)
data.setdefault('plugins', {})[key] = [{
    "scope": "user",
    "installPath": install_path,
    "version": version,
    "installedAt": now,
    "lastUpdated": now
}]
with open(path, 'w') as f:
    json.dump(data, f, indent=2)
PYEOF
  echo "    + Registered in installed_plugins.json ($actual_key)"

  # ---- Step 5: Enable in settings.json ----
  if [ ! -f "$settings_json" ]; then
    echo '{}' > "$settings_json"
  fi

  python3 - "$settings_json" "$actual_key" << 'PYEOF'
import json, sys
path, key = sys.argv[1:3]
with open(path) as f:
    data = json.load(f)
data.setdefault('enabledPlugins', {})[key] = True
with open(path, 'w') as f:
    json.dump(data, f, indent=2)
PYEOF
  echo "    + Enabled in settings.json"

  # ---- Step 6: Clean up stale skills/ directory from previous installs ----
  if [ -d "$cache/skills" ]; then
    rm -rf "$cache/skills"
    echo "    ~ Removed stale skills/ directory"
  fi

  # Summary
  local agent_count cmd_count
  agent_count=$(ls "$cache/agents/"*.md 2>/dev/null | wc -l)
  cmd_count=$(ls "$cache/commands/"*.md 2>/dev/null | wc -l)
  echo ""
  echo "  Plugin registered: $actual_key (v${PLUGIN_VERSION})"
  echo "    $agent_count agents"
  echo "    $cmd_count commands"
  echo "    3 enforcement hooks (UserPromptSubmit, PreToolUse, PostToolUse)"
}

# ---------------------------------------------------------------------------
# cleanup_old_install
# Removes agents/commands/skills from ~/.claude/ that were installed by a
# previous non-plugin install (using the manifest file).
# ---------------------------------------------------------------------------
cleanup_old_install() {
  local manifest="$HOME/.claude/.a11y-agent-manifest"
  [ -f "$manifest" ] || return 0

  echo ""
  echo "  Cleaning up previous non-plugin install..."
  local removed=0
  while IFS= read -r entry; do
    [ -n "$entry" ] || continue
    local file="$HOME/.claude/$entry"
    if [ -f "$file" ]; then
      rm "$file"
      removed=$((removed + 1))
    fi
  done < "$manifest"
  rm -f "$manifest"
  rmdir "$HOME/.claude/agents" 2>/dev/null || true
  rmdir "$HOME/.claude/commands" 2>/dev/null || true
  rmdir "$HOME/.claude/skills" 2>/dev/null || true
  if [ "$removed" -gt 0 ]; then
    echo "    Removed $removed files from previous install"
  fi
}

# ---------------------------------------------------------------------------
# install_global_hooks
# Installs three enforcement hooks:
#   1. a11y-team-eval.sh     (UserPromptSubmit) — Proactive web project detection
#   2. a11y-enforce-edit.sh  (PreToolUse)       — Blocks UI file edits without review
#   3. a11y-mark-reviewed.sh (PostToolUse)      — Creates session marker after review
# Merges all three into ~/.claude/settings.json.
# ---------------------------------------------------------------------------
install_global_hooks() {
  local hooks_dir="$HOME/.claude/hooks"
  local settings_json="$HOME/.claude/settings.json"

  mkdir -p "$hooks_dir"

  # ── Hook 1: Proactive web project detection (UserPromptSubmit) ──
  cat > "$hooks_dir/a11y-team-eval.sh" << 'HOOKSCRIPT'
#!/bin/bash
# Accessibility Agents - UserPromptSubmit hook
# Two detection modes:
#   1. PROACTIVE: Detects web projects by checking for framework files
#   2. KEYWORD: Falls back to keyword matching for non-web projects
# Installed by: accessibility-agents install.sh

INPUT=$(cat)
PROMPT=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('prompt','').lower())" 2>/dev/null || echo "")

# ── PROACTIVE DETECTION ──
IS_WEB_PROJECT=false

if [ -f "package.json" ]; then
  if grep -qiE '"(react|next|vue|nuxt|svelte|sveltekit|astro|angular|gatsby|remix|solid|qwik|vite|webpack|parcel|tailwindcss|@emotion|styled-components|sass|less)"' package.json 2>/dev/null; then
    IS_WEB_PROJECT=true
  fi
fi

if [ "$IS_WEB_PROJECT" = false ]; then
  for f in next.config.js next.config.mjs next.config.ts nuxt.config.ts vite.config.ts vite.config.js svelte.config.js astro.config.mjs angular.json tailwind.config.js tailwind.config.ts postcss.config.js postcss.config.mjs tsconfig.json; do
    if [ -f "$f" ]; then
      IS_WEB_PROJECT=true
      break
    fi
  done
fi

if [ "$IS_WEB_PROJECT" = false ]; then
  if find . -maxdepth 3 -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.vue" -o -name "*.svelte" -o -name "*.astro" \) -print -quit 2>/dev/null | grep -q .; then
    IS_WEB_PROJECT=true
  fi
fi

if [ "$IS_WEB_PROJECT" = false ]; then
  if find . -maxdepth 3 -type f \( -name "*.html" -o -name "*.ejs" -o -name "*.hbs" -o -name "*.leaf" -o -name "*.erb" -o -name "*.jinja" -o -name "*.twig" -o -name "*.blade.php" \) -print -quit 2>/dev/null | grep -q .; then
    IS_WEB_PROJECT=true
  fi
fi

# ── KEYWORD DETECTION ──
KEYWORDS="html|jsx|tsx|css|tailwind|react|next\.?js|vue|svelte|astro|angular|component|widget|form|modal|dialog|popover|drawer|toast|notification|aria|wcag|a11y|accessibility|accessible|contrast|focus|keyboard|tab order|tabindex|screen ?reader|voiceover|nvda|jaws|talkback|heading|alt text|alt=|landmark|template|leaf|ejs|erb|hbs|jinja|twig|blade|vapor|render|view|page|button|input|select|checkbox|radio|label|dropdown|menu|accordion|carousel|slider|tooltip|card|sidebar|navbar|layout|grid|flex|responsive|theme|dark mode|color|style|font|image|img|svg|icon|video|audio|link|href|navigation|breadcrumb|pagination|loading|spinner|progress|alert|banner|role=|tabpanel|tablist|listbox|combobox|live region|aria-live|aria-label|aria-hidden|sr-only|visually-hidden|skip link|ui|ux|front.?end|client.?side|browser|dom|hydrat|ssr|ssg|not announcing|not reading|not saying|cannot hear|broken announce|announce"
KEYWORD_MATCH=false
if echo "$PROMPT" | grep -qiE "$KEYWORDS"; then
  KEYWORD_MATCH=true
fi

# ── OUTPUT ──
if [ "$IS_WEB_PROJECT" = true ] || [ "$KEYWORD_MATCH" = true ]; then
  if [ "$IS_WEB_PROJECT" = true ]; then
    PROJECT_NOTE="DETECTED: This is a web project. Accessibility agents are ALWAYS required here."
  else
    PROJECT_NOTE="DETECTED: UI-related keywords found in prompt."
  fi

  cat <<HOOK_OUTPUT
INSTRUCTION: MANDATORY ACCESSIBILITY CHECK — YOU MUST FOLLOW THIS
${PROJECT_NOTE}

This is a NON-OPTIONAL instruction. You MUST use the accessibility agents
for ANY task in this project that touches user-facing code. This is proactive —
do not wait for the user to ask. If there is ANY chance the task involves UI,
delegate to the accessibility-lead FIRST.

REQUIRED ACTIONS:
1. Use the Agent tool to delegate to accessibility-agents:accessibility-lead
   (subagent_type: "accessibility-agents:accessibility-lead")
2. The accessibility-lead will coordinate specialist agents as needed
3. Do NOT write or edit UI code without accessibility-lead review FIRST
4. Do NOT skip this step even if you think you can handle it yourself
5. Be PROACTIVE: if the user asks to fix a bug, add a feature, or change
   anything in a web project, assume it involves UI until proven otherwise

This applies to ALL web projects, not just the accessibility-agents repo.

CROSS-TEAM COORDINATION:
- Swift/iOS code -> swift-agent-team:swift-lead handles Swift
- HTML/templates/components -> accessibility-agents:accessibility-lead handles web
- Both leads can run in parallel via separate Agent tool calls.
HOOK_OUTPUT
fi
HOOKSCRIPT

  # ── Hook 2: Edit gate (PreToolUse on Edit|Write) ──
  cat > "$hooks_dir/a11y-enforce-edit.sh" << 'HOOKSCRIPT'
#!/bin/bash
# Accessibility Agents - PreToolUse enforcement hook
# BLOCKS Edit/Write to UI files until accessibility-lead is consulted.
# Uses permissionDecision: "deny" to reject the tool call.
# Installed by: accessibility-agents install.sh

INPUT=$(cat)

eval "$(echo "$INPUT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
ti = data.get('tool_input', {})
print('FILE_PATH=' + repr(ti.get('file_path', '')))
print('SESSION_ID=' + repr(data.get('session_id', '')))
" 2>/dev/null || echo "FILE_PATH=''; SESSION_ID=''")"

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

IS_UI=false
case "$FILE_PATH" in
  *.jsx|*.tsx|*.vue|*.svelte|*.astro|*.html|*.ejs|*.hbs|*.leaf|*.erb|*.jinja|*.twig|*.blade.php)
    IS_UI=true ;;
  *.css|*.scss|*.less|*.sass)
    IS_UI=true ;;
esac

if [ "$IS_UI" = false ]; then
  case "$FILE_PATH" in
    */components/*|*/pages/*|*/views/*|*/layouts/*|*/templates/*)
      case "$FILE_PATH" in
        *.ts|*.js) IS_UI=true ;;
      esac ;;
  esac
fi

if [ "$IS_UI" = false ]; then
  exit 0
fi

MARKER="/tmp/a11y-reviewed-${SESSION_ID}"
if [ -n "$SESSION_ID" ] && [ -f "$MARKER" ]; then
  exit 0
fi

BASENAME=$(basename "$FILE_PATH")
cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "BLOCKED: Cannot edit UI file '${BASENAME}' without accessibility review. You MUST first delegate to accessibility-agents:accessibility-lead using the Agent tool (subagent_type: 'accessibility-agents:accessibility-lead'). After the accessibility review completes, this file will be unblocked automatically."
  }
}
EOF
exit 0
HOOKSCRIPT

  # ── Hook 3: Session marker (PostToolUse on Agent) ──
  cat > "$hooks_dir/a11y-mark-reviewed.sh" << 'HOOKSCRIPT'
#!/bin/bash
# Accessibility Agents - PostToolUse hook for Agent tool
# Creates a session marker when accessibility-lead has been consulted.
# This marker unlocks the a11y-enforce-edit.sh PreToolUse block.
# Installed by: accessibility-agents install.sh

INPUT=$(cat)

eval "$(echo "$INPUT" | python3 -c "
import sys, json
data = json.load(sys.stdin)
ti = data.get('tool_input', {})
subagent = ti.get('subagent_type', '')
session_id = data.get('session_id', '')
print('SUBAGENT=' + repr(subagent))
print('SESSION_ID=' + repr(session_id))
" 2>/dev/null || echo "SUBAGENT=''; SESSION_ID=''")"

if [ -n "$SESSION_ID" ]; then
  case "$SUBAGENT" in
    *accessibility-lead*|*accessibility-agents:accessibility-lead*)
      touch "/tmp/a11y-reviewed-${SESSION_ID}" ;;
  esac
fi

exit 0
HOOKSCRIPT

  chmod +x "$hooks_dir/a11y-team-eval.sh"
  chmod +x "$hooks_dir/a11y-enforce-edit.sh"
  chmod +x "$hooks_dir/a11y-mark-reviewed.sh"

  # ── Register all three hooks in settings.json ──
  if [ ! -f "$settings_json" ]; then
    echo '{}' > "$settings_json"
  fi

  python3 - "$settings_json" "$hooks_dir" << 'PYEOF'
import json, sys

settings_path = sys.argv[1]
hooks_dir = sys.argv[2]

with open(settings_path) as f:
    data = json.load(f)

hooks = data.setdefault("hooks", {})

# --- Helper: upsert a hook entry by matching a substring in the command ---
def upsert_hook(event_name, match_substr, new_entry):
    event_hooks = hooks.setdefault(event_name, [])
    replaced = False
    for i, entry in enumerate(event_hooks):
        for h in entry.get("hooks", []):
            if match_substr in h.get("command", ""):
                event_hooks[i] = new_entry
                replaced = True
                break
        if replaced:
            break
    if not replaced:
        event_hooks.append(new_entry)

# Hook 1: UserPromptSubmit — a11y-team-eval.sh
upsert_hook("UserPromptSubmit", "a11y-team-eval", {
    "hooks": [{"type": "command", "command": hooks_dir + "/a11y-team-eval.sh"}]
})

# Hook 2: PreToolUse — a11y-enforce-edit.sh (matcher: Edit|Write)
upsert_hook("PreToolUse", "a11y-enforce-edit", {
    "matcher": "Edit|Write",
    "hooks": [{"type": "command", "command": hooks_dir + "/a11y-enforce-edit.sh"}]
})

# Hook 3: PostToolUse — a11y-mark-reviewed.sh (matcher: Agent)
upsert_hook("PostToolUse", "a11y-mark-reviewed", {
    "matcher": "Agent",
    "hooks": [{"type": "command", "command": hooks_dir + "/a11y-mark-reviewed.sh"}]
})

with open(settings_path, "w") as f:
    json.dump(data, f, indent=2)
PYEOF

  echo "    + Hook 1: a11y-team-eval.sh (UserPromptSubmit — proactive web detection)"
  echo "    + Hook 2: a11y-enforce-edit.sh (PreToolUse — blocks UI edits without review)"
  echo "    + Hook 3: a11y-mark-reviewed.sh (PostToolUse — unlocks after review)"
  echo "    + All 3 hooks registered in settings.json"
}

# ---------------------------------------------------------------------------
# Installation: plugin (global) vs file-copy (project)
# ---------------------------------------------------------------------------
PLUGIN_INSTALL=false

if [ "$choice" = "2" ] && [ -n "$PLUGIN_SRC" ] && command -v python3 &>/dev/null; then
  # Global install: register as a Claude Code plugin
  INSTALL_PLUGIN=true
  if has_tty && [ "$AUTO_APPROVE" = false ]; then
    echo ""
    printf "  Would you like to install the Claude Code plugin? [Y/n]: "
    read -r plugin_choice < /dev/tty
    if [ "$plugin_choice" = "n" ] || [ "$plugin_choice" = "N" ]; then
      INSTALL_PLUGIN=false
    fi
  fi

  if [ "$INSTALL_PLUGIN" = true ]; then
    register_plugin "$PLUGIN_SRC"
    cleanup_old_install
    install_global_hooks
    PLUGIN_INSTALL=true
  fi
else
  # Project install (or global without plugin support): copy agents/skills directly

# Create directories
mkdir -p "$TARGET_DIR/agents"
if [ ${#SKILLS[@]} -gt 0 ]; then
  mkdir -p "$TARGET_DIR/skills"
fi

# Manifest: track which files we install so updates never touch user-created files
MANIFEST_FILE="$TARGET_DIR/.a11y-agent-manifest"
touch "$MANIFEST_FILE"

add_manifest_entry() {
  local entry="$1"
  grep -qxF "$entry" "$MANIFEST_FILE" 2>/dev/null || echo "$entry" >> "$MANIFEST_FILE"
}

# Copy agents — skip any file that already exists (preserves user customisations)
echo ""
echo "  Copying agents..."
SKIPPED_AGENTS=0
for agent in "${AGENTS[@]}"; do
  if [ ! -f "$AGENTS_SRC/$agent" ]; then
    echo "    ! Missing: $agent (skipped)"
    continue
  fi
  dst_agent="$TARGET_DIR/agents/$agent"
  name="${agent%.md}"
  if [ -f "$dst_agent" ]; then
    echo "    ~ $name (skipped - already exists)"
    SKIPPED_AGENTS=$((SKIPPED_AGENTS + 1))
  else
    cp "$AGENTS_SRC/$agent" "$dst_agent"
    add_manifest_entry "agents/$agent"
    echo "    + $name"
  fi
done
if [ "$SKIPPED_AGENTS" -gt 0 ]; then
  echo "      $SKIPPED_AGENTS agent(s) skipped. Delete them first to reinstall."
fi

# Copy skills — skip any file that already exists (preserves user customisations)
if [ ${#SKILLS[@]} -gt 0 ]; then
  echo ""
  echo "  Copying skills..."
  SKIPPED_SKILLS=0
  for skill in "${SKILLS[@]}"; do
    if [ ! -f "$SKILLS_SRC/$skill" ]; then
      echo "    ! Missing: $skill (skipped)"
      continue
    fi
    dst_skill="$TARGET_DIR/skills/$skill"
    name="${skill%.md}"
    if [ -f "$dst_skill" ]; then
      echo "    ~ /$name (skipped - already exists)"
      SKIPPED_SKILLS=$((SKIPPED_SKILLS + 1))
    else
      cp "$SKILLS_SRC/$skill" "$dst_skill"
      grep -qxF "skills/$skill" "$MANIFEST_FILE" 2>/dev/null || echo "skills/$skill" >> "$MANIFEST_FILE"
      echo "    + /$name"
    fi
  done
  if [ "$SKIPPED_SKILLS" -gt 0 ]; then
    echo "      $SKIPPED_SKILLS skill(s) skipped. Delete them first to reinstall."
  fi
  # Clean up stale commands/ directory from previous installs
  if [ -d "$TARGET_DIR/commands" ]; then
    rm -rf "$TARGET_DIR/commands"
    echo "    ~ Removed stale commands/ directory"
  fi
fi

fi  # end of project/fallback install path

# Merge CLAUDE.md snippet (optional)
if [ -n "$PLUGIN_CLAUDE_MD" ]; then
  echo ""
  MERGE_CLAUDE=false
  if read_yes_no "Merge CLAUDE.md rules?" false; then
    echo "  Would you like to merge accessibility rules into your project CLAUDE.md?"
    echo "  This adds the decision matrix and non-negotiable standards."
    MERGE_CLAUDE=true
  fi
  if [ "$MERGE_CLAUDE" = true ]; then
    if [ "$choice" = "1" ]; then
      CLAUDE_DST="$(pwd)/CLAUDE.md"
    else
      CLAUDE_DST="$HOME/CLAUDE.md"
    fi
    merge_config_file "$PLUGIN_CLAUDE_MD" "$CLAUDE_DST" "CLAUDE.md (accessibility rules)"
  fi
fi

# Copilot agents
COPILOT_INSTALLED=false
COPILOT_DESTINATIONS=()
install_copilot=false

if [ "$COPILOT_FLAG" = true ]; then
  install_copilot=true
elif read_yes_no "Install Copilot agents?" false; then
  echo ""
  echo "  Would you also like to install GitHub Copilot agents?"
  echo "  This adds accessibility agents for Copilot Chat in VS Code/GitHub."
  install_copilot=true
fi

if [ "$install_copilot" = true ]; then

    if [ "$choice" = "1" ]; then
      # Project install: put agents in .github/agents/
      PROJECT_DIR="$(pwd)"
      COPILOT_DST="$PROJECT_DIR/.github/agents"
      mkdir -p "$COPILOT_DST"
      COPILOT_DESTINATIONS+=("$COPILOT_DST")

      # Copy Copilot agents — skip files that already exist
      echo ""
      echo "  Copying Copilot agents..."
      if [ -d "$COPILOT_AGENTS_SRC" ]; then
        for f in "$COPILOT_AGENTS_SRC"/*; do
          [ -f "$f" ] || continue
          dst_f="$COPILOT_DST/$(basename "$f")"
          if [ -f "$dst_f" ]; then
            echo "    ~ $(basename "$f") (skipped - already exists)"
          else
            cp "$f" "$COPILOT_DST/"
            add_manifest_entry "copilot-agents/$(basename "$f")"
            echo "    + $(basename "$f")"
          fi
        done
      fi

      # Merge Copilot config files — appends our section, never overwrites
      echo ""
      echo "  Merging Copilot config..."
      for config in copilot-instructions.md copilot-review-instructions.md copilot-commit-message-instructions.md; do
        SRC="$COPILOT_CONFIG_SRC/$config"
        DST="$PROJECT_DIR/.github/$config"
        if [ -f "$SRC" ]; then
          merge_config_file "$SRC" "$DST" "$config"
          add_manifest_entry "copilot-config/$config"
        fi
      done

      # Copy asset subdirs — file-by-file, skip files that already exist
      for subdir in skills instructions prompts; do
        SRC_DIR="$COPILOT_CONFIG_SRC/$subdir"
        DST_DIR="$PROJECT_DIR/.github/$subdir"
        if [ -d "$SRC_DIR" ]; then
          # Migrate old prompt names to new agent-matching names (v2.x → v3.0)
          [ "$subdir" = "prompts" ] && migrate_prompts "$SRC_DIR"
          
          mkdir -p "$DST_DIR"
          added=0; skipped=0
          while IFS= read -r -d '' src_file; do
            rel="${src_file#$SRC_DIR/}"
            dst_file="$DST_DIR/$rel"
            mkdir -p "$(dirname "$dst_file")"
            if [ -f "$dst_file" ]; then
              skipped=$((skipped + 1))
            else
              cp "$src_file" "$dst_file"
              add_manifest_entry "copilot-$subdir/$rel"
              added=$((added + 1))
            fi
          done < <(find "$SRC_DIR" -type f -print0)
          echo "    + $subdir/ ($added new, $skipped skipped)"
        fi
      done

      COPILOT_INSTALLED=true

    else
      # Global install: copy .agent.md files directly into VS Code user profile folders.
      # This is the documented way to make agents available across all workspaces.
      COPILOT_CENTRAL="$HOME/.a11y-agent-team/copilot-agents"
      COPILOT_CENTRAL_PROMPTS="$HOME/.a11y-agent-team/copilot-prompts"
      COPILOT_CENTRAL_INSTRUCTIONS="$HOME/.a11y-agent-team/copilot-instructions-files"
      COPILOT_CENTRAL_SKILLS="$HOME/.a11y-agent-team/copilot-skills"
      LEGACY_COPILOT_ROOT="$HOME/.accessibility-agents"
      if [ ! -d "$HOME/.a11y-agent-team" ] && [ -d "$LEGACY_COPILOT_ROOT" ]; then
        mkdir -p "$HOME/.a11y-agent-team"
        cp -R "$LEGACY_COPILOT_ROOT/." "$HOME/.a11y-agent-team/" 2>/dev/null || true
        echo "  Migrated legacy Copilot store from $LEGACY_COPILOT_ROOT to $HOME/.a11y-agent-team"
      fi
      mkdir -p "$COPILOT_CENTRAL" "$COPILOT_CENTRAL_PROMPTS" "$COPILOT_CENTRAL_INSTRUCTIONS" "$COPILOT_CENTRAL_SKILLS"

      # Store a central copy for updates and a11y-copilot-init
      echo ""
      echo "  Storing Copilot agents centrally..."
      if [ -d "$COPILOT_AGENTS_SRC" ]; then
        for f in "$COPILOT_AGENTS_SRC"/*.agent.md; do
          [ -f "$f" ] || continue
          agent="$(basename "$f")"
          cp "$f" "$COPILOT_CENTRAL/$agent"
          name="${agent%.agent.md}"
          echo "    + $name"
        done
      fi

      # Store prompts, instructions, and skills centrally
      # Migrate old prompt names to new agent-matching names (v2.5 → v2.6)
      [ -d "$COPILOT_CONFIG_SRC/prompts" ] && migrate_prompts "$COPILOT_CONFIG_SRC/prompts"
      
      [ -d "$COPILOT_CONFIG_SRC/prompts" ]      && cp -r "$COPILOT_CONFIG_SRC/prompts/."      "$COPILOT_CENTRAL_PROMPTS/"
      [ -d "$COPILOT_CONFIG_SRC/instructions" ] && cp -r "$COPILOT_CONFIG_SRC/instructions/." "$COPILOT_CENTRAL_INSTRUCTIONS/"
      [ -d "$COPILOT_CONFIG_SRC/skills" ]       && cp -r "$COPILOT_CONFIG_SRC/skills/."       "$COPILOT_CENTRAL_SKILLS/"

      # Copy Copilot config files to central store
      for config in copilot-instructions.md copilot-review-instructions.md copilot-commit-message-instructions.md; do
        SRC="$COPILOT_CONFIG_SRC/$config"
        if [ -f "$SRC" ]; then
          cp "$SRC" "$HOME/.a11y-agent-team/$config"
        fi
      done

      # Copy .agent.md files into VS Code user profile folders.
      # VS Code discovers agents from User/prompts/.
      copy_to_vscode_profile() {
        local profile_dir="$1"
        local label="$2"
        local prompts_dir="$profile_dir/prompts"

        if [ ! -d "$profile_dir" ]; then
          return
        fi

        mkdir -p "$prompts_dir"
        echo "  [found] $label"

        # Copy agents to prompts/
        for f in "$COPILOT_CENTRAL"/*.agent.md; do
          [ -f "$f" ] || continue
          cp "$f" "$prompts_dir/"
        done

        # Copy prompts and instructions to prompts/
        [ -d "$COPILOT_CENTRAL_PROMPTS" ]      && cp -r "$COPILOT_CENTRAL_PROMPTS/."      "$prompts_dir/"
        [ -d "$COPILOT_CENTRAL_INSTRUCTIONS" ] && cp -r "$COPILOT_CENTRAL_INSTRUCTIONS/." "$prompts_dir/"

        # Clean up duplicates left by previous installer versions that wrote to User/ root
        for f in "$COPILOT_CENTRAL"/*.agent.md; do
          [ -f "$f" ] || continue
          rm -f "$profile_dir/$(basename "$f")"
        done
        if [ -d "$COPILOT_CENTRAL_PROMPTS" ]; then
          while IFS= read -r legacy_prompt; do
            rm -f "$profile_dir/$(basename "$legacy_prompt")"
          done < <(find "$COPILOT_CENTRAL_PROMPTS" -type f -name "*.prompt.md" 2>/dev/null)
        fi
        if [ -d "$COPILOT_CENTRAL_INSTRUCTIONS" ]; then
          while IFS= read -r legacy_instruction; do
            rm -f "$profile_dir/$(basename "$legacy_instruction")"
          done < <(find "$COPILOT_CENTRAL_INSTRUCTIONS" -type f -name "*.instructions.md" 2>/dev/null)
        fi

        echo "    Copied $(ls "$COPILOT_CENTRAL"/*.agent.md 2>/dev/null | wc -l | tr -d ' ') agents"

        # Disable .claude/agents in VS Code so Claude Code agents
        # don't appear in the Copilot agent picker
        local settings_file="$profile_dir/settings.json"
        if command -v python3 &>/dev/null; then
          A11Y_SF="$settings_file" \
          python3 - << 'PYEOF' 2>/dev/null && echo "    Configured agent discovery (disabled .claude/agents)"
import json, os
sf = os.environ['A11Y_SF']
try:
    with open(sf, 'r') as f:
        s = json.load(f)
except:
    s = {}
loc = s.get('chat.agentFilesLocations', {})
loc['.github/agents'] = True
loc['.claude/agents'] = False
s['chat.agentFilesLocations'] = loc
with open(sf, 'w') as f:
    json.dump(s, f, indent=4)
PYEOF
        fi

        COPILOT_DESTINATIONS+=("$prompts_dir")
      }

      # Detect installed VS Code editions
      echo ""
      stable_selected=false
      insiders_selected=false
      while IFS='|' read -r key label path; do
        [ -n "$path" ] || continue
        [ "$key" = "stable" ] && stable_selected=true
        [ "$key" = "insiders" ] && insiders_selected=true
      done <<< "$SELECTED_COPILOT_PROFILES"

      if [ "$stable_selected" = true ] && [ "$insiders_selected" = true ]; then
        echo "  Found both VS Code and VS Code Insiders."
        echo "  Installing Copilot assets into both profiles."
      fi

      while IFS='|' read -r key label path; do
        [ -n "$path" ] || continue
        copy_to_vscode_profile "$path" "$label"
      done <<< "$SELECTED_COPILOT_PROFILES"

      if [ -z "$SELECTED_COPILOT_PROFILES" ]; then
        echo "  No VS Code installation found. Copilot agents stored centrally only."
        echo "  Use 'a11y-copilot-init' to copy agents into individual projects."
      fi

      # Also create a11y-copilot-init for per-project use (repos to check into git)
      mkdir -p "$HOME/.a11y-agent-team"
      INIT_SCRIPT="$HOME/.a11y-agent-team/a11y-copilot-init"
      cat > "$INIT_SCRIPT" << 'INITSCRIPT'
#!/bin/bash
# Accessibility Agents - Copy Copilot agents into the current project
# Usage: a11y-copilot-init
#
# Copies .agent.md files into .github/agents/ for this project.
# Merges copilot-instructions.md rather than overwriting it.
# Skips any file that already exists to preserve your customisations.

CENTRAL="$HOME/.a11y-agent-team/copilot-agents"
TARGET=".github/agents"

if [ ! -d "$CENTRAL" ] || [ -z "$(ls "$CENTRAL"/*.agent.md 2>/dev/null)" ]; then
  echo "  Error: No Copilot agents found in $CENTRAL"
  echo "  Run the accessibility-agents installer first."
  exit 1
fi

mkdir -p "$TARGET"
ADDED=0; SKIPPED=0
for f in "$CENTRAL"/*.agent.md; do
  [ -f "$f" ] || continue
  dst="$TARGET/$(basename "$f")"
  if [ -f "$dst" ]; then SKIPPED=$((SKIPPED+1))
  else cp "$f" "$dst"; ADDED=$((ADDED+1)); fi
done
echo "  Agents: $ADDED added, $SKIPPED skipped (already exist)"

# Merge config files using accessibility-agents section markers — never overwrites user content
merge_config() {
  local src="$1" dst="$2" label="$3"
  local start="<!-- a11y-agent-team: start -->"
  local end="<!-- a11y-agent-team: end -->"
  [ -f "$src" ] || return
  if [ ! -f "$dst" ]; then
    { printf '%s\n' "$start"; cat "$src"; printf '%s\n' "$end"; } > "$dst"
    echo "  + $label (created)"
    return
  fi
  if grep -qF "$start" "$dst" 2>/dev/null; then
    if command -v python3 &>/dev/null; then
      python3 - "$src" "$dst" << 'PYEOF'
import re, sys
src_text = open(sys.argv[1]).read().rstrip()
dst_path = sys.argv[2]
dst_text = open(dst_path).read()
start = "<!-- a11y-agent-team: start -->"
end   = "<!-- a11y-agent-team: end -->"
block = start + "\n" + src_text + "\n" + end
updated = re.sub(re.escape(start) + r".*?" + re.escape(end), block, dst_text, flags=re.DOTALL)
open(dst_path, "w").write(updated)
PYEOF
      echo "  ~ $label (updated our existing section)"
    else
      echo "  ! $label (section exists; python3 unavailable to update)"
    fi
  else
    { printf '\n%s\n' "$start"; cat "$src"; printf '%s\n' "$end"; echo; } >> "$dst"
    echo "  + $label (merged into your existing file)"
  fi
}

for config in copilot-instructions.md copilot-review-instructions.md copilot-commit-message-instructions.md; do
  merge_config "$HOME/.a11y-agent-team/$config" ".github/$config" "$config"
done

# Copy prompts, instructions, and skills — skip existing files
for pair in "copilot-prompts:prompts" "copilot-instructions-files:instructions" "copilot-skills:skills"; do
  SRC="$HOME/.a11y-agent-team/${pair%%:*}"
  DST=".github/${pair##*:}"
  if [ -d "$SRC" ] && [ -n "$(ls "$SRC" 2>/dev/null)" ]; then
    mkdir -p "$DST"
    added=0; skipped=0
    while IFS= read -r -d '' src_file; do
      rel="${src_file#$SRC/}"
      dst_file="$DST/$rel"
      mkdir -p "$(dirname "$dst_file")"
      if [ -f "$dst_file" ]; then skipped=$((skipped+1))
      else cp "$src_file" "$dst_file"; added=$((added+1)); fi
    done < <(find "$SRC" -type f -print0)
    echo "  ${pair##*:}/: $added added, $skipped skipped"
  fi
done

echo ""
echo "  Done. Your existing files were preserved."
echo "  These are now in your project for version control."
INITSCRIPT
      chmod +x "$INIT_SCRIPT"

      # Add to PATH if not already present
      SHELL_RC=""
      if [ -f "$HOME/.zshrc" ]; then
        SHELL_RC="$HOME/.zshrc"
      elif [ -f "$HOME/.bashrc" ]; then
        SHELL_RC="$HOME/.bashrc"
      fi

      if [ -n "$SHELL_RC" ]; then
        if ! grep -q "a11y-copilot-init" "$SHELL_RC" 2>/dev/null; then
          echo "" >> "$SHELL_RC"
          echo "# Accessibility Agents - Copilot init command" >> "$SHELL_RC"
          echo "export PATH=\"\$HOME/.a11y-agent-team:\$PATH\"" >> "$SHELL_RC"
          echo "  Added 'a11y-copilot-init' command to your PATH via $SHELL_RC"
        else
          echo "  'a11y-copilot-init' already in PATH."
        fi
      fi

      COPILOT_INSTALLED=true
      add_manifest_entry "copilot-global/central-store"
      COPILOT_DESTINATIONS+=("$COPILOT_CENTRAL")
    fi
fi

# ---------------------------------------------------------------------------
# Copilot CLI support (GitHub Copilot CLI uses ~/.copilot/)
# ---------------------------------------------------------------------------
COPILOT_CLI_INSTALLED=false

install_copilot_cli=false
if [ "$COPILOT_CLI_FLAG" = true ]; then
  install_copilot_cli=true
elif read_yes_no "Install Copilot CLI agents?" false; then
  echo ""
  echo "  Would you also like to install Copilot CLI agents?"
  echo "  This adds agents to ~/.copilot/ for 'copilot' CLI use."
  echo "  (For VS Code Copilot Chat extension, use --copilot instead)"
  install_copilot_cli=true
fi

if [ "$install_copilot_cli" = true ]; then
  echo ""
  echo "  Installing Copilot CLI agents..."

  if [ "$choice" = "1" ]; then
    # Project install: put agents in .github/agents/ (CLI reads this path)
    PROJECT_DIR="$(pwd)"
    CLI_AGENTS_DST="$PROJECT_DIR/.github/agents"
    CLI_SKILLS_DST="$PROJECT_DIR/.github/skills"
    mkdir -p "$CLI_AGENTS_DST" "$CLI_SKILLS_DST"

    # Copy agents (skip existing)
    if [ -d "$COPILOT_AGENTS_SRC" ]; then
      for f in "$COPILOT_AGENTS_SRC"/*; do
        [ -f "$f" ] || continue
        dst_f="$CLI_AGENTS_DST/$(basename "$f")"
        if [ -f "$dst_f" ]; then
          echo "    ~ $(basename "$f") (skipped - exists)"
        else
          cp "$f" "$CLI_AGENTS_DST/"
          echo "    + $(basename "$f")"
        fi
      done
    fi

    # Copy skills (skip existing folders)
    SKILLS_SRC="$COPILOT_CONFIG_SRC/skills"
    if [ -d "$SKILLS_SRC" ]; then
      for skill_dir in "$SKILLS_SRC"/*/; do
        [ -d "$skill_dir" ] || continue
        skill_name=$(basename "$skill_dir")
        dst_skill="$CLI_SKILLS_DST/$skill_name"
        if [ -d "$dst_skill" ]; then
          echo "    ~ $skill_name/ (skipped - exists)"
        else
          mkdir -p "$dst_skill"
          cp -R "$skill_dir"* "$dst_skill/"
          echo "    + $skill_name/"
        fi
      done
    fi

    echo "  Copilot CLI: Project agents installed to .github/agents/"

  else
    # Global install: copy to ~/.copilot/agents/ and ~/.copilot/skills/
    CLI_AGENTS_DST="$HOME/.copilot/agents"
    CLI_SKILLS_DST="$HOME/.copilot/skills"
    mkdir -p "$CLI_AGENTS_DST" "$CLI_SKILLS_DST"

    # Copy agents
    if [ -d "$COPILOT_AGENTS_SRC" ]; then
      count=0
      for f in "$COPILOT_AGENTS_SRC"/*; do
        [ -f "$f" ] || continue
        cp "$f" "$CLI_AGENTS_DST/"
        count=$((count + 1))
      done
      echo "    Copied $count agents to ~/.copilot/agents/"
    fi

    # Copy skills
    SKILLS_SRC="$COPILOT_CONFIG_SRC/skills"
    if [ -d "$SKILLS_SRC" ]; then
      count=0
      for skill_dir in "$SKILLS_SRC"/*/; do
        [ -d "$skill_dir" ] || continue
        skill_name=$(basename "$skill_dir")
        dst_skill="$CLI_SKILLS_DST/$skill_name"
        mkdir -p "$dst_skill"
        cp -R "$skill_dir"* "$dst_skill/"
        count=$((count + 1))
      done
      echo "    Copied $count skills to ~/.copilot/skills/"
    fi

    echo "  Copilot CLI: Global agents installed to ~/.copilot/"
  fi

  COPILOT_CLI_INSTALLED=true
  add_manifest_entry "copilot-cli/agents"
fi

# ---------------------------------------------------------------------------
# Codex CLI support
# ---------------------------------------------------------------------------
CODEX_SRC="$SCRIPT_DIR/.codex/AGENTS.md"
CODEX_CONFIG_SRC="$SCRIPT_DIR/.codex/config.toml"
CODEX_ROLES_SRC="$SCRIPT_DIR/.codex/roles"
CODEX_INSTALLED=false

install_codex=false
if [ "$CODEX_FLAG" = true ]; then
  install_codex=true
elif { [ -f "$CODEX_SRC" ] || [ -f "$CODEX_CONFIG_SRC" ]; } && { true < /dev/tty; } 2>/dev/null; then
  echo ""
  echo "  Would you also like to install Codex CLI support?"
  echo "  This installs the stable AGENTS.md baseline plus experimental"
  echo "  TOML-based Codex roles under .codex/config.toml and .codex/roles/."
  echo ""
  printf "  Install Codex CLI support? [y/N]: "
  read -r codex_choice < /dev/tty
  if [ "$codex_choice" = "y" ] || [ "$codex_choice" = "Y" ]; then
    install_codex=true
  fi
fi

if [ "$install_codex" = true ] && { [ -f "$CODEX_SRC" ] || [ -f "$CODEX_CONFIG_SRC" ]; }; then
  echo ""
  echo "  Installing Codex CLI support..."

  if [ "$choice" = "1" ]; then
    # Project install: copy to .codex/AGENTS.md in the current project
    CODEX_TARGET_DIR="$(pwd)/.codex"
    mkdir -p "$CODEX_TARGET_DIR"
    CODEX_DST="$CODEX_TARGET_DIR/AGENTS.md"
  else
    # Global install: copy to ~/.codex/AGENTS.md
    CODEX_TARGET_DIR="$HOME/.codex"
    mkdir -p "$CODEX_TARGET_DIR"
    CODEX_DST="$CODEX_TARGET_DIR/AGENTS.md"
  fi

  if [ -f "$CODEX_SRC" ]; then
    merge_config_file "$CODEX_SRC" "$CODEX_DST" "AGENTS.md (Codex)"
  fi
  if [ -f "$CODEX_CONFIG_SRC" ]; then
    CODEX_CONFIG_DST="$CODEX_TARGET_DIR/config.toml"
    merge_config_file "$CODEX_CONFIG_SRC" "$CODEX_CONFIG_DST" "config.toml (Codex experimental roles)"
    add_manifest_entry "codex-config/path:$CODEX_CONFIG_DST"
  fi
  if [ -d "$CODEX_ROLES_SRC" ]; then
    CODEX_ROLES_DST="$CODEX_TARGET_DIR/roles"
    mkdir -p "$CODEX_ROLES_DST"
    while IFS= read -r src_file; do
      rel="${src_file#$CODEX_ROLES_SRC/}"
      dst_file="$CODEX_ROLES_DST/$rel"
      mkdir -p "$(dirname "$dst_file")"
      cp "$src_file" "$dst_file"
      add_manifest_entry "codex-role/path:$dst_file"
    done < <(find "$CODEX_ROLES_SRC" -type f -name "*.toml" | sort)
  fi
  CODEX_INSTALLED=true
  if [ "$choice" = "1" ]; then
    add_manifest_entry "codex/project"
  else
    add_manifest_entry "codex/global"
  fi
  add_manifest_entry "codex/path:$CODEX_DST"

  echo ""
  echo "  Codex will now enforce WCAG AA rules on all UI code in this project."
  echo "  Experimental named roles are available through .codex/config.toml."
  echo "  Run: codex \"Build a login form\" — accessibility rules apply automatically."
fi

# ---------------------------------------------------------------------------
# Gemini CLI extension
# ---------------------------------------------------------------------------
GEMINI_SRC="$SCRIPT_DIR/.gemini/extensions/a11y-agents"
GEMINI_INSTALLED=false

install_gemini=false
if [ "$GEMINI_FLAG" = true ]; then
  install_gemini=true
elif [ -d "$GEMINI_SRC" ] && read_yes_no "Install Gemini CLI support?" false; then
  echo ""
  echo "  Would you also like to install Gemini CLI support?"
  echo "  This installs accessibility skills as a Gemini CLI extension"
  echo "  so Gemini automatically applies WCAG AA rules to all UI code."
  install_gemini=true
fi

if [ "$install_gemini" = true ] && [ -d "$GEMINI_SRC" ]; then
  echo ""
  echo "  Installing Gemini CLI extension..."

  if [ "$choice" = "1" ]; then
    # Project install: copy to .gemini/extensions/a11y-agents/ in the current project
    GEMINI_TARGET="$(pwd)/.gemini/extensions/a11y-agents"
  else
    # Global install: copy to ~/.gemini/extensions/a11y-agents/
    GEMINI_TARGET="$HOME/.gemini/extensions/a11y-agents"
  fi

  mkdir -p "$GEMINI_TARGET"

  # Copy extension manifest and context file
  for f in gemini-extension.json GEMINI.md; do
    if [ -f "$GEMINI_SRC/$f" ]; then
      cp "$GEMINI_SRC/$f" "$GEMINI_TARGET/$f"
      echo "    + $f"
    fi
  done

  # Copy skills — directory by directory, skip existing
  if [ -d "$GEMINI_SRC/skills" ]; then
    ADDED=0; SKIPPED=0
    for skill_dir in "$GEMINI_SRC/skills"/*/; do
      [ -d "$skill_dir" ] || continue
      skill_name="$(basename "$skill_dir")"
      dst_skill="$GEMINI_TARGET/skills/$skill_name"
      mkdir -p "$dst_skill"
      for src_file in "$skill_dir"*; do
        [ -f "$src_file" ] || continue
        dst_file="$dst_skill/$(basename "$src_file")"
        if [ -f "$dst_file" ]; then
          SKIPPED=$((SKIPPED + 1))
        else
          cp "$src_file" "$dst_file"
          ADDED=$((ADDED + 1))
        fi
      done
    done
    echo "    + skills/ ($ADDED new, $SKIPPED skipped)"
  fi

  # Copy hooks — overwrite all files (hooks are versioned with the extension)
  if [ -d "$GEMINI_SRC/hooks" ]; then
    mkdir -p "$GEMINI_TARGET/hooks"
    ADDED=0
    for src_file in "$GEMINI_SRC/hooks"/*; do
      [ -f "$src_file" ] || continue
      cp "$src_file" "$GEMINI_TARGET/hooks/$(basename "$src_file")"
      ADDED=$((ADDED + 1))
    done
    echo "    + hooks/ ($ADDED files)"
  fi

  GEMINI_INSTALLED=true
  GEMINI_DST="$GEMINI_TARGET"
  if [ "$choice" = "1" ]; then
    add_manifest_entry "gemini/project"
  else
    add_manifest_entry "gemini/global"
  fi
  add_manifest_entry "gemini/path:$GEMINI_DST"

  echo ""
  echo "  Gemini CLI will now enforce WCAG AA rules on all UI code."
  echo "  Run: gemini \"Build a login form\" — accessibility skills apply automatically."
fi

# ---------------------------------------------------------------------------
# Guided MCP server setup
# Copies the open-source MCP server to a stable location, installs npm
# dependencies when available, and can configure VS Code to use it.
# ---------------------------------------------------------------------------
MCP_INSTALLED=false
MCP_DEST=""

if [ -d "$MCP_SERVER_SRC" ]; then
  setup_mcp=false
  if read_yes_no "Set up MCP server?" false; then
    echo ""
    echo "  Would you like to set up the MCP server for document and PDF scanning?"
    echo "  This copies the open-source server to a stable location, can install npm"
    echo "  dependencies, and can add the VS Code MCP entry for local use."
    setup_mcp=true
  fi

  if [ "$setup_mcp" = true ]; then
    if [ "$choice" = "1" ]; then
      MCP_DEST="$(pwd)/mcp-server"
    else
      MCP_DEST="$HOME/.a11y-agent-team/mcp-server"
    fi

    mkdir -p "$MCP_DEST"
    cp -R "$MCP_SERVER_SRC/." "$MCP_DEST/"
    MCP_INSTALLED=true

    echo ""
    echo "  MCP server copied to: $MCP_DEST"

    choose_mcp_capability_plan
    show_mcp_capability_warnings

    if ensure_nodejs_runtime; then
      install_mcp_deps=true
      if { true < /dev/tty; } 2>/dev/null; then
        echo ""
        echo "  Node.js and npm are available."
        printf "  Install MCP server npm dependencies now? [Y/n]: "
        read -r deps_choice < /dev/tty
        if [ "$deps_choice" = "n" ] || [ "$deps_choice" = "N" ]; then
          install_mcp_deps=false
        fi
      fi

      if [ "$install_mcp_deps" = true ]; then
        echo ""
        echo "  Installing MCP server dependencies..."
        if (cd "$MCP_DEST" && npm install --omit=dev); then
          echo "    + MCP server dependencies installed"
        else
          echo "    ! npm install failed. You can retry later with:"
          echo "      cd \"$MCP_DEST\" && npm install"
        fi
      fi

      if [ "$MCP_PLAN_PDF_FORMS" = true ]; then
        echo ""
        echo "  Setting up PDF form conversion tooling..."
        if (cd "$MCP_DEST" && npm install pdf-lib); then
          echo "    + pdf-lib installed"
        else
          echo "    ! pdf-lib setup failed. You can retry later with:"
          echo "      cd \"$MCP_DEST\""
          echo "      npm install pdf-lib"
        fi
      fi

      if [ "$MCP_PLAN_BROWSER" = true ]; then
        echo ""
        echo "  Setting up Playwright browser tooling..."
        if (cd "$MCP_DEST" && npm install playwright @axe-core/playwright && npx playwright install chromium); then
          echo "    + Playwright tooling and Chromium installed"
        else
          echo "    ! Playwright setup failed. You can retry later with:"
          echo "      cd \"$MCP_DEST\""
          echo "      npm install playwright @axe-core/playwright"
          echo "      npx playwright install chromium"
        fi
      fi
    else
      echo ""
      echo "  Node.js 18+ and npm are still not ready."
      echo "  The MCP server was copied, but dependencies were not installed yet."
      echo "  To enable scanning later:"
      echo "    1. Install Node.js 18 or later"
      echo "    2. Run: cd \"$MCP_DEST\" && npm install"
      echo "    3. Start it with: npm start"
    fi

    configure_mcp_vscode=false
    if [ "$MCP_PLAN_CONFIGURE_VSCODE" = true ] && { true < /dev/tty; } 2>/dev/null; then
      echo ""
      echo "  Would you like to configure VS Code to use the local MCP server?"
      echo "  This adds the HTTP endpoint http://127.0.0.1:3100/mcp to settings.json."
      echo ""
      printf "  Configure VS Code MCP settings? [Y/n]: "
      read -r vscode_mcp_choice < /dev/tty
      if [ "$vscode_mcp_choice" = "" ] || [ "$vscode_mcp_choice" = "y" ] || [ "$vscode_mcp_choice" = "Y" ]; then
        configure_mcp_vscode=true
      fi
    fi

    if [ "$configure_mcp_vscode" = true ]; then
      if [ "$choice" = "1" ]; then
        configure_vscode_mcp_settings "$(pwd)/.vscode/settings.json" "http://127.0.0.1:3100/mcp"
      else
        if [ -z "$SELECTED_MCP_PROFILES" ]; then
          echo "    ! No VS Code profile was found."
          echo "      Add the MCP entry manually after VS Code is installed."
        else
          while IFS='|' read -r key label path; do
            [ -n "$path" ] || continue
            configure_vscode_mcp_settings "$path/settings.json" "http://127.0.0.1:3100/mcp"
          done <<< "$SELECTED_MCP_PROFILES"
        fi
      fi
    fi

    echo ""
    if command -v verapdf &>/dev/null; then
      echo "  veraPDF detected."
      echo "  Deep PDF/UA validation will be available through run_verapdf_scan."
    elif [ "$MCP_PLAN_DEEP_PDF" != true ]; then
      echo "  Deep PDF validation was not selected during setup."
      echo "  Baseline PDF scanning works without it."
      echo "  If you want it later, install Java 11+ and veraPDF."
      echo "    Windows Java via winget: winget install --exact --id EclipseAdoptium.Temurin.21.JRE"
      echo "    Windows veraPDF via choco: choco install verapdf"
      echo "    macOS veraPDF via Homebrew: brew install verapdf"
    else
      echo "  veraPDF is not installed. That is okay."
      echo "  Baseline PDF scanning works without it."
      echo "  For deeper PDF/UA validation later, install Java 11+ and veraPDF:"
      echo "    Windows Java via winget: winget install --exact --id EclipseAdoptium.Temurin.21.JRE"
      echo "    Windows veraPDF via choco: choco install verapdf"
      echo "    Windows veraPDF manual: https://docs.verapdf.org/install/"
      echo "    macOS:   brew install verapdf"
    fi
  fi
fi

# Verify installation
echo ""
echo "  ========================="
echo "  Installation complete!"

if [ "$PLUGIN_INSTALL" = true ]; then
  # Plugin-based verification
  CACHE_CHECK="$HOME/.claude/plugins/cache"
  PLUGIN_DIR=""
  # Find the actual cache dir (could be community-access or taylor-plugins etc)
  for ns_dir in "$CACHE_CHECK"/*/accessibility-agents; do
    [ -d "$ns_dir" ] && PLUGIN_DIR="$ns_dir/$PLUGIN_VERSION" && break
  done

  if [ -n "$PLUGIN_DIR" ] && [ -d "$PLUGIN_DIR" ]; then
    echo ""
    echo "  Claude Code plugin installed:"
    echo ""
    echo "  Agents:"
    for agent in "$PLUGIN_DIR/agents/"*.md; do
      [ -f "$agent" ] || continue
      name="$(basename "${agent%.md}")"
      echo "    [x] $name"
    done
    echo ""
    echo "  Skills:"
    for skill in "$PLUGIN_DIR/skills/"*.md; do
      [ -f "$skill" ] || continue
      name="$(basename "${skill%.md}")"
      echo "    [x] /$name"
    done
    echo ""
    echo "  Enforcement hooks (three-hook gate):"
    if [ -f "$HOME/.claude/hooks/a11y-team-eval.sh" ]; then
      echo "    [x] UserPromptSubmit  - Proactive web project detection"
    else
      echo "    [ ] UserPromptSubmit  - Proactive web project detection (not installed)"
    fi
    if [ -f "$HOME/.claude/hooks/a11y-enforce-edit.sh" ]; then
      echo "    [x] PreToolUse        - Blocks UI file edits until accessibility-lead reviewed"
    else
      echo "    [ ] PreToolUse        - Blocks UI file edits (not installed)"
    fi
    if [ -f "$HOME/.claude/hooks/a11y-mark-reviewed.sh" ]; then
      echo "    [x] PostToolUse       - Unlocks edit gate after accessibility-lead completes"
    else
      echo "    [ ] PostToolUse       - Unlocks edit gate (not installed)"
    fi
  fi
else
  echo ""
  echo "  Claude Code agents installed:"
  for agent in "${AGENTS[@]}"; do
    name="${agent%.md}"
    if [ -f "$TARGET_DIR/agents/$agent" ]; then
      echo "    [x] $name"
    else
      echo "    [ ] $name (missing)"
    fi
  done
  if [ ${#SKILLS[@]} -gt 0 ]; then
    echo ""
    echo "  Skills installed:"
    for skill in "${SKILLS[@]}"; do
      name="${skill%.md}"
      if [ -f "$TARGET_DIR/skills/$skill" ]; then
        echo "    [x] /$name"
      else
        echo "    [ ] /$name (missing)"
      fi
    done
  fi
fi
if [ "$COPILOT_INSTALLED" = true ]; then
  echo ""
  echo "  Copilot agents installed to:"
  for dest in "${COPILOT_DESTINATIONS[@]}"; do
    echo "    -> $dest"
  done
  echo ""
  echo "  Copilot agents:"
  for f in "${COPILOT_DESTINATIONS[0]}"/*.agent.md; do
    [ -f "$f" ] || continue
    name="$(basename "${f%.agent.md}")"
    echo "    [x] $name"
  done
fi
if [ "$COPILOT_CLI_INSTALLED" = true ]; then
  echo ""
  echo "  Copilot CLI agents installed to:"
  echo "    -> $CLI_AGENTS_DST"
  echo "    -> $CLI_SKILLS_DST"
  echo ""
  echo "  Verify with: copilot /agent"
fi
if [ "$CODEX_INSTALLED" = true ]; then
  echo ""
  echo "  Codex CLI support installed to:"
  echo "    -> $CODEX_DST"
  [ -n "$CODEX_CONFIG_DST" ] && echo "    -> $CODEX_CONFIG_DST"
  [ -n "$CODEX_ROLES_DST" ] && echo "    -> $CODEX_ROLES_DST/"
fi
if [ "$MCP_INSTALLED" = true ]; then
  echo ""
  echo "  MCP server ready at:"
  echo "    -> $MCP_DEST"
  echo ""
  echo "  Start it locally with:"
  echo "    cd \"$MCP_DEST\" && npm start"
  echo ""
  echo "  MCP endpoint: http://127.0.0.1:3100/mcp"
  echo "  Health check: http://127.0.0.1:3100/health"
  show_pdf_deep_validation_readiness
  show_mcp_capability_readiness "$MCP_DEST"
fi
# Save current version hash
if command -v git &>/dev/null && [ -d "$SCRIPT_DIR/.git" ]; then
  if [ "$PLUGIN_INSTALL" = true ]; then
    mkdir -p "$HOME/.claude"
    git -C "$SCRIPT_DIR" rev-parse --short HEAD 2>/dev/null > "$HOME/.claude/.a11y-agent-team-version"
  else
    git -C "$SCRIPT_DIR" rev-parse --short HEAD 2>/dev/null > "$TARGET_DIR/.a11y-agent-team-version"
  fi
fi

# Auto-update setup (global install only)
AUTO_UPDATE_ENABLED=false
if [ "$choice" = "2" ]; then
  echo ""
  if [ "$NO_AUTO_UPDATE" = true ]; then
    echo "  Auto-updates skipped because --no-auto-update was supplied."
  elif [ "$AUTO_APPROVE" = true ] || read_yes_no "Enable auto-updates?" false; then
    echo "  This checks GitHub daily for new agents and improvements."
    UPDATE_SCRIPT="$TARGET_DIR/.a11y-agent-team-update.sh"

    # Write a self-contained update script
    cat > "$UPDATE_SCRIPT" << 'UPDATESCRIPT'
#!/bin/bash
set -e
REPO_URL="https://github.com/Community-Access/accessibility-agents.git"
CACHE_DIR="$HOME/.claude/.a11y-agent-team-repo"
INSTALL_DIR="$HOME/.claude"
LOG_FILE="$HOME/.claude/.a11y-agent-team-update.log"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"; }

command -v git &>/dev/null || { log "git not found"; exit 1; }

if [ -d "$CACHE_DIR/.git" ]; then
  cd "$CACHE_DIR" || exit 1
  git fetch origin main --quiet 2>/dev/null
  LOCAL=$(git rev-parse HEAD 2>/dev/null)
  REMOTE=$(git rev-parse origin/main 2>/dev/null)
  [ "$LOCAL" = "$REMOTE" ] && { log "Already up to date."; exit 0; }
  git reset --hard origin/main --quiet 2>/dev/null
else
  mkdir -p "$(dirname "$CACHE_DIR")"
  git clone --quiet "$REPO_URL" "$CACHE_DIR" 2>/dev/null
fi

cd "$CACHE_DIR" || exit 1
HASH=$(git rev-parse --short HEAD 2>/dev/null)
UPDATED=0

# Update plugin cache if installed as plugin
PLUGIN_CACHE=""
for ns_dir in "$HOME/.claude/plugins/cache"/*/accessibility-agents; do
  [ -d "$ns_dir" ] || continue
  for ver_dir in "$ns_dir"/*/; do
    [ -d "$ver_dir" ] && PLUGIN_CACHE="$ver_dir" && break
  done
  [ -n "$PLUGIN_CACHE" ] && break
done

if [ -n "$PLUGIN_CACHE" ] && [ -d "$CACHE_DIR/claude-code-plugin" ]; then
  # Update plugin cache from repo
  PLUGIN_SRC="$CACHE_DIR/claude-code-plugin"
  for subdir in agents skills scripts hooks .claude-plugin; do
    [ -d "$PLUGIN_SRC/$subdir" ] || continue
    mkdir -p "$PLUGIN_CACHE/$subdir"
    for SRC in "$PLUGIN_SRC/$subdir"/*; do
      [ -f "$SRC" ] || continue
      NAME=$(basename "$SRC")
      DST="$PLUGIN_CACHE/$subdir/$NAME"
      if ! cmp -s "$SRC" "$DST" 2>/dev/null; then
        cp "$SRC" "$DST"
        log "Updated plugin: $subdir/$NAME"
        UPDATED=$((UPDATED + 1))
      fi
    done
  done
  # Update CLAUDE.md and README.md at plugin root
  for rootfile in CLAUDE.md README.md; do
    SRC="$PLUGIN_SRC/$rootfile"
    DST="$PLUGIN_CACHE/$rootfile"
    [ -f "$SRC" ] && ! cmp -s "$SRC" "$DST" 2>/dev/null && {
      cp "$SRC" "$DST"
      log "Updated plugin: $rootfile"
      UPDATED=$((UPDATED + 1))
    }
  done
  chmod +x "$PLUGIN_CACHE/scripts/"*.sh 2>/dev/null || true
  log "Plugin cache updated."
else
  # Legacy: update agents/commands in ~/.claude/ directly
  if [ -d "$CACHE_DIR/claude-code-plugin/agents" ]; then
    AGENT_SRC_DIR="$CACHE_DIR/claude-code-plugin/agents"
  else
    AGENT_SRC_DIR="$CACHE_DIR/.claude/agents"
  fi

  if [ -d "$INSTALL_DIR/agents" ]; then
    for agent in "$AGENT_SRC_DIR"/*.md; do
      [ -f "$agent" ] || continue
      NAME=$(basename "$agent")
      DST="$INSTALL_DIR/agents/$NAME"
      if ! cmp -s "$agent" "$DST" 2>/dev/null; then
        cp "$agent" "$DST"
        log "Updated: ${NAME%.md}"
        UPDATED=$((UPDATED + 1))
      fi
    done
  fi

  # Update skills (check both skills/ and legacy commands/ in source)
  SKILL_SRC_DIR=""
  if [ -d "$CACHE_DIR/claude-code-plugin/skills" ]; then
    SKILL_SRC_DIR="$CACHE_DIR/claude-code-plugin/skills"
  elif [ -d "$CACHE_DIR/claude-code-plugin/commands" ]; then
    SKILL_SRC_DIR="$CACHE_DIR/claude-code-plugin/commands"
  fi
  # Install to skills/ dir, migrate from commands/ if needed
  SKILL_DST_DIR="$INSTALL_DIR/skills"
  [ -d "$INSTALL_DIR/commands" ] && [ ! -d "$SKILL_DST_DIR" ] && mv "$INSTALL_DIR/commands" "$SKILL_DST_DIR"
  if [ -n "$SKILL_SRC_DIR" ] && [ -d "$SKILL_DST_DIR" ]; then
    for skill in "$SKILL_SRC_DIR"/*.md; do
      [ -f "$skill" ] || continue
      NAME=$(basename "$skill")
      DST="$SKILL_DST_DIR/$NAME"
      if ! cmp -s "$skill" "$DST" 2>/dev/null; then
        cp "$skill" "$DST"
        log "Updated skill: ${NAME%.md}"
        UPDATED=$((UPDATED + 1))
      fi
    done
  fi
fi

# Update Copilot agents in central store and VS Code profile folders
CENTRAL="$HOME/.a11y-agent-team/copilot-agents"
if [ -d "$CENTRAL" ]; then
  for SRC in "$CACHE_DIR"/.github/agents/*.agent.md; do
    [ -f "$SRC" ] || continue
    NAME=$(basename "$SRC")
    DST="$CENTRAL/$NAME"
    if ! cmp -s "$SRC" "$DST" 2>/dev/null; then
      cp "$SRC" "$DST"
      log "Updated Copilot agent: ${NAME%.agent.md}"
      UPDATED=$((UPDATED + 1))
    fi
  done
fi

# Push updated Copilot agents to VS Code profile prompts folders
PROFILES=()
case "$(uname -s)" in
  Darwin)
    PROFILES=("$HOME/Library/Application Support/Code/User" "$HOME/Library/Application Support/Code - Insiders/User")
    ;;
  MINGW*|MSYS*|CYGWIN*)
    [ -n "$APPDATA" ] && PROFILES=("$APPDATA/Code/User" "$APPDATA/Code - Insiders/User")
    ;;
esac
for PROFILE in "${PROFILES[@]}"; do
  PROMPTS_DIR="$PROFILE/prompts"
  [ -d "$PROMPTS_DIR" ] && [ -n "$(ls "$PROMPTS_DIR"/*.agent.md 2>/dev/null)" ] || continue
  for SRC in "$CENTRAL"/*.agent.md; do
    [ -f "$SRC" ] || continue
    cp "$SRC" "$PROMPTS_DIR/"
    rm -f "$PROFILE/$(basename "$SRC")"
  done
  log "Updated VS Code profile: $PROFILE"
done

echo "$HASH" > "$INSTALL_DIR/.a11y-agent-team-version"
log "Check complete: $UPDATED files updated (version $HASH)."
UPDATESCRIPT
    chmod +x "$UPDATE_SCRIPT"

    # Detect platform and set up scheduler
    if [ "$(uname)" = "Darwin" ]; then
      # macOS: LaunchAgent
      PLIST_DIR="$HOME/Library/LaunchAgents"
      PLIST_FILE="$PLIST_DIR/com.community-access.a11y-agent-team-update.plist"
      mkdir -p "$PLIST_DIR"
      cat > "$PLIST_FILE" << PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.community-access.a11y-agent-team-update</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>${UPDATE_SCRIPT}</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>9</integer>
    <key>Minute</key>
    <integer>0</integer>
  </dict>
  <key>StandardOutPath</key>
  <string>${HOME}/.claude/.a11y-agent-team-update.log</string>
  <key>StandardErrorPath</key>
  <string>${HOME}/.claude/.a11y-agent-team-update.log</string>
  <key>RunAtLoad</key>
  <false/>
</dict>
</plist>
PLIST
      launchctl bootout "gui/$(id -u)" "$PLIST_FILE" 2>/dev/null || true
      launchctl bootstrap "gui/$(id -u)" "$PLIST_FILE" 2>/dev/null
      echo "  Auto-updates enabled (daily at 9:00 AM via launchd)."
      AUTO_UPDATE_ENABLED=true
    else
      echo "  Auto-update scheduling via the shell installer is supported on macOS only."
      echo "  You can run update.sh manually anytime."
    fi
    echo "  Update log: ~/.claude/.a11y-agent-team-update.log"
  else
    echo "  Auto-updates skipped. You can run update.sh manually anytime."
  fi
fi

# Record install scope for uninstaller (only for file-copy installs that have a manifest)
if command -v add_manifest_entry &>/dev/null 2>&1 || type add_manifest_entry &>/dev/null 2>&1; then
  if [ "$choice" = "1" ]; then
    add_manifest_entry "scope:project"
  else
    add_manifest_entry "scope:global"
  fi
fi

# Clean up temp download
[ "$DOWNLOADED" = true ] && rm -rf "$TMPDIR_DL"

INSTALL_NOTES=()
if [ "$AUTO_APPROVE" = true ]; then
  INSTALL_NOTES+=("Optional prompts were auto-approved with --yes.")
fi
if [ "$NO_AUTO_UPDATE" = true ]; then
  INSTALL_NOTES+=("Auto-update setup was skipped with --no-auto-update.")
fi
if [ "$COPILOT_INSTALLED" = true ] && [ "$VSCODE_PROFILE_MODE" != "auto" ] && [ -z "$SELECTED_COPILOT_PROFILES" ]; then
  INSTALL_NOTES+=("The requested VS Code profile filter did not match any installed profile for Copilot assets.")
fi
if [ "$MCP_INSTALLED" = true ] && [ "$MCP_PROFILE_MODE" != "auto" ] && [ -z "$SELECTED_MCP_PROFILES" ]; then
  INSTALL_NOTES+=("The requested MCP profile filter did not match any installed VS Code profile.")
fi

write_summary_file "$SUMMARY_PATH" "{\"schemaVersion\":\"1.0\",\"timestampUtc\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"operation\":\"install\",\"dryRun\":false,\"check\":false,\"scope\":\"$([ \"$choice\" = \"1\" ] && echo project || echo global)\",\"targetDir\":\"$(json_escape "$TARGET_DIR")\",\"requestedOptions\":{\"copilot\":$(json_bool "$COPILOT_FLAG"),\"copilotCli\":$(json_bool "$COPILOT_CLI_FLAG"),\"codex\":$(json_bool "$CODEX_FLAG"),\"gemini\":$(json_bool "$GEMINI_FLAG"),\"autoApprove\":$(json_bool "$AUTO_APPROVE"),\"noAutoUpdate\":$(json_bool "$NO_AUTO_UPDATE"),\"vscodeProfileMode\":\"$VSCODE_PROFILE_MODE\",\"mcpProfileMode\":\"$MCP_PROFILE_MODE\"},\"selectedCopilotProfiles\":$(json_array_from_profiles "$SELECTED_COPILOT_PROFILES" path),\"selectedMcpProfiles\":$(json_array_from_profiles "$SELECTED_MCP_PROFILES" settings),\"backupMetadataPath\":\"$(json_escape "$BACKUP_METADATA_PATH")\",\"installed\":{\"claude\":true,\"plugin\":$(json_bool "$PLUGIN_INSTALL"),\"copilot\":$(json_bool "$COPILOT_INSTALLED"),\"copilotCli\":$(json_bool "$COPILOT_CLI_INSTALLED"),\"codex\":$(json_bool "$CODEX_INSTALLED"),\"gemini\":$(json_bool "$GEMINI_INSTALLED"),\"mcp\":$(json_bool "$MCP_INSTALLED"),\"autoUpdate\":$(json_bool "$AUTO_UPDATE_ENABLED")},\"notes\":$(json_array_from_notes "${INSTALL_NOTES[@]}")}"

echo ""
echo "  Summary written to:"
echo "    $SUMMARY_PATH"
echo ""
echo "  Verification:"
echo "    - Re-run with --dry-run to preview profile targeting before a future change"
if [ "$COPILOT_INSTALLED" = true ] && [ "$choice" = "2" ]; then
  echo "    - Check VS Code prompts folders under the selected profiles"
fi
if [ "$MCP_INSTALLED" = true ]; then
  echo "    - Start the MCP server and check http://127.0.0.1:3100/health"
fi
echo ""
echo "  Recovery:"
echo "    - Re-run install.sh with the same flags to repair a partial install"
echo "    - Use uninstall.sh if you want to remove the managed files cleanly"
echo ""
if [ "$PLUGIN_INSTALL" = true ]; then
  echo "  Restart Claude Code for the plugin to take effect."
  echo ""
  echo "  The plugin will:"
  echo "    - Inject accessibility-lead delegation instruction into every UI prompt"
  echo "    - Remind to consult accessibility-lead before editing UI files"
  echo "    - accessibility-lead delegates to specialists via Task tool"
else
  echo "  If agents do not load, increase the character budget:"
  echo "    export SLASH_COMMAND_TOOL_CHAR_BUDGET=30000"
fi
echo ""
echo "  To uninstall, run:"
echo "    curl -fsSL https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/uninstall.sh | bash"
echo ""
echo "  For manual uninstall instructions, see: UNINSTALL.md"
echo ""
echo "  Start Claude Code and try: \"Build a login form\""
echo "  The accessibility-lead should activate automatically."
echo ""


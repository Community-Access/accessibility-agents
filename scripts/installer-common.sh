#!/bin/bash

# Shared helper functions for install/update/uninstall shell scripts.

set_profile_mode() {
  local current="$1"
  local next="$2"
  if [ "$current" != "auto" ] && [ "$current" != "$next" ]; then
    echo "  Error: choose only one VS Code profile targeting flag."
    exit 1
  fi
  printf '%s' "$next"
}

has_tty() {
  { true < /dev/tty; } 2>/dev/null
}

enforce_shell_runtime() {
  case "$(uname -s)" in
    MINGW*|MSYS*|CYGWIN*)
      if [ ! -x /bin/bash ]; then
        echo "  Error: this shell environment does not provide a usable /bin/bash runtime."
        echo "  Use Git Bash, WSL, or PowerShell on Windows."
        exit 1
      fi
      ;;
  esac
}

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

json_bool() {
  if [ "$1" = true ]; then
    printf 'true'
  else
    printf 'false'
  fi
}

json_array_from_profiles() {
  local input="$1"
  local field="$2"
  local first=true
  printf '['
  while IFS='|' read -r key label path; do
    [ -n "$path" ] || continue
    local value="$path"
    if [ "$field" = "settings" ]; then
      value="$path/settings.json"
    fi
    if [ "$first" = true ]; then
      first=false
    else
      printf ','
    fi
    printf '"%s"' "$(json_escape "$value")"
  done <<< "$input"
  printf ']'
}

json_array_from_notes() {
  local first=true
  printf '['
  for note in "$@"; do
    [ -n "$note" ] || continue
    if [ "$first" = true ]; then
      first=false
    else
      printf ','
    fi
    printf '"%s"' "$(json_escape "$note")"
  done
  printf ']'
}

write_summary_file() {
  local path="$1"
  local content="$2"
  mkdir -p "$(dirname "$path")"
  printf '%s\n' "$content" > "$path"
}

get_vscode_profiles() {
  case "$(uname -s)" in
    Darwin)
      printf 'stable|VS Code|%s\n' "$HOME/Library/Application Support/Code/User"
      printf 'insiders|VS Code Insiders|%s\n' "$HOME/Library/Application Support/Code - Insiders/User"
      ;;
    Linux)
      printf 'stable|VS Code|%s\n' "$HOME/.config/Code/User"
      printf 'insiders|VS Code Insiders|%s\n' "$HOME/.config/Code - Insiders/User"
      ;;
    MINGW*|MSYS*|CYGWIN*)
      if [ -n "$APPDATA" ]; then
        printf 'stable|VS Code|%s\n' "$APPDATA/Code/User"
        printf 'insiders|VS Code Insiders|%s\n' "$APPDATA/Code - Insiders/User"
      fi
      ;;
  esac
}

select_vscode_profiles() {
  local mode="$1"
  while IFS='|' read -r key label path; do
    [ -n "$path" ] || continue
    case "$mode" in
      stable) [ "$key" = "stable" ] || continue ;;
      insiders) [ "$key" = "insiders" ] || continue ;;
      both) ;;
      auto) [ -d "$path" ] || continue ;;
    esac
    [ "$mode" = "auto" ] || [ -d "$path" ] || continue
    printf '%s|%s|%s\n' "$key" "$label" "$path"
  done < <(get_vscode_profiles)
}

default_backup_path() {
  local operation="$1"
  local root="$2"
  printf '%s/.a11y-agent-team-%s-backup.json' "$root" "$operation"
}

write_backup_metadata() {
  local path="$1"
  local content="$2"
  write_summary_file "$path" "$content"
}

initialize_operation_state() {
  local operation="$1"
  local root="$2"
  local summary_path="$3"
  local dry_run="$4"
  local check_mode="$5"
  shift 5
  local backup_path
  backup_path="$(default_backup_path "$operation" "$root")"
  local notes='Metadata only. This file records touched paths for rollback planning; it is not a full file-content backup.'
  local existing='[]'
  local candidates='['
  local first=true
  local first_existing=true
  for candidate in "$@"; do
    [ -n "$candidate" ] || continue
    if [ "$first" = true ]; then first=false; else candidates+=","; fi
    candidates+="\"$(json_escape "$candidate")\""
    if [ -e "$candidate" ]; then
      if [ "$first_existing" = true ]; then first_existing=false; else existing+=","; fi
      existing+="\"$(json_escape "$candidate")\""
    fi
  done
  candidates+=']'
  existing+=']'
  write_backup_metadata "$backup_path" "{\"schemaVersion\":\"1.0\",\"timestampUtc\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"operation\":\"$operation\",\"dryRun\":$(json_bool "$dry_run"),\"check\":$(json_bool "$check_mode"),\"summaryPath\":\"$(json_escape "$summary_path")\",\"candidatePaths\":$candidates,\"existingPaths\":$existing,\"note\":\"$(json_escape "$notes")\"}"
  printf '%s' "$backup_path"
}

# ---------------------------------------------------------------------------
# detect_installed_tools
# Sets global HAS_* variables for the wizard to use when mapping roles.
# ---------------------------------------------------------------------------
detect_installed_tools() {
  HAS_NODE=false
  NODE_VERSION=""
  if command -v node &>/dev/null; then
    HAS_NODE=true
    NODE_VERSION="$(node --version 2>/dev/null | sed 's/^v//')"
  fi

  HAS_NPM=false
  command -v npm &>/dev/null && HAS_NPM=true

  HAS_GIT=false
  command -v git &>/dev/null && HAS_GIT=true

  HAS_JAVA=false
  if command -v java &>/dev/null; then
    HAS_JAVA=true
  fi

  HAS_VERAPDF=false
  command -v verapdf &>/dev/null && HAS_VERAPDF=true

  HAS_PYTHON3=false
  if command -v python3 &>/dev/null; then
    HAS_PYTHON3=true
  elif command -v python &>/dev/null; then
    HAS_PYTHON3=true
  fi

  HAS_VSCODE_STABLE=false
  HAS_VSCODE_INSIDERS=false
  while IFS='|' read -r key label path; do
    [ -n "$path" ] || continue
    if [ -d "$path" ]; then
      case "$key" in
        stable) HAS_VSCODE_STABLE=true ;;
        insiders) HAS_VSCODE_INSIDERS=true ;;
      esac
    fi
  done < <(get_vscode_profiles)

  HAS_CLAUDE=false
  command -v claude &>/dev/null && HAS_CLAUDE=true

  HAS_COPILOT_CLI=false
  [ -d "$HOME/.copilot" ] && HAS_COPILOT_CLI=true

  HAS_CODEX_CLI=false
  [ -d "$HOME/.codex" ] && HAS_CODEX_CLI=true

  HAS_GEMINI_CLI=false
  command -v gemini &>/dev/null && HAS_GEMINI_CLI=true
}

show_detected_tools() {
  echo "  Detected tools:"
  for pair in \
    "VS Code|$HAS_VSCODE_STABLE" \
    "VS Code Insiders|$HAS_VSCODE_INSIDERS" \
    "Node.js|$HAS_NODE" \
    "Claude Code|$HAS_CLAUDE" \
    "Copilot CLI|$HAS_COPILOT_CLI" \
    "Codex CLI|$HAS_CODEX_CLI" \
    "Gemini CLI|$HAS_GEMINI_CLI" \
    "Python 3|$HAS_PYTHON3" \
    "Java|$HAS_JAVA" \
    "veraPDF|$HAS_VERAPDF"; do
    label="${pair%%|*}"
    found="${pair##*|}"
    if [ "$found" = true ]; then
      echo "    [x] $label"
    else
      echo "    [ ] $label"
    fi
  done
  echo ""
}

get_role_platforms() {
  # Usage: get_role_platforms <role>
  # Sets ROLE_CLAUDE, ROLE_COPILOT, ROLE_COPILOT_CLI, ROLE_CODEX_CLI,
  # ROLE_GEMINI_CLI, ROLE_MCP based on role and detected tools.
  local role="$1"

  ROLE_CLAUDE=true
  ROLE_COPILOT=false
  ROLE_COPILOT_CLI=false
  ROLE_CODEX_CLI=false
  ROLE_GEMINI_CLI=false
  ROLE_MCP=false

  local has_vscode=false
  { [ "$HAS_VSCODE_STABLE" = true ] || [ "$HAS_VSCODE_INSIDERS" = true ]; } && has_vscode=true

  case "$role" in
    developer)
      ROLE_COPILOT=$has_vscode
      ROLE_COPILOT_CLI=$HAS_COPILOT_CLI
      ROLE_CODEX_CLI=$HAS_CODEX_CLI
      ROLE_MCP=$HAS_NODE
      ;;
    reviewer)
      ROLE_COPILOT=$has_vscode
      ROLE_MCP=$HAS_NODE
      ;;
    author)
      ROLE_MCP=$HAS_NODE
      ;;
    full)
      ROLE_COPILOT=$has_vscode
      ROLE_COPILOT_CLI=$HAS_COPILOT_CLI
      ROLE_CODEX_CLI=$HAS_CODEX_CLI
      ROLE_GEMINI_CLI=$HAS_GEMINI_CLI
      ROLE_MCP=$HAS_NODE
      ;;
    custom)
      ROLE_CLAUDE=false
      ;;
  esac
}

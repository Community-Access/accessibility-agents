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

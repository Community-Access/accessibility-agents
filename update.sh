#!/bin/bash
# A11y Agent Team - Update Script
# Built by Taylor Arndt - https://github.com/taylorarndt
#
# Checks for updates from GitHub and installs them.
# Can be run manually or automatically via LaunchAgent/cron.
#
# Usage:
#   bash update.sh              Update global install
#   bash update.sh --project    Update project install in current directory
#   bash update.sh --silent     Suppress output (for scheduled runs)

set -e

REPO_URL="https://github.com/Community-Access/accessibility-agents.git"
CACHE_DIR="$HOME/.claude/.a11y-agent-team-repo"
VERSION_FILE="$HOME/.claude/.a11y-agent-team-version"
LOG_FILE="$HOME/.claude/.a11y-agent-team-update.log"

# Agents are auto-detected from the cached repo after clone/pull

# Parse flags
SILENT=false
TARGET="global"
for arg in "$@"; do
  case "$arg" in
    --silent) SILENT=true ;;
    --project) TARGET="project" ;;
  esac
done

log() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
  echo "$msg" >> "$LOG_FILE"
  if [ "$SILENT" = false ]; then
    echo "  $1"
  fi
}

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
    log "+ $label (created)"
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
updated = re.sub(r"(?:" + "|".join(patterns) + r")", block, dst_text, flags=re.DOTALL)
open(dst_path, "w").write(updated)
PYEOF
      log "~ $label (updated our existing section)"
    else
      log "! $label (section exists; python3 unavailable to update - edit manually)"
    fi
  else
    { printf '\n%s\n' "$start"; cat "$src"; printf '%s\n' "$end"; echo; } >> "$dst"
    log "+ $label (merged into your existing file)"
  fi
}

if [ "$TARGET" = "project" ]; then
  INSTALL_DIR="$(pwd)/.claude"
else
  INSTALL_DIR="$HOME/.claude"
fi

# Check for git
if ! command -v git &>/dev/null; then
  log "Error: git is not installed. Cannot check for updates."
  exit 1
fi

# Clone or pull the repo
if [ -d "$CACHE_DIR/.git" ]; then
  cd "$CACHE_DIR" || exit 1
  git fetch origin main --quiet 2>/dev/null
  LOCAL_HASH=$(git rev-parse HEAD 2>/dev/null)
  REMOTE_HASH=$(git rev-parse origin/main 2>/dev/null)

  if [ "$LOCAL_HASH" = "$REMOTE_HASH" ]; then
    log "Already up to date."
    exit 0
  fi

  git reset --hard origin/main --quiet 2>/dev/null
  log "Pulled latest changes."
else
  log "Downloading a11y-agent-team..."
  mkdir -p "$(dirname "$CACHE_DIR")"
  git clone --quiet "$REPO_URL" "$CACHE_DIR" 2>/dev/null
  log "Repository cloned."
fi

cd "$CACHE_DIR" || exit 1
NEW_HASH=$(git rev-parse --short HEAD 2>/dev/null)

# Detect install type: plugin vs legacy
PLUGIN_CACHE=""
for ns_dir in "$HOME/.claude/plugins/cache"/*/accessibility-agents "$HOME/.claude/plugins/cache"/*/a11y-agent-team; do
  [ -d "$ns_dir" ] || continue
  for ver_dir in "$ns_dir"/*/; do
    [ -d "$ver_dir" ] && PLUGIN_CACHE="$ver_dir" && break
  done
  [ -n "$PLUGIN_CACHE" ] && break
done

UPDATED=0

if [ -n "$PLUGIN_CACHE" ] && [ -d "$CACHE_DIR/claude-code-plugin" ]; then
  # Plugin-based install: update plugin cache
  log "Updating plugin cache at $PLUGIN_CACHE"
  PLUGIN_SRC="$CACHE_DIR/claude-code-plugin"

  for subdir in agents commands scripts hooks .claude-plugin; do
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
    # Add new files not yet in cache
    for SRC in "$PLUGIN_SRC/$subdir"/*; do
      [ -f "$SRC" ] || continue
      NAME=$(basename "$SRC")
      DST="$PLUGIN_CACHE/$subdir/$NAME"
      [ -f "$DST" ] || { cp "$SRC" "$DST"; log "Added plugin: $subdir/$NAME"; UPDATED=$((UPDATED + 1)); }
    done
  done
  # Update root-level files
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

else
  # Legacy file-based install: update agents/commands in INSTALL_DIR

  if [ ! -d "$INSTALL_DIR/agents" ]; then
    log "Install directory not found at $INSTALL_DIR/agents. Run install.sh first."
    exit 1
  fi

  # Load manifest
  MANIFEST_FILE="$INSTALL_DIR/.a11y-agent-manifest"
  touch "$MANIFEST_FILE"

  if [ ! -s "$MANIFEST_FILE" ]; then
    REPO_MANIFEST="$CACHE_DIR/.a11y-agent-manifest"
    if [ -f "$REPO_MANIFEST" ]; then
      cp "$REPO_MANIFEST" "$MANIFEST_FILE"
      count=$(wc -l < "$MANIFEST_FILE" | tr -d ' ')
      log "Seeded local manifest from repo ($count entries)."
    fi
  fi

  if [ -d "$CACHE_DIR/claude-code-plugin/agents" ]; then
    AGENT_SRC_DIR="$CACHE_DIR/claude-code-plugin/agents"
  else
    AGENT_SRC_DIR="$CACHE_DIR/.claude/agents"
  fi

  for SRC in "$AGENT_SRC_DIR/"*.md; do
    [ -f "$SRC" ] || continue
    agent="$(basename "$SRC")"
    DST="$INSTALL_DIR/agents/$agent"
    manifest_key="agents/$agent"
    if [ ! -f "$DST" ]; then
      cp "$SRC" "$DST"
      grep -qxF "$manifest_key" "$MANIFEST_FILE" 2>/dev/null || echo "$manifest_key" >> "$MANIFEST_FILE"
      name="${agent%.md}"
      log "Added (new): $name"
      UPDATED=$((UPDATED + 1))
    elif grep -qxF "$manifest_key" "$MANIFEST_FILE" 2>/dev/null; then
      if ! cmp -s "$SRC" "$DST" 2>/dev/null; then
        cp "$SRC" "$DST"
        name="${agent%.md}"
        log "Updated: $name"
        UPDATED=$((UPDATED + 1))
      fi
    fi
  done

  if [ -d "$CACHE_DIR/claude-code-plugin/commands" ]; then
    CMD_SRC_DIR="$CACHE_DIR/claude-code-plugin/commands"
    mkdir -p "$INSTALL_DIR/commands"
    for SRC in "$CMD_SRC_DIR/"*.md; do
      [ -f "$SRC" ] || continue
      cmd="$(basename "$SRC")"
      DST="$INSTALL_DIR/commands/$cmd"
      manifest_key="commands/$cmd"
      if [ ! -f "$DST" ]; then
        cp "$SRC" "$DST"
        grep -qxF "$manifest_key" "$MANIFEST_FILE" 2>/dev/null || echo "$manifest_key" >> "$MANIFEST_FILE"
        name="${cmd%.md}"
        log "Added command (new): /$name"
        UPDATED=$((UPDATED + 1))
      elif grep -qxF "$manifest_key" "$MANIFEST_FILE" 2>/dev/null; then
        if ! cmp -s "$SRC" "$DST" 2>/dev/null; then
          cp "$SRC" "$DST"
          name="${cmd%.md}"
          log "Updated command: /$name"
          UPDATED=$((UPDATED + 1))
        fi
      fi
    done
  fi
fi

# Helper: recursively sync a source directory into a destination directory.
# Updates changed files and adds new files.
# Does NOT remove files: they may be user-created files in the same directory.
sync_github_dir() {
  local src_dir="$1"
  local dst_dir="$2"
  local label="$3"
  [ -d "$src_dir" ] || return 0
  [ -d "$dst_dir" ] || return 0  # only sync if previously installed
  # Update / add (use process substitution to avoid subshell variable loss)
  while read -r src_file; do
    rel="${src_file#$src_dir/}"
    dst_file="$dst_dir/$rel"
    mkdir -p "$(dirname "$dst_file")"
    if ! cmp -s "$src_file" "$dst_file" 2>/dev/null; then
      cp "$src_file" "$dst_file"
      log "Updated $label/$rel"
      UPDATED=$((UPDATED + 1))
    fi
  done < <(find "$src_dir" -type f)
}

GITHUB_SRC="$CACHE_DIR/.github"

# Update Copilot assets for project install
if [ "$TARGET" = "project" ]; then
  PROJECT_GITHUB="$(pwd)/.github"
  if [ -d "$PROJECT_GITHUB" ]; then
    # Agents (all files: *.agent.md + AGENTS.md and support files)
    sync_github_dir "$GITHUB_SRC/agents" "$PROJECT_GITHUB/agents" "agents"
    # Config files — merged to preserve user content above/below our section
    for config in copilot-instructions.md copilot-review-instructions.md copilot-commit-message-instructions.md; do
      SRC="$GITHUB_SRC/$config"
      DST="$PROJECT_GITHUB/$config"
      [ -f "$SRC" ] && merge_config_file "$SRC" "$DST" "$config"
    done
    # Asset subdirs: skills, instructions, prompts — auto-discovered
    # Migrate old prompt names to new agent-matching names (v2.x → v3.0)
    [ -d "$GITHUB_SRC/prompts" ] && migrate_prompts "$GITHUB_SRC/prompts"
    
    for subdir in skills instructions prompts; do
      sync_github_dir "$GITHUB_SRC/$subdir" "$PROJECT_GITHUB/$subdir" "$subdir"
    done
  fi
fi

# Update Copilot assets for global install
if [ "$TARGET" = "global" ]; then
  CENTRAL_ROOT="$HOME/.a11y-agent-team"
  LEGACY_CENTRAL_ROOT="$HOME/.accessibility-agents"
  if [ ! -d "$CENTRAL_ROOT" ] && [ -d "$LEGACY_CENTRAL_ROOT" ]; then
    mkdir -p "$CENTRAL_ROOT"
    cp -R "$LEGACY_CENTRAL_ROOT/." "$CENTRAL_ROOT/" 2>/dev/null || true
    log "Migrated legacy central store from $LEGACY_CENTRAL_ROOT to $CENTRAL_ROOT"
  fi
  CENTRAL="$CENTRAL_ROOT/copilot-agents"
  CENTRAL_PROMPTS="$CENTRAL_ROOT/copilot-prompts"
  CENTRAL_INSTRUCTIONS="$CENTRAL_ROOT/copilot-instructions-files"
  CENTRAL_SKILLS="$CENTRAL_ROOT/copilot-skills"

  # Sync central agent store
  if [ -d "$CENTRAL" ]; then
    for SRC in "$GITHUB_SRC"/agents/*.agent.md; do
      [ -f "$SRC" ] || continue
      NAME="$(basename "$SRC")"
      DST="$CENTRAL/$NAME"
      if ! cmp -s "$SRC" "$DST" 2>/dev/null; then
        cp "$SRC" "$DST"
        log "Updated central agent: ${NAME%.agent.md}"
        UPDATED=$((UPDATED + 1))
      fi
    done
  fi

  # Sync central prompts, instructions, skills stores
  sync_github_dir "$GITHUB_SRC/prompts"      "$CENTRAL_PROMPTS"      "central-prompts"
  sync_github_dir "$GITHUB_SRC/instructions" "$CENTRAL_INSTRUCTIONS" "central-instructions"
  sync_github_dir "$GITHUB_SRC/skills"       "$CENTRAL_SKILLS"       "central-skills"

  # Config files in central store — merged to preserve user content (only if Copilot was installed)
  if [ ! -d "$CENTRAL_ROOT" ]; then
    log "Copilot not installed globally, skipping."
  fi
  for config in copilot-instructions.md copilot-review-instructions.md copilot-commit-message-instructions.md; do
    [ -d "$CENTRAL_ROOT" ] || break
    SRC="$GITHUB_SRC/$config"
    DST="$CENTRAL_ROOT/$config"
    [ -f "$SRC" ] && merge_config_file "$SRC" "$DST" "$config"
  done

  # Push updated agents, prompts, and instructions to VS Code User profile folders.
  # VS Code 1.110+ discovers from User/prompts/. Clean any stale root copies.
  VSCODE_PROFILES=()
  case "$(uname -s)" in
    Darwin)
      VSCODE_PROFILES=("$HOME/Library/Application Support/Code/User" "$HOME/Library/Application Support/Code - Insiders/User")
      ;;
    Linux)
      VSCODE_PROFILES=("$HOME/.config/Code/User" "$HOME/.config/Code - Insiders/User")
      ;;
    MINGW*|MSYS*|CYGWIN*)
      [ -n "$APPDATA" ] && VSCODE_PROFILES=("$APPDATA/Code/User" "$APPDATA/Code - Insiders/User")
      ;;
  esac
  for PROFILE in "${VSCODE_PROFILES[@]}"; do
    PROMPTS_DIR="$PROFILE/prompts"
    # Only update if agents were previously installed there
    HAS_AGENTS=false
    [ -n "$(ls "$PROFILE"/*.agent.md 2>/dev/null)" ]    && HAS_AGENTS=true
    [ -d "$PROMPTS_DIR" ] && [ -n "$(ls "$PROMPTS_DIR"/*.agent.md 2>/dev/null)" ] && HAS_AGENTS=true
    [ "$HAS_AGENTS" = true ] || continue
    mkdir -p "$PROMPTS_DIR"

    # Collect managed files from central stores
    FILES=()
    [ -d "$CENTRAL" ] && for f in "$CENTRAL"/*.agent.md; do
      [ -f "$f" ] && FILES+=("$f")
    done
    if [ -d "$CENTRAL_PROMPTS" ]; then
      while IFS= read -r f; do FILES+=("$f"); done < <(find "$CENTRAL_PROMPTS" -name "*.prompt.md" -type f 2>/dev/null)
    fi
    if [ -d "$CENTRAL_INSTRUCTIONS" ]; then
      while IFS= read -r f; do FILES+=("$f"); done < <(find "$CENTRAL_INSTRUCTIONS" -name "*.instructions.md" -type f 2>/dev/null)
    fi

    CLEANED=0
    for f in "${FILES[@]}"; do
      [ -f "$f" ] || continue
      bn="$(basename "$f")"
      cp "$f" "$PROMPTS_DIR/$bn"
      root_copy="$PROFILE/$bn"
      if [ -f "$root_copy" ]; then
        rm -f "$root_copy"
        CLEANED=$((CLEANED + 1))
      fi
    done
    [ "$CLEANED" -gt 0 ] && log "Cleaned $CLEANED duplicate(s) from $PROFILE"
    log "Updated VS Code profile: $PROFILE"
  done
fi

# Update Codex assets if Codex support was previously installed
if [ "$TARGET" = "project" ]; then
  CODEX_ROOT="$(pwd)/.codex"
else
  CODEX_ROOT="$HOME/.codex"
fi
CODEX_AGENTS_DST="$CODEX_ROOT/AGENTS.md"
CODEX_CONFIG_DST="$CODEX_ROOT/config.toml"
CODEX_ROLES_DST="$CODEX_ROOT/roles"
CODEX_AGENTS_SRC="$CACHE_DIR/.codex/AGENTS.md"
CODEX_CONFIG_SRC="$CACHE_DIR/.codex/config.toml"
CODEX_ROLES_SRC="$CACHE_DIR/.codex/roles"

HAS_CODEX=false
[ -f "$CODEX_AGENTS_DST" ] && HAS_CODEX=true
[ -f "$CODEX_CONFIG_DST" ] && HAS_CODEX=true
if [ "$HAS_CODEX" = true ]; then
  [ -f "$CODEX_AGENTS_SRC" ] && merge_config_file "$CODEX_AGENTS_SRC" "$CODEX_AGENTS_DST" "Codex AGENTS.md"
  [ -f "$CODEX_CONFIG_SRC" ] && merge_config_file "$CODEX_CONFIG_SRC" "$CODEX_CONFIG_DST" "Codex config.toml"
  if [ -d "$CODEX_ROLES_SRC" ]; then
    mkdir -p "$CODEX_ROLES_DST"
    while read -r src_file; do
      rel="${src_file#$CODEX_ROLES_SRC/}"
      dst_file="$CODEX_ROLES_DST/$rel"
      mkdir -p "$(dirname "$dst_file")"
      if ! cmp -s "$src_file" "$dst_file" 2>/dev/null; then
        cp "$src_file" "$dst_file"
        log "Updated Codex role: $rel"
        UPDATED=$((UPDATED + 1))
      fi
    done < <(find "$CODEX_ROLES_SRC" -type f -name "*.toml" | sort)
  fi
fi

# Update enforcement hooks (global install only)
if [ "$TARGET" = "global" ] && [ -d "$HOME/.claude/hooks" ]; then
  HOOK_SRC_DIR=""
  if [ -d "$CACHE_DIR/claude-code-plugin/scripts" ]; then
    HOOK_SRC_DIR="$CACHE_DIR/claude-code-plugin/scripts"
  fi
  if [ -n "$HOOK_SRC_DIR" ]; then
    for hook in a11y-team-eval.sh a11y-enforce-edit.sh a11y-mark-reviewed.sh; do
      SRC="$HOOK_SRC_DIR/$hook"
      DST="$HOME/.claude/hooks/$hook"
      if [ -f "$SRC" ] && [ -f "$DST" ]; then
        if ! cmp -s "$SRC" "$DST" 2>/dev/null; then
          cp "$SRC" "$DST"
          chmod +x "$DST"
          log "Updated hook: $hook"
          UPDATED=$((UPDATED + 1))
        fi
      elif [ -f "$SRC" ] && [ ! -f "$DST" ]; then
        cp "$SRC" "$DST"
        chmod +x "$DST"
        log "Added hook (new): $hook"
        UPDATED=$((UPDATED + 1))
      fi
    done
  fi
fi

# Save version
echo "$NEW_HASH" > "$VERSION_FILE"

if [ "$UPDATED" -gt 0 ]; then
  log "Update complete ($UPDATED files updated, version $NEW_HASH)."
else
  log "Files already match latest version ($NEW_HASH)."
fi

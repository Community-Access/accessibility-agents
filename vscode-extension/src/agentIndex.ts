import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs/promises";
import type { AgentEntry, AgentFrontmatter, AgentHandoff } from "./types";

// ── Frontmatter parser (zero-dep, handles simple YAML) ──────────────

function parseFrontmatter(raw: string): { meta: AgentFrontmatter; body: string } {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!fmMatch) {
    return { meta: {}, body: raw.trim() };
  }

  const yamlBlock = fmMatch[1];
  const body = raw.slice(fmMatch[0].length).trim();
  const meta: AgentFrontmatter = {};

  // Parse top-level scalar and simple array fields
  const lines = yamlBlock.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip blank lines and comments
    if (!line.trim() || line.trim().startsWith("#")) { i++; continue; }

    const m = line.match(/^([\w][-\w]*):\s*(.*)/);
    if (!m) { i++; continue; }

    const [, key, rawValue] = m;
    const value = rawValue.trim();

    switch (key) {
      case "name":
        meta.name = value.replace(/^["']|["']$/g, "");
        break;
      case "description": {
        // May be a multi-line YAML block scalar (> or |)
        if (value === ">" || value === "|") {
          const parts: string[] = [];
          i++;
          while (i < lines.length && (lines[i].startsWith("  ") || lines[i].trim() === "")) {
            parts.push(lines[i].replace(/^ {2}/, ""));
            i++;
          }
          meta.description = parts.join(value === ">" ? " " : "\n").trim();
          continue; // skip i++ at bottom
        }
        meta.description = value.replace(/^["']|["']$/g, "");
        break;
      }
      case "argument-hint":
        meta["argument-hint"] = value.replace(/^["']|["']$/g, "");
        break;
      case "user-invokable":
        meta["user-invokable"] = value.toLowerCase() !== "false";
        break;
      case "infer":
        meta.infer = value.toLowerCase() === "true";
        break;
      case "commands":
      case "aliases":
      case "tags": {
        const arr = parseYamlArray(value, lines, i);
        (meta as Record<string, unknown>)[key] = arr.values;
        i = arr.nextIndex;
        continue;
      }
      case "tools":
      case "model":
      case "agents": {
        const arr = parseYamlArray(value, lines, i);
        (meta as Record<string, unknown>)[key] = arr.values;
        i = arr.nextIndex;
        continue;
      }
      case "handoffs": {
        const ho = parseHandoffs(lines, i);
        meta.handoffs = ho.handoffs;
        i = ho.nextIndex;
        continue;
      }
    }
    i++;
  }
  return { meta, body };
}

/** Parse a YAML array — inline JSON, inline comma-separated, or block list. */
function parseYamlArray(
  inlineValue: string,
  lines: string[],
  currentIndex: number
): { values: string[]; nextIndex: number } {
  const trimmed = inlineValue.trim();

  // Inline JSON array: ["a", "b"]
  if (trimmed.startsWith("[")) {
    try {
      const arr = JSON.parse(trimmed.replace(/'/g, '"'));
      return { values: arr, nextIndex: currentIndex + 1 };
    } catch { /* fall through */ }
  }

  // Inline comma-separated: a, b, c
  if (trimmed && !trimmed.startsWith("-")) {
    const vals = trimmed.split(",").map(s => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    if (vals.length > 0) {
      return { values: vals, nextIndex: currentIndex + 1 };
    }
  }

  // Block list:  \n  - item1 \n  - item2
  const values: string[] = [];
  let j = currentIndex + 1;
  while (j < lines.length) {
    const bm = lines[j].match(/^\s+-\s+(.+)/);
    if (bm) {
      values.push(bm[1].trim().replace(/^["']|["']$/g, ""));
      j++;
    } else if (lines[j].trim() === "") {
      j++;
    } else {
      break;
    }
  }
  return { values, nextIndex: j };
}

/** Parse handoffs block — array of objects with label, agent, prompt, send, model. */
function parseHandoffs(
  lines: string[],
  currentIndex: number
): { handoffs: AgentHandoff[]; nextIndex: number } {
  const handoffs: AgentHandoff[] = [];
  let j = currentIndex + 1;
  let current: Partial<AgentHandoff> | null = null;

  while (j < lines.length) {
    const line = lines[j];
    // New handoff entry: "  - label: ..."
    const entryMatch = line.match(/^\s+-\s+label:\s*(.+)/);
    if (entryMatch) {
      if (current && current.label) {
        handoffs.push(finalizeHandoff(current));
      }
      current = { label: entryMatch[1].trim().replace(/^["']|["']$/g, "") };
      j++;
      continue;
    }
    // Handoff property: "    agent: ..."
    const propMatch = line.match(/^\s+(agent|prompt|send|model):\s*(.+)/);
    if (propMatch && current) {
      const [, prop, val] = propMatch;
      if (prop === "send") {
        current.send = val.trim().toLowerCase() === "true";
      } else {
        (current as Record<string, unknown>)[prop] = val.trim().replace(/^["']|["']$/g, "");
      }
      j++;
      continue;
    }
    // If we hit a non-indented line that's not a continuation, stop
    if (line.match(/^[\w]/) || (line.trim() === "" && j + 1 < lines.length && lines[j + 1].match(/^[\w]/))) {
      break;
    }
    j++;
  }
  if (current && current.label) {
    handoffs.push(finalizeHandoff(current));
  }
  return { handoffs, nextIndex: j };
}

function finalizeHandoff(partial: Partial<AgentHandoff>): AgentHandoff {
  return {
    label: partial.label ?? "",
    agent: partial.agent ?? "",
    prompt: partial.prompt ?? "",
    send: partial.send ?? false,
    model: partial.model ?? "",
  };
}

// ── Build AgentEntry from file ───────────────────────────────────────

async function parseAgentFile(filePath: string): Promise<AgentEntry | undefined> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const stat = await fs.stat(filePath);
    const stem = path.basename(filePath, ".agent.md");
    const { meta, body } = parseFrontmatter(raw);

    const commands = [
      ...(meta.commands ?? []),
      ...(meta.aliases ?? []),
    ];

    // Auto-derive a command from the stem if none declared
    if (commands.length === 0) {
      commands.push(stem);
    }

    return {
      id: stem,
      name: meta.name ?? stem.replace(/-/g, " "),
      description: meta.description ?? "",
      commands,
      tags: meta.tags ?? [],
      body,
      filePath,
      lastModified: stat.mtime.toISOString(),
      userInvokable: meta["user-invokable"] !== false,
      argumentHint: meta["argument-hint"] ?? "",
      tools: meta.tools ?? [],
      models: meta.model ?? [],
      infer: meta.infer ?? false,
      handoffs: meta.handoffs ?? [],
      subAgents: meta.agents ?? [],
    };
  } catch {
    return undefined;
  }
}

// ── AgentIndex ───────────────────────────────────────────────────────

export class AgentIndex implements vscode.Disposable {
  private entries = new Map<string, AgentEntry>();
  private watcher: vscode.FileSystemWatcher | undefined;
  private disposables: vscode.Disposable[] = [];
  private _onDidUpdate = new vscode.EventEmitter<void>();
  /** Fires when the index changes (add/remove/update). */
  readonly onDidUpdate = this._onDidUpdate.event;

  /** All current agent entries. */
  all(): AgentEntry[] {
    return [...this.entries.values()];
  }

  /** Look up an agent by its id (stem). */
  get(id: string): AgentEntry | undefined {
    return this.entries.get(id);
  }

  /** Find agents whose `commands` array contains the given command. Only user-invokable agents. */
  byCommand(command: string): AgentEntry[] {
    const lower = command.toLowerCase();
    return this.all().filter(e =>
      e.userInvokable && (
        e.commands.some(c => c.toLowerCase() === lower) ||
        e.id.toLowerCase() === lower
      )
    );
  }

  /** Find user-invokable agents that have any of the given tags. */
  byTags(tags: string[]): AgentEntry[] {
    const lowerTags = new Set(tags.map(t => t.toLowerCase()));
    return this.all()
      .filter(e => e.userInvokable)
      .map(e => {
        const overlap = e.tags.filter(t => lowerTags.has(t.toLowerCase())).length;
        return { entry: e, overlap };
      })
      .filter(r => r.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap)
      .map(r => r.entry);
  }

  /** Simple keyword search across name, description, tags, and body. Only user-invokable. */
  byKeyword(keyword: string): AgentEntry[] {
    const lower = keyword.toLowerCase();
    return this.all().filter(e =>
      e.userInvokable && (
        e.name.toLowerCase().includes(lower) ||
        e.description.toLowerCase().includes(lower) ||
        e.tags.some(t => t.toLowerCase().includes(lower)) ||
        e.id.toLowerCase().includes(lower)
      )
    );
  }

  /** Return only user-invokable agents (for UI listing). */
  userInvokable(): AgentEntry[] {
    return this.all().filter(e => e.userInvokable);
  }

  /** Get handoff targets for an agent. */
  handoffTargets(agentId: string): AgentEntry[] {
    const source = this.get(agentId);
    if (!source) return [];
    return source.handoffs
      .map(h => this.get(h.agent))
      .filter((e): e is AgentEntry => e !== undefined);
  }

  // ── Loading ──────────────────────────────────────────────────────

  /** Scan a directory for `.agent.md` files and populate the index. */
  async loadDir(dirPath: string): Promise<void> {
    try {
      const files = await fs.readdir(dirPath);
      const agentFiles = files.filter((f: string) => f.endsWith(".agent.md"));
      const results = await Promise.all(
        agentFiles.map((f: string) => parseAgentFile(path.join(dirPath, f)))
      );
      for (const entry of results) {
        if (entry) {
          this.entries.set(entry.id, entry);
        }
      }
      this._onDidUpdate.fire();
    } catch {
      // directory doesn't exist or unreadable — ignore
    }
  }

  /** Reload a single file (add or update). */
  async reloadFile(filePath: string): Promise<void> {
    const entry = await parseAgentFile(filePath);
    if (entry) {
      this.entries.set(entry.id, entry);
      this._onDidUpdate.fire();
    }
  }

  /** Remove a file from the index. */
  removeFile(filePath: string): void {
    const stem = path.basename(filePath, ".agent.md");
    if (this.entries.delete(stem)) {
      this._onDidUpdate.fire();
    }
  }

  // ── File watching ────────────────────────────────────────────────

  /** Start watching a glob pattern for `.agent.md` changes. */
  watch(pattern: vscode.GlobPattern): void {
    this.stopWatching();
    this.watcher = vscode.workspace.createFileSystemWatcher(pattern);

    this.watcher.onDidCreate(uri => this.reloadFile(uri.fsPath), this, this.disposables);
    this.watcher.onDidChange(uri => this.reloadFile(uri.fsPath), this, this.disposables);
    this.watcher.onDidDelete(uri => this.removeFile(uri.fsPath), this, this.disposables);

    this.disposables.push(this.watcher);
  }

  /** Stop watching. */
  stopWatching(): void {
    if (this.watcher) {
      this.watcher.dispose();
      this.watcher = undefined;
    }
  }

  dispose(): void {
    this.stopWatching();
    for (const d of this.disposables) d.dispose();
    this.disposables = [];
    this._onDidUpdate.dispose();
  }
}

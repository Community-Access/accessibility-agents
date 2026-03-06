/**
 * Represents a single agent entry parsed from an `.agent.md` file.
 */
export interface AgentEntry {
  /** Filename stem, e.g. "aria-specialist" */
  id: string;
  /** Human-readable name from frontmatter or derived from id */
  name: string;
  /** Short description from frontmatter */
  description: string;
  /** Slash-command aliases this agent responds to (e.g. ["aria", "roles"]) */
  commands: string[];
  /** Tags for keyword/topic matching (e.g. ["wcag", "aria", "widgets"]) */
  tags: string[];
  /** Body text (system prompt) — everything after YAML frontmatter */
  body: string;
  /** Absolute file path to the .agent.md file */
  filePath: string;
  /** ISO timestamp of last modification */
  lastModified: string;
  /** Whether this agent can be invoked directly by users (default true) */
  userInvokable: boolean;
  /** Argument hint shown in UI (e.g. "e.g. 'check my modal ARIA'") */
  argumentHint: string;
  /** Tools this agent can use */
  tools: string[];
  /** Preferred model(s) */
  models: string[];
  /** Whether the agent supports inference/auto-routing */
  infer: boolean;
  /** Handoff targets for multi-agent orchestration */
  handoffs: AgentHandoff[];
  /** Sub-agents this agent can delegate to */
  subAgents: string[];
}

/**
 * A handoff target declared in agent frontmatter.
 */
export interface AgentHandoff {
  label: string;
  agent: string;
  prompt: string;
  send: boolean;
  model: string;
}

/**
 * Parsed YAML frontmatter from an `.agent.md` file.
 * All fields are optional; loader fills defaults.
 */
export interface AgentFrontmatter {
  name?: string;
  description?: string;
  commands?: string[];
  tags?: string[];
  /** @deprecated kept for backward compat — maps to commands */
  aliases?: string[];
  "argument-hint"?: string;
  "user-invokable"?: boolean;
  tools?: string[];
  model?: string[];
  infer?: boolean;
  handoffs?: AgentHandoff[];
  agents?: string[];
}

/**
 * Result of a routing decision.
 */
export interface RouteResult {
  /** Matched agents, ordered by relevance (best first) */
  agents: AgentEntry[];
  /** How the match was made */
  matchType: "command" | "tag" | "keyword" | "default";
  /** Confidence 0–1 */
  confidence: number;
}

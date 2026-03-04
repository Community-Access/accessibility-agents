import type { AgentEntry, RouteResult } from "./types";
import type { AgentIndex } from "./agentIndex";

/**
 * Routes an incoming request to the best-matching agent(s).
 *
 * Priority order:
 *   1. Exact slash-command match (only user-invokable agents)
 *   2. Tag match (highest overlap first)
 *   3. Keyword search across name/description/tags
 *   4. Default agent fallback
 *
 * Internal agents (user-invokable: false) are excluded from direct
 * routing but remain accessible via handoff orchestration.
 */
export function route(
  index: AgentIndex,
  options: {
    command?: string;
    prompt?: string;
    defaultAgentId: string;
  }
): RouteResult {
  const { command, prompt, defaultAgentId } = options;

  // 1. Exact command match
  if (command) {
    const byCmd = index.byCommand(command);
    if (byCmd.length > 0) {
      return { agents: byCmd, matchType: "command", confidence: 1.0 };
    }
  }

  // 2. Extract keywords from prompt and try tag match
  if (prompt) {
    const keywords = extractKeywords(prompt);
    if (keywords.length > 0) {
      const byTags = index.byTags(keywords);
      if (byTags.length > 0) {
        return { agents: byTags, matchType: "tag", confidence: 0.8 };
      }

      // 3. Keyword search
      for (const kw of keywords) {
        const byKw = index.byKeyword(kw);
        if (byKw.length > 0) {
          return { agents: byKw, matchType: "keyword", confidence: 0.5 };
        }
      }
    }
  }

  // 4. Fallback to default agent
  const fallback = index.get(defaultAgentId);
  const agents: AgentEntry[] = fallback ? [fallback] : index.all().slice(0, 1);
  return { agents, matchType: "default", confidence: 0.3 };
}

/**
 * Build a composite system prompt from one or more agents.
 * If multiple agents match, their bodies are joined with a separator.
 */
export function buildPrompt(
  result: RouteResult,
  conformanceLevel: string
): string {
  const header =
    `You are an accessibility specialist. Target conformance: WCAG ${conformanceLevel}.\n` +
    `Routing confidence: ${result.confidence} (${result.matchType} match).\n\n`;

  const bodies = result.agents.map(a => {
    const label = `## Agent: ${a.name}\n`;
    return label + a.body;
  });

  return header + bodies.join("\n\n---\n\n");
}

// ── Helpers ──────────────────────────────────────────────────────────

/** Extract meaningful keywords from a user prompt. */
function extractKeywords(prompt: string): string[] {
  const stopWords = new Set([
    "a", "an", "the", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will",
    "would", "could", "should", "may", "might", "shall", "can",
    "to", "of", "in", "for", "on", "with", "at", "by", "from",
    "as", "into", "about", "between", "through", "after", "before",
    "above", "below", "and", "or", "not", "but", "if", "then",
    "so", "that", "this", "it", "i", "me", "my", "we", "our",
    "you", "your", "they", "them", "their", "what", "which",
    "how", "when", "where", "who", "please", "help", "check",
    "make", "use", "want", "need",
  ]);

  return prompt
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));
}

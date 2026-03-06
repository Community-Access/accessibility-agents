import * as vscode from "vscode";
import * as path from "path";
import { AgentIndex } from "./agentIndex";
import type { AgentEntry } from "./types";
import { route, buildPrompt } from "./router";

// ── Shared state ─────────────────────────────────────────────────────

let agentIndex: AgentIndex;

// ── Settings ─────────────────────────────────────────────────────────

type RegistrationMode = "slash-commands" | "individual-participants" | "both";

function getConfig() {
  const cfg = vscode.workspace.getConfiguration("a11y");
  return {
    agentsPaths: resolveAgentsPaths(cfg),
    defaultAgent: cfg.get<string>("defaultAgent", "accessibility-lead"),
    conformanceLevel: cfg.get<string>("conformanceLevel", "AA"),
    watchForChanges: cfg.get<boolean>("watchForChanges", true),
    registrationMode: cfg.get<RegistrationMode>("registrationMode", "slash-commands"),
  };
}

/**
 * Resolve the list of directories to scan for `.agent.md` files.
 * Checks the `a11y.agentsPaths` array first, then falls back to
 * `a11y.agentsPath` (single string, backward compat), then auto-discovers
 * well-known locations in each workspace folder.
 */
function resolveAgentsPaths(
  cfg: vscode.WorkspaceConfiguration
): string[] {
  // New array setting
  const multi = cfg.get<string[]>("agentsPaths", []);
  if (multi.length > 0) return multi;

  // Legacy single-path setting
  const single = cfg.get<string>("agentsPath", "").trim();
  if (single) return [single];

  // Auto-discover well-known paths in workspace folders
  const folders = vscode.workspace.workspaceFolders;
  if (!folders) return [];

  const candidates: string[] = [];
  for (const folder of folders) {
    const root = folder.uri.fsPath;
    candidates.push(
      path.join(root, ".github", "agents"),
      path.join(root, "copilot-agents"),
      path.join(root, "agents"),
    );
  }
  return candidates;
}

// ── Index bootstrap ──────────────────────────────────────────────────

async function bootstrapIndex(
  context: vscode.ExtensionContext
): Promise<AgentIndex> {
  const config = getConfig();
  const index = new AgentIndex();
  context.subscriptions.push(index);

  // Scan every configured/discovered directory
  for (const dir of config.agentsPaths) {
    await index.loadDir(dir);
  }

  const count = index.all().length;
  if (count > 0) {
    vscode.window.setStatusBarMessage(
      `$(shield) A11y: ${count} agents loaded`,
      5000
    );
  }

  // Start file watching if enabled
  if (config.watchForChanges) {
    index.watch("**/*.agent.md");

    index.onDidUpdate(() => {
      const n = index.all().length;
      vscode.window.setStatusBarMessage(
        `$(shield) A11y: index updated — ${n} agents`,
        3000
      );
    });
  }

  return index;
}

// ── Activation ───────────────────────────────────────────────────────

/** Disposables for dynamically-registered individual chat participants. */
let individualParticipants: vscode.Disposable[] = [];

export async function activate(context: vscode.ExtensionContext) {
  agentIndex = await bootstrapIndex(context);
  const config = getConfig();

  // ── Hub participant (@a11y) — always registered, behavior varies by mode ──
  const hubParticipant = vscode.chat.createChatParticipant(
    "a11y-agent-team.a11y",
    hubHandler
  );
  hubParticipant.iconPath = vscode.Uri.joinPath(
    context.extensionUri,
    "icon.png"
  );
  context.subscriptions.push(hubParticipant);

  // ── Individual @agent-name participants (when mode requires them) ──
  if (config.registrationMode === "individual-participants" || config.registrationMode === "both") {
    registerIndividualParticipants(context);
  }

  // ── Re-register when the index updates (new agents discovered) ──
  agentIndex.onDidUpdate(() => {
    const cfg = getConfig();
    if (cfg.registrationMode === "individual-participants" || cfg.registrationMode === "both") {
      disposeIndividualParticipants();
      registerIndividualParticipants(context);
    }
  });

  // ── Commands ──
  context.subscriptions.push(
    vscode.commands.registerCommand("a11y.reloadIndex", async () => {
      const cfg = getConfig();
      for (const dir of cfg.agentsPaths) {
        await agentIndex.loadDir(dir);
      }
      const n = agentIndex.all().length;
      vscode.window.showInformationMessage(
        `A11y Agent Team: reloaded ${n} agents.`
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("a11y.listAgents", async () => {
      const all = agentIndex.all();
      if (all.length === 0) {
        vscode.window.showInformationMessage(
          "No agents discovered. Check a11y.agentsPaths or open a workspace with .agent.md files."
        );
        return;
      }
      const items = all
        .filter(a => a.userInvokable)
        .map(a => ({
          label: a.name,
          description: a.commands.length > 0
            ? `/${a.commands[0]}`
            : a.id,
          detail: a.description || undefined,
        }));
      await vscode.window.showQuickPick(items, {
        title: "Discovered A11y Agents",
        placeHolder: "Browse loaded agents",
      });
    })
  );

  // ── Setting changes — prompt reload for registrationMode ──
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async e => {
      if (e.affectsConfiguration("a11y")) {
        const cfg = getConfig();
        // Re-scan directories on any a11y setting change
        for (const dir of cfg.agentsPaths) {
          await agentIndex.loadDir(dir);
        }

        // registrationMode changes require a window reload because
        // statically-contributed chat participant commands can't be
        // added/removed at runtime.
        if (e.affectsConfiguration("a11y.registrationMode")) {
          const action = await vscode.window.showInformationMessage(
            "Registration mode changed. A window reload is needed to update chat participants.",
            "Reload Window"
          );
          if (action === "Reload Window") {
            vscode.commands.executeCommand("workbench.action.reloadWindow");
          }
        }
      }
    })
  );
}

// ── Individual participant registration ──────────────────────────────

/**
 * Dynamically register each user-invokable agent as its own `@agent-name`
 * chat participant. Each gets a dedicated handler that routes directly
 * to that specific agent — no slash commands, no routing ambiguity.
 */
function registerIndividualParticipants(context: vscode.ExtensionContext) {
  const agents = agentIndex.userInvokable();
  for (const agent of agents) {
    const participantId = `a11y-agent-team.${agent.id}`;
    const participant = vscode.chat.createChatParticipant(
      participantId,
      createAgentHandler(agent)
    );
    participant.iconPath = vscode.Uri.joinPath(
      context.extensionUri,
      "icon.png"
    );
    individualParticipants.push(participant);
  }

  const count = agents.length;
  if (count > 0) {
    vscode.window.setStatusBarMessage(
      `$(shield) A11y: ${count} individual @participants registered`,
      5000
    );
  }
}

/** Dispose all dynamically-registered individual participants. */
function disposeIndividualParticipants() {
  for (const d of individualParticipants) {
    d.dispose();
  }
  individualParticipants = [];
}

/** Create a handler bound to a specific agent entry. */
function createAgentHandler(agent: AgentEntry): vscode.ChatRequestHandler {
  return async (request, _context, stream, token) => {
    const config = getConfig();

    // Build system prompt directly from the agent's body
    const systemPrompt =
      `You are ${agent.name}. ${agent.description}\n\n` +
      `Target conformance level: WCAG ${config.conformanceLevel}.\n\n` +
      agent.body;

    if (token.isCancellationRequested) return;

    const messages: vscode.LanguageModelChatMessage[] = [];
    if (systemPrompt) {
      messages.push(vscode.LanguageModelChatMessage.User(systemPrompt));
    }
    messages.push(vscode.LanguageModelChatMessage.User(request.prompt));

    const chatResponse = await request.model.sendRequest(messages, {}, token);
    for await (const fragment of chatResponse.text) {
      if (token.isCancellationRequested) return;
      stream.markdown(fragment);
    }
  };
}

// ── Hub chat handler (@a11y with slash commands) ─────────────────────

const hubHandler: vscode.ChatRequestHandler = async (
  request,
  _context,
  stream,
  token
) => {
  const config = getConfig();

  // Route via dynamic index
  const result = route(agentIndex, {
    command: request.command,
    prompt: request.prompt,
    defaultAgentId: config.defaultAgent,
  });

  if (result.agents.length === 0) {
    stream.markdown(
      "No agents discovered. Please open a workspace containing `.agent.md` files " +
        "or configure `a11y.agentsPaths` in your settings.\n\n" +
        "I will do my best with built-in knowledge.\n\n"
    );
  } else if (result.matchType !== "command" && request.command) {
    stream.markdown(
      `> No exact match for \`/${request.command}\`. ` +
        `Routed to **${result.agents[0].name}** via ${result.matchType} match ` +
        `(confidence ${(result.confidence * 100).toFixed(0)}%).\n\n`
    );
  }

  // Build system prompt from matched agents
  const systemPrompt = buildPrompt(result, config.conformanceLevel);

  if (token.isCancellationRequested) return;

  // Assemble messages
  const messages: vscode.LanguageModelChatMessage[] = [];

  if (systemPrompt) {
    messages.push(
      vscode.LanguageModelChatMessage.User(systemPrompt)
    );
  }
  messages.push(
    vscode.LanguageModelChatMessage.User(request.prompt)
  );

  // Send to the model the user selected in the chat view
  const chatResponse = await request.model.sendRequest(messages, {}, token);

  for await (const fragment of chatResponse.text) {
    if (token.isCancellationRequested) return;
    stream.markdown(fragment);
  }
};

export function deactivate() {
  disposeIndividualParticipants();
  // AgentIndex is disposed via context.subscriptions
}

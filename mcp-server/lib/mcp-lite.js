/**
 * mcp-lite.js - the server half of the Model Context Protocol, as much of it
 * as this server uses, in readable source.
 *
 * The plugin directory reads every file a plugin ships and holds a version
 * for a person to inspect when a file is over 256 KiB or is packed so it
 * cannot be read. This server used to ship as one 1.5 MB bundle of the
 * official SDK and its dependencies. The SDK is still what tests this code:
 * mcp-conformance.test.js drives it with the SDK's own client.
 *
 * What is here: initialize, ping, tools/list, tools/call, prompts/list,
 * prompts/get, resources/list, resources/templates/list, resources/read,
 * completion/complete and cancellation. Messages travel over any object with
 * the SDK's transport shape (start, send, close, onmessage, onclose), so the
 * HTTP entry point keeps the SDK's Streamable HTTP transport and the stdio
 * entry point uses the small StdioServerTransport below.
 *
 * Reference: https://modelcontextprotocol.io/specification
 */

import { asObjectSchema } from "./schema.js";

export const LATEST_PROTOCOL_VERSION = "2025-11-25";
export const SUPPORTED_PROTOCOL_VERSIONS = [
  LATEST_PROTOCOL_VERSION,
  "2025-06-18",
  "2025-03-26",
  "2024-11-05",
  "2024-10-07",
];

/** JSON-RPC and MCP error codes. */
export const ErrorCode = {
  ParseError: -32700,
  InvalidRequest: -32600,
  MethodNotFound: -32601,
  InvalidParams: -32602,
  InternalError: -32603,
  ResourceNotFound: -32002,
};

export class McpError extends Error {
  constructor(code, message, data) {
    super(`MCP error ${code}: ${message}`);
    this.code = code;
    this.data = data;
    this.rawMessage = message;
  }
}

/** A URI template with {name} placeholders, each matching one path segment. */
export class ResourceTemplate {
  constructor(uriTemplate, callbacks = {}) {
    this._template = String(uriTemplate);
    this._list = callbacks.list;
    this._complete = callbacks.complete || {};
    const names = [];
    const pattern = this._template
      .split(/(\{[^}]+\})/)
      .map((part) => {
        const m = /^\{([^}]+)\}$/.exec(part);
        if (!m) return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        names.push(m[1]);
        return "([^/]+)";
      })
      .join("");
    this._names = names;
    this._regex = new RegExp(`^${pattern}$`);
    this.uriTemplate = { toString: () => this._template };
  }

  get listCallback() {
    return this._list;
  }

  completeCallback(name) {
    return this._complete[name];
  }

  /** The variables in a URI, or null when the URI does not fit. */
  match(uri) {
    const m = this._regex.exec(uri);
    if (!m) return null;
    const vars = {};
    this._names.forEach((name, i) => {
      vars[name] = decodeURIComponent(m[i + 1]);
    });
    return vars;
  }
}

export class McpServer {
  constructor(serverInfo, options = {}) {
    this.serverInfo = serverInfo;
    this.instructions = options.instructions;
    this._registeredTools = {};
    this._registeredPrompts = {};
    this._registeredResources = {};
    this._registeredResourceTemplates = {};
    this._inflight = new Map();
    this._transport = undefined;
  }

  registerTool(name, config, handler) {
    if (this._registeredTools[name]) throw new Error(`Tool ${name} is already registered`);
    const tool = {
      title: config.title,
      description: config.description,
      inputSchema: config.inputSchema ? asObjectSchema(config.inputSchema) : undefined,
      outputSchema: config.outputSchema ? asObjectSchema(config.outputSchema) : undefined,
      annotations: config.annotations,
      _meta: config._meta,
      handler,
      enabled: true,
    };
    this._registeredTools[name] = tool;
    return tool;
  }

  registerPrompt(name, config, callback) {
    if (this._registeredPrompts[name]) throw new Error(`Prompt ${name} is already registered`);
    const prompt = {
      title: config.title,
      description: config.description,
      argsSchema: config.argsSchema ? asObjectSchema(config.argsSchema) : undefined,
      callback,
      enabled: true,
    };
    this._registeredPrompts[name] = prompt;
    return prompt;
  }

  registerResource(name, uriOrTemplate, metadata, readCallback) {
    if (uriOrTemplate instanceof ResourceTemplate) {
      if (this._registeredResourceTemplates[name]) throw new Error(`Resource template ${name} is already registered`);
      const entry = { resourceTemplate: uriOrTemplate, metadata: metadata || {}, readCallback, enabled: true };
      this._registeredResourceTemplates[name] = entry;
      return entry;
    }
    const uri = String(uriOrTemplate);
    if (this._registeredResources[uri]) throw new Error(`Resource ${uri} is already registered`);
    const entry = { name, metadata: metadata || {}, readCallback, enabled: true };
    this._registeredResources[uri] = entry;
    return entry;
  }

  async connect(transport) {
    this._transport = transport;
    transport.onmessage = (message, extra) => {
      this._receive(message, extra).catch((err) => {
        if (transport.onerror) transport.onerror(err);
      });
    };
    transport.onclose = () => {
      for (const controller of this._inflight.values()) controller.abort();
      this._inflight.clear();
      if (this.onclose) this.onclose();
    };
    await transport.start();
  }

  async close() {
    if (this._transport) await this._transport.close();
  }

  isConnected() {
    return Boolean(this._transport);
  }

  async _receive(message, extra = {}) {
    if (!message || message.jsonrpc !== "2.0") return;
    const isRequest = message.id !== undefined && message.id !== null && typeof message.method === "string";

    if (!isRequest) {
      if (message.method === "notifications/cancelled") {
        const controller = this._inflight.get(message.params?.requestId);
        if (controller) controller.abort(message.params?.reason);
      }
      return; // other notifications and stray responses need no answer
    }

    const controller = new AbortController();
    this._inflight.set(message.id, controller);
    const context = {
      signal: controller.signal,
      requestId: message.id,
      _meta: message.params?._meta,
      authInfo: extra.authInfo,
      requestInfo: extra.requestInfo,
      sendNotification: (notification) =>
        this._send({ jsonrpc: "2.0", ...notification }, { relatedRequestId: message.id }),
    };

    let reply;
    try {
      const result = await this._dispatch(message.method, message.params || {}, context);
      reply = { jsonrpc: "2.0", id: message.id, result };
    } catch (err) {
      const code = Number.isInteger(err?.code) ? err.code : ErrorCode.InternalError;
      const text = err?.rawMessage || err?.message || String(err);
      reply = { jsonrpc: "2.0", id: message.id, error: { code, message: text } };
      if (err?.data !== undefined) reply.error.data = err.data;
    } finally {
      this._inflight.delete(message.id);
    }
    // A cancelled request gets no reply, per the specification.
    if (!controller.signal.aborted) await this._send(reply, { relatedRequestId: message.id });
  }

  async _send(message, options) {
    if (this._transport) await this._transport.send(message, options);
  }

  async _dispatch(method, params, context) {
    switch (method) {
      case "initialize":
        return this._initialize(params);
      case "ping":
        return {};
      case "tools/list":
        return this._listTools();
      case "tools/call":
        return this._callTool(params, context);
      case "prompts/list":
        return this._listPrompts();
      case "prompts/get":
        return this._getPrompt(params, context);
      case "resources/list":
        return this._listResources(context);
      case "resources/templates/list":
        return this._listResourceTemplates();
      case "resources/read":
        return this._readResource(params, context);
      case "completion/complete":
        return this._complete(params);
      default:
        throw new McpError(ErrorCode.MethodNotFound, `Method not found: ${method}`);
    }
  }

  _initialize(params) {
    const requested = params.protocolVersion;
    const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(requested) ? requested : LATEST_PROTOCOL_VERSION;
    const capabilities = { tools: { listChanged: true }, completions: {} };
    if (Object.keys(this._registeredPrompts).length) capabilities.prompts = { listChanged: true };
    if (Object.keys(this._registeredResources).length || Object.keys(this._registeredResourceTemplates).length) {
      capabilities.resources = { listChanged: true };
    }
    const result = { protocolVersion, capabilities, serverInfo: this.serverInfo };
    if (this.instructions) result.instructions = this.instructions;
    return result;
  }

  _listTools() {
    const tools = Object.entries(this._registeredTools)
      .filter(([, t]) => t.enabled)
      .map(([name, t]) => {
        const entry = {
          name,
          title: t.title,
          description: t.description,
          inputSchema: t.inputSchema ? t.inputSchema.toJSONSchema() : { type: "object", properties: {} },
        };
        if (t.outputSchema) entry.outputSchema = t.outputSchema.toJSONSchema();
        if (t.annotations) entry.annotations = t.annotations;
        if (t._meta) entry._meta = t._meta;
        return entry;
      });
    return { tools };
  }

  async _callTool(params, context) {
    const tool = this._registeredTools[params.name];
    if (!tool || !tool.enabled) {
      throw new McpError(ErrorCode.InvalidParams, `Tool ${params.name} not found`);
    }
    let args = params.arguments ?? {};
    if (tool.inputSchema) {
      const parsed = tool.inputSchema.safeParse(args);
      if (!parsed.success) {
        return toolError(`Input validation error: invalid arguments for tool ${params.name}: ${parsed.error.message}`);
      }
      args = parsed.data;
    }
    try {
      const result = await tool.handler(args, context);
      if (tool.outputSchema && !result?.isError && result?.structuredContent === undefined) {
        return toolError(`Output validation error: tool ${params.name} has an output schema but returned no structured content`);
      }
      return result;
    } catch (err) {
      return toolError(err?.message || String(err));
    }
  }

  _listPrompts() {
    const prompts = Object.entries(this._registeredPrompts)
      .filter(([, p]) => p.enabled)
      .map(([name, p]) => {
        const entry = { name, title: p.title, description: p.description };
        if (p.argsSchema) {
          entry.arguments = Object.entries(p.argsSchema.shape).map(([argName, field]) => ({
            name: argName,
            description: field.description,
            required: !field.isOptional,
          }));
        }
        return entry;
      });
    return { prompts };
  }

  async _getPrompt(params, context) {
    const prompt = this._registeredPrompts[params.name];
    if (!prompt || !prompt.enabled) {
      throw new McpError(ErrorCode.InvalidParams, `Prompt ${params.name} not found`);
    }
    let args = params.arguments ?? {};
    if (prompt.argsSchema) {
      const parsed = prompt.argsSchema.safeParse(args);
      if (!parsed.success) {
        throw new McpError(ErrorCode.InvalidParams, `Invalid arguments for prompt ${params.name}: ${parsed.error.message}`);
      }
      args = parsed.data;
    }
    return prompt.callback(args, context);
  }

  async _listResources(context) {
    const resources = Object.entries(this._registeredResources)
      .filter(([, r]) => r.enabled)
      .map(([uri, r]) => ({ uri, name: r.name, ...r.metadata }));
    for (const entry of Object.values(this._registeredResourceTemplates)) {
      const list = entry.resourceTemplate.listCallback;
      if (!entry.enabled || !list) continue;
      const listed = await list(context);
      for (const r of listed.resources || []) resources.push({ ...entry.metadata, ...r });
    }
    return { resources };
  }

  _listResourceTemplates() {
    const resourceTemplates = Object.entries(this._registeredResourceTemplates)
      .filter(([, t]) => t.enabled)
      .map(([name, t]) => ({
        name,
        uriTemplate: t.resourceTemplate.uriTemplate.toString(),
        ...t.metadata,
      }));
    return { resourceTemplates };
  }

  async _readResource(params, context) {
    const uri = String(params.uri);
    const fixed = this._registeredResources[uri];
    if (fixed && fixed.enabled) return fixed.readCallback(new URL(uri), context);
    for (const entry of Object.values(this._registeredResourceTemplates)) {
      if (!entry.enabled) continue;
      const vars = entry.resourceTemplate.match(uri);
      if (vars) return entry.readCallback(new URL(uri), vars, context);
    }
    throw new McpError(ErrorCode.ResourceNotFound, `Resource ${uri} not found`);
  }

  async _complete(params) {
    const empty = { completion: { values: [], hasMore: false } };
    const ref = params.ref || {};
    if (ref.type !== "ref/resource") return empty;
    const entry = Object.values(this._registeredResourceTemplates).find(
      (t) => t.resourceTemplate.uriTemplate.toString() === ref.uri,
    );
    const complete = entry?.resourceTemplate.completeCallback(params.argument?.name);
    if (!complete) return empty;
    const value = String(params.argument?.value ?? "");
    const all = await complete(value, params.context);
    const values = all.filter((v) => String(v).startsWith(value)).slice(0, 100);
    return { completion: { values, total: values.length, hasMore: false } };
  }
}

function toolError(text) {
  return { content: [{ type: "text", text }], isError: true };
}

/**
 * Newline-delimited JSON-RPC over this process's stdin and stdout, which is
 * how MCP clients run a local server. Nothing else may write to stdout.
 */
export class StdioServerTransport {
  constructor(stdin = process.stdin, stdout = process.stdout) {
    this._stdin = stdin;
    this._stdout = stdout;
    this._buffer = "";
    this._started = false;
    this._onData = (chunk) => {
      this._buffer += chunk.toString("utf8");
      let newline;
      while ((newline = this._buffer.indexOf("\n")) !== -1) {
        const line = this._buffer.slice(0, newline).replace(/\r$/, "");
        this._buffer = this._buffer.slice(newline + 1);
        if (!line.trim()) continue;
        let message;
        try {
          message = JSON.parse(line);
        } catch (err) {
          if (this.onerror) this.onerror(err);
          continue;
        }
        if (this.onmessage) this.onmessage(message);
      }
    };
    this._onError = (err) => {
      if (this.onerror) this.onerror(err);
    };
    this._onEnd = () => this.close();
  }

  async start() {
    if (this._started) throw new Error("StdioServerTransport already started");
    this._started = true;
    this._stdin.on("data", this._onData);
    this._stdin.on("error", this._onError);
    this._stdin.on("end", this._onEnd);
  }

  send(message) {
    return new Promise((resolve) => {
      const json = JSON.stringify(message) + "\n";
      if (this._stdout.write(json)) resolve();
      else this._stdout.once("drain", resolve);
    });
  }

  async close() {
    if (!this._started) return;
    this._started = false;
    this._stdin.off("data", this._onData);
    this._stdin.off("error", this._onError);
    this._stdin.off("end", this._onEnd);
    if (this._stdin.listenerCount("data") === 0) this._stdin.pause();
    this._buffer = "";
    if (this.onclose) this.onclose();
  }
}

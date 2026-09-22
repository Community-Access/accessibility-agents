/**
 * GLOW bridge tools for the A11y Agent Team MCP server.
 *
 * These tools expose GLOW's HTTP API endpoints as native MCP tools,
 * allowing MCP clients to use GLOW features without speaking REST directly.
 */

import { z } from "zod";
import { basename } from "node:path";
import { readFile as fsReadFile } from "node:fs/promises";
import { validateFilePath } from "../server-core.js";

const DEFAULT_GLOW_BASE_URL =
    process.env.GLOW_API_BASE_URL || "https://letitglow.app/mcp";
const DEFAULT_TIMEOUT_MS = 120000;
const MAX_RESPONSE_CHARS = 20000;

function normalizeBaseUrl(baseUrl) {
    const trimmed = (baseUrl || DEFAULT_GLOW_BASE_URL).trim();
    return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

function trimText(value, max = MAX_RESPONSE_CHARS) {
    if (value.length <= max) return value;
    return `${value.slice(0, max)}\n... [truncated]`;
}

function toMcpText(title, payload) {
    const body =
        typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
    return `${title}\n\n${trimText(body)}`;
}

async function readAsUpload(filePath) {
    const safe = validateFilePath(filePath);
    const contents = await fsReadFile(safe);
    return {
        fileName: basename(safe),
        contents,
    };
}

async function callGlow(endpoint, { method = "GET", baseUrl, timeoutMs, formData }) {
    const root = normalizeBaseUrl(baseUrl);
    const url = `${root}${endpoint}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs || DEFAULT_TIMEOUT_MS);

    try {
        const response = await fetch(url, {
            method,
            body: formData,
            signal: controller.signal,
        });

        const raw = await response.text();
        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch {
            parsed = raw;
        }

        if (!response.ok) {
            throw new Error(
                `GLOW request failed (${response.status} ${response.statusText}): ${trimText(raw, 500)}`
            );
        }

        return parsed;
    } catch (err) {
        if (err && err.name === "AbortError") {
            throw new Error(`GLOW request timed out after ${timeoutMs || DEFAULT_TIMEOUT_MS}ms`);
        }
        throw err;
    } finally {
        clearTimeout(timeout);
    }
}

function buildFileForm(fileName, contents, fields) {
    const form = new FormData();
    form.append("file", new Blob([contents]), fileName);
    for (const [key, value] of Object.entries(fields || {})) {
        if (value === undefined || value === null) continue;
        form.append(key, String(value));
    }
    return form;
}

export function registerGlowTools(server) {
    server.registerTool(
        "glow_health_check",
        {
            title: "GLOW Health Check",
            description:
                "Check health of a GLOW API endpoint (defaults to `https://letitglow.app/mcp`).",
            inputSchema: z.object({
                baseUrl: z.string().optional().describe("Optional GLOW API base URL"),
                timeoutMs: z.number().int().positive().max(300000).optional(),
            }),
        },
        async ({ baseUrl, timeoutMs }) => {
            try {
                const payload = await callGlow("/health", {
                    method: "GET",
                    baseUrl,
                    timeoutMs,
                });
                return { content: [{ type: "text", text: toMcpText("GLOW health response", payload) }] };
            } catch (err) {
                return { content: [{ type: "text", text: `Error: ${err.message}` }] };
            }
        }
    );

    server.registerTool(
        "glow_audit_document",
        {
            title: "GLOW Audit Document",
            description:
                "Upload a document to GLOW and run accessibility audit (/audit). Supports markdown, html, and docx.",
            inputSchema: z.object({
                filePath: z.string().describe("Absolute path to local file"),
                format: z.enum(["markdown", "html", "docx"]).describe("Document format"),
                baseUrl: z.string().optional().describe("Optional GLOW API base URL"),
                timeoutMs: z.number().int().positive().max(300000).optional(),
            }),
        },
        async ({ filePath, format, baseUrl, timeoutMs }) => {
            try {
                const upload = await readAsUpload(filePath);
                const form = buildFileForm(upload.fileName, upload.contents, { format });
                const payload = await callGlow("/audit", {
                    method: "POST",
                    baseUrl,
                    timeoutMs,
                    formData: form,
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: toMcpText(`GLOW audit completed for ${upload.fileName}`, payload),
                        },
                    ],
                };
            } catch (err) {
                return { content: [{ type: "text", text: `Error: ${err.message}` }] };
            }
        }
    );

    server.registerTool(
        "glow_fix_document",
        {
            title: "GLOW Fix Document",
            description:
                "Upload a document to GLOW and run auto-fix workflow (/fix). Supports markdown, html, and docx.",
            inputSchema: z.object({
                filePath: z.string().describe("Absolute path to local file"),
                format: z.enum(["markdown", "html", "docx"]).describe("Document format"),
                baseUrl: z.string().optional().describe("Optional GLOW API base URL"),
                timeoutMs: z.number().int().positive().max(300000).optional(),
            }),
        },
        async ({ filePath, format, baseUrl, timeoutMs }) => {
            try {
                const upload = await readAsUpload(filePath);
                const form = buildFileForm(upload.fileName, upload.contents, { format });
                const payload = await callGlow("/fix", {
                    method: "POST",
                    baseUrl,
                    timeoutMs,
                    formData: form,
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: toMcpText(`GLOW fix completed for ${upload.fileName}`, payload),
                        },
                    ],
                };
            } catch (err) {
                return { content: [{ type: "text", text: `Error: ${err.message}` }] };
            }
        }
    );

    server.registerTool(
        "glow_convert_document",
        {
            title: "GLOW Convert Document",
            description:
                "Upload a document to GLOW and convert format (/convert). Supports markdown, html, and docx.",
            inputSchema: z.object({
                filePath: z.string().describe("Absolute path to local file"),
                fromFormat: z.enum(["markdown", "html", "docx"]).describe("Source format"),
                toFormat: z.enum(["markdown", "html", "docx"]).describe("Target format"),
                baseUrl: z.string().optional().describe("Optional GLOW API base URL"),
                timeoutMs: z.number().int().positive().max(300000).optional(),
            }),
        },
        async ({ filePath, fromFormat, toFormat, baseUrl, timeoutMs }) => {
            try {
                const upload = await readAsUpload(filePath);
                const form = buildFileForm(upload.fileName, upload.contents, {
                    from_format: fromFormat,
                    to_format: toFormat,
                });
                const payload = await callGlow("/convert", {
                    method: "POST",
                    baseUrl,
                    timeoutMs,
                    formData: form,
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: toMcpText(`GLOW convert completed for ${upload.fileName}`, payload),
                        },
                    ],
                };
            } catch (err) {
                return { content: [{ type: "text", text: `Error: ${err.message}` }] };
            }
        }
    );

    server.registerTool(
        "glow_generate_report",
        {
            title: "GLOW Generate Report",
            description:
                "Upload a document to GLOW and generate report output (/report). Supports markdown, html, and docx.",
            inputSchema: z.object({
                filePath: z.string().describe("Absolute path to local file"),
                format: z.enum(["markdown", "html", "docx"]).describe("Document format"),
                reportType: z
                    .enum(["json", "text", "html"])
                    .optional()
                    .describe("Report type (default: json)"),
                baseUrl: z.string().optional().describe("Optional GLOW API base URL"),
                timeoutMs: z.number().int().positive().max(300000).optional(),
            }),
        },
        async ({ filePath, format, reportType, baseUrl, timeoutMs }) => {
            try {
                const upload = await readAsUpload(filePath);
                const form = buildFileForm(upload.fileName, upload.contents, {
                    format,
                    report_type: reportType || "json",
                });
                const payload = await callGlow("/report", {
                    method: "POST",
                    baseUrl,
                    timeoutMs,
                    formData: form,
                });
                return {
                    content: [
                        {
                            type: "text",
                            text: toMcpText(`GLOW report generated for ${upload.fileName}`, payload),
                        },
                    ],
                };
            } catch (err) {
                return { content: [{ type: "text", text: `Error: ${err.message}` }] };
            }
        }
    );
}

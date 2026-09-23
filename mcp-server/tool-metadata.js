/**
 * tool-metadata.js - annotations and output schemas for every tool.
 *
 * Why this exists, and why it is one table rather than 38 edits:
 *
 * A client that cannot tell a scan from a mutation has to ask the user before
 * every single call. Twenty-nine of these tools only read. On a server whose
 * whole purpose is bulk scanning, that difference is the difference between
 * scanning forty documents and giving up after six. `readOnlyHint` is what
 * lets a client auto-approve the safe ones and keep asking about the rest.
 *
 * `outputSchema` does the matching job for results: it lets a client parse a
 * result rather than pattern-match prose, which is what makes these tools
 * usable from a script instead of only from a conversation.
 *
 * Annotations are hints, not a security boundary. A client must not rely on
 * them to decide what is safe; it uses them to decide what to interrupt a
 * person for. That is exactly how they are used here.
 *
 * Reference: Model Context Protocol, Tools, "Tool annotations" and
 * "Structured content".
 */

import { z } from "zod";

/**
 * Output schemas are Zod, because that is what this server already uses for
 * input and what the SDK converts to the JSON Schema a client receives.
 * Declaring them as raw JSON Schema here would be silently dropped.
 *
 * Every field is `.optional()` unless a result is meaningless without it: a
 * schema stricter than the handlers makes a correct result look like a bug.
 */

/**
 * The shape every scanning tool returns. It mirrors
 * skills/a11y-core/schemas/findings.schema.json so a finding means the same
 * thing whether it came from a skill or from this server.
 */
export const FINDINGS_OUTPUT_SCHEMA = z.object({
  scope: z.array(z.string()).describe("Files, URLs or components examined."),
  findings: z
    .array(
      z.object({
        rule: z.string().describe("Stable rule identifier."),
        wcag: z.string().describe("WCAG 2.2 criterion and level, or 'n/a'."),
        severity: z.enum(["critical", "serious", "moderate", "minor"]),
        confidence: z.enum(["high", "medium", "low"]).optional(),
        location: z.string().describe("Where the defect is, precisely enough to open."),
        summary: z.string().describe("One sentence naming the defect."),
        fix: z.string().describe("What to change."),
        evidence: z.string().optional().describe("The offending markup, value or measurement."),
        component: z.string().optional().describe("Component or template, when the defect repeats."),
      }),
    )
    .describe("One entry per defect found."),
  passed: z
    .array(z.string())
    .optional()
    .describe("Checks that ran and found nothing, so 'clean' is distinguishable from 'not checked'."),
  notes: z
    .array(z.string())
    .optional()
    .describe("Anything a person must decide, and anything that could not be checked."),
});

const MEASUREMENT_OUTPUT_SCHEMA = z.object({
  value: z.number().optional().describe("The measured value."),
  unit: z.string().optional().describe("What the value is measured in."),
  threshold: z.number().optional().describe("The value required to pass."),
  passes: z.boolean().describe("Whether the measurement meets the threshold."),
  level: z.string().optional().describe("The conformance level this result is judged against."),
  detail: z.string().optional().describe("A short explanation of the result."),
});

const STATUS_OUTPUT_SCHEMA = z.object({
  ok: z.boolean().describe("Whether the operation succeeded."),
  detail: z.string().optional().describe("What happened, in one sentence."),
  path: z.string().optional().describe("A file this call wrote or read, when there is one."),
  version: z.string().optional().describe("Version of an external tool, when relevant."),
});

const LISTING_OUTPUT_SCHEMA = z.object({
  items: z.array(z.record(z.any())).describe("The records returned."),
  total: z.number().optional().describe("How many records exist, when more than were returned."),
});

const DOCUMENT_OUTPUT_SCHEMA = z.object({
  path: z.string().describe("The file written."),
  format: z.string().optional().describe("The format written."),
  detail: z.string().optional().describe("What the file contains."),
});

/**
 * Per tool: the annotation hints, the output schema, and a result cap where a
 * tool can return a whole document.
 *
 * readOnlyHint      the tool does not change anything
 * destructiveHint   the tool can remove or overwrite data (only meaningful when not read-only)
 * idempotentHint    calling it twice with the same arguments changes nothing further
 * openWorldHint     the tool reaches outside this machine
 */
const T = (title, annotations, outputSchema, maxResultChars) => ({
  title,
  annotations,
  outputSchema,
  maxResultChars,
});

const READ_LOCAL = { readOnlyHint: true, idempotentHint: true, openWorldHint: false };
const READ_NETWORK = { readOnlyHint: true, idempotentHint: true, openWorldHint: true };
const WRITE_LOCAL = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false };
const OVERWRITE_LOCAL = { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false };
const DELETE_LOCAL = { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false };

// The Glow tools send the document to a remote service and write the result
// back. Both halves of that matter to a client deciding whether to ask first.
const WRITE_NETWORK = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true };
const OVERWRITE_NETWORK = { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true };

export const TOOL_METADATA = {
  // ---- pure calculation, no input beyond its arguments ----
  check_contrast: T("Check contrast ratio", READ_LOCAL, MEASUREMENT_OUTPUT_SCHEMA),
  check_apca_contrast: T("Check APCA contrast", READ_LOCAL, MEASUREMENT_OUTPUT_SCHEMA),
  check_color_blindness: T("Check colour-blind safety", READ_LOCAL, MEASUREMENT_OUTPUT_SCHEMA),
  check_reading_level: T("Check reading level", READ_LOCAL, MEASUREMENT_OUTPUT_SCHEMA),
  get_accessibility_guidelines: T("Get accessibility guidelines", READ_LOCAL, STATUS_OUTPUT_SCHEMA),

  // ---- static analysis of supplied markup ----
  check_heading_structure: T("Check heading structure", READ_LOCAL, FINDINGS_OUTPUT_SCHEMA),
  check_link_text: T("Check link text", READ_LOCAL, FINDINGS_OUTPUT_SCHEMA),
  check_form_labels: T("Check form labels", READ_LOCAL, FINDINGS_OUTPUT_SCHEMA),
  validate_caption_file: T("Validate caption file", READ_LOCAL, FINDINGS_OUTPUT_SCHEMA),

  // ---- document scanners ----
  scan_office_document: T("Scan an Office document", READ_LOCAL, FINDINGS_OUTPUT_SCHEMA, 60000),
  scan_pdf_document: T("Scan a PDF", READ_LOCAL, FINDINGS_OUTPUT_SCHEMA, 60000),
  scan_epub_document: T("Scan an ePub", READ_LOCAL, FINDINGS_OUTPUT_SCHEMA, 60000),
  scan_markdown_document: T("Scan a markdown file", READ_LOCAL, FINDINGS_OUTPUT_SCHEMA, 60000),
  extract_document_metadata: T("Extract document metadata", READ_LOCAL, STATUS_OUTPUT_SCHEMA),
  batch_scan_documents: T("Scan many documents", READ_LOCAL, FINDINGS_OUTPUT_SCHEMA, 120000),

  // ---- runtime scanners: they load a page, so the world is open ----
  run_axe_scan: T("Run an axe-core scan", READ_NETWORK, FINDINGS_OUTPUT_SCHEMA, 80000),
  run_playwright_a11y_tree: T("Read the accessibility tree", READ_NETWORK, FINDINGS_OUTPUT_SCHEMA, 80000),
  run_playwright_keyboard_scan: T("Scan keyboard traversal", READ_NETWORK, FINDINGS_OUTPUT_SCHEMA, 80000),
  run_playwright_contrast_scan: T("Scan rendered contrast", READ_NETWORK, FINDINGS_OUTPUT_SCHEMA, 80000),
  run_playwright_viewport_scan: T("Scan across viewports", READ_NETWORK, FINDINGS_OUTPUT_SCHEMA, 80000),

  // ---- external tooling ----
  run_verapdf_scan: T("Run veraPDF", READ_LOCAL, FINDINGS_OUTPUT_SCHEMA, 80000),
  check_verapdf_installation: T("Check veraPDF is installed", READ_LOCAL, STATUS_OUTPUT_SCHEMA),
  glow_health_check: T("Check Glow availability", READ_NETWORK, STATUS_OUTPUT_SCHEMA),
  glow_audit_document: T("Audit a document with Glow", READ_NETWORK, FINDINGS_OUTPUT_SCHEMA, 60000),
  // Returns the report inline rather than writing a file, so its result is a
  // status, not a document.
  glow_generate_report: T("Generate a Glow report", READ_NETWORK, STATUS_OUTPUT_SCHEMA),

  // ---- audit history ----
  list_audit_history: T("List audit history", READ_LOCAL, LISTING_OUTPUT_SCHEMA),
  get_audit_result: T("Get one audit result", READ_LOCAL, FINDINGS_OUTPUT_SCHEMA, 60000),
  get_audit_trend: T("Get the score trend", READ_LOCAL, LISTING_OUTPUT_SCHEMA),
  check_audit_cache: T("Check the audit cache", READ_LOCAL, STATUS_OUTPUT_SCHEMA),
  save_audit_result: T("Save an audit result", WRITE_LOCAL, STATUS_OUTPUT_SCHEMA),
  update_audit_cache: T("Update the audit cache", WRITE_LOCAL, STATUS_OUTPUT_SCHEMA),

  // The only tool here that removes data. A client must never auto-approve it.
  prune_audit_history: T("Prune audit history", DELETE_LOCAL, STATUS_OUTPUT_SCHEMA),

  // ---- writers and remediators ----
  // These two return their output inline (HTML, markdown) rather than writing
  // a file, so a status shape fits what the handlers actually produce.
  convert_pdf_form_to_html: T("Convert a PDF form to accessible HTML", WRITE_LOCAL, STATUS_OUTPUT_SCHEMA),
  generate_accessibility_statement: T("Generate an accessibility statement", WRITE_LOCAL, STATUS_OUTPUT_SCHEMA),
  fix_document_metadata: T("Fix document metadata in place", OVERWRITE_LOCAL, STATUS_OUTPUT_SCHEMA),
  fix_document_headings: T("Fix document headings in place", OVERWRITE_LOCAL, STATUS_OUTPUT_SCHEMA),
  glow_fix_document: T("Fix a document with Glow", OVERWRITE_NETWORK, STATUS_OUTPUT_SCHEMA),
  glow_convert_document: T("Convert a document with Glow", WRITE_NETWORK, STATUS_OUTPUT_SCHEMA),

  // ---- report rendering ----
  render_accessibility_report: T("Render an accessibility report", WRITE_LOCAL, DOCUMENT_OUTPUT_SCHEMA),
};

/**
 * Wrap a server so every registerTool call picks up its metadata from the table
 * above.
 *
 * Doing it here rather than at each call site means a tool cannot be added
 * without a decision about whether it is safe to auto-approve: an unlisted tool
 * is reported by `missingMetadata`, and the conformance test fails on it.
 */
export function withToolMetadata(server) {
  const seen = new Set();
  const original = server.registerTool.bind(server);

  server.registerTool = (name, config, handler) => {
    seen.add(name);
    const meta = TOOL_METADATA[name];
    if (!meta) return original(name, config, handler);

    const merged = {
      ...config,
      title: config.title || meta.title,
      annotations: { title: config.title || meta.title, ...meta.annotations, ...(config.annotations || {}) },
    };
    if (meta.outputSchema && !config.outputSchema) merged.outputSchema = meta.outputSchema;
    if (meta.maxResultChars) {
      merged._meta = { ...(config._meta || {}), "anthropic/maxResultSizeChars": meta.maxResultChars };
    }
    return original(name, merged, handler);
  };

  server.registeredToolNames = seen;
  return server;
}

/** Tool names registered with no entry in the table. Used by the conformance test. */
export function missingMetadata(registeredNames) {
  return [...registeredNames].filter((n) => !TOOL_METADATA[n]);
}

/** Table entries with no matching tool. Catches renames that left the table stale. */
export function staleMetadata(registeredNames) {
  return Object.keys(TOOL_METADATA).filter((n) => !registeredNames.has(n));
}

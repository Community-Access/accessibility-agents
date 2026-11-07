/**
 * results.js - build tool results that satisfy the declared output schemas.
 *
 * Since SDK 1.30, a tool that declares an outputSchema must return
 * `structuredContent` on success or set `isError` on failure; a bare text
 * result is rejected by the SDK's own output validation before it reaches the
 * client. Every handler builds its result through these helpers so the two
 * halves - the schema in tool-metadata.js and the shape returned here - cannot
 * drift apart silently again (issue #205).
 */

/** A failed call. Exempt from output-schema validation, so text is enough. */
export function errorResult(text) {
  return { isError: true, content: [{ type: "text", text }] };
}

/** A successful call: human-readable text plus the schema-shaped payload. */
export function okResult(text, structuredContent) {
  return { content: [{ type: "text", text }], structuredContent };
}

/**
 * Normalise the severity vocabularies used across the scanners onto the
 * findings-schema enum. Internal scanners say error/warning/tip, Glow says
 * critical/high/medium/low, axe-core says critical/serious/moderate/minor.
 */
const SEVERITY = {
  critical: "critical",
  serious: "serious",
  moderate: "moderate",
  minor: "minor",
  error: "serious",
  warning: "moderate",
  tip: "minor",
  high: "serious",
  medium: "moderate",
  low: "minor",
};

export function mapSeverity(value) {
  return SEVERITY[String(value || "").toLowerCase()] || "moderate";
}

/**
 * One internal scanner finding ({ruleId, severity, message, location,
 * confidence}) as a findings-schema entry.
 */
export function scannerFinding(f, { wcag = "n/a", fix, location } = {}) {
  const out = {
    rule: f.ruleId || "unknown",
    wcag,
    severity: mapSeverity(f.severity),
    location: location || f.location || "unspecified",
    summary: f.message || "",
    fix: fix || f.message || "",
  };
  if (f.confidence) out.confidence = f.confidence;
  return out;
}

/** A successful scan: text plus the FINDINGS_OUTPUT_SCHEMA payload. */
export function findingsResult(text, scope, findings, extra = {}) {
  const structuredContent = { scope, findings };
  if (extra.passed) structuredContent.passed = extra.passed;
  if (extra.notes) structuredContent.notes = extra.notes;
  return okResult(text, structuredContent);
}

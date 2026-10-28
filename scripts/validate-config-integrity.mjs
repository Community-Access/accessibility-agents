#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");

function readJson(relPath) {
  const full = join(repoRoot, relPath);
  return JSON.parse(readFileSync(full, "utf-8"));
}

function hasAll(values, expected) {
  return expected.every((v) => values.includes(v));
}

const errors = [];
const infos = [];

const requiredSchemas = [
  ".github/schemas/markdown-config.schema.json",
  ".github/schemas/office-config.schema.json",
  ".github/schemas/pdf-config.schema.json",
  ".github/schemas/epub-config.schema.json",
];

for (const rel of requiredSchemas) {
  if (!existsSync(join(repoRoot, rel))) {
    errors.push(`Missing schema file: ${rel}`);
  } else {
    infos.push(`Schema file exists: ${rel}`);
  }
}

const settings = readJson(".vscode/settings.json");
const schemaMappings = settings["json.schemas"] || [];

const expectedMappings = [
  { file: ".a11y-markdown-config.json", url: "./.github/schemas/markdown-config.schema.json" },
  { file: ".a11y-office-config.json", url: "./.github/schemas/office-config.schema.json" },
  { file: ".a11y-pdf-config.json", url: "./.github/schemas/pdf-config.schema.json" },
  { file: ".a11y-epub-config.json", url: "./.github/schemas/epub-config.schema.json" },
];

for (const expected of expectedMappings) {
  const found = schemaMappings.find(
    (entry) => Array.isArray(entry.fileMatch) && entry.fileMatch.includes(expected.file) && entry.url === expected.url,
  );
  if (!found) {
    errors.push(`Missing JSON schema mapping in .vscode/settings.json: ${expected.file} -> ${expected.url}`);
  } else {
    infos.push(`Schema mapping present: ${expected.file}`);
  }
}

const templateExpectations = [
  {
    path: "templates/markdown-config-moderate.json",
    schema: "https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/.github/schemas/markdown-config.schema.json",
    validate: (json) => {
      if (!json.rules || typeof json.rules !== "object") {
        throw new Error("must include rules object");
      }
    },
  },
  {
    path: "templates/office-config-strict.json",
    schema: "https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/.github/schemas/office-config.schema.json",
    validate: (json) => {
      for (const key of ["docx", "xlsx", "pptx"]) {
        if (!json[key] || typeof json[key] !== "object") throw new Error(`missing ${key} object`);
        if (typeof json[key].enabled !== "boolean") throw new Error(`${key}.enabled must be boolean`);
      }
    },
  },
  {
    path: "templates/office-config-moderate.json",
    schema: "https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/.github/schemas/office-config.schema.json",
    validate: () => {},
  },
  {
    path: "templates/office-config-minimal.json",
    schema: "https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/.github/schemas/office-config.schema.json",
    validate: () => {},
  },
  {
    path: "templates/pdf-config-strict.json",
    schema: "https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/.github/schemas/pdf-config.schema.json",
    validate: (json) => {
      if (!Array.isArray(json.severityFilter)) throw new Error("severityFilter must be array");
      if (!hasAll(["error", "warning", "tip"], json.severityFilter)) {
        throw new Error("strict profile should include error, warning, and tip");
      }
    },
  },
  {
    path: "templates/pdf-config-moderate.json",
    schema: "https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/.github/schemas/pdf-config.schema.json",
    validate: () => {},
  },
  {
    path: "templates/pdf-config-minimal.json",
    schema: "https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/.github/schemas/pdf-config.schema.json",
    validate: () => {},
  },
  {
    path: "templates/epub-config-strict.json",
    schema: "https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/.github/schemas/epub-config.schema.json",
    validate: (json) => {
      if (!json.epub || typeof json.epub !== "object") throw new Error("must include epub object");
    },
  },
  {
    path: "templates/epub-config-moderate.json",
    schema: "https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/.github/schemas/epub-config.schema.json",
    validate: () => {},
  },
  {
    path: "templates/epub-config-minimal.json",
    schema: "https://raw.githubusercontent.com/Community-Access/accessibility-agents/main/.github/schemas/epub-config.schema.json",
    validate: () => {},
  },
];

for (const check of templateExpectations) {
  try {
    const json = readJson(check.path);
    if (json.$schema !== check.schema) {
      throw new Error(`$schema must be ${check.schema}, found ${json.$schema || "<missing>"}`);
    }
    check.validate(json);
    infos.push(`Template valid: ${check.path}`);
  } catch (err) {
    errors.push(`${check.path}: ${err.message}`);
  }
}

if (errors.length > 0) {
  console.error("Config integrity check failed:\n");
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}

console.log("Config integrity check passed.\n");
for (const i of infos) console.log(`- ${i}`);

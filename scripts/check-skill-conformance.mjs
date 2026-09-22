#!/usr/bin/env node
/**
 * Frontmatter a parser can actually read.
 *
 * Three failure modes, each of which makes a skill silently lose its identity
 * rather than fail loudly:
 *
 *   1. A UTF-8 byte-order mark before `---`. Strict parsers do not see the
 *      frontmatter at all when a mark sits in front of the opening delimiter,
 *      so the skill loses its name and description and a client has nothing to
 *      route on.
 *   2. A `name` that is not a lowercase-hyphen slug, which the Agent Skills
 *      specification requires.
 *   3. A `name` that does not match its containing folder, which breaks
 *      activation by name on every client.
 *
 * This checker exists because the repository once had six trees of duplicated
 * agents and the main validator scanned four of them. The two it missed had
 * accumulated 70 byte-order marks and 64 Title Case names, unnoticed, on a
 * project that validated its other trees on every pull request. There is one
 * tree now, checked here and by the specification's own validator.
 *
 * Usage:
 *   node scripts/check-skill-conformance.mjs            # human-readable
 *   node scripts/check-skill-conformance.mjs --json     # machine-readable
 *   node scripts/check-skill-conformance.mjs --fix-bom  # strip BOMs in place
 *
 * Exit code 0 when clean, 1 when any violation is found.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const BOM = "﻿";

const TREES = [
  // One tree. Before 7.0 this list held six, because every client needed its
  // own copy of every agent; the open standards removed that reason, and the
  // cutover removed the copies.
  { label: "skills package", dir: "skills", kind: "folder" },
];

const args = new Set(process.argv.slice(2));
const asJson = args.has("--json");
const fixBom = args.has("--fix-bom");

/** Every markdown file in a tree, with the slug it ought to declare. */
function collect(tree) {
  const root = path.join(process.cwd(), tree.dir);
  if (!fs.existsSync(root)) return [];

  if (tree.kind === "flat") {
    return fs
      .readdirSync(root)
      .filter((f) => f.endsWith(".md"))
      .sort()
      .map((f) => ({
        file: path.join(tree.dir, f),
        expected: path.basename(f, ".md"),
      }));
  }

  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()
    .map((name) => ({
      file: path.join(tree.dir, name, "SKILL.md"),
      expected: name,
    }))
    .filter((entry) => fs.existsSync(path.join(process.cwd(), entry.file)));
}

/** Forward slashes everywhere, so Windows and CI report identical paths. */
function posix(p) {
  return p.split(path.sep).join("/");
}

function frontmatterName(text) {
  if (!text.startsWith("---")) return { present: false, name: "" };
  const end = text.indexOf("\n---", 3);
  if (end === -1) return { present: false, name: "" };
  const block = text.slice(3, end);
  const match = block.match(/^name:\s*(.+)$/m);
  const name = match ? match[1].trim().replace(/^["']|["']$/g, "") : "";
  return { present: true, name };
}

const findings = [];
const counts = {};

for (const tree of TREES) {
  const entries = collect(tree);
  if (!entries.length) continue;

  const stats = { total: entries.length, bom: 0, missing: 0, slug: 0, mismatch: 0 };

  for (const entry of entries) {
    const full = path.join(process.cwd(), entry.file);
    const raw = fs.readFileSync(full, "utf8");
    let text = raw;

    if (raw.startsWith(BOM)) {
      stats.bom += 1;
      findings.push({
        tree: tree.label,
        file: posix(entry.file),
        rule: "bom",
        detail: "UTF-8 BOM before the frontmatter delimiter",
      });
      text = raw.slice(BOM.length);
      if (fixBom) fs.writeFileSync(full, text, "utf8");
    }

    const { present, name } = frontmatterName(text);
    if (!present) {
      stats.missing += 1;
      findings.push({
        tree: tree.label,
        file: posix(entry.file),
        rule: "no-frontmatter",
        detail: "no YAML frontmatter block",
      });
      continue;
    }

    if (!name || !SLUG.test(name)) {
      stats.slug += 1;
      findings.push({
        tree: tree.label,
        file: posix(entry.file),
        rule: "non-slug-name",
        detail: `name ${JSON.stringify(name)} is not lowercase-hyphen`,
        suggested: entry.expected,
      });
    } else if (name !== entry.expected) {
      stats.mismatch += 1;
      findings.push({
        tree: tree.label,
        file: posix(entry.file),
        rule: "name-folder-mismatch",
        detail: `name ${JSON.stringify(name)} does not match ${JSON.stringify(entry.expected)}`,
        suggested: entry.expected,
      });
    }
  }

  counts[tree.label] = stats;
}

if (asJson) {
  console.log(JSON.stringify({ counts, findings }, null, 2));
} else {
  const pad = (s, n) => String(s).padEnd(n);
  const num = (s, n) => String(s).padStart(n);
  console.log(
    `${pad("tree", 28)}${num("files", 7)}${num("BOM", 6)}${num("no-fm", 7)}${num("non-slug", 10)}${num("mismatch", 10)}`
  );
  for (const [label, s] of Object.entries(counts)) {
    console.log(
      `${pad(label, 28)}${num(s.total, 7)}${num(s.bom, 6)}${num(s.missing, 7)}${num(s.slug, 10)}${num(s.mismatch, 10)}`
    );
  }

  if (findings.length) {
    console.log(`\n${findings.length} violation${findings.length === 1 ? "" : "s"}:\n`);
    for (const f of findings.slice(0, 40)) {
      const suffix = f.suggested ? ` (expected "${f.suggested}")` : "";
      console.log(`  ${f.rule.padEnd(22)} ${f.file}${suffix}`);
    }
    if (findings.length > 40) {
      console.log(`  ... and ${findings.length - 40} more. Use --json for the full list.`);
    }
    if (!fixBom && findings.some((f) => f.rule === "bom")) {
      console.log("\n  Re-run with --fix-bom to strip byte-order marks in place.");
    }
  } else {
    console.log("\nAll skill and agent frontmatter is conformant.");
  }
}

process.exit(findings.length ? 1 : 0);

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
 * And one failure mode that loses a whole skill: a skill hidden from both the
 * model and the user that no startable skill names (see "reachability").
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

// ------------------------------------------------------------ reachability
//
// 4. A skill hidden from both the model and the user (`user-invocable: false`
//    with `disable-model-invocation: true`) that no other skill names. VS Code
//    lists that pair as a disabled skill, and on Claude Code nothing can start
//    it through the Skill tool: the only way in is a router or specialist that
//    names it and opens its SKILL.md by path. If nothing names it, it is dead
//    weight that every install still carries, and nothing says so.
//
// Reach is followed through chains: a router names a helper, the helper names
// a reference, and the reference is reached. A chain has to start at a skill
// without both flags, because only those can be started at all.

/**
 * Reference skills that nothing named when this check was added on 29 October
 * 2026. Each needs a specialist that cites it, or a decision to retire it. The
 * list may only shrink: a new unreached skill fails, and so does a name here
 * that has since become reached, so the list cannot go stale.
 */
const KNOWN_UNREACHED = new Set([
  "kb-cognitive-accessibility",
  "kb-data-visualization-accessibility",
  "kb-design-system",
  "kb-document-scanning",
  "kb-email-accessibility",
  "kb-media-accessibility",
  "kb-mobile-accessibility",
  "kb-office-remediation",
  "kb-playwright-testing",
  "kb-web-scanning",
]);

/** Every text file in a skill folder, joined, for name and path references. */
function skillText(dir) {
  const parts = [];
  const walk = (abs) => {
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
      const full = path.join(abs, e.name);
      if (e.isDirectory()) walk(full);
      else if (/\.(md|ya?ml|json)$/i.test(e.name)) parts.push(fs.readFileSync(full, "utf8"));
    }
  };
  walk(dir);
  return parts.join("\n");
}

function hiddenFromBoth(skillFile) {
  const text = fs.readFileSync(skillFile, "utf8").replace(/^﻿/, "");
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return false;
  return /^disable-model-invocation:\s*true\s*$/m.test(m[1]) && /^user-invocable:\s*false\s*$/m.test(m[1]);
}

const reach = { hidden: 0, reached: 0, known: [] };
{
  const root = path.join(process.cwd(), "skills");
  const skills = fs.existsSync(root)
    ? fs
        .readdirSync(root, { withFileTypes: true })
        .filter((d) => d.isDirectory() && fs.existsSync(path.join(root, d.name, "SKILL.md")))
        .map((d) => d.name)
        .sort()
    : [];
  const hidden = new Set(skills.filter((s) => hiddenFromBoth(path.join(root, s, "SKILL.md"))));
  const text = new Map(skills.map((s) => [s, skillText(path.join(root, s))]));
  const names = (from, target) =>
    new RegExp(`(^|[^a-z0-9-])${target.replace(/-/g, "\\-")}([^a-z0-9-]|$)`, "m").test(text.get(from));

  const reached = new Set(skills.filter((s) => !hidden.has(s)));
  let grew = true;
  while (grew) {
    grew = false;
    for (const target of hidden) {
      if (reached.has(target)) continue;
      if ([...reached].some((from) => from !== target && names(from, target))) {
        reached.add(target);
        grew = true;
      }
    }
  }

  reach.hidden = hidden.size;
  for (const s of hidden) {
    const file = posix(path.join("skills", s, "SKILL.md"));
    if (reached.has(s)) {
      reach.reached += 1;
      if (KNOWN_UNREACHED.has(s)) {
        findings.push({
          tree: "skills package",
          file,
          rule: "known-unreached-now-reached",
          detail: `${s} is now named by another skill; remove it from KNOWN_UNREACHED in scripts/check-skill-conformance.mjs`,
        });
      }
    } else if (KNOWN_UNREACHED.has(s)) {
      reach.known.push(s);
    } else {
      findings.push({
        tree: "skills package",
        file,
        rule: "unreachable-reference",
        detail: `${s} sets user-invocable: false and disable-model-invocation: true, and no skill that can be started names it`,
      });
    }
  }
}

if (asJson) {
  console.log(JSON.stringify({ counts, reach, findings }, null, 2));
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

  console.log(
    `\nHidden from model and user: ${reach.hidden}; named by a skill that can be started, directly or through a chain: ${reach.reached}.`
  );
  if (reach.known.length) {
    console.log(`Known unreached, listed in KNOWN_UNREACHED (${reach.known.length}): ${reach.known.join(", ")}.`);
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

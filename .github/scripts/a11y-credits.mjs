#!/usr/bin/env node
/**
 * a11y-credits.mjs - print the release-notes block of accessibility credits.
 *
 *   node .github/scripts/a11y-credits.mjs --since <tag-or-YYYY-MM-DD> [--repo owner/name]
 *
 * Lists items labelled "credit: yes" or "credit: anonymous" that closed since
 * the tag or date, as the contributor chose to be credited, grouped as code
 * (pull requests) and other contributions (reports and other issues). Each
 * line describes the work by the item's title, never the person.
 *
 * The block goes to standard output, ready to paste. Warnings about credit
 * questions unanswered for more than 14 days go to standard error.
 *
 * Needs a token with read access: GITHUB_TOKEN or GH_TOKEN, or a signed-in
 * GitHub CLI (`gh auth token`). No dependencies.
 */

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  collectCredits, formatCredits, formatWarnings, loadConfig, makeClient, resolveSince,
} from './a11y-community.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function arg(name) {
  const i = process.argv.indexOf(name);
  return i === -1 ? null : process.argv[i + 1];
}

function token() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

function repoFromGit() {
  const url = execFileSync('git', ['remote', 'get-url', 'origin'], { cwd: HERE, encoding: 'utf8' }).trim();
  const m = url.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/);
  if (!m) throw new Error(`cannot tell the repository from ${url}; pass --repo owner/name`);
  return `${m[1]}/${m[2]}`;
}

/** request and paginate over fetch, matching what makeClient expects. */
function fetchTransport(auth) {
  const headers = {
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
    'user-agent': 'a11y-credits',
    ...(auth ? { authorization: `Bearer ${auth}` } : {}),
  };
  const build = (route, params) => {
    const [method, template] = route.split(' ');
    const rest = { ...params };
    const pathname = template.replace(/\{(\w+)\}/g, (_, key) => {
      const value = rest[key];
      delete rest[key];
      return encodeURIComponent(value);
    });
    const url = new URL(`https://api.github.com${pathname}`);
    for (const [key, value] of Object.entries(rest)) url.searchParams.set(key, value);
    return { method, url };
  };
  const call = async (method, url) => {
    const res = await fetch(url, { method, headers });
    if (!res.ok) {
      const error = new Error(`${method} ${url.pathname}: ${res.status} ${await res.text()}`);
      error.status = res.status;
      throw error;
    }
    return res;
  };
  return {
    request: async (route, params) => {
      const { method, url } = build(route, params);
      return (await call(method, url)).json();
    },
    paginate: async (route, params) => {
      let { method, url } = build(route, params);
      const all = [];
      while (url) {
        const res = await call(method, url);
        all.push(...(await res.json()));
        const next = (res.headers.get('link') || '').match(/<([^>]+)>;\s*rel="next"/);
        url = next ? new URL(next[1]) : null;
      }
      return all;
    },
  };
}

async function main() {
  const sinceArg = arg('--since');
  if (!sinceArg) {
    console.error('Usage: node .github/scripts/a11y-credits.mjs --since <tag-or-YYYY-MM-DD> [--repo owner/name]');
    process.exit(2);
  }
  const fullName = arg('--repo') || repoFromGit();
  const [owner, repo] = fullName.split('/');
  const config = loadConfig(path.join(HERE, '..', 'a11y-community.json'));
  const client = makeClient(fetchTransport(token()), { owner, repo });

  const since = await resolveSince(client, sinceArg);
  const result = await collectCredits(client, config, since);
  const block = formatCredits(result, config);
  if (block) process.stdout.write(block);
  else console.error(`No accessibility contributions to credit since ${since.toISOString().slice(0, 10)}.`);
  const warnings = formatWarnings(result, config);
  if (warnings) console.error(`\n${warnings}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

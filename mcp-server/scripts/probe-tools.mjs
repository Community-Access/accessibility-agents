#!/usr/bin/env node
/**
 * probe-tools.mjs - connect to the server over stdio and report its tool surface.
 *
 * Answers the questions a client asks before it decides whether it can call a
 * tool without interrupting the user: does the tool declare annotations, does it
 * declare an output schema, and is the listing stable between calls.
 *
 * Usage:
 *   node scripts/probe-tools.mjs
 *   node scripts/probe-tools.mjs --json
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SERVER = path.resolve(HERE, '..', 'stdio.js');

const transport = new StdioClientTransport({ command: process.execPath, args: [SERVER] });
const client = new Client({ name: 'a11y-tool-probe', version: '1.0.0' }, { capabilities: {} });

await client.connect(transport);

const first = await client.listTools();
const second = await client.listTools();
const tools = first.tools;

const names = tools.map((t) => t.name);
const order = JSON.stringify(names) === JSON.stringify(second.tools.map((t) => t.name));

const withAnnotations = tools.filter((t) => t.annotations && Object.keys(t.annotations).length);
const readOnly = tools.filter((t) => t.annotations && t.annotations.readOnlyHint === true);
const destructive = tools.filter((t) => t.annotations && t.annotations.destructiveHint === true);
const withOutput = tools.filter((t) => t.outputSchema);
const longDescriptions = tools.filter((t) => (t.description || '').length > 200);

const report = {
  serverVersion: client.getServerVersion(),
  tools: tools.length,
  deterministicOrder: order,
  annotations: withAnnotations.length,
  readOnlyHint: readOnly.length,
  destructiveHint: destructive.length,
  outputSchema: withOutput.length,
  descriptionsOver200Chars: longDescriptions.length,
  missingAnnotations: tools.filter((t) => !t.annotations || !Object.keys(t.annotations).length).map((t) => t.name),
  missingOutputSchema: tools.filter((t) => !t.outputSchema).map((t) => t.name),
};

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log('MCP tool surface');
  console.log('  server                ' + JSON.stringify(report.serverVersion));
  console.log('  tools                 ' + report.tools);
  console.log('  deterministic order   ' + report.deterministicOrder);
  console.log(
    '  annotations           ' +
      report.annotations +
      ' (readOnlyHint ' +
      report.readOnlyHint +
      ', destructiveHint ' +
      report.destructiveHint +
      ')',
  );
  console.log('  outputSchema          ' + report.outputSchema);
  console.log('  descriptions > 200ch  ' + report.descriptionsOver200Chars);
  if (report.missingAnnotations.length) {
    console.log('  missing annotations   ' + report.missingAnnotations.length);
  }
  if (report.missingOutputSchema.length) {
    console.log('  missing outputSchema  ' + report.missingOutputSchema.length);
  }
}

await client.close();
process.exit(0);

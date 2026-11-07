/**
 * mcp-runtime-files.mjs - the files a plugin ships to run the MCP server.
 *
 * The server runs from readable source with no dependencies outside Node
 * itself (Playwright and pdf-lib are optional and loaded only if installed).
 * The plugin builds copy exactly these paths, relative to mcp-server/, and
 * scripts/check-mcp-bundle.mjs proves they are enough: every import they make
 * resolves inside this list, to Node, to an optional package, or to skills/.
 */

export const MCP_RUNTIME_FILES = [
  'dist/stdio.mjs',
  'stdio.js',
  'server-core.js',
  'results.js',
  'version.js',
  'tool-metadata.js',
  'lib',
  'tools',
];

/** Packages a tool loads only if the user has installed them. */
export const MCP_OPTIONAL_PACKAGES = ['playwright', 'playwright-core', '@axe-core/playwright', 'pdf-lib'];

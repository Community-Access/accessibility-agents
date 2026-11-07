/**
 * version.js - one version, read from package.json.
 *
 * The server previously hard-coded "4.6.0" in three places while package.json
 * said 6.0.0, so `/health` and the MCP handshake both reported a version that
 * had not existed for two releases. Anything that needs the version reads it
 * from here.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));

function readVersion() {
  // The source runs from mcp-server/; the bundle from mcp-server/dist/.
  for (const dir of [HERE, join(HERE, "..")]) {
    try {
      return JSON.parse(readFileSync(join(dir, "package.json"), "utf8")).version;
    } catch {
      /* try the next location */
    }
  }
  // A server that cannot read its own manifest should still start; it just
  // reports an honest unknown rather than a stale number.
  return "0.0.0-unknown";
}

export const SERVER_VERSION = readVersion();
export const SERVER_NAME = "a11y-agent-team";

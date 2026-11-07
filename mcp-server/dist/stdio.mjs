#!/usr/bin/env node
// The launch path every manifest and user configuration names. The server
// used to be bundled into this one file; it now runs from readable source
// with no dependencies outside Node itself, so this only starts it.
// scripts/mcp-runtime-files.mjs lists the files a plugin ships.
import "../stdio.js";

# The hosted MCP server: Streamable HTTP, the hosted tool set only.
#
# Remote clients such as ChatGPT cannot start a program on the user's
# computer, so they reach this server at a public HTTPS address. It offers
# only the tools that work on the arguments they are given (see HOSTED_TOOLS
# in server-core.js); file and network tools stay local.
#
# Build from the repository root (the server reads skills/a11y-core/schemas):
#   docker build -f mcp-server/Dockerfile -t a11y-mcp .
#   docker run -p 3100:3100 a11y-mcp
FROM node:22-alpine

WORKDIR /app/mcp-server
COPY mcp-server/package.json mcp-server/package-lock.json ./
# server.js needs express and the SDK's HTTP transport. No install scripts:
# the browser scanners are not part of the hosted tool set.
RUN npm ci --ignore-scripts --no-audit --no-fund && npm cache clean --force

# The schemas, and every specialist's SKILL.md for get_specialist (the
# .dockerignore lets nothing else from skills/ in).
COPY skills /app/skills
COPY mcp-server/ ./

ENV NODE_ENV=production \
    PORT=3100 \
    A11Y_MCP_HOST=0.0.0.0 \
    A11Y_MCP_STATELESS=1 \
    A11Y_MCP_TOOLSET=hosted

# The document tools write each upload here while they work and delete it
# before answering; write_document_alt_text keeps its result in downloads/
# for one hour (120 MB at most). Run the container read-only with a tmpfs on
# this path, for example in compose:
#   tmpfs: ["/home/node/.a11y-uploads:size=192m,mode=0700,uid=1000,gid=1000"]
# and set A11Y_MCP_PUBLIC_URL to the server's public address (for example
# https://letitglow.app/a11y) so download links point at /download/.

USER node
EXPOSE 3100
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3100/health || exit 1
CMD ["node", "server.js"]

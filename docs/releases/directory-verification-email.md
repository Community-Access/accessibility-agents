# Draft: email to the Claude directory team

To: `directory@anthropic.com`

Subject: Accessibility Agents: scan now passes, asking about Verified status

Hi,

I'm Jeff Bishop. Taylor Arndt and I maintain Accessibility Agents for
Community Access. I submitted it through the developer portal on October 28,
2026, from `jeff@jeffbishop.com`. The repository is
<https://github.com/Community-Access/accessibility-agents>, and the portal
tracks the `plugin` branch.

The first versions were held because our MCP server shipped as one large
bundled file the scan couldn't read. We rewrote it as plain, readable source
with no dependencies, and today's version (v7.1.0, commit 1a2d177) passed the
security scan.

Directory policy then refused it, because three things in it are accepted
only from Verified organizations: command hooks, a local MCP server, and
script files. Those three are the core of the plugin:

- The hook is an edit gate. It stops Claude from changing user-facing files
  until the accessibility review has run, so WCAG 2.2 AA review happens
  before the edit, not after.
- The local MCP server scans the user's own files (Office documents, PDF,
  ePub, Markdown) and pages they are building. Those files shouldn't
  leave the user's machine, which is why the server is local.
- The scripts are the hook itself and the report renderer the skills use.

All of it is MIT licensed and readable, and the privacy policy is at
<https://github.com/Community-Access/accessibility-agents/blob/main/PRIVACY.md>.

Three questions:

1. How does Community Access become a Verified organization, and what do you
   need from us to start?
2. While we wait, we'd like to list a smaller edition that meets the current
   rules: the skills only, with our MCP server at a public HTTPS address.
   Would listing that first cause any trouble for verifying the full plugin
   later?
3. The scan also flags "Uses a credential from the user's machine" on
   `.claude-plugin/plugin.json`. The plugin doesn't read any token or key
   that we can find. Could you tell us what it points at, so we can fix it?

Thanks for your help,

Jeff Bishop
Community Access
<https://community-access.org>

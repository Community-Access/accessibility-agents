# Draft: email to the Claude directory team

To: `directory@anthropic.com`

Subject: Verified organization request for Accessibility Agents (Community Access)

Hi,

I'm Jeff Bishop, and with Taylor Arndt I maintain Accessibility Agents for
Community Access. I submitted the plugin through the developer portal on October 28,
2026, from my account (`jeff@jeffbishop.com`). The repository is
<https://github.com/Community-Access/accessibility-agents>, and the portal
tracks its `plugin` branch.

Our latest version (v7.1.0, commit 1a2d177) passed the security scan. We
changed the server so it ships as readable source, under the file size limit,
because the earlier bundled build was held for exactly that. Directory policy
then refused it on three rules that only apply to organizations that are not
Verified: command hooks, a local MCP server, and script files.

Those three things are what the plugin is for:

- The hooks are an edit gate. They stop Claude from changing user-facing
  files until the accessibility review skill has run. That is the plugin's
  central promise: WCAG 2.2 AA review happens before the edit, not after.
- The local MCP server scans files on the user's own machine (Office, PDF,
  ePub, Markdown) and runs axe against pages they are building. Those files
  should not leave the machine, which is why it is local and not hosted.
- The scripts are the hook itself and the report renderer the skills call.

Everything is MIT licensed and readable, nothing is minified, and the privacy
policy is at
<https://github.com/Community-Access/accessibility-agents/blob/main/PRIVACY.md>.

Could you tell me how Community Access becomes a Verified organization, and
what you need from us to start that? In the meantime we plan to submit a
smaller edition that follows the current rules (skills only, with our server
at a public HTTPS address), so people can find it. If listing that edition
first would get in the way of verifying the full plugin later, please let me
know before we do.

One more question: the scan also raises "Uses a credential from the user's
machine" on `.claude-plugin/plugin.json`, and we can't find what reads one.
The plugin reads no tokens or keys. If you can tell us which line it points
at, we'll fix it.

Thank you,

Jeff Bishop
Community Access
<https://community-access.org>

# Use the hosted MCP server

Accessibility Agents runs a public copy of its MCP server at:

```text
https://letitglow.app/a11y/mcp
```

Any AI app that can add a remote MCP server can use it: ChatGPT, Claude,
Claude Code, VS Code and others. Your own AI account does the thinking and
pays for it; the server only runs the checks. There is no sign-in and nothing
to install.

## What the hosted server can do

It offers twelve tools that work on what you send them:

| Tool | What you give it |
| --- | --- |
| `check_contrast` | two colors, for the WCAG contrast ratio |
| `check_apca_contrast` | two colors, for the APCA (WCAG 3 draft) contrast |
| `check_color_blindness` | a list of colors, to see how they look with color blindness |
| `check_reading_level` | a passage of text |
| `get_accessibility_guidelines` | a component name, such as modal or tabs |
| `check_heading_structure` | an HTML snippet |
| `check_link_text` | an HTML snippet |
| `check_form_labels` | an HTML snippet |
| `scan_uploaded_document` | a Word, Excel, PowerPoint, PDF, ePub, Markdown or HTML file, up to 20 MB, sent as base64 or as a public link |
| `extract_document_images` | a Word, PowerPoint, Excel, ePub or PDF file; returns each picture as an image your assistant can see, with where it is and its alt text now |
| `write_document_alt_text` | the same file and the alt text for each picture; returns the file with the alt text written in |
| `get_specialist` | a specialist's name, such as `word-accessibility`, for its full review instructions |

It reads none of its own files except the specialists' instructions and
keeps no history. A file you send is written to a private folder, worked on,
and deleted before the answer comes back. The one exception is the file
`write_document_alt_text` returns: it waits for one hour behind a download
link nobody can guess, then it is deleted, because a chat assistant cannot
hand you a file any other way.

### Sending a file

Desktop and editor assistants (Claude Code, VS Code, Copilot CLI) can read the
file on your computer and send it. Chat assistants in a browser often cannot
pass an attachment's contents to a tool, so give them a link instead: share
the file from OneDrive, Google Drive or Dropbox so that anyone with the link
can view it, and paste the link. The server fetches only public web
addresses, on the standard ports, up to 20 MB.

### Alt text for every picture in a document

Ask your assistant: "Use Accessibility Agents to write alt text for every
picture in this document", with the file or its link. It calls
`extract_document_images`, looks at each picture, and writes alt text the way
the `alt-text-headings` specialist does: what the picture means in that
place, at most 150 characters, with a long description in the text for a
chart or diagram. Check them, ask for changes, then say "put them in the
file". It calls `write_document_alt_text` and gives you a link to the file
with the alt text in place. That works for Word, PowerPoint, Excel and ePub;
for a PDF you get the alt text to add in the program it came from.

To scan a whole folder, fix a document in place, or run axe against a page,
install the full plugin, which runs the server on your own computer; see
[Getting started](../getting-started/README.md).

## ChatGPT

Custom connectors need a paid ChatGPT plan, and on Business, Enterprise and
Edu plans an admin may have to allow them. OpenAI moves these settings now
and then, so the names below may differ slightly.

1. Open ChatGPT, then Settings.
2. Open Apps and Connectors (it may be called Connectors or Apps), then
   Advanced settings, and turn on Developer mode. If you can't find it there,
   look under Settings, Security.
3. Back in Apps and Connectors, choose Create (or Add custom connector).
4. Fill in the form:
   - Name: Accessibility Agents
   - Description: WCAG 2.2 AA checks for color contrast, reading level and
     HTML headings, links and form labels.
   - MCP server URL: `https://letitglow.app/a11y/mcp`
   - Authentication: No authentication
5. Check the box saying you trust the application, then choose Create.
6. In a new chat, open the tools menu (the plus button), choose Developer
   mode or the connector list, and turn on Accessibility Agents.
7. Ask something that needs a check, for example: "Does #767676 text on a
   white background pass WCAG AA?" ChatGPT asks before calling a tool the
   first time; allow it.

## Claude (claude.ai, desktop and mobile)

1. Open Claude, then Settings, then Connectors.
2. Choose Add custom connector.
3. Name it Accessibility Agents and paste `https://letitglow.app/a11y/mcp` as
   the URL, then choose Add.
4. In a chat, open the tools menu and make sure Accessibility Agents is on.

On Team and Enterprise plans an owner may need to add the connector for the
organization first.

## Claude Code

```bash
claude mcp add --transport http accessibility-agents https://letitglow.app/a11y/mcp
```

Claude Code users usually want the full plugin instead, which includes this
server's tools and the local scanners; see
[Getting started](../getting-started/README.md).

## VS Code (GitHub Copilot)

Add this to `.vscode/mcp.json` in your project, or to your user MCP
configuration:

```json
{
  "servers": {
    "accessibility-agents": {
      "type": "http",
      "url": "https://letitglow.app/a11y/mcp"
    }
  }
}
```

## Check that it is up

Open <https://letitglow.app/a11y/health> in a browser. A working server
answers with `"status":"ok"` and its version.

## Privacy

The server receives only the arguments of the check you run: colors, a
passage of text or an HTML snippet. It does not store them. Your AI app sends
those arguments on your behalf, so its own privacy terms cover the rest of
the conversation. The project's privacy policy is in
[PRIVACY.md](../../PRIVACY.md).

# wiki-manager - GitHub Wiki Page Management

> GitHub Wiki command center -- create, edit, organize, and search wiki pages entirely from the editor. Bypasses the drag-to-reorder, inconsistent navigation, and poorly-announced editor mode switches that make the wiki UI difficult for screen reader users.

---

## What This Agent Is For

The GitHub Wiki web editor has several accessibility barriers: the mode switch between Edit and Preview is announced inconsistently (or not at all) by screen readers, the page sidebar is a drag-to-reorder list with no keyboard API, and saving a page requires finding a submit button whose label changes based on context. Navigation between pages uses a sidebar that collapses unpredictably.

The wiki-manager works directly with the wiki's git repository (`{repo}.wiki.git`), giving you full CRUD access to wiki pages through file operations. Every page is a Markdown file, so creating, editing, and organizing pages uses the same tools you use for any other file in your project. The agent also provides search, page listing, and sidebar configuration.

Use wiki-manager when:

- You need to create or edit wiki pages without the web editor
- You want to reorganize the wiki sidebar (page order and hierarchy)
- You need to search across all wiki pages for specific content
- You want to bulk-create pages from a template or outline
- You need to move or rename pages while preserving links
- You want to review wiki content as part of a documentation audit

---

## How to Launch It

### GitHub Copilot (VS Code)

```text
@wiki-manager list all wiki pages
@wiki-manager create a Getting Started page
@wiki-manager edit the Installation page
@wiki-manager search the wiki for "authentication"
@wiki-manager reorganize the sidebar
```

### Claude Code (Terminal)

```bash
/wiki-manager list pages
/wiki-manager create page "Getting Started"
/wiki-manager edit page "Installation"
/wiki-manager search wiki for "authentication"
```

### Via GitHub Hub

```text
@github-hub create a wiki page
@github-hub search the wiki
```

---

## Capabilities

<details>
<summary>Expand full capability reference</summary>

| Category | What it does | Method |
|----------|-------------|--------|
| **List pages** | Show all wiki pages with titles and last-modified dates | Git file listing |
| **Read page** | Display the full content of a wiki page | Git file read |
| **Create page** | Create a new wiki page with title and Markdown content | Git file create + commit + push |
| **Edit page** | Modify an existing wiki page with preview before save | Git file edit + commit + push |
| **Delete page** | Remove a wiki page (with confirmation) | Git file delete + commit + push |
| **Rename page** | Rename a page and update internal links | Git file rename + link rewrite |
| **Search** | Full-text search across all wiki pages | Grep across wiki files |
| **Sidebar config** | Create or edit `_Sidebar.md` to control navigation order | Git file edit |
| **Footer config** | Create or edit `_Footer.md` for consistent page footers | Git file edit |
| **Bulk create** | Generate multiple pages from a template or outline | Batch git operations |
| **Link validation** | Check for broken internal wiki links across all pages | Link scanning |
| **History** | Show commit history for a specific page or the entire wiki | Git log |

</details>

---

## What to Expect - Step by Step

### Creating a Wiki Page

1. **Wiki clone:**

   ```text
    Cloning wiki repository acme/backend.wiki.git...
    Wiki cloned. Found 12 existing pages.
   ```

2. **Page creation.** You provide a title and content (or let the agent scaffold from a template). The agent creates the Markdown file with the correct filename format (spaces become hyphens).

3. **Preview.** The full page content is shown before committing. You can edit further or confirm.

4. **Commit and push.** The agent commits the new page and pushes to the wiki repository. The page is immediately visible on GitHub.

5. **Sidebar update.** The agent asks whether to add the new page to `_Sidebar.md` for navigation. If yes, it inserts the link in the appropriate position.

### Reorganizing the Sidebar

1. The agent reads the current `_Sidebar.md` content
2. You describe the desired order or hierarchy
3. The agent generates the updated sidebar with proper Markdown link formatting
4. On confirmation, the sidebar is committed and pushed

### Searching Wiki Content

1. You provide a search term or pattern
2. The agent searches across all wiki pages using text matching
3. Results are shown with page title, matching line, and line number
4. You can jump to any result to read or edit the page

### Bulk Page Creation

1. You provide an outline (list of page titles, optionally with descriptions)
2. The agent creates each page with a standard template: title heading, description, and placeholder sections
3. All pages are committed in a single operation
4. The sidebar is updated with links to all new pages

---

## Handoffs

<details>
<summary>Expand agent connections</summary>

| Handoff | When | Agent |
|---------|------|-------|
| Route from hub | "create a wiki page" or "search the wiki" | [github-hub](github-hub.md) |
| Repo infrastructure | After wiki content is created, set up repo docs structure | [repo-manager](repo-manager.md) |

</details>

---

## Related Agents

| Agent | Relationship |
|-------|-------------|
| [github-hub](github-hub.md) | Parent router -- delegates wiki commands here |
| [repo-manager](repo-manager.md) | Manages repo infrastructure alongside wiki documentation |
| [template-builder](template-builder.md) | Creates templates that may reference wiki pages |
| [issue-tracker](issue-tracker.md) | Issues may link to wiki documentation |
| [daily-briefing](daily-briefing.md) | May surface wiki changes in the morning overview |

---

## Troubleshooting

<details>
<summary>Show troubleshooting help</summary>

**"Wiki not found or not enabled."**
The wiki must be enabled in the repository settings (Settings > Features > Wikis). Some organizations disable wikis by policy.

**"Push rejected -- permission denied."**
You need write access to the repository to push to the wiki. The wiki git repo inherits the same permissions as the main repository.

**"The sidebar is not updating."**
The sidebar file must be named exactly `_Sidebar.md` (case-sensitive). Check that the file exists and contains valid Markdown links.

**"Page links are broken after renaming."**
Wiki page links use the filename (with hyphens replacing spaces). When renaming, the agent rewrites internal links, but external links from issues or PRs must be updated manually.

</details>

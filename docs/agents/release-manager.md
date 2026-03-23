# release-manager - GitHub Releases and Tags

> GitHub releases command center -- create, edit, and manage releases and their binary assets entirely from the editor. Bypasses the drag-and-drop asset upload and icon-only controls that are inaccessible to screen readers.

---

## What This Agent Is For

Creating a GitHub release through the web UI means navigating a form with icon-only edit and delete buttons, a drag-and-drop asset upload zone with no keyboard alternative, and a rich text editor whose toolbar is announced as a flat list of unlabeled buttons. For screen reader users, uploading a build artifact or editing release notes after publish is an exercise in frustration.

The release-manager handles the entire release lifecycle through conversational commands: creating tags, drafting release notes from commit history, uploading binary assets, editing published releases, and managing pre-releases. Every operation uses the REST API or GitHub CLI, producing structured text output.

Use release-manager when:

- You are ready to cut a new release and need to generate release notes
- You want to upload build artifacts (binaries, installers, archives) to a release
- You need to edit or update the notes on an existing release
- You want to promote a pre-release to a full release
- You need to delete a release or remove specific assets
- You want to list all releases or compare changes between tags

---

## How to Launch It

### GitHub Copilot (VS Code)

```text
@release-manager create a release for v3.0.0
@release-manager generate release notes since v2.5.0
@release-manager upload build artifacts to the latest release
@release-manager promote the v3.0.0-rc.1 pre-release to stable
@release-manager list all releases for this repo
```

### Claude Code (Terminal)

```bash
/release-manager create release v3.0.0
/release-manager generate changelog since last tag
/release-manager upload assets to release
/release-manager list releases
```

### Via GitHub Hub

```text
@github-hub create a new release
@github-hub upload a binary to the latest release
```

---

## Capabilities

<details>
<summary>Expand full capability reference</summary>

| Category | What it does | API |
|----------|-------------|-----|
| **Create release** | Create a new release with tag, title, body, and pre-release flag | REST API / `gh release create` |
| **Generate notes** | Build release notes from commit history grouped by type (feat, fix, docs, chore) | Git log parsing |
| **Auto-generate notes** | Use GitHub's automatic release notes with contributor attribution | REST API generate notes |
| **Edit release** | Update title, body, pre-release status, or draft status of an existing release | REST API update release |
| **Delete release** | Delete a release (with confirmation), optionally delete the tag too | REST API delete release |
| **Upload assets** | Upload binary files, installers, or archives to a release | REST API upload asset |
| **Delete assets** | Remove specific assets from a release | REST API delete asset |
| **List releases** | Show all releases with tag, date, asset count, and download stats | REST API list releases |
| **Compare tags** | Show commits between two tags to review what changed | Git log / compare API |
| **Pre-release management** | Create, edit, and promote pre-releases (alpha, beta, RC) | REST API pre-release flag |

</details>

---

## What to Expect - Step by Step

### Creating a Release

1. **Tag identification:**

   ```text
    Latest tag: v2.5.0 (2 weeks ago)
    Commits since v2.5.0: 23 commits by 5 authors
    Suggested next tag: v2.6.0 (minor - new features, no breaking changes)
   ```

2. **Release notes generation.** The agent reads the commit history since the last tag and groups commits by type: features, bug fixes, documentation, and internal changes. Contributors are credited.

3. **Draft preview.** The full release notes are shown for review before anything is created. You can edit, add highlights, or adjust wording.

4. **Release creation.** The agent creates the tag (if it does not exist) and the release with the finalized notes. The release URL is provided.

5. **Asset upload.** If you have build artifacts to attach, the agent uploads them and confirms each with filename and size.

### Uploading Assets

1. You specify the file paths for the assets to upload
2. The agent validates that the files exist and shows their sizes
3. Each asset is uploaded to the release via the REST API
4. The agent confirms each upload with the download URL

### Promoting a Pre-Release

1. The agent finds the specified pre-release
2. It shows the current state: tag, assets, download count
3. On confirmation, it updates the pre-release flag to false
4. The release is now listed as the latest stable release

---

## Handoffs

<details>
<summary>Expand agent connections</summary>

| Handoff | When | Agent |
|---------|------|-------|
| Route from hub | "create a release" or "publish a new version" | [github-hub](github-hub.md) |
| PR review | Review the final PR before cutting a release | [pr-review](pr-review.md) |
| Issue tracking | Close milestone issues associated with a release | [issue-tracker](issue-tracker.md) |

</details>

---

## Related Agents

| Agent | Relationship |
|-------|-------------|
| [github-hub](github-hub.md) | Parent router -- delegates release commands here |
| [pr-review](pr-review.md) | Reviews PRs that are included in a release |
| [issue-tracker](issue-tracker.md) | Tracks issues resolved in each release |
| [repo-manager](repo-manager.md) | Scaffolds changelog format and release workflows |
| [actions-manager](actions-manager.md) | Monitors CI runs that produce release artifacts |

---

## Troubleshooting

<details>
<summary>Show troubleshooting help</summary>

**"Tag already exists."**
If the tag exists but no release is associated, the agent can create a release pointing to the existing tag. If a release already exists, use "edit release v3.0.0" to update it.

**"Asset upload failed -- file too large."**
GitHub limits release assets to 2 GB per file. For larger files, consider splitting the archive or hosting elsewhere with a link in the release notes.

**"The release notes are missing some commits."**
Release notes are generated from commits between two tags. If commits were made on branches that were not merged to the default branch, they will not appear. Specify the comparison range: "generate notes from v2.5.0 to HEAD."

**"I need to delete a release but keep the tag."**
By default, deleting a release does not delete the tag. The agent confirms this before proceeding. To also delete the tag, say "delete release v3.0.0 and its tag."

</details>
